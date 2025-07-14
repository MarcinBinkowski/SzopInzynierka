## Architektura
- Backend: Django REST Framework z PostgreSQL, Redis i Celery, Django-Allauth
- Frontend: React, Tanstack Router, shadcn/UI, Material UI, TanStack Query, Zod i React Hook Form  
- Mobile: React Native + Expo + React Native Paper, Zod, React Hook Form , TanStack Query
- API: OpenAPI/Swagger z automatycznym generowaniem klientów (Orval)  
- Płatności: Stripe
- Przechowywanie plików: MinIO (zdjęcia produktów)  

## Użytkownicy i uprawnienia
- Trzy role: Admin, Employee, User  
- Automatyczne tworzenie profilu przy rejestracji  
- Wymagana kompletność profilu przed zamówieniem  
- Sesje w aplikacji mobilnej przechowywane w SecureStore  
- Role-based access do endpointów  

## Produkty i katalog
- Produkty z kategoriami, tagami, producentami  
- Zdjęcia: upload drag & drop, wybór zdjęcia głównego, sortowanie
- Ceny i czasowo ograniczone wyprzedaze
- Widoczność produktów (flaga is_visible)  
- Automatyczne zmniejszanie stanu po zakupie  

## Zamówienia i koszyk
- Walidacja dostępności  
- Walidacja stanów magazynowych przed płatnością  
- Automatyczna zmiana statusów (trigger w PostgreSQL)  
- Automatyczne tworzenie przesyłki przy zamówieniu  
- Integracja ze Stripe
- Walidacja płatności przed utworzeniem zamówienia  
- Automatyczne zmniejszenie stock po udanej płatności  

## Kupony i promocje
- Kupony z datą ważności i limitami użycia (globalne i per user)  
- Walidacja użycia kuponów  

## Notyfikacje
- Powiadomienia Push dla listy zyczen (produkt dostępny/ promocja)  
- Historia notyfikacji i możliwość konfiguracji preferencji  

## Faktury
- Szablony faktur w Jinja2 z walidacją 
- Edycja w Monaco Editor  
- Generowanie PDF (pdfkit/wkhtmltopdf)  
- Automatyczne tworzenie faktur po zamówieniu  
- Podgląd szablonów w panelu admina (iframe)  

## Zarządzanie stanem
- Zustand do stanu globalnego (frontend)  
- React Query do trzymania cache odpowiedzi serwera
- Uniewaznianie cache
- SecureStore do trzymania danych na mobile  

## Automatyzacja i integracje
- Zadania Celery dla operacji asynchronicznych  
- Automatyczne generowanie klientów API (OpenAPI + Orval)  

## Dodatkowe
- Docker Compose do lokalnego developmentu  
- Makefile do automatyzacji na macOS  
- Serwowanie plików statycznych przez MinIO  
