// Represents a connected user in the document room
export interface CollabUser {
  clientId: number;       // Yjs awareness clientID (unique per connection)
  name: string;           // Display name
  color: string;          // Cursor/presence color
  cursor?: CursorPosition;
}

// Cursor position within Quill
export interface CursorPosition {
  index: number;
  length: number;
}

// Document room connection config
export interface RoomConfig {
  roomId: string;         // Unique room identifier (e.g. "doc-abc123")
  wsUrl: string;          // WebSocket server URL
  userName: string;       // Current user's display name
  userColor: string;      // Current user's presence color
}
