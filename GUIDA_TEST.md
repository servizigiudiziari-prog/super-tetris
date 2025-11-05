# 🎮 Guida al Testing - Tetris Cooperativo Asincrono

Guida completa per testare l'applicazione TCA (Tetris Cooperativo Asincrono).

## 📋 Prerequisiti

Prima di iniziare assicurati di avere installato:

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 14
- **Redis** >= 6
- **npm** o **yarn**
- **Expo CLI** (per mobile): `npm install -g expo-cli`
- **Expo Go App** sul tuo smartphone (iOS/Android)

## 🚀 Opzione 1: Test Backend (API)

### Setup Veloce (5 minuti)

#### 1. Avvia Infrastructure (PostgreSQL + Redis)

```bash
# Se hai Docker:
cd /home/user/super-tetris
docker-compose up -d

# Altrimenti installa PostgreSQL e Redis manualmente
```

#### 2. Configura Database

```bash
cd backend

# Crea il database
psql -U postgres
CREATE DATABASE tetris_coop;
CREATE USER tetris WITH PASSWORD 'tetris_dev_password';
GRANT ALL PRIVILEGES ON DATABASE tetris_coop TO tetris;
\q

# Esegui le migrazioni
psql -h localhost -U tetris -d tetris_coop -f migrations/1699000000000_initial-schema.sql
```

#### 3. Installa Dipendenze

```bash
cd backend
npm install
```

#### 4. Configura Variabili d'Ambiente

```bash
# Verifica il file .env
cat .env

# Dovrebbe contenere:
# NODE_ENV=development
# PORT=3000
# DATABASE_URL=postgresql://tetris:tetris_dev_password@localhost:5432/tetris_coop
# REDIS_URL=redis://localhost:6379
# JWT_SECRET=your-secret-key
# JWT_REFRESH_SECRET=your-refresh-secret
```

#### 5. Avvia il Server

```bash
npm run dev
```

Dovresti vedere:
```
🚀 Server running on http://localhost:3000
✅ Database connected
✅ Redis connected
```

#### 6. Testa il Server

```bash
# Test health check
curl http://localhost:3000/api/health

# Dovrebbe rispondere:
# {"status":"ok","timestamp":"..."}
```

### Test Completo del Gameplay

#### Passo 1: Registra 4 Giocatori

```bash
# Giocatore 1 - Alice
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@test.com",
    "password": "SecurePass123"
  }'

# Giocatore 2 - Bob
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bob",
    "email": "bob@test.com",
    "password": "SecurePass123"
  }'

# Giocatore 3 - Charlie
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "charlie",
    "email": "charlie@test.com",
    "password": "SecurePass123"
  }'

# Giocatore 4 - Diana
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "diana",
    "email": "diana@test.com",
    "password": "SecurePass123"
  }'
```

**IMPORTANTE**: Salva gli `id` dei 4 giocatori dalla risposta!

#### Passo 2: Login come Alice

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@test.com",
    "password": "SecurePass123"
  }'
```

**IMPORTANTE**: Salva il `token` dalla risposta!

#### Passo 3: Crea una Partita

```bash
# Sostituisci TOKEN e gli UUID con i tuoi valori
TOKEN="il_tuo_token_qui"
ALICE_ID="uuid-di-alice"
BOB_ID="uuid-di-bob"
CHARLIE_ID="uuid-di-charlie"
DIANA_ID="uuid-di-diana"

curl -X POST http://localhost:3000/api/games/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"playerIds\": [
      \"$ALICE_ID\",
      \"$BOB_ID\",
      \"$CHARLIE_ID\",
      \"$DIANA_ID\"
    ],
    \"targetLines\": 100,
    \"maxDurationHours\": 24
  }"
```

**IMPORTANTE**: Salva il `gameId` dalla risposta!

#### Passo 4: Ottieni Stato della Partita

```bash
GAME_ID="il_tuo_game_id_qui"

curl -X GET "http://localhost:3000/api/games/$GAME_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Vedrai:
- Griglia 20x10 (tutta vuota all'inizio)
- moveCount: 0
- linesCleared: 0
- status: "active"
- currentPlayerIndex: 0 (turno di Alice)

#### Passo 5: Ottieni il Prossimo Pezzo

```bash
curl -X GET "http://localhost:3000/api/games/$GAME_ID/next-piece" \
  -H "Authorization: Bearer $TOKEN"
```

Risposta esempio:
```json
{
  "success": true,
  "data": {
    "pieceType": "T",
    "pieceIndex": 0
  }
}
```

#### Passo 6: Fai la Tua Prima Mossa

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

Se la mossa è valida vedrai:
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

#### Passo 7: Continua il Gioco

Ora è il turno di Bob (player 2). Devi fare login come Bob e ripetere i passi 5-6.

### Scenari di Test Utili

#### Test 1: Cancellare una Linea

1. Posiziona 10 pezzi per riempire la riga in fondo
2. Quando la linea si completa vedrai: `"linesCleared": 1`
3. La griglia mostrerà la linea rimossa

#### Test 2: Tetris (4 linee)

1. Costruisci 3 linee quasi complete lasciando un buco verticale
2. Usa un pezzo "I" verticale per riempire il buco
3. Vedrai: `"linesCleared": 4` e `"🔥 TETRIS! +4 lines"`

#### Test 3: Vittoria

1. Continua a cancellare linee fino a 100
2. Quando raggiungi 100 linee:
   - `"gameStatus": "completed"`
   - `"🎉 Victory! Target lines reached!"`

#### Test 4: Game Over

1. Posiziona pezzi senza cancellarli fino a riempire la griglia
2. Quando i pezzi raggiungono il top:
   - `"gameStatus": "failed"`
   - `"💥 Game Over! Grid filled up."`

### Test Unitari

```bash
cd backend
npm test

# Solo un test specifico
npm test -- gameLogic.test.ts

# Con coverage
npm test -- --coverage
```

Dovresti vedere 28 test passati ✓

---

## 📱 Opzione 2: Test App Mobile (Completo)

Questo è il modo migliore per testare l'esperienza utente completa!

### Setup Frontend (5 minuti)

#### 1. Installa Dipendenze

```bash
cd frontend
npm install
```

#### 2. Configura Backend URL

```bash
# Crea file di configurazione
cat > .env << 'EOF'
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EOF
```

**NOTA IMPORTANTE**: Se testi su dispositivo fisico, sostituisci `localhost` con l'IP del tuo computer:

```bash
# Trova il tuo IP locale
ip addr show | grep "inet " | grep -v 127.0.0.1

# Poi usa quell'IP nel .env:
# EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

#### 3. Avvia Expo

```bash
npx expo start
```

Vedrai un QR code nel terminale.

#### 4. Apri l'App sul Telefono

1. **iOS**: Apri Camera e inquadra il QR code
2. **Android**: Apri Expo Go e scansiona il QR code

L'app si caricherà sul tuo telefono!

### Test dell'App Mobile

#### Test 1: Registrazione

1. Apri l'app
2. Tap su "Create Account"
3. Inserisci:
   - Username: `alice`
   - Email: `alice@test.com`
   - Password: `SecurePass123`
   - Confirm: `SecurePass123`
4. Tap "Register"

Dovresti vedere la schermata Home con "Welcome, alice!"

#### Test 2: Creazione Partita

1. Dalla Home, tap "Create Game"
2. Aggiungi 3 amici (devono prima registrarsi)
3. Tap "Start Game"

Vedrai:
- Griglia Tetris 10x20
- Preview dei prossimi 3 pezzi
- Barra progresso (0/100 linee)
- Indicatore turno: "YOUR TURN!" se è il tuo turno

#### Test 3: Gameplay con Touch Controls

Quando è il tuo turno vedrai i controlli:

```
        [↑]           [ROTATE]
     [←] [↓] [→]      [HARD DROP]
                      [PLACE ✓]
```

**Comandi:**
- **← → ↓**: Muovi il pezzo
- **ROTATE**: Ruota il pezzo (con wall kick)
- **HARD DROP**: Porta istantaneamente il pezzo giù
- **PLACE ✓**: Conferma e invia la mossa

**Suggerimenti:**
1. Usa ← → per posizionare orizzontalmente
2. Usa ROTATE per orientare il pezzo
3. Vedrai un "ghost" grigio che mostra dove cadrà
4. Usa ↓ per scendere una riga alla volta
5. HARD DROP per scendere subito in fondo
6. PLACE per confermare

#### Test 4: Multiplayer Asincrono

1. Registra 4 account diversi (alice, bob, charlie, diana)
2. Crea una partita con tutti e 4
3. Fai una mossa come Alice
4. Logout
5. Login come Bob
6. Vedrai la griglia aggiornata con la mossa di Alice
7. Fai la tua mossa
8. Continua a rotazione tra i 4 giocatori

#### Test 5: Cancellare Linee

1. Posiziona pezzi per riempire la riga in fondo
2. Quando completi la linea:
   - Vedrai un'animazione
   - La barra progresso aumenta: "5/100 lines"
   - Il gioco continua con il prossimo giocatore

#### Test 6: Preview Pezzi

Nell'app vedrai sempre i prossimi 3 pezzi:
```
Next: [T]
 +1:  [I]
 +2:  [O]
```

Tutti e 4 i giocatori vedono la stessa sequenza!

#### Test 7: Vittoria

Quando raggiungete 100 linee:
- Appare "🎉 VICTORY!"
- Game Over screen
- Statistiche finali
- Bottone "Back to Home"

### Debug dell'App Mobile

Se qualcosa non funziona:

1. **Controlla Console Expo**: Vedrai errori nel terminale
2. **Shake Device**: Menu di debug (solo development)
3. **Logs**: `npx expo start` mostra tutti i log
4. **Network**: Verifica che il backend sia raggiungibile

```bash
# Testa se il backend risponde dal telefono
# Apri browser sul telefono e vai a:
http://192.168.1.100:3000/api/health
```

---

## 🧪 Test Scenario Completo (End-to-End)

### Scenario: 4 Giocatori Cancellano 10 Linee

**Setup (5 min):**
1. Avvia backend: `cd backend && npm run dev`
2. Avvia frontend: `cd frontend && npx expo start`
3. Registra 4 account sull'app mobile
4. Login come Player 1 e crea una partita

**Gameplay (15 min):**

**Turno 1 - Alice:**
1. Ricevi pezzo "T"
2. Ruota con ROTATE
3. Posiziona in fondo a sinistra
4. Tap PLACE ✓
5. Logout

**Turno 2 - Bob:**
1. Login come Bob
2. Vedi la griglia con il pezzo di Alice
3. Ricevi pezzo "I"
4. Posiziona verticalmente a destra
5. Tap PLACE ✓
6. Logout

**Turno 3-8:**
- Continua con Charlie e Diana
- Riempi la riga in fondo

**Turno 9 - Alice:**
- Completa la prima linea
- Vedrai: "Single! +1 line"
- Progresso: 1/100

**Turno 10-40:**
- Continua a giocare
- Obiettivo: 10 linee in totale
- Progresso: 10/100

**Verifica:**
- Tutti vedono lo stesso stato
- Tutti ricevono gli stessi pezzi (stessa sequenza)
- La barra progresso è sincronizzata
- Nessun bug di collisione

---

## 🐛 Risoluzione Problemi

### Backend Non Si Avvia

```bash
# Verifica PostgreSQL
psql -U tetris -d tetris_coop -c "SELECT 1;"

# Verifica Redis
redis-cli ping
# Risposta: PONG

# Controlla porte
lsof -i :3000  # Backend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
```

### Frontend Non Si Connette

```bash
# Verifica IP del computer
ip addr show

# Nel .env frontend, usa l'IP corretto:
# EXPO_PUBLIC_API_URL=http://TUO_IP:3000/api

# Riavvia Expo
npx expo start -c  # -c = clear cache
```

### Errore "Invalid Token"

```bash
# Il token è scaduto, fai refresh:
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "tuo_refresh_token"}'
```

### Errore "Invalid Piece Type"

- Hai inviato un pezzo diverso da quello previsto
- Controlla con `/api/games/:gameId/next-piece`
- La sequenza è deterministica: tutti ricevono gli stessi pezzi

### Errore "Not Your Turn"

- Controlla `currentPlayerIndex` nello stato del gioco
- Aspetta che sia il tuo turno
- L'ordine è: player[0] → player[1] → player[2] → player[3] → player[0]...

---

## 📊 Monitoring Durante i Test

### Controlla Performance

```bash
# Logs del server
cd backend
npm run dev  # Vedrai tutti i log in tempo reale

# Queries lente (>100ms) sono automaticamente loggati
```

### Statistiche Partita

```bash
curl -X GET "http://localhost:3000/api/games/$GAME_ID/stats" \
  -H "Authorization: Bearer $TOKEN"
```

Vedrai:
- Media tempo per mossa
- Pezzi più usati
- Linee cancellate per giocatore
- Durata partita

---

## ✅ Checklist Test Completi

### Backend API
- [ ] Server si avvia senza errori
- [ ] Health check risponde
- [ ] Registrazione funziona
- [ ] Login funziona
- [ ] Creazione partita con 4 giocatori
- [ ] Sottomissione mossa valida
- [ ] Validazione mossa invalida
- [ ] Cancellazione linee
- [ ] Vittoria (100 linee)
- [ ] Game over (griglia piena)
- [ ] Token refresh
- [ ] Rate limiting

### Frontend Mobile
- [ ] App si carica su telefono
- [ ] Registrazione UI funziona
- [ ] Login UI funziona
- [ ] Creazione partita UI
- [ ] Griglia si visualizza correttamente
- [ ] Touch controls rispondono
- [ ] Ghost piece si vede
- [ ] Preview pezzi corretta
- [ ] Rotazione con wall kick
- [ ] Hard drop funziona
- [ ] Sottomissione mossa
- [ ] Aggiornamento stato dopo mossa
- [ ] Indicatore turno corretto
- [ ] Barra progresso aggiornata
- [ ] Schermata vittoria
- [ ] Schermata game over

### Multiplayer
- [ ] 4 giocatori possono registrarsi
- [ ] Tutti vedono lo stesso stato
- [ ] Sequenza pezzi identica per tutti
- [ ] Turni rispettati
- [ ] Mosse sincronizzate
- [ ] Linee cancellate visibili a tutti
- [ ] Vittoria condivisa

---

## 🎯 Prossimi Passi

Dopo aver testato localmente:

1. **Deploy Backend** su un server (Heroku, Railway, DigitalOcean)
2. **Aggiorna API_URL** nel frontend con URL pubblico
3. **Build App** con `eas build` (Expo Application Services)
4. **Distribuzione Alpha** a 40 utenti (10 gruppi di 4)
5. **Monitoring** con logs e analytics
6. **Feedback** da alpha testers per iterazioni

---

## 📚 Documentazione Aggiuntiva

- **API Completa**: `backend/README.md`
- **Quick Start API**: `docs/API_QUICK_START.md`
- **Status Progetto**: `docs/PROJECT_STATUS.md`
- **README Generale**: `README.md`

---

**Buon Testing! 🎮🚀**

In caso di problemi, controlla i log del server e della console Expo per dettagli sugli errori.
