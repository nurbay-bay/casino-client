import { useEffect, useRef, useState } from "react";
import Matter, { Engine, Render, World, Bodies, Body, Runner } from "matter-js";
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

  useEffect(() => {
    const engine = Engine.create();
    engine.gravity.y = 1.1;
    engineRef.current = engine;

    const width = 300;
    const height = 460;

    const render = Render.create({
      element: sceneRef.current!,
      engine,
      options: {
        width,
        height,
        wireframes: false,
        background: "#121212",
      },
    });

    // === Стенки и дно ===
    const walls = [
      Bodies.rectangle(width / 2, height, width, 20, { isStatic: true }), // дно
      Bodies.rectangle(0, height / 2, 10, height, { isStatic: true }), // левая
      Bodies.rectangle(width, height / 2, 10, height, { isStatic: true }), // правая
    ];
    World.add(engine.world, walls);

    // === Пины (препятствия) ===
    const pins = [];
    const rows = 8;
    for (let row = 0; row < rows; row++) {
      const y = 60 + row * 40;
      const cols = row + 5;
      for (let col = 0; col < cols; col++) {
        const offsetX = row % 2 === 0 ? 25 : 45;
        const x = offsetX + col * 40;
        if (x > 10 && x < width - 10) {
          pins.push(
            Bodies.circle(x, y, 4, {
              isStatic: true,
              render: { fillStyle: "#aaa" },
            })
          );
        }
      }
    }
    World.add(engine.world, pins);

    // === Вертикальные перегородки (ячейки внизу) ===
    const bins = 8;
    for (let i = 0; i <= bins; i++) {
      const wall = Bodies.rectangle((width / bins) * i, height - 40, 4, 80, {
        isStatic: true,
        render: { fillStyle: "#333" },
      });
      World.add(engine.world, wall);
    }

    const runner = Runner.create();
    runnerRef.current = runner;
    Render.run(render);
    Runner.run(runner, engine);

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);

  const handlePlay = async () => {
    if (ballActive) return;
    setBallActive(true);

    const engine = engineRef.current!;
    const width = 300;

    // 🎯 Меньший шар с рандомом
    const startX = width / 2 + (Math.random() * 80 - 40);
    const ball = Bodies.circle(startX, 10, 4.5, {
      restitution: 0.7, // прыгучесть
      friction: 0.005,
      density: 0.001,
      render: { fillStyle: "#00ff88" },
    });

    World.add(engine.world, ball);

    // Маленький толчок для разнообразия
    const impulseX = (Math.random() - 0.5) * 0.02;
    Body.applyForce(ball, ball.position, { x: impulseX, y: 0 });

    // Ждем, пока шар упадет вниз
    await new Promise<void>((resolve) => {
      const check = () => {
        if (ball.position.y > 440) {
          World.remove(engine.world, ball);
          resolve();
        } else requestAnimationFrame(check);
      };
      check();
    });

    setBallActive(false);
    await dispatch(playGame({ game: "plinko", bet }));
  };

  return (
    <div className={s.wrapper}>
      <h2>🟢 Плинко</h2>
      <div ref={sceneRef} className={s.canvas}></div>

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

      {lastResult && lastResult.game === "plinko" && <GameResult data={lastResult} />}
    </div>
  );
}
