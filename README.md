# CollabDocs — Real-time Collaborative Editor

A production-ready collaborative document editor built with Angular 18, Yjs (CRDT), y-websocket, and Quill.

## Architecture

```
src/app/
├── core/services/
│   └── collab.service.ts      ← Yjs + WebSocket + awareness logic
├── features/editor/
│   ├── editor.component.ts    ← Room join, Quill init, presence
│   ├── editor.component.html  ← Lobby + Editor UI
│   └── editor.component.css   ← Dark minimal theme
├── shared/models/
│   └── collab.models.ts       ← TypeScript interfaces
└── app.routes.ts              ← /editor?room=<id> routing

ws-server.js                   ← y-websocket relay server (Node.js)
```

## How CRDT collaboration works

1. Each browser tab creates a **Y.Doc** (shared document)
2. **y-websocket** syncs Y.Doc state between all clients via the WS server
3. **Y.Text** is the CRDT-backed text type — edits are conflict-free by design
4. **y-quill** binds Y.Text ↔ Quill deltas bidirectionally
5. **Awareness** broadcasts cursor positions and user presence ephemerally

## Prerequisites

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
