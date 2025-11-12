import { useEffect, useRef, useState } from "react";
import { Engine, Render, World, Bodies, Body, Runner } from "matter-js";
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
    engine.gravity.y = 0.5;
    engine.gravity.x = 0;
    engineRef.current = engine;

    const width = 400;
    const height = 500;

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

    // === Стенки ===
    const walls = [
      Bodies.rectangle(width / 2, height, width, 20, { 
        isStatic: true,
        render: { fillStyle: "#333" },
        label: "bottom"
      }), // дно
      Bodies.rectangle(0, height / 2, 10, height, { 
        isStatic: true,
        render: { fillStyle: "#333" }
      }), // левая
      Bodies.rectangle(width, height / 2, 10, height, { 
        isStatic: true,
        render: { fillStyle: "#333" }
      }), // правая
    ];
    World.add(engine.world, walls);

    // === Пирамида пинов ===
    const pins = [];
    const rows = 10;
    const pinRadius = 4;
    const verticalSpacing = 35;
    const horizontalSpacing = 43;

    for (let row = 1; row < rows; row++) {
      const pinsInRow = row + 1;
      const startY = 80 + row * verticalSpacing;
      
      const totalWidth = (pinsInRow - 1) * horizontalSpacing;
      const startX = (width - totalWidth) / 2;

      for (let col = 0; col < pinsInRow; col++) {
        const x = startX + col * horizontalSpacing;
        pins.push(
          Bodies.circle(x, startY, pinRadius, {
            isStatic: true,
            render: { 
              fillStyle: "#666",
              strokeStyle: "#888",
              lineWidth: 1
            },
            friction: 0.1,
            restitution: 0.6
          })
        );
      }
    }
    World.add(engine.world, pins);

    // === Только боковые перегородки для ячеек (оставляем проходы) ===
    const bins = 8; // 8 ячеек
    const binWidth = width / bins;
    
    // Создаем только боковые стенки ячеек, без верхних перекрытий
    for (let i = 0; i <= bins; i++) {
      const wall = Bodies.rectangle(binWidth * i, height - 10, 2, 20, {
        isStatic: true,
        render: { fillStyle: "#444" },
        friction: 0,
        restitution: 0.1,
        label: `bin_wall_${i}`
      });
      World.add(engine.world, wall);
    }

    // === Зоны для определения, в какую ячейку упал шар ===
    const binZones = [];
    for (let i = 0; i < bins; i++) {
      const zone = Bodies.rectangle(
        binWidth * i + binWidth / 2, 
        height - 5, 
        binWidth - 4, 
        10, 
        {
          isStatic: true,
          isSensor: true, // Важно: сенсор не имеет физического тела
          render: { 
            fillStyle: i % 2 === 0 ? "rgba(255,0,0,0.2)" : "rgba(0,255,0,0.2)" 
          },
          label: `bin_${i}`
        }
      );
      binZones.push(zone);
    }
    World.add(engine.world, binZones);

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

    // Создаем шар
    const startX = width / 2 + (Math.random() * 10 + 45);
    const ball = Bodies.circle(startX, 90, 5, {
      restitution: 0.4,
      friction: 0.005,
      frictionAir: 0.03,
      density: 0.008,
      render: { 
        fillStyle: "#00ff88",
        strokeStyle: "#00cc66",
        lineWidth: 1
      },
      label: "ball"
    });

    World.add(engine.world, ball);

    // Случайный толчок
    // const impulseX = (Math.random() - 0.5) * 0.008;
    Body.applyForce(ball, ball.position, { x: 0, y: 0 });

    // Ждем, пока шар упадет вниз
    await new Promise<void>((resolve) => {
      const check = () => {
        if (ball.position.y > 480) { // Когда шар достиг дна
          World.remove(engine.world, ball);
          resolve();
        } else {
          requestAnimationFrame(check);
        }
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

      {/* Подсказка о ячейках */}
      <div className={s.info}>
        <p>Шар падает через пины в одну из {8} ячеек внизу</p>
        <p>Разные ячейки = разные множители!</p>
      </div>
    </div>
  );
}