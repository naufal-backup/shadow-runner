import Phaser from 'phaser';
import { Player } from './Player';

export type EnemyState = 'idle' | 'chase' | 'windup' | 'attack' | 'hit' | 'death';

export abstract class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
  protected maxHp: number;
  protected currentHp: number;
  protected moveSpeed: number;
  protected enemyState: EnemyState = 'idle';

  protected stateTimer: number = 0;
  protected hitTimer: number = 0;
  protected hitFlashTimeMs = 150;
  protected isDead = false;

  private healthBarBg!: Phaser.GameObjects.Rectangle;
  private healthBarFill!: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    hp: number,
    speed: number,
    boxWidth: number,
    boxHeight: number
  ) {
    super(scene, x, y, texture, 0);

    this.maxHp = hp;
    this.currentHp = hp;
    this.moveSpeed = speed;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body!.setSize(boxWidth, boxHeight);
    this.body!.setOffset((32 - boxWidth) / 2, 48 - boxHeight);
    this.setCollideWorldBounds(true);

    this.initHealthBar();
  }

  private initHealthBar(): void {
    this.healthBarBg = this.scene.add.rectangle(this.x, this.y - 30, 32, 5, 0x000000, 0.75);
    this.healthBarFill = this.scene.add.rectangle(this.x - 15, this.y - 30, 30, 3, 0xe74c3c);
    this.healthBarFill.setOrigin(0, 0.5);
  }

  protected updateHealthBar(): void {
    if (this.healthBarBg && this.healthBarFill) {
      this.healthBarBg.setPosition(this.x, this.y - 28);
      this.healthBarFill.setPosition(this.x - 15, this.y - 28);
      const ratio = Math.max(0, this.currentHp / this.maxHp);
      this.healthBarFill.setScale(ratio, 1);
    }
  }

  public takeDamage(damage: number, knockbackDir: number): boolean {
    if (this.isDead) return false;

    this.currentHp = Math.max(0, this.currentHp - damage);
    this.updateHealthBar();

    // Damage floating text
    const dmgText = this.scene.add.text(this.x, this.y - 20, `-${damage}`, {
      fontSize: '14px',
      color: '#ffdd57',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.scene.tweens.add({
      targets: dmgText,
      y: dmgText.y - 25,
      alpha: 0,
      duration: 600,
      onComplete: () => dmgText.destroy()
    });

    if (this.currentHp <= 0) {
      this.die();
      return true;
    }

    // Hit state & Knockback
    this.enemyState = 'hit';
    this.hitTimer = this.hitFlashTimeMs;
    this.setVelocityX(knockbackDir * 120);
    this.setVelocityY(-100);
    this.playHitAnimation();

    return false;
  }

  protected die(): void {
    this.isDead = true;
    this.enemyState = 'death';
    this.setVelocity(0, 0);
    (this.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    this.body!.checkCollision.none = true;

    if (this.healthBarBg) this.healthBarBg.destroy();
    if (this.healthBarFill) this.healthBarFill.destroy();

    this.playDeathAnimation();

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 500,
      delay: 200,
      onComplete: () => {
        this.emit('enemy_destroyed', this);
        this.destroy();
      }
    });
  }

  public getIsDead(): boolean {
    return this.isDead;
  }

  public getCurrentState(): EnemyState {
    return this.enemyState;
  }

  public getDamage(): number {
    return 10;
  }

  abstract updateEnemy(delta: number, player: Player): void;
  protected abstract playHitAnimation(): void;
  protected abstract playDeathAnimation(): void;

  destroy(fromScene?: boolean): void {
    if (this.healthBarBg && this.healthBarBg.active) this.healthBarBg.destroy();
    if (this.healthBarFill && this.healthBarFill.active) this.healthBarFill.destroy();
    super.destroy(fromScene);
  }
}
