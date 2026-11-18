"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function makeBone(scene, material, radius) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 1, 16), material);
  scene.add(mesh);
  return mesh;
}

function poseBone(mesh, start, end) {
  const direction = new THREE.Vector3().subVectors(end, start);
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.scale.set(1, direction.length(), 1);
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

export default function SquatModel3D() {
  const mountRef = useRef(null);
  const [unavailable, setUnavailable] = useState(false);

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
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 30);
    camera.position.set(2.7, 2.25, 4.3);
    camera.lookAt(0, 1.02, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    mount.replaceChildren(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xdcd6ff, 0x292a45, 2.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(-2.8, 4.5, 4);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x9581ff, 20, 7);
    rimLight.position.set(2.2, 1.7, -1.5);
    scene.add(rimLight);

    const skin = new THREE.MeshStandardMaterial({ color: 0xd79c83, roughness: 0.55 });
    const shirt = new THREE.MeshStandardMaterial({ color: 0x9887f1, roughness: 0.47, metalness: 0.08 });
    const shorts = new THREE.MeshStandardMaterial({ color: 0x46436f, roughness: 0.62 });
    const shoes = new THREE.MeshStandardMaterial({ color: 0xe7dfff, roughness: 0.4 });
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x24243e, roughness: 0.72, metalness: 0.12 });
    const ground = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.82, 0.055, 48), groundMaterial);
    ground.position.y = -0.035;
    scene.add(ground);
    const groundRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.73, 0.008, 6, 64),
      new THREE.MeshBasicMaterial({ color: 0x9887f1, transparent: true, opacity: 0.48 }),
    );
    groundRing.rotation.x = Math.PI / 2;
    groundRing.position.y = 0.003;
    scene.add(groundRing);

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.42, 6, 16), shirt);
    scene.add(torso);
    const pelvis = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.13, 4, 12), shorts);
    scene.add(pelvis);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 24, 18), skin);
    scene.add(head);
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.138, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.48),
      new THREE.MeshStandardMaterial({ color: 0x39314b, roughness: 0.76 }),
    );
    scene.add(hair);

    const boneMeshes = {
      thighLeft: makeBone(scene, skin, 0.075),
      thighRight: makeBone(scene, skin, 0.075),
      shinLeft: makeBone(scene, skin, 0.065),
      shinRight: makeBone(scene, skin, 0.065),
      upperArmLeft: makeBone(scene, shirt, 0.058),
      upperArmRight: makeBone(scene, shirt, 0.058),
      forearmLeft: makeBone(scene, skin, 0.045),
      forearmRight: makeBone(scene, skin, 0.045),
    };
    const joints = [
      makeJoint(scene, skin, 0.075), makeJoint(scene, skin, 0.075),
      makeJoint(scene, skin, 0.06), makeJoint(scene, skin, 0.06),
      makeJoint(scene, skin, 0.05), makeJoint(scene, skin, 0.05),
      makeJoint(scene, skin, 0.05), makeJoint(scene, skin, 0.05),
    ];
    const feet = [-1, 1].map((side) => {
      const foot = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.16, 4, 10), shoes);
      foot.rotation.x = Math.PI / 2;
      foot.position.set(side * 0.16, 0.065, 0.055);
      scene.add(foot);
      return foot;
    });

    const vector = (x, y, z) => new THREE.Vector3(x, y, z);
    const lerpPoint = (standing, squat, progress) => standing.clone().lerp(squat, progress);
    const pose = (progress) => {
      const hip = lerpPoint(vector(0, 0.99, 0), vector(0, 0.72, -0.09), progress);
      const shoulder = lerpPoint(vector(0, 1.62, 0), vector(0, 1.33, 0.09), progress);
      const headCenter = shoulder.clone().add(vector(0, 0.19, 0.015));
      torso.position.copy(hip).add(shoulder).multiplyScalar(0.5);
      torso.quaternion.setFromUnitVectors(
        vector(0, 1, 0),
        new THREE.Vector3().subVectors(shoulder, hip).normalize(),
      );
      pelvis.position.copy(hip).add(vector(0, -0.02, 0));
      pelvis.quaternion.copy(torso.quaternion);
      head.position.copy(headCenter);
      hair.position.copy(headCenter).add(vector(0, 0.035, -0.005));

      const kneeLeft = lerpPoint(vector(-0.15, 0.52, 0.01), vector(-0.17, 0.48, 0.25), progress);
      const kneeRight = lerpPoint(vector(0.15, 0.52, 0.01), vector(0.17, 0.48, 0.25), progress);
      const ankleLeft = vector(-0.16, 0.12, 0.025);
      const ankleRight = vector(0.16, 0.12, 0.025);
      poseBone(boneMeshes.thighLeft, vector(-0.105, hip.y - 0.05, hip.z), kneeLeft);
      poseBone(boneMeshes.thighRight, vector(0.105, hip.y - 0.05, hip.z), kneeRight);
      poseBone(boneMeshes.shinLeft, kneeLeft, ankleLeft);
      poseBone(boneMeshes.shinRight, kneeRight, ankleRight);

      const elbowLeft = lerpPoint(vector(-0.32, 1.24, 0.015), vector(-0.29, 1.2, 0.35), progress);
      const elbowRight = lerpPoint(vector(0.32, 1.24, 0.015), vector(0.29, 1.2, 0.35), progress);
      const wristLeft = lerpPoint(vector(-0.36, 0.91, 0.02), vector(-0.25, 1.12, 0.55), progress);
      const wristRight = lerpPoint(vector(0.36, 0.91, 0.02), vector(0.25, 1.12, 0.55), progress);
      const shoulderLeft = shoulder.clone().add(vector(-0.19, -0.04, 0));
      const shoulderRight = shoulder.clone().add(vector(0.19, -0.04, 0));
      poseBone(boneMeshes.upperArmLeft, shoulderLeft, elbowLeft);
      poseBone(boneMeshes.upperArmRight, shoulderRight, elbowRight);
      poseBone(boneMeshes.forearmLeft, elbowLeft, wristLeft);
      poseBone(boneMeshes.forearmRight, elbowRight, wristRight);

      [kneeLeft, kneeRight, ankleLeft, ankleRight, elbowLeft, elbowRight, wristLeft, wristRight]
        .forEach((point, index) => placeJoint(joints[index], point));
    };
    pose(0);

    const resizeObserver = new ResizeObserver(() => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    });
    resizeObserver.observe(mount);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;
    const draw = (time) => {
      if (!reducedMotion) {
        const cycle = (time % 3600) / 3600;
        const progress = (1 - Math.cos(cycle * Math.PI * 2)) / 2;
        pose(progress);
        scene.rotation.y = Math.sin(time / 5200) * 0.08;
      }
      renderer.render(scene, camera);
    };
    if (reducedMotion) renderer.render(scene, camera);
    else animationFrame = window.requestAnimationFrame(draw);
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (event) => {
      if (event.matches) {
        window.cancelAnimationFrame(animationFrame);
        pose(0);
        scene.rotation.y = 0;
        renderer.render(scene, camera);
      } else {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };
    motionPreference.addEventListener("change", handleMotionChange);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      motionPreference.removeEventListener("change", handleMotionChange);
      resizeObserver.disconnect();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
          else object.material.dispose();
        }
      });
      renderer.dispose();
      mount.replaceChildren();
    };
  }, []);

  return <div className="motion-stage motion-stage-3d" ref={mountRef} role="img" aria-label="Animated 3D figure demonstrating a squat. The movement illustration is not verified coaching.">{unavailable && <span className="motion-unavailable">3D preview is not available in this browser.</span>}</div>;
}
