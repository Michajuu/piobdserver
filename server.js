const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
  console.log('✅ New client connected');

  ws.on('message', message => {
    console.log('📩 Received:', message.toString());

    // Broadcast to all connected clients (React + Godot)
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log('❌ Client disconnected');
  });
});

console.log('🚀 WebSocket server running on ws://localhost:8080');