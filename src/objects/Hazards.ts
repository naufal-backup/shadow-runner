import Phaser from 'phaser';
import { LEVEL_CONFIG } from '../config/gameConfig';

export class StaticHazard extends Phaser.Physics.Arcade.Sprite {
  private damage: number;

  constructor(scene: Phaser.Scene, x: number, y: number, texture = 'hazard_spikes') {
    super(scene, x, y, texture);

    this.damage = LEVEL_CONFIG.hazardDamage.spikes;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body

    if (this.body) {
      // Shave collision box for fair forgiving hitbox
      this.body.setSize(26, 16);
      this.body.setOffset(3, 8);
    }
  }

  public getDamage(): number {
    return this.damage;
  }
}

export class MovingSawHazard extends Phaser.Physics.Arcade.Sprite {
  private damage: number;
  private startY: number;
  private moveRangeY: number;
  private moveSpeedY: number;
  private direction = 1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    rangeY: number = 80,
    speedY: number = 90
  ) {
    super(scene, x, y, 'hazard_saw');

    this.damage = LEVEL_CONFIG.hazardDamage.saw;
    this.startY = y;
    this.moveRangeY = rangeY;
    this.moveSpeedY = speedY;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = false;
    body.setCircle(8, 8, 8); // Pangkas radius lingkaran ke 8px (diameter 16px) terpusat
    this.setVelocityY(this.moveSpeedY * this.direction);
  }

  public getDamage(): number {
    return this.damage;
  }

  updateHazard(_delta: number): void {
    if (!this.active) return;

    // Spin animation
    this.rotation += 0.15;

    // Patrol up and down
    if (this.y > this.startY + this.moveRangeY) {
      this.direction = -1;
      this.setVelocityY(this.moveSpeedY * this.direction);
    } else if (this.y < this.startY - this.moveRangeY) {
      this.direction = 1;
      this.setVelocityY(this.moveSpeedY * this.direction);
    }
  }
}
