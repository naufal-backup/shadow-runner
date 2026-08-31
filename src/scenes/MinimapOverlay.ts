import Phaser from 'phaser';
import { GAME_WIDTH } from '../config/gameConfig';
import { Player } from '../objects/Player';
import { BaseEnemy } from '../objects/BaseEnemy';
import { LevelGenerator } from './LevelGenerator';

export class MinimapOverlay {
  private scene: Phaser.Scene;
  private player: Player;
  private levelGen: LevelGenerator;
  private getEnemies: () => BaseEnemy[];

  private mapContainer!: Phaser.GameObjects.Container;
  private mapGraphics!: Phaser.GameObjects.Graphics;

  private mapWidth = 150;
  private mapHeight = 85;
  private posX = GAME_WIDTH - 165;
  private posY = 80;

  // Dynamic vertical tracking on minimap
  private rangeX = 1100;
  private viewSpanY = 800;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    levelGen: LevelGenerator,
    getEnemies: () => BaseEnemy[]
  ) {
    this.scene = scene;
    this.player = player;
    this.levelGen = levelGen;
    this.getEnemies = getEnemies;

    this.init();
  }

  private init(): void {
    this.mapContainer = this.scene.add.container(this.posX, this.posY);
    this.mapContainer.setScrollFactor(0);
    this.mapContainer.setDepth(150);

    // Frame backdrop
    const bg = this.scene.add.rectangle(0, 0, this.mapWidth, this.mapHeight, 0x0f172a, 0.85);
    bg.setOrigin(0, 0);
    bg.setStrokeStyle(1.5, 0x38bdf8);

    const title = this.scene.add.text(4, 2, 'RADAR', {
      fontSize: '9px',
      color: '#38bdf8',
      fontStyle: 'bold'
    });

    this.mapGraphics = this.scene.add.graphics();

    this.mapContainer.add([bg, this.mapGraphics, title]);
  }

  public update(): void {
    if (!this.mapGraphics || !this.player) return;

    this.mapGraphics.clear();

    const pX = this.player.x;
    const pY = this.player.y;
    const leftX = pX - this.rangeX / 2;
    const rightX = pX + this.rangeX / 2;
    const topY = pY - this.viewSpanY / 2;
    const spanY = this.viewSpanY;

    // Helper conversion from world coords to minimap coords
    const toMapX = (wx: number) => {
      return ((wx - leftX) / this.rangeX) * this.mapWidth;
    };
    const toMapY = (wy: number) => {
      return ((wy - topY) / spanY) * (this.mapHeight - 16) + 14;
    };

    // 1. Draw Active Platforms & Grounds
    this.mapGraphics.fillStyle(0x22c55e, 0.9);
    for (const [, chunk] of this.levelGen.getActiveChunks().entries()) {
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
        const mw = (bw / this.rangeX) * this.mapWidth;
        const mh = Math.max(2, (bh / spanY) * (this.mapHeight - 16));

        this.mapGraphics.fillRect(mx, my, Math.min(mw, this.mapWidth - mx), mh);
      });

      // Draw hazards in red/orange
      chunk.hazards.forEach((hazard) => {
        if (!hazard.active) return;
        const hx = (hazard as unknown as { x: number; y: number }).x;
        const hy = (hazard as unknown as { x: number; y: number }).y;
        if (hx >= leftX && hx <= rightX) {
          const mx = toMapX(hx);
          const my = toMapY(hy);
          this.mapGraphics.fillStyle(0xef4444, 1.0);
          this.mapGraphics.fillRect(mx - 1.5, my - 1.5, 3, 3);
        }
      });
    }

    // 2. Draw Enemies (Yellow / Red dots)
    const enemies = this.getEnemies();
    enemies.forEach((enemy) => {
      if (!enemy.active || enemy.getIsDead()) return;
      if (enemy.x >= leftX && enemy.x <= rightX) {
        const mx = toMapX(enemy.x);
        const my = toMapY(enemy.y);
        this.mapGraphics.fillStyle(0xf59e0b, 1.0);
        this.mapGraphics.fillCircle(mx, my, 2.5);
      }
    });

    // 3. Draw Player (Cyan Blip with pulse ring)
    const pmx = toMapX(pX);
    const pmy = toMapY(this.player.y);

    this.mapGraphics.fillStyle(0x00f2fe, 1.0);
    this.mapGraphics.fillCircle(pmx, pmy, 3);

    this.mapGraphics.lineStyle(1, 0xffffff, 0.7);
    this.mapGraphics.strokeCircle(pmx, pmy, 4.5);
  }
}
