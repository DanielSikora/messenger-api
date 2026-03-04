/**
 * Glowny plik serwera aplikacji Messenger API.
 * Odpowiada za konfiguracje Express, polaczenie z baza danych,
 * zabezpieczenia Rate Limiting oraz inicjalizacje WebSockets.
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Import modulow wewnetrznych
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const chatSocket = require('./sockets/chatSocket');

const app = express();
const PORT = process.env.PORT || 3001;

/**
 * Konfiguracja polaczenia z baza danych MongoDB
 */
connectDB();

/**
 * Konfiguracja Middleware
 */
app.use(cors());
app.use(express.json()); // Parsowanie ciala zadan do formatu JSON

/**
 * Konfiguracja zabezpieczen przed atakami Brute Force (Rate Limiting)
 * Ograniczenie: max 15 zadan na 15 minut dla jednego adresu IP.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: { error: "Zbyt wiele prob logowania. Sprobuj ponownie za 15 minut." },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Definicja tras API
 */
app.use('/auth', authLimiter, authRoutes); // Zabezpieczone trasy autoryzacji

app.get('/', (req, res) => {
    res.status(200).json({ status: "API is running", timestamp: new Date() });
});

/**
 * Konfiguracja serwera HTTP oraz silnika Socket.io
 */
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

/**
 * Inicjalizacja obslugi zdarzen WebSocket
 */
chatSocket(io);

/**
 * Obsluga blednych sciezek (404) oraz bledow globalnych
 */
app.use((req, res, next) => {
    res.status(404).json({ error: "Endpoint nie istnieje (404)" });
});

app.use((err, req, res, next) => {
    console.error("Blad Serwera:", err.stack);
    res.status(500).json({ 
        error: "Wystapil wewnetrzny blad serwera",
        message: err.message 
    });
});

/**
 * Uruchomienie nasluchiwania serwera
 */
server.listen(PORT, () => {
    console.log(`[SERVER] Serwer zostal uruchomiony na porcie: ${PORT}`);
    console.log(`[SERVER] API Auth: http://localhost:${PORT}/auth`);
});