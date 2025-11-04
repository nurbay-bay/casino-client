import { useParams } from "react-router-dom";
import SlotGame from "../features/games/SlotGame";
import PlinkoGame from "../features/games/PlinkoGame";
import s from "./GamePage.module.scss";

export default function GamePage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className={s.wrapper}>
      {id === "slots" && <SlotGame />}
      {id === "plinko" && <PlinkoGame />}
    </div>
  );
}
