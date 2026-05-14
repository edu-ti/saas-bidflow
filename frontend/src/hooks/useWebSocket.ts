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
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  useEffect(() => {
    // Se não houver URL válida, não tenta conectar
    if (!url || url === 'ws://localhost:8080' || url === 'wss://localhost:8080') {
      console.log('[WebSocket] No valid URL provided, skipping connection');
      return;
    }

    const connect = () => {
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.log('[WebSocket] Max reconnect attempts reached, giving up');
        return;
      }

      reconnectAttempts.current++;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      // Timeout de conexão: 5 segundos
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.log('[WebSocket] Connection timeout');
          ws.close();
        }
      }, 5000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        reconnectAttempts.current = 0;
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
        clearTimeout(connectionTimeout);
        console.error('[WebSocket] Error:', error);
        onError?.(error);
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log('[WebSocket] Disconnected:', event.reason);
        
        if (autoReconnect && !event.wasClean && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = reconnectInterval * Math.pow(2, reconnectAttempts.current - 1); // Backoff exponencial
          console.log(`[WebSocket] Reconnecting in ${delay / 1000}s... (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
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
