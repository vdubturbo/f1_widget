import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { tracker } from './tracker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket connection handling
wss.on('connection', (ws: WebSocket, req) => {
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`[WS] New connection from ${clientIP}`);

  tracker.add(ws);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Welcome to F1 Dashboard',
    timestamp: new Date().toISOString()
  }));

  // Handle incoming messages (for future use)
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      if (message.type === 'ping') {
        tracker.updatePing(ws);
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      }
    } catch (e) {
      // Ignore invalid messages
    }
  });

  // Handle pong responses (from our pings)
  ws.on('pong', () => {
    tracker.updatePing(ws);
  });

  // Handle disconnection
  ws.on('close', () => {
    console.log(`[WS] Connection closed from ${clientIP}`);
    tracker.remove(ws);
  });

  ws.on('error', (error) => {
    console.error(`[WS] Error:`, error);
    tracker.remove(ws);
  });

  // Keep-alive ping every 30 seconds
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    } else {
      clearInterval(pingInterval);
    }
  }, 30000);
});

// ============================================
// API Routes
// ============================================

// Stats endpoint (for Cyberdyne dashboard)
app.get('/api/stats', (req, res) => {
  res.json(tracker.getStats());
});

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// Config Endpoints
// ============================================

const configPath = path.join(__dirname, '../config/dashboard.json');

// Always available - serve config to clients
app.get('/api/config', (req, res) => {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    res.json(config);
  } catch (error) {
    console.error('[Config] Error reading config:', error);
    res.status(500).json({ error: 'Failed to load config' });
  }
});

// DEV only - admin can modify config
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/admin/config', (req, res) => {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      res.json(config);
    } catch (error) {
      console.error('[Admin] Error reading config:', error);
      res.status(500).json({ error: 'Failed to load config' });
    }
  });

  app.post('/api/admin/config', (req, res) => {
    try {
      fs.writeFileSync(configPath, JSON.stringify(req.body, null, 2));
      console.log('[Admin] Config updated');
      res.json({ success: true });
    } catch (error) {
      console.error('[Admin] Error writing config:', error);
      res.status(500).json({ error: 'Failed to save config' });
    }
  });
}

// ============================================
// Serve React App
// ============================================

const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// ============================================
// Start Server
// ============================================

server.listen(PORT, () => {
  console.log(`🏎️  F1 Dashboard server running on port ${PORT}`);
  console.log(`   - WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`   - Stats API: http://localhost:${PORT}/api/stats`);
  console.log(`   - Health:    http://localhost:${PORT}/api/health`);
  console.log(`   - Config:    http://localhost:${PORT}/api/config`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`   - Admin:     http://localhost:${PORT}/api/admin/config (DEV only)`);
  }
});
