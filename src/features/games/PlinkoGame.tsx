import { useEffect, useRef, useState } from "react";
import { Engine, Render, World, Bodies, Body, Runner, Events } from "matter-js";
import { useAppDispatch, useAppSelector } from "../../shared/hooks/reduxHooks";
import { playGame } from "../../store/slices/gameSlice";
import GameResult from "./GameResult";
import s from "./PlinkoGame.module.scss";

import AuthModal from "../auth/AuthModal";
import PaymentModal from "../payments/PaymentModal";

export default function PlinkoGame() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { loading, lastResult } = useAppSelector((s) => s.game);
  
  const [bet, setBet] = useState(100);
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const runnerRef = useRef<Runner | null>(null);
  const [ballActive, setBallActive] = useState(false);
  const [highlightBin, setHighlightBin] = useState<number | null>(null);

  const [multipliers, setMultipliers] = useState<number[]>([5, 2, 1.2, 0.8, 0.5, 0.8, 1.2, 2, 5]);
  const binWidthRef = useRef<number>(0);


  const [authOpen, setAuthOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const engine = Engine.create();
    engine.gravity.y = 0.5;
    engineRef.current = engine;

    const width = 380;
    const height = 400;

    const render = Render.create({
      element: sceneRef.current!,
      engine,
      options: { 
        width, 
        height, 
        wireframes: false, 
        background: "transparent",
        pixelRatio: 1 // Улучшаем производительность
      },
    });

    // === Стенки ===
    const walls = [
      Bodies.rectangle(width / 2, height, width, 20, { 
        isStatic: true,
        render: { fillStyle: "#2d4059" }
      }),
      Bodies.rectangle(0, height / 2, 10, height, { 
        isStatic: true,
        render: { fillStyle: "#2d4059" }
      }),
      Bodies.rectangle(width, height / 2, 10, height, { 
        isStatic: true,
        render: { fillStyle: "#2d4059" }
      }),
    ];
    World.add(engine.world, walls);

    // === Пины ===
    const pins = [];
    const rows = 10;
    const pinRadius = 4;
    const vSpacing = 32;
    const hSpacing = 40;

    for (let row = 0; row < rows; row++) {
      const pinsInRow = row + 1;
      const y = 70 + row * vSpacing;
      const totalWidth = (pinsInRow - 1) * hSpacing;
      const startX = (width - totalWidth) / 2;

      for (let col = 0; col < pinsInRow; col++) {
        const x = startX + col * hSpacing;
        pins.push(
          Bodies.circle(x, y, pinRadius, { 
            isStatic: true, 
            render: { 
              fillStyle: "#667eea",
              strokeStyle: "#fff",
              lineWidth: 1
            } 
          })
        );
      }
    }
    World.add(engine.world, pins);

    // === Перегородки ячеек ===
    const bins = multipliers.length;
    const binWidth = width / bins;
    binWidthRef.current = binWidth;
    for (let i = 0; i <= bins; i++) {
      const wall = Bodies.rectangle(binWidth * i, height - 10, 2, 20, {
        isStatic: true,
        render: { fillStyle: "#1a1a2e" },
      });
      World.add(engine.world, wall);
    }

    // === Сенсорные зоны ===
    const zones: Body[] = [];
    for (let i = 0; i < bins; i++) {
      const zone = Bodies.rectangle(
        binWidth * i + binWidth / 2,
        height - 20,
        binWidth - 4,
        10,
        { 
          isStatic: true, 
          isSensor: true, 
          label: `zone_${i}`,
          render: { fillStyle: "transparent" }
        }
      );
      zones.push(zone);
    }
    World.add(engine.world, zones);

    const runner = Runner.create();
    runnerRef.current = runner;
    Render.run(render);
    Runner.run(runner, engine);

    // Подсветка ячейки при касании
    Events.on(engine, "collisionStart", (e) => {
      e.pairs.forEach((p) => {
        const zone = zones.find((z) => z === p.bodyA || z === p.bodyB);
        const ball = [p.bodyA, p.bodyB].find((b) => b.label === "ball");
        if (zone && ball) {
          const index = zones.indexOf(zone);
          setHighlightBin(index);
        }
      });
    });

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
      render.canvas.remove();
    };
  }, []);

  const handlePlay = async () => {
    if (ballActive) return;

    // Проверка авторизации
    if (!user) {
      setAuthOpen(true);
      return;
    }

    // Проверка баланса
    if (user.balance < bet) {
      setPayOpen(true);
      return;
    }

    setBallActive(true);
    setHighlightBin(null);

    // 1️⃣ Запрос к серверу
    const res = await dispatch(playGame({ game: "plinko", bet })).unwrap();

    // 2️⃣ Берём реальные множители
    if (res.details?.multipliers && Array.isArray(res.details.multipliers)) {
      setMultipliers(res.details.multipliers);
    }

    const path: number[] = res.details.path || [];

    // 3️⃣ Создаём шарик
    const engine = engineRef.current!;
    const width = 380;
    const ball = Bodies.circle(width / 2, 30, 8, {
      restitution: 0.4,
      friction: 0.01,
      frictionAir: 0.025,
      density: 0.02,
      render: { 
        fillStyle: "#00ff88",
        strokeStyle: "#fff",
        lineWidth: 1
      },
      label: "ball",
    });
    World.add(engine.world, ball);

    // 4️⃣ Анимация по рядам с плавной коррекцией
    let step = 0;
    const stepY = 32;
    let nextY = stepY;

    const pathHandler = () => {
      if (ball.position.y > nextY && step < path.length) {
        const direction = path[step];
        const forceX = direction === 1 ? 0.01 : -0.01;
        Body.applyForce(ball, ball.position, { x: forceX, y: 0 });
        step++;
        nextY += stepY;
      }
    };

    Events.on(engine, "beforeUpdate", pathHandler);

    // Ждём падения до дна
    await new Promise<void>((resolve) => {
      const check = () => {
        if (ball.position.y > 380) {
          Events.off(engine, "beforeUpdate", pathHandler);
          World.remove(engine.world, ball);
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };
      check();
    });

    setBallActive(false);
  };

  return (
    <div className={s.wrapper}>
      <div className={s.header}>
        <h2>🟢 Плинко</h2>
        <button 
          className={s.helpBtn} 
          onClick={() => setHelpOpen(true)}
          aria-label="Показать справку"
        >
          ❓
        </button>
      </div>

      <div className={s.gameContainer}>
        <div className={s.canvasContainer}>
          <div ref={sceneRef} className={s.canvas}></div>
          <div className={s.glowEffect}></div>
        </div>

        {/* Множители под ячейками */}
        <div className={s.multipliers}>
          {multipliers.map((m, i) => (
            <div
              key={i}
              className={`${s.mult} ${highlightBin === i ? s.active : ""}`}
            >
              x{m}
            </div>
          ))}
        </div>

        <div className={s.controls}>
          <div className={s.betControl}>
            <label>Ставка</label>
            <div className={s.betInputWrapper}>
              <button 
                className={s.betAdjust} 
                onClick={() => setBet(prev => Math.max(10, prev - 10))}
                disabled={ballActive}
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
                disabled={ballActive}
              />
              <button 
                className={s.betAdjust}
                onClick={() => setBet(prev => prev + 10)}
                disabled={ballActive}
              >
                +
              </button>
            </div>
          </div>

          <button 
            className={`${s.playButton} ${ballActive ? s.ballActive : ''}`}
            onClick={handlePlay} 
            disabled={loading || ballActive}
          >
            <span className={s.buttonContent}>
              {ballActive ? (
                <>
                  <span className={s.spinner}></span>
                  Падает...
                </>
              ) : (
                "🟢 Играть"
              )}
            </span>
          </button>
        </div>
      </div>

      {lastResult && lastResult.game === "plinko" && (
        <GameResult data={lastResult} />
      )}

      {/* Модалка помощи */}
      {helpOpen && (
        <div className={s.modalOverlay} onClick={() => setHelpOpen(false)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3>🟢 Правила Плинко</h3>
              <button 
                className={s.modalClose} 
                onClick={() => setHelpOpen(false)}
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>
            
            <div className={s.helpContent}>
              <div className={s.helpSection}>
                <h4>Как играть:</h4>
                <p>Шарик падает через пины в одну из ячеек. Множитель зависит от конечной позиции.</p>
              </div>
              
              <div className={s.helpSection}>
                <h4>Множители:</h4>
                <div className={s.multipliersTable}>
                  {multipliers.map((mult, index) => (
                    <div key={index} className={s.multRow}>
                      <span>Ячейка {index + 1}</span>
                      <span className={s.multValue}>×{mult}</span>
                    </div>
                  ))}
                </div>
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