import { readFile, writeFile, mkdir } from "node:fs/promises";

const files = {
  "/": { source: "outputs/teleapo-assist/index.html", type: "text/html; charset=utf-8" },
  "/index.html": { source: "outputs/teleapo-assist/index.html", type: "text/html; charset=utf-8" },
  "/manifest.webmanifest": { source: "outputs/teleapo-assist/manifest.webmanifest", type: "application/manifest+json; charset=utf-8" },
  "/sw.js": { source: "outputs/teleapo-assist/sw.js", type: "text/javascript; charset=utf-8" },
  "/icon.svg": { source: "outputs/teleapo-assist/icon.svg", type: "image/svg+xml; charset=utf-8" }
};

const entries = {};

for (const [route, file] of Object.entries(files)) {
  entries[route] = {
    body: await readFile(file.source, "utf8"),
    type: file.type
  };
}

const worker = `const FILES = ${JSON.stringify(entries, null, 2)};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.endsWith("/") && url.pathname !== "/" ? url.pathname.slice(0, -1) : url.pathname;
    const file = FILES[path] || FILES["/index.html"];
    return new Response(file.body, {
      headers: {
        "content-type": file.type,
        "cache-control": path === "/sw.js" ? "no-cache" : "public, max-age=300"
      }
    });
  }
};
`;

await mkdir("dist/server", { recursive: true });
await writeFile("dist/server/index.js", worker);
