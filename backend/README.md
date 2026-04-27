# Collab Editor Backend

WebSocket server for real-time collaborative editing using Yjs and y-websocket.

## Setup

```bash
npm install
npm start
```

Server runs on `ws://localhost:1234` by default.

## Environment Variables

- `PORT` - Port to listen on (default: 1234)
- `HOST` - Host to bind to (default: localhost)

## Deployment

### Railway
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select the repository
4. Railway will detect `package.json` and run `npm start`
5. Set `PORT` environment variable to your desired port

### Render
1. Go to https://render.com
2. New Web Service → Connect GitHub
3. Select repository
4. Set start command: `npm start`

## Architecture

- Node.js + WebSocket server
- y-websocket for CRDT synchronization
- Each room = isolated document namespace
- Stateless (can scale horizontally)
