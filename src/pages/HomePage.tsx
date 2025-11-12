import s from "./HomePage.module.scss";

export default function HomePage() {
  return (
    <div className={s.wrapper}>
      <div className={s.hero}>
        <div className={s.group}>
          <h1>LUDOMAN</h1>
          <div className={s.ageBadge}>18+</div>
        </div>
        <p className={s.tagline}>
          Развлечения с умом.<br />
          <strong>Играйте ответственно.</strong>
        </p>
        
      </div>
      <section className={s.infoBlock}>
        <h2>Лудомания — это болезнь</h2>
        <p>
          Игровая зависимость признана ВОЗ психическим расстройством.
          В Казахстане <strong>около 2.5% игроков</strong> имеют признаки зависимости.
        </p>
        <div className={s.stats}>
          <div><strong>70%</strong> зависимых — мужчины 18–35 лет</div>
          <div><strong>40%</strong> скрывают проблему от семьи</div>
        </div>
      </section>
      <section className={s.rules}>
        <h2>Играйте безопасно</h2>
        <ul className={s.rulesList}>
          <li>Устанавливайте лимит времени и денег</li>
          <li>Не играйте в долг или на последние деньги</li>
          <li>Делайте перерывы — не более 1 часа подряд</li>
          <li>Не пытайтесь "отыграться"</li>
          <li>Игра — развлечение, а не способ заработка</li>
        </ul>
      </section>
      <section className={s.help}>
        <h2>Нужна помощь?</h2>
        <div className={s.helpCards}>
          <div className={s.helpCard}>
            <strong>Горячая линия (Казахстан)</strong>
            <p className={s.phone}>8-800-080-55-66</p>
            <small>Круглосуточно, анонимно</small>
          </div>
          <div className={s.helpCard}>
            <strong>Центр психического здоровья</strong>
            <p>Алматы, ул. Абая, 15</p>
            <a href="tel:+77271234567">+7 (727) 123-45-67</a>
          </div>
        </div>
        <a href="https://beGambleAware.org" target="_blank" className={s.link}>
          Международная помощь → beGambleAware
        </a>
      </section>
    </div>
  );
}
