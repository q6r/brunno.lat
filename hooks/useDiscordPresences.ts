"use client";

import { useEffect, useState } from "react";
import { DISCORD_WS_URL } from "@/lib/constants";
import { parsePresenceFrameAny } from "@/lib/discord-presence";
import type { PresenceStatus } from "@/types/discord";

/**
 * Tracks the live status of many Discord users over a single WebSocket
 * connection (multi-subscribe). Returns a map of userId → status.
 */
export function useDiscordPresences(
  ids: string[]
): Record<string, PresenceStatus> {
  const [statuses, setStatuses] = useState<Record<string, PresenceStatus>>({});
  const idsKey = ids.join(",");

  useEffect(() => {
    const list = idsKey ? idsKey.split(",") : [];
    if (!list.length) return;

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let closedByUs = false;
    let attempts = 0;

    const connect = () => {
      try {
        ws = new WebSocket(DISCORD_WS_URL);
      } catch {
        scheduleReconnect();
        return;
      }

      ws.onopen = () => {
        attempts = 0;
        for (const id of list) {
          try {
            ws?.send(JSON.stringify({ op: "subscribe", userId: id }));
          } catch {
            /* noop */
          }
        }
      };

      ws.onmessage = (event) => {
        let data: unknown;
        try {
          data = JSON.parse(typeof event.data === "string" ? event.data : "");
        } catch {
          return;
        }
        const frame = parsePresenceFrameAny(data);
        if (frame) {
          setStatuses((prev) =>
            prev[frame.userId] === frame.status
              ? prev
              : { ...prev, [frame.userId]: frame.status }
          );
        }
      };

      ws.onclose = () => {
        if (!closedByUs) scheduleReconnect();
      };
      ws.onerror = () => {
        /* handled via onclose */
      };
    };

    const scheduleReconnect = () => {
      attempts += 1;
      const base = Math.min(30000, 1000 * 2 ** attempts);
      reconnectTimer = setTimeout(connect, base + Math.random() * 0.3 * base);
    };

    connect();

    return () => {
      closedByUs = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        try {
          ws.close();
        } catch {
          /* noop */
        }
      }
    };
  }, [idsKey]);

  return statuses;
}
