import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import admin from "./admin.ts";

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "GxChat India Server is running" });
  });

  app.post("/api/send-notification", async (req, res) => {
    const { tokens, title, body, data } = req.body;

    if (!tokens || tokens.length === 0) {
      return res.status(400).json({ error: "No tokens provided" });
    }

    try {
      const message = {
        notification: { title, body },
        data: data || {},
        tokens: tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      res.json({ success: true, response });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GxChat India Server running on http://localhost:${PORT}`);
  });
}

startServer();
