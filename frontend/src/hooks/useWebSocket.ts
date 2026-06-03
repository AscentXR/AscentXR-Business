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

    // socket.io's `auth` function form runs on every (re)connect, so each connection
    // attempt fetches a fresh Firebase ID token rather than reusing a possibly-expired one.
    const socket = io(window.location.origin, {
      auth: (cb) => {
        auth.currentUser?.getIdToken()
          .then((token) => cb({ token: token || '' }))
          .catch(() => cb({ token: '' }));
      },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated]);

  // `connected` is intentionally in the dependency list: the socket is created
  // asynchronously, so subscribers that ran while socketRef was still null must
  // re-run (and actually attach their handlers) once the connection is established.
  const subscribe = useCallback(
    (event: string, handler: (data: any) => void) => {
      socketRef.current?.on(event, handler);
      return () => {
        socketRef.current?.off(event, handler);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connected]
  );

  return { socket: socketRef.current, connected, subscribe };
}
