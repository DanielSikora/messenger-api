/**
 * Kontroler operacji autoryzacji i uwierzytelniania.
 * Obsluguje procesy rejestracji uzytkownikow oraz generowanie tokenow dostepowych.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Endpoint rejestracji nowego uzytkownika.
 * @route POST /auth/register
 * @desc Tworzy nowy rekord uzytkownika z zaszyfrowanym haslem.
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Implementacja haszowania hasla z uzyciem algorytmu BCrypt (salt rounds: 10)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({ 
            username, 
            password: hashedPassword 
        });

        await user.save();
        res.status(201).json({ message: "Rejestracja zakonczona sukcesem." });
    } catch (err) {
        // Obsluga bledu duplikatu klucza unikalnego (username)
        res.status(400).json({ error: "Uzytkownik o podanej nazwie juz istnieje w systemie." });
    }
});

/**
 * Endpoint uwierzytelniania uzytkownika.
 * @route POST /auth/login
 * @desc Weryfikuje poswiadczenia i zwraca token JWT.
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Walidacja obecnosci wymaganych danych wejsciowych
        if (!username || !password) {
            return res.status(400).json({ error: "Wszystkie pola formularza sa wymagane." });
        }

        // Identyfikacja uzytkownika w bazie danych
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: "Nieprawidlowe poswiadczenia uzytkownika." });
        }

        // Porownanie hasla tekstowego z hashem zapisanym w bazie
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Nieprawidlowe poswiadczenia uzytkownika." });
        }

        /**
         * Generowanie tokena dostepowego JSON Web Token (JWT).
         * Token zawiera identyfikator uzytkownika oraz nazwe wyswietlana.
         */
        const token = jwt.sign(
            { userId: user._id, username: user.username }, 
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Token wygasajacy po 24 godzinach
        );

        res.status(200).json({ 
            token, 
            username: user.username 
        });

    } catch (err) {
        console.error('[AUTH ERROR] Blad procesowania logowania:', err);
        res.status(500).json({ error: "Wystapil wewnetrzny blad bazy danych." });
    }
});

module.exports = router;