/**
 * Model danych reprezentujacy uzytkownika systemu.
 * Przechowuje informacje o autoryzacji oraz profilu uzytkownika.
 */

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // Unikalna nazwa uzytkownika wykorzystywana podczas logowania
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    // Hash hasla uzytkownika (przechowywany w formie zaszyfrowanej)
    password: { 
        type: String, 
        required: true 
    },
    // Adres URL do zasobu graficznego reprezentujacego profil uzytkownika
    avatar: { 
        type: String, 
        default: 'https://api.dicebear.com/7.x/avataaars/svg' 
    }
});

/**
 * Eksport modelu User.
 * Pole 'username' posiada automatyczny indeks unikalny w bazie MongoDB.
 */
module.exports = mongoose.model('User', UserSchema);