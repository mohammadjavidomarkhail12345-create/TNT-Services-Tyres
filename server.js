const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const PORT=process.env.PORT||3000,OWNER_PIN=process.env.OWNER_PIN||'7450',DATA=path.join(__dirname,'stock.json'),tokens=new Set();
const read=()=>JSON.parse(fs.readFileSync(DATA,'utf8')); const write=x=>fs.writeFileSync(DATA,JSON.stringify(x,null,2));
const j=(res,c,o)=>{res.writeHead(c,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(o))};
const body=req=>new Promise((ok,fail)=>{let b='';req.on('data',c=>b+=c);req.on('end',()=>{try{ok(b?JSON.parse(b):{})}catch(e){fail(e)}})});
const auth=req=>{const h=req.headers.authorization||'';return h.startsWith('Bearer ')&&tokens.has(h.slice(7))};
http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost');
if(u.pathname==='/api/stock'&&req.method==='GET')return j(res,200,read());
if(u.pathname==='/api/login'&&req.method==='POST'){const b=await body(req);if(String(b.pin)!==OWNER_PIN)return j(res,401,{ok:false,error:'Wrong PIN'});const t=crypto.randomBytes(24).toString('hex');tokens.add(t);return j(res,200,{ok:true,token:t})}
if(u.pathname.startsWith('/api/stock/')&&req.method==='PUT'){if(!auth(req))return j(res,401,{ok:false,error:'Unauthorized'});const id=Number(u.pathname.split('/').pop()),b=await body(req),s=read(),it=s.find(x=>x.id===id);if(!it)return j(res,404,{ok:false});it.qty=Math.max(0,Math.floor(Number(b.qty)||0));write(s);return j(res,200,{ok:true,item:it})}
const m={'/':'index.html','/index.html':'index.html','/manifest.webmanifest':'manifest.webmanifest','/sw.js':'sw.js'},f=m[u.pathname];if(!f){res.writeHead(404);return res.end('Not found')}const fp=path.join(__dirname,f),ct=f.endsWith('.html')?'text/html':f.endsWith('.js')?'text/javascript':'application/manifest+json';res.writeHead(200,{'Content-Type':ct});fs.createReadStream(fp).pipe(res)
}catch(e){j(res,500,{ok:false,error:'Server error'})}}).listen(PORT,()=>console.log('TNT running on '+PORT));