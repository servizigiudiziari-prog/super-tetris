#!/bin/bash

# 🎮 Script Super Facile per Testare Tetris
# Segui le istruzioni sullo schermo!

clear

echo "🎮🎮🎮🎮🎮🎮🎮🎮🎮🎮🎮🎮🎮🎮🎮🎮🎮🎮"
echo "   TETRIS - TEST FACILE"
echo "🎮🎮🎮🎮🎮🎮🎮🎮🎮🎮🎮🎮🎮🎮🎮🎮🎮🎮"
echo ""
echo "Questo script ti aiuta a testare il gioco!"
echo ""

# Colori
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Funzione per aspettare
aspetta() {
    echo ""
    echo -e "${YELLOW}>>> Premi INVIO per continuare...${NC}"
    read
}

# Funzione per titolo
titolo() {
    clear
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# PASSO 1: Installazione
titolo "PASSO 1: Installazione"
echo "Sto per installare tutto quello che serve..."
echo "Ci vorranno 1-2 minuti."
aspetta

cd /home/user/super-tetris

# Installa backend
echo -e "${GREEN}📦 Installo il backend...${NC}"
cd backend
npm install --silent > /dev/null 2>&1
cd ..

# Installa frontend
echo -e "${GREEN}📱 Installo il frontend...${NC}"
cd frontend
npm install --silent > /dev/null 2>&1
cd ..

echo ""
echo -e "${GREEN}✓ Installazione completata!${NC}"
aspetta

# PASSO 2: Controlla database
titolo "PASSO 2: Database"
echo "Controllo se il database è pronto..."
echo ""

# Verifica PostgreSQL
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL trovato!${NC}"

    # Controlla se il database esiste
    if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw tetris_coop; then
        echo -e "${GREEN}✓ Database 'tetris_coop' trovato!${NC}"
    else
        echo -e "${RED}✗ Database non trovato.${NC}"
        echo ""
        echo "Devo creare il database. Ti chiederà la password di PostgreSQL."
        echo ""

        # Crea database
        psql -U postgres <<EOF
CREATE DATABASE tetris_coop;
CREATE USER tetris WITH PASSWORD 'tetris_dev_password';
GRANT ALL PRIVILEGES ON DATABASE tetris_coop TO tetris;
\q
EOF

        # Esegui migrazioni
        echo ""
        echo "Creo le tabelle nel database..."
        psql -h localhost -U tetris -d tetris_coop -f backend/migrations/1699000000000_initial-schema.sql

        echo -e "${GREEN}✓ Database creato!${NC}"
    fi
else
    echo -e "${RED}✗ PostgreSQL non trovato!${NC}"
    echo ""
    echo "Devi installare PostgreSQL prima:"
    echo "  sudo apt-get install postgresql"
    echo ""
    exit 1
fi

# Verifica Redis
echo ""
if command -v redis-cli &> /dev/null; then
    if redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Redis è attivo!${NC}"
    else
        echo -e "${YELLOW}! Redis non è attivo. Lo avvio...${NC}"
        redis-server --daemonize yes
        sleep 2
        echo -e "${GREEN}✓ Redis avviato!${NC}"
    fi
else
    echo -e "${RED}✗ Redis non trovato!${NC}"
    echo ""
    echo "Devi installare Redis prima:"
    echo "  sudo apt-get install redis-server"
    echo ""
    exit 1
fi

aspetta

# PASSO 3: Avvia i server
titolo "PASSO 3: Avvio Server"
echo "Ora avvio il backend e il frontend."
echo ""
echo "Si apriranno 2 nuovi terminali:"
echo "  1. Backend (server API)"
echo "  2. Frontend (app mobile)"
echo ""
echo -e "${YELLOW}NON CHIUDERE QUEI TERMINALI!${NC}"
aspetta

# Avvia backend in un nuovo terminale
echo -e "${GREEN}🚀 Avvio backend...${NC}"
gnome-terminal --title="BACKEND - Non chiudere!" -- bash -c "cd /home/user/super-tetris/backend && npm run dev; exec bash" 2>/dev/null || \
xterm -T "BACKEND - Non chiudere!" -e "cd /home/user/super-tetris/backend && npm run dev; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd /home/user/super-tetris/backend && npm run dev"' 2>/dev/null

sleep 3

# Avvia frontend in un nuovo terminale
echo -e "${GREEN}📱 Avvio frontend...${NC}"
gnome-terminal --title="FRONTEND - Non chiudere!" -- bash -c "cd /home/user/super-tetris/frontend && npx expo start; exec bash" 2>/dev/null || \
xterm -T "FRONTEND - Non chiudere!" -e "cd /home/user/super-tetris/frontend && npx expo start; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd /home/user/super-tetris/frontend && npx expo start"' 2>/dev/null

echo ""
echo "Aspetto che i server si avviino..."
sleep 5

aspetta

# PASSO 4: Istruzioni per il telefono
titolo "PASSO 4: Apri l'App sul Telefono"
echo "Ora devi aprire l'app sul tuo telefono!"
echo ""
echo -e "${GREEN}Se hai iPhone:${NC}"
echo "  1. Scarica 'Expo Go' dall'App Store"
echo "  2. Apri l'app Camera"
echo "  3. Punta sul QR code nella finestra FRONTEND"
echo "  4. Clicca sulla notifica"
echo ""
echo -e "${GREEN}Se hai Android:${NC}"
echo "  1. Scarica 'Expo Go' dal Play Store"
echo "  2. Apri Expo Go"
echo "  3. Clicca 'Scan QR Code'"
echo "  4. Scansiona il QR code nella finestra FRONTEND"
echo ""
echo -e "${YELLOW}Il QR code è nella finestra che si è appena aperta!${NC}"
aspetta

# PASSO 5: Istruzioni per giocare
titolo "PASSO 5: Come Giocare"
echo "Sul telefono ora vedi l'app del Tetris!"
echo ""
echo -e "${GREEN}COSA FARE:${NC}"
echo ""
echo "1. Clicca 'Create Account'"
echo "   - Username: mario"
echo "   - Email: mario@test.com"
echo "   - Password: Password123"
echo ""
echo "2. Crea altri 3 account (luigi, peach, toad)"
echo "   - Fai logout e registrati di nuovo"
echo ""
echo "3. Per creare una partita:"
echo "   - È complicato, segui la guida:"
echo "   - cat COME_TESTARE_SEMPLICE.md"
echo "   - Vai a 'PASSO 7'"
echo ""
echo "4. Oppure ti aiuto io! Vuoi che crei i giocatori automaticamente?"
echo ""
read -p "Creo i 4 giocatori per te? (s/n): " risposta

if [ "$risposta" = "s" ] || [ "$risposta" = "S" ]; then
    titolo "Creazione Automatica Giocatori"

    # Aspetta che il backend sia pronto
    echo "Aspetto che il backend sia pronto..."
    sleep 5

    # Array per salvare i dati
    declare -a USER_IDS
    declare -a TOKENS

    # Crea 4 giocatori
    for player in "mario" "luigi" "peach" "toad"; do
        echo ""
        echo -e "${GREEN}Creo $player...${NC}"

        RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
          -H "Content-Type: application/json" \
          -d "{
            \"username\": \"$player\",
            \"email\": \"${player}@test.com\",
            \"password\": \"Password123\"
          }")

        if echo "$RESPONSE" | grep -q "success"; then
            echo -e "${GREEN}✓ $player creato!${NC}"

            # Estrai user ID
            USER_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
            USER_IDS+=("$USER_ID")

            # Fai login per ottenere il token
            LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
              -H "Content-Type: application/json" \
              -d "{
                \"email\": \"${player}@test.com\",
                \"password\": \"Password123\"
              }")

            TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
            TOKENS+=("$TOKEN")

            echo "  ID: $USER_ID"
        else
            echo -e "${YELLOW}! $player già esistente (va bene!)${NC}"
        fi
    done

    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Tutti i giocatori sono pronti!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Ora puoi fare login sull'app con:"
    echo "  - mario@test.com / Password123"
    echo "  - luigi@test.com / Password123"
    echo "  - peach@test.com / Password123"
    echo "  - toad@test.com / Password123"
    echo ""

    # Salva gli ID in un file per dopo
    echo "# User IDs" > /tmp/tetris_users.txt
    for i in "${!USER_IDS[@]}"; do
        echo "USER_ID_$i=${USER_IDS[$i]}" >> /tmp/tetris_users.txt
    done

    echo "Gli ID sono salvati in /tmp/tetris_users.txt"
fi

echo ""
aspetta

# FINE
titolo "✅ TUTTO PRONTO!"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Il gioco è pronto!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📱 SUL TELEFONO:"
echo "   - Apri l'app con Expo Go"
echo "   - Fai login con mario@test.com / Password123"
echo "   - Crea una partita o entra in una esistente"
echo "   - GIOCA!"
echo ""
echo "💻 SUL COMPUTER:"
echo "   - Backend: http://localhost:3000"
echo "   - Frontend: Guarda la finestra con il QR code"
echo ""
echo "📖 GUIDA COMPLETA:"
echo "   cat COME_TESTARE_SEMPLICE.md"
echo ""
echo "🐛 SE HAI PROBLEMI:"
echo "   - Guarda i terminali del backend e frontend"
echo "   - Cerca messaggi di errore in rosso"
echo ""
echo -e "${YELLOW}Ricorda: NON chiudere le finestre del backend e frontend!${NC}"
echo ""
echo "🎮 BUON DIVERTIMENTO!"
echo ""
