import { SCORE_CONFIG } from '../config/gameConfig';

export interface ScoreState {
  currentScore: number;
  distanceMeters: number;
  kills: number;
  killStreak: number;
  multiplier: number;
  highScore: number;
  isNewHighScore: boolean;
}

export class ScoreManager {
  private currentScore = 0;
  private maxDistanceMeters = 0;
  private totalKills = 0;
  private killStreak = 0;
  private killStreakTimer = 0;
  private multiplier = 1.0;
  private highScore = 0;
  private isNewHighScore = false;

  constructor() {
    this.highScore = this.loadHighScore();
  }

  public reset(): void {
    this.currentScore = 0;
    this.maxDistanceMeters = 0;
    this.totalKills = 0;
    this.killStreak = 0;
    this.killStreakTimer = 0;
    this.multiplier = 1.0;
    this.isNewHighScore = false;
    this.highScore = this.loadHighScore();
  }

  private loadHighScore(): number {
    try {
      const saved = localStorage.getItem(SCORE_CONFIG.storageKeyHighScore);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }

  public saveHighScore(): boolean {
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      this.isNewHighScore = true;
      try {
        localStorage.setItem(SCORE_CONFIG.storageKeyHighScore, this.highScore.toString());
      } catch {
        // Storage might fail in sandboxed iframes
      }
      return true;
    }
    return false;
  }

  public updateDistance(playerX: number): number {
    const meters = Math.max(0, Math.floor(playerX / 100));
    if (meters > this.maxDistanceMeters) {
      const addedMeters = meters - this.maxDistanceMeters;
      this.maxDistanceMeters = meters;
      this.addScore(addedMeters * SCORE_CONFIG.pointsPerMeter);
    }
    return this.maxDistanceMeters;
  }

  public recordKill(enemyType: 'melee' | 'ranged', comboCount: number = 1): number {
    this.totalKills++;
    this.killStreak++;
    this.killStreakTimer = SCORE_CONFIG.killStreakWindowMs;

    // Multiplier calculation (1.0 -> 1.2 -> 1.4 -> ... up to max 3.0)
    this.multiplier = Math.min(
      SCORE_CONFIG.maxStreakMultiplier,
      1.0 + (this.killStreak - 1) * SCORE_CONFIG.streakMultiplierStep
    );

    const basePts = SCORE_CONFIG.killPoints[enemyType] || 100;
    const comboBonus = (comboCount - 1) * SCORE_CONFIG.comboKillBonus;
    const earnedPoints = Math.round((basePts + comboBonus) * this.multiplier);

    this.addScore(earnedPoints);
    return earnedPoints;
  }

  private addScore(amount: number): void {
    this.currentScore += amount;
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      this.isNewHighScore = true;
    }
  }

  public update(delta: number): void {
    if (this.killStreakTimer > 0) {
      this.killStreakTimer -= delta;
      if (this.killStreakTimer <= 0) {
        this.killStreak = 0;
        this.multiplier = 1.0;
      }
    }
  }

  public getState(): ScoreState {
    return {
      currentScore: this.currentScore,
      distanceMeters: this.maxDistanceMeters,
      kills: this.totalKills,
      killStreak: this.killStreak,
      multiplier: Number(this.multiplier.toFixed(1)),
      highScore: this.highScore,
      isNewHighScore: this.isNewHighScore
    };
  }
}
