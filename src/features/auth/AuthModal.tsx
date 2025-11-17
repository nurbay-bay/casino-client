import { useState } from "react";
import { useAppSelector } from "../../shared/hooks/reduxHooks";
import RegisterForm from "./RegisterForm";
import VerifyCodeForm from "./VerifyCodeForm";
import LoginForm from "./LoginForm";
import s from "./AuthModal.module.scss";
import type { RegisterData } from "../../shared/types/types";

type Mode = "login" | "register" | "verify";

interface Props {
  onClose: () => void;
}

export default function AuthModal({ onClose }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [phone, setPhone] = useState("");
  const [registerData, setRegisterData] = useState<RegisterData | null>(null);
  const { user } = useAppSelector((s) => s.auth);

  // если вошёл — закрываем модалку
  if (user) return null;

  const handleRegisterNext = (phoneNumber: string, data: RegisterData) => {
    setPhone(phoneNumber);
    setRegisterData(data);
    setMode("verify");
  };

  return (
    <div className={s.modal}>
      <div className={s.box}>
        {mode === "login" && <LoginForm onSwitch={() => setMode("register")} />}
        {mode === "register" && (
          <RegisterForm 
            onNext={handleRegisterNext} 
            onSwitch={() => setMode("login")} 
          />
        )}
        {mode === "verify" && (
          <VerifyCodeForm 
            phone={phone} 
            registerData={registerData}
            onDone={() => setMode("login")} 
          />
        )}
        <button className={s.close} onClick={onClose}>×</button>
      </div>
    </div>
  );
}
