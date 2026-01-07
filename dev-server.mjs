import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3487;

// CORS headers for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Parse JSON bodies for API routes
app.use(express.json({ limit: '10mb' }));

// Set correct MIME types for assets
app.use((req, res, next) => {
    if (req.path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
    } else if (req.path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
    } else if (req.path.endsWith('.wasm')) {
        res.setHeader('Content-Type', 'application/wasm');
    }
    next();
});

// Stub user thumbnails locally to avoid external calls
const PLACEHOLDER_THUMB = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wIAAgMBAp6nzgAAAABJRU5ErkJggg==', 'base64');
app.get('/api/users/:id/thumbnail', (req, res) => {
    res.setHeader('Content-Type', 'image/png');
    res.send(PLACEHOLDER_THUMB);
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'static')));

// Helpers for Local Project Storage
const PROJECT_DIR = path.join(__dirname, 'project');
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, data) => fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');

// Minimal Local Project Storage API
// GET local project settings
app.get('/local-api/projects/:projectId', (req, res, next) => {
    try {
        const projectJson = path.join(PROJECT_DIR, 'project.json');
        if (!fs.existsSync(projectJson)) return res.status(404).json({ message: 'project.json not found' });
        const json = readJson(projectJson);
        // If IDs mismatch, still return; client decides usage
        res.json(json);
    } catch (e) {
        next(e);
    }
});

// PUT update local project settings
app.put('/local-api/projects/:projectId', (req, res, next) => {
    try {
        const projectJson = path.join(PROJECT_DIR, 'project.json');
        if (!fs.existsSync(projectJson)) return res.status(404).json({ message: 'project.json not found' });
        const existing = readJson(projectJson);
        const updated = Object.assign({}, existing, req.body || {});
        writeJson(projectJson, updated);
        res.json(updated);
    } catch (e) {
        next(e);
    }
});

// GET scenes list for project (minimal)
app.get('/local-api/projects/:projectId/scenes', (req, res, next) => {
    try {
        const scenesJson = path.join(PROJECT_DIR, 'scenes.json');
        if (!fs.existsSync(scenesJson)) return res.json({ result: [] });
        const json = readJson(scenesJson);
        // Expecting an array or object with result
        const result = Array.isArray(json) ? json : (json.result || []);
        res.json({ result });
    } catch (e) {
        next(e);
    }
});

// GET single scene (very minimal stub if not available)
app.get('/local-api/scenes/:sceneId', (req, res, next) => {
    try {
        const sceneId = req.params.sceneId;
        const scenesJson = path.join(PROJECT_DIR, 'scenes.json');
        let result = null;
        if (fs.existsSync(scenesJson)) {
            const list = readJson(scenesJson);
            const arr = Array.isArray(list) ? list : (list.result || []);
            result = arr.find(s => `${s.id}` === `${sceneId}`) || null;
        }
        res.json(result || { id: Number(sceneId), name: 'Local Scene', entities: [], settings: {} });
    } catch (e) {
        next(e);
    }
});

// API proxy (optional - for connecting to PlayCanvas backend services)
// You can extend this to proxy requests to the PlayCanvas API
const API_BASE = process.env.API_URL || 'https://api.playcanvas.com';

app.all('/api/*', (req, res) => {
    // Forward API requests to the configured API server
    // This allows you to use a local backend if needed
    const targetUrl = new URL(req.originalUrl.replace(/^\/api/, ''), API_BASE);
    
    fetch(targetUrl, {
        method: req.method,
        headers: req.headers,
        body: req.method !== 'GET' ? req.rawBody : undefined
    })
    .then(response => {
        res.status(response.status);
        Object.entries(response.headers.raw()).forEach(([key, value]) => {
            res.setHeader(key, value);
        });
        return response.text();
    })
    .then(body => {
        res.send(body);
    })
    .catch(err => {
        res.status(500).json({ error: err.message });
    });
});

// Convenience redirect: open a scene on playcanvas.com using local frontend
app.get(['/open/:sceneId', '/open'], (req, res) => {
    const sceneId = req.params.sceneId || req.query.scene || req.query.sceneId;
    if (!sceneId) {
        return res.status(400).send('Missing scene id. Use /open/:sceneId or /open?scene=ID');
    }
    const target = `https://playcanvas.com/editor/scene/${encodeURIComponent(sceneId)}?use_local_frontend`;
    res.redirect(302, target);
});

// Serve index.html for all routes (SPA routing) - MUST BE LAST
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║          PlayCanvas Editor - Local Development Server         ║
║                                                                ║
║  Server running at: http://localhost:${PORT}                  ║
║                                                                ║
║  To connect to a scene:                                       ║
║    http://localhost:${PORT}?scene=<YOUR_SCENE_ID>              ║
║                                                                ║
║  Configuration:                                               ║
║    API URL: ${process.env.API_URL || 'https://api.playcanvas.com'}
║    Port: ${PORT}                                                 ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
