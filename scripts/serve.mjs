import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
const root = path.resolve(process.argv[2] || ".");
const port = Number(process.env.PORT || 4174);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".mp4": "video/mp4",
  ".vtt": "text/vtt",
  ".svg": "image/svg+xml",
};
http
  .createServer(async (req, res) => {
    try {
      let urlPath = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      if (urlPath.endsWith("/")) urlPath += "index.html";
      let file = path.resolve(root, "." + urlPath);
      if (!file.startsWith(root + path.sep)) throw new Error("Invalid path");
      if (root === process.cwd() && urlPath.startsWith("/media/"))
        file = path.join(root, "public", urlPath);
      if (root === process.cwd() && /^\/(brand|fonts)\//.test(urlPath))
        file = path.join(root, "public", urlPath);
      const info = await stat(file);
      const type = mime[path.extname(file)] || "application/octet-stream";
      const range = req.headers.range;
      if (range && type === "video/mp4") {
        const [startText, endText] = range.replace("bytes=", "").split("-");
        const start = Number(startText);
        const end = endText
          ? Math.min(Number(endText), info.size - 1)
          : info.size - 1;
        if (start >= info.size || start > end) {
          res.writeHead(416, { "Content-Range": `bytes */${info.size}` });
          res.end();
          return;
        }
        const bytes = await readFile(file);
        res.writeHead(206, {
          "Content-Type": type,
          "Content-Length": end - start + 1,
          "Content-Range": `bytes ${start}-${end}/${info.size}`,
          "Accept-Ranges": "bytes",
        });
        res.end(bytes.subarray(start, end + 1));
        return;
      }
      res.writeHead(200, {
        "Content-Type": type,
        "Content-Length": info.size,
        "Cache-Control": "no-store",
      });
      res.end(await readFile(file));
    } catch {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        await readFile(path.join(root, "404.html"), "utf8").catch(
          () => '<h1>Page not found</h1><a href="/">Return home</a>',
        ),
      );
    }
  })
  .listen(port, "0.0.0.0", () =>
    console.log(`Local: http://localhost:${port}`),
  );
