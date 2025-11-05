import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieceType } from '../types';
import { PIECE_SHAPES, PIECE_COLORS, COLORS, SPACING, FONT_SIZES } from '../utils/constants';

interface PiecePreviewProps {
  pieces: PieceType[];
}

const MINI_CELL_SIZE = 12;

export default function PiecePreview({ pieces }: PiecePreviewProps) {
  const renderMiniPiece = (pieceType: PieceType, index: number) => {
    const shape = PIECE_SHAPES[pieceType][0]; // Always show rotation 0
    const color = PIECE_COLORS[pieceType];

    return (
      <View key={index} style={styles.pieceContainer}>
        <Text style={styles.nextText}>{index === 0 ? 'Next' : `+${index}`}</Text>
        <View style={styles.miniGrid}>
          {shape.map((row, y) => (
            <View key={y} style={styles.miniRow}>
              {row.map((cell, x) => (
                <View
                  key={`${x}-${y}`}
                  style={[
                    styles.miniCell,
                    {
                      width: MINI_CELL_SIZE,
                      height: MINI_CELL_SIZE,
                      backgroundColor: cell ? color : 'transparent',
                    },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {pieces.map((piece, index) => renderMiniPiece(piece, index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.gridBackground,
    borderRadius: 8,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gridLine,
  },
  pieceContainer: {
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  nextText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.small,
    marginBottom: SPACING.xs,
  },
  miniGrid: {
    alignItems: 'center',
  },
  miniRow: {
    flexDirection: 'row',
  },
  miniCell: {
    borderWidth: 0.5,
    borderColor: COLORS.gridLine,
  },
});
