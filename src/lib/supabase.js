// ── МОЛОТ·КОФЕ — Supabase config ──
// Ключи берутся из .env.local (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY),
// fallback — значения демо-проекта из legacy/js/supabase-config.js.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xpcatojxhxjmfoeayymw.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_B9keIdoP77dj9VKQDD09Gg_Qg2NeMsa';
