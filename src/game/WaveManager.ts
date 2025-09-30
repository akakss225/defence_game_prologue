import type { Wave, EnemyType } from '../types/game';
import { GAME_CONFIG } from '../config/gameConfig';
import type { EnemyManager } from './EnemyManager';

export class WaveManager {
  private currentWave: Wave | null = null;
  private isWaveActive: boolean = false;
  private spawnTimers: SpawnTimer[] = [];

  startWave(wave: Wave, enemyManager: EnemyManager): void {
    this.currentWave = wave;
    this.isWaveActive = true;
    this.spawnTimers = [];

    // 적 스폰 타이머 설정
    wave.enemies.forEach((enemySpawn) => {
      const timer: SpawnTimer = {
        enemyType: enemySpawn.type,
        count: enemySpawn.count,
        spawned: 0,
        delay: enemySpawn.delay,
        interval: enemySpawn.interval,
        lastSpawnTime: 0,
        isActive: false
      };

      // 지연 시간 후 활성화
      setTimeout(() => {
        timer.isActive = true;
        timer.lastSpawnTime = Date.now();
      }, enemySpawn.delay);

      this.spawnTimers.push(timer);
    });

    // 보스 웨이브 처리
    if (wave.isBossWave && wave.bossType) {
      this.spawnBoss(wave.bossType, enemyManager);
    }
  }

  update(enemyManager: EnemyManager): void {
    if (!this.isWaveActive || !this.currentWave) return;

    const now = Date.now();

    // 일반 적 스폰 처리
    this.spawnTimers.forEach(timer => {
      if (!timer.isActive) return;

      if (timer.spawned < timer.count && now - timer.lastSpawnTime >= timer.interval) {
        this.spawnEnemy(timer.enemyType, enemyManager);
        timer.spawned++;
        timer.lastSpawnTime = now;
        console.log(`Spawned ${timer.enemyType}, count: ${timer.spawned}/${timer.count}`);
      }
    });

    // 모든 적이 스폰되었는지 확인
    const allSpawned = this.spawnTimers.every(timer => timer.spawned >= timer.count);
    if (allSpawned && enemyManager.getEnemyCount() === 0) {
      console.log('Wave completed, starting next wave');
      this.isWaveActive = false;
    }
  }

  private spawnEnemy(type: EnemyType, enemyManager: EnemyManager): void {
    const startPosition = GAME_CONFIG.pathPoints[0];
    enemyManager.addEnemy(type, startPosition);
  }

  private spawnBoss(type: EnemyType, enemyManager: EnemyManager): void {
    const startPosition = GAME_CONFIG.pathPoints[0];
    const boss = enemyManager.addEnemy(type, startPosition);
    
    // 보스 특수 능력 강화
    if (type === 'boss') {
      boss.maxHealth *= 2;
      boss.currentHealth = boss.maxHealth;
      boss.speed *= 0.8;
      boss.size = { width: 50, height: 50 };
      boss.reward *= 3;
    }
  }

  getIsWaveActive(): boolean {
    return this.isWaveActive;
  }

  getCurrentWave(): Wave | null {
    return this.currentWave;
  }

  getWaveProgress(): number {
    if (!this.currentWave || !this.isWaveActive) return 0;

    const totalEnemies = this.currentWave.enemies.reduce((sum, spawn) => sum + spawn.count, 0);
    const spawnedEnemies = this.spawnTimers.reduce((sum, timer) => sum + timer.spawned, 0);

    return totalEnemies > 0 ? spawnedEnemies / totalEnemies : 0;
  }

  reset(): void {
    this.currentWave = null;
    this.isWaveActive = false;
    this.spawnTimers = [];
  }

  // 웨이브 난이도 조정
  adjustWaveDifficulty(wave: Wave, round: number): Wave {
    const difficultyMultiplier = this.getDifficultyMultiplier(round);
    
    const adjustedWave: Wave = {
      ...wave,
      enemies: wave.enemies.map(enemySpawn => ({
        ...enemySpawn,
        count: Math.floor(enemySpawn.count * difficultyMultiplier),
        interval: Math.max(enemySpawn.interval * (1 / difficultyMultiplier), 200) // 최소 200ms 간격
      }))
    };

    return adjustedWave;
  }

  private getDifficultyMultiplier(round: number): number {
    if (round <= 10) return 1.0;
    if (round <= 20) return 1.2;
    if (round <= 30) return 1.5;
    if (round <= 40) return 1.8;
    return 2.0;
  }

  // 특수 웨이브 생성
  createSpecialWave(): Wave {
    const specialWaves: Wave[] = [
      // 러시 웨이브 (빠른 적들)
      {
        round: 1,
        enemies: [
          { type: 'fast', count: 20, delay: 0, interval: 300 },
          { type: 'flying', count: 10, delay: 2000, interval: 500 }
        ],
        isBossWave: false
      },
      // 탱크 웨이브 (강한 적들)
      {
        round: 1,
        enemies: [
          { type: 'tank', count: 8, delay: 0, interval: 1000 },
          { type: 'armored', count: 6, delay: 3000, interval: 800 }
        ],
        isBossWave: false
      },
      // 혼합 웨이브 (다양한 적들)
      {
        round: 1,
        enemies: [
          { type: 'basic', count: 10, delay: 0, interval: 600 },
          { type: 'fast', count: 8, delay: 1000, interval: 800 },
          { type: 'tank', count: 4, delay: 3000, interval: 1200 },
          { type: 'flying', count: 6, delay: 5000, interval: 1000 }
        ],
        isBossWave: false
      }
    ];

    return specialWaves[Math.floor(Math.random() * specialWaves.length)];
  }

  // 웨이브 미리보기 정보
  getWavePreview(_round: number): {
    totalEnemies: number;
    enemyTypes: { [key: string]: number };
    isBossWave: boolean;
    estimatedDuration: number;
  } {
    const wave = this.currentWave;
    if (!wave) {
      return {
        totalEnemies: 0,
        enemyTypes: {},
        isBossWave: false,
        estimatedDuration: 0
      };
    }

    const enemyTypes: { [key: string]: number } = {};
    let totalEnemies = 0;
    let maxDuration = 0;

    wave.enemies.forEach(spawn => {
      enemyTypes[spawn.type] = (enemyTypes[spawn.type] || 0) + spawn.count;
      totalEnemies += spawn.count;
      
      const spawnDuration = spawn.delay + (spawn.count * spawn.interval);
      maxDuration = Math.max(maxDuration, spawnDuration);
    });

    return {
      totalEnemies,
      enemyTypes,
      isBossWave: wave.isBossWave,
      estimatedDuration: maxDuration
    };
  }
}

interface SpawnTimer {
  enemyType: EnemyType;
  count: number;
  spawned: number;
  delay: number;
  interval: number;
  lastSpawnTime: number;
  isActive: boolean;
}
