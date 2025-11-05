import { create } from 'zustand';
import { GameState, Player, Move, PieceType, Piece, Position } from '../types';
import { api } from '../services/api';

interface GameStoreState {
  // Current game state
  currentGame: GameState | null;
  players: Player[];
  recentMoves: Move[];
  nextPiece: PieceType | null;
  currentTurnPlayerId: string | null;

  // Current piece being played
  activePiece: Piece | null;
  ghostPosition: Position | null;
  piecePreview: PieceType[];

  // UI state
  isLoading: boolean;
  error: string | null;
  moveStartTime: number | null;

  // Actions
  loadGame: (gameId: string) => Promise<void>;
  createGame: (playerIds: string[]) => Promise<string>;
  submitMove: (piece: Piece) => Promise<void>;
  setActivePiece: (piece: Piece | null) => void;
  updateGhostPosition: (position: Position | null) => void;
  loadPiecePreview: (gameId: string) => Promise<void>;
  startMove: () => void;
  clearError: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  currentGame: null,
  players: [],
  recentMoves: [],
  nextPiece: null,
  currentTurnPlayerId: null,
  activePiece: null,
  ghostPosition: null,
  piecePreview: [],
  isLoading: false,
  error: null,
  moveStartTime: null,

  loadGame: async (gameId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getGameState(gameId);
      set({
        currentGame: response.game,
        players: response.players,
        recentMoves: response.recentMoves,
        nextPiece: response.nextPiece,
        currentTurnPlayerId: response.currentTurnPlayerId,
        isLoading: false,
      });

      // Load piece preview
      await get().loadPiecePreview(gameId);
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || error.message || 'Failed to load game',
        isLoading: false,
      });
      throw error;
    }
  },

  createGame: async (playerIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.createGame({ playerIds });
      set({
        currentGame: response.initialState,
        players: response.players,
        nextPiece: null,
        isLoading: false,
      });

      // Load initial game state
      await get().loadGame(response.gameId);

      return response.gameId;
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || error.message || 'Failed to create game',
        isLoading: false,
      });
      throw error;
    }
  },

  submitMove: async (piece: Piece) => {
    const { currentGame, moveStartTime } = get();
    if (!currentGame) throw new Error('No active game');

    const timeTaken = moveStartTime ? Math.floor((Date.now() - moveStartTime) / 1000) : 0;

    set({ isLoading: true, error: null });
    try {
      const response = await api.submitMove(currentGame.id, {
        pieceType: piece.type,
        rotation: piece.rotation,
        position: piece.position,
        timeTaken,
      });

      set({
        currentGame: response.updatedState,
        nextPiece: response.nextPiece,
        activePiece: null,
        ghostPosition: null,
        moveStartTime: null,
        isLoading: false,
      });

      // Reload full game state to get updated moves and turn
      await get().loadGame(currentGame.id);
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || error.message || 'Failed to submit move',
        isLoading: false,
      });
      throw error;
    }
  },

  setActivePiece: (piece: Piece | null) => {
    set({ activePiece: piece });
  },

  updateGhostPosition: (position: Position | null) => {
    set({ ghostPosition: position });
  },

  loadPiecePreview: async (gameId: string) => {
    try {
      const preview = await api.previewPieces(gameId, 3);
      set({ piecePreview: preview as PieceType[] });
    } catch (error) {
      console.error('Failed to load piece preview:', error);
    }
  },

  startMove: () => {
    set({ moveStartTime: Date.now() });
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      currentGame: null,
      players: [],
      recentMoves: [],
      nextPiece: null,
      currentTurnPlayerId: null,
      activePiece: null,
      ghostPosition: null,
      piecePreview: [],
      error: null,
      moveStartTime: null,
    });
  },
}));
