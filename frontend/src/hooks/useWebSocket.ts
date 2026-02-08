import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { auth } from '../config/firebase';

export function useWebSocket() {
  const { isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !auth.currentUser) return;

    let socket: Socket;

    async function connect() {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;

        socket = io(window.location.origin, {
          auth: { token },
          transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));

        socketRef.current = socket;
      } catch {
        // Token retrieval failed
      }
    }

    connect();

    return () => {
      if (socket) socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated]);

  const subscribe = useCallback(
    (event: string, handler: (data: any) => void) => {
      socketRef.current?.on(event, handler);
      return () => {
        socketRef.current?.off(event, handler);
      };
    },
    []
  );

  return { socket: socketRef.current, connected, subscribe };
}
