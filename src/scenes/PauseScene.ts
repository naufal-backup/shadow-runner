import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';
import { GameScene } from './GameScene';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create(): void {
    // 1. Semi-transparent backdrop
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x000000,
      0.65
    );
    overlay.setInteractive(); // Block clicks to gameplay underneath

    // 2. Pause Card Panel
    const panel = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      300,
      310,
      0x0f172a,
      0.95
    );
    panel.setStrokeStyle(2, 0x38bdf8);

    // Title
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 120, 'GAME PAUSED', {
      fontSize: '22px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 3. Action Buttons
    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 65, 'RESUME', 0x0284c7, 0x0ea5e9, () => {
      this.resumeGame();
    });

    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 18, 'SAVE PROGRESS', 0x16a34a, 0x22c55e, () => {
      this.saveGameProgress();
    });

    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, 'RESTART LEVEL', 0xd97706, 0xf59e0b, () => {
      this.restartGame();
    });

    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 78, 'MAIN MENU', 0xdc2626, 0xef4444, () => {
      this.goToMainMenu();
    });

    // ESC key toggles resume
    this.input.keyboard?.on('keydown-ESC', () => {
      this.resumeGame();
    });
  }

  private saveGameProgress(): void {
    const gameScene = this.scene.get('GameScene') as GameScene;
    if (gameScene && gameScene.saveCurrentState) {
      gameScene.saveCurrentState();

      const toast = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 122, '✔ PROGRESS SAVED!', {
        fontSize: '12px',
        color: '#22c55e',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: toast,
        alpha: 0,
        delay: 800,
        duration: 400,
        onComplete: () => toast.destroy()
      });
    }
  }

  private resumeGame(): void {
    this.scene.stop();
    this.scene.resume('GameScene');
    this.scene.resume('UIScene');
  }

  private restartGame(): void {
    this.scene.stop();
    this.scene.stop('UIScene');
    this.scene.stop('GameScene');
    this.scene.start('GameScene', { loadSavedGame: false });
  }

  private goToMainMenu(): void {
    this.scene.stop();
    this.scene.stop('UIScene');
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

    const btnBg = this.add.rectangle(0, 0, 190, 34, colorNormal);
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

