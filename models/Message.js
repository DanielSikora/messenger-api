/**
 * Model danych reprezentujacy wiadomosc w systemie czatu.
 * Definiuje strukture dokumentu przechowywanego w kolekcji 'messages'.
 */

const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    // Nazwa wyswietlana nadawcy (zdenormalizowana dla szybciejsczego odczytu)
    sender: { 
        type: String, 
        required: true 
    },
    // Referencja do unikalnego identyfikatora uzytkownika w kolekcji 'users'
    authorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    // Tresc wiadomosci przesylana przez uzytkownika
    text: { 
        type: String, 
        required: true 
    },
    // Identyfikator pokoju/kanalu, do ktorego przypisana jest wiadomosc
    room: { 
        type: String, 
        default: 'general' 
    },
    // Znacznik czasu utworzenia dokumentu
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

/**
 * Eksport modelu Message do uzytku w operacjach CRUD na bazie danych.
 */
module.exports = mongoose.model('Message', MessageSchema);