import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './server/app.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||4173);
const production=process.env.NODE_ENV==='production'||Boolean(process.env.RENDER);
const sessionSecret=process.env.SESSION_SECRET||(production?'':'holymarket-local-dev-secret');
if(production&&!sessionSecret) throw new Error('SESSION_SECRET is required in production.');
const dataDir=process.env.DATA_DIR||path.join(root,'data');
const app=createApp({rootDir:root,dataDir,sessionSecret,production});
app.listen(port,'0.0.0.0',()=>console.log(`HolyMarket running at http://127.0.0.1:${port}`));
