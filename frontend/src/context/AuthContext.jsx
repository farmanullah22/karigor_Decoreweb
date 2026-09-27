import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/endpoints';
import { getStoredToken, setStoredToken } from '../services/api';

const AuthContext = createContext(null);

/**
 * Authentication state for the admin dashboard.
 * - Restores the session from the stored JWT on first load.
 * - Reacts to 401 responses emitted by the API client (session expiry).
 */
export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Restore session on mount.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const token = getStoredToken();
      if (!token) {
        setInitializing(false);
        return;
      }
      try {
        const me = await authApi.me();
        if (!cancelled) setAdmin(me);
      } catch {
        setStoredToken(null);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  // Session expiry triggered by the API client.
  useEffect(() => {
    const onUnauthorized = () => setAdmin(null);
    window.addEventListener('karigor:unauthorized', onUnauthorized);
    return () => window.removeEventListener('karigor:unauthorized', onUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, admin: loggedIn } = await authApi.login(email, password);
    setStoredToken(token);
    setAdmin(loggedIn);
    return loggedIn;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Logout should never fail from the user's perspective.
    }
    setStoredToken(null);
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated: Boolean(admin),
      initializing,
      login,
      logout,
      setAdmin,
    }),
    [admin, initializing, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider.');
  return context;
}
