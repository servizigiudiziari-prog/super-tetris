/**
 * Seeded Random Number Generator using Mulberry32 algorithm
 * This ensures all players get the same piece sequence from the same seed
 */
export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  /**
   * Generate next random number between 0 and 1
   * Uses Mulberry32 algorithm for fast, high-quality pseudo-random numbers
   */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generate random integer between min (inclusive) and max (exclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Shuffle an array in-place using Fisher-Yates algorithm
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Get current seed state (for debugging/testing)
   */
  getState(): number {
    return this.state;
  }

  /**
   * Reset to specific seed
   */
  setSeed(seed: number): void {
    this.state = seed;
  }
}

/**
 * Generate a random seed for new games
 */
export function generateSeed(): number {
  return Math.floor(Math.random() * 2147483647);
}
