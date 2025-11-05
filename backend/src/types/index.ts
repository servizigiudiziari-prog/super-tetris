// Piece types (Tetrominos)
export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

// Game types
export type GameStatus = 'active' | 'completed' | 'failed';

export interface Position {
  x: number; // 0-9
  y: number; // 0-19
}

export interface Piece {
  type: PieceType;
  rotation: 0 | 1 | 2 | 3;
  position: Position;
}

export type Grid = (PieceType | null)[][]; // [y][x] - 20x10

export interface GameState {
  id: string;
  seed: number;
  status: GameStatus;
  grid: Grid;
  moveCount: number;
  linesCleared: number;
  targetLines: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Move {
  id: string;
  gameId: string;
  userId: string;
  moveNumber: number;
  piece: Piece;
  linesCleared: number;
  timeTaken: number; // seconds
  createdAt: Date;
}

export interface Player {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface GamePlayer {
  gameId: string;
  userId: string;
  playerNumber: number; // 1-4
  joinedAt: Date;
}

// API Request/Response types
export interface CreateGameRequest {
  playerIds: string[]; // Must be exactly 4 players
  targetLines?: number;
  maxDurationHours?: number;
}

export interface CreateGameResponse {
  gameId: string;
  seed: number;
  players: Player[];
  initialState: GameState;
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

export interface GetGameStateResponse {
  game: GameState;
  players: Player[];
  recentMoves: Move[];
  nextPiece: PieceType;
  currentTurnPlayerId: string | null;
}

// Authentication types
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
  };
  token: string;
  refreshToken: string;
}

// Analytics types
export type AnalyticsEventType =
  | 'session_start'
  | 'session_end'
  | 'game_joined'
  | 'move_made'
  | 'game_completed'
  | 'game_failed'
  | 'invite_sent'
  | 'invite_accepted'
  | 'flow_survey_completed'
  | 'frustration_reported'
  | 'notification_received'
  | 'notification_clicked';

export interface AnalyticsEvent {
  id: string;
  userId: string;
  gameId?: string;
  eventType: AnalyticsEventType;
  eventData: Record<string, any>;
  createdAt: Date;
}

// Notification types
export type NotificationType =
  | 'turn_ready'
  | 'game_complete'
  | 'game_failed'
  | 'danger_mode'
  | 'invite_received';

export interface Notification {
  id: string;
  userId: string;
  gameId?: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  sentAt: Date;
  readAt?: Date;
}

// Error types
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(401, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(409, message);
  }
}
