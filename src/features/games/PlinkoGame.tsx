import { useEffect, useRef, useState } from "react";
import { Engine, Render, World, Bodies, Body, Runner, Events } from "matter-js";
import { useAppDispatch, useAppSelector } from "../../shared/hooks/reduxHooks";
import { playGame } from "../../store/slices/gameSlice";
import GameResult from "./GameResult";
import s from "./PlinkoGame.module.scss";

export default function PlinkoGame() {
  const dispatch = useAppDispatch();
  const { loading, lastResult } = useAppSelector((s) => s.game);
  const [bet, setBet] = useState(100);
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const runnerRef = useRef<Runner | null>(null);
  const [ballActive, setBallActive] = useState(false);
  const [highlightBin, setHighlightBin] = useState<number | null>(null);

  const [multipliers, setMultipliers] = useState<number[]>([5, 2, 1.2, 0.8, 0.5, 0.8, 1.2, 2, 5]);
  const binWidthRef = useRef<number>(0);

  const [ pathServ, setPathServ] = useState<number[]>([])

  useEffect(() => {
    const engine = Engine.create();
    engine.gravity.y = 0.5;
    engineRef.current = engine;

    const width = 410;
    const height = 450;

    const render = Render.create({
      element: sceneRef.current!,
      engine,
      options: { width, height, wireframes: false, background: "#121212" },
    });

    // === Стенки ===
    const walls = [
      Bodies.rectangle(width / 2, height, width, 20, { isStatic: true }),
      Bodies.rectangle(0, height / 2, 10, height, { isStatic: true }),
      Bodies.rectangle(width, height / 2, 10, height, { isStatic: true }),
    ];
    World.add(engine.world, walls);

    // === Пины ===
    const pins = [];
    const rows = 10;
    const pinRadius = 4;
    const vSpacing = 35;
    const hSpacing = 43;

    for (let row = 0; row < rows; row++) {
      const pinsInRow = row + 1;
      const y = 80 + row * vSpacing;
      const totalWidth = (pinsInRow - 1) * hSpacing;
      const startX = (width - totalWidth) / 2;

      for (let col = 0; col < pinsInRow; col++) {
        const x = startX + col * hSpacing;
        pins.push(
          Bodies.circle(x, y, pinRadius, { isStatic: true, render: { fillStyle: "#666" } })
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
        render: { fillStyle: "#333" },
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
        { isStatic: true, isSensor: true, label: `zone_${i}` }
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
    setBallActive(true);
    setHighlightBin(null);

    // 1️⃣ Запрос к серверу
    const res = await dispatch(playGame({ game: "plinko", bet })).unwrap();

    // 2️⃣ Берём реальные множители (если API возвращает массив)
    // По умолчанию используются статичные множители из состояния
    if (res.details?.multipliers && Array.isArray(res.details.multipliers)) {
      setMultipliers(res.details.multipliers);
    }

    const path: number[] = res.details.path || [];
    setPathServ(path)
    console.log("path:", path);

    // 3️⃣ Создаём шарик
    const engine = engineRef.current!;
    const width = 410;
    const ball = Bodies.circle(width / 2, 35, 9, {
      restitution: 0.4,
      friction: 0.01,
      frictionAir: 0.025,
      density: 0.02,
      render: { fillStyle: "#00ff88" },
      label: "ball",
    });
    World.add(engine.world, ball);

    // 4️⃣ Анимация по рядам с плавной коррекцией
    let step = 0;
    const stepY = 35;
    let nextY = stepY;

    Events.on(engine, "beforeUpdate", () => {
      if (ball.position.y > nextY && step < path.length) {
        const direction = path[step];
        const forceX = direction === 1 ? 0.01 : -0.01;
        Body.applyForce(ball, ball.position, { x: forceX, y: 0 });
        step++;
        nextY += stepY;
      }
    });

    // Ждём падения до дна
    await new Promise<void>((resolve) => {
      const check = () => {
        if (ball.position.y > 430) {
          World.remove(engine.world, ball);
          resolve();
        } else requestAnimationFrame(check);
      };
      check();
    });

    setBallActive(false);
  };

  return (
    <div className={s.wrapper}>
      <h2>🟢 Плинко</h2>
      <div ref={sceneRef} className={s.canvas}></div>

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
        <input
          type="number"
          min={10}
          value={bet}
          onChange={(e) => setBet(Number(e.target.value))}
        />
        <button onClick={handlePlay} disabled={loading || ballActive}>
          {loading || ballActive ? "Падает..." : "Играть"}
        </button>
      </div>

      {lastResult && lastResult.game === "plinko" && (
        <GameResult data={lastResult} />
      )}
      <p>{pathServ}</p>
    </div>
  );
}
