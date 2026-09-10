/* Molot Coffee — ленивая модалка личного кабинета. Вставляется при первом открытии. */
(() => {
  'use strict';
  const TEMPLATE = `
  <div class="mbackdrop" data-close-modal></div>
  <div class="mcard">
    <div class="mhead">
      <h3>МОЛОТ · личный кабинет</h3>
      <button class="mclose-x" data-close-modal aria-label="Закрыть">×</button>
    </div>
    <div class="mtabbar" id="authTabs">
      <button class="mtab active" data-mtab="login" type="button">Вход</button>
      <button class="mtab" data-mtab="register" type="button">Регистрация</button>
    </div>
    <div class="mbody">
      <form class="panel-form" id="loginPanel" novalidate>
        <div class="field"><label for="lEmail">Email</label><input type="email" id="lEmail" placeholder="you@mail.ru" autocomplete="email"></div>
        <div class="field"><label for="lPass">Пароль</label>
          <div class="pass-wrap"><input type="password" id="lPass" placeholder="••••••••" autocomplete="current-password"><button type="button" class="pass-eye" id="lToggle" aria-label="Показать пароль">👁</button></div>
        </div>
        <button type="submit" class="btn btn-accent btn-block">Войти</button>
        <button type="button" class="btn btn-ghost btn-block" id="googleBtn">Войти через Google</button>
        <div class="switch-line"><button type="button" data-switch="forgot">Забыли пароль?</button></div>
        <div class="switch-line">Нет аккаунта? <button type="button" data-switch="register">Зарегистрироваться</button></div>
      </form>
      <form class="panel-form hide" id="registerPanel" novalidate>
        <div class="form-row">
          <div class="field"><label for="rName">Имя <i>*</i></label><input type="text" id="rName" placeholder="Иван" autocomplete="name" required></div>
          <div class="field"><label for="rEmail">E-mail <i>*</i></label><input type="email" id="rEmail" placeholder="you@mail.ru" autocomplete="email" required></div>
        </div>
        <div class="form-row">
          <div class="field"><label for="rPass">Пароль <i>*</i></label>
            <div class="pass-wrap"><input type="password" id="rPass" placeholder="Минимум 6 символов" autocomplete="new-password" required><button type="button" class="pass-eye" id="rToggle" aria-label="Показать пароль">👁</button></div>
            <div class="pass-meter" id="passMeter"><i></i><i></i><i></i><i></i></div>
          </div>
          <div class="field"><label for="rPhone">Телефон</label><input type="tel" id="rPhone" placeholder="+7 (___) ___-__-__" autocomplete="tel"></div>
        </div>
        <label class="agree"><input type="checkbox" id="rAgree" required> <span>Согласен с <a href="#">условиями</a> и обработкой данных</span></label>
        <button type="submit" class="btn btn-accent btn-block">Создать аккаунт</button>
        <div class="switch-line">Уже есть аккаунт? <button type="button" data-switch="login">Войти</button></div>
      </form>
      <form class="panel-form hide" id="forgotPanel" novalidate>
        <h4 class="mini-title">Восстановление пароля</h4>
        <p class="mini-sub">В облачном режиме пришлём письмо.</p>
        <div class="field"><label for="fEmail">E-mail</label><input type="email" id="fEmail" placeholder="you@mail.ru" autocomplete="email"></div>
        <div class="field"><label for="fNew">Новый пароль (для режима «этот браузер»)</label><input type="password" id="fNew" placeholder="Минимум 6 символов" autocomplete="new-password"></div>
        <button type="submit" class="btn btn-accent btn-block">Восстановить</button>
        <div class="switch-line"><button type="button" data-switch="login">← Назад ко входу</button></div>
      </form>
      <div class="panel-form hide" id="cabinetPanel">
        <div class="cab-head"><div class="cab-avatar" id="cAvatar">М</div>
          <div><div class="cab-name" id="cName">Гость</div><div class="cab-email" id="cEmail">—</div>
          <div class="cab-mode" id="authMode">💾 этот браузер</div></div>
        </div>
        <div class="field"><label for="cNameEdit">Имя</label><input type="text" id="cNameEdit"></div>
        <div class="field"><label for="cPhone">Телефон</label><input type="tel" id="cPhone" placeholder="+7 (___) ___-__-__"></div>
        <button type="button" class="btn btn-accent btn-block" data-save-profile>Сохранить профиль</button>
        <h4 class="mini-title cabinet-bookings-title">Мои брони</h4>
        <div class="bk-list" id="cabBookings">Пока нет броней.</div>
        <button type="button" class="btn btn-ghost btn-block" data-logout>Выйти</button>
      </div>
    </div>
  </div>`;
  window.MolotAuthModalTemplate = TEMPLATE;
})();
