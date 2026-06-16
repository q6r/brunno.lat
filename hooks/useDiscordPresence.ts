"use client";

import { useEffect, useState } from "react";
import { DISCORD_USER_ID, DISCORD_WS_URL } from "@/lib/constants";
import { parsePresenceFrame } from "@/lib/discord-presence";
import type {
  ConnectionState,
  DiscordPresence,
  PresenceStatus,
  UseDiscordPresenceResult,
} from "@/types/discord";

/**
 * Subscribes to the cee.bio presence WebSocket and exposes a normalized,
 * live presence object. Handles automatic reconnection (exponential backoff
 * with jitter), an optional heartbeat, and full cleanup on unmount.
 */
export function useDiscordPresence(
  userId: string = DISCORD_USER_ID
): UseDiscordPresenceResult {
  const [presence, setPresence] = useState<DiscordPresence | null>(null);
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<unknown>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let heartbeat: ReturnType<typeof setInterval> | null = null;
    let closedByUs = false;
    let attempts = 0;

    const clearHeartbeat = () => {
      if (heartbeat) {
        clearInterval(heartbeat);
        heartbeat = null;
      }
    };

    const scheduleReconnect = () => {
      attempts += 1;
      const base = Math.min(30000, 1000 * 2 ** attempts);
      const jitter = Math.random() * 0.3 * base;
      reconnectTimer = setTimeout(connect, base + jitter);
    };

    const connect = () => {
      setConnection(attempts === 0 ? "connecting" : "reconnecting");
      try {
        ws = new WebSocket(DISCORD_WS_URL);
      } catch {
        setError("Unable to open WebSocket");
        scheduleReconnect();
        return;
      }

      ws.onopen = () => {
        attempts = 0;
        setConnection("open");
        setError(null);
        try {
          ws?.send(JSON.stringify({ op: "subscribe", userId }));
        } catch {
          /* noop */
        }
        clearHeartbeat();
        heartbeat = setInterval(() => {
          try {
            ws?.send(JSON.stringify({ op: "ping" }));
          } catch {
            /* noop */
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        let data: unknown;
        try {
          data = JSON.parse(typeof event.data === "string" ? event.data : "");
        } catch {
          return;
        }
        setRaw(data);
        if (process.env.NODE_ENV !== "production") {
          // Helps verify the live activity frame shape (user was offline at build time).
          console.debug("[discord-presence] frame", data);
        }
        const parsed = parsePresenceFrame(data, userId);
        if (parsed) {
          setPresence(parsed);
          setLastUpdate(Date.now());
        }
      };

      ws.onerror = () => {
        setError("WebSocket connection error");
      };

      ws.onclose = () => {
        clearHeartbeat();
        if (closedByUs) return;
        setConnection("reconnecting");
        scheduleReconnect();
      };
    };

    connect();

    return () => {
      closedByUs = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearHeartbeat();
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        try {
          ws.close();
        } catch {
          /* noop */
        }
      }
    };
  }, [userId]);

  const status: PresenceStatus = presence?.status ?? "offline";
  return { presence, status, connection, lastUpdate, error, raw };
}
