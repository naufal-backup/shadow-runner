import Phaser from 'phaser';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  private damage: number;
  private lifetimeMs = 3500;

  constructor(scene: Phaser.Scene, x: number, y: number, vx: number, damage: number) {
    super(scene, x, y, 'projectile_orb');

    this.damage = damage;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = false;
    body.setCircle(6, 2, 2);

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
