import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ onOpenModal }) {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={'nav' + (scrolled ? ' scrolled' : '')}>
      <div className="wrap nav-inner">
        <a href="#top" className="logo"><span className="mark">М</span>МОЛОТ<b>·</b>КОФЕ</a>
        <nav className={'nav-links' + (open ? ' open' : '')}>
          <a href="#menu" onClick={() => setOpen(false)}>Меню</a>
          <a href="#story" onClick={() => setOpen(false)}>История</a>
          <a href="#book" onClick={() => setOpen(false)}>Столик</a>
          <a href="#" className="btn btn-ghost nav-cta" onClick={(e) => { e.preventDefault(); setOpen(false); onOpenModal(); }}>
            {user ? '👤 Профиль' : 'Регистрация'}
          </a>
          <a href="#book" className="btn btn-accent nav-cta nav-book" onClick={() => setOpen(false)}>Заказать столик</a>
        </nav>
        <button className={'burger' + (open ? ' open' : '')} aria-label="Меню" onClick={() => setOpen((v) => !v)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
