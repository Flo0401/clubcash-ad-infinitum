import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const {Pool}=pg;
export const pool=new Pool({
 connectionString:process.env.DATABASE_URL,
 ssl:process.env.DATABASE_URL?.includes('localhost')?false:{rejectUnauthorized:false}
});
export async function tx(fn){
 const client=await pool.connect();
 try{await client.query('BEGIN');const result=await fn(client);await client.query('COMMIT');return result;}
 catch(error){await client.query('ROLLBACK');throw error;}
 finally{client.release();}
}
