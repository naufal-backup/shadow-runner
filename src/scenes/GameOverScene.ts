import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';
import type { ScoreState } from '../objects/ScoreManager';

export interface GameOverData {
  reason: string;
  stats: ScoreState;
}

export class GameOverScene extends Phaser.Scene {
  private dataPayload!: GameOverData;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameOverData): void {
    this.dataPayload = data;
  }

  create(): void {
    // 1. Dark overlay
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x000000,
      0.8
    );
    overlay.setInteractive();

    // 2. Main Game Over Card
    const panel = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      380,
      320,
      0x0f172a,
      0.95
    );
    panel.setStrokeStyle(2, 0xef4444);

    // 3. Title & Cause
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 125, 'GAME OVER', {
      fontSize: '28px',
      color: '#ef4444',
      fontStyle: 'bold',
      stroke: '#7f1d1d',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 90, `☠️ ${this.dataPayload.reason}`, {
      fontSize: '14px',
      color: '#f87171'
    }).setOrigin(0.5);

    // High Score Callout
    if (this.dataPayload.stats.isNewHighScore) {
      const newRecordBadge = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 65, '🌟 NEW HIGH SCORE! 🌟', {
        fontSize: '13px',
        color: '#facc15',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: newRecordBadge,
        scaleX: 1.1,
        scaleY: 1.1,
        yoyo: true,
        repeat: -1,
        duration: 500
      });
    }

    // 4. Stats Summary Grid
    const statBox = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 320, 80, 0x1e293b, 0.7);
    statBox.setStrokeStyle(1, 0x334155);

    const stats = this.dataPayload.stats;
    const statLabels = [
      `Score: ${stats.currentScore}`,
      `Distance: ${stats.distanceMeters}m`,
      `Enemies Slain: ${stats.kills}`,
      `Best Score: ${stats.highScore}`
    ];

    statLabels.forEach((label, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = col === 0 ? GAME_WIDTH / 2 - 80 : GAME_WIDTH / 2 + 70;
      const y = GAME_HEIGHT / 2 - 20 + row * 36;

      this.add.text(x, y, label, {
        fontSize: '13px',
        color: '#e2e8f0',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    });

    // 5. Buttons
    this.createButton(GAME_WIDTH / 2 - 80, GAME_HEIGHT / 2 + 95, 'RETRY', 0x0284c7, 0x0ea5e9, () => {
      this.retryGame();
    });

    this.createButton(GAME_WIDTH / 2 + 80, GAME_HEIGHT / 2 + 95, 'MAIN MENU', 0x475569, 0x64748b, () => {
      this.goToMainMenu();
    });

    // Shortcuts
    this.input.keyboard?.once('keydown-SPACE', () => this.retryGame());
    this.input.keyboard?.once('keydown-ENTER', () => this.retryGame());
  }

  private retryGame(): void {
    this.scene.stop('InventoryScene');
    this.scene.stop('UIScene');
    this.scene.stop('GameOverScene');
    this.scene.stop('GameScene');
    this.scene.start('GameScene');
  }

  private goToMainMenu(): void {
    this.scene.stop('InventoryScene');
    this.scene.stop('UIScene');
    this.scene.stop('GameOverScene');
    this.scene.stop('GameScene');
    this.scene.start('MenuScene');
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    colorNormal: number,
    colorHover: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const btnBg = this.add.rectangle(0, 0, 130, 38, colorNormal);
    btnBg.setStrokeStyle(1.5, 0xffffff, 0.3);
    btnBg.setInteractive({ useHandCursor: true });

    const btnText = this.add.text(0, 0, label, {
      fontSize: '13px',
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
