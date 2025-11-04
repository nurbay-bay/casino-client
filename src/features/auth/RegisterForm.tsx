import { useState } from "react";
import { useAppDispatch } from "../../shared/hooks/reduxHooks";
import { register } from "../../store/slices/authSlice";

import s from "./AuthModal.module.scss";

interface Props {
  onNext: (phone: string) => void;
  onSwitch: () => void;
}

export default function RegisterForm({ onNext, onSwitch }: Props) {
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await dispatch(register({ username, phone, password })).unwrap();
      setMessage(res.message);
      onNext(phone);
    } catch (err: any) {
      setMessage(err.message || "Ошибка регистрации");
    }
  };

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <h2 className={s.title}>Регистрация</h2>
      <input
        type="text"
        placeholder="Имя пользователя"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="tel"
        placeholder="Телефон"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Зарегистрироваться</button>
      <p className={s.link} onClick={onSwitch}>
        Уже есть аккаунт? Войти
      </p>
      {message && <p className={s.msg}>{message}</p>}
    </form>
  );
}
