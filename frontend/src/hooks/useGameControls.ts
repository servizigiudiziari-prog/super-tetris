import { useState, useEffect, useCallback } from 'react';
import { Piece, Grid, Position, PieceType } from '../types';
import { PIECE_SHAPES, SPAWN_POSITION } from '../utils/constants';

// Game logic helpers (matching backend)
class ClientGameLogic {
  static isValidPosition(piece: Piece, grid: Grid): boolean {
    const shape = PIECE_SHAPES[piece.type][piece.rotation];

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] === 0) continue;

        const gridX = piece.position.x + col;
        const gridY = piece.position.y + row;

        if (gridX < 0 || gridX >= 10 || gridY < 0 || gridY >= 20) {
          return false;
        }

        if (grid[gridY][gridX] !== null) {
          return false;
        }
      }
    }

    return true;
  }

  static calculateDropPosition(piece: Piece, grid: Grid): Position {
    let dropY = piece.position.y;

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

  static tryRotate(piece: Piece, grid: Grid, clockwise: boolean): Piece | null {
    const newRotation = clockwise
      ? ((piece.rotation + 1) % 4) as 0 | 1 | 2 | 3
      : ((piece.rotation + 3) % 4) as 0 | 1 | 2 | 3;

    const rotatedPiece: Piece = {
      ...piece,
      rotation: newRotation,
    };

    // Simple rotation attempt (SRS wall kicks would be implemented here)
    if (this.isValidPosition(rotatedPiece, grid)) {
      return rotatedPiece;
    }

    // Try wall kick: move left
    const kickLeft = { ...rotatedPiece, position: { ...rotatedPiece.position, x: rotatedPiece.position.x - 1 } };
    if (this.isValidPosition(kickLeft, grid)) {
      return kickLeft;
    }

    // Try wall kick: move right
    const kickRight = { ...rotatedPiece, position: { ...rotatedPiece.position, x: rotatedPiece.position.x + 1 } };
    if (this.isValidPosition(kickRight, grid)) {
      return kickRight;
    }

    return null;
  }
}

interface UseGameControlsProps {
  grid: Grid;
  currentPiece: PieceType | null;
  onSubmitMove: (piece: Piece) => Promise<void>;
}

export function useGameControls({ grid, currentPiece, onSubmitMove }: UseGameControlsProps) {
  const [activePiece, setActivePiece] = useState<Piece | null>(null);
  const [ghostPosition, setGhostPosition] = useState<Position | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);

  // Initialize piece when currentPiece changes
  useEffect(() => {
    if (currentPiece && !activePiece) {
      const newPiece: Piece = {
        type: currentPiece,
        rotation: 0,
        position: { x: 3, y: 0 },
      };

      if (ClientGameLogic.isValidPosition(newPiece, grid)) {
        setActivePiece(newPiece);
      }
    }
  }, [currentPiece, activePiece, grid]);

  // Update ghost position whenever active piece changes
  useEffect(() => {
    if (activePiece) {
      const ghost = ClientGameLogic.calculateDropPosition(activePiece, grid);
      setGhostPosition(ghost);
    } else {
      setGhostPosition(null);
    }
  }, [activePiece, grid]);

  const moveLeft = useCallback(() => {
    if (!activePiece || isPlacing) return;

    const newPiece: Piece = {
      ...activePiece,
      position: { x: activePiece.position.x - 1, y: activePiece.position.y },
    };

    if (ClientGameLogic.isValidPosition(newPiece, grid)) {
      setActivePiece(newPiece);
    }
  }, [activePiece, grid, isPlacing]);

  const moveRight = useCallback(() => {
    if (!activePiece || isPlacing) return;

    const newPiece: Piece = {
      ...activePiece,
      position: { x: activePiece.position.x + 1, y: activePiece.position.y },
    };

    if (ClientGameLogic.isValidPosition(newPiece, grid)) {
      setActivePiece(newPiece);
    }
  }, [activePiece, grid, isPlacing]);

  const moveDown = useCallback(() => {
    if (!activePiece || isPlacing) return;

    const newPiece: Piece = {
      ...activePiece,
      position: { x: activePiece.position.x, y: activePiece.position.y + 1 },
    };

    if (ClientGameLogic.isValidPosition(newPiece, grid)) {
      setActivePiece(newPiece);
    }
  }, [activePiece, grid, isPlacing]);

  const rotate = useCallback(() => {
    if (!activePiece || isPlacing) return;

    const rotated = ClientGameLogic.tryRotate(activePiece, grid, true);
    if (rotated) {
      setActivePiece(rotated);
    }
  }, [activePiece, grid, isPlacing]);

  const hardDrop = useCallback(async () => {
    if (!activePiece || !ghostPosition || isPlacing) return;

    setIsPlacing(true);

    const finalPiece: Piece = {
      ...activePiece,
      position: ghostPosition,
    };

    try {
      await onSubmitMove(finalPiece);
      setActivePiece(null);
    } catch (error) {
      console.error('Failed to submit move:', error);
    } finally {
      setIsPlacing(false);
    }
  }, [activePiece, ghostPosition, isPlacing, onSubmitMove]);

  const placePiece = useCallback(async () => {
    if (!activePiece || isPlacing) return;

    setIsPlacing(true);

    try {
      await onSubmitMove(activePiece);
      setActivePiece(null);
    } catch (error) {
      console.error('Failed to submit move:', error);
    } finally {
      setIsPlacing(false);
    }
  }, [activePiece, isPlacing, onSubmitMove]);

  return {
    activePiece,
    ghostPosition,
    isPlacing,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    hardDrop,
    placePiece,
  };
}
