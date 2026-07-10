import jwt from 'jsonwebtoken';
import {pool} from '../db/pool.js';
const SECRET=process.env.JWT_SECRET||'dev-secret';
export async function auth(req,res,next){
 const token=(req.headers.authorization||'').replace('Bearer ','');
 if(!token)return res.status(401).json({error:'Nicht angemeldet'});
 try{
  const payload=jwt.verify(token,SECRET);
  const result=await pool.query(`SELECT id,username,name,role,balance_cents,member_number,bike,points,active FROM users WHERE id=$1`,[payload.id]);
  const user=result.rows[0];
  if(!user||!user.active)return res.status(401).json({error:'Benutzer nicht gefunden'});
  req.user=user;next();
 }catch{return res.status(401).json({error:'Ungültige Anmeldung'});}
}
export function adminOnly(req,res,next){
 if(req.user?.role!=='admin')return res.status(403).json({error:'Nur Admins erlaubt'});
 next();
}
