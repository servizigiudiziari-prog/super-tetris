import database from '../config/database';
import { Move } from '../types';

export class MoveModel {
  /**
   * Record a move
   */
  static async create(
    gameId: string,
    userId: string,
    moveNumber: number,
    pieceType: string,
    rotation: number,
    positionX: number,
    positionY: number,
    linesCleared: number,
    timeTaken: number
  ): Promise<Move> {
    const result = await database.query(
      `INSERT INTO moves (
        game_id, user_id, move_number, piece_type, piece_rotation,
        position_x, position_y, lines_cleared, time_taken_seconds
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        gameId,
        userId,
        moveNumber,
        pieceType,
        rotation,
        positionX,
        positionY,
        linesCleared,
        timeTaken,
      ]
    );

    return result.rows[0];
  }

  /**
   * Get all moves for a game
   */
  static async findByGameId(gameId: string, limit?: number): Promise<any[]> {
    const query = limit
      ? `SELECT m.*, u.username
         FROM moves m
         JOIN users u ON m.user_id = u.id
         WHERE m.game_id = $1
         ORDER BY m.move_number DESC
         LIMIT $2`
      : `SELECT m.*, u.username
         FROM moves m
         JOIN users u ON m.user_id = u.id
         WHERE m.game_id = $1
         ORDER BY m.move_number ASC`;

    const params = limit ? [gameId, limit] : [gameId];
    const result = await database.query(query, params);

    return result.rows;
  }

  /**
   * Get recent moves for a game
   */
  static async getRecentMoves(gameId: string, limit: number = 10): Promise<any[]> {
    const result = await database.query(
      `SELECT m.*, u.username
       FROM moves m
       JOIN users u ON m.user_id = u.id
       WHERE m.game_id = $1
       ORDER BY m.move_number DESC
       LIMIT $2`,
      [gameId, limit]
    );

    return result.rows.reverse(); // Return in chronological order
  }

  /**
   * Get total moves count for a game
   */
  static async getMovesCount(gameId: string): Promise<number> {
    const result = await database.query(
      'SELECT COUNT(*) as count FROM moves WHERE game_id = $1',
      [gameId]
    );

    return parseInt(result.rows[0].count);
  }

  /**
   * Get moves by user in a game
   */
  static async findByUserInGame(gameId: string, userId: string): Promise<any[]> {
    const result = await database.query(
      `SELECT m.*
       FROM moves m
       WHERE m.game_id = $1 AND m.user_id = $2
       ORDER BY m.move_number ASC`,
      [gameId, userId]
    );

    return result.rows;
  }

  /**
   * Get last move in game
   */
  static async getLastMove(gameId: string): Promise<any | null> {
    const result = await database.query(
      `SELECT m.*, u.username
       FROM moves m
       JOIN users u ON m.user_id = u.id
       WHERE m.game_id = $1
       ORDER BY m.move_number DESC
       LIMIT 1`,
      [gameId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get user's last move in game
   */
  static async getUserLastMove(gameId: string, userId: string): Promise<any | null> {
    const result = await database.query(
      `SELECT *
       FROM moves
       WHERE game_id = $1 AND user_id = $2
       ORDER BY move_number DESC
       LIMIT 1`,
      [gameId, userId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get total lines cleared by user in game
   */
  static async getTotalLinesClearedByUser(
    gameId: string,
    userId: string
  ): Promise<number> {
    const result = await database.query(
      'SELECT COALESCE(SUM(lines_cleared), 0) as total FROM moves WHERE game_id = $1 AND user_id = $2',
      [gameId, userId]
    );

    return parseInt(result.rows[0].total);
  }
}
