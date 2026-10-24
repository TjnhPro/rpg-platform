// Optional finite read-only loopback host; original PNG/TPSheet bytes stay outside repository.
// Same trusted local topology as existing manual hosts; no hostile filesystem guarantee.
import { createServer } from 'node:http';
import { lstat, realpath, open, readFile, readdir } from 'node:fs/promises';
import { randomUUID, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as E from '@rpg-platform/editor';
const directory=await realpath(path.resolve(process.argv[2] ?? '../jx1-manager-editor/data/asset-sources/monster/ani063'));
const token=randomUUID(), bindingId=randomUUID(), projectId='game-a';
const allowed=new Map();
for(const name of ['Attack1_0',...Array.from({length:8},(_,i)=>`NormalStand1_${i}`)]) {
  allowed.set(`${name}.png`,{role:'image',mediaType:'image/png',limit:4_194_304});
  allowed.set(`${name}.tpsheet`,{role:'atlas-metadata',mediaType:'text/plain',limit:1_048_576});
}
const documents=new Map(), root=E.createProjectRootBinding({projectId,bindingId,readPort:null,writePort:null});
const project=E.createProject({identity:{projectId,documentId:'project'},metadata:{name:'Animation preview sample'},root,locator:{type:'project-relative',path:'project.json'}});
const manager=E.createAssetManagerProject(project,root); let manifest=E.getProjectSessionSnapshot(project).manifest;
for(const [assetId,names] of [['attack',['Attack1_0']],['idle',Array.from({length:8},(_,i)=>`NormalStand1_${i}`)]]) {
  const candidate=E.registerManagedAsset(manager,{identity:{projectId,assetId},kind:'image',metadata:{editorDisplayName:`Explicit ${assetId} sample`},sources:names.flatMap(name=>[
    {role:'image',locator:{type:'project-relative',path:`${name}.png`}},{role:'atlas-metadata',locator:{type:'project-relative',path:`${name}.tpsheet`}}])},
    {projectId,documentId:assetId},{type:'project-relative',path:`${assetId}.asset.json`});
  E.adoptAssetManagerCatalog(manager,candidate.catalog,candidate.generation);
  documents.set(candidate.reference.locator.path,JSON.stringify(candidate.document));manifest=E.trackProjectDocument(manifest,candidate.reference);
}
documents.set('project.json',JSON.stringify(E.createDocumentEnvelope({schemaVersion:1,identity:{projectId,documentId:'project'},documentKind:'project',contentSchemaVersion:1,content:manifest})));
const files=new Map();
async function inventory(dir,prefix='') {for(const entry of await readdir(dir,{withFileTypes:true})) {
  if(entry.isSymbolicLink())continue;
  if(entry.isDirectory())await inventory(path.join(dir,entry.name),`${prefix}${entry.name}/`);
  else if(entry.isFile())files.set(`/${prefix}${entry.name}`,path.join(dir,entry.name));
}}
await inventory(fileURLToPath(new URL('../ui/dist/',import.meta.url))); let origin;
createServer(async(req,res)=>{
  const json=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
  try {
    if(req.headers.host!==new URL(origin).host || req.headers.origin && req.headers.origin!==origin || req.headers['sec-fetch-site']==='cross-site')return json(403,{error:'ORIGIN_DENIED'});
    const url=new URL(req.url,origin);
    if(req.method==='GET' && url.pathname==='/__project-host/capability')return json(200,{token,roots:[{projectId,bindingId,directory},{projectId:'game-b',bindingId:'empty-b',directory:'No resources granted'}]});
    if(req.method==='POST' && ['/__project-host/io','/__asset-host/resource'].includes(url.pathname)) {
      if(req.headers['x-project-capability']!==token || !req.headers['content-type']?.startsWith('application/json'))return json(403,{error:'CAPABILITY_DENIED'});
      const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>16_384)return json(413,{error:'READ_LIMIT'});chunks.push(chunk);}
      const input=JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if(input.projectId!==projectId || input.bindingId!==bindingId)return json(403,{error:'ROOT_DENIED'});
      if(url.pathname==='/__project-host/io') {
        if(input.operation!=='read')return json(403,{error:'READ_ONLY_HOST'});
        const text=documents.get(input.locator);return json(200,text===undefined?{status:'not-found'}:{status:'read',text,observation:{identity:null,revision:createHash('sha256').update(text).digest('hex')}});
      }
      const grant=allowed.get(input.locator);
      if(!grant || grant.role!==input.role && !(input.role===undefined && grant.role==='image'))return json(200,{status:'unverified',reason:'denied'});
      const stat=await lstat(directory);if(!stat.isDirectory() || stat.isSymbolicLink() || await realpath(directory)!==directory)return json(403,{error:'ROOT_DENIED'});
      const file=path.join(directory,input.locator),entry=await lstat(file);
      if(!entry.isFile() || entry.isSymbolicLink())return json(403,{error:'PATH_DENIED'});
      const handle=await open(file,'r');let bytes;
      try {const buffer=Buffer.alloc(grant.limit+1);let length=0;while(length<buffer.length){const part=await handle.read(buffer,length,buffer.length-length,null);if(!part.bytesRead)break;length+=part.bytesRead;}if(length>grant.limit)return json(413,{error:'READ_LIMIT'});bytes=buffer.subarray(0,length);}finally{await handle.close();}
      return json(200,{status:'available',role:grant.role,mediaType:grant.mediaType,observation:{projectId,bindingId,locator:input.locator,revision:createHash('sha256').update(bytes).digest('hex'),byteLength:bytes.length},bytes:[...bytes]});
    }
    const file=files.get(url.pathname==='/'?'/index.html':url.pathname);if(req.method!=='GET'||!file)return json(404,{error:'NOT_FOUND'});
    res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html','Cache-Control':'no-store'});res.end(await readFile(file));
  }catch {if(!res.headersSent)json(500,{error:'HOST_UNAVAILABLE'});else res.end();}
}).listen(Number(process.argv[3]??8790),'127.0.0.1',()=>{origin=`http://127.0.0.1:${Number(process.argv[3]??8790)}`;console.log('ANIMATION_PREVIEW_HOST',origin,'read-only finite atlas grant',directory);});

