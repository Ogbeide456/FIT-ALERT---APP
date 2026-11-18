"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  createBarbell,
  createDumbbell,
  createKettlebell,
  createPullUpBar,
  createDipBars,
  createParallettes,
  createResistanceBand,
  createFoamRoller,
  createGymBench,
  createCablePulldownBar,
  createWorkoutMat,
  createCableStandDual,
} from "./Exercise3DEquipment";

/**
 * Detects the specific kinematic movement pattern for an exercise
 */
function detectExercisePattern(exercise) {
  if (!exercise) return "squat";
  const text = `${exercise.name || ""} ${exercise.id || ""} ${exercise.category || ""} ${exercise.bodyPart || ""} ${(exercise.primaryMuscles || []).join(" ")} ${(exercise.tags || []).join(" ")}`.toLowerCase();

  // Floor Mat Abdominal Movements
  if (text.includes("sit-up") || text.includes("situp") || text.includes("sit up")) {
    return "sit_up";
  }
  if (text.includes("bicycle crunch")) {
    return "bicycle_crunch";
  }
  if (text.includes("glute bridge") || text.includes("hip thrust") || text.includes("bridge")) {
    return "glute_bridge";
  }

  // Cable Machine Flys & Staggered Stands
  if (text.includes("cable fly") || text.includes("chest fly") || text.includes("cable crossover") || text.includes("pec fly") || (text.includes("fly") && text.includes("cable"))) {
    return "cable_fly";
  }

  // Curls
  if (text.includes("curl") && !text.includes("leg curl")) {
    if (text.includes("hammer")) return "hammer_curl";
    return "bicep_curl";
  }

  // Bench & Horizontal Press
  if (text.includes("bench press") || text.includes("chest press") || text.includes("incline-db-press") || (text.includes("press") && (text.includes("bench") || text.includes("chest") || text.includes("pectoralis")))) {
    return "bench_press";
  }

  // Overhead & Shoulder Press
  if (text.includes("overhead press") || text.includes("military press") || text.includes("shoulder press") || text.includes("arnold press") || (text.includes("press") && (text.includes("shoulder") || text.includes("deltoid")))) {
    return "overhead_press";
  }

  // Lateral & Front Raises
  if (text.includes("lateral raise") || text.includes("side raise")) return "lateral_raise";
  if (text.includes("front raise")) return "front_raise";
  if (text.includes("shrug")) return "shrug";

  // Triceps Extension / Pushdown
  if (text.includes("tricep") && (text.includes("pushdown") || text.includes("extension") || text.includes("skull"))) {
    return "tricep_extension";
  }

  // Pull-Up & Chin-Up
  if (text.includes("pull-up") || text.includes("chin-up") || text.includes("pull up") || text.includes("chin up")) {
    return "pull_up";
  }

  // Lat Pulldown
  if (text.includes("pulldown") || text.includes("lat pull")) {
    return "lat_pulldown";
  }

  // Rows
  if (text.includes("row")) {
    return "bent_over_row";
  }

  // Dips
  if (text.includes("dip")) {
    return "dips";
  }

  // Push-Ups
  if (text.includes("push-up") || text.includes("pushup")) {
    return "push_up";
  }

  // Deadlift & Romanian Deadlift
  if (text.includes("deadlift") || text.includes("rdl") || text.includes("good morning")) {
    return "deadlift";
  }

  // Kettlebell Swing
  if (text.includes("swing") || text.includes("kettlebell swing")) {
    return "kettlebell_swing";
  }

  // Lunges & Split Squats
  if (text.includes("lunge") || text.includes("split squat") || text.includes("step up")) {
    return "lunge";
  }

  // Leg Extensions & Leg Curls
  if (text.includes("leg curl") || text.includes("hamstring curl")) return "leg_curl";
  if (text.includes("leg press")) return "leg_press";
  if (text.includes("calf raise")) return "calf_raise";

  // Face Pull
  if (text.includes("face pull")) return "face_pull";

  // Foam Rolling
  if (text.includes("foam roll") || text.includes("roller")) return "foam_rolling";

  // Core: Planks, Crunches, Russian Twists
  if (text.includes("russian twist") || text.includes("twist")) return "russian_twist";
  if (text.includes("plank") || text.includes("bear plank")) return "plank";
  if (text.includes("crunch") || text.includes("sit-up") || text.includes("situp")) return "crunch";
  if (text.includes("leg raise") || text.includes("hanging leg")) return "hanging_leg_raise";

  // Cardio: Burpees, Jumping Jacks, Mountain Climbers
  if (text.includes("burpee")) return "burpee";
  if (text.includes("jumping jack") || text.includes("jump")) return "jumping_jack";
  if (text.includes("mountain climber") || text.includes("climber")) return "mountain_climber";

  // Stretching & Mobility
  if (text.includes("stretch") || text.includes("yoga") || text.includes("mobility") || text.includes("cat-cow") || text.includes("child's pose")) {
    return "stretch";
  }

  // Squats (default lower body)
  if (text.includes("squat")) return "squat";

  return "squat";
}

/**
 * Detects what equipment and surface should be rendered in 3D
 */
function detectEquipmentAndSurface(exercise, pattern) {
  if (!exercise) return { equipment: "none", surface: "floor" };
  const text = `${exercise.name || ""} ${exercise.id || ""} ${(exercise.tags || []).join(" ")}`.toLowerCase();

  // Floor Mat Exercises
  const isFloorExercise = [
    "sit_up",
    "crunch",
    "bicycle_crunch",
    "plank",
    "push_up",
    "glute_bridge",
    "mountain_climber",
    "burpee",
    "foam_rolling",
    "russian_twist",
  ].includes(pattern) || text.includes("floor") || text.includes("mat");

  const surface = isFloorExercise ? "workout_mat" : pattern === "bench_press" ? "gym_bench" : "floor";

  if (pattern === "cable_fly") return { equipment: "cable_stand_dual", surface: "floor" };
  if (pattern === "pull_up") return { equipment: "pullup_bar", surface: "floor" };
  if (pattern === "dips") return { equipment: "dip_bars", surface: "floor" };
  if (pattern === "foam_rolling") return { equipment: "foam_roller", surface: "workout_mat" };
  if (pattern === "lat_pulldown" || pattern === "face_pull") return { equipment: "cable_lat_bar", surface: "floor" };

  if (text.includes("parallette")) return { equipment: "parallettes", surface: "floor" };

  if (pattern === "bench_press") {
    if (text.includes("dumbbell") || text.includes("db")) return { equipment: "dumbbell", surface: "gym_bench" };
    return { equipment: "barbell", surface: "gym_bench" };
  }

  if (text.includes("kettlebell") || text.includes("kb ") || pattern === "kettlebell_swing") {
    return { equipment: "kettlebell", surface };
  }

  if (text.includes("band") || text.includes("banded")) {
    return { equipment: "resistance_band", surface };
  }

  if (text.includes("barbell") || text.includes("smith") || text.includes("ez-bar") || text.includes("trap bar") || pattern === "deadlift" || pattern === "squat") {
    if (!text.includes("dumbbell") && !exercise.isBodyweight) {
      return { equipment: "barbell", surface };
    }
  }

  if (text.includes("dumbbell") || text.includes("db ") || pattern === "lateral_raise" || pattern === "hammer_curl") {
    return { equipment: "dumbbell", surface };
  }

  if (pattern === "bicep_curl" || pattern === "bent_over_row" || pattern === "overhead_press") {
    return { equipment: text.includes("barbell") ? "barbell" : "dumbbell", surface };
  }

  return { equipment: "none", surface };
}

function makeBone(scene, material, radius) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 1, 16), material);
  scene.add(mesh);
  return mesh;
}

function poseBone(mesh, start, end) {
  const direction = new THREE.Vector3().subVectors(end, start);
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  const len = direction.length();
  mesh.scale.set(1, Math.max(len, 0.001), 1);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
}

function makeJoint(scene, material, radius = 0.075) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12), material);
  scene.add(mesh);
  return mesh;
}

function placeJoint(mesh, point) {
  mesh.position.copy(point);
}

export default function Exercise3DViewer({ exercise, height = 300 }) {
  const mountRef = useRef(null);
  const [unavailable, setUnavailable] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [slowMo, setSlowMo] = useState(false);
  const isPlayingRef = useRef(true);
  const slowMoRef = useRef(false);

  const pattern = detectExercisePattern(exercise);
  const { equipment, surface } = detectEquipmentAndSurface(exercise, pattern);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    slowMoRef.current = slowMo;
  }, [slowMo]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      setUnavailable(true);
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1, 40);

    // Optimized camera viewpoint for each exercise category & posture
    if (pattern === "sit_up" || pattern === "crunch" || pattern === "bicycle_crunch" || pattern === "glute_bridge") {
      camera.position.set(2.4, 1.4, 2.2);
      camera.lookAt(0, 0.28, 0);
    } else if (pattern === "push_up" || pattern === "plank" || pattern === "mountain_climber" || pattern === "foam_rolling") {
      camera.position.set(2.5, 1.5, 2.6);
      camera.lookAt(0, 0.32, 0);
    } else if (pattern === "bench_press") {
      camera.position.set(2.4, 1.7, 3.1);
      camera.lookAt(0, 0.65, 0);
    } else if (pattern === "cable_fly") {
      camera.position.set(2.8, 1.9, 3.8);
      camera.lookAt(0, 1.25, 0);
    } else if (pattern === "pull_up") {
      camera.position.set(2.6, 2.3, 3.9);
      camera.lookAt(0, 1.5, 0);
    } else {
      camera.position.set(2.6, 2.0, 3.9);
      camera.lookAt(0, 1.05, 0);
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    mount.replaceChildren(renderer.domElement);

    // Studio Lighting
    scene.add(new THREE.HemisphereLight(0xedf2f7, 0x1a202c, 2.6));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.8);
    keyLight.position.set(-2.8, 5.2, 4.0);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xa594fd, 18, 9);
    rimLight.position.set(2.5, 2.2, -2.0);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x90caf9, 1.6);
    fillLight.position.set(2.0, -1.0, 2.0);
    scene.add(fillLight);

    // Human Anatomy Materials
    const skin = new THREE.MeshStandardMaterial({ color: 0xd79c83, roughness: 0.52 });
    const shirt = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.42, metalness: 0.12 });
    const shorts = new THREE.MeshStandardMaterial({ color: 0x1e1e2f, roughness: 0.65 });
    const shoes = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35 });
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x171923, roughness: 0.8, metalness: 0.2 });

    // Circular Ground Platform
    const ground = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.35, 0.04, 48), groundMaterial);
    ground.position.y = -0.02;
    scene.add(ground);

    const groundRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.25, 0.008, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.5 })
    );
    groundRing.rotation.x = Math.PI / 2;
    groundRing.position.y = 0.005;
    scene.add(groundRing);

    // Render Surface (Workout Mat or Bench)
    let eqMat = null;
    let eqGymBench = null;

    if (surface === "workout_mat") {
      eqMat = createWorkoutMat();
      scene.add(eqMat);
    } else if (surface === "gym_bench") {
      eqGymBench = createGymBench();
      scene.add(eqGymBench);
    }

    // Human Anatomy Meshes
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.40, 6, 16), shirt);
    scene.add(torso);
    const pelvis = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.12, 4, 12), shorts);
    scene.add(pelvis);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 18), skin);
    scene.add(head);
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.134, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.48),
      new THREE.MeshStandardMaterial({ color: 0x241d30, roughness: 0.85 })
    );
    scene.add(hair);

    const boneMeshes = {
      thighLeft: makeBone(scene, skin, 0.072),
      thighRight: makeBone(scene, skin, 0.072),
      shinLeft: makeBone(scene, skin, 0.062),
      shinRight: makeBone(scene, skin, 0.062),
      upperArmLeft: makeBone(scene, shirt, 0.056),
      upperArmRight: makeBone(scene, shirt, 0.056),
      forearmLeft: makeBone(scene, skin, 0.044),
      forearmRight: makeBone(scene, skin, 0.044),
    };

    const joints = [
      makeJoint(scene, skin, 0.07), makeJoint(scene, skin, 0.07),
      makeJoint(scene, skin, 0.058), makeJoint(scene, skin, 0.058),
      makeJoint(scene, skin, 0.05), makeJoint(scene, skin, 0.05),
      makeJoint(scene, skin, 0.046), makeJoint(scene, skin, 0.046),
    ];

    const feet = [-1, 1].map((side) => {
      const foot = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.15, 4, 10), shoes);
      foot.rotation.x = Math.PI / 2;
      foot.position.set(side * 0.16, 0.06, 0.05);
      scene.add(foot);
      return foot;
    });

    // 3D Equipment Setup in Scene
    let eqBarbell = null;
    let eqDumbbellLeft = null;
    let eqDumbbellRight = null;
    let eqKettlebell = null;
    let eqPullUpBar = null;
    let eqDipBars = null;
    let eqParallettes = null;
    let eqResistanceBand = null;
    let eqFoamRoller = null;
    let eqLatBar = null;
    let eqCableStand = null;
    let cableLineLeft = null;
    let cableLineRight = null;

    if (equipment === "barbell") {
      eqBarbell = createBarbell();
      scene.add(eqBarbell);
    }
    if (equipment === "dumbbell") {
      eqDumbbellLeft = createDumbbell();
      eqDumbbellRight = createDumbbell();
      scene.add(eqDumbbellLeft);
      scene.add(eqDumbbellRight);
    }
    if (equipment === "kettlebell") {
      eqKettlebell = createKettlebell();
      scene.add(eqKettlebell);
    }
    if (equipment === "pullup_bar") {
      eqPullUpBar = createPullUpBar();
      scene.add(eqPullUpBar);
    }
    if (equipment === "dip_bars") {
      eqDipBars = createDipBars();
      scene.add(eqDipBars);
    }
    if (equipment === "parallettes") {
      eqParallettes = createParallettes();
      scene.add(eqParallettes);
    }
    if (equipment === "resistance_band") {
      eqResistanceBand = createResistanceBand();
      scene.add(eqResistanceBand);
    }
    if (equipment === "foam_roller") {
      eqFoamRoller = createFoamRoller();
      scene.add(eqFoamRoller);
    }
    if (equipment === "cable_lat_bar") {
      eqLatBar = createCablePulldownBar();
      scene.add(eqLatBar);
    }
    if (equipment === "cable_stand_dual") {
      eqCableStand = createCableStandDual();
      scene.add(eqCableStand);

      // Create Dynamic Cable Lines connecting towers to hands
      const cableMat = new THREE.LineBasicMaterial({ color: 0xd8d8d8, linewidth: 2 });
      const geomL = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.0, 1.52, 0), new THREE.Vector3(0, 1.4, 0)]);
      const geomR = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(1.0, 1.52, 0), new THREE.Vector3(0, 1.4, 0)]);
      cableLineLeft = new THREE.Line(geomL, cableMat);
      cableLineRight = new THREE.Line(geomR, cableMat);
      scene.add(cableLineLeft);
      scene.add(cableLineRight);
    }

    const vector = (x, y, z) => new THREE.Vector3(x, y, z);
    const lerpPoint = (p1, p2, t) => p1.clone().lerp(p2, t);

    // KINEMATICS POSE CALCULATOR (Derived from OpenCV & MediaPipe Video Form Tracking)
    const applyPose = (progress) => {
      let hip, shoulder, kneeL, kneeR, ankleL, ankleR, elbowL, elbowR, wristL, wristR;

      // 1. SIT-UP (Floor Mat Biomechanics)
      if (pattern === "sit_up") {
        hip = vector(0, 0.08, 0);
        kneeL = vector(-0.16, 0.28, 0.38);
        kneeR = vector(0.16, 0.28, 0.38);
        ankleL = vector(-0.16, 0.06, 0.65);
        ankleR = vector(0.16, 0.06, 0.65);

        // Torso curls from flat supine to 75 deg upright seated flexion
        shoulder = lerpPoint(vector(0, 0.09, -0.48), vector(0, 0.62, 0.12), progress);
        elbowL = lerpPoint(vector(-0.22, 0.16, -0.42), vector(-0.18, 0.58, 0.26), progress);
        elbowR = lerpPoint(vector(0.22, 0.16, -0.42), vector(0.18, 0.58, 0.26), progress);
        wristL = lerpPoint(vector(-0.14, 0.24, -0.32), vector(-0.10, 0.64, 0.22), progress);
        wristR = lerpPoint(vector(0.14, 0.24, -0.32), vector(0.10, 0.64, 0.22), progress);
      }
      // 2. CABLE CHEST FLYS (Dual Cable Stand Machine)
      else if (pattern === "cable_fly") {
        hip = vector(0, 0.98, 0);
        shoulder = lerpPoint(vector(0, 1.62, 0.05), vector(0, 1.62, 0.08), progress);
        kneeL = vector(-0.16, 0.52, 0.15);
        kneeR = vector(0.16, 0.52, -0.15);
        ankleL = vector(-0.16, 0.12, 0.22);
        ankleR = vector(0.16, 0.12, -0.25);

        // Arms sweep forward in wide horizontal adduction meeting in front of chest
        elbowL = lerpPoint(vector(-0.58, 1.48, 0.05), vector(-0.24, 1.48, 0.45), progress);
        elbowR = lerpPoint(vector(0.58, 1.48, 0.05), vector(0.24, 1.48, 0.45), progress);
        wristL = lerpPoint(vector(-0.68, 1.42, 0.15), vector(-0.07, 1.42, 0.55), progress);
        wristR = lerpPoint(vector(0.68, 1.42, 0.15), vector(0.07, 1.42, 0.55), progress);

        // Update Dynamic Cables from Pulleys to Wrists
        if (cableLineLeft && cableLineRight) {
          cableLineLeft.geometry.setFromPoints([new THREE.Vector3(-1.05, 1.52, 0), wristL]);
          cableLineRight.geometry.setFromPoints([new THREE.Vector3(1.05, 1.52, 0), wristR]);
        }
      }
      // 3. BICYCLE CRUNCH (Floor Mat)
      else if (pattern === "bicycle_crunch") {
        hip = vector(0, 0.08, 0);
        ankleL = lerpPoint(vector(-0.18, 0.25, 0.48), vector(-0.18, 0.12, 0.85), progress);
        ankleR = lerpPoint(vector(0.18, 0.12, 0.85), vector(0.18, 0.25, 0.48), progress);
        kneeL = lerpPoint(vector(-0.18, 0.35, 0.22), vector(-0.18, 0.18, 0.55), progress);
        kneeR = lerpPoint(vector(0.18, 0.18, 0.55), vector(0.18, 0.35, 0.22), progress);

        shoulder = lerpPoint(vector(-0.06, 0.18, -0.42), vector(0.06, 0.18, -0.42), progress);
        elbowL = lerpPoint(vector(-0.12, 0.26, -0.15), vector(-0.24, 0.18, -0.40), progress);
        elbowR = lerpPoint(vector(0.24, 0.18, -0.40), vector(0.12, 0.26, -0.15), progress);
        wristL = lerpPoint(vector(-0.10, 0.30, -0.32), vector(-0.12, 0.22, -0.42), progress);
        wristR = lerpPoint(vector(0.12, 0.22, -0.42), vector(0.10, 0.30, -0.32), progress);
      }
      // 4. GLUTE BRIDGE / HIP THRUST (Floor Mat)
      else if (pattern === "glute_bridge") {
        shoulder = vector(0, 0.10, -0.52);
        kneeL = vector(-0.16, 0.42, 0.28);
        kneeR = vector(0.16, 0.42, 0.28);
        ankleL = vector(-0.16, 0.06, 0.42);
        ankleR = vector(0.16, 0.06, 0.42);
        elbowL = vector(-0.28, 0.08, -0.25);
        elbowR = vector(0.28, 0.08, -0.25);
        wristL = vector(-0.28, 0.06, 0.05);
        wristR = vector(0.28, 0.06, 0.05);

        // Hips drive to full pelvic extension
        hip = lerpPoint(vector(0, 0.10, 0), vector(0, 0.44, 0), progress);
      }
      // 5. FOAM ROLLING (Floor Mat + Roller)
      else if (pattern === "foam_rolling") {
        ankleL = vector(-0.18, 0.06, 0.60);
        ankleR = vector(0.18, 0.06, 0.60);
        kneeL = vector(-0.18, 0.32, 0.35);
        kneeR = vector(0.18, 0.32, 0.35);

        // Body rolls along cylindrical roller
        hip = lerpPoint(vector(0, 0.18, 0.25), vector(0, 0.18, -0.15), progress);
        shoulder = lerpPoint(vector(0, 0.22, -0.25), vector(0, 0.22, -0.65), progress);
        elbowL = lerpPoint(vector(-0.22, 0.35, -0.25), vector(-0.22, 0.35, -0.65), progress);
        elbowR = lerpPoint(vector(0.22, 0.35, -0.25), vector(0.22, 0.35, -0.65), progress);
        wristL = lerpPoint(vector(-0.12, 0.38, -0.15), vector(-0.12, 0.38, -0.55), progress);
        wristR = lerpPoint(vector(0.12, 0.38, -0.15), vector(0.12, 0.38, -0.55), progress);

        if (eqFoamRoller) {
          eqFoamRoller.position.set(0, 0.075, lerpPoint(vector(0, 0, 0), vector(0, 0, -0.4), progress).z);
        }
      }
      // 6. BICEP & HAMMER CURLS
      else if (pattern === "bicep_curl" || pattern === "hammer_curl") {
        hip = vector(0, 0.98, 0);
        shoulder = vector(0, 1.62, 0);
        kneeL = vector(-0.16, 0.52, 0.02);
        kneeR = vector(0.16, 0.52, 0.02);
        ankleL = vector(-0.16, 0.12, 0.02);
        ankleR = vector(0.16, 0.12, 0.02);
        elbowL = vector(-0.25, 1.30, 0.06);
        elbowR = vector(0.25, 1.30, 0.06);
        wristL = lerpPoint(vector(-0.22, 0.92, 0.10), vector(-0.20, 1.38, 0.28), progress);
        wristR = lerpPoint(vector(0.22, 0.92, 0.10), vector(0.20, 1.38, 0.28), progress);

        if (eqBarbell) {
          eqBarbell.position.set(0, wristL.y, wristL.z);
          eqBarbell.rotation.set(0, 0, 0);
        }
        if (eqDumbbellLeft && eqDumbbellRight) {
          eqDumbbellLeft.position.copy(wristL);
          eqDumbbellRight.position.copy(wristR);
        }
      }
      // 7. BENCH PRESS (Gym Bench)
      else if (pattern === "bench_press") {
        hip = vector(0, 0.52, -0.05);
        shoulder = vector(0, 0.52, -0.52);
        kneeL = vector(-0.24, 0.48, 0.28);
        kneeR = vector(0.24, 0.48, 0.28);
        ankleL = vector(-0.26, 0.10, 0.35);
        ankleR = vector(0.26, 0.10, 0.35);
        elbowL = lerpPoint(vector(-0.35, 0.46, -0.32), vector(-0.22, 0.88, -0.32), progress);
        elbowR = lerpPoint(vector(0.35, 0.46, -0.32), vector(0.22, 0.88, -0.32), progress);
        wristL = lerpPoint(vector(-0.28, 0.68, -0.32), vector(-0.18, 1.15, -0.32), progress);
        wristR = lerpPoint(vector(0.28, 0.68, -0.32), vector(0.18, 1.15, -0.32), progress);

        if (eqBarbell) {
          eqBarbell.position.set(0, wristL.y, -0.32);
          eqBarbell.rotation.set(0, 0, 0);
        }
        if (eqDumbbellLeft && eqDumbbellRight) {
          eqDumbbellLeft.position.copy(wristL);
          eqDumbbellRight.position.copy(wristR);
        }
      }
      // 8. OVERHEAD PRESS
      else if (pattern === "overhead_press") {
        hip = vector(0, 0.98, 0);
        shoulder = vector(0, 1.62, 0);
        kneeL = vector(-0.16, 0.52, 0.02);
        kneeR = vector(0.16, 0.52, 0.02);
        ankleL = vector(-0.16, 0.12, 0.02);
        ankleR = vector(0.16, 0.12, 0.02);
        elbowL = lerpPoint(vector(-0.28, 1.38, 0.10), vector(-0.20, 1.88, 0.02), progress);
        elbowR = lerpPoint(vector(0.28, 1.38, 0.10), vector(0.20, 1.88, 0.02), progress);
        wristL = lerpPoint(vector(-0.24, 1.55, 0.12), vector(-0.18, 2.18, 0.02), progress);
        wristR = lerpPoint(vector(0.24, 1.55, 0.12), vector(0.18, 2.18, 0.02), progress);

        if (eqBarbell) {
          eqBarbell.position.set(0, wristL.y, wristL.z);
        }
        if (eqDumbbellLeft && eqDumbbellRight) {
          eqDumbbellLeft.position.copy(wristL);
          eqDumbbellRight.position.copy(wristR);
        }
      }
      // 9. DEADLIFT & ROMANIAN DEADLIFT
      else if (pattern === "deadlift") {
        hip = lerpPoint(vector(0, 0.76, -0.32), vector(0, 0.99, 0), progress);
        shoulder = lerpPoint(vector(0, 1.10, 0.35), vector(0, 1.62, 0), progress);
        kneeL = lerpPoint(vector(-0.16, 0.46, -0.05), vector(-0.16, 0.52, 0.02), progress);
        kneeR = lerpPoint(vector(0.16, 0.46, -0.05), vector(0.16, 0.52, 0.02), progress);
        ankleL = vector(-0.16, 0.12, 0.02);
        ankleR = vector(0.16, 0.12, 0.02);
        elbowL = lerpPoint(vector(-0.26, 0.75, 0.32), vector(-0.26, 1.22, 0.06), progress);
        elbowR = lerpPoint(vector(0.26, 0.75, 0.32), vector(0.26, 1.22, 0.06), progress);
        wristL = lerpPoint(vector(-0.24, 0.32, 0.34), vector(-0.22, 0.90, 0.08), progress);
        wristR = lerpPoint(vector(0.24, 0.32, 0.34), vector(0.22, 0.90, 0.08), progress);

        if (eqBarbell) {
          eqBarbell.position.set(0, wristL.y, wristL.z);
        }
      }
      // 10. PULL-UP & CHIN-UP
      else if (pattern === "pull_up") {
        const barY = 2.15;
        wristL = vector(-0.32, barY, 0);
        wristR = vector(0.32, barY, 0);
        hip = lerpPoint(vector(0, 0.72, 0), vector(0, 1.25, 0.05), progress);
        shoulder = lerpPoint(vector(0, 1.38, 0), vector(0, 1.95, 0.05), progress);
        elbowL = lerpPoint(vector(-0.30, 1.82, 0), vector(-0.38, 1.62, -0.08), progress);
        elbowR = lerpPoint(vector(0.30, 1.82, 0), vector(0.38, 1.62, -0.08), progress);
        kneeL = lerpPoint(vector(-0.14, 0.28, -0.12), vector(-0.14, 0.80, -0.15), progress);
        kneeR = lerpPoint(vector(0.14, 0.28, -0.12), vector(0.14, 0.80, -0.15), progress);
        ankleL = lerpPoint(vector(-0.14, -0.05, -0.18), vector(-0.14, 0.45, -0.22), progress);
        ankleR = lerpPoint(vector(0.14, -0.05, -0.18), vector(0.14, 0.45, -0.22), progress);
      }
      // 11. DIPS
      else if (pattern === "dips") {
        const dipBarY = 1.08;
        wristL = vector(-0.31, dipBarY, 0);
        wristR = vector(0.31, dipBarY, 0);
        hip = lerpPoint(vector(0, 0.95, 0.05), vector(0, 0.62, 0.08), progress);
        shoulder = lerpPoint(vector(0, 1.55, 0.08), vector(0, 1.18, 0.12), progress);
        elbowL = lerpPoint(vector(-0.32, 1.25, 0.02), vector(-0.35, 1.05, -0.18), progress);
        elbowR = lerpPoint(vector(0.32, 1.25, 0.02), vector(0.35, 1.05, -0.18), progress);
        kneeL = lerpPoint(vector(-0.14, 0.52, -0.22), vector(-0.14, 0.20, -0.22), progress);
        kneeR = lerpPoint(vector(0.14, 0.52, -0.22), vector(0.14, 0.20, -0.22), progress);
        ankleL = lerpPoint(vector(-0.14, 0.32, -0.32), vector(-0.14, 0.02, -0.32), progress);
        ankleR = lerpPoint(vector(0.14, 0.32, -0.32), vector(0.14, 0.02, -0.32), progress);
      }
      // 12. PUSH-UP (Floor Mat)
      else if (pattern === "push_up") {
        hip = lerpPoint(vector(0, 0.45, -0.10), vector(0, 0.22, -0.10), progress);
        shoulder = lerpPoint(vector(0, 0.52, 0.42), vector(0, 0.28, 0.42), progress);
        kneeL = lerpPoint(vector(-0.15, 0.30, -0.48), vector(-0.15, 0.18, -0.48), progress);
        kneeR = lerpPoint(vector(0.15, 0.30, -0.48), vector(0.15, 0.18, -0.48), progress);
        ankleL = vector(-0.15, 0.12, -0.85);
        ankleR = vector(0.15, 0.12, -0.85);
        elbowL = lerpPoint(vector(-0.35, 0.42, 0.38), vector(-0.42, 0.24, 0.35), progress);
        elbowR = lerpPoint(vector(0.35, 0.42, 0.38), vector(0.42, 0.24, 0.35), progress);
        wristL = vector(-0.28, 0.06, 0.40);
        wristR = vector(0.28, 0.06, 0.40);
      }
      // 13. KETTLEBELL SWING
      else if (pattern === "kettlebell_swing") {
        hip = lerpPoint(vector(0, 0.78, -0.30), vector(0, 0.99, 0.05), progress);
        shoulder = lerpPoint(vector(0, 1.18, 0.32), vector(0, 1.62, 0), progress);
        kneeL = lerpPoint(vector(-0.16, 0.48, -0.05), vector(-0.16, 0.52, 0.02), progress);
        kneeR = lerpPoint(vector(0.16, 0.48, -0.05), vector(0.16, 0.52, 0.02), progress);
        ankleL = vector(-0.16, 0.12, 0.02);
        ankleR = vector(0.16, 0.12, 0.02);
        elbowL = lerpPoint(vector(-0.22, 0.85, 0.10), vector(-0.18, 1.52, 0.42), progress);
        elbowR = lerpPoint(vector(0.22, 0.85, 0.10), vector(0.18, 1.52, 0.42), progress);
        wristL = lerpPoint(vector(-0.06, 0.55, -0.08), vector(-0.06, 1.52, 0.65), progress);
        wristR = lerpPoint(vector(0.06, 0.55, -0.08), vector(0.06, 1.52, 0.65), progress);

        if (eqKettlebell) {
          eqKettlebell.position.set(0, wristL.y - 0.10, wristL.z);
          eqKettlebell.rotation.x = progress * Math.PI * 0.4;
        }
      }
      // 14. LUNGE
      else if (pattern === "lunge") {
        hip = lerpPoint(vector(0, 0.98, 0), vector(0, 0.64, 0.04), progress);
        shoulder = lerpPoint(vector(0, 1.62, 0), vector(0, 1.28, 0.04), progress);
        kneeL = lerpPoint(vector(-0.16, 0.52, 0.02), vector(-0.16, 0.48, 0.32), progress);
        kneeR = lerpPoint(vector(0.16, 0.52, 0.02), vector(0.16, 0.18, -0.35), progress);
        ankleL = lerpPoint(vector(-0.16, 0.12, 0.02), vector(-0.16, 0.12, 0.32), progress);
        ankleR = lerpPoint(vector(0.16, 0.12, 0.02), vector(0.16, 0.12, -0.42), progress);
        elbowL = lerpPoint(vector(-0.28, 1.24, 0.05), vector(-0.28, 0.98, 0.05), progress);
        elbowR = lerpPoint(vector(0.28, 1.24, 0.05), vector(0.28, 0.98, 0.05), progress);
        wristL = lerpPoint(vector(-0.26, 0.92, 0.08), vector(-0.26, 0.66, 0.08), progress);
        wristR = lerpPoint(vector(0.26, 0.92, 0.08), vector(0.26, 0.66, 0.08), progress);

        if (eqDumbbellLeft && eqDumbbellRight) {
          eqDumbbellLeft.position.copy(wristL);
          eqDumbbellRight.position.copy(wristR);
        }
      }
      // 15. PLANK (Floor Mat)
      else if (pattern === "plank") {
        hip = vector(0, 0.32, 0);
        shoulder = vector(0, 0.35, 0.45);
        kneeL = vector(-0.14, 0.22, -0.42);
        kneeR = vector(0.14, 0.22, -0.42);
        ankleL = vector(-0.14, 0.10, -0.85);
        ankleR = vector(0.14, 0.10, -0.85);
        elbowL = vector(-0.22, 0.10, 0.42);
        elbowR = vector(0.22, 0.10, 0.42);
        wristL = vector(-0.16, 0.06, 0.62);
        wristR = vector(0.16, 0.06, 0.62);
      }
      // 16. RUSSIAN TWIST (Floor Mat)
      else if (pattern === "russian_twist") {
        const twistAngle = (progress - 0.5) * 1.6;
        hip = vector(0, 0.28, 0);
        shoulder = vector(Math.sin(twistAngle) * 0.25, 0.68, Math.cos(twistAngle) * 0.15);
        kneeL = vector(-0.15, 0.48, 0.35);
        kneeR = vector(0.15, 0.48, 0.35);
        ankleL = vector(-0.15, 0.40, 0.62);
        ankleR = vector(0.15, 0.40, 0.62);
        elbowL = vector(Math.sin(twistAngle) * 0.28 - 0.12, 0.48, 0.32);
        elbowR = vector(Math.sin(twistAngle) * 0.28 + 0.12, 0.48, 0.32);
        wristL = vector(Math.sin(twistAngle) * 0.35 - 0.06, 0.42, 0.42);
        wristR = vector(Math.sin(twistAngle) * 0.35 + 0.06, 0.42, 0.42);

        if (eqKettlebell) {
          eqKettlebell.position.set(Math.sin(twistAngle) * 0.35, 0.38, 0.42);
        }
      }
      // 17. MOUNTAIN CLIMBERS (Floor Mat Biomechanics)
      else if (pattern === "mountain_climber") {
        hip = vector(0, 0.40, -0.05);
        shoulder = vector(0, 0.48, 0.38);
        ankleL = lerpPoint(vector(-0.14, 0.10, -0.75), vector(-0.14, 0.18, -0.15), progress);
        ankleR = lerpPoint(vector(0.14, 0.18, -0.15), vector(0.14, 0.10, -0.75), progress);
        kneeL = lerpPoint(vector(-0.14, 0.22, -0.45), vector(-0.14, 0.32, 0.18), progress);
        kneeR = lerpPoint(vector(0.14, 0.32, 0.18), vector(0.14, 0.22, -0.45), progress);
        elbowL = vector(-0.25, 0.28, 0.38);
        elbowR = vector(0.25, 0.28, 0.38);
        wristL = vector(-0.22, 0.06, 0.38);
        wristR = vector(0.22, 0.06, 0.38);
      }
      // 18. LATERAL RAISE (Dumbbells)
      else if (pattern === "lateral_raise") {
        hip = vector(0, 0.98, 0);
        shoulder = vector(0, 1.62, 0);
        kneeL = vector(-0.16, 0.52, 0.02);
        kneeR = vector(0.16, 0.52, 0.02);
        ankleL = vector(-0.16, 0.12, 0.02);
        ankleR = vector(0.16, 0.12, 0.02);
        elbowL = lerpPoint(vector(-0.26, 1.25, 0.02), vector(-0.65, 1.58, 0.02), progress);
        elbowR = lerpPoint(vector(0.26, 1.25, 0.02), vector(0.65, 1.58, 0.02), progress);
        wristL = lerpPoint(vector(-0.24, 0.92, 0.04), vector(-0.85, 1.60, 0.04), progress);
        wristR = lerpPoint(vector(0.24, 0.92, 0.04), vector(0.85, 1.60, 0.04), progress);

        if (eqDumbbellLeft && eqDumbbellRight) {
          eqDumbbellLeft.position.copy(wristL);
          eqDumbbellRight.position.copy(wristR);
        }
      }
      // 19. BENT-OVER ROW (Barbell / Dumbbell)
      else if (pattern === "bent_over_row") {
        hip = vector(0, 0.88, -0.25);
        shoulder = vector(0, 1.25, 0.20);
        kneeL = vector(-0.16, 0.48, -0.05);
        kneeR = vector(0.16, 0.48, -0.05);
        ankleL = vector(-0.16, 0.12, 0.02);
        ankleR = vector(0.16, 0.12, 0.02);
        elbowL = lerpPoint(vector(-0.28, 0.92, 0.20), vector(-0.35, 1.28, -0.02), progress);
        elbowR = lerpPoint(vector(0.28, 0.92, 0.20), vector(0.35, 1.28, -0.02), progress);
        wristL = lerpPoint(vector(-0.24, 0.58, 0.22), vector(-0.24, 1.05, 0.10), progress);
        wristR = lerpPoint(vector(0.24, 0.58, 0.22), vector(0.24, 1.05, 0.10), progress);

        if (eqBarbell) {
          eqBarbell.position.set(0, wristL.y, wristL.z);
        }
        if (eqDumbbellLeft && eqDumbbellRight) {
          eqDumbbellLeft.position.copy(wristL);
          eqDumbbellRight.position.copy(wristR);
        }
      }
      // 20. LAT PULLDOWN / FACE PULL (Cable Bar)
      else if (pattern === "lat_pulldown" || pattern === "face_pull") {
        hip = vector(0, 0.50, 0);
        shoulder = vector(0, 1.15, 0);
        kneeL = vector(-0.18, 0.48, 0.35);
        kneeR = vector(0.18, 0.48, 0.35);
        ankleL = vector(-0.18, 0.10, 0.35);
        ankleR = vector(0.18, 0.10, 0.35);
        elbowL = lerpPoint(vector(-0.38, 1.75, 0.02), vector(-0.32, 1.10, -0.08), progress);
        elbowR = lerpPoint(vector(0.38, 1.75, 0.02), vector(0.32, 1.10, -0.08), progress);
        wristL = lerpPoint(vector(-0.45, 2.05, 0.05), vector(-0.36, 1.25, 0.06), progress);
        wristR = lerpPoint(vector(0.45, 2.05, 0.05), vector(0.36, 1.25, 0.06), progress);

        if (eqLatBar) {
          eqLatBar.position.set(0, wristL.y, wristL.z);
        }
      }
      // 21. BURPEE (Floor Mat to Explosive Jump)
      else if (pattern === "burpee") {
        hip = lerpPoint(vector(0, 0.25, -0.2), vector(0, 1.35, 0), progress);
        shoulder = lerpPoint(vector(0, 0.32, 0.35), vector(0, 1.95, 0), progress);
        kneeL = lerpPoint(vector(-0.15, 0.20, -0.45), vector(-0.16, 0.85, 0), progress);
        kneeR = lerpPoint(vector(0.15, 0.20, -0.45), vector(0.16, 0.85, 0), progress);
        ankleL = lerpPoint(vector(-0.15, 0.10, -0.85), vector(-0.16, 0.35, 0), progress);
        ankleR = lerpPoint(vector(0.15, 0.10, -0.85), vector(0.16, 0.35, 0), progress);
        elbowL = lerpPoint(vector(-0.32, 0.25, 0.32), vector(-0.25, 2.15, 0), progress);
        elbowR = lerpPoint(vector(0.32, 0.25, 0.32), vector(0.25, 2.15, 0), progress);
        wristL = lerpPoint(vector(-0.26, 0.06, 0.35), vector(-0.20, 2.35, 0), progress);
        wristR = lerpPoint(vector(0.26, 0.06, 0.35), vector(0.20, 2.35, 0), progress);
      }
      // 22. SQUATS (Barbell on Traps)
      else {
        hip = lerpPoint(vector(0, 0.99, 0), vector(0, 0.62, -0.22), progress);
        shoulder = lerpPoint(vector(0, 1.62, 0), vector(0, 1.25, 0.15), progress);
        kneeL = lerpPoint(vector(-0.16, 0.52, 0.01), vector(-0.22, 0.46, 0.30), progress);
        kneeR = lerpPoint(vector(0.16, 0.52, 0.01), vector(0.22, 0.46, 0.30), progress);
        ankleL = vector(-0.16, 0.12, 0.025);
        ankleR = vector(0.16, 0.12, 0.025);
        elbowL = lerpPoint(vector(-0.32, 1.35, -0.08), vector(-0.30, 1.05, 0.05), progress);
        elbowR = lerpPoint(vector(0.32, 1.35, -0.08), vector(0.30, 1.05, 0.05), progress);
        wristL = lerpPoint(vector(-0.34, 1.54, -0.05), vector(-0.32, 1.22, 0.10), progress);
        wristR = lerpPoint(vector(0.34, 1.54, -0.05), vector(0.32, 1.22, 0.10), progress);

        if (eqBarbell) {
          eqBarbell.position.set(0, shoulder.y - 0.04, shoulder.z - 0.06);
        }
      }

      // Update Body Mesh Segments
      const headCenter = shoulder.clone().add(vector(0, 0.18, 0.01));
      torso.position.copy(hip).add(shoulder).multiplyScalar(0.5);
      torso.quaternion.setFromUnitVectors(
        vector(0, 1, 0),
        new THREE.Vector3().subVectors(shoulder, hip).normalize()
      );
      pelvis.position.copy(hip).add(vector(0, -0.02, 0));
      pelvis.quaternion.copy(torso.quaternion);
      head.position.copy(headCenter);
      hair.position.copy(headCenter).add(vector(0, 0.035, -0.005));

      const shoulderLeft = shoulder.clone().add(vector(-0.19, -0.04, 0));
      const shoulderRight = shoulder.clone().add(vector(0.19, -0.04, 0));

      poseBone(boneMeshes.thighLeft, vector(-0.105, hip.y - 0.05, hip.z), kneeL);
      poseBone(boneMeshes.thighRight, vector(0.105, hip.y - 0.05, hip.z), kneeR);
      poseBone(boneMeshes.shinLeft, kneeL, ankleL);
      poseBone(boneMeshes.shinRight, kneeR, ankleR);

      poseBone(boneMeshes.upperArmLeft, shoulderLeft, elbowL);
      poseBone(boneMeshes.upperArmRight, shoulderRight, elbowR);
      poseBone(boneMeshes.forearmLeft, elbowL, wristL);
      poseBone(boneMeshes.forearmRight, elbowR, wristR);

      [kneeL, kneeR, ankleL, ankleR, elbowL, elbowR, wristL, wristR].forEach((pt, i) => {
        placeJoint(joints[i], pt);
      });

      feet[0].position.set(ankleL.x, ankleL.y - 0.05, ankleL.z + 0.04);
      feet[1].position.set(ankleR.x, ankleR.y - 0.05, ankleR.z + 0.04);
    };

    applyPose(0);

    // Mouse Interaction
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      scene.rotation.y += dx * 0.015;
      camera.position.y = Math.max(0.3, Math.min(3.4, camera.position.y - dy * 0.01));
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    const resizeObserver = new ResizeObserver(() => {
      const width = Math.max(1, mount.clientWidth);
      const h = Math.max(1, mount.clientHeight);
      camera.aspect = width / h;
      camera.updateProjectionMatrix();
      renderer.setSize(width, h, false);
      renderer.render(scene, camera);
    });
    resizeObserver.observe(mount);

    let animationFrame = 0;
    const draw = (time) => {
      if (isPlayingRef.current) {
        const duration = slowMoRef.current ? 4800 : 2800;
        const cycle = (time % duration) / duration;
        const progress = (1 - Math.cos(cycle * Math.PI * 2)) / 2;
        applyPose(progress);

        if (!isDragging) {
          scene.rotation.y = Math.sin(time / 5200) * 0.16;
        }
      }
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(draw);
    };

    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      dom.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      resizeObserver.disconnect();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach((mat) => mat.dispose());
          else object.material.dispose();
        }
      });
      renderer.dispose();
      mount.replaceChildren();
    };
  }, [pattern, equipment, surface]);

  return (
    <div className="exercise-3d-container" style={{ height: `${height}px` }}>
      <div
        className="exercise-3d-stage"
        ref={mountRef}
        role="img"
        aria-label={`3D animation and equipment guide for ${exercise?.name || "exercise"}`}
      >
        {unavailable && <div className="motion-unavailable">3D WebGL preview is not available on this device.</div>}
      </div>

      <div className="exercise-3d-controls">
        <button
          type="button"
          className="exercise-3d-pill-btn"
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? "Pause animation" : "Play animation"}
        >
          {isPlaying ? "⏸ Pause" : "▶ Play"}
        </button>

        <button
          type="button"
          className={`exercise-3d-pill-btn ${slowMo ? "active-slow" : ""}`}
          onClick={() => setSlowMo(!slowMo)}
          title="Toggle slow-motion technique view"
        >
          {slowMo ? "⚡ Normal Speed" : "🐢 0.5x Slow-Mo"}
        </button>

        <span className="exercise-3d-pill-tag">
          {surface !== "floor" ? `${surface.replace(/_/g, " ").toUpperCase()} · ` : ""}
          {equipment !== "none" ? `3D ${equipment.replace(/_/g, " ").toUpperCase()}` : "BODYWEIGHT"} · {pattern.replace(/_/g, " ").toUpperCase()}
        </span>
      </div>
    </div>
  );
}
