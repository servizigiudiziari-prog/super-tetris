import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, SPACING, FONT_SIZES } from '../utils/constants';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  const handleNavigateToGame = (gameId: string) => {
    navigation.navigate('Game', { gameId });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome, {user?.username}!</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // TODO: Implement create game flow
              console.log('Create game');
            }}
          >
            <Text style={styles.actionButtonText}>🎮 Create New Game</Text>
            <Text style={styles.actionButtonSubtext}>Invite 3 friends to play</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // TODO: Implement join game flow
              console.log('Join game');
            }}
          >
            <Text style={styles.actionButtonText}>🔍 My Active Games</Text>
            <Text style={styles.actionButtonSubtext}>Continue playing</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              🎯 <Text style={styles.infoBold}>Goal:</Text> Work together with 3 other players to clear 100 lines
            </Text>
            <Text style={styles.infoText}>
              🎲 <Text style={styles.infoBold}>Pieces:</Text> Everyone gets the same sequence of pieces
            </Text>
            <Text style={styles.infoText}>
              ⏰ <Text style={styles.infoBold}>Turns:</Text> Play when you want - it's asynchronous!
            </Text>
            <Text style={styles.infoText}>
              🏆 <Text style={styles.infoBold}>Win:</Text> Reach 100 lines as a team
            </Text>
            <Text style={styles.infoText}>
              💥 <Text style={styles.infoBold}>Lose:</Text> Grid fills to the top
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Research Info</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              This game is part of a research study on cooperative asynchronous gameplay.
              Your gameplay data helps us understand how people collaborate in games.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  welcomeText: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  logoutButton: {
    padding: SPACING.sm,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: FONT_SIZES.medium,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  actionButton: {
    backgroundColor: COLORS.gridBackground,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  actionButtonSubtext: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
  },
  infoBox: {
    backgroundColor: COLORS.gridBackground,
    borderRadius: 8,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gridLine,
  },
  infoText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  infoBold: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});
