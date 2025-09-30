import type { GameConfig, Tower, EnemyType, Wave, ShopItem, UpgradeInfo } from '../types/game';

// 게임 기본 설정
export const GAME_CONFIG: GameConfig = {
  canvasWidth: 1200,
  canvasHeight: 800,
  pathPoints: [
    { x: 0, y: 400 },
    { x: 200, y: 400 },
    { x: 200, y: 200 },
    { x: 400, y: 200 },
    { x: 400, y: 600 },
    { x: 600, y: 600 },
    { x: 600, y: 100 },
    { x: 800, y: 100 },
    { x: 800, y: 500 },
    { x: 1000, y: 500 },
    { x: 1000, y: 400 },
    { x: 800, y: 400 },
    { x: 800, y: 200 },
    { x: 600, y: 200 },
    { x: 600, y: 500 },
    { x: 400, y: 500 },
    { x: 400, y: 300 },
    { x: 200, y: 300 },
    { x: 0, y: 300 }
  ],
  towerPositions: [
    { x: 100, y: 300 }, { x: 300, y: 150 }, { x: 300, y: 350 },
    { x: 500, y: 150 }, { x: 500, y: 350 }, { x: 500, y: 550 },
    { x: 700, y: 50 }, { x: 700, y: 250 }, { x: 700, y: 450 },
    { x: 900, y: 200 }, { x: 900, y: 400 }, { x: 900, y: 600 }
  ],
  maxLives: 20,
  startingGold: 100,
  totalRounds: 50,
  roundTimeLimit: 60000, // 60초
  maxEnemyCount: 40 // 게임오버 조건
};

// 타워 기본 설정
export const TOWER_CONFIGS: Record<string, Partial<Tower>> = {
  fire: {
    element: 'fire',
    damage: 25,
    range: 120,
    attackSpeed: 1000,
    cost: 50,
    upgradeCost: 30
  },
  ice: {
    element: 'ice',
    damage: 20,
    range: 100,
    attackSpeed: 1200,
    cost: 40,
    upgradeCost: 25
  },
  poison: {
    element: 'poison',
    damage: 15,
    range: 110,
    attackSpeed: 1500,
    cost: 60,
    upgradeCost: 35
  },
  lightning: {
    element: 'lightning',
    damage: 30,
    range: 130,
    attackSpeed: 800,
    cost: 70,
    upgradeCost: 40
  },
  physical: {
    element: 'physical',
    damage: 35,
    range: 90,
    attackSpeed: 1000,
    cost: 45,
    upgradeCost: 30
  }
};

// 적 설정
export const ENEMY_CONFIGS: Record<EnemyType, {
  maxHealth: number;
  speed: number;
  reward: number;
  size: { width: number; height: number };
  specialAbility?: string;
}> = {
  basic: { maxHealth: 80, speed: 0.4, reward: 15, size: { width: 20, height: 20 } },
  fast: { maxHealth: 50, speed: 0.8, reward: 20, size: { width: 15, height: 15 } },
  tank: { maxHealth: 250, speed: 0.2, reward: 35, size: { width: 25, height: 25 } },
  flying: { maxHealth: 70, speed: 0.6, reward: 25, size: { width: 18, height: 18 } },
  armored: { maxHealth: 150, speed: 0.3, reward: 40, size: { width: 22, height: 22 } },
  regenerating: { maxHealth: 120, speed: 0.4, reward: 45, size: { width: 20, height: 20 } },
  splitter: { maxHealth: 90, speed: 0.5, reward: 30, size: { width: 20, height: 20 } },
  shielded: { maxHealth: 110, speed: 0.4, reward: 35, size: { width: 20, height: 20 } },
  teleporter: { maxHealth: 70, speed: 0.6, reward: 40, size: { width: 18, height: 18 } },
  boss: { maxHealth: 800, speed: 0.12, reward: 150, size: { width: 40, height: 40 } }
};

// 업그레이드 정보
export const UPGRADE_CONFIGS: Record<string, UpgradeInfo[]> = {
  fire: [
    { level: 1, damage: 25, range: 120, attackSpeed: 1000, cost: 0 },
    { level: 2, damage: 40, range: 140, attackSpeed: 900, cost: 30 },
    { level: 3, damage: 60, range: 160, attackSpeed: 800, cost: 50 },
    { level: 4, damage: 90, range: 180, attackSpeed: 700, cost: 80 }
  ],
  ice: [
    { level: 1, damage: 20, range: 100, attackSpeed: 1200, cost: 0 },
    { level: 2, damage: 35, range: 120, attackSpeed: 1100, cost: 25 },
    { level: 3, damage: 55, range: 140, attackSpeed: 1000, cost: 40 },
    { level: 4, damage: 80, range: 160, attackSpeed: 900, cost: 65 }
  ],
  poison: [
    { level: 1, damage: 15, range: 110, attackSpeed: 1500, cost: 0 },
    { level: 2, damage: 25, range: 130, attackSpeed: 1400, cost: 35 },
    { level: 3, damage: 40, range: 150, attackSpeed: 1300, cost: 55 },
    { level: 4, damage: 60, range: 170, attackSpeed: 1200, cost: 85 }
  ],
  lightning: [
    { level: 1, damage: 30, range: 130, attackSpeed: 800, cost: 0 },
    { level: 2, damage: 50, range: 150, attackSpeed: 700, cost: 40 },
    { level: 3, damage: 80, range: 170, attackSpeed: 600, cost: 65 },
    { level: 4, damage: 120, range: 190, attackSpeed: 500, cost: 100 }
  ],
  physical: [
    { level: 1, damage: 35, range: 90, attackSpeed: 1000, cost: 0 },
    { level: 2, damage: 55, range: 110, attackSpeed: 900, cost: 30 },
    { level: 3, damage: 85, range: 130, attackSpeed: 800, cost: 50 },
    { level: 4, damage: 130, range: 150, attackSpeed: 700, cost: 80 }
  ]
};

// 웨이브 설정
export const WAVE_CONFIGS: Wave[] = [
  // 1-10라운드: 어려운 웨이브
  { round: 1, enemies: [{ type: 'basic', count: 8, delay: 0, interval: 600 }], isBossWave: false },
  { round: 2, enemies: [{ type: 'basic', count: 12, delay: 0, interval: 500 }], isBossWave: false },
  { round: 3, enemies: [{ type: 'fast', count: 10, delay: 0, interval: 800 }], isBossWave: false },
  { round: 4, enemies: [{ type: 'basic', count: 15, delay: 0, interval: 400 }], isBossWave: false },
  { round: 5, enemies: [{ type: 'tank', count: 5, delay: 0, interval: 1200 }], isBossWave: false },
  { round: 6, enemies: [{ type: 'basic', count: 12, delay: 0, interval: 500 }, { type: 'fast', count: 8, delay: 1500, interval: 700 }], isBossWave: false },
  { round: 7, enemies: [{ type: 'flying', count: 8, delay: 0, interval: 1000 }], isBossWave: false },
  { round: 8, enemies: [{ type: 'tank', count: 8, delay: 0, interval: 1000 }], isBossWave: false },
  { round: 9, enemies: [{ type: 'basic', count: 18, delay: 0, interval: 300 }, { type: 'fast', count: 10, delay: 2000, interval: 500 }], isBossWave: false },
  { round: 10, enemies: [], isBossWave: true, bossType: 'boss' },
  
  // 11-20라운드: 중간 난이도
  { round: 11, enemies: [{ type: 'armored', count: 4, delay: 0, interval: 2000 }], isBossWave: false },
  { round: 12, enemies: [{ type: 'basic', count: 15, delay: 0, interval: 400 }], isBossWave: false },
  { round: 13, enemies: [{ type: 'regenerating', count: 6, delay: 0, interval: 1800 }], isBossWave: false },
  { round: 14, enemies: [{ type: 'flying', count: 8, delay: 0, interval: 1200 }], isBossWave: false },
  { round: 15, enemies: [{ type: 'tank', count: 8, delay: 0, interval: 1000 }], isBossWave: false },
  { round: 16, enemies: [{ type: 'splitter', count: 5, delay: 0, interval: 2000 }], isBossWave: false },
  { round: 17, enemies: [{ type: 'armored', count: 6, delay: 0, interval: 1500 }, { type: 'flying', count: 4, delay: 2000, interval: 1000 }], isBossWave: false },
  { round: 18, enemies: [{ type: 'regenerating', count: 8, delay: 0, interval: 1200 }], isBossWave: false },
  { round: 19, enemies: [{ type: 'basic', count: 20, delay: 0, interval: 300 }, { type: 'fast', count: 10, delay: 2000, interval: 600 }], isBossWave: false },
  { round: 20, enemies: [], isBossWave: true, bossType: 'boss' },
  
  // 21-30라운드: 어려운 웨이브
  { round: 21, enemies: [{ type: 'shielded', count: 6, delay: 0, interval: 1500 }], isBossWave: false },
  { round: 22, enemies: [{ type: 'teleporter', count: 5, delay: 0, interval: 2000 }], isBossWave: false },
  { round: 23, enemies: [{ type: 'armored', count: 10, delay: 0, interval: 800 }], isBossWave: false },
  { round: 24, enemies: [{ type: 'regenerating', count: 10, delay: 0, interval: 1000 }], isBossWave: false },
  { round: 25, enemies: [{ type: 'splitter', count: 8, delay: 0, interval: 1200 }], isBossWave: false },
  { round: 26, enemies: [{ type: 'shielded', count: 8, delay: 0, interval: 1000 }, { type: 'flying', count: 6, delay: 2000, interval: 800 }], isBossWave: false },
  { round: 27, enemies: [{ type: 'teleporter', count: 8, delay: 0, interval: 1200 }], isBossWave: false },
  { round: 28, enemies: [{ type: 'tank', count: 12, delay: 0, interval: 600 }], isBossWave: false },
  { round: 29, enemies: [{ type: 'basic', count: 30, delay: 0, interval: 200 }, { type: 'fast', count: 15, delay: 1000, interval: 400 }], isBossWave: false },
  { round: 30, enemies: [], isBossWave: true, bossType: 'boss' },
  
  // 31-40라운드: 매우 어려운 웨이브
  { round: 31, enemies: [{ type: 'armored', count: 15, delay: 0, interval: 500 }], isBossWave: false },
  { round: 32, enemies: [{ type: 'regenerating', count: 12, delay: 0, interval: 800 }], isBossWave: false },
  { round: 33, enemies: [{ type: 'shielded', count: 10, delay: 0, interval: 1000 }], isBossWave: false },
  { round: 34, enemies: [{ type: 'teleporter', count: 10, delay: 0, interval: 1000 }], isBossWave: false },
  { round: 35, enemies: [{ type: 'splitter', count: 12, delay: 0, interval: 800 }], isBossWave: false },
  { round: 36, enemies: [{ type: 'flying', count: 15, delay: 0, interval: 600 }], isBossWave: false },
  { round: 37, enemies: [{ type: 'tank', count: 15, delay: 0, interval: 500 }], isBossWave: false },
  { round: 38, enemies: [{ type: 'armored', count: 12, delay: 0, interval: 600 }, { type: 'regenerating', count: 8, delay: 2000, interval: 800 }], isBossWave: false },
  { round: 39, enemies: [{ type: 'basic', count: 40, delay: 0, interval: 150 }, { type: 'fast', count: 20, delay: 1000, interval: 300 }], isBossWave: false },
  { round: 40, enemies: [], isBossWave: true, bossType: 'boss' },
  
  // 41-50라운드: 극한 난이도
  { round: 41, enemies: [{ type: 'shielded', count: 15, delay: 0, interval: 600 }], isBossWave: false },
  { round: 42, enemies: [{ type: 'teleporter', count: 12, delay: 0, interval: 800 }], isBossWave: false },
  { round: 43, enemies: [{ type: 'splitter', count: 15, delay: 0, interval: 600 }], isBossWave: false },
  { round: 44, enemies: [{ type: 'regenerating', count: 15, delay: 0, interval: 600 }], isBossWave: false },
  { round: 45, enemies: [{ type: 'armored', count: 20, delay: 0, interval: 400 }], isBossWave: false },
  { round: 46, enemies: [{ type: 'flying', count: 20, delay: 0, interval: 400 }], isBossWave: false },
  { round: 47, enemies: [{ type: 'tank', count: 20, delay: 0, interval: 400 }], isBossWave: false },
  { round: 48, enemies: [{ type: 'shielded', count: 12, delay: 0, interval: 500 }, { type: 'teleporter', count: 8, delay: 1000, interval: 700 }], isBossWave: false },
  { round: 49, enemies: [{ type: 'basic', count: 50, delay: 0, interval: 100 }, { type: 'fast', count: 25, delay: 500, interval: 200 }], isBossWave: false },
  { round: 50, enemies: [], isBossWave: true, bossType: 'boss' }
];

// 상점 아이템
export const SHOP_ITEMS: ShopItem[] = [
  // 타워
  { id: 'fire-tower', name: '화염 타워', cost: 50, type: 'tower', element: 'fire' },
  { id: 'ice-tower', name: '빙결 타워', cost: 40, type: 'tower', element: 'ice' },
  { id: 'poison-tower', name: '독 타워', cost: 60, type: 'tower', element: 'poison' },
  { id: 'lightning-tower', name: '전기 타워', cost: 70, type: 'tower', element: 'lightning' },
  { id: 'physical-tower', name: '물리 타워', cost: 45, type: 'tower', element: 'physical' },
  
  // 특수 능력
  { id: 'bomb', name: '폭탄', cost: 30, type: 'ability', ability: 'bomb' },
  { id: 'time-stop', name: '시간정지', cost: 50, type: 'ability', ability: 'timeStop' },
  { id: 'heal', name: '체력회복', cost: 40, type: 'ability', ability: 'heal' },
  { id: 'shield', name: '방어막', cost: 60, type: 'ability', ability: 'shield' }
];
