const sceneContainer = document.getElementById("sceneContainer");
const labelLayer = document.getElementById("labelLayer");
const statusOverlay = document.getElementById("statusOverlay");
const timeScaleInput = document.getElementById("timeScale");
const timeScaleLabel = document.getElementById("timeScaleLabel");
const pauseButton = document.getElementById("pauseButton");
const resetViewButton = document.getElementById("resetViewButton");
const orbitToggle = document.getElementById("orbitToggle");
const labelToggle = document.getElementById("labelToggle");
const asteroidToggle = document.getElementById("asteroidToggle");
const planetList = document.getElementById("planetList");
const moonList = document.getElementById("moonList");

const selectedName = document.getElementById("selectedName");
const selectedTagline = document.getElementById("selectedTagline");
const factType = document.getElementById("factType");
const factDiameter = document.getElementById("factDiameter");
const factOrbit = document.getElementById("factOrbit");
const factComposition = document.getElementById("factComposition");
const detailSurface = document.getElementById("detailSurface");

let THREE;
let OrbitControls;
let renderer;
let scene;
let camera;
let controls;
let raycaster;
let pointer;
let clock;
let worldPosition;
let projectedPosition;
let paused = false;
let focusTarget = null;
let focusDistance = 220;
let autoFocus = true;
let solarRoot;
let ambientLight;
let sunLight;
let starField;
let sun;
let asteroidBelt;

const orbitLines = [];
const pickables = [];
const labels = [];

const systemInfo = {
  name: "Systeme solaire",
  tagline: "Une etoile, huit planetes majeures, des lunes, des asteroides et une immense profondeur spatiale.",
  type: "Systeme planetaire",
  diameter: "4,5 milliards de km",
  orbit: "Du Soleil a Neptune",
  composition: "Plasma, roches, glaces et geantes gazeuses",
  surface: "Chaque monde possede sa propre geologie ou dynamique atmospherique. Clique sur un objet pour afficher ses caracteristiques principales."
};

const planetData = [
  {
    name: "Mercure",
    color: "#b8b6b0",
    radius: 3.2,
    distance: 28,
    orbitSpeed: 0.9,
    rotationSpeed: 0.012,
    type: "Planete tellurique",
    diameter: "4 879 km",
    orbit: "57,9 millions de km du Soleil",
    composition: "Silicates et grand noyau metallique",
    surface: "Monde rocheux tres craterise avec des falaises, presque sans atmosphere et des variations thermiques extremes.",
    tagline: "La planete la plus proche du Soleil, compacte et brulee de lumiere.",
    moons: []
  },
  {
    name: "Venus",
    color: "#d4a763",
    radius: 5.4,
    distance: 40,
    orbitSpeed: 0.65,
    rotationSpeed: 0.004,
    type: "Planete tellurique",
    diameter: "12 104 km",
    orbit: "108,2 millions de km du Soleil",
    composition: "Roches silicatees et atmosphere dense de CO2",
    surface: "Surface volcanique et ecrasee sous une epaisse atmosphere acide. Les nuages piegent une chaleur intense.",
    tagline: "Une soeur infernale de la Terre, enfouie sous une atmosphere opaque.",
    moons: []
  },
  {
    name: "Terre",
    color: "#4ea6ff",
    radius: 5.8,
    distance: 56,
    orbitSpeed: 0.5,
    rotationSpeed: 0.022,
    type: "Planete tellurique",
    diameter: "12 742 km",
    orbit: "149,6 millions de km du Soleil",
    composition: "Roches, eau liquide et atmosphere azote-oxygene",
    surface: "Oceans, continents, glaces et une biosphere active qui faconne l'atmosphere et les paysages.",
    tagline: "Le seul monde connu abritant durablement la vie.",
    moons: [
      { name: "Lune", radius: 1.3, distance: 11, speed: 1.6, color: "#cfd4da", type: "Satellite naturel", diameter: "3 474 km", orbit: "384 400 km de la Terre", composition: "Roches silicatees", surface: "Plaines basaltiques sombres et hauts plateaux tres craterises.", tagline: "Le satellite qui stabilise l'inclinaison terrestre." }
    ]
  },
  {
    name: "Mars",
    color: "#e97c42",
    radius: 4.3,
    distance: 76,
    orbitSpeed: 0.36,
    rotationSpeed: 0.02,
    type: "Planete tellurique",
    diameter: "6 779 km",
    orbit: "227,9 millions de km du Soleil",
    composition: "Basaltes, oxydes de fer et glace d'eau",
    surface: "Deserts rouges, volcans geants, canyons profonds et calottes polaires saisonnieres.",
    tagline: "Une frontiere froide et poussiereuse qui fascine les missions d'exploration.",
    moons: [
      { name: "Phobos", radius: 0.6, distance: 8, speed: 2.2, color: "#9a8f83", type: "Satellite naturel", diameter: "22 km", orbit: "9 377 km de Mars", composition: "Roches sombres et regolithe", surface: "Petit corps irregulier tres craterise.", tagline: "Une lune proche qui se rapproche lentement de Mars." },
      { name: "Deimos", radius: 0.42, distance: 12, speed: 1.4, color: "#b7aa96", type: "Satellite naturel", diameter: "12 km", orbit: "23 460 km de Mars", composition: "Roches riches en carbone", surface: "Objet discret et poudreux, probablement capture.", tagline: "La plus externe des deux lunes martiennes." }
    ]
  },
  {
    name: "Jupiter",
    color: "#d6b08d",
    radius: 12.5,
    distance: 118,
    orbitSpeed: 0.18,
    rotationSpeed: 0.036,
    type: "Geante gazeuse",
    diameter: "139 820 km",
    orbit: "778,5 millions de km du Soleil",
    composition: "Hydrogene, helium et traces d'ammoniac",
    surface: "Pas de surface solide nette: on observe des bandes nuageuses, des tempetes et la Grande Tache rouge.",
    tagline: "Le geant du systeme solaire, gardien de nombreuses lunes.",
    moons: [
      { name: "Io", radius: 1.1, distance: 18, speed: 2.2, color: "#f4d35e", type: "Satellite naturel", diameter: "3 643 km", orbit: "421 700 km de Jupiter", composition: "Roches silicatees et soufre", surface: "Le monde le plus volcanique connu, parseme de plaines jaunes et noires.", tagline: "Une lune secouee par des forces de maree extremes." },
      { name: "Europe", radius: 1.05, distance: 24, speed: 1.8, color: "#dfe7f2", type: "Satellite naturel", diameter: "3 122 km", orbit: "670 900 km de Jupiter", composition: "Glace d'eau et ocean interne probable", surface: "Croute glacee striee de fissures avec peut-etre un ocean liquide en dessous.", tagline: "Une cible majeure dans la recherche de vie extraterrestre." },
      { name: "Ganymede", radius: 1.4, distance: 32, speed: 1.2, color: "#9eb0bb", type: "Satellite naturel", diameter: "5 268 km", orbit: "1 070 400 km de Jupiter", composition: "Glace et roches", surface: "La plus grande lune du systeme solaire, avec terrains sombres et regions striees.", tagline: "Une lune geante dotee de son propre champ magnetique." },
      { name: "Callisto", radius: 1.28, distance: 41, speed: 0.9, color: "#807b74", type: "Satellite naturel", diameter: "4 821 km", orbit: "1 882 700 km de Jupiter", composition: "Glace, roches et materiaux sombres", surface: "Tres ancienne et couverte de crateres, presque sans activite geologique recente.", tagline: "Une archive glacee des premiers temps du systeme solaire." }
    ]
  },
  {
    name: "Saturne",
    color: "#dec58d",
    radius: 10.8,
    distance: 162,
    orbitSpeed: 0.11,
    rotationSpeed: 0.032,
    type: "Geante gazeuse",
    diameter: "116 460 km",
    orbit: "1,43 milliard de km du Soleil",
    composition: "Hydrogene, helium et cristaux de glace",
    surface: "Immense atmosphere stratifiee et systeme d'anneaux constitue de glace, poussiere et debris rocheux.",
    tagline: "La planete aux anneaux, delicate et spectaculaire.",
    ring: { inner: 14, outer: 22, color: "#d9c89c" },
    moons: [
      { name: "Titan", radius: 1.3, distance: 24, speed: 1.1, color: "#d9a35f", type: "Satellite naturel", diameter: "5 150 km", orbit: "1 221 900 km de Saturne", composition: "Glace, roches et atmosphere azotee", surface: "Mers d'hydrocarbures, dunes et brouillard orange epais.", tagline: "Un monde a atmosphere dense, unique parmi les lunes." },
      { name: "Encelade", radius: 0.7, distance: 15, speed: 1.9, color: "#e8f1ff", type: "Satellite naturel", diameter: "504 km", orbit: "238 000 km de Saturne", composition: "Glace d'eau et ocean sale probable", surface: "Surface glacee tres brillante avec geysers ejectant de la vapeur d'eau.", tagline: "Une petite lune tres active, riche en indices d'habitabilite." }
    ]
  },
  {
    name: "Uranus",
    color: "#8fd8ea",
    radius: 8.4,
    distance: 212,
    orbitSpeed: 0.07,
    rotationSpeed: 0.018,
    type: "Geante de glace",
    diameter: "50 724 km",
    orbit: "2,87 milliards de km du Soleil",
    composition: "Glaces, hydrogene, helium et methane",
    surface: "Une atmosphere bleutee froide et calme en apparence, avec un axe de rotation tres incline.",
    tagline: "Une geante glacee couchee sur le cote.",
    ring: { inner: 10.5, outer: 12.4, color: "#9dd7e4" },
    moons: [
      { name: "Titania", radius: 0.9, distance: 16, speed: 1.1, color: "#c7d0d5", type: "Satellite naturel", diameter: "1 578 km", orbit: "436 000 km d'Uranus", composition: "Glace et roches", surface: "Falaises, crateres et plaines glacees.", tagline: "La plus grande lune d'Uranus." },
      { name: "Oberon", radius: 0.84, distance: 22, speed: 0.8, color: "#9ea2a8", type: "Satellite naturel", diameter: "1 523 km", orbit: "584 000 km d'Uranus", composition: "Glace et roches", surface: "Monde sombre et ancien, marque par des crateres d'impact.", tagline: "Une lune externe froide et craterisee." }
    ]
  },
  {
    name: "Neptune",
    color: "#3a73ff",
    radius: 8.1,
    distance: 258,
    orbitSpeed: 0.05,
    rotationSpeed: 0.02,
    type: "Geante de glace",
    diameter: "49 244 km",
    orbit: "4,5 milliards de km du Soleil",
    composition: "Hydrogene, helium, methane et glaces volatiles",
    surface: "Atmosphere bleu profond avec vents supersoniques et puissantes tempetes sombres.",
    tagline: "Le grand monde bleu battu par les vents les plus rapides.",
    moons: [
      { name: "Triton", radius: 1.0, distance: 18, speed: 1.2, color: "#dbe3ea", type: "Satellite naturel", diameter: "2 710 km", orbit: "354 800 km de Neptune", composition: "Glace d'azote, eau et roches", surface: "Plaines glacees et geysers d'azote sur un monde capture en orbite retrograde.", tagline: "Une lune active qui orbite a contre-courant." }
    ]
  }
];

let planets = [];

function populatePlanetList() {
  planetData.forEach((planet) => {
    const item = document.createElement("li");
    item.innerHTML = `<span class="planet-dot" style="color:${planet.color}; background:${planet.color}"></span>${planet.name}`;
    planetList.appendChild(item);
  });
}

function createSun() {
  const group = new THREE.Group();
  const geometry = new THREE.SphereGeometry(16, 48, 48);
  const material = new THREE.MeshBasicMaterial({ color: 0xffca56 });
  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  const glowGeometry = new THREE.SphereGeometry(22, 48, 48);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffcc66,
    transparent: true,
    opacity: 0.18
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  group.add(glow);

  return { group, mesh };
}

function createStarField() {
  const positions = [];
  const colors = [];
  const color = new THREE.Color();

  for (let i = 0; i < 2500; i += 1) {
    const radius = THREE.MathUtils.randFloat(600, 2200);
    const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    positions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );

    color.setHSL(0.58 + Math.random() * 0.08, 0.4, THREE.MathUtils.randFloat(0.7, 1));
    colors.push(color.r, color.g, color.b);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 2.2,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    vertexColors: true
  });

  return new THREE.Points(geometry, material);
}

function createOrbitLine(radius, color = 0x597091, opacity = 0.3) {
  const points = [];
  const segments = 128;

  for (let i = 0; i <= segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  return new THREE.LineLoop(geometry, material);
}

function createPlanetSystem(data, index) {
  const orbitPivot = new THREE.Group();
  solarRoot.add(orbitPivot);

  const orbitLine = createOrbitLine(data.distance, 0x5a6e8f, 0.35);
  solarRoot.add(orbitLine);
  orbitLines.push(orbitLine);

  const planetAnchor = new THREE.Group();
  planetAnchor.position.x = data.distance;
  orbitPivot.add(planetAnchor);

  const geometry = new THREE.SphereGeometry(data.radius, 36, 36);
  const material = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.95, metalness: 0.02 });
  const mesh = new THREE.Mesh(geometry, material);
  planetAnchor.add(mesh);

  if (data.ring) {
    const ringGeometry = new THREE.RingGeometry(data.ring.inner, data.ring.outer, 96);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: data.ring.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2.45;
    planetAnchor.add(ring);
  }

  const moonSystems = data.moons.map((moon, moonIndex) => createMoonSystem(moon, planetAnchor, index, moonIndex));

  mesh.userData.entry = { kind: "planet", data, mesh, anchor: planetAnchor, moons: moonSystems };
  pickables.push(mesh);
  createLabel(data.name, mesh);

  return { data, orbitPivot, anchor: planetAnchor, mesh, moons: moonSystems };
}

function createMoonSystem(data, planetAnchor, planetIndex, moonIndex) {
  const moonPivot = new THREE.Group();
  planetAnchor.add(moonPivot);

  const orbitLine = createOrbitLine(data.distance, 0x7b8797, 0.22);
  planetAnchor.add(orbitLine);
  orbitLines.push(orbitLine);

  const geometry = new THREE.SphereGeometry(data.radius, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: data.color, roughness: 1 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = data.distance;
  moonPivot.add(mesh);

  mesh.userData.entry = { kind: "moon", data, mesh, anchor: mesh, parentPlanetIndex: planetIndex, orbitSeed: moonIndex * 0.7 };
  pickables.push(mesh);
  createLabel(data.name, mesh);

  return { data, moonPivot, mesh, orbitLine };
}

function createAsteroidBelt() {
  const count = 1800;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();

  for (let i = 0; i < count; i += 1) {
    const radius = THREE.MathUtils.randFloat(88, 108);
    const angle = Math.random() * Math.PI * 2;
    const y = THREE.MathUtils.randFloatSpread(4);
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(angle) * radius;

    color.setHSL(0.08, 0.2, THREE.MathUtils.randFloat(0.45, 0.72));
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.75,
    transparent: true,
    opacity: 0.9,
    vertexColors: true
  });

  return new THREE.Points(geometry, material);
}

function createLabel(text, object) {
  const element = document.createElement("div");
  element.className = "space-label";
  element.textContent = text;
  labelLayer.appendChild(element);
  labels.push({ element, object });
}

function setInfoPanel(entry) {
  selectedName.textContent = entry.name;
  selectedTagline.textContent = entry.tagline;
  factType.textContent = entry.type;
  factDiameter.textContent = entry.diameter;
  factOrbit.textContent = entry.orbit;
  factComposition.textContent = entry.composition;
  detailSurface.textContent = entry.surface;
}

function setMoonList(moons) {
  moonList.innerHTML = "";

  if (!moons || moons.length === 0) {
    moonList.innerHTML = "<li>Aucune lune majeure visible autour de cet objet</li>";
    return;
  }

  moons.forEach((moon) => {
    const item = document.createElement("li");
    item.textContent = `${moon.name} - ${moon.tagline}`;
    moonList.appendChild(item);
  });
}

function setSelection(entry) {
  if (!entry) {
    focusTarget = solarRoot;
    focusDistance = 420;
    autoFocus = true;
    controls.maxDistance = 1600;
    controls.minDistance = 12;
    setInfoPanel(systemInfo);
    setMoonList([]);
    return;
  }

  focusTarget = entry.anchor;
  focusDistance = entry.kind === "planet" ? Math.max(entry.data.radius * 5.2, 22) : Math.max(entry.data.radius * 7.2, 12);
  autoFocus = true;
  controls.maxDistance = entry.kind === "planet" ? 180 : 60;
  controls.minDistance = Math.max(entry.data.radius * 2.2, 4);
  setInfoPanel(entry.data);

  if (entry.kind === "planet") {
    setMoonList(entry.data.moons);
  } else {
    const parent = planetData[entry.parentPlanetIndex];
    setMoonList(parent.moons);
  }
}

function updateLabels() {
  labels.forEach(({ element, object }) => {
    if (!labelToggle.checked) {
      element.style.display = "none";
      return;
    }

    object.getWorldPosition(projectedPosition);
    projectedPosition.project(camera);

    const isBehindCamera = projectedPosition.z > 1;
    const isOffScreen = Math.abs(projectedPosition.x) > 1.15 || Math.abs(projectedPosition.y) > 1.15;

    if (isBehindCamera || isOffScreen) {
      element.style.display = "none";
      return;
    }

    element.style.display = "block";
    element.style.left = `${(projectedPosition.x * 0.5 + 0.5) * labelLayer.clientWidth}px`;
    element.style.top = `${(-projectedPosition.y * 0.5 + 0.5) * labelLayer.clientHeight}px`;
  });
}

function updateFocus() {
  if (!focusTarget || !autoFocus) {
    return;
  }

  focusTarget.getWorldPosition(worldPosition);
  const desiredTarget = worldPosition.clone();
  controls.target.lerp(desiredTarget, 0.08);

  const direction = camera.position.clone().sub(controls.target);
  if (direction.lengthSq() === 0) {
    direction.set(1, 0.4, 1);
  }
  direction.normalize();

  const desiredPosition = desiredTarget.clone().add(direction.multiplyScalar(focusDistance));
  desiredPosition.y += focusDistance * 0.18;
  camera.position.lerp(desiredPosition, 0.04);
}

function animate() {
  const delta = clock.getDelta();
  const timeScale = Number(timeScaleInput.value) * 0.45;

  if (!paused) {
    planets.forEach((planet, index) => {
      planet.orbitPivot.rotation.y += delta * planet.data.orbitSpeed * timeScale * 0.12;
      planet.mesh.rotation.y += delta * planet.data.rotationSpeed * timeScale * 0.8;
      planet.mesh.rotation.z = Math.sin(clock.elapsedTime * 0.15 + index) * 0.03;

      planet.moons.forEach((moon, moonIndex) => {
        moon.moonPivot.rotation.y += delta * moon.data.speed * timeScale * 0.28;
        moon.mesh.rotation.y += delta * (0.6 + moonIndex * 0.1);
      });
    });

    sun.mesh.rotation.y += delta * 0.08;
    asteroidBelt.rotation.y += delta * 0.015 * timeScale;
  }

  updateFocus();
  controls.update();
  updateLabels();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function handleResize() {
  const { clientWidth, clientHeight } = sceneContainer;
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight, false);
}

function handlePointer(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersections = raycaster.intersectObjects(pickables, false);

  if (intersections.length > 0) {
    setSelection(intersections[0].object.userData.entry);
  }
}

function hideStatus() {
  statusOverlay.classList.add("is-hidden");
}

function showStatus(message, isError = false) {
  statusOverlay.textContent = message;
  statusOverlay.classList.remove("is-hidden");
  statusOverlay.classList.toggle("is-error", isError);
}

function bindUi() {
  timeScaleInput.addEventListener("input", () => {
    timeScaleLabel.textContent = `x${timeScaleInput.value}`;
  });

  pauseButton.addEventListener("click", () => {
    paused = !paused;
    pauseButton.textContent = paused ? "Reprendre" : "Pause";
  });

  resetViewButton.addEventListener("click", () => {
    camera.position.set(-140, 90, 180);
    controls.target.set(0, 0, 0);
    setSelection(null);
  });

  orbitToggle.addEventListener("change", () => {
    orbitLines.forEach((line) => {
      line.visible = orbitToggle.checked;
    });
  });

  labelToggle.addEventListener("change", updateLabels);

  asteroidToggle.addEventListener("change", () => {
    asteroidBelt.visible = asteroidToggle.checked;
  });

  window.addEventListener("resize", handleResize);
}

async function loadThree() {
  const threeModule = await import("https://unpkg.com/three@0.165.0/build/three.module.js");
  const controlsModule = await import("https://unpkg.com/three@0.165.0/examples/jsm/controls/OrbitControls.js");
  THREE = threeModule;
  OrbitControls = controlsModule.OrbitControls;
}

function setupScene() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  sceneContainer.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x02040a, 0.0009);

  camera = new THREE.PerspectiveCamera(52, 1, 0.1, 5000);
  camera.position.set(-140, 90, 180);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.04;
  controls.minDistance = 12;
  controls.maxDistance = 1200;
  controls.target.set(0, 0, 0);

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  clock = new THREE.Clock();
  worldPosition = new THREE.Vector3();
  projectedPosition = new THREE.Vector3();

  solarRoot = new THREE.Group();
  scene.add(solarRoot);

  ambientLight = new THREE.AmbientLight(0x7a88aa, 0.75);
  scene.add(ambientLight);

  sunLight = new THREE.PointLight(0xffd27c, 2.8, 0, 2);
  scene.add(sunLight);

  starField = createStarField();
  scene.add(starField);

  sun = createSun();
  solarRoot.add(sun.group);
  sunLight.position.copy(sun.group.position);

  populatePlanetList();
  planets = planetData.map((data, index) => createPlanetSystem(data, index));
  asteroidBelt = createAsteroidBelt();
  solarRoot.add(asteroidBelt);

  setInfoPanel(systemInfo);
  setSelection(null);
  timeScaleLabel.textContent = `x${timeScaleInput.value}`;

  renderer.domElement.addEventListener("pointerdown", handlePointer);
  handleResize();
}

async function bootstrap() {
  try {
    showStatus("Chargement de Three.js et de la scene 3D...");
    await loadThree();
    setupScene();
    bindUi();
    hideStatus();
    animate();
  } catch (error) {
    console.error(error);
    showStatus("Impossible de charger la scene 3D. Verifie ta connexion internet ou autorise le chargement du CDN externe.", true);
  }
}

bootstrap();
