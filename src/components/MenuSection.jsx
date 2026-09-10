import { useState } from 'react';
import { MOLOT_MENU, MENU_CATS } from '../data/menu.js';

export default function MenuSection() {
  const [cat, setCat] = useState('coffee');
  return (
    <section id="menu">
      <div className="wrap reveal in">
        <div className="sec-head">
          <div>
            <span className="sec-num">01 · Наше меню</span>
            <h2>Выбирай <em>по вкусу</em></h2>
          </div>
          <div className="sec-sub">Обновляемся каждые две недели следом за новой обжаркой</div>
        </div>
        <div className="menu-tabs">
          {MENU_CATS.map((c) => (
            <button key={c.id} className={'mtabs' + (cat === c.id ? ' active' : '')} onClick={() => setCat(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="menu-grid">
          {MOLOT_MENU.filter((m) => m.cat === cat).map((m) => (
            <article className="mitem revealed" key={m.name}>
              <div className="top"><h4>{m.name}</h4><span className="dash" /><span className="price">{m.price}</span></div>
              <p className="desc">{m.desc}</p>
              <div className="meta">{(m.tags || []).map((tg) => <span key={tg.t} className={'tag' + (tg.c ? ' ' + tg.c : '')}>{tg.t}</span>)}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
