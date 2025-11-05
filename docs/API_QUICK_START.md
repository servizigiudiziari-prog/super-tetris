# TCA API Quick Start Guide

Quick reference for testing the Tetris Cooperativo Asincrono API.

## 🚀 Setup (5 minutes)

```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Install backend dependencies
cd backend
npm install

# 3. Run migrations
psql -h localhost -U tetris -d tetris_coop -f migrations/1699000000000_initial-schema.sql
# Password: tetris_dev_password

# 4. Start server
npm run dev
```

Server running at `http://localhost:3000`

## 📝 Test Flow

### Step 1: Register 4 Players

```bash
# Player 1
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@test.com",
    "password": "SecurePass123"
  }'

# Player 2
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bob",
    "email": "bob@test.com",
    "password": "SecurePass123"
  }'

# Player 3
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "charlie",
    "email": "charlie@test.com",
    "password": "SecurePass123"
  }'

# Player 4
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "diana",
    "email": "diana@test.com",
    "password": "SecurePass123"
  }'
```

**Save the returned user IDs and tokens!**

### Step 2: Login as Player 1

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@test.com",
    "password": "SecurePass123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-alice",
      "username": "alice",
      "email": "alice@test.com"
    },
    "token": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

**Save the token for subsequent requests!**

### Step 3: Create a Game

```bash
TOKEN="your_token_here"

curl -X POST http://localhost:3000/api/games/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "playerIds": [
      "uuid-alice",
      "uuid-bob",
      "uuid-charlie",
      "uuid-diana"
    ],
    "targetLines": 100,
    "maxDurationHours": 24
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "gameId": "game-uuid",
    "seed": 123456,
    "players": [...],
    "initialState": {
      "grid": [[null, null, ...], ...],
      "moveCount": 0,
      "linesCleared": 0
    }
  }
}
```

**Save the gameId!**

### Step 4: Get Game State

```bash
GAME_ID="your_game_id_here"

curl -X GET "http://localhost:3000/api/games/$GAME_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 5: Submit a Move

```bash
curl -X POST "http://localhost:3000/api/games/$GAME_ID/moves" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "pieceType": "T",
    "rotation": 0,
    "position": {
      "x": 4,
      "y": 18
    },
    "timeTaken": 15
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "success": true,
    "updatedState": {
      "grid": [...],
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

### Step 6: Get Next Piece

```bash
curl -X GET "http://localhost:3000/api/games/$GAME_ID/next-piece" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 7: Preview Pieces

```bash
curl -X GET "http://localhost:3000/api/games/$GAME_ID/preview?count=5" \
  -H "Authorization: Bearer $TOKEN"
```

## 🎮 Playing a Full Turn

```bash
# 1. Get game state (see current grid and whose turn)
curl -X GET "http://localhost:3000/api/games/$GAME_ID" \
  -H "Authorization: Bearer $TOKEN"

# 2. Get next piece
curl -X GET "http://localhost:3000/api/games/$GAME_ID/next-piece" \
  -H "Authorization: Bearer $TOKEN"

# 3. (Optional) Calculate ghost position
curl -X POST "http://localhost:3000/api/games/$GAME_ID/ghost-position" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "pieceType": "O",
    "rotation": 0,
    "position": { "x": 4, "y": 0 }
  }'

# 4. (Optional) Validate move before submitting
curl -X POST "http://localhost:3000/api/games/$GAME_ID/validate-move" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "pieceType": "O",
    "rotation": 0,
    "position": { "x": 4, "y": 18 }
  }'

# 5. Submit move
curl -X POST "http://localhost:3000/api/games/$GAME_ID/moves" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "pieceType": "O",
    "rotation": 0,
    "position": { "x": 4, "y": 18 },
    "timeTaken": 12
  }'
```

## 🧪 Testing Scenarios

### Scenario 1: Clear a Line

```bash
# Submit 10 moves to fill bottom row
# (Requires precise positioning - see piece shapes in constants.ts)

# When line is cleared, response will show:
# "linesCleared": 1
# "message": "Single! +1 line"
```

### Scenario 2: Tetris (4 lines)

```bash
# Stack pieces to create 4 complete rows
# Submit I piece vertically to clear all 4

# Response will show:
# "linesCleared": 4
# "message": "🔥 TETRIS! +4 lines"
```

### Scenario 3: Game Victory

```bash
# Clear 100 lines total
# Last move that reaches 100 will show:
# "gameStatus": "completed"
# "message": "🎉 Victory! Target lines reached!"
```

### Scenario 4: Top-Out (Game Over)

```bash
# Fill grid to top (row 0 or 1 has blocks)
# Next move that causes top-out:
# "gameStatus": "failed"
# "message": "💥 Game Over! Grid filled up."
```

## 🐛 Troubleshooting

### Error: "Invalid piece type"
- You submitted a piece that doesn't match the expected sequence
- Check `/api/games/:gameId/next-piece` for the correct piece

### Error: "Invalid piece placement - collision"
- The piece position overlaps with existing pieces
- Use `/api/games/:gameId/validate-move` to check first

### Error: "You are not in this game"
- You're trying to access a game you're not part of
- Only the 4 players in a game can access it

### Error: "Game is not active"
- Game has ended (completed or failed)
- Create a new game to continue playing

## 📊 Monitoring

### Check Health
```bash
curl http://localhost:3000/api/health
```

### Get User's Active Games
```bash
curl -X GET http://localhost:3000/api/games/my-active \
  -H "Authorization: Bearer $TOKEN"
```

### Get Game Stats
```bash
curl -X GET "http://localhost:3000/api/games/$GAME_ID/stats" \
  -H "Authorization: Bearer $TOKEN"
```

## 🔐 Token Management

### Refresh Token
```bash
REFRESH_TOKEN="your_refresh_token"

curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
```

### Get Current User
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

## 📝 Piece Types and Rotations

```
I: Cyan    - Straight line (4 blocks)
O: Yellow  - Square (4 blocks)
T: Purple  - T-shape (4 blocks)
S: Green   - S-shape (4 blocks)
Z: Red     - Z-shape (4 blocks)
J: Blue    - J-shape (4 blocks)
L: Orange  - L-shape (4 blocks)
```

Rotation values: `0, 1, 2, 3` (clockwise)

Grid coordinates:
- X: 0-9 (left to right)
- Y: 0-19 (top to bottom)

## 🎯 Next Steps

1. **Test multiplayer**: Have 4 players take turns submitting moves
2. **Test line clearing**: Fill rows and see them disappear
3. **Test victory**: Reach 100 lines as a team
4. **Test game over**: Fill the grid to the top
5. **Monitor performance**: Check response times and database queries

## 📚 Full Documentation

See `backend/README.md` for complete API documentation.

---

**Happy Testing! 🎮**
