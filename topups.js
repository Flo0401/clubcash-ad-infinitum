import express from 'express';
import {pool} from '../db/pool.js';
import {auth} from '../middleware/auth.js';
const router=express.Router();
router.use(auth);
router.get('/mine',async(req,res)=>{
 const r=await pool.query('SELECT id,amount_cents,status,created_at,approved_at FROM topup_requests WHERE user_id=$1 ORDER BY created_at DESC',[req.user.id]);
 res.json(r.rows);
});
router.post('/',async(req,res)=>{
 const amount=Number(req.body.amountCents);
 if(!amount||amount<=0)return res.status(400).json({error:'Ungültiger Betrag'});
 const r=await pool.query("INSERT INTO topup_requests(user_id,amount_cents) VALUES($1,$2) RETURNING *",[req.user.id,amount]);
 res.status(201).json(r.rows[0]);
});
export default router;
