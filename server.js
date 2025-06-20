
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();

app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let viewer = null;

wss.on('connection', function connection(ws, req) {
  const url = req.url;
  if (url === '/stream') {
    console.log("Mobile connected");
    ws.on('message', function incoming(message) {
      if (viewer && viewer.readyState === WebSocket.OPEN) {
        viewer.send(message);
      }
    });
  } else if (url === '/view') {
    console.log("Viewer connected");
    viewer = ws;
  }
});

const port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log('Listening on port ' + port);
});
