const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const allowed=new Set(['index.html','styles.css','questions.js','core.js','app.js','topics.js']);
http.createServer((req,res)=>{let file;try{file=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html';}catch{res.writeHead(400);res.end();return;}if(!allowed.has(file)){res.writeHead(404);res.end('Not found');return;}const type=file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':'text/javascript';res.writeHead(200,{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-store'});fs.createReadStream(path.join(root,file)).pipe(res);}).listen(4173,'127.0.0.1',()=>console.log('PMP Practice Lab: http://127.0.0.1:4173'));
