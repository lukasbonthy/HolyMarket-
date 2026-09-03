import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const index=fs.readFileSync('index.html','utf8');

test('v9 compiles a production Tailwind premium layer',()=>{
  assert.ok(pkg.devDependencies?.tailwindcss,'tailwindcss dependency missing');
  assert.ok(pkg.devDependencies?.['@tailwindcss/cli'],'Tailwind CLI dependency missing');
  assert.match(pkg.scripts?.['css:build']||'',/@tailwindcss\/cli/);
  assert.match(pkg.scripts?.build||'',/css:build/);
  assert.match(index,/tailwind-v9\.generated\.css/);
  assert.ok(fs.existsSync('src/tailwind-v9.css'),'Tailwind input CSS missing');
});

test('Tailwind layer keeps Preflight disabled and scans V9 sources explicitly',()=>{
  const css=fs.readFileSync('src/tailwind-v9.css','utf8');
  assert.match(css,/tailwindcss\/theme\.css/);
  assert.match(css,/tailwindcss\/utilities\.css/);
  assert.doesNotMatch(css,/preflight\.css/);
  assert.match(css,/@source\s+"\.\/app-v9\.js"/);
  assert.match(css,/@source\s+"\.\/desktop-controls-v9\.js"/);
});
