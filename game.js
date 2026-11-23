"use strict";

const MAP_SIZE = 2000;
const ROAD_WIDTH = 10;
const TOWER_BASE_RADIUS = 10;
const ENEMY_RADIUS = 5;
const PATH_POINTS = [
  [0, 0],
  [400, 200],
  [700, 800],
  [1200, 900],
  [1500, 1400],
  [1800, 1700],
  [2000, 2000],
];

const TOWER_SPECS = {
  small: { key: "small", name: "小型塔", range: 75, dps: 10, cost: 100, max: 20, color: "#55a9df" },
  medium: { key: "medium", name: "中型塔", range: 125, dps: 20, cost: 250, max: 15, color: "#f5c451" },
  large: { key: "large", name: "大型塔", range: 200, dps: 40, cost: 600, max: 10, color: "#e6534f" },
};

const UPGRADE_TO = { small: "medium", medium: "large" };
const Q1_BEST_LAYOUT = [
  ["medium", 780.185508269555, 733.6417436506911],
  ["medium", 750.4918927478849, 764.207202927242],
  ["medium", 768.8871974968961, 773.4735764952864],
  ["medium", 775.4248153770882, 753.2686488146782],
  ["medium", 755.4247544909765, 739.1554512038435],
  ["medium", 740.0744242332423, 784.5603763865835],
  ["medium", 758.9846149952917, 791.4224740076542],
  ["medium", 729.5414462367831, 747.9215463226894],
];
const segmentLengths = [];
const cumulativeLengths = [0];
for (let index = 0; index < PATH_POINTS.length - 1; index += 1) {
  const [ax, ay] = PATH_POINTS[index];
  const [bx, by] = PATH_POINTS[index + 1];
  const length = Math.hypot(bx - ax, by - ay);
  segmentLengths.push(length);
  cumulativeLengths.push(cumulativeLengths.at(-1) + length);
}
const PATH_LENGTH = cumulativeLengths.at(-1);

const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");
const canvasMessage = document.querySelector("#canvas-message");
const statusMessage = document.querySelector("#status-message");
const modeDescription = document.querySelector("#mode-description");
const selectedInfo = document.querySelector("#selected-info");
const fundsStat = document.querySelector("#funds-stat");
const timeStat = document.querySelector("#time-stat");
const killsStat = document.querySelector("#kills-stat");
const leaksStat = document.querySelector("#leaks-stat");
const detailStat = document.querySelector("#detail-stat");
const startButton = document.querySelector("#start-button");
const speedButton = document.querySelector("#speed-button");
const restartButton = document.querySelector("#restart-button");
const presetButton = document.querySelector("#preset-button");
const upgradeButton = document.querySelector("#upgrade-button");
const modeButtons = [...document.querySelectorAll(".mode-button")];
const towerButtons = [...document.querySelectorAll(".tower-button")];

let state;
let running = false;
let speed = 1;
let selectedKind = "small";
let selectedTowerId = null;
let hoverWorld = null;
let simulationAccumulator = 0;
let lastFrameTime = performance.now();

function pointOnPath(distance) {
  const clamped = Math.max(0, Math.min(PATH_LENGTH, distance));
  for (let index = 0; index < segmentLengths.length; index += 1) {
    if (clamped <= cumulativeLengths[index + 1]) {
      const [ax, ay] = PATH_POINTS[index];
      const [bx, by] = PATH_POINTS[index + 1];
      const local = (clamped - cumulativeLengths[index]) / segmentLengths[index];
      return [ax + (bx - ax) * local, ay + (by - ay) * local];
    }
  }
  return [...PATH_POINTS.at(-1)];
}

function distanceToSegment(point, start, end) {
  const [px, py] = point;
  const [ax, ay] = start;
  const [bx, by] = end;
  const dx = bx - ax;
  const dy = by - ay;
  const denominator = dx * dx + dy * dy;
  if (denominator === 0) return Math.hypot(px - ax, py - ay);
  const raw = ((px - ax) * dx + (py - ay) * dy) / denominator;
  const t = Math.max(0, Math.min(1, raw));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function distanceToRoad(point) {
  let best = Number.POSITIVE_INFINITY;
  for (let index = 0; index < PATH_POINTS.length - 1; index += 1) {
    best = Math.min(best, distanceToSegment(point, PATH_POINTS[index], PATH_POINTS[index + 1]));
  }
  return best;
}

function makeEnemy(id, wave, spawnTime, maxHp, enemySpeed, bounty) {
  return {
    id,
    wave,
    spawnTime,
    maxHp,
    hp: maxHp,
    speed: enemySpeed,
    bounty,
    distance: 0,
    active: false,
    finished: false,
    leaked: false,
    x: 0,
    y: 0,
  };
}

function buildSchedule(mode) {
  if (mode === "q1") {
    return Array.from({ length: 10 }, (_, index) =>
      makeEnemy(index + 1, 1, index * 10, 1700, 20, 0),
    );
  }
  const waveSpecs = [
    [5, 1500, 10, 20, 50],
    [5, 1800, 8, 15, 100],
    [5, 2000, 6, 12, 200],
    [10, 2500, 5, 10, 300],
  ];
  const enemies = [];
  let nextWaveStart = 0;
  let enemyId = 1;
  waveSpecs.forEach(([count, hp, interval, enemySpeed, bounty], waveIndex) => {
    for (let member = 0; member < count; member += 1) {
      enemies.push(
        makeEnemy(enemyId, waveIndex + 1, nextWaveStart + member * interval, hp, enemySpeed, bounty),
      );
      enemyId += 1;
    }
    nextWaveStart += count * interval;
  });
  return enemies;
}

function resetGame(mode = state?.mode ?? "q2") {
  state = {
    mode,
    time: 0,
    started: false,
    funds: 2000,
    totalSpent: 0,
    kills: 0,
    leaks: 0,
    towers: [],
    enemies: buildSchedule(mode),
    beams: [],
    nextTowerId: 1,
  };
  running = false;
  selectedTowerId = null;
  simulationAccumulator = 0;
  setStatus(mode === "q1"
    ? "问题1：请在开始前完成全部布塔；开始后不能建塔或升级。"
    : "问题2：战斗过程中可以随时建塔和升级，击杀会获得赏金。",
  );
  updateModeButtons();
  draw();
  updateInterface();
}

function activeEnemies() {
  return state.enemies.filter((enemy) => enemy.active && !enemy.finished);
}

function loadQ1BestLayout() {
  resetGame("q1");
  for (const [kind, x, y] of Q1_BEST_LAYOUT) {
    const [ok, message] = placeTower(kind, x, y);
    if (!ok) {
      setStatus(`优化方案载入失败：${message}`);
      return;
    }
  }
  selectedTowerId = null;
  setStatus("已载入问题1当前最优已知方案：8座中型塔，满足题面塔心间距≥20米。点击开始观看复验。");
  draw();
  updateInterface();
}

function gameComplete() {
  return state.enemies.every((enemy) => enemy.finished);
}

function towerCounts() {
  return Object.fromEntries(
    Object.keys(TOWER_SPECS).map((kind) => [kind, state.towers.filter((tower) => tower.kind === kind).length]),
  );
}

function validatePosition(x, y) {
  if (
    x < TOWER_BASE_RADIUS || x > MAP_SIZE - TOWER_BASE_RADIUS ||
    y < TOWER_BASE_RADIUS || y > MAP_SIZE - TOWER_BASE_RADIUS
  ) return [false, "塔基必须完整位于地图内"];
  if (distanceToRoad([x, y]) < TOWER_BASE_RADIUS + ROAD_WIDTH / 2 - 1e-9) {
    return [false, "塔基不能压占道路"];
  }
  for (const tower of state.towers) {
    if (Math.hypot(x - tower.x, y - tower.y) < 2 * TOWER_BASE_RADIUS - 1e-9) {
      return [false, "塔基不能与已有防御塔重叠"];
    }
  }
  return [true, "位置合法"];
}

function placeTower(kind, x, y) {
  const spec = TOWER_SPECS[kind];
  if (gameComplete()) return [false, "本局已经结束，请重新开始", null];
  if (state.mode === "q1" && state.started) return [false, "问题1开始后不能再建塔", null];
  if (state.funds < spec.cost) return [false, "资金不足", null];
  if (towerCounts()[kind] >= spec.max) return [false, `${spec.name}已达到数量上限`, null];
  const [valid, message] = validatePosition(x, y);
  if (!valid) return [false, message, null];
  const tower = {
    id: state.nextTowerId,
    kind,
    x,
    y,
    totalDamage: 0,
    targetId: null,
  };
  state.nextTowerId += 1;
  state.towers.push(tower);
  state.funds -= spec.cost;
  state.totalSpent += spec.cost;
  return [true, `建造${spec.name}，花费${spec.cost}元`, tower];
}

function findTower(id) {
  return state.towers.find((tower) => tower.id === id) ?? null;
}

function upgradeSelectedTower() {
  const tower = findTower(selectedTowerId);
  if (!tower) {
    setStatus("请先点击一座已有的防御塔。");
    return;
  }
  if (state.mode === "q1" && state.started) {
    setStatus("问题1开始后不能升级。");
    return;
  }
  const nextKind = UPGRADE_TO[tower.kind];
  if (!nextKind) {
    setStatus("大型塔已经是最高等级。");
    return;
  }
  const current = TOWER_SPECS[tower.kind];
  const upgraded = TOWER_SPECS[nextKind];
  const cost = upgraded.cost - current.cost;
  if (state.funds < cost) {
    setStatus("资金不足。");
    return;
  }
  if (towerCounts()[nextKind] >= upgraded.max) {
    setStatus(`${upgraded.name}已达到数量上限。`);
    return;
  }
  tower.kind = nextKind;
  state.funds -= cost;
  state.totalSpent += cost;
  setStatus(`升级为${upgraded.name}，花费${cost}元。`);
}

function stepSimulation(dt) {
  if (!state.started || gameComplete() || dt <= 0) return;
  state.time += dt;

  for (const enemy of state.enemies) {
    if (!enemy.active && !enemy.finished && enemy.spawnTime <= state.time) enemy.active = true;
  }
  for (const enemy of activeEnemies()) {
    enemy.distance += enemy.speed * dt;
    [enemy.x, enemy.y] = pointOnPath(enemy.distance);
  }

  const active = activeEnemies();
  const damage = new Map();
  state.beams = [];
  for (const tower of state.towers) {
    const spec = TOWER_SPECS[tower.kind];
    const candidates = active.filter(
      (enemy) => Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= spec.range + 1e-9,
    );
    if (candidates.length === 0) {
      tower.targetId = null;
      continue;
    }
    candidates.sort((a, b) => {
      const distanceA = Math.hypot(a.x - tower.x, a.y - tower.y);
      const distanceB = Math.hypot(b.x - tower.x, b.y - tower.y);
      return distanceA - distanceB || b.distance - a.distance || a.id - b.id;
    });
    const target = candidates[0];
    tower.targetId = target.id;
    const dealt = spec.dps * dt;
    damage.set(target.id, (damage.get(target.id) ?? 0) + dealt);
    tower.totalDamage += dealt;
    state.beams.push([tower.id, target.id]);
  }

  for (const [enemyId, dealt] of damage.entries()) {
    const enemy = active.find((item) => item.id === enemyId);
    if (enemy) enemy.hp -= dealt;
  }
  for (const enemy of activeEnemies()) {
    if (enemy.hp <= 1e-9) {
      enemy.hp = 0;
      enemy.active = false;
      enemy.finished = true;
      state.kills += 1;
      state.funds += enemy.bounty;
    }
  }
  for (const enemy of activeEnemies()) {
    if (enemy.distance >= PATH_LENGTH - 1e-9) {
      enemy.active = false;
      enemy.finished = true;
      enemy.leaked = true;
      state.leaks += 1;
    }
  }
}

function setStatus(message) {
  statusMessage.textContent = message;
}

function updateModeButtons() {
  modeButtons.forEach((button) => button.classList.toggle("active", button.dataset.mode === state.mode));
  modeDescription.textContent = state.mode === "q1"
    ? "10名敌人，固定1700生命，开局2000元，无赏金；按下开始后锁定布局。"
    : "25名敌人分四波进攻；可以用击杀赏金在战斗中建塔和升级。";
}

function chooseKind(kind) {
  selectedKind = kind;
  selectedTowerId = null;
  towerButtons.forEach((button) => button.classList.toggle("active", button.dataset.kind === kind));
  const spec = TOWER_SPECS[kind];
  setStatus(`已选择${spec.name}：造价${spec.cost}元，射程${spec.range}m，DPS ${spec.dps}。`);
}

function towerAt(x, y) {
  const candidates = state.towers.filter((tower) => Math.hypot(tower.x - x, tower.y - y) <= 40);
  candidates.sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
  return candidates[0] ?? null;
}

function pointerToWorld(event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * MAP_SIZE;
  const y = MAP_SIZE - ((event.clientY - rect.top) / rect.height) * MAP_SIZE;
  return [x, y];
}

function toggleRunning() {
  if (gameComplete()) {
    setStatus("本局已经结束，请重新开始。");
    return;
  }
  if (!state.started) {
    state.started = true;
    running = true;
    setStatus("敌军开始进攻！");
  } else {
    running = !running;
    setStatus(running ? "继续战斗。" : "游戏已暂停。");
  }
  lastFrameTime = performance.now();
}

function cycleSpeed() {
  speed = ({ 1: 2, 2: 4, 4: 1 })[speed];
  setStatus(`游戏速度切换为 ${speed}×。`);
}

function worldToCanvas(x, y) {
  return [x, MAP_SIZE - y];
}

function drawGrid() {
  ctx.fillStyle = "#20362d";
  ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);
  ctx.strokeStyle = "#2d493d";
  ctx.lineWidth = 2;
  for (let value = 0; value <= MAP_SIZE; value += 200) {
    ctx.beginPath();
    ctx.moveTo(value, 0);
    ctx.lineTo(value, MAP_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, value);
    ctx.lineTo(MAP_SIZE, value);
    ctx.stroke();
  }
}

function strokePath(width, color) {
  ctx.beginPath();
  PATH_POINTS.forEach(([x, y], index) => {
    const [sx, sy] = worldToCanvas(x, y);
    if (index === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  });
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawPath() {
  strokePath(ROAD_WIDTH + 2 * TOWER_BASE_RADIUS, "#a84d4b");
  strokePath(ROAD_WIDTH, "#84909c");
  const labels = ["O", "A", "B", "C", "E", "F", "D"];
  ctx.font = "700 34px system-ui";
  ctx.fillStyle = "#f3f6fb";
  PATH_POINTS.forEach(([x, y], index) => {
    const [sx, sy] = worldToCanvas(x, y);
    ctx.beginPath();
    ctx.arc(sx, sy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(labels[index], sx + 16, sy - 16);
  });
}

function drawTowers() {
  const selected = findTower(selectedTowerId);
  if (selected) {
    const spec = TOWER_SPECS[selected.kind];
    const [sx, sy] = worldToCanvas(selected.x, selected.y);
    ctx.beginPath();
    ctx.arc(sx, sy, spec.range, 0, Math.PI * 2);
    ctx.setLineDash([14, 10]);
    ctx.strokeStyle = spec.color;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.setLineDash([]);
  }
  for (const tower of state.towers) {
    const spec = TOWER_SPECS[tower.kind];
    const [sx, sy] = worldToCanvas(tower.x, tower.y);
    ctx.beginPath();
    ctx.arc(sx, sy, TOWER_BASE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = spec.color;
    ctx.fill();
    ctx.strokeStyle = tower.id === selectedTowerId ? "#ffffff" : "#101723";
    ctx.lineWidth = tower.id === selectedTowerId ? 4 : 2;
    ctx.stroke();
    ctx.fillStyle = "#10131a";
    ctx.font = "800 14px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText({ small: "S", medium: "M", large: "L" }[tower.kind], sx, sy + 1);
  }
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

function drawBeams() {
  const active = activeEnemies();
  ctx.strokeStyle = "#ffe066";
  ctx.lineWidth = 5;
  for (const [towerId, enemyId] of state.beams) {
    const tower = findTower(towerId);
    const enemy = active.find((item) => item.id === enemyId);
    if (!tower || !enemy) continue;
    const [tx, ty] = worldToCanvas(tower.x, tower.y);
    const [ex, ey] = worldToCanvas(enemy.x, enemy.y);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }
}

function drawEnemies() {
  const colors = ["#7bd88f", "#f5a64f", "#ef6a5d", "#a97be8"];
  for (const enemy of activeEnemies()) {
    const [sx, sy] = worldToCanvas(enemy.x, enemy.y);
    const radius = 14;
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fillStyle = colors[enemy.wave - 1];
    ctx.fill();
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 4;
    ctx.stroke();
    const ratio = Math.max(0, enemy.hp / enemy.maxHp);
    ctx.fillStyle = "#465568";
    ctx.fillRect(sx - 32, sy - 28, 64, 9);
    ctx.fillStyle = ratio > 0.4 ? "#4fd18b" : "#ef5b56";
    ctx.fillRect(sx - 32, sy - 28, 64 * ratio, 9);
  }
}

function drawPreview() {
  if (!hoverWorld) return;
  const [x, y] = hoverWorld;
  if (towerAt(x, y)) return;
  const spec = TOWER_SPECS[selectedKind];
  let [valid] = validatePosition(x, y);
  if (state.mode === "q1" && state.started) valid = false;
  if (state.funds < spec.cost || gameComplete()) valid = false;
  const [sx, sy] = worldToCanvas(x, y);
  ctx.beginPath();
  ctx.arc(sx, sy, spec.range, 0, Math.PI * 2);
  ctx.setLineDash([12, 9]);
  ctx.strokeStyle = valid ? "#54d590" : "#ff635f";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(sx, sy, TOWER_BASE_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = spec.color;
  ctx.fill();
  ctx.globalAlpha = 1;
}

function draw() {
  drawGrid();
  drawPath();
  drawBeams();
  drawTowers();
  drawEnemies();
  drawPreview();
}

function updateInterface() {
  const counts = towerCounts();
  fundsStat.textContent = `${state.funds} 元`;
  timeStat.textContent = `${state.time.toFixed(1)} s`;
  killsStat.textContent = String(state.kills);
  leaksStat.textContent = String(state.leaks);
  const remaining = state.enemies.filter((enemy) => !enemy.finished).length;
  detailStat.textContent = `累计花费 ${state.totalSpent} 元 · 未结束敌人 ${remaining} · 塔数 小${counts.small}/20 中${counts.medium}/15 大${counts.large}/10`;

  const selected = findTower(selectedTowerId);
  if (selected) {
    const spec = TOWER_SPECS[selected.kind];
    selectedInfo.textContent = `${spec.name} #${selected.id}\n坐标 (${selected.x.toFixed(1)}, ${selected.y.toFixed(1)})\n射程 ${spec.range}m　DPS ${spec.dps}\n当前目标 ${selected.targetId ? `敌人 #${selected.targetId}` : "无"}\n累计伤害 ${selected.totalDamage.toFixed(1)}`;
  } else {
    const spec = TOWER_SPECS[selectedKind];
    selectedInfo.textContent = `待建：${spec.name}\n造价 ${spec.cost}元　射程 ${spec.range}m　DPS ${spec.dps}`;
  }

  startButton.textContent = running ? "暂停 Space" : "开始 / 继续 Space";
  speedButton.textContent = `速度 ${speed}× F`;
  if (!state.started) canvasMessage.textContent = "布塔阶段：选择塔型，点击地图建造，然后开始";
  else if (gameComplete()) canvasMessage.textContent = `战斗结束　击杀 ${state.kills}　漏怪 ${state.leaks}`;
  else if (!running) canvasMessage.textContent = "已暂停";
  else canvasMessage.textContent = `第 ${Math.max(1, ...activeEnemies().map((enemy) => enemy.wave))} 波进行中`;
}

canvas.addEventListener("pointermove", (event) => {
  hoverWorld = pointerToWorld(event);
});

canvas.addEventListener("pointerleave", () => {
  hoverWorld = null;
});

canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  const [x, y] = pointerToWorld(event);
  const tower = towerAt(x, y);
  if (tower) {
    selectedTowerId = tower.id;
    setStatus(`已选择${TOWER_SPECS[tower.kind].name} #${tower.id}，按 U 升级。`);
    return;
  }
  const [ok, message, built] = placeTower(selectedKind, x, y);
  setStatus(message);
  if (ok && built) selectedTowerId = built.id;
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => resetGame(button.dataset.mode));
});

towerButtons.forEach((button) => {
  button.addEventListener("click", () => chooseKind(button.dataset.kind));
});

startButton.addEventListener("click", toggleRunning);
speedButton.addEventListener("click", cycleSpeed);
restartButton.addEventListener("click", () => resetGame(state.mode));
presetButton.addEventListener("click", loadQ1BestLayout);
upgradeButton.addEventListener("click", upgradeSelectedTower);

window.addEventListener("keydown", (event) => {
  if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
  if (event.code === "Space") {
    event.preventDefault();
    toggleRunning();
  } else if (event.key === "1") chooseKind("small");
  else if (event.key === "2") chooseKind("medium");
  else if (event.key === "3") chooseKind("large");
  else if (event.key.toLowerCase() === "u") upgradeSelectedTower();
  else if (event.key.toLowerCase() === "f") cycleSpeed();
  else if (event.key.toLowerCase() === "r") resetGame(state.mode);
  else if (event.key.toLowerCase() === "p") loadQ1BestLayout();
  else if (event.key === "Escape") {
    selectedTowerId = null;
    setStatus("已取消已有塔的选择。");
  }
});

function frame(timestamp) {
  const elapsed = Math.min((timestamp - lastFrameTime) / 1000, 0.1);
  lastFrameTime = timestamp;
  if (running && !gameComplete()) {
    simulationAccumulator += elapsed * speed;
    let iterations = 0;
    while (simulationAccumulator >= 0.02 && iterations < 40) {
      stepSimulation(0.02);
      simulationAccumulator -= 0.02;
      iterations += 1;
    }
    if (gameComplete()) {
      running = false;
      setStatus(`本局结束：击杀 ${state.kills}，漏怪 ${state.leaks}，剩余资金 ${state.funds} 元。`);
    }
  }
  draw();
  updateInterface();
  requestAnimationFrame(frame);
}

resetGame("q2");
requestAnimationFrame(frame);
