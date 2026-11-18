import json

with open("public/exercises.json", "r", encoding="utf-8") as f:
    data = json.load(f)

exercises = data["exercises"]

# Let's inspect all 708 exercises
print(f"Total exercises: {len(exercises)}")

# Function to detect pattern and equipment
def classify_exercise(e):
    name = (e.get("name_en") or "").lower()
    eid = (e.get("id") or "").lower()
    desc = (e.get("description_en") or "").lower()
    cat = (e.get("category") or "").lower()
    bp = (e.get("body_part") or "").lower()
    muscles = " ".join(e.get("primary_muscles") or []).lower()
    tags = " ".join(e.get("tags") or []).lower()
    is_bw = e.get("is_bodyweight", False)
    all_text = f"{name} {eid} {desc} {cat} {bp} {muscles} {tags}"

    # 1. Ab Wheel / Rollout
    if "ab wheel" in all_text or "wheel rollout" in all_text or "rollout" in all_text:
        return "ab_wheel_rollout", "ab_wheel", "workout_mat"

    # 2. Calf raises
    if "calf" in all_text and ("raise" in all_text or "press" in all_text):
        eq = "dumbbell" if "dumbbell" in all_text else "barbell" if "barbell" in all_text else "none"
        return "calf_raise", eq, "floor"

    # 3. Leg Extension / Leg Curl
    if "leg curl" in all_text or "hamstring curl" in all_text:
        return "leg_curl", "gym_machine", "floor"
    if "leg extension" in all_text:
        return "leg_extension", "gym_machine", "floor"
    if "leg press" in all_text:
        return "leg_press", "gym_machine", "floor"

    # 4. Cable Crossover / Cable Fly / Pec Deck / Chest Fly
    if "cable fly" in all_text or "chest fly" in all_text or "cable crossover" in all_text or "pec fly" in all_text or "pec deck" in all_text or ("fly" in all_text and ("chest" in all_text or "cable" in all_text or "dumbbell" in all_text)):
        if "cable" in all_text or "crossover" in all_text:
            return "cable_fly", "cable_stand_dual", "floor"
        elif "bench" in all_text or "incline" in all_text or "flat" in all_text:
            return "dumbbell_fly", "dumbbell", "gym_bench"
        return "cable_fly", "cable_stand_dual", "floor"

    # 5. Reverse Fly / Rear Delt Fly
    if "reverse fly" in all_text or "rear delt" in all_text:
        return "reverse_fly", "dumbbell", "floor"

    # 6. Lateral Raise / Front Raise / Upright Row / Shrug
    if "lateral raise" in all_text or "side raise" in all_text:
        return "lateral_raise", "dumbbell", "floor"
    if "front raise" in all_text:
        return "front_raise", "dumbbell", "floor"
    if "upright row" in all_text:
        return "upright_row", "barbell" if "barbell" in all_text else "dumbbell", "floor"
    if "shrug" in all_text:
        return "shrug", "barbell" if "barbell" in all_text else "dumbbell", "floor"

    # 7. Floor Abdominals & Core
    if "sit-up" in all_text or "situp" in all_text or "sit up" in all_text:
        return "sit_up", "none", "workout_mat"
    if "bicycle crunch" in all_text:
        return "bicycle_crunch", "none", "workout_mat"
    if "russian twist" in all_text or "twist" in all_text:
        return "russian_twist", "kettlebell" if "kettlebell" in all_text else "none", "workout_mat"
    if "hanging leg" in all_text or "hanging knee" in all_text:
        return "hanging_leg_raise", "pullup_bar", "floor"
    if "leg raise" in all_text or "lying leg" in all_text:
        return "lying_leg_raise", "none", "workout_mat"
    if "crunch" in all_text:
        return "crunch", "none", "workout_mat"
    if "mountain climber" in all_text:
        return "mountain_climber", "none", "workout_mat"
    if "plank" in all_text:
        return "plank", "none", "workout_mat"
    if "glute bridge" in all_text or "hip thrust" in all_text:
        return "glute_bridge", "barbell" if "barbell" in all_text else "none", "workout_mat" if "bridge" in all_text else "gym_bench"

    # 8. Triceps
    if "tricep" in all_text or "skull crusher" in all_text or "skullcrusher" in all_text or "kickback" in all_text or "pushdown" in all_text or "overhead extension" in all_text:
        if "pushdown" in all_text or "cable" in all_text:
            return "tricep_pushdown", "cable_lat_bar", "floor"
        if "kickback" in all_text:
            return "tricep_kickback", "dumbbell", "floor"
        if "skull" in all_text or "lying" in all_text:
            return "skull_crusher", "barbell" if "barbell" in all_text else "dumbbell", "gym_bench"
        return "tricep_overhead_extension", "dumbbell" if "dumbbell" in all_text else "cable_lat_bar", "floor"

    # 9. Biceps & Forearms
    if "curl" in all_text or "bicep" in all_text:
        eq = "barbell" if "barbell" in all_text else "cable_lat_bar" if "cable" in all_text else "dumbbell"
        if "hammer" in all_text:
            return "hammer_curl", "dumbbell", "floor"
        if "preacher" in all_text:
            return "preacher_curl", eq, "gym_bench"
        if "concentration" in all_text:
            return "concentration_curl", "dumbbell", "gym_bench"
        if "wrist" in all_text:
            return "wrist_curl", eq, "gym_bench"
        return "bicep_curl", eq, "floor"

    # 10. Chest Presses & Pushups
    if "push-up" in all_text or "pushup" in all_text:
        return "push_up", "none", "workout_mat"
    if "dip" in all_text:
        return "dips", "dip_bars", "floor"
    if "bench press" in all_text or "chest press" in all_text or (("press" in all_text) and ("chest" in all_text or "pectoral" in all_text or "incline" in all_text or "decline" in all_text)):
        eq = "dumbbell" if "dumbbell" in all_text else "barbell"
        return "bench_press", eq, "gym_bench"

    # 11. Shoulders & Overhead Press
    if "overhead press" in all_text or "shoulder press" in all_text or "military press" in all_text or "arnold press" in all_text or (("press" in all_text) and ("shoulder" in all_text or "deltoid" in all_text)):
        eq = "dumbbell" if "dumbbell" in all_text else "barbell"
        return "overhead_press", eq, "floor"

    # 12. Back & Pulling (Pull-ups, Lat Pulldowns, Rows)
    if "pull-up" in all_text or "chin-up" in all_text or "pullup" in all_text or "chinup" in all_text:
        return "pull_up", "pullup_bar", "floor"
    if "pulldown" in all_text or "lat pull" in all_text:
        return "lat_pulldown", "cable_lat_bar", "floor"
    if "face pull" in all_text:
        return "face_pull", "cable_lat_bar", "floor"
    if "row" in all_text:
        eq = "dumbbell" if "dumbbell" in all_text else "barbell"
        if "seated" in all_text or "cable" in all_text:
            return "seated_cable_row", "cable_lat_bar", "floor"
        return "bent_over_row", eq, "floor"

    # 13. Deadlifts & Hip Hinges
    if "deadlift" in all_text or "rdl" in all_text or "good morning" in all_text or "back extension" in all_text:
        eq = "kettlebell" if "kettlebell" in all_text else "dumbbell" if "dumbbell" in all_text else "barbell"
        return "deadlift", eq, "floor"

    # 14. Kettlebell movements
    if "swing" in all_text or "snatch" in all_text or "clean" in all_text or "kettlebell" in all_text:
        return "kettlebell_swing", "kettlebell", "floor"

    # 15. Lunges & Step-ups
    if "lunge" in all_text or "split squat" in all_text or "step up" in all_text or "step-up" in all_text or "bulgarian" in all_text:
        eq = "dumbbell" if "dumbbell" in all_text else "barbell" if "barbell" in all_text else "none"
        return "lunge", eq, "floor"

    # 16. Foam Rolling & Mobility
    if "foam roll" in all_text or "roller" in all_text or "rolling" in all_text:
        return "foam_rolling", "foam_roller", "workout_mat"
    if "stretch" in all_text or "yoga" in all_text or "mobility" in all_text or "hold" in all_text or "pose" in all_text:
        return "stretch", "none", "workout_mat"

    # 17. Cardio & Plyometrics
    if "burpee" in all_text:
        return "burpee", "none", "workout_mat"
    if "jumping jack" in all_text or "jump" in all_text or "hop" in all_text:
        return "jumping_jack", "none", "floor"

    # 18. Squats
    if "squat" in all_text:
        eq = "kettlebell" if "goblet" in all_text or "kettlebell" in all_text else "dumbbell" if "dumbbell" in all_text else "none" if is_bw else "barbell"
        return "squat", eq, "floor"

    # Fallback based on primary muscle & body part
    if bp == "core" or bp == "waist":
        return "crunch", "none", "workout_mat"
    if bp == "chest":
        return "push_up", "none", "workout_mat"
    if bp == "back":
        return "bent_over_row", "barbell", "floor"
    if bp == "shoulders":
        return "lateral_raise", "dumbbell", "floor"
    if bp == "upper_arms":
        if "triceps" in muscles:
            return "tricep_overhead_extension", "dumbbell", "floor"
        return "bicep_curl", "dumbbell", "floor"
    if bp == "upper_legs" or bp == "lower_legs":
        return "squat", "none" if is_bw else "barbell", "floor"

    return "squat", "none" if is_bw else "barbell", "floor"

pattern_counts = {}
sample_by_pattern = {}

for ex in exercises:
    pat, eq, surf = classify_exercise(ex)
    pattern_counts[pat] = pattern_counts.get(pat, 0) + 1
    if pat not in sample_by_pattern:
        sample_by_pattern[pat] = []
    if len(sample_by_pattern[pat]) < 3:
        sample_by_pattern[pat].append((ex["id"], ex["name_en"], eq, surf))

print("\n--- All 708 Exercises Classification ---")
total_mapped = 0
for p, c in sorted(pattern_counts.items(), key=lambda x: -x[1]):
    print(f"  {p}: {c} exercises")
    total_mapped += c

print(f"\nTotal mapped: {total_mapped} / {len(exercises)}")
print("\nSamples by pattern:")
for p, samples in sorted(sample_by_pattern.items()):
    print(f"\n[{p}] ({pattern_counts[p]} exercises):")
    for s in samples:
        print(f"   -> {s[0]}: '{s[1]}' | Eq: {s[2]} | Surf: {s[3]}")
