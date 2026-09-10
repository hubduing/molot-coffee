// ── МОЛОТ·КОФЕ — Firebase config ─────────────────────────────
// 1. Создай проект: https://console.firebase.google.com
// 2. Включи Authentication → Email/Password (+ Google при желании)
// 3. Создай Firestore Database (production, правила ниже)
// 4. Project settings → Your apps → Web → скопируй config сюда
//
// Правила Firestore (Rules):
//   rules_version = '2';
//   service cloud.firestore {
//     match /databases/{db}/documents {
//       match /users/{uid} {
//         allow read, write: if request.auth != null && request.auth.uid == uid;
//       }
//       match /bookings/{doc} {
//         allow create: if true;
//         allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.uid;
//       }
//     }
//   }
//
// 5. Authentication → Settings → Authorized domains → добавь
//    <твой-логин>.github.io
window.MOLOT_FIREBASE_CONFIG = null;

// Пример (заполни своими данными и убери null выше):
// window.MOLOT_FIREBASE_CONFIG = {
//   apiKey: "AIza…",
//   authDomain: "molot-coffee.firebaseapp.com",
//   projectId: "molot-coffee",
//   appId: "1:123:web:abc"
// };
