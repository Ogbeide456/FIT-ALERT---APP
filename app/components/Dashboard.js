"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  onAuthStateChanged,
  signOut as signOutFirebase,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithRedirect,
} from "firebase/auth";
import Link from "next/link";
import { firebaseAuth, isFirebaseConfigured } from "../lib/firebase.js";
import SquatModel3D from "./SquatModel3D";
import Exercise3DViewer from "./Exercise3DViewer";
import structuredPlansData from "../../public/workout-plans.json";
import { BrandLogoMark } from "./BrandLogo";
import {
  LiveWorkoutHighlights,
  InstagramStoryViewerModal,
  LiveRoomShareModal,
  getSavedHighlights,
  saveHighlightRecord,
  deleteHighlightRecord,
  detectLocationString,
} from "./LiveRoomFeatures";

const categories = [
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
];

const plans = structuredPlansData?.plans || [
  { title: "Full-body foundations", type: "Strength · 3 days/week", weeks: "4 weeks", color: "lavender", icon: "✦", image: "/plans/full-body.svg", exercises: [{ name: "Goblet squat", plan: "3 sets · 8–10 reps", cue: "Keep a comfortable range and steady tempo." }, { name: "Incline push-up", plan: "3 sets · 6–10 reps", cue: "Use a wall or bench to adjust difficulty." }, { name: "Hip hinge", plan: "3 sets · 8–10 reps", cue: "Practice the movement without weight first." }, { name: "Dead bug", plan: "2 sets · 6 each side", cue: "Move slowly while breathing normally." }] },
  { title: "Move more, feel better", type: "Mobility · 15 min/day", weeks: "2 weeks", color: "mint", icon: "↗", image: "/plans/mobility.svg", exercises: [{ name: "Cat-cow", plan: "2 rounds · 6 slow cycles", cue: "Move gently through a comfortable range." }, { name: "Half-kneeling hip stretch", plan: "2 holds · 20 sec each side", cue: "Stop if you feel sharp pain or numbness." }, { name: "Thoracic rotations", plan: "2 sets · 6 each side", cue: "Keep the motion controlled and easy." }, { name: "Child's pose", plan: "2 holds · 20 sec", cue: "Use a cushion if it is more comfortable." }] },
  { title: "Calisthenics starter", type: "Bodyweight · 3 days/week", weeks: "6 weeks", color: "peach", icon: "◎", image: "/plans/calisthenics.svg", exercises: [{ name: "Incline push-up", plan: "3 sets · 6–10 reps", cue: "Choose an incline that lets you stay controlled." }, { name: "Supported split squat", plan: "3 sets · 6 each side", cue: "Hold a support and use a comfortable depth." }, { name: "Glute bridge", plan: "3 sets · 10 reps", cue: "Pause gently at the top without arching." }, { name: "Bird dog", plan: "2 sets · 6 each side", cue: "Keep your trunk steady as you reach." }] },
  { title: "Build strength steadily", type: "Strength · 4 days/week", weeks: "8 weeks", color: "blue", icon: "↗", image: "/plans/strength.svg", exercises: [{ name: "Chair squat", plan: "3 sets · 8 reps", cue: "Use a chair as a depth target if helpful." }, { name: "Hip hinge", plan: "3 sets · 8 reps", cue: "Keep the load light while learning the pattern." }, { name: "Wall push-up", plan: "3 sets · 8–12 reps", cue: "Adjust your distance from the wall." }, { name: "Resistance-band row", plan: "3 sets · 8–12 reps", cue: "Anchor the band securely before starting." }] },
  { title: "Cardio intervals", type: "Cardio · 20 min/session", weeks: "3 weeks", color: "amber", icon: "⌁", image: "/plans/cardio.svg", exercises: [{ name: "Easy march", plan: "3 min warm-up", cue: "Start at a conversational pace." }, { name: "Brisk walk or step-touch", plan: "6 rounds · 1 min brisk, 1 min easy", cue: "Choose a low-impact variation if needed." }, { name: "Gentle step-ups", plan: "2 sets · 30 sec", cue: "Use a stable, low step and hold support." }, { name: "Easy walk", plan: "3 min cool-down", cue: "Slow down gradually and hydrate." }] },
  { title: "A gentler yoga reset", type: "Yoga · 3 days/week", weeks: "2 weeks", color: "sage", icon: "◌", image: "/plans/yoga.svg", exercises: [{ name: "Mountain pose", plan: "3 breaths", cue: "Stand comfortably; keep your knees relaxed." }, { name: "Cat-cow", plan: "6 slow cycles", cue: "Move in a pain-free range." }, { name: "Low lunge", plan: "2 holds · 15 sec each side", cue: "Place padding under your knee if helpful." }, { name: "Supported child's pose", plan: "3 breaths", cue: "Use cushions and come out if uncomfortable." }] },
];

const coaches = [
  { name: "Chris Heria", focus: "Calisthenics", detail: "Bodyweight strength & skills", link: "https://www.youtube.com/@CHRISHERIA", handle: "@CHRISHERIA", initials: "CH", tone: "coach-one" },
  { name: "Jeff Nippard", focus: "Bodybuilding", detail: "Evidence-informed strength training", link: "https://www.youtube.com/@JeffNippard", handle: "@JeffNippard", initials: "JN", tone: "coach-two" },
  { name: "Meg Squats", focus: "Powerlifting", detail: "Strength training for everybody", link: "https://www.youtube.com/@MegSquats", handle: "@MegSquats", initials: "MS", tone: "coach-three" },
  { name: "Yoga with Adriene", focus: "Yoga", detail: "Accessible yoga & mindfulness", link: "https://www.youtube.com/@yogawithadriene", handle: "@yogawithadriene", initials: "YA", tone: "coach-four" },
  { name: "FitnessBlender", focus: "Functional Fitness", detail: "At-home workouts across fitness levels", link: "https://www.youtube.com/@FitnessBlender", handle: "@FitnessBlender", initials: "FB", tone: "coach-two" },
  { name: "Caroline Girvan", focus: "Strength", detail: "Strength and resistance workouts", link: "https://www.youtube.com/@CarolineGirvan", handle: "@CarolineGirvan", initials: "CG", tone: "coach-three" },
  { name: "Yoga with Kassandra", focus: "Yoga", detail: "Yoga classes and guided practices", link: "https://www.youtube.com/@YogaWithKassandra", handle: "@YogaWithKassandra", initials: "YK", tone: "coach-four" },
  { name: "Squat University", focus: "Mobility", detail: "Movement and mobility education", link: "https://www.youtube.com/@SquatUniversity", handle: "@SquatUniversity", initials: "SU", tone: "coach-one" },
  { name: "MadFit", focus: "Dance Fitness", detail: "At-home movement and workout videos", link: "https://www.youtube.com/@MadFit", handle: "@MadFit", initials: "MF", tone: "coach-four" },
  { name: "ATHLEAN-X", focus: "Strength", detail: "Strength and exercise education", link: "https://www.youtube.com/@ATHLEANX", handle: "@ATHLEANX", initials: "AX", tone: "coach-two" },
  { name: "FitnessFAQs", focus: "Calisthenics", detail: "Bodyweight training and skills", link: "https://www.youtube.com/@FitnessFAQs", handle: "@FitnessFAQs", initials: "FQ", tone: "coach-three" },
];

const mealEstimates = [
  { match: ["rice", "chicken"], label: "Rice & chicken", calories: 520 },
  { match: ["pounded yam", "egusi"], label: "Pounded yam & egusi soup", calories: 680 },
  { match: ["oats", "banana"], label: "Oats & banana", calories: 340 },
  { match: ["salad"], label: "Mixed salad", calories: 260 },
  { match: ["egg", "toast"], label: "Eggs & toast", calories: 390 },
];

const navItems = [
  { label: "Overview", icon: "⌂" },
  { label: "My workouts", icon: "◷" },
  { label: "Exercise library", icon: "▦" },
  { label: "Nutrition", icon: "◌" },
  { label: "Find a coach", icon: "♧" },
];

function GoogleIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09A6.97 6.97 0 0 1 5.47 12c0-.72.13-1.43.37-2.09V7.07H2.18A11.96 11.96 0 0 0 .96 12c0 1.94.46 3.77 1.22 5.33l2.66-2.24z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function MicrosoftIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 21 21" width={size} height={size} aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

function AppleIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function YouTubeIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000" />
    </svg>
  );
}

function decodeHtml(html) {
  if (!html) return "";
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function Icon({ children, className = "" }) {
  return <span aria-hidden="true" className={`icon ${className}`}>{children}</span>;
}

function Brand() {
  return (
    <div className="brand">
      <BrandLogoMark size={30} />
      <span>fitalert</span>
    </div>
  );
}

function Modal({ title, eyebrow, onClose, children, wide = false }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal ${wide ? "modal-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <button className="modal-close" onClick={onClose} aria-label="Close dialog">×</button>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  );
}

function AssessmentQuiz({ onFinish, onClose }) {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState({
    goals: [],
    trainingUse: "",
    trainingPlace: "",
    daysPerWeek: "3",
    experience: "",
    physiqueFocus: "",
    heightCm: "",
    weightKg: "",
    usefulFeatures: [],
    appFeedback: "",
  });
  const steps = ["Your goals", "How you’ll train", "Your starting point", "What you need", "Your first impression"];
  const goals = ["Build strength", "Improve fitness", "Increase mobility", "Build a movement habit", "Improve endurance", "Body-composition change"];
  const features = ["Workout plans", "Exercise demonstrations", "Food tracking", "AI fitness coach", "Creator discovery", "Live workout rooms"];

  function update(key, value) {
    setResponses((current) => ({ ...current, [key]: value }));
  }

  function toggleListValue(key, value) {
    setResponses((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  }

  return (
    <Modal title={steps[step]} eyebrow={`FITNESS ASSESSMENT · ${step + 1} OF ${steps.length}`} onClose={onClose} wide>
      <div className="progress-track"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      {step === 0 && <>
        <p className="modal-copy">Choose any goals you’d like us to keep in mind. There is no “right” combination.</p>
        <div className="assessment-options">{goals.map((goal) => <button type="button" key={goal} className={`option-row ${responses.goals.includes(goal) ? "selected" : ""}`} onClick={() => toggleListValue("goals", goal)}>{goal}<span>{responses.goals.includes(goal) ? "✓" : "+"}</span></button>)}</div>
      </>}
      {step === 1 && <>
        <p className="modal-copy">Tell us what your usual training setup looks like.</p>
        <label className="field-label">What will you mainly use Fitalert for?<select value={responses.trainingUse} onChange={(event) => update("trainingUse", event.target.value)}><option value="">Choose one</option><option>Plan workouts and training</option><option>Improve general fitness</option><option>Track food and nutrition</option><option>Learn exercise technique</option><option>Stay motivated with friends</option><option>Explore fitness creators</option></select></label>
        <label className="field-label">Where do you expect to train most often?<select value={responses.trainingPlace} onChange={(event) => update("trainingPlace", event.target.value)}><option value="">Choose one</option><option>At home</option><option>At a gym</option><option>Outdoors</option><option>A mix of places</option></select></label>
        <label className="field-label">How many days per week feels realistic?<select value={responses.daysPerWeek} onChange={(event) => update("daysPerWeek", event.target.value)}><option value="2">2 days</option><option value="3">3 days</option><option value="4">4 days</option><option value="5">5 days</option><option value="6">6 days</option></select></label>
      </>}
      {step === 2 && <>
        <p className="modal-copy">Share only what you’re comfortable sharing. Body measurements are optional and used only to tailor this on-screen starter profile.</p>
        <label className="field-label">Which best describes your current fitness starting point?<select value={responses.experience} onChange={(event) => update("experience", event.target.value)}><option value="">Choose one</option><option>New to regular exercise</option><option>Returning after a break</option><option>I exercise one or two days a week</option><option>I exercise three or more days a week</option><option>Prefer not to say</option></select></label>
        <label className="field-label">What would you most like to focus on physically?<select value={responses.physiqueFocus} onChange={(event) => update("physiqueFocus", event.target.value)}><option value="">Choose one (optional)</option><option>Strength and muscle</option><option>Mobility and comfortable movement</option><option>Stamina and energy</option><option>Body composition</option><option>Confidence and consistency</option><option>Prefer not to say</option></select></label>
        <div className="form-row"><label className="field-label">Height in cm (optional)<input type="number" min="80" max="250" value={responses.heightCm} onChange={(event) => update("heightCm", event.target.value)} placeholder="e.g. 170" /></label><label className="field-label">Weight in kg (optional)<input type="number" min="25" max="350" value={responses.weightKg} onChange={(event) => update("weightKg", event.target.value)} placeholder="e.g. 70" /></label></div>
      </>}
      {step === 3 && <>
        <p className="modal-copy">Which parts of Fitalert would make it most useful to you? Select as many as you like.</p>
        <div className="assessment-options">{features.map((feature) => <button type="button" key={feature} className={`option-row ${responses.usefulFeatures.includes(feature) ? "selected" : ""}`} onClick={() => toggleListValue("usefulFeatures", feature)}>{feature}<span>{responses.usefulFeatures.includes(feature) ? "✓" : "+"}</span></button>)}</div>
      </>}
      {step === 4 && <>
        <p className="modal-copy">What’s your first impression of the app so far?</p>
        <div className="assessment-options">{["Easy to understand", "I want more guidance", "I’m exploring the features", "I’d like a simpler experience", "I haven’t decided yet"].map((feedback) => <button type="button" key={feedback} className={`option-row ${responses.appFeedback === feedback ? "selected" : ""}`} onClick={() => update("appFeedback", feedback)}>{feedback}<span>{responses.appFeedback === feedback ? "✓" : "○"}</span></button>)}</div>
        <p className="fine-print">This prototype keeps your answers in the current page session only. Avoid adding sensitive medical details.</p>
      </>}
      <div className="modal-actions">
        {step > 0 && <button className="button button-quiet" onClick={() => setStep(step - 1)}>Back</button>}
        <button
          className="button button-primary"
          disabled={step === 0 && responses.goals.length === 0}
          onClick={() => step < steps.length - 1 ? setStep(step + 1) : onFinish(responses)}
        >
          {step < steps.length - 1 ? "Continue" : "Save my assessment"} <span>→</span>
        </button>
      </div>
    </Modal>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [demoUser, setDemoUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("fitalert_user");
        if (stored) {
          setDemoUser(JSON.parse(stored));
        }
      } catch (e) { }
    }
  }, []);

  const activeUser = user || demoUser;
  const displayName = activeUser?.displayName?.trim() || activeUser?.email?.split("@")[0] || "Guest";
  const firstName = displayName.split(/\s+/)[0];
  const [activeNav, setActiveNav] = useState("Overview");
  const [query, setQuery] = useState("");
  const [apiExercises, setApiExercises] = useState([]);
  const [exerciseTotal, setExerciseTotal] = useState(708);
  const [exerciseOffset, setExerciseOffset] = useState(0);
  const [exerciseCategoryFilter, setExerciseCategoryFilter] = useState("");
  const [exerciseBodyPartFilter, setExerciseBodyPartFilter] = useState("");
  const [exerciseDifficultyFilter, setExerciseDifficultyFilter] = useState("");
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState(null);
  const [exerciseViewTab, setExerciseViewTab] = useState("3d");
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [exerciseLoadingMore, setExerciseLoadingMore] = useState(false);
  const [exerciseError, setExerciseError] = useState("");
  const [coachFilter, setCoachFilter] = useState("All");
  const [meal, setMeal] = useState("");
  const [loggedMeal, setLoggedMeal] = useState(null);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState("");
  const [planProfile, setPlanProfile] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planActiveDayIndex, setPlanActiveDayIndex] = useState(0);
  const [planCategoryFilter, setPlanCategoryFilter] = useState("All");
  const [activePlan, setActivePlan] = useState(plans[0]);
  const [exerciseVideoData, setExerciseVideoData] = useState(null);
  const [exerciseVideoLoading, setExerciseVideoLoading] = useState(false);
  const [exerciseVideoError, setExerciseVideoError] = useState("");
  const [chatText, setChatText] = useState("");
  const [chatMessages, setChatMessages] = useState([{ role: "assistant", text: "Hey! I can help you explore a starter workout. What would you like to work on?" }]);
  const [chatLoading, setChatLoading] = useState(false);
  const [creatorQuery, setCreatorQuery] = useState("");
  const [creatorCategory, setCreatorCategory] = useState("");
  const [searchedCoaches, setSearchedCoaches] = useState([]);
  const [creatorNextPage, setCreatorNextPage] = useState("");
  const [creatorTotal, setCreatorTotal] = useState(0);
  const [creatorLoading, setCreatorLoading] = useState(false);
  const [creatorError, setCreatorError] = useState("");
  const [creatorSearched, setCreatorSearched] = useState(false);
  const [workoutActive, setWorkoutActive] = useState(false);
  const [roomStream, setRoomStream] = useState(null);
  const [roomError, setRoomError] = useState("");
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const videoRef = useRef(null);

  // Live Room Share & Instagram Story Highlights State
  const [roomCode, setRoomCode] = useState("fitalert-live-squad");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [highlights, setHighlights] = useState([]);
  const [selectedHighlight, setSelectedHighlight] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState("00:00");
  const recordingStartTimeRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordTimerRef = useRef(null);

  const firebaseReady = isFirebaseConfigured();

  // Sync Room URL search params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const roomParam = searchParams.get("room");
        if (roomParam) {
          setRoomCode(roomParam);
          setActiveNav("Training together");
          notify(`Joined Live Room: ${roomParam}`);
        }
      } catch { }
    }
  }, []);

  // Load and seed highlights from IndexedDB (Instagram Story Highlights permanent storage)
  useEffect(() => {
    async function loadHighlights() {
      try {
        const saved = await getSavedHighlights();
        if (saved && saved.length > 0) {
          setHighlights(saved);
        } else {
          const seeds = [
            {
              id: "hl-seed-1",
              title: "Morning Core & Mobility",
              date: "Wednesday, Nov 18, 2026",
              startTime: "07:15:00 AM",
              finishTime: "07:42:15 AM",
              duration: "27m 15s",
              location: "London, United Kingdom (51.50°N, 0.12°W)",
              thumbnail: null,
              createdAt: Date.now() - 3600000 * 12,
            },
            {
              id: "hl-seed-2",
              title: "Cable Crossover & Flys",
              date: "Tuesday, Nov 17, 2026",
              startTime: "06:30:00 PM",
              finishTime: "07:05:40 PM",
              duration: "35m 40s",
              location: "New York, USA (40.71°N, 74.00°W)",
              thumbnail: null,
              createdAt: Date.now() - 3600000 * 36,
            },
            {
              id: "hl-seed-3",
              title: "HIIT & Squat Circuit",
              date: "Sunday, Nov 15, 2026",
              startTime: "09:00:00 AM",
              finishTime: "09:32:10 AM",
              duration: "32m 10s",
              location: "Los Angeles, USA (34.05°N, 118.24°W)",
              thumbnail: null,
              createdAt: Date.now() - 3600000 * 84,
            },
          ];
          for (const s of seeds) {
            await saveHighlightRecord(s);
          }
          setHighlights(seeds);
        }
      } catch (e) {
        console.warn("Failed to load highlights from IndexedDB:", e);
      }
    }
    loadHighlights();
  }, []);

  useEffect(() => {
    if (!firebaseAuth) {
      setAuthChecked(true);
      return undefined;
    }
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = roomStream;
  }, [roomStream]);

  useEffect(() => () => {
    roomStream?.getTracks().forEach((track) => track.stop());
  }, [roomStream]);

  useEffect(() => {
    if (activeNav !== "Training together" && roomStream) {
      roomStream.getTracks().forEach((track) => track.stop());
      setRoomStream(null);
      setCameraEnabled(false);
      setMicrophoneEnabled(false);
    }
  }, [activeNav, roomStream]);

  // Load RepDB Exercises
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setExerciseLoading(true);
      setExerciseError("");
      try {
        const params = new URLSearchParams({ limit: "24", offset: "0" });
        if (query.trim()) params.set("query", query.trim());
        if (exerciseCategoryFilter) params.set("category", exerciseCategoryFilter);
        if (exerciseBodyPartFilter) params.set("bodyPart", exerciseBodyPartFilter);
        if (exerciseDifficultyFilter) params.set("difficulty", exerciseDifficultyFilter);

        const response = await fetch(`/api/exercises?${params.toString()}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Exercise search failed. Please try again.");

        setApiExercises(data.items || []);
        setExerciseTotal(data.total ?? 0);
        setExerciseOffset(0);
      } catch (error) {
        if (error.name !== "AbortError") {
          setApiExercises([]);
          setExerciseError(error instanceof Error ? error.message : "Exercise loading failed.");
        }
      } finally {
        if (!controller.signal.aborted) setExerciseLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, exerciseCategoryFilter, exerciseBodyPartFilter, exerciseDifficultyFilter]);

  // Fetch YouTube tutorial video when an exercise is selected
  useEffect(() => {
    if (!selectedExerciseDetail) {
      setExerciseVideoData(null);
      setExerciseVideoLoading(false);
      setExerciseVideoError("");
      return;
    }

    let isSubscribed = true;
    setExerciseVideoLoading(true);
    setExerciseVideoError("");
    setExerciseVideoData(null);

    const exerciseName = selectedExerciseDetail.name || "";
    const exerciseId = selectedExerciseDetail.id || "";
    const params = new URLSearchParams({ name: exerciseName });
    if (exerciseId) params.set("id", exerciseId);

    fetch(`/api/exercise-video?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isSubscribed) return;
        if (data.success && data.video) {
          setExerciseVideoData(data.video);
        } else {
          setExerciseVideoError(data.reason || "Video tutorial could not be loaded");
        }
      })
      .catch((err) => {
        if (!isSubscribed) return;
        setExerciseVideoError(err.message || "Failed to load video tutorial");
      })
      .finally(() => {
        if (isSubscribed) setExerciseVideoLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [selectedExerciseDetail]);

  async function loadMoreExercises() {
    if (exerciseLoadingMore || apiExercises.length >= exerciseTotal) return;
    setExerciseLoadingMore(true);
    const nextOffset = exerciseOffset + 24;
    try {
      const params = new URLSearchParams({ limit: "24", offset: String(nextOffset) });
      if (query.trim()) params.set("query", query.trim());
      if (exerciseCategoryFilter) params.set("category", exerciseCategoryFilter);
      if (exerciseBodyPartFilter) params.set("bodyPart", exerciseBodyPartFilter);
      if (exerciseDifficultyFilter) params.set("difficulty", exerciseDifficultyFilter);

      const response = await fetch(`/api/exercises?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load more exercises.");

      setApiExercises((prev) => [...prev, ...(data.items || [])]);
      setExerciseOffset(nextOffset);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Failed to load more exercises.");
    } finally {
      setExerciseLoadingMore(false);
    }
  }

  const visibleCoaches = coachFilter === "All" ? coaches : coaches.filter((coach) => coach.focus === coachFilter);

  function notify(message) {
    if (!message) { setToast(""); return; }
    setToast(message);
    window.setTimeout(() => setToast(""), 3800);
  }

  function logFood(event) {
    event.preventDefault();
    if (!meal.trim()) return;
    const text = meal.trim().toLowerCase();
    const match = mealEstimates.find((item) => item.match.every((word) => text.includes(word)));
    setLoggedMeal({ name: meal.trim(), calories: match?.calories ?? 420, estimate: Boolean(match) });
    setMeal("");
  }

  async function sendChat(event) {
    event.preventDefault();
    const message = chatText.trim();
    if (!message || chatLoading) return;
    const history = [
      ...chatMessages.filter((entry) => entry.text).map((entry) => ({ role: entry.role, content: entry.text })),
      { role: "user", content: message },
    ];
    setChatMessages((current) => [...current, { role: "user", text: message }, { role: "assistant", text: "" }]);
    setChatText("");
    setChatLoading(true);
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.detail ?? errorBody.error ?? "The AI coach could not respond. Please try again.");
      }
      if (!response.body) throw new Error("The AI coach returned an empty response.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;
      while (!finished) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const eventText of events) {
          const data = eventText.split("\n").find((line) => line.startsWith("data: "))?.slice(6);
          if (!data) continue;
          if (data === "[DONE]") {
            finished = true;
            break;
          }
          const chunk = JSON.parse(data);
          if (chunk.error) throw new Error(chunk.error);
          if (chunk.token) {
            setChatMessages((current) => {
              const next = [...current];
              const last = next[next.length - 1];
              if (last?.role === "assistant") next[next.length - 1] = { ...last, text: last.text + chunk.token };
              return next;
            });
          }
        }
        if (done) break;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "The AI coach could not respond. Please try again.";
      setChatMessages((current) => {
        const next = [...current];
        const last = next[next.length - 1];
        if (last?.role === "assistant") next[next.length - 1] = { ...last, text: last.text ? `${last.text}\n\n${errorMessage}` : errorMessage };
        return next;
      });
    } finally {
      setChatLoading(false);
    }
  }

  async function searchCreators(event, pageToken = "") {
    event?.preventDefault();
    if (creatorLoading) return;
    setCreatorLoading(true);
    setCreatorError("");
    const parameters = new URLSearchParams();
    if (creatorQuery.trim()) parameters.set("query", creatorQuery.trim());
    if (creatorCategory) parameters.set("category", creatorCategory);
    if (pageToken) parameters.set("pageToken", pageToken);
    try {
      const response = await fetch(`/api/creators?${parameters.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? data.error ?? "Creator search failed. Please try again.");
      setSearchedCoaches((current) => pageToken ? [...current, ...data.items] : data.items);
      setCreatorNextPage(data.nextPageToken ?? "");
      setCreatorTotal(data.totalResults ?? 0);
      setCreatorSearched(true);
    } catch (error) {
      setCreatorError(error instanceof Error ? error.message : "Creator search failed. Please try again.");
    } finally {
      setCreatorLoading(false);
    }
  }

  async function signInSocial(providerName) {
    if (!firebaseAuth || !firebaseReady) {
      const providerLabel = providerName.charAt(0).toUpperCase() + providerName.slice(1);
      const sessionUser = {
        displayName: `${providerLabel} Member`,
        email: `${providerName}.member@fitalert.app`,
        isDemo: true,
      };
      if (typeof window !== "undefined") {
        sessionStorage.setItem("fitalert_user", JSON.stringify(sessionUser));
      }
      setDemoUser(sessionUser);
      setModal("");
      notify(`Signed in as ${providerLabel} Member. Add your Firebase keys in .env.local for cloud sync.`);
      return;
    }
    try {
      const provider = providerName === "google"
        ? new GoogleAuthProvider()
        : new OAuthProvider(providerName === "microsoft" ? "microsoft.com" : "apple.com");
      provider.setCustomParameters({ prompt: "select_account" });
      if (providerName === "apple") {
        provider.addScope("email");
        provider.addScope("name");
      }
      await signInWithRedirect(firebaseAuth, provider);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Sign in failed. Please try again.");
    }
  }

  async function signOut() {
    try {
      if (firebaseAuth) {
        await signOutFirebase(firebaseAuth);
      }
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("fitalert_user");
      }
      setUser(null);
      setDemoUser(null);
      setModal("");
      notify("Signed out successfully.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Sign out failed. Please try again.");
    }
  }

  async function joinRoom() {
    setRoomError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setRoomError("Camera and microphone access requires HTTPS or localhost and a supported browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setRoomStream(stream);
      setCameraEnabled(true);
      setMicrophoneEnabled(true);
    } catch (error) {
      if (error.name === "NotAllowedError" || error.name === "SecurityError") {
        setRoomError("Camera and microphone permission was denied. Allow access in your browser settings and try again.");
      } else if (error.name === "NotFoundError") {
        setRoomError("No camera or microphone was found. Connect a device and try again.");
      } else {
        setRoomError(error instanceof Error ? error.message : "Could not access your camera and microphone.");
      }
    }
  }

  async function leaveRoom() {
    if (isRecording) {
      await stopRecording();
    }
    roomStream?.getTracks().forEach((track) => track.stop());
    setRoomStream(null);
    setCameraEnabled(false);
    setMicrophoneEnabled(false);
    setRoomError("");
  }

  async function startRecording() {
    if (isRecording) {
      await stopRecording();
      return;
    }

    let streamToRecord = roomStream;
    if (!streamToRecord) {
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
          setRoomStream(stream);
          setCameraEnabled(true);
          setMicrophoneEnabled(true);
          streamToRecord = stream;
        }
      } catch {
        notify("Starting workout recording (Camera permission unavailable)");
      }
    }

    recordedChunksRef.current = [];
    const startTime = new Date();
    recordingStartTimeRef.current = startTime;
    setIsRecording(true);
    setRecordDuration("00:00");

    let seconds = 0;
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    recordTimerRef.current = window.setInterval(() => {
      seconds++;
      const m = String(Math.floor(seconds / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      setRecordDuration(`${m}:${s}`);
    }, 1000);

    if (streamToRecord && typeof MediaRecorder !== "undefined") {
      try {
        const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
          ? "video/webm;codecs=vp9,opus"
          : MediaRecorder.isTypeSupported("video/webm")
            ? "video/webm"
            : "";
        const mr = mimeType ? new MediaRecorder(streamToRecord, { mimeType }) : new MediaRecorder(streamToRecord);
        mr.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        mr.start(1000);
        mediaRecorderRef.current = mr;
      } catch (err) {
        console.warn("MediaRecorder start warning:", err);
      }
    }

    notify("🔴 Live workout recording started! Press Stop anytime to save permanently to Story Highlights.");
  }

  async function stopRecording() {
    if (!isRecording) return;
    setIsRecording(false);
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    const finishTime = new Date();
    const startTime = recordingStartTimeRef.current || new Date(finishTime.getTime() - 15000);
    const diffSec = Math.max(1, Math.round((finishTime.getTime() - startTime.getTime()) / 1000));
    const durationStr = diffSec >= 60 ? `${Math.floor(diffSec / 60)}m ${diffSec % 60}s` : `${diffSec}s`;

    const startTimeStr = startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const finishTimeStr = finishTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const dateStr = finishTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch { }
    }

    let thumbnail = null;
    try {
      if (videoRef.current && videoRef.current.videoWidth) {
        const canvas = document.createElement("canvas");
        canvas.width = 240;
        canvas.height = 320;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoRef.current, 0, 0, 240, 320);
        thumbnail = canvas.toDataURL("image/jpeg", 0.75);
      }
    } catch { }

    notify("Resolving GPS location & storing highlight in IndexedDB...");
    const locationStr = await detectLocationString();

    let blob = null;
    if (recordedChunksRef.current.length > 0) {
      blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
    }

    const newHighlight = {
      id: "hl-" + Date.now(),
      title: `${activeUser?.displayName || "Athlete"} Live Workout`,
      blob,
      date: dateStr,
      startTime: startTimeStr,
      finishTime: finishTimeStr,
      duration: durationStr,
      location: locationStr,
      thumbnail,
      createdAt: Date.now(),
    };

    await saveHighlightRecord(newHighlight);
    const updated = await getSavedHighlights();
    setHighlights(updated);
    notify("🎉 Workout Highlight saved permanently! Access anytime in Story Highlights (no 24hr expiration).");
  }

  async function handleDeleteHighlight(id) {
    await deleteHighlightRecord(id);
    const updated = await getSavedHighlights();
    setHighlights(updated);
    notify("Highlight deleted from permanent storage.");
  }

  function toggleTrack(kind) {
    const track = kind === "video" ? roomStream?.getVideoTracks()[0] : roomStream?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    if (kind === "video") setCameraEnabled(track.enabled);
    else setMicrophoneEnabled(track.enabled);
  }

  function startWorkout(plan = selectedPlan || plans[0]) {
    setActivePlan(plan);
    setWorkoutActive(true);
    setSelectedPlan(null);
    notify("Workout started — follow the set timer and choose a comfortable pace.");
  }

  return (
    <main className="app-shell">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <Brand />
        <div className="side-label">MENU</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${activeNav === item.label ? "active" : ""}`}
              onClick={() => setActiveNav(item.label)}
            >
              <Icon>{item.icon}</Icon>
              {item.label}
              {item.label === "Exercise library" && <span className="nav-count">{exerciseTotal}</span>}
              {item.label === "My workouts" && <span className="nav-count">3</span>}
            </button>
          ))}
        </nav>
        <div className="side-label discover-label">DISCOVER</div>
        <button className={`nav-item ${activeNav === "AI coach" ? "active" : ""}`} onClick={() => setActiveNav("AI coach")}>
          <Icon>✳</Icon>AI coach <span className="new-pill">NEW</span>
        </button>
        <button className={`nav-item ${activeNav === "Training together" ? "active" : ""}`} onClick={() => setActiveNav("Training together")}>
          <Icon>◉</Icon>Train together
        </button>
        <div className="sidebar-spacer" />
        <div className="pro-card">
          <div className="pro-spark">✦</div>
          <strong>708 Exercises<br />Dataset Ready</strong>
          <p>Explore real-time 3D animation guides, tutorials, and technique instructions.</p>
          <button onClick={() => setActiveNav("Exercise library")}>Browse all 708 <span>↗</span></button>
        </div>
        <button className="profile-button" onClick={() => setModal("account")}>
          <span className="avatar">{firstName.slice(0, 1).toUpperCase()}</span>
          <span className="profile-text">
            <strong>{displayName}</strong>
            <small>{user?.email || (firebaseReady ? "Sign in to sync" : "Guest · public mode")}</small>
          </span>
          <span className="more-icon">···</span>
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="breadcrumb">Your space <span>/</span> <strong>{activeNav}</strong></div>
          <div className="topbar-actions">
            <div className="search-wrap">
              <Icon>⌕</Icon>
              <input
                aria-label="Search exercises and plans"
                placeholder="Search 708 exercises..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <kbd>⌘ K</kbd>
            </div>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => notify("You’re all caught up.")}>
              ♧<i />
            </button>
            <button className="top-avatar" onClick={() => setModal("account")} aria-label="Account">
              {firstName.slice(0, 1).toUpperCase()}
            </button>
          </div>
        </header>

        <div className="content">
          {/* OVERVIEW TAB */}
          {activeNav === "Overview" && (
            <div className="dashboard-grid">
              <section className="main-column">
                <div className="welcome-row">
                  <div>
                    <p className="eyebrow">YOUR FITALERT DASHBOARD <span className="weather">· 708 RepDB Exercises</span></p>
                    <h1>Welcome, {firstName} <span className="wave">✦</span></h1>
                    <p className="subheading">Explore 708 exercises with 3D movement guides, instructions, and YouTube tutorials.</p>
                  </div>
                  <button className="button button-outline" onClick={() => setModal("assessment")}>
                    <Icon>✣</Icon> Fitness assessment
                  </button>
                </div>

                <div className="hero-card">
                  <div className="hero-copy">
                    <div className="hero-tag"><span /> 708 EXERCISES LOADED</div>
                    <h2>Movement,<br />visualized in 3D</h2>
                    <p>Interactive kinematic human figures and YouTube tutorial video examples for every movement.</p>
                    <div className="hero-meta">
                      <span><Icon>◷</Icon> 708 Exercises</span>
                      <span><Icon>▧</Icon> 3D & YouTube Guides</span>
                    </div>
                    <button className="button button-light" onClick={() => setActiveNav("Exercise library")}>
                      Open exercise library <span>→</span>
                    </button>
                  </div>
                  <div className="hero-art" aria-label="Abstract illustration of a person training">
                    <div className="art-glow" />
                    <div className="art-orbit orbit-one" />
                    <div className="art-orbit orbit-two" />
                    <div className="art-person">
                      <div className="person-head" />
                      <div className="person-body" />
                      <div className="person-arm arm-left" />
                      <div className="person-arm arm-right" />
                      <div className="person-leg leg-left" />
                      <div className="person-leg leg-right" />
                    </div>
                    <div className="art-caption">
                      <span className="mini-play">▶</span>
                      <span><strong>Real-time 3D Pose</strong><small>Interactive movement engine</small></span>
                    </div>
                  </div>
                </div>

                <div className="section-heading">
                  <div><p className="eyebrow">YOUR ROUTINE</p><h2>Made for your week</h2></div>
                  <button className="text-button" onClick={() => setActiveNav("My workouts")}>View all <span>→</span></button>
                </div>
                <div className="plans-grid">
                  {plans.map((plan, index) => (
                    <PlanCard
                      key={plan.id || plan.title}
                      plan={plan}
                      index={index}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setPlanActiveDayIndex(0);
                      }}
                    />
                  ))}
                </div>

                <div className="section-heading exercise-heading">
                  <div><p className="eyebrow">QUICK PICKS</p><h2>Explore exercises ({apiExercises.length > 0 ? apiExercises.length : "708"} available)</h2></div>
                  <button className="text-button" onClick={() => setActiveNav("Exercise library")}>Open full library ({exerciseTotal}) <span>→</span></button>
                </div>
                <div className="exercise-list">
                  {apiExercises.slice(0, 5).map((exercise, index) => (
                    <ExerciseRow
                      key={exercise.id || index}
                      exercise={{
                        name: exercise.name,
                        category: exercise.category,
                        muscles: exercise.primaryMuscles?.join(" · ") || exercise.bodyPart,
                        level: exercise.difficulty || "All levels",
                        time: exercise.isBodyweight ? "Bodyweight" : "Equip",
                        imageUrl: exercise.imageUrl,
                      }}
                      index={index}
                      onClick={() => setSelectedExerciseDetail(exercise)}
                    />
                  ))}
                </div>

                <MotionPreview />

                <div className="together-banner">
                  <div className="together-icon">◉</div>
                  <div>
                    <strong>Better together, even from afar</strong>
                    <p>Invite a friend to join your next workout session.</p>
                  </div>
                  <button className="button button-dark" onClick={() => setActiveNav("Training together")}>
                    Explore live rooms <span>→</span>
                  </button>
                </div>
              </section>

              <aside className="right-column">
                <div className="streak-card">
                  <div className="streak-top">
                    <div><p className="eyebrow">YOUR MOMENTUM</p><h3>You're showing up.</h3></div>
                    <span className="streak-icon">✦</span>
                  </div>
                  <div className="streak-number">4 <small>day streak</small></div>
                  <div className="week-days">
                    {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                      <div key={`${day}-${i}`} className={i < 4 ? "day done" : "day"}>
                        <span>{day}</span><i>{i < 4 ? "✓" : ""}</i>
                      </div>
                    ))}
                  </div>
                  <p className="streak-note"><span>✦</span> Two more sessions to reach your weekly goal</p>
                </div>

                <div className="coach-widget">
                  <div className="widget-heading">
                    <div><p className="eyebrow">A LITTLE GUIDANCE</p><h3>Ask your AI coach</h3></div>
                    <span className="online-dot" />
                  </div>
                  <div className="chat-preview">
                    <div className="bot-avatar">✳</div>
                    <div>
                      <strong>Fitalert Coach</strong>
                      <p>{chatLoading ? "Thinking through your question…" : (chatMessages.at(-1)?.text || "Preparing your reply…")}</p>
                    </div>
                  </div>
                  <form className="chat-input" onSubmit={sendChat}>
                    <input aria-label="Ask the AI coach" placeholder="Ask a fitness question..." value={chatText} onChange={(event) => setChatText(event.target.value)} disabled={chatLoading} />
                    <button aria-label="Send message" disabled={chatLoading}>↑</button>
                  </form>
                  <p className="widget-disclaimer">Cloud AI · general wellness only · setup required</p>
                </div>

                <div className="nutrition-widget">
                  <div className="widget-heading">
                    <div><p className="eyebrow">FUEL YOUR DAY</p><h3>Food journal</h3></div>
                    <span className="food-icon">◉</span>
                  </div>
                  <p className="nutrition-copy">Log a meal to see an approximate calorie estimate.</p>
                  <form className="food-input" onSubmit={logFood}>
                    <input aria-label="Describe your meal" placeholder="e.g. rice and chicken" value={meal} onChange={(event) => setMeal(event.target.value)} />
                    <button aria-label="Add meal">+</button>
                  </form>
                  <label className="scan-button">
                    <span>▧</span> Scan food <small>demo</small>
                    <input type="file" accept="image/*" onChange={() => notify("Image recognition is not connected. This prototype does not analyze food photos.")} />
                  </label>
                  {loggedMeal && (
                    <div className="logged-food">
                      <span>✓</span>
                      <span><strong>{loggedMeal.name}</strong><small>{loggedMeal.estimate ? "Starter estimate · portion dependent" : "Rough generic estimate"}</small></span>
                      <b>~{loggedMeal.calories} <small>kcal</small></b>
                    </div>
                  )}
                  <p className="widget-disclaimer">Estimates vary by serving size and preparation.</p>
                </div>

                <div className="coach-spotlight">
                  <div className="spotlight-top"><span className="eyebrow">CREATOR SPOTLIGHT</span><span className="verified">✦ CURATED</span></div>
                  <div className="spotlight-profile">
                    <span className="coach-avatar coach-one">CH</span>
                    <div><strong>Chris Heria</strong><small>Calisthenics · YouTube</small></div>
                    <a href="https://www.youtube.com/@CHRISHERIA" target="_blank" rel="noreferrer" aria-label="Visit Chris Heria's YouTube channel">↗</a>
                  </div>
                  <p>Explore a creator’s public channel. Fitalert does not endorse or verify medical credentials.</p>
                </div>
              </aside>
            </div>
          )}

          {/* MY WORKOUTS TAB */}
          {activeNav === "My workouts" && (
            <PageIntro
              eyebrow="YOUR TRAINING SPACE"
              title="My workouts"
              subtitle="Simple plans, steady progress. Choose a session that fits today."
              action={<button className="button button-primary" onClick={() => setModal("assessment")}>Personalize my plan <span>→</span></button>}
            >
              {planProfile && (
                <div className="profile-summary">
                  <span className="summary-check">✓</span>
                  <div>
                    <strong>Your starter profile is ready</strong>
                    <p>{planProfile.goals.join(", ")} · {planProfile.trainingPlace || "Location flexible"} · {planProfile.daysPerWeek} days/week · {planProfile.experience || "Experience not specified"}</p>
                  </div>
                  <button onClick={() => setModal("assessment")}>Edit</button>
                </div>
              )}
              <div className="section-heading">
                <div><p className="eyebrow">STRUCTURED APP & PLATFORM PLANS</p><h2>Curated training programs</h2></div>
                <span className="muted-count">{plans.length} programs available</span>
              </div>

              {/* Plan Category Filter Chips */}
              <div className="coach-filter-row" style={{ marginBottom: "16px" }}>
                {["All", "Bodybuilding", "Powerlifting", "Calisthenics", "Mobility Training", "HIIT", "Stretching"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`filter-chip ${planCategoryFilter === cat ? "selected" : ""}`}
                    onClick={() => setPlanCategoryFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="plans-grid plans-grid-large">
                {plans
                  .filter((p) => planCategoryFilter === "All" || (p.category || "").toLowerCase() === planCategoryFilter.toLowerCase())
                  .map((plan, index) => (
                    <PlanCard
                      key={plan.id || plan.title}
                      plan={plan}
                      index={index}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setPlanActiveDayIndex(0);
                      }}
                    />
                  ))}
              </div>

              <div className="section-heading">
                <div>
                  <p className="eyebrow">TODAY'S SCHEDULED SESSION</p>
                  <h2>{activePlan.title}</h2>
                  {activePlan.appSource && (
                    <span className="plan-badge-source" style={{ marginTop: "4px" }}>
                      Source: {activePlan.appSource}
                    </span>
                  )}
                </div>
                <button className="button button-primary" onClick={() => startWorkout(activePlan)}>
                  {workoutActive ? "Restart session" : "Start session"} <span>→</span>
                </button>
              </div>

              <div className="exercise-list">
                {((activePlan.days && activePlan.days[0]?.exercises) || activePlan.exercises || []).map((exercise, index) => (
                  <ExerciseRow
                    key={exercise.name}
                    exercise={{
                      name: exercise.name,
                      category: activePlan.title,
                      muscles: exercise.sets ? `${exercise.sets} · ${exercise.reps}` : exercise.plan,
                      level: activePlan.level || "Curated",
                      time: exercise.rest ? `Rest: ${exercise.rest}` : `${index + 1}`,
                    }}
                    index={index}
                    onClick={() => {
                      const match = apiExercises.find((e) => e.id === exercise.id || e.name.toLowerCase() === exercise.name.toLowerCase());
                      if (match) {
                        setSelectedExerciseDetail(match);
                      } else {
                        setSelectedExerciseDetail({
                          id: exercise.id || exercise.name.toLowerCase().replace(/\s+/g, "-"),
                          name: exercise.name,
                          category: activePlan.category || "Strength",
                          bodyPart: activePlan.type || "Full Body",
                          difficulty: activePlan.level || "Intermediate",
                          description: exercise.cue,
                          instructions: [
                            exercise.cue,
                            "Maintain smooth form and controlled tempo.",
                            "Breathe continuously through the repetition.",
                          ],
                          youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + " exercise form tutorial")}`,
                        });
                      }
                    }}
                  />
                ))}
              </div>
              <p className="catalog-note">This is a sample workout routine. Choose movements appropriate for your abilities and seek professional guidance when needed.</p>
            </PageIntro>
          )}

          {/* EXERCISE LIBRARY TAB (708 REPB EXERCISES + 3D ANIMATION & YOUTUBE) */}
          {activeNav === "Exercise library" && (
            <PageIntro
              eyebrow="MOVE WITH INTENTION · REPDB DATASET"
              title="Exercise library (708 Exercises)"
              subtitle="Browse 708 exercises with interactive 3D kinematic movement animations, form cues, and YouTube tutorials."
              action={
                <div className="search-wrap library-search">
                  <Icon>⌕</Icon>
                  <input
                    placeholder="Search by name, muscle, tag..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
              }
            >
              <div className="library-notice">
                <span>✳</span>
                <p>
                  <strong>RepDB Open Dataset Integrated (708 Exercises)</strong> — Click any exercise to open the <strong>Interactive 3D Motion Guide</strong>, step-by-step instructions, and verified <strong>YouTube tutorial video examples</strong>.
                </p>
              </div>

              {/* Filters */}
              <div className="exercise-filter-group">
                {/* Category Filter */}
                <div className="exercise-filter-row">
                  <span className="exercise-filter-label">CATEGORY:</span>
                  {["", "strength", "stretching", "cardio", "plyometrics", "olympic"].map((cat) => (
                    <button
                      key={cat}
                      className={`exercise-filter-chip ${exerciseCategoryFilter === cat ? "selected" : ""}`}
                      onClick={() => setExerciseCategoryFilter(cat)}
                    >
                      {cat ? cat.toUpperCase() : "ALL CATEGORIES"}
                    </button>
                  ))}
                </div>

                {/* Difficulty Filter */}
                <div className="exercise-filter-row">
                  <span className="exercise-filter-label">DIFFICULTY:</span>
                  {["", "beginner", "intermediate", "advanced"].map((diff) => (
                    <button
                      key={diff}
                      className={`exercise-filter-chip ${exerciseDifficultyFilter === diff ? "selected" : ""}`}
                      onClick={() => setExerciseDifficultyFilter(diff)}
                    >
                      {diff ? diff.charAt(0).toUpperCase() + diff.slice(1) : "ALL LEVELS"}
                    </button>
                  ))}
                </div>

                {/* Body Part Filter */}
                <div className="exercise-filter-row">
                  <span className="exercise-filter-label">BODY PART:</span>
                  {["", "chest", "back", "shoulders", "upper_arms", "lower_arms", "upper_legs", "lower_legs", "core", "full_body"].map((bp) => (
                    <button
                      key={bp}
                      className={`exercise-filter-chip ${exerciseBodyPartFilter === bp ? "selected" : ""}`}
                      onClick={() => setExerciseBodyPartFilter(bp)}
                    >
                      {bp ? bp.replace(/_/g, " ").toUpperCase() : "ALL BODY PARTS"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="exercise-stats-bar">
                <span>Showing <strong>{apiExercises.length}</strong> of <strong>{exerciseTotal}</strong> matching exercises</span>
                {(exerciseCategoryFilter || exerciseBodyPartFilter || exerciseDifficultyFilter || query) && (
                  <button
                    className="text-button"
                    onClick={() => {
                      setExerciseCategoryFilter("");
                      setExerciseBodyPartFilter("");
                      setExerciseDifficultyFilter("");
                      setQuery("");
                    }}
                  >
                    Clear filters ↺
                  </button>
                )}
              </div>

              {exerciseError && <p className="creator-error" role="alert">{exerciseError}</p>}
              {exerciseLoading && <div className="empty-state" role="status">Loading exercises from RepDB dataset…</div>}
              {!exerciseLoading && !exerciseError && apiExercises.length === 0 && (
                <div className="empty-state">No matching exercises found. Try adjusting your filters or search terms.</div>
              )}

              {!exerciseLoading && (
                <>
                  <div className="exercise-list full-exercise-list">
                    {apiExercises.map((exercise, index) => (
                      <ExerciseRow
                        key={exercise.id || index}
                        exercise={{
                          name: exercise.name,
                          category: exercise.category ? exercise.category.toUpperCase() : exercise.bodyPart,
                          muscles: exercise.primaryMuscles?.join(" · ") || exercise.bodyPart || "General",
                          level: exercise.difficulty ? exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1) : "All levels",
                          time: exercise.isBodyweight ? "Bodyweight" : "Equipment",
                          imageUrl: exercise.imageUrl,
                        }}
                        index={index}
                        onClick={() => setSelectedExerciseDetail(exercise)}
                      />
                    ))}
                  </div>

                  {apiExercises.length < exerciseTotal && (
                    <div className="load-more-row">
                      <button
                        className="button button-outline"
                        disabled={exerciseLoadingMore}
                        onClick={loadMoreExercises}
                      >
                        {exerciseLoadingMore ? "Loading more exercises…" : `Load more (${exerciseTotal - apiExercises.length} remaining)`} <span>↓</span>
                      </button>
                    </div>
                  )}
                </>
              )}

              <MotionPreview />
            </PageIntro>
          )}

          {/* NUTRITION TAB */}
          {activeNav === "Nutrition" && (
            <PageIntro eyebrow="EVERYDAY FUEL" title="Nutrition, made simpler" subtitle="Keep a food log and explore practical meal ideas that can complement your movement.">
              <div className="nutrition-page-grid">
                <div className="nutrition-main-card">
                  <div className="nutrition-card-header">
                    <span className="nutrition-big-icon">◉</span>
                    <div>
                      <p className="eyebrow">TODAY'S FOOD JOURNAL</p>
                      <h2>One meal at a time</h2>
                    </div>
                  </div>
                  <p>Describe what you ate and we’ll show a rough example estimate. Serving size, recipe, and ingredients can change the total substantially.</p>
                  <form className="food-entry-form" onSubmit={logFood}>
                    <label htmlFor="food-description">What did you eat?</label>
                    <textarea id="food-description" rows="3" placeholder="e.g. a bowl of pounded yam with egusi, fish and vegetables" value={meal} onChange={(event) => setMeal(event.target.value)} />
                    <div className="nutrition-form-actions">
                      <label className="button button-outline upload-button">
                        ▧ Scan food photo
                        <input type="file" accept="image/*" onChange={() => notify("Food-photo recognition isn't connected in this demo.")} />
                      </label>
                      <button className="button button-primary" type="submit">Estimate meal <span>→</span></button>
                    </div>
                  </form>
                  {loggedMeal && (
                    <div className="meal-result">
                      <span className="meal-result-icon">✓</span>
                      <div>
                        <small>ROUGH ESTIMATE · NOT A MEASUREMENT</small>
                        <strong>{loggedMeal.name}</strong>
                        <p>Approximately <b>{loggedMeal.calories} kcal</b> for a typical serving. Actual calories may differ considerably.</p>
                      </div>
                    </div>
                  )}
                  <div className="nutrition-warning">Food estimates are informational and not medical or dietary advice. For individual needs, consult a registered dietitian or healthcare professional.</div>
                </div>
                <div className="meal-ideas">
                  <p className="eyebrow">MEAL IDEAS</p>
                  <h3>Recovery can be delicious</h3>
                  <p className="nutrition-copy">Balanced meal ideas—adapt portions to your needs and preferences.</p>
                  {[
                    { name: "Egusi & pounded yam", detail: "Add fish or beans and vegetables", icon: "◉", kcal: "Estimate varies" },
                    { name: "Rice bowl", detail: "Chicken, tofu, or beans with greens", icon: "◌", kcal: "Estimate varies" },
                    { name: "Oats & fruit", detail: "Add yogurt, seeds, or nut butter", icon: "✳", kcal: "Estimate varies" },
                  ].map((item) => (
                    <div className="meal-idea" key={item.name}>
                      <span className="meal-idea-icon">{item.icon}</span>
                      <span><strong>{item.name}</strong><small>{item.detail}</small></span>
                      <b>{item.kcal}</b>
                    </div>
                  ))}
                </div>
              </div>
              <div className="library-notice">
                <span>ⓘ</span>
                <p><strong>No photo analysis or personalized calorie targets.</strong> Food scanning and AI meal recommendations require vetted nutrition data, privacy safeguards, and qualified review before launch.</p>
              </div>
            </PageIntro>
          )}

          {/* FIND A COACH TAB */}
          {activeNav === "Find a coach" && (
            <PageIntro
              eyebrow="LEARN FROM THE COMMUNITY"
              title="Find your kind of coach"
              subtitle="Search public creator channels by training style and keep paging through real results. Category labels are discovery tags, not credential verification."
            >
              <div className="creator-search-panel">
                <form onSubmit={searchCreators}>
                  <label className="creator-query">
                    <span>⌕</span>
                    <input value={creatorQuery} onChange={(event) => setCreatorQuery(event.target.value)} placeholder="Search channels or training topics worldwide..." />
                  </label>
                  <label className="creator-category">
                    <span className="sr-only">Training category</span>
                    <select value={creatorCategory} onChange={(event) => setCreatorCategory(event.target.value)}>
                      <option value="">All training styles</option>
                      {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </label>
                  <button className="button button-primary" type="submit" disabled={creatorLoading}>
                    {creatorLoading ? "Searching…" : "Search creators"} <span>→</span>
                  </button>
                </form>
                {creatorError && <p className="creator-error" role="alert">{creatorError}</p>}
                {creatorSearched && (
                  <p className="creator-results-note">
                    {searchedCoaches.length > 0 ? `Showing ${searchedCoaches.length} channels from YouTube search. About ${creatorTotal.toLocaleString()} matching results reported.` : "No channels found for this search. Try another term or training style."}
                  </p>
                )}
              </div>
              <div className="coach-filter-row">
                <button className={`filter-chip ${coachFilter === "All" ? "selected" : ""}`} onClick={() => setCoachFilter("All")}>All creators</button>
                {["Calisthenics", "Bodybuilding", "Powerlifting", "Strength", "Mobility", "Functional Fitness", "Dance Fitness", "Yoga"].map((category) => (
                  <button key={category} className={`filter-chip ${coachFilter === category ? "selected" : ""}`} onClick={() => setCoachFilter(category)}>{category}</button>
                ))}
              </div>
              {searchedCoaches.length > 0 && (
                <>
                  <div className="coach-grid">
                    {searchedCoaches.map((coach) => (
                      <article className="coach-card" key={coach.channelId}>
                        <div className="coach-cover coach-search-cover">
                          {coach.thumbnail ? <img src={coach.thumbnail} alt="" /> : <span className="coach-avatar">{coach.name.slice(0, 2).toUpperCase()}</span>}
                          <span className="cover-tag">{coach.category}</span>
                        </div>
                        <div className="coach-card-info">
                          <h3>{coach.name}</h3>
                          <p>{coach.description || "Public YouTube channel"}</p>
                          <div className="coach-card-bottom">
                            <span className="social-handle">YouTube · search result</span>
                            <a className="button button-outline" href={coach.url} target="_blank" rel="noreferrer">View channel ↗</a>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                  {creatorNextPage && (
                    <div className="load-more-row">
                      <button className="button button-outline" disabled={creatorLoading} onClick={() => searchCreators(undefined, creatorNextPage)}>
                        {creatorLoading ? "Loading…" : "Load more channels"} <span>↓</span>
                      </button>
                    </div>
                  )}
                </>
              )}
              <div className="coach-grid">
                {visibleCoaches.map((coach) => (
                  <article className="coach-card" key={coach.name}>
                    <div className={`coach-cover ${coach.tone}`}>
                      <span className="coach-avatar">{coach.initials}</span>
                      <span className="cover-tag">{coach.focus}</span>
                    </div>
                    <div className="coach-card-info">
                      <h3>{coach.name}</h3>
                      <p>{coach.detail}</p>
                      <div className="coach-card-bottom">
                        <span className="social-handle">▶ {coach.handle}</span>
                        <a className="button button-outline" href={coach.link} target="_blank" rel="noreferrer">View channel ↗</a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </PageIntro>
          )}

          {/* AI COACH TAB */}
          {activeNav === "AI coach" && (
            <PageIntro eyebrow="A FRIENDLY PLACE TO START" title="Meet your Fitalert coach" subtitle="Ask a general fitness question. Model provider selected on backend.">
              <div className="full-chat-card">
                <div className="full-chat-header">
                  <div className="bot-avatar">✳</div>
                  <div><strong>Fitalert Coach</strong><small>OpenAI or Ollama · server enabled</small></div>
                  <span className="chat-spark">✦</span>
                </div>
                <div className="full-chat-messages" aria-live="polite">
                  {chatMessages.map((message, index) => (
                    <div className={`full-message ${message.role}`} key={index}>
                      <span className="message-avatar">{message.role === "assistant" ? "✳" : "A"}</span>
                      <p>{message.text || (chatLoading && index === chatMessages.length - 1 ? "Thinking…" : "")}</p>
                    </div>
                  ))}
                </div>
                <form className="full-chat-input" onSubmit={sendChat}>
                  <input placeholder="Ask about goals, movement, or recovery..." value={chatText} onChange={(event) => setChatText(event.target.value)} disabled={chatLoading} />
                  <button aria-label="Send message" disabled={chatLoading}>↑</button>
                </form>
                <p className="widget-disclaimer">Messages go to the server-selected AI provider. Avoid sharing sensitive health information.</p>
              </div>
            </PageIntro>
          )}

          {/* TRAINING TOGETHER TAB */}
          {activeNav === "Training together" && (
            <PageIntro eyebrow="MOVE WITH YOUR PEOPLE" title="Train together, anywhere" subtitle="Join to give your browser explicit permission to use your camera and microphone.">
              {/* TOP ROOM BAR */}
              <div className="live-room-top-bar">
                <div className="live-room-info-pill">
                  <span>ROOM:</span>
                  <strong>{roomCode}</strong>
                  <span style={{ color: "#38bdf8", marginLeft: "6px" }}>● Active</span>
                </div>
                <div className="live-room-actions">
                  <button
                    type="button"
                    className="live-share-link-btn"
                    onClick={() => setShareModalOpen(true)}
                  >
                    🔗 Share Room Link / Invite
                  </button>
                  <button
                    type="button"
                    className={`live-record-toggle-btn ${isRecording ? "btn-stop-record" : "btn-start-record"}`}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? `⏹ Stop & Save (${recordDuration})` : "⏺ Record Workout"}
                  </button>
                </div>
              </div>

              {/* INSTAGRAM STORY HIGHLIGHTS BAR */}
              <LiveWorkoutHighlights
                highlights={highlights}
                onSelectHighlight={(h) => setSelectedHighlight(h)}
                onStartRecording={isRecording ? stopRecording : startRecording}
                isRecording={isRecording}
                recordDuration={recordDuration}
                roomStream={roomStream}
              />

              <div className="live-preview">
                <div className="live-screen">
                  <div className="live-screen-glow" />
                  {roomStream && <video className="live-local-video" ref={videoRef} autoPlay playsInline muted />}
                  {(!roomStream || !cameraEnabled) && (
                    <div className="live-camera-off">
                      {roomStream ? "Camera paused" : "Camera is off · Click 'Join room' below"}
                    </div>
                  )}

                  {/* Red REC pulsing badge when recording */}
                  {isRecording && (
                    <div style={{
                      position: "absolute",
                      top: "18px",
                      left: "15px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "5px 10px",
                      borderRadius: "6px",
                      background: "#ef4444ee",
                      color: "#fff",
                      fontSize: "9px",
                      fontWeight: 800,
                      letterSpacing: "0.5px",
                      zIndex: 4,
                      boxShadow: "0 0 15px rgba(239, 68, 68, 0.6)"
                    }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fff", animation: "blinkDot 1s infinite" }} />
                      REC {recordDuration}
                    </div>
                  )}

                  <div className="live-count">
                    Connected: You (Host) · Room {roomCode}
                  </div>

                  <div className="live-controls">
                    {roomStream ? (
                      <>
                        <button onClick={() => toggleTrack("video")}>{cameraEnabled ? "◉ Camera on" : "◉ Camera off"}</button>
                        <button onClick={() => toggleTrack("audio")}>{microphoneEnabled ? "♩ Mic on" : "♩ Mic off"}</button>
                        <button onClick={isRecording ? stopRecording : startRecording} style={{ background: isRecording ? "#ef4444" : "#4f46e5", color: "#fff" }}>
                          {isRecording ? "⏹ Stop Recording" : "⏺ Record"}
                        </button>
                        <button className="live-end" onClick={leaveRoom}>Leave room</button>
                      </>
                    ) : (
                      <button onClick={joinRoom} style={{ background: "#4f46e5", color: "#fff" }}>
                        ▶ Start Room Preview
                      </button>
                    )}
                  </div>
                  {!isRecording && (
                    <span className="live-badge"><i />{roomStream ? "LOCAL PREVIEW ACTIVE" : "ROOM READY"}</span>
                  )}
                </div>

                <div className="live-details">
                  <p className="eyebrow">WORKOUT ROOMS & HIGHLIGHTS</p>
                  <h2>Show up together. Move together.</h2>
                  <p>
                    Work out in real time with friends anywhere. Record your sessions and save them permanently as Story Highlights with certified date, start/finish times, and location.
                  </p>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" }}>
                    {!roomStream ? (
                      <button className="button button-primary" onClick={joinRoom}>
                        Join room · Enable camera & mic <span>→</span>
                      </button>
                    ) : (
                      <button className="button button-primary" onClick={isRecording ? stopRecording : startRecording}>
                        {isRecording ? "⏹ Stop Recording & Save Highlight" : "⏺ Record Live Session"}
                      </button>
                    )}
                    <button className="button button-secondary" onClick={() => setShareModalOpen(true)}>
                      🔗 Share Room Link <span>+</span>
                    </button>
                  </div>
                  {roomError && <p className="creator-error" role="alert">{roomError}</p>}

                  <div className="privacy-note">
                    <span>🔒</span>
                    <span>
                      <strong>Permanent Storage & Privacy</strong>
                      <small>Recordings are stored entirely in your device&apos;s IndexedDB — never uploaded to external cloud servers. Preserved indefinitely beyond 24 hours.</small>
                    </span>
                  </div>
                </div>
              </div>

              {/* SHARE ROOM MODAL */}
              {shareModalOpen && (
                <LiveRoomShareModal
                  roomCode={roomCode}
                  onClose={() => setShareModalOpen(false)}
                  onCopyLink={(url) => notify("Room link copied to clipboard! Share with friends to train together.")}
                  onUpdateRoomCode={(newCode) => {
                    setRoomCode(newCode);
                    notify(`Live room ID changed to: ${newCode}`);
                    setShareModalOpen(false);
                  }}
                />
              )}

              {/* INSTAGRAM STORY VIEWER MODAL */}
              {selectedHighlight && (
                <InstagramStoryViewerModal
                  highlight={selectedHighlight}
                  onClose={() => setSelectedHighlight(null)}
                  onDelete={handleDeleteHighlight}
                />
              )}
            </PageIntro>
          )}

          <footer className="app-footer">
            <span>© 2026 Fitalert · 708 RepDB Exercises Dataset Integrated</span>
            <span>
              <button onClick={() => notify("Privacy policy content should be added before launch.")}>Privacy</button>
              <button onClick={() => notify("Support is not connected in this prototype.")}>Help & support</button>
              <span>Designed for real life <b>✦</b></span>
            </span>
          </footer>
        </div>

        <nav className="mobile-nav" aria-label="Mobile navigation">
          {[...navItems, { label: "AI coach", icon: "✳" }, { label: "Training together", icon: "◉" }].map((item) => (
            <button key={item.label} className={activeNav === item.label ? "active" : ""} onClick={() => setActiveNav(item.label)}>
              <Icon>{item.icon}</Icon>
              <small>{item.label}</small>
            </button>
          ))}
        </nav>
      </section>

      {/* ACCOUNT / AUTH MODAL */}
      {modal === "account" && (
        <Modal
          title={activeUser ? "Your account" : "Sign in to Fitalert"}
          eyebrow={user ? "FIREBASE AUTHENTICATED" : activeUser ? "SESSION AUTHENTICATED" : "SIGN IN REQUIRED"}
          onClose={() => setModal("")}
        >
          {activeUser ? (
            <>
              <p className="modal-copy">
                Signed in as <strong>{displayName}</strong><br />
                {activeUser.email}
                {demoUser && <small style={{ display: "block", marginTop: "4px", color: "#a5a7bc" }}>Demo session active (Local)</small>}
              </p>
              <button className="button button-outline full-width" onClick={signOut}>Sign out</button>
            </>
          ) : (
            <>
              <p className="modal-copy">
                Sign in to your Firebase account using Google, Microsoft, or Apple to sync your workouts and preferences.
              </p>
              <div className="auth-gate-providers">
                <button
                  type="button"
                  className="auth-gate-provider-btn"
                  onClick={() => signInSocial("google")}
                >
                  <GoogleIcon size={18} /> Continue with Google
                </button>
                <button
                  type="button"
                  className="auth-gate-provider-btn"
                  onClick={() => signInSocial("microsoft")}
                >
                  <MicrosoftIcon size={18} /> Continue with Microsoft
                </button>
                <button
                  type="button"
                  className="auth-gate-provider-btn"
                  onClick={() => signInSocial("apple")}
                >
                  <AppleIcon size={18} /> Continue with Apple
                </button>
              </div>
              <div className="modal-actions" style={{ marginTop: "12px", justifyContent: "space-between" }}>
                <a className="button button-quiet" href="/login">Email Sign In</a>
                <a className="button button-primary" href="/signup">Create account →</a>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* FITNESS ASSESSMENT MODAL */}
      {modal === "assessment" && (
        <AssessmentQuiz
          onClose={() => setModal("")}
          onFinish={(profile) => {
            setPlanProfile(profile);
            setModal("");
            setActiveNav("My workouts");
            notify("Your assessment is saved in this page session.");
          }}
        />
      )}

      {/* SELECTED PLAN MODAL */}
      {selectedPlan && (
        <Modal
          title={selectedPlan.title}
          eyebrow={`${selectedPlan.appSource ? `${selectedPlan.appSource.toUpperCase()} · ` : ""}${selectedPlan.type} · ${selectedPlan.weeks}`}
          onClose={() => setSelectedPlan(null)}
          wide
        >
          {selectedPlan.appSource && (
            <div style={{ marginBottom: "10px" }}>
              <span className="plan-badge-source">Curated from: {selectedPlan.appSource}</span>
            </div>
          )}
          {selectedPlan.description && (
            <p className="modal-copy" style={{ marginBottom: "14px" }}>{selectedPlan.description}</p>
          )}

          {/* Day Switcher for multi-day programs */}
          {selectedPlan.days && selectedPlan.days.length > 1 && (
            <div className="plan-days-nav">
              {selectedPlan.days.map((dayObj, dIdx) => (
                <button
                  key={dayObj.day || dIdx}
                  type="button"
                  className={`plan-day-btn ${planActiveDayIndex === dIdx ? "active" : ""}`}
                  onClick={() => setPlanActiveDayIndex(dIdx)}
                >
                  Day {dayObj.day}: {dayObj.name}
                </button>
              ))}
            </div>
          )}

          <div className="plan-day-exercises">
            {((selectedPlan.days && selectedPlan.days[planActiveDayIndex]?.exercises) || selectedPlan.exercises || []).map((exercise) => (
              <div className="plan-exercise-card" key={exercise.name}>
                <div className="plan-exercise-info">
                  <strong>{exercise.name}</strong>
                  <span>{exercise.sets ? `${exercise.sets} · ${exercise.reps}` : exercise.plan} {exercise.rest ? `· Rest: ${exercise.rest}` : ""}</span>
                  <small>{exercise.cue}</small>
                </div>
                <div className="plan-exercise-actions">
                  <button
                    type="button"
                    className="plan-exercise-view-btn"
                    onClick={() => {
                      const match = apiExercises.find((e) => e.id === exercise.id || e.name.toLowerCase() === exercise.name.toLowerCase());
                      if (match) {
                        setSelectedExerciseDetail(match);
                      } else {
                        setSelectedExerciseDetail({
                          id: exercise.id || exercise.name.toLowerCase().replace(/\s+/g, "-"),
                          name: exercise.name,
                          category: selectedPlan.category || "Strength",
                          bodyPart: selectedPlan.type || "Full Body",
                          difficulty: selectedPlan.level || "Intermediate",
                          description: exercise.cue,
                          instructions: [
                            exercise.cue,
                            "Maintain smooth form and controlled tempo.",
                            "Breathe continuously through the repetition.",
                          ],
                          youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + " exercise form tutorial")}`,
                        });
                      }
                    }}
                  >
                    ✦ 3D & Video
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="modal-actions" style={{ marginTop: "16px" }}>
            <button className="button button-quiet" onClick={() => setSelectedPlan(null)}>Close</button>
            <button className="button button-primary" onClick={() => startWorkout(selectedPlan)}>Start this plan <span>→</span></button>
          </div>
        </Modal>
      )}

      {/* EXERCISE DETAIL MODAL (3D ANIMATION, REPDB ILLUSTRATION & YOUTUBE TUTORIALS) */}
      {selectedExerciseDetail && (
        <Modal
          title={selectedExerciseDetail.name}
          eyebrow={`${(selectedExerciseDetail.category || "EXERCISE").toUpperCase()} · ${(selectedExerciseDetail.bodyPart || "").toUpperCase()}`}
          onClose={() => setSelectedExerciseDetail(null)}
          wide
        >
          <div className="exercise-badge-list">
            {selectedExerciseDetail.difficulty && (
              <span className={`exercise-pill-badge difficulty-${selectedExerciseDetail.difficulty.toLowerCase()}`}>
                ★ {selectedExerciseDetail.difficulty.toUpperCase()}
              </span>
            )}
            {selectedExerciseDetail.category && (
              <span className="exercise-pill-badge badge-category">
                ◉ {selectedExerciseDetail.category.toUpperCase()}
              </span>
            )}
            {selectedExerciseDetail.isBodyweight && (
              <span className="exercise-pill-badge">
                ⚖ BODYWEIGHT
              </span>
            )}
            {selectedExerciseDetail.met && (
              <span className="exercise-pill-badge">
                ⚡ MET {selectedExerciseDetail.met}
              </span>
            )}
          </div>

          {/* Tab Selector between 3D Animation, YouTube Video, and Flat Illustration */}
          <div className="exercise-view-tabs">
            <button
              className={`exercise-view-tab ${exerciseViewTab === "3d" ? "active" : ""}`}
              onClick={() => setExerciseViewTab("3d")}
            >
              ✦ 3D & Equipment Guide (Interactive)
            </button>
            <button
              className={`exercise-view-tab ${exerciseViewTab === "video" ? "active" : ""}`}
              onClick={() => setExerciseViewTab("video")}
            >
              ▶ YouTube Tutorial (Verified Video)
            </button>
            <button
              className={`exercise-view-tab ${exerciseViewTab === "flat" ? "active" : ""}`}
              onClick={() => setExerciseViewTab("flat")}
            >
              ▦ RepDB Illustration
            </button>
          </div>

          <div className="exercise-detail-layout">
            <div className="exercise-detail-media">
              {exerciseViewTab === "3d" && (
                <Exercise3DViewer exercise={selectedExerciseDetail} height={290} />
              )}

              {exerciseViewTab === "video" && (
                <>
                  {exerciseVideoLoading && (
                    <div className="exercise-video-loading">
                      <YouTubeIcon size={34} />
                      <p>Fetching YouTube tutorial for {selectedExerciseDetail.name}...</p>
                    </div>
                  )}

                  {!exerciseVideoLoading && exerciseVideoData?.videoId && (
                    <div className="exercise-video-embed-container">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${exerciseVideoData.videoId}?autoplay=1&rel=0`}
                        title={exerciseVideoData.title || `${selectedExerciseDetail.name} Form Tutorial`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="exercise-video-iframe"
                      />
                      <div className="exercise-video-meta">
                        <strong>{decodeHtml(exerciseVideoData.title)}</strong>
                        <p>By {exerciseVideoData.channelTitle} · Verified Tutorial via YouTube API</p>
                      </div>
                    </div>
                  )}

                  {!exerciseVideoLoading && (!exerciseVideoData || !exerciseVideoData.videoId) && (
                    <div className="exercise-video-fallback">
                      <YouTubeIcon size={36} />
                      <p>No inline embed available for this exercise. Watch tutorials directly on YouTube:</p>
                      <a
                        className="button button-primary"
                        href={selectedExerciseDetail.youtubeSearchUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(selectedExerciseDetail.name + " exercise form tutorial")}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Watch on YouTube ↗
                      </a>
                    </div>
                  )}
                </>
              )}

              {exerciseViewTab === "flat" && (
                <div className="exercise-img-wrapper">
                  {selectedExerciseDetail.imageUrl ? (
                    <img
                      src={selectedExerciseDetail.imageUrl}
                      alt={selectedExerciseDetail.name}
                      className="exercise-flat-img"
                    />
                  ) : (
                    <div className="empty-state">No illustration available for this exercise.</div>
                  )}
                </div>
              )}

              {/* YouTube Tutorial Video Action Card */}
              <div className="exercise-yt-action">
                <div className="exercise-yt-copy">
                  <div className="exercise-yt-icon">
                    <YouTubeIcon size={26} />
                  </div>
                  <div>
                    <strong>
                      {exerciseVideoData?.title ? decodeHtml(exerciseVideoData.title) : "YouTube Video Demonstration"}
                    </strong>
                    <small>
                      {exerciseVideoData?.channelTitle ? `By ${exerciseVideoData.channelTitle} · Professional Form Guide` : "Watch professional coaching tutorials & form cues"}
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="exercise-yt-btn"
                  onClick={() => setExerciseViewTab("video")}
                >
                  {exerciseViewTab === "video" ? "Playing Video ✓" : "Play Video ▶"}
                </button>
              </div>
            </div>

            <div className="exercise-detail-info">
              {selectedExerciseDetail.description && (
                <p className="modal-copy" style={{ marginBottom: "12px" }}>
                  {selectedExerciseDetail.description}
                </p>
              )}

              {selectedExerciseDetail.primaryMuscles && selectedExerciseDetail.primaryMuscles.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <small style={{ color: "#a5a7bb", fontSize: "10px", fontWeight: "700", letterSpacing: "1px" }}>TARGET MUSCLES</small>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
                    {selectedExerciseDetail.primaryMuscles.map((muscle) => (
                      <span key={muscle} className="exercise-pill-badge" style={{ background: "#2a224a", color: "#c9bcfc" }}>
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedExerciseDetail.instructions && selectedExerciseDetail.instructions.length > 0 && (
                <div>
                  <small style={{ color: "#a5a7bb", fontSize: "10px", fontWeight: "700", letterSpacing: "1px" }}>INSTRUCTIONS</small>
                  <ol className="exercise-steps-list">
                    {selectedExerciseDetail.instructions.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {selectedExerciseDetail.tips && selectedExerciseDetail.tips.length > 0 && (
                <div className="exercise-tip-card">
                  <strong>PRO TIPS & SAFETY CUES</strong>
                  {selectedExerciseDetail.tips.map((tip, i) => (
                    <p key={i}>• {tip}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-actions" style={{ marginTop: "20px" }}>
            <button className="button button-quiet" onClick={() => setSelectedExerciseDetail(null)}>Close</button>
            <a
              className="button button-primary"
              href={selectedExerciseDetail.youtubeSearchUrl}
              target="_blank"
              rel="noreferrer"
            >
              Search more videos on YouTube <span>↗</span>
            </a>
          </div>
        </Modal>
      )}

      {toast && <div className="toast" role="status"><span>✦</span>{toast}<button onClick={() => setToast("")} aria-label="Dismiss">×</button></div>}
    </main >
  );
}

function ExerciseRow({ exercise, index, onClick }) {
  return (
    <button className="exercise-row" onClick={onClick}>
      <span className={`exercise-thumb exercise-thumb-${index % 4}`}>
        {exercise.imageUrl ? (
          <img className="exercise-gif" src={exercise.imageUrl} alt={`${exercise.name} demonstration`} loading="lazy" />
        ) : (
          <span>{["⌁", "↗", "◒", "✳"][index % 4]}</span>
        )}
      </span>
      <span className="exercise-main">
        <strong>{exercise.name}</strong>
        <small>{exercise.muscles}</small>
      </span>
      <span className="exercise-category">{exercise.category}</span>
      <span className={`level ${exercise.level ? `level-${exercise.level.toLowerCase()}` : ""}`}>{exercise.level}</span>
      <span className="exercise-time">{exercise.time}</span>
      <span className="row-arrow">↗</span>
    </button>
  );
}

function PlanCard({ plan, index, onClick }) {
  return (
    <button className="plan-card" onClick={onClick}>
      <span className={`plan-art ${plan.color}`}>
        <img className="plan-art-image" src={plan.image} alt="" />
        <span className="plan-art-icon">{plan.icon}</span>
        <small>{String(index + 1).padStart(2, "0")}</small>
      </span>
      <span className="plan-info">
        {plan.appSource && <span className="plan-badge-source">{plan.appSource}</span>}
        <strong>{plan.title}</strong>
        <small>{plan.type}</small>
        <span className="plan-bottom">
          <span>{plan.weeks}</span>
          <span className="plan-arrow">↗</span>
        </span>
      </span>
    </button>
  );
}

function MotionPreview() {
  return (
    <section className="motion-card">
      <div className="motion-model-wrap">
        <SquatModel3D />
        <span className="motion-loop"><i /> LOOPING PREVIEW</span>
      </div>
      <div className="motion-copy">
        <p className="eyebrow">3D MOVEMENT ENGINE · 708 EXERCISES</p>
        <h3>Interactive Kinematic 3D Figures</h3>
        <p>Real-time 3D models with 360° mouse drag rotation, play/pause controls, and movement patterns for all 708 RepDB exercises.</p>
      </div>
    </section>
  );
}

function PageIntro({ eyebrow, title, subtitle, action, children }) {
  return (
    <div className="page-view">
      <div className="page-intro">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="subheading">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
