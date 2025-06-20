const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

app.use(express.static('public'));

let viewers = [];

wss.on('connection', function connection(ws, req) {
  console.log("🟢 WebSocket connected");

  ws.on('message', function incoming(message) {
    for (let client of viewers) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });

  viewers.push(ws);

  ws.on('close', () => {
    viewers = viewers.filter(client => client !== ws);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
