import type { Tower, Enemy, Position, TowerElement } from '../types/game';
import { UPGRADE_CONFIGS } from '../config/gameConfig';

export class TowerManager {
  private towers: Tower[] = [];
  private projectiles: Projectile[] = [];

  addTower(tower: Tower): void {
    this.towers.push(tower);
  }

  removeTower(towerId: string): void {
    this.towers = this.towers.filter(t => t.id !== towerId);
  }

  getTowers(): Tower[] {
    return this.towers;
  }

  getTowerAt(position: Position): Tower | undefined {
    return this.towers.find(tower => 
      Math.abs(tower.position.x - position.x) < 20 && 
      Math.abs(tower.position.y - position.y) < 20
    );
  }

  upgradeTower(towerId: string): boolean {
    const tower = this.towers.find(t => t.id === towerId);
    if (!tower) return false;

    const upgradeConfig = UPGRADE_CONFIGS[tower.element];
    const nextLevel = tower.level + 1;
    
    if (nextLevel > upgradeConfig.length) return false;

    const nextUpgrade = upgradeConfig[nextLevel - 1];
    tower.level = nextLevel;
    tower.damage = nextUpgrade.damage;
    tower.range = nextUpgrade.range;
    tower.attackSpeed = nextUpgrade.attackSpeed;
    tower.upgradeCost = nextUpgrade.cost;

    return true;
  }

  update(deltaTime: number, enemies: Enemy[]): void {
    // 타워 공격 로직
    this.towers.forEach(tower => {
      this.updateTowerAttack(tower, enemies);
    });

    // 투사체 업데이트
    this.updateProjectiles(deltaTime, enemies);
  }

  private updateTowerAttack(tower: Tower, enemies: Enemy[]): void {
    const now = Date.now();
    
    // 공격 쿨다운 확인
    if (now - tower.lastAttackTime < tower.attackSpeed) return;

    // 가장 가까운 적 찾기
    const target = this.findNearestEnemy(tower, enemies);
    if (!target) return;

    // 사거리 확인
    const distance = this.getDistance(tower.position, target.position);
    if (distance > tower.range) return;

    // 공격 실행
    this.attackEnemy(tower, target);
    tower.lastAttackTime = now;
    tower.target = target;
  }

  private findNearestEnemy(tower: Tower, enemies: Enemy[]): Enemy | undefined {
    let nearestEnemy: Enemy | undefined;
    let nearestDistance = Infinity;

    enemies.forEach(enemy => {
      if (enemy.isDead) return;

      const distance = this.getDistance(tower.position, enemy.position);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestEnemy = enemy;
      }
    });

    return nearestEnemy;
  }

  private attackEnemy(tower: Tower, enemy: Enemy): void {
    // 투사체 생성
    const projectile: Projectile = {
      from: { ...tower.position },
      to: { ...enemy.position },
      element: tower.element,
      damage: tower.damage,
      speed: 800, // 투사체 속도 증가
      progress: 0,
      targetId: enemy.id // 타겟 적 ID 저장
    };

    this.projectiles.push(projectile);
    console.log(`Tower ${tower.element} attacking enemy ${enemy.type} with ${tower.damage} damage`);
  }

  private updateProjectiles(deltaTime: number, enemies: Enemy[]): void {
    this.projectiles = this.projectiles.filter(projectile => {
      // 타겟 적 찾기
      const targetEnemy = enemies.find(e => e.id === projectile.targetId);
      
      if (!targetEnemy || targetEnemy.isDead) {
        // 타겟이 없거나 죽었으면 투사체 제거
        return false;
      }
      
      // 타겟의 현재 위치로 투사체 방향 업데이트
      projectile.to = { ...targetEnemy.position };
      
      // 투사체 이동 (실제 위치 업데이트)
      const dx = projectile.to.x - projectile.from.x;
      const dy = projectile.to.y - projectile.from.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        const moveDistance = (projectile.speed * deltaTime) / 1000;
        const moveX = (dx / distance) * moveDistance;
        const moveY = (dy / distance) * moveDistance;
        
        projectile.from.x += moveX;
        projectile.from.y += moveY;
      }
      
      return true; // 충돌 처리는 GameEngine에서 담당
    });
  }

  // 투사체 충돌 처리 (GameEngine에서 처리됨)
  // private hitEnemy(projectile: Projectile): void {
  //   // 실제 적에게 데미지 적용은 GameEngine에서 처리
  // }

  // createEffect는 GameEngine에서 처리됨

  private getDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getProjectiles(): Projectile[] {
    return this.projectiles;
  }

  removeProjectile(projectile: Projectile): void {
    this.projectiles = this.projectiles.filter(p => p !== projectile);
  }

  clear(): void {
    this.towers = [];
    this.projectiles = [];
  }
}

interface Projectile {
  from: Position;
  to: Position;
  element: TowerElement;
  damage: number;
  speed: number;
  progress: number;
  targetId: string; // 타겟 적의 ID 추가
}
