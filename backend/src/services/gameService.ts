import { GameModel } from '../models/gameModel';
import { GameStateModel } from '../models/gameStateModel';
import { MoveModel } from '../models/moveModel';
import { UserModel } from '../models/userModel';
import { GameLogic } from '../game/gameLogic';
import { PieceGenerator } from '../game/pieceGenerator';
import { SRS } from '../game/srs';
import {
  Piece,
  Grid,
  GameStatus,
  ValidationError,
  NotFoundError,
  ConflictError,
  CreateGameRequest,
  CreateGameResponse,
  SubmitMoveRequest,
  SubmitMoveResponse,
  GetGameStateResponse,
} from '../types';
import { SPAWN_POSITION } from '../game/constants';
import redis from '../config/redis';

export class GameService {
  /**
   * Create a new game with 4 players
   */
  static async createGame(
    creatorId: string,
    playerIds: string[],
    targetLines?: number,
    maxDurationHours?: number
  ): Promise<CreateGameResponse> {
    // Validate: must have exactly 4 players including creator
    if (playerIds.length !== 4) {
      throw new ValidationError('Game requires exactly 4 players');
    }

    // Validate: creator must be in the player list
    if (!playerIds.includes(creatorId)) {
      throw new ValidationError('Creator must be one of the players');
    }

    // Validate: all players exist
    const players = await UserModel.findByIds(playerIds);
    if (players.length !== 4) {
      throw new ValidationError('One or more players not found');
    }

    // Create game
    const { gameId, seed } = await GameModel.create(
      playerIds,
      targetLines,
      maxDurationHours
    );

    // Get full game state
    const game = await GameModel.findByIdWithPlayers(gameId);
    const state = await GameStateModel.getState(gameId);

    return {
      gameId,
      seed,
      players,
      initialState: {
        id: gameId,
        seed,
        status: 'active' as GameStatus,
        grid: state.grid_state,
        moveCount: 0,
        linesCleared: 0,
        targetLines: game.target_lines,
        createdAt: game.created_at,
        updatedAt: state.updated_at,
      },
    };
  }

  /**
   * Get complete game state
   */
  static async getGameState(gameId: string, userId: string): Promise<GetGameStateResponse> {
    const game = await GameModel.findByIdWithPlayers(gameId);
    if (!game) {
      throw new NotFoundError('Game not found');
    }

    // Verify user is in game
    if (!await GameModel.isUserInGame(gameId, userId)) {
      throw new ValidationError('You are not in this game');
    }

    const state = await GameStateModel.getState(gameId);
    const recentMoves = await MoveModel.getRecentMoves(gameId, 20);
    const lastMove = await MoveModel.getLastMove(gameId);

    // Determine current turn player (simple round-robin based on move count)
    const currentTurnPlayerId = this.getCurrentTurnPlayer(
      game.players,
      state.move_count
    );

    // Get next piece for current player
    const generator = new PieceGenerator(game.seed);
    const nextPieceType = PieceGenerator.getPieceForSeed(game.seed, state.move_count);

    return {
      game: {
        id: gameId,
        seed: game.seed,
        status: game.status,
        grid: state.grid_state,
        moveCount: state.move_count,
        linesCleared: game.total_lines_cleared,
        targetLines: game.target_lines,
        createdAt: game.created_at,
        updatedAt: state.updated_at,
      },
      players: game.players,
      recentMoves,
      nextPiece: nextPieceType,
      currentTurnPlayerId,
    };
  }

  /**
   * Submit a move (place a piece)
   */
  static async submitMove(
    gameId: string,
    userId: string,
    moveRequest: SubmitMoveRequest
  ): Promise<SubmitMoveResponse> {
    // Get game
    const game = await GameModel.findByIdWithPlayers(gameId);
    if (!game) {
      throw new NotFoundError('Game not found');
    }

    // Verify game is active
    if (game.status !== 'active') {
      throw new ConflictError('Game is not active');
    }

    // Verify user is in game
    if (!await GameModel.isUserInGame(gameId, userId)) {
      throw new ValidationError('You are not in this game');
    }

    // Get current state
    const state = await GameStateModel.getState(gameId);
    const currentGrid: Grid = state.grid_state;
    const moveCount = state.move_count;

    // Verify this is the correct piece for this move
    const expectedPieceType = PieceGenerator.getPieceForSeed(game.seed, moveCount);
    if (moveRequest.pieceType !== expectedPieceType) {
      throw new ValidationError(
        `Invalid piece type. Expected ${expectedPieceType}, got ${moveRequest.pieceType}`
      );
    }

    // Create piece object
    const piece: Piece = {
      type: moveRequest.pieceType,
      rotation: moveRequest.rotation,
      position: moveRequest.position,
    };

    // Validate move (check if piece can be placed)
    if (!GameLogic.isValidPosition(piece, currentGrid)) {
      throw new ValidationError('Invalid piece placement - collision detected');
    }

    // Lock piece onto grid
    let newGrid = GameLogic.lockPiece(piece, currentGrid);

    // Clear lines
    const { newGrid: clearedGrid, linesCleared } = GameLogic.clearLines(newGrid);
    newGrid = clearedGrid;

    // Check if game is over (top-out)
    const isGameOver = GameLogic.isGameOver(newGrid);

    // Update game state
    const newMoveCount = moveCount + 1;
    await GameStateModel.updateState(gameId, newGrid, newMoveCount);

    // Record move
    await MoveModel.create(
      gameId,
      userId,
      moveCount,
      piece.type,
      piece.rotation,
      piece.position.x,
      piece.position.y,
      linesCleared,
      moveRequest.timeTaken
    );

    // Update game status if needed
    let gameStatus: GameStatus = game.status;
    if (isGameOver) {
      gameStatus = 'failed';
      await GameModel.updateStatus(gameId, 'failed', new Date());
    } else if (game.total_lines_cleared + linesCleared >= game.target_lines) {
      gameStatus = 'completed';
      await GameModel.updateStatus(gameId, 'completed', new Date());
    }

    // Get next piece
    const nextPieceType = PieceGenerator.getPieceForSeed(game.seed, newMoveCount);

    // Invalidate cache
    await redis.invalidateGameState(gameId);

    return {
      success: true,
      updatedState: {
        id: gameId,
        seed: game.seed,
        status: gameStatus,
        grid: newGrid,
        moveCount: newMoveCount,
        linesCleared: game.total_lines_cleared + linesCleared,
        targetLines: game.target_lines,
        createdAt: game.created_at,
        updatedAt: new Date(),
      },
      linesCleared,
      nextPiece: nextPieceType,
      gameStatus,
      message: this.getGameStatusMessage(gameStatus, linesCleared),
    };
  }

  /**
   * Get next piece for current move count
   */
  static async getNextPiece(gameId: string): Promise<string> {
    const game = await GameModel.findById(gameId);
    if (!game) {
      throw new NotFoundError('Game not found');
    }

    const state = await GameStateModel.getState(gameId);
    return PieceGenerator.getPieceForSeed(game.seed, state.move_count);
  }

  /**
   * Preview next N pieces
   */
  static async previewPieces(gameId: string, count: number = 3): Promise<string[]> {
    const game = await GameModel.findById(gameId);
    if (!game) {
      throw new NotFoundError('Game not found');
    }

    const state = await GameStateModel.getState(gameId);
    const generator = new PieceGenerator(game.seed);

    // Skip to current position
    for (let i = 0; i < state.move_count; i++) {
      generator.getNextPiece();
    }

    // Get preview
    return generator.peekNext(count);
  }

  /**
   * Calculate ghost piece position (hard drop preview)
   */
  static async calculateGhostPosition(
    gameId: string,
    piece: Piece
  ): Promise<{ x: number; y: number }> {
    const state = await GameStateModel.getState(gameId);
    const grid: Grid = state.grid_state;

    return GameLogic.calculateDropPosition(piece, grid);
  }

  /**
   * Get active games for user
   */
  static async getUserActiveGames(userId: string): Promise<any[]> {
    return await GameModel.findActiveGamesByUserId(userId);
  }

  /**
   * Determine whose turn it is (simple round-robin)
   */
  private static getCurrentTurnPlayer(players: any[], moveCount: number): string | null {
    if (players.length === 0) return null;

    // Simple round-robin: player index = moveCount % 4
    const playerIndex = moveCount % players.length;
    return players[playerIndex].id;
  }

  /**
   * Get game status message
   */
  private static getGameStatusMessage(
    status: GameStatus,
    linesCleared: number
  ): string {
    if (status === 'completed') {
      return '🎉 Victory! Target lines reached!';
    } else if (status === 'failed') {
      return '💥 Game Over! Grid filled up.';
    } else if (linesCleared > 0) {
      const messages = {
        1: 'Single! +1 line',
        2: 'Double! +2 lines',
        3: 'Triple! +3 lines',
        4: '🔥 TETRIS! +4 lines',
      };
      return messages[linesCleared as keyof typeof messages] || `+${linesCleared} lines`;
    }
    return 'Move recorded';
  }

  /**
   * Validate if a move is possible (without executing it)
   */
  static async validateMove(
    gameId: string,
    piece: Piece
  ): Promise<{ valid: boolean; reason?: string }> {
    const state = await GameStateModel.getState(gameId);
    if (!state) {
      return { valid: false, reason: 'Game state not found' };
    }

    const grid: Grid = state.grid_state;

    if (!GameLogic.isValidPosition(piece, grid)) {
      return { valid: false, reason: 'Piece collision detected' };
    }

    return { valid: true };
  }

  /**
   * Get game statistics
   */
  static async getGameStats(gameId: string): Promise<any> {
    return await GameModel.getGameStats(gameId);
  }
}
