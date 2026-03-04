/**
 * Kontroler operacji autoryzacji i uwierzytelniania.
 * Obsluguje procesy rejestracji uzytkownikow z kodem zaproszenia oraz logowanie.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Endpoint rejestracji nowego uzytkownika.
 * @route POST /auth/register
 * @desc Weryfikuje kod zaproszenia, haszuje haslo i tworzy uzytkownika.
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password, inviteCode } = req.body;

        // 1. Walidacja kodu zaproszenia ze zmiennych srodowiskowych (Render Variables)
        const systemInviteCode = process.env.INVITE_CODE;
        
        if (!inviteCode || inviteCode !== systemInviteCode) {
            return res.status(403).json({ 
                error: "Nieprawidlowy kod zaproszenia. Rejestracja zostala odrzucona." 
            });
        }

        // 2. Sprawdzenie czy wszystkie pola sa wypelnione
        if (!username || !password) {
            return res.status(400).json({ error: "Wszystkie pola sa wymagane." });
        }

        // 3. Implementacja haszowania hasla (BCrypt)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({ 
            username, 
            password: hashedPassword 
        });

        await user.save();
        res.status(201).json({ message: "Konto zostalo utworzone pomyslnie." });

    } catch (err) {
        // Obsluga bledu duplikatu (unique: true w modelu User)
        if (err.code === 11000) {
            return res.status(400).json({ error: "Uzytkownik o podanej nazwie juz istnieje." });
        }
        res.status(500).json({ error: "Wystapil blad podczas rejestracji." });
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

        if (!username || !password) {
            return res.status(400).json({ error: "Wprowadz login oraz haslo." });
        }

        // Poszukiwanie uzytkownika w bazie
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: "Bledne dane logowania." });
        }

        // Porownanie hashów haseł
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Bledne dane logowania." });
        }

        /**
         * Generowanie tokena dostepowego JWT (wazny 24h).
         */
        const token = jwt.sign(
            { userId: user._id, username: user.username }, 
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({ 
            token, 
            username: user.username 
        });

    } catch (err) {
        console.error('[AUTH ERROR]:', err);
        res.status(500).json({ error: "Blad serwera podczas logowania." });
    }
});

module.exports = router;