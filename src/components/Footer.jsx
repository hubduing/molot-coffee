export default function Footer({ onOpenModal }) {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <a href="#top" className="logo footer-logo"><span className="mark">М</span>МОЛОТ<b>·</b>КОФЕ</a>
            <p className="footer-about" style={{ marginTop: 16, maxWidth: '32ch' }}>Локальная спешалти-обжарка и кофейня в самом сердце города. Варим, печём и живём со вкусом с 2014 года.</p>
          </div>
          <div><h5>Меню</h5>
            <ul><li><a href="#menu">Кофе</a></li><li><a href="#menu">Чай</a></li><li><a href="#menu">Десерты</a></li><li><a href="#menu">Завтраки</a></li></ul>
          </div>
          <div><h5>Гостям</h5>
            <ul><li><a href="#book">Бронь столика</a></li><li><a href="#" onClick={(e) => { e.preventDefault(); onOpenModal(); }}>Регистрация</a></li><li><a href="#story">Наша история</a></li><li><a href="#">Доставка</a></li></ul>
          </div>
          <div><h5>Контакты</h5>
            <p>ул. Прожжарная, 12с2</p>
            <p className="contact-line" style={{ marginTop: 8 }}>+7 (495) 120-14-14</p>
            <p className="contact-line" style={{ marginTop: 8 }}>hello@molot.coffee</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 МОЛОТ·КОФЕ. Все права защищены.</span>
          <span>Сделано с ♥ и лишней чашкой эспрессо</span>
        </div>
      </div>
    </footer>
  );
}
