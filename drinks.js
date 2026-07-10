import express from 'express';
import {pool,tx} from '../db/pool.js';
import {auth} from '../middleware/auth.js';
const router=express.Router();
router.get('/',auth,async(req,res)=>{
 const r=await pool.query(`SELECT id,name,price_cents,stock,min_stock,emoji,sold FROM drinks WHERE active=TRUE ORDER BY id`);
 res.json(r.rows);
});
router.get('/my-bookings',auth,async(req,res)=>{
 const r=await pool.query(`SELECT id,drink_name,price_cents,created_at FROM bookings WHERE user_id=$1 ORDER BY created_at DESC`,[req.user.id]);
 res.json(r.rows.map(x=>({id:x.id,drinkName:x.drink_name,priceCents:x.price_cents,createdAt:x.created_at})));
});
router.post('/buy/:id',auth,async(req,res)=>{
 try{
  const result=await tx(async client=>{
   const ur=await client.query(`SELECT balance_cents,points FROM users WHERE id=$1 FOR UPDATE`,[req.user.id]);
   const dr=await client.query(`SELECT * FROM drinks WHERE id=$1 AND active=TRUE FOR UPDATE`,[Number(req.params.id)]);
   const user=ur.rows[0],drink=dr.rows[0];
   if(!drink)throw new Error('Getränk nicht gefunden');
   if(drink.stock<=0)throw new Error('Nicht auf Lager');
   if(user.balance_cents<drink.price_cents)throw new Error('Nicht genügend Guthaben');
   const uu=await client.query(`UPDATE users SET balance_cents=balance_cents-$1,points=points+1 WHERE id=$2 RETURNING balance_cents,points`,[drink.price_cents,req.user.id]);
   const dd=await client.query(`UPDATE drinks SET stock=stock-1,sold=sold+1 WHERE id=$1 RETURNING *`,[drink.id]);
   const bb=await client.query(`INSERT INTO bookings(user_id,drink_id,drink_name,price_cents) VALUES($1,$2,$3,$4) RETURNING *`,[req.user.id,drink.id,drink.name,drink.price_cents]);
   await client.query(`INSERT INTO ledger(user_id,type,amount_cents,note,created_by) VALUES($1,'drink',$2,$3,$1)`,[req.user.id,-drink.price_cents,drink.name]);
   return{user:uu.rows[0],drink:dd.rows[0],booking:bb.rows[0]};
  });
  res.json({ok:true,balanceCents:result.user.balance_cents,points:result.user.points,drink:result.drink,booking:result.booking});
 }catch(error){res.status(400).json({error:error.message});}
});
export default router;
