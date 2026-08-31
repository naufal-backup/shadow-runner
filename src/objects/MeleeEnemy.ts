import Phaser from 'phaser';
import { BaseEnemy } from './BaseEnemy';
import { Player } from './Player';
import { ENEMY_CONFIG } from '../config/gameConfig';

export class MeleeEnemy extends BaseEnemy {
  private attackCooldown = 0;
  private attackDamage = ENEMY_CONFIG.melee.damage;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(
      scene,
      x,
      y,
      'enemy_melee_sheet',
      ENEMY_CONFIG.melee.hp,
      ENEMY_CONFIG.melee.speed,
      ENEMY_CONFIG.melee.width,
      ENEMY_CONFIG.melee.height
    );

    this.initAnimations();
  }

  private initAnimations(): void {
    const anims = this.scene.anims;
    const keys = ['melee_idle', 'melee_run', 'melee_attack', 'melee_hit', 'melee_death'];
    keys.forEach((k) => {
      if (anims.exists(k)) anims.remove(k);
    });

    anims.create({
      key: 'melee_idle',
      frames: [{ key: 'enemy_melee_sheet', frame: 0 }],
      frameRate: 1
    });
    anims.create({
      key: 'melee_run',
      frames: anims.generateFrameNumbers('enemy_melee_sheet', { start: 1, end: 4 }),
      frameRate: 8,
      repeat: -1
    });
    anims.create({
      key: 'melee_attack',
      frames: [{ key: 'enemy_melee_sheet', frame: 5 }],
      frameRate: 1
    });
    anims.create({
      key: 'melee_hit',
      frames: [{ key: 'enemy_melee_sheet', frame: 6 }],
      frameRate: 1
    });
    anims.create({
      key: 'melee_death',
      frames: [{ key: 'enemy_melee_sheet', frame: 7 }],
      frameRate: 1
    });
  }

  public getDamage(): number {
    return this.attackDamage;
  }

  protected playHitAnimation(): void {
    this.anims.play('melee_hit', true);
  }

  protected playDeathAnimation(): void {
    this.anims.play('melee_death', true);
  }

  updateEnemy(delta: number, player: Player): void {
    if (this.isDead) return;

    this.updateHealthBar();

    if (this.attackCooldown > 0) this.attackCooldown -= delta;

    // Handle Hit stun
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

    // Handle Windup/Attack state
    if (this.enemyState === 'windup') {
      this.stateTimer -= delta;
      this.setVelocityX(0);
      if (this.stateTimer <= 0) {
        // Execute attack punch
        this.enemyState = 'attack';
        this.stateTimer = ENEMY_CONFIG.melee.attackDurationMs;
        this.anims.play('melee_attack', true);
        this.emit('melee_strike', {
          x: this.x + (this.flipX ? -20 : 20),
          y: this.y,
          damage: this.attackDamage,
          enemy: this
        });
      }
      return;
    }

    if (this.enemyState === 'attack') {
      this.stateTimer -= delta;
      this.setVelocityX(0);
      if (this.stateTimer <= 0) {
        this.enemyState = 'idle';
        this.attackCooldown = ENEMY_CONFIG.melee.attackCooldownMs;
      }
      return;
    }

    // AI Decision: Chase or Attack
    if (dist <= ENEMY_CONFIG.melee.detectRange) {
      this.setFlipX(dir < 0);

      if (Math.abs(dx) <= ENEMY_CONFIG.melee.attackRange && this.attackCooldown <= 0) {
        // Start attack windup
        this.enemyState = 'windup';
        this.stateTimer = ENEMY_CONFIG.melee.attackWindupMs;
        this.setVelocityX(0);
        this.anims.play('melee_idle', true);
      } else {
        // Chase
        this.enemyState = 'chase';
        this.setVelocityX(dir * this.moveSpeed);
        this.anims.play('melee_run', true);
      }
    } else {
      // Idle
      this.enemyState = 'idle';
      this.setVelocityX(0);
      this.anims.play('melee_idle', true);
    }
  }
}
