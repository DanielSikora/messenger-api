/**
 * Modul obslugi komunikacji w czasie rzeczywistym (WebSockets).
 * Odpowiada za zarzadzanie pokojami, przesylanie wiadomosci,
 * autoryzacje polaczen oraz mechanizmy Rate Limitingu.
 */

const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

/**
 * Globalna mapa do monitorowania aktywnosci uzytkownikow.
 * Sluzy do implementacji mechanizmu zapobiegania spamowi (Rate Limiting).
 * Struktura: socket.id => { count, lastReset }
 */
const messageLog = new Map();

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`[SOCKET] Nowe polaczenie ustanowione: ${socket.id}`);

        /**
         * Rejestracja uzytkownika w konkretnym kanale komunikacyjnym.
         * Pobiera i zwraca historie ostatnich 50 wiadomosci z danego pokoju.
         */
        socket.on('join_room', async (room) => {
            if (!room) return socket.emit('error_msg', 'Identyfikator pokoju jest wymagany.');
            
            try {
                socket.join(room);
                console.log(`[SOCKET] ID ${socket.id} przypisany do kanalu: ${room}`);

                const history = await Message.find({ room })
                    .sort({ timestamp: 1 })
                    .limit(50)
                    .lean();

                socket.emit('load_history', history);
            } catch (err) {
                console.error("[SOCKET ERROR] Blad inicjalizacji pokoju:", err);
                socket.emit('error_msg', 'Nie udalo sie zaladować historii pokoju.');
            }
        });

        /**
         * Obsluga wysylania nowej wiadomosci.
         * Zawiera weryfikacje tokena JWT oraz sprawdzanie limitow czasowych (Rate Limit).
         */
        socket.on('send_msg', async (data) => {
            const now = Date.now();
            const userLog = messageLog.get(socket.id) || { count: 0, lastReset: now };

            // Resetowanie licznika aktywnosci po uplywie 10 sekund
            if (now - userLog.lastReset > 10000) {
                userLog.count = 0;
                userLog.lastReset = now;
            }

            userLog.count++;
            messageLog.set(socket.id, userLog);

            // Blokada antyspamowa: max 5 wiadomosci na interwal 10s
            if (userLog.count > 5) {
                return socket.emit('error_msg', 'Przekroczono limit wiadomosci. Sprobuj ponownie za chwile.');
            }

            try {
                if (!data.token || !data.text) {
                    return socket.emit('error_msg', 'Przeslano niekompletne dane wiadomosci.');
                }

                if (data.text.trim().length === 0) {
                    return socket.emit('error_msg', 'Tresc wiadomosci nie moze byc pusta.');
                }

                /**
                 * Weryfikacja tozsamosci nadawcy na podstawie przeslanego tokena.
                 */
                let user;
                try {
                    user = jwt.verify(data.token, process.env.JWT_SECRET);
                } catch (jwtErr) {
                    return socket.emit('error_msg', 'Sesja uzytkownika wygasla.');
                }
                
                const roomName = data.room || 'general';

                const newMsg = new Message({
                    sender: user.username,
                    authorId: user.userId,
                    text: data.text.trim(),
                    room: roomName
                });

                const savedMsg = await newMsg.save();
                
                // Rozgloszenie wiadomosci do wszystkich subskrybentow danego kanalu
                io.to(roomName).emit('receive_msg', savedMsg);

            } catch (err) {
                console.error("[SOCKET ERROR] Blad procesowania wiadomosci:", err);
                socket.emit('error_msg', 'Wystapil blad podczas zapisu danych.');
            }
        });

        /**
         * Usuwanie wiadomosci z bazy danych.
         * Wymaga weryfikacji wlasnosci obiektu (authorId).
         */
        socket.on('delete_msg', async (data) => {
            try {
                if (!data.token || !data.msgId) return;

                const user = jwt.verify(data.token, process.env.JWT_SECRET);
                const msg = await Message.findById(data.msgId);
                
                if (!msg) return socket.emit('error_msg', 'Obiekt nie istnieje w bazie danych.');

                // Weryfikacja uprawnien do usuniecia zasobu
                if (msg.authorId.toString() !== user.userId) {
                    return socket.emit('error_msg', 'Brak uprawnien do usuniecia tej wiadomosci.');
                }

                await Message.findByIdAndDelete(data.msgId);
                io.emit('msg_deleted', data.msgId);

            } catch (err) {
                socket.emit('error_msg', 'Nie udalo sie wykonac operacji usuwania.');
            }
        });

        /**
         * Obsluga zakonczenia polaczenia.
         * Czyszczenie zasobow powiazanych z sesja socketu.
         */
        socket.on('disconnect', () => {
            messageLog.delete(socket.id);
            console.log(`[SOCKET] Polaczenie zakonczone dla ID: ${socket.id}`);
        });
    });
};