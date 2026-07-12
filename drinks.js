import express from 'express';
import {pool,tx} from '../db/pool.js';
import {auth} from '../middleware/auth.js';
const router=express.Router();
router.get('/',auth,async(req,res)=>res.json((await pool.query('SELECT * FROM drinks WHERE active=TRUE ORDER BY id')).rows));
router.get('/mine',auth,async(req,res)=>{
 const r=await pool.query('SELECT id,drink_name,price_cents,created_at FROM bookings WHERE user_id=$1 ORDER BY created_at DESC',[req.user.id]);
 res.json(r.rows);
});
router.post('/buy/:id',auth,async(req,res)=>{
 try{
  const out=await tx(async client=>{
   const ur=await client.query('SELECT balance_cents,points FROM users WHERE id=$1 FOR UPDATE',[req.user.id]);
   const dr=await client.query('SELECT * FROM drinks WHERE id=$1 AND active=TRUE FOR UPDATE',[Number(req.params.id)]);
   const u=ur.rows[0],d=dr.rows[0];
   if(!d)throw new Error('Getränk nicht gefunden');
   if(d.stock<=0)throw new Error('Nicht auf Lager');
   if(u.balance_cents<d.price_cents)throw new Error('Nicht genügend Guthaben');
   const uu=await client.query('UPDATE users SET balance_cents=balance_cents-$1,points=points+1 WHERE id=$2 RETURNING balance_cents,points',[d.price_cents,req.user.id]);
   const dd=await client.query('UPDATE drinks SET stock=stock-1,sold=sold+1 WHERE id=$1 RETURNING *',[d.id]);
   await client.query('INSERT INTO bookings(user_id,drink_id,drink_name,price_cents) VALUES($1,$2,$3,$4)',[req.user.id,d.id,d.name,d.price_cents]);
   await client.query("INSERT INTO ledger(user_id,type,amount_cents,note,created_by) VALUES($1,'drink',$2,$3,$1)",[req.user.id,-d.price_cents,d.name]);
   return{user:uu.rows[0],drink:dd.rows[0]};
  });
  res.json({ok:true,...out});
 }catch(e){res.status(400).json({error:e.message});}
});
export default router;
