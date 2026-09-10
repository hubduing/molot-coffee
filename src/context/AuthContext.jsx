import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../lib/auth.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState('local');
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, isErr = false) => {
    setToast({ msg: String(msg ?? ''), err: Boolean(isErr), key: Date.now() });
  }, []);

  useEffect(() => {
    let alive = true;
    authApi.boot().then(({ mode: m, user: u }) => {
      if (!alive) return;
      setMode(m); setUser(u); setReady(true);
    });
    const off = authApi.onChange((u) => { if (alive) setUser(u); });
    return () => { alive = false; off(); };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(id);
  }, [toast]);

  // OAuth callback errors (?error=... после возврата с Google)
  useEffect(() => {
    try {
      const q = new URLSearchParams(location.search);
      const h = new URLSearchParams(location.hash.replace(/^#/, ''));
      const err = q.get('error') || h.get('error');
      const desc = q.get('error_description') || h.get('error_description');
      if (err || desc) {
        const msg = desc ? decodeURIComponent(desc.replace(/\+/g, ' ')) : err;
        showToast(`Вход через Google не удался: ${msg}`, true);
        history.replaceState(null, '', location.pathname);
      }
    } catch { /* noop */ }
  }, [showToast]);

  const value = useMemo(() => ({
    ready, mode, user, toast, showToast,
    async signUp(d) { const u = await authApi.signUp(d); setUser(u); return u; },
    async signIn(email, pass) { const u = await authApi.signIn(email, pass); setUser(u); return u; },
    async signOut() { await authApi.signOut(); setUser(null); },
    signInGoogle() { return authApi.signInGoogle(); },
    resetPassword(email) { return authApi.resetPassword(email); },
    setNewPasswordLocal(email, pw) { return authApi.setNewPasswordLocal(email, pw); },
    async updateProfile(p) { const u = await authApi.updateProfile(user, p); setUser(u); return u; },
    saveBooking(b) { return authApi.saveBooking(user, b); },
    myBookings() { return authApi.myBookings(user); },
  }), [ready, mode, user, toast, showToast]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
