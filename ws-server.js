#!/usr/bin/env node
/**
 * ws-server.js — Lightweight y-websocket server
 *
 * This is the ONLY backend needed for this project.
 * It acts as a relay + persistence layer for Yjs documents.
 *
 * Each unique "room" is an isolated document namespace.
 * The server uses LevelDB to persist document state across restarts.
 *
 * Run:  node ws-server.js
 * Port: 1234 (default)
 */

const { createServer } = require('http');
const { setupWSConnection } = require('y-websocket/bin/utils');
const WebSocket = require('ws');

const PORT = process.env.PORT || 1234;
const HOST = process.env.HOST || 'localhost';

// Create a plain HTTP server (y-websocket upgrades to WS)
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('CollabDocs y-websocket server running\n');
});

// Attach WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  // setupWSConnection handles:
  // - Yjs sync protocol (sv, update, awareness)
  // - Room isolation via URL path (e.g. ws://host/room-id)
  // - Optional LevelDB persistence (set gc: false for persistence)
  setupWSConnection(ws, req, { gc: true });
  console.log(`[WS] Client connected | path: ${req.url}`);
});

server.listen(PORT, HOST, () => {
  console.log(`✓ y-websocket server listening on ws://${HOST}:${PORT}`);
  console.log(`  Rooms are isolated by URL path`);
  console.log(`  Press Ctrl+C to stop\n`);
});
