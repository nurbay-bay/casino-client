import { useState } from "react";
import { useAppDispatch } from "../../shared/hooks/reduxHooks";
import { login } from "../../store/slices/authSlice";
import s from "./AuthModal.module.scss";

interface Props {
  onSwitch: () => void;
}

export default function LoginForm({ onSwitch }: Props) {
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(login({ username, password })).unwrap();
      window.location.reload(); // обновляем UI
    } catch (err: any) {
      setError("Неверные данные");
    }
  };

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <h2 className={s.title}>Вход</h2>
      <input
        type="text"
        placeholder="Имя пользователя"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Войти</button>
      <p className={s.link} onClick={onSwitch}>
        Нет аккаунта? Регистрация
      </p>
      {error && <p className={s.msg}>{error}</p>}
    </form>
  );
}
