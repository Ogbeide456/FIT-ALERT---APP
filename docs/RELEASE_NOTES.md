# Fitalert Release Notes

## Unreleased — Prototype feature update

### Added

- Public guest dashboard at `/dashboard`; `/` directs to `/signup`.
- Dedicated `/signup` and `/login` screens wired to Firebase email/password and redirect sign-in for Google, Microsoft, and Apple.
- Site-wide persistent light/dark theme toggle.
- Interactive workout plan details with plan-specific exercise lists and session cues.
- Multi-step, optional fitness assessment for goals, training use/location, exercise experience, physique priorities, preferred features, and app feedback.
- Explicit camera/microphone permission request and local video preview for workout-room entry; tracks can be toggled and stopped on leave.
- Python AI provider selection for OpenAI or Ollama through their official SDKs.
- Product requirements, draft user agreement, release notes, and architecture documentation under `docs/`.

### Changed

- ExerciseDB browsing now works in guest mode; RapidAPI credentials remain server-side.
- Firebase replaces Better Auth, MongoDB, and SMTP-based account flows.
- AI coach interface identifies its server-selected provider instead of implying Ollama is the only supported model.

### Known limitations

- Firebase project settings and provider credentials are not included. Email verification subject configuration is performed in Firebase Console.
- Real group calls are not enabled: the room only captures a local preview and does not send media to peers.
- Assessment answers, workouts, and nutrition entries are not persisted to a user profile.
- Third-party API data, creator lists, model output, and calorie values require independent review and are not guaranteed complete or accurate.
- The linked MadMuscles quiz could not be retrieved by the research browser; this assessment is an original flow based on the requested question areas, not a reproduction.
