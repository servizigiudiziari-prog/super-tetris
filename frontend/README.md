# Tetris Cooperativo - Frontend (React Native + Expo)

Mobile frontend for the Tetris Cooperativo Asincrono game.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator, or Expo Go app on your phone

### Installation

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app (iOS/Android)

## 📱 Features Implemented

### Authentication ✅
- Login screen with email/password
- Registration with validation
- JWT token management
- Auto-login on app start

### Game Lobby ✅
- Home screen with user welcome
- Quick actions (Create Game, Join Game)
- How It Works info section
- Research info disclosure

### Game Screen ✅
- Real-time game state display
- Tetris grid rendering (20x10)
- Piece preview (next 3 pieces)
- Players list with turn indicator
- Game status (lines cleared, moves)
- Victory/Game Over screens

### Components ✅
- **TetrisGrid**: Renders 20x10 grid with pieces
- **PiecePreview**: Shows upcoming pieces
- Ghost piece visualization (ready for implementation)
- Touch controls (ready for implementation)

## 🏗️ Architecture

### State Management (Zustand)
- **authStore**: User authentication state
- **gameStore**: Current game state, moves, pieces

### API Client
- Axios-based client with interceptors
- Automatic token refresh
- Error handling
- Type-safe requests

### Navigation
- React Navigation (Stack)
- Auth flow vs Main flow
- Protected routes

## 📂 Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── TetrisGrid.tsx       # Main grid renderer
│   │   └── PiecePreview.tsx     # Piece preview widget
│   ├── navigation/        # Navigation setup
│   │   └── AppNavigator.tsx     # Main navigator
│   ├── screens/           # App screens
│   │   ├── LoginScreen.tsx      # Authentication
│   │   ├── RegisterScreen.tsx   # Sign up
│   │   ├── HomeScreen.tsx       # Lobby/home
│   │   └── GameScreen.tsx       # Main game screen
│   ├── services/          # API & external services
│   │   └── api.ts               # Backend API client
│   ├── store/             # Zustand stores
│   │   ├── authStore.ts         # Auth state
│   │   └── gameStore.ts         # Game state
│   ├── types/             # TypeScript types
│   │   └── index.ts             # Shared types
│   └── utils/             # Utilities
│       └── constants.ts         # Game constants
├── App.tsx                # App entry point
├── app.json               # Expo configuration
└── package.json
```

## 🎮 How It Works

### 1. Authentication Flow
```
LoginScreen → API.login() → Store token → Navigate to Home
```

### 2. Game Flow
```
HomeScreen → Create/Join Game → GameScreen → Load game state → Render grid
```

### 3. Making a Move (TODO - next phase)
```
Select piece → Position on grid → Validate → Submit to API → Update state
```

## 🎨 Design System

### Colors
- Background: `#1a1a2e` (Dark blue-black)
- Grid Background: `#16213e`
- Primary (Cyan): `#00F0F0`
- Success (Green): `#00F000`
- Danger (Red): `#F00000`

### Piece Colors (Standard Tetris)
- I: Cyan `#00F0F0`
- O: Yellow `#F0F000`
- T: Purple `#A000F0`
- S: Green `#00F000`
- Z: Red `#F00000`
- J: Blue `#0000F0`
- L: Orange `#F0A000`

## 🔧 Configuration

### Environment Variables

Create `.env` file:
```bash
API_URL=http://localhost:3000
```

Or modify `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://your-backend-url"
    }
  }
}
```

### Connecting to Backend

**Development (iOS Simulator):**
```bash
API_URL=http://localhost:3000
```

**Development (Android Emulator):**
```bash
API_URL=http://10.0.2.2:3000
```

**Development (Physical Device):**
```bash
API_URL=http://YOUR_COMPUTER_IP:3000
```

**Production:**
```bash
API_URL=https://your-production-api.com
```

## 🧪 Testing

```bash
# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📝 TODO - Next Phase

### Controls Implementation
- [ ] Touch controls for piece movement
- [ ] Rotate piece (tap to rotate)
- [ ] Hard drop (swipe down)
- [ ] Soft drop (hold down)
- [ ] Ghost piece real-time calculation

### Gameplay Features
- [ ] Move validation before submission
- [ ] Animated piece placement
- [ ] Line clear animation
- [ ] Sound effects
- [ ] Haptic feedback

### Multiplayer
- [ ] Push notifications
- [ ] Move history timeline
- [ ] Player avatars
- [ ] In-game chat (optional)

### UX Polish
- [ ] Loading states
- [ ] Error messages
- [ ] Onboarding tutorial
- [ ] Settings screen
- [ ] Profile screen

### Research Features
- [ ] Flow surveys (in-app)
- [ ] Session tracking
- [ ] Analytics events

## 🚀 Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

### EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build
eas build --platform all
```

## 📱 Screenshots

(Coming soon once UI is complete)

## 🐛 Troubleshooting

### Can't connect to backend
- Check API_URL in app.json
- Ensure backend is running
- For physical device, use your computer's IP
- Check firewall settings

### Build errors
```bash
# Clear cache
expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Type errors
```bash
# Regenerate types
npm run type-check
```

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Native](https://reactnative.dev/)

## 🤝 Contributing

This is a research project. See main README for guidelines.

---

**Status**: Frontend MVP - Core screens implemented ✅
**Next**: Touch controls + gameplay mechanics
