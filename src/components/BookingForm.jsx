import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const pad2 = (n) => String(n).padStart(2, '0');
const toISO = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export default function BookingForm() {
  const { user, saveBooking, showToast } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', date: '', time: '19:00', guests: '2', zone: 'Общий зал' });
  const [hint, setHint] = useState('');
  const today = toISO(new Date());
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Автоподстановка из профиля — как renderAuthHeader в legacy/js/script.js
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      name: f.name || user.name || '',
      phone: f.phone || user.phone || '',
    }));
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const phone = form.phone.trim();
    if (name.length < 2) return showToast('Укажите имя', true);
    if (phone.replace(/\D/g, '').length < 10) return showToast('Укажите корректный телефон', true);
    if (!form.date) return showToast('Выберите дату', true);
    const t0 = new Date(); t0.setHours(0, 0, 0, 0);
    if (new Date(`${form.date}T00:00:00`) < t0) return showToast('Дата уже прошла — выберите другую', true);
    if (!form.time) return showToast('Укажите время', true);
    try {
      await saveBooking({ ...form, name, phone });
      showToast(`Спасибо, ${name}! Столик «${form.zone}» на ${form.guests} гост.: ${form.date} в ${form.time} — подтвердим по телефону ☕`);
      if (!user) setHint(`${name}, зарегистрируйтесь в личном кабинете, чтобы управлять бронями.`);
      setForm((f) => ({ ...f, name: '', phone: user?.phone || '', date: '', time: '19:00' }));
    } catch {
      showToast('Не удалось сохранить бронь. Попробуйте ещё раз.', true);
    }
  };

  return (
    <section id="book">
      <div className="wrap">
        <div className="sec-head">
          <div><span className="sec-num">03 · Бронирование</span><h2>Закажи <em>столик</em></h2></div>
          <div className="sec-sub">Уютный зал на 42 места, тихая зона и веранда с видом на парк</div>
        </div>
        <div className="books-grid">
          <div className="book-info reveal">
            <p>Оставьте заявку — подтвердим бронь по телефону в течение 15 минут в рабочее время. Вечерами пятницы и субботы рекомендуем бронировать заранее.</p>
            <div className="contact-row"><span className="lbl">Адрес</span><span className="val">ул. Прожжарная, 12с2</span></div>
            <div className="contact-row"><span className="lbl">Телефон</span><span className="val"><b>+7 (495) 120-14-14</b></span></div>
            <div className="contact-row"><span className="lbl">Почта</span><span className="val">hello@molot.coffee</span></div>
            <div className="hours-bar">
              <div className="hb"><b>Пн — Чт</b><span>08:00 — 22:00</span></div>
              <div className="hb"><b>Пт — Сб</b><span>09:00 — 00:00</span></div>
              <div className="hb"><b>Воскресенье</b><span>09:00 — 21:00</span></div>
              <div className="hb"><b>Доставка</b><span>10:00 — 20:00</span></div>
            </div>
          </div>
          <div className="form-card reveal">
            <h3>Бронь столика</h3>
            <div className="formsub">Бесплатно · подтвердим за 15 минут</div>
            {user && (
              <div className="auth-info">👤 Вы вошли как <b>{user.name}</b> — данные подставим автоматически.</div>
            )}
            {hint && !user && <div className="auth-info">💡 <b>{hint.split(',')[0]}</b>, зарегистрируйтесь в личном кабинете, чтобы управлять бронями.</div>}
            <form onSubmit={submit} noValidate>
              <div className="form-row">
                <div className="field"><label>Имя <i>*</i></label><input value={form.name} onChange={set('name')} placeholder="Как к вам обращаться" required /></div>
                <div className="field"><label>Телефон <i>*</i></label><input type="tel" value={form.phone} onChange={set('phone')} placeholder="+7 (___) ___-__-__" required /></div>
              </div>
              <div className="form-row3">
                <div className="field"><label>Дата <i>*</i></label><input type="date" value={form.date} min={today} onChange={set('date')} required /></div>
                <div className="field"><label>Время <i>*</i></label><input type="time" value={form.time} onChange={set('time')} required /></div>
                <div className="field"><label>Гостей</label>
                  <select value={form.guests} onChange={set('guests')}>
                    {['1', '2', '3', '4', '5', '6+'].map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="field"><label>Зона</label>
                <select value={form.zone} onChange={set('zone')}>
                  {['Общий зал', 'Тихая зона', 'Веранда', 'У окна'].map((z) => <option key={z}>{z}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-accent btn-block">Забронировать столик</button>
              <div className="form-note">Нажимая кнопку, вы соглашаетесь с <a href="#">политикой обработки данных</a></div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
