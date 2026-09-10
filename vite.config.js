import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages (проектный сайт): https://hubduing.github.io/molot-coffee/
// Поэтому base — имя репозитория. Для кастомного домена / юзер-сайта заменить на '/'.
export default defineConfig({
  base: '/molot-coffee/',
  plugins: [react()],
});
