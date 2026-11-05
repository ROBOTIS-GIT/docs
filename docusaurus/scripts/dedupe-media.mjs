import {readdir,stat,readFile,writeFile,unlink,access} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {previewUrl,previewRequest,runtime} from './pr-preview.mjs';

async function files(root,prefix='') {
 const result=[];
 for(const entry of await readdir(path.join(root,prefix),{withFileTypes:true}).catch(()=>[])) {
  const name=path.posix.join(prefix,entry.name);
  if(entry.isDirectory())result.push(...await files(root,name));
  else if(entry.isFile())result.push(name);
 }
 return result;
}
async function digest(file) {
 const hash=createHash('sha256');
 for await(const chunk of createReadStream(file))hash.update(chunk);
 return hash.digest('hex');
}
export async function dedupeMedia(root) {
 const all=await files(root);
 const duplicates=[];
 let bytes=0;
 for(const file of all) {
  if(!/^ko\/(?:img|videos|fonts|assets)\//.test(file)||/\.(?:js|css|html|map|txt)$/.test(file))continue;
  const shared=file.slice(3), original=path.join(root,shared), localized=path.join(root,file);
  const info=await stat(original).catch(()=>null), local=await stat(localized);
  if(!info?.isFile()||info.size!==local.size)continue;
  if(await digest(original)!==await digest(localized))continue;
  duplicates.push(shared);bytes+=local.size;
 }
 if(!duplicates.length)return {files:0,bytes:0};
 const shared=new Set(duplicates);
 function rewrite(text) {
  return text.replace(/\/ko\/[^\s"'`\\<>()[\]{}?#,;]+/g,value=>{
   let name;
   try{name=decodeURI(value.slice(4));}catch{return value;}
   return shared.has(name)?value.slice(3):value;
  });
 }
 for(const file of all.filter(f=>/\.(?:html|css|js)$/.test(f))) {
  const target=path.join(root,file),before=await readFile(target,'utf8');
  let after=rewrite(before);
  if(file.endsWith('.html')&&!after.includes('/shared-media-runtime.js'))after=after.replace('<head>','<head><script src="/shared-media-runtime.js"></script>');
  if(after!==before)await writeFile(target,after);
 }
 const config={prefix:'',routes:[],staticFiles:[...new Set(duplicates.flatMap(name=>[name,encodeURI(name)]))],changedStatic:[],mediaOnly:true};
 await writeFile(path.join(root,'shared-media-runtime.js'),`(function(){const previewUrl=${previewUrl.toString()};\nconst previewRequest=${previewRequest.toString()};\n(${runtime.toString()})(${JSON.stringify(config)});})();`);
 await writeFile(path.join(root,'shared-media.json'),JSON.stringify(duplicates));
 for(const shared of duplicates)await unlink(path.join(root,'ko',shared));
 console.log(`Shared media: removed ${duplicates.length} duplicate files (${(bytes/1024**2).toFixed(1)} MiB)`);
 return {files:duplicates.length,bytes};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 await access(path.resolve(process.argv[2],'index.html'));
 await dedupeMedia(path.resolve(process.argv[2]));
}
