import { PieceType } from '../types';

/**
 * Tetris piece shapes for all rotations
 * Format: [rotation][row][col]
 * 1 = filled cell, 0 = empty cell
 *
 * Rotation states: 0 = spawn, 1 = right, 2 = 180°, 3 = left
 */

export const PIECE_SHAPES: Record<PieceType, number[][][]> = {
  I: [
    // Rotation 0 (spawn state)
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    // Rotation 1 (right)
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    // Rotation 2 (180°)
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
    // Rotation 3 (left)
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],

  O: [
    // O piece doesn't rotate
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
  ],

  T: [
    // Rotation 0
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    // Rotation 1
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    // Rotation 2
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    // Rotation 3
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],

  S: [
    // Rotation 0
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    // Rotation 1
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
    // Rotation 2
    [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0],
    ],
    // Rotation 3
    [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],

  Z: [
    // Rotation 0
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    // Rotation 1
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
    // Rotation 2
    [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    // Rotation 3
    [
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
  ],

  J: [
    // Rotation 0
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    // Rotation 1
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    // Rotation 2
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    // Rotation 3
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  ],

  L: [
    // Rotation 0
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    // Rotation 1
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    // Rotation 2
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    // Rotation 3
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  ],
};

/**
 * Standard Tetris colors for each piece type
 */
export const PIECE_COLORS: Record<PieceType, string> = {
  I: '#00F0F0', // Cyan
  O: '#F0F000', // Yellow
  T: '#A000F0', // Purple
  S: '#00F000', // Green
  Z: '#F00000', // Red
  J: '#0000F0', // Blue
  L: '#F0A000', // Orange
};

/**
 * All piece types (for random generation)
 */
export const ALL_PIECES: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

/**
 * Grid dimensions
 */
export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 20;

/**
 * Spawn position for new pieces (top-center)
 */
export const SPAWN_POSITION = {
  x: 3, // Center-ish (leaves room for different piece widths)
  y: 0, // Top of grid
};
