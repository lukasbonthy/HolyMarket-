import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url'; import https from 'node:https';
const root=path.dirname(fileURLToPath(import.meta.url)); const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
const BOOK={Genesis:'GEN',Exodus:'EXO',Leviticus:'LEV',Numbers:'NUM',Deuteronomy:'DEU',Joshua:'JOS',Judges:'JDG',Ruth:'RUT','1 Samuel':'1SA','2 Samuel':'2SA','1 Kings':'1KI','2 Kings':'2KI',Ezra:'EZR',Nehemiah:'NEH',Esther:'EST',Job:'JOB',Psalms:'PSA',Psalm:'PSA',Proverbs:'PRO',Ecclesiastes:'ECC',Isaiah:'ISA',Jeremiah:'JER',Ezekiel:'EZK',Daniel:'DAN',Jonah:'JON',Matthew:'MAT',Mark:'MRK',Luke:'LUK',John:'JHN',Acts:'ACT',Romans:'ROM','1 Corinthians':'1CO','2 Corinthians':'2CO',Galatians:'GAL',Ephesians:'EPH',Philippians:'PHP',Colossians:'COL',Hebrews:'HEB',James:'JAS','1 Peter':'1PE','2 Peter':'2PE','1 John':'1JN',Revelation:'REV'};
function toUsfm(ref){const raw=String(ref||'').replaceAll('–','-').replaceAll('—','-').trim();const m=raw.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);if(!m||!BOOK[m[1]])return raw;return `${BOOK[m[1]]}.${m[2]}.${m[3]}${m[4]?`-${m[4]}`:''}`;}
function json(res,status,obj){res.writeHead(status,{'content-type':'application/json; charset=utf-8'});res.end(JSON.stringify(obj));}
function fetchJson(url,headers={}){return new Promise((resolve,reject)=>{https.get(url,{headers},r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{resolve({ok:r.statusCode>=200&&r.statusCode<300,status:r.statusCode,data:JSON.parse(b)})}catch(e){reject(e)}})}).on('error',reject)});}
const server=http.createServer(async(req,res)=>{
 const u=new URL(req.url,`http://${req.headers.host}`);
 if(u.pathname==='/api/status') return json(res,200,{ok:true,provider:process.env.YVP_APP_KEY?'youversion':'web-fallback'});
 if(u.pathname==='/api/scripture'){
   const ref=u.searchParams.get('ref')||''; const usfm=toUsfm(ref); const key=process.env.YVP_APP_KEY; const bible=process.env.YVP_BIBLE_VERSION||'3034';
   if(key){try{const r=await fetchJson(`https://api.youversion.com/v1/bibles/${encodeURIComponent(bible)}/passages/${encodeURIComponent(usfm)}?format=text`,{'X-YVP-App-Key':key});if(r.ok){const d=r.data;return json(res,200,{provider:'youversion',reference:d.reference||ref,content:d.content||d.text||'',version_title:d.bible?.title||'YouVersion Bible',copyright:d.copyright||''});}}catch{}}
   try{const r=await fetchJson(`https://bible-api.com/${encodeURIComponent(ref)}?translation=web`);if(r.ok)return json(res,200,{provider:'web',reference:r.data.reference||ref,content:r.data.text||'',version_title:'World English Bible',attribution:'World English Bible — public domain'});}catch{}
   return json(res,502,{error:'Scripture provider unavailable'});
 }
 let p=u.pathname==='/'?'/index.html':u.pathname; p=path.normalize(p).replace(/^\.\.(\/|\\)/,''); const file=path.join(root,p);
 if(!file.startsWith(root))return json(res,403,{error:'forbidden'});
 fs.readFile(file,(err,data)=>{if(err){fs.readFile(path.join(root,'index.html'),(e,d)=>{if(e){res.writeHead(404);res.end('Not found')}else{res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(d)}});return;}res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'});res.end(data)});
});
server.listen(port,'0.0.0.0',()=>console.log(`BibleBet running at http://127.0.0.1:${port}`));
