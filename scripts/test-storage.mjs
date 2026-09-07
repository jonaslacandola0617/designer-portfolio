import { createServer } from "node:http";
import { pathToFileURL } from "node:url";

export function startTestStorage(port = 55433) {
  const objects = new Map();
  const server = createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    if (req.method === "OPTIONS") {
      res.writeHead(204).end();
      return;
    }
    const path = new URL(req.url, "http://localhost").pathname;
    if (!path.startsWith("/portfolio/")) {
      res.writeHead(404).end();
      return;
    }
    if (req.method === "PUT") {
      let size = 0;
      const chunks = [];
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 20 * 1024 * 1024) {
          res.writeHead(413).end();
          return;
        }
        chunks.push(chunk);
      }
      objects.set(path, {
        body: Buffer.concat(chunks),
        type: req.headers["content-type"],
      });
      res.writeHead(200, { ETag: '"test-etag"' }).end();
      return;
    }
    if (req.method === "DELETE") {
      objects.delete(path);
      res.writeHead(204).end();
      return;
    }
    const object = objects.get(path);
    if (!object) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, {
      "Content-Type": object.type,
      "Content-Length": object.body.length,
    });
    res.end(object.body);
  });
  server.listen(port, "127.0.0.1");
  return server;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  startTestStorage();
  console.log("Loopback S3 test double listening on port 55433.");
}
