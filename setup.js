import fs from 'node:fs/promises';
import bcrypt from 'bcryptjs';
import {pool} from './db/pool.js';
const schema=await fs.readFile(new URL('../../database/schema.sql',import.meta.url),'utf8');
await pool.query(schema);
const ah=await bcrypt.hash('admin123',12),fh=await bcrypt.hash('club123',12);
await pool.query("INSERT INTO users(username,password_hash,name,role,balance_cents,member_number,bike,points) VALUES('admin',$1,'Admin','admin',0,'AI-000','Verwaltung',999),('florian',$2,'Florian','member',2450,'AI-001','Harley-Davidson Street Bob',120) ON CONFLICT(username) DO NOTHING",[ah,fh]);
for(const d of [['Augustiner',200,20,20,'🍺'],['Chiemseer',200,20,20,'🍺'],['Monster Energy',250,10,10,'🟢'],['Red Bull',200,10,10,'🔴'],['Kaffee',200,10,8,'☕'],['Wasser',100,20,20,'💧'],['Cola 250 ml',150,20,20,'🥤'],['Fanta 250 ml',150,20,20,'🥤'],['Sprite 250 ml',150,20,20,'🥤']])
 await pool.query('INSERT INTO drinks(name,price_cents,stock,min_stock,emoji) VALUES($1,$2,$3,$4,$5) ON CONFLICT(name) DO NOTHING',d);
console.log('Datenbank eingerichtet');await pool.end();
