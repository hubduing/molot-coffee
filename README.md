# МОЛОТ — спешалти кофейня (React + Vite)

Лендинг + личный кабинет кофейни «МОЛОТ». Проект переписан на **React (Vite, JS)**:
меню с табами, бронь столика, регистрация / вход через **Supabase Auth** с fallback в `localStorage`.

Репозиторий: https://github.com/hubduing/molot-coffee.git · ветка: `feat/react-migration`

## Стек

- React 19 + Vite 8 (`@vitejs/plugin-react`)
- `@supabase/supabase-js` v2 (Auth + таблицы `profiles` / `bookings`)
- Чистый CSS (`src/index.css`, портирован 1-в-1 из legacy)
- Шрифты: Fraunces + Manrope (Google Fonts, `index.html`)

## Быстрый старт

```powershell
cd "D:\1WORK\AI\063"
npm install
npm run dev      # http://localhost:5173
npm run build    # прод-сборка в dist/
npm run preview  # проверка сборки
```

Node.js LTS (проверено на Node 25 + npm 11).

## Структура

```
index.html                  # точка входа Vite, <div id="root">
vite.config.js              # плагин @vitejs/plugin-react
src/main.jsx                # ReactDOM.createRoot + StrictMode
src/App.jsx                 # AuthProvider + Navbar / Hero / MenuSection / Story / BookingForm / Footer / AuthModal / Toast
src/index.css               # все стили лендинга
src/data/menu.js            # MOLOT_MENU + MENU_CATS (порт legacy/js/menu-data.js)
src/lib/supabase.js         # SUPABASE_URL / SUPABASE_ANON_KEY из .env.local (VITE_*)
src/lib/auth.js             # Supabase (облако) + localStorage-fallback, ключи molot_users_v2 / molot_session_v2 / molot_bookings_v2
src/context/AuthContext.jsx # ready / mode / user / toast, boot + onAuthStateChange, обработка OAuth-ошибок из URL
src/components/
  Navbar.jsx                # шапка, кнопка «Войти/Профиль», CTA «Забронировать»
  Hero.jsx                  # первый экран
  MenuSection.jsx           # табы Кофе / Чай / Десерты / Завтраки
  Story.jsx                 # блок «История»
  BookingForm.jsx           # форма брони (гость без входа тоже может), сохраняет в Supabase/local
  Footer.jsx                # контакты, вход в кабинет
  AuthModal.jsx             # табы Регистрация / Вход / Сброс; Google OAuth; локальный сброс пароля
  Toast.jsx                 # уведомления из AuthContext
legacy/                     # старый ванильный HTML/CSS/JS (только для сверки, не используется сборкой)
supabase-schema.sql         # SQL для Supabase Dashboard → SQL Editor
.env.example                # образец переменных окружения
```

## Переменные окружения / Supabase

1. Выполните `supabase-schema.sql` в Supabase Dashboard → SQL Editor
   (таблицы `profiles`, `bookings`, RLS-политики, триггер `handle_new_user`).
2. Скопируйте `.env.example` в `.env.local` и вставьте `anon key`:

```powershell
Copy-Item .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://xpcatojxhxjmfoeayymw.supabase.co
VITE_SUPABASE_ANON_KEY=PASTE_ANON_KEY_HERE
```

3. Включите Email (и Google при желании) в Authentication → Providers.
4. Настройте Redirect URL (`http://localhost:5173` для dev) в Authentication → URL Configuration.

Без ключей приложение работает в режиме `local`: пользователи и брони хранятся
в `localStorage`, вход через Google показывает подсказку про `needCloud`.

## Возможности

- Меню с категориями и reveal-анимацией (`IntersectionObserver` в `App.jsx`).
- Бронирование столика: имя / телефон / дата / время / гости / зона; гостевое бронирование без входа.
- Auth: регистрация, вход, сброс пароля (email через Supabase / локальный через `setNewPasswordLocal`), Google OAuth, обновление профиля (имя, телефон → `auth.user_metadata` + `profiles`).
- Кабинет: список своих броней (`myBookings`, до 20, сортировка по `created_at`), выход.
- Валидация и русские тексты ошибок — словарь `RU` в `src/lib/auth.js` (коды `T0–T10`).
- Тосты 3.8 c, закрытие модалки по Esc / клику по оверлею.

## Скрипты

| Команда | Назначение |
|---|---|
| `npm run dev` | dev-сервер Vite |
| `npm run build` | прод-сборка в `dist/` |
| `npm run preview` | предпросмотр `dist/` |

## Legacy

Каталог `legacy/` — архив ванильной версии (`index.html`, `css/style.css`, `js/*`).
Vite его не собирает; оставлен для сверки стилей и логики (`auth-supabase.js` → `src/lib/auth.js`, `menu-data.js` → `src/data/menu.js`, `script.js` → reveal в `App.jsx`).

## Контакты (демо)

См. подвал лендинга: 12-я линия, д. 2 и +7 (495) 120-14-14, hello@molot.coffee.
