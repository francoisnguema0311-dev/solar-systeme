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

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
sceneContainer.appendChild(canvas);

const TAU = Math.PI * 2;

const state = {
  width: 0,
  height: 0,
  dpr: Math.min(window.devicePixelRatio || 1, 2),
  paused: false,
  clock: 0,
  dragging: false,
  pointerMoved: false,
  lastX: 0,
  lastY: 0,
  focus: null,
  camera: {
    yaw: -0.95,
    pitch: 0.42,
    distance: 420,
    target: { x: 0, y: 0, z: 0 }
  }
};

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
  { name: "Mercure", color: "#b8b6b0", radius: 5, distance: 42, orbitSpeed: 1.1, type: "Planete tellurique", diameter: "4 879 km", orbit: "57,9 millions de km du Soleil", composition: "Silicates et grand noyau metallique", surface: "Monde rocheux tres craterise avec des falaises, presque sans atmosphere et des variations thermiques extremes.", tagline: "La planete la plus proche du Soleil, compacte et brulee de lumiere.", moons: [] },
  { name: "Venus", color: "#d4a763", radius: 7.5, distance: 60, orbitSpeed: 0.8, type: "Planete tellurique", diameter: "12 104 km", orbit: "108,2 millions de km du Soleil", composition: "Roches silicatees et atmosphere dense de CO2", surface: "Surface volcanique et ecrasee sous une epaisse atmosphere acide. Les nuages piegent une chaleur intense.", tagline: "Une soeur infernale de la Terre, enfouie sous une atmosphere opaque.", moons: [] },
  { name: "Terre", color: "#4ea6ff", radius: 8.2, distance: 82, orbitSpeed: 0.62, type: "Planete tellurique", diameter: "12 742 km", orbit: "149,6 millions de km du Soleil", composition: "Roches, eau liquide et atmosphere azote-oxygene", surface: "Oceans, continents, glaces et une biosphere active qui faconne l'atmosphere et les paysages.", tagline: "Le seul monde connu abritant durablement la vie.", moons: [{ name: "Lune", radius: 1.8, distance: 16, speed: 1.8, color: "#cfd4da", type: "Satellite naturel", diameter: "3 474 km", orbit: "384 400 km de la Terre", composition: "Roches silicatees", surface: "Plaines basaltiques sombres et hauts plateaux tres craterises.", tagline: "Le satellite qui stabilise l'inclinaison terrestre." }] },
  { name: "Mars", color: "#e97c42", radius: 6.4, distance: 110, orbitSpeed: 0.44, type: "Planete tellurique", diameter: "6 779 km", orbit: "227,9 millions de km du Soleil", composition: "Basaltes, oxydes de fer et glace d'eau", surface: "Deserts rouges, volcans geants, canyons profonds et calottes polaires saisonnieres.", tagline: "Une frontiere froide et poussiereuse qui fascine les missions d'exploration.", moons: [{ name: "Phobos", radius: 1.2, distance: 12, speed: 2.2, color: "#9a8f83", type: "Satellite naturel", diameter: "22 km", orbit: "9 377 km de Mars", composition: "Roches sombres et regolithe", surface: "Petit corps irregulier tres craterise.", tagline: "Une lune proche qui se rapproche lentement de Mars." }, { name: "Deimos", radius: 0.9, distance: 18, speed: 1.5, color: "#b7aa96", type: "Satellite naturel", diameter: "12 km", orbit: "23 460 km de Mars", composition: "Roches riches en carbone", surface: "Objet discret et poudreux, probablement capture.", tagline: "La plus externe des deux lunes martiennes." }] },
  { name: "Jupiter", color: "#d6b08d", radius: 18, distance: 170, orbitSpeed: 0.22, type: "Geante gazeuse", diameter: "139 820 km", orbit: "778,5 millions de km du Soleil", composition: "Hydrogene, helium et traces d'ammoniac", surface: "Pas de surface solide nette: on observe des bandes nuageuses, des tempetes et la Grande Tache rouge.", tagline: "Le geant du systeme solaire, gardien de nombreuses lunes.", moons: [{ name: "Io", radius: 1.7, distance: 25, speed: 2.4, color: "#f4d35e", type: "Satellite naturel", diameter: "3 643 km", orbit: "421 700 km de Jupiter", composition: "Roches silicatees et soufre", surface: "Le monde le plus volcanique connu, parseme de plaines jaunes et noires.", tagline: "Une lune secouee par des forces de maree extremes." }, { name: "Europe", radius: 1.6, distance: 34, speed: 1.8, color: "#dfe7f2", type: "Satellite naturel", diameter: "3 122 km", orbit: "670 900 km de Jupiter", composition: "Glace d'eau et ocean interne probable", surface: "Croute glacee striee de fissures avec peut-etre un ocean liquide en dessous.", tagline: "Une cible majeure dans la recherche de vie extraterrestre." }, { name: "Ganymede", radius: 2.2, distance: 44, speed: 1.25, color: "#9eb0bb", type: "Satellite naturel", diameter: "5 268 km", orbit: "1 070 400 km de Jupiter", composition: "Glace et roches", surface: "La plus grande lune du systeme solaire, avec terrains sombres et regions striees.", tagline: "Une lune geante dotee de son propre champ magnetique." }, { name: "Callisto", radius: 2, distance: 56, speed: 0.95, color: "#807b74", type: "Satellite naturel", diameter: "4 821 km", orbit: "1 882 700 km de Jupiter", composition: "Glace, roches et materiaux sombres", surface: "Tres ancienne et couverte de crateres, presque sans activite geologique recente.", tagline: "Une archive glacee des premiers temps du systeme solaire." }] },
  { name: "Saturne", color: "#dec58d", radius: 15.6, distance: 235, orbitSpeed: 0.14, type: "Geante gazeuse", diameter: "116 460 km", orbit: "1,43 milliard de km du Soleil", composition: "Hydrogene, helium et cristaux de glace", surface: "Immense atmosphere stratifiee et systeme d'anneaux constitue de glace, poussiere et debris rocheux.", tagline: "La planete aux anneaux, delicate et spectaculaire.", ring: true, moons: [{ name: "Titan", radius: 2.1, distance: 34, speed: 1.1, color: "#d9a35f", type: "Satellite naturel", diameter: "5 150 km", orbit: "1 221 900 km de Saturne", composition: "Glace, roches et atmosphere azotee", surface: "Mers d'hydrocarbures, dunes et brouillard orange epais.", tagline: "Un monde a atmosphere dense, unique parmi les lunes." }, { name: "Encelade", radius: 1.2, distance: 23, speed: 1.95, color: "#e8f1ff", type: "Satellite naturel", diameter: "504 km", orbit: "238 000 km de Saturne", composition: "Glace d'eau et ocean sale probable", surface: "Surface glacee tres brillante avec geysers ejectant de la vapeur d'eau.", tagline: "Une petite lune tres active, riche en indices d'habitabilite." }] },
  { name: "Uranus", color: "#8fd8ea", radius: 12.2, distance: 305, orbitSpeed: 0.09, type: "Geante de glace", diameter: "50 724 km", orbit: "2,87 milliards de km du Soleil", composition: "Glaces, hydrogene, helium et methane", surface: "Une atmosphere bleutee froide et calme en apparence, avec un axe de rotation tres incline.", tagline: "Une geante glacee couchee sur le cote.", ring: true, moons: [{ name: "Titania", radius: 1.6, distance: 24, speed: 1.12, color: "#c7d0d5", type: "Satellite naturel", diameter: "1 578 km", orbit: "436 000 km d'Uranus", composition: "Glace et roches", surface: "Falaises, crateres et plaines glacees.", tagline: "La plus grande lune d'Uranus." }, { name: "Oberon", radius: 1.45, distance: 33, speed: 0.82, color: "#9ea2a8", type: "Satellite naturel", diameter: "1 523 km", orbit: "584 000 km d'Uranus", composition: "Glace et roches", surface: "Monde sombre et ancien, marque par des crateres d'impact.", tagline: "Une lune externe froide et craterisee." }] },
  { name: "Neptune", color: "#3a73ff", radius: 11.8, distance: 365, orbitSpeed: 0.06, type: "Geante de glace", diameter: "49 244 km", orbit: "4,5 milliards de km du Soleil", composition: "Hydrogene, helium, methane et glaces volatiles", surface: "Atmosphere bleu profond avec vents supersoniques et puissantes tempetes sombres.", tagline: "Le grand monde bleu battu par les vents les plus rapides.", moons: [{ name: "Triton", radius: 1.7, distance: 28, speed: 1.22, color: "#dbe3ea", type: "Satellite naturel", diameter: "2 710 km", orbit: "354 800 km de Neptune", composition: "Glace d'azote, eau et roches", surface: "Plaines glacees et geysers d'azote sur un monde capture en orbite retrograde.", tagline: "Une lune active qui orbite a contre-courant." }] }
];

const planets = planetData.map((planet, index) => ({
  ...planet,
  angle: index * 0.7,
  x: 0,
  y: 0,
  z: 0,
  moonsRuntime: planet.moons.map((moon, moonIndex) => ({
    ...moon,
    angle: moonIndex * 0.9,
    x: 0,
    y: 0,
    z: 0,
    parentName: planet.name
  }))
}));

const stars = Array.from({ length: 1600 }, () => ({
  x: (Math.random() - 0.5) * 3200,
  y: (Math.random() - 0.5) * 1800,
  z: Math.random() * 2800 + 500,
  size: Math.random() * 1.8 + 0.4,
  alpha: Math.random() * 0.7 + 0.25,
  pulse: Math.random() * TAU,
  pulseSpeed: Math.random() * 1.8 + 0.3
}));

const asteroids = Array.from({ length: 1400 }, () => {
  const angle = Math.random() * TAU;
  const radius = 132 + Math.random() * 40;
  return { x: Math.cos(angle) * radius, y: (Math.random() - 0.5) * 7, z: Math.sin(angle) * radius, size: Math.random() * 1.3 + 0.2 };
});

function showStatus(message, isError = false) {
  statusOverlay.textContent = message;
  statusOverlay.classList.remove("is-hidden");
  statusOverlay.classList.toggle("is-error", isError);
}

function hideStatus() {
  statusOverlay.classList.add("is-hidden");
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

function setSelection(target) {
  state.focus = target;
  if (!target) {
    setInfoPanel(systemInfo);
    setMoonList([]);
    return;
  }
  setInfoPanel(target);
  if (target.parentName) {
    const parent = planets.find((planet) => planet.name === target.parentName);
    setMoonList(parent ? parent.moons : []);
  } else {
    setMoonList(target.moons);
  }
}

function resize() {
  state.width = sceneContainer.clientWidth;
  state.height = sceneContainer.clientHeight;
  canvas.width = state.width * state.dpr;
  canvas.height = state.height * state.dpr;
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
}

function orbitCamera(deltaYaw, deltaPitch) {
  state.camera.yaw += deltaYaw;
  state.camera.pitch = Math.max(-1.2, Math.min(1.2, state.camera.pitch + deltaPitch));
}

function zoomCamera(multiplier) {
  state.camera.distance = Math.max(22, Math.min(900, state.camera.distance * multiplier));
}

function worldToCamera(point) {
  const target = state.camera.target;
  const tx = point.x - target.x;
  const ty = point.y - target.y;
  const tz = point.z - target.z;
  const cosYaw = Math.cos(-state.camera.yaw);
  const sinYaw = Math.sin(-state.camera.yaw);
  const x1 = tx * cosYaw - tz * sinYaw;
  const z1 = tx * sinYaw + tz * cosYaw;
  const cosPitch = Math.cos(-state.camera.pitch);
  const sinPitch = Math.sin(-state.camera.pitch);
  const y2 = ty * cosPitch - z1 * sinPitch;
  const z2 = ty * sinPitch + z1 * cosPitch;
  return { x: x1, y: y2, z: z2 + state.camera.distance };
}

function project(point) {
  const cam = worldToCamera(point);
  if (cam.z <= 0.1) {
    return null;
  }
  const focal = Math.min(state.width, state.height) * 0.92;
  return {
    x: state.width / 2 + (cam.x / cam.z) * focal,
    y: state.height / 2 - (cam.y / cam.z) * focal,
    scale: focal / cam.z,
    depth: cam.z
  };
}

function planetWorldPosition(planet) {
  return { x: Math.cos(planet.angle) * planet.distance, y: Math.sin(planet.angle * 0.6) * 8, z: Math.sin(planet.angle) * planet.distance };
}

function moonWorldPosition(planet, moon) {
  return { x: planet.x + Math.cos(moon.angle) * moon.distance, y: planet.y + Math.sin(moon.angle * 1.7) * 2.5, z: planet.z + Math.sin(moon.angle) * moon.distance };
}

function updateScene(dt) {
  const speed = Number(timeScaleInput.value) * 0.18;
  state.clock += dt;
  planets.forEach((planet) => {
    if (!state.paused) {
      planet.angle += dt * planet.orbitSpeed * speed * 0.16;
    }
    const position = planetWorldPosition(planet);
    planet.x = position.x;
    planet.y = position.y;
    planet.z = position.z;

    planet.moonsRuntime.forEach((moon) => {
      if (!state.paused) {
        moon.angle += dt * moon.speed * speed * 0.3;
      }
      const moonPos = moonWorldPosition(planet, moon);
      moon.x = moonPos.x;
      moon.y = moonPos.y;
      moon.z = moonPos.z;
    });
  });

  const targetPoint = state.focus ? { x: state.focus.x || 0, y: state.focus.y || 0, z: state.focus.z || 0 } : { x: 0, y: 0, z: 0 };
  state.camera.target.x += (targetPoint.x - state.camera.target.x) * 0.06;
  state.camera.target.y += (targetPoint.y - state.camera.target.y) * 0.06;
  state.camera.target.z += (targetPoint.z - state.camera.target.z) * 0.06;

  const desiredDistance = state.focus ? Math.max((state.focus.radius || 10) * (state.focus.parentName ? 12 : 8), state.focus.parentName ? 26 : 44) : 420;
  state.camera.distance += (desiredDistance - state.camera.distance) * 0.05;
}

function drawBackground() {
  const gradient = ctx.createRadialGradient(state.width * 0.48, state.height * 0.35, 0, state.width * 0.5, state.height * 0.5, Math.max(state.width, state.height) * 0.8);
  gradient.addColorStop(0, "#132131");
  gradient.addColorStop(0.55, "#07111f");
  gradient.addColorStop(1, "#01050c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.width, state.height);

  const nebulaA = ctx.createRadialGradient(state.width * 0.78, state.height * 0.2, 0, state.width * 0.78, state.height * 0.2, state.width * 0.28);
  nebulaA.addColorStop(0, "rgba(61, 131, 255, 0.13)");
  nebulaA.addColorStop(1, "rgba(61, 131, 255, 0)");
  ctx.fillStyle = nebulaA;
  ctx.fillRect(0, 0, state.width, state.height);

  const nebulaB = ctx.createRadialGradient(state.width * 0.18, state.height * 0.72, 0, state.width * 0.18, state.height * 0.72, state.width * 0.22);
  nebulaB.addColorStop(0, "rgba(251, 113, 133, 0.1)");
  nebulaB.addColorStop(1, "rgba(251, 113, 133, 0)");
  ctx.fillStyle = nebulaB;
  ctx.fillRect(0, 0, state.width, state.height);
}

function drawStars() {
  stars.forEach((star) => {
    const projection = project(star);
    if (!projection) {
      return;
    }
    const twinkle = 0.72 + Math.sin(state.clock * star.pulseSpeed + star.pulse) * 0.28;
    ctx.fillStyle = `rgba(255,255,255,${star.alpha * twinkle})`;
    ctx.beginPath();
    ctx.arc(projection.x, projection.y, Math.max(0.2, star.size * projection.scale * 0.4), 0, TAU);
    ctx.fill();
  });
}

function drawOrbitPath(center, radius, strokeStyle) {
  let started = false;
  ctx.beginPath();
  for (let step = 0; step <= 72; step += 1) {
    const angle = (step / 72) * TAU;
    const point = { x: center.x + Math.cos(angle) * radius, y: center.y, z: center.z + Math.sin(angle) * radius };
    const p = project(point);
    if (!p) {
      continue;
    }
    if (!started) {
      ctx.moveTo(p.x, p.y);
      started = true;
    } else {
      ctx.lineTo(p.x, p.y);
    }
  }
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawOrbits() {
  if (!orbitToggle.checked) {
    return;
  }
  planets.forEach((planet) => {
    drawOrbitPath({ x: 0, y: 0, z: 0 }, planet.distance, "rgba(110,140,180,0.28)");
    planet.moonsRuntime.forEach((moon) => drawOrbitPath(planet, moon.distance, "rgba(170,180,200,0.14)"));
  });
}

function createRenderables() {
  const items = [];
  const sunProjection = project({ x: 0, y: 0, z: 0 });
  if (sunProjection) {
    items.push({ kind: "sun", projection: sunProjection, radius: Math.max(18, sunProjection.scale * 18), depth: sunProjection.depth });
  }
  if (asteroidToggle.checked) {
    asteroids.forEach((asteroid) => {
      const p = project(asteroid);
      if (p) {
        items.push({ kind: "asteroid", projection: p, radius: Math.max(0.2, asteroid.size * p.scale * 0.4), depth: p.depth });
      }
    });
  }
  planets.forEach((planet) => {
    const p = project(planet);
    if (p) {
      items.push({ kind: "planet", body: planet, projection: p, radius: Math.max(planet.radius * p.scale, 2.6), depth: p.depth });
    }
    planet.moonsRuntime.forEach((moon) => {
      const mp = project(moon);
      if (mp) {
        items.push({ kind: "moon", body: moon, projection: mp, radius: Math.max(moon.radius * mp.scale, 1.4), depth: mp.depth });
      }
    });
  });
  items.sort((a, b) => b.depth - a.depth);
  return items;
}

function drawSun(item) {
  const glow = ctx.createRadialGradient(item.projection.x, item.projection.y, item.radius * 0.2, item.projection.x, item.projection.y, item.radius * 2.8);
  glow.addColorStop(0, "rgba(255,242,163,0.95)");
  glow.addColorStop(0.35, "rgba(255,190,76,0.62)");
  glow.addColorStop(1, "rgba(255,190,76,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(item.projection.x, item.projection.y, item.radius * 2.8, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(item.projection.x, item.projection.y, item.radius, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 231, 160, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(item.projection.x, item.projection.y, item.radius * 1.18, 0, TAU);
  ctx.stroke();
}

function shadeColor(hex, percent) {
  const value = hex.replace("#", "");
  const amount = percent / 100;
  const channels = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16));
  const shaded = channels.map((channel) => Math.max(0, Math.min(255, Math.round(channel + (amount >= 0 ? (255 - channel) * amount : channel * amount)))));
  return `rgb(${shaded[0]}, ${shaded[1]}, ${shaded[2]})`;
}

function drawSphere(item, color) {
  const x = item.projection.x;
  const y = item.projection.y;
  const radius = item.radius;
  const gradient = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.35, radius * 0.1, x, y, radius);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.18, color);
  gradient.addColorStop(1, shadeColor(color, -28));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.clip();

  if (item.kind === "planet") {
    drawPlanetDetails(item, radius);
  }

  const shadow = ctx.createLinearGradient(x - radius, y - radius * 0.2, x + radius, y + radius * 0.2);
  shadow.addColorStop(0, "rgba(255,255,255,0.2)");
  shadow.addColorStop(0.45, "rgba(255,255,255,0)");
  shadow.addColorStop(1, "rgba(0,0,0,0.32)");
  ctx.fillStyle = shadow;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}

function drawRing(item) {
  ctx.save();
  ctx.translate(item.projection.x, item.projection.y);
  ctx.rotate(-0.38);
  const ringGradient = ctx.createLinearGradient(-item.radius * 2, 0, item.radius * 2, 0);
  ringGradient.addColorStop(0, "rgba(231,215,170,0)");
  ringGradient.addColorStop(0.22, "rgba(231,215,170,0.44)");
  ringGradient.addColorStop(0.5, "rgba(255,244,212,0.75)");
  ringGradient.addColorStop(0.78, "rgba(231,215,170,0.44)");
  ringGradient.addColorStop(1, "rgba(231,215,170,0)");
  ctx.strokeStyle = ringGradient;
  ctx.lineWidth = Math.max(2, item.projection.scale * 5);
  ctx.beginPath();
  ctx.ellipse(0, 0, item.radius * 1.95, item.radius * 0.74, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawPlanetDetails(item, radius) {
  const { body, projection } = item;
  const x = projection.x;
  const y = projection.y;

  if (body.name === "Terre") {
    ctx.fillStyle = "rgba(70, 190, 120, 0.55)";
    ctx.beginPath();
    ctx.ellipse(x - radius * 0.18, y - radius * 0.1, radius * 0.34, radius * 0.22, -0.5, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + radius * 0.2, y + radius * 0.08, radius * 0.24, radius * 0.16, 0.3, 0, TAU);
    ctx.fill();
    return;
  }

  if (body.name === "Jupiter" || body.name === "Saturne") {
    for (let i = -2; i <= 2; i += 1) {
      ctx.fillStyle = `rgba(255,255,255,${0.06 + (i % 2 === 0 ? 0.06 : 0.02)})`;
      ctx.fillRect(x - radius, y + i * radius * 0.34, radius * 2, radius * 0.16);
    }
    if (body.name === "Jupiter") {
      ctx.fillStyle = "rgba(198, 84, 58, 0.6)";
      ctx.beginPath();
      ctx.ellipse(x + radius * 0.26, y + radius * 0.18, radius * 0.18, radius * 0.11, 0.1, 0, TAU);
      ctx.fill();
    }
    return;
  }

  if (body.name === "Mars") {
    ctx.fillStyle = "rgba(255, 220, 180, 0.16)";
    ctx.beginPath();
    ctx.arc(x + radius * 0.14, y - radius * 0.26, radius * 0.2, 0, TAU);
    ctx.fill();
    return;
  }

  if (body.name === "Neptune" || body.name === "Uranus") {
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(x - radius, y - radius * 0.2, radius * 2, radius * 0.13);
  }
}

function drawRenderables(items) {
  items.forEach((item) => {
    if (item.kind === "asteroid") {
      ctx.fillStyle = "rgba(192,176,154,0.7)";
      ctx.beginPath();
      ctx.arc(item.projection.x, item.projection.y, item.radius, 0, TAU);
      ctx.fill();
      return;
    }
    if (item.kind === "sun") {
      drawSun(item);
      return;
    }
    drawSphere(item, item.body.color);
    if (item.kind === "planet" && item.body.ring) {
      drawRing(item);
    }
    if (state.focus && state.focus.name === item.body.name) {
      const halo = ctx.createRadialGradient(item.projection.x, item.projection.y, item.radius * 0.9, item.projection.x, item.projection.y, item.radius * 2.2);
      halo.addColorStop(0, "rgba(125,211,252,0)");
      halo.addColorStop(1, "rgba(125,211,252,0.18)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(item.projection.x, item.projection.y, item.radius * 2.2, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = "rgba(125,211,252,0.92)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(item.projection.x, item.projection.y, item.radius + 5, 0, TAU);
      ctx.stroke();
    }
  });
}

function updateLabels(items) {
  labelLayer.innerHTML = "";
  if (!labelToggle.checked) {
    return;
  }
  items.forEach((item) => {
    if (item.kind !== "planet" && item.kind !== "moon") {
      return;
    }
    if (item.radius < 2.5) {
      return;
    }
    const label = document.createElement("div");
    label.className = "space-label";
    label.textContent = item.body.name;
    label.style.left = `${item.projection.x}px`;
    label.style.top = `${item.projection.y - item.radius - 14}px`;
    labelLayer.appendChild(label);
  });
}

function pickBody(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const candidates = [];
  planets.forEach((planet) => {
    const p = project(planet);
    if (p) {
      candidates.push({ body: planet, px: p.x, py: p.y, radius: Math.max(planet.radius * p.scale, 10), depth: p.depth });
    }
    planet.moonsRuntime.forEach((moon) => {
      const mp = project(moon);
      if (mp) {
        candidates.push({ body: moon, px: mp.x, py: mp.y, radius: Math.max(moon.radius * mp.scale, 8), depth: mp.depth });
      }
    });
  });
  candidates.sort((a, b) => a.depth - b.depth);
  return candidates.find((candidate) => Math.hypot(x - candidate.px, y - candidate.py) <= candidate.radius)?.body || null;
}

function render(dt) {
  updateScene(dt);
  drawBackground();
  drawStars();
  drawOrbits();
  const renderables = createRenderables();
  drawRenderables(renderables);
  updateLabels(renderables);
  drawFocusHint(renderables);
}

function drawFocusHint(renderables) {
  if (!state.focus) {
    return;
  }

  const selected = renderables.find((item) => item.body && item.body.name === state.focus.name);
  if (!selected) {
    return;
  }

  ctx.strokeStyle = "rgba(125,211,252,0.26)";
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(selected.projection.x, selected.projection.y);
  ctx.lineTo(state.width - 220, 60);
  ctx.stroke();
  ctx.setLineDash([]);
}

let lastFrame = performance.now();
function loop(now) {
  const dt = Math.min(0.04, (now - lastFrame) / 1000);
  lastFrame = now;
  render(dt);
  requestAnimationFrame(loop);
}

function bindEvents() {
  window.addEventListener("resize", resize);
  canvas.addEventListener("pointerdown", (event) => {
    state.dragging = true;
    state.pointerMoved = false;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!state.dragging) {
      canvas.style.cursor = pickBody(event.clientX, event.clientY) ? "pointer" : "grab";
      return;
    }
    const dx = event.clientX - state.lastX;
    const dy = event.clientY - state.lastY;
    if (Math.abs(dx) + Math.abs(dy) > 2) {
      state.pointerMoved = true;
    }
    orbitCamera(-dx * 0.0055, -dy * 0.004);
    state.lastX = event.clientX;
    state.lastY = event.clientY;
  });
  canvas.addEventListener("pointerup", (event) => {
    if (!state.pointerMoved) {
      const body = pickBody(event.clientX, event.clientY);
      if (body) {
        setSelection(body);
      }
    }
    state.dragging = false;
    canvas.style.cursor = "grab";
    canvas.releasePointerCapture(event.pointerId);
  });
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    zoomCamera(event.deltaY > 0 ? 1.08 : 0.92);
  }, { passive: false });
  timeScaleInput.addEventListener("input", () => {
    timeScaleLabel.textContent = `x${timeScaleInput.value}`;
  });
  pauseButton.addEventListener("click", () => {
    state.paused = !state.paused;
    pauseButton.textContent = state.paused ? "Reprendre" : "Pause";
  });
  resetViewButton.addEventListener("click", () => {
    state.focus = null;
    state.camera.yaw = -0.95;
    state.camera.pitch = 0.42;
    state.camera.distance = 420;
    setSelection(null);
  });
}

function bootstrap() {
  showStatus("Moteur 3D local charge. Aucun CDN externe requis.");
  populatePlanetList();
  setInfoPanel(systemInfo);
  setMoonList([]);
  timeScaleLabel.textContent = `x${timeScaleInput.value}`;
  resize();
  bindEvents();
  hideStatus();
  canvas.style.cursor = "grab";
  requestAnimationFrame((time) => {
    lastFrame = time;
    loop(time);
  });
}

bootstrap();
