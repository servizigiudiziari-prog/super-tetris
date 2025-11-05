// Shared types between frontend and backend

export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type GameStatus = 'active' | 'completed' | 'failed';

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  type: PieceType;
  rotation: 0 | 1 | 2 | 3;
  position: Position;
}

export type Grid = (PieceType | null)[][];

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Player extends User {
  playerNumber?: number;
}

export interface GameState {
  id: string;
  seed: number;
  status: GameStatus;
  grid: Grid;
  moveCount: number;
  linesCleared: number;
  targetLines: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Move {
  id: string;
  gameId: string;
  userId: string;
  username?: string;
  moveNumber: number;
  pieceType: PieceType;
  pieceRotation: number;
  positionX: number;
  positionY: number;
  linesCleared: number;
  timeTaken: number;
  createdAt: Date | string;
}

export interface Game {
  id: string;
  seed: number;
  status: GameStatus;
  createdAt: Date | string;
  completedAt?: Date | string;
  targetLines: number;
  totalLinesCleared: number;
  maxDurationHours: number;
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface CreateGameRequest {
  playerIds: string[];
  targetLines?: number;
  maxDurationHours?: number;
}

export interface CreateGameResponse {
  gameId: string;
  seed: number;
  players: Player[];
  initialState: GameState;
}

export interface GetGameStateResponse {
  game: GameState;
  players: Player[];
  recentMoves: Move[];
  nextPiece: PieceType;
  currentTurnPlayerId: string | null;
}

export interface SubmitMoveRequest {
  pieceType: PieceType;
  rotation: 0 | 1 | 2 | 3;
  position: Position;
  timeTaken: number;
}

export interface SubmitMoveResponse {
  success: boolean;
  updatedState: GameState;
  linesCleared: number;
  nextPiece: PieceType;
  gameStatus: GameStatus;
  message?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
}
