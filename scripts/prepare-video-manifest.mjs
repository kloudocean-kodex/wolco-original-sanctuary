import {readdir,stat,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const directory=path.join(root,'public/media');
const sizes={};
for(const name of (await readdir(directory)).sort()){
  if(!name.endsWith('.mp4'))continue;
  const file=await stat(path.join(directory,name));
  if(!file.isFile()||file.size<=0||file.size>=25*1024*1024)throw new Error('Film must be nonempty and below 25MiB: '+name);
  sizes['/media/'+name]=file.size;
}
if(!Object.keys(sizes).length)throw new Error('No architectural film found');
await mkdir(path.join(root,'lib'),{recursive:true});
await writeFile(path.join(root,'lib/video-manifest.mjs'),'// Generated from public/media by npm run build. No runtime filesystem access.\n/** @type {Readonly<Record<string, number>>} */\nexport const videoSizes = Object.freeze('+JSON.stringify(sizes,null,2)+');\n');
await writeFile(path.join(root,'public/_routes.json'),JSON.stringify({version:1,include:Object.keys(sizes),exclude:[]},null,2)+'\n');
console.log('Prepared exact video sizes and scoped Functions routes.');
