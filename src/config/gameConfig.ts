export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 480;
export const GROUND_Y = 400;

export const PLAYER_CONFIG = {
  maxHp: 100,
  width: 32,
  height: 80,
  speed: 220,
  jumpVelocity: -420,
  jumpCutMultiplier: 0.45,
  coyoteTimeMs: 100,
  jumpBufferMs: 150,
  dodgeSpeed: 520,
  dodgeDurationMs: 220,
  dodgeCooldownMs: 900,
  attackDurationMs: 65,
  attackCooldownMs: 30,
  comboWindowMs: 450,
  maxCombo: 3,
  damageByCombo: [20, 25, 40],
  hitInvulnerableTimeMs: 800
};

export const LEVEL_CONFIG = {
  chunkWidth: 700,
  initialSafeChunks: 2,
  chunksAheadToGenerate: 3,
  chunksBehindToCull: 2,
  pitDeathY: 1400, // Deep caverns allow descending down to Y=1000+
  baseDifficultyDistance: 1500, // Every 1500px traveled difficulty tier rises
  hazardDamage: {
    spikes: 25,
    saw: 30,
    pit: 999
  }
};

export const ENEMY_CONFIG = {
  melee: {
    hp: 60,
    speed: 110,
    width: 24,
    height: 40,
    detectRange: 280,
    attackRange: 38,
    attackCooldownMs: 1200,
    attackWindupMs: 300,
  attackDurationMs: 625,
    damage: 15
  },
  ranged: {
    hp: 40,
    speed: 70,
    width: 24,
    height: 40,
    idealDistanceMin: 140,
    idealDistanceMax: 400,
    detectRange: 550,
    shootCooldownMs: 1600,
    shootWindupMs: 400,
    projectileSpeed: 320,
    projectileDamage: 12
  },
  spawner: {
    initialDelayMs: 1500,
    minIntervalMs: 3500,
    maxIntervalMs: 6500,
    maxEnemies: 4
  }
};

export const SCORE_CONFIG = {
  pointsPerMeter: 1,
  killPoints: {
    melee: 100,
    ranged: 150
  },
  comboKillBonus: 50,
  killStreakWindowMs: 4000,
  streakMultiplierStep: 0.2,
  maxStreakMultiplier: 3.0,
  storageKeyHighScore: 'phaser_scroller_highscore'
};





