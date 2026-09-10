export default function Story() {
  return (
    <section id="story">
      <div className="wrap">
        <div className="story-grid">
          <div className="story-photo reveal">
            <div className="sframe" />
            <div className="sface">
              <cite>«Мы обжариваем только то, что пьём сами»</cite>
              <span>— Олег Молот, основатель</span>
            </div>
          </div>
          <div className="story-txt reveal">
            <span className="sec-num">02 · Наша история</span>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(2rem,4vw,3rem)', lineHeight: 1.02, marginBottom: 24 }}>
              Философия <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>зерна</em>
            </h2>
            <p><span className="drop">В</span> 2014 году мы купили первую рожковую кофеварку и начали обжаривать зерно на балконе. Сегодня малая обжарка каждые <b>48 часов</b> остаётся нашим главным ритуалом.</p>
            <p>Мы ездим к фермерам в Эфиопию и Колумбию, платим за спелую ягоду и возвращаем часть выручки в кооперативы. <b>Свежесть здесь — закон</b>, а не маркетинг.</p>
            <div className="story-cols">
              <div className="cell"><b>10 лет</b><span>напитка</span></div>
              <div className="cell"><b>7 стран</b><span>происхождения</span></div>
              <div className="cell"><b>4 сорта</b><span>декафа</span></div>
              <div className="cell"><b>100%</b><span>прямые закупки</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
