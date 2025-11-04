import { Link } from "react-router-dom";
import s from "./HomePage.module.scss";

export default function HomePage() {
  return (
    <div className={s.wrapper}>
      <h1>🎮 Выберите игру</h1>
      <div className={s.games}>
        <Link to="/game/slots" className={s.card}>🎰 Слоты</Link>
        <Link to="/game/plinko" className={s.card}>🟢 Плинко</Link>
      </div>
    </div>
  );
}
