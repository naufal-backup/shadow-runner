import Phaser from 'phaser';
import { PLAYER_CONFIG } from '../config/gameConfig';
import { type ItemDef, ITEM_DATABASE } from '../config/itemConfig';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private currentHp: number = PLAYER_CONFIG.maxHp;
  private maxHp: number = PLAYER_CONFIG.maxHp;

  // Equipment stats
  private equippedWeapon: ItemDef = ITEM_DATABASE['fist_bare'];
  private equippedArmor: ItemDef | null = null;

  // Traversal & Jump Mechanics
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private isJumpHolding = false;
  private isDroppingThrough = false;
  private isWallSliding = false;
  private isDownSmashing = false;
  private wallJumpTimer = 0;

  // Dodge
  private isDodging = false;
  private dodgeTimer = 0;
  private dodgeCooldownTimer = 0;
  private dodgeDirection = 1;

  // Attack & Combat
  private isAttacking = false;
  private attackTimer = 0;
  private attackCooldownTimer = 0;
  private comboCount = 0;
  private comboTimer = 0;

  // Invulnerability
  private invulnerable = false;
  private invulnerableTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_idle', 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Release attack lock when animation finishes (not timer-based)
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim: Phaser.Animations.Animation) => {
      if (anim.key === 'player_atk_1' || anim.key === 'player_atk_2' || anim.key === 'player_atk_3') {
        this.isAttacking = false;
      }
    });

    // Scale down 256x256 sprite to fit game world (1:1 aspect ratio)
    this.setDisplaySize(96, 96);

    // Hitbox strictly covering character body within 256x256 source frame (X=95..145, Y=35..241)
    this.body!.setSize(50, 206);
    this.body!.setOffset(98, 35);

    this.setCollideWorldBounds(true);
    this.initAnimations();
  }

  private initAnimations(): void {
    const anims = this.scene.anims;

    const keys = [
      'player_idle',
      'player_run',
      'player_jump',
      'player_fall',
      'player_dodge',
      'player_atk_1',
      'player_atk_2',
      'player_atk_3',
      'player_hit'
    ];
    keys.forEach((k) => {
      if (anims.exists(k)) {
        anims.remove(k);
      }
    });

    // Idle: 14 visible frames from mc-idle-trimmed (skip empty frame 14)
    anims.create({
      key: 'player_idle',
      frames: anims.generateFrameNumbers('player_idle', { start: 0, end: 13 }),
      frameRate: 6,
      repeat: -1
    });

    // Run: 14 visible frames (skip empty frame 14)
    anims.create({
      key: 'player_run',
      frames: anims.generateFrameNumbers('player_run', { start: 0, end: 13 }),
      frameRate: 10,
      repeat: -1
    });

    // Jump: 6 frames from mc-jump
    anims.create({
      key: 'player_jump',
      frames: anims.generateFrameNumbers('player_jump', { start: 0, end: 5 }),
      frameRate: 18,
      repeat: 0
    });

    // Fall: 6 frames from mc-fall
    anims.create({
      key: 'player_fall',
      frames: anims.generateFrameNumbers('player_fall', { start: 0, end: 5 }),
      frameRate: 12,
      repeat: 0
    });

    // Wall grab: 5 frames from mc-wall-grab (frames 0-4)
    anims.create({
      key: 'player_wall_grab',
      frames: anims.generateFrameNumbers('player_wall_grab', { start: 0, end: 4 }),
      frameRate: 6,
      repeat: -1
    });

    // Dodge: use a run frame for the dash (frame 10 = mid-stride)
    anims.create({
      key: 'player_dodge',
      frames: [{ key: 'player_run', frame: 10 }],
      frameRate: 1
    });

    // Attack combo 1: 25 frames at 70fps = 357ms
    anims.create({
      key: 'player_atk_1',
      frames: anims.generateFrameNumbers('player_attack', { start: 0, end: 24 }),
      frameRate: 70,
      repeat: 0
    });

    // Attack combo 2: 25 frames at 80fps = 313ms
    anims.create({
      key: 'player_atk_2',
      frames: anims.generateFrameNumbers('player_attack', { start: 0, end: 24 }),
      frameRate: 80,
      repeat: 0
    });

    // Attack combo 3: 25 frames at 90fps = 278ms
    anims.create({
      key: 'player_atk_3',
      frames: anims.generateFrameNumbers('player_attack', { start: 0, end: 24 }),
      frameRate: 90,
      repeat: 0
    });

    // Hit: use idle frame 0 as a neutral hit reaction
    anims.create({
      key: 'player_hit',
      frames: [{ key: 'player_idle', frame: 0 }],
      frameRate: 1
    });
  }

  public setEquippedWeapon(weapon: ItemDef): void {
    this.equippedWeapon = weapon;
  }

  public setEquippedArmor(armor: ItemDef | null): void {
    this.equippedArmor = armor;
  }

  public getEquippedWeapon(): ItemDef {
    return this.equippedWeapon;
  }

  public getEquippedArmor(): ItemDef | null {
    return this.equippedArmor;
  }

  public getIsInvulnerable(): boolean {
    return this.invulnerable || this.isDodging || this.isDownSmashing;
  }

  public getIsDodging(): boolean {
    return this.isDodging;
  }

  public getIsDroppingThrough(): boolean {
    return this.isDroppingThrough;
  }

  public getIsDownSmashing(): boolean {
    return this.isDownSmashing;
  }

  public getComboCount(): number {
    return this.comboCount;
  }

  // True source of truth for "attack clip still visually playing" — used so
  // no other state (run/idle/jump) can cut the swing off before its last frame,
  // even if isAttacking was already cleared by the attackTimer safety fallback.
  private isAttackAnimPlaying(): boolean {
    const key = this.anims.currentAnim?.key;
    return (
      this.anims.isPlaying &&
      (key === 'player_atk_1' || key === 'player_atk_2' || key === 'player_atk_3')
    );
  }

  public getHp(): number {
    return this.currentHp;
  }

  public setHp(hp: number): void {
    this.currentHp = Phaser.Math.Clamp(hp, 0, this.maxHp);
  }

  public getMaxHp(): number {
    return this.maxHp;
  }

  public heal(amount: number): void {
    const prev = this.currentHp;
    this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
    const healed = this.currentHp - prev;

    if (healed > 0) {
      const healText = this.scene.add.text(this.x, this.y - 25, `+${healed} HP`, {
        fontSize: '15px',
        color: '#22c55e',
        stroke: '#000000',
        strokeThickness: 3,
        fontStyle: 'bold'
      });
      healText.setDepth(30);
      this.scene.tweens.add({
        targets: healText,
        y: healText.y - 30,
        alpha: 0,
        duration: 750,
        onComplete: () => healText.destroy()
      });
    }
  }

  public takeDamage(amount: number, knockbackDir: number = 0): boolean {
    if (this.getIsInvulnerable()) return false;

    const defense = this.equippedArmor?.defenseBonus || 0;
    const finalDamage = Math.max(1, amount - defense);

    this.currentHp = Math.max(0, this.currentHp - finalDamage);
    this.invulnerable = true;
    this.invulnerableTimer = PLAYER_CONFIG.hitInvulnerableTimeMs;

    this.anims.play('player_hit', true);
    if (knockbackDir !== 0) {
      this.setVelocityX(knockbackDir * 160);
      this.setVelocityY(-150);
    }

    this.emit('player_hit', { hp: this.currentHp, damage: finalDamage });

    if (this.currentHp <= 0) {
      this.emit('player_death');
    }

    return true;
  }

  public updatePlayer(
    delta: number,
    keys: {
      left: boolean;
      right: boolean;
      down: boolean;
      jumpJustDown: boolean;
      jumpHeld: boolean;
      dodgeJustDown: boolean;
      attackJustDown: boolean;
    }
  ): void {
    const arcadeBody = this.body as Phaser.Physics.Arcade.Body;
    const onFloor = arcadeBody.blocked.down || arcadeBody.touching.down;
    const onWallLeft = arcadeBody.blocked.left;
    const onWallRight = arcadeBody.blocked.right;

    // Timers
    if (this.dodgeCooldownTimer > 0) this.dodgeCooldownTimer -= delta;
    if (this.attackCooldownTimer > 0) this.attackCooldownTimer -= delta;
    if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= delta;
    if (this.wallJumpTimer > 0) this.wallJumpTimer -= delta;

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= delta;
      this.setAlpha(Math.floor(this.invulnerableTimer / 80) % 2 === 0 ? 0.4 : 1.0);
      if (this.invulnerableTimer <= 0) {
        this.invulnerable = false;
        this.setAlpha(1.0);
      }
    }

    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
      }
    }

    // 1. Drop-Through Platforms Trigger (Down + Jump on floor)
    if (keys.down && keys.jumpJustDown && onFloor && !this.isDroppingThrough) {
      this.isDroppingThrough = true;
      this.setVelocityY(160);
      this.scene.time.delayedCall(220, () => {
        this.isDroppingThrough = false;
      });
      return;
    }

    // 2. Down-Smash / Dive Attack Trigger (Airborne + Down + Attack)
    if (!onFloor && keys.down && keys.attackJustDown && !this.isDownSmashing) {
      this.isDownSmashing = true;
      this.setVelocityX(0);
      this.setVelocityY(720); // Fast dive slam
      this.anims.play('player_atk_3', true);
      this.emit('player_downsmash_start');
      return;
    }

    // Down-smash impact on landing
    if (this.isDownSmashing && onFloor) {
      this.isDownSmashing = false;
      this.scene.cameras.main.shake(180, 0.014);
      this.emit('player_downsmash_land', { x: this.x, y: this.y });
    }

    // Coyote timer
    if (onFloor) {
      this.coyoteTimer = PLAYER_CONFIG.coyoteTimeMs;
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer -= delta;
    }

    // Buffer jump input
    if (keys.jumpJustDown) {
      this.jumpBufferTimer = PLAYER_CONFIG.jumpBufferMs;
    }

    // 3. Wall Slide Mechanics (Dead Cells style vertical shaft cling)
    if (!onFloor && (onWallLeft || onWallRight) && arcadeBody.velocity.y > 0) {
      this.isWallSliding = true;
      // Slow fall down wall
      this.setVelocityY(Math.min(arcadeBody.velocity.y, 90));
      this.setFlipX(onWallLeft);
    } else {
      this.isWallSliding = false;
    }

    // 4. Wall Jump Execution
    if (this.jumpBufferTimer > 0 && this.isWallSliding && !this.isAttacking) {
      const jumpDir = onWallLeft ? 1 : -1;
      this.setVelocityX(jumpDir * 260);
      this.setVelocityY(PLAYER_CONFIG.jumpVelocity * 0.92);
      this.wallJumpTimer = 180; // Lock horizontal control momentarily
      this.jumpBufferTimer = 0;
      this.isJumpHolding = true;
      this.setFlipX(jumpDir < 0);
      this.emit('player_walljump', { x: this.x, y: this.y });
      return;
    }

    // 5. Handle Dodge state
    if (this.isDodging) {
      this.dodgeTimer -= delta;
      this.setVelocityX(this.dodgeDirection * PLAYER_CONFIG.dodgeSpeed);
      this.setVelocityY(0);

      if (this.dodgeTimer <= 0) {
        this.isDodging = false;
        arcadeBody.allowGravity = true;
        this.setAlpha(1.0);
      }
      return;
    }

    // Trigger Dodge
    if (keys.dodgeJustDown && this.dodgeCooldownTimer <= 0 && !this.isAttacking && !this.isDownSmashing) {
      this.isDodging = true;
      this.dodgeTimer = PLAYER_CONFIG.dodgeDurationMs;
      this.dodgeCooldownTimer = PLAYER_CONFIG.dodgeCooldownMs;
      this.dodgeDirection = this.flipX ? -1 : 1;
      arcadeBody.allowGravity = false;
      this.setAlpha(0.6);
      this.anims.play('player_dodge', true);
      this.emit('player_dodge');
      return;
    }

    // 6. Handle Attack state — released by ANIMATION_COMPLETE event
    // attackTimer is still decremented as a safety fallback
    if (this.isAttacking) {
      this.attackTimer -= delta;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
      }
    }

    // Trigger Attack (Melee or Ranged depending on equipped weapon)
    if (
      keys.attackJustDown &&
      !this.isAttacking &&
      !this.isAttackAnimPlaying() &&
      !this.isDownSmashing &&
      this.attackCooldownTimer <= 0
    ) {
      const mode = this.equippedWeapon.attackMode || 'melee';
      const cooldown = this.equippedWeapon.attackCooldownMs || PLAYER_CONFIG.attackCooldownMs;

      this.isAttacking = true;
      this.attackTimer = PLAYER_CONFIG.attackDurationMs;
      this.attackCooldownTimer = cooldown;

      if (mode === 'melee') {
        this.comboCount = (this.comboCount % PLAYER_CONFIG.maxCombo) + 1;
        this.comboTimer = PLAYER_CONFIG.comboWindowMs;
        this.anims.play(`player_atk_${this.comboCount}`, true);

        this.emit('player_attack_melee', {
          combo: this.comboCount,
          facing: this.flipX ? -1 : 1,
          x: this.x + (this.flipX ? -28 : 28),
          y: this.y,
          weapon: this.equippedWeapon
        });
      } else {
        // Ranged shooting
        this.comboCount = 0;
        this.anims.play('player_atk_1', true);

        this.emit('player_attack_ranged', {
          facing: this.flipX ? -1 : 1,
          x: this.x + (this.flipX ? -24 : 24),
          y: this.y - 2,
          weapon: this.equippedWeapon
        });
      }
    }

    // 7. Horizontal movement (unlocked if not in wall-jump impulse and not attacking)
    if (this.wallJumpTimer <= 0 && !this.isDownSmashing && !this.isAttacking && !this.isAttackAnimPlaying()) {
      let moveDir = 0;
      if (keys.left) moveDir -= 1;
      if (keys.right) moveDir += 1;

      if (moveDir !== 0) {
        this.setVelocityX(moveDir * PLAYER_CONFIG.speed);
        this.setFlipX(moveDir < 0);
      } else {
        this.setVelocityX(0);
      }
    } else if (this.isAttacking || this.isAttackAnimPlaying()) {
      this.setVelocityX(0);
    }

    // 8. Normal Jump & Variable jump height
    const canJump = onFloor || this.coyoteTimer > 0;
    if (this.jumpBufferTimer > 0 && canJump && !this.isAttacking && !this.isDownSmashing) {
      this.setVelocityY(PLAYER_CONFIG.jumpVelocity);
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.isJumpHolding = true;
    }

    if (this.isJumpHolding && !keys.jumpHeld && arcadeBody.velocity.y < 0) {
      this.setVelocityY(arcadeBody.velocity.y * PLAYER_CONFIG.jumpCutMultiplier);
      this.isJumpHolding = false;
    }

    if (onFloor) {
      this.isJumpHolding = false;
    }

    // 9. Animation selection
    // Guarded by isAttackAnimPlaying() too, so a swing never gets cut short by
    // run/idle/jump switching in — even if attackTimer's safety fallback already
    // flipped isAttacking to false before the clip actually finished.
    if (!this.isAttacking && !this.isDownSmashing && !this.isAttackAnimPlaying()) {
      if (this.isWallSliding) {
        this.anims.play('player_wall_grab', true);
      } else if (!onFloor) {
        if (arcadeBody.velocity.y < 0) {
          this.anims.play('player_jump', true);
        } else {
          this.anims.play('player_fall', true);
        }
      } else if (arcadeBody.velocity.x !== 0) {
        this.anims.play('player_run', true);
      } else {
        this.anims.play('player_idle', true);
      }
    }
  }
}