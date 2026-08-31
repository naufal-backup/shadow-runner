import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';

export class ParallaxBackground {
  private scene: Phaser.Scene;
  private bgSky!: Phaser.GameObjects.Graphics;
  private mountainsFar: Phaser.GameObjects.Shape[] = [];
  private mountainsMid: Phaser.GameObjects.Shape[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.init();
  }

  private init(): void {
    // 1. Sky backdrop (fixed to camera viewport)
    this.bgSky = this.scene.add.graphics();
    this.bgSky.setScrollFactor(0);
    this.bgSky.fillGradientStyle(0x050510, 0x050510, 0x120d24, 0x120d24, 1);
    this.bgSky.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.bgSky.setDepth(-100);

    // Subterranean dark vignette when going deep
    const caveGradient = this.scene.add.graphics();
    caveGradient.fillGradientStyle(0x000000, 0x000000, 0x050814, 0x050814, 0.9);
    caveGradient.fillRect(0, 480, GAME_WIDTH * 1000, 1000);
    caveGradient.setDepth(-90);

    // 2. Distant stars / moons
    for (let i = 0; i < 40; i++) {
      const star = this.scene.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT - 120),
        Phaser.Math.FloatBetween(0.8, 1.8),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.7)
      );
      star.setScrollFactor(0);
      star.setDepth(-95);
    }

    // 3. Far Mountains (Parallax 0.15)
    for (let i = 0; i < 18; i++) {
      const mx = i * 220 - 200;
      const mh = Phaser.Math.Between(130, 210);
      const m = this.scene.add.triangle(
        mx,
        380,
        0,
        mh,
        140,
        0,
        280,
        mh,
        0x121324,
        0.85
      );
      m.setScrollFactor(0.12, 1);
      m.setDepth(-80);
      this.mountainsFar.push(m);
    }

    // 4. Mid Hills (Parallax 0.35)
    for (let i = 0; i < 22; i++) {
      const mx = i * 180 - 150;
      const mh = Phaser.Math.Between(80, 140);
      const m = this.scene.add.triangle(
        mx,
        400,
        0,
        mh,
        110,
        0,
        220,
        mh,
        0x1b1e36,
        0.95
      );
      m.setScrollFactor(0.32, 1);
      m.setDepth(-60);
      this.mountainsMid.push(m);
    }
  }
}
