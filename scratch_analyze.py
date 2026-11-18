import json

with open("public/exercises.json", "r", encoding="utf-8") as f:
    data = json.load(f)

exercises = data["exercises"]
print(f"Total exercises: {len(exercises)}")
first = exercises[0]
print("Keys of an exercise:", list(first.keys()))
print("First exercise sample:", json.dumps(first, indent=2))
