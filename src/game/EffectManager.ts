import type { Position } from '../types/game';
import type { GameRenderer } from '../utils/renderer';

export class EffectManager {
  private effects: GameEffect[] = [];

  // 폭탄 효과 생성
  createBomb(): void {
    const bomb: GameEffect = {
      id: `bomb-${Date.now()}`,
      type: 'bomb',
      position: { x: 0, y: 0 }, // 마우스 위치로 설정
      duration: 1000,
      radius: 100,
      damage: 100,
      progress: 0,
      isActive: true
    };

    this.effects.push(bomb);
  }

  // 방어막 효과 생성
  createShield(): void {
    const shield: GameEffect = {
      id: `shield-${Date.now()}`,
      type: 'shield',
      position: { x: 0, y: 0 },
      duration: 5000,
      radius: 0,
      damage: 0,
      progress: 0,
      isActive: true
    };

    this.effects.push(shield);
  }

  // 폭발 효과 생성
  createExplosion(position: Position, radius: number, damage: number): void {
    const explosion: GameEffect = {
      id: `explosion-${Date.now()}`,
      type: 'explosion',
      position: { ...position },
      duration: 500,
      radius,
      damage,
      progress: 0,
      isActive: true
    };

    this.effects.push(explosion);
  }

  // 파티클 효과 생성
  createParticles(position: Position, count: number, color: string): void {
    for (let i = 0; i < count; i++) {
      const particle: GameEffect = {
        id: `particle-${Date.now()}-${i}`,
        type: 'particle',
        position: { ...position },
        duration: 1000 + Math.random() * 1000,
        radius: 2 + Math.random() * 3,
        damage: 0,
        progress: 0,
        isActive: true,
        velocity: {
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200
        },
        color
      };

      this.effects.push(particle);
    }
  }

  // 번개 효과 생성
  createLightning(from: Position, to: Position): void {
    const lightning: GameEffect = {
      id: `lightning-${Date.now()}`,
      type: 'lightning',
      position: from,
      targetPosition: to,
      duration: 200,
      radius: 0,
      damage: 0,
      progress: 0,
      isActive: true
    };

    this.effects.push(lightning);
  }

  // 화염 효과 생성
  createFire(position: Position): void {
    const fire: GameEffect = {
      id: `fire-${Date.now()}`,
      type: 'fire',
      position: { ...position },
      duration: 2000,
      radius: 30,
      damage: 0,
      progress: 0,
      isActive: true
    };

    this.effects.push(fire);
  }

  // 빙결 효과 생성
  createIce(position: Position): void {
    const ice: GameEffect = {
      id: `ice-${Date.now()}`,
      type: 'ice',
      position: { ...position },
      duration: 1500,
      radius: 40,
      damage: 0,
      progress: 0,
      isActive: true
    };

    this.effects.push(ice);
  }

  update(deltaTime: number): void {
    this.effects.forEach(effect => {
      if (!effect.isActive) return;

      effect.progress += deltaTime;
      
      // 파티클 이동
      if (effect.type === 'particle' && effect.velocity) {
        effect.position.x += effect.velocity.x * deltaTime / 1000;
        effect.position.y += effect.velocity.y * deltaTime / 1000;
        effect.velocity.x *= 0.98; // 저항
        effect.velocity.y *= 0.98;
      }

      // 효과 완료 확인
      if (effect.progress >= effect.duration) {
        effect.isActive = false;
      }
    });

    // 비활성화된 효과 제거
    this.effects = this.effects.filter(effect => effect.isActive);
  }

  render(renderer: GameRenderer): void {
    this.effects.forEach(effect => {
      if (!effect.isActive) return;

      const progress = effect.progress / effect.duration;

      switch (effect.type) {
        case 'bomb':
        case 'explosion':
          renderer.drawExplosion(effect.position, effect.radius, progress);
          break;

        case 'particle':
          this.renderParticle(effect, progress);
          break;

        case 'lightning':
          if (effect.targetPosition) {
            this.renderLightning(effect, progress);
          }
          break;

        case 'fire':
          this.renderFire(effect, progress);
          break;

        case 'ice':
          this.renderIce(effect, progress);
          break;

        case 'shield':
          this.renderShield(effect, progress);
          break;
      }
    });
  }

  private renderParticle(_effect: GameEffect, _progress: number): void {
    // Canvas context에 직접 접근해야 하므로 renderer에 메서드 추가 필요
    // 여기서는 기본적인 렌더링 로직만 제공
  }

  private renderLightning(effect: GameEffect, progress: number): void {
    if (!effect.targetPosition) return;
    
    // 번개 효과 렌더링
    const segments = 10;
    const points: Position[] = [];
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = effect.position.x + (effect.targetPosition.x - effect.position.x) * t;
      const y = effect.position.y + (effect.targetPosition.y - effect.position.y) * t;
      
      // 번개 지그재그 효과
      const offset = Math.sin(t * Math.PI * 4 + progress * 20) * 10;
      points.push({ x: x + offset, y: y });
    }
  }

  private renderFire(_effect: GameEffect, _progress: number): void {
    // 화염 효과 렌더링
    // TODO: 실제 화염 효과 구현
  }

  private renderIce(_effect: GameEffect, _progress: number): void {
    // 빙결 효과 렌더링
    // TODO: 실제 빙결 효과 구현
  }

  private renderShield(_effect: GameEffect, _progress: number): void {
    // 방어막 효과 렌더링
    // TODO: 실제 방어막 효과 구현
  }

  // 특정 위치의 효과들 가져오기
  getEffectsAt(position: Position, radius: number): GameEffect[] {
    return this.effects.filter(effect => {
      if (!effect.isActive) return false;
      
      const distance = Math.sqrt(
        (effect.position.x - position.x) ** 2 + 
        (effect.position.y - position.y) ** 2
      );
      
      return distance <= radius;
    });
  }

  // 폭발 효과로 인한 데미지 계산
  getExplosionDamage(position: Position, radius: number): number {
    const explosions = this.effects.filter(effect => 
      effect.isActive && 
      effect.type === 'explosion' &&
      this.getDistance(effect.position, position) <= radius
    );

    return explosions.reduce((total, explosion) => total + explosion.damage, 0);
  }

  private getDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  clear(): void {
    this.effects = [];
  }

  getActiveEffects(): GameEffect[] {
    return this.effects.filter(effect => effect.isActive);
  }
}

interface GameEffect {
  id: string;
  type: 'bomb' | 'explosion' | 'particle' | 'lightning' | 'fire' | 'ice' | 'shield';
  position: Position;
  targetPosition?: Position;
  duration: number;
  radius: number;
  damage: number;
  progress: number;
  isActive: boolean;
  velocity?: { x: number; y: number };
  color?: string;
}
