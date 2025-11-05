import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import TetrisGrid from '../components/TetrisGrid';
import PiecePreview from '../components/PiecePreview';
import TouchControls from '../components/TouchControls';
import { useGameControls } from '../hooks/useGameControls';
import { COLORS, SPACING, FONT_SIZES } from '../utils/constants';
import { Piece } from '../types';

type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Game'>;
type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;

interface Props {
  navigation: GameScreenNavigationProp;
  route: GameScreenRouteProp;
}

export default function GameScreen({ navigation, route }: Props) {
  const { gameId } = route.params;
  const { user } = useAuthStore();
  const {
    currentGame,
    players,
    currentTurnPlayerId,
    nextPiece,
    piecePreview,
    isLoading,
    error,
    loadGame,
    submitMove,
    startMove,
  } = useGameStore();

  const [isMyTurn, setIsMyTurn] = useState(false);

  useEffect(() => {
    loadGame(gameId).catch((err) => {
      Alert.alert('Error', 'Failed to load game');
      navigation.goBack();
    });
  }, [gameId]);

  useEffect(() => {
    setIsMyTurn(currentTurnPlayerId === user?.id);
  }, [currentTurnPlayerId, user]);

  // Start timer when it's user's turn
  useEffect(() => {
    if (isMyTurn && currentGame?.status === 'active') {
      startMove();
    }
  }, [isMyTurn, currentGame?.status]);

  const handleSubmitMove = async (piece: Piece) => {
    if (!currentGame) return;

    try {
      await submitMove(piece);
      Alert.alert('Success!', 'Move submitted successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit move');
    }
  };

  const controls = useGameControls({
    grid: currentGame?.grid || [],
    currentPiece: isMyTurn ? nextPiece : null,
    onSubmitMove: handleSubmitMove,
  });

  if (isLoading || !currentGame) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  const currentPlayer = players.find((p) => p.id === currentTurnPlayerId);
  const progressPercent = (currentGame.linesCleared / currentGame.targetLines) * 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Game Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusLeft}>
          <Text style={styles.linesText}>
            {currentGame.linesCleared} / {currentGame.targetLines} Lines
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.statusText}>
            {currentGame.status === 'active' ? '🟢 Active' : '🔴 Ended'} • Moves: {currentGame.moveCount}
          </Text>
        </View>
        {currentPlayer && (
          <View style={styles.statusRight}>
            <Text style={[styles.turnText, isMyTurn && styles.myTurnText]}>
              {isMyTurn ? "🎯 YOUR TURN!" : `${currentPlayer.username}'s turn`}
            </Text>
          </View>
        )}
      </View>

      {/* Main Game Area */}
      <View style={styles.gameArea}>
        {/* Left Panel - Players */}
        <View style={styles.sidePanel}>
          <View style={styles.playersBox}>
            <Text style={styles.boxTitle}>Players</Text>
            {players.map((player) => (
              <View
                key={player.id}
                style={[
                  styles.playerItem,
                  player.id === currentTurnPlayerId && styles.playerItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.playerText,
                    player.id === user?.id && styles.playerTextMe,
                  ]}
                >
                  {player.username}
                  {player.id === user?.id && ' (You)'}
                </Text>
                {player.id === currentTurnPlayerId && (
                  <Text style={styles.playerTurnIndicator}>▶</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Center - Tetris Grid */}
        <View style={styles.gridContainer}>
          <TetrisGrid
            grid={currentGame.grid}
            activePiece={controls.activePiece}
            ghostPosition={controls.ghostPosition}
          />
        </View>

        {/* Right Panel - Preview */}
        <View style={styles.sidePanel}>
          {piecePreview.length > 0 && <PiecePreview pieces={piecePreview} />}
        </View>
      </View>

      {/* Controls */}
      {isMyTurn && currentGame.status === 'active' && (
        <View style={styles.controlsArea}>
          <TouchControls
            onMoveLeft={controls.moveLeft}
            onMoveRight={controls.moveRight}
            onMoveDown={controls.moveDown}
            onRotate={controls.rotate}
            onHardDrop={controls.hardDrop}
            onPlace={controls.placePiece}
            disabled={controls.isPlacing || !controls.activePiece}
          />
        </View>
      )}

      {/* Waiting State */}
      {!isMyTurn && currentGame.status === 'active' && (
        <View style={styles.waitingArea}>
          <Text style={styles.waitingText}>⏳ Waiting for {currentPlayer?.username}...</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => loadGame(gameId)}
          >
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Game Over */}
      {currentGame.status !== 'active' && (
        <View style={styles.gameOverArea}>
          <Text style={styles.gameOverText}>
            {currentGame.status === 'completed' ? '🎉 Victory!' : '💥 Game Over'}
          </Text>
          <Text style={styles.gameOverSubtext}>
            {currentGame.status === 'completed'
              ? `Team cleared ${currentGame.linesCleared} lines!`
              : 'The grid filled up. Better luck next time!'}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.text,
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.medium,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.gridBackground,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  statusLeft: {
    flex: 1,
  },
  statusRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  linesText: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gridLine,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
  },
  statusText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  turnText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  myTurnText: {
    color: COLORS.success,
    fontSize: FONT_SIZES.large,
  },
  gameArea: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    justifyContent: 'space-between',
  },
  sidePanel: {
    flex: 1,
  },
  gridContainer: {
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  playersBox: {
    backgroundColor: COLORS.gridBackground,
    borderRadius: 8,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gridLine,
  },
  boxTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    borderRadius: 4,
  },
  playerItemActive: {
    backgroundColor: COLORS.primary + '22',
  },
  playerText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
  },
  playerTextMe: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  playerTurnIndicator: {
    color: COLORS.success,
    fontSize: FONT_SIZES.medium,
  },
  controlsArea: {
    marginTop: SPACING.md,
  },
  waitingArea: {
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.gridBackground,
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  waitingText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  refreshButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  refreshButtonText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.background,
    fontWeight: 'bold',
  },
  gameOverArea: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.gridBackground,
    borderRadius: 12,
    marginTop: SPACING.md,
  },
  gameOverText: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  gameOverSubtext: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  backButtonText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  errorBox: {
    backgroundColor: COLORS.danger + '22',
    borderRadius: 8,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZES.small,
    textAlign: 'center',
  },
});
