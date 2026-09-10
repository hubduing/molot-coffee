/* Molot Coffee — рендер меню из window.MOLOT_MENU */
(() => {
  'use strict';
  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function render(cat = 'coffee') {
    const grid = document.getElementById('menuGrid');
    if (!grid || !Array.isArray(window.MOLOT_MENU)) return;
    grid.innerHTML = window.MOLOT_MENU
      .filter((m) => m.cat === cat)
      .map((m) => `<article class="mitem revealed"><div class="top"><h4>${esc(m.name)}</h4><span class="dash"></span><span class="price">${esc(m.price)}</span></div><p class="desc">${esc(m.desc)}</p><div class="meta">${(m.tags || []).map((t) => `<span class="tag${t.c ? ' ' + esc(t.c) : ''}">${esc(t.t)}</span>`).join('')}</div></article>`)
      .join('');
  }
  window.MolotMenuRender = render;
  document.addEventListener('DOMContentLoaded', () => {
    render('coffee');
    document.querySelectorAll('.mtabs').forEach((t) => t.addEventListener('click', () => {
      document.querySelectorAll('.mtabs').forEach((x) => x.classList.remove('active'));
      t.classList.add('active');
      render(t.dataset.cat);
    }));
  });
})();
