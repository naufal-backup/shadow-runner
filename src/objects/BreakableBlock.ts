import Phaser from 'phaser';

export class BreakableBlock extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'tile_breakable');

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static Physics Body
    this.setSize(32, 32);
  }

  public breakBlock(): void {
    if (!this.active) return;

    // Camera shake & sound feedback
    this.scene.cameras.main.shake(160, 0.012);

    // Spawn debris particles
    for (let i = 0; i < 6; i++) {
      const debris = this.scene.add.rectangle(
        this.x + Phaser.Math.Between(-10, 10),
        this.y + Phaser.Math.Between(-10, 10),
        Phaser.Math.Between(5, 8),
        Phaser.Math.Between(5, 8),
        0x92400e
      );
      debris.setDepth(15);
      this.scene.physics.add.existing(debris);
      const db = debris.body as Phaser.Physics.Arcade.Body;
      db.setVelocity(
        Phaser.Math.Between(-140, 140),
        Phaser.Math.Between(-260, -60)
      );

      this.scene.tweens.add({
        targets: debris,
        alpha: 0,
        scale: 0.2,
        duration: 450,
        onComplete: () => debris.destroy()
      });
    }

    this.destroy();
  }
}
