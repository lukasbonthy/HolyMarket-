import express from 'express';
import session from 'express-session';
import path from 'node:path';
import { UserRepository } from './user-repository.mjs';
import { verifyPassword } from './passwords.mjs';
import { recordIntegrityEvent, publicIntegrity, adminIntegrity } from './anti-cheat.mjs';
import crypto from 'node:crypto';

const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const jsonError=(res,status,error)=>res.status(status).json({error});
const regenerate=req=>new Promise((resolve,reject)=>req.session.regenerate(err=>err?reject(err):resolve()));
const saveSession=req=>new Promise((resolve,reject)=>req.session.save(err=>err?reject(err):resolve()));

export function createApp({
  rootDir=process.cwd(),
  dataDir=path.join(process.cwd(),'data'),
  sessionSecret='holymarket-dev-secret',
  production=false,
  adminKey=process.env.ADMIN_KEY||'',
  fetchImpl=globalThis.fetch
}={}){
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
  const recordForUser=async(userId,event)=>users.updateUser(userId,user=>{recordIntegrityEvent(user.integrity,event)});
  const flagInvalid=async(user,marketId,reason)=>recordForUser(user.id,{type:'invalid-prediction',marketId:marketId||null,reason});

  app.get('/api/status',(req,res)=>res.json({ok:true,provider:process.env.YVP_APP_KEY?'youversion':'web-fallback',auth:'express-session',integrity:'review-risk-v1'}));

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
      res.status(201).json({user:users.publicUser(user),integrity:publicIntegrity(user.integrity)});
    }catch(err){next(err)}
  });

  app.post('/api/auth/login',async(req,res,next)=>{
    try{
      const email=String(req.body?.email||'').trim().toLowerCase();
      const password=String(req.body?.password||'');
      const user=await users.findByEmail(email);
      if(!user||!(await verifyPassword(password,user.passwordHash)))return jsonError(res,401,'Invalid email or password.');
      await regenerate(req); req.session.userId=user.id; await saveSession(req);
      res.json({user:users.publicUser(user),integrity:publicIntegrity(user.integrity)});
    }catch(err){next(err)}
  });

  app.post('/api/auth/logout',(req,res,next)=>{
    if(!req.session){res.clearCookie('hm.sid');return res.json({ok:true});}
    req.session.destroy(err=>{if(err)return next(err);res.clearCookie('hm.sid',{httpOnly:true,sameSite:'lax',secure:production});res.json({ok:true});});
  });

  app.get('/api/auth/me',async(req,res,next)=>{
    try{
      const user=await currentUser(req);
      res.json({user:users.publicUser(user),integrity:user?publicIntegrity(user.integrity):null});
    }catch(err){next(err)}
  });
  app.get('/api/me/state',requireAuth,(req,res)=>res.json({user:users.publicUser(req.user),integrity:publicIntegrity(req.user.integrity)}));
  app.get('/api/me/integrity',requireAuth,(req,res)=>res.json({integrity:publicIntegrity(req.user.integrity)}));

  app.post('/api/integrity/market-open',requireAuth,async(req,res,next)=>{
    try{
      const marketId=String(req.body?.marketId||'').trim();
      if(!marketId||marketId.length>120)return jsonError(res,400,'Invalid market.');
      req.session.marketOpenedAt=req.session.marketOpenedAt||{};
      req.session.marketOpenedAt[marketId]=Date.now();
      await recordForUser(req.user.id,{type:'market-open',marketId});
      res.json({ok:true});
    }catch(err){next(err)}
  });

  app.post('/api/integrity/outcome-change',requireAuth,async(req,res,next)=>{
    try{
      const marketId=String(req.body?.marketId||'').trim();
      const outcomeIndex=Number(req.body?.outcomeIndex);
      if(!marketId||marketId.length>120||!Number.isInteger(outcomeIndex)||outcomeIndex<0||outcomeIndex>20)return jsonError(res,400,'Invalid outcome change.');
      const now=Date.now();
      req.session.outcomeChanges=req.session.outcomeChanges||{};
      let entry=req.session.outcomeChanges[marketId];
      if(!entry||now-Number(entry.startedAt)>60_000)entry={count:0,startedAt:now};
      entry.count+=1;
      req.session.outcomeChanges[marketId]=entry;
      if([12,24,36].includes(entry.count))await recordForUser(req.user.id,{type:'outcome-change',marketId,outcomeIndex,changeCount:entry.count});
      res.json({ok:true});
    }catch(err){next(err)}
  });

  app.post('/api/me/predictions',requireAuth,async(req,res,next)=>{
    try{
      const marketId=String(req.body?.marketId||'').trim();
      const outcomeIndex=Number(req.body?.outcomeIndex);
      const side=String(req.body?.side||'yes');
      const stake=Math.floor(Number(req.body?.stake));
      if(!marketId||!Number.isInteger(outcomeIndex)||outcomeIndex<0||outcomeIndex>10){await flagInvalid(req.user,marketId,'invalid-shape');return jsonError(res,400,'Invalid prediction.');}
      if(!Number.isFinite(stake)||stake<1){await flagInvalid(req.user,marketId,'invalid-stake');return jsonError(res,400,'Stake must be at least 1 Talent.');}
      if((req.user.predictions||[]).some(p=>p.marketId===marketId)){await flagInvalid(req.user,marketId,'duplicate');return jsonError(res,409,'Prediction already locked for this market.');}
      if(stake>req.user.talents){await flagInvalid(req.user,marketId,'insufficient-talents');return jsonError(res,400,'Not enough Talents.');}

      const nowMs=Date.now();
      const now=new Date(nowMs).toISOString();
      const openedAt=Number(req.session?.marketOpenedAt?.[marketId]);
      const latencyMs=Number.isFinite(openedAt)&&openedAt>0?Math.max(0,nowMs-openedAt):null;
      const recent=(Array.isArray(req.session.recentPredictions)?req.session.recentPredictions:[]).filter(ts=>nowMs-Number(ts)<10*60_000);
      recent.push(nowMs); req.session.recentPredictions=recent;
      if(req.session.marketOpenedAt)delete req.session.marketOpenedAt[marketId];

      const updated=await users.updateUser(req.user.id,user=>{
        user.talents-=stake;
        user.predictions.unshift({id:crypto.randomUUID(),marketId,outcomeIndex,side,stake,createdAt:now,latencyMs});
        user.activity.unshift({id:crypto.randomUUID(),type:'prediction',marketId,stake,createdAt:now});
        if(latencyMs!==null)recordIntegrityEvent(user.integrity,{type:'prediction-latency',marketId,latencyMs,at:now});
        if(recent.length>=6)recordIntegrityEvent(user.integrity,{type:'rapid-burst',marketId,countInWindow:recent.length,at:now});
      });
      res.status(201).json({user:users.publicUser(updated),integrity:publicIntegrity(updated.integrity)});
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

  app.get('/api/admin/integrity',async(req,res,next)=>{
    try{
      if(!adminKey||req.get('x-admin-key')!==adminKey)return jsonError(res,403,'Forbidden.');
      const all=await users.listUsers();
      const flagged=all.map(user=>({id:user.id,username:user.username,email:user.email,integrity:adminIntegrity(user.integrity)}))
        .filter(row=>row.integrity.score>=30)
        .sort((a,b)=>b.integrity.score-a.integrity.score);
      res.json({users:flagged});
    }catch(err){next(err)}
  });

  app.get('/api/scripture',async(req,res,next)=>{
    try{
      const ref=String(req.query.ref||'').trim();
      if(!ref)return jsonError(res,400,'Missing Scripture reference.');
      const marketId=String(req.query.marketId||'').trim();
      const user=await currentUser(req);
      if(user&&marketId&&!(user.predictions||[]).some(p=>p.marketId===marketId)){
        await recordForUser(user.id,{type:'pre-resolution-scripture',marketId,ref});
      }

      const key=process.env.YVP_APP_KEY; const bible=process.env.YVP_BIBLE_VERSION||'3034';
      const books={Genesis:'GEN',Exodus:'EXO',Joshua:'JOS',Judges:'JDG','1 Samuel':'1SA','1 Kings':'1KI',Jonah:'JON',Matthew:'MAT',Mark:'MRK',Luke:'LUK',John:'JHN',Acts:'ACT',Revelation:'REV'};
      const raw=ref.replaceAll('–','-').replaceAll('—','-'); const m=raw.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
      const usfm=m&&books[m[1]]?`${books[m[1]]}.${m[2]}.${m[3]}${m[4]?`-${m[4]}`:''}`:raw;
      if(key){
        try{
          const r=await fetchImpl(`https://api.youversion.com/v1/bibles/${encodeURIComponent(bible)}/passages/${encodeURIComponent(usfm)}?format=text`,{headers:{'X-YVP-App-Key':key}});
          if(r.ok){const d=await r.json();return res.json({provider:'youversion',reference:d.reference||ref,content:d.content||d.text||'',version_title:d.bible?.title||'YouVersion Bible',copyright:d.copyright||''});}
        }catch{}
      }
      try{
        const r=await fetchImpl(`https://bible-api.com/${encodeURIComponent(ref)}?translation=web`);
        if(r.ok){const d=await r.json();return res.json({provider:'web',reference:d.reference||ref,content:d.text||'',version_title:'World English Bible',attribution:'World English Bible — public domain'});}
      }catch{}
      jsonError(res,502,'Scripture provider unavailable');
    }catch(err){next(err)}
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
