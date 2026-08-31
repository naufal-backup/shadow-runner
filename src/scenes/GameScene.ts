import Phaser from 'phaser';
import { GROUND_Y, PLAYER_CONFIG, LEVEL_CONFIG } from '../config/gameConfig';
import { createGameTextures } from '../config/textures';
import { Player } from '../objects/Player';
import { BaseEnemy } from '../objects/BaseEnemy';
import { MeleeEnemy } from '../objects/MeleeEnemy';
import { RangedEnemy } from '../objects/RangedEnemy';
import { Projectile } from '../objects/Projectile';
import { PlayerProjectile } from '../objects/PlayerProjectile';
import { ItemDrop } from '../objects/ItemDrop';
import { StaticHazard, MovingSawHazard } from '../objects/Hazards';
import { LevelGenerator } from './LevelGenerator';
import { ParallaxBackground } from './ParallaxBackground';
import { ScoreManager } from '../objects/ScoreManager';
import { InventoryManager, SaveLoadManager } from '../objects/InventoryManager';
import { ITEM_DATABASE, type ItemDef } from '../config/itemConfig';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private groundGroup!: Phaser.Physics.Arcade.StaticGroup;
  private oneWayGroup!: Phaser.Physics.Arcade.StaticGroup;
  private breakableGroup!: Phaser.Physics.Arcade.StaticGroup;
  private hazardGroup!: Phaser.Physics.Arcade.StaticGroup;

  private levelGen!: LevelGenerator;
  private scoreManager!: ScoreManager;
  private inventoryManager!: InventoryManager;

  private enemyGroup!: Phaser.Physics.Arcade.Group;
  private enemies: BaseEnemy[] = [];
  private enemyProjectiles: Projectile[] = [];
  private playerProjectiles: PlayerProjectile[] = [];
  private itemDrops: ItemDrop[] = [];

  private isGameOver = false;
  private startWithSave = false;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyShift!: Phaser.Input.Keyboard.Key;
  private keyJ!: Phaser.Input.Keyboard.Key;
  private keyI!: Phaser.Input.Keyboard.Key;
  private keyH!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { loadSavedGame?: boolean }): void {
    this.startWithSave = data.loadSavedGame === true;
  }

  preload(): void {
    createGameTextures(this);
  }

  create(): void {
    this.enemies = [];
    this.enemyProjectiles = [];
    this.playerProjectiles = [];
    this.itemDrops = [];
    this.isGameOver = false;

    // 1. Managers
    this.scoreManager = new ScoreManager();
    this.inventoryManager = new InventoryManager();

    // 2. Controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keySpace = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyShift = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.keyJ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.keyI = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.keyH = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    this.keyEsc = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // 3. Parallax
    new ParallaxBackground(this);

    // 4. Physics Groups
    this.groundGroup = this.physics.add.staticGroup();
    this.oneWayGroup = this.physics.add.staticGroup();
    this.breakableGroup = this.physics.add.staticGroup();
    this.hazardGroup = this.physics.add.staticGroup();
    this.enemyGroup = this.physics.add.group({
      runChildUpdate: false
    });

    // 5. Spawn Player & load save if requested
    this.player = new Player(this, 160, GROUND_Y - 40);
    this.player.setDepth(10);
    this.physics.world.setBounds(0, -500, 1000000, 2000);

    if (this.startWithSave) {
      this.loadSavedState();
    } else {
      this.syncEquipmentToPlayer();
    }

    // 6. Level Generator
    this.levelGen = new LevelGenerator(
      this,
      this.groundGroup,
      this.oneWayGroup,
      this.breakableGroup,
      this.hazardGroup
    );
    this.levelGen.updateChunks(this.player.x, (enemy) => this.registerEnemy(enemy));

    // 7. Collisions & Hazards
    this.physics.add.collider(this.player, this.groundGroup);

    // One-Way Drop-Through Platform collision
    this.physics.add.collider(
      this.player,
      this.oneWayGroup,
      undefined,
      (playerObj, platObj) => {
        const p = playerObj as Player;
        if (p.getIsDroppingThrough()) return false;

        const pBody = p.body as Phaser.Physics.Arcade.Body;
        const plat = platObj as Phaser.GameObjects.TileSprite;
        // Only collide if player's feet are above platform top and falling
        return pBody.velocity.y >= 0 && (pBody.y + pBody.height) <= (plat.y - plat.displayOriginY + 12);
      }
    );

    // Breakable Blocks collision & Down-Smash break detection
    this.physics.add.collider(
      this.player,
      this.breakableGroup,
      (_playerObj, blockObj) => {
        if (this.player.getIsDownSmashing()) {
          const block = blockObj as import('../objects/BreakableBlock').BreakableBlock;
          if (block && block.breakBlock) {
            block.breakBlock();
          }
        }
      },
      (playerObj) => {
        const p = playerObj as Player;
        if (p.getIsDownSmashing()) {
          return false; // Break through without bounce stopping
        }
        return true;
      }
    );

    // Player vs Enemies physical solid collision (unless dodging through)
    this.physics.add.collider(
      this.player,
      this.enemyGroup,
      (_playerObj, enemyObj) => {
        const enemy = enemyObj as BaseEnemy;
        if (!enemy.getIsDead() && enemy instanceof MeleeEnemy) {
          if (!this.player.getIsInvulnerable()) {
            const knockDir = this.player.x > enemy.x ? 1 : -1;
            this.player.takeDamage(10, knockDir);
          }
        }
      },
      (playerObj, enemyObj) => {
        const p = playerObj as Player;
        const e = enemyObj as BaseEnemy;
        if (e.getIsDead()) return false;
        if (p.getIsDodging()) return false;
        return true;
      }
    );

    this.physics.add.overlap(this.player, this.hazardGroup, (_playerObj, hazardObj) => {
      const hazard = hazardObj as unknown as StaticHazard;
      const damage = hazard.getDamage ? hazard.getDamage() : LEVEL_CONFIG.hazardDamage.spikes;
      this.player.takeDamage(damage, 0);
    });

    // 8. Camera Follow (full deep vertical tracking from sky -400 down to underground +1500)
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08, -100, 30);
    this.cameras.main.setBounds(0, -400, 1000000, 1900);

    // 9. Player Combat Listeners
    this.player.on('player_attack_melee', (data: { combo: number; facing: number; x: number; y: number; weapon: ItemDef }) => {
      this.handlePlayerMeleeAttack(data);
    });

    this.player.on('player_attack_ranged', (data: { facing: number; x: number; y: number; weapon: ItemDef }) => {
      this.handlePlayerRangedAttack(data);
    });

    this.player.on('player_hit', () => {
      this.cameras.main.shake(120, 0.008);
    });

    this.player.on('player_death', () => {
      this.handlePlayerDeath('HP Habis!');
    });

    this.player.on('player_downsmash_land', (data: { x: number; y: number }) => {
      this.handleDownSmashImpact(data.x, data.y);
    });

    // Listen to inventory consumable use
    this.scene.get('InventoryScene').events.on('use_potion', (amount: number) => {
      this.player.heal(amount);
    });

    // 10. Launch Parallel UI Scene (Independent of Game World Camera Zoom)
    this.scene.launch('UIScene');
  }

  public getPlayer(): Player {
    return this.player;
  }

  public getInventoryManager(): InventoryManager {
    return this.inventoryManager;
  }

  public getScoreManager(): ScoreManager {
    return this.scoreManager;
  }

  public getLevelGen(): LevelGenerator {
    return this.levelGen;
  }

  public getEnemies(): BaseEnemy[] {
    return this.enemies;
  }

  public syncEquipmentToPlayer(): void {
    const eq = this.inventoryManager.getEquipment();
    this.player.setEquippedWeapon(eq.weapon);
    this.player.setEquippedArmor(eq.armor);
  }

  public saveCurrentState(): void {
    const saveData = this.inventoryManager.exportSaveData({
      hp: this.player.getHp(),
      maxHp: this.player.getMaxHp(),
      score: this.scoreManager.getState().currentScore,
      distance: this.scoreManager.getState().distanceMeters,
      kills: this.scoreManager.getState().kills
    });
    SaveLoadManager.saveGame(saveData);
  }

  private loadSavedState(): void {
    const data = SaveLoadManager.loadGame();
    if (data) {
      this.inventoryManager.importSaveData(data);
      this.syncEquipmentToPlayer();
      this.player.setHp(data.player.hp);
    }
  }

  private registerEnemy(enemy: BaseEnemy): void {
    enemy.setDepth(5);
    this.physics.add.collider(enemy, this.groundGroup);
    this.enemyGroup.add(enemy);

    if (enemy instanceof MeleeEnemy) {
      enemy.on('melee_strike', (data: { x: number; y: number; damage: number; enemy: MeleeEnemy }) => {
        this.handleEnemyMeleeAttack(data);
      });
    } else if (enemy instanceof RangedEnemy) {
      enemy.on('ranged_shoot', (data: { x: number; y: number; dirX: number; speed: number; damage: number }) => {
        this.handleEnemyRangedShoot(data);
      });
    }

    enemy.on('enemy_destroyed', (deadEnemy: BaseEnemy) => {
      this.enemies = this.enemies.filter((e) => e !== deadEnemy);
      this.enemyGroup.remove(deadEnemy);

      const enemyType = deadEnemy instanceof RangedEnemy ? 'ranged' : 'melee';
      const comboCount = this.player.getComboCount();
      const earned = this.scoreManager.recordKill(enemyType, comboCount);

      this.showKillScorePop(deadEnemy.x, deadEnemy.y - 20, earned);

      // Roll Loot Drops
      this.rollEnemyLoot(deadEnemy.x, deadEnemy.y, enemyType);
    });

    this.enemies.push(enemy);
  }

  private rollEnemyLoot(x: number, y: number, enemyType: 'melee' | 'ranged'): void {
    // 1. Guaranteed Gold coin
    this.spawnItemDrop(x, y - 10, ITEM_DATABASE['coin_gold'], Phaser.Math.Between(1, 3));

    // 2. Chance for Health potion (35%)
    if (Math.random() < 0.35) {
      this.spawnItemDrop(x + 12, y - 10, ITEM_DATABASE['potion_hp'], 1);
    }

    // 3. Rare Weapon/Armor drop (15%)
    const rareRoll = Math.random();
    if (rareRoll < 0.08) {
      const rareItem = enemyType === 'melee' ? ITEM_DATABASE['sword_flame'] : ITEM_DATABASE['staff_arcane'];
      this.spawnItemDrop(x - 12, y - 15, rareItem, 1);
    } else if (rareRoll < 0.15) {
      const armorItem = Math.random() > 0.5 ? ITEM_DATABASE['armor_leather'] : ITEM_DATABASE['armor_steel'];
      this.spawnItemDrop(x - 12, y - 15, armorItem, 1);
    }
  }

  private spawnItemDrop(x: number, y: number, item: ItemDef, qty = 1): void {
    const drop = new ItemDrop(this, x, y, item, qty);
    drop.setDepth(15);
    this.physics.add.collider(drop, this.groundGroup);

    this.itemDrops.push(drop);
  }

  private showKillScorePop(x: number, y: number, points: number): void {
    const pop = this.add.text(x, y, `+${points} PTS!`, {
      fontSize: '15px',
      color: '#38bdf8',
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold'
    });
    pop.setDepth(25);

    this.tweens.add({
      targets: pop,
      y: pop.y - 35,
      alpha: 0,
      scale: 1.25,
      duration: 700,
      onComplete: () => pop.destroy()
    });
  }

  public openInventory(): void {
    if (this.isGameOver) return;
    this.scene.pause();
    this.scene.launch('InventoryScene', {
      inventoryManager: this.inventoryManager,
      onEquipChange: () => this.syncEquipmentToPlayer()
    });
  }

  public pauseGame(): void {
    if (this.isGameOver) return;
    this.scene.pause();
    this.scene.pause('UIScene');
    this.scene.launch('PauseScene');
  }

  private handleDownSmashImpact(x: number, y: number): void {
    // Shockwave particle circle
    const wave = this.add.circle(x, y, 20, 0xfde047, 0.7);
    wave.setDepth(16);
    this.tweens.add({
      targets: wave,
      scaleX: 3.5,
      scaleY: 1.2,
      alpha: 0,
      duration: 220,
      onComplete: () => wave.destroy()
    });

    // Damage all enemies in 120px shockwave radius
    this.enemies.forEach((enemy) => {
      if (enemy.getIsDead()) return;
      const d = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (d <= 110) {
        const knockDir = enemy.x > x ? 1 : -1;
        enemy.takeDamage(45, knockDir);
      }
    });
  }

  private handlePlayerMeleeAttack(data: { combo: number; facing: number; x: number; y: number; weapon: ItemDef }): void {
    const baseDamage = PLAYER_CONFIG.damageByCombo[data.combo - 1] || 25;
    const bonus = data.weapon.damageBonus || 0;
    const totalDamage = baseDamage + bonus;

    const slashWidth = 38 + data.combo * 14;
    const slashHeight = 22;
    const slashColor = data.weapon.id === 'sword_flame' ? 0xf97316 : 0xfacc15;

    const slash = this.add.rectangle(data.x, data.y, slashWidth, slashHeight, slashColor, 0.85);
    slash.setStrokeStyle(2, 0xef4444);
    slash.setDepth(15);

    this.tweens.add({
      targets: slash,
      alpha: 0,
      scaleX: 1.4,
      x: data.x + data.facing * 14,
      duration: 130,
      onComplete: () => slash.destroy()
    });

    const attackBounds = new Phaser.Geom.Rectangle(
      data.facing > 0 ? data.x - 10 : data.x - slashWidth + 10,
      data.y - slashHeight / 2,
      slashWidth,
      slashHeight
    );

    this.enemies.forEach((enemy) => {
      if (enemy.getIsDead()) return;
      if (Phaser.Geom.Intersects.RectangleToRectangle(attackBounds, enemy.getBounds())) {
        enemy.takeDamage(totalDamage, data.facing);
      }
    });
  }

  private handlePlayerRangedAttack(data: { facing: number; x: number; y: number; weapon: ItemDef }): void {
    const isStaff = data.weapon.id === 'staff_arcane';
    const projTexture = isStaff ? 'proj_arcane' : 'proj_arrow';
    const speed = (data.weapon.projectileSpeed || 380) * data.facing;
    const damage = 25 + (data.weapon.damageBonus || 0);

    const proj = new PlayerProjectile(this, data.x, data.y, speed, damage, projTexture);
    proj.setDepth(15);
    this.playerProjectiles.push(proj);

    // Muzzle glow
    const glow = this.add.circle(data.x, data.y, 8, isStaff ? 0xc084fc : 0xfde047, 0.85);
    glow.setDepth(16);
    this.tweens.add({
      targets: glow,
      scale: 1.5,
      alpha: 0,
      duration: 100,
      onComplete: () => glow.destroy()
    });
  }

  private handleEnemyMeleeAttack(data: { x: number; y: number; damage: number; enemy: MeleeEnemy }): void {
    if (data.enemy.getIsDead()) return;

    const punchFx = this.add.circle(data.x, data.y, 14, 0xef4444, 0.6);
    punchFx.setDepth(12);
    this.tweens.add({
      targets: punchFx,
      scale: 1.5,
      alpha: 0,
      duration: 150,
      onComplete: () => punchFx.destroy()
    });

    const strikeDist = Phaser.Math.Distance.Between(data.x, data.y, this.player.x, this.player.y);
    if (strikeDist < 38) {
      const knockback = this.player.x > data.enemy.x ? 1 : -1;
      this.player.takeDamage(data.damage, knockback);
    }
  }

  private handleEnemyRangedShoot(data: { x: number; y: number; dirX: number; speed: number; damage: number }): void {
    const proj = new Projectile(this, data.x, data.y, data.dirX * data.speed, data.damage);
    proj.setDepth(12);
    this.enemyProjectiles.push(proj);

    // Muzzle flash particle
    const flash = this.add.circle(data.x, data.y, 8, 0x00f2fe, 0.8);
    flash.setDepth(13);
    this.tweens.add({
      targets: flash,
      scale: 1.6,
      alpha: 0,
      duration: 120,
      onComplete: () => flash.destroy()
    });
  }

  private handlePlayerDeath(reason: string = 'Game Over'): void {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.scoreManager.saveHighScore();
    const finalState = this.scoreManager.getState();

    this.cameras.main.flash(450, 239, 68, 68);

    this.time.delayedCall(450, () => {
      this.scene.pause();
      this.scene.pause('UIScene');
      this.scene.launch('GameOverScene', {
        reason,
        stats: finalState
      });
    });
  }

  update(_time: number, delta: number): void {
    if (this.isGameOver) return;

    // Check UI Shortcuts
    if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
      this.pauseGame();
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyI)) {
      this.openInventory();
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyH)) {
      const heal = this.inventoryManager.usePotion();
      if (heal > 0) {
        this.player.heal(heal);
      }
    }

    const left = this.cursors.left.isDown || this.keyA.isDown;
    const right = this.cursors.right.isDown || this.keyD.isDown;
    const down = this.cursors.down.isDown || this.keyS.isDown;
    const jumpJustDown = Phaser.Input.Keyboard.JustDown(this.keySpace) || Phaser.Input.Keyboard.JustDown(this.keyW) || Phaser.Input.Keyboard.JustDown(this.cursors.up);
    const jumpHeld = this.keySpace.isDown || this.keyW.isDown || this.cursors.up.isDown;
    const dodgeJustDown = Phaser.Input.Keyboard.JustDown(this.keyShift);
    const attackJustDown = Phaser.Input.Keyboard.JustDown(this.keyJ);

    // 1. Update Player Traversal (including Drop-through & Down-smash)
    this.player.updatePlayer(delta, {
      left,
      right,
      down,
      jumpJustDown,
      jumpHeld,
      dodgeJustDown,
      attackJustDown
    });

    // 2. Dynamic Camera Vertical Look-Ahead & Zoom (Dead Cells style)
    const pBody = this.player.body as Phaser.Physics.Arcade.Body;
    if (pBody) {
      if (pBody.velocity.y > 350) {
        // Fast falling / diving down: look down
        this.cameras.main.setFollowOffset(-100, -80);
      } else if (pBody.velocity.y < -300) {
        // High jumping up: look up
        this.cameras.main.setFollowOffset(-100, 70);
      } else {
        this.cameras.main.setFollowOffset(-100, 20);
      }

      // Dynamic Layer Zooming
      if (this.player.y > 650) {
        this.cameras.main.zoomTo(1.1, 400); // Subterranean caverns
      } else if (this.player.y < 120) {
        this.cameras.main.zoomTo(0.92, 400); // High skyway
      } else {
        this.cameras.main.zoomTo(1.0, 300);
      }
    }

    // 2. Score manager update
    this.scoreManager.updateDistance(this.player.x);
    this.scoreManager.update(delta);

    // 3. Procedural Level Generation
    this.levelGen.updateChunks(this.player.x, (enemy) => this.registerEnemy(enemy));

    // 4. Pit Death Check
    if (this.player.y > LEVEL_CONFIG.pitDeathY) {
      this.handlePlayerDeath('Jatuh ke Jurang!');
      return;
    }

    // 5. Moving Saws
    for (const [, chunk] of this.levelGen.getActiveChunks().entries()) {
      chunk.hazards.forEach((hazard) => {
        if (hazard instanceof MovingSawHazard) {
          hazard.updateHazard(delta);
          const sawBody = hazard.body as Phaser.Physics.Arcade.Body;
          const pBody = this.player.body as Phaser.Physics.Arcade.Body;
          if (
            sawBody &&
            pBody &&
            Phaser.Geom.Intersects.RectangleToRectangle(
              new Phaser.Geom.Rectangle(sawBody.x, sawBody.y, sawBody.width, sawBody.height),
              new Phaser.Geom.Rectangle(pBody.x, pBody.y, pBody.width, pBody.height)
            )
          ) {
            this.player.takeDamage(hazard.getDamage(), this.player.x > hazard.x ? 1 : -1);
          }
        }
      });
    }

    // 6. Enemies update
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy && enemy.active) {
        enemy.updateEnemy(delta, this.player);
      }
    }

    // 7. Enemy Projectiles vs Player
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const proj = this.enemyProjectiles[i];
      if (!proj.active) {
        this.enemyProjectiles.splice(i, 1);
        continue;
      }
      proj.updateProjectile(delta);

      const projBody = proj.body as Phaser.Physics.Arcade.Body;
      const pBody = this.player.body as Phaser.Physics.Arcade.Body;
      if (
        proj.active &&
        projBody &&
        pBody &&
        Phaser.Geom.Intersects.RectangleToRectangle(
          new Phaser.Geom.Rectangle(projBody.x, projBody.y, projBody.width, projBody.height),
          new Phaser.Geom.Rectangle(pBody.x, pBody.y, pBody.width, pBody.height)
        )
      ) {
        const knockDir = projBody.velocity.x > 0 ? 1 : -1;
        const hit = this.player.takeDamage(proj.getDamage(), knockDir);
        if (hit || !this.player.getIsInvulnerable()) {
          proj.destroy();
          this.enemyProjectiles.splice(i, 1);
        }
      }
    }

    // 8. Player Projectiles vs Enemies
    for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
      const proj = this.playerProjectiles[i];
      if (!proj.active) {
        this.playerProjectiles.splice(i, 1);
        continue;
      }
      proj.updateProjectile(delta);

      if (proj.active) {
        const pBounds = proj.getBounds();
        for (const enemy of this.enemies) {
          if (!enemy.getIsDead() && Phaser.Geom.Intersects.RectangleToRectangle(pBounds, enemy.getBounds())) {
            const facing = proj.body ? (proj.body.velocity.x > 0 ? 1 : -1) : 1;
            enemy.takeDamage(proj.getDamage(), facing);
            proj.destroy();
            this.playerProjectiles.splice(i, 1);
            break;
          }
        }
      }
    }

    // 9. Item Drops update & Pickup check
    for (let i = this.itemDrops.length - 1; i >= 0; i--) {
      const drop = this.itemDrops[i];
      if (!drop.active) {
        this.itemDrops.splice(i, 1);
        continue;
      }
      drop.updateDrop();

      if (Phaser.Geom.Intersects.RectangleToRectangle(drop.getBounds(), this.player.getBounds())) {
        const item = drop.getItem();
        const qty = drop.getQuantity();
        const success = this.inventoryManager.addItem(item, qty);

        if (success) {
          // Floating pickup notification
          const lootText = this.add.text(drop.x, drop.y - 15, `+${qty} ${item.name}`, {
            fontSize: '12px',
            color: item.id === 'coin_gold' ? '#facc15' : '#38bdf8',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
          });
          lootText.setDepth(30);
          this.tweens.add({
            targets: lootText,
            y: lootText.y - 25,
            alpha: 0,
            duration: 600,
            onComplete: () => lootText.destroy()
          });

          drop.destroy();
          this.itemDrops.splice(i, 1);
        }
      }
    }

    // 10. Minimap update if any
  }
}
