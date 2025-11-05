# Tetris Cooperativo Asincrono (TCA)

Puzzle game innovativo dove 4 giocatori collaborano su una griglia Tetris condivisa, giocando in momenti diversi.

## 🎮 Concept

- **4 giocatori** condividono una singola **griglia Tetris 10x20**
- Ogni giocatore riceve **sequenze di pezzi identiche** (stessa seed RNG)
- I giocatori giocano **in momenti diversi** (asincrono), NON simultaneamente
- **Obiettivo comune**: Completare 100 linee prima che la griglia si riempia
- **Cooperazione**: Ogni pezzo posizionato persiste e gli altri devono adattarsi

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (recommended)

### Development Setup

1. **Clone and install dependencies**
```bash
git clone <repository>
cd super-tetris
npm install
```

2. **Start infrastructure (PostgreSQL + Redis)**
```bash
docker-compose up -d
```

3. **Setup database**
```bash
cd backend
npm run db:migrate
npm run db:seed # Optional: seed test data
```

4. **Start backend**
```bash
cd backend
npm run dev # Runs on http://localhost:3000
```

5. **Start frontend**
```bash
cd frontend
npm start # Opens Expo dev server
```

### Running Tests

```bash
# Backend unit tests
cd backend
npm test

# Backend integration tests
npm run test:integration

# Frontend tests
cd frontend
npm test

# E2E tests (requires emulator/device)
npm run test:e2e
```

## 📁 Project Structure

```
super-tetris/
├── backend/           # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── models/    # Database models
│   │   ├── game/      # Core game logic
│   │   ├── services/  # Business logic
│   │   └── utils/     # Helpers
│   └── tests/         # Backend tests
├── frontend/          # React Native + Expo mobile app
│   ├── src/
│   │   ├── screens/   # App screens
│   │   ├── components/# Reusable components
│   │   ├── hooks/     # Custom hooks
│   │   ├── store/     # State management
│   │   └── utils/     # Helpers
│   └── tests/         # Frontend tests
├── shared/            # Shared TypeScript types & constants
└── docs/              # Documentation

```

## 🏗️ Architecture

- **Backend**: Node.js + Express + TypeScript + PostgreSQL + Redis
- **Frontend**: React Native + Expo + TypeScript
- **Real-time**: Push notifications via Expo
- **Database**: PostgreSQL for structured data, Redis for caching
- **Auth**: JWT with refresh tokens

## 🎯 MVP Roadmap

### Phase 1: Core Game Logic (Weeks 1-3) ✅
- [x] Project setup
- [ ] Tetris mechanics (pieces, collision, rotation, line clearing)
- [ ] 7-bag seeded random generator
- [ ] Super Rotation System (SRS)

### Phase 2: Multiplayer Async (Weeks 4-5)
- [ ] Turn-based system
- [ ] Game state persistence
- [ ] Push notifications
- [ ] Player invites

### Phase 3: UX & Polish (Weeks 6-7)
- [ ] Animations
- [ ] Sound effects
- [ ] Onboarding tutorial
- [ ] Danger mode

### Phase 4: Analytics (Week 8)
- [ ] Research event tracking
- [ ] Flow surveys
- [ ] Admin dashboard

### Phase 5: Testing & Deploy (Weeks 9-10)
- [ ] Comprehensive testing
- [ ] Production deployment
- [ ] Beta distribution

## 🔬 Research Context

This is a proof-of-concept for testing if asynchronous cooperation can increase retention and engagement while maintaining Tetris's neuropsychological benefits (flow state, stress reduction).

**Target**: 40 alpha users (10 groups of 4 players) for 4 weeks.

## 📊 Key Metrics

- Retention (D1, D7, D14, D30)
- Engagement (sessions/day, session duration)
- Social (K-factor, group lifetime)
- Flow & wellbeing (flow scores, IGD assessment)

## 🔒 Environment Variables

See `.env.example` for required environment variables.

## 📝 API Documentation

Once the server is running, visit:
- Local: http://localhost:3000/api/docs
- Swagger UI with interactive API documentation

## 🤝 Contributing

This is a research project. For questions:
- Technical issues → GitHub Issues
- Research protocol → [IRB document]

## 📄 License

MIT (or Proprietary - TBD)

---

**Built with ❤️ for cooperative gaming research**
