/* global FixedLengthStream */
import {videoSizes} from "../../lib/video-manifest.mjs";
// Only the exact film URLs in public/_routes.json invoke this function.
const films = new Set(Object.keys(videoSizes));

/** @type {import("@cloudflare/workers-types").PagesFunction} */
export const onRequest = async (context) => {
  const request = context.request;
  const pathname = new URL(request.url).pathname;
  if (!films.has(pathname) || !["GET", "HEAD"].includes(request.method)) {
    return context.next();
  }

  // Fetch the complete static representation; never recurse through this route.
  const upstreamRequest = new Request(request);
  upstreamRequest.headers.delete("Range");
  upstreamRequest.headers.delete("If-Range");
  const source = await context.env.ASSETS.fetch(upstreamRequest);
  if (source.status !== 200) return source;
  // ASSETS can omit Content-Length internally, so use build-verified metadata.
  const size = Number(source.headers.get("Content-Length") || videoSizes[pathname]);
  if (!Number.isSafeInteger(size) || size <= 0) return source;

  const headers = new Headers(source.headers);
  headers.set("Content-Length", String(size));
  headers.set("Accept-Ranges", "bytes");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Robots-Tag", "noindex, nofollow");
  const range = request.headers.get("Range");
  const match = range?.trim().match(/^bytes=(\d*)-(\d*)$/i);
  const validator = request.headers.get("If-Range");
  const validatorMatches = !validator || validator === source.headers.get("ETag") || validator === source.headers.get("Last-Modified");
  if (request.method === "HEAD") return new Response(null, {status: 200, headers});
  if (!source.body) return new Response(null, {status: 502});
  if (!match || !validatorMatches) {
    const full = new FixedLengthStream(size);
    context.waitUntil(source.body.pipeTo(full.writable).catch(() => {}));
    return new Response(full.readable, {status: 200, headers});
  }

  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  if ((!match[1] && (!match[2] || Number(match[2]) === 0)) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || end < start) {
    await source.body?.cancel();
    headers.set("Content-Range", `bytes */${size}`);
    headers.set("Content-Length", "0");
    return new Response(null, {status: 416, headers});
  }
  const reader = source.body.getReader();
  let offset = 0;
  const slice = new ReadableStream({
    async pull(controller) {
      try {
        while (true) {
          const {done, value} = await reader.read();
          if (done) {controller.close(); return;}
          const before = offset;
          offset += value.byteLength;
          if (offset <= start) continue;
          const selected = value.subarray(Math.max(0, start - before), Math.min(value.byteLength, end + 1 - before));
          if (selected.byteLength) controller.enqueue(selected);
          if (offset > end) {
            controller.close();
            await reader.cancel();
          }
          return;
        }
      } catch (error) {
        controller.error(error);
        await reader.cancel(error).catch(() => {});
      }
    },
    cancel(reason) {return reader.cancel(reason);},
  });
  const length = end - start + 1;
  const fixed = new FixedLengthStream(length);
  context.waitUntil(slice.pipeTo(fixed.writable).catch(() => {}));
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(length));
  return new Response(fixed.readable, {status: 206, headers});
};
