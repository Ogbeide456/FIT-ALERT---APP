import json 
import logging
import os
import secrets
from collections.abc import AsyncIterator
from typing import Literal

import httpx
import openai
from fastapi import FastAPI, HTTPException, Query
from fastapi import Header
from fastapi.responses import StreamingResponse
from ollama import AsyncClient, ResponseError
from openai import AsyncOpenAI
from pydantic import BaseModel, Field, model_validator

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)
logger = logging.getLogger("fitalert")

app = FastAPI(title="Fitalert AI and creator service", version="0.1.0")

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
OLLAMA_SYSTEM_PROMPT = """You are Fitalert Coach, a supportive fitness and general-wellness guide for people worldwide.
Give clear, practical, non-judgmental answers. Ask a brief follow-up when key context is missing.
For workouts, favor gradual progression, warm-ups, recovery, accessible alternatives, and explaining
movements in plain language. Do not claim to diagnose, prescribe treatment, guarantee results, or
know a person's form from text. Avoid extreme dieting and specific calorie prescriptions. Make food
and calorie estimates explicitly approximate and portion-dependent. Do not invent credentials or
cite research you cannot verify. For injury, severe pain, pregnancy, eating-disorder concerns, or
other medical issues, recommend consulting a qualified healthcare professional. Never present
yourself as a doctor, dietitian, or substitute for an in-person qualified coach."""

COACH_CATEGORIES = {
    "Calisthenics",
    "Bodybuilding",
    "Powerlifting",
    "Olympic Weightlifting",
    "Strongman Training",
    "CrossFit",
    "HIIT",
    "Functional Fitness",
    "Kettlebell Training",
    "Plyometric Training",
    "Endurance Training",
    "Indoor Cycling",
    "Swimming Training",
    "Rowing Training",
    "Yoga",
    "Pilates",
    "Mobility Training",
    "Gymnastics",
    "Martial Arts",
    "Boxing",
    "Kickboxing",
    "Wrestling",
    "Brazilian Jiu-Jitsu",
    "Parkour",
    "Dance Fitness",
    "Barre",
    "Circuit Training",
    "Hybrid Training",
    "Obstacle Course Racing",
    "Tactical Fitness",
}


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=12)

    @model_validator(mode="after")
    def limit_conversation_size(self) -> "ChatRequest":
        if sum(len(message.content) for message in self.messages) > 12_000:
            raise ValueError("The conversation is too long. Start a new chat or shorten your messages.")
        return self


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/chat")
async def chat(
    request: ChatRequest,
    backend_token: str | None = Header(default=None, alias="X-Fitalert-Backend-Token"),
) -> StreamingResponse:
    _require_backend_token(backend_token)
    provider = os.getenv("AI_PROVIDER", "ollama").lower()
    if provider not in {"ollama", "openai"}:
        raise HTTPException(status_code=503, detail="AI_PROVIDER must be set to 'ollama' or 'openai'.")
    api_key = os.getenv("OLLAMA_API_KEY" if provider == "ollama" else "OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail=f"{provider.title()} is not configured. Set the corresponding API key in the Python service environment.",
        )
    if request.messages[-1].role != "user":
        raise HTTPException(status_code=400, detail="The last chat message must be from the user.")

    messages = [{"role": "system", "content": OLLAMA_SYSTEM_PROMPT}]
    messages.extend(message.model_dump() for message in request.messages[-12:])

    async def stream_reply() -> AsyncIterator[str]:
        if provider == "ollama":
            async for event in _stream_ollama(api_key, messages):
                yield event
        else:
            async for event in _stream_openai(api_key, messages):
                yield event
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        stream_reply(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no"},
    )


@app.get("/api/coaches")
async def search_coaches(
    query: str = Query(default="", max_length=100),
    category: str = Query(default="", max_length=60),
    page_token: str = Query(default="", alias="pageToken", max_length=500),
    backend_token: str | None = Header(default=None, alias="X-Fitalert-Backend-Token"),
) -> dict:
    _require_backend_token(backend_token)
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Creator search is not configured. Set YOUTUBE_API_KEY in the Python service environment.",
        )
    if category and category not in COACH_CATEGORIES:
        raise HTTPException(status_code=422, detail="Choose a supported training category.")

    terms = [part.strip() for part in (category, query) if part.strip()]
    search_term = " ".join(terms) or "fitness coach training"
    parameters = {
        "key": api_key,
        "part": "snippet",
        "type": "channel",
        "q": search_term,
        "maxResults": 25,
        "safeSearch": "strict",
    }
    if page_token:
        parameters["pageToken"] = page_token

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(15)) as client:
            response = await client.get(YOUTUBE_SEARCH_URL, params=parameters)
    except httpx.HTTPError:
        logger.warning("YouTube creator search request failed")
        raise HTTPException(status_code=502, detail="Could not reach YouTube creator search.") from None

    if response.is_error:
        logger.warning("YouTube Data API returned HTTP %s", response.status_code)
        if response.status_code in (400, 403):
            raise HTTPException(
                status_code=502,
                detail="YouTube creator search failed. Check the API key, enabled API, and quota.",
            )
        raise HTTPException(status_code=502, detail="YouTube creator search is temporarily unavailable.")

    try:
        result = response.json()
    except ValueError as error:
        logger.warning("YouTube Data API returned invalid JSON")
        raise HTTPException(status_code=502, detail="YouTube returned an invalid response.") from error

    items = []
    for item in result.get("items", []):
        snippet = item.get("snippet", {})
        channel_id = item.get("id", {}).get("channelId")
        if not channel_id:
            continue
        thumbnails = snippet.get("thumbnails", {})
        thumbnail = thumbnails.get("medium", thumbnails.get("default", {})).get("url", "")
        items.append(
            {
                "channelId": channel_id,
                "name": snippet.get("title", "YouTube channel"),
                "description": snippet.get("description", ""),
                "thumbnail": thumbnail,
                "url": f"https://www.youtube.com/channel/{channel_id}",
                "category": category or "Fitness",
            }
        )

    return {
        "items": items,
        "nextPageToken": result.get("nextPageToken"),
        "totalResults": result.get("pageInfo", {}).get("totalResults", 0),
        "query": search_term,
        "note": "Search results are not endorsements or credential verification. YouTube result counts are approximate.",
    }


def _sse(payload: dict[str, str]) -> str:
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


async def _stream_ollama(api_key: str, messages: list[dict[str, str]]) -> AsyncIterator[str]:
    try:
        client = AsyncClient(
            host=os.getenv("OLLAMA_HOST", "https://ollama.com"),
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=httpx.Timeout(connect=10, read=90, write=15, pool=10),
        )
        stream = await client.chat(
            model=os.getenv("OLLAMA_MODEL", "gemma4:31b"),
            messages=messages,
            stream=True,
            options={"temperature": 0.6},
        )
        async for part in stream:
            content = part.message.content
            if content:
                yield _sse({"token": content})
    except ResponseError as error:
        logger.warning("Ollama returned HTTP %s", error.status_code)
        yield _sse({"error": _ollama_error_message(error.status_code)})
    except httpx.TimeoutException:
        logger.warning("Ollama request timed out")
        yield _sse({"error": "The AI response timed out. Please try again."})
    except httpx.HTTPError:
        logger.exception("Could not reach Ollama")
        yield _sse({"error": "Could not reach Ollama. Check the service connection and try again."})


async def _stream_openai(api_key: str, messages: list[dict[str, str]]) -> AsyncIterator[str]:
    try:
        async with AsyncOpenAI(api_key=api_key, timeout=90.0) as client:
            stream = await client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                messages=messages,
                stream=True,
                temperature=0.6,
            )
            async for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    yield _sse({"token": content})
    except openai.RateLimitError:
        logger.warning("OpenAI rate limit reached")
        yield _sse({"error": "OpenAI is rate-limiting requests. Please wait a moment and retry."})
    except openai.APITimeoutError:
        logger.warning("OpenAI request timed out")
        yield _sse({"error": "The AI response timed out. Please try again."})
    except openai.APIConnectionError:
        logger.exception("Could not reach OpenAI")
        yield _sse({"error": "Could not reach OpenAI. Check the service connection and try again."})
    except openai.APIError as error:
        logger.warning("OpenAI request failed: %s", error)
        yield _sse({"error": "OpenAI could not complete the response. Please try again."})


def _require_backend_token(candidate: str | None) -> None:
    expected = os.getenv("FITALERT_BACKEND_TOKEN")
    if not expected:
        raise HTTPException(status_code=503, detail="Set FITALERT_BACKEND_TOKEN in the Python service environment.")
    if candidate is None or not secrets.compare_digest(candidate, expected):
        raise HTTPException(status_code=401, detail="Unauthorized.")


def _ollama_error_message(status_code: int) -> str:
    if status_code in (401, 403):
        return "Ollama Cloud rejected the API key. Verify OLLAMA_API_KEY and model access."
    if status_code == 429:
        return "Ollama Cloud is rate-limiting requests. Please wait a moment and retry."
    logger.warning("Ollama Cloud request failed with HTTP %s", status_code)
    return "Ollama Cloud could not complete the response. Please try again."
