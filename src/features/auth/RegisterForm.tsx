import { useState } from "react";
import { useAppDispatch } from "../../shared/hooks/reduxHooks";
import { register } from "../../store/slices/authSlice";

import s from "./AuthModal.module.scss";
import { getErrorMessage } from "../../shared/utils/errorHandler";

interface Props {
  onNext: (phone: string) => void;
  onSwitch: () => void;
}

export default function RegisterForm({ onNext, onSwitch }: Props) {
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const result = await dispatch(register({ username, phone, birthDate, password }));

    if (register.fulfilled.match(result)) {
      setMessage(result.payload.message);
      onNext(phone);
    } else {
      console.log("REGISTER ERROR →", result.error.response)
      setMessage(getErrorMessage(result.error));
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
        type="date"
        placeholder="Дата рождения"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
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
