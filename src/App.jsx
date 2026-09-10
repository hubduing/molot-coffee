import { useCallback, useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import MenuSection from './components/MenuSection.jsx';
import Story from './components/Story.jsx';
import BookingForm from './components/BookingForm.jsx';
import Footer from './components/Footer.jsx';
import Toast from './components/Toast.jsx';
import AuthModal from './components/AuthModal.jsx';

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  // reveal-анимации — порт initMenu из legacy/js/script.js
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <AuthProvider>
      <Navbar onOpenModal={openModal} />
      <main>
        <Hero />
        <MenuSection />
        <Story />
        <BookingForm />
      </main>
      <Footer onOpenModal={openModal} />
      <AuthModal open={modalOpen} onClose={closeModal} />
      <Toast />
    </AuthProvider>
  );
}
