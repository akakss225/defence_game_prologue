// 게임 기본 타입 정의

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Velocity {
  x: number;
  y: number;
}

// 타워 속성 타입
export type TowerElement = 'fire' | 'ice' | 'poison' | 'lightning' | 'physical';

// 타워 타입
export interface Tower {
  id: string;
  position: Position;
  element: TowerElement;
  level: number;
  damage: number;
  range: number;
  attackSpeed: number;
  cost: number;
  upgradeCost: number;
  lastAttackTime: number;
  target?: Enemy;
}

// 적 타입
export interface Enemy {
  id: string;
  type: EnemyType;
  position: Position;
  velocity: Velocity;
  maxHealth: number;
  currentHealth: number;
  speed: number;
  reward: number;
  size: Size;
  effects: Effect[];
  pathIndex: number;
  isDead: boolean;
}

// 적 타입 정의
export type EnemyType = 
  | 'basic' | 'fast' | 'tank' | 'flying' | 'armored'
  | 'regenerating' | 'splitter' | 'shielded' | 'teleporter' | 'boss';

// 효과 타입
export interface Effect {
  type: 'burn' | 'freeze' | 'poison' | 'shock' | 'slow' | 'shield';
  duration: number;
  damage?: number;
  speedMultiplier?: number;
}

// 웨이브 타입
export interface Wave {
  round: number;
  enemies: EnemySpawn[];
  isBossWave: boolean;
  bossType?: EnemyType;
}

// 적 스폰 정보
export interface EnemySpawn {
  type: EnemyType;
  count: number;
  delay: number;
  interval: number;
}

// 특수 능력 타입
export type SpecialAbility = 'bomb' | 'timeStop' | 'heal' | 'shield';

// 게임 상태
export interface GameState {
  round: number;
  lives: number;
  gold: number;
  score: number;
  isPaused: boolean;
  isGameOver: boolean;
  isVictory: boolean;
  roundTimeLeft: number;
  timeStopDuration: number;
  specialAbilities: {
    bomb: number;
    timeStop: number;
    heal: number;
    shield: number;
  };
}

// 게임 설정
export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  pathPoints: Position[];
  towerPositions: Position[];
  maxLives: number;
  startingGold: number;
  totalRounds: number;
  roundTimeLimit: number;
  maxEnemyCount: number;
}

// 상점 아이템
export interface ShopItem {
  id: string;
  name: string;
  cost: number;
  type: 'tower' | 'ability' | 'upgrade';
  element?: TowerElement;
  ability?: SpecialAbility;
}

// 업그레이드 정보
export interface UpgradeInfo {
  level: number;
  damage: number;
  range: number;
  attackSpeed: number;
  cost: number;
}
