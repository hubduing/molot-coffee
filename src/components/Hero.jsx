export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap">
        <div className="hero-grid">
          <div>
            <span className="eyebrow">Спешалти кофейня · с 2014</span>
            <h1>Кофе,<br />обжаренный <em>с душой</em></h1>
            <p className="lead">Моно-сорта из Эфиопии, Колумбии и Кении, обжарка малыми партиями каждые 48 часов и десерты, которые пекут утром до открытия.</p>
            <div className="hero-cta">
              <a href="#menu" className="btn btn-accent">Смотреть меню <span className="arr">→</span></a>
              <a href="#book" className="btn btn-ghost">Забронировать</a>
            </div>
            <div className="hero-stats">
              <div className="stat"><b>27</b><span>сортов зерна</span></div>
              <div className="stat"><b>48ч</b><span>срок свежести</span></div>
              <div className="stat"><b>9.4</b><span>рейтинг гостей</span></div>
            </div>
          </div>
          <div className="hero-art">
            <div className="ring" /><div className="ring2" />
            <div className="orbit"><span /></div>
            <div className="cup">
              <div className="steam"><i /><i /><i /></div>
            </div>
            <div className="chip chip-tl">🌡 <b>94°</b>&nbsp;вода</div>
            <div className="chip chip-br">⚖ <b>18&nbsp;г</b>&nbsp;на порцию</div>
          </div>
        </div>
      </div>
      <div className="scroll-hint">Листайте вниз</div>
    </section>
  );
}
