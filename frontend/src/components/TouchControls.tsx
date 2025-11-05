import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  GestureResponderEvent,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../utils/constants';

interface TouchControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onRotate: () => void;
  onHardDrop: () => void;
  onPlace: () => void;
  disabled?: boolean;
}

export default function TouchControls({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotate,
  onHardDrop,
  onPlace,
  disabled = false,
}: TouchControlsProps) {
  return (
    <View style={styles.container}>
      {/* Top row: Rotate and Hard Drop */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={[styles.button, styles.rotateButton, disabled && styles.buttonDisabled]}
          onPress={onRotate}
          disabled={disabled}
        >
          <Text style={styles.buttonText}>🔄</Text>
          <Text style={styles.buttonLabel}>Rotate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dropButton, disabled && styles.buttonDisabled]}
          onPress={onHardDrop}
          disabled={disabled}
        >
          <Text style={styles.buttonText}>⬇️</Text>
          <Text style={styles.buttonLabel}>Hard Drop</Text>
        </TouchableOpacity>
      </View>

      {/* Middle row: Movement D-Pad */}
      <View style={styles.dPadContainer}>
        <View style={styles.dPad}>
          <View style={styles.dPadRow}>
            <View style={styles.dPadSpacer} />
            <TouchableOpacity
              style={[styles.dPadButton, disabled && styles.buttonDisabled]}
              onPress={onMoveDown}
              disabled={disabled}
            >
              <Text style={styles.dPadText}>▼</Text>
            </TouchableOpacity>
            <View style={styles.dPadSpacer} />
          </View>
          <View style={styles.dPadRow}>
            <TouchableOpacity
              style={[styles.dPadButton, disabled && styles.buttonDisabled]}
              onPress={onMoveLeft}
              disabled={disabled}
            >
              <Text style={styles.dPadText}>◀</Text>
            </TouchableOpacity>
            <View style={styles.dPadCenter} />
            <TouchableOpacity
              style={[styles.dPadButton, disabled && styles.buttonDisabled]}
              onPress={onMoveRight}
              disabled={disabled}
            >
              <Text style={styles.dPadText}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom row: Place piece */}
      <TouchableOpacity
        style={[styles.button, styles.placeButton, disabled && styles.buttonDisabled]}
        onPress={onPlace}
        disabled={disabled}
      >
        <Text style={[styles.buttonText, styles.placeButtonText]}>
          ✓ Place Piece
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.gridBackground,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  rotateButton: {
    borderColor: COLORS.warning,
  },
  dropButton: {
    borderColor: COLORS.danger,
  },
  placeButton: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
    marginHorizontal: 0,
    marginTop: SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonText: {
    fontSize: FONT_SIZES.xlarge,
    marginBottom: SPACING.xs,
  },
  buttonLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
  },
  placeButtonText: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  dPadContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dPad: {
    width: 200,
  },
  dPadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dPadButton: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.gridBackground,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    margin: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dPadCenter: {
    width: 60,
    height: 60,
    margin: SPACING.xs,
  },
  dPadSpacer: {
    width: 60,
    height: 60,
    margin: SPACING.xs,
  },
  dPadText: {
    fontSize: FONT_SIZES.xlarge,
    color: COLORS.text,
  },
});
