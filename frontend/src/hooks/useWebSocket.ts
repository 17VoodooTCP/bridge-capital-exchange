'use client';
import { useEffect, useRef, useCallback, useState } from 'react';
import { WS_URL } from '@/lib/constants';

type EventHandler = (data: unknown) => void;

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectDelay?: number;
  maxReconnects?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { autoConnect = false, reconnectDelay = 3000, maxReconnects = 5 } = options;
  const socketRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, Set<EventHandler>>>(new Map());
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectCount.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const { type, data } = msg;
          const handlers = handlersRef.current.get(type);
          handlers?.forEach((h) => h(data));
        } catch {
          // ignore malformed messages
        }
      };

      ws.onerror = () => {
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        setIsConnected(false);
        socketRef.current = null;

        if (reconnectCount.current < maxReconnects) {
          reconnectCount.current++;
          reconnectTimer.current = setTimeout(connect, reconnectDelay);
        }
      };

      socketRef.current = ws;
    } catch (err) {
      setError('Failed to connect to WebSocket');
    }
  }, [reconnectDelay, maxReconnects]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    socketRef.current?.close();
    socketRef.current = null;
    setIsConnected(false);
  }, []);

  const subscribe = useCallback((event: string, handler: EventHandler) => {
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    handlersRef.current.get(event)!.add(handler);

    // Send subscription message
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'subscribe', channel: event }));
    }

    return () => {
      handlersRef.current.get(event)?.delete(handler);
    };
  }, []);

  const send = useCallback((type: string, data: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, data }));
    }
  }, []);

  useEffect(() => {
    if (autoConnect) connect();
    return () => disconnect();
  }, [autoConnect, connect, disconnect]);

  return { isConnected, error, connect, disconnect, subscribe, send };
}
