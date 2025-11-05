import database from '../config/database';
import { Player } from '../types';

export class UserModel {
  /**
   * Create a new user
   */
  static async create(
    username: string,
    email: string,
    passwordHash: string
  ): Promise<Player> {
    const result = await database.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, created_at`,
      [username, email, passwordHash]
    );

    return result.rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<any | null> {
    const result = await database.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<Player | null> {
    const result = await database.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Find user by username
   */
  static async findByUsername(username: string): Promise<Player | null> {
    const result = await database.query(
      'SELECT id, username, email, created_at FROM users WHERE username = $1',
      [username]
    );

    return result.rows[0] || null;
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string): Promise<boolean> {
    const result = await database.query(
      'SELECT 1 FROM users WHERE email = $1',
      [email]
    );

    return result.rows.length > 0;
  }

  /**
   * Check if username exists
   */
  static async usernameExists(username: string): Promise<boolean> {
    const result = await database.query(
      'SELECT 1 FROM users WHERE username = $1',
      [username]
    );

    return result.rows.length > 0;
  }

  /**
   * Get user with password hash (for authentication)
   */
  static async findByEmailWithPassword(email: string): Promise<any | null> {
    const result = await database.query(
      'SELECT id, username, email, password_hash, created_at FROM users WHERE email = $1',
      [email]
    );

    return result.rows[0] || null;
  }

  /**
   * Update user IGD score (for research)
   */
  static async updateIGDScore(userId: string, score: number): Promise<void> {
    await database.query(
      'UPDATE users SET igd_score_baseline = $1 WHERE id = $2',
      [score, userId]
    );
  }

  /**
   * Update social network size (for research)
   */
  static async updateSocialNetworkSize(userId: string, size: number): Promise<void> {
    await database.query(
      'UPDATE users SET social_network_size = $1 WHERE id = $2',
      [size, userId]
    );
  }

  /**
   * Search users by username (for invites)
   */
  static async searchByUsername(query: string, limit: number = 10): Promise<Player[]> {
    const result = await database.query(
      `SELECT id, username, email, created_at
       FROM users
       WHERE username ILIKE $1
       LIMIT $2`,
      [`%${query}%`, limit]
    );

    return result.rows;
  }

  /**
   * Get multiple users by IDs
   */
  static async findByIds(ids: string[]): Promise<Player[]> {
    const result = await database.query(
      'SELECT id, username, email, created_at FROM users WHERE id = ANY($1)',
      [ids]
    );

    return result.rows;
  }

  /**
   * Get user statistics (for profile)
   */
  static async getUserStats(userId: string): Promise<any> {
    const result = await database.query(
      `SELECT
        COUNT(DISTINCT gp.game_id) as total_games,
        COUNT(DISTINCT CASE WHEN g.status = 'completed' THEN gp.game_id END) as games_won,
        COUNT(DISTINCT CASE WHEN g.status = 'failed' THEN gp.game_id END) as games_lost,
        COALESCE(SUM(m.lines_cleared), 0) as total_lines_cleared,
        COUNT(m.id) as total_moves
      FROM users u
      LEFT JOIN game_players gp ON u.id = gp.user_id
      LEFT JOIN games g ON gp.game_id = g.id
      LEFT JOIN moves m ON u.id = m.user_id
      WHERE u.id = $1
      GROUP BY u.id`,
      [userId]
    );

    return result.rows[0] || {
      total_games: 0,
      games_won: 0,
      games_lost: 0,
      total_lines_cleared: 0,
      total_moves: 0
    };
  }
}
