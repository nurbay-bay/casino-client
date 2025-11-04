import type { PlayResponse } from "../../shared/types/types";
import s from "./GameResult.module.scss";

export default function GameResult({ data }: { data: PlayResponse }) {
  return (
    <div className={s.result}>
      <p>Результат: {data.result === "win" ? "Победа 🎉" : "Проигрыш 😢"}</p>
      <p>Выигрыш: {data.amountWon} ₽</p>
      <p>Баланс: {data.newBalance} ₽</p>
    </div>
  );
}
