import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { RU } from '../lib/auth.js';

export function passScore(p) {
  let s = 0;
  if (p.length >= 6) s++; if (p.length >= 10) s++;
  if (/[A-ZА-ЯЁ]/.test(p) && /[a-zа-яё]/.test(p)) s++;
  if (/\d/.test(p)) s++; if (/[^A-Za-zА-Яа-яЁё0-9]/.test(p)) s++;
  return Math.min(s, 4);
}
export const METER = ['#d95d3d', '#d99a3d', '#d99a3d', '#7fb069'];

export function useAuthModalState(open, initialTab, onClose, user) {
  const [tab, setTab] = useState('register');
  const [busy, setBusy] = useState(false);
  const [login, setLogin] = useState({ email: '', pass: '', show: false });
  const [forgot, setForgot] = useState({ email: '', np: '' });
  const [cab, setCab] = useState({ name: '', phone: '', list: [] });
  const [reg, setReg] = useState({ name: '', email: '', pass: '', phone: '', agree: false, show: false });

  useEffect(() => {
    if (open) {
      setTab(initialTab || (user ? 'cabinet' : 'register'));
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open, initialTab, user]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return { tab, setTab, busy, setBusy, login, setLogin, reg, setReg, forgot, setForgot, cab, setCab };
}

export function Cabinet({ cab, setCab, setTab }) {
  const { user, mode, updateProfile, myBookings, signOut, showToast } = useAuth();
  useEffect(() => {
    if (user) {
      setCab((c) => ({ ...c, name: user.name || '', phone: user.phone || '' }));
      myBookings().then((list) => setCab((c) => ({ ...c, list })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  if (!user) return null;
  return (
    <div className="panel-form">
      <div className="cab-head">
        <div className="cab-avatar">{(user.name || 'М').trim().charAt(0).toUpperCase()}</div>
        <div><div className="cab-name">{user.name}</div><div className="cab-email">{user.email}</div>
          <div className="cab-mode">{mode === 'supabase' ? '☁ облачный аккаунт' : '💾 этот браузер'}</div></div>
      </div>
      <div className="field"><label>Имя</label><input value={cab.name} onChange={(e) => setCab({ ...cab, name: e.target.value })} /></div>
      <div className="field"><label>Телефон</label><input type="tel" value={cab.phone} onChange={(e) => setCab({ ...cab, phone: e.target.value })} placeholder="+7 (___) ___-__-__" /></div>
      <button type="button" className="btn btn-accent btn-block" onClick={() => updateProfile({ name: cab.name, phone: cab.phone }).then(() => showToast(RU.okProf)).catch((err) => showToast(err.message, true))}>Сохранить профиль</button>
      <h4 className="mini-title cabinet-bookings-title" style={{ marginTop: 18 }}>Мои брони</h4>
      <div className="bk-list">
        {!cab.list.length ? RU.nobook : cab.list.map((b) => (
          <div className="bk-row" key={b.id}><b>{b.date} · {b.time}</b><br /><span>«{b.zone}» · {b.guests} гост.</span></div>
        ))}
      </div>
      <button type="button" className="btn btn-ghost btn-block" onClick={() => { setTab('login'); signOut().then(() => showToast(RU.bye)); }}>Выйти</button>
    </div>
  );
}
export function RegisterForm({ reg, setReg, busy, setBusy, setTab, onDone }) {
  const { signUp, showToast } = useAuth();
  const score = reg.pass ? passScore(reg.pass) : 0;
  const submit = (e) => {
    e.preventDefault();
    setBusy(true);
    signUp({ name: reg.name, email: reg.email, pass: reg.pass, phone: reg.phone, agree: reg.agree })
      .then((u) => { setReg({ name: '', email: '', pass: '', phone: '', agree: false, show: false }); onDone(); showToast(`${RU.okReg}: ${u.name}`); })
      .catch((err) => {
        if (err?.code === 'CHECK_EMAIL' || err?.message === 'CHECK_EMAIL') {
          setReg({ name: '', email: '', pass: '', phone: '', agree: false, show: false });
          setTab('login'); showToast(RU.okCheck);
          return;
        }
        console.error('[molot] register:', err);
        showToast(err.message, true);
      })
      .finally(() => setBusy(false));
  };
  return (
    <form className="panel-form" onSubmit={submit} noValidate>
      <div className="form-row">
        <div className="field"><label>Имя <i>*</i></label><input value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} placeholder="Иван" autoComplete="name" required /></div>
        <div className="field"><label>E-mail <i>*</i></label><input type="email" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} placeholder="you@mail.ru" autoComplete="email" required /></div>
      </div>
      <div className="form-row">
        <div className="field"><label>Пароль <i>*</i></label>
          <div className="pass-wrap">
            <input type={reg.show ? 'text' : 'password'} value={reg.pass} onChange={(e) => setReg({ ...reg, pass: e.target.value })} placeholder="Минимум 6 символов" autoComplete="new-password" required />
            <button type="button" className="pass-eye" onClick={() => setReg({ ...reg, show: !reg.show })} aria-label="Показать пароль">{reg.show ? '🙈' : '👁'}</button>
          </div>
          <div className="pass-meter">{[0, 1, 2, 3].map((i) => <i key={i} style={{ background: i < score ? METER[score - 1] : 'rgba(217,154,61,.15)' }} />)}</div>
        </div>
        <div className="field"><label>Телефон</label><input type="tel" value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} placeholder="+7" autoComplete="tel" /></div>
      </div>
      <label className="agree"><input type="checkbox" checked={reg.agree} onChange={(e) => setReg({ ...reg, agree: e.target.checked })} required /> <span>Согласен с <a href="#">условиями</a></span></label>
      <button type="submit" className="btn btn-accent btn-block" disabled={busy}>{busy ? RU.wait : 'Создать аккаунт'}</button>
      <div className="switch-line">Уже есть аккаунт? <button type="button" onClick={() => setTab('login')}>Войти</button></div>
    </form>
  );
}
export function LoginForm({ login, setLogin, busy, setBusy, setTab, onDone }) {
  const { signIn, signInGoogle, showToast } = useAuth();
  const submit = (e) => {
    e.preventDefault();
    setBusy(true);
    signIn(login.email, login.pass)
      .then((u) => { setLogin({ email: '', pass: '', show: false }); onDone(); showToast(`${RU.okLogin}: ${u.name}`); })
      .catch((err) => showToast(err.message, true))
      .finally(() => setBusy(false));
  };
  const google = () => signInGoogle().then(() => onDone()).catch((err) => showToast(err.message, true));
  return (
    <form className="panel-form" onSubmit={submit} noValidate>
      <div className="field"><label>Email</label><input type="email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} placeholder="you@mail.ru" autoComplete="email" /></div>
      <div className="field"><label>Пароль</label>
        <div className="pass-wrap">
          <input type={login.show ? 'text' : 'password'} value={login.pass} onChange={(e) => setLogin({ ...login, pass: e.target.value })} placeholder="••••••••" autoComplete="current-password" />
          <button type="button" className="pass-eye" onClick={() => setLogin({ ...login, show: !login.show })}>{login.show ? '🙈' : '👁'}</button>
        </div>
      </div>
      <button type="submit" className="btn btn-accent btn-block" disabled={busy}>{busy ? RU.wait : 'Войти'}</button>
      <button type="button" className="btn btn-ghost btn-block" id="googleBtn" style={{ marginTop: 10 }} onClick={google}>Войти через Google</button>
      <div className="switch-line"><button type="button" onClick={() => setTab('forgot')}>Забыли пароль?</button></div>
      <div className="switch-line">Нет аккаунта? <button type="button" onClick={() => setTab('register')}>Зарегистрироваться</button></div>
    </form>
  );
}
export function ForgotForm({ forgot, setForgot, busy, setBusy, setTab }) {
  const { resetPassword, setNewPasswordLocal, showToast } = useAuth();
  const submit = (e) => {
    e.preventDefault();
    setBusy(true);
    resetPassword(forgot.email)
      .then((m) => {
        if (m === 'email') { showToast(`${RU.okReset}: ${forgot.email}`); setTab('login'); return; }
        if (forgot.np.length < 6) { showToast(RU.T3, true); return; }
        return setNewPasswordLocal(forgot.email, forgot.np).then(() => { setForgot({ email: '', np: '' }); setTab('login'); showToast(RU.okPass); });
      })
      .catch((err) => showToast(err.message, true))
      .finally(() => setBusy(false));
  };
  return (
    <form className="panel-form" onSubmit={submit} noValidate>
      <h4 className="mini-title">Восстановление пароля</h4>
      <p className="mini-sub">В облачном режиме пришлём письмо.</p>
      <div className="field"><label>E-mail</label><input type="email" value={forgot.email} onChange={(e) => setForgot({ ...forgot, email: e.target.value })} placeholder="you@mail.ru" /></div>
      <div className="field"><label>Новый пароль (этот браузер)</label><input type="password" value={forgot.np} onChange={(e) => setForgot({ ...forgot, np: e.target.value })} placeholder="Минимум 6 символов" /></div>
      <button type="submit" className="btn btn-accent btn-block" disabled={busy}>{busy ? RU.wait : 'Восстановить'}</button>
      <div className="switch-line"><button type="button" onClick={() => setTab('login')}>← Назад ко входу</button></div>
    </form>
  );
}

export default function AuthModal({ open, initialTab, onClose }) {
  const { user } = useAuth();
  const s = useAuthModalState(open, initialTab, onClose, user);
  if (!open) return null;
  return (
    <div className="modal open" role="dialog" aria-modal="true">
      <div className="mbackdrop" onClick={onClose} />
      <div className="mcard">
        <div className="mhead">
          <h3>МОЛОТ · личный кабинет</h3>
          <button className="mclose-x" onClick={onClose} aria-label="Закрыть">×</button>
        </div>
        {s.tab !== 'cabinet' && s.tab !== 'forgot' && (
          <div className="mtabbar">
            <button className={'mtab' + (s.tab === 'register' ? ' active' : '')} type="button" onClick={() => s.setTab('register')}>Регистрация</button>
            <button className={'mtab' + (s.tab === 'login' ? ' active' : '')} type="button" onClick={() => s.setTab('login')}>Вход</button>
          </div>
        )}
        <div className="mbody">
          {s.tab === 'login' && <LoginForm login={s.login} setLogin={s.setLogin} busy={s.busy} setBusy={s.setBusy} setTab={s.setTab} onDone={onClose} />}
          {s.tab === 'register' && <RegisterForm reg={s.reg} setReg={s.setReg} busy={s.busy} setBusy={s.setBusy} setTab={s.setTab} onDone={onClose} />}
          {s.tab === 'forgot' && <ForgotForm forgot={s.forgot} setForgot={s.setForgot} busy={s.busy} setBusy={s.setBusy} setTab={s.setTab} />}
          {s.tab === 'cabinet' && <Cabinet cab={s.cab} setCab={s.setCab} setTab={s.setTab} />}
        </div>
      </div>
    </div>
  );
}



