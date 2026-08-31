import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCORE_CONFIG } from '../config/gameConfig';
import { createGameTextures } from '../config/textures';
import { SaveLoadManager } from '../objects/InventoryManager';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  preload(): void {
    createGameTextures(this);
  }

  create(): void {
    // 1. Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1e1b4b, 0x1e1b4b, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Subtle stars
    for (let i = 0; i < 35; i++) {
      this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.FloatBetween(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.7)
      );
    }

    // Mountain silhouettes in background
    const mg = this.add.graphics();
    mg.fillStyle(0x13182c, 0.8);
    mg.fillTriangle(0, 480, 180, 290, 360, 480);
    mg.fillTriangle(260, 480, 500, 240, 740, 480);
    mg.fillTriangle(580, 480, 720, 310, 860, 480);

    // 2. Title
    const titleText = this.add.text(GAME_WIDTH / 2, 85, 'SHADOW RUNNER', {
      fontSize: '44px',
      color: '#38bdf8',
      fontStyle: 'bold',
      stroke: '#0369a1',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 4, color: '#000000', blur: 8, stroke: true, fill: true }
    });
    titleText.setOrigin(0.5);

    const subTitle = this.add.text(GAME_WIDTH / 2, 130, 'Action Platformer with RPG Inventory & Weapons', {
      fontSize: '14px',
      color: '#94a3b8',
      letterSpacing: 1
    });
    subTitle.setOrigin(0.5);

    // High Score Badge
    const highScore = this.getHighScore();
    const hsBadge = this.add.text(GAME_WIDTH / 2, 160, `🏆 HIGH SCORE: ${highScore}`, {
      fontSize: '13px',
      color: '#facc15',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      padding: { x: 12, y: 4 },
      fontStyle: 'bold'
    });
    hsBadge.setOrigin(0.5);

    // 3. Play & Continue Buttons
    const hasSave = SaveLoadManager.hasSave();

    if (hasSave) {
      this.createButton(GAME_WIDTH / 2 - 105, 215, 'CONTINUE', 0x16a34a, 0x22c55e, () => {
        this.scene.start('GameScene', { loadSavedGame: true });
      });

      this.createButton(GAME_WIDTH / 2 + 105, 215, 'NEW GAME', 0x0284c7, 0x0ea5e9, () => {
        this.scene.start('GameScene', { loadSavedGame: false });
      });
    } else {
      const playBtn = this.createButton(GAME_WIDTH / 2, 215, 'START NEW GAME', 0x0284c7, 0x0ea5e9, () => {
        this.scene.start('GameScene', { loadSavedGame: false });
      });

      this.tweens.add({
        targets: playBtn,
        scaleX: 1.05,
        scaleY: 1.05,
        yoyo: true,
        repeat: -1,
        duration: 800
      });
    }

    // 4. Controls Card
    const cardBg = this.add.rectangle(GAME_WIDTH / 2, 355, 480, 130, 0x0f172a, 0.85);
    cardBg.setStrokeStyle(1.5, 0x334155);

    this.add.text(GAME_WIDTH / 2, 305, 'CONTROLS GUIDE', {
      fontSize: '12px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const guideItems = [
      'Movement: [A / D] or [← / →]',
      'Jump / Wall Jump: [Space] / [W]',
      'Drop-Through Platform: [S + Space]',
      'Dive Slam / Down-Smash: [Air + S + J]',
      'Wall Slide: Cling to vertical shafts',
      'Open Inventory / Gear: [I]',
      'Quick Potion: [H] | Pause: [ESC]',
      'Breakable Floor: Smash cracked tiles'
    ];

    guideItems.forEach((text, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = col === 0 ? GAME_WIDTH / 2 - 125 : GAME_WIDTH / 2 + 80;
      const y = 328 + row * 20;

      this.add.text(x, y, text, {
        fontSize: '11px',
        color: '#cbd5e1'
      }).setOrigin(0.5);
    });

    // Keyboard ENTER shortcut
    this.input.keyboard?.once('keydown-ENTER', () => {
      this.scene.start('GameScene', { loadSavedGame: hasSave });
    });
  }

  private getHighScore(): number {
    try {
      const saved = localStorage.getItem(SCORE_CONFIG.storageKeyHighScore);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }

  private createButton(
    x: number,
    y: number,
    label: number | string,
    colorNormal: number,
    colorHover: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const btnBg = this.add.rectangle(0, 0, 190, 44, colorNormal);
    btnBg.setStrokeStyle(2, 0xffffff, 0.4);
    btnBg.setInteractive({ useHandCursor: true });

    const btnText = this.add.text(0, 0, label.toString(), {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([btnBg, btnText]);

    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(colorHover);
      btnText.setScale(1.05);
    });

    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(colorNormal);
      btnText.setScale(1.0);
    });

    btnBg.on('pointerdown', onClick);

    return container;
  }
}
