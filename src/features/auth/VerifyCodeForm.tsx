import { useState, useEffect, useRef } from "react";
import { useAppDispatch } from "../../shared/hooks/reduxHooks";
import { verify, register } from "../../store/slices/authSlice";
import type { RegisterData } from "../../shared/types/types";
import s from "./AuthModal.module.scss";
import { getErrorMessage } from "../../shared/utils/errorHandler";

interface Props {
  phone: string;
  registerData: RegisterData | null;
  onDone: () => void;
}

export default function VerifyCodeForm({ phone, registerData, onDone }: Props) {
  const dispatch = useAppDispatch();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(120); // 2 минуты в секундах
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Таймер обратного отсчета
  useEffect(() => {
    if (timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(verify({ phone, code }));

    if (verify.fulfilled.match(result)) {
      setMessage("Аккаунт подтверждён!");
      setTimeout(onDone, 1000);
    } else {
      setMessage(getErrorMessage(result.error));
    }
  };

  const handleResendCode = async () => {
    if (!registerData || !canResend || resending) return;

    setResending(true);
    setMessage("");
    setCanResend(false);
    setTimeLeft(120); // Сбрасываем таймер

    try {
      const result = await dispatch(register(registerData));
      if (register.fulfilled.match(result)) {
        setMessage("Код отправлен повторно");
      } else {
        setMessage(getErrorMessage(result.error));
        setCanResend(true); // Разрешаем повторную попытку при ошибке
      }
    } catch (error) {
      setMessage("Ошибка при отправке кода");
      setCanResend(true);
    } finally {
      setResending(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <h2 className={s.title}>Подтверждение</h2>
      <p>Введите код, отправленный на {phone}</p>
      <input
        type="text"
        placeholder="Код из SMS"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        maxLength={6}
        required
      />
      <button type="submit">Подтвердить</button>
      
      <div className={s.resendSection}>
        {!canResend ? (
          <p className={s.timer}>
            Отправить код повторно можно через {formatTime(timeLeft)}
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resending || !registerData}
            className={s.resendBtn}
          >
            {resending ? "Отправка..." : "Отправить код повторно"}
          </button>
        )}
      </div>

      {message && <p className={s.msg}>{message}</p>}
    </form>
  );
}
