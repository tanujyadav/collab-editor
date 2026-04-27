# CollabDocs - Real-time Collaborative Editor

A CRDT-based collaborative text editor with real-time synchronization.

## Project Structure

```
collab-editor/
├── backend/              # WebSocket server (Node.js)
│   ├── package.json
│   ├── ws-server.js
│   ├── Procfile         # Heroku/Railway deployment
│   └── README.md
├── src/                 # Angular frontend
│   ├── app/
│   ├── environments/
│   └── index.html
├── package.json         # Frontend dependencies
├── angular.json
├── tsconfig.json
└── README.md
```

## Quick Start

### Start Backend (Terminal 1)
```bash
cd backend
npm install
npm start
# Runs on ws://localhost:1234
```

### Start Frontend (Terminal 2)
```bash
npm install
npm start
# Opens on http://localhost:4200/editor
```

Share the room ID with collaborators to collaborate in real-time!

---

## Deployment Guide

### Step 1: Deploy Backend to Railway

**Option A: Create separate backend repo**
```bash
mkdir collab-editor-backend
cd collab-editor-backend
cp -r ../collab-editor/backend/* .
git init && git add . && git commit -m "Initial"
git remote add origin https://github.com/YOUR-USERNAME/collab-editor-backend.git
git push -u origin main
```

Then on Railway:
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select `collab-editor-backend`
4. Set `PORT` environment variable
5. Get your URL: `wss://collab-editor-backend-xxxx.up.railway.app`

**Option B: Use Render (simpler)**
1. Go to https://render.com
2. New Web Service → Connect GitHub → Select repo
3. Start command: `npm start` (from backend/ folder)
4. Get your deployed URL

### Step 2: Update Frontend Config

Edit [src/environments/environment.prod.ts](src/environments/environment.prod.ts):
```typescript
export const environment = {
  production: true,
  wsUrl: 'wss://your-railway-or-render-backend-url'
};
```

Push to GitHub:
```bash
git add src/environments/environment.prod.ts
git commit -m "Update backend URL"
git push origin main
```

### Step 3: Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Import this repo
3. Vercel auto-detects Angular framework
4. Deploy → Get your frontend URL

### Final Result

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `wss://your-backend-url`
- **Shareable Link**: `https://your-app.vercel.app/editor?room=abc123`

---

## Architecture

- Node.js ≥ 18
- npm ≥ 9

## Setup

```bash
# Install dependencies
npm install

# Install ws-server deps (if not already in node_modules)
npm install --save-dev ws
```

## Running

### Terminal 1 — Start WebSocket server

```bash
node ws-server.js
# ✓ y-websocket server listening on ws://localhost:1234
```

### Terminal 2 — Start Angular app

```bash
npm start
# Application running at http://localhost:4200
```

## Collaboration

1. Open `http://localhost:4200` in **two or more tabs/browsers**
2. Enter your name in the lobby
3. Use the same **Room ID** in all tabs (or copy the share link)
4. Click **Join Room** — edits sync in real-time, conflict-free

### Deep linking

Share a direct room link:
```
http://localhost:4200/editor?room=<roomId>
```
Recipients are placed directly into the correct room.

## Key dependencies

| Package        | Purpose                                      |
|----------------|----------------------------------------------|
| `yjs`          | CRDT engine — conflict-free shared state     |
| `y-websocket`  | WebSocket sync provider for Yjs              |
| `y-quill`      | Quill ↔ Y.Text binding                       |
| `quill`        | Rich text editor                             |

## Configuration

Change WebSocket server URL in `editor.component.ts`:

```typescript
const config: RoomConfig = {
  wsUrl: 'ws://localhost:1234',  // ← update for production
  ...
};
```

For production, deploy `ws-server.js` behind a reverse proxy (nginx/Caddy) with TLS (`wss://`).
