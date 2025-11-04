import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../shared/hooks/reduxHooks";
import { playGame } from "../../store/slices/gameSlice";

import GameResult from "./GameResult";
import s from "./SlotGame.module.scss";

const symbols = ["🍒", "🍋", "⭐", "7️⃣", "💎"];

export default function SlotGame() {
  const dispatch = useAppDispatch();
  const { loading, lastResult } = useAppSelector((s) => s.game);
  const [bet, setBet] = useState(100);
  const [spin, setSpin] = useState<string[]>(["🍒", "🍋", "⭐"]);
  const [spinning, setSpinning] = useState(false);

  const handlePlay = async () => {
    if (spinning) return;
    setSpinning(true);

    // Анимация вращения
    const interval = setInterval(() => {
      setSpin([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ]);
    }, 100);

    setTimeout(async () => {
      clearInterval(interval);
      await dispatch(playGame({ game: "slots", bet }));
      setSpinning(false);
    }, 1500);
  };

  useEffect(() => {
    if (lastResult && lastResult.details?.symbols) {
      setSpin(lastResult.details.symbols);
    }
  }, [lastResult]);

  return (
    <div className={s.wrapper}>
      <h2>🎰 Слоты</h2>
      <div className={s.reels}>
        {spin.map((sym, i) => (
          <div key={i} className={`${s.cell} ${spinning ? s.spin : ""}`}>
            {sym}
          </div>
        ))}
      </div>

      <div className={s.controls}>
        <input
          type="number"
          min={10}
          value={bet}
          onChange={(e) => setBet(Number(e.target.value))}
        />
        <button onClick={handlePlay} disabled={loading || spinning}>
          {spinning ? "Крутим..." : "Играть"}
        </button>
      </div>

      {lastResult && lastResult.game === "slots" && <GameResult data={lastResult} />}
    </div>
  );
}
