import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {icons}=require('lucide');
const input=readFileSync('index.html','utf8')+readFileSync('src/main.js','utf8');
const names=[...new Set([...input.matchAll(/data-lucide=["']([a-z-]+)["']/g)].map(m=>m[1]))].sort();
const selected={};
for(const name of names){const key=name.split('-').map(s=>s[0].toUpperCase()+s.slice(1)).join('');if(!icons[key])throw new Error('Unknown official Lucide icon: '+name);selected[name]=icons[key];}
const licence=readFileSync('docs/licenses/lucide-LICENSE','utf8');
const source=`/* Lucide 0.468.0. Original icon vectors. Only the ${names.length} icons used by this preview.
${licence}
*/
(()=>{'use strict';const icons=${JSON.stringify(selected)};window.lucide={createIcons(){for(const node of document.querySelectorAll('[data-lucide]')){const data=icons[node.getAttribute('data-lucide')];if(!data)continue;const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');for(const [key,value]of Object.entries(data[1]))svg.setAttribute(key,String(value));for(const attribute of node.attributes)if(attribute.name!=='data-lucide')svg.setAttribute(attribute.name,attribute.value);svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');for(const [tag,attributes]of data[2]){const child=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value]of Object.entries(attributes))child.setAttribute(key,String(value));svg.append(child);}node.replaceWith(svg);}}};})();
`;
writeFileSync('public/assets/icons.js',source);
console.log(`Prepared ${names.length} original Lucide icons in ${Buffer.byteLength(source)} bytes.`);
