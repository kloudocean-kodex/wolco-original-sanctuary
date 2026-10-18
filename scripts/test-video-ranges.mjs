import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

// Test adapter for the platform-only stream. Real workerd/CDN probes supplement it.
globalThis.FixedLengthStream=class extends TransformStream {
  constructor(expected){let written=0;super({transform(chunk,c){written+=chunk.byteLength;c.enqueue(chunk);},flush(){assert.equal(written,expected);}});}
};
const filename=fileURLToPath(new URL('../functions/media/[[path]].js',import.meta.url));
const source=(await readFile(filename,'utf8')).replace('import {videoSizes} from "../../lib/video-manifest.mjs";', 'const videoSizes={"/media/wolco-project-journey-v2.mp4":10};');
const {onRequest}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const cases=[
  [{},200,'0123456789',null],
  [{Range:'bytes=0-1'},206,'01','bytes 0-1/10'],
  [{Range:'bytes=0-1'},206,'01','bytes 0-1/10',true],
  [{Range:'bytes=4-'},206,'456789','bytes 4-9/10'],
  [{Range:'bytes=-3'},206,'789','bytes 7-9/10'],
  [{Range:'bytes=-20'},206,'0123456789','bytes 0-9/10'],
  [{Range:'bytes=2-99'},206,'23456789','bytes 2-9/10'],
  [{Range:'bytes=9-9'},206,'9','bytes 9-9/10'],
  [{Range:'bytes=10-'},416,'','bytes */10'],
  [{Range:'bytes=6-2'},416,'','bytes */10'],
  [{Range:'bytes=-0'},416,'','bytes */10'],
  [{Range:'bytes=9007199254740993-'},416,'','bytes */10'],
  [{Range:'bytes=0-1','If-Range':'"old"'},200,'0123456789',null],
  [{Range:'bytes=0-1','If-Range':'"fixture"'},206,'01','bytes 0-1/10'],
  [{Range:'bytes=0-1,4-5'},200,'0123456789',null],
  [{Range:'items=0-1'},200,'0123456789',null],
];
for(const [headers,status,body,range,omitLength]of cases){
  const pending=[];
  let calls=0;
  const response=await onRequest({request:new Request('https://demo.test/media/wolco-project-journey-v2.mp4',{headers}),env:{ASSETS:{fetch:async(request)=>{
    calls++;assert.equal(request.headers.get('Range'),null);assert.equal(request.headers.get('If-Range'),null);
    const bytes=new TextEncoder().encode('0123456789');
    return new Response(new ReadableStream({start(c){for(let i=0;i<bytes.length;i+=3)c.enqueue(bytes.subarray(i,i+3));c.close();}}),{headers:{...(omitLength?{}:{'Content-Length':'10'}),ETag:'"fixture"','Content-Type':'video/mp4'}});
  }}},waitUntil(p){pending.push(p);},next(){throw new Error('Unexpected fallback');}});
  assert.equal(response.status,status,JSON.stringify(headers));
  assert.equal(await response.text(),body,JSON.stringify(headers));
  assert.equal(response.headers.get('Content-Range'),range);
  assert.equal(calls,1);
  await Promise.all(pending);
}
const head=await onRequest({request:new Request('https://demo.test/media/wolco-project-journey-v2.mp4',{method:'HEAD'}),env:{ASSETS:{fetch:async()=>new Response(null,{headers:{'Content-Length':'10'}})}}});
assert.equal(head.status,200);assert.equal(head.headers.get('Accept-Ranges'),'bytes');assert.equal(await head.text(),'');
const fallback=await onRequest({request:new Request('https://demo.test/media/photo.webp'),next:()=>new Response('static')});
assert.equal(await fallback.text(),'static');
console.log(JSON.stringify({passed:true,scenarios:cases.length+2,scope:'full GET, HEAD, byte intervals, suffixes, unsatisfiable ranges, If-Range, multipart fallback, static bypass'}));
