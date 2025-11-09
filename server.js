const WebSocket = require('ws');
const http = require('http');
const url = require('url');

// Use Railway's dynamic port or fallback to 8080 for local development
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Create HTTP server for health checks
const server = http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname;
  
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      uptime: process.uptime(),
      connections: wss.clients.size,
      timestamp: new Date().toISOString()
    }));
  } else if (pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket Game Sync Server is running! 🚀');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Start HTTP server
server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Create WebSocket server using the HTTP server
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log('✅ New client connected');

  ws.on('message', message => {
    console.log('📩 Received:', message.toString());

    try {
      // Broadcast to all connected clients (React + Godot)
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      });
    } catch (error) {
      console.error('❌ Error broadcasting message:', error);
    }
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket client error:', error);
  });

  ws.on('close', () => {
    console.log('❌ Client disconnected');
  });
});

wss.on('error', (error) => {
  console.error('❌ WebSocket server error:', error);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully');
  server.close(() => {
    wss.close(() => {
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully');
  server.close(() => {
    wss.close(() => {
      process.exit(0);
    });
  });
});