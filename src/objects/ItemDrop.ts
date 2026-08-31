import Phaser from 'phaser';
import type { ItemDef } from '../config/itemConfig';

export class ItemDrop extends Phaser.Physics.Arcade.Sprite {
  private itemDef: ItemDef;
  private quantity: number;
  private glowFx!: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number, item: ItemDef, quantity = 1) {
    super(scene, x, y, item.textureKey);

    this.itemDef = item;
    this.quantity = quantity;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setBounce(0.35, 0.2);
    this.setCollideWorldBounds(true);
    this.setDragX(140);
    this.setVelocityY(-180);
    this.setVelocityX(Phaser.Math.Between(-50, 50));

    // Glow aura
    const color = item.type === 'weapon' ? 0x38bdf8 : item.type === 'armor' ? 0xa855f7 : item.type === 'consumable' ? 0x22c55e : 0xfacc15;
    this.glowFx = scene.add.circle(x, y, 14, color, 0.35);
    this.glowFx.setDepth(this.depth - 1);

    scene.tweens.add({
      targets: this.glowFx,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0.15,
      yoyo: true,
      repeat: -1,
      duration: 600
    });
  }

  public getItem(): ItemDef {
    return this.itemDef;
  }

  public getQuantity(): number {
    return this.quantity;
  }

  updateDrop(): void {
    if (!this.active) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      if (body.blocked.down || body.touching.down) {
        body.setVelocityX(body.velocity.x * 0.85);
        if (Math.abs(body.velocity.x) < 4) {
          body.setVelocityX(0);
        }
      }
    }
    if (this.glowFx) {
      this.glowFx.setPosition(this.x, this.y);
    }
  }

  destroy(fromScene?: boolean): void {
    if (this.glowFx && this.glowFx.active) {
      this.glowFx.destroy();
    }
    super.destroy(fromScene);
  }
}
