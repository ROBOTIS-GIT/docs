import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {dedupeMedia} from './dedupe-media.mjs';

test('shares identical localized media, rewrites references and preserves translated media and bundles',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'dedupe-media-'));
 const put=async(p,s)=>{await mkdir(path.dirname(path.join(root,p)),{recursive:true});await writeFile(path.join(root,p),s);};
 await put('img/shared.png','same');await put('ko/img/shared.png','same');
 await put('img/translated.png','english');await put('ko/img/translated.png','korean');
 await put('assets/images/hash.webp','shared');await put('ko/assets/images/hash.webp','shared');
 await put('assets/js/main.js','bundle');await put('ko/assets/js/main.js','bundle');
 await put('ko/index.html','<html><head></head><body><img src="/ko/img/shared.png"><img src="/ko/img/translated.png"></body></html>');
 await put('ko/assets/css/style.css','a{background:url(/ko/assets/images/hash.webp)}');
 const result=await dedupeMedia(root);
 assert.equal(result.files,2);
 await assert.rejects(access(path.join(root,'ko/img/shared.png')));
 assert.equal(await readFile(path.join(root,'ko/img/translated.png'),'utf8'),'korean');
 await access(path.join(root,'ko/assets/js/main.js'));
 const html=await readFile(path.join(root,'ko/index.html'),'utf8');
 assert.match(html,/src="\/img\/shared.png"/);assert.match(html,/src="\/ko\/img\/translated.png"/);assert.match(html,/shared-media-runtime.js/);
 assert.match(await readFile(path.join(root,'ko/assets/css/style.css'),'utf8'),/url\(\/assets\/images\/hash.webp\)/);
 assert.equal((await dedupeMedia(root)).files,0);
});
