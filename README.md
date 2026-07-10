# Ad Infinitum ClubApp – Phase 2 v0.4

Neu:
- echtes PostgreSQL-Setup
- Login aus der Datenbank
- Getränkekauf als sichere Transaktion
- Guthabenaufladung mit Kassenprotokoll
- Buchungshistorie pro Mitglied

## Start
Backend:
```bash
cd backend
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```
