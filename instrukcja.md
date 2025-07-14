# Instrukcja uruchomienia projektu SzopInzynierka

Projekt SzopInzynierka to platforma e-commerce oparta o Django (backend), React (frontend) i React Native (mobile).
Instrukcja opisuje, jak przygotować środowisko i uruchomić poszczególne moduły aplikacji.

---

## Wymagane oprogramowanie

### Podstawowe programy
- Docker Desktop 
- Node.js (v18+) 
- Python (v3.11+) 

### Dodatkowe programy dla aplikacji mobilnej
- Xcode (macOS)  
- Android Studio
- Expo CLI – instalacja globalna:  
  ```bash
  npm install -g @expo/cli
  ```

---

## Backend (Django + PostgreSQL + Redis + MinIO)
### stworzenie środowiska (potrzebne tylko na macOS w przypadku uruchamiania notify.py)
```bash
cd backend
python/python3 -m venv .venv
source ./venv/bin/activate
pip install -r requirements.txt
```
### Uruchomienie usług
Tylko macOS, dodatkowo uruchamia notify.py - plik do wysyłania notyfikacji.
```bash
cd backend
make up
```
lub (inne systemy)
```bash
cd backend
docker-compose up
```

Po uruchomieniu backend działa na porcie 8000.  
Swagger: [http://localhost:8000/api/schema/swagger-ui/](http://localhost:8000/api/schema/swagger-ui/)

---

### Konfiguracja MinIO – pierwszy start

Po pierwszym uruchomieniu należy wejść do panelu MinIO i stworzyć bucket na zdjęcia produktów.

1. Wejdź na [http://localhost:9001](http://localhost:9001)  
2. Zaloguj się:  
   - Login: `minioadmin`  
   - Hasło: `minioadmin123`  
3. Przejdź do zakładki Buckets → Create Bucket  
4. Nazwij bucket `product-images` i zapisz

---

### Wczytanie backupu bazy danych w DBeaver

1. Uruchom backend (`make up`).  
2. Otwórz DBeaver i połącz się z PostgreSQL:  
   - Host: `localhost`  
   - Port: `5432`  
   - User: `admin`  
   - Password: `secret`
   - Database: `shopdjango`
3. Kliknij prawym przyciskiem na bazie → Tools → Restore  
4. Wskaż plik backup
5. Kliknij Start i poczekaj na zakończenie

---

## Frontend (React + Vite)

### Instalacja
```bash
cd frontend
npm install
```

### Uruchomienie
```bash
npm run dev
```

Frontend jest dostępny pod adresem: [http://localhost:3000](http://localhost:3000)

---

## Mobile (React Native + Expo)

### Przygotowanie



### Konfiguracja Stripe

1. Załóż konto na [https://stripe.com/](https://stripe.com/)  
2. Skopiuj klucze z Developers → API keys  
3. Dodaj je do plików:
   - `backend/.env`:
     ```env
     STRIPE_SECRET_KEY=sk_test_...
     ```
   - `mobile/app.json` (sekcja `extra`):
     ```json
     "stripePublishableKey": "pk_test_..."
     ```

Przejdź do katalogu:
```bash
cd mobile
```

Edytuj plik `mobile/app.json` i dodaj klucz Stripe w sekcji `extra`:  
```json
{
  "expo": {
    "extra": {
      "stripePublishableKey": "pk_test_..."
    }
  }
}
```

### Instalacja zależności
https://docs.expo.dev/
```bash
npm install
```

Na macOS dodatkowo:
```bash
cd ios && pod install && cd ..
```

### Uruchomienie
- iOS (symulator):
  ```bash
  npx expo start --ios
  ```
- Android (emulator):
  ```bash
  npx expo start --android
  ```


## Uruchomienie całego projektu

1. Backend:
   ```bash
   cd backend
   make up
   ```
2. Frontend:
   ```bash
   cd frontend
   npm run dev
   ```
3. Mobile:
   ```bash
   cd mobile
   npx expo start --ios   # lub --android
   ```


## Testowanie

### Dostępni uzytkownicy

- **admin@test.com**: test12345
- **employee@test.com**: test12345
- **user@test.com**: test12345


### Płatności Stripe
Dane karty:

- **Card Number**: `4242424242424242`
- **Expiry Date**: Any future MM/YY (e.g., `12/25`)
- **CVC**: Any 3-digit number (e.g., `123`)
