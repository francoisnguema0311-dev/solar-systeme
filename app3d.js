import * as THREE from "./vendor/three/three.module.js";
import { OrbitControls } from "./vendor/three/OrbitControls.js";

const sceneContainer = document.getElementById("sceneContainer");
const labelLayer = document.getElementById("labelLayer");
const focusInfo = document.getElementById("focusInfo");
const clearSelectionButton = document.getElementById("clearSelectionButton");
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

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight, false);
sceneContainer.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07111f, 0.00022);

const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 5000);
camera.position.set(-180, 110, 240);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 8;
controls.maxDistance = 1800;
controls.target.set(0, 0, 0);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const clock = new THREE.Clock();
const projected = new THREE.Vector3();
const desiredTarget = new THREE.Vector3();

const state = {
  paused: false,
  selected: null,
  selectedRenderObject: null,
  desiredDistance: 760
};

const loader = new THREE.TextureLoader();
const labelMap = new Map();
const pickables = [];
const orbitLines = [];

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
  { name: "Mercure", texture: "assets/textures/mercury.jpg", color: "#b8b6b0", radius: 3.4, distance: 58, orbitSpeed: 1.1, rotationSpeed: 0.018, type: "Planete tellurique", diameter: "4 879 km", orbit: "57,9 millions de km du Soleil", composition: "Silicates et grand noyau metallique", surface: "Monde rocheux tres craterise avec des falaises, presque sans atmosphere et des variations thermiques extremes.", tagline: "La planete la plus proche du Soleil, compacte et brulee de lumiere.", moons: [] },
  { name: "Venus", texture: "assets/textures/venus.jpg", color: "#d4a763", radius: 4.9, distance: 88, orbitSpeed: 0.8, rotationSpeed: 0.008, type: "Planete tellurique", diameter: "12 104 km", orbit: "108,2 millions de km du Soleil", composition: "Roches silicatees et atmosphere dense de CO2", surface: "Surface volcanique et ecrasee sous une epaisse atmosphere acide. Les nuages piegent une chaleur intense.", tagline: "Une soeur infernale de la Terre, enfouie sous une atmosphere opaque.", moons: [] },
  { name: "Terre", texture: "assets/textures/earth.jpg", cloudTexture: "assets/textures/earth_clouds.jpg", color: "#4ea6ff", radius: 5.2, distance: 125, orbitSpeed: 0.62, rotationSpeed: 0.03, type: "Planete tellurique", diameter: "12 742 km", orbit: "149,6 millions de km du Soleil", composition: "Roches, eau liquide et atmosphere azote-oxygene", surface: "Oceans, continents, glaces et une biosphere active qui faconne l'atmosphere et les paysages.", tagline: "Le seul monde connu abritant durablement la vie.", moons: [{ name: "Lune", texture: "assets/textures/moon.jpg", radius: 1.2, distance: 13, speed: 1.8, rotationSpeed: 0.02, color: "#cfd4da", type: "Satellite naturel", diameter: "3 474 km", orbit: "384 400 km de la Terre", composition: "Roches silicatees", surface: "Plaines basaltiques sombres et hauts plateaux tres craterises.", tagline: "Le satellite qui stabilise l'inclinaison terrestre." }] },
  { name: "Mars", texture: "assets/textures/mars.jpg", color: "#e97c42", radius: 4.2, distance: 170, orbitSpeed: 0.44, rotationSpeed: 0.026, type: "Planete tellurique", diameter: "6 779 km", orbit: "227,9 millions de km du Soleil", composition: "Basaltes, oxydes de fer et glace d'eau", surface: "Deserts rouges, volcans geants, canyons profonds et calottes polaires saisonnieres.", tagline: "Une frontiere froide et poussiereuse qui fascine les missions d'exploration.", moons: [{ name: "Phobos", texture: "assets/textures/moon.jpg", radius: 0.8, distance: 10, speed: 2.2, rotationSpeed: 0.02, color: "#9a8f83", type: "Satellite naturel", diameter: "22 km", orbit: "9 377 km de Mars", composition: "Roches sombres et regolithe", surface: "Petit corps irregulier tres craterise.", tagline: "Une lune proche qui se rapproche lentement de Mars." }, { name: "Deimos", texture: "assets/textures/moon.jpg", radius: 0.6, distance: 15, speed: 1.5, rotationSpeed: 0.02, color: "#b7aa96", type: "Satellite naturel", diameter: "12 km", orbit: "23 460 km de Mars", composition: "Roches riches en carbone", surface: "Objet discret et poudreux, probablement capture.", tagline: "La plus externe des deux lunes martiennes." }] },
  { name: "Jupiter", texture: "assets/textures/jupiter.jpg", color: "#d6b08d", radius: 12.4, distance: 275, orbitSpeed: 0.22, rotationSpeed: 0.05, type: "Geante gazeuse", diameter: "139 820 km", orbit: "778,5 millions de km du Soleil", composition: "Hydrogene, helium et traces d'ammoniac", surface: "Pas de surface solide nette: on observe des bandes nuageuses, des tempetes et la Grande Tache rouge.", tagline: "Le geant du systeme solaire, gardien de nombreuses lunes.", moons: [{ name: "Io", texture: "assets/textures/moon.jpg", radius: 1.3, distance: 21, speed: 2.4, rotationSpeed: 0.03, color: "#f4d35e", type: "Satellite naturel", diameter: "3 643 km", orbit: "421 700 km de Jupiter", composition: "Roches silicatees et soufre", surface: "Le monde le plus volcanique connu, parseme de plaines jaunes et noires.", tagline: "Une lune secouee par des forces de maree extremes." }, { name: "Europe", texture: "assets/textures/moon.jpg", radius: 1.2, distance: 29, speed: 1.8, rotationSpeed: 0.03, color: "#dfe7f2", type: "Satellite naturel", diameter: "3 122 km", orbit: "670 900 km de Jupiter", composition: "Glace d'eau et ocean interne probable", surface: "Croute glacee striee de fissures avec peut-etre un ocean liquide en dessous.", tagline: "Une cible majeure dans la recherche de vie extraterrestre." }, { name: "Ganymede", texture: "assets/textures/moon.jpg", radius: 1.65, distance: 38, speed: 1.25, rotationSpeed: 0.03, color: "#9eb0bb", type: "Satellite naturel", diameter: "5 268 km", orbit: "1 070 400 km de Jupiter", composition: "Glace et roches", surface: "La plus grande lune du systeme solaire, avec terrains sombres et regions striees.", tagline: "Une lune geante dotee de son propre champ magnetique." }, { name: "Callisto", texture: "assets/textures/moon.jpg", radius: 1.5, distance: 49, speed: 0.95, rotationSpeed: 0.03, color: "#807b74", type: "Satellite naturel", diameter: "4 821 km", orbit: "1 882 700 km de Jupiter", composition: "Glace, roches et materiaux sombres", surface: "Tres ancienne et couverte de crateres, presque sans activite geologique recente.", tagline: "Une archive glacee des premiers temps du systeme solaire." }] },
  { name: "Saturne", texture: "assets/textures/saturn.jpg", ringTexture: "assets/textures/saturn_ring.png", color: "#dec58d", radius: 10.4, distance: 390, orbitSpeed: 0.14, rotationSpeed: 0.042, type: "Geante gazeuse", diameter: "116 460 km", orbit: "1,43 milliard de km du Soleil", composition: "Hydrogene, helium et cristaux de glace", surface: "Immense atmosphere stratifiee et systeme d'anneaux constitue de glace, poussiere et debris rocheux.", tagline: "La planete aux anneaux, delicate et spectaculaire.", ring: true, moons: [{ name: "Titan", texture: "assets/textures/moon.jpg", radius: 1.55, distance: 28, speed: 1.1, rotationSpeed: 0.03, color: "#d9a35f", type: "Satellite naturel", diameter: "5 150 km", orbit: "1 221 900 km de Saturne", composition: "Glace, roches et atmosphere azotee", surface: "Mers d'hydrocarbures, dunes et brouillard orange epais.", tagline: "Un monde a atmosphere dense, unique parmi les lunes." }, { name: "Encelade", texture: "assets/textures/moon.jpg", radius: 0.85, distance: 19, speed: 1.95, rotationSpeed: 0.03, color: "#e8f1ff", type: "Satellite naturel", diameter: "504 km", orbit: "238 000 km de Saturne", composition: "Glace d'eau et ocean sale probable", surface: "Surface glacee tres brillante avec geysers ejectant de la vapeur d'eau.", tagline: "Une petite lune tres active, riche en indices d'habitabilite." }] },
  { name: "Uranus", texture: "assets/textures/uranus.jpg", color: "#8fd8ea", radius: 7.8, distance: 525, orbitSpeed: 0.09, rotationSpeed: 0.03, type: "Geante de glace", diameter: "50 724 km", orbit: "2,87 milliards de km du Soleil", composition: "Glaces, hydrogene, helium et methane", surface: "Une atmosphere bleutee froide et calme en apparence, avec un axe de rotation tres incline.", tagline: "Une geante glacee couchee sur le cote.", ring: true, moons: [{ name: "Titania", texture: "assets/textures/moon.jpg", radius: 1.05, distance: 20, speed: 1.12, rotationSpeed: 0.03, color: "#c7d0d5", type: "Satellite naturel", diameter: "1 578 km", orbit: "436 000 km d'Uranus", composition: "Glace et roches", surface: "Falaises, crateres et plaines glacees.", tagline: "La plus grande lune d'Uranus." }, { name: "Oberon", texture: "assets/textures/moon.jpg", radius: 0.95, distance: 28, speed: 0.82, rotationSpeed: 0.03, color: "#9ea2a8", type: "Satellite naturel", diameter: "1 523 km", orbit: "584 000 km d'Uranus", composition: "Glace et roches", surface: "Monde sombre et ancien, marque par des crateres d'impact.", tagline: "Une lune externe froide et craterisee." }] },
  { name: "Neptune", texture: "assets/textures/neptune.jpg", color: "#3a73ff", radius: 7.5, distance: 660, orbitSpeed: 0.06, rotationSpeed: 0.03, type: "Geante de glace", diameter: "49 244 km", orbit: "4,5 milliards de km du Soleil", composition: "Hydrogene, helium, methane et glaces volatiles", surface: "Atmosphere bleu profond avec vents supersoniques et puissantes tempetes sombres.", tagline: "Le grand monde bleu battu par les vents les plus rapides.", moons: [{ name: "Triton", texture: "assets/textures/moon.jpg", radius: 1.1, distance: 24, speed: 1.22, rotationSpeed: 0.03, color: "#dbe3ea", type: "Satellite naturel", diameter: "2 710 km", orbit: "354 800 km de Neptune", composition: "Glace d'azote, eau et roches", surface: "Plaines glacees et geysers d'azote sur un monde capture en orbite retrograde.", tagline: "Une lune active qui orbite a contre-courant." }] }
];

const systemRoot = new THREE.Group();
scene.add(systemRoot);

const ambientLight = new THREE.AmbientLight(0xa7b9d6, 1.15);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xfff1c1, 6.2, 0, 2);
scene.add(sunLight);

const hemiLight = new THREE.HemisphereLight(0xbfe1ff, 0x16202e, 0.72);
scene.add(hemiLight);

const fillLight = new THREE.DirectionalLight(0x9dc7ff, 0.42);
fillLight.position.set(-220, 120, 180);
scene.add(fillLight);

const starField = createStarField();
scene.add(starField);

const distantGlow = new THREE.Mesh(
  new THREE.SphereGeometry(4100, 32, 32),
  new THREE.MeshBasicMaterial({
    color: 0x163457,
    transparent: true,
    opacity: 0.07,
    side: THREE.BackSide
  })
);
scene.add(distantGlow);

const asteroids = createAsteroidBelt(900, 132, 175, 5, 0xc8b79c);
const kuiper = createAsteroidBelt(700, 760, 950, 14, 0x9eb9e4);
systemRoot.add(asteroids);
systemRoot.add(kuiper);

const sun = createSun();
systemRoot.add(sun.group);
sunLight.position.copy(sun.group.position);

populatePlanetList();
const planets = planetData.map((planet, index) => createPlanetSystem(planet, index));

setInfoPanel(systemInfo);
setMoonList([]);
timeScaleLabel.textContent = `x${timeScaleInput.value}`;
focusInfo.classList.add("is-hidden");
clearSelectionButton.classList.add("is-hidden");

function loadTexture(path) {
  return loader.load(path, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
  });
}

function createStarField() {
  const positions = [];
  const colors = [];
  const color = new THREE.Color();
  for (let i = 0; i < 5200; i += 1) {
    const radius = THREE.MathUtils.randFloat(900, 4200);
    const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    positions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
    color.setHSL(0.58 + Math.random() * 0.08, 0.45, THREE.MathUtils.randFloat(0.72, 1));
    colors.push(color.r, color.g, color.b);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ size: 1.9, sizeAttenuation: true, transparent: true, opacity: 0.95, vertexColors: true })
  );
}

function createAsteroidBelt(count, inner, outer, spreadY, colorHex) {
  const positions = [];
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = THREE.MathUtils.randFloat(inner, outer);
    positions.push(
      Math.cos(angle) * radius,
      THREE.MathUtils.randFloatSpread(spreadY),
      Math.sin(angle) * radius
    );
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ size: 0.9, transparent: true, opacity: 0.78, color: colorHex })
  );
}

function createSun() {
  const group = new THREE.Group();
  const texture = loadTexture("assets/textures/sun.jpg");
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(18, 64, 64),
    new THREE.MeshBasicMaterial({ map: texture })
  );
  group.add(mesh);
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(25, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xffcb70, transparent: true, opacity: 0.2 })
  );
  group.add(glow);
  return { group, mesh };
}

function createOrbitLine(radius, color = 0x4f6788, opacity = 0.22) {
  const points = [];
  for (let i = 0; i <= 160; i += 1) {
    const angle = (i / 160) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.LineLoop(
    geometry,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  );
  orbitLines.push(line);
  return line;
}

function createPlanetSystem(data, index) {
  const orbitPivot = new THREE.Group();
  systemRoot.add(orbitPivot);
  const orbitLine = createOrbitLine(data.distance);
  systemRoot.add(orbitLine);

  const anchor = new THREE.Group();
  anchor.position.x = data.distance;
  orbitPivot.add(anchor);

  const texture = loadTexture(data.texture);
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(data.radius, 64, 64),
    new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.72,
      metalness: 0.02,
      emissive: new THREE.Color(data.color).multiplyScalar(0.12),
      emissiveIntensity: 0.7
    })
  );
  anchor.add(mesh);

  let clouds = null;
  if (data.cloudTexture) {
    clouds = new THREE.Mesh(
      new THREE.SphereGeometry(data.radius * 1.02, 48, 48),
      new THREE.MeshStandardMaterial({
        map: loadTexture(data.cloudTexture),
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.08
      })
    );
    anchor.add(clouds);
  }

  let ring = null;
  if (data.ring) {
    ring = createRingMesh(data);
    anchor.add(ring);
  }

  const moons = data.moons.map((moon, moonIndex) => createMoonSystem(moon, anchor, index, moonIndex));

  mesh.userData.entry = { kind: "planet", data, anchor, mesh, moons };
  pickables.push(mesh);
  ensureLabel(data.name);

  return { data, orbitPivot, anchor, mesh, clouds, ring, moons };
}

function createRingMesh(data) {
  const texture = data.ringTexture ? loadTexture(data.ringTexture) : null;
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(data.radius * 1.25, data.radius * 2.2, 128),
    new THREE.MeshBasicMaterial({
      map: texture,
      color: 0xf4e5bf,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    })
  );
  ring.rotation.x = -1.1;
  return ring;
}

function createMoonSystem(data, parentAnchor, planetIndex, moonIndex) {
  const pivot = new THREE.Group();
  parentAnchor.add(pivot);

  const orbitLine = createOrbitLine(data.distance, 0x7d8a9d, 0.16);
  parentAnchor.add(orbitLine);

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(data.radius, 32, 32),
    new THREE.MeshStandardMaterial({
      map: loadTexture(data.texture),
      roughness: 0.78,
      emissive: new THREE.Color(data.color).multiplyScalar(0.09),
      emissiveIntensity: 0.55
    })
  );
  mesh.position.x = data.distance;
  pivot.add(mesh);

  mesh.userData.entry = { kind: "moon", data, anchor: mesh, mesh, planetIndex, moonIndex, parentName: planetData[planetIndex].name };
  pickables.push(mesh);
  ensureLabel(data.name);
  return { data, pivot, mesh, orbitLine };
}

function ensureLabel(name) {
  if (!labelMap.has(name)) {
    const element = document.createElement("div");
    element.className = "space-label";
    element.textContent = name;
    element.style.display = "none";
    labelLayer.appendChild(element);
    labelMap.set(name, element);
  }
  return labelMap.get(name);
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

function populatePlanetList() {
  planetData.forEach((planet) => {
    const item = document.createElement("li");
    item.innerHTML = `<span class="planet-dot" style="color:${planet.color}; background:${planet.color}"></span>${planet.name}`;
    planetList.appendChild(item);
  });
}

function setSelection(entry) {
  state.selected = entry;
  state.selectedRenderObject = entry ? entry.mesh || entry.anchor : null;

  if (!entry) {
    clearSelectionButton.classList.add("is-hidden");
    focusInfo.classList.add("is-hidden");
    setInfoPanel(systemInfo);
    setMoonList([]);
    state.desiredDistance = 760;
    return;
  }

  clearSelectionButton.classList.remove("is-hidden");
  setInfoPanel(entry.data);
  setMoonList(entry.kind === "planet" ? entry.data.moons : planetData[entry.planetIndex].moons);
  state.desiredDistance = entry.kind === "planet"
    ? Math.max(entry.data.radius * 7.5, 40)
    : Math.max(entry.data.radius * 14, 16);
}

function clearSelection() {
  setSelection(null);
}

function updateSelectionUi() {
  if (!state.selected || !state.selectedRenderObject) {
    focusInfo.classList.add("is-hidden");
    return;
  }

  state.selectedRenderObject.getWorldPosition(projected);
  projected.project(camera);

  const x = (projected.x * 0.5 + 0.5) * sceneContainer.clientWidth;
  const y = (-projected.y * 0.5 + 0.5) * sceneContainer.clientHeight;

  focusInfo.classList.remove("is-hidden");
  focusInfo.innerHTML = `
    <h3>${state.selected.data.name}</h3>
    <p>${state.selected.data.tagline}</p>
    <dl>
      <dt>Type</dt><dd>${state.selected.data.type}</dd>
      <dt>Diametre</dt><dd>${state.selected.data.diameter}</dd>
      <dt>Orbite</dt><dd>${state.selected.data.orbit}</dd>
      <dt>Composition</dt><dd>${state.selected.data.composition}</dd>
    </dl>
  `;

  focusInfo.style.left = `${Math.min(sceneContainer.clientWidth - 332, Math.max(16, x + 28))}px`;
  focusInfo.style.top = `${Math.min(sceneContainer.clientHeight - 190, Math.max(16, y - 60))}px`;
}

function updateLabels() {
  labelMap.forEach((label) => {
    label.style.display = "none";
  });

  if (!labelToggle.checked) {
    return;
  }

  pickables.forEach((object) => {
    object.getWorldPosition(projected);
    projected.project(camera);
    if (projected.z > 1) {
      return;
    }
    const x = (projected.x * 0.5 + 0.5) * sceneContainer.clientWidth;
    const y = (-projected.y * 0.5 + 0.5) * sceneContainer.clientHeight;
    const label = labelMap.get(object.userData.entry.data.name);
    if (!label) {
      return;
    }
    label.style.display = "block";
    label.style.left = `${x}px`;
    label.style.top = `${y - 18}px`;
  });
}

function updateScene(delta) {
  const speed = Number(timeScaleInput.value) * 0.18;
  if (!state.paused) {
    planets.forEach((planet, index) => {
      planet.orbitPivot.rotation.y += delta * planet.data.orbitSpeed * speed * 0.16;
      planet.mesh.rotation.y += delta * planet.data.rotationSpeed;
      if (planet.clouds) {
        planet.clouds.rotation.y += delta * 0.01;
      }
      if (planet.ring) {
        planet.ring.rotation.z = Math.sin(clock.elapsedTime * 0.15 + index) * 0.02;
      }
      planet.moons.forEach((moon) => {
        moon.pivot.rotation.y += delta * moon.data.speed * speed * 0.3;
        moon.mesh.rotation.y += delta * moon.data.rotationSpeed;
      });
    });
    sun.mesh.rotation.y += delta * 0.02;
    asteroids.rotation.y += delta * 0.01 * speed;
    kuiper.rotation.y += delta * 0.004 * speed;
  }

  desiredTarget.set(0, 0, 0);
  if (state.selectedRenderObject) {
    state.selectedRenderObject.getWorldPosition(desiredTarget);
  }
  controls.target.lerp(desiredTarget, 0.08);

  const currentDistance = camera.position.distanceTo(controls.target);
  const nextDistance = currentDistance + (state.desiredDistance - currentDistance) * 0.08;
  const direction = camera.position.clone().sub(controls.target).normalize();
  camera.position.copy(controls.target.clone().add(direction.multiplyScalar(nextDistance)));
}

function handlePointer(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pickables, false);
  if (hits.length > 0) {
    setSelection(hits[0].object.userData.entry);
  } else {
    clearSelection();
  }
}

function handleResize() {
  const width = sceneContainer.clientWidth;
  const height = sceneContainer.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(0.04, clock.getDelta());
  updateScene(delta);
  controls.update();
  updateLabels();
  updateSelectionUi();
  renderer.render(scene, camera);
}

renderer.domElement.addEventListener("pointerdown", handlePointer);
window.addEventListener("resize", handleResize);

timeScaleInput.addEventListener("input", () => {
  timeScaleLabel.textContent = `x${timeScaleInput.value}`;
});

pauseButton.addEventListener("click", () => {
  state.paused = !state.paused;
  pauseButton.textContent = state.paused ? "Reprendre" : "Pause";
});

resetViewButton.addEventListener("click", () => {
  camera.position.set(-180, 110, 240);
  controls.target.set(0, 0, 0);
  clearSelection();
});

clearSelectionButton.addEventListener("click", clearSelection);

orbitToggle.addEventListener("change", () => {
  orbitLines.forEach((line) => {
    line.visible = orbitToggle.checked;
  });
});

asteroidToggle.addEventListener("change", () => {
  asteroids.visible = asteroidToggle.checked;
  kuiper.visible = asteroidToggle.checked;
});

handleResize();
animate();
statusOverlay.classList.add("is-hidden");
