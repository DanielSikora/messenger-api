# Messenger API - Real-Time Chat System

Profesjonalny system komunikacji w czasie rzeczywistym oparty na architekturze klient-serwer. Projekt wykorzystuje stos technologiczny **Node.js**, **Express**, **Socket.io** oraz bazę danych **MongoDB**.



## 🚀 Główne Funkcje

* **Autentykacja JWT:** Bezpieczne logowanie i rejestracja z wykorzystaniem tokenów JSON Web Token.
* **Komunikacja Real-Time:** Obsługa wiadomości w czasie rzeczywistym dzięki WebSockets (Socket.io).
* **System Pokoi:** Możliwość tworzenia i dołączania do dedykowanych kanałów rozmów.
* **Bezpieczeństwo:** * Haszowanie haseł algorytmem **BCrypt**.
    * **Rate Limiting** (ograniczenie liczby żądań HTTP i wiadomości na sekundę).
    * Walidacja uprawnień przy usuwaniu wiadomości.
* **Persystencja Danych:** Przechowywanie historii czatu w chmurze MongoDB Atlas.

---

## 🛠 Struktura Projektu

* `/config` – konfiguracja połączenia z bazą danych.
* `/models` – schematy danych Mongoose (User, Message).
* `/routes` – endpointy REST API (rejestracja, logowanie).
* `/sockets` – logika obsługi zdarzeń WebSocket.
* `index.js` – punkt wejścia aplikacji i konfiguracja middleware.

---

## ⚙️ Instalacja i Uruchomienie

### 1. Klonowanie repozytorium i instalacja zależności
```bash
npm install