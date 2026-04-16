import { useEffect, useRef } from 'react';

interface UseWebSocketOptions {
  onMessage: (data: any) => void;
  onConnect?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export function useWebSocket(
  url: string,
  {
    onMessage,
    onConnect,
    onError,
    autoReconnect = true,
    reconnectInterval = 3000,
  }: UseWebSocketOptions
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        onError?.(error);
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Disconnected:', event.reason);
        
        if (autoReconnect && !event.wasClean) {
          console.log(`[WebSocket] Reconnecting in ${reconnectInterval / 1000}s...`);
          reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
        }
      };
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url, autoReconnect, reconnectInterval]);

  const sendMessage = (data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocket] Cannot send message, socket not open');
    }
  };

  return { sendMessage, socket: wsRef.current };
}
