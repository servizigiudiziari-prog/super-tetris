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
import { COLORS, SPACING, FONT_SIZES } from '../utils/constants';

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
    piecePreview,
    isLoading,
    error,
    loadGame,
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

  if (isLoading || !currentGame) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  const currentPlayer = players.find((p) => p.id === currentTurnPlayerId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Game Status */}
      <View style={styles.statusBar}>
        <View>
          <Text style={styles.linesText}>
            {currentGame.linesCleared} / {currentGame.targetLines} Lines
          </Text>
          <Text style={styles.statusText}>
            Status: {currentGame.status === 'active' ? '🟢 Active' : '🔴 Ended'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.movesText}>Moves: {currentGame.moveCount}</Text>
          {currentPlayer && (
            <Text style={[styles.turnText, isMyTurn && styles.myTurnText]}>
              {isMyTurn ? "🎯 Your turn!" : `${currentPlayer.username}'s turn`}
            </Text>
          )}
        </View>
      </View>

      {/* Main Game Area */}
      <View style={styles.gameArea}>
        <View style={styles.leftPanel}>
          {/* Players List */}
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
                  {player.username} {player.id === user?.id && '(You)'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tetris Grid */}
        <View style={styles.gridContainer}>
          <TetrisGrid grid={currentGame.grid} />
        </View>

        <View style={styles.rightPanel}>
          {/* Piece Preview */}
          {piecePreview.length > 0 && <PiecePreview pieces={piecePreview} />}
        </View>
      </View>

      {/* Controls (placeholder) */}
      {isMyTurn && currentGame.status === 'active' && (
        <View style={styles.controlsArea}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => {
              Alert.alert('Coming Soon', 'Game controls will be implemented next!');
            }}
          >
            <Text style={styles.playButtonText}>🎮 Make Your Move</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isMyTurn && currentGame.status === 'active' && (
        <View style={styles.waitingArea}>
          <Text style={styles.waitingText}>⏳ Waiting for other players...</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => loadGame(gameId)}
          >
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>
      )}

      {currentGame.status !== 'active' && (
        <View style={styles.gameOverArea}>
          <Text style={styles.gameOverText}>
            {currentGame.status === 'completed' ? '🎉 Victory!' : '💥 Game Over'}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      )}

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
  linesText: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statusText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  movesText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
  },
  turnText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  myTurnText: {
    color: COLORS.success,
    fontWeight: 'bold',
  },
  gameArea: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  leftPanel: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  rightPanel: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  gridContainer: {
    alignItems: 'center',
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
  controlsArea: {
    marginTop: SPACING.md,
  },
  playButton: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  waitingArea: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  waitingText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  refreshButton: {
    backgroundColor: COLORS.gridBackground,
    borderRadius: 8,
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  refreshButtonText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.primary,
  },
  gameOverArea: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  gameOverText: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.text,
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
