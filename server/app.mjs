import express from 'express';
import session from 'express-session';
import path from 'node:path';
import { UserRepository } from './user-repository.mjs';
import { verifyPassword } from './passwords.mjs';
import crypto from 'node:crypto';

const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const jsonError=(res,status,error)=>res.status(status).json({error});
const regenerate=req=>new Promise((resolve,reject)=>req.session.regenerate(err=>err?reject(err):resolve()));
const saveSession=req=>new Promise((resolve,reject)=>req.session.save(err=>err?reject(err):resolve()));

export function createApp({rootDir=process.cwd(),dataDir=path.join(process.cwd(),'data'),sessionSecret='holymarket-dev-secret',production=false}={}){
  const app=express();
  const users=new UserRepository(dataDir);
  app.locals.users=users;
  if(production) app.set('trust proxy',1);
  app.disable('x-powered-by');
  app.use(express.json({limit:'32kb'}));
  app.use(session({
    name:'hm.sid',secret:sessionSecret,resave:false,saveUninitialized:false,
    cookie:{httpOnly:true,sameSite:'lax',secure:production,maxAge:30*24*60*60*1000}
  }));

  const currentUser=async req=>req.session?.userId ? users.findById(req.session.userId) : null;
  const requireAuth=async(req,res,next)=>{try{const user=await currentUser(req);if(!user)return jsonError(res,401,'Log in to continue.');req.user=user;next();}catch(err){next(err)}};

  app.get('/api/status',(req,res)=>res.json({ok:true,provider:process.env.YVP_APP_KEY?'youversion':'web-fallback',auth:'express-session'}));

  app.post('/api/auth/register',async(req,res,next)=>{
    try{
      const username=String(req.body?.username||'').trim();
      const email=String(req.body?.email||'').trim().toLowerCase();
      const password=String(req.body?.password||'');
      const oathAccepted=req.body?.oathAccepted===true;
      const oathSignedName=String(req.body?.oathSignedName||'').trim();
      if(username.length<2||username.length>24)return jsonError(res,400,'Username must be 2–24 characters.');
      if(!EMAIL_RE.test(email))return jsonError(res,400,'Enter a valid email address.');
      if(password.length<8)return jsonError(res,400,'Password must be at least 8 characters.');
      if(!oathAccepted||oathSignedName.length<2)return jsonError(res,400,'You must accept and sign the Bible-truth oath.');
      if(await users.findByEmail(email))return jsonError(res,409,'An account with that email already exists.');
      const user=await users.createUser({username,email,password,oathSignedName});
      await regenerate(req); req.session.userId=user.id; await saveSession(req);
      res.status(201).json({user:users.publicUser(user)});
    }catch(err){next(err)}
  });

  app.post('/api/auth/login',async(req,res,next)=>{
    try{
      const email=String(req.body?.email||'').trim().toLowerCase();
      const password=String(req.body?.password||'');
      const user=await users.findByEmail(email);
      if(!user||!(await verifyPassword(password,user.passwordHash)))return jsonError(res,401,'Invalid email or password.');
      await regenerate(req); req.session.userId=user.id; await saveSession(req);
      res.json({user:users.publicUser(user)});
    }catch(err){next(err)}
  });

  app.post('/api/auth/logout',(req,res,next)=>{
    if(!req.session){res.clearCookie('hm.sid');return res.json({ok:true});}
    req.session.destroy(err=>{if(err)return next(err);res.clearCookie('hm.sid',{httpOnly:true,sameSite:'lax',secure:production});res.json({ok:true});});
  });

  app.get('/api/auth/me',async(req,res,next)=>{try{res.json({user:users.publicUser(await currentUser(req))});}catch(err){next(err)}});
  app.get('/api/me/state',requireAuth,(req,res)=>res.json({user:users.publicUser(req.user)}));

  app.post('/api/me/predictions',requireAuth,async(req,res,next)=>{
    try{
      const marketId=String(req.body?.marketId||'').trim();
      const outcomeIndex=Number(req.body?.outcomeIndex);
      const side=String(req.body?.side||'yes');
      const stake=Math.floor(Number(req.body?.stake));
      if(!marketId||!Number.isInteger(outcomeIndex)||outcomeIndex<0||outcomeIndex>10)return jsonError(res,400,'Invalid prediction.');
      if(!Number.isFinite(stake)||stake<1)return jsonError(res,400,'Stake must be at least 1 Talent.');
      if((req.user.predictions||[]).some(p=>p.marketId===marketId))return jsonError(res,409,'Prediction already locked for this market.');
      if(stake>req.user.talents)return jsonError(res,400,'Not enough Talents.');
      const now=new Date().toISOString();
      const updated=await users.updateUser(req.user.id,user=>{
        user.talents-=stake;
        user.predictions.unshift({id:crypto.randomUUID(),marketId,outcomeIndex,side,stake,createdAt:now});
        user.activity.unshift({id:crypto.randomUUID(),type:'prediction',marketId,stake,createdAt:now});
      });
      res.status(201).json({user:users.publicUser(updated)});
    }catch(err){next(err)}
  });

  app.post('/api/me/bookmarks/:marketId',requireAuth,async(req,res,next)=>{
    try{
      const marketId=String(req.params.marketId||'').trim();
      if(!marketId)return jsonError(res,400,'Invalid market.');
      const now=new Date().toISOString(); let bookmarked=false;
      const updated=await users.updateUser(req.user.id,user=>{
        user.bookmarks=user.bookmarks||[];
        const i=user.bookmarks.indexOf(marketId);
        if(i>=0){user.bookmarks.splice(i,1);bookmarked=false}else{user.bookmarks.unshift(marketId);bookmarked=true}
        user.activity.unshift({id:crypto.randomUUID(),type:bookmarked?'bookmark-added':'bookmark-removed',marketId,createdAt:now});
      });
      res.json({bookmarked,user:users.publicUser(updated)});
    }catch(err){next(err)}
  });

  app.get('/api/markets/:marketId/comments',async(req,res,next)=>{
    try{
      const all=await users.listUsers();
      const comments=all.flatMap(u=>(u.comments||[]).filter(c=>c.marketId===req.params.marketId).map(c=>({...c,username:u.username,avatar:u.avatar})))
        .sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).slice(0,100);
      res.json({comments});
    }catch(err){next(err)}
  });

  app.post('/api/markets/:marketId/comments',requireAuth,async(req,res,next)=>{
    try{
      const marketId=String(req.params.marketId||'').trim(); const text=String(req.body?.text||'').trim();
      if(!marketId||text.length<1||text.length>500)return jsonError(res,400,'Comment must be 1–500 characters.');
      const now=new Date().toISOString(); const comment={id:crypto.randomUUID(),marketId,text,createdAt:now};
      const updated=await users.updateUser(req.user.id,user=>{
        user.comments.unshift(comment);
        user.activity.unshift({id:crypto.randomUUID(),type:'comment',marketId,createdAt:now});
      });
      res.status(201).json({comment:{...comment,username:updated.username,avatar:updated.avatar},user:users.publicUser(updated)});
    }catch(err){next(err)}
  });

  app.get('/api/scripture',async(req,res)=>{
    const ref=String(req.query.ref||'').trim();
    if(!ref)return jsonError(res,400,'Missing Scripture reference.');
    const key=process.env.YVP_APP_KEY; const bible=process.env.YVP_BIBLE_VERSION||'3034';
    const books={Genesis:'GEN',Exodus:'EXO',Joshua:'JOS',Judges:'JDG','1 Samuel':'1SA','1 Kings':'1KI',Jonah:'JON',Matthew:'MAT',Mark:'MRK',Luke:'LUK',John:'JHN',Acts:'ACT',Revelation:'REV'};
    const raw=ref.replaceAll('–','-').replaceAll('—','-'); const m=raw.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
    const usfm=m&&books[m[1]]?`${books[m[1]]}.${m[2]}.${m[3]}${m[4]?`-${m[4]}`:''}`:raw;
    if(key){try{const r=await fetch(`https://api.youversion.com/v1/bibles/${encodeURIComponent(bible)}/passages/${encodeURIComponent(usfm)}?format=text`,{headers:{'X-YVP-App-Key':key}});if(r.ok){const d=await r.json();return res.json({provider:'youversion',reference:d.reference||ref,content:d.content||d.text||'',version_title:d.bible?.title||'YouVersion Bible',copyright:d.copyright||''});}}catch{}}
    try{const r=await fetch(`https://bible-api.com/${encodeURIComponent(ref)}?translation=web`);if(r.ok){const d=await r.json();return res.json({provider:'web',reference:d.reference||ref,content:d.text||'',version_title:'World English Bible',attribution:'World English Bible — public domain'});}}catch{}
    jsonError(res,502,'Scripture provider unavailable');
  });

  app.use(express.static(rootDir,{index:false,fallthrough:true}));
  app.use((req,res,next)=>{
    if(req.method!=='GET')return next();
    if(req.path.startsWith('/api/'))return jsonError(res,404,'Not found.');
    res.sendFile(path.join(rootDir,'index.html'));
  });
  app.use((err,req,res,next)=>{
    if(err?.type==='entity.parse.failed')return jsonError(res,400,'Malformed JSON.');
    console.error(err);
    if(res.headersSent)return next(err);
    jsonError(res,500,'Something went wrong.');
  });
  return app;
}
