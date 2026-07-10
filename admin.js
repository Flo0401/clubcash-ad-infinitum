import express from 'express';
import {pool,tx} from '../db/pool.js';
import {auth,adminOnly} from '../middleware/auth.js';
const router=express.Router();
router.use(auth,adminOnly);
router.get('/users',async(req,res)=>{
 const r=await pool.query(`SELECT id,username,name,role,balance_cents,member_number,bike,points,active FROM users ORDER BY name`);
 res.json(r.rows.map(u=>({id:u.id,username:u.username,name:u.name,role:u.role,balanceCents:u.balance_cents,memberNumber:u.member_number,bike:u.bike,points:u.points,active:u.active})));
});
router.get('/dashboard',async(req,res)=>{
 const [m,b,s,l]=await Promise.all([
  pool.query(`SELECT COUNT(*)::int count FROM users WHERE role='member' AND active=TRUE`),
  pool.query(`SELECT COALESCE(SUM(balance_cents),0)::int total FROM users WHERE active=TRUE`),
  pool.query(`SELECT COALESCE(SUM(sold),0)::int total FROM drinks WHERE active=TRUE`),
  pool.query(`SELECT id,name,stock,min_stock FROM drinks WHERE active=TRUE AND stock<min_stock`)
 ]);
 res.json({members:m.rows[0].count,totalBalanceCents:b.rows[0].total,sold:s.rows[0].total,lowStock:l.rows});
});
router.post('/topup',async(req,res)=>{
 const userId=Number(req.body.userId),amount=Number(req.body.amountCents);
 if(!amount||amount<=0)return res.status(400).json({error:'Ungültiger Betrag'});
 try{
  const user=await tx(async client=>{
   const r=await client.query(`UPDATE users SET balance_cents=balance_cents+$1 WHERE id=$2 AND active=TRUE RETURNING id,name,balance_cents`,[amount,userId]);
   if(!r.rows[0])throw new Error('Mitglied nicht gefunden');
   await client.query(`INSERT INTO ledger(user_id,type,amount_cents,note,created_by) VALUES($1,'topup',$2,'Guthaben freigegeben',$3)`,[userId,amount,req.user.id]);
   return r.rows[0];
  });
  res.json({ok:true,user});
 }catch(error){res.status(400).json({error:error.message});}
});
router.get('/ledger',async(req,res)=>{
 const r=await pool.query(`SELECT l.id,l.type,l.amount_cents,l.note,l.created_at,u.name member_name,a.name admin_name FROM ledger l JOIN users u ON u.id=l.user_id LEFT JOIN users a ON a.id=l.created_by ORDER BY l.created_at DESC LIMIT 200`);
 res.json(r.rows);
});
export default router;
