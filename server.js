
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const url = require('url');
const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

app.use(express.static('public'));

const rooms = new Map();

wss.on('connection', function connection(ws, req) {
  const params = new URLSearchParams(req.url.split('?')[1]);
  const room = params.get('room') || "unknown";

  if (!rooms.has(room)) {
    rooms.set(room, []);
  }
  rooms.get(room).push(ws);

  ws.on('message', function incoming(message) {
    const roomName = room;
    const roomNameBytes = Buffer.from(roomName, 'utf-8');
    const roomLength = Buffer.from([roomNameBytes.length]);
    const combined = Buffer.concat([roomLength, roomNameBytes, message]);

    // ส่งภาพนี้ไปให้ทุก client (รวมทุกห้อง)
    for (let [r, clients] of rooms) {
      for (let client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(combined);
        }
      }
    }
  });

  ws.on('close', () => {
    const clients = rooms.get(room) || [];
    rooms.set(room, clients.filter(client => client !== ws));
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
