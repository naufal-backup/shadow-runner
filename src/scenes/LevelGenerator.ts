import Phaser from 'phaser';
import { GROUND_Y, LEVEL_CONFIG } from '../config/gameConfig';
import { StaticHazard, MovingSawHazard } from '../objects/Hazards';
import { BreakableBlock } from '../objects/BreakableBlock';
import { MeleeEnemy } from '../objects/MeleeEnemy';
import { RangedEnemy } from '../objects/RangedEnemy';
import { BaseEnemy } from '../objects/BaseEnemy';

export type ChunkType =
  | 'safe_flat'
  | 'spike_pit_jump'
  | 'floating_platforms'
  | 'saw_corridor'
  | 'wall_vault'
  | 'enemy_ambush'
  | 'deadcells_3layer_catacombs'
  | 'vertical_chimney_shaft'
  | 'deep_chasm_descent'
  | 'underground_cavern_tunnel'
  | 'breakable_floor_secret';

export interface LevelChunk {
  index: number;
  startX: number;
  endX: number;
  type: ChunkType;
  groundObjects: Phaser.GameObjects.GameObject[];
  oneWayPlatforms: Phaser.GameObjects.GameObject[];
  breakableBlocks: BreakableBlock[];
  hazards: Phaser.GameObjects.GameObject[];
  enemies: BaseEnemy[];
}

export class LevelGenerator {
  private scene: Phaser.Scene;
  private groundGroup: Phaser.Physics.Arcade.StaticGroup;
  private oneWayGroup: Phaser.Physics.Arcade.StaticGroup;
  private breakableGroup: Phaser.Physics.Arcade.StaticGroup;
  private hazardGroup: Phaser.Physics.Arcade.StaticGroup;
  private activeChunks: Map<number, LevelChunk> = new Map();
  private lastChunkType: ChunkType = 'safe_flat';

  constructor(
    scene: Phaser.Scene,
    groundGroup: Phaser.Physics.Arcade.StaticGroup,
    oneWayGroup: Phaser.Physics.Arcade.StaticGroup,
    breakableGroup: Phaser.Physics.Arcade.StaticGroup,
    hazardGroup: Phaser.Physics.Arcade.StaticGroup
  ) {
    this.scene = scene;
    this.groundGroup = groundGroup;
    this.oneWayGroup = oneWayGroup;
    this.breakableGroup = breakableGroup;
    this.hazardGroup = hazardGroup;
  }

  public getActiveChunks(): Map<number, LevelChunk> {
    return this.activeChunks;
  }

  public updateChunks(
    playerX: number,
    onEnemySpawn: (enemy: BaseEnemy) => void
  ): void {
    const currentChunkIndex = Math.floor(playerX / LEVEL_CONFIG.chunkWidth);

    const maxGenIndex = currentChunkIndex + LEVEL_CONFIG.chunksAheadToGenerate;
    for (let i = 0; i <= maxGenIndex; i++) {
      if (!this.activeChunks.has(i)) {
        this.generateChunk(i, onEnemySpawn);
      }
    }

    const minKeepIndex = Math.max(0, currentChunkIndex - LEVEL_CONFIG.chunksBehindToCull);
    for (const [index, chunk] of this.activeChunks.entries()) {
      if (index < minKeepIndex) {
        this.destroyChunk(chunk);
        this.activeChunks.delete(index);
      }
    }
  }

  private selectChunkType(chunkIndex: number): ChunkType {
    if (chunkIndex < LEVEL_CONFIG.initialSafeChunks) {
      return 'safe_flat';
    }

    const distancePx = chunkIndex * LEVEL_CONFIG.chunkWidth;
    const difficultyTier = Math.min(4, Math.floor(distancePx / LEVEL_CONFIG.baseDifficultyDistance));

    const weights: Record<ChunkType, number> = {
      safe_flat: Math.max(4, 12 - difficultyTier * 2),
      spike_pit_jump: 10 + difficultyTier * 2,
      floating_platforms: 12 + difficultyTier * 2,
      saw_corridor: 10 + difficultyTier * 2,
      wall_vault: 10 + difficultyTier * 2,
      enemy_ambush: 10 + difficultyTier * 2,
      deadcells_3layer_catacombs: 24 + difficultyTier * 5,
      vertical_chimney_shaft: 22 + difficultyTier * 4,
      deep_chasm_descent: 18 + difficultyTier * 3,
      underground_cavern_tunnel: 18 + difficultyTier * 3,
      breakable_floor_secret: 20 + difficultyTier * 4
    };

    if (this.lastChunkType === 'saw_corridor') weights.saw_corridor = 0;
    if (this.lastChunkType === 'spike_pit_jump') weights.spike_pit_jump = 0;

    const types = Object.keys(weights) as ChunkType[];
    const totalWeight = types.reduce((sum, t) => sum + weights[t], 0);

    let rnd = Phaser.Math.Between(1, totalWeight);
    for (const t of types) {
      if (rnd <= weights[t]) {
        this.lastChunkType = t;
        return t;
      }
      rnd -= weights[t];
    }

    return 'deadcells_3layer_catacombs';
  }

  private generateChunk(
    chunkIndex: number,
    onEnemySpawn: (enemy: BaseEnemy) => void
  ): LevelChunk {
    const startX = chunkIndex * LEVEL_CONFIG.chunkWidth;
    const endX = startX + LEVEL_CONFIG.chunkWidth;
    const type = this.selectChunkType(chunkIndex);

    const chunk: LevelChunk = {
      index: chunkIndex,
      startX,
      endX,
      type,
      groundObjects: [],
      oneWayPlatforms: [],
      breakableBlocks: [],
      hazards: [],
      enemies: []
    };

    switch (type) {
      case 'safe_flat':
        this.buildSafeFlat(chunk);
        break;
      case 'spike_pit_jump':
        this.buildSpikePit(chunk);
        break;
      case 'floating_platforms':
        this.buildFloatingPlatforms(chunk, onEnemySpawn);
        break;
      case 'saw_corridor':
        this.buildSawCorridor(chunk);
        break;
      case 'wall_vault':
        this.buildWallVault(chunk, onEnemySpawn);
        break;
      case 'enemy_ambush':
        this.buildEnemyAmbush(chunk, onEnemySpawn);
        break;
      case 'deadcells_3layer_catacombs':
        this.buildDeadCells3Layer(chunk, onEnemySpawn);
        break;
      case 'vertical_chimney_shaft':
        this.buildChimneyShaft(chunk, onEnemySpawn);
        break;
      case 'deep_chasm_descent':
        this.buildDeepChasmDescent(chunk, onEnemySpawn);
        break;
      case 'underground_cavern_tunnel':
        this.buildUndergroundCavern(chunk, onEnemySpawn);
        break;
      case 'breakable_floor_secret':
        this.buildBreakableFloorSecret(chunk, onEnemySpawn);
        break;
    }

    this.activeChunks.set(chunkIndex, chunk);
    return chunk;
  }

  private addGround(
    chunk: LevelChunk,
    x: number,
    y: number,
    width: number,
    height = 80
  ): Phaser.GameObjects.TileSprite {
    const ground = this.scene.add.tileSprite(x + width / 2, y + height / 2, width, height, 'tile_ground');
    this.groundGroup.add(ground);
    chunk.groundObjects.push(ground);
    return ground;
  }

  private addWall(
    chunk: LevelChunk,
    x: number,
    y: number,
    width: number,
    height: number
  ): Phaser.GameObjects.TileSprite {
    const wall = this.scene.add.tileSprite(x + width / 2, y + height / 2, width, height, 'tile_wall');
    this.groundGroup.add(wall);
    chunk.groundObjects.push(wall);
    return wall;
  }

  private addDropThroughPlatform(
    chunk: LevelChunk,
    x: number,
    y: number,
    width: number
  ): Phaser.GameObjects.TileSprite {
    const plat = this.scene.add.tileSprite(x + width / 2, y + 8, width, 16, 'tile_platform');
    this.oneWayGroup.add(plat);
    chunk.oneWayPlatforms.push(plat);
    return plat;
  }

  private addBreakable(chunk: LevelChunk, x: number, y: number): BreakableBlock {
    const block = new BreakableBlock(this.scene, x + 16, y + 16);
    this.breakableGroup.add(block);
    chunk.breakableBlocks.push(block);
    return block;
  }

  // --- PATTERNS ---

  private buildSafeFlat(chunk: LevelChunk): void {
    this.addGround(chunk, chunk.startX, GROUND_Y, LEVEL_CONFIG.chunkWidth);
    this.addDropThroughPlatform(chunk, chunk.startX + 220, GROUND_Y - 90, 140);
  }

  private buildSpikePit(chunk: LevelChunk): void {
    this.addGround(chunk, chunk.startX, GROUND_Y, 200);
    this.addGround(chunk, chunk.startX + 460, GROUND_Y, 240);

    for (let s = 0; s < 7; s++) {
      const sp = new StaticHazard(this.scene, chunk.startX + 220 + s * 34, GROUND_Y + 40);
      this.hazardGroup.add(sp);
      chunk.hazards.push(sp);
    }

    this.addDropThroughPlatform(chunk, chunk.startX + 230, GROUND_Y - 50, 100);
    this.addDropThroughPlatform(chunk, chunk.startX + 350, GROUND_Y - 110, 100);
  }

  private buildFloatingPlatforms(chunk: LevelChunk, onEnemySpawn: (enemy: BaseEnemy) => void): void {
    this.addGround(chunk, chunk.startX, GROUND_Y, 180);
    this.addGround(chunk, chunk.startX + 480, GROUND_Y, 220);

    this.addDropThroughPlatform(chunk, chunk.startX + 180, GROUND_Y - 70, 100);
    this.addDropThroughPlatform(chunk, chunk.startX + 300, GROUND_Y - 150, 120);

    for (let s = 0; s < 6; s++) {
      const sp = new StaticHazard(this.scene, chunk.startX + 210 + s * 34, GROUND_Y + 40);
      this.hazardGroup.add(sp);
      chunk.hazards.push(sp);
    }

    const ranged = new RangedEnemy(this.scene, chunk.startX + 360, GROUND_Y - 190);
    chunk.enemies.push(ranged);
    onEnemySpawn(ranged);
  }

  private buildSawCorridor(chunk: LevelChunk): void {
    this.addGround(chunk, chunk.startX, GROUND_Y, LEVEL_CONFIG.chunkWidth);

    const saw1 = new MovingSawHazard(this.scene, chunk.startX + 180, GROUND_Y - 50, 60, 85);
    const saw2 = new MovingSawHazard(this.scene, chunk.startX + 440, GROUND_Y - 70, 75, 100);
    chunk.hazards.push(saw1, saw2);

    this.addDropThroughPlatform(chunk, chunk.startX + 260, GROUND_Y - 120, 140);
  }

  private buildWallVault(chunk: LevelChunk, onEnemySpawn: (enemy: BaseEnemy) => void): void {
    this.addGround(chunk, chunk.startX, GROUND_Y, LEVEL_CONFIG.chunkWidth);
    this.addWall(chunk, chunk.startX + 280, GROUND_Y - 80, 48, 80);

    this.addDropThroughPlatform(chunk, chunk.startX + 160, GROUND_Y - 50, 80);

    const melee = new MeleeEnemy(this.scene, chunk.startX + 440, GROUND_Y - 40);
    chunk.enemies.push(melee);
    onEnemySpawn(melee);
  }

  private buildEnemyAmbush(chunk: LevelChunk, onEnemySpawn: (enemy: BaseEnemy) => void): void {
    this.addGround(chunk, chunk.startX, GROUND_Y, LEVEL_CONFIG.chunkWidth);
    this.addDropThroughPlatform(chunk, chunk.startX + 200, GROUND_Y - 80, 220);

    const melee = new MeleeEnemy(this.scene, chunk.startX + 280, GROUND_Y - 40);
    const ranged = new RangedEnemy(this.scene, chunk.startX + 320, GROUND_Y - 130);
    chunk.enemies.push(melee, ranged);
    onEnemySpawn(melee);
    onEnemySpawn(ranged);
  }

  // --- DEAD CELLS 3-LAYER VERTICAL LEVEL ---

  private buildDeadCells3Layer(
    chunk: LevelChunk,
    onEnemySpawn: (enemy: BaseEnemy) => void
  ): void {
    // 1. LAYER 1: Deep Crypt Ground (Y = 400 + 320 = 720)
    this.addGround(chunk, chunk.startX, GROUND_Y + 320, LEVEL_CONFIG.chunkWidth, 100);

    // Hazard spikes on crypt floor
    for (let s = 0; s < 5; s++) {
      const sp = new StaticHazard(this.scene, chunk.startX + 280 + s * 34, GROUND_Y + 360);
      this.hazardGroup.add(sp);
      chunk.hazards.push(sp);
    }
    const cryptBrawler = new MeleeEnemy(this.scene, chunk.startX + 480, GROUND_Y + 280);
    chunk.enemies.push(cryptBrawler);
    onEnemySpawn(cryptBrawler);

    // Ascent Ledges from Layer 1 Crypt up to Layer 2 (max step <= 55px)
    this.addDropThroughPlatform(chunk, chunk.startX + 140, GROUND_Y + 260, 90);
    this.addDropThroughPlatform(chunk, chunk.startX + 80, GROUND_Y + 205, 90);
    this.addDropThroughPlatform(chunk, chunk.startX + 140, GROUND_Y + 150, 90);
    this.addDropThroughPlatform(chunk, chunk.startX + 80, GROUND_Y + 95, 90);
    this.addDropThroughPlatform(chunk, chunk.startX + 140, GROUND_Y + 40, 90);

    // 2. LAYER 2: Middle Ruins Pathway (Y = 400 Ground)
    this.addGround(chunk, chunk.startX, GROUND_Y, 200);
    this.addGround(chunk, chunk.startX + 500, GROUND_Y, 200);

    // Drop through bridges across mid layer gap
    this.addDropThroughPlatform(chunk, chunk.startX + 210, GROUND_Y - 10, 100);
    this.addDropThroughPlatform(chunk, chunk.startX + 390, GROUND_Y - 10, 100);

    const midMage = new RangedEnemy(this.scene, chunk.startX + 120, GROUND_Y - 40);
    chunk.enemies.push(midMage);
    onEnemySpawn(midMage);

    // Ascent Ledges from Layer 2 to Layer 3 Rooftops
    this.addDropThroughPlatform(chunk, chunk.startX + 210, GROUND_Y - 70, 90);
    this.addDropThroughPlatform(chunk, chunk.startX + 120, GROUND_Y - 125, 90);
    this.addDropThroughPlatform(chunk, chunk.startX + 210, GROUND_Y - 180, 90);

    // 3. LAYER 3: Upper Skyway & Rooftops (Y = 200 ~ 260)
    this.addDropThroughPlatform(chunk, chunk.startX + 240, GROUND_Y - 235, 140); // Sky bridge summit
    this.addDropThroughPlatform(chunk, chunk.startX + 420, GROUND_Y - 235, 140);
    this.addDropThroughPlatform(chunk, chunk.startX + 580, GROUND_Y - 160, 100);

    // Descent/Ascent connection on right side from Layer 1/2 to 3
    this.addDropThroughPlatform(chunk, chunk.startX + 480, GROUND_Y + 260, 90);
    this.addDropThroughPlatform(chunk, chunk.startX + 540, GROUND_Y + 205, 90);
    this.addDropThroughPlatform(chunk, chunk.startX + 480, GROUND_Y + 150, 90);
    this.addDropThroughPlatform(chunk, chunk.startX + 540, GROUND_Y + 95, 90);
    this.addDropThroughPlatform(chunk, chunk.startX + 480, GROUND_Y + 40, 90);

    const skySniper = new RangedEnemy(this.scene, chunk.startX + 320, GROUND_Y - 280);
    chunk.enemies.push(skySniper);
    onEnemySpawn(skySniper);
  }

  // --- VERTICAL CHIMNEY SHAFT (Wall Cling & Jump Tunnel) ---

  private buildChimneyShaft(
    chunk: LevelChunk,
    onEnemySpawn: (enemy: BaseEnemy) => void
  ): void {
    this.addGround(chunk, chunk.startX, GROUND_Y, 180);
    this.addGround(chunk, chunk.startX + 520, GROUND_Y, 180);

    // Deep bottom chamber
    this.addGround(chunk, chunk.startX + 180, GROUND_Y + 360, 340, 80);

    // 2 Tall Parallel Chimney Walls (width 32, gap 120px) for wall jumping up
    this.addWall(chunk, chunk.startX + 200, GROUND_Y - 200, 32, 560);
    this.addWall(chunk, chunk.startX + 340, GROUND_Y - 200, 32, 560);

    // Ascending platforms inside the chimney spaced <= 55px apart so player can jump up easily
    this.addDropThroughPlatform(chunk, chunk.startX + 232, GROUND_Y + 305, 108);
    this.addDropThroughPlatform(chunk, chunk.startX + 232, GROUND_Y + 250, 108);
    this.addDropThroughPlatform(chunk, chunk.startX + 232, GROUND_Y + 195, 108);
    this.addDropThroughPlatform(chunk, chunk.startX + 232, GROUND_Y + 140, 108);
    this.addDropThroughPlatform(chunk, chunk.startX + 232, GROUND_Y + 85, 108);
    this.addDropThroughPlatform(chunk, chunk.startX + 232, GROUND_Y + 30, 108);
    this.addDropThroughPlatform(chunk, chunk.startX + 232, GROUND_Y - 25, 108);
    this.addDropThroughPlatform(chunk, chunk.startX + 232, GROUND_Y - 80, 108);
    this.addDropThroughPlatform(chunk, chunk.startX + 232, GROUND_Y - 135, 108);
    this.addDropThroughPlatform(chunk, chunk.startX + 232, GROUND_Y - 190, 108);

    // Upper exit roof
    this.addDropThroughPlatform(chunk, chunk.startX + 372, GROUND_Y - 200, 140);

    const shaftMonster = new MeleeEnemy(this.scene, chunk.startX + 270, GROUND_Y + 320);
    chunk.enemies.push(shaftMonster);
    onEnemySpawn(shaftMonster);
  }

  // --- BREAKABLE FLOOR SECRET CHAMBER ---

  private buildBreakableFloorSecret(
    chunk: LevelChunk,
    onEnemySpawn: (enemy: BaseEnemy) => void
  ): void {
    // Normal surface ground with breakable floor tiles in the center
    this.addGround(chunk, chunk.startX, GROUND_Y, 260);
    this.addGround(chunk, chunk.startX + 440, GROUND_Y, 260);

    // 4 Fragile blocks in center (Tile X: startX + 260 ~ 388)
    for (let b = 0; b < 4; b++) {
      this.addBreakable(chunk, chunk.startX + 270 + b * 34, GROUND_Y);
    }

    // Secret lower treasure room (Y = 400 + 280)
    this.addGround(chunk, chunk.startX + 200, GROUND_Y + 280, 320, 80);

    // Ascending stairway ledges to climb back out easily (step <= 55px)
    this.addDropThroughPlatform(chunk, chunk.startX + 220, GROUND_Y + 225, 80);
    this.addDropThroughPlatform(chunk, chunk.startX + 290, GROUND_Y + 170, 80);
    this.addDropThroughPlatform(chunk, chunk.startX + 360, GROUND_Y + 115, 80);
    this.addDropThroughPlatform(chunk, chunk.startX + 290, GROUND_Y + 60, 80);

    const secretGuard = new MeleeEnemy(this.scene, chunk.startX + 340, GROUND_Y + 240);
    chunk.enemies.push(secretGuard);
    onEnemySpawn(secretGuard);
  }

  private buildDeepChasmDescent(
    chunk: LevelChunk,
    onEnemySpawn: (enemy: BaseEnemy) => void
  ): void {
    this.addGround(chunk, chunk.startX, GROUND_Y, 180);
    this.addGround(chunk, chunk.startX + 560, GROUND_Y, 140);

    // Subterranean cascading drop & climb platforms (step <= 55px)
    this.addDropThroughPlatform(chunk, chunk.startX + 180, GROUND_Y + 55, 90);
    this.addDropThroughPlatform(chunk, chunk.startX + 110, GROUND_Y + 110, 90);
    this.addDropThroughPlatform(chunk, chunk.startX + 180, GROUND_Y + 165, 90);
    this.addDropThroughPlatform(chunk, chunk.startX + 110, GROUND_Y + 220, 90);
    this.addDropThroughPlatform(chunk, chunk.startX + 180, GROUND_Y + 275, 90);
    this.addDropThroughPlatform(chunk, chunk.startX + 110, GROUND_Y + 330, 90);

    this.addGround(chunk, chunk.startX + 120, GROUND_Y + 390, 440, 100);

    const caveMelee = new MeleeEnemy(this.scene, chunk.startX + 300, GROUND_Y + 350);
    chunk.enemies.push(caveMelee);
    onEnemySpawn(caveMelee);

    // Ascent ledges on right side back to surface
    this.addDropThroughPlatform(chunk, chunk.startX + 400, GROUND_Y + 330, 80);
    this.addDropThroughPlatform(chunk, chunk.startX + 470, GROUND_Y + 275, 80);
    this.addDropThroughPlatform(chunk, chunk.startX + 400, GROUND_Y + 220, 80);
    this.addDropThroughPlatform(chunk, chunk.startX + 470, GROUND_Y + 165, 80);
    this.addDropThroughPlatform(chunk, chunk.startX + 400, GROUND_Y + 110, 80);
    this.addDropThroughPlatform(chunk, chunk.startX + 470, GROUND_Y + 55, 80);
  }

  private buildUndergroundCavern(
    chunk: LevelChunk,
    onEnemySpawn: (enemy: BaseEnemy) => void
  ): void {
    this.addWall(chunk, chunk.startX, GROUND_Y - 80, LEVEL_CONFIG.chunkWidth, 60);
    this.addGround(chunk, chunk.startX, GROUND_Y + 360, LEVEL_CONFIG.chunkWidth, 120);

    // Stepping ledges inside cave with safe climbable gaps
    this.addDropThroughPlatform(chunk, chunk.startX + 100, GROUND_Y + 305, 90);
    this.addDropThroughPlatform(chunk, chunk.startX + 180, GROUND_Y + 250, 110);
    this.addDropThroughPlatform(chunk, chunk.startX + 100, GROUND_Y + 195, 90);
    this.addDropThroughPlatform(chunk, chunk.startX + 180, GROUND_Y + 140, 110);

    this.addDropThroughPlatform(chunk, chunk.startX + 380, GROUND_Y + 140, 110);
    this.addDropThroughPlatform(chunk, chunk.startX + 460, GROUND_Y + 195, 90);
    this.addDropThroughPlatform(chunk, chunk.startX + 380, GROUND_Y + 250, 110);
    this.addDropThroughPlatform(chunk, chunk.startX + 460, GROUND_Y + 305, 90);

    for (let s = 0; s < 4; s++) {
      const sp = new StaticHazard(this.scene, chunk.startX + 260 + s * 34, GROUND_Y + 400);
      this.hazardGroup.add(sp);
      chunk.hazards.push(sp);
    }

    const saw = new MovingSawHazard(this.scene, chunk.startX + 460, GROUND_Y + 240, 60, 90);
    chunk.hazards.push(saw);

    const mage = new RangedEnemy(this.scene, chunk.startX + 180, GROUND_Y + 100);
    chunk.enemies.push(mage);
    onEnemySpawn(mage);
  }

  private destroyChunk(chunk: LevelChunk): void {
    chunk.groundObjects.forEach((obj) => {
      this.groundGroup.remove(obj, true, true);
      obj.destroy();
    });
    chunk.oneWayPlatforms.forEach((obj) => {
      this.oneWayGroup.remove(obj, true, true);
      obj.destroy();
    });
    chunk.breakableBlocks.forEach((obj) => {
      this.breakableGroup.remove(obj, true, true);
      if (obj.active) obj.destroy();
    });
    chunk.hazards.forEach((obj) => {
      this.hazardGroup.remove(obj, true, true);
      obj.destroy();
    });
    chunk.enemies.forEach((enemy) => {
      if (enemy.active) {
        enemy.removeAllListeners();
        enemy.destroy();
      }
    });

    chunk.groundObjects.length = 0;
    chunk.oneWayPlatforms.length = 0;
    chunk.breakableBlocks.length = 0;
    chunk.hazards.length = 0;
    chunk.enemies.length = 0;
  }
}
