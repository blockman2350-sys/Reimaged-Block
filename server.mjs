import http from "node:http";
import fs from "node:fs";
const html = fs.readFileSync(new URL("./public/public/public/index.html", import.meta.url));
http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://x");
  if (u.pathname === "/api/image") {
    const prompt = (u.searchParams.get("prompt") || "").slice(0, 800);
    if (!prompt) { res.writeHead(400).end("prompt required"); return; }
    const p = new URLSearchParams({
      width: u.searchParams.get("w") || "768", height: u.searchParams.get("h") || "768",
      seed: u.searchParams.get("seed") || "1", model: u.searchParams.get("model") || "flux", nologo: "true",
    });
    try {
      const r = await fetch(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${p}`, { signal: AbortSignal.timeout(90000) });
      if (!r.ok) throw new Error("upstream " + r.status);
      res.writeHead(200, { "content-type": r.headers.get("content-type") || "image/jpeg" });
      res.end(Buffer.from(await r.arrayBuffer()));
    } catch (e) { res.writeHead(502).end(String(e.message)); }
    return;
  }
  res.writeHead(200, { "content-type": "text/html" }).end(html);
}).listen(process.env.PORT || 8080, "0.0.0.0");
