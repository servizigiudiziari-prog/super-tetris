import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Grid, Piece, PieceType, Position } from '../types';
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  PIECE_SHAPES,
  PIECE_COLORS,
  COLORS,
} from '../utils/constants';

interface TetrisGridProps {
  grid: Grid;
  activePiece?: Piece | null;
  ghostPosition?: Position | null;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - 40) / GRID_WIDTH);

export default function TetrisGrid({ grid, activePiece, ghostPosition }: TetrisGridProps) {
  // Helper to check if a position is part of the active piece
  const isPartOfPiece = (piece: Piece, x: number, y: number): boolean => {
    const shape = PIECE_SHAPES[piece.type][piece.rotation];
    const relX = x - piece.position.x;
    const relY = y - piece.position.y;

    if (relY >= 0 && relY < shape.length && relX >= 0 && relX < shape[0].length) {
      return shape[relY][relX] === 1;
    }
    return false;
  };

  // Helper to check if a position is part of the ghost piece
  const isPartOfGhost = (x: number, y: number): boolean => {
    if (!activePiece || !ghostPosition) return false;
    const ghostPiece = { ...activePiece, position: ghostPosition };
    return isPartOfPiece(ghostPiece, x, y);
  };

  // Render a single cell
  const renderCell = (x: number, y: number) => {
    const cellType = grid[y][x];
    const isActive = activePiece && isPartOfPiece(activePiece, x, y);
    const isGhost = isPartOfGhost(x, y);

    let backgroundColor = COLORS.gridBackground;
    let borderColor = COLORS.gridLine;

    if (isActive && activePiece) {
      // Active piece
      backgroundColor = PIECE_COLORS[activePiece.type];
      borderColor = COLORS.text;
    } else if (isGhost) {
      // Ghost piece
      backgroundColor = COLORS.ghostPiece;
      borderColor = COLORS.textSecondary;
    } else if (cellType) {
      // Locked piece
      backgroundColor = PIECE_COLORS[cellType];
      borderColor = COLORS.gridLine;
    }

    return (
      <View
        key={`${x}-${y}`}
        style={[
          styles.cell,
          {
            backgroundColor,
            borderColor,
            width: CELL_SIZE,
            height: CELL_SIZE,
          },
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {Array.from({ length: GRID_HEIGHT }, (_, y) => (
          <View key={y} style={styles.row}>
            {Array.from({ length: GRID_WIDTH }, (_, x) => renderCell(x, y))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.gridBackground,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 0.5,
    borderColor: COLORS.gridLine,
  },
});
