# WMS-lite

Proste REST API do zarządzania magazynem (Warehouse Management System) zbudowane w FastAPI.

## Funkcjonalności

- CRUD dla produktów, lokalizacji magazynowych i ruchów magazynowych
- Relacje między tabelami (foreign keys) — ruchy magazynowe powiązane z produktami i lokalizacjami
- Logika biznesowa: automatyczna aktualizacja stanu magazynowego przy przyjęciach/wydaniach
- Autoryzacja JWT (rejestracja, logowanie, hashowanie haseł bcrypt)
- System ról (worker/manager) z ograniczeniami dostępu
- Alert niskiego stanu magazynowego
- Walidacja danych i obsługa błędów (404, 400, 401, 403)

## Stack technologiczny

- **FastAPI** — framework webowy
- **SQLAlchemy** — ORM
- **SQLite** — baza danych
- **Pydantic** — walidacja danych
- **python-jose** — tokeny JWT
- **passlib (bcrypt)** — hashowanie haseł

## Uruchomienie lokalne

```bash
git clone https://github.com/anakinskywalker0310/wms.lite.git
cd wms.lite
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Stwórz plik `.env` w głównym folderze: