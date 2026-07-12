import express from 'express';
import bcrypt from 'bcryptjs';
import {pool,tx} from '../db/pool.js';
import {auth,adminOnly} from '../middleware/auth.js';
const router=express.Router();
router.use(auth,adminOnly);
router.get('/users',async(req,res)=>{
 const r=await pool.query('SELECT id,username,name,role,balance_cents,member_number,bike,points,active FROM users ORDER BY name');
 res.json(r.rows);
});
router.post('/users',async(req,res)=>{
 const username=String(req.body.username||'').trim().toLowerCase();
 const name=String(req.body.name||'').trim();
 if(!username||!name)return res.status(400).json({error:'Benutzername und Name fehlen'});
 try{
  const c=await pool.query("SELECT COUNT(*)::int count FROM users WHERE role='member'");
  const nr='AI-'+String(c.rows[0].count+1).padStart(3,'0');
  const hash=await bcrypt.hash(String(req.body.password||'club123'),12);
  const r=await pool.query("INSERT INTO users(username,password_hash,name,role,member_number,bike) VALUES($1,$2,$3,'member',$4,'Noch kein Motorrad') RETURNING id,username,name,role,balance_cents,member_number,bike,points,active",[username,hash,name,nr]);
  res.status(201).json(r.rows[0]);
 }catch(e){res.status(e.code==='23505'?400:500).json({error:e.code==='23505'?'Benutzername existiert bereits':'Mitglied konnte nicht angelegt werden'});}
});
router.get('/topups',async(req,res)=>{
 const r=await pool.query("SELECT tr.id,tr.amount_cents,tr.created_at,u.id user_id,u.name member_name FROM topup_requests tr JOIN users u ON u.id=tr.user_id WHERE tr.status='pending' ORDER BY tr.created_at");
 res.json(r.rows);
});
router.post('/topups/:id/approve',async(req,res)=>{
 try{
  const user=await tx(async client=>{
   const rr=await client.query("SELECT * FROM topup_requests WHERE id=$1 AND status='pending' FOR UPDATE",[Number(req.params.id)]);
   const request=rr.rows[0]; if(!request)throw new Error('Anfrage nicht gefunden');
   const ur=await client.query('UPDATE users SET balance_cents=balance_cents+$1 WHERE id=$2 RETURNING id,name,balance_cents',[request.amount_cents,request.user_id]);
   await client.query("UPDATE topup_requests SET status='approved',approved_by=$1,approved_at=NOW() WHERE id=$2",[req.user.id,request.id]);
   await client.query("INSERT INTO ledger(user_id,type,amount_cents,note,created_by) VALUES($1,'topup',$2,'Guthaben-Anfrage freigegeben',$3)",[request.user_id,request.amount_cents,req.user.id]);
   return ur.rows[0];
  });
  res.json({ok:true,user});
 }catch(e){res.status(400).json({error:e.message});}
});
router.post('/topups/:id/reject',async(req,res)=>{
 const r=await pool.query("UPDATE topup_requests SET status='rejected',approved_by=$1,approved_at=NOW() WHERE id=$2 AND status='pending' RETURNING id",[req.user.id,Number(req.params.id)]);
 if(!r.rows[0])return res.status(404).json({error:'Anfrage nicht gefunden'});
 res.json({ok:true});
});
export default router;
