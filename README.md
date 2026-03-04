# Dokumentacja Techniczna: Messenger API (Real-Time Chat System)

Profesjonalny system komunikacji w czasie rzeczywistym oparty na architekturze klient-serwer. Projekt wykorzystuje stos technologiczny Node.js, Express, Socket.io oraz bazę danych MongoDB Atlas.



## Kluczowe Funkcjonalności

* **Autoryzacja JWT:** Zabezpieczony proces logowania i rejestracji z wykorzystaniem standardu JSON Web Token.
* **Komunikacja Real-Time:** Dwukierunkowa transmisja danych w czasie rzeczywistym oparta na protokole WebSockets.
* **System Kanałów:** Logiczna separacja strumieni wiadomości poprzez mechanizm pokoi (rooms).
* **Bezpieczeństwo i Integralność:**
    * Haszowanie haseł przy użyciu algorytmu BCrypt (Salt Rounds: 10).
    * Implementacja mechanizmu Rate Limiting dla protokołów HTTP oraz WebSocket.
    * Weryfikacja uprawnień (Ownership Validation) przy operacjach usuwania wiadomości.
    * System kodów zaproszeń (Invite Code) ograniczający nieautoryzowaną rejestrację.
* **Persystencja Danych:** Przechowywanie historii komunikacji w chmurowej bazie danych NoSQL (MongoDB Atlas).

---

## Struktura Katalogów

* `/config` – Moduły konfiguracyjne, w tym parametry połączenia z bazą danych.
* `/models` – Definicje schematów danych Mongoose (User, Message).
* `/routes` – Definicje punktów końcowych REST API (Authentication, Authorization).
* `/sockets` – Implementacja logiki obsługi zdarzeń i cyklu życia połączeń WebSocket.
* `index.js` – Główny plik wejściowy aplikacji, inicjalizacja middleware i serwerów.

---

## Konfiguracja Środowiska

Do poprawnego działania aplikacji wymagane jest zdefiniowanie zmiennych środowiskowych w pliku `.env` w katalogu głównym projektu.

### Specyfikacja pliku .env
```env
PORT=3001
MONGO_URI=twoj_link_do_mongodb_atlas
JWT_SECRET=twoj_tajny_klucz_do_tokenow
INVITE_CODE=twoje_haslo_do_rejestracji
