/* МОЛОТ·КОФЕ — Auth: Supabase (облако) + localStorage (fallback).
 * API: window.MolotAuth. Облако вкл., когда задан ANON_KEY (js/supabase-config.js).
 * Таблицы: public.profiles, public.bookings. Схема: supabase-schema.sql
 */
(function () {
"use strict";
var U = "molot_users_v2", SE = "molot_session_v2", BK = "molot_bookings_v2";
var L = [], ST = { ready: false, mode: "local", user: null }, SB = null;
function em() { for (var i = 0; i < L.length; i++) { try { L[i](ST.user); } catch (e) {} } }
function ne(e) { return String(e || "").trim().toLowerCase(); }
function ve(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e); }
function rd(k, f) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? f : v; } catch (e) { return f; } }
function wr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function hs(s, cb) {
  if (window.crypto && crypto.subtle && window.TextEncoder) {
    crypto.subtle.digest("SHA-256", new TextEncoder().encode("molot::" + s)).then(function (b) {
      var r = "", a = new Uint8Array(b);
      for (var i = 0; i < a.length; i++) { var x = a[i].toString(16); if (x.length < 2) x = "0" + x; r += x; }
      cb(r);
    });
  } else { var h = 7; for (var j = 0; j < s.length; j++) { h = ((h << 5) - h + s.charCodeAt(j)) | 0; } cb("fh" + s.length + "x" + h); }
}
function lu(email) {
  var u = rd(U, {})[ne(email)]; if (!u) return null;
  return { email: ne(email), name: u.name, phone: u.phone || "", provider: "local" };
}
function su(u, p) {
  if (!u) return null; var m = (u.email || "").toLowerCase(), md = u.user_metadata || {};
  return { email: m, name: (p && p.name) || md.name || m.split("@")[0], phone: (p && p.phone) || md.phone || "", provider: "supabase" };
}
function profOf(uid) {
  if (!SB || !uid) return Promise.resolve(null);
  return SB.from("profiles").select("name,phone").eq("id", uid).maybeSingle()
    .then(function (r) { return r.data || null; }, function () { return null; });
}
function sbErr(e) {
  var m = String((e && e.message) || "").toLowerCase();
  if (/already registered|already exists|duplicate/i.test(m)) return "T5";
  if (/invalid login|invalid.*credential|wrong|incorrect|password/i.test(m)) return "T9";
  if (/not found|no user|not confirmed/i.test(m)) return "T8";
  if (/rate limit|too many|over.*limit/i.test(m)) return "T10";
  if (/invalid.*email/i.test(m)) return "T2";
  return "T0";
}
var api = { state: ST };
api.onAuth = function (fn) { L.push(fn); if (ST.ready) fn(ST.user); };
api.RU = {
  T0: "Что-то пошло не так. Попробуйте ещё раз.",
  T1: "Представьтесь: имя — минимум 2 символа.",
  T2: "Проверьте e-mail: похоже, в нём опечатка.",
  T3: "Пароль слишком короткий — минимум 6 символов.",
  T4: "Подтвердите согласие с условиями.",
  T5: "Этот e-mail уже зарегистрирован. Войдите или восстановите пароль.",
  T6: "Сначала войдите в аккаунт.", T7: "Введите пароль.",
  T8: "Аккаунт с таким e-mail не найден. Зарегистрируйтесь.",
  T9: "Неверный пароль. Проверьте раскладку или восстановите пароль.",
  T10: "Слишком много попыток. Подождите минуту и попробуйте снова.",
  wait: "Подождите…", okReg: "Готово! Аккаунт создан", okLogin: "С возвращением",
  okReset: "Письмо для восстановления отправлено на", okPass: "Новый пароль сохранён. Войдите с ним.",
  okProf: "Профиль обновлён ☕", bye: "Вы вышли. Заходите ещё ☕",
  nobook: "Пока нет броней — забронируйте столик ниже.",
  needCloud: "Облачный вход заработает после добавления anon key (см. js/supabase-config.js)."
};
api.signUp = function (d) {
  var nm = String(d.name || "").trim(), ml = ne(d.email), pw = String(d.pass || ""), ph = String(d.phone || "").trim();
  if (nm.length < 2) return Promise.reject(new Error("T1"));
  if (!ve(ml)) return Promise.reject(new Error("T2"));
  if (pw.length < 6) return Promise.reject(new Error("T3"));
  if (!d.agree) return Promise.reject(new Error("T4"));
  if (ST.mode === "supabase" && SB) {
    return SB.auth.signUp({ email: ml, password: pw, options: { data: { name: nm, phone: ph } } }).then(function (r) {
      if (r.error) throw new Error(sbErr(r.error));
      var u = r.data && r.data.user; if (!u) throw new Error("T0");
      return SB.from("profiles").upsert({ id: u.id, email: ml, name: nm, phone: ph }).then(function () {
        ST.user = { email: ml, name: nm, phone: ph, provider: "supabase" }; em(); return ST.user;
      });
    });
  }
  var us = rd(U, {}); if (us[ml]) return Promise.reject(new Error("T5"));
  return new Promise(function (res) {
    hs(pw, function (h) {
      us[ml] = { name: nm, pass: h, phone: ph }; wr(U, us);
      try { localStorage.setItem(SE, ml); } catch (e) {}
      ST.user = lu(ml); em(); res(ST.user);
    });
  });
};
api.signIn = function (ml, pw) {
  ml = ne(ml); pw = String(pw || "");
  if (!ve(ml)) return Promise.reject(new Error("T2"));
  if (!pw) return Promise.reject(new Error("T7"));
  if (ST.mode === "supabase" && SB) {
    return SB.auth.signInWithPassword({ email: ml, password: pw }).then(function (r) {
      if (r.error) throw new Error(sbErr(r.error));
      var u = r.data && r.data.user;
      return profOf(u && u.id).then(function (p) { ST.user = su(u, p); em(); return ST.user; });
    });
  }
  var u = rd(U, {})[ml]; if (!u) return Promise.reject(new Error("T8"));
  return new Promise(function (res, rej) {
    hs(pw, function (h) {
      if (u.pass !== h && u.pass !== pw) { rej(new Error("T9")); return; }
      if (u.pass === pw) { var a = rd(U, {}); a[ml].pass = h; wr(U, a); }
      try { localStorage.setItem(SE, ml); } catch (e) {}
      ST.user = lu(ml); em(); res(ST.user);
    });
  });
};
api.signOut = function () {
  if (ST.mode === "supabase" && SB) return SB.auth.signOut().then(function () { ST.user = null; em(); });
  try { localStorage.removeItem(SE); localStorage.removeItem("molot_user"); } catch (e) {}
  ST.user = null; em(); return Promise.resolve();
};
api.resetPassword = function (ml) {
  ml = ne(ml); if (!ve(ml)) return Promise.reject(new Error("T2"));
  if (ST.mode === "supabase" && SB) {
    return SB.auth.resetPasswordForEmail(ml).then(function (r) {
      if (r.error) throw new Error(sbErr(r.error));
      return "email";
    });
  }
  if (!rd(U, {})[ml]) return Promise.reject(new Error("T8"));
  return Promise.resolve("local");
};
api.setNewPasswordLocal = function (ml, pw) {
  var a = rd(U, {}); if (!a[ne(ml)]) return Promise.reject(new Error("T8"));
  if (String(pw || "").length < 6) return Promise.reject(new Error("T3"));
  return new Promise(function (res) { hs(pw, function (h) { a[ne(ml)].pass = h; wr(U, a); res(true); }); });
};
api.updateProfile = function (p) {
  if (!ST.user) return Promise.reject(new Error("T6"));
  var nm = String((p.name !== undefined ? p.name : ST.user.name) || "").trim() || ST.user.name;
  var ph = p.phone !== undefined ? String(p.phone).trim() : ST.user.phone;
  if (ST.mode === "supabase" && SB) {
    return SB.auth.getUser().then(function (r) {
      var u = r.data && r.data.user; if (!u) throw new Error("T6");
      return SB.auth.updateUser({ data: { name: nm, phone: ph } }).then(function () {
        return SB.from("profiles").upsert({ id: u.id, email: u.email, name: nm, phone: ph });
      }).then(function (up) {
        if (up.error) throw new Error("T0");
        ST.user = { email: ST.user.email, name: nm, phone: ph, provider: "supabase" }; em(); return ST.user;
      });
    });
  }
  var a = rd(U, {}), u = a[ST.user.email]; if (!u) return Promise.reject(new Error("T6"));
  if (p.name) u.name = String(p.name).trim();
  if (p.phone !== undefined) u.phone = String(p.phone).trim();
  wr(U, a); ST.user = lu(ST.user.email); em(); return Promise.resolve(ST.user);
};
api.saveBooking = function (b) {
  b = { name: b.name || "", phone: b.phone || "", date: b.date || "", time: b.time || "",
    guests: b.guests || "", zone: b.zone || "", id: "b" + Date.now().toString(36),
    createdAt: new Date().toISOString(), email: ST.user ? ST.user.email : (b.email || "") };
  if (ST.mode === "supabase" && SB) {
    return SB.auth.getUser().then(function (r) {
      var u = r.data && r.data.user;
      return SB.from("bookings").insert({ name: b.name, phone: b.phone, date: b.date, time: b.time,
        guests: b.guests, zone: b.zone, email: b.email, user_id: u ? u.id : null });
    }).then(function (ins) { if (ins.error) throw new Error("T0"); return b; });
  }
  var a = rd(BK, []); a.unshift(b); wr(BK, a.slice(0, 200)); return Promise.resolve(b);
};
api.myBookings = function () {
  if (ST.mode === "supabase" && SB) {
    return SB.auth.getUser().then(function (r) {
      var u = r.data && r.data.user; if (!u) return [];
      return SB.from("bookings").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).limit(20)
        .then(function (q) {
          if (q.error) return [];
          return (q.data || []).map(function (o) {
            return { id: o.id, name: o.name, phone: o.phone, date: o.date, time: o.time, guests: o.guests, zone: o.zone, email: o.email };
          });
        });
    });
  }
  var ml = ST.user ? ST.user.email : "", all = rd(BK, []), out = [];
  for (var i = 0; i < all.length && out.length < 20; i++) { if (!ml || all[i].email === ml) out.push(all[i]); }
  return Promise.resolve(out);
};
api.signInGoogle = function () {
  if (ST.mode !== "supabase" || !SB) return Promise.reject(new Error("needCloud"));
  return SB.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + location.pathname } })
    .then(function (r) { if (r.error) throw new Error("T0"); return null; });
};
api.t = function (c) { return (api.RU && api.RU[c]) || c; };
["signUp", "signIn", "signInGoogle", "resetPassword", "setNewPasswordLocal", "updateProfile"].forEach(function (k) {
  var orig = api[k];
  api[k] = function () { return orig.apply(api, arguments).catch(function (e) { throw new Error(api.t(String((e && e.message) || "T0"))); }); };
});
function bootLocal() {
  var s = ""; try { s = ne(localStorage.getItem(SE)); } catch (e) {}
  ST.mode = "local"; ST.user = s ? lu(s) : null;
  if (s && !ST.user) { try { localStorage.removeItem(SE); } catch (e) {} }
  ST.ready = true; em();
}
function bootCloud() {
  ST.mode = "supabase";
  SB.auth.getSession().then(function (r) {
    var u = r.data && r.data.session && r.data.session.user;
    if (!u) { ST.user = null; ST.ready = true; em(); return; }
    profOf(u.id).then(function (p) { ST.user = su(u, p); ST.ready = true; em(); });
  });
  SB.auth.onAuthStateChange(function (_ev, session) {
    var u = session && session.user;
    if (!u) { ST.user = null; if (!ST.ready) ST.ready = true; em(); return; }
    profOf(u.id).then(function (p) { ST.user = su(u, p); ST.ready = true; em(); });
  });
}
function loadClient() {
  return new Promise(function (res, rej) {
    if (window.supabase && window.supabase.createClient) return res();
    var t = document.createElement("script");
    t.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    t.onload = res; t.onerror = rej;
    document.head.appendChild(t);
  });
}
var hasCfg = !!(window.MOLOT_SUPABASE_URL && window.MOLOT_SUPABASE_ANON_KEY);
if (hasCfg) {
  loadClient().then(function () {
    try { SB = window.supabase.createClient(window.MOLOT_SUPABASE_URL, window.MOLOT_SUPABASE_ANON_KEY); bootCloud(); }
    catch (e) { bootLocal(); }
  }, bootLocal);
} else { bootLocal(); }
window.MolotAuth = api;
})();
