'use strict';
// Repeatable, dependency-free source/build/API checks. Creates no review files.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const pages=['index.html','developer/index.html','manufacturing/index.html','welcome/index.html'];
const sources=['reading-bar.js','assistant.js','both-worlds.js','mode-scenes.js','perspectives.js','script.js','welcome.js'];
const digest=file=>crypto.createHash('sha256').update(read(file)).digest('hex');
async function main(){
 cp.execFileSync(process.execPath,[path.join(__dirname,'render-pages.js')],{cwd:root,stdio:'inherit'});
 const before=pages.map(digest);
 cp.execFileSync(process.execPath,[path.join(__dirname,'render-pages.js')],{cwd:root,stdio:'pipe'});
 assert.deepEqual(pages.map(digest),before,'Build must be deterministic');
 const references=new Set();
 for(const file of [...pages,...sources,...fs.readdirSync(root).filter(f=>f.endsWith('.css'))]){
  for(const match of read(file).matchAll(/(?:src|href|data-preview-image)="(\/[^"?#\s]+)|url\(['"]?(\/[^)'"\s]+)/g)){
   const url=match[1]||match[2];if(url==='/')continue;
   const relative=url.endsWith('/')?url+'index.html':url;
   assert.ok(fs.existsSync(path.join(root,relative)),`${file}: missing ${url}`);references.add(url);
  }
 }
 for(const name of ['page-swipe','paper-snap'])assert.ok(fs.existsSync(path.join(root,'assets/both-worlds',name+'.wav')));
 for(const asset of require('./modes-assets.json'))assert.ok(fs.existsSync(path.join(root,asset.file)),asset.file);
 for(const file of [...sources,...fs.readdirSync(__dirname).filter(f=>/\.(?:js|cjs)$/.test(f)).map(f=>'scripts/'+f),'api/portfolio-assistant.js','api/portfolio-context.js'])cp.execFileSync(process.execPath,['--check',path.join(root,file)],{stdio:'pipe'});
 const handler=require('../api/portfolio-assistant');let providerCalls=0;
 const previous=global.fetch,keys=['LLM_BASE_URL','LLM_API_KEY','LLM_MODEL'],env=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 global.fetch=async()=>{providerCalls++;throw Error('No live provider request allowed in this check');};
 const request=async(method,body={})=>{let code=200,data;await handler({method,body},{setHeader(){},status(n){code=n;return this;},json(value){data=value;}});return{code,data};};
 try{
  keys.forEach(k=>delete process.env[k]);assert.deepEqual((await request('GET')).data,{success:true,available:false});
  assert.equal((await request('POST',{message:'Ceritakan Dion'})).code,503);
  assert.equal((await request('POST',{message:''})).code,400);
  assert.equal((await request('POST',{message:'Dion',history:[{role:'system',content:'invalid'}]})).code,400);
  assert.equal((await request('PUT')).code,405);assert.equal(providerCalls,0);
  // Valid conversation turns must reach the backend, including client inquiries
  // with no portfolio keywords. Scope is interpreted by the model with history.
  assert.equal((await request('POST',{message:'Halo Yon!'})).code,503);
  assert.equal((await request('POST',{message:'Siapa kamu?'})).code,503);
  assert.equal((await request('POST',{message:'Berapa lama?',history:[{role:'user',content:'Pengalaman Dion di Denso'}]})).code,503);
  assert.equal((await request('POST',{message:'Berapa lama?'})).code,503);
  for(const message of [
   'gua mau bkin sistem order realtime, bisa ga dia kira"?',
   'gua mau bkin sistem order realtime, bisa ga dia kira"? gua mau joki ke dia?',
   'berapa duit?',
   'bisa kelar kapan?',
   'Can I hire him to make a live ordering system?',
  ])assert.equal((await request('POST',{message})).code,503,`Client inquiry must not be keyword-blocked: ${message}`);
  assert.equal(providerCalls,0);
 }finally{global.fetch=previous;for(const key of keys)if(env[key]===undefined)delete process.env[key];else process.env[key]=env[key];}
 console.log(`PASS: four deterministic pages, ${references.size} local references, dynamic audio, asset metadata, JavaScript syntax and fourteen API contracts. No provider request sent.`);
 await require('./check-pages.cjs')();
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
