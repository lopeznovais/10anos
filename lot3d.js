// A casa da Karine em 3D, estilo The Sims (three.js, build clássico: funciona abrindo o index.html direto).
// O lote antigo (casinha genérica) está guardado em lot3d-original.js. Para voltar: lote: "original" no data.js.
(() => {
  const S = window.SITE;
  const lot = document.getElementById("lot");
  const box = document.getElementById("lot-canvas");
  const API = window.SIMS || {};
  const toast = (...a) => API.toast && API.toast(...a);
  const achieve = id => API.achieve && API.achieve(id);

  let renderer;
  try {
    if (!window.THREE || !THREE.OrbitControls) throw new Error("three.js não carregou");
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) {
    lot.classList.add("no3d");
    return;
  }

  // ---------- Cena, câmera, controles ----------
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  box.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xdff1ff, 75, 150);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  camera.position.set(18, 17, 24);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = 0.45;
  controls.maxPolarAngle = 1.3;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  controls.addEventListener("start", () => (controls.autoRotate = false));
  // No celular: arrastar na horizontal gira o lote, na vertical rola a página
  renderer.domElement.style.touchAction = "pan-y";

  // ---------- Luzes ----------
  const hemi = new THREE.HemisphereLight(0xffffff, 0x7fa860, 0.85);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 70 });
  sun.shadow.bias = -0.0005;
  scene.add(sun);
  const lamp = new THREE.PointLight(0xffc27a, 0, 12);
  lamp.position.set(-6.5, 2.2, 0.3); // quarto da Karine
  scene.add(lamp);
  const lamp2 = new THREE.PointLight(0xffc27a, 0, 12); // sala
  lamp2.position.set(1, 2.2, 3.5);
  scene.add(lamp2);
  const purple = new THREE.PointLight(0x9b6bff, 0, 9);
  purple.position.set(-4.6, 1.6, 1.2);
  scene.add(purple);

  // ---------- Utilidades ----------
  const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...o });
  const smooth = color => new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
  function mesh(geo, material, x = 0, y = 0, z = 0, parent = scene) {
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function group(x = 0, y = 0, z = 0, parent = scene) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  }
  function clickable(obj, action, label) {
    obj.userData.action = action;
    obj.userData.label = label;
    return obj;
  }
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  const emojiCache = {};
  function emojiTexture(e) {
    if (emojiCache[e]) return emojiCache[e];
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const x = c.getContext("2d");
    x.font = '92px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(e, 64, 72);
    return (emojiCache[e] = new THREE.CanvasTexture(c));
  }
  function emojiSprite(e, size = 0.5) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTexture(e), transparent: true, depthWrite: false }));
    sp.scale.setScalar(size);
    return sp;
  }

  // ---------- Terreno ----------
  const LOT = 12; // meio-lado do terreno
  const dirt = mat(0x9b6b43), grass = mat(0x7cc55a);
  const ground = new THREE.Mesh(new THREE.BoxGeometry(LOT * 2 + 1, 0.8, LOT * 2 + 1), [dirt, dirt, grass, dirt, dirt, dirt]);
  ground.position.y = -0.4;
  ground.receiveShadow = true;
  scene.add(ground);
  mesh(new THREE.CylinderGeometry(10, 3, 4, 7), mat(0x8a5a36), 0, -2.8, 0).castShadow = false;

  const blockers = [];  // retângulos [x1, z1, x2, z2] onde não dá pra andar
  const noFlowers = [[-9.9, -6.9, 8.9, 6.9]]; // onde não nasce flor (a casa, pra começar)
  const metal = mat(0xb0bec5, { roughness: 0.3, metalness: 0.6 });
  const wood = mat(0x8d6e63);
  const white = mat(0xffffff);

  // ---------- A casa da Karine (seguindo a planta baixa) ----------
  // Frente da casa = +z (quintal da frente), fundo = -z (quintal de trás, com a piscina).
  function floor(x1, z1, x2, z2, color, h = 0.1) {
    const m = mesh(new THREE.BoxGeometry(x2 - x1, h, z2 - z1), mat(color), (x1 + x2) / 2, h / 2, (z1 + z2) / 2);
    m.castShadow = false;
  }
  const TILE = 0xe3edf2;
  floor(-9.5, -6.5, -1.5, -4.0, 0xcfa97a);  // outro quarto
  floor(-9.5, -4.0, -1.5, -1.5, 0xb9865a);  // escritório (fim do corredor)
  floor(-9.5, -1.5, -4.0, 2.0, 0xf4d3de);   // quarto da Karine
  floor(-4.0, -1.5, -1.5, 2.0, 0xdcc9a8);   // corredor
  floor(-1.5, -6.5, 1.0, 0.0, TILE);        // banheiro
  floor(1.0, -6.5, 8.5, 0.0, 0xeadfc8);     // sala de jantar + cozinha
  floor(-1.5, 0.0, 8.5, 6.5, 0xc8925a);     // sala + entrada
  floor(-9.5, 2.0, -1.5, 6.5, 0xcfa97a);    // suíte
  floor(-9.5, 2.0, -3.5, 4.0, TILE, 0.12);  // banheiro da suíte

  // Paredes: ficam num grupo para poder "abaixar" (botão 🧱), igual ao jogo
  const WALL_H = 2.6, WALL_T = 0.2;
  const walls = group();
  const wallMat = mat(0xf6ead6), trimMat = mat(0xd8c3a0);
  function wall(x1, z1, x2, z2) {
    const horiz = z1 === z2;
    const w = horiz ? x2 - x1 + WALL_T : WALL_T, d = horiz ? WALL_T : z2 - z1 + WALL_T;
    mesh(new THREE.BoxGeometry(w, WALL_H, d), wallMat, (x1 + x2) / 2, WALL_H / 2, (z1 + z2) / 2, walls);
    mesh(new THREE.BoxGeometry(w + 0.04, 0.1, d + 0.04), trimMat, (x1 + x2) / 2, WALL_H, (z1 + z2) / 2, walls);
    blockers.push(horiz ? [x1, z1 - WALL_T / 2, x2, z1 + WALL_T / 2] : [x1 - WALL_T / 2, z1, x1 + WALL_T / 2, z2]);
  }
  [
    // externas (com a porta dos fundos e a porta da frente)
    [-9.5, -6.5, 3.3, -6.5], [4.5, -6.5, 8.5, -6.5],
    [-9.5, 6.5, 6.0, 6.5], [7.3, 6.5, 8.5, 6.5],
    [-9.5, -6.5, -9.5, 6.5], [8.5, -6.5, 8.5, 6.5],
    // outro quarto (porta para o escritório) / escritório (porta para o fim do corredor) / quarto da Karine
    [-9.5, -4.0, -3.4, -4.0], [-2.1, -4.0, -1.5, -4.0],
    [-9.5, -1.5, -3.4, -1.5], [-2.1, -1.5, -1.5, -1.5],
    [-4.0, -1.5, -4.0, -0.9], [-4.0, 0.3, -4.0, 2.0],
    // suíte e banheiro da suíte
    [-9.5, 2.0, -3.2, 2.0], [-2.0, 2.0, -1.5, 2.0],
    [-9.5, 4.0, -3.5, 4.0], [-3.5, 2.0, -3.5, 2.5], [-3.5, 3.7, -3.5, 4.0],
    // corredor / banheiro / sala
    [-1.5, -6.5, -1.5, -1.3], [-1.5, -0.1, -1.5, 0.3], [-1.5, 1.7, -1.5, 6.5],
    [1.0, -6.5, 1.0, 0.0],
    // jantar+cozinha / sala+entrada
    [-1.5, 0.0, 4.8, 0.0], [6.0, 0.0, 8.5, 0.0],
    [3.5, 2.0, 3.5, 5.0],
  ].forEach(w => wall(...w));
  let wallsUp = false;
  walls.scale.y = 0.36;

  // Abajures (acendem à noite)
  const windowMat = mat(0xfff1c9, { emissive: 0xffd27a, emissiveIntensity: 0 });
  function abajur(x, y, z) {
    mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.25, 6), wood, x, y + 0.12, z);
    mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.2, 10), windowMat, x, y + 0.33, z);
  }

  // ----- Sala: sofá virado para a TV -----
  const sofa = clickable(group(1.6, 0, 4), "sofa", "🛋️ Sofá de maratona");
  const sofaMat = mat(0x8e5cf7);
  mesh(new THREE.BoxGeometry(1, 0.5, 2.4), sofaMat, 0, 0.35, 0, sofa);
  mesh(new THREE.BoxGeometry(0.35, 0.8, 2.4), sofaMat, 0.35, 0.8, 0, sofa);
  mesh(new THREE.BoxGeometry(1, 0.7, 0.3), sofaMat, 0, 0.5, 1.2, sofa);
  mesh(new THREE.BoxGeometry(1, 0.7, 0.3), sofaMat, 0, 0.5, -1.2, sofa);
  mesh(new THREE.BoxGeometry(0.5, 0.4, 0.5), mat(0xffd766), -0.1, 0.75, 0.6, sofa).rotation.y = 0.4;
  blockers.push([1.0, 2.7, 2.3, 5.3]);
  mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.03, 24), mat(0xff9ccc), 0.2, 0.12, 4).castShadow = false;

  const tv = clickable(group(-1.0, 0, 4), "tv", "📺 TV (passando dorama)");
  mesh(new THREE.BoxGeometry(0.6, 0.6, 2), mat(0x6b4a2e), 0, 0.3, 0, tv);
  mesh(new THREE.BoxGeometry(0.12, 1.1, 1.9), mat(0x1c1c22), 0.05, 1.25, 0, tv);
  blockers.push([-1.4, 3.0, -0.7, 5.0]);
  abajur(-1.0, 0.6, 5.2);
  const tvCanvas = document.createElement("canvas");
  tvCanvas.width = 320; tvCanvas.height = 180;
  const tvTex = new THREE.CanvasTexture(tvCanvas);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 0.95), new THREE.MeshBasicMaterial({ map: tvTex }));
  screen.position.set(0.12, 1.25, 0);
  screen.rotation.y = Math.PI / 2;
  tv.add(screen);
  const episodes = [["EP 1", "O encontro 💕"], ["EP 5", "Guarda-chuva 🌧️"], ["EP 9", "Quase beijo 😳"], ["EP 12", "Mal-entendido 😭"], ["EP 16", "Final feliz 💍"]];
  let epIndex = 0;
  function drawTV([ep, txt]) {
    const x = tvCanvas.getContext("2d");
    const g = x.createLinearGradient(0, 0, 320, 180);
    g.addColorStop(0, "#ff9ccc");
    g.addColorStop(1, "#8e5cf7");
    x.fillStyle = g;
    x.fillRect(0, 0, 320, 180);
    x.fillStyle = "#fff";
    x.textAlign = "center";
    x.font = "900 20px Nunito, sans-serif";
    x.fillText(`KARINE & PEDRO · ${ep}`, 160, 50);
    x.font = '800 30px Nunito, "Segoe UI Emoji", sans-serif';
    x.fillText(txt, 160, 110);
    x.font = "700 14px Nunito, sans-serif";
    x.fillText("legendado · 10 temporadas", 160, 150);
    tvTex.needsUpdate = true;
  }
  drawTV(episodes[0]);

  // ----- Entrada: capacho e plantinha -----
  mesh(new THREE.BoxGeometry(1.1, 0.04, 0.6), mat(0x7a5a3a), 6.65, 0.12, 5.8).castShadow = false;
  mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.3, 8), mat(0xc2703d), 8.0, 0.25, 0.6);
  mesh(new THREE.IcosahedronGeometry(0.3, 0), mat(0x43a047), 8.0, 0.65, 0.6);

  // ----- Camas (a cabeceira fica em -z antes de girar) -----
  function makeBed(x, z, rotY, width, blanketColor, action, label) {
    const b = clickable(group(x, 0, z), action, label);
    b.rotation.y = rotY;
    mesh(new THREE.BoxGeometry(width, 0.35, 2.5), wood, 0, 0.18, 0, b);
    mesh(new THREE.BoxGeometry(width - 0.1, 0.2, 2.3), white, 0, 0.45, 0.05, b);
    mesh(new THREE.BoxGeometry(width, 1.1, 0.15), wood, 0, 0.6, -1.17, b);
    const pillows = width > 1.3 ? [-width / 4, width / 4] : [0];
    pillows.forEach(px => mesh(new THREE.BoxGeometry(0.6, 0.14, 0.4), mat(0xfdf6ff), px, 0.62, -0.85, b));
    mesh(new THREE.BoxGeometry(width - 0.08, 0.08, 1.3), mat(blanketColor), 0, 0.58, 0.5, b);
    const cover = mesh(new THREE.BoxGeometry(width - 0.06, 0.1, 1.45), mat(blanketColor), 0, 1.05, 0.45, b);
    cover.visible = false;
    return { b, cover };
  }
  // Quarto da Karine: cama, estante de Hogwarts e o ARMY Bomb
  const { b: bed, cover } = makeBed(-8.1, 0.25, Math.PI / 2, 1.7, 0xff9ccc, "bed", "🛏️ Cama da Karine (ela dorme às 21h)");
  blockers.push([-9.4, -0.65, -6.85, 1.15]);

  const shelf = clickable(group(-5.2, 0, -1.15), "shelf", "📚 Estante de Hogwarts");
  mesh(new THREE.BoxGeometry(1.5, 2, 0.45), mat(0x5a3a22), 0, 1, 0, shelf);
  const houseColors = [0x7f0909, 0xd3a625, 0x1a472a, 0x0e1a40, 0xecb939, 0x5d5d5d, 0x946b2d];
  for (let row = 0; row < 3; row++) {
    let x = -0.6;
    while (x < 0.55) {
      const w = rand(0.1, 0.16), h = rand(0.34, 0.48);
      mesh(new THREE.BoxGeometry(w, h, 0.3), mat(pick(houseColors)), x + w / 2, 0.2 + row * 0.62 + h / 2, 0.1, shelf);
      x += w + 0.02;
    }
  }
  blockers.push([-5.95, -1.4, -4.45, -0.9]);

  const army = clickable(group(-4.6, 0, 1.5), "army", "💜 ARMY Bomb (clique!)");
  mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.08, 16), white, 0, 0.8, 0, army);
  mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.8, 8), white, 0, 0.4, 0, army);
  mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.4, 8), mat(0x222222), 0, 1.04, 0, army);
  const bombMat = new THREE.MeshStandardMaterial({ color: 0xd9c8ff, emissive: 0x9b6bff, emissiveIntensity: 0.4, transparent: true, opacity: 0.9 });
  mesh(new THREE.SphereGeometry(0.2, 20, 16), bombMat, 0, 1.38, 0, army);
  mesh(new THREE.SphereGeometry(0.205, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2.6), mat(0x222222), 0, 1.38, 0, army);
  blockers.push([-5.1, 1.0, -4.1, 1.9]);
  abajur(-4.6, 0.84, 1.75);

  // Outro quarto e suíte (só decoração, mas dá pra clicar)
  makeBed(-8.2, -5.25, Math.PI / 2, 1.0, 0x8cc2ff, "guest", "🛏️ Outro quarto");
  blockers.push([-9.4, -5.8, -6.9, -4.7]);
  makeBed(-8.2, 5.25, Math.PI / 2, 1.8, 0xb5c99a, "suite", "🚪 Suíte");
  blockers.push([-9.4, 4.3, -6.9, 6.2]);
  mesh(new THREE.BoxGeometry(1.6, 1.9, 0.45), mat(0x6b4a2e), -5.0, 0.95, 6.15);
  blockers.push([-5.8, 5.9, -4.2, 6.4]);

  // Escritório: mesa com computador (com The Sims aberto, claro)
  const pc = clickable(group(-8.95, 0, -2.75), "pc", "💻 Computador (The Sims aberto)");
  mesh(new THREE.BoxGeometry(0.75, 0.06, 1.7), wood, 0, 0.75, 0, pc);
  for (const z of [-0.75, 0.75]) mesh(new THREE.BoxGeometry(0.7, 0.72, 0.06), wood, 0, 0.36, z, pc);
  mesh(new THREE.BoxGeometry(0.06, 0.45, 0.7), mat(0x1c1c22), -0.15, 1.1, 0, pc);
  mesh(new THREE.BoxGeometry(0.02, 0.38, 0.62), new THREE.MeshBasicMaterial({ color: 0x4cd137 }), -0.11, 1.1, 0, pc);
  mesh(new THREE.BoxGeometry(0.05, 0.1, 0.2), mat(0x1c1c22), -0.15, 0.83, 0, pc);
  mesh(new THREE.BoxGeometry(0.2, 0.03, 0.5), mat(0x333333), 0.15, 0.8, 0, pc);
  mesh(new THREE.BoxGeometry(0.5, 0.08, 0.5), mat(0x2f86f0), 0.8, 0.5, 0, pc);
  mesh(new THREE.BoxGeometry(0.08, 0.6, 0.5), mat(0x2f86f0), 1.05, 0.8, 0, pc);
  mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.46, 6), metal, 0.8, 0.25, 0, pc);
  blockers.push([-9.4, -3.6, -7.7, -1.9]);

  // Banheiros
  function toilet(x, z, rotY, action, label) {
    const t = clickable(group(x, 0, z), action, label);
    t.rotation.y = rotY;
    mesh(new THREE.BoxGeometry(0.42, 0.4, 0.55), white, 0, 0.2, 0.05, t);
    mesh(new THREE.BoxGeometry(0.46, 0.06, 0.6), mat(0xdfe7ee), 0, 0.43, 0.05, t);
    mesh(new THREE.BoxGeometry(0.5, 0.55, 0.2), white, 0, 0.6, -0.3, t);
    return t;
  }
  toilet(-0.25, -5.95, 0, "wc", "🚽 Banheiro");
  blockers.push([-0.7, -6.4, 0.2, -5.5]);
  toilet(-9.0, 3.0, Math.PI / 2, "wc", "🚽 Banheiro da suíte");
  blockers.push([-9.4, 2.6, -8.6, 3.4]);
  const sink = clickable(group(0.65, 0, -3.25), "sink", "🧴 Pia (skincare de 10 passos)");
  mesh(new THREE.BoxGeometry(0.5, 0.8, 1.0), white, 0, 0.4, 0, sink);
  mesh(new THREE.BoxGeometry(0.4, 0.04, 0.6), mat(0x90a4ae), -0.02, 0.82, 0, sink);
  [[0.1, -0.35, 0xff9ccc], [0.1, -0.2, 0x8cc2ff], [0.12, 0.3, 0xb5c99a], [0.05, 0.4, 0xffd766]]
    .forEach(([x, z, c]) => mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.16, 8), mat(c), x, 0.9, z, sink));
  blockers.push([0.4, -3.8, 0.9, -2.7]);

  // Sala de jantar
  const mesa = clickable(group(2.9, 0, -3.25), "mesa", "🍽️ Mesa de jantar");
  mesh(new THREE.BoxGeometry(1.4, 0.08, 1.2), wood, 0, 0.75, 0, mesa);
  for (const [x, z] of [[-0.6, -0.5], [0.6, -0.5], [-0.6, 0.5], [0.6, 0.5]]) mesh(new THREE.BoxGeometry(0.08, 0.72, 0.08), wood, x, 0.36, z, mesa);
  for (const [x, z] of [[-0.4, -0.85], [0.4, -0.85], [-0.4, 0.85], [0.4, 0.85]]) {
    mesh(new THREE.BoxGeometry(0.4, 0.45, 0.4), mat(0xb9865a), x, 0.23, z, mesa);
    mesh(new THREE.BoxGeometry(0.4, 0.45, 0.06), mat(0xb9865a), x, 0.68, z + Math.sign(z) * 0.17, mesa);
  }
  mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.2, 8), mat(0x8cc2ff), 0, 0.89, 0, mesa);
  mesh(new THREE.SphereGeometry(0.14, 8, 6), mat(0xff5fa2), 0, 1.08, 0, mesa);
  blockers.push([2.0, -4.3, 3.8, -2.2]);

  // ----- Cozinha: geladeira + bancada com filtro de barro -----
  const fridge = clickable(group(7.85, 0, -6.05), "fridge", "🧊 Geladeira");
  mesh(new THREE.BoxGeometry(0.72, 1.9, 0.66), mat(0xeef3f7), 0, 0.95, 0, fridge);
  mesh(new THREE.BoxGeometry(0.72, 0.5, 0.07), mat(0xdfe7ee), 0, 1.63, 0.375, fridge);
  const fridgeInside = group(0, 0, 0, fridge);
  mesh(new THREE.BoxGeometry(0.6, 1.2, 0.02), new THREE.MeshBasicMaterial({ color: 0xfff3b0 }), 0, 0.72, 0.335, fridgeInside);
  [[-0.15, 0.45, 0xe53935], [0.1, 0.45, 0x43a047], [-0.05, 0.85, 0xffb300], [0.15, 0.9, 0x8e5cf7]]
    .forEach(([x, y, c]) => mesh(new THREE.BoxGeometry(0.14, 0.16, 0.06), mat(c), x, y, 0.37, fridgeInside));
  fridgeInside.visible = false;
  const fridgeDoor = group(-0.36, 0, 0.34, fridge);
  mesh(new THREE.BoxGeometry(0.72, 1.3, 0.07), mat(0xdfe7ee), 0.36, 0.7, 0.04, fridgeDoor);
  mesh(new THREE.BoxGeometry(0.04, 0.5, 0.05), metal, 0.64, 0.9, 0.1, fridgeDoor);
  let fridgeOpen = 0, fridgeTarget = 0, fridgeCount = 0;

  const counter = clickable(group(6.2, 0, -6.1), "water", "🚰 Filtro de barro (água!)");
  mesh(new THREE.BoxGeometry(1.5, 0.85, 0.6), mat(0xf6ead6), 0, 0.43, 0, counter);
  mesh(new THREE.BoxGeometry(1.56, 0.07, 0.66), wood, 0, 0.89, 0, counter);
  mesh(new THREE.BoxGeometry(0.5, 0.03, 0.36), mat(0x90a4ae), -0.35, 0.93, 0.02, counter);
  mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.3, 12), mat(0xb5622f), 0.4, 1.08, -0.02, counter);
  mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.3, 12), mat(0xc2703d), 0.4, 1.38, -0.02, counter);
  mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6), metal, 0.4, 1.02, 0.17, counter).rotation.x = Math.PI / 2;
  blockers.push([5.4, -6.4, 8.3, -5.7]);

  // ---------- Quintal de trás: piscina (COM escada) ----------
  const pool = clickable(group(-2.5, 0, -9.3), "pool", "🏊 Piscina (com escada!)");
  const rim = mat(0xf5f5f5);
  mesh(new THREE.BoxGeometry(3.2, 0.25, 0.3), rim, 0, 0.12, -1.25, pool);
  mesh(new THREE.BoxGeometry(3.2, 0.25, 0.3), rim, 0, 0.12, 1.25, pool);
  mesh(new THREE.BoxGeometry(0.3, 0.25, 2.8), rim, -1.45, 0.12, 0, pool);
  mesh(new THREE.BoxGeometry(0.3, 0.25, 2.8), rim, 1.45, 0.12, 0, pool);
  const water = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 2.2), new THREE.MeshStandardMaterial({ color: 0x4fc3f7, emissive: 0x1e88e5, emissiveIntensity: 0.25, transparent: true, opacity: 0.85, roughness: 0.1 }));
  water.position.y = 0.1;
  pool.add(water);
  for (const z of [-0.25, 0.25]) mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6), metal, 1.25, 0.4, z, pool);
  for (const y of [0.2, 0.45, 0.7]) mesh(new THREE.BoxGeometry(0.04, 0.03, 0.5), metal, 1.25, y, 0, pool);
  blockers.push([-4.2, -10.8, -0.8, -7.8]);
  noFlowers.push([-4.5, -11.1, -0.5, -7.5]);

  // ---------- Caminhos de pedra: porta da frente, corredor lateral e porta dos fundos ----------
  function stones(x1, z1, x2, z2) {
    const n = Math.ceil(Math.hypot(x2 - x1, z2 - z1) / 0.85);
    const alongZ = Math.abs(z2 - z1) > Math.abs(x2 - x1);
    for (let k = 0; k <= n; k++) {
      const t = mesh(new THREE.BoxGeometry(alongZ ? 0.9 : 0.62, 0.08, alongZ ? 0.62 : 0.9), mat(0xc9c2b8), x1 + ((x2 - x1) * k) / n + rand(-0.06, 0.06), 0.04, z1 + ((z2 - z1) * k) / n);
      t.rotation.y = rand(-0.12, 0.12);
      t.castShadow = false;
    }
    noFlowers.push([Math.min(x1, x2) - 0.7, Math.min(z1, z2) - 0.7, Math.max(x1, x2) + 0.7, Math.max(z1, z2) + 0.7]);
  }
  stones(6.65, 7.1, 6.65, 11.8);
  stones(-10.75, -8, -10.75, 8);
  stones(3.9, -7.1, 3.9, -8.8);

  // ---------- Horta do Vale (Stardew), no quintal de trás ----------
  mesh(new THREE.BoxGeometry(3.8, 0.1, 3.8), mat(0x6b4226), 6.7, 0.05, -9.5);
  blockers.push([4.8, -11.4, 8.6, -7.6]);
  noFlowers.push([4.5, -11.7, 8.9, -7.3]);
  const cropTypes = [
    { nome: "Morango", emoji: "🍓", fruta: 0xe53935, forma: "bagas" },
    { nome: "Abóbora", emoji: "🎃", fruta: 0xff8f00, forma: "grande" },
    { nome: "Melão", emoji: "🍈", fruta: 0x9ccc65, forma: "grande" },
    { nome: "Fruta Estelar", emoji: "⭐", fruta: 0xffd600, forma: "estrela" },
    { nome: "Couve-flor", emoji: "🥦", fruta: 0xfff8e1, forma: "grande" },
    { nome: "Mirtilo", emoji: "🫐", fruta: 0x3949ab, forma: "bagas" },
  ];
  const crops = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const type = cropTypes[(i * 3 + j) % cropTypes.length];
    const cell = group(5.6 + i * 1.1, 0.1, -10.6 + j * 1.1);
    mesh(new THREE.BoxGeometry(0.95, 0.06, 0.95), mat(0x5a3620), 0, 0.03, 0, cell);
    const plant = group(0, 0.06, 0, cell);
    mesh(new THREE.ConeGeometry(0.28, 0.5, 5), mat(0x43a047), 0, 0.25, 0, plant);
    const fruitMat = mat(type.fruta, { emissive: type.forma === "estrela" ? 0xffab00 : 0x000000, emissiveIntensity: 0.4 });
    if (type.forma === "grande") {
      mesh(new THREE.SphereGeometry(0.26, 10, 8), fruitMat, 0.12, 0.3, 0.12, plant).scale.y = 0.8;
    } else if (type.forma === "estrela") {
      mesh(new THREE.OctahedronGeometry(0.2), fruitMat, 0, 0.62, 0, plant);
    } else {
      for (let k = 0; k < 4; k++) mesh(new THREE.SphereGeometry(0.08, 8, 6), fruitMat, Math.cos(k * 1.6) * 0.22, 0.2 + k * 0.08, Math.sin(k * 1.6) * 0.22, plant);
    }
    clickable(cell, "crop", `${type.emoji} ${type.nome} (pronto pra colher)`);
    cell.userData.crop = { type, plant, grow: 1, ready: true };
    crops.push(cell);
  }

  // ---------- Meg, a cachorrinha ----------
  const PET = { nome: "Meg", pelo: "#c8894f", orelha: "#7a4a26", barriga: "#f6e6cc", coleira: "#ff5fa2", ...S.pet };
  const meg = clickable(group(4.6, 0, 9.4), "meg", `🐶 ${PET.nome} (clique pra fazer carinho)`);
  const megBody = group(0, 0, 0, meg);
  meg.scale.setScalar(1.25);
  const fur = smooth(PET.pelo), earMat = smooth(PET.orelha), belly = smooth(PET.barriga), black = smooth(0x1a1a1a);
  mesh(new THREE.CapsuleGeometry(0.16, 0.3, 4, 10), fur, 0, 0.34, 0, megBody).rotation.x = Math.PI / 2;
  mesh(new THREE.SphereGeometry(0.14, 12, 10), belly, 0, 0.32, 0.18, megBody);
  const megHead = group(0, 0.55, 0.3, megBody);
  mesh(new THREE.SphereGeometry(0.15, 14, 12), fur, 0, 0, 0, megHead);
  mesh(new THREE.SphereGeometry(0.075, 10, 8), belly, 0, -0.04, 0.13, megHead).scale.z = 1.3;
  mesh(new THREE.SphereGeometry(0.03, 8, 6), black, 0, -0.01, 0.23, megHead);
  for (const x of [-0.06, 0.06]) mesh(new THREE.SphereGeometry(0.025, 8, 6), black, x, 0.04, 0.13, megHead);
  for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.06, 0.17, 0.1), earMat, s * 0.13, -0.03, -0.01, megHead).rotation.z = s * 0.35;
  mesh(new THREE.TorusGeometry(0.1, 0.022, 6, 14), smooth(PET.coleira), 0, 0.45, 0.25, megBody).rotation.x = Math.PI / 2 + 0.5;
  const megLegs = [[-0.09, 0.15], [0.09, 0.15], [-0.09, -0.15], [0.09, -0.15]].map(([x, z]) => {
    const hip = group(x, 0.24, z, megBody);
    mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.24, 8), fur, 0, -0.12, 0, hip);
    return hip;
  });
  const megTail = group(0, 0.42, -0.2, megBody);
  mesh(new THREE.CapsuleGeometry(0.03, 0.14, 4, 6), fur, 0, 0.08, -0.04, megTail).rotation.x = -0.6;

  // Bolinha da Meg (quintal da frente)
  const ball = clickable(mesh(new THREE.SphereGeometry(0.11, 12, 10), smooth(0xd4e157), 3.5, 0.11, 9), "ball", `🎾 Bolinha da ${PET.nome} (clique pra jogar)`);
  let ballFly = null, ballHeld = false;

  // ---------- Caixa de correio + coruja (quintal da frente) ----------
  const mailbox = clickable(group(8.2, 0, 11.0), "owl", "✉️ Correio (tem carta!)");
  mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 6), mat(0x6d4c41), 0, 0.55, 0, mailbox);
  mesh(new THREE.BoxGeometry(0.4, 0.35, 0.6), mat(0x1976d2), 0, 1.25, 0, mailbox);
  const flag = mesh(new THREE.BoxGeometry(0.04, 0.25, 0.12), mat(0xe53935), 0.22, 1.4, 0.1, mailbox);
  const owl = clickable(group(0, 1.43, 0, mailbox), "owl", "🦉 Coruja (trouxe uma carta!)");
  mesh(new THREE.SphereGeometry(0.22, 12, 10), mat(0x8d6e63), 0, 0.22, 0, owl).scale.y = 1.2;
  mesh(new THREE.SphereGeometry(0.15, 10, 8), mat(0xd7ccc8), 0, 0.18, 0.1, owl);
  for (const x of [-0.08, 0.08]) {
    mesh(new THREE.SphereGeometry(0.07, 10, 8), white, x, 0.36, 0.16, owl);
    mesh(new THREE.SphereGeometry(0.035, 8, 6), mat(0x111111), x, 0.36, 0.22, owl);
    mesh(new THREE.ConeGeometry(0.04, 0.1, 4), mat(0x6d4c41), x * 1.6, 0.5, 0, owl);
  }
  mesh(new THREE.ConeGeometry(0.03, 0.08, 4), mat(0xffa000), 0, 0.3, 0.23, owl).rotation.x = Math.PI / 2;
  mesh(new THREE.BoxGeometry(0.22, 0.02, 0.15), mat(0xf4e4bc), 0, 0.05, 0.25, owl).rotation.x = 0.3;
  owl.rotation.y = 0.6;
  blockers.push([7.8, 10.6, 8.6, 11.4]);

  // ---------- Árvores e flores ----------
  const treeSpots = [[-10.8, -10.8], [10.6, -10.6], [10.6, 1.5], [10.4, 10.6], [-10.6, 10.6], [-5.5, 10.4], [0.5, 10.6], [-7.5, -9.6], [1.8, -10.8]];
  const trees = treeSpots.map(([x, z], i) => {
    const t = clickable(group(x, 0, z), "tree", "🌳 Árvore");
    mesh(new THREE.CylinderGeometry(0.15, 0.22, 1.2, 6), mat(0x795548), 0, 0.6, 0, t);
    if (i % 2) {
      for (let k = 0; k < 3; k++) mesh(new THREE.ConeGeometry(0.9 - k * 0.2, 1, 7), mat(0x2e7d32), 0, 1.3 + k * 0.55, 0, t);
    } else {
      mesh(new THREE.IcosahedronGeometry(0.95, 0), mat(0x43a047), 0, 1.8, 0, t);
      mesh(new THREE.IcosahedronGeometry(0.6, 0), mat(0x66bb6a), 0.4, 2.3, 0.2, t);
    }
    t.rotation.y = rand(0, 6);
    blockers.push([x - 0.8, z - 0.8, x + 0.8, z + 0.8]);
    return t;
  });
  const flowerColors = [0xff5fa2, 0xffd54f, 0xffffff, 0x9b6bff, 0xff7043];
  for (let n = 0; n < 130; n++) {
    const x = rand(-LOT + 0.4, LOT - 0.4), z = rand(-LOT + 0.4, LOT - 0.4);
    if (noFlowers.some(([a, b, c, d]) => x > a && x < c && z > b && z < d)) continue;
    mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 4), mat(0x388e3c), x, 0.11, z).castShadow = false;
    mesh(new THREE.SphereGeometry(0.07, 6, 5), mat(pick(flowerColors)), x, 0.24, z).castShadow = false;
  }

  // ---------- Mapa de caminhada (grade + A*) ----------
  const R = 0.3; // "raio" de um Sim
  const CELL = 0.5, N = 50, ORG = -12.5;
  const id = (i, j) => j * N + i;
  const center = (i, j) => [ORG + (i + 0.5) * CELL, ORG + (j + 0.5) * CELL];
  const cellOf = (x, z) => [
    Math.max(0, Math.min(N - 1, Math.floor((x - ORG) / CELL))),
    Math.max(0, Math.min(N - 1, Math.floor((z - ORG) / CELL))),
  ];
  const blocked = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const [x, z] = center(i, j);
    blocked[id(i, j)] = Math.abs(x) > LOT - 0.3 || Math.abs(z) > LOT - 0.3 ||
      blockers.some(([a, b, c, d]) => x > a - R && x < c + R && z > b - R && z < d + R) ? 1 : 0;
  }
  const isFree = (x, z) => Math.abs(x) < LOT - 0.2 && Math.abs(z) < LOT - 0.2 && !blocked[id(...cellOf(x, z))];

  function nearestFree(i, j) {
    if (!blocked[id(i, j)]) return [i, j];
    for (let r = 1; r < N; r++) {
      let best = null, bd = Infinity;
      for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
        if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
        const ni = i + di, nj = j + dj;
        if (ni < 0 || nj < 0 || ni >= N || nj >= N || blocked[id(ni, nj)]) continue;
        const d = di * di + dj * dj;
        if (d < bd) { bd = d; best = [ni, nj]; }
      }
      if (best) return best;
    }
    return [i, j];
  }
  const nearestFreePoint = (x, z) => {
    if (isFree(x, z)) return new THREE.Vector3(x, 0, z);
    const [cx, cz] = center(...nearestFree(...cellOf(x, z)));
    return new THREE.Vector3(cx, 0, cz);
  };
  function lineFree(a, b) {
    const n = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 0.15);
    for (let k = 1; k <= n; k++) {
      if (!isFree(a.x + ((b.x - a.x) * k) / n, a.z + ((b.z - a.z) * k) / n)) return false;
    }
    return true;
  }

  function findPath(from, to) {
    const [si, sj] = nearestFree(...cellOf(from.x, from.z));
    const [gi, gj] = nearestFree(...cellOf(to.x, to.z));
    const [gx, gz] = center(gi, gj);
    const goal = isFree(to.x, to.z) ? new THREE.Vector3(to.x, 0, to.z) : new THREE.Vector3(gx, 0, gz);
    const start = id(si, sj), end = id(gi, gj);
    const g = new Float32Array(N * N).fill(Infinity), f = new Float32Array(N * N).fill(Infinity);
    const came = new Int32Array(N * N).fill(-1), closed = new Uint8Array(N * N);
    const h = k => { const dx = Math.abs((k % N) - gi), dy = Math.abs(((k / N) | 0) - gj); return Math.max(dx, dy) + 0.414 * Math.min(dx, dy); };
    const open = [start];
    g[start] = 0; f[start] = h(start);
    while (open.length) {
      let bi = 0;
      for (let k = 1; k < open.length; k++) if (f[open[k]] < f[open[bi]]) bi = k;
      const cur = open.splice(bi, 1)[0];
      if (cur === end) break;
      closed[cur] = 1;
      const ci = cur % N, cj = (cur / N) | 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue;
        const ni = ci + di, nj = cj + dj;
        if (ni < 0 || nj < 0 || ni >= N || nj >= N) continue;
        const nk = id(ni, nj);
        if (blocked[nk] || closed[nk]) continue;
        if (di && dj && (blocked[id(ci + di, cj)] || blocked[id(ci, cj + dj)])) continue;
        const ng = g[cur] + (di && dj ? 1.414 : 1);
        if (ng < g[nk]) {
          g[nk] = ng; f[nk] = ng + h(nk); came[nk] = cur;
          if (!open.includes(nk)) open.push(nk);
        }
      }
    }
    if (start !== end && came[end] === -1) return [];
    const pts = [];
    for (let k = end; k !== -1 && k !== start; k = came[k]) { const [x, z] = center(k % N, (k / N) | 0); pts.unshift(new THREE.Vector3(x, 0, z)); }
    if (pts.length) pts[pts.length - 1] = goal; else pts.push(goal);
    // Suaviza o caminho: pula pontos quando dá pra ir em linha reta
    const out = [];
    let cur = from.clone(), i = 0;
    while (i < pts.length) {
      let far = i;
      for (let k = pts.length - 1; k > i; k--) if (lineFree(cur, pts[k])) { far = k; break; }
      out.push(pts[far]);
      cur = pts[far];
      i = far + 1;
    }
    return out;
  }

  // Marcador verde de "ir para cá", igual ao jogo
  const marker = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.34, 24), new THREE.MeshBasicMaterial({ color: 0x4cd137, transparent: true, opacity: 0, side: THREE.DoubleSide }));
  marker.rotation.x = -Math.PI / 2;
  scene.add(marker);
  let markerLife = 0;
  function showMarker(p) { marker.position.set(p.x, 0.06, p.z); markerLife = 1; }

  // ---------- Os Sims ----------
  function makeSim(p, x, z, yaw, action, label) {
    const a = { pele: "#f1c7a5", cabelo: "#3b2418", camisa: p.cor, calca: "#2e3a4f", ...p.aparencia };
    const g = clickable(group(x, 0, z), action, label);
    const skin = smooth(a.pele), shirt = smooth(a.camisa), pants = smooth(a.calca), hair = smooth(a.cabelo);
    const legs = [-0.12, 0.12].map(lx => {
      const hip = group(lx, 0.82, 0, g);
      mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.8, 10), pants, 0, -0.4, 0, hip);
      mesh(new THREE.BoxGeometry(0.15, 0.1, 0.28), smooth(0x333333), 0, -0.77, 0.05, hip);
      return hip;
    });
    mesh(new THREE.CapsuleGeometry(0.25, 0.42, 4, 12), shirt, 0, 1.15, 0, g);
    const arms = [-1, 1].map(s => {
      const pivot = group(s * 0.33, 1.45, 0, g);
      mesh(new THREE.CapsuleGeometry(0.07, 0.45, 4, 8), shirt, 0, -0.28, 0, pivot);
      mesh(new THREE.SphereGeometry(0.075, 10, 8), skin, 0, -0.6, 0, pivot);
      pivot.rotation.z = s * 0.08;
      return pivot;
    });
    const head = group(0, 1.86, 0, g);
    mesh(new THREE.SphereGeometry(0.3, 20, 16), skin, 0, 0, 0, head);
    for (const ex of [-0.1, 0.1]) mesh(new THREE.SphereGeometry(0.035, 8, 6), smooth(0x1a1a1a), ex, 0.03, 0.27, head);
    const hairCap = mesh(new THREE.SphereGeometry(0.325, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, 0, 0.02, -0.02, head);
    hairCap.rotation.x = -0.35;
    if (a.cabeloLongo) {
      const back = mesh(new THREE.CapsuleGeometry(0.27, 0.45, 4, 12), hair, 0, -0.3, -0.13, head);
      back.scale.z = 0.6;
      for (const bx of [-0.12, 0.12]) mesh(new THREE.SphereGeometry(0.06, 8, 6), smooth(0xff9aa2), bx * 1.6, -0.06, 0.24, head);
    }
    const pbMat = new THREE.MeshStandardMaterial({ color: 0x4cd137, emissive: 0x4cd137, emissiveIntensity: 0.35, flatShading: true, roughness: 0.25, transparent: true, opacity: 0.92 });
    const pb = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 0), pbMat);
    pb.scale.y = 2.1;
    g.add(pb);
    g.rotation.order = "YXZ"; // gira (yaw) depois de deitar, pra cama poder ficar em qualquer direção
    return {
      g, head, arms, legs, pb, pbMat, name: p.nome,
      pos: new THREE.Vector3(x, 0, z), yaw, yawTarget: yaw,
      state: "idle", path: [], onArrive: null, faceOnArrive: null, phase: 0, idleT: 0, standSpot: null,
    };
  }
  const karine = makeSim(S.ela, 5.6, 8.75, 1.1, "karine", `💚 ${S.ela.nome} (clique para interagir)`);
  const pedro = makeSim(S.ele, 7.0, 8.75, -0.45, "pedro", `💙 ${S.ele.nome}`);
  const sims = [karine, pedro];
  const HOME = { k: new THREE.Vector3(5.6, 0, 8.75), p: new THREE.Vector3(7.0, 0, 8.75) }; // quintal da frente

  // Lugares no sofá e na cama (posição, direção e onde fica de pé ao levantar)
  const SEATS = {
    k: { x: 1.55, z: 4.5, yaw: -Math.PI / 2, stand: new THREE.Vector3(0.25, 0, 4.5) },
    p: { x: 1.55, z: 3.5, yaw: -Math.PI / 2, stand: new THREE.Vector3(0.25, 0, 3.5) },
  };
  // Cama da Karine: cabeceira na parede oeste (yaw 90° = cabeça apontando pra -x)
  const BEDS = {
    k: { x: -6.99, z: 0.65, yaw: Math.PI / 2, stand: new THREE.Vector3(-6.25, 0, 0.75) },
    p: { x: -6.99, z: -0.15, yaw: Math.PI / 2, stand: new THREE.Vector3(-6.25, 0, -0.25) },
  };
  const key = s => (s === karine ? "k" : "p");

  // Etiquetas com nome
  const labelsBox = document.getElementById("lot-labels");
  sims.forEach(s => {
    s.label = document.createElement("div");
    s.label.className = "lot-label";
    s.label.innerHTML = s === karine ? `${s.name} <small>👆</small>` : s.name;
    labelsBox.appendChild(s.label);
  });

  // Copo d'água (aparece quando o Pedro lembra ela de beber água)
  const cupMat = new THREE.MeshStandardMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.8, roughness: 0.1 });
  const cups = sims.map(s => mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.18, 10), cupMat, 0, -0.68, 0.06, s.arms[1]));
  // Celular (pra pesquisar spoiler antes de ver o dorama)
  const phone = mesh(new THREE.BoxGeometry(0.09, 0.16, 0.02), smooth(0x222831), 0, -0.68, 0.07, karine.arms[1]);
  function clearProps() {
    cups.forEach(c => (c.visible = false));
    phone.visible = false;
    bubble.visible = bubbleIcon.visible = false;
  }

  // Balão de pensamento
  const bubble = emojiSprite("💭", 0.9);
  const bubbleIcon = emojiSprite("🍕", 0.4);
  bubble.position.set(0.55, 2.55, 0);
  bubbleIcon.position.set(0.55, 2.6, 0.05);
  karine.g.add(bubble, bubbleIcon);
  clearProps();

  // ---------- Movimento ----------
  const WALK = 1.9;
  const yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
  const wrapAngle = a => Math.atan2(Math.sin(a), Math.cos(a));
  const sfx = name => window.SIMSOUND && window.SIMSOUND.play(name);

  function updateCover() { cover.visible = sims.some(s => s.state === "lie"); }
  function standUp(s) {
    if (s.state === "sit" || s.state === "lie") {
      s.pos.copy(s.standSpot);
      s.state = "idle";
      updateCover();
    }
  }
  function arrive(s) {
    s.state = "idle";
    s.path = [];
    if (s.faceOnArrive !== null) s.yawTarget = s.faceOnArrive;
    const cb = s.onArrive;
    s.onArrive = s.faceOnArrive = null;
    if (cb) cb();
  }
  function walkTo(s, target, then = null, face = null) {
    standUp(s);
    s.path = findPath(s.pos, target);
    s.onArrive = then;
    s.faceOnArrive = face;
    s.idleT = 0;
    if (!s.path.length) return arrive(s);
    s.state = "walk";
  }
  function sitDown(s) {
    const seat = SEATS[key(s)];
    s.state = "sit";
    s.pos.set(seat.x, 0, seat.z);
    s.yaw = s.yawTarget = seat.yaw;
    s.standSpot = seat.stand;
  }
  function lieDown(s) {
    const b = BEDS[key(s)];
    s.state = "lie";
    s.pos.set(b.x, 0, b.z);
    s.yaw = s.yawTarget = b.yaw;
    s.standSpot = b.stand;
    updateCover();
  }
  const goSit = s => walkTo(s, SEATS[key(s)].stand, () => sitDown(s));
  const goBed = (s, then) => walkTo(s, BEDS[key(s)].stand, () => { lieDown(s); if (then) then(); });

  // Um ponto livre perto de "p", do lado mais perto de "prefer"
  function spotNear(p, r, prefer) {
    let best = null, bd = Infinity;
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2, x = p.x + Math.cos(a) * r, z = p.z + Math.sin(a) * r;
      if (!isFree(x, z)) continue;
      const d = Math.hypot(x - prefer.x, z - prefer.z);
      if (d < bd) { bd = d; best = new THREE.Vector3(x, 0, z); }
    }
    return best || nearestFreePoint(p.x, p.z);
  }
  // Pedro vai atrás da Karine pra todo lado
  function pedroFollow(target) {
    const spot = spotNear(target, 1.3, pedro.pos);
    walkTo(pedro, spot, null, yawTo(spot, target));
  }

  // ---------- Céu noturno ----------
  const starGeo = new THREE.BufferGeometry();
  const starPos = [];
  for (let i = 0; i < 400; i++) {
    const th = rand(0, Math.PI * 2), ph = rand(0.05, 1.2), r = 55;
    starPos.push(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th));
  }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, transparent: true, opacity: 0, fog: false });
  scene.add(new THREE.Points(starGeo, starMat));

  const fireflies = Array.from({ length: 14 }, () => {
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), new THREE.MeshBasicMaterial({ color: 0xfff59d, transparent: true, opacity: 0 }));
    const [tx, tz] = pick(treeSpots);
    f.userData = { cx: tx + rand(-1.5, 1.5), cz: tz + rand(-1.5, 1.5), ph: rand(0, 10) };
    scene.add(f);
    return f;
  });

  // ---------- Partículas (corações, notas...) ----------
  const particles = [];
  function burst(pos, emojis, n = 8, size = 0.4) {
    for (let i = 0; i < n; i++) {
      const sp = emojiSprite(pick(emojis), size * rand(0.7, 1.2));
      sp.position.copy(pos).add(new THREE.Vector3(rand(-0.3, 0.3), rand(0, 0.3), rand(-0.3, 0.3)));
      scene.add(sp);
      particles.push({ sp, vy: rand(0.6, 1.3), vx: rand(-0.4, 0.4), vz: rand(-0.4, 0.4), age: 0, life: rand(1.6, 2.6) });
    }
  }
  const between = () => karine.g.position.clone().lerp(pedro.g.position, 0.5).setY(2.2);
  const headPos = (s, up = 0.5) => s.head.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, up, 0));

  // ---------- Relógio / dia e noite ----------
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  let gameMin = 6 * 24 * 60 + 10 * 60; // sábado, 10:00
  let speed = 1;
  const clockEl = document.getElementById("lot-clock");
  const dnBtn = document.getElementById("lot-daynight");
  const lerpColor = (a, b, t) => new THREE.Color(a).lerp(new THREE.Color(b), t);
  const skyDay = ["#7cc3ff", "#dff1ff"], skyNight = ["#0b1433", "#2a3a6b"], skyDusk = ["#ff9a8b", "#ffd3a5"];
  let lastSky = "";
  const hourNow = () => (gameMin / 60) % 24;
  const isNight = () => hourNow() >= 21 || hourNow() < 6;

  function applyTime() {
    const hour = hourNow();
    const sunAng = ((hour - 6) / 12) * Math.PI;
    const d = THREE.MathUtils.smoothstep(Math.sin(sunAng), -0.15, 0.3);
    const dusk = Math.max(0, 1 - Math.abs(Math.sin(sunAng)) * 4);
    hemi.intensity = 0.25 + 0.6 * d;
    sun.intensity = 0.12 + 0.8 * d;
    sun.color = lerpColor(0x9fb4ff, 0xfff4e0, d);
    sun.position.set(Math.cos(sunAng) * 16, Math.max(4, Math.abs(Math.sin(sunAng)) * 20), 9);
    lamp.intensity = lamp2.intensity = (1 - d) * 1.5;
    windowMat.emissiveIntensity = (1 - d) * 0.9;
    starMat.opacity = Math.max(0, 1 - d * 1.6);
    const top = lerpColor(skyNight[0], skyDay[0], d).lerp(new THREE.Color(skyDusk[0]), dusk * 0.6);
    const bot = lerpColor(skyNight[1], skyDay[1], d).lerp(new THREE.Color(skyDusk[1]), dusk * 0.6);
    scene.fog.color.copy(bot);
    const sky = `linear-gradient(180deg, #${top.getHexString()}, #${bot.getHexString()})`;
    if (sky !== lastSky) { box.style.setProperty("--sky", sky); lastSky = sky; }
    fireflies.forEach(f => (f.material.opacity = (1 - d) * (0.5 + 0.5 * Math.sin(time * 3 + f.userData.ph))));
    const mins = Math.floor(gameMin) % (24 * 60);
    clockEl.textContent = `${days[Math.floor(gameMin / 1440) % 7]} · ${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
    dnBtn.textContent = d > 0.5 ? "🌙" : "☀️";
    return d;
  }
  dnBtn.addEventListener("click", () => {
    const hour = hourNow();
    const dayStart = Math.floor(gameMin / 1440) * 1440;
    const isDay = hour >= 6 && hour < 21;
    gameMin = isDay ? dayStart + 21 * 60 : dayStart + (hour >= 21 ? 1440 : 0) + 7 * 60;
  });
  function setSpeed(v) {
    speed = v;
    controls.autoRotateSpeed = v ? 0.5 : 0;
    document.querySelectorAll("#lot-speed button").forEach(x => x.classList.toggle("on", +x.dataset.speed === v));
  }
  document.querySelectorAll("#lot-speed button").forEach(b => b.addEventListener("click", () => setSpeed(+b.dataset.speed)));

  // ---------- Rotina: às 21h ela vai dormir, de manhã acorda ----------
  let autoSlept = false, bedtimeToast = false;
  function bedtime() {
    autoSlept = true;
    if (!bedtimeToast) {
      bedtimeToast = true;
      toast("21h: hora de dormir!", `${S.ela.nome} foi pra cama. Não adianta tentar impedir.`, "😴");
      setTimeout(() => toast(`${S.ele.nome} ficou acordado`, "Vendo dorama sozinho. Ela já leu o spoiler mesmo.", "📺"), 4500);
    } else {
      toast("De volta pra cama", `${S.ela.nome} lembrou que já passou das 21h.`, "😴");
    }
    achieve("boanoite");
    goBed(karine);
    if (pedro.state !== "sit" && pedro.state !== "lie") goSit(pedro);
  }
  function morning() {
    autoSlept = bedtimeToast = false;
    toast("Bom dia! ☀️", `${S.ela.nome} acordou depois de 9 horas de sono. Revigorada (e com fome).`, "☀️");
    walkTo(karine, HOME.k);
    walkTo(pedro, HOME.p);
  }
  const isAsleep = () => karine.state === "lie" || (karine.state === "sit" && isNight());

  // ---------- Animações das interações ----------
  let act = null;
  let pbOverride = null; // { who, color, until }
  const DURATIONS = { abraco: 3, coracao: 2.5, tv: 4, bravo: 3.5, danca: 4, pensar: 3.5, agua: 3, suar: 3.5, spoiler: 3.2, colher: 1.2, jogar: 0.9 };

  // who: 0 = Karine, 1 = Pedro (quem é o "protagonista" da animação)
  function startAct(type, who = 0, opts = {}) {
    const me = sims[who];
    clearProps();
    act = { type, who, t: 0, dur: DURATIONS[type] || 3, then: opts.then };
    if (type === "abraco") setTimeout(() => burst(between(), ["💚", "💖", "💕"], 12), 700);
    if (type === "coracao") burst(headPos(me, 0.6), ["💖", "✨", "😊"], 10);
    if (type === "danca") { burst(between(), ["🎵", "🎶", "💜"], 12); purple.intensity = 2.5; }
    if (type === "bravo") { pbOverride = { who, color: 0xe53935, until: time + 4 }; burst(headPos(me, 0.6), ["💢", "😤"], 5); }
    if (type === "suar") { pbOverride = { who, color: 0xff9800, until: time + 4 }; burst(headPos(me, 0.6), ["💦", "😅"], 7, 0.35); }
    if (type === "agua") { cups[who].visible = true; sfx("gole"); burst(headPos(me, 0.6), ["💧"], 6, 0.35); }
    if (type === "tv") { epIndex = episodes.length - 1; drawTV(episodes[epIndex]); }
    if (type === "spoiler") phone.visible = true;
    if (type === "pensar" || type === "spoiler") {
      me.g.add(bubble, bubbleIcon);
      bubbleIcon.material.map = emojiTexture(opts.icon || pick(["🍕", "🍔", "🍣", "🌮", "🍜"]));
      bubble.visible = bubbleIcon.visible = true;
    }
  }
  // Antes de interagir: os dois levantam e o Pedro chega pertinho da Karine
  function play(type, who = 0, opts = {}) {
    if (!speed) setSpeed(1);
    act = null;
    clearProps();
    sims.forEach(s => { standUp(s); s.state = "idle"; s.path = []; s.onArrive = s.faceOnArrive = null; });
    autoSlept = false;
    karine.idleT = 0;
    const d = Math.hypot(karine.pos.x - pedro.pos.x, karine.pos.z - pedro.pos.z);
    if (d > 1.7 || d < 1.0) {
      const spot = spotNear(karine.pos, 1.35, pedro.pos);
      walkTo(pedro, spot, () => startAct(type, who, opts), yawTo(spot, karine.pos));
    } else startAct(type, who, opts);
  }
  window.addEventListener("sims:interacao", e => {
    const o = e.detail;
    if (o.anim) play(o.anim, o.quem === "pedro" ? 1 : 0, { icon: o.balao });
  });
  // Cheats do console que mexem no lote (headlineeffects, clock.advance_game_time, resetsim)
  window.addEventListener("sims:cheat", e => {
    const { cmd, arg } = e.detail;
    if (cmd === "headlineeffects") sims.forEach(s => (s.pb.visible = arg));
    if (cmd === "advance_time") gameMin += arg;
    if (cmd === "resetsim") {
      const s = arg === "pedro" ? pedro : karine;
      act = null;
      clearProps();
      standUp(s);
      Object.assign(s, { state: "idle", path: [], onArrive: null, faceOnArrive: null, idleT: 0 });
      s.pos.copy(s === karine ? HOME.k : HOME.p);
      if (s === karine) autoSlept = false;
      burst(headPos(s, 0.2), ["✨", "🔄"], 10, 0.4);
    }
  });
  window.addEventListener("sims:final", () => {
    for (let i = 0; i < 4; i++) setTimeout(() => burst(between(), ["💖", "💚", "💍", "✨"], 14, 0.5), i * 400);
  });

  function updateSims(dt) {
    const k = act ? Math.min(1, act.t / act.dur) : 0;
    const e = Math.sin(k * Math.PI);
    sims.forEach((s, i) => {
      const other = sims[1 - i];

      // Andando pelo caminho
      if (s.state === "walk") {
        const tgt = s.path[0];
        if (!tgt) arrive(s);
        else {
          const dx = tgt.x - s.pos.x, dz = tgt.z - s.pos.z, d = Math.hypot(dx, dz), step = WALK * dt;
          if (d <= step) { s.pos.x = tgt.x; s.pos.z = tgt.z; s.path.shift(); if (!s.path.length) arrive(s); }
          else { s.pos.x += (dx / d) * step; s.pos.z += (dz / d) * step; s.yawTarget = Math.atan2(dx, dz); }
          s.phase += step * 3.4;
        }
      }

      let off = new THREE.Vector3(), y = 0, rx = 0, spin = null, legX = 0, armR = null;
      let armX = Math.sin(time * 2 + i) * 0.08, tilt = Math.sin(time * 1.3 + i * 2) * 0.07;

      if (s.state === "walk") {
        const sw = Math.sin(s.phase);
        legX = sw * 0.55;
        armX = -sw * 0.45;
        y = Math.abs(Math.cos(s.phase)) * 0.04;
      } else if (s.state === "sit") {
        legX = -1.4; y = -0.14; armX = -0.35;
        if (s === karine && isNight()) tilt = 0.45;
      } else if (s.state === "lie") {
        rx = -Math.PI / 2; y = 0.8; armX = 0; tilt = s === karine ? 0.25 : 0;
      } else if (!act) {
        // Parado: olha pro outro (e um pouquinho pra câmera, como no jogo)
        const dOther = Math.hypot(other.pos.x - s.pos.x, other.pos.z - s.pos.z);
        if (dOther < 3.2) {
          const a = yawTo(s.pos, other.pos);
          s.yawTarget = a + wrapAngle(yawTo(s.pos, camera.position) - a) * 0.3;
        }
      }

      if (act && s.state === "idle") {
        const me = i === act.who;
        const dir = new THREE.Vector3(other.pos.x - s.pos.x, 0, other.pos.z - s.pos.z).normalize();
        const faceOther = yawTo(s.pos, other.pos);
        const hold = Math.min(1, e * 3); // sobe rápido, segura e desce
        switch (act.type) {
          case "abraco": off.copy(dir).multiplyScalar(0.4 * e); armX = -1.3 * e; s.yawTarget = faceOther; break;
          case "danca": y = Math.abs(Math.sin(act.t * 7)) * 0.35 * e; spin = faceOther + act.t * 5 * (i ? -1 : 1); armX = -2.6 + Math.sin(act.t * 14 + i) * 0.4; break;
          case "tv": s.yawTarget = yawTo(s.pos, tv.position); break;
          case "bravo": if (me) { tilt = Math.sin(act.t * 25) * 0.25 * e; armX = -0.4 * e; } else s.yawTarget = faceOther; break;
          case "pensar": if (me) { tilt = 0.3 * e; armX = -0.6 * e; } break;
          case "spoiler": if (me) { tilt = 0.2 * hold; armR = -1.25 * hold; } break;
          case "agua": if (me) { tilt = -0.1 * e; armR = -2.1 * e; } break;
          case "coracao": if (me) { tilt = 0.25 * e; y = Math.abs(Math.sin(act.t * 6)) * 0.15 * e; } else s.yawTarget = faceOther; break;
          case "suar": if (me) { tilt = Math.sin(act.t * 16) * 0.1 * e; armX = -0.3 * e; } else s.yawTarget = faceOther; break;
          case "colher": if (me) { armX = -1.1 * e; tilt = 0.2 * e; } break;
          case "jogar": if (me) armR = -2.7 * e; break;
        }
      }

      if (spin !== null) s.yaw = spin;
      else s.yaw += wrapAngle(s.yawTarget - s.yaw) * Math.min(1, dt * 8);
      s.g.position.set(s.pos.x + off.x, y, s.pos.z + off.z);
      s.g.rotation.set(rx, s.yaw, 0);
      s.legs[0].rotation.x = legX;
      s.legs[1].rotation.x = s.state === "walk" ? -legX : legX;
      s.arms[0].rotation.x = armX;
      s.arms[1].rotation.x = armR !== null ? armR : s.state === "walk" ? -armX : armX;
      s.head.rotation.z = tilt;

      // Plumbob sempre em pé, mesmo deitado
      if (s.state === "lie") { s.pb.position.set(0, 1.5, 0.95); s.pb.rotation.x = Math.PI / 2; }
      else { s.pb.position.set(0, 2.75 + Math.sin(time * 2 + i) * 0.06, 0); s.pb.rotation.x = 0; }
      s.pb.rotation.y += dt * 1.6;
    });

    if (act) {
      act.t += dt;
      if (act.t >= act.dur) {
        const done = act;
        act = null;
        clearProps();
        if (done.type === "danca") purple.intensity = document.body.classList.contains("borahae") ? 1.5 : 0;
        if (done.then) done.then();
      }
    }
  }

  // Cor do plumbob segue o tema do site (verde, rosa no final, roxo no borahae)
  function syncPlumbob() {
    const css = getComputedStyle(document.body).getPropertyValue("--pb").trim() || "#4cd137";
    if (pbOverride && time >= pbOverride.until) pbOverride = null;
    sims.forEach((s, i) => {
      const want = pbOverride && pbOverride.who === i ? pbOverride.color : css;
      if (s.pbColor === want) return;
      s.pbColor = want;
      s.pbMat.color.set(want);
      s.pbMat.emissive.set(want);
    });
  }

  // ---------- Cliques ----------
  const carta = document.getElementById("hogwarts");
  document.getElementById("hog-text").innerHTML = S.cartaHogwarts.map(p => `<p>${p}</p>`).join("");
  document.getElementById("hog-close").addEventListener("click", () => carta.classList.add("hidden"));
  carta.addEventListener("click", e => { if (e.target === carta) carta.classList.add("hidden"); });

  let owlFly = 0, wokeUpWarned = false;
  const fridgeFalas = [
    `${S.ela.nome} abriu a geladeira, olhou por 40 segundos e fechou. "Não tem nada pra comer." (Tem.)`,
    "Abriu de novo. O conteúdo não mudou.",
    "Terceira vez. A geladeira continua igual. A esperança também.",
    `"Amor, o que tem pra comer?" (Ela está olhando para a comida.)`,
  ];
  let megToasts = {};
  const megOnce = (k, title, text) => { if (!megToasts[k]) { megToasts[k] = true; toast(title, text, "🐶"); } };
  const megFalas = [
    "Au au! (Tradução: \"cadê o petisco?\")",
    `${PET.nome} pediu carinho. Recebeu. Pediu de novo.`,
    `${PET.nome} é a única da casa que bebe água sem ninguém lembrar.`,
    `${PET.nome} também dorme às 21h. Puxou a mãe.`,
    `${PET.nome} aprova o casal. Desde que tenha petisco.`,
  ];
  const treeFalas = ["Esta árvore dá frutos a cada 10 anos. Este ano deu 💚.", "Gravado no tronco: K + P ❤️", "Uma árvore muito comum. Diferente da Karine."];

  // Karine vai até um lugar, olha pra algo e então faz a ação. O Pedro vem junto.
  function goDo(target, lookAt, then) {
    const spot = nearestFreePoint(target.x, target.z);
    autoSlept = false;
    showMarker(spot);
    sfx("clique");
    walkTo(karine, spot, then, lookAt ? yawTo(spot, lookAt) : null);
    pedroFollow(spot);
  }

  function sitTogether(then) {
    autoSlept = false;
    showMarker(SEATS.k.stand);
    sfx("clique");
    walkTo(karine, SEATS.k.stand, () => { sitDown(karine); if (then) then(); });
    goSit(pedro);
  }

  const actions = {
    karine: ev => {
      if (isAsleep()) achieve("porquinho");
      if (isAsleep() && !wokeUpWarned) { wokeUpWarned = true; toast("Shhh!", `${S.ela.nome} está dormindo. Mas pra você ela acorda. 💤`, "😴"); }
      API.openPieAt && API.openPieAt(ev.clientX, ev.clientY);
    },
    pedro: ev => API.openPieAt && API.openPieAt(ev.clientX, ev.clientY, "pedro"),
    sofa: () => sitTogether(() => toast("Sentaram juntinhos", isNight() ? `${S.ela.nome} dormiu no sofá. Eram 21h01.` : "Dorama escolhido (e com spoiler já lido).", "🛋️")),
    // Antes de sentar pra ver dorama, ela pesquisa o spoiler no celular
    tv: () => {
      autoSlept = false;
      showMarker(SEATS.k.stand);
      sfx("clique");
      walkTo(karine, SEATS.k.stand, () => {
        toast("Pesquisando no celular...", "\"esse dorama tem final feliz?\" 🔍", "📱");
        startAct("spoiler", 0, {
          icon: "🔍",
          then: () => {
            sitDown(karine);
            epIndex = (epIndex + 1) % episodes.length;
            drawTV(episodes[epIndex]);
            toast("Final feliz confirmado ✅", `Agora sim: ${episodes[epIndex][0]}. Pode dar play.`, "📺");
            achieve("spoiler");
          },
        });
      }, yawTo(SEATS.k.stand, tv.position));
      goSit(pedro);
    },
    fridge: () => goDo(new THREE.Vector3(7.75, 0, -5.25), fridge.position, () => {
      fridgeTarget = 1;
      sfx("pop");
      const msg = fridgeFalas[fridgeCount++ % fridgeFalas.length];
      startAct("pensar", 0, { icon: "🤔", then: () => { fridgeTarget = 0; toast("Geladeira", msg, "🧊"); } });
      // A Meg escuta a geladeira abrir de qualquer lugar do lote
      if (!dog.task) {
        dogTask("beg", new THREE.Vector3(6.75, 0, -4.75));
        megOnce("beg", PET.nome, "Ouviu a geladeira abrir lá do quintal. Veio correndo.");
      }
    }),
    water: () => goDo(new THREE.Vector3(6.25, 0, -5.25), counter.position, () => {
      startAct("agua", 0);
      toast("+10 Hidratação", `${S.ela.nome} bebeu água SEM ninguém lembrar. Evento raríssimo! 💧`, "🚰");
      API.setMood && API.setMood({ emoji: "💧", nome: "Hidratada" });
      achieve("agua");
    }),
    ball: () => {
      if (ballFly || ballHeld || dog.task) return;
      goDo(spotNear(ball.position, 0.5, karine.pos), ball.position, () => {
        let to = HOME.p;
        for (let k = 0; k < 30; k++) {
          const a = rand(0, Math.PI * 2), d = rand(4, 6.5);
          const x = karine.pos.x + Math.cos(a) * d, z = karine.pos.z + Math.sin(a) * d;
          if (isFree(x, z)) { to = new THREE.Vector3(x, 0, z); break; }
        }
        startAct("jogar", 0);
        sfx("pop");
        ballFly = { from: karine.pos.clone().setY(1.7), to, t: 0 };
        dogTask("fetch", to);
        achieve("meg");
      });
    },
    bed: () => {
      autoSlept = isNight();
      showMarker(BEDS.k.stand);
      sfx("clique");
      goBed(karine, () => {
        toast(isNight() ? "Boa noite! 💤" : "Cochilo da tarde", `${S.ela.nome} dormiu em 4 segundos. Recorde pessoal.`, "😴");
        if (isNight()) achieve("boanoite");
      });
      goBed(pedro);
    },
    shelf: () => goDo(new THREE.Vector3(-5.25, 0, -0.25), shelf.position, () => toast("Estante de Hogwarts", "7 livros, 3 edições de cada. A Karine sabe explicar o porquê. (Lufa-Lufa raiz 🦡)", "📚")),
    army: () => goDo(new THREE.Vector3(-5.75, 0, 1.25), army.position, () => {
      API.cheat && API.cheat("borahae");
      purple.intensity = document.body.classList.contains("borahae") ? 1.5 : 0;
    }),
    pool: () => goDo(new THREE.Vector3(-0.25, 0, -9.25), pool.position, () => toast("Piscina", "Relaxa: a escada está aqui. Ninguém vai ficar preso (dessa vez). 😇", "🏊")),
    meg: () => {
      dog.jump = 1;
      dog.happy = 4;
      sfx("latido");
      burst(meg.position.clone().setY(0.9), ["💕", "🐾", "🦴"], 6, 0.3);
      toast(PET.nome, pick(megFalas), "🐶");
    },
    tree: (ev, obj) => goDo(spotNear(obj.position, 1.3, karine.pos), obj.position, () => toast("Árvore", pick(treeFalas), "🌳")),
    owl: () => goDo(new THREE.Vector3(7.25, 0, 11.25), mailbox.position, () => {
      owlFly = 2.2;
      flag.rotation.z = -1.2;
      sfx("sininho");
      if (!dog.task) dogTask("bark", BARK_SPOT);
      setTimeout(() => { carta.classList.remove("hidden"); achieve("maroto"); }, 900);
    }),
    crop: (ev, obj) => {
      const c = obj.userData.crop;
      if (!c.ready) return toast("Ainda crescendo...", "Paciência, fazendeira! Rega todo dia que cresce.", "🌱");
      goDo(obj.position, obj.position, () => {
        if (!c.ready) return;
        c.ready = false;
        c.grow = 0;
        obj.userData.label = "🌱 Crescendo...";
        act = { type: "colher", t: 0, dur: 1.2 };
        sfx("colher");
        burst(obj.position.clone().setY(0.8), [c.type.emoji], 4, 0.45);
        toast(`Você colheu: ${c.type.nome}!`, `+1 coração com ${S.ele.nome} 💚`, c.type.emoji);
        achieve("colheita");
      });
    },
    // Cômodos novos da casa
    pc: () => goDo(new THREE.Vector3(-7.25, 0, -2.75), pc.position, () => {
      toast("Computador", "The Sims aberto. Hora de criar a 38ª família?", "💻");
      setTimeout(() => { const b = document.querySelector("[data-familias]"); if (b) b.click(); }, 1200);
    }),
    guest: () => goDo(new THREE.Vector3(-6.25, 0, -5.25), new THREE.Vector3(-8.2, 0, -5.25), () => toast("Outro quarto", `Oficialmente é de visitas. Na prática, a ${PET.nome} acha que é dela.`, "🛏️")),
    suite: () => goDo(new THREE.Vector3(-6.25, 0, 5.25), new THREE.Vector3(-8.2, 0, 5.25), () => toast("Suíte", "Entrada só batendo na porta. 🚪", "🚪")),
    wc: (ev, obj) => goDo(spotNear(obj.position, 1.0, karine.pos), obj.position, () => toast("Bexiga", "Precisa ir exatamente quando o filme começa. Sempre.", "🚽")),
    sink: () => goDo(new THREE.Vector3(-0.25, 0, -3.25), sink.position, () => {
      startAct("coracao", 0);
      toast("Skincare coreano", "Passo 7 de 10. Volte em 40 minutos.", "🧴");
    }),
    mesa: () => goDo(new THREE.Vector3(4.25, 0, -3.25), mesa.position, () => {
      startAct("pensar", 0);
      toast("Jantar", `${S.ela.nome} pediu "qualquer coisa". Não era isso que ela queria.`, "🍽️");
    }),
    ground: (ev, hit) => {
      const p = nearestFreePoint(hit.point.x, hit.point.z);
      autoSlept = false;
      showMarker(p);
      sfx("clique");
      walkTo(karine, p);
      pedroFollow(p);
    },
  };

  window.__lote = { actions, sims, get dog() { return dog; }, ball }; // atalho para testes no console

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function hitAt(ev) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    for (const h of raycaster.intersectObjects(scene.children, true)) {
      if (h.object.isSprite || h.object.isPoints || h.object === marker) continue;
      let o = h.object;
      while (o && !o.userData.action) o = o.parent;
      if (o) return { obj: o };
      if (h.object === ground) return h.face && h.face.normal.y > 0.5 ? { point: h.point } : null;
    }
    return null;
  }

  const tip = document.getElementById("lot-tip");
  let down = null;
  renderer.domElement.addEventListener("pointerdown", e => (down = { x: e.clientX, y: e.clientY }));
  renderer.domElement.addEventListener("pointerup", e => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
    down = null;
    const hit = hitAt(e);
    if (!hit) return;
    controls.autoRotate = false;
    if (!speed) setSpeed(1);
    if (hit.obj) actions[hit.obj.userData.action](e, hit.obj);
    else actions.ground(e, hit);
  });
  renderer.domElement.addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse") return;
    const hit = hitAt(e);
    const o = hit && hit.obj;
    renderer.domElement.style.cursor = o ? "pointer" : hit ? "crosshair" : "";
    tip.classList.toggle("show", !!o);
    if (o) {
      const r = lot.getBoundingClientRect();
      tip.textContent = o.userData.label;
      tip.style.transform = `translate(${e.clientX - r.left + 14}px, ${e.clientY - r.top + 14}px)`;
    }
  });
  renderer.domElement.addEventListener("pointerleave", () => tip.classList.remove("show"));

  // ---------- Câmera: segue a Karine, com botões de zoom ----------
  let zoom = 0;
  const camGoal = new THREE.Vector3(), camDelta = new THREE.Vector3();
  function followCamera(raw) {
    camGoal.set(karine.pos.x, 1, karine.pos.z);
    camDelta.copy(camGoal).sub(controls.target).multiplyScalar(Math.min(1, raw * 2.5));
    controls.target.add(camDelta);
    camera.position.add(camDelta);
    const off = camera.position.clone().sub(controls.target);
    off.setLength(off.length() + (zoom - off.length()) * Math.min(1, raw * 5));
    camera.position.copy(controls.target).add(off);
  }
  const zoomBy = f => (zoom = Math.max(9, Math.min(48, zoom * f)));
  document.getElementById("lot-zoom-in").addEventListener("click", () => zoomBy(0.75));
  document.getElementById("lot-zoom-out").addEventListener("click", () => zoomBy(1.33));
  document.getElementById("lot-walls").addEventListener("click", () => {
    wallsUp = !wallsUp;
    toast(wallsUp ? "Paredes levantadas" : "Paredes abaixadas", wallsUp ? "Agora parece a casa de verdade." : "Melhor pra enxergar lá dentro.", "🧱");
  });

  // ---------- Tamanho / visibilidade ----------
  function resize() {
    const w = box.clientWidth, h = box.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (!zoom) zoom = w < 600 ? 40 : w < 900 ? 32 : 28;
  }
  new ResizeObserver(resize).observe(box);
  resize();

  let visible = true;
  new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(box);

  // ---------- Meg segue a Karine pra todo lado ----------
  const DOG_BED = new THREE.Vector3(-6.25, 0, 1.25); // no chão, ao lado da cama
  const dog = { pos: meg.position.clone(), path: [], yaw: 0, phase: 0, think: 1, jump: 0, happy: 0 };
  function randomSpotNear(p, r) {
    for (let k = 0; k < 12; k++) {
      const a = rand(0, Math.PI * 2), d = rand(r * 0.6, r);
      const x = p.x + Math.cos(a) * d, z = p.z + Math.sin(a) * d;
      if (isFree(x, z)) return new THREE.Vector3(x, 0, z);
    }
    return null;
  }
  // Tarefas da Meg: buscar a bolinha, latir pra coruja, pedir comida
  const BARK_SPOT = new THREE.Vector3(7.25, 0, 10.25);
  let barkTimer = 40, owlHop = 0;
  function dogTask(type, target) {
    dog.task = { type, stage: 0, t: 0, next: 0.2, count: 0 };
    dog.path = findPath(dog.pos, target);
  }
  function dogTaskStep(dt) {
    const T = dog.task;
    T.t += dt;
    if (T.type === "fetch") {
      if (T.stage === 0) {
        if (ballFly) return;
        ballHeld = true;
        T.stage = 1;
        dog.path = findPath(dog.pos, spotNear(karine.pos, 0.9, dog.pos));
      } else if (Math.hypot(karine.pos.x - dog.pos.x, karine.pos.z - dog.pos.z) > 1.7) {
        dog.path = findPath(dog.pos, spotNear(karine.pos, 0.9, dog.pos));
      } else {
        ballHeld = false;
        ball.position.set(dog.pos.x + Math.sin(dog.yaw) * 0.5, 0.11, dog.pos.z + Math.cos(dog.yaw) * 0.5);
        dog.task = null;
        dog.jump = 1;
        dog.happy = 5;
        sfx("latido");
        burst(meg.position.clone().setY(0.9), ["💕", "🎾"], 5, 0.3);
        megOnce("fetch", PET.nome, "Trouxe a bolinha de volta! (Agora quer que jogue mais 47 vezes.)");
      }
    } else if (T.type === "bark") {
      dog.yaw += wrapAngle(yawTo(dog.pos, mailbox.position) - dog.yaw) * Math.min(1, dt * 8);
      if (T.t > T.next) {
        T.next = T.t + 0.7;
        T.count++;
        dog.jump = 1;
        owlHop = 1;
        sfx("latido");
        burst(meg.position.clone().setY(1), ["❗"], 1, 0.35);
      }
      if (T.count >= 3 && dog.jump <= 0) {
        dog.task = null;
        megOnce("bark", PET.nome, "Não confia na coruja. Nunca confiou.");
      }
    } else if (T.type === "beg") {
      dog.yaw += wrapAngle(yawTo(dog.pos, karine.pos) - dog.yaw) * Math.min(1, dt * 8);
      if (T.t > T.next) { T.next = T.t + 0.9; dog.jump = 1; dog.happy = 2; burst(meg.position.clone().setY(1), ["🦴", "🥺"], 1, 0.3); }
      if (T.t > 4.5) dog.task = null;
    }
  }

  function updateDog(dt) {
    const kd = Math.hypot(karine.pos.x - dog.pos.x, karine.pos.z - dog.pos.z);
    const toBed = karine.state === "lie" && !dog.task;
    dog.think -= dt;
    // De vez em quando ela vai latir pra coruja
    barkTimer -= dt;
    if (barkTimer <= 0) {
      barkTimer = rand(60, 110);
      if (!dog.task && karine.state !== "lie" && !isNight()) dogTask("bark", BARK_SPOT);
    }
    if (dog.task && !dog.path.length) dogTaskStep(dt);
    if (!dog.task && dog.think <= 0 && !dog.path.length) {
      dog.think = rand(1.2, 3);
      let goal = null;
      if (toBed) goal = Math.hypot(dog.pos.x - DOG_BED.x, dog.pos.z - DOG_BED.z) > 0.2 ? DOG_BED : null;
      else if (kd > 2.2) goal = spotNear(karine.pos, 1.0, dog.pos);
      else if (Math.random() < 0.45) goal = randomSpotNear(karine.pos, 1.8);
      if (goal) dog.path = findPath(dog.pos, goal);
    }
    const walking = dog.path.length > 0;
    if (walking) {
      const tgt = dog.path[0];
      const dx = tgt.x - dog.pos.x, dz = tgt.z - dog.pos.z, d = Math.hypot(dx, dz);
      const step = (dog.task || kd > 3 ? 3.4 : 2.2) * dt;
      if (d <= step) { dog.pos.copy(tgt); dog.path.shift(); }
      else { dog.pos.x += (dx / d) * step; dog.pos.z += (dz / d) * step; }
      if (d > 0.01) dog.yaw += wrapAngle(Math.atan2(dx, dz) - dog.yaw) * Math.min(1, dt * 10);
      dog.phase += step * 9;
    } else if (!toBed && !dog.task) {
      dog.yaw += wrapAngle(yawTo(dog.pos, karine.pos) - dog.yaw) * Math.min(1, dt * 4);
    }
    const sleeping = toBed && !walking;
    dog.jump = Math.max(0, dog.jump - dt * 2.5);
    dog.happy = Math.max(0, dog.happy - dt);
    meg.position.set(dog.pos.x, Math.sin(dog.jump * Math.PI) * 0.35, dog.pos.z);
    meg.rotation.y = dog.yaw;
    megBody.position.y = sleeping ? -0.2 : walking ? Math.abs(Math.sin(dog.phase)) * 0.03 : 0;
    megLegs.forEach((l, i) => (l.rotation.x = sleeping ? (i < 2 ? -1.4 : 1.4) : walking ? Math.sin(dog.phase + (i === 1 || i === 2 ? Math.PI : 0)) * 0.6 : 0));
    megHead.rotation.x = sleeping ? 0.35 : Math.sin(time * 1.7) * 0.06;
    megTail.rotation.y = sleeping ? 0 : Math.sin(time * (dog.happy || kd < 1.6 ? 22 : 8)) * 0.6;
    if (sleeping && Math.random() < dt * 0.3) burst(meg.position.clone().setY(0.7), ["💤"], 1, 0.25);
    // Bolinha: voando em arco, ou na boca da Meg
    if (ballFly) {
      ballFly.t = Math.min(1, ballFly.t + dt / 0.9);
      const t = ballFly.t;
      ball.position.lerpVectors(ballFly.from, ballFly.to, t);
      ball.position.y = ballFly.from.y * (1 - t) + 0.11 + Math.sin(t * Math.PI) * 2.2;
      if (t >= 1) { ball.position.y = 0.11; ballFly = null; }
    } else if (ballHeld) {
      ball.position.set(dog.pos.x + Math.sin(dog.yaw) * 0.55, 0.62 + meg.position.y, dog.pos.z + Math.cos(dog.yaw) * 0.55);
    }
  }

  // ---------- Loop ----------
  const clock = new THREE.Clock();
  let time = 0, epTimer = 0, frame = 0, oinkToast = false;
  const tmp = new THREE.Vector3();
  function loop() {
    requestAnimationFrame(loop);
    const raw = Math.min(clock.getDelta(), 0.05);
    if (!visible) return;
    const dt = raw * speed;
    time += dt;
    gameMin += dt * 2; // 2 minutos de jogo por segundo
    followCamera(raw);
    controls.update();
    walls.scale.y += ((wallsUp ? 1 : 0.36) - walls.scale.y) * Math.min(1, raw * 6);
    applyTime();
    updateSims(dt);
    if (frame++ % 15 === 0) syncPlumbob();

    // Rotina: dormir às 21h (e voltar pra cama se acordarem ela), acordar de manhã
    const night = isNight();
    if (karine.state === "idle" && !act && speed) karine.idleT += raw; else karine.idleT = 0;
    if (night && karine.idleT > (bedtimeToast ? 6 : 1)) { karine.idleT = 0; bedtime(); }
    if (night && isAsleep()) achieve("boanoite"); // dormiu depois das 21h (na cama ou no sofá)
    if (!night && autoSlept && karine.state === "lie") morning();
    if (!night) wokeUpWarned = oinkToast = false;

    // TV troca de episódio sozinha
    epTimer += dt;
    if (epTimer > 5 && !act) { epTimer = 0; epIndex = (epIndex + 1) % episodes.length; drawTV(episodes[epIndex]); }

    // Plantas crescendo de novo
    crops.forEach(c => {
      const d = c.userData.crop;
      if (!d.ready) {
        d.grow = Math.min(1, d.grow + dt / 8);
        if (d.grow >= 1) { d.ready = true; c.userData.label = `${d.type.emoji} ${d.type.nome} (pronto pra colher)`; }
      }
      const s = d.ready ? 1 + Math.sin(time * 3 + c.position.x) * 0.03 : Math.max(0.05, d.grow);
      d.plant.scale.setScalar(s);
    });

    updateDog(dt);

    // Coruja voando
    if (owlFly > 0) {
      owlFly -= dt;
      const p = 1 - owlFly / 2.2;
      owl.position.set(Math.sin(p * Math.PI * 2) * 1.5, 1.43 + Math.sin(p * Math.PI) * 2, Math.cos(p * Math.PI * 2) * 1.5 - 1.5);
      owl.rotation.y += dt * 6;
      if (owlFly <= 0) { owl.position.set(0, 1.43, 0); owl.rotation.y = 0.6; flag.rotation.z = 0; }
    } else {
      owl.rotation.y = 0.6 + Math.sin(time * 0.7) * 0.4;
      owlHop = Math.max(0, owlHop - dt * 3);
      owl.position.y = 1.43 + Math.sin(owlHop * Math.PI) * 0.3;
    }
    fridgeOpen += (fridgeTarget - fridgeOpen) * Math.min(1, dt * 6);
    fridgeDoor.rotation.y = -fridgeOpen * 1.9;
    fridgeInside.visible = fridgeOpen > 0.05;

    trees.forEach((t, i) => (t.rotation.z = Math.sin(time * 1.2 + i) * 0.015));
    water.material.emissiveIntensity = 0.2 + Math.sin(time * 2) * 0.08;
    fireflies.forEach(f => {
      const u = f.userData;
      f.position.set(u.cx + Math.sin(time * 0.7 + u.ph) * 0.8, 1 + Math.sin(time * 1.3 + u.ph) * 0.5, u.cz + Math.cos(time * 0.6 + u.ph) * 0.8);
    });

    if (markerLife > 0) {
      markerLife = Math.max(0, markerLife - raw * 1.2);
      marker.material.opacity = markerLife;
      marker.scale.setScalar(1 + (1 - markerLife) * 0.6);
    }

    // Zzz... e de vez em quando um porquinho 🐷
    if (isAsleep() && Math.random() < dt * 0.7) {
      const oink = Math.random() < 0.15;
      burst(headPos(karine, 0.4).add(new THREE.Vector3(0.2, 0, 0)), [oink ? "🐷" : "💤"], 1, oink ? 0.5 : 0.4);
      if (oink) {
        sfx("oinc");
        if (!oinkToast) { oinkToast = true; toast("Oinc!", `${S.ela.nome} fez porquinho dormindo. Ela vai negar. 🐷`, "🐷"); }
      }
    }

    // Corações de vez em quando entre os dois (quando estão juntinhos e acordados)
    const close = Math.hypot(karine.pos.x - pedro.pos.x, karine.pos.z - pedro.pos.z) < 2.5;
    if (close && !isAsleep() && Math.random() < dt * 0.35) burst(between(), ["💚", "💕"], 1, 0.35);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.age += raw;
      p.sp.position.x += p.vx * raw;
      p.sp.position.y += p.vy * raw;
      p.sp.position.z += p.vz * raw;
      p.sp.material.opacity = 1 - p.age / p.life;
      if (p.age >= p.life) { scene.remove(p.sp); p.sp.material.dispose(); particles.splice(i, 1); }
    }

    // Etiquetas de nome acima do plumbob
    const w = box.clientWidth, h = box.clientHeight;
    sims.forEach(s => {
      s.pb.getWorldPosition(tmp).add(new THREE.Vector3(0, 0.5, 0)).project(camera);
      s.label.style.transform = `translate(-50%, -100%) translate(${((tmp.x + 1) / 2) * w}px, ${((1 - tmp.y) / 2) * h}px)`;
    });

    renderer.render(scene, camera);
  }
  loop();
})();
