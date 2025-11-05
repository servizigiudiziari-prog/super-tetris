#!/bin/bash

# 🎮 Script di Setup Rapido - Tetris Cooperativo Asincrono
# Questo script automatizza il setup iniziale del progetto

set -e  # Exit on error

echo "🎮 Tetris Cooperativo Asincrono - Setup"
echo "========================================"
echo ""

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funzione per stampare con colori
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

print_info() {
    echo -e "${YELLOW}→${NC} $1"
}

# 1. Verifica prerequisiti
echo "📋 Verifico prerequisiti..."
echo ""

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js installato: $NODE_VERSION"
else
    print_error "Node.js non trovato. Installa Node.js >= 18.0.0"
    exit 1
fi

# npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm installato: $NPM_VERSION"
else
    print_error "npm non trovato"
    exit 1
fi

# PostgreSQL
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version | awk '{print $3}')
    print_success "PostgreSQL installato: $PSQL_VERSION"
    POSTGRES_AVAILABLE=true
else
    print_warning "PostgreSQL non trovato. Dovrai installarlo manualmente."
    POSTGRES_AVAILABLE=false
fi

# Redis
if command -v redis-cli &> /dev/null; then
    print_success "Redis installato"
    REDIS_AVAILABLE=true
else
    print_warning "Redis non trovato. Dovrai installarlo manualmente."
    REDIS_AVAILABLE=false
fi

echo ""

# 2. Installa dipendenze backend
echo "📦 Installo dipendenze backend..."
cd backend

if [ -f "package.json" ]; then
    npm install
    print_success "Dipendenze backend installate"
else
    print_error "package.json non trovato in backend/"
    exit 1
fi

cd ..
echo ""

# 3. Installa dipendenze frontend
echo "📦 Installo dipendenze frontend..."
cd frontend

if [ -f "package.json" ]; then
    npm install
    print_success "Dipendenze frontend installate"
else
    print_error "package.json non trovato in frontend/"
    exit 1
fi

cd ..
echo ""

# 4. Configura environment variables
echo "⚙️  Configuro variabili d'ambiente..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    print_success "Creato backend/.env"
else
    print_info "backend/.env già esistente (non sovrascritto)"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    print_success "Creato frontend/.env"
else
    print_info "frontend/.env già esistente (non sovrascritto)"
fi

echo ""

# 5. Verifica database
if [ "$POSTGRES_AVAILABLE" = true ]; then
    echo "🗄️  Verifica database..."

    # Controlla se il database esiste
    DB_EXISTS=$(psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='tetris_coop'" 2>/dev/null || echo "0")

    if [ "$DB_EXISTS" = "1" ]; then
        print_info "Database 'tetris_coop' già esistente"
    else
        print_warning "Database 'tetris_coop' non trovato"
        echo ""
        echo "Per creare il database, esegui:"
        echo "  psql -U postgres"
        echo "  CREATE DATABASE tetris_coop;"
        echo "  CREATE USER tetris WITH PASSWORD 'tetris_dev_password';"
        echo "  GRANT ALL PRIVILEGES ON DATABASE tetris_coop TO tetris;"
        echo "  \\q"
        echo ""
        echo "Poi esegui le migrazioni:"
        echo "  psql -h localhost -U tetris -d tetris_coop -f backend/migrations/1699000000000_initial-schema.sql"
    fi
else
    print_warning "PostgreSQL non disponibile. Salta verifica database."
fi

echo ""

# 6. Test unitari
echo "🧪 Eseguo test unitari..."
cd backend

if npm test &> /dev/null; then
    print_success "Test unitari passati!"
else
    print_warning "Alcuni test potrebbero aver fallito (controlla i log)"
fi

cd ..
echo ""

# 7. Riepilogo
echo "========================================"
echo "✅ Setup completato!"
echo "========================================"
echo ""
echo "📚 Prossimi passi:"
echo ""

if [ "$POSTGRES_AVAILABLE" = false ] || [ "$DB_EXISTS" != "1" ]; then
    echo "1. 🗄️  Configura PostgreSQL (vedi sopra)"
    echo ""
fi

if [ "$REDIS_AVAILABLE" = false ]; then
    echo "2. 🔴 Installa e avvia Redis:"
    echo "   sudo apt-get install redis-server  # Ubuntu/Debian"
    echo "   brew install redis                  # macOS"
    echo "   redis-server"
    echo ""
fi

echo "3. 🚀 Avvia il backend:"
echo "   cd backend"
echo "   npm run dev"
echo ""

echo "4. 📱 Avvia il frontend (in un altro terminale):"
echo "   cd frontend"
echo "   npx expo start"
echo ""

echo "5. 📖 Leggi la guida completa:"
echo "   cat GUIDA_TEST.md"
echo ""

echo "🎮 Buon divertimento!"
