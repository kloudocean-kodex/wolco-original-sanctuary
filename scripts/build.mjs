import { cp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
const target = path.join(root, "dist");
if (path.relative(root, target) !== "dist")
  throw new Error("Build output must remain in this project dist directory");
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(path.join(root, "public"), target, { recursive: true });
await cp(path.join(root, "src"), path.join(target, "assets"), {
  recursive: true,
  filter: (source) => path.basename(source) !== "tailwind.css",
});
const html = await readFile(path.join(root, "index.html"), "utf8");
await writeFile(
  path.join(target, "index.html"),
  html.replaceAll("/src/", "/assets/"),
);
await writeFile(
  path.join(target, "404.html"),
  await readFile(path.join(root, "404.html"), "utf8"),
);
console.log("Built dependency-free static site in dist/");
