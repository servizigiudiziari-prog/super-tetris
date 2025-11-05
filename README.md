# Tetris Cooperativo Asincrono (TCA)

> **Status**: Backend MVP ✅ Complete | Frontend MVP ✅ Complete | Touch Controls ✅ Complete

Puzzle game innovativo dove 4 giocatori collaborano su una griglia Tetris condivisa, giocando in momenti diversi.

## 🎮 Concept

- **4 giocatori** condividono una singola **griglia Tetris 10x20**
- Ogni giocatore riceve **sequenze di pezzi identiche** (stessa seed RNG)
- I giocatori giocano **in momenti diversi** (asincrono), NON simultaneamente
- **Obiettivo comune**: Completare 100 linee prima che la griglia si riempia
- **Cooperazione**: Ogni pezzo posizionato persiste e gli altri devono adattarsi

## 🚀 Quick Start

> **🧪 Guida Completa al Testing**: Per istruzioni dettagliate in italiano su come testare l'applicazione (backend API e app mobile), vedi [GUIDA_TEST.md](./GUIDA_TEST.md)

### Setup Automatico

```bash
# Installa tutte le dipendenze e configura il progetto
./setup.sh
```

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Expo CLI (for mobile)
- Docker & Docker Compose (recommended)

### Complete Setup (Backend + Frontend)

```bash
# 1. Clone repository
git clone <repository>
cd super-tetris

# 2. Start infrastructure (PostgreSQL + Redis)
docker-compose up -d

# 3. Setup & start backend
cd backend
npm install
psql -h localhost -U tetris -d tetris_coop -f migrations/1699000000000_initial-schema.sql
# Password: tetris_dev_password
npm run dev
# Backend running on http://localhost:3000

# 4. Setup & start frontend (in new terminal)
cd frontend
npm install
npm start
# Expo dev server will open
```

### Quick Test

```bash
# Test backend health
curl http://localhost:3000/api/health

# Frontend: Press 'i' for iOS simulator or 'a' for Android emulator
```

## 📁 Project Structure

```
super-tetris/
├── backend/                    # ✅ COMPLETE
│   ├── src/
│   │   ├── game/              # Core Tetris logic (collision, SRS, 7-bag)
│   │   ├── routes/            # API endpoints (auth, games)
│   │   ├── models/            # Database models (user, game, move)
│   │   ├── services/          # Business logic (auth, game)
│   │   ├── middleware/        # Auth, errors, rate limiting
│   │   └── config/            # Database, Redis, environment
│   ├── tests/                 # 28 unit tests
│   ├── migrations/            # Database schema
│   └── README.md              # API documentation
│
├── frontend/                   # ✅ COMPLETE
│   ├── src/
│   │   ├── screens/           # Login, Register, Home, Game
│   │   ├── components/        # TetrisGrid, PiecePreview
│   │   ├── store/             # Zustand stores (auth, game)
│   │   ├── services/          # API client
│   │   ├── navigation/        # React Navigation setup
│   │   └── utils/             # Constants, helpers
│   ├── App.tsx                # Entry point
│   └── README.md              # Frontend documentation
│
├── docs/
│   ├── API_QUICK_START.md     # Quick testing guide
│   └── PROJECT_STATUS.md      # Detailed status report
│
├── docker-compose.yml         # PostgreSQL + Redis
└── README.md                  # This file
```

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** (8 tables, triggers, indexes)
- **Redis** (caching, sessions)
- **JWT** authentication with refresh tokens
- **bcrypt** password hashing
- **Winston** logging
- **Jest** testing (28 tests)

### Frontend
- **React Native** + **Expo**
- **TypeScript** (strict mode)
- **Zustand** state management
- **React Navigation**
- **Axios** API client
- **Custom Tetris rendering engine**

### Game Logic
- **7-bag randomizer** (deterministic, seeded)
- **Super Rotation System** (SRS) with wall kicks
- **Collision detection** (precise)
- **Line clearing** with shift
- **Grid**: 20 rows × 10 columns

## ✅ What's Implemented

### Backend API (16 Endpoints)

**Authentication (6)**
```
POST   /api/auth/register      - Create account
POST   /api/auth/login         - Login with JWT
POST   /api/auth/refresh       - Refresh access token
POST   /api/auth/logout        - Logout
GET    /api/auth/me            - Current user info
POST   /api/auth/change-password
```

**Games (9)**
```
POST   /api/games/create                 - Create 4-player game
GET    /api/games/:gameId                - Get game state
POST   /api/games/:gameId/moves          - Submit move
GET    /api/games/:gameId/next-piece     - Next piece
GET    /api/games/:gameId/preview        - Preview pieces
GET    /api/games/my-active              - User's active games
POST   /api/games/:gameId/validate-move  - Validate without submitting
POST   /api/games/:gameId/ghost-position - Calculate hard drop
GET    /api/games/:gameId/stats          - Game statistics
```

**Health**
```
GET    /api/health             - Service status
```

### Frontend Screens

- ✅ **LoginScreen**: Email/password authentication
- ✅ **RegisterScreen**: Account creation with validation
- ✅ **HomeScreen**: Lobby, create/join game, info
- ✅ **GameScreen**: Full game display
  - Tetris grid (20×10) with piece rendering
  - Player list with turn indicators
  - Piece preview (next 3 pieces)
  - Game status (lines, moves, turn)
  - Victory/defeat screens

### Core Features

- ✅ **Deterministic piece generation** (same sequence for all players)
- ✅ **Collision detection** (SRS compliant)
- ✅ **Line clearing** (automatic shift)
- ✅ **Super Rotation System** (wall kicks implemented)
- ✅ **Grid rendering** (colored pieces, ghost preview ready)
- ✅ **State synchronization** (via API)
- ✅ **JWT authentication** (with auto-refresh)
- ✅ **Type-safe** (end-to-end TypeScript)

## 🚧 Next Steps (Touch Controls)

### Priority 1: Gameplay Controls
- [ ] Touch controls (swipe, tap)
- [ ] Piece movement (left, right, down)
- [ ] Rotation (tap to rotate)
- [ ] Hard drop (swipe down)
- [ ] Real-time ghost piece

### Priority 2: Animations & Polish
- [ ] Line clear animation
- [ ] Piece lock animation
- [ ] Sound effects
- [ ] Haptic feedback
- [ ] Victory/defeat animations

### Priority 3: Notifications
- [ ] Push notifications (turn alerts)
- [ ] Expo notification setup
- [ ] Danger mode alerts
- [ ] Game complete notifications

### Priority 4: Analytics
- [ ] Event tracking
- [ ] Flow surveys
- [ ] Session tracking
- [ ] Admin dashboard

## 🔬 Research Context

This is a **research project** testing whether asynchronous cooperative gameplay can:
- ✅ Increase player retention (D1, D7, D14, D30)
- ✅ Maintain flow state benefits
- ✅ Reduce addictive patterns
- ✅ Foster positive social connections

**Target**: 40 alpha users (10 groups of 4 players) for 4 weeks.

### Key Metrics to Track
- Retention rates (daily, weekly, monthly)
- Session frequency & duration
- Flow scores (1-7 scale, FSS surveys)
- IGD assessment (baseline vs current)
- K-factor (invite acceptance rate)
- Group lifetime & completion rate

## 📚 Documentation

- **Backend API**: `backend/README.md` - Complete API documentation
- **Frontend**: `frontend/README.md` - Mobile app setup & architecture
- **Quick Start**: `docs/API_QUICK_START.md` - Testing guide with curl examples
- **Project Status**: `docs/PROJECT_STATUS.md` - Detailed progress report

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                  # Run all tests (28 unit tests)
npm run test:integration  # Integration tests
```

**Test Coverage**:
- ✅ Game logic (collision, rotation, line clearing)
- ✅ Piece generator (determinism, 7-bag)
- ✅ SRS rotation (wall kicks)

### Frontend Tests
```bash
cd frontend
npm test                  # Unit tests
npm run type-check        # TypeScript validation
```

## 🚀 Deployment

### Backend
- **Recommended**: Railway, Render, Fly.io
- **Database**: Railway PostgreSQL, Supabase
- **Redis**: Railway Redis, Redis Cloud

### Frontend
- **iOS**: TestFlight (Expo EAS Build)
- **Android**: Firebase App Distribution (Expo EAS Build)
- **Web**: Vercel, Netlify (Expo web build)

### Deployment Commands
```bash
# Backend
cd backend
npm run build
npm start

# Frontend (Expo EAS)
cd frontend
eas build --platform all
eas submit --platform all
```

## 🔐 Security

- ✅ **Password hashing**: bcrypt (10 rounds)
- ✅ **JWT tokens**: Access (7d) + Refresh (30d)
- ✅ **Rate limiting**:
  - Auth: 5 attempts / 15 min
  - Moves: 10 / min
  - API: 1000 / hour
- ✅ **Input validation**: express-validator + Joi
- ✅ **SQL injection**: Parameterized queries
- ✅ **CORS**: Configured
- ✅ **Helmet**: Security headers

## 📊 Current Statistics

- **Lines of Code**: ~8,000 (TypeScript)
- **Files**: 51
- **API Endpoints**: 16
- **Database Tables**: 8
- **Test Coverage**: 28 unit tests (game logic)
- **Commits**: 5

## 🤝 Contributing

This is a research project. For questions:
- **Technical issues**: GitHub Issues
- **Research protocol**: [Contact research team]

## 📄 License

MIT (or as specified by research team)

---

## 🎯 Quick Commands Cheatsheet

```bash
# Start everything
docker-compose up -d && cd backend && npm run dev

# Backend health check
curl http://localhost:3000/api/health

# Create test user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"Test1234"}'

# Run tests
cd backend && npm test

# Start mobile app
cd frontend && npm start
```

---

**Status**: MVP functional - Backend + Frontend complete! 🎉
**Next Milestone**: Touch controls implementation
**Target**: Alpha test with 40 users in 4-6 weeks

**Built with ❤️ for cooperative gaming research**
