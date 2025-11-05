# Tetris Cooperativo Asincrono - Backend API

Backend API for the Tetris Cooperativo Asincrono game - a 4-player asynchronous cooperative Tetris game for research purposes.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Server will start on `http://localhost:3000`

### Using Docker

```bash
# From project root
docker-compose up -d

# Backend will connect to PostgreSQL and Redis automatically
```

## 📚 API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player1@example.com",
  "password": "SecurePass123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "player1@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "player1",
      "email": "player1@example.com"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

### Games

All game endpoints require authentication via `Authorization: Bearer {token}` header.

#### Create Game
```http
POST /api/games/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "playerIds": ["uuid1", "uuid2", "uuid3", "uuid4"],
  "targetLines": 100,
  "maxDurationHours": 24
}
```

Response:
```json
{
  "success": true,
  "data": {
    "gameId": "game_uuid",
    "seed": 123456,
    "players": [...],
    "initialState": {
      "grid": [[null, null, ...], ...],
      "moveCount": 0,
      "linesCleared": 0,
      "targetLines": 100
    }
  }
}
```

#### Get Game State
```http
GET /api/games/{gameId}
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": {
    "game": {
      "id": "game_uuid",
      "seed": 123456,
      "status": "active",
      "grid": [[...], ...],
      "moveCount": 0,
      "linesCleared": 0,
      "targetLines": 100
    },
    "players": [...],
    "recentMoves": [...],
    "nextPiece": "T",
    "currentTurnPlayerId": "player_uuid"
  }
}
```

#### Submit Move
```http
POST /api/games/{gameId}/moves
Authorization: Bearer {token}
Content-Type: application/json

{
  "pieceType": "T",
  "rotation": 0,
  "position": {
    "x": 4,
    "y": 18
  },
  "timeTaken": 15
}
```

Response:
```json
{
  "success": true,
  "data": {
    "success": true,
    "updatedState": {
      "grid": [[...], ...],
      "moveCount": 1,
      "linesCleared": 0
    },
    "linesCleared": 0,
    "nextPiece": "I",
    "gameStatus": "active",
    "message": "Move recorded"
  }
}
```

#### Get Next Piece
```http
GET /api/games/{gameId}/next-piece
Authorization: Bearer {token}
```

#### Preview Pieces
```http
GET /api/games/{gameId}/preview?count=3
Authorization: Bearer {token}
```

#### Get User's Active Games
```http
GET /api/games/my-active
Authorization: Bearer {token}
```

#### Validate Move (without executing)
```http
POST /api/games/{gameId}/validate-move
Authorization: Bearer {token}
Content-Type: application/json

{
  "pieceType": "I",
  "rotation": 0,
  "position": { "x": 3, "y": 10 }
}
```

#### Calculate Ghost Position (hard drop preview)
```http
POST /api/games/{gameId}/ghost-position
Authorization: Bearer {token}
Content-Type: application/json

{
  "pieceType": "O",
  "rotation": 0,
  "position": { "x": 4, "y": 0 }
}
```

#### Get Game Statistics
```http
GET /api/games/{gameId}/stats
Authorization: Bearer {token}
```

### Health Check

```http
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

## 🎮 Game Logic

### Tetris Mechanics

- **Grid**: 20 rows x 10 columns (standard Tetris)
- **Pieces**: 7 types (I, O, T, S, Z, J, L)
- **Rotation**: Super Rotation System (SRS) with wall kicks
- **Piece Generation**: 7-bag randomizer (seeded for multiplayer consistency)

### Cooperative Gameplay

- **Players**: Exactly 4 players per game
- **Turns**: Round-robin (player 1, 2, 3, 4, repeat)
- **Shared Grid**: All players place pieces on the same grid
- **Goal**: Reach 100 lines cleared as a team
- **Lose Condition**: Grid fills up (top-out)

### Piece Sequence

All players receive the **same sequence** of pieces based on the game's seed. This ensures fairness and allows for strategic cooperation.

```typescript
// Example: Get piece at index 0 for seed 12345
const piece = PieceGenerator.getPieceForSeed(12345, 0);
// All players will get the same piece
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Check test coverage
npm test -- --coverage
```

## 🏗️ Architecture

### Directory Structure

```
backend/
├── src/
│   ├── config/         # Configuration (env, database, redis)
│   ├── game/           # Core Tetris logic
│   │   ├── constants.ts    # Piece shapes, colors, grid size
│   │   ├── gameLogic.ts    # Collision, line clearing, validation
│   │   ├── pieceGenerator.ts # 7-bag seeded randomizer
│   │   ├── rng.ts          # Seeded RNG (Mulberry32)
│   │   └── srs.ts          # Super Rotation System
│   ├── middleware/     # Express middleware
│   ├── models/         # Database models
│   │   ├── userModel.ts
│   │   ├── gameModel.ts
│   │   ├── gameStateModel.ts
│   │   └── moveModel.ts
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   │   ├── authService.ts
│   │   └── gameService.ts
│   ├── types/          # TypeScript types
│   └── utils/          # Utilities (logger, etc.)
├── tests/              # Test files
└── migrations/         # Database migrations
```

### Key Technologies

- **Express.js**: Web framework
- **TypeScript**: Type safety
- **PostgreSQL**: Relational database
- **Redis**: Caching and session storage
- **JWT**: Authentication
- **bcrypt**: Password hashing
- **Winston**: Logging
- **Jest**: Testing

## 🔒 Security

- Password hashing with bcrypt (10 rounds)
- JWT tokens with expiration
- Rate limiting (10 moves/minute, 1000 API calls/hour)
- Input validation with express-validator
- CORS protection
- Helmet security headers
- SQL injection prevention (parameterized queries)

## 📊 Database Schema

### Main Tables

- `users`: Player accounts
- `games`: Game sessions
- `game_players`: Players in each game (many-to-many)
- `game_states`: Current grid state (JSONB)
- `moves`: Individual piece placements
- `notifications`: Push notification history
- `analytics_events`: Research data collection
- `push_tokens`: Device tokens for notifications

### Automatic Triggers

- **update_game_lines_cleared**: Auto-updates total lines when move inserted
- **check_game_completion**: Auto-completes game when target lines reached

## 🚧 Development

### Scripts

```bash
npm run dev         # Start dev server with nodemon
npm run build       # Compile TypeScript to JavaScript
npm start           # Run compiled JavaScript
npm test            # Run tests
npm run lint        # Run ESLint
npm run lint:fix    # Fix linting issues
```

### Environment Variables

See `.env.example` for all configuration options.

Critical variables:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret key for JWT (MUST change in production!)
- `NODE_ENV`: development | production

## 📝 API Rate Limits

- **Authentication endpoints**: 5 requests per 15 minutes
- **Move submission**: 10 moves per minute
- **General API**: 1000 requests per hour

## 🐛 Debugging

Logs are written to console in development and to files in production:
- `logs/error.log`: Error-level logs
- `logs/combined.log`: All logs

Set `LOG_LEVEL=debug` in `.env` for verbose logging.

## 📈 Monitoring

Health check endpoint provides status of:
- API server
- Database connection
- Redis connection

```bash
curl http://localhost:3000/api/health
```

## 🔄 Deployment

### Production Checklist

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Enable HTTPS
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure log rotation
- [ ] Set up automated backups
- [ ] Review rate limits for production load
- [ ] Configure CORS for production domain

### Recommended Hosting

- **Backend**: Railway, Render, Fly.io, Heroku
- **Database**: Railway PostgreSQL, Supabase, AWS RDS
- **Redis**: Railway Redis, Redis Cloud, AWS ElastiCache

## 📄 License

MIT (or as specified in project root)

## 🤝 Contributing

This is a research project. See main README for contribution guidelines.

---

**Built with ❤️ for cooperative gaming research**
