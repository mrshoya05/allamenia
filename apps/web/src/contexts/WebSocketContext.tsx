"use client";
import {
  createContext, useContext, useEffect, useRef,
  useState, useCallback, ReactNode
} from "react";

type Handler = (data: any) => void;

interface WsCtx {
  send: (data: object) => boolean;
  connected: boolean;
  subscribe: (key: string, fn: Handler) => void;
  unsubscribe: (key: string) => void;
  unreadMessages: number;
  setUnreadMessages: (n: number | ((prev: number) => number)) => void;
}

const Ctx = createContext<WsCtx>({
  send: () => false,
  connected: false,
  subscribe: () => {},
  unsubscribe: () => {},
  unreadMessages: 0,
  setUnreadMessages: () => {},
});

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const subs = useRef<Map<string, Handler>>(new Map());
  const timer = useRef<any>(null);
  const alive = useRef(false);

  const connect = useCallback(() => {
    if (!alive.current) return;

    const token = localStorage.getItem("allamenia_access_token");
    if (!token) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1/messages/ws"}/${token}`;
    console.log("[WS] Connecting to", wsUrl.replace(token, "***"));

    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      console.log("[WS] ✅ Connected");
      setConnected(true);
      if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    };

    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log("[WS] 📨 Received:", data.type, data);
        subs.current.forEach(fn => fn(data));
        if (data.type === "new_message") {
          setUnreadMessages(n => n + 1);
        }
      } catch (err) {
        console.error("[WS] Parse error:", err);
      }
    };

    socket.onclose = (e) => {
      console.log("[WS] ❌ Closed:", e.code, e.reason);
      setConnected(false);
      ws.current = null;
      if (alive.current) {
        timer.current = setTimeout(connect, 3000);
      }
    };

    socket.onerror = (e) => {
      console.error("[WS] Error:", e);
      socket.close();
    };
  }, []);

  useEffect(() => {
    alive.current = true;
    connect();

    // Fetch initial unread count
    const token = localStorage.getItem("allamenia_access_token");
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/messages/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.ok ? r.json() : null).then(d => d && setUnreadMessages(d.count || 0)).catch(() => {});
    }

    return () => {
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
        ws.current = null;
      }
    };
  }, [connect]);

  const send = useCallback((data: object): boolean => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
      console.log("[WS] 📤 Sent:", (data as any).type);
      return true;
    }
    console.warn("[WS] Not connected, can't send:", (data as any).type);
    return false;
  }, []);

  const subscribe = useCallback((key: string, fn: Handler) => {
    subs.current.set(key, fn);
  }, []);

  const unsubscribe = useCallback((key: string) => {
    subs.current.delete(key);
  }, []);

  return (
    <Ctx.Provider value={{ send, connected, subscribe, unsubscribe, unreadMessages, setUnreadMessages }}>
      {children}
    </Ctx.Provider>
  );
}

export const useWs = () => useContext(Ctx);
