
/* Molot Coffee — main UI: nav / menu / toast / modal / booking.
 * Depends on: window.MolotAuth (js/auth.js), window.MolotRenderCabinet (js/account-ui.js)
 * Exposes: MolotToast, MolotTab, MolotOpenModal, MolotCloseModal, MolotRefreshHeader
 */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const pad2 = (n) => String(n).padStart(2, '0');
  const toISODate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  const toastMsg = $('#toastMsg');
  let toastTimer = 0;

  function showToast(msg, isErr = false) {
    if (!toastEl || !toastMsg) return;
    toastMsg.textContent = String(msg ?? '');
    toastEl.classList.toggle('err', Boolean(isErr));
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3800);
  }
  window.MolotToast = showToast;

  /* ---------- Nav ---------- */
  function initNav() {
    const nav = $('#nav');
    if (nav) {
      const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    const burger = $('#burger');
    const links = $('#navLinks');
    if (burger && links) {
      burger.addEventListener('click', () => {
        burger.classList.toggle('open');
        links.classList.toggle('open');
      });
      $$('.nav-links a').forEach((a) => a.addEventListener('click', () => {
        burger.classList.remove('open');
        links.classList.remove('open');
      }));
    }
  }

  /* ---------- Menu filtering + reveal ---------- */
  function initMenu() {
    const tabs = $$('.mtabs');
    const items = $$('.mitem');
    if (!tabs.length || !items.length) return;

    const showCat = (cat) => {
      let idx = 0;
      items.forEach((it) => {
        const show = it.dataset.cat === cat;
        it.style.display = show ? 'block' : 'none';
        if (!show) return;
        it.classList.remove('revealed');
        setTimeout(() => it.classList.add('revealed'), idx * 70);
        idx += 1;
      });
    };

    tabs.forEach((t) => t.addEventListener('click', () => {
      tabs.forEach((x) => x.classList.remove('active'));
      t.classList.add('active');
      showCat(t.dataset.cat);
    }));

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    $$('.reveal').forEach((el) => io.observe(el));

    setTimeout(() => showCat('coffee'), 120);
  }

  /* ---------- Auth modal: login / register / cabinet / forgot ---------- */
  const AUTH_PANELS = ['login', 'register', 'cabinet', 'forgot'];
  const currentUser = () => window.MolotAuth?.state?.user ?? null;

  function setTab(name) {
    $$('.mtab').forEach((m) => m.classList.toggle('active', m.dataset.mtab === name));
    AUTH_PANELS.forEach((n) => {
      const p = $(`#${n}Panel`);
      if (p) p.classList.toggle('hide', n !== name);
    });
    const bar = $('#authTabs');
    if (bar) bar.style.display = (name === 'cabinet' || name === 'forgot') ? 'none' : 'flex';
    if (name === 'cabinet') window.MolotRenderCabinet?.();
  }

  function renderAuthHeader() {
    const u = currentUser();
    const info = $('#authInfo');
    if (info) {
      info.style.display = u ? 'block' : 'none';
      info.textContent = '';
      if (u) {
        info.append('👤 Вы вошли как ');
        const b = document.createElement('b');
        b.textContent = u.name;
        info.append(b, ' — данные подставим автоматически.');
      }
    }
    $$('[data-open-modal]').forEach((btn) => { btn.textContent = u ? `👤 ${u.name}` : 'Войти'; });
    if (u) {
      const bn = $('#bName'), bp = $('#bPhone');
      if (bn && !bn.value) bn.value = u.name ?? '';
      if (bp && !bp.value && u.phone) bp.value = u.phone;
    }
  }

  function initAuthModal() {
    const modal = $('#authModal');
    if (!modal) return;
    const openModal = () => {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTab(currentUser() ? 'cabinet' : 'login');
    };
    const closeModal = () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    };
    $$('[data-open-modal]').forEach((el) => el.addEventListener('click', (e) => {
      e.preventDefault(); openModal();
    }));
    $$('[data-close-modal]').forEach((el) => el.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    $$('.mtab').forEach((m) => m.addEventListener('click', () => setTab(m.dataset.mtab)));
    $$('[data-switch]').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.switch)));

    window.MolotTab = setTab;
    window.MolotRefreshHeader = renderAuthHeader;
    window.MolotCloseModal = closeModal;
    window.MolotOpenModal = openModal;

    window.MolotAuth?.onAuth?.(() => {
      renderAuthHeader();
      window.MolotRenderCabinet?.();
    });
    renderAuthHeader();
  }

  /* ---------- Booking ---------- */
  function hintRegister(name) {
    if (currentUser()) return;
    const info = $('#authInfo');
    if (!info) return;
    info.style.display = 'block';
    info.textContent = '';
    const b = document.createElement('b');
    b.textContent = name;
    info.append('💡 ', b, ', зарегистрируйтесь в личном кабинете, чтобы управлять бронями.');
  }

  function initBooking() {
    const form = $('#bookForm');
    if (!form) return;
    const dateInput = $('#bDate');
    if (dateInput) dateInput.min = toISODate(new Date());

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = $('#bName')?.value.trim() ?? '';
      const phone = $('#bPhone')?.value.trim() ?? '';
      const date = dateInput?.value ?? '';
      const time = $('#bTime')?.value ?? '';
      const guests = $('#bGuests')?.value ?? '';
      const zone = $('#bZone')?.value ?? '';

      if (name.length < 2) return showToast('Укажите имя', true);
      if (phone.replace(/\D/g, '').length < 10) return showToast('Укажите корректный телефон', true);
      if (!date) return showToast('Выберите дату', true);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(`${date}T00:00:00`) < today) return showToast('Дата уже прошла — выберите другую', true);
      if (!time) return showToast('Укажите время', true);
      if (!window.MolotAuth) return showToast('Сервис брони временно недоступен', true);

      try {
        await window.MolotAuth.saveBooking({ name, phone, date, time, guests, zone });
        showToast(`Спасибо, ${name}! Столик «${zone}» на ${guests} гост.: ${date} в ${time} — подтвердим по телефону ☕`);
        hintRegister(name);
        form.reset();
        window.MolotRenderCabinet?.();
      } catch {
        showToast('Не удалось сохранить бронь. Попробуйте ещё раз.', true);
      }
    });
  }

  initNav();
  initMenu();
  initAuthModal();
  initBooking();
})();
