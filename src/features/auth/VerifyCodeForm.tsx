import { useState } from "react";
import { useAppDispatch } from "../../shared/hooks/reduxHooks";
import { verify } from "../../store/slices/authSlice";
import s from "./AuthModal.module.scss";

interface Props {
  phone: string;
  onDone: () => void;
}

export default function VerifyCodeForm({ phone, onDone }: Props) {
  const dispatch = useAppDispatch();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(verify({ phone, code })).unwrap();
      setMessage("Аккаунт подтверждён!");
      setTimeout(onDone, 1000);
    } catch (err: any) {
      setMessage("Неверный код");
    }
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
        required
      />
      <button type="submit">Подтвердить</button>
      {message && <p className={s.msg}>{message}</p>}
    </form>
  );
}
