# Fitalert

Fitalert is a fitness-app prototype with a public guest dashboard at `/dashboard`, Firebase sign-up and sign-in at `/signup` and `/login`, a starter workout library, a fitness assessment, ExerciseDB search, nutrition logging, creator discovery, a streaming AI coach, and a camera/microphone preview for workout rooms.

## Run locally

Install Node.js and Python 3.11 or later. Copy `.env.example` to `.env.local` for Next.js and populate the Firebase web app fields. Firebase web configuration values are public; do not put provider client secrets in the browser or commit credentials.

In the Firebase Console:

1. Create a Firebase project and register a web app.
2. Enable Email/Password, Google, Microsoft, and Apple in **Authentication → Sign-in method**.
3. Add `localhost` and your deployed hostname to **Authentication → Settings → Authorized domains**.
4. Configure Microsoft and Apple provider secrets in Firebase Console. Their upstream OAuth applications must use Firebase’s callback URL, `https://<project-id>.firebaseapp.com/__/auth/handler`, which Firebase shows in provider setup.
5. Customize the email-verification template subject to **Account Created Successfully** if that subject is required; Firebase controls that email template, not the web SDK call.

This app uses Firebase `signInWithRedirect`. When hosting outside Firebase, follow Firebase’s [redirect sign-in best practices](https://firebase.google.com/docs/auth/web/redirect-best-practices) for third-party-cookie restrictions; configure the authorized auth domain and provider return URLs accordingly.

For ExerciseDB, subscribe to the RapidAPI API and set `RAPIDAPI_KEY` and, if needed, `RAPIDAPI_HOST`. Requests are proxied server-side and can be browsed as a guest. Review the provider’s licensing, attribution, and quota terms before commercial use.

In one PowerShell window, configure and start the Python service:

```powershell
python -m pip install -r backend\requirements.txt
$env:AI_PROVIDER = "ollama"
$env:OLLAMA_API_KEY = "your-ollama-cloud-key"
$env:OPENAI_API_KEY = "your-openai-key"
$env:FITALERT_BACKEND_TOKEN = "a-long-random-secret"
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Set `AI_PROVIDER` to `ollama` or `openai`; only the selected provider key is needed at runtime. Ollama Cloud keys are available from [ollama.com/settings/keys](https://ollama.com/settings/keys). Keep model keys in the Python service environment, never in browser code.

In a second PowerShell window:

```powershell
npm.cmd install
npm.cmd run dev
```

Open [http://localhost:3000/signup](http://localhost:3000/signup), [http://localhost:3000/login](http://localhost:3000/login), or the public [http://localhost:3000/dashboard](http://localhost:3000/dashboard). Use `npm.cmd run build` for a production build. If the Python service runs on another host, set `FITALERT_AI_BACKEND_URL` in the Next.js server environment.

## Current prototype boundaries

- The dashboard and ExerciseDB proxy are intentionally available to guests; Firebase sign-in is optional. Only basic identity is read from Firebase in the browser.
- Assessment answers, workouts, and nutrition entries remain in page memory; they are not saved to an account or sent to a database.
- The workout room requests camera and microphone permission only after a user clicks Join. It shows a local preview; media is not transmitted to another person. Production group calling needs signaling, an SFU/media provider, moderation, and privacy controls.
- The AI Coach streams from either OpenAI or Ollama using the Python SDKs, based on `AI_PROVIDER`. It does not fine-tune models. Chat text is sent to the selected provider when configured; avoid entering sensitive health information.
- ExerciseDB provides third-party movement data and GIFs; its content is not individually validated. The bundled plans and sample workout content are wellness examples, not medical prescriptions.
- Creator search uses YouTube Data API when configured and does not verify a creator’s credentials.
- Food calorie figures remain rough illustrative estimates; photo recognition is not connected.

Review [docs/PRD.md](docs/PRD.md), [docs/USER_AGREEMENT.md](docs/USER_AGREEMENT.md), [docs/RELEASE_NOTES.md](docs/RELEASE_NOTES.md), and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before extending or deploying the prototype.
