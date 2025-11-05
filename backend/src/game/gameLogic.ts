import { Grid, Piece, PieceType, Position } from '../types';
import { PIECE_SHAPES, GRID_WIDTH, GRID_HEIGHT } from './constants';

/**
 * Core Tetris game logic
 * Handles collision detection, piece locking, and line clearing
 */
export class GameLogic {
  /**
   * Create an empty grid (20 rows x 10 columns)
   */
  static createEmptyGrid(): Grid {
    const grid: Grid = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
      grid.push(Array(GRID_WIDTH).fill(null));
    }
    return grid;
  }

  /**
   * Get the shape matrix for a piece at a specific rotation
   */
  static getPieceShape(piece: Piece): number[][] {
    return PIECE_SHAPES[piece.type][piece.rotation];
  }

  /**
   * Check if a piece position is valid (no collision)
   */
  static isValidPosition(piece: Piece, grid: Grid): boolean {
    const shape = this.getPieceShape(piece);

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] === 0) continue; // Empty cell in piece shape

        const gridX = piece.position.x + col;
        const gridY = piece.position.y + row;

        // Check bounds
        if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) {
          return false;
        }

        // Check collision with existing pieces
        if (grid[gridY][gridX] !== null) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Lock a piece onto the grid (permanently place it)
   */
  static lockPiece(piece: Piece, grid: Grid): Grid {
    // Deep clone grid to avoid mutation
    const newGrid = grid.map(row => [...row]);
    const shape = this.getPieceShape(piece);

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] === 1) {
          const gridX = piece.position.x + col;
          const gridY = piece.position.y + row;

          if (gridY >= 0 && gridY < GRID_HEIGHT && gridX >= 0 && gridX < GRID_WIDTH) {
            newGrid[gridY][gridX] = piece.type;
          }
        }
      }
    }

    return newGrid;
  }

  /**
   * Clear completed lines and return new grid + number of lines cleared
   */
  static clearLines(grid: Grid): { newGrid: Grid; linesCleared: number; clearedRows: number[] } {
    const clearedRows: number[] = [];
    const newGrid: Grid = [];

    // Scan from bottom to top
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
      const isFullLine = grid[y].every(cell => cell !== null);

      if (!isFullLine) {
        newGrid.unshift(grid[y]); // Keep this row
      } else {
        clearedRows.push(y); // Track which row was cleared
      }
    }

    const linesCleared = clearedRows.length;

    // Add empty rows at top to maintain grid height
    while (newGrid.length < GRID_HEIGHT) {
      newGrid.unshift(Array(GRID_WIDTH).fill(null));
    }

    return { newGrid, linesCleared, clearedRows };
  }

  /**
   * Calculate hard drop position (where piece would land if dropped)
   */
  static calculateDropPosition(piece: Piece, grid: Grid): Position {
    let dropY = piece.position.y;

    // Keep moving down until collision
    while (
      this.isValidPosition(
        { ...piece, position: { x: piece.position.x, y: dropY + 1 } },
        grid
      )
    ) {
      dropY++;
    }

    return { x: piece.position.x, y: dropY };
  }

  /**
   * Try to move piece left
   */
  static tryMoveLeft(piece: Piece, grid: Grid): Piece | null {
    const newPiece = {
      ...piece,
      position: { x: piece.position.x - 1, y: piece.position.y },
    };

    return this.isValidPosition(newPiece, grid) ? newPiece : null;
  }

  /**
   * Try to move piece right
   */
  static tryMoveRight(piece: Piece, grid: Grid): Piece | null {
    const newPiece = {
      ...piece,
      position: { x: piece.position.x + 1, y: piece.position.y },
    };

    return this.isValidPosition(newPiece, grid) ? newPiece : null;
  }

  /**
   * Try to move piece down (soft drop)
   */
  static tryMoveDown(piece: Piece, grid: Grid): Piece | null {
    const newPiece = {
      ...piece,
      position: { x: piece.position.x, y: piece.position.y + 1 },
    };

    return this.isValidPosition(newPiece, grid) ? newPiece : null;
  }

  /**
   * Check if game is over (top-out condition)
   * A piece can't be placed at spawn position
   */
  static isGameOver(grid: Grid): boolean {
    // Check if any cells in the top 2 rows are filled
    // (pieces spawn at y=0, so if rows 0-1 have blocks, game over)
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (grid[y][x] !== null) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get grid fill percentage (for danger mode detection)
   */
  static getGridFillPercentage(grid: Grid): number {
    let filledCells = 0;
    const totalCells = GRID_WIDTH * GRID_HEIGHT;

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (grid[y][x] !== null) {
          filledCells++;
        }
      }
    }

    return (filledCells / totalCells) * 100;
  }

  /**
   * Get highest filled row (for danger detection)
   */
  static getHighestFilledRow(grid: Grid): number {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      if (grid[y].some(cell => cell !== null)) {
        return y;
      }
    }
    return GRID_HEIGHT - 1; // Grid is empty
  }

  /**
   * Check if grid is in danger mode (>75% full or high blocks)
   */
  static isDangerMode(grid: Grid): boolean {
    const fillPercentage = this.getGridFillPercentage(grid);
    const highestRow = this.getHighestFilledRow(grid);

    return fillPercentage > 75 || highestRow < 5; // Top 5 rows have blocks
  }

  /**
   * Serialize grid to JSON (for database storage)
   */
  static serializeGrid(grid: Grid): string {
    return JSON.stringify(grid);
  }

  /**
   * Deserialize grid from JSON
   */
  static deserializeGrid(json: string): Grid {
    return JSON.parse(json) as Grid;
  }

  /**
   * Clone grid (deep copy)
   */
  static cloneGrid(grid: Grid): Grid {
    return grid.map(row => [...row]);
  }

  /**
   * Get all filled cells positions (for rendering optimizations)
   */
  static getFilledCells(grid: Grid): Array<{ x: number; y: number; type: PieceType }> {
    const cells: Array<{ x: number; y: number; type: PieceType }> = [];

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (grid[y][x] !== null) {
          cells.push({ x, y, type: grid[y][x] as PieceType });
        }
      }
    }

    return cells;
  }
}
