import database from '../config/database';
import { GameState, GameStatus } from '../types';
import { generateSeed } from '../game/rng';

export class GameModel {
  /**
   * Create a new game with 4 players
   */
  static async create(
    playerIds: string[],
    targetLines: number = 100,
    maxDurationHours: number = 24
  ): Promise<{ gameId: string; seed: number }> {
    if (playerIds.length !== 4) {
      throw new Error('Exactly 4 players required');
    }

    const seed = generateSeed();

    const result = await database.transaction(async (client) => {
      // Create game
      const gameResult = await client.query(
        `INSERT INTO games (seed, target_lines, max_duration_hours)
         VALUES ($1, $2, $3)
         RETURNING id, seed`,
        [seed, targetLines, maxDurationHours]
      );

      const gameId = gameResult.rows[0].id;

      // Add players
      for (let i = 0; i < playerIds.length; i++) {
        await client.query(
          `INSERT INTO game_players (game_id, user_id, player_number)
           VALUES ($1, $2, $3)`,
          [gameId, playerIds[i], i + 1]
        );
      }

      // Create initial empty game state
      const emptyGrid = Array(20).fill(null).map(() => Array(10).fill(null));
      await client.query(
        `INSERT INTO game_states (game_id, grid_state, move_count)
         VALUES ($1, $2, 0)`,
        [gameId, JSON.stringify(emptyGrid)]
      );

      return { gameId, seed: gameResult.rows[0].seed };
    });

    return result;
  }

  /**
   * Get game by ID
   */
  static async findById(gameId: string): Promise<any | null> {
    const result = await database.query(
      'SELECT * FROM games WHERE id = $1',
      [gameId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get game with players
   */
  static async findByIdWithPlayers(gameId: string): Promise<any | null> {
    const result = await database.query(
      `SELECT
        g.*,
        json_agg(
          json_build_object(
            'id', u.id,
            'username', u.username,
            'email', u.email,
            'player_number', gp.player_number
          ) ORDER BY gp.player_number
        ) as players
      FROM games g
      JOIN game_players gp ON g.id = gp.game_id
      JOIN users u ON gp.user_id = u.id
      WHERE g.id = $1
      GROUP BY g.id`,
      [gameId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get all active games for a user
   */
  static async findActiveGamesByUserId(userId: string): Promise<any[]> {
    const result = await database.query(
      `SELECT
        g.*,
        gs.move_count,
        CASE
          WHEN g.created_at + (g.max_duration_hours || ' hours')::interval < NOW()
          THEN true
          ELSE false
        END as is_expired
      FROM games g
      JOIN game_players gp ON g.id = gp.game_id
      LEFT JOIN game_states gs ON g.id = gs.game_id
      WHERE gp.user_id = $1 AND g.status = 'active'
      ORDER BY g.created_at DESC`,
      [userId]
    );

    return result.rows;
  }

  /**
   * Get game players
   */
  static async getPlayers(gameId: string): Promise<any[]> {
    const result = await database.query(
      `SELECT
        u.id,
        u.username,
        u.email,
        gp.player_number,
        gp.joined_at
      FROM game_players gp
      JOIN users u ON gp.user_id = u.id
      WHERE gp.game_id = $1
      ORDER BY gp.player_number`,
      [gameId]
    );

    return result.rows;
  }

  /**
   * Check if user is in game
   */
  static async isUserInGame(gameId: string, userId: string): Promise<boolean> {
    const result = await database.query(
      'SELECT 1 FROM game_players WHERE game_id = $1 AND user_id = $2',
      [gameId, userId]
    );

    return result.rows.length > 0;
  }

  /**
   * Update game status
   */
  static async updateStatus(
    gameId: string,
    status: GameStatus,
    completedAt?: Date
  ): Promise<void> {
    if (completedAt) {
      await database.query(
        'UPDATE games SET status = $1, completed_at = $2 WHERE id = $3',
        [status, completedAt, gameId]
      );
    } else {
      await database.query(
        'UPDATE games SET status = $1 WHERE id = $2',
        [status, gameId]
      );
    }
  }

  /**
   * Get game statistics
   */
  static async getGameStats(gameId: string): Promise<any> {
    const result = await database.query(
      `SELECT
        g.status,
        g.total_lines_cleared,
        g.target_lines,
        gs.move_count,
        COUNT(DISTINCT m.user_id) as players_who_moved,
        json_agg(
          json_build_object(
            'user_id', m.user_id,
            'username', u.username,
            'moves', user_moves.move_count,
            'lines_cleared', user_moves.lines_cleared
          )
        ) FILTER (WHERE m.user_id IS NOT NULL) as player_stats
      FROM games g
      LEFT JOIN game_states gs ON g.id = gs.game_id
      LEFT JOIN (
        SELECT user_id, game_id, COUNT(*) as move_count, SUM(lines_cleared) as lines_cleared
        FROM moves
        WHERE game_id = $1
        GROUP BY user_id, game_id
      ) user_moves ON g.id = user_moves.game_id
      LEFT JOIN moves m ON g.id = m.game_id AND m.user_id = user_moves.user_id
      LEFT JOIN users u ON m.user_id = u.id
      WHERE g.id = $1
      GROUP BY g.id, gs.move_count`,
      [gameId]
    );

    return result.rows[0];
  }

  /**
   * Get completed games count for user
   */
  static async getCompletedGamesCount(userId: string): Promise<number> {
    const result = await database.query(
      `SELECT COUNT(*) as count
       FROM game_players gp
       JOIN games g ON gp.game_id = g.id
       WHERE gp.user_id = $1 AND g.status = 'completed'`,
      [userId]
    );

    return parseInt(result.rows[0].count);
  }

  /**
   * Get games that need attention (user's turn or danger mode)
   */
  static async getGamesNeedingAttention(userId: string): Promise<any[]> {
    const result = await database.query(
      `SELECT
        g.id,
        g.status,
        g.total_lines_cleared,
        g.target_lines,
        gs.move_count,
        gs.grid_state,
        (
          SELECT COUNT(*)
          FROM moves m
          WHERE m.game_id = g.id AND m.user_id = $1
        ) as my_moves
      FROM games g
      JOIN game_players gp ON g.id = gp.game_id
      LEFT JOIN game_states gs ON g.id = gs.game_id
      WHERE gp.user_id = $1
        AND g.status = 'active'
        AND g.created_at + (g.max_duration_hours || ' hours')::interval > NOW()
      ORDER BY g.created_at DESC`,
      [userId]
    );

    return result.rows;
  }
}
