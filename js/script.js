
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

  /* ---------- Reveal on scroll ---------- */
  function initMenu() {
    if (!('IntersectionObserver' in window)) {
      $$('.reveal').forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    $$('.reveal').forEach((el) => io.observe(el));
  }

  /* ---------- Auth modal: login / register / cabinet / forgot ---------- */
  const AUTH_PANELS = ['login', 'register', 'cabinet', 'forgot'];
  let pendingTab = null;
  const currentUser = () => window.MolotAuth?.state?.user ?? null;

  function setTab(name) {
    // Модалка ленивая: контента может ещё не быть — просто запоминаем таб.
    if (!document.getElementById('loginPanel')) { pendingTab = name; return; }
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
    $$('[data-open-modal]').forEach((btn) => { btn.textContent = u ? '👤 Профиль' : 'Регистрация'; });
    if (u) {
      const bn = $('#bName'), bp = $('#bPhone');
      if (bn && !bn.value) bn.value = u.name ?? '';
      if (bp && !bp.value && u.phone) bp.value = u.phone;
    }
  }

  function initAuthModal() {
    const modal = $('#authModal');
    if (!modal) return;
    const closeModal = () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    };
    const ensureModalContent = () => {
      if (modal.querySelector('.mcard')) return true;
      if (!window.MolotAuthModalTemplate) return false;
      modal.innerHTML = window.MolotAuthModalTemplate;
      modal.addEventListener('click', (e) => {
        if (e.target.closest('[data-close-modal]')) { closeModal(); return; }
        const tab = e.target.closest('.mtab');
        if (tab) { setTab(tab.dataset.mtab); return; }
        const sw = e.target.closest('[data-switch]');
        if (sw) setTab(sw.dataset.switch);
      });
      document.dispatchEvent(new CustomEvent('molot:modal-ready'));
      return true;
    };
    const openModal = () => {
      if (!ensureModalContent()) return showToast('Личный кабинет загружается…', true);
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      const next = pendingTab || (currentUser() ? 'cabinet' : 'register');
      pendingTab = null;
      setTab(next);
    };
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-open-modal]')) { e.preventDefault(); openModal(); }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

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
