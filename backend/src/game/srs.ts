import { Piece, Grid } from '../types';
import { GameLogic } from './gameLogic';

/**
 * Super Rotation System (SRS) implementation
 * Standard rotation system for modern Tetris games
 * Includes wall kick data for all pieces
 */

type WallKickOffset = [number, number]; // [x, y]

/**
 * Wall kick data for J, L, S, T, Z pieces
 * Format: transition -> [test1, test2, test3, test4, test5]
 */
const JLSTZ_WALL_KICKS: Record<string, WallKickOffset[]> = {
  '0->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1->0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '1->2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '2->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3->2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '3->0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '0->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

/**
 * Wall kick data for I piece (different from other pieces)
 */
const I_WALL_KICKS: Record<string, WallKickOffset[]> = {
  '0->1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1->0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '1->2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2->1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '2->3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3->2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '3->0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '0->3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

/**
 * O piece doesn't rotate (no wall kicks needed)
 */

export class SRS {
  /**
   * Attempt to rotate piece clockwise
   * Returns rotated piece if successful, null otherwise
   */
  static rotateClockwise(piece: Piece, grid: Grid): Piece | null {
    // O piece doesn't rotate
    if (piece.type === 'O') {
      return piece;
    }

    const newRotation = ((piece.rotation + 1) % 4) as 0 | 1 | 2 | 3;
    return this.tryRotation(piece, newRotation, grid);
  }

  /**
   * Attempt to rotate piece counter-clockwise
   * Returns rotated piece if successful, null otherwise
   */
  static rotateCounterClockwise(piece: Piece, grid: Grid): Piece | null {
    // O piece doesn't rotate
    if (piece.type === 'O') {
      return piece;
    }

    const newRotation = ((piece.rotation + 3) % 4) as 0 | 1 | 2 | 3;
    return this.tryRotation(piece, newRotation, grid);
  }

  /**
   * Try to rotate piece to new rotation state, using wall kicks
   */
  private static tryRotation(piece: Piece, newRotation: 0 | 1 | 2 | 3, grid: Grid): Piece | null {
    const transition = `${piece.rotation}->${newRotation}`;
    const kicks = this.getWallKicks(piece.type, transition);

    // Try each wall kick offset
    for (const [offsetX, offsetY] of kicks) {
      const testPiece: Piece = {
        ...piece,
        rotation: newRotation,
        position: {
          x: piece.position.x + offsetX,
          y: piece.position.y + offsetY,
        },
      };

      if (GameLogic.isValidPosition(testPiece, grid)) {
        return testPiece; // Rotation successful!
      }
    }

    return null; // No valid wall kick found
  }

  /**
   * Get wall kick offsets for a piece type and rotation transition
   */
  private static getWallKicks(pieceType: string, transition: string): WallKickOffset[] {
    if (pieceType === 'I') {
      return I_WALL_KICKS[transition] || [[0, 0]];
    } else if (pieceType === 'O') {
      return [[0, 0]]; // O piece doesn't need wall kicks
    } else {
      return JLSTZ_WALL_KICKS[transition] || [[0, 0]];
    }
  }

  /**
   * Rotate piece 180 degrees (double rotation)
   * Useful for some advanced techniques
   */
  static rotate180(piece: Piece, grid: Grid): Piece | null {
    const firstRotation = this.rotateClockwise(piece, grid);
    if (!firstRotation) return null;

    const secondRotation = this.rotateClockwise(firstRotation, grid);
    return secondRotation;
  }

  /**
   * Check if a rotation is possible (without actually doing it)
   */
  static canRotateClockwise(piece: Piece, grid: Grid): boolean {
    return this.rotateClockwise(piece, grid) !== null;
  }

  /**
   * Check if counter-clockwise rotation is possible
   */
  static canRotateCounterClockwise(piece: Piece, grid: Grid): boolean {
    return this.rotateCounterClockwise(piece, grid) !== null;
  }
}
