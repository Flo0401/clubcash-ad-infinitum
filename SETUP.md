# PostgreSQL Setup

`.env`:
```env
PORT=4000
JWT_SECRET=ein-langes-geheimes-passwort
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DATABASE
FRONTEND_ORIGIN=http://localhost:5173
```

Danach:
```bash
cd backend
npm install
npm run db:setup
npm run dev
```
