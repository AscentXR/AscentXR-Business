import { createContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth as firebaseAuth } from '../config/firebase';
import { auth as authApi } from '../api/endpoints';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const tokenResult = await firebaseUser.getIdTokenResult();
          const role = (tokenResult.claims.role as 'admin' | 'viewer') || 'viewer';
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email || '',
            role,
          });

          // Sync user to backend database
          try {
            await authApi.syncSession();
          } catch {
            // Non-critical - backend sync can fail silently
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function login(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const tokenResult = await credential.user.getIdTokenResult();
    const role = (tokenResult.claims.role as 'admin' | 'viewer') || 'viewer';
    setUser({
      uid: credential.user.uid,
      email: credential.user.email || '',
      name: credential.user.displayName || credential.user.email || '',
      role,
    });

    // Sync user to backend
    try {
      await authApi.syncSession();
    } catch {
      // Non-critical
    }
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(firebaseAuth, provider);
    // After redirect, onAuthStateChanged will handle the user state
  }

  function logout() {
    firebaseSignOut(firebaseAuth);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
