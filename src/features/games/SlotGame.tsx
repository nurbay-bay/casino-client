import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../shared/hooks/reduxHooks";
import { playGame } from "../../store/slices/gameSlice";

import GameResult from "./GameResult";
import s from "./SlotGame.module.scss";

import AuthModal from "../auth/AuthModal";
import PaymentModal from "../payments/PaymentModal";

const symbols = ["🍒", "🍋", "⭐", "7️⃣", "💎"];

export default function SlotGame() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { loading, lastResult } = useAppSelector((s) => s.game);

  const [bet, setBet] = useState(100);
  const [spin, setSpin] = useState<string[]>(["🍒", "🍋", "⭐"]);
  const [spinning, setSpinning] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const handlePlay = async () => {
    if (spinning) return;

    if (!user) {
      setAuthOpen(true);
      return;
    }

    if (user.balance < bet) {
      setPayOpen(true);
      return;
    }

    setSpinning(true);

    const interval = setInterval(() => {
      setSpin([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ]);
    }, 80);

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
      <div className={s.header}>
        <h2>🎰 Слоты</h2>
        <button 
          className={s.helpBtn} 
          onClick={() => setHelpOpen(true)}
          aria-label="Показать справку"
        >
          ❓
        </button>
      </div>

      <div className={s.gameContainer}>
        <div className={s.reelsContainer}>
          <div className={s.reelsFrame}>
            {spin.map((sym, i) => (
              <div key={i} className={`${s.cell} ${spinning ? s.spin : ""}`}>
                {sym}
              </div>
            ))}
          </div>
        </div>

        <div className={s.controls}>
          <div className={s.betControl}>
            <label>Ставка</label>
            <div className={s.betInputWrapper}>
              <button 
                className={s.betAdjust} 
                onClick={() => setBet(prev => Math.max(10, prev - 10))}
                disabled={spinning}
              >
                -
              </button>
              <input
                type="number"
                min={10}
                step={10}
                value={bet}
                onChange={(e) => setBet(Number(e.target.value))}
                className={s.betInput}
                disabled={spinning}
              />
              <button 
                className={s.betAdjust}
                onClick={() => setBet(prev => prev + 10)}
                disabled={spinning}
              >
                +
              </button>
            </div>
          </div>

          <button 
            className={`${s.playButton} ${spinning ? s.spinning : ''}`}
            onClick={handlePlay} 
            disabled={loading || spinning}
          >
            <span className={s.buttonContent}>
              {spinning ? (
                <>
                  <span className={s.spinner}></span>
                  Крутим...
                </>
              ) : (
                "🎰 Играть"
              )}
            </span>
          </button>
        </div>
      </div>

      {lastResult && lastResult.game === "slots" && (
        <GameResult data={lastResult} />
      )}

      {helpOpen && (
        <div className={s.modalOverlay} onClick={() => setHelpOpen(false)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3>🎰 Таблица выигрышей</h3>
              <button 
                className={s.modalClose} 
                onClick={() => setHelpOpen(false)}
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>
            
            <div className={s.table}>
              <div className={s.prizeCategory}>
                <div className={s.categoryTitle}>
                  <span>3 одинаковых</span>
                </div>
                <ul className={s.prizeList}>
                  <li><span className={s.symbol}>7️⃣</span> ×10</li>
                  <li><span className={s.symbol}>💎</span> ×7</li>
                  <li><span className={s.symbol}>⭐</span> ×5</li>
                  <li><span className={s.symbol}>🍒</span>/<span className={s.symbol}>🍋</span> ×3</li>
                </ul>
              </div>

              <div className={s.prizeCategory}>
                <div className={s.categoryTitle}>
                  <span>2 одинаковых</span>
                </div>
                <ul className={s.prizeList}>
                  <li><span className={s.symbol}>7️⃣</span> ×3</li>
                  <li><span className={s.symbol}>💎</span> ×2</li>
                  <li>остальные ×1.5</li>
                </ul>
              </div>
            </div>

            <button className={s.closeBtn} onClick={() => setHelpOpen(false)}>
              Понятно
            </button>
          </div>
        </div>
      )}

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {payOpen && <PaymentModal onClose={() => setPayOpen(false)} />}
    </div>
  );
}