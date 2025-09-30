import type { Position, Tower, Enemy, TowerElement, GameState } from '../types/game';

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas context not available');
    }
    this.ctx = context;
  }

  // 화면 초기화
  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // 배경 그리기
  drawBackground(): void {
    // 그라데이션 배경
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // 경로 그리기
  drawPath(pathPoints: Position[]): void {
    this.ctx.strokeStyle = '#8B4513';
    this.ctx.lineWidth = 40;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.beginPath();
    this.ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
    
    for (let i = 1; i < pathPoints.length; i++) {
      this.ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
    }
    
    this.ctx.stroke();

    // 경로 테두리
    this.ctx.strokeStyle = '#654321';
    this.ctx.lineWidth = 44;
    this.ctx.stroke();
  }

  // 타워 그리기
  drawTower(tower: Tower, isSelected: boolean = false): void {
    const { position, element, level } = tower;
    const { x, y } = position;
    const size = 20 + level * 5;

    // 선택된 타워는 테두리 표시
    if (isSelected) {
      this.ctx.strokeStyle = '#FFFF00';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size/2 + 5, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // 타워 기반
    this.ctx.fillStyle = '#666';
    this.ctx.fillRect(x - size/2, y - size/2, size, size);

    // 타워 색상 (속성별)
    const colors = {
      fire: '#FF4444',
      ice: '#44AAFF',
      poison: '#44FF44',
      lightning: '#FFFF44',
      physical: '#FF8844'
    };

    this.ctx.fillStyle = colors[element];
    this.ctx.fillRect(x - size/2 + 2, y - size/2 + 2, size - 4, size - 4);

    // 레벨 표시
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(level.toString(), x, y + 4);

    // 공격 범위 표시 (선택된 타워만)
    if (isSelected) {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(x, y, tower.range, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  // 적 그리기
  drawEnemy(enemy: Enemy): void {
    const { position, type, currentHealth, maxHealth, size } = enemy;
    const { x, y } = position;
    const healthPercent = currentHealth / maxHealth;

    // 적 몸체
    const colors = {
      basic: '#8B4513',
      fast: '#FFD700',
      tank: '#696969',
      flying: '#87CEEB',
      armored: '#C0C0C0',
      regenerating: '#32CD32',
      splitter: '#FF69B4',
      shielded: '#9370DB',
      teleporter: '#FF1493',
      boss: '#DC143C'
    };

    this.ctx.fillStyle = colors[type] || '#8B4513';
    this.ctx.fillRect(x - size.width/2, y - size.height/2, size.width, size.height);

    // 체력바
    const barWidth = size.width;
    const barHeight = 4;
    const barY = y - size.height/2 - 8;

    // 배경
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(x - barWidth/2, barY, barWidth, barHeight);

    // 체력
    this.ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : healthPercent > 0.25 ? '#FFFF00' : '#FF0000';
    this.ctx.fillRect(x - barWidth/2, barY, barWidth * healthPercent, barHeight);

    // 효과 표시
    this.drawEffects(enemy);
  }

  // 효과 그리기
  drawEffects(enemy: Enemy): void {
    const { position, effects } = enemy;
    const { x, y } = position;
    
    effects.forEach((effect, index) => {
      const offsetY = -20 - index * 15;
      
      switch (effect.type) {
        case 'burn':
          this.ctx.fillStyle = '#FF4444';
          this.ctx.fillText('🔥', x, y + offsetY);
          break;
        case 'freeze':
          this.ctx.fillStyle = '#44AAFF';
          this.ctx.fillText('❄️', x, y + offsetY);
          break;
        case 'poison':
          this.ctx.fillStyle = '#44FF44';
          this.ctx.fillText('☠️', x, y + offsetY);
          break;
        case 'shock':
          this.ctx.fillStyle = '#FFFF44';
          this.ctx.fillText('⚡', x, y + offsetY);
          break;
        case 'slow':
          this.ctx.fillStyle = '#8888FF';
          this.ctx.fillText('🐌', x, y + offsetY);
          break;
      }
    });
  }

  // 투사체 그리기
  drawProjectile(from: Position, to: Position, element: TowerElement): void {
    const colors = {
      fire: '#FF4444',
      ice: '#44AAFF',
      poison: '#44FF44',
      lightning: '#FFFF44',
      physical: '#FF8844'
    };

    // 투사체 궤적 그리기
    this.ctx.strokeStyle = colors[element];
    this.ctx.lineWidth = 4;
    this.ctx.shadowColor = colors[element];
    this.ctx.shadowBlur = 8;
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.stroke();

    // 투사체 머리 부분 그리기
    this.ctx.fillStyle = colors[element];
    this.ctx.shadowBlur = 0;
    this.ctx.beginPath();
    this.ctx.arc(to.x, to.y, 6, 0, Math.PI * 2);
    this.ctx.fill();

    // 투사체 꼬리 효과
    this.ctx.strokeStyle = colors[element];
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 0.6;
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.stroke();
    this.ctx.globalAlpha = 1.0;
  }

  // 폭발 효과 그리기
  drawExplosion(center: Position, radius: number, progress: number): void {
    const alpha = 1 - progress;
    this.ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
    this.ctx.beginPath();
    this.ctx.arc(center.x, center.y, radius * progress, 0, Math.PI * 2);
    this.ctx.fill();
  }

  // 타워 배치 가능 위치 그리기
  drawTowerPositions(positions: Position[], selectedPosition?: Position): void {
    positions.forEach(pos => {
      const isSelected = selectedPosition && pos.x === selectedPosition.x && pos.y === selectedPosition.y;
      
      this.ctx.strokeStyle = isSelected ? '#00FF00' : '#666';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      this.ctx.strokeRect(pos.x - 15, pos.y - 15, 30, 30);
      this.ctx.setLineDash([]);
    });
  }

  // UI 요소 그리기
  drawUI(gameState: GameState, selectedTower?: Tower): void {
    // 상단 HUD
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, 60);

    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'left';
    
    this.ctx.fillText(`Round: ${gameState.round}`, 20, 25);
    this.ctx.fillText(`Gold: ${gameState.gold}`, 20, 45);
    this.ctx.fillText(`Score: ${gameState.score}`, 200, 25);

    // 라운드 타이머
    const timeLeft = Math.ceil(gameState.roundTimeLeft / 1000);
    this.ctx.fillText(`Time: ${timeLeft}s`, 400, 25);
    
    // 현재 적 수
    this.ctx.fillText(`Enemies: ${(gameState as any).enemyCount || 0}`, 400, 45);

    // 특수 능력
    this.ctx.fillText(`Bomb: ${gameState.specialAbilities.bomb}`, 600, 25);
    this.ctx.fillText(`Time Stop: ${gameState.specialAbilities.timeStop}`, 600, 45);
    this.ctx.fillText(`Heal: ${gameState.specialAbilities.heal}`, 800, 25);
    this.ctx.fillText(`Shield: ${gameState.specialAbilities.shield}`, 800, 45);

    // 선택된 타워 정보 및 업그레이드 UI
    if (selectedTower) {
      this.drawTowerUpgradeUI(selectedTower, gameState.gold);
    }
    // 게임 오버/승리 메시지
    if (gameState.isGameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#FF0000';
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
    } else if (gameState.isVictory) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#00FF00';
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('VICTORY!', this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  // 상점 그리기
  drawShop(shopItems: any[], selectedItem?: string): void {
    const shopWidth = 200;
    const shopHeight = this.canvas.height - 60;
    const shopX = this.canvas.width - shopWidth;
    const shopY = 60;

    // 상점 배경
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(shopX, shopY, shopWidth, shopHeight);

    // 상점 제목
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('SHOP', shopX + shopWidth / 2, shopY + 30);

    // 상점 아이템들
    shopItems.forEach((item, index) => {
      const itemY = shopY + 60 + index * 60;
      const isSelected = selectedItem === item.id;

      // 아이템 배경
      this.ctx.fillStyle = isSelected ? '#444' : '#222';
      this.ctx.fillRect(shopX + 10, itemY - 20, shopWidth - 20, 50);

      // 아이템 텍스트
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = '14px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(item.name, shopX + 20, itemY);
      this.ctx.fillText(`$${item.cost}`, shopX + 20, itemY + 20);
    });
  }

  // 타워 업그레이드 UI 그리기
  drawTowerUpgradeUI(tower: Tower, playerGold: number): void {
    const uiX = 20;
    const uiY = 100;
    const uiWidth = 300;
    const uiHeight = 150;

    // UI 배경
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(uiX, uiY, uiWidth, uiHeight);

    // UI 테두리
    this.ctx.strokeStyle = '#FFF';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(uiX, uiY, uiWidth, uiHeight);

    // 타워 정보
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '18px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`${tower.element.toUpperCase()} Tower`, uiX + 10, uiY + 25);
    
    this.ctx.font = '14px Arial';
    this.ctx.fillText(`Level: ${tower.level}`, uiX + 10, uiY + 45);
    this.ctx.fillText(`Damage: ${tower.damage}`, uiX + 10, uiY + 65);
    this.ctx.fillText(`Range: ${tower.range}`, uiX + 10, uiY + 85);
    this.ctx.fillText(`Speed: ${tower.attackSpeed}ms`, uiX + 10, uiY + 105);

    // 업그레이드 버튼
    const canUpgrade = playerGold >= tower.upgradeCost && tower.level < 4;
    this.ctx.fillStyle = canUpgrade ? '#4CAF50' : '#666';
    this.ctx.fillRect(uiX + 10, uiY + 115, 120, 25);
    
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Upgrade ($${tower.upgradeCost})`, uiX + 70, uiY + 130);

    // 업그레이드 안내
    this.ctx.fillStyle = '#FFFF00';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Press U to upgrade', uiX + 140, uiY + 130);
  }
}
