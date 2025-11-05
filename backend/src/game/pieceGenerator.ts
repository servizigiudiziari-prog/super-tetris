import { PieceType } from '../types';
import { SeededRNG } from './rng';
import { ALL_PIECES } from './constants';

/**
 * 7-bag random piece generator
 * Ensures all 7 pieces appear once before any piece repeats
 * This is the modern Tetris standard (prevents droughts and floods)
 */
export class PieceGenerator {
  private rng: SeededRNG;
  private currentBag: PieceType[] = [];
  private nextBag: PieceType[] = [];
  private piecesGenerated: number = 0;

  constructor(seed: number) {
    this.rng = new SeededRNG(seed);
    this.refillBag(); // Fill current bag
    this.refillNextBag(); // Pre-generate next bag for preview
  }

  /**
   * Refill the current bag with all 7 pieces in random order
   */
  private refillBag(): void {
    this.currentBag = this.rng.shuffle(ALL_PIECES);
  }

  /**
   * Refill the next bag (for preview)
   */
  private refillNextBag(): void {
    this.nextBag = this.rng.shuffle(ALL_PIECES);
  }

  /**
   * Get the next piece from the sequence
   */
  getNextPiece(): PieceType {
    if (this.currentBag.length === 0) {
      // Current bag empty, move next bag to current and generate new next bag
      this.currentBag = this.nextBag;
      this.refillNextBag();
    }

    const piece = this.currentBag.shift()!;
    this.piecesGenerated++;
    return piece;
  }

  /**
   * Peek at upcoming pieces without consuming them
   * Used for piece preview feature
   */
  peekNext(count: number): PieceType[] {
    const preview: PieceType[] = [];

    // Get from current bag
    const fromCurrent = Math.min(count, this.currentBag.length);
    preview.push(...this.currentBag.slice(0, fromCurrent));

    // If we need more, get from next bag
    const remaining = count - fromCurrent;
    if (remaining > 0) {
      preview.push(...this.nextBag.slice(0, remaining));
    }

    return preview;
  }

  /**
   * Get piece at specific index (for deterministic replay)
   * This allows us to reconstruct the exact sequence
   */
  getPieceAt(index: number): PieceType {
    const bagIndex = Math.floor(index / 7);
    const positionInBag = index % 7;

    // Create temporary RNG at the right state
    const tempRng = new SeededRNG(this.rng.getState());

    // Skip to the right bag
    let tempBag: PieceType[] = [];
    for (let i = 0; i <= bagIndex; i++) {
      tempBag = tempRng.shuffle(ALL_PIECES);
    }

    return tempBag[positionInBag];
  }

  /**
   * Get total pieces generated so far
   */
  getPiecesGenerated(): number {
    return this.piecesGenerated;
  }

  /**
   * Get the current seed
   */
  getSeed(): number {
    return this.rng.getState();
  }

  /**
   * Static method to get piece at specific index for a given seed
   * Useful for replays without maintaining state
   */
  static getPieceForSeed(seed: number, pieceIndex: number): PieceType {
    const bagNumber = Math.floor(pieceIndex / 7);
    const positionInBag = pieceIndex % 7;

    const rng = new SeededRNG(seed);

    // Generate bags until we reach the target bag
    let bag: PieceType[] = [];
    for (let i = 0; i <= bagNumber; i++) {
      bag = rng.shuffle(ALL_PIECES);
    }

    return bag[positionInBag];
  }
}
