import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import Quill from "quill";

import { CollabService } from "../../core/services/collab.service";
import { CollabUser, RoomConfig } from "../../shared/models/collab.models";

@Component({
  selector: "app-editor",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./editor.component.html",
  styleUrls: ["./editor.component.css"],
})
export class EditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("editorContainer") editorContainer!: ElementRef<HTMLDivElement>;

  // ── State ──────────────────────────────────────────────────────────────────
  users: CollabUser[] = [];
  connected = false;
  roomId = "";
  userName = "";
  userColor = "";
  joined = false; // Controls lobby vs editor view
  wordCount = 0;

  private quill!: Quill;
  private subs = new Subscription();

  constructor(
    public collab: CollabService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Support deep-linking: /editor?room=abc123
    const roomParam = this.route.snapshot.queryParamMap.get("room");
    if (roomParam) this.roomId = roomParam;
    else this.roomId = this.collab.generateRoomId();

    // Assign random presence color per session
    this.userColor = this.collab.randomColor();
    this.userName = `User-${Math.floor(Math.random() * 9000 + 1000)}`;
  }

  ngAfterViewInit(): void {
    // Quill is initialized after joining (ngIf toggles DOM)
  }

  /** Join the collaborative room */
  join(): void {
    if (!this.userName.trim()) return;
    this.joined = true;

    // Update URL with room ID for easy sharing
    this.router.navigate([], {
      queryParams: { room: this.roomId },
      replaceUrl: true,
    });

    // Wait for DOM to render the editor container (after *ngIf)
    setTimeout(() => this.initEditor(), 0);
  }

  private initEditor(): void {
    // Initialize Quill with Snow theme and full toolbar
    this.quill = new Quill(this.editorContainer.nativeElement, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["blockquote", "code-block"],
          ["link"],
          ["clean"],
        ],
      },
      placeholder: "Start collaborating...",
    });

    // Track word count on every text change
    this.quill.on("text-change", () => {
      const text = this.quill.getText().trim();
      this.wordCount = text ? text.split(/\s+/).length : 0;
    });

    // Build room config and initialize Yjs + WebSocket
    const config: RoomConfig = {
      roomId: this.roomId,
      wsUrl: "ws://localhost:1234", // y-websocket server (run: node ws-server.js)
      userName: this.userName,
      userColor: this.userColor,
    };

    this.collab.init(this.quill, config);

    // Subscribe to reactive streams
    this.subs.add(this.collab.users$.subscribe((u) => (this.users = u)));
    this.subs.add(
      this.collab.connected$.subscribe((c) => (this.connected = c)),
    );
  }

  /** Copy share link to clipboard */
  copyLink(): void {
    const url = `${window.location.origin}/editor?room=${this.roomId}`;
    navigator.clipboard.writeText(url);
  }

  /** Get initials for avatar display */
  getInitials(name: string): string {
    return name
      .split("-")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.collab.destroy();
  }
}
