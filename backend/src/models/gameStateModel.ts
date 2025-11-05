import database from '../config/database';
import { Grid } from '../types';
import { GameLogic } from '../game/gameLogic';

export class GameStateModel {
  /**
   * Get current game state
   */
  static async getState(gameId: string): Promise<any | null> {
    const result = await database.query(
      'SELECT * FROM game_states WHERE game_id = $1',
      [gameId]
    );

    if (!result.rows[0]) return null;

    const state = result.rows[0];
    return {
      ...state,
      grid_state: JSON.parse(state.grid_state),
    };
  }

  /**
   * Update game state (grid and move count)
   */
  static async updateState(
    gameId: string,
    newGrid: Grid,
    moveCount: number
  ): Promise<void> {
    await database.query(
      `UPDATE game_states
       SET grid_state = $1, move_count = $2, updated_at = NOW()
       WHERE game_id = $3`,
      [JSON.stringify(newGrid), moveCount, gameId]
    );
  }

  /**
   * Get grid as parsed object
   */
  static async getGrid(gameId: string): Promise<Grid | null> {
    const state = await this.getState(gameId);
    return state ? state.grid_state : null;
  }

  /**
   * Check if grid is in danger mode
   */
  static async isDangerMode(gameId: string): Promise<boolean> {
    const grid = await this.getGrid(gameId);
    if (!grid) return false;

    return GameLogic.isDangerMode(grid);
  }

  /**
   * Get grid fill percentage
   */
  static async getGridFillPercentage(gameId: string): Promise<number> {
    const grid = await this.getGrid(gameId);
    if (!grid) return 0;

    return GameLogic.getGridFillPercentage(grid);
  }

  /**
   * Check if game is over (top-out)
   */
  static async isGameOver(gameId: string): Promise<boolean> {
    const grid = await this.getGrid(gameId);
    if (!grid) return false;

    return GameLogic.isGameOver(grid);
  }
}
