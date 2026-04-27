# Collab Editor - Real-time Collaborative Editing

## Setup & Development

```bash
# Install dependencies
npm install

# Start development server (frontend)
npm start

# In another terminal, start WebSocket server
npm run start:ws
```

Visit `http://localhost:4200/editor` and share the room ID with collaborators.

## Deployment

### Frontend (Vercel)
1. Go to https://vercel.com
2. Import this repository
3. Deploy - it will auto-detect Angular and build

### Backend (Railway)
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select this repo
4. Add `PORT` environment variable (default 1234)
5. Railway will run `npm run start:ws` automatically

### Update WebSocket URL
After deploying backend to Railway, update the WebSocket URL in:
- `src/environments/environment.prod.ts` - change `wsUrl` to your Railway backend URL

## Architecture

- **Frontend**: Angular 18 + Quill editor + Yjs CRDT
- **Backend**: Node.js WebSocket server with y-websocket
- **Real-time Sync**: CRDT-based conflict-free editing
