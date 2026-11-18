import * as THREE from "three";

/**
 * Procedural 3D Gym Equipment, Machines, and Surfaces for Three.js
 */

export function createBarbell({ barLength = 1.52, plateRadius = 0.18, plateThickness = 0.045 } = {}) {
  const group = new THREE.Group();
  group.name = "equipment_barbell";

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xd8d8d8,
    metalness: 0.92,
    roughness: 0.22,
  });

  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x1f232b,
    roughness: 0.55,
    metalness: 0.2,
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xe53935,
    roughness: 0.4,
    metalness: 0.3,
  });

  const collarMat = new THREE.MeshStandardMaterial({
    color: 0x90a4ae,
    metalness: 0.85,
    roughness: 0.3,
  });

  // Center Bar
  const barGeom = new THREE.CylinderGeometry(0.015, 0.015, barLength, 20);
  const bar = new THREE.Mesh(barGeom, chromeMat);
  bar.rotation.z = Math.PI / 2;
  group.add(bar);

  // Sleeves & Plates on left (-X) and right (+X)
  const halfLen = barLength / 2;
  const plateOffsets = [-1, 1];

  plateOffsets.forEach((side) => {
    const collarGeom = new THREE.CylinderGeometry(0.026, 0.026, 0.03, 16);
    const collar = new THREE.Mesh(collarGeom, collarMat);
    collar.rotation.z = Math.PI / 2;
    collar.position.x = side * (halfLen - 0.22);
    group.add(collar);

    const plateGeom = new THREE.CylinderGeometry(plateRadius, plateRadius, plateThickness, 32);
    const plate = new THREE.Mesh(plateGeom, plateMat);
    plate.rotation.z = Math.PI / 2;
    plate.position.x = side * (halfLen - 0.16);
    group.add(plate);

    const rimGeom = new THREE.TorusGeometry(plateRadius * 0.95, 0.006, 12, 32);
    const rim = new THREE.Mesh(rimGeom, rimMat);
    rim.rotation.y = Math.PI / 2;
    rim.position.x = side * (halfLen - 0.16 + side * (plateThickness / 2 + 0.002));
    group.add(rim);

    const plate2Geom = new THREE.CylinderGeometry(plateRadius * 0.78, plateRadius * 0.78, plateThickness * 0.8, 32);
    const plate2 = new THREE.Mesh(plate2Geom, plateMat);
    plate2.rotation.z = Math.PI / 2;
    plate2.position.x = side * (halfLen - 0.10);
    group.add(plate2);

    const clipGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.025, 16);
    const clip = new THREE.Mesh(clipGeom, collarMat);
    clip.rotation.z = Math.PI / 2;
    clip.position.x = side * (halfLen - 0.05);
    group.add(clip);
  });

  return group;
}

export function createDumbbell({ headRadius = 0.07, handleLen = 0.18 } = {}) {
  const group = new THREE.Group();
  group.name = "equipment_dumbbell";

  const handleMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.9,
    roughness: 0.25,
  });

  const headMat = new THREE.MeshStandardMaterial({
    color: 0x242830,
    metalness: 0.25,
    roughness: 0.5,
  });

  const handleGeom = new THREE.CylinderGeometry(0.015, 0.015, handleLen, 16);
  const handle = new THREE.Mesh(handleGeom, handleMat);
  group.add(handle);

  const hexHeadGeom = new THREE.CylinderGeometry(headRadius, headRadius, 0.065, 6);

  const topHead = new THREE.Mesh(hexHeadGeom, headMat);
  topHead.position.y = handleLen / 2 + 0.032;
  group.add(topHead);

  const bottomHead = new THREE.Mesh(hexHeadGeom, headMat);
  bottomHead.position.y = -(handleLen / 2 + 0.032);
  group.add(bottomHead);

  return group;
}

export function createKettlebell({ ballRadius = 0.095 } = {}) {
  const group = new THREE.Group();
  group.name = "equipment_kettlebell";

  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x2b303a,
    metalness: 0.45,
    roughness: 0.65,
  });

  const handleMat = new THREE.MeshStandardMaterial({
    color: 0x455a64,
    metalness: 0.75,
    roughness: 0.35,
  });

  const bodyGeom = new THREE.SphereGeometry(ballRadius, 24, 20);
  const body = new THREE.Mesh(bodyGeom, ironMat);
  body.scale.set(1, 0.92, 1);
  group.add(body);

  const handleGeom = new THREE.TorusGeometry(0.058, 0.016, 12, 28, Math.PI);
  const handle = new THREE.Mesh(handleGeom, handleMat);
  handle.rotation.z = Math.PI;
  handle.position.y = ballRadius + 0.04;
  group.add(handle);

  [-1, 1].forEach((side) => {
    const pillarGeom = new THREE.CylinderGeometry(0.016, 0.016, 0.05, 12);
    const pillar = new THREE.Mesh(pillarGeom, handleMat);
    pillar.position.set(side * 0.058, ballRadius + 0.02, 0);
    group.add(pillar);
  });

  return group;
}

/**
 * Floor Exercise Mat
 */
export function createWorkoutMat({ width = 0.78, length = 1.85, thickness = 0.02 } = {}) {
  const group = new THREE.Group();
  group.name = "surface_workout_mat";

  const matMat = new THREE.MeshStandardMaterial({
    color: 0x312e81, // Premium Indigo Foam
    roughness: 0.75,
    metalness: 0.08,
  });

  const edgeMat = new THREE.MeshStandardMaterial({
    color: 0x4338ca,
    roughness: 0.6,
  });

  const mat = new THREE.Mesh(new THREE.BoxGeometry(width, thickness, length), matMat);
  mat.position.y = thickness / 2;
  group.add(mat);

  // Beveled outer rim
  const rim = new THREE.Mesh(new THREE.BoxGeometry(width + 0.02, thickness * 0.8, length + 0.02), edgeMat);
  rim.position.y = thickness * 0.4;
  group.add(rim);

  return group;
}

/**
 * Dual Cable Stand / Cable Crossover Machine
 */
export function createCableStandDual({ towerSeparation = 2.1, towerHeight = 2.3 } = {}) {
  const group = new THREE.Group();
  group.name = "equipment_cable_machine";

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x1f242d,
    metalness: 0.85,
    roughness: 0.3,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xd0d4dc,
    metalness: 0.95,
    roughness: 0.18,
  });

  const weightMat = new THREE.MeshStandardMaterial({
    color: 0x111317,
    roughness: 0.6,
    metalness: 0.4,
  });

  const pulleyMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Amber pulley wheel accent
    roughness: 0.35,
    metalness: 0.5,
  });

  // Top Overhead Connecting Crossbar
  const crossbar = new THREE.Mesh(new THREE.BoxGeometry(towerSeparation + 0.3, 0.08, 0.08), frameMat);
  crossbar.position.set(0, towerHeight, 0);
  group.add(crossbar);

  // Pull-up grips on crossbar
  [-1, 1].forEach((side) => {
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.35, 16), chromeMat);
    grip.rotation.z = Math.PI / 2 + side * 0.35;
    grip.position.set(side * 0.45, towerHeight - 0.06, 0.08);
    group.add(grip);
  });

  // Left and Right Cable Columns
  [-1, 1].forEach((side) => {
    const xPos = side * (towerSeparation / 2);

    // Tower Upright Columns
    [-1, 1].forEach((postZ) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.07, towerHeight, 0.07), frameMat);
      post.position.set(xPos + postZ * 0.08, towerHeight / 2, 0);
      group.add(post);
    });

    // Base Foot Stabilizer
    const baseFoot = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.8), frameMat);
    baseFoot.position.set(xPos, 0.02, 0);
    group.add(baseFoot);

    // Weight Stack (Rectangular plates stacked)
    for (let p = 0; p < 12; p++) {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.16), weightMat);
      plate.position.set(xPos, 0.12 + p * 0.055, 0);
      group.add(plate);
    }

    // Chrome Guide Rods
    [-1, 1].forEach((rodSide) => {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, towerHeight * 0.9, 12), chromeMat);
      rod.position.set(xPos + rodSide * 0.07, towerHeight * 0.48, 0);
      group.add(rod);
    });

    // Adjustable Cable Pulley Carriage at Chest Height
    const pulleyHousing = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.12), pulleyMat);
    pulleyHousing.position.set(xPos, 1.52, 0);
    group.add(pulleyHousing);

    const pulleyWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16), chromeMat);
    pulleyWheel.rotation.x = Math.PI / 2;
    pulleyWheel.position.set(xPos - side * 0.06, 1.52, 0);
    group.add(pulleyWheel);
  });

  return group;
}

export function createPullUpBar({ width = 1.45, height = 2.15 } = {}) {
  const group = new THREE.Group();
  group.name = "equipment_pullup_bar";

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x263238,
    metalness: 0.8,
    roughness: 0.35,
  });

  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x90caf9,
    metalness: 0.2,
    roughness: 0.8,
  });

  const barGeom = new THREE.CylinderGeometry(0.022, 0.022, width, 24);
  const bar = new THREE.Mesh(barGeom, steelMat);
  bar.rotation.z = Math.PI / 2;
  bar.position.y = height;
  group.add(bar);

  [-1, 1].forEach((side) => {
    const gripGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.28, 20);
    const grip = new THREE.Mesh(gripGeom, gripMat);
    grip.rotation.z = Math.PI / 2;
    grip.position.set(side * 0.32, height, 0);
    group.add(grip);

    const postGeom = new THREE.CylinderGeometry(0.028, 0.028, height, 16);
    const post = new THREE.Mesh(postGeom, steelMat);
    post.position.set(side * (width / 2 - 0.05), height / 2, -0.05);
    group.add(post);

    const baseGeom = new THREE.BoxGeometry(0.12, 0.02, 0.35);
    const base = new THREE.Mesh(baseGeom, steelMat);
    base.position.set(side * (width / 2 - 0.05), 0.01, -0.05);
    group.add(base);
  });

  return group;
}

export function createDipBars({ separation = 0.62, barHeight = 1.08, length = 0.75 } = {}) {
  const group = new THREE.Group();
  group.name = "equipment_dip_bars";

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x37474f,
    metalness: 0.78,
    roughness: 0.32,
  });

  [-1, 1].forEach((side) => {
    const xPos = side * (separation / 2);

    const barGeom = new THREE.CylinderGeometry(0.022, 0.022, length, 20);
    const bar = new THREE.Mesh(barGeom, steelMat);
    bar.rotation.x = Math.PI / 2;
    bar.position.set(xPos, barHeight, 0);
    group.add(bar);

    const frontPost = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, barHeight, 16), steelMat);
    frontPost.position.set(xPos, barHeight / 2, length / 2 - 0.05);
    group.add(frontPost);

    const backPost = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, barHeight, 16), steelMat);
    backPost.position.set(xPos, barHeight / 2, -(length / 2 - 0.05));
    group.add(backPost);

    const footGeom = new THREE.BoxGeometry(0.08, 0.025, length + 0.15);
    const foot = new THREE.Mesh(footGeom, steelMat);
    foot.position.set(xPos, 0.012, 0);
    group.add(foot);
  });

  return group;
}

export function createParallettes({ separation = 0.56, barHeight = 0.18, length = 0.42 } = {}) {
  const group = new THREE.Group();
  group.name = "equipment_parallettes";

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0xc89d68,
    roughness: 0.6,
  });

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x212121,
    metalness: 0.8,
    roughness: 0.4,
  });

  [-1, 1].forEach((side) => {
    const xPos = side * (separation / 2);

    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, length, 18), woodMat);
    bar.rotation.x = Math.PI / 2;
    bar.position.set(xPos, barHeight, 0);
    group.add(bar);

    [-1, 1].forEach((endSide) => {
      const support = new THREE.Mesh(new THREE.BoxGeometry(0.04, barHeight, 0.04), steelMat);
      support.position.set(xPos, barHeight / 2, endSide * (length / 2 - 0.03));
      group.add(support);

      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.04), steelMat);
      foot.position.set(xPos, 0.01, endSide * (length / 2 - 0.03));
      group.add(foot);
    });
  });

  return group;
}

export function createResistanceBand({ color = 0xe91e63, width = 0.35, thickness = 0.012 } = {}) {
  const group = new THREE.Group();
  group.name = "equipment_resistance_band";

  const bandMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.3,
    metalness: 0.1,
  });

  const bandGeom = new THREE.TorusGeometry(width / 2, thickness, 12, 48);
  const band = new THREE.Mesh(bandGeom, bandMat);
  band.scale.set(1, 1.8, 1);
  group.add(band);

  return group;
}

export function createFoamRoller({ length = 0.45, radius = 0.075 } = {}) {
  const group = new THREE.Group();
  group.name = "equipment_foam_roller";

  const foamMat = new THREE.MeshStandardMaterial({
    color: 0x3f51b5,
    roughness: 0.8,
    metalness: 0.05,
  });

  const innerMat = new THREE.MeshStandardMaterial({
    color: 0x1a237e,
    roughness: 0.5,
  });

  const rollerGeom = new THREE.CylinderGeometry(radius, radius, length, 32);
  const roller = new THREE.Mesh(rollerGeom, foamMat);
  roller.rotation.z = Math.PI / 2;
  group.add(roller);

  const coreGeom = new THREE.CylinderGeometry(radius * 0.45, radius * 0.45, length + 0.002, 24);
  const core = new THREE.Mesh(coreGeom, innerMat);
  core.rotation.z = Math.PI / 2;
  group.add(core);

  return group;
}

export function createGymBench({ length = 1.15, width = 0.28, height = 0.45 } = {}) {
  const group = new THREE.Group();
  group.name = "equipment_gym_bench";

  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x18181a,
    roughness: 0.5,
    metalness: 0.1,
  });

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x30343f,
    metalness: 0.82,
    roughness: 0.3,
  });

  const cushion = new THREE.Mesh(new THREE.BoxGeometry(width, 0.07, length), leatherMat);
  cushion.position.y = height;
  group.add(cushion);

  const stitch = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.002, 0.006, length * 0.95),
    new THREE.MeshBasicMaterial({ color: 0xef5350 })
  );
  stitch.position.y = height + 0.035;
  group.add(stitch);

  const beam = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, length * 0.9), steelMat);
  beam.position.y = height - 0.06;
  group.add(beam);

  [-1, 1].forEach((side) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, height - 0.08, 16), steelMat);
    leg.position.set(0, (height - 0.08) / 2, side * (length / 2 - 0.12));
    group.add(leg);

    const foot = new THREE.Mesh(new THREE.BoxGeometry(width + 0.12, 0.03, 0.08), steelMat);
    foot.position.set(0, 0.015, side * (length / 2 - 0.12));
    group.add(foot);
  });

  return group;
}

export function createCablePulldownBar({ width = 1.1 } = {}) {
  const group = new THREE.Group();
  group.name = "equipment_lat_bar";

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xd8d8d8,
    metalness: 0.9,
    roughness: 0.2,
  });

  const cableMat = new THREE.MeshStandardMaterial({
    color: 0x424242,
    metalness: 0.6,
    roughness: 0.4,
  });

  const centerBar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, width * 0.6, 16), chromeMat);
  centerBar.rotation.z = Math.PI / 2;
  group.add(centerBar);

  [-1, 1].forEach((side) => {
    const endBar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, width * 0.24, 16), chromeMat);
    endBar.rotation.z = Math.PI / 2 + side * 0.22;
    endBar.position.set(side * (width * 0.38), -0.025, 0);
    group.add(endBar);
  });

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.006, 12, 24), chromeMat);
  ring.position.y = 0.035;
  group.add(ring);

  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 1.2, 8), cableMat);
  cable.position.y = 0.65;
  group.add(cable);

  return group;
}

export function createAbWheel({ wheelRadius = 0.11, handleLength = 0.32 } = {}) {
  const group = new THREE.Group();
  group.name = "equipment_ab_wheel";

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x1f242d,
    roughness: 0.8,
    metalness: 0.1,
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xef4444, // Red rim accent
    roughness: 0.35,
    metalness: 0.4,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xd8d8d8,
    metalness: 0.9,
    roughness: 0.2,
  });

  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x2b303a,
    roughness: 0.7,
  });

  // Center Axle Bar
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, handleLength, 16), chromeMat);
  axle.rotation.z = Math.PI / 2;
  group.add(axle);

  // Dual Center Wheels
  [-0.024, 0.024].forEach((offset) => {
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.038, 32), tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.position.x = offset;
    group.add(tire);

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius * 0.72, wheelRadius * 0.72, 0.040, 24), rimMat);
    rim.rotation.z = Math.PI / 2;
    rim.position.x = offset;
    group.add(rim);

    const tread = new THREE.Mesh(new THREE.TorusGeometry(wheelRadius, 0.006, 8, 32), tireMat);
    tread.rotation.y = Math.PI / 2;
    tread.position.x = offset;
    group.add(tread);
  });

  // Rubber Hand Grips
  [-1, 1].forEach((side) => {
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.10, 16), gripMat);
    grip.rotation.z = Math.PI / 2;
    grip.position.x = side * (handleLength / 2 - 0.055);
    group.add(grip);
  });

  return group;
}
