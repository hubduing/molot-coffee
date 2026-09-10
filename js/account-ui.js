/* Molot account UI: login / register / cabinet / forgot. */
(function () {
  "use strict";
  function $(s, c) { return (c || document).querySelector(s); }
  function toast(m, e) { if (window.MolotToast) window.MolotToast(m, e); }
  function tab(n) { if (window.MolotTab) window.MolotTab(n); }
  function auth() { return window.MolotAuth; }
  var RU = { wait: "Подождите…", okReg: "Готово! Аккаунт создан", okLogin: "С возвращением", okReset: "Письмо для восстановления отправлено на", okPass: "Новый пароль сохранён. Войдите с ним.", okProf: "Профиль обновлён ☕", bye: "Вы вышли. Заходите ещё ☕", nobook: "Пока нет броней — забронируйте столик ниже." };
  function ru(k) { var A = auth(); if (A && A.RU && A.RU[k]) return A.RU[k]; return RU[k] || k; }
  function err(e) { var m = String((e && e.message) || e || "T0").replace("ERR:", ""); return ru(m); }
  function busy(form, on) {
    var b = form.querySelector('[type="submit"]');
    if (!b) return;
    if (on) { b.dataset.t = b.textContent; b.textContent = ru("wait"); b.disabled = true; }
    else { b.textContent = b.dataset.t || b.textContent; b.disabled = false; }
  }
  function passScore(p) {
    var s = 0;
    if (p.length >= 6) s++; if (p.length >= 10) s++;
    if (/[A-ZА-ЯЁ]/.test(p) && /[a-zа-яё]/.test(p)) s++;
    if (/\d/.test(p)) s++; if (/[^A-Za-zА-Яа-яЁё0-9]/.test(p)) s++;
    return Math.min(s, 4);
  }
  function paintMeter(input, meter) {
    var v = input.value, s = v ? passScore(v) : 0;
    var bars = meter.querySelectorAll("i");
    var colors = ["#d95d3d", "#d99a3d", "#d99a3d", "#7fb069"];
    for (var i = 0; i < bars.length; i++) {
      bars[i].style.background = i < s ? colors[s - 1] : "rgba(217,154,61,.15)";
    }
    return s;
  }
  function bindModal() {
    if (bindModal.done || !$("#loginPanel")) return;
    bindModal.done = true;
    var rPass = $("#rPass"), meter = $("#passMeter");
    if (rPass && meter) rPass.addEventListener("input", function () { paintMeter(rPass, meter); });
    var lToggle = $("#lToggle"), rToggle = $("#rToggle");
    [[lToggle, $("#lPass")], [rToggle, $("#rPass")]].forEach(function (pair) {
      if (pair[0] && pair[1]) pair[0].addEventListener("click", function () {
        var show = pair[1].type === "password";
        pair[1].type = show ? "text" : "password";
        pair[0].textContent = show ? "🙈" : "👁";
      });
    });
    var f = $("#registerPanel");
    if (f) f.addEventListener("submit", function (e) {
      e.preventDefault(); busy(f, true);
      auth().signUp({ name: $("#rName").value, email: $("#rEmail").value, pass: $("#rPass").value, phone: $("#rPhone").value, agree: $("#rAgree").checked })
        .then(function (u) { f.reset(); if (meter) paintMeter($("#rPass"), meter); if (window.MolotCloseModal) window.MolotCloseModal(); toast(ru("okReg") + ": " + u.name); })
        .catch(function (e2) { toast(err(e2), "err"); })
        .then(function () { busy(f, false); });
    });
    var l = $("#loginPanel");
    if (l) l.addEventListener("submit", function (e) {
      e.preventDefault(); busy(l, true);
      auth().signIn($("#lEmail").value, $("#lPass").value)
        .then(function (u) { l.reset(); if (window.MolotCloseModal) window.MolotCloseModal(); toast(ru("okLogin") + ": " + u.name); })
        .catch(function (e2) { toast(err(e2), "err"); })
        .then(function () { busy(l, false); });
    });
    var gb = $("#googleBtn");
    if (gb) gb.addEventListener("click", function () {
      auth().signInGoogle()
        .then(function (u) { if (window.MolotCloseModal) window.MolotCloseModal(); toast(ru("okLogin") + ": " + u.name); })
        .catch(function (e2) { toast(err(e2), "err"); });
    });
    var fg = $("#forgotPanel");
    if (fg) fg.addEventListener("submit", function (e) {
      e.preventDefault(); busy(fg, true);
      var email = $("#fEmail").value;
      auth().resetPassword(email).then(function (mode) {
        if (mode === "email") { toast(ru("okReset") + ": " + email); tab("login"); }
        else {
          var np = $("#fNew").value;
          if (np.length < 6) { toast(ru("T3"), "err"); return; }
          return auth().setNewPasswordLocal(email, np).then(function () { fg.reset(); tab("login"); toast(ru("okPass")); });
        }
      }).catch(function (e2) { toast(err(e2), "err"); }).then(function () { busy(fg, false); });
    });
  }
  // Модалка теперь ленивая: биндимся когда она вставлена в DOM.
  document.addEventListener("molot:modal-ready", bindModal);
  document.addEventListener("DOMContentLoaded", bindModal);
  window.MolotRenderCabinet = function () {
    var A = auth(); if (!A) return;
    var u = A.state.user;
    if (!u) return;
    var nm = $("#cName"); if (nm) nm.textContent = u.name;
    var em = $("#cEmail"); if (em) em.textContent = u.email;
    var av = $("#cAvatar"); if (av) av.textContent = (u.name || "М").trim().charAt(0).toUpperCase();
    var pe = $("#cPhone"), ne = $("#cNameEdit");
    if (pe && !pe.value) pe.value = u.phone || "";
    if (ne && !ne.value) ne.value = u.name || "";
    var mode = $("#authMode"); if (mode) mode.textContent = A.state.mode === "firebase" ? "☁ облачный аккаунт" : "💾 этот браузер";
    A.myBookings().then(function (list) {
      var box = $("#cabBookings"); if (!box) return;
      box.innerHTML = "";
      if (!list.length) { box.textContent = "Пока нет броней — забронируйте столик ниже."; return; }
      list.forEach(function (b) {
        var d = document.createElement("div"); d.className = "bk-row";
        var t = document.createElement("b"); t.textContent = b.date + " · " + b.time;
        var s = document.createElement("span"); s.textContent = "«" + b.zone + "» · " + b.guests + " гост.";
        d.appendChild(t); d.appendChild(document.createElement("br")); d.appendChild(s);
        box.appendChild(d);
      });
    });
  };
  document.addEventListener("click", function (e) {
    var lo = e.target.closest ? e.target.closest("[data-logout]") : null;
    if (lo) { auth().signOut().then(function () { tab("login"); toast("Вы вышли. Заходите ещё ☕"); }); return; }
    var sv = e.target.closest ? e.target.closest("[data-save-profile]") : null;
    if (sv) {
      var nm = $("#cNameEdit"), ph = $("#cPhone");
      auth().updateProfile({ name: nm ? nm.value : undefined, phone: ph ? ph.value : undefined })
        .then(function () { toast("Профиль обновлён ☕"); })
        .catch(function (err) { toast(err.message, "err"); });
    }
  });
})();