import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { QuillBinding } from 'y-quill';
import type Quill from 'quill';
import { CollabUser, RoomConfig } from '../../shared/models/collab.models';

// Predefined colors for user presence indicators
const USER_COLORS = [
  '#E63946', '#2A9D8F', '#E9C46A', '#F4A261',
  '#457B9D', '#A8DADC', '#6D6875', '#B5838D'
];

@Injectable({ providedIn: 'root' })
export class CollabService implements OnDestroy {

  // ── Public observables ──────────────────────────────────────────────────────
  /** List of currently connected users (from Yjs awareness) */
  readonly users$ = new BehaviorSubject<CollabUser[]>([]);

  /** Connection status */
  readonly connected$ = new BehaviorSubject<boolean>(false);

  // ── Internal state ──────────────────────────────────────────────────────────
  private ydoc: Y.Doc | null = null;
  private provider: WebsocketProvider | null = null;
  private binding: QuillBinding | null = null;

  /**
   * Initialize Yjs document, WebSocket provider, and bind to Quill.
   * Call this once the Quill instance is ready.
   */
  init(quill: Quill, config: RoomConfig): void {
    this.destroy(); // Clean up any previous session

    // 1. Create the shared Yjs document
    this.ydoc = new Y.Doc();

    // 2. Get the shared text type — this is the CRDT-backed document content
    //    All clients sharing the same roomId will sync this Y.Text automatically
    const ytext = this.ydoc.getText('quill-content');

    // 3. Connect to y-websocket server with room isolation
    //    Each roomId = separate document namespace on the WS server
    this.provider = new WebsocketProvider(config.wsUrl, config.roomId, this.ydoc);

    // 4. Set local user's awareness state (presence info broadcast to peers)
    this.provider.awareness.setLocalStateField('user', {
      name: config.userName,
      color: config.userColor,
    });

    // 5. Bind Yjs text ↔ Quill editor
    //    y-quill handles all delta conversion and conflict resolution automatically
    this.binding = new QuillBinding(ytext, quill, this.provider.awareness);

    // 6. Track connection status
    this.provider.on('status', ({ status }: { status: string }) => {
      this.connected$.next(status === 'connected');
    });

    // 7. Listen to awareness changes to update user list
    this.provider.awareness.on('change', () => this.updateUsers());
    this.updateUsers();
  }

  /**
   * Generate a random user color from the predefined palette.
   */
  randomColor(): string {
    return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
  }

  /**
   * Generate a random room ID (8-char alphanumeric).
   * Users sharing the same roomId collaborate on the same document.
   */
  generateRoomId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  /**
   * Read all awareness states and emit updated user list.
   * Awareness is Yjs's ephemeral state layer for presence data.
   */
  private updateUsers(): void {
    if (!this.provider) return;

    const states = this.provider.awareness.getStates();
    const users: CollabUser[] = [];

    states.forEach((state, clientId) => {
      if (state['user']) {
        users.push({
          clientId,
          name: state['user'].name,
          color: state['user'].color,
          cursor: state['cursor'],
        });
      }
    });

    this.users$.next(users);
  }

  /** Clean up all Yjs / WebSocket resources */
  destroy(): void {
    this.binding?.destroy();
    this.provider?.destroy();
    this.ydoc?.destroy();
    this.binding = null;
    this.provider = null;
    this.ydoc = null;
    this.connected$.next(false);
    this.users$.next([]);
  }

  ngOnDestroy(): void {
    this.destroy();
  }
}
