import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase.js';

// Порт legacy/js/auth-supabase.js: Supabase (облако) + localStorage (fallback).
// Те же localStorage-ключи (molot_users_v2 / molot_session_v2 / molot_bookings_v2).
const U = 'molot_users_v2';
const SE = 'molot_session_v2';
const BK = 'molot_bookings_v2';

export const RU = {
  T0: 'Что-то пошло не так. Попробуйте ещё раз.',
  T1: 'Представьтесь: имя — минимум 2 символа.',
  T2: 'Проверьте e-mail: похоже, в нём опечатка.',
  T3: 'Пароль слишком короткий — минимум 6 символов.',
  T4: 'Подтвердите согласие с условиями.',
  T5: 'Этот e-mail уже зарегистрирован. Войдите или восстановите пароль.',
  T6: 'Сначала войдите в аккаунт.',
  T7: 'Введите пароль.',
  T8: 'Аккаунт с таким e-mail не найден. Зарегистрируйтесь.',
  T9: 'Неверный пароль. Проверьте раскладку или восстановите пароль.',
  T10: 'Слишком много попыток. Подождите минуту и попробуйте снова.',
  wait: 'Подождите…',
  okReg: 'Готово! Аккаунт создан',
  okLogin: 'С возвращением',
  okReset: 'Письмо для восстановления отправлено на',
  okPass: 'Новый пароль сохранён. Войдите с ним.',
  okProf: 'Профиль обновлён ☕',
  bye: 'Вы вышли. Заходите ещё ☕',
  nobook: 'Пока нет броней — забронируйте столик ниже.',
  needCloud: 'Облачный вход заработает после добавления anon key (см. .env.local).',
};
export const t = (c) => RU[c] || c;

const norm = (e) => String(e || '').trim().toLowerCase();
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const read = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? f : v; } catch { return f; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* noop */ } };

async function hashPw(s) {
  if (window.crypto?.subtle && window.TextEncoder) {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('molot::' + s));
    return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
  }
  let h = 7;
  for (let j = 0; j < s.length; j++) h = ((h << 5) - h + s.charCodeAt(j)) | 0;
  return 'fh' + s.length + 'x' + h;
}

function sbErr(e) {
  const m = String(e?.message || '').toLowerCase();
  if (/provider.*not.*enabl|unsupported provider|validation failed.*provider/i.test(m))
    return 'OAuth-провайдер Google выключен в Supabase Dashboard → Authentication → Providers.';
  if (/redirect.*url|redirect_uri/i.test(m))
    return 'Redirect URL не разрешён в Supabase Dashboard → Authentication → URL Configuration.';
  if (/already registered|already exists|duplicate/i.test(m)) return 'T5';
  if (/invalid login|invalid.*credential|wrong|incorrect|password/i.test(m)) return 'T9';
  if (/not found|no user|not confirmed/i.test(m)) return 'T8';
  if (/rate limit|too many|over.*limit/i.test(m)) return 'T10';
  if (/invalid.*email/i.test(m)) return 'T2';
  return 'T0';
}
const wrap = (fn) => (...a) => fn(...a).catch((e) => { throw new Error(t(String(e?.message || 'T0'))); });

const sb = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
export const cloudEnabled = !!sb;

const localUser = (email) => {
  const u = read(U, {})[norm(email)];
  if (!u) return null;
  return { email: norm(email), name: u.name, phone: u.phone || '', provider: 'local' };
};
const cloudUser = (u, p) => {
  if (!u) return null;
  const m = (u.email || '').toLowerCase();
  const md = u.user_metadata || {};
  return { email: m, name: (p && p.name) || md.name || m.split('@')[0], phone: (p && p.phone) || md.phone || '', provider: 'supabase' };
};
const profileOf = async (uid) => {
  if (!sb || !uid) return null;
  const { data } = await sb.from('profiles').select('name,phone').eq('id', uid).maybeSingle();
  return data || null;
};
export const authApi = {
  async boot() {
    if (!sb) {
      const s = norm(localStorage.getItem(SE));
      const user = s ? localUser(s) : null;
      if (s && !user) localStorage.removeItem(SE);
      return { mode: 'local', user };
    }
    const { data } = await sb.auth.getSession();
    const u = data?.session?.user;
    if (!u) return { mode: 'supabase', user: null };
    return { mode: 'supabase', user: cloudUser(u, await profileOf(u.id)) };
  },
  onChange(cb) {
    if (!sb) return () => {};
    const { data } = sb.auth.onAuthStateChange(async (_ev, session) => {
      const u = session?.user;
      cb(u ? cloudUser(u, await profileOf(u.id)) : null);
    });
    return () => data.subscription.unsubscribe();
  },
  signUp: wrap(async (d) => {
    const nm = String(d.name || '').trim();
    const ml = norm(d.email);
    const pw = String(d.pass || '');
    const ph = String(d.phone || '').trim();
    if (nm.length < 2) throw new Error('T1');
    if (!validEmail(ml)) throw new Error('T2');
    if (pw.length < 6) throw new Error('T3');
    if (!d.agree) throw new Error('T4');
    if (sb) {
      const r = await sb.auth.signUp({ email: ml, password: pw, options: { data: { name: nm, phone: ph } } });
      if (r.error) throw new Error(sbErr(r.error));
      const u = r.data?.user;
      if (!u) throw new Error('T0');
      await sb.from('profiles').upsert({ id: u.id, email: ml, name: nm, phone: ph });
      return { email: ml, name: nm, phone: ph, provider: 'supabase' };
    }
    const us = read(U, {});
    if (us[ml]) throw new Error('T5');
    us[ml] = { name: nm, pass: await hashPw(pw), phone: ph };
    write(U, us);
    localStorage.setItem(SE, ml);
    return localUser(ml);
  }),
  signIn: wrap(async (email, pw) => {
    const ml = norm(email);
    pw = String(pw || '');
    if (!validEmail(ml)) throw new Error('T2');
    if (!pw) throw new Error('T7');
    if (sb) {
      const r = await sb.auth.signInWithPassword({ email: ml, password: pw });
      if (r.error) throw new Error(sbErr(r.error));
      return cloudUser(r.data?.user, await profileOf(r.data?.user?.id));
    }
    if (!read(U, {})[ml]) throw new Error('T8');
    const u = read(U, {})[ml];
    const h = await hashPw(pw);
    if (u.pass !== h && u.pass !== pw) throw new Error('T9');
    if (u.pass === pw) { const a = read(U, {}); a[ml].pass = h; write(U, a); }
    localStorage.setItem(SE, ml);
    return localUser(ml);
  }),
  async signOut() {
    if (sb) await sb.auth.signOut();
    else { localStorage.removeItem(SE); localStorage.removeItem('molot_user'); }
  },
  signInGoogle: wrap(async () => {
    if (!sb) throw new Error('needCloud');
    const r = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } });
    if (r.error) throw new Error(sbErr(r.error));
    return null;
  }),
  resetPassword: wrap(async (email) => {
    const ml = norm(email);
    if (!validEmail(ml)) throw new Error('T2');
    if (sb) {
      const r = await sb.auth.resetPasswordForEmail(ml);
      if (r.error) throw new Error(sbErr(r.error));
      return 'email';
    }
    if (!read(U, {})[ml]) throw new Error('T8');
    return 'local';
  }),
  setNewPasswordLocal: wrap(async (email, pw) => {
    const a = read(U, {});
    if (!a[norm(email)]) throw new Error('T8');
    if (String(pw || '').length < 6) throw new Error('T3');
    a[norm(email)].pass = await hashPw(pw);
    write(U, a);
    return true;
  }),
  updateProfile: wrap(async (user, p) => {
    if (!user) throw new Error('T6');
    const nm = String(p.name !== undefined ? p.name : user.name || '').trim() || user.name;
    const ph = p.phone !== undefined ? String(p.phone).trim() : user.phone;
    if (sb) {
      const { data } = await sb.auth.getUser();
      const u = data?.user;
      if (!u) throw new Error('T6');
      await sb.auth.updateUser({ data: { name: nm, phone: ph } });
      const up = await sb.from('profiles').upsert({ id: u.id, email: u.email, name: nm, phone: ph });
      if (up.error) throw new Error('T0');
      return { email: user.email, name: nm, phone: ph, provider: 'supabase' };
    }
    const a = read(U, {});
    const u = a[user.email];
    if (!u) throw new Error('T6');
    if (p.name) u.name = String(p.name).trim();
    if (p.phone !== undefined) u.phone = String(p.phone).trim();
    write(U, a);
    return localUser(user.email);
  }),
  async saveBooking(user, b) {
    const booking = {
      name: b.name || '', phone: b.phone || '', date: b.date || '', time: b.time || '',
      guests: b.guests || '', zone: b.zone || '', id: 'b' + Date.now().toString(36),
      createdAt: new Date().toISOString(), email: user ? user.email : b.email || '',
    };
    if (sb) {
      const { data } = await sb.auth.getUser();
      const u = data?.user;
      const ins = await sb.from('bookings').insert({
        name: booking.name, phone: booking.phone, date: booking.date,
        time: booking.time, guests: booking.guests, zone: booking.zone,
        email: booking.email, user_id: u ? u.id : null,
      });
      if (ins.error) throw new Error(t('T0'));
      return booking;
    }
    const a = read(BK, []);
    a.unshift(booking);
    write(BK, a.slice(0, 200));
    return booking;
  },
  async myBookings(user) {
    if (sb) {
      const { data } = await sb.auth.getUser();
      const u = data?.user;
      if (!u) return [];
      const q = await sb.from('bookings').select('*').eq('user_id', u.id).order('created_at', { ascending: false }).limit(20);
      if (q.error) return [];
      return (q.data || []).map((o) => ({ id: o.id, name: o.name, phone: o.phone, date: o.date, time: o.time, guests: o.guests, zone: o.zone, email: o.email }));
    }
    const ml = user?.email || '';
    return read(BK, []).filter((x) => !ml || x.email === ml).slice(0, 20);
  },
};

