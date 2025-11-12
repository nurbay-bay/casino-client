import s from "./Footer.module.scss";

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.container}>
        <div className={s.left}>
          <p className={s.age}>18+</p>
          <p className={s.license}>Лицензия № 123/456 от 01.01.2025</p>
        </div>

        <div className={s.right}>
          <a
            href="https://github.com/yourname/udoman-client"
            target="_blank"
            rel="noopener noreferrer"
            className={s.githubLink}
          >
            Клиент (React)
          </a>
          <a
            href="https://github.com/yourname/udoman-server"
            target="_blank"
            rel="noopener noreferrer"
            className={s.githubLink}
          >
            Сервер (Node.js)
          </a>
        </div>
      </div>

      <div className={s.bottom}>
        <p>
          <a href="/responsible-gaming" className={s.link}>
            Ответственная игра
          </a>{" "}
          •{" "}
          <a href="/terms" className={s.link}>
            Условия использования
          </a>{" "}
          •{" "}
          <a href="/privacy" className={s.link}>
            Политика конфиденциальности
          </a>
        </p>
      </div>
    </footer>
  );
}