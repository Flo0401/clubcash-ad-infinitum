import fs from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import {fileURLToPath} from 'node:url';
import {pool} from '../db/pool.js';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const schema=await fs.readFile(path.resolve(__dirname,'../../../database/schema.sql'),'utf8');
await pool.query(schema);
const adminHash=await bcrypt.hash('admin123',12);
const memberHash=await bcrypt.hash('club123',12);
await pool.query(`INSERT INTO users(username,password_hash,name,role,balance_cents,member_number,bike,points)
VALUES('admin',$1,'Admin','admin',0,'AI-000','Ad Infinitum Verwaltung',999),
('florian',$2,'Florian','member',2450,'AI-001','Harley-Davidson Street Bob',120)
ON CONFLICT(username) DO NOTHING`,[adminHash,memberHash]);
const drinks=[
['Augustiner',200,20,20,'🍺'],['Chiemseer',200,20,20,'🍺'],
['Monster Energy',250,10,10,'🟢'],['Red Bull',200,10,10,'🔴'],
['Kaffee',200,10,8,'☕'],['Wasser',100,20,20,'💧'],
['Cola 250 ml',150,20,20,'🥤'],['Fanta 250 ml',150,20,20,'🥤'],
['Sprite 250 ml',150,20,20,'🥤']];
for(const d of drinks)await pool.query(
`INSERT INTO drinks(name,price_cents,stock,min_stock,emoji)
VALUES($1,$2,$3,$4,$5) ON CONFLICT(name) DO NOTHING`,d);
console.log('Datenbank eingerichtet.');
await pool.end();
