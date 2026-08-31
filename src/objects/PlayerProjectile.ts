import Phaser from 'phaser';

export class PlayerProjectile extends Phaser.Physics.Arcade.Sprite {
  private damage: number;
  private lifetimeMs = 2500;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    vx: number,
    damage: number,
    texture: string = 'proj_arrow'
  ) {
    super(scene, x, y, texture);

    this.damage = damage;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = false;

    if (texture === 'proj_arrow') {
      body.setSize(14, 6);
      this.setFlipX(vx < 0);
    } else {
      body.setCircle(7, 1, 1);
    }

    this.setVelocityX(vx);
  }

  public getDamage(): number {
    return this.damage;
  }

  updateProjectile(delta: number): void {
    this.lifetimeMs -= delta;
    if (this.lifetimeMs <= 0) {
      this.destroy();
    }
  }
}
