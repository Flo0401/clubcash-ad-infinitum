import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Demo data until database is connected
const users = [
  {
    id: 1,
    username: 'admin',
    passwordHash: bcrypt.hashSync('admin123', 10),
    name: 'Admin',
    role: 'admin',
    balanceCents: 0
  },
  {
    id: 2,
    username: 'florian',
    passwordHash: bcrypt.hashSync('club123', 10),
    name: 'Florian',
    role: 'member',
    balanceCents: 2450
  }
];

const drinks = [
  { id: 1, name: 'Augustiner', priceCents: 200, stock: 20, emoji: '🍺' },
  { id: 2, name: 'Chiemseer', priceCents: 200, stock: 20, emoji: '🍺' },
  { id: 3, name: 'Monster Energy', priceCents: 250, stock: 10, emoji: '🟢' },
  { id: 4, name: 'Red Bull', priceCents: 200, stock: 10, emoji: '🔴' },
  { id: 5, name: 'Kaffee', priceCents: 200, stock: 10, emoji: '☕' },
  { id: 6, name: 'Wasser', priceCents: 100, stock: 20, emoji: '💧' },
  { id: 7, name: 'Cola 250 ml', priceCents: 150, stock: 20, emoji: '🥤' },
  { id: 8, name: 'Fanta 250 ml', priceCents: 150, stock: 20, emoji: '🥤' },
  { id: 9, name: 'Sprite 250 ml', priceCents: 150, stock: 20, emoji: '🥤' }
];

function createToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Nicht angemeldet' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Ungültige Anmeldung' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Nur Admins erlaubt' });
  }
  next();
}

app.get('/', (req, res) => {
  res.json({ app: 'Ad Infinitum ClubApp API', status: 'online' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === String(username).toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Benutzername oder Passwort falsch' });
  }

  res.json({
    token: createToken(user),
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      balanceCents: user.balanceCents
    }
  });
});

app.get('/api/me', auth, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    balanceCents: user.balanceCents
  });
});

app.get('/api/drinks', auth, (req, res) => {
  res.json(drinks);
});

app.post('/api/buy/:drinkId', auth, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  const drink = drinks.find(d => d.id === Number(req.params.drinkId));

  if (!drink) return res.status(404).json({ error: 'Getränk nicht gefunden' });
  if (drink.stock <= 0) return res.status(400).json({ error: 'Nicht auf Lager' });
  if (user.balanceCents < drink.priceCents) {
    return res.status(400).json({ error: 'Nicht genügend Guthaben' });
  }

  user.balanceCents -= drink.priceCents;
  drink.stock -= 1;

  res.json({
    ok: true,
    message: `${drink.name} gebucht`,
    balanceCents: user.balanceCents,
    drink
  });
});

app.post('/api/admin/topup', auth, requireAdmin, (req, res) => {
  const { userId, amountCents } = req.body;
  const user = users.find(u => u.id === Number(userId));

  if (!user) return res.status(404).json({ error: 'Mitglied nicht gefunden' });
  if (!amountCents || amountCents <= 0) return res.status(400).json({ error: 'Ungültiger Betrag' });

  user.balanceCents += Number(amountCents);

  res.json({
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      balanceCents: user.balanceCents
    }
  });
});

app.get('/api/admin/users', auth, requireAdmin, (req, res) => {
  res.json(users.map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    balanceCents: u.balanceCents
  })));
});

app.listen(PORT, () => {
  console.log(`Ad Infinitum API läuft auf http://localhost:${PORT}`);
});
