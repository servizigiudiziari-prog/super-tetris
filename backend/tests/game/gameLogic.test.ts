import { GameLogic } from '../../src/game/gameLogic';
import { Grid, Piece } from '../../src/types';

describe('GameLogic', () => {
  describe('createEmptyGrid', () => {
    it('should create a 20x10 empty grid', () => {
      const grid = GameLogic.createEmptyGrid();

      expect(grid.length).toBe(20);
      expect(grid[0].length).toBe(10);

      // All cells should be null
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
          expect(grid[y][x]).toBeNull();
        }
      }
    });
  });

  describe('isValidPosition', () => {
    it('should return true for valid position on empty grid', () => {
      const grid = GameLogic.createEmptyGrid();
      const piece: Piece = {
        type: 'O',
        rotation: 0,
        position: { x: 4, y: 0 },
      };

      expect(GameLogic.isValidPosition(piece, grid)).toBe(true);
    });

    it('should return false for out-of-bounds position (left)', () => {
      const grid = GameLogic.createEmptyGrid();
      const piece: Piece = {
        type: 'O',
        rotation: 0,
        position: { x: -1, y: 0 },
      };

      expect(GameLogic.isValidPosition(piece, grid)).toBe(false);
    });

    it('should return false for out-of-bounds position (right)', () => {
      const grid = GameLogic.createEmptyGrid();
      const piece: Piece = {
        type: 'O',
        rotation: 0,
        position: { x: 9, y: 0 }, // O piece is 2 wide, so x=9 is out of bounds
      };

      expect(GameLogic.isValidPosition(piece, grid)).toBe(false);
    });

    it('should return false for out-of-bounds position (bottom)', () => {
      const grid = GameLogic.createEmptyGrid();
      const piece: Piece = {
        type: 'O',
        rotation: 0,
        position: { x: 4, y: 19 }, // O piece is 2 tall, so y=19 is out of bounds
      };

      expect(GameLogic.isValidPosition(piece, grid)).toBe(false);
    });

    it('should return false when colliding with existing piece', () => {
      const grid = GameLogic.createEmptyGrid();
      grid[19][5] = 'I'; // Place a block

      const piece: Piece = {
        type: 'T',
        rotation: 0,
        position: { x: 4, y: 18 }, // Will collide with block below
      };

      expect(GameLogic.isValidPosition(piece, grid)).toBe(false);
    });
  });

  describe('lockPiece', () => {
    it('should lock piece onto grid', () => {
      const grid = GameLogic.createEmptyGrid();
      const piece: Piece = {
        type: 'O',
        rotation: 0,
        position: { x: 4, y: 18 },
      };

      const newGrid = GameLogic.lockPiece(piece, grid);

      // Check that O piece (2x2) is locked
      expect(newGrid[18][4]).toBe('O');
      expect(newGrid[18][5]).toBe('O');
      expect(newGrid[19][4]).toBe('O');
      expect(newGrid[19][5]).toBe('O');

      // Original grid should not be mutated
      expect(grid[18][4]).toBeNull();
    });

    it('should lock I piece horizontally', () => {
      const grid = GameLogic.createEmptyGrid();
      const piece: Piece = {
        type: 'I',
        rotation: 0,
        position: { x: 3, y: 19 },
      };

      const newGrid = GameLogic.lockPiece(piece, grid);

      // I piece in rotation 0 is horizontal (row 1 of shape matrix)
      expect(newGrid[19][3]).toBe('I');
      expect(newGrid[19][4]).toBe('I');
      expect(newGrid[19][5]).toBe('I');
      expect(newGrid[19][6]).toBe('I');
    });
  });

  describe('clearLines', () => {
    it('should clear a full line', () => {
      const grid = GameLogic.createEmptyGrid();
      // Fill bottom row
      for (let x = 0; x < 10; x++) {
        grid[19][x] = 'T';
      }

      const { newGrid, linesCleared } = GameLogic.clearLines(grid);

      expect(linesCleared).toBe(1);
      expect(newGrid[19].every(cell => cell === null)).toBe(true);
    });

    it('should clear multiple lines', () => {
      const grid = GameLogic.createEmptyGrid();
      // Fill bottom 4 rows (Tetris!)
      for (let y = 16; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
          grid[y][x] = 'I';
        }
      }

      const { newGrid, linesCleared } = GameLogic.clearLines(grid);

      expect(linesCleared).toBe(4);
      // All rows should now be empty
      for (let y = 16; y < 20; y++) {
        expect(newGrid[y].every(cell => cell === null)).toBe(true);
      }
    });

    it('should not clear incomplete lines', () => {
      const grid = GameLogic.createEmptyGrid();
      // Fill bottom row except one cell
      for (let x = 0; x < 9; x++) {
        grid[19][x] = 'T';
      }
      grid[19][9] = null; // Leave one empty

      const { newGrid, linesCleared } = GameLogic.clearLines(grid);

      expect(linesCleared).toBe(0);
      // Row should still have the pieces
      expect(newGrid[19][0]).toBe('T');
    });

    it('should shift rows down after clearing', () => {
      const grid = GameLogic.createEmptyGrid();

      // Place a piece on row 18
      grid[18][4] = 'O';

      // Fill row 19 completely
      for (let x = 0; x < 10; x++) {
        grid[19][x] = 'T';
      }

      const { newGrid, linesCleared } = GameLogic.clearLines(grid);

      expect(linesCleared).toBe(1);
      // The O piece should have moved down to row 19
      expect(newGrid[19][4]).toBe('O');
    });
  });

  describe('calculateDropPosition', () => {
    it('should calculate hard drop to bottom on empty grid', () => {
      const grid = GameLogic.createEmptyGrid();
      const piece: Piece = {
        type: 'O',
        rotation: 0,
        position: { x: 4, y: 0 },
      };

      const dropPos = GameLogic.calculateDropPosition(piece, grid);

      expect(dropPos.x).toBe(4);
      expect(dropPos.y).toBe(18); // O piece is 2 tall, so bottom is at y=18
    });

    it('should calculate drop position with obstacle', () => {
      const grid = GameLogic.createEmptyGrid();

      // Place obstacle at row 15
      grid[15][4] = 'I';
      grid[15][5] = 'I';

      const piece: Piece = {
        type: 'O',
        rotation: 0,
        position: { x: 4, y: 0 },
      };

      const dropPos = GameLogic.calculateDropPosition(piece, grid);

      // O piece should stop at row 13 (above the obstacle)
      expect(dropPos.y).toBe(13);
    });
  });

  describe('isGameOver', () => {
    it('should return false for empty grid', () => {
      const grid = GameLogic.createEmptyGrid();
      expect(GameLogic.isGameOver(grid)).toBe(false);
    });

    it('should return true if top rows have blocks', () => {
      const grid = GameLogic.createEmptyGrid();
      grid[0][4] = 'T'; // Block in top row

      expect(GameLogic.isGameOver(grid)).toBe(true);
    });

    it('should return true if second row has blocks', () => {
      const grid = GameLogic.createEmptyGrid();
      grid[1][4] = 'T'; // Block in second row

      expect(GameLogic.isGameOver(grid)).toBe(true);
    });

    it('should return false if blocks are below top 2 rows', () => {
      const grid = GameLogic.createEmptyGrid();
      grid[2][4] = 'T'; // Block in third row

      expect(GameLogic.isGameOver(grid)).toBe(false);
    });
  });

  describe('getGridFillPercentage', () => {
    it('should return 0 for empty grid', () => {
      const grid = GameLogic.createEmptyGrid();
      expect(GameLogic.getGridFillPercentage(grid)).toBe(0);
    });

    it('should return 100 for full grid', () => {
      const grid = GameLogic.createEmptyGrid();
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
          grid[y][x] = 'I';
        }
      }

      expect(GameLogic.getGridFillPercentage(grid)).toBe(100);
    });

    it('should return 50 for half-filled grid', () => {
      const grid = GameLogic.createEmptyGrid();
      // Fill bottom 10 rows (half of 20)
      for (let y = 10; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
          grid[y][x] = 'I';
        }
      }

      expect(GameLogic.getGridFillPercentage(grid)).toBe(50);
    });
  });

  describe('isDangerMode', () => {
    it('should return false for empty grid', () => {
      const grid = GameLogic.createEmptyGrid();
      expect(GameLogic.isDangerMode(grid)).toBe(false);
    });

    it('should return true when fill percentage > 75%', () => {
      const grid = GameLogic.createEmptyGrid();
      // Fill 80% of grid
      const cellsToFill = Math.floor(200 * 0.8); // 160 cells
      let filled = 0;

      outerLoop: for (let y = 19; y >= 0; y--) {
        for (let x = 0; x < 10; x++) {
          if (filled >= cellsToFill) break outerLoop;
          grid[y][x] = 'I';
          filled++;
        }
      }

      expect(GameLogic.isDangerMode(grid)).toBe(true);
    });

    it('should return true when blocks reach top 5 rows', () => {
      const grid = GameLogic.createEmptyGrid();
      grid[4][5] = 'T'; // Block in row 4 (5th row from top)

      expect(GameLogic.isDangerMode(grid)).toBe(true);
    });
  });

  describe('move functions', () => {
    it('tryMoveLeft should move piece left if valid', () => {
      const grid = GameLogic.createEmptyGrid();
      const piece: Piece = {
        type: 'O',
        rotation: 0,
        position: { x: 5, y: 10 },
      };

      const moved = GameLogic.tryMoveLeft(piece, grid);

      expect(moved).not.toBeNull();
      expect(moved?.position.x).toBe(4);
    });

    it('tryMoveLeft should return null if blocked', () => {
      const grid = GameLogic.createEmptyGrid();
      const piece: Piece = {
        type: 'O',
        rotation: 0,
        position: { x: 0, y: 10 }, // Already at left edge
      };

      const moved = GameLogic.tryMoveLeft(piece, grid);

      expect(moved).toBeNull();
    });

    it('tryMoveRight should move piece right if valid', () => {
      const grid = GameLogic.createEmptyGrid();
      const piece: Piece = {
        type: 'O',
        rotation: 0,
        position: { x: 5, y: 10 },
      };

      const moved = GameLogic.tryMoveRight(piece, grid);

      expect(moved).not.toBeNull();
      expect(moved?.position.x).toBe(6);
    });

    it('tryMoveDown should move piece down if valid', () => {
      const grid = GameLogic.createEmptyGrid();
      const piece: Piece = {
        type: 'O',
        rotation: 0,
        position: { x: 5, y: 10 },
      };

      const moved = GameLogic.tryMoveDown(piece, grid);

      expect(moved).not.toBeNull();
      expect(moved?.position.y).toBe(11);
    });
  });
});
