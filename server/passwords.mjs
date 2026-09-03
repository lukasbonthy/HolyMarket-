import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(crypto.scrypt);
let bcryptPromise;
async function getBcrypt(){
  if(!bcryptPromise) bcryptPromise = import('bcryptjs').then(m=>m.default||m).catch(()=>null);
  return bcryptPromise;
}

export async function hashPassword(password){
  const bcrypt = await getBcrypt();
  if(bcrypt) return bcrypt.hash(password,12);
  const salt=crypto.randomBytes(16).toString('hex');
  const key=await scryptAsync(password,salt,64);
  return `scrypt$${salt}$${Buffer.from(key).toString('hex')}`;
}

export async function verifyPassword(password,hash){
  if(typeof hash!=='string') return false;
  if(hash.startsWith('$2')){
    const bcrypt=await getBcrypt();
    return bcrypt ? bcrypt.compare(password,hash) : false;
  }
  if(hash.startsWith('scrypt$')){
    const [,salt,hex]=hash.split('$');
    if(!salt||!hex) return false;
    const key=await scryptAsync(password,salt,64);
    const a=Buffer.from(hex,'hex');
    const b=Buffer.from(key);
    return a.length===b.length && crypto.timingSafeEqual(a,b);
  }
  return false;
}
