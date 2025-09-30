import type { GameState, Tower, Position, SpecialAbility, TowerElement, Effect } from '../types/game';
import { GAME_CONFIG, WAVE_CONFIGS, SHOP_ITEMS, TOWER_CONFIGS } from '../config/gameConfig';
import { GameRenderer } from '../utils/renderer';
import { TowerManager } from './TowerManager.js';
import { EnemyManager } from './EnemyManager.js';
import { WaveManager } from './WaveManager.js';
import { EffectManager } from './EffectManager.js';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private renderer: GameRenderer;
  private towerManager: TowerManager;
  private enemyManager: EnemyManager;
  private waveManager: WaveManager;
  private effectManager: EffectManager;
  
  private gameState: GameState;
  private lastTime: number = 0;
  private animationId: number = 0;
  private selectedTowerPosition?: Position;
  private selectedShopItem?: string;
  private isRoundActive: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new GameRenderer(canvas);
    
    this.gameState = {
      round: 1,
      lives: GAME_CONFIG.maxLives,
      gold: GAME_CONFIG.startingGold,
      score: 0,
      isPaused: false,
      isGameOver: false,
      isVictory: false,
      roundTimeLeft: GAME_CONFIG.roundTimeLimit,
      timeStopDuration: 0,
      specialAbilities: {
        bomb: 1,
        timeStop: 1,
        heal: 1,
        shield: 1
      }
    };

    this.towerManager = new TowerManager();
    this.enemyManager = new EnemyManager();
    this.waveManager = new WaveManager();
    this.effectManager = new EffectManager();

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // 마우스 클릭 이벤트
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.handleClick(x, y);
    });

    // 키보드 이벤트
    document.addEventListener('keydown', (e) => {
      this.handleKeyPress(e.key);
    });
  }

  private handleClick(x: number, y: number): void {
    if (this.gameState.isGameOver || this.gameState.isVictory) {
      this.restartGame();
      return;
    }

    // 상점 클릭 확인
    const shopX = this.canvas.width - 200;
    if (x >= shopX) {
      this.handleShopClick(x, y);
      return;
    }

    // 타워 위치 클릭 확인
    const clickedPosition = this.findNearestTowerPosition(x, y);
    if (clickedPosition) {
      this.handleTowerPositionClick(clickedPosition);
    }
  }

  private handleShopClick(_x: number, y: number): void {
    const itemIndex = Math.floor((y - 60) / 60);
    
    if (itemIndex >= 0 && itemIndex < SHOP_ITEMS.length) {
      const item = SHOP_ITEMS[itemIndex];
      this.selectedShopItem = item.id;
      this.selectedTowerPosition = undefined;
    }
  }

  private handleTowerPositionClick(position: Position): void {
    if (this.selectedShopItem) {
      this.buyTower(position);
    } else {
      this.selectTower(position);
    }
  }

  private handleTowerUpgrade(tower: Tower): void {
    if (this.gameState.gold >= tower.upgradeCost) {
      const success = this.towerManager.upgradeTower(tower.id);
      if (success) {
        this.gameState.gold -= tower.upgradeCost;
        console.log(`Tower ${tower.element} upgraded to level ${tower.level + 1}`);
      }
    }
  }


  private buyTower(position: Position): void {
    if (!this.selectedShopItem) return;

    const item = SHOP_ITEMS.find(i => i.id === this.selectedShopItem);
    if (!item || item.type !== 'tower') return;

    const towerConfig = TOWER_CONFIGS[item.element!];
    if (this.gameState.gold >= item.cost) {
      const tower: Tower = {
        id: `${item.element}-${Date.now()}`,
        position,
        element: item.element!,
        level: 1,
        damage: towerConfig.damage!,
        range: towerConfig.range!,
        attackSpeed: towerConfig.attackSpeed!,
        cost: item.cost,
        upgradeCost: towerConfig.upgradeCost!,
        lastAttackTime: 0
      };

      this.towerManager.addTower(tower);
      this.gameState.gold -= item.cost;
      this.selectedShopItem = undefined;
    }
  }

  private selectTower(position: Position): void {
    const tower = this.towerManager.getTowerAt(position);
    if (tower) {
      this.selectedTowerPosition = position;
      this.selectedShopItem = undefined;
    } else {
      // 타워가 없는 위치를 클릭하면 선택 해제
      this.selectedTowerPosition = undefined;
      this.selectedShopItem = undefined;
    }
  }

  private findNearestTowerPosition(x: number, y: number): Position | null {
    const threshold = 20;
    
    for (const pos of GAME_CONFIG.towerPositions) {
      const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (distance <= threshold) {
        return pos;
      }
    }
    
    return null;
  }

  private handleKeyPress(key: string): void {
    switch (key) {
      case ' ':
        this.gameState.isPaused = !this.gameState.isPaused;
        break;
      case '1':
        this.useSpecialAbility('bomb');
        break;
      case '2':
        this.useSpecialAbility('timeStop');
        break;
      case '3':
        this.useSpecialAbility('heal');
        break;
      case '4':
        this.useSpecialAbility('shield');
        break;
      case 'u':
      case 'U':
        // 선택된 타워 업그레이드
        if (this.selectedTowerPosition) {
          const tower = this.towerManager.getTowerAt(this.selectedTowerPosition);
          if (tower) {
            this.handleTowerUpgrade(tower);
          }
        }
        break;
      case 'Escape':
        this.selectedTowerPosition = undefined;
        this.selectedShopItem = undefined;
        break;
    }
  }

  private useSpecialAbility(ability: SpecialAbility): void {
    if (this.gameState.specialAbilities[ability] <= 0) return;

    switch (ability) {
      case 'bomb':
        this.effectManager.createBomb();
        break;
      case 'timeStop':
        this.gameState.timeStopDuration = 5000; // 5초
        break;
      case 'heal':
        this.gameState.lives = Math.min(this.gameState.lives + 5, GAME_CONFIG.maxLives);
        break;
      case 'shield':
        // 방어막 효과 (적 공격 무효화)
        this.effectManager.createShield();
        break;
    }

    this.gameState.specialAbilities[ability]--;
  }

  private restartGame(): void {
    this.gameState = {
      round: 1,
      lives: GAME_CONFIG.maxLives,
      gold: GAME_CONFIG.startingGold,
      score: 0,
      isPaused: false,
      isGameOver: false,
      isVictory: false,
      roundTimeLeft: GAME_CONFIG.roundTimeLimit,
      timeStopDuration: 0,
      specialAbilities: {
        bomb: 1,
        timeStop: 1,
        heal: 1,
        shield: 1
      }
    };

    this.towerManager.clear();
    this.enemyManager.clear();
    this.waveManager.reset();
    this.effectManager.clear();
    this.selectedTowerPosition = undefined;
    this.selectedShopItem = undefined;
  }

  public start(): void {
    this.startRound();
    this.gameLoop(0);
  }

  private startRound(): void {
    if (this.gameState.isGameOver || this.gameState.isVictory) return;
    
    this.isRoundActive = true;
    this.gameState.roundTimeLeft = GAME_CONFIG.roundTimeLimit;
    
    // 현재 라운드의 웨이브 시작
    if (this.gameState.round <= GAME_CONFIG.totalRounds) {
      const wave = WAVE_CONFIGS[this.gameState.round - 1];
      this.waveManager.startWave(wave, this.enemyManager);
    }
    
    console.log(`Starting round ${this.gameState.round}`);
  }

  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private gameLoop(currentTime: number): void {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    if (!this.gameState.isPaused && !this.gameState.isGameOver && !this.gameState.isVictory) {
      this.update(deltaTime);
    }

    this.render();
    this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  private update(deltaTime: number): void {
    // 시간 정지 처리
    if (this.gameState.timeStopDuration > 0) {
      this.gameState.timeStopDuration -= deltaTime;
      return;
    }

    // 라운드 타이머 업데이트
    if (this.isRoundActive) {
      this.gameState.roundTimeLeft -= deltaTime;
      
      // 60초가 지나면 자동으로 다음 라운드
      if (this.gameState.roundTimeLeft <= 0) {
        this.nextRound();
        return;
      }
    }

    // 웨이브 업데이트
    this.waveManager.update(this.enemyManager);

    // 적 업데이트
    this.enemyManager.update(deltaTime, GAME_CONFIG.pathPoints);

    // 타워 업데이트
    this.towerManager.update(deltaTime, this.enemyManager.getEnemies());

    // 투사체와 적 충돌 처리
    const projectiles = this.towerManager.getProjectiles();
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const projectile = projectiles[i];
      
      // 타겟 ID로 적을 찾기
      const targetEnemy = this.enemyManager.getAllEnemies().find(e => e.id === projectile.targetId);
      
      if (!targetEnemy || targetEnemy.isDead) {
        // 타겟이 없거나 죽었으면 투사체 제거
        this.towerManager.removeProjectile(projectile);
        continue;
      }
      
      // 투사체와 타겟 간의 거리 계산
      const dx = targetEnemy.position.x - projectile.from.x;
      const dy = targetEnemy.position.y - projectile.from.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 30) {
        // 타겟에 충분히 가까우면 충돌 처리
        const isDead = this.enemyManager.damageEnemy(targetEnemy.id, projectile.damage);
        console.log(`Projectile hit enemy ${targetEnemy.type}, damage: ${projectile.damage}, isDead: ${isDead}, health: ${targetEnemy.currentHealth}`);
        
        if (isDead) {
          this.gameState.gold += targetEnemy.reward;
          this.gameState.score += targetEnemy.reward * 10;
        }
        
        // 효과 적용
        const effect = this.createEffect(projectile.element, projectile.damage);
        this.enemyManager.applyEffect(targetEnemy.id, effect);
        
        // 투사체 제거
        this.towerManager.removeProjectile(projectile);
      }
    }

    // 죽은 적 처리 (골드 획득)
    const deadEnemies = this.enemyManager.getAllEnemies().filter(e => e.isDead);
    deadEnemies.forEach(enemy => {
      this.gameState.gold += enemy.reward;
      this.gameState.score += enemy.reward * 10;
    });

    // 효과 업데이트
    this.effectManager.update(deltaTime);

    // 유닛 카운트 40마리 게임오버 확인 (라이프 시스템 제거)
    const currentEnemyCount = this.enemyManager.getEnemyCount();
    if (currentEnemyCount >= GAME_CONFIG.maxEnemyCount) {
      this.gameState.isGameOver = true;
      console.log(`Game Over! Enemy count reached ${currentEnemyCount}`);
      return;
    }

    // 승리 확인
    if (this.gameState.round > GAME_CONFIG.totalRounds && this.enemyManager.getEnemies().length === 0) {
      this.gameState.isVictory = true;
    }

    // 모든 적이 죽으면 자동으로 다음 라운드
    if (this.enemyManager.getEnemies().length === 0 && !this.waveManager.getIsWaveActive() && this.isRoundActive) {
      this.nextRound();
    }
  }

  private nextRound(): void {
    if (this.gameState.isGameOver || this.gameState.isVictory) return;
    
    // 이전 라운드의 적들이 살아있으면 그대로 유지 (쌓이는 시스템)
    this.isRoundActive = false;
    this.gameState.round++;
    
    // 다음 라운드 시작
    if (this.gameState.round <= GAME_CONFIG.totalRounds) {
      this.startRound();
    } else {
      // 모든 라운드 완료
      this.gameState.isVictory = true;
    }
  }

  private createEffect(element: TowerElement, damage: number): Effect {
    switch (element) {
      case 'fire':
        return { type: 'burn', duration: 3000, damage: damage * 0.1 };
      case 'ice':
        return { type: 'freeze', duration: 2000, speedMultiplier: 0.5 };
      case 'poison':
        return { type: 'poison', duration: 5000, damage: damage * 0.05 };
      case 'lightning':
        return { type: 'shock', duration: 1000, damage: damage * 0.2 };
      case 'physical':
        return { type: 'slow', duration: 1500, speedMultiplier: 0.7 };
      default:
        return { type: 'slow', duration: 1000, speedMultiplier: 0.8 };
    }
  }

  private render(): void {
    this.renderer.clear();
    this.renderer.drawBackground();
    this.renderer.drawPath(GAME_CONFIG.pathPoints);
    this.renderer.drawTowerPositions(GAME_CONFIG.towerPositions, this.selectedTowerPosition);
    
    // 타워 렌더링
    this.towerManager.getTowers().forEach(tower => {
      const isSelected = this.selectedTowerPosition && 
        tower.position.x === this.selectedTowerPosition.x && 
        tower.position.y === this.selectedTowerPosition.y;
      this.renderer.drawTower(tower, isSelected);
    });

    // 투사체 렌더링
    this.towerManager.getProjectiles().forEach(projectile => {
      this.renderer.drawProjectile(
        projectile.from,
        projectile.to,
        projectile.element
      );
    });

    // 적 렌더링
    this.enemyManager.getEnemies().forEach(enemy => {
      this.renderer.drawEnemy(enemy);
    });

    // 효과 렌더링
    this.effectManager.render(this.renderer);

    // UI 렌더링
    const uiState = { ...this.gameState, enemyCount: this.enemyManager.getEnemyCount() };
    const selectedTower = this.selectedTowerPosition ? 
      this.towerManager.getTowerAt(this.selectedTowerPosition) : undefined;
    this.renderer.drawUI(uiState, selectedTower);
    this.renderer.drawShop(SHOP_ITEMS, this.selectedShopItem);
  }
}

