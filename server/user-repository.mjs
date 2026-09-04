import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { hashPassword } from './passwords.mjs';
import { createIntegrityState, normalizeIntegrity } from './anti-cheat.mjs';
import { normalizeStreak } from './streaks.mjs';

export const OATH_VERSION='2026-09-03-v1';

export class UserRepository {
  constructor(dataDir){
    this.dataDir=path.resolve(dataDir);
    this.file=path.join(this.dataDir,'users.json');
    this.loaded=false;
    this.users=[];
  }
  #normalizeUser(user){
    if(!user||typeof user!=='object')return user;
    user.bookmarks=Array.isArray(user.bookmarks)?user.bookmarks:[];
    user.predictions=Array.isArray(user.predictions)?user.predictions:[];
    user.comments=Array.isArray(user.comments)?user.comments:[];
    user.activity=Array.isArray(user.activity)?user.activity:[];
    user.integrity=normalizeIntegrity(user.integrity||createIntegrityState());
    user.streak=normalizeStreak(user.streak);
    return user;
  }
  async #ensure(){
    if(this.loaded)return;
    await fs.mkdir(this.dataDir,{recursive:true});
    try{
      const raw=await fs.readFile(this.file,'utf8');
      const data=JSON.parse(raw);
      this.users=(Array.isArray(data)?data:[]).map(user=>this.#normalizeUser(user));
    }catch(err){
      if(err.code!=='ENOENT') throw err;
      this.users=[];
      await this.#save();
    }
    this.loaded=true;
  }
  async #save(){
    await fs.mkdir(this.dataDir,{recursive:true});
    const tmp=`${this.file}.tmp`;
    await fs.writeFile(tmp,JSON.stringify(this.users,null,2),'utf8');
    await fs.rename(tmp,this.file);
  }
  publicUser(user){
    if(!user)return null;
    this.#normalizeUser(user);
    return {
      id:user.id, username:user.username, email:user.email, avatar:user.avatar,
      talents:user.talents, createdAt:user.createdAt, oath:user.oath,
      bookmarks:[...(user.bookmarks||[])], predictions:[...(user.predictions||[])],
      comments:[...(user.comments||[])], activity:[...(user.activity||[])],
      streak:{...user.streak}
    };
  }
  async listUsers(){await this.#ensure();return this.users;}
  async findByEmail(email){await this.#ensure();const key=String(email||'').trim().toLowerCase();return this.users.find(u=>u.email===key)||null;}
  async findById(id){await this.#ensure();return this.users.find(u=>u.id===id)||null;}
  async createUser({username,email,password,oathSignedName}){
    await this.#ensure();
    const normalizedEmail=String(email).trim().toLowerCase();
    if(this.users.some(u=>u.email===normalizedEmail)) throw Object.assign(new Error('Email already registered'),{code:'DUPLICATE_EMAIL'});
    const now=new Date().toISOString();
    const passwordHash=await hashPassword(password);
    const user={
      id:crypto.randomUUID(), username:String(username).trim(), email:normalizedEmail,
      passwordHash, avatar:String(username).trim().slice(0,1).toUpperCase()||'H', talents:2450,
      createdAt:now,
      oath:{version:OATH_VERSION,accepted:true,signedName:String(oathSignedName).trim(),acceptedAt:now},
      bookmarks:[], predictions:[], comments:[],
      activity:[{id:crypto.randomUUID(),type:'account-created',createdAt:now}],
      integrity:createIntegrityState(),
      streak:normalizeStreak()
    };
    this.users.push(user); await this.#save(); return user;
  }
  async updateUser(id,mutator){
    await this.#ensure();
    const index=this.users.findIndex(u=>u.id===id);
    if(index<0)return null;
    const user=this.#normalizeUser(this.users[index]);
    await mutator(user);
    this.users[index]=this.#normalizeUser(user);
    await this.#save();
    return this.users[index];
  }
}
