import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));

// GitHub OAuth Config
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "GxChat India Server is running" });
});

// Debug endpoint to check env vars (without showing secrets)
app.get("/api/github/debug", (req, res) => {
  res.json({
    hasClientId: !!GITHUB_CLIENT_ID,
    hasClientSecret: !!GITHUB_CLIENT_SECRET,
    appUrl: process.env.APP_URL || "Not Set",
    nodeEnv: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL
  });
});

// GitHub Auth URL
app.get("/api/github/auth-url", (req, res) => {
  if (!GITHUB_CLIENT_ID) {
    return res.status(500).json({ error: "GITHUB_CLIENT_ID is not set in environment variables" });
  }
  
  const appUrl = process.env.APP_URL || "https://ais-dev-nwobf3f2q5csbl7f3thoeo-382376324296.asia-southeast1.run.app";
  const redirectUri = `${appUrl}/auth/github/callback`;
  
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user`;
  res.json({ url });
});

  // GitHub Callback
  app.get(["/auth/github/callback", "/auth/github/callback/"], async (req, res) => {
    const { code } = req.query;
    
    try {
      const response = await axios.post("https://github.com/login/oauth/access_token", {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }, {
        headers: { Accept: "application/json" }
      });

      const accessToken = response.data.access_token;

      if (!accessToken) {
        throw new Error("Failed to get access token");
      }

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GITHUB_AUTH_SUCCESS', token: '${accessToken}' }, '*');
                window.close();
              } else {
                window.location.href = '/hub';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("GitHub Auth Error:", error);
      res.status(500).send("Authentication failed");
    }
  });

  // Proxy GitHub API calls to avoid CORS and keep token safe (if we were storing it server-side)
  // But here we'll just provide a helper to push files
  app.post("/api/github/push", async (req, res) => {
    const { token, owner, repo, path: filePath, content, message, branch = 'main' } = req.body;

    try {
      // 1. Get the current file (to get the SHA if it exists)
      let sha;
      try {
        const getFileRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
          headers: { Authorization: `token ${token}` }
        });
        sha = getFileRes.data.sha;
      } catch (e) {
        // File doesn't exist, that's fine
      }

      // 2. Create or update the file
      const pushRes = await axios.put(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
        message,
        content, // Base64 encoded
        sha,
        branch
      }, {
        headers: { Authorization: `token ${token}` }
      });

      res.json(pushRes.data);
    } catch (error: any) {
      console.error("GitHub Push Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
    }
  });

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
}

setupVite();

// Start server if not in Vercel
if (!process.env.VERCEL) {
  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GxChat India Server running on http://localhost:${PORT}`);
  });
}

export default app;
