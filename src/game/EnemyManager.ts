import type { Enemy, Position, Effect, EnemyType } from '../types/game';
import { ENEMY_CONFIGS } from '../config/gameConfig';

export class EnemyManager {
  private enemies: Enemy[] = [];
  private nextEnemyId: number = 1;

  addEnemy(type: EnemyType, position: Position): Enemy {
    const config = ENEMY_CONFIGS[type];
    const enemy: Enemy = {
      id: `enemy-${this.nextEnemyId++}`,
      type,
      position: { ...position },
      velocity: { x: 0, y: 0 },
      maxHealth: config.maxHealth,
      currentHealth: config.maxHealth,
      speed: config.speed,
      reward: config.reward,
      size: { ...config.size },
      effects: [],
      pathIndex: 0,
      isDead: false
    };

    this.enemies.push(enemy);
    return enemy;
  }

  removeEnemy(enemyId: string): void {
    this.enemies = this.enemies.filter(e => e.id !== enemyId);
  }

  getEnemies(): Enemy[] {
    return this.enemies.filter(e => !e.isDead);
  }

  getAllEnemies(): Enemy[] {
    return this.enemies;
  }

  update(deltaTime: number, pathPoints: Position[]): void {
    this.enemies.forEach(enemy => {
      if (enemy.isDead) return;

      this.updateEnemyMovement(enemy, deltaTime, pathPoints);
      this.updateEnemyEffects(enemy, deltaTime);
      this.updateEnemySpecialAbilities(enemy, deltaTime);
    });

    // 죽은 적 제거
    this.enemies = this.enemies.filter(enemy => !enemy.isDead);
  }

  private updateEnemyMovement(enemy: Enemy, deltaTime: number, pathPoints: Position[]): void {
    // 순환 경로: 마지막 지점에 도달하면 다시 첫 번째 지점으로
    const nextPathIndex = (enemy.pathIndex + 1) % pathPoints.length;
    const currentTarget = pathPoints[nextPathIndex];
    
    const dx = currentTarget.x - enemy.position.x;
    const dy = currentTarget.y - enemy.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      // 다음 경로점으로 이동 (순환)
      enemy.pathIndex = nextPathIndex;
    }

    // 속도 계산 (효과 적용)
    let speed = enemy.speed;
    enemy.effects.forEach(effect => {
      if (effect.speedMultiplier) {
        speed *= effect.speedMultiplier;
      }
    });

    // 이동
    const moveDistance = speed * deltaTime;
    const moveX = (dx / distance) * moveDistance;
    const moveY = (dy / distance) * moveDistance;

    enemy.position.x += moveX;
    enemy.position.y += moveY;
    enemy.velocity.x = moveX / deltaTime;
    enemy.velocity.y = moveY / deltaTime;
  }

  private updateEnemyEffects(enemy: Enemy, deltaTime: number): void {
    enemy.effects = enemy.effects.filter(effect => {
      effect.duration -= deltaTime;
      
      if (effect.duration <= 0) {
        return false;
      }

      // 지속 데미지 적용
      if (effect.damage) {
        this.damageEnemy(enemy, effect.damage * deltaTime / 1000);
      }

      return true;
    });
  }

  private updateEnemySpecialAbilities(enemy: Enemy, deltaTime: number): void {
    switch (enemy.type) {
      case 'regenerating':
        // 체력 재생
        if (enemy.currentHealth < enemy.maxHealth) {
          enemy.currentHealth = Math.min(
            enemy.currentHealth + (enemy.maxHealth * 0.01 * deltaTime / 1000),
            enemy.maxHealth
          );
        }
        break;

      case 'splitter':
        // 분열 능력 (죽을 때)
        if (enemy.currentHealth <= 0 && !enemy.isDead) {
          this.splitEnemy(enemy);
        }
        break;

      case 'teleporter':
        // 순간이동 능력
        if (Math.random() < 0.001 * deltaTime / 1000) {
          this.teleportEnemy(enemy);
        }
        break;

      case 'shielded':
        // 방어막 능력
        if (enemy.currentHealth < enemy.maxHealth * 0.5) {
          const hasShield = enemy.effects.some(e => e.type === 'shield');
          if (!hasShield) {
            enemy.effects.push({
              type: 'shield',
              duration: 3000,
              damage: 0
            });
          }
        }
        break;
    }
  }

  private splitEnemy(enemy: Enemy): void {
    // 분열: 2개의 작은 적으로 분할
    for (let i = 0; i < 2; i++) {
      const newEnemy = this.addEnemy('basic', enemy.position);
      newEnemy.maxHealth = enemy.maxHealth / 2;
      newEnemy.currentHealth = newEnemy.maxHealth;
      newEnemy.speed = enemy.speed * 1.5;
      newEnemy.size = { width: 15, height: 15 };
    }
  }

  private teleportEnemy(enemy: Enemy): void {
    // 랜덤 위치로 순간이동 (경로 근처)
    const randomOffset = (Math.random() - 0.5) * 100;
    enemy.position.x += randomOffset;
    enemy.position.y += randomOffset;
  }

  damageEnemy(enemyId: string, damage: number): boolean;
  damageEnemy(enemy: Enemy, damage: number): boolean;
  damageEnemy(enemyOrId: Enemy | string, damage: number): boolean {
    let enemy: Enemy | undefined;
    
    if (typeof enemyOrId === 'string') {
      enemy = this.enemies.find(e => e.id === enemyOrId);
    } else {
      enemy = enemyOrId;
    }

    if (!enemy || enemy.isDead) return false;

    // 방어막 확인
    const hasShield = enemy.effects.some(e => e.type === 'shield');
    if (hasShield) {
      // 방어막이 있으면 데미지 50% 감소
      damage *= 0.5;
    }

    enemy.currentHealth -= damage;
    
    if (enemy.currentHealth <= 0) {
      enemy.isDead = true;
      return true; // 적이 죽었음
    }

    return false; // 적이 살아있음
  }

  applyEffect(enemyId: string, effect: Effect): void;
  applyEffect(enemy: Enemy, effect: Effect): void;
  applyEffect(enemyOrId: Enemy | string, effect: Effect): void {
    let enemy: Enemy | undefined;
    
    if (typeof enemyOrId === 'string') {
      enemy = this.enemies.find(e => e.id === enemyOrId);
    } else {
      enemy = enemyOrId;
    }

    if (!enemy || enemy.isDead) return;

    // 같은 타입의 효과가 있으면 교체
    const existingEffectIndex = enemy.effects.findIndex(e => e.type === effect.type);
    if (existingEffectIndex >= 0) {
      enemy.effects[existingEffectIndex] = effect;
    } else {
      enemy.effects.push(effect);
    }
  }

  getEnemyAt(position: Position, radius: number = 20): Enemy | undefined {
    return this.enemies.find(enemy => {
      if (enemy.isDead) return false;
      
      const distance = Math.sqrt(
        (enemy.position.x - position.x) ** 2 + 
        (enemy.position.y - position.y) ** 2
      );
      
      return distance <= radius;
    });
  }

  getEnemiesInRange(center: Position, radius: number): Enemy[] {
    return this.enemies.filter(enemy => {
      if (enemy.isDead) return false;
      
      const distance = Math.sqrt(
        (enemy.position.x - center.x) ** 2 + 
        (enemy.position.y - center.y) ** 2
      );
      
      return distance <= radius;
    });
  }

  clear(): void {
    this.enemies = [];
    this.nextEnemyId = 1;
  }

  getEnemyCount(): number {
    return this.enemies.filter(e => !e.isDead).length;
  }

  getTotalReward(): number {
    return this.enemies
      .filter(e => e.isDead)
      .reduce((total, enemy) => total + enemy.reward, 0);
  }
}
