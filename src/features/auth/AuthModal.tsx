import { useState } from "react";
import { useAppSelector } from "../../shared/hooks/reduxHooks";
import RegisterForm from "./RegisterForm";
import VerifyCodeForm from "./VerifyCodeForm";
import LoginForm from "./LoginForm";
import s from "./AuthModal.module.scss";

type Mode = "login" | "register" | "verify";

interface Props {
  onClose: () => void;
}

export default function AuthModal({ onClose }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [phone, setPhone] = useState("");
  const { user } = useAppSelector((s) => s.auth);

  // если вошёл — закрываем модалку
  if (user) return null;

  return (
    <div className={s.modal}>
      <div className={s.box}>
        {mode === "login" && <LoginForm onSwitch={() => setMode("register")} />}
        {mode === "register" && (
          <RegisterForm onNext={(p) => { setPhone(p); setMode("verify"); }} onSwitch={() => setMode("login")} />
        )}
        {mode === "verify" && <VerifyCodeForm phone={phone} onDone={() => setMode("login")} />}
        <button className={s.close} onClick={onClose}>×</button>
      </div>
    </div>
  );
}
