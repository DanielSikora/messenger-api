/**
 * Modul konfiguracji polaczenia z baza danych MongoDB.
 * Wykorzystuje biblioteke Mongoose do komunikacji z klastrem database-as-a-service.
 */

const mongoose = require('mongoose');

/**
 * Funkcja inicjalizujaca polaczenie z MongoDB.
 * Wykorzystuje zmienna srodowiskowa MONGO_URI do autoryzacji.
 * W przypadku niepowodzenia, proces zostaje przerwany z kodem bledu 1.
 */
const connectDB = async () => {
    try {
        // Konfiguracja polaczenia z wykorzystaniem domyslnych ustawien drivera
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('[DATABASE] Polaczenie z klastrem MongoDB zostalo ustanowione pomyslnie.');
    } catch (err) {
        console.error('[DATABASE] Blad polaczenia z baza danych:', err.message);
        
        // Zatrzymanie dzialania aplikacji w przypadku krytycznego bledu bazy
        process.exit(1);
    }
};

module.exports = connectDB;