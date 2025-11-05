# 🎮 Come Testare - GUIDA SEMPLICE

## Cosa Devi Fare

Devi far partire il gioco sul tuo telefono e giocarci!

---

## PASSO 1: Installa le Cose Necessarie

Apri il terminale e digita questi comandi (uno alla volta):

```bash
cd /home/user/super-tetris
./setup.sh
```

Aspetta che finisca. Se ti chiede qualcosa, premi INVIO.

---

## PASSO 2: Fai Partire il Server (il cervello del gioco)

Nel terminale digita:

```bash
cd /home/user/super-tetris/backend
npm run dev
```

**Cosa devi vedere:**
```
🚀 Server running on http://localhost:3000
✅ Database connected
✅ Redis connected
```

Se vedi questo, è OK! **NON CHIUDERE QUESTO TERMINALE!**

---

## PASSO 3: Fai Partire l'App (l'interfaccia)

Apri un NUOVO terminale (lascia l'altro aperto!) e digita:

```bash
cd /home/user/super-tetris/frontend
npx expo start
```

**Cosa devi vedere:**
Un QR code grande che puoi scansionare col telefono.

**NON CHIUDERE NEANCHE QUESTO TERMINALE!**

---

## PASSO 4: Apri l'App sul Telefono

### Se hai iPhone:
1. Scarica l'app "Expo Go" dall'App Store
2. Apri l'app Camera del telefono
3. Punta la camera sul QR code nel terminale
4. Clicca sulla notifica che appare
5. Si apre l'app del gioco!

### Se hai Android:
1. Scarica l'app "Expo Go" dal Play Store
2. Apri "Expo Go"
3. Clicca su "Scan QR Code"
4. Punta il telefono sul QR code nel terminale
5. Si apre l'app del gioco!

---

## PASSO 5: Registrati

Sul telefono ora vedi l'app del Tetris!

1. Clicca su "**Create Account**"
2. Scrivi:
   - **Username**: mario
   - **Email**: mario@test.com
   - **Password**: Password123
   - **Confirm**: Password123
3. Clicca "**Register**"

Ora sei dentro! Vedi scritto "Welcome, mario!"

---

## PASSO 6: Crea Altri 3 Giocatori

Il gioco serve 4 persone. Tu sei Mario, ma devi creare anche Luigi, Peach e Toad.

**Sul telefono:**
1. Clicca sul menu (le 3 righe in alto)
2. Clicca "**Logout**"
3. Torna alla schermata di login
4. Clicca "**Create Account**" di nuovo
5. Scrivi:
   - Username: luigi
   - Email: luigi@test.com
   - Password: Password123
   - Confirm: Password123
6. Clicca "**Register**"
7. Clicca "**Logout**" di nuovo

**Ripeti ancora 2 volte** per creare:
- peach@test.com
- toad@test.com

Ora hai 4 giocatori!

---

## PASSO 7: Crea una Partita

Questo è il pezzo difficile. Devi dirgli gli ID dei 4 giocatori.

**Nel terminale**, apri un TERZO terminale nuovo e digita:

```bash
# Fai login come Mario
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mario@test.com",
    "password": "Password123"
  }'
```

**Vedrai un sacco di testo.** Cerca questa parte e COPIALA:
```
"token": "eyJhbGci..."
```

Copia TUTTO quello che c'è tra le virgolette dopo "token".

**Poi digita** (sostituisci IL_TUO_TOKEN con quello che hai copiato):

```bash
# Imposta il token
TOKEN="IL_TUO_TOKEN_QUI"

# Vedi i tuoi giochi
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

Vedrai il tuo ID. COPIALO.

**Ora** fai la stessa cosa per Luigi, Peach e Toad (login e copia gli ID).

**Infine, crea la partita:**

```bash
curl -X POST http://localhost:3000/api/games/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "playerIds": [
      "ID_DI_MARIO",
      "ID_DI_LUIGI",
      "ID_DI_PEACH",
      "ID_DI_TOAD"
    ]
  }'
```

Vedrai `"gameId": "qualcosa"`. COPIA questo ID!

---

## PASSO 8: GIOCA!

**Sul telefono:**

1. Fai login come mario@test.com
2. Nella home page vedrai la tua partita - clicca sopra
3. Vedi la griglia del Tetris!
4. Vedi scritto "**YOUR TURN!**" (è il tuo turno!)
5. Sotto vedi i **controlli**:

```
        [↑]           [ROTATE]
     [←] [↓] [→]      [HARD DROP]
                      [PLACE ✓]
```

**Come giocare:**
- Premi **←** o **→** per muovere il pezzo a sinistra/destra
- Premi **ROTATE** per ruotare il pezzo
- Premi **↓** per farlo scendere piano
- Premi **HARD DROP** per farlo cadere subito giù
- Vedrai un **fantasma grigio** che ti dice dove cadrà
- Quando sei contento, premi **PLACE ✓**

Il pezzo si blocca! Ora tocca a Luigi!

---

## PASSO 9: Gioca con gli Altri Giocatori

1. Sul telefono fai **Logout**
2. Fai **Login** come luigi@test.com
3. Entra nella stessa partita
4. Vedrai la griglia con il pezzo che Mario ha messo!
5. Ora tocca a te - metti il tuo pezzo
6. **Logout** di nuovo
7. Fai Login come peach@test.com
8. Continua così...

---

## Cosa Devi Testare

✅ **Riesci a registrarti?**
✅ **Riesci a fare login?**
✅ **Riesci a creare una partita?**
✅ **Vedi la griglia del Tetris?**
✅ **Funzionano i bottoni ←→↓?**
✅ **Funziona ROTATE?**
✅ **Vedi il fantasma grigio?**
✅ **Riesci a mettere un pezzo con PLACE?**
✅ **Quando fai logout e login con un altro, vedi il pezzo dell'altro giocatore?**
✅ **Quando completi una linea, sparisce?**
✅ **La barra in alto si riempie? (0/100 → 1/100 → 2/100...)**

---

## Se Qualcosa Non Funziona

### Il server non parte
- Controlla che PostgreSQL sia installato: `psql --version`
- Controlla che Redis sia installato: `redis-cli ping` (deve dire "PONG")

### L'app non si apre sul telefono
- Controlla che il telefono sia sulla stessa rete WiFi del computer
- Prova a ricaricare: scuoti il telefono e clicca "Reload"

### Non vedi i controlli
- Non è il tuo turno! Aspetta che sia scritto "YOUR TURN!"
- Oppure gioca con un altro giocatore

### "Invalid token" o errori strani
- Il token è scaduto, fai login di nuovo

---

## In Sintesi

1. **Terminale 1**: `cd backend && npm run dev` (lascia aperto)
2. **Terminale 2**: `cd frontend && npx expo start` (lascia aperto)
3. **Telefono**: Scansiona QR code, registrati, gioca!

---

## Domande Frequenti

**Q: Devo fare tutto questo ogni volta?**
A: No! La prima volta sì. Dopo basta fare Passo 2 e 3 (far partire i server).

**Q: Posso testare da solo o serve veramente 4 persone?**
A: Puoi fare login/logout e giocare con tutti e 4 gli account da solo!

**Q: Il gioco salva i progressi?**
A: Sì! Anche se chiudi l'app, quando riapri la partita è ancora lì.

**Q: Come faccio a vincere?**
A: Devi completare 100 linee in totale tra i 4 giocatori!

---

**FINITO! 🎉**

Se hai problemi, guarda cosa c'è scritto nel terminale, di solito dice dov'è l'errore!
