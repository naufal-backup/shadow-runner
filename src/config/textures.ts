import Phaser from 'phaser';

export function createGameTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists('player_idle')) {
    return; // Already loaded across the global texture manager
  }

  // Enemy frame dimensions (32x48)
  const fw = 32;
  const fh = 48;

  // --- PLAYER EXTERNAL SPRITE SHEETS (256x256 frames) ---
  // mc-idle-trimmed: 21 frames (5 cols x 4 rows + 1), idle animation
  // mc-run-trimmed: 21 frames (5 cols x 4 rows + 1), run animation
  // mc-attack: 25 frames (5 cols x 5 rows), attack/slash animation
  // mc-jump: 25 frames (5 cols x 5 rows), jump animation
  const playerFrameSize = 256;

  // Only load if not already loaded
  if (!scene.textures.exists('player_idle')) {
    scene.load.spritesheet('player_idle', 'assets/player/mc-idle-trimmed.png', {
      frameWidth: playerFrameSize,
      frameHeight: playerFrameSize
    });
  }
  if (!scene.textures.exists('player_run')) {
    scene.load.spritesheet('player_run', 'assets/player/mc-run-trimmed.png', {
      frameWidth: playerFrameSize,
      frameHeight: playerFrameSize
    });
  }
  if (!scene.textures.exists('player_attack')) {
    scene.load.spritesheet('player_attack', 'assets/player/mc-attack.png', {
      frameWidth: playerFrameSize,
      frameHeight: playerFrameSize
    });
  }
  if (!scene.textures.exists('player_jump')) {
    scene.load.spritesheet('player_jump', 'assets/player/mc-jump.png', {
      frameWidth: playerFrameSize,
      frameHeight: playerFrameSize
    });
  }
  if (!scene.textures.exists('player_fall')) {
    scene.load.spritesheet('player_fall', 'assets/player/mc-fall.png', {
      frameWidth: playerFrameSize,
      frameHeight: playerFrameSize
    });
  }
  if (!scene.textures.exists('player_wall_grab')) {
    scene.load.spritesheet('player_wall_grab', 'assets/player/mc-wall-grab.png', {
      frameWidth: playerFrameSize,
      frameHeight: playerFrameSize
    });
  }

  // Create a legacy 'player_sheet' alias pointing to idle for any code that references it
  if (!scene.textures.exists('player_sheet')) {
    // We'll create this after load completes
    scene.load.on('complete', () => {
      if (!scene.textures.exists('player_sheet') && scene.textures.exists('player_idle')) {
        // Create a dummy texture reference - animations will use the new keys
        const source = scene.textures.get('player_idle').getSourceImage();
        if (source instanceof HTMLImageElement) {
          scene.textures.addImage('player_sheet', source);
        }
      }
    });
  }

  // --- MELEE ENEMY SPRITESHEET (Red brawler) ---
  // Frame 0: idle, 1-4: run, 5: windup/attack, 6: hit, 7: death
  const meleeFrames = 8;
  const meleeCanvas = document.createElement('canvas');
  meleeCanvas.width = fw * meleeFrames;
  meleeCanvas.height = fh;
  const mCtx = meleeCanvas.getContext('2d')!;

  for (let i = 0; i < meleeFrames; i++) {
    const ox = i * fw;
    // Body (crimson)
    mCtx.fillStyle = '#c0392b';
    mCtx.fillRect(ox + 8, 10, 16, 24);

    // Head (dark red mask)
    mCtx.fillStyle = '#78281f';
    mCtx.fillRect(ox + 10, 2, 12, 10);

    // Glowing eyes
    mCtx.fillStyle = '#f39c12';
    mCtx.fillRect(ox + 18, 5, 3, 2);

    // Belt / spikes
    mCtx.fillStyle = '#17202a';
    mCtx.fillRect(ox + 8, 24, 16, 4);

    // Legs
    mCtx.fillStyle = '#2c3e50';
    if (i >= 1 && i <= 4) {
      const step = (i % 2 === 0) ? 0 : 3;
      mCtx.fillRect(ox + 9, 34, 5, 12 + step);
      mCtx.fillRect(ox + 18, 34, 5, 12 - step);
    } else if (i === 5) {
      // Attack punch pose
      mCtx.fillRect(ox + 8, 34, 6, 12);
      mCtx.fillRect(ox + 18, 34, 6, 12);
      mCtx.fillStyle = '#e74c3c';
      mCtx.fillRect(ox + 22, 16, 10, 8); // fist
    } else if (i === 6) {
      // Hit flash
      mCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      mCtx.fillRect(ox + 6, 0, 20, 46);
    } else if (i === 7) {
      // Death (fallen)
      mCtx.fillStyle = '#78281f';
      mCtx.fillRect(ox + 4, 38, 24, 8);
    } else {
      mCtx.fillRect(ox + 9, 34, 5, 12);
      mCtx.fillRect(ox + 18, 34, 5, 12);
    }
  }

  if (scene.textures.exists('enemy_melee_sheet')) {
    scene.textures.remove('enemy_melee_sheet');
  }
  scene.textures.addSpriteSheet('enemy_melee_sheet', meleeCanvas as unknown as HTMLImageElement, {
    frameWidth: fw,
    frameHeight: fh
  });

  // --- RANGED ENEMY SPRITESHEET (Purple archer / mage) ---
  // Frame 0: idle, 1-4: run, 5: shoot windup, 6: hit, 7: death
  const rangedFrames = 8;
  const rangedCanvas = document.createElement('canvas');
  rangedCanvas.width = fw * rangedFrames;
  rangedCanvas.height = fh;
  const rCtx = rangedCanvas.getContext('2d')!;

  for (let i = 0; i < rangedFrames; i++) {
    const ox = i * fw;
    // Robe / Body
    rCtx.fillStyle = '#8e44ad';
    rCtx.fillRect(ox + 8, 12, 16, 22);

    // Hood / Head
    rCtx.fillStyle = '#5b2c6f';
    rCtx.fillRect(ox + 10, 2, 12, 10);

    // Glowing cyan visor
    rCtx.fillStyle = '#00f2fe';
    rCtx.fillRect(ox + 18, 5, 3, 2);

    // Staff / Weapon
    rCtx.fillStyle = '#d35400';
    rCtx.fillRect(ox + 22, 6, 3, 30);
    rCtx.fillStyle = '#00f2fe';
    rCtx.fillRect(ox + 21, 3, 5, 5); // orb on staff

    // Legs
    rCtx.fillStyle = '#1b2631';
    if (i >= 1 && i <= 4) {
      const step = (i % 2 === 0) ? 0 : 2;
      rCtx.fillRect(ox + 9, 34, 5, 12 + step);
      rCtx.fillRect(ox + 18, 34, 5, 12 - step);
    } else if (i === 5) {
      // Magic charge up
      rCtx.fillStyle = '#00f2fe';
      rCtx.beginPath();
      rCtx.arc(ox + 23, 5, 6, 0, Math.PI * 2);
      rCtx.fill();
    } else if (i === 6) {
      // Hit flash
      rCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      rCtx.fillRect(ox + 6, 0, 20, 46);
    } else if (i === 7) {
      // Death
      rCtx.fillStyle = '#5b2c6f';
      rCtx.fillRect(ox + 4, 40, 24, 6);
    } else {
      rCtx.fillRect(ox + 9, 34, 5, 12);
      rCtx.fillRect(ox + 18, 34, 5, 12);
    }
  }

  if (scene.textures.exists('enemy_ranged_sheet')) {
    scene.textures.remove('enemy_ranged_sheet');
  }
  scene.textures.addSpriteSheet('enemy_ranged_sheet', rangedCanvas as unknown as HTMLImageElement, {
    frameWidth: fw,
    frameHeight: fh
  });

  // --- PROJECTILE TEXTURE (Magic orb / energy bolt) ---
  const projCanvas = document.createElement('canvas');
  projCanvas.width = 16;
  projCanvas.height = 16;
  const pCtx = projCanvas.getContext('2d')!;

  pCtx.fillStyle = '#00f2fe';
  pCtx.beginPath();
  pCtx.arc(8, 8, 6, 0, Math.PI * 2);
  pCtx.fill();

  pCtx.fillStyle = '#ffffff';
  pCtx.beginPath();
  pCtx.arc(8, 8, 3, 0, Math.PI * 2);
  pCtx.fill();

  if (scene.textures.exists('projectile_orb')) {
    scene.textures.remove('projectile_orb');
  }
  scene.textures.addSpriteSheet('projectile_orb', projCanvas as unknown as HTMLImageElement, {
    frameWidth: 16,
    frameHeight: 16
  });

  // --- ENVIRONMENT & HAZARD TEXTURES ---

  // 1. Spikes (32x24)
  const spikeCanvas = document.createElement('canvas');
  spikeCanvas.width = 32;
  spikeCanvas.height = 24;
  const sCtx = spikeCanvas.getContext('2d')!;
  sCtx.fillStyle = '#7f8c8d';
  sCtx.fillRect(0, 20, 32, 4);
  sCtx.fillStyle = '#bdc3c7';
  // 3 sharp triangle teeth
  for (let s = 0; s < 3; s++) {
    const sx = s * 10 + 2;
    sCtx.beginPath();
    sCtx.moveTo(sx, 20);
    sCtx.lineTo(sx + 5, 2);
    sCtx.lineTo(sx + 10, 20);
    sCtx.closePath();
    sCtx.fill();
    // Blood tip highlight
    sCtx.fillStyle = '#c0392b';
    sCtx.beginPath();
    sCtx.moveTo(sx + 3, 7);
    sCtx.lineTo(sx + 5, 2);
    sCtx.lineTo(sx + 7, 7);
    sCtx.closePath();
    sCtx.fill();
    sCtx.fillStyle = '#bdc3c7';
  }
  if (scene.textures.exists('hazard_spikes')) {
    scene.textures.remove('hazard_spikes');
  }
  scene.textures.addCanvas('hazard_spikes', spikeCanvas);

  // 2. Spinning Saw / Blade (32x32)
  const sawCanvas = document.createElement('canvas');
  sawCanvas.width = 32;
  sawCanvas.height = 32;
  const sawCtx = sawCanvas.getContext('2d')!;
  sawCtx.fillStyle = '#95a5a6';
  sawCtx.beginPath();
  sawCtx.arc(16, 16, 14, 0, Math.PI * 2);
  sawCtx.fill();
  // Teeth
  sawCtx.fillStyle = '#e74c3c';
  for (let a = 0; a < 8; a++) {
    const rad = (a * Math.PI) / 4;
    sawCtx.beginPath();
    sawCtx.arc(16 + Math.cos(rad) * 13, 16 + Math.sin(rad) * 13, 3, 0, Math.PI * 2);
    sawCtx.fill();
  }
  sawCtx.fillStyle = '#2c3e50';
  sawCtx.beginPath();
  sawCtx.arc(16, 16, 5, 0, Math.PI * 2);
  sawCtx.fill();
  if (scene.textures.exists('hazard_saw')) {
    scene.textures.remove('hazard_saw');
  }
  scene.textures.addCanvas('hazard_saw', sawCanvas);

  // 3. Wall / Pillar Obstacle tile (32x32)
  const wallCanvas = document.createElement('canvas');
  wallCanvas.width = 32;
  wallCanvas.height = 32;
  const wCtx = wallCanvas.getContext('2d')!;
  wCtx.fillStyle = '#34495e';
  wCtx.fillRect(0, 0, 32, 32);
  wCtx.fillStyle = '#2c3e50';
  wCtx.fillRect(2, 2, 28, 28);
  wCtx.strokeStyle = '#1abc9c';
  wCtx.lineWidth = 1;
  wCtx.strokeRect(4, 4, 24, 24);
  if (scene.textures.exists('tile_wall')) {
    scene.textures.remove('tile_wall');
  }
  scene.textures.addCanvas('tile_wall', wallCanvas);

  // 4. Ground & Platform Grass/Stone tile (32x32)
  const groundCanvas = document.createElement('canvas');
  groundCanvas.width = 32;
  groundCanvas.height = 32;
  const gCtx = groundCanvas.getContext('2d')!;
  gCtx.fillStyle = '#27ae60';
  gCtx.fillRect(0, 0, 32, 6);
  gCtx.fillStyle = '#1e824c';
  gCtx.fillRect(0, 6, 32, 2);
  gCtx.fillStyle = '#2c3e50';
  gCtx.fillRect(0, 8, 32, 24);
  gCtx.fillStyle = '#34495e';
  gCtx.fillRect(4, 12, 10, 8);
  gCtx.fillRect(18, 20, 10, 8);
  if (scene.textures.exists('tile_ground')) {
    scene.textures.remove('tile_ground');
  }
  scene.textures.addCanvas('tile_ground', groundCanvas);

  // 5. Floating Platform Tile (32x16)
  const platCanvas = document.createElement('canvas');
  platCanvas.width = 32;
  platCanvas.height = 16;
  const plCtx = platCanvas.getContext('2d')!;
  plCtx.fillStyle = '#00b894';
  plCtx.fillRect(0, 0, 32, 4);
  plCtx.fillStyle = '#2d3436';
  plCtx.fillRect(0, 4, 32, 12);
  plCtx.fillStyle = '#636e72';
  plCtx.fillRect(2, 6, 28, 2);
  if (scene.textures.exists('tile_platform')) {
    scene.textures.remove('tile_platform');
  }
  scene.textures.addCanvas('tile_platform', platCanvas);

  // 6. Breakable Floor Block (32x32)
  const bfCanvas = document.createElement('canvas');
  bfCanvas.width = 32;
  bfCanvas.height = 32;
  const bfCtx = bfCanvas.getContext('2d')!;
  bfCtx.fillStyle = '#78350f';
  bfCtx.fillRect(0, 0, 32, 32);
  bfCtx.fillStyle = '#92400e';
  bfCtx.fillRect(2, 2, 28, 28);
  // Crack marks
  bfCtx.strokeStyle = '#fde047';
  bfCtx.lineWidth = 1.5;
  bfCtx.beginPath();
  bfCtx.moveTo(4, 6);
  bfCtx.lineTo(14, 16);
  bfCtx.lineTo(26, 8);
  bfCtx.moveTo(14, 16);
  bfCtx.lineTo(18, 28);
  bfCtx.stroke();
  if (scene.textures.exists('tile_breakable')) {
    scene.textures.remove('tile_breakable');
  }
  scene.textures.addCanvas('tile_breakable', bfCanvas);

  // 7. Wall Cling / Chimney Surface Tile (32x32)
  const wcCanvas = document.createElement('canvas');
  wcCanvas.width = 32;
  wcCanvas.height = 32;
  const wcCtx = wcCanvas.getContext('2d')!;
  wcCtx.fillStyle = '#1e293b';
  wcCtx.fillRect(0, 0, 32, 32);
  wcCtx.fillStyle = '#0f172a';
  wcCtx.fillRect(2, 2, 28, 28);
  wcCtx.fillStyle = '#38bdf8';
  wcCtx.fillRect(4, 8, 4, 16);
  wcCtx.fillRect(24, 8, 4, 16);
  if (scene.textures.exists('tile_wall_cling')) {
    scene.textures.remove('tile_wall_cling');
  }
  scene.textures.addCanvas('tile_wall_cling', wcCanvas);

  // --- ITEM & EQUIPMENT ICONS (24x24) ---

  // 0. Bare Hands Icon (24x24)
  const fistCanvas = document.createElement('canvas');
  fistCanvas.width = 24;
  fistCanvas.height = 24;
  const fCtx = fistCanvas.getContext('2d')!;
  fCtx.fillStyle = '#f59e0b';
  fCtx.fillRect(6, 8, 12, 10);
  fCtx.fillStyle = '#d97706';
  fCtx.fillRect(4, 11, 4, 6);
  fCtx.fillStyle = '#b45309';
  fCtx.fillRect(8, 6, 8, 4);
  if (scene.textures.exists('icon_fist_bare')) scene.textures.remove('icon_fist_bare');
  scene.textures.addCanvas('icon_fist_bare', fistCanvas);

  // 1. Iron Sword
  const isCanvas = document.createElement('canvas');
  isCanvas.width = 24;
  isCanvas.height = 24;
  const isCtx = isCanvas.getContext('2d')!;
  isCtx.fillStyle = '#cbd5e1';
  isCtx.fillRect(6, 4, 4, 12);
  isCtx.fillStyle = '#94a3b8';
  isCtx.fillRect(10, 4, 2, 12);
  isCtx.fillStyle = '#475569';
  isCtx.fillRect(3, 14, 10, 3); // hilt
  isCtx.fillStyle = '#92400e';
  isCtx.fillRect(7, 17, 2, 5); // handle
  if (scene.textures.exists('icon_sword_iron')) scene.textures.remove('icon_sword_iron');
  scene.textures.addCanvas('icon_sword_iron', isCanvas);

  // 2. Flame Sword
  const fsCanvas = document.createElement('canvas');
  fsCanvas.width = 24;
  fsCanvas.height = 24;
  const fsCtx = fsCanvas.getContext('2d')!;
  fsCtx.fillStyle = '#f97316';
  fsCtx.fillRect(6, 3, 5, 13);
  fsCtx.fillStyle = '#fde047';
  fsCtx.fillRect(8, 2, 2, 12);
  fsCtx.fillStyle = '#7c2d12';
  fsCtx.fillRect(3, 14, 11, 3);
  fsCtx.fillStyle = '#451a03';
  fsCtx.fillRect(7, 17, 3, 5);
  if (scene.textures.exists('icon_sword_flame')) scene.textures.remove('icon_sword_flame');
  scene.textures.addCanvas('icon_sword_flame', fsCanvas);

  // 3. Hunter Bow
  const hbCanvas = document.createElement('canvas');
  hbCanvas.width = 24;
  hbCanvas.height = 24;
  const hbCtx = hbCanvas.getContext('2d')!;
  hbCtx.strokeStyle = '#b45309';
  hbCtx.lineWidth = 2.5;
  hbCtx.beginPath();
  hbCtx.arc(10, 12, 9, -Math.PI / 2.2, Math.PI / 2.2);
  hbCtx.stroke();
  hbCtx.strokeStyle = '#f8fafc';
  hbCtx.lineWidth = 1;
  hbCtx.beginPath();
  hbCtx.moveTo(11, 4);
  hbCtx.lineTo(11, 20);
  hbCtx.stroke();
  // Arrow
  hbCtx.strokeStyle = '#ef4444';
  hbCtx.beginPath();
  hbCtx.moveTo(4, 12);
  hbCtx.lineTo(18, 12);
  hbCtx.stroke();
  if (scene.textures.exists('icon_bow_hunter')) scene.textures.remove('icon_bow_hunter');
  scene.textures.addCanvas('icon_bow_hunter', hbCanvas);

  // 4. Arcane Staff
  const asCanvas = document.createElement('canvas');
  asCanvas.width = 24;
  asCanvas.height = 24;
  const asCtx = asCanvas.getContext('2d')!;
  asCtx.fillStyle = '#78350f';
  asCtx.fillRect(10, 6, 4, 16);
  asCtx.fillStyle = '#a855f7';
  asCtx.beginPath();
  asCtx.arc(12, 5, 5, 0, Math.PI * 2);
  asCtx.fill();
  asCtx.fillStyle = '#38bdf8';
  asCtx.beginPath();
  asCtx.arc(12, 5, 2.5, 0, Math.PI * 2);
  asCtx.fill();
  if (scene.textures.exists('icon_staff_arcane')) scene.textures.remove('icon_staff_arcane');
  scene.textures.addCanvas('icon_staff_arcane', asCanvas);

  // 5. Leather Armor
  const laCanvas = document.createElement('canvas');
  laCanvas.width = 24;
  laCanvas.height = 24;
  const laCtx = laCanvas.getContext('2d')!;
  laCtx.fillStyle = '#9a3412';
  laCtx.fillRect(4, 4, 16, 16);
  laCtx.fillStyle = '#78350f';
  laCtx.fillRect(8, 4, 8, 5);
  laCtx.fillStyle = '#ea580c';
  laCtx.fillRect(6, 10, 12, 8);
  if (scene.textures.exists('icon_armor_leather')) scene.textures.remove('icon_armor_leather');
  scene.textures.addCanvas('icon_armor_leather', laCanvas);

  // 6. Steel Armor
  const saCanvas = document.createElement('canvas');
  saCanvas.width = 24;
  saCanvas.height = 24;
  const saCtx = saCanvas.getContext('2d')!;
  saCtx.fillStyle = '#64748b';
  saCtx.fillRect(4, 4, 16, 16);
  saCtx.fillStyle = '#94a3b8';
  saCtx.fillRect(6, 6, 12, 12);
  saCtx.fillStyle = '#38bdf8';
  saCtx.fillRect(10, 8, 4, 8);
  if (scene.textures.exists('icon_armor_steel')) scene.textures.remove('icon_armor_steel');
  scene.textures.addCanvas('icon_armor_steel', saCanvas);

  // 7. Health Potion
  const hpCanvas = document.createElement('canvas');
  hpCanvas.width = 24;
  hpCanvas.height = 24;
  const hpCtx = hpCanvas.getContext('2d')!;
  hpCtx.fillStyle = '#94a3b8';
  hpCtx.fillRect(9, 3, 6, 3); // cork
  hpCtx.fillStyle = '#ef4444';
  hpCtx.beginPath();
  hpCtx.arc(12, 14, 7, 0, Math.PI * 2);
  hpCtx.fill();
  hpCtx.fillStyle = '#fca5a5';
  hpCtx.fillRect(10, 11, 3, 3);
  if (scene.textures.exists('icon_potion_hp')) scene.textures.remove('icon_potion_hp');
  scene.textures.addCanvas('icon_potion_hp', hpCanvas);

  // 8. Gold Coin
  const coinCanvas = document.createElement('canvas');
  coinCanvas.width = 16;
  coinCanvas.height = 16;
  const cCtx = coinCanvas.getContext('2d')!;
  cCtx.fillStyle = '#eab308';
  cCtx.beginPath();
  cCtx.arc(8, 8, 7, 0, Math.PI * 2);
  cCtx.fill();
  cCtx.fillStyle = '#fef08a';
  cCtx.beginPath();
  cCtx.arc(8, 8, 4.5, 0, Math.PI * 2);
  cCtx.fill();
  cCtx.fillStyle = '#ca8a04';
  cCtx.fillRect(7, 5, 2, 6);
  if (scene.textures.exists('icon_coin_gold')) scene.textures.remove('icon_coin_gold');
  scene.textures.addCanvas('icon_coin_gold', coinCanvas);

  // 9. Player Arrow Projectile (16x8)
  const arrCanvas = document.createElement('canvas');
  arrCanvas.width = 16;
  arrCanvas.height = 8;
  const arrCtx = arrCanvas.getContext('2d')!;
  arrCtx.fillStyle = '#b45309';
  arrCtx.fillRect(0, 3, 12, 2);
  arrCtx.fillStyle = '#e2e8f0';
  arrCtx.beginPath();
  arrCtx.moveTo(12, 1);
  arrCtx.lineTo(16, 4);
  arrCtx.lineTo(12, 7);
  arrCtx.closePath();
  arrCtx.fill();
  if (scene.textures.exists('proj_arrow')) scene.textures.remove('proj_arrow');
  scene.textures.addCanvas('proj_arrow', arrCanvas);

  // 10. Arcane Orb Projectile (16x16)
  const orbCanvas = document.createElement('canvas');
  orbCanvas.width = 16;
  orbCanvas.height = 16;
  const oCtx = orbCanvas.getContext('2d')!;
  oCtx.fillStyle = '#c084fc';
  oCtx.beginPath();
  oCtx.arc(8, 8, 7, 0, Math.PI * 2);
  oCtx.fill();
  oCtx.fillStyle = '#38bdf8';
  oCtx.beginPath();
  oCtx.arc(8, 8, 4, 0, Math.PI * 2);
  oCtx.fill();
  if (scene.textures.exists('proj_arcane')) scene.textures.remove('proj_arcane');
  scene.textures.addCanvas('proj_arcane', orbCanvas);
}
