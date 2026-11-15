const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawnSync, spawn } = require("child_process");

// If running locally (not on Render), run react-scripts start
if (!process.env.RENDER) {
  const child = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["react-scripts", "start"],
    { stdio: "inherit", shell: true }
  );
  child.on("exit", (code) => process.exit(code));
} else {
  const buildDir = path.join(__dirname, "build");
  const indexHtml = path.join(buildDir, "index.html");

  // Build production bundle if not already built
  if (!fs.existsSync(indexHtml)) {
    console.log("Building production bundle for Render...");
    const res = spawnSync(
      "npx",
      ["react-scripts", "build"],
      {
        stdio: "inherit",
        shell: true,
        env: { ...process.env, CI: "false", GENERATE_SOURCEMAP: "false" },
      }
    );
    if (res.status !== 0) {
      console.error("Build failed with code", res.status);
      process.exit(1);
    }
  }

  const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
  };

  const PORT = process.env.PORT || 3000;

  const server = http.createServer((req, res) => {
    const cleanUrl = (req.url || "/").split("?")[0];
    let filePath = path.join(buildDir, cleanUrl === "/" ? "index.html" : cleanUrl);

    if (!filePath.startsWith(buildDir)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = indexHtml;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end("Server Error");
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
      }
    });
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Production server running on port ${PORT}`);
  });
}
