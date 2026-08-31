import Phaser from 'phaser';
import { GAME_WIDTH, PLAYER_CONFIG } from '../config/gameConfig';
import { GameScene } from './GameScene';

export class UIScene extends Phaser.Scene {
  private gameScene!: GameScene;

  private hpBarBg!: Phaser.GameObjects.Rectangle;
  private hpBarFill!: Phaser.GameObjects.Rectangle;
  private hpText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private streakText!: Phaser.GameObjects.Text;
  private weaponIcon!: Phaser.GameObjects.Image;
  private weaponText!: Phaser.GameObjects.Text;
  private coinHudText!: Phaser.GameObjects.Text;
  private potionQuickText!: Phaser.GameObjects.Text;

  // Radar in UI
  private radarContainer!: Phaser.GameObjects.Container;
  private radarGraphics!: Phaser.GameObjects.Graphics;
  private radarWidth = 140;
  private radarHeight = 70;
  private radarRangeX = 1100;
  private radarSpanY = 800;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    this.gameScene = this.scene.get('GameScene') as GameScene;

    // 1. HP HUD
    this.add.text(16, 14, 'HP', {
      fontSize: '13px',
      color: '#e2e8f0',
      fontStyle: 'bold'
    });

    this.hpBarBg = this.add.rectangle(48, 20, 160, 14, 0x000000, 0.85);
    this.hpBarBg.setStrokeStyle(1.5, 0x475569);
    this.hpBarBg.setOrigin(0, 0.5);

    this.hpBarFill = this.add.rectangle(50, 20, 156, 10, 0x22c55e);
    this.hpBarFill.setOrigin(0, 0.5);

    this.hpText = this.add.text(218, 13, `${PLAYER_CONFIG.maxHp}/${PLAYER_CONFIG.maxHp}`, {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 2. Weapon Box
    const weaponBox = this.add.rectangle(16, 40, 192, 28, 0x0f172a, 0.85);
    weaponBox.setStrokeStyle(1, 0x38bdf8).setOrigin(0, 0);

    this.weaponIcon = this.add.image(30, 54, 'icon_sword_iron');

    this.weaponText = this.add.text(48, 46, 'Iron Broadsword (MELEE)', {
      fontSize: '11px',
      color: '#38bdf8',
      fontStyle: 'bold'
    });

    // 3. Gold Coins & Potion Shortcut
    this.add.image(224, 54, 'icon_coin_gold');
    this.coinHudText = this.add.text(236, 48, '0', {
      fontSize: '12px',
      color: '#facc15',
      fontStyle: 'bold'
    });

    this.potionQuickText = this.add.text(285, 48, '[H] Potion: 0', {
      fontSize: '11px',
      color: '#ec4899',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: { x: 5, y: 2 }
    });

    // 4. Score & Highscore
    this.scoreText = this.add.text(GAME_WIDTH - 20, 14, 'SCORE: 0', {
      fontSize: '16px',
      color: '#facc15',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(1, 0);

    this.highScoreText = this.add.text(GAME_WIDTH - 20, 34, 'BEST: 0', {
      fontSize: '12px',
      color: '#a0aec0',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(1, 0);

    // 5. Buttons: INVENTORY [I] & PAUSE [ESC]
    const invBtn = this.add.text(GAME_WIDTH - 120, 56, '🎒 BAG [I]', {
      fontSize: '11px',
      color: '#38bdf8',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      padding: { x: 6, y: 3 }
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    invBtn.on('pointerdown', () => {
      if (this.gameScene && this.gameScene.openInventory) {
        this.gameScene.openInventory();
      }
    });

    const pauseBtn = this.add.text(GAME_WIDTH - 20, 56, '⏸ PAUSE [ESC]', {
      fontSize: '11px',
      color: '#94a3b8',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      padding: { x: 6, y: 3 }
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerdown', () => {
      if (this.gameScene && this.gameScene.pauseGame) {
        this.gameScene.pauseGame();
      }
    });

    // 6. Streak / Multiplier Banner
    this.streakText = this.add.text(GAME_WIDTH / 2, 20, '', {
      fontSize: '13px',
      color: '#ec4899',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      padding: { x: 8, y: 4 },
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);
    this.streakText.setVisible(false);

    // 7. Radar Container
    this.createRadar();
  }

  private createRadar(): void {
    const posX = GAME_WIDTH - 160;
    const posY = 80;

    this.radarContainer = this.add.container(posX, posY);

    const bg = this.add.rectangle(0, 0, this.radarWidth, this.radarHeight, 0x0f172a, 0.85);
    bg.setOrigin(0, 0);
    bg.setStrokeStyle(1.5, 0x38bdf8);

    const title = this.add.text(4, 2, 'RADAR', {
      fontSize: '9px',
      color: '#38bdf8',
      fontStyle: 'bold'
    });

    this.radarGraphics = this.add.graphics();
    this.radarContainer.add([bg, this.radarGraphics, title]);
  }

  update(): void {
    if (!this.gameScene || !this.gameScene.scene.isActive()) return;

    const player = this.gameScene.getPlayer();
    const inventory = this.gameScene.getInventoryManager();
    const scoreManager = this.gameScene.getScoreManager();
    const levelGen = this.gameScene.getLevelGen();
    const enemies = this.gameScene.getEnemies();

    if (!player || !inventory || !scoreManager) return;

    // 1. HP updates
    const hp = player.getHp();
    const maxHp = player.getMaxHp();
    const ratio = Math.max(0, hp / maxHp);

    this.hpBarFill.setScale(ratio, 1);
    if (ratio > 0.5) {
      this.hpBarFill.setFillStyle(0x22c55e);
    } else if (ratio > 0.25) {
      this.hpBarFill.setFillStyle(0xf59e0b);
    } else {
      this.hpBarFill.setFillStyle(0xef4444);
    }
    this.hpText.setText(`${hp}/${maxHp}`);

    // 2. Equipment & Coins
    const eq = inventory.getEquipment();
    if (eq && eq.weapon) {
      this.weaponIcon.setTexture(eq.weapon.textureKey);
      this.weaponText.setText(`${eq.weapon.name} (${eq.weapon.attackMode?.toUpperCase()})`);
    }
    this.coinHudText.setText(`${inventory.getCoins()}`);

    const potionSlot = inventory.getSlots().find((s) => s.item.id === 'potion_hp');
    const potionQty = potionSlot ? potionSlot.quantity : 0;
    this.potionQuickText.setText(`[H] Potion: ${potionQty}`);

    // 3. Score state
    const state = scoreManager.getState();
    this.scoreText.setText(`SCORE: ${state.currentScore}`);
    this.highScoreText.setText(`BEST: ${state.highScore} | ${state.distanceMeters}m | Kills: ${state.kills}`);

    // 4. Streak
    if (state.killStreak > 1) {
      this.streakText.setText(`🔥 ${state.killStreak}x STREAK (${state.multiplier}x PTS)`);
      this.streakText.setVisible(true);
    } else {
      this.streakText.setVisible(false);
    }

    // 5. Update Radar
    if (this.radarGraphics && levelGen) {
      this.radarGraphics.clear();

      const pX = player.x;
      const pY = player.y;
      const leftX = pX - this.radarRangeX / 2;
      const rightX = pX + this.radarRangeX / 2;
      const topY = pY - this.radarSpanY / 2;

      const toMapX = (wx: number) => ((wx - leftX) / this.radarRangeX) * this.radarWidth;
      const toMapY = (wy: number) => ((wy - topY) / this.radarSpanY) * (this.radarHeight - 16) + 14;

      // Grounds & Platforms
      this.radarGraphics.fillStyle(0x22c55e, 0.9);
      for (const [, chunk] of levelGen.getActiveChunks().entries()) {
        chunk.groundObjects.forEach((obj) => {
          if (!obj.active) return;
          const body = obj.body as Phaser.Physics.Arcade.StaticBody | Phaser.Physics.Arcade.Body;
          if (!body) return;
          const bx = body.x;
          const by = body.y;
          const bw = body.width;
          const bh = body.height;

          if (bx + bw < leftX || bx > rightX) return;

          const mx = Math.max(0, toMapX(bx));
          const my = Math.max(14, toMapY(by));
          const mw = (bw / this.radarRangeX) * this.radarWidth;
          const mh = Math.max(2, (bh / this.radarSpanY) * (this.radarHeight - 16));

          this.radarGraphics.fillRect(mx, my, Math.min(mw, this.radarWidth - mx), mh);
        });

        // Hazards
        chunk.hazards.forEach((hazard) => {
          if (!hazard.active) return;
          const hx = (hazard as unknown as { x: number; y: number }).x;
          const hy = (hazard as unknown as { x: number; y: number }).y;
          if (hx >= leftX && hx <= rightX) {
            this.radarGraphics.fillStyle(0xef4444, 1.0);
            this.radarGraphics.fillRect(toMapX(hx) - 1.5, toMapY(hy) - 1.5, 3, 3);
          }
        });
      }

      // Enemies
      enemies.forEach((enemy) => {
        if (!enemy.active || enemy.getIsDead()) return;
        if (enemy.x >= leftX && enemy.x <= rightX) {
          this.radarGraphics.fillStyle(0xf59e0b, 1.0);
          this.radarGraphics.fillCircle(toMapX(enemy.x), toMapY(enemy.y), 2.5);
        }
      });

      // Player Blip
      this.radarGraphics.fillStyle(0x00f2fe, 1.0);
      this.radarGraphics.fillCircle(toMapX(pX), toMapY(pY), 3);
      this.radarGraphics.lineStyle(1, 0xffffff, 0.7);
      this.radarGraphics.strokeCircle(toMapX(pX), toMapY(pY), 4.5);
    }
  }
}
