import express from "express";
import { createServer } from "node:http";
import path from "node:path";

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(import.meta.dirname, "public")
      : path.resolve(import.meta.dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT;
  if (!port) throw new Error("PORT must be provided by the runtime.");

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(error => {
  console.error("[Server] Startup failed", error);
  process.exitCode = 1;
});
