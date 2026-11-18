# Fitalert Product Requirements Document

**Status:** Prototype requirements  
**Product:** Fitalert  
**Last updated:** 2026-11-17

## 1. Product summary

Fitalert is a worldwide fitness web app that helps people find approachable workouts, understand exercises, and build a consistent movement habit. The dashboard is public and usable without an account. Firebase sign-in is optional and is intended for identity-aware features as persistence is added.

## 2. Problem and opportunity

People often have difficulty choosing a safe starting workout, understanding exercise form, and finding guidance that fits their schedule, equipment, and goals. Fitalert brings starter plans, a searchable exercise catalog, creator discovery, a general-wellness AI coach, and basic nutrition logging into one responsive interface.

## 3. Users

- **New exercisers** looking for low-friction routines and beginner-friendly options.
- **Returning exercisers** who want help rebuilding a consistent habit.
- **Experienced exercisers** looking for movement references and plan ideas.
- **Fitness-curious visitors** who want to explore before creating an account.

## 4. Product goals

1. Let visitors explore the dashboard without signing up.
2. Provide dedicated Firebase sign-up and sign-in at `/signup` and `/login`.
3. Make plans actionable by showing their included movements and session guidance.
4. Offer an optional, non-diagnostic assessment that captures goals and preferences.
5. Give people control over theme and over camera/microphone permissions.
6. Clearly identify third-party, AI-generated, estimated, and prototype-only content.

## 5. Non-goals for this prototype

- Medical diagnosis, rehabilitation prescriptions, or clinically validated coaching.
- A complete or guaranteed exhaustive catalog of all exercises or coaches.
- Production multi-party video calling, media recording, or call storage.
- Server-side storage of fitness assessment, workout, or meal history.
- Accurate food recognition, body composition analysis, or prescribed calorie targets.
- Model training or fine-tuning.

## 6. Primary user journeys

### Explore as a guest

1. Open `/dashboard` directly or follow the explore link on an auth page.
2. Browse plan cards, exercise search, creator search, nutrition examples, and the AI coach.
3. Choose a theme; the preference is stored in browser local storage.
4. Optionally open the assessment, review its privacy note, and complete the questions.

### Create an account or sign in

1. Visit `/signup` or `/login`.
2. Use Firebase email/password or a configured Google, Microsoft, or Apple provider.
3. For email/password signup, verify the email using Firebase’s configured message template.
4. Return to `/dashboard`; Firebase Auth observes the browser’s signed-in user.

### Explore a plan

1. Select a plan card.
2. Review the plan summary, included exercises, sets/repetitions, and movement notes.
3. Start the selected plan; its exercises are shown in My Workouts.

### Enter a workout room

1. Select Training Together and explicitly choose Join.
2. The browser asks for camera and microphone access.
3. The user can switch camera/microphone tracks off or leave; tracks stop when leaving or navigating away.
4. The prototype shows only a local preview; it does not transmit media to other participants.

## 7. Functional requirements

| Area | Requirement | Acceptance |
|---|---|---|
| Routes | `/dashboard` is public; `/signup` and `/login` are separate routes; `/` routes to signup. | Guest can open dashboard directly; auth pages do not gate it. |
| Authentication | Firebase supports email/password verification and redirect sign-in for Google, Microsoft, and Apple. | Provider flows are exposed only when Firebase app configuration exists; provider enablement is configured in Firebase Console. |
| Theme | A persistent icon toggle selects light or dark mode across the app. | The default dark palette remains available and light mode uses the shared pale neutral palette. |
| Plans | Each starter plan opens its own details and exercise list. | Plan detail includes movements and session cues; starting it selects that plan in My Workouts. |
| Assessment | A multi-step quiz asks about goals, intended app use, training location/frequency, fitness starting point, optional body/physique focus and measurements, and product feedback. | Required goals must be selected; optional measurements can be omitted; completion produces a starter profile. |
| Rooms | The explicit Join action requests camera and microphone access and displays a local preview. | Denial and unavailable-device errors are explained; tracks can be toggled and are stopped on leave/navigation. |
| Exercise search | RapidAPI ExerciseDB is called through a server route. | API key stays server-side; missing credentials/upstream failures are explicit; search results show movement metadata and GIF when available. |
| AI Coach | Python backend streams from a server-selected OpenAI or Ollama provider. | Keys stay in the Python service; selected provider has clear unavailable/error responses. |
| Accessibility | Core controls have labels, visible focus, and status/error announcements. | Keyboard navigation can reach auth, plan, quiz, theme, and room actions. |

## 8. Data and privacy requirements

- Firebase client config values are public web-app identifiers; provider secrets and model/API keys remain server-side or in Firebase Console.
- Do not collect assessment measurements unless users can skip them and understand where their answers go.
- Current assessment, meal, and workout state is page-session-only; do not describe it as account-synced.
- Do not record, transmit, or persist camera/microphone data in the current room preview.
- AI prompts are sent to the configured external model provider. Avoid collecting sensitive health data.
- Review ExerciseDB, YouTube, Firebase, OpenAI, and Ollama terms and applicable privacy laws before launch.

## 9. Success indicators

- Guest dashboard route loads without an auth redirect.
- Users can find the signup and login routes and receive actionable setup/provider errors.
- Plan-detail open rate and assessment completion can be measured after analytics/privacy consent is designed.
- No camera/microphone access occurs before the explicit Join action.
- API configuration, provider failures, and empty search results are surfaced instead of fabricated as live data.

## 10. Launch dependencies

- Firebase project, authorized domains, enabled providers, email templates, and OAuth provider credentials.
- RapidAPI ExerciseDB subscription and review of redistribution/attribution requirements.
- OpenAI and/or Ollama API key, selected model availability, budget controls, and monitoring.
- Production media/signaling infrastructure before enabling real group video.
- Qualified exercise-content review, privacy notice, accessibility testing, security review, and legal review.
