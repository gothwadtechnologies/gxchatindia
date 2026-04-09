import express from "express";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";
import os from "os";

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));

// GitHub OAuth Config
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Configure Multer for temporary storage in the OS temp directory
const upload = multer({ 
  dest: os.tmpdir(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "GxChat India Server is running" });
});

// File Upload Proxy to file.io (with Oshi.at fallback)
app.post("/api/upload-file", (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ status: 'error', message: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(500).json({ status: 'error', message: `Unknown upload error: ${err.message}` });
    }
    next();
  });
}, async (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file uploaded' });
  }

  // Try file.io first, then fallback to oshi.at
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    try {
      console.log('Attempting upload to file.io...');
      const response = await axios.post('https://file.io', form, {
        headers: form.getHeaders(),
        timeout: 30000,
      });

      if (response.data && response.data.success) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.json({ 
          status: 'ok', 
          downloadUrl: response.data.link,
          expires: response.data.expiry,
          provider: 'file.io'
        });
      }
      throw new Error('file.io success was false');
    } catch (fileIoError: any) {
      console.warn('file.io failed, trying oshi.at fallback...', fileIoError.message);
      
      // Fallback to Oshi.at (Privacy focused, one-time download support)
      const oshiForm = new FormData();
      oshiForm.append('f', fs.createReadStream(req.file.path), {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
      // 14 days in minutes = 20160
      oshiForm.append('expire', '20160');

      const oshiResponse = await axios.post('https://oshi.at', oshiForm, {
        headers: oshiForm.getHeaders(),
        timeout: 60000,
      });

      // Oshi.at returns plain text with the link if successful, or HTML on error
      const oshiData = oshiResponse.data.toString();
      if (oshiData.includes('https://oshi.at/')) {
        // Extract the link (it's usually the first URL in the text response)
        const linkMatch = oshiData.match(/https:\/\/oshi\.at\/[a-zA-Z0-9]+/);
        const downloadUrl = linkMatch ? linkMatch[0] : null;

        if (downloadUrl) {
          if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          return res.json({ 
            status: 'ok', 
            downloadUrl: downloadUrl,
            provider: 'oshi.at'
          });
        }
      }
      
      throw new Error('Both file.io and oshi.at failed');
    }
  } catch (error: any) {
    console.error('Upload proxy exception:', error.message);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ status: 'error', message: `Upload failed: ${error.message}` });
  }
});

// Debug endpoint
app.get("/api/github/debug", (req, res) => {
  res.json({
    hasClientId: !!GITHUB_CLIENT_ID,
    hasClientSecret: !!GITHUB_CLIENT_SECRET,
    appUrl: process.env.APP_URL || "Not Set",
    isVercel: !!process.env.VERCEL,
    env: process.env.NODE_ENV
  });
});

// GitHub Auth URL
app.get("/api/github/auth-url", (req, res) => {
  if (!GITHUB_CLIENT_ID) {
    return res.status(500).json({ error: "GITHUB_CLIENT_ID is not set" });
  }
  
  // Better fallback logic for APP_URL
  let appUrl = process.env.APP_URL;
  
  // If APP_URL is missing or looks like a hash instead of a URL
  if (!appUrl || !appUrl.startsWith('http')) {
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    appUrl = `${protocol}://${host}`;
  }
  
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
    if (!accessToken) throw new Error("No access token");

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
          <p>Success! Closing window...</p>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send("Auth failed");
  }
});

// GitHub Push
app.post("/api/github/push", async (req, res) => {
  const { token, owner, repo, path: filePath, content, message, branch = 'main' } = req.body;
  try {
    let sha;
    try {
      const getFileRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
        headers: { Authorization: `token ${token}` }
      });
      sha = getFileRes.data.sha;
    } catch (e) {}

    const pushRes = await axios.put(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
      message, content, sha, branch
    }, {
      headers: { Authorization: `token ${token}` }
    });
    res.json(pushRes.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
});

// Vite / Static handling
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  // Dynamic import to avoid crashing on Vercel
  import("vite").then(({ createServer }) => {
    createServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then((vite) => {
      app.use(vite.middlewares);
    });
  });
} else {
  const distPath = path.resolve(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// Start server locally
if (!process.env.VERCEL) {
  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
