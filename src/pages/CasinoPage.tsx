import { Link } from "react-router-dom";
import s from "./CasinoPage.module.scss";
import slotsImg from "../assets/images/games/slots.png"
import plinkoImg from "../assets/images/games/plinko.png"
import fortuneImg from "../assets/images/games/fortune.png"
import blackjackImg from "../assets/images/games/blackjack.png"

export default function CasinoPage() {
  return (
    <div className={s.wrapper}>
      <h1>Выберите игру</h1>
      <div className={s.games}>
        <Link to="/game/slots" className={s.card}><img src={slotsImg} alt="slots" className={s.gamesImg}/></Link>
        <Link to="/game/plinko" className={s.card}><img src={plinkoImg} alt="plinko" className={s.gamesImg}/></Link>
        <div className={s.card}><img src={fortuneImg} alt="fortune" className={s.gamesImg}/></div>
        <div className={s.card}><img src={blackjackImg} alt="blackjack" className={s.gamesImg}/></div>
      </div>
    </div>
  );
}
