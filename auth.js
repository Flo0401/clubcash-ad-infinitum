import jwt from 'jsonwebtoken';
import {pool} from '../db/pool.js';
const SECRET=process.env.JWT_SECRET||'dev-secret';
export async function auth(req,res,next){
 const token=(req.headers.authorization||'').replace('Bearer ','');
 if(!token)return res.status(401).json({error:'Nicht angemeldet'});
 try{
  const payload=jwt.verify(token,SECRET);
  const r=await pool.query('SELECT * FROM users WHERE id=$1 AND active=TRUE',[payload.id]);
  if(!r.rows[0])return res.status(401).json({error:'Benutzer nicht gefunden'});
  req.user=r.rows[0];next();
 }catch{res.status(401).json({error:'Ungültige Anmeldung'});}
}
export function adminOnly(req,res,next){
 if(req.user.role!=='admin')return res.status(403).json({error:'Nur Admins erlaubt'});
 next();
}
