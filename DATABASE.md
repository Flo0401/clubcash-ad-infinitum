# Datenbank-Setup

Für die produktive App brauchen wir PostgreSQL.

## Tabellen anlegen

Die Datei `database/schema.sql` enthält die Tabellen.

## Startdaten

Die Datei `database/seed.sql` enthält Getränke und Demo-Nutzer.

## Umgebung

In `backend/.env`:

```env
PORT=4000
JWT_SECRET=ein-langes-geheimes-passwort
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DATABASE
USE_DATABASE=false
```

Aktuell läuft die App mit `USE_DATABASE=false` im Demo-Modus.
Im nächsten Schritt stellen wir auf echte Datenbankabfragen um.
