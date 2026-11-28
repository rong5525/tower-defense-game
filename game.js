"use strict";

const MAP_SIZE = 2000;
const ROAD_WIDTH = 10;
const TOWER_BASE_RADIUS = 10;
const ENEMY_RADIUS = 5;
const DEFAULT_PATH = [
  [0, 0],
  [400, 200],
  [700, 800],
  [1200, 900],
  [1500, 1400],
  [1800, 1700],
  [2000, 2000],
];

let currentPathPoints = DEFAULT_PATH.map((point) => [...point]);
let currentPaths = [currentPathPoints];

const TOWER_SPECS = {
  small: { key: "small", name: "小型塔", range: 75, dps: 10, cost: 100, max: 20, color: "#62d2ff" },
  medium: { key: "medium", name: "中型塔", range: 125, dps: 20, cost: 250, max: 15, color: "#ffc857" },
  large: { key: "large", name: "大型塔", range: 200, dps: 40, cost: 600, max: 10, color: "#ff6b6b" },
};
const PLAYER_COLORS = ["#62d2ff", "#ffc857", "#b690ff", "#58d6a4"];
const DEFAULT_PLAYER_STAR_PROFILES = {
  1: [3],
  2: [2, 4],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
};
const STAR_LEVEL_NAMES = ["", "入门", "基础", "熟练", "高手", "专家"];

const UPGRADE_TO = { small: "medium", medium: "large" };
const Q1_LAYOUTS = [
  { name: "方案1", summary: "4杀6漏 · 临界93.1血", towers: [
    ["medium", 780.0098431879977, 734.4548926625595], ["medium", 753.2158790506898, 760.658097232954],
    ["medium", 768.8871974968961, 773.4735764952864], ["medium", 776.4869391827639, 754.55653503194],
    ["medium", 760.6940284724509, 741.4992026894078], ["medium", 740.476436237285, 781.4770180485629],
    ["medium", 759.0631388650619, 791.1021045111758], ["medium", 725.1073289889066, 748.5258207993095],
  ]},
  { name: "方案2", summary: "4杀6漏 · 临界93.2血", towers: [
    ["medium", 780.0098431879977, 734.4548926625595], ["medium", 753.2158790506898, 760.658097232954],
    ["medium", 768.8871974968961, 773.4735764952864], ["medium", 776.4869391827639, 754.55653503194],
    ["medium", 760.6940284724509, 741.4992026894078], ["medium", 740.3633736801124, 781.4621887166928],
    ["medium", 759.0631388650619, 791.1021045111758], ["medium", 725.1073289889066, 748.5258207993095],
  ]},
  { name: "方案3", summary: "4杀6漏 · 临界93.2血", towers: [
    ["medium", 780.0098431879977, 734.4548926625595], ["medium", 753.2158790506898, 760.658097232954],
    ["medium", 768.8871974968961, 773.4735764952864], ["medium", 776.4869391827639, 754.55653503194],
    ["medium", 760.6940284724509, 741.4992026894078], ["medium", 740.3633736801124, 781.4621887166928],
    ["medium", 759.0631388650619, 791.1021045111758], ["medium", 724.1907551189279, 748.8283105338132],
  ]},
  { name: "方案4", summary: "4杀6漏 · 临界93.2血", towers: [
    ["medium", 780.0098431879977, 734.4548926625595], ["medium", 753.2158790506898, 760.658097232954],
    ["medium", 768.8871974968961, 773.4735764952864], ["medium", 776.4869391827639, 754.55653503194],
    ["medium", 760.951507955435, 740.8915685213359], ["medium", 740.6726278050561, 781.2963719118874],
    ["medium", 759.0631388650619, 791.1021045111758], ["medium", 723.8319957130539, 748.2532281968706],
  ]},
  { name: "方案5", summary: "4杀6漏 · 临界93.5血", towers: [
    ["medium", 780.0098431879977, 734.4548926625595], ["medium", 752.4316613299457, 761.1668886371367],
    ["medium", 768.8871974968961, 773.4735764952864], ["medium", 776.4869391827639, 754.55653503194],
    ["medium", 760.6826555266706, 741.0309265350506], ["medium", 740.6726278050561, 781.2963719118874],
    ["medium", 759.0631388650619, 791.1021045111758], ["medium", 724.7105940682517, 748.8506722498361],
  ]},
];
const Q2_POLICY_ACTIONS = [
  { action: "build", kind: "small", x: 1446.4373231428135, y: 1262.137606114312, minKills: 0 },
  { action: "build", kind: "medium", x: 1545.0, y: 1400.0, minKills: 0 },
  { action: "build", kind: "medium", x: 1622.726731615535, y: 1543.9399350511314, minKills: 0 },
  { action: "build", kind: "medium", x: 1710.6066017177982, y: 1589.3933982822018, minKills: 0 },
  { action: "build", kind: "medium", x: 1823.8828819485686, y: 1762.865957488833, minKills: 0 },
  { action: "build", kind: "medium", x: 1178.4272251347998, y: 1007.8638743260012, minKills: 0 },
  { action: "upgrade", towerId: 9, minKills: 0 },
  { action: "upgrade", towerId: 10, minKills: 0 },
  { action: "upgrade", towerId: 11, minKills: 0 },
  { action: "upgrade", towerId: 12, minKills: 0 },
  { action: "upgrade", towerId: 13, minKills: 0 },
  { action: "upgrade", towerId: 14, minKills: 0 },
  { action: "build", kind: "medium", x: 1912.5192455849324, y: 1895.8205029433784, minKills: 1 },
  { action: "build", kind: "medium", x: 1987.4037720753383, y: 1845.897485283108, minKills: 1 },
  { action: "upgrade", towerId: 6, minKills: 0 },
  { action: "upgrade", towerId: 5, minKills: 0 },
];
let segmentLengths = [];
let cumulativeLengths = [0];
let PATH_LENGTH = 0;

let pathMetrics = [];

function metricsForPath(points) {
  const lengths = [];
  const cumulative = [0];
  for (let index = 0; index < points.length - 1; index += 1) {
    const [ax, ay] = points[index];
    const [bx, by] = points[index + 1];
    const length = Math.hypot(bx - ax, by - ay);
    lengths.push(length);
    cumulative.push(cumulative.at(-1) + length);
  }
  return { lengths, cumulative, total: cumulative.at(-1) };
}

function setPaths(paths) {
  currentPaths = paths.map((path) => path.map((point) => [...point]));
  currentPathPoints = currentPaths[0];
  pathMetrics = currentPaths.map(metricsForPath);
  segmentLengths = pathMetrics[0].lengths;
  cumulativeLengths = pathMetrics[0].cumulative;
  PATH_LENGTH = pathMetrics[0].total;
}

function setPath(points) {
  setPaths([points]);
}

setPath(DEFAULT_PATH);

const Q3_BRANCHES = {
  damage: { name: "火力", costRate: 0.65, dps: 1.35, range: 1, scout: 1 },
  range: { name: "射程", costRate: 0.60, dps: 1.10, range: 1.25, scout: 1 },
  rapid: { name: "急速", costRate: 0.60, dps: 1.25, range: 1, scout: 1.12 },
};

const Q3_LEVELS = [
  {
    title: "第1关 · 新兵折线",
    description: "短折线教学关：侦察兵与重甲兵交替出现，学习克制、分支升级和定点炮击。",
    funds: 2500,
    jitter: 45,
    path: [[0, 120], [430, 290], [610, 820], [1120, 970], [1450, 1390], [2000, 1840]],
    waves: [[0, 7, 6, "scout", 620, 27, 80], [52, 6, 8, "armored", 1450, 13, 150], [108, 5, 6, "scout", 900, 24, 110]],
    artillery: { cost: 150, damage: 1050, radius: 185, shots: 6, cooldown: 10 },
  },
  {
    title: "第2关 · 回头长廊",
    description: "路线两次回折，同一座塔可能覆盖多段道路；精英兵首次出现。",
    funds: 2900,
    jitter: 55,
    path: [[0, 180], [580, 180], [580, 720], [1240, 720], [1240, 1320], [1760, 1320], [2000, 1840]],
    waves: [[0, 8, 5, "scout", 760, 29, 85], [48, 7, 7, "armored", 1750, 12, 175], [105, 4, 9, "elite", 2400, 11, 260]],
    artillery: { cost: 160, damage: 1200, radius: 190, shots: 6, cooldown: 11 },
  },
  {
    title: "第3关 · 双弯交错",
    description: "S形路线让内外弯价值发生变化；混合波要求调整塔型并形成几何联动区。",
    funds: 3300,
    jitter: 65,
    path: [[0, 140], [500, 380], [270, 850], [820, 1160], [1320, 900], [1690, 1460], [2000, 1900]],
    waves: [[0, 9, 5, "scout", 850, 30, 90], [52, 8, 6, "armored", 2050, 12, 190], [106, 7, 5, "elite", 2750, 12, 285]],
    artillery: { cost: 170, damage: 1350, radius: 195, shots: 7, cooldown: 11 },
  },
  {
    title: "第4关 · 蛇形防线",
    description: "长蛇形路线包含四个关键拐点；赏金更紧张，出售与重新部署变得重要。",
    funds: 3700,
    jitter: 70,
    path: [[0, 130], [820, 130], [820, 600], [260, 600], [260, 1110], [1390, 1110], [1390, 1590], [2000, 1880]],
    waves: [[0, 10, 4.5, "scout", 930, 31, 90], [51, 9, 6, "armored", 2350, 12, 205], [112, 7, 7, "elite", 3200, 12, 310]],
    artillery: { cost: 180, damage: 1500, radius: 200, shots: 8, cooldown: 12 },
  },
  {
    title: "第5关 · 终局要塞",
    description: "侦察、重甲、精英与Boss连续进攻；必须综合使用全部五类自由度。",
    funds: 4300,
    jitter: 75,
    path: [[0, 100], [520, 300], [950, 180], [1120, 720], [630, 1080], [1230, 1350], [1640, 1250], [2000, 1900]],
    waves: [[0, 10, 4.5, "scout", 1000, 31, 95], [50, 9, 6, "armored", 2600, 12, 220], [110, 7, 7, "elite", 3600, 12, 330], [172, 1, 1, "boss", 10500, 8, 1200]],
    artillery: { cost: 200, damage: 1700, radius: 210, shots: 9, cooldown: 12 },
  },
];

function hashSeed(seed, salt = 0) {
  let value = (Number(seed) >>> 0) ^ Math.imul((salt + 1) >>> 0, 0x9e3779b1);
  value ^= value >>> 16;
  value = Math.imul(value, 0x21f0aaad);
  value ^= value >>> 15;
  value = Math.imul(value, 0x735a2d97);
  return (value ^ (value >>> 15)) >>> 0;
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function randomizedPath(levelIndex, seed) {
  const level = Q3_LEVELS[levelIndex];
  const random = seededRandom(hashSeed(seed, levelIndex * 97 + 11));
  return level.path.map(([x, y], index, all) => {
    if (index === 0 || index === all.length - 1) return [x, y];
    const dx = (random() * 2 - 1) * level.jitter;
    const dy = (random() * 2 - 1) * level.jitter;
    return [Math.max(90, Math.min(1910, x + dx)), Math.max(90, Math.min(1910, y + dy))];
  });
}

const COOP_LANE_TEMPLATES = [
  [[-940, 0], [-650, -180], [-330, 150], [0, 0]],
  [[-940, -170], [-630, -170], [-630, 190], [-280, 190], [0, 0]],
  [[-940, 0], [-680, -230], [-430, 170], [-210, -150], [0, 0]],
  [[-940, -200], [-620, -200], [-620, 210], [-360, 210], [-360, -100], [0, 0]],
  [[-940, 0], [-730, -240], [-480, 190], [-260, -170], [-110, 140], [0, 0]],
];

function cooperativePaths(playerCount, levelIndex, seed) {
  const random = seededRandom(hashSeed(seed, 7700 + levelIndex));
  const base = COOP_LANE_TEMPLATES[levelIndex].map(([x, y], index, points) => {
    if (index === 0 || index === points.length - 1) return [x, y];
    const jitter = Math.min(42, Q3_LEVELS[levelIndex].jitter * 0.55);
    return [x + (random() * 2 - 1) * jitter, y + (random() * 2 - 1) * jitter];
  });
  return Array.from({ length: playerCount }, (_, player) => {
    const angle = (Math.PI * 2 * player) / playerCount;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return base.map(([x, y]) => [
      1000 + x * cos - y * sin,
      1000 + x * sin + y * cos,
    ]);
  });
}

function branchOffersFor(towerId, seed, levelIndex) {
  const choices = Object.keys(Q3_BRANCHES);
  const random = seededRandom(hashSeed(seed, towerId * 31 + levelIndex * 997));
  for (let index = choices.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [choices[index], choices[swap]] = [choices[swap], choices[index]];
  }
  return choices.slice(0, 2);
}

const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");
const canvasMessage = document.querySelector("#canvas-message");
const actionToast = document.querySelector("#action-toast");
const statusMessage = document.querySelector("#status-message");
const modeDescription = document.querySelector("#mode-description");
const selectedInfo = document.querySelector("#selected-info");
const fundsLabel = document.querySelector("#funds-label");
const fundsStat = document.querySelector("#funds-stat");
const timeStat = document.querySelector("#time-stat");
const killsStat = document.querySelector("#kills-stat");
const leaksStat = document.querySelector("#leaks-stat");
const detailStat = document.querySelector("#detail-stat");
const startButton = document.querySelector("#start-button");
const speedButton = document.querySelector("#speed-button");
const restartButton = document.querySelector("#restart-button");
const presetButton = document.querySelector("#preset-button");
const q2PresetButton = document.querySelector("#q2-preset-button");
const presetSelect = document.querySelector("#preset-select");
const q1PresetPanel = document.querySelector("#q1-tab");
const q2PresetPanel = document.querySelector("#q2-tab");
const q1Rules = document.querySelector("#q1-rules");
const q2Rules = document.querySelector("#q2-rules");
const q3Rules = document.querySelector("#q3-rules");
const upgradeButton = document.querySelector("#upgrade-button");
const modeButtons = [...document.querySelectorAll(".mode-button")];
const towerButtons = [...document.querySelectorAll(".tower-button")];
const baseHealthWrap = document.querySelector("#base-health-wrap");
const baseHealthText = document.querySelector("#base-health-text");
const baseHealthBar = document.querySelector("#base-health-bar");
const starResult = document.querySelector("#star-result");
const q3Campaign = document.querySelector("#q3-tab");
const levelTitle = document.querySelector("#level-title");
const levelProgress = document.querySelector("#level-progress");
const levelDescription = document.querySelector("#level-description");
const q3LevelSelect = document.querySelector("#q3-level-select");
const q3PlayerCountSelect = document.querySelector("#q3-player-count-select");
const playerStarConfig = document.querySelector("#player-star-config");
const q3DemoButton = document.querySelector("#q3-demo-button");
const demoCombinationPreview = document.querySelector("#demo-combination-preview");
const artilleryPanel = document.querySelector("#artillery-panel");
const artilleryButton = document.querySelector("#artillery-button");
const artilleryInfo = document.querySelector("#artillery-info");
const strategyLog = document.querySelector("#strategy-log");
const q3TowerActions = document.querySelector("#q3-tower-actions");
const branchButtons = [...document.querySelectorAll("[data-branch]")];
const sellButton = document.querySelector("#sell-button");
const moveButton = document.querySelector("#move-button");
const linkButton = document.querySelector("#link-button");
const seedInput = document.querySelector("#seed-input");
const seedButton = document.querySelector("#seed-button");
const randomSummary = document.querySelector("#random-summary");
const balanceCheckButton = document.querySelector("#balance-check-button");
const balanceCheckResult = document.querySelector("#balance-check-result");
const activePlayerWrap = document.querySelector("#active-player-wrap");
const activePlayerButtons = document.querySelector("#active-player-buttons");
const assistControls = document.querySelector("#assist-controls");
const assistTarget = document.querySelector("#assist-target");
const assistButton = document.querySelector("#assist-button");
const playerScoreboard = document.querySelector("#player-scoreboard");

let state;
let running = false;
let speed = 1;
let selectedKind = "small";
let selectedTowerId = null;
let hoverWorld = null;
let simulationAccumulator = 0;
let lastFrameTime = performance.now();
let q2AutoActions = [];
let q3LevelIndex = 0;
let q3Seed = Number(seedInput.value) || 20261127;
let q3AutoActions = [];
let q3AutoTowerMap = new Map();
let q3PlayerStarLevels = [3];
let actionToastTimer = null;
let bombardMode = false;
let movingTowerId = null;
let linkSourceId = null;
let q3PlayerCount = 1;
let geometryCacheDirty = true;
let cachedTriangles = [];
let cachedLinkDegrees = new Map();
let lastScoreboardSignature = "";
let lastDrawTime = 0;
let lastUiUpdateTime = 0;
const pulseTimers = new WeakMap();

function pointOnPath(distance, lane = 0) {
  const points = currentPaths[lane] ?? currentPathPoints;
  const metrics = pathMetrics[lane] ?? pathMetrics[0];
  const clamped = Math.max(0, Math.min(metrics.total, distance));
  for (let index = 0; index < metrics.lengths.length; index += 1) {
    if (clamped <= metrics.cumulative[index + 1]) {
      const [ax, ay] = points[index];
      const [bx, by] = points[index + 1];
      const local = (clamped - metrics.cumulative[index]) / metrics.lengths[index];
      return [ax + (bx - ax) * local, ay + (by - ay) * local];
    }
  }
  return [...points.at(-1)];
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
  for (const path of currentPaths) {
    for (let index = 0; index < path.length - 1; index += 1) {
      best = Math.min(best, distanceToSegment(point, path[index], path[index + 1]));
    }
  }
  return best;
}

function makeEnemy(id, wave, spawnTime, maxHp, enemySpeed, bounty, archetype = "normal", baseDamage = 10, lane = 0) {
  return {
    id,
    wave,
    spawnTime,
    maxHp,
    hp: maxHp,
    speed: enemySpeed,
    bounty,
    archetype,
    baseDamage,
    lane,
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
  if (mode === "q3") {
    const level = Q3_LEVELS[q3LevelIndex];
    const random = seededRandom(hashSeed(q3Seed, q3LevelIndex * 1009 + 53));
    const enemies = [];
    let enemyId = 1;
    const baseDamage = { scout: 8, armored: 15, elite: 25, boss: 100 };
    level.waves.forEach(([start, count, interval, archetype, hp, enemySpeed, baseBounty], waveIndex) => {
      for (let member = 0; member < count; member += 1) {
        const rewardFactor = 0.9 + random() * 0.2;
        const bounty = Math.max(5, Math.round((baseBounty * rewardFactor) / 5) * 5);
        for (let lane = 0; lane < q3PlayerCount; lane += 1) {
          enemies.push(makeEnemy(
            enemyId,
            waveIndex + 1,
            start + member * interval,
            hp,
            enemySpeed,
            bounty,
            archetype,
            baseDamage[archetype],
            lane,
          ));
          enemyId += 1;
        }
      }
    });
    return enemies;
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
  if (mode === "q3" && q3PlayerCount > 1) setPaths(cooperativePaths(q3PlayerCount, q3LevelIndex, q3Seed));
  else if (mode === "q3") setPath(randomizedPath(q3LevelIndex, q3Seed));
  else setPath(DEFAULT_PATH);
  const q3Level = Q3_LEVELS[q3LevelIndex];
  const initialFunds = mode === "q3" ? q3Level.funds : 2000;
  const players = mode === "q3" ? q3PlayerCount : 1;
  state = {
    mode,
    time: 0,
    started: false,
    activePlayer: 0,
    playerCount: players,
    playerFunds: Array(players).fill(initialFunds),
    get funds() { return this.playerFunds[this.activePlayer]; },
    set funds(value) { this.playerFunds[this.activePlayer] = value; },
    totalSpent: 0,
    kills: 0,
    leaks: 0,
    towers: [],
    enemies: buildSchedule(mode),
    beams: [],
    nextTowerId: 1,
    baseHp: 100 * players,
    maxBaseHp: 100 * players,
    links: [],
    playerArtilleryRemaining: Array(players).fill(mode === "q3" ? q3Level.artillery.shots : 0),
    playerArtilleryReadyAt: Array(players).fill(0),
    get artilleryRemaining() { return this.playerArtilleryRemaining[this.activePlayer]; },
    set artilleryRemaining(value) { this.playerArtilleryRemaining[this.activePlayer] = value; },
    get artilleryReadyAt() { return this.playerArtilleryReadyAt[this.activePlayer]; },
    set artilleryReadyAt(value) { this.playerArtilleryReadyAt[this.activePlayer] = value; },
    artilleryEffects: [],
    playerStats: Array.from({ length: players }, (_, player) => ({
      player,
      strategyStars: q3PlayerStarLevels[player] ?? 3,
      damage: 0,
      kills: 0,
      assists: 0,
      leaks: 0,
      donated: 0,
      received: 0,
    })),
    resultStars: null,
    failed: false,
  };
  invalidateGeometryCache();
  lastScoreboardSignature = "";
  lastDrawTime = 0;
  lastUiUpdateTime = 0;
  running = false;
  selectedTowerId = null;
  simulationAccumulator = 0;
  q2AutoActions = [];
  q3AutoActions = [];
  q3AutoTowerMap = new Map();
  if (actionToastTimer !== null) window.clearTimeout(actionToastTimer);
  actionToastTimer = null;
  actionToast.hidden = true;
  actionToast.classList.remove("visible");
  bombardMode = false;
  movingTowerId = null;
  linkSourceId = null;
  strategyLog.innerHTML = "";
  setStatus(mode === "q1"
    ? "问题1：请在开始前完成全部布塔；开始后不能建塔或升级。"
    : mode === "q2"
      ? "问题2：战斗过程中可以随时建塔和升级，击杀会获得赏金。"
      : `问题3 · 第${q3LevelIndex + 1}关：路线、赏金和升级选项由种子生成；选择组合后载入演示。`,
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
  const preset = Q1_LAYOUTS[Number(presetSelect.value)] ?? Q1_LAYOUTS[0];
  for (const [kind, x, y] of preset.towers) {
    const [ok, message] = placeTower(kind, x, y);
    if (!ok) {
      setStatus(`优化方案载入失败：${message}`);
      return;
    }
  }
  selectedTowerId = null;
  setStatus(`已载入${preset.name}：${preset.summary}，8座中型塔，塔心间距≥20米。点击开始观看复验。`);
  draw();
  updateInterface();
}

function loadQ2BestPolicy() {
  resetGame("q2");
  for (const [kind, x, y] of Q1_LAYOUTS[0].towers) {
    const [ok, message] = placeTower(kind, x, y);
    if (!ok) {
      setStatus(`问题2策略载入失败：${message}`);
      return;
    }
  }
  q2AutoActions = Q2_POLICY_ACTIONS.map((action) => ({ ...action }));
  selectedTowerId = null;
  setStatus("已载入问题2零漏怪策略：开局8座中型塔，后续按赏金自动建造和升级。点击开始复验。");
  draw();
  updateInterface();
}

function gameComplete() {
  return state.failed || state.enemies.every((enemy) => enemy.finished);
}

function towerCounts() {
  return Object.fromEntries(
    Object.keys(TOWER_SPECS).map((kind) => [kind, state.towers.filter((tower) =>
      tower.kind === kind && (state.mode !== "q3" || tower.owner === state.activePlayer)).length]),
  );
}

function validatePosition(x, y, ignoreTowerId = null) {
  if (
    x < TOWER_BASE_RADIUS || x > MAP_SIZE - TOWER_BASE_RADIUS ||
    y < TOWER_BASE_RADIUS || y > MAP_SIZE - TOWER_BASE_RADIUS
  ) return [false, "塔基必须完整位于地图内"];
  if (distanceToRoad([x, y]) < TOWER_BASE_RADIUS + ROAD_WIDTH / 2 - 1e-9) {
    return [false, "塔基不能压占道路"];
  }
  for (const tower of state.towers) {
    if (tower.id === ignoreTowerId) continue;
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
    branch: null,
    invested: spec.cost,
    offers: state.mode === "q3" ? branchOffersFor(state.nextTowerId, q3Seed, q3LevelIndex) : [],
    owner: state.mode === "q3" ? state.activePlayer : 0,
  };
  state.nextTowerId += 1;
  state.towers.push(tower);
  invalidateGeometryCache();
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
  if (state.mode === "q3") {
    setStatus("问题3使用火力、射程或急速分支升级，请点击下方分支按钮。");
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
  tower.invested += cost;
  state.funds -= cost;
  state.totalSpent += cost;
  setStatus(`升级为${upgraded.name}，花费${cost}元。`);
}

function policyActionCost(action) {
  if (action.action === "build") return TOWER_SPECS[action.kind].cost;
  const tower = findTower(action.towerId);
  if (!tower || !UPGRADE_TO[tower.kind]) return null;
  return TOWER_SPECS[UPGRADE_TO[tower.kind]].cost - TOWER_SPECS[tower.kind].cost;
}

function executePolicyAction(action) {
  if (action.action === "build") return placeTower(action.kind, action.x, action.y).slice(0, 2);
  const tower = findTower(action.towerId);
  if (!tower) return [false, "策略升级目标不存在"];
  const nextKind = UPGRADE_TO[tower.kind];
  if (!nextKind) return [false, "策略升级目标已是大型塔"];
  const upgraded = TOWER_SPECS[nextKind];
  const cost = upgraded.cost - TOWER_SPECS[tower.kind].cost;
  if (state.funds < cost) return [false, "资金不足"];
  if (towerCounts()[nextKind] >= upgraded.max) return [false, `${upgraded.name}已达到数量上限`];
  tower.kind = nextKind;
  tower.invested += cost;
  state.funds -= cost;
  state.totalSpent += cost;
  return [true, `升级为${upgraded.name}，花费${cost}元`];
}

function runQ2PolicyActions() {
  while (q2AutoActions.length > 0) {
    const action = q2AutoActions[0];
    if (state.kills < action.minKills) return;
    const cost = policyActionCost(action);
    if (cost === null) throw new Error("内置问题2策略动作已失效");
    if (state.funds < cost) return;
    const [ok, message] = executePolicyAction(action);
    if (!ok) throw new Error(`内置问题2策略动作无效：${message}`);
    if (action.action === "build") {
      selectedKind = action.kind;
      towerButtons.forEach((button) => button.classList.toggle("active", button.dataset.kind === action.kind));
      pulseControl(document.querySelector(`.tower-button[data-kind="${action.kind}"]`));
    } else {
      selectedTowerId = action.towerId;
      pulseControl(upgradeButton);
    }
    showActionToast(compactActionMessage(message));
    q2AutoActions.shift();
  }
}

function logStrategy(message, playerAware = true) {
  const item = document.createElement("li");
  const playerPrefix = playerAware && state.playerCount > 1 ? `P${state.activePlayer + 1} · ` : "";
  item.textContent = `${state.time.toFixed(1)}s　${playerPrefix}${message}`;
  strategyLog.prepend(item);
  while (strategyLog.children.length > 8) strategyLog.lastElementChild.remove();
}

function compactActionMessage(message, player = null) {
  let compact = message
    .replace(/^建造/, "修建")
    .replace(/^向\([^)]*\)发射炮弹，命中(\d+)名敌人.*$/, "定点炮击 · 命中$1名敌人")
    .replace(/，花费\d+元(?:并解除原连接)?$/, "")
    .replace(/防御塔/g, "塔");
  const playerPrefix = player !== null && state.playerCount > 1 ? `P${player + 1} · ` : "";
  return `${playerPrefix}${compact}`;
}

function showActionToast(message) {
  if (!message) return;
  if (actionToastTimer !== null) window.clearTimeout(actionToastTimer);
  actionToast.textContent = `${state.time.toFixed(1)}s · ${message}`;
  actionToast.hidden = false;
  requestAnimationFrame(() => actionToast.classList.add("visible"));
  actionToastTimer = window.setTimeout(() => {
    actionToast.classList.remove("visible");
    actionToastTimer = window.setTimeout(() => {
      actionToast.hidden = true;
      actionToastTimer = null;
    }, 160);
  }, 1600);
}

function branchCost(tower) {
  if (!tower) return null;
  const branch = Q3_BRANCHES[tower.branch ?? tower.offers[0]];
  return Math.round((TOWER_SPECS[tower.kind].cost * branch.costRate) / 5) * 5;
}

function applyBranch(towerId, requestedBranch, automatic = false) {
  const tower = findTower(towerId);
  if (!tower) return [false, "目标塔尚未建成", "wait"];
  if (tower.branch) return [false, "该塔已经完成分支升级", "done"];
  let branchKey = requestedBranch;
  if (!tower.offers.includes(branchKey)) {
    if (!automatic) return [false, "本局随机升级卡没有提供该分支", "done"];
    branchKey = tower.offers[0];
  }
  const branch = Q3_BRANCHES[branchKey];
  const cost = Math.round((TOWER_SPECS[tower.kind].cost * branch.costRate) / 5) * 5;
  if (state.funds < cost) return [false, "资金不足", "wait"];
  state.funds -= cost;
  state.totalSpent += cost;
  tower.invested += cost;
  tower.branch = branchKey;
  const message = `${TOWER_SPECS[tower.kind].name} #${tower.id}选择${branch.name}分支，花费${cost}元`;
  if (automatic) logStrategy(message);
  return [true, message, "done"];
}

function sellTower(towerId, automatic = false) {
  const tower = findTower(towerId);
  if (!tower) return [false, "目标塔不存在", "done"];
  const refund = Math.floor((tower.invested * 0.7) / 5) * 5;
  state.funds += refund;
  state.towers = state.towers.filter((item) => item.id !== towerId);
  state.links = state.links.filter((link) => link.a !== towerId && link.b !== towerId);
  invalidateGeometryCache();
  if (selectedTowerId === towerId) selectedTowerId = null;
  const message = `出售防御塔 #${towerId}，返还${refund}元`;
  if (automatic) logStrategy(message);
  return [true, message, "done"];
}

function moveTowerTo(towerId, x, y, automatic = false) {
  const tower = findTower(towerId);
  if (!tower) return [false, "目标塔不存在", "wait"];
  const cost = Math.round((TOWER_SPECS[tower.kind].cost * 0.15) / 5) * 5;
  if (state.funds < cost) return [false, "资金不足", "wait"];
  const [valid, message] = validatePosition(x, y, towerId);
  if (!valid) return [false, message, "done"];
  state.funds -= cost;
  state.totalSpent += cost;
  state.links = state.links.filter((link) => link.a !== towerId && link.b !== towerId);
  tower.x = x;
  tower.y = y;
  invalidateGeometryCache();
  const result = `重新部署防御塔 #${towerId}，花费${cost}元并解除原连接`;
  if (automatic) logStrategy(result);
  return [true, result, "done"];
}

function invalidateGeometryCache() {
  geometryCacheDirty = true;
}

function rebuildGeometryCache() {
  if (!geometryCacheDirty) return;
  const towerById = new Map(state.towers.map((tower) => [tower.id, tower]));
  const adjacency = new Map(state.towers.map((tower) => [tower.id, new Set()]));
  cachedLinkDegrees = new Map(state.towers.map((tower) => [tower.id, 0]));
  for (const link of state.links) {
    if (!towerById.has(link.a) || !towerById.has(link.b)) continue;
    adjacency.get(link.a).add(link.b);
    adjacency.get(link.b).add(link.a);
    cachedLinkDegrees.set(link.a, (cachedLinkDegrees.get(link.a) ?? 0) + 1);
    cachedLinkDegrees.set(link.b, (cachedLinkDegrees.get(link.b) ?? 0) + 1);
  }
  cachedTriangles = [];
  const ids = [...towerById.keys()].sort((a, b) => a - b);
  for (const aId of ids) {
    const neighborsA = adjacency.get(aId);
    for (const bId of neighborsA) {
      if (bId <= aId) continue;
      for (const cId of neighborsA) {
        if (cId <= bId || !adjacency.get(bId)?.has(cId)) continue;
        const a = towerById.get(aId);
        const b = towerById.get(bId);
        const c = towerById.get(cId);
        const ab2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
        const bc2 = (b.x - c.x) ** 2 + (b.y - c.y) ** 2;
        const ca2 = (c.x - a.x) ** 2 + (c.y - a.y) ** 2;
        const quality = Math.min(1, (4 * Math.sqrt(3) * triangleArea(a, b, c)) / (ab2 + bc2 + ca2));
        cachedTriangles.push({ ids: [aId, bId, cId], a, b, c, quality });
      }
    }
  }
  geometryCacheDirty = false;
}

function linkDegree(towerId) {
  rebuildGeometryCache();
  return cachedLinkDegrees.get(towerId) ?? 0;
}

function createLink(firstId, secondId, automatic = false) {
  if (firstId === secondId) return [false, "不能连接同一座塔", "done"];
  const first = findTower(firstId);
  const second = findTower(secondId);
  if (!first || !second) return [false, "连接目标尚未建成", "wait"];
  if (first.owner !== second.owner) return [false, "几何连接只能建立在同一玩家的防御塔之间", "done"];
  if (state.links.some((link) => [link.a, link.b].includes(firstId) && [link.a, link.b].includes(secondId))) {
    return [false, "两座塔已经连接", "done"];
  }
  const distance = Math.hypot(first.x - second.x, first.y - second.y);
  if (distance < 70 || distance > 430) return [false, "连接距离必须在70—430米之间", "done"];
  if (linkDegree(firstId) >= 2 || linkDegree(secondId) >= 2) return [false, "每座塔最多建立两条连接", "done"];
  const cost = Math.round((30 + distance * 0.08) / 5) * 5;
  if (state.funds < cost) return [false, "资金不足", "wait"];
  state.funds -= cost;
  state.totalSpent += cost;
  state.links.push({ a: firstId, b: secondId, cost });
  invalidateGeometryCache();
  const message = `连接防御塔 #${firstId} 与 #${secondId}，花费${cost}元`;
  if (automatic) logStrategy(message);
  return [true, message, "done"];
}

function triangleArea(a, b, c) {
  return Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)) / 2;
}

function pointInTriangle(point, a, b, c) {
  const sign = (p1, p2, p3) => (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  const d1 = sign(point, a, b);
  const d2 = sign(point, b, c);
  const d3 = sign(point, c, a);
  const hasNegative = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPositive = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNegative && hasPositive);
}

function activeTriangles() {
  rebuildGeometryCache();
  return cachedTriangles;
}

function geometryMultiplier(tower, enemy) {
  const pairBonus = Math.min(0.08, linkDegree(tower.id) * 0.04);
  let triangleBonus = 0;
  for (const triangle of activeTriangles()) {
    if (!triangle.ids.includes(tower.id)) continue;
    if (pointInTriangle(enemy, triangle.a, triangle.b, triangle.c)) {
      triangleBonus = Math.max(triangleBonus, 0.18 * triangle.quality);
    }
  }
  return 1 + pairBonus + triangleBonus;
}

function resolveEnemyDeaths() {
  for (const enemy of activeEnemies()) {
    if (enemy.hp > 1e-9) continue;
    enemy.hp = 0;
    enemy.active = false;
    enemy.finished = true;
    state.kills += 1;
    const owner = state.mode === "q3" ? (enemy.lastHitOwner ?? enemy.lane ?? 0) : state.activePlayer;
    state.playerFunds[owner] += enemy.bounty;
    if (state.mode === "q3") {
      state.playerStats[owner].kills += 1;
      if (owner !== enemy.lane) state.playerStats[owner].assists += 1;
    }
  }
}

function fireArtillery(x, y, automatic = false) {
  if (state.mode !== "q3") return [false, "定点炮击只在问题3开放", "done"];
  const spec = Q3_LEVELS[q3LevelIndex].artillery;
  if (state.artilleryRemaining <= 0) return [false, "本关炮弹已经用完", "done"];
  if (state.time + 1e-9 < state.artilleryReadyAt) return [false, "炮击仍在冷却", "wait"];
  if (state.funds < spec.cost) return [false, "资金不足", "wait"];
  const targets = activeEnemies().filter((enemy) => Math.hypot(enemy.x - x, enemy.y - y) <= spec.radius);
  if (automatic && targets.length === 0) return [false, "目标区域暂时没有敌人", "wait"];
  state.funds -= spec.cost;
  state.totalSpent += spec.cost;
  state.artilleryRemaining -= 1;
  state.artilleryReadyAt = state.time + spec.cooldown;
  for (const enemy of targets) {
    const dealt = spec.damage * (enemy.archetype === "boss" ? 0.5 : 1);
    enemy.hp -= dealt;
    enemy.lastHitOwner = state.activePlayer;
    state.playerStats[state.activePlayer].damage += dealt;
  }
  state.artilleryEffects.push({ x, y, until: state.time + 0.8 });
  resolveEnemyDeaths();
  const message = `向(${x.toFixed(0)}, ${y.toFixed(0)})发射炮弹，命中${targets.length}名敌人，花费${spec.cost}元`;
  if (automatic) logStrategy(message);
  return [true, message, "done"];
}

function densestEnemyPoint(radius, lane = null) {
  const active = activeEnemies().filter((enemy) => lane === null || enemy.lane === lane);
  if (!active.length) return null;
  let best = active[0];
  let bestScore = -1;
  for (const candidate of active) {
    const score = active.reduce((total, enemy) =>
      total + (Math.hypot(enemy.x - candidate.x, enemy.y - candidate.y) <= radius ? enemy.hp / enemy.maxHp + 0.4 : 0), 0);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return [best.x, best.y];
}

function pointNearPath(fraction, side, offset) {
  const lane = state?.mode === "q3" ? state.activePlayer : 0;
  const points = currentPaths[lane] ?? currentPathPoints;
  const metrics = pathMetrics[lane] ?? pathMetrics[0];
  const distance = Math.max(0.01, Math.min(0.99, fraction)) * metrics.total;
  let segment = metrics.lengths.length - 1;
  for (let index = 0; index < metrics.lengths.length; index += 1) {
    if (distance <= metrics.cumulative[index + 1]) {
      segment = index;
      break;
    }
  }
  const [ax, ay] = points[segment];
  const [bx, by] = points[segment + 1];
  const local = (distance - metrics.cumulative[segment]) / metrics.lengths[segment];
  const px = ax + (bx - ax) * local;
  const py = ay + (by - ay) * local;
  const nx = -(by - ay) / metrics.lengths[segment];
  const ny = (bx - ax) / metrics.lengths[segment];
  return [px + nx * offset * side, py + ny * offset * side];
}

function findPresetPosition(action, ignoreTowerId = null) {
  const fractionOffsets = [0, 0.012, -0.012, 0.025, -0.025, 0.04, -0.04];
  const distances = [action.offset ?? 90, 120, 155, 190, 230];
  for (const fractionOffset of fractionOffsets) {
    for (const offset of distances) {
      for (const side of [action.side ?? 1, -(action.side ?? 1)]) {
        const [x, y] = pointNearPath(action.fraction + fractionOffset, side, offset);
        if (validatePosition(x, y, ignoreTowerId)[0]) return [x, y];
      }
    }
  }
  return null;
}

function makeQ3DemoActions(stars) {
  const actions = [];
  const build = (at, kind, fraction, side, offset = null) => actions.push({
    action: "build",
    at,
    kind,
    fraction,
    side,
    offset: offset ?? (kind === "small" ? 50 : kind === "medium" ? 70 : 105),
  });
  const branch = (at, towerId, choice) => actions.push({ action: "branch", at, towerId, choice });
  const link = (at, a, b) => actions.push({ action: "link", at, a, b });
  const bomb = (at) => actions.push({ action: "bombard", at });

  if (stars === 1) {
    build(42, "medium", 0.57, 1);
    build(42, "medium", 0.72, -1);
    build(42, "small", 0.86, 1);
    build(78, "large", 0.66, 1, 105);
    branch(82, 1, "damage");
    branch(83, 2, "range");
    actions.push({ action: "sell", at: 132, towerId: 3 });
    build(133, "medium", 0.91, -1);
    if (q3LevelIndex >= 3) {
      build(118, "large", 0.82, 1, 110);
      branch(121, 5, "damage");
    }
    if (q3LevelIndex >= 4) build(154, "medium", 0.95, -1, 65);
    [92, 118, 146, 176, 208, 240].forEach(bomb);
    if (q3LevelIndex >= 4) {
      build(188, "large", 0.88, 1, 105);
      build(236, "large", 0.96, -1, 95);
      [330, 430, 530].forEach(bomb);
    }
  } else if (stars === 2) {
    const openingDelay = q3LevelIndex === 0 ? 70 : 0;
    build(openingDelay, "small", 0.18, 1, 50);
    build(openingDelay, "medium", 0.31, 1, 65);
    build(openingDelay, "medium", 0.35, -1, 65);
    build(openingDelay, "medium", 0.39, 1, 70);
    build(q3LevelIndex === 0 ? 95 : 20, "large", 0.67, -1, 105);
    build(q3LevelIndex === 0 ? 112 : 52, "medium", 0.84, 1);
    branch(openingDelay + 5, 2, "range");
    branch(openingDelay + 6, 3, "damage");
    branch(openingDelay + 7, 4, "rapid");
    link(openingDelay + 9, 2, 3);
    link(openingDelay + 10, 3, 4);
    link(openingDelay + 11, 2, 4);
    actions.push({ action: "move", at: 105, towerId: 1, fraction: 0.78, side: -1, offset: 130 });
    if (q3LevelIndex === 2) {
      build(42, "medium", 0.52, 1, 70);
      build(88, "small", 0.58, -1, 50);
    }
    if (q3LevelIndex === 3) {
      build(56, "large", 0.42, -1, 105);
      build(94, "small", 0.78, 1, 50);
      build(126, "small", 0.91, -1, 50);
      branch(140, 8, "damage");
    }
    if (q3LevelIndex === 4) {
      build(48, "large", 0.58, 1, 105);
      build(96, "large", 0.90, -1, 100);
      build(144, "medium", 0.96, 1, 65);
      [300, 390, 480, 560].forEach(bomb);
    }
    [72, 104, 138, 174, 212, 248].forEach(bomb);
  } else if (stars === 3) {
    build(0, "small", 0.12, 1, 50);
    build(0, "small", 0.28, 1, 55);
    build(0, "medium", 0.32, -1, 65);
    build(0, "large", 0.36, 1, 105);
    build(12, "medium", 0.57, 1, 65);
    build(18, "medium", 0.61, -1, 65);
    build(28, "large", 0.65, 1, 105);
    build(52, "medium", 0.84, -1, 70);
    branch(4, 1, "rapid");
    branch(5, 2, "range");
    branch(6, 3, "damage");
    branch(30, 4, "damage");
    branch(32, 5, "range");
    branch(34, 6, "rapid");
    link(8, 2, 3);
    link(9, 3, 4);
    link(10, 2, 4);
    link(38, 5, 6);
    link(39, 6, 7);
    link(40, 5, 7);
    actions.push({ action: "move", at: 118, towerId: 1, fraction: 0.91, side: 1, offset: 115 });
    if (q3LevelIndex >= 3) {
      build(44, "large", 0.80, -1, 105);
      build(66, "medium", 0.92, 1, 70);
    }
    if (q3LevelIndex >= 4) {
      build(84, "large", 0.90, -1, 100);
      build(112, "large", 0.96, 1, 95);
      [300, 390, 480, 560].forEach(bomb);
    }
    [58, 82, 108, 136, 166, 198, 232].forEach(bomb);
  } else if (stars === 4) {
    build(0, "small", 0.16, 1, 50);
    build(0, "medium", 0.31, 1, 65);
    build(0, "medium", 0.35, -1, 65);
    build(0, "large", 0.40, 1, 105);
    build(18, "medium", 0.58, -1, 68);
    build(32, "large", 0.67, 1, 105);
    build(58, "medium", 0.84, -1, 68);
    branch(3, 2, "range");
    branch(4, 3, "rapid");
    branch(5, 4, "damage");
    branch(22, 5, "rapid");
    branch(36, 6, "damage");
    link(7, 2, 3);
    link(8, 3, 4);
    link(9, 2, 4);
    link(62, 5, 6);
    link(63, 6, 7);
    link(64, 5, 7);
    actions.push({ action: "move", at: 96, towerId: 1, fraction: 0.91, side: 1, offset: 120 });
    [74, 112, 158, 214].forEach(bomb);
    if (q3LevelIndex >= 3) {
      build(70, "large", 0.90, -1, 102);
      branch(76, 8, "damage");
    }
    if (q3LevelIndex >= 4) {
      build(104, "medium", 0.96, 1, 68);
      [300, 420, 540].forEach(bomb);
    }
  } else {
    build(0, "medium", 0.27, 1, 65);
    build(0, "medium", 0.33, -1, 65);
    build(0, "large", 0.38, 1, 105);
    build(0, "medium", 0.55, -1, 68);
    build(0, "large", 0.63, 1, 105);
    build(28, "medium", 0.82, -1, 68);
    branch(2, 1, "range");
    branch(3, 2, "rapid");
    branch(4, 3, "damage");
    branch(5, 4, "rapid");
    branch(6, 5, "damage");
    link(8, 1, 2);
    link(9, 2, 3);
    link(10, 1, 3);
    link(36, 4, 5);
    link(37, 5, 6);
    link(38, 4, 6);
    actions.push({ action: "move", at: 118, towerId: 1, fraction: 0.92, side: 1, offset: 125 });
    [88, 142].forEach(bomb);
    if (q3LevelIndex >= 3) build(54, "large", 0.90, -1, 102);
    if (q3LevelIndex >= 4) {
      build(86, "medium", 0.96, 1, 68);
      [310, 430, 550].forEach(bomb);
    }
  }
  return actions.sort((a, b) => a.at - b.at);
}

function prepareQ3DemoActions(playerStars, players = state?.playerCount ?? q3PlayerCount) {
  const starLevels = Array.isArray(playerStars)
    ? Array.from({ length: players }, (_, player) => Math.max(1, Math.min(5, Number(playerStars[player]) || 3)))
    : Array(players).fill(Math.max(1, Math.min(5, Number(playerStars) || 3)));
  const expanded = [];
  for (let player = 0; player < players; player += 1) {
    let localTowerId = 0;
    const template = makeQ3DemoActions(starLevels[player]).map((action) => action.action === "build"
      ? { ...action, localTowerId: ++localTowerId }
      : { ...action });
    template.forEach((action) => expanded.push({
      ...action,
      player,
      strategyStars: starLevels[player],
      at: action.at + player * 0.002,
    }));
  }
  return expanded
    .sort((a, b) => a.at - b.at)
    .map((action, order) => ({ ...action, order }));
}

function readPlayerStarsFromControls() {
  return [...playerStarConfig.querySelectorAll("select")].map((select) =>
    Math.max(1, Math.min(5, Number(select.value) || 3)));
}

function renderPlayerStarSelectors(useRecommendedMix = false) {
  const players = Math.max(1, Math.min(4, Number(q3PlayerCountSelect.value) || 1));
  const previous = readPlayerStarsFromControls();
  const recommended = DEFAULT_PLAYER_STAR_PROFILES[players];
  playerStarConfig.innerHTML = "";
  for (let player = 0; player < players; player += 1) {
    const label = document.createElement("label");
    label.className = "player-star-field";
    label.style.setProperty("--player-color", PLAYER_COLORS[player]);
    const name = document.createElement("span");
    name.textContent = `玩家${player + 1}`;
    const select = document.createElement("select");
    select.dataset.player = String(player);
    select.setAttribute("aria-label", `玩家${player + 1}策略星级`);
    for (let stars = 1; stars <= 5; stars += 1) {
      const option = document.createElement("option");
      option.value = String(stars);
      option.textContent = `${"★".repeat(stars)} ${STAR_LEVEL_NAMES[stars]}`;
      select.append(option);
    }
    select.value = String(useRecommendedMix ? recommended[player] : previous[player] ?? recommended[player]);
    select.addEventListener("change", updateQ3CombinationPreview);
    label.append(name, select);
    playerStarConfig.append(label);
  }
}

function autoTowerKey(player, localTowerId) {
  return `${player}:${localTowerId}`;
}

function resolveAutoTowerId(action, field = "towerId") {
  const localTowerId = action[field];
  return q3AutoTowerMap.get(autoTowerKey(action.player ?? 0, localTowerId)) ?? null;
}

function loadQ3Demo() {
  q3LevelIndex = Math.max(0, Math.min(Q3_LEVELS.length - 1, Number(q3LevelSelect.value) || 0));
  q3PlayerCount = Math.max(1, Math.min(4, Number(q3PlayerCountSelect.value) || 1));
  const playerStars = readPlayerStarsFromControls().slice(0, q3PlayerCount);
  q3PlayerStarLevels = playerStars;
  resetGame("q3");
  q3AutoActions = prepareQ3DemoActions(playerStars);
  state.started = true;
  running = true;
  speed = 8;
  lastFrameTime = performance.now();
  runQ3PolicyActions();
  const profile = playerStars.map((stars, player) => `P${player + 1}${"★".repeat(stars)}`).join(" · ");
  setStatus(`正在自动演示第${q3LevelIndex + 1}关；${profile}，各玩家按不同水平执行。`);
  logStrategy(`载入多人水平对照：${profile}，共${q3AutoActions.length}个计划动作`, false);
  updateInterface();
}

function updateQ3CombinationPreview() {
  const level = Math.max(0, Math.min(Q3_LEVELS.length - 1, Number(q3LevelSelect.value) || 0));
  const profile = readPlayerStarsFromControls().map((stars, player) =>
    `玩家${player + 1} ${"★".repeat(stars)}`).join(" · ");
  demoCombinationPreview.textContent = `将载入：第${level + 1}关 · ${profile}`;
}

function executeQ3AutoActionForActivePlayer(action) {
  if (action.action === "build") {
    const position = findPresetPosition(action);
    if (!position) return [false, "没有合法建塔位置", "done"];
    const result = placeTower(action.kind, position[0], position[1]);
    if (!result[0]) return [false, result[1], result[1] === "资金不足" ? "wait" : "done"];
    q3AutoTowerMap.set(autoTowerKey(action.player ?? 0, action.localTowerId), result[2].id);
    selectedKind = action.kind;
    selectedTowerId = result[2]?.id ?? null;
    towerButtons.forEach((button) => button.classList.toggle("active", button.dataset.kind === action.kind));
    pulseControl(document.querySelector(`.tower-button[data-kind="${action.kind}"]`));
    logStrategy(result[1]);
    return [true, result[1], "done"];
  }
  if (action.action === "branch") {
    const towerId = resolveAutoTowerId(action);
    if (towerId === null) return [false, "目标塔尚未建成", "wait"];
    const result = applyBranch(towerId, action.choice, true);
    if (result[0]) {
      selectedTowerId = towerId;
      const actualBranch = findTower(towerId)?.branch ?? action.choice;
      pulseControl(document.querySelector(`[data-branch="${actualBranch}"]`));
    }
    return result;
  }
  if (action.action === "link") {
    const firstId = resolveAutoTowerId(action, "a");
    const secondId = resolveAutoTowerId(action, "b");
    if (firstId === null || secondId === null) return [false, "连接目标尚未建成", "wait"];
    const result = createLink(firstId, secondId, true);
    if (result[0]) {
      selectedTowerId = firstId;
      pulseControl(linkButton);
    }
    return result;
  }
  if (action.action === "sell") {
    const towerId = resolveAutoTowerId(action);
    if (towerId === null) return [false, "出售目标尚未建成", "wait"];
    selectedTowerId = towerId;
    const result = sellTower(towerId, true);
    if (result[0]) pulseControl(sellButton);
    return result;
  }
  if (action.action === "move") {
    const towerId = resolveAutoTowerId(action);
    if (towerId === null) return [false, "搬迁目标尚未建成", "wait"];
    const position = findPresetPosition(action, towerId);
    if (!position) return [false, "没有合法搬迁位置", "done"];
    const result = moveTowerTo(towerId, position[0], position[1], true);
    if (result[0]) {
      selectedTowerId = towerId;
      pulseControl(moveButton);
    }
    return result;
  }
  if (action.action === "bombard") {
    const lane = state.playerCount > 1 ? state.activePlayer : null;
    const point = densestEnemyPoint(Q3_LEVELS[q3LevelIndex].artillery.radius, lane);
    if (!point) return [false, "暂无炮击目标", "wait"];
    const result = fireArtillery(point[0], point[1], true);
    if (result[0]) pulseControl(artilleryButton);
    return result;
  }
  return [false, "未知动作", "done"];
}

function executeQ3AutoAction(action) {
  const previousPlayer = state.activePlayer;
  state.activePlayer = action.player ?? previousPlayer;
  try {
    const result = executeQ3AutoActionForActivePlayer(action);
    if (result[0]) showActionToast(compactActionMessage(result[1], action.player ?? null));
    return result;
  } finally {
    state.activePlayer = previousPlayer;
    const selected = findTower(selectedTowerId);
    if (selected && selected.owner !== previousPlayer) selectedTowerId = null;
  }
}

function runQ3PolicyActions() {
  if (state.mode !== "q3" || q3AutoActions.length === 0) return;
  const remaining = [];
  for (const action of q3AutoActions) {
    if (action.at > state.time + 1e-9) {
      remaining.push(action);
      continue;
    }
    const [ok, message, disposition] = executeQ3AutoAction(action);
    if (!ok && disposition !== "done") remaining.push(action);
    else if (!ok) logStrategy(`跳过动作：${message}`);
  }
  q3AutoActions = remaining;
}

function totalRemainingFunds() {
  return state.playerFunds.reduce((total, funds) => total + funds, 0);
}

function startingFundsTotal() {
  return state.mode === "q3"
    ? Q3_LEVELS[q3LevelIndex].funds * state.playerCount
    : 2000;
}

function budgetRetentionRatio() {
  return totalRemainingFunds() / Math.max(1, startingFundsTotal());
}

function calculateStars() {
  if (state.failed || state.baseHp <= 0) return 0;
  if (state.baseHp < 0.65 * state.maxBaseHp) return 1;
  if (state.baseHp < state.maxBaseHp) return 2;
  const retention = budgetRetentionRatio();
  if (retention >= 0.2) return 5;
  if (retention >= 0.1) return 4;
  return 3;
}

function stepSimulation(dt) {
  if (!state.started || gameComplete() || dt <= 0) return;
  state.time += dt;
  state.artilleryEffects = state.artilleryEffects.filter((effect) => effect.until > state.time);

  for (const enemy of state.enemies) {
    if (!enemy.active && !enemy.finished && enemy.spawnTime <= state.time) enemy.active = true;
  }
  for (const enemy of activeEnemies()) {
    enemy.distance += enemy.speed * dt;
    [enemy.x, enemy.y] = pointOnPath(enemy.distance, enemy.lane);
  }

  const active = activeEnemies();
  const damage = new Map();
  state.beams = [];
  for (const tower of state.towers) {
    const spec = TOWER_SPECS[tower.kind];
    const branch = tower.branch ? Q3_BRANCHES[tower.branch] : null;
    const effectiveRange = spec.range * (branch?.range ?? 1);
    const candidates = active.filter(
      (enemy) => (state.mode !== "q3" || enemy.lane === tower.owner) &&
        Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= effectiveRange + 1e-9,
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
    const counterMatrix = {
      normal: { small: 1, medium: 1, large: 1 },
      scout: { small: 1.35, medium: 1, large: 0.75 },
      armored: { small: 0.65, medium: 1, large: 1.35 },
      elite: { small: 0.75, medium: 1, large: 1.25 },
      boss: { small: 0.80, medium: 1, large: 1.25 },
    };
    const multiplier = state.mode === "q3" ? counterMatrix[target.archetype][tower.kind] : 1;
    const branchMultiplier = branch ? branch.dps * (target.archetype === "scout" ? branch.scout : 1) : 1;
    const linkMultiplier = state.mode === "q3" ? geometryMultiplier(tower, target) : 1;
    const dealt = spec.dps * multiplier * branchMultiplier * linkMultiplier * dt;
    damage.set(target.id, (damage.get(target.id) ?? 0) + dealt);
    tower.totalDamage += dealt;
    target.lastHitOwner = tower.owner;
    if (state.mode === "q3") state.playerStats[tower.owner].damage += dealt;
    state.beams.push([tower.id, target.id]);
  }

  for (const [enemyId, dealt] of damage.entries()) {
    const enemy = active.find((item) => item.id === enemyId);
    if (enemy) enemy.hp -= dealt;
  }
  resolveEnemyDeaths();
  for (const enemy of activeEnemies()) {
    const laneLength = pathMetrics[enemy.lane ?? 0]?.total ?? PATH_LENGTH;
    if (enemy.distance >= laneLength - 1e-9) {
      enemy.active = false;
      enemy.finished = true;
      enemy.leaked = true;
      state.leaks += 1;
      if (state.mode === "q3") {
        state.playerStats[enemy.lane].leaks += 1;
        state.baseHp = Math.max(0, state.baseHp - enemy.baseDamage);
        if (enemy.archetype === "boss" || state.baseHp <= 0) state.failed = true;
      }
    }
  }
  if (state.mode === "q3" && gameComplete() && state.resultStars === null) {
    state.resultStars = calculateStars();
  }
}

function setStatus(message) {
  statusMessage.textContent = message;
}

function pulseControl(element) {
  if (!element) return;
  const previousTimer = pulseTimers.get(element);
  if (previousTimer) window.clearTimeout(previousTimer);
  element.classList.add("auto-pulse");
  const timer = window.setTimeout(() => {
    element.classList.remove("auto-pulse");
    pulseTimers.delete(element);
  }, 720);
  pulseTimers.set(element, timer);
}

function updateModeButtons() {
  modeButtons.forEach((button) => {
    const active = button.dataset.mode === state.mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
  modeDescription.textContent = state.mode === "q1"
    ? "10名敌人，固定1700生命，开局2000元，无赏金；按下开始后锁定布局。"
    : state.mode === "q2"
      ? "25名敌人分四波进攻；可以用击杀赏金在战斗中建塔和升级。"
      : "五关不同路线、随机赏金与升级卡；零漏怪获得三星，节省资金可升至四星或五星。";
  const isQ3 = state.mode === "q3";
  q1PresetPanel.hidden = state.mode !== "q1";
  q2PresetPanel.hidden = state.mode !== "q2";
  q3Campaign.hidden = !isQ3;
  q1Rules.hidden = state.mode !== "q1";
  q2Rules.hidden = state.mode !== "q2";
  q3Rules.hidden = !isQ3;
  baseHealthWrap.hidden = !isQ3;
  artilleryPanel.hidden = !isQ3;
  q3TowerActions.hidden = !isQ3;
  upgradeButton.hidden = isQ3;
  if (isQ3) {
    const level = Q3_LEVELS[q3LevelIndex];
    levelTitle.textContent = level.title;
    levelProgress.textContent = `${q3PlayerCount}人`;
    levelDescription.textContent = level.description;
    seedInput.value = String(q3Seed);
    randomSummary.textContent = `可控随机：路径拐点±${level.jitter}米、赏金±10%、每座塔随机提供三种分支中的两种；当前种子 ${q3Seed}。`;
  }
  renderPlayerControls();
}

function playerScore(stats) {
  return Math.round(stats.damage / 20 + stats.kills * 100 + stats.assists * 80 - stats.leaks * 120 + stats.donated * 0.15);
}

function renderPlayerControls() {
  const isQ3 = state.mode === "q3";
  activePlayerWrap.hidden = !isQ3 || q3PlayerCount === 1;
  assistControls.hidden = !isQ3 || q3PlayerCount === 1;
  if (!isQ3) return;
  activePlayerButtons.innerHTML = "";
  assistTarget.innerHTML = "";
  for (let player = 0; player < state.playerCount; player += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `玩家${player + 1} ${"★".repeat(state.playerStats[player].strategyStars)}`;
    button.style.borderColor = PLAYER_COLORS[player];
    button.classList.toggle("active", player === state.activePlayer);
    button.addEventListener("click", () => switchActivePlayer(player));
    activePlayerButtons.append(button);
    if (player !== state.activePlayer) {
      const option = document.createElement("option");
      option.value = String(player);
      option.textContent = `玩家${player + 1}`;
      assistTarget.append(option);
    }
  }
  renderPlayerScoreboard(true);
}

function renderPlayerScoreboard(force = false) {
  const signature = `${state.activePlayer}|${state.playerStats.map((stats, player) => [
    stats.strategyStars,
    state.playerFunds[player],
    stats.kills,
    stats.leaks,
    playerScore(stats),
  ].join(",")).join("|")}`;
  if (!force && signature === lastScoreboardSignature) return;
  lastScoreboardSignature = signature;
  playerScoreboard.innerHTML = "";
  state.playerStats.forEach((stats, player) => {
    const row = document.createElement("div");
    row.className = `player-score-row${player === state.activePlayer ? " active" : ""}`;
    row.style.setProperty("--player-color", PLAYER_COLORS[player]);
    const stars = "★".repeat(stats.strategyStars);
    row.innerHTML = `<strong title="玩家${player + 1} · ${stats.strategyStars}星${STAR_LEVEL_NAMES[stats.strategyStars]}">P${player + 1} ${stars}</strong><span>资 ${state.playerFunds[player]}</span><span>击 ${stats.kills}</span><span>漏 ${stats.leaks}</span><span>分 ${playerScore(stats)}</span>`;
    playerScoreboard.append(row);
  });
}

function switchActivePlayer(player) {
  if (player < 0 || player >= state.playerCount) return;
  state.activePlayer = player;
  selectedTowerId = null;
  movingTowerId = null;
  linkSourceId = null;
  bombardMode = false;
  setStatus(`当前由玩家${player + 1}操作；资金、塔和炮弹均为个人资源，基地生命由团队共享。`);
  renderPlayerControls();
  updateInterface();
}

function donateFunds() {
  const target = Number(assistTarget.value);
  if (!Number.isInteger(target) || target === state.activePlayer) return;
  const amount = 200;
  if (state.funds < amount) {
    setStatus("当前玩家资金不足200元，无法援助。");
    return;
  }
  state.funds -= amount;
  state.playerFunds[target] += amount;
  state.playerStats[state.activePlayer].donated += amount;
  state.playerStats[target].received += amount;
  setStatus(`玩家${state.activePlayer + 1}向玩家${target + 1}援助200元。跨路炮击也会计入支援贡献。`);
  renderPlayerControls();
}

function chooseKind(kind) {
  selectedKind = kind;
  selectedTowerId = null;
  towerButtons.forEach((button) => button.classList.toggle("active", button.dataset.kind === kind));
  const spec = TOWER_SPECS[kind];
  setStatus(`已选择${spec.name}：造价${spec.cost}元，射程${spec.range}m，DPS ${spec.dps}。`);
}

function towerAt(x, y) {
  const candidates = state.towers.filter((tower) =>
    Math.hypot(tower.x - x, tower.y - y) <= 40 &&
    (state.mode !== "q3" || tower.owner === state.activePlayer));
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
  speed = ({ 1: 2, 2: 4, 4: 8, 8: 1 })[speed];
  setStatus(`游戏速度切换为 ${speed}×。`);
}

function worldToCanvas(x, y) {
  return [x, MAP_SIZE - y];
}

function drawGrid() {
  ctx.fillStyle = "#24594d";
  ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);
  ctx.strokeStyle = "#327060";
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

function strokePath(width, color, points = currentPathPoints) {
  ctx.beginPath();
  points.forEach(([x, y], index) => {
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
  for (const path of currentPaths) {
    strokePath(ROAD_WIDTH + 2 * TOWER_BASE_RADIUS, "#db5f62", path);
    strokePath(ROAD_WIDTH, "#c7d7d2", path);
  }
  const multiplayerLabels = state.mode === "q3" && currentPaths.length > 1;
  ctx.font = multiplayerLabels
    ? "800 52px 'Microsoft YaHei UI', system-ui"
    : "700 38px 'Microsoft YaHei UI', system-ui";
  ctx.fillStyle = "#f3f6fb";
  currentPaths.forEach((path, lane) => {
    path.forEach(([x, y], index) => {
      const [sx, sy] = worldToCanvas(x, y);
      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.fill();
      let label;
      if (state.mode === "q3" && currentPaths.length > 1) {
        if (index === 0) {
          const stars = state.playerStats[lane]?.strategyStars ?? q3PlayerStarLevels[lane] ?? 3;
          label = `P${lane + 1} ${"★".repeat(stars)} 起点`;
        }
        else if (index === path.length - 1) label = lane === 0 ? "共享基地" : "";
        else label = "";
      } else if (state.mode === "q3") {
        label = index === 0 ? "起点" : index === path.length - 1 ? "基地" : `P${index}`;
      } else {
        label = ["O", "A", "B", "C", "E", "F", "D"][index] ?? "";
      }
      if (label) {
        let labelX = sx + 18;
        const labelY = sy > MAP_SIZE - 180 ? sy - 145 : sy - 18;
        ctx.textAlign = "left";
        if (labelX + ctx.measureText(label).width > MAP_SIZE - 18) {
          labelX = sx - 18;
          ctx.textAlign = "right";
        }
        ctx.lineJoin = "round";
        ctx.lineWidth = multiplayerLabels ? 11 : 8;
        ctx.strokeStyle = "rgba(6, 10, 17, 0.92)";
        ctx.strokeText(label, labelX, labelY);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, labelX, labelY);
      }
    });
  });
  ctx.textAlign = "left";
}

function drawGeometryLinks() {
  if (state.mode !== "q3") return;
  for (const triangle of activeTriangles()) {
    ctx.beginPath();
    [triangle.a, triangle.b, triangle.c].forEach((tower, index) => {
      const [x, y] = worldToCanvas(tower.x, tower.y);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = `rgba(245, 196, 81, ${0.05 + 0.12 * triangle.quality})`;
    ctx.fill();
  }
  ctx.setLineDash([16, 10]);
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(245, 196, 81, 0.8)";
  for (const link of state.links) {
    const first = findTower(link.a);
    const second = findTower(link.b);
    if (!first || !second) continue;
    const [ax, ay] = worldToCanvas(first.x, first.y);
    const [bx, by] = worldToCanvas(second.x, second.y);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function drawArtilleryEffects() {
  if (state.mode !== "q3") return;
  const radius = Q3_LEVELS[q3LevelIndex].artillery.radius;
  for (const effect of state.artilleryEffects) {
    const [x, y] = worldToCanvas(effect.x, effect.y);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 101, 82, 0.22)";
    ctx.fill();
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 12;
    ctx.stroke();
  }
}

function drawTowers() {
  const selected = findTower(selectedTowerId);
  if (selected) {
    const spec = TOWER_SPECS[selected.kind];
    const range = spec.range * (selected.branch ? Q3_BRANCHES[selected.branch].range : 1);
    const [sx, sy] = worldToCanvas(selected.x, selected.y);
    ctx.beginPath();
    ctx.arc(sx, sy, range, 0, Math.PI * 2);
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
    ctx.strokeStyle = tower.id === selectedTowerId
      ? "#ffffff"
      : state.mode === "q3" && state.playerCount > 1
        ? PLAYER_COLORS[tower.owner]
        : "#123344";
    ctx.lineWidth = tower.id === selectedTowerId ? 4 : 2;
    ctx.stroke();
    if (tower.branch) {
      ctx.fillStyle = "#12394b";
      ctx.font = "700 22px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(Q3_BRANCHES[tower.branch].name[0], sx, sy + 8);
      ctx.textAlign = "start";
    }
  }
}

function drawBeams() {
  const active = activeEnemies();
  ctx.strokeStyle = "#ffe27a";
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
  const colors = ["#65e0ac", "#ffb454", "#ff746f", "#b690ff"];
  for (const enemy of activeEnemies()) {
    const [sx, sy] = worldToCanvas(enemy.x, enemy.y);
    const radius = 14;
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    const q3Colors = { scout: "#62d2ff", armored: "#b9c8c9", elite: "#b690ff", boss: "#ff6268" };
    ctx.fillStyle = state.mode === "q3" ? q3Colors[enemy.archetype] : colors[enemy.wave - 1];
    ctx.fill();
    ctx.strokeStyle = state.mode === "q3" && state.playerCount > 1 ? PLAYER_COLORS[enemy.lane] : "#111827";
    ctx.lineWidth = 4;
    ctx.stroke();
    const ratio = Math.max(0, enemy.hp / enemy.maxHp);
    ctx.fillStyle = "#426674";
    ctx.fillRect(sx - 32, sy - 28, 64, 9);
    ctx.fillStyle = ratio > 0.4 ? "#58d6a4" : "#ff6b6b";
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
  ctx.strokeStyle = valid ? "#62e3ad" : "#ff746f";
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
  const scale = canvas.width / MAP_SIZE;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  drawGrid();
  drawPath();
  drawGeometryLinks();
  drawArtilleryEffects();
  drawBeams();
  drawTowers();
  drawEnemies();
  drawPreview();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function updateInterface() {
  const counts = towerCounts();
  const multiplayer = state.mode === "q3" && state.playerCount > 1;
  const displayFunds = multiplayer ? state.playerFunds.reduce((total, funds) => total + funds, 0) : state.funds;
  const displayCounts = multiplayer
    ? Object.fromEntries(Object.keys(TOWER_SPECS).map((kind) => [kind, state.towers.filter((tower) => tower.kind === kind).length]))
    : counts;
  fundsLabel.textContent = multiplayer ? "团队资金" : "资金";
  fundsStat.textContent = `${displayFunds} 元`;
  timeStat.textContent = `${state.time.toFixed(1)} s`;
  killsStat.textContent = String(state.kills);
  leaksStat.textContent = String(state.leaks);
  const remaining = state.enemies.filter((enemy) => !enemy.finished).length;
  const autoRemaining = state.mode === "q3" ? q3AutoActions.length : q2AutoActions.length;
  const autoDetail = autoRemaining ? ` · 自动策略待执行 ${autoRemaining}` : "";
  const limitScale = multiplayer ? state.playerCount : 1;
  detailStat.textContent = `累计花费 ${state.totalSpent} 元 · 未结束敌人 ${remaining} · 塔数 小${displayCounts.small}/${20 * limitScale} 中${displayCounts.medium}/${15 * limitScale} 大${displayCounts.large}/${10 * limitScale}${autoDetail}`;

  const selected = findTower(selectedTowerId);
  if (selected) {
    const spec = TOWER_SPECS[selected.kind];
    const branch = selected.branch ? Q3_BRANCHES[selected.branch] : null;
    const range = spec.range * (branch?.range ?? 1);
    const dps = spec.dps * (branch?.dps ?? 1);
    const ownerText = multiplayer ? `P${selected.owner + 1} · ` : "";
    const branchText = state.mode === "q3"
      ? ` · ${branch ? branch.name : selected.offers.map((key) => Q3_BRANCHES[key].name).join("/")}`
      : "";
    selectedInfo.textContent = `${ownerText}${spec.name} #${selected.id} · 射程${range.toFixed(0)}m · DPS ${dps.toFixed(1)}${branchText} · 伤害${selected.totalDamage.toFixed(0)}`;
  } else {
    const spec = TOWER_SPECS[selectedKind];
    selectedInfo.textContent = `待建 ${spec.name} · ${spec.cost}元 · ${spec.range}m · DPS ${spec.dps}`;
  }

  if (state.mode === "q3") {
    const ratio = Math.max(0, state.baseHp / state.maxBaseHp);
    baseHealthText.textContent = `${state.baseHp} / ${state.maxBaseHp}`;
    baseHealthBar.style.width = `${ratio * 100}%`;
    starResult.hidden = state.resultStars === null;
    if (state.resultStars !== null) {
      const retentionPercent = (budgetRetentionRatio() * 100).toFixed(1);
      starResult.textContent = state.resultStars === 0
        ? "闯关失败"
        : `${"★".repeat(state.resultStars)}${"☆".repeat(5 - state.resultStars)}　余资${retentionPercent}%`;
    }
    const artillery = Q3_LEVELS[q3LevelIndex].artillery;
    const cooldown = Math.max(0, state.artilleryReadyAt - state.time);
    artilleryInfo.textContent = `每发${artillery.cost}元 · 余${state.artilleryRemaining}发 · ${cooldown > 0 ? `冷却${cooldown.toFixed(1)}秒` : "可以发射"}`;
    artilleryButton.disabled = state.artilleryRemaining <= 0 || state.funds < artillery.cost || cooldown > 0 || gameComplete();
    branchButtons.forEach((button) => {
      const allowed = selected && !selected.branch && selected.offers.includes(button.dataset.branch);
      button.disabled = !allowed;
      button.classList.toggle("active", selected?.branch === button.dataset.branch);
    });
    sellButton.disabled = !selected || gameComplete();
    moveButton.disabled = !selected || gameComplete();
    linkButton.disabled = !selected || gameComplete();
    renderPlayerScoreboard();
  }

  startButton.textContent = running ? "暂停" : state.started ? "继续" : "开始";
  speedButton.textContent = `${speed}×`;
  if (!state.started) canvasMessage.textContent = "布塔阶段：选择塔型，点击地图建造，然后开始";
  else if (gameComplete()) canvasMessage.textContent = state.mode === "q3"
    ? `${state.resultStars ? `${"★".repeat(state.resultStars)}通关` : "基地失守"}　击杀 ${state.kills}　漏怪 ${state.leaks}`
    : `战斗结束　击杀 ${state.kills}　漏怪 ${state.leaks}`;
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
  if (bombardMode) {
    const [ok, message] = fireArtillery(x, y);
    bombardMode = false;
    artilleryButton.classList.remove("active");
    setStatus(message);
    return;
  }
  if (movingTowerId !== null) {
    const [ok, message] = moveTowerTo(movingTowerId, x, y);
    if (ok) movingTowerId = null;
    setStatus(message);
    return;
  }
  const tower = towerAt(x, y);
  if (tower) {
    if (linkSourceId !== null) {
      const [ok, message] = createLink(linkSourceId, tower.id);
      linkSourceId = null;
      linkButton.classList.remove("active");
      setStatus(message);
      return;
    }
    selectedTowerId = tower.id;
    const offers = state.mode === "q3" && !tower.branch
      ? `，本局升级卡：${tower.offers.map((key) => Q3_BRANCHES[key].name).join(" / ")}`
      : "";
    setStatus(`已选择${TOWER_SPECS[tower.kind].name} #${tower.id}${offers}。`);
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
q2PresetButton.addEventListener("click", loadQ2BestPolicy);
upgradeButton.addEventListener("click", upgradeSelectedTower);
q3DemoButton.addEventListener("click", loadQ3Demo);
q3LevelSelect.addEventListener("change", updateQ3CombinationPreview);
q3PlayerCountSelect.addEventListener("change", () => {
  renderPlayerStarSelectors(true);
  updateQ3CombinationPreview();
});
seedButton.addEventListener("click", () => {
  q3Seed = Math.floor(Math.random() * 900000000) + 1;
  resetGame("q3");
});
seedInput.addEventListener("change", () => {
  q3Seed = Math.max(1, Math.floor(Number(seedInput.value) || 1));
  resetGame("q3");
});
artilleryButton.addEventListener("click", () => {
  bombardMode = !bombardMode;
  artilleryButton.classList.toggle("active", bombardMode);
  setStatus(bombardMode ? "请点击地图选择炮击落点。" : "已取消炮击瞄准。");
});
branchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const [ok, message] = applyBranch(selectedTowerId, button.dataset.branch);
    setStatus(message);
  });
});
sellButton.addEventListener("click", () => {
  if (selectedTowerId === null) return;
  const [ok, message] = sellTower(selectedTowerId);
  setStatus(message);
});
moveButton.addEventListener("click", () => {
  if (selectedTowerId === null) return;
  movingTowerId = selectedTowerId;
  setStatus(`请选择防御塔 #${movingTowerId} 的新位置；搬迁费用为塔价的15%。`);
});
linkButton.addEventListener("click", () => {
  if (selectedTowerId === null) return;
  linkSourceId = selectedTowerId;
  linkButton.classList.add("active");
  setStatus(`请选择与防御塔 #${linkSourceId} 建立连接的第二座塔。`);
});
assistButton.addEventListener("click", donateFunds);
balanceCheckButton.addEventListener("click", () => {
  balanceCheckButton.disabled = true;
  balanceCheckResult.textContent = "正在模拟……";
  window.setTimeout(() => {
    const results = window.__runCampaignValidation([q3Seed]);
    window.__lastCampaignValidation = results;
    const exact = results.filter((item) => item.actualStars >= item.requestedStars).length;
    const perfect = results.filter((item) => item.requestedStars === 3 && item.actualStars >= 3).length;
    balanceCheckResult.dataset.results = JSON.stringify(results);
    balanceCheckResult.textContent = `${exact}/15基础目标达标 · 零漏${perfect}/5关`;
    balanceCheckButton.disabled = false;
  }, 0);
});

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
  else if (event.key.toLowerCase() === "o") loadQ2BestPolicy();
  else if (event.key === "Escape") {
    selectedTowerId = null;
    bombardMode = false;
    movingTowerId = null;
    linkSourceId = null;
    artilleryButton.classList.remove("active");
    linkButton.classList.remove("active");
    setStatus("已取消当前选择和操作模式。");
  }
});

function frame(timestamp) {
  const elapsed = Math.min((timestamp - lastFrameTime) / 1000, 0.1);
  lastFrameTime = timestamp;
  let justCompleted = false;
  if (running && !gameComplete()) {
    simulationAccumulator += elapsed * speed;
    let iterations = 0;
    while (simulationAccumulator >= 0.02 && iterations < 40) {
      runQ3PolicyActions();
      stepSimulation(0.02);
      runQ2PolicyActions();
      runQ3PolicyActions();
      simulationAccumulator -= 0.02;
      iterations += 1;
    }
    if (gameComplete()) {
      running = false;
      justCompleted = true;
      if (state.mode === "q3") {
        if (state.resultStars === null) state.resultStars = calculateStars();
        setStatus(state.resultStars === 0
          ? `闯关失败：基地失守，击杀${state.kills}，漏怪${state.leaks}。`
          : `${"★".repeat(state.resultStars)}${"☆".repeat(5 - state.resultStars)}通关：基地生命${state.baseHp}，击杀${state.kills}，团队剩余资金${totalRemainingFunds()}元（保留${(budgetRetentionRatio() * 100).toFixed(1)}%）。`);
      } else {
        setStatus(`本局结束：击杀 ${state.kills}，漏怪 ${state.leaks}，剩余资金 ${state.funds} 元。`);
      }
    }
  }
  const drawInterval = running && speed < 4 ? 1000 / 60 : 1000 / 30;
  if (justCompleted || timestamp - lastDrawTime >= drawInterval) {
    draw();
    lastDrawTime = timestamp;
  }
  const uiInterval = running ? 100 : 200;
  if (justCompleted || timestamp - lastUiUpdateTime >= uiInterval) {
    updateInterface();
    lastUiUpdateTime = timestamp;
  }
  requestAnimationFrame(frame);
}

window.__runCampaignValidation = function runCampaignValidation(seeds = [20261127]) {
  const results = [];
  running = false;
  const previousPlayerCount = q3PlayerCount;
  const previousPlayerStars = [...q3PlayerStarLevels];
  q3PlayerCount = 1;
  for (let level = 0; level < Q3_LEVELS.length; level += 1) {
    for (const seed of seeds) {
      for (const requestedStars of [1, 2, 3]) {
        q3LevelIndex = level;
        q3Seed = seed;
        q3PlayerStarLevels = [requestedStars];
        resetGame("q3");
        q3AutoActions = prepareQ3DemoActions(requestedStars, 1);
        state.started = true;
        let guard = 0;
        while (!gameComplete() && guard < 20000) {
          runQ3PolicyActions();
          stepSimulation(0.05);
          runQ3PolicyActions();
          guard += 1;
        }
        if (state.resultStars === null) state.resultStars = calculateStars();
        results.push({
          level: level + 1,
          seed,
          requestedStars,
          actualStars: state.resultStars,
          baseHp: state.baseHp,
          kills: state.kills,
          leaks: state.leaks,
          funds: totalRemainingFunds(),
          retention: Number((budgetRetentionRatio() * 100).toFixed(1)),
          pendingActions: q3AutoActions.length,
          time: Number(state.time.toFixed(1)),
        });
      }
    }
  }
  q3LevelIndex = 0;
  q3Seed = seeds[0] ?? 20261127;
  q3PlayerCount = previousPlayerCount;
  q3PlayerStarLevels = previousPlayerStars;
  resetGame("q3");
  return results;
};

renderPlayerStarSelectors(true);
updateQ3CombinationPreview();
resetGame("q2");
requestAnimationFrame(frame);
