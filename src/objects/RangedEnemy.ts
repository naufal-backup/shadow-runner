import Phaser from 'phaser';
import { BaseEnemy } from './BaseEnemy';
import { Player } from './Player';
import { ENEMY_CONFIG } from '../config/gameConfig';

export class RangedEnemy extends BaseEnemy {
  private shootCooldown = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(
      scene,
      x,
      y,
      'enemy_ranged_sheet',
      ENEMY_CONFIG.ranged.hp,
      ENEMY_CONFIG.ranged.speed,
      ENEMY_CONFIG.ranged.width,
      ENEMY_CONFIG.ranged.height
    );

    this.initAnimations();
  }

  private initAnimations(): void {
    const anims = this.scene.anims;
    const keys = ['ranged_idle', 'ranged_run', 'ranged_shoot', 'ranged_hit', 'ranged_death'];
    keys.forEach((k) => {
      if (anims.exists(k)) anims.remove(k);
    });

    anims.create({
      key: 'ranged_idle',
      frames: [{ key: 'enemy_ranged_sheet', frame: 0 }],
      frameRate: 1
    });
    anims.create({
      key: 'ranged_run',
      frames: anims.generateFrameNumbers('enemy_ranged_sheet', { start: 1, end: 4 }),
      frameRate: 7,
      repeat: -1
    });
    anims.create({
      key: 'ranged_shoot',
      frames: [{ key: 'enemy_ranged_sheet', frame: 5 }],
      frameRate: 1
    });
    anims.create({
      key: 'ranged_hit',
      frames: [{ key: 'enemy_ranged_sheet', frame: 6 }],
      frameRate: 1
    });
    anims.create({
      key: 'ranged_death',
      frames: [{ key: 'enemy_ranged_sheet', frame: 7 }],
      frameRate: 1
    });
  }

  protected playHitAnimation(): void {
    this.anims.play('ranged_hit', true);
  }

  protected playDeathAnimation(): void {
    this.anims.play('ranged_death', true);
  }

  updateEnemy(delta: number, player: Player): void {
    if (this.isDead) return;

    this.updateHealthBar();

    if (this.shootCooldown > 0) this.shootCooldown -= delta;

    // Handle Hit state
    if (this.enemyState === 'hit') {
      this.hitTimer -= delta;
      if (this.hitTimer <= 0) {
        this.enemyState = 'idle';
      }
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const dx = player.x - this.x;
    const dir = dx > 0 ? 1 : -1;

    // Handle Windup / Shooting state
    if (this.enemyState === 'windup') {
      this.stateTimer -= delta;
      this.setVelocityX(0);
      if (this.stateTimer <= 0) {
        // Fire projectile
        this.enemyState = 'attack';
        this.stateTimer = 250;
        this.emit('ranged_shoot', {
          x: this.x + (this.flipX ? -20 : 20),
          y: this.y - 4,
          dirX: this.flipX ? -1 : 1,
          speed: ENEMY_CONFIG.ranged.projectileSpeed,
          damage: ENEMY_CONFIG.ranged.projectileDamage
        });
      }
      return;
    }

    if (this.enemyState === 'attack') {
      this.stateTimer -= delta;
      this.setVelocityX(0);
      if (this.stateTimer <= 0) {
        this.enemyState = 'idle';
        this.shootCooldown = ENEMY_CONFIG.ranged.shootCooldownMs;
      }
      return;
    }

    // AI positioning & attack logic
    if (dist <= ENEMY_CONFIG.ranged.detectRange) {
      this.setFlipX(dir < 0);

      const absDx = Math.abs(dx);

      if (this.shootCooldown <= 0) {
        // Ready to shoot: trigger windup and charge
        this.enemyState = 'windup';
        this.stateTimer = ENEMY_CONFIG.ranged.shootWindupMs;
        this.setVelocityX(0);
        this.anims.play('ranged_shoot', true);
      } else if (absDx < ENEMY_CONFIG.ranged.idealDistanceMin) {
        // Too close: back off
        this.enemyState = 'chase';
        this.setVelocityX(-dir * this.moveSpeed);
        this.anims.play('ranged_run', true);
      } else if (absDx > ENEMY_CONFIG.ranged.idealDistanceMax) {
        // Too far: advance closer
        this.enemyState = 'chase';
        this.setVelocityX(dir * this.moveSpeed);
        this.anims.play('ranged_run', true);
      } else {
        // In range waiting for cooldown
        this.enemyState = 'idle';
        this.setVelocityX(0);
        this.anims.play('ranged_idle', true);
      }
    } else {
      this.enemyState = 'idle';
      this.setVelocityX(0);
      this.anims.play('ranged_idle', true);
    }
  }
}
