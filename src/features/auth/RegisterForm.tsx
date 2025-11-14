import { useState } from "react";
import { useAppDispatch } from "../../shared/hooks/reduxHooks";
import { register } from "../../store/slices/authSlice";
import type { RegisterData } from "../../shared/types/types";

import s from "./AuthModal.module.scss";
import { getErrorMessage } from "../../shared/utils/errorHandler";

interface Props {
  onNext: (phone: string, data: RegisterData) => void;
  onSwitch: () => void;
}

interface FieldErrors {
  username?: string;
  phone?: string;
  password?: string;
  birthDate?: string;
}

export default function RegisterForm({ onNext, onSwitch }: Props) {
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  // Валидация username: минимум 3 символа, только латиница, цифры и подчеркивание
  const validateUsername = (value: string): string | undefined => {
    if (!value) return "Имя пользователя обязательно";
    if (value.length < 3) return "Минимум 3 символа";
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return "Только латиница, цифры и подчеркивание";
    }
    return undefined;
  };

  // Валидация телефона: валидный номер телефона
  const validatePhone = (value: string): string | undefined => {
    if (!value) return "Телефон обязателен";
    // Проверка формата: +7XXXXXXXXXX или 7XXXXXXXXXX
    const phoneRegex = /^\+?7\d{10}$/;
    if (!phoneRegex.test(value.replace(/\s|-|\(|\)/g, ""))) {
      return "Неверный формат телефона (например: +77001234567)";
    }
    return undefined;
  };

  // Валидация пароля: минимум 6 символов
  const validatePassword = (value: string): string | undefined => {
    if (!value) return "Пароль обязателен";
    if (value.length < 6) return "Минимум 6 символов";
    return undefined;
  };

  // Валидация даты рождения: формат ISO8601, пользователь должен быть старше 18 лет
  const validateBirthDate = (value: string): string | undefined => {
    if (!value) return "Дата рождения обязательна";
    const date = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      const actualAge = age - 1;
      if (actualAge < 18) {
        return "Только для лиц старше 18 лет";
      }
    } else if (age < 18) {
      return "Только для лиц старше 18 лет";
    }
    
    if (isNaN(date.getTime())) {
      return "Неверный формат даты";
    }
    
    return undefined;
  };

  // Валидация всех полей
  const validateAll = (): boolean => {
    const newErrors: FieldErrors = {};
    
    const usernameError = validateUsername(username);
    if (usernameError) newErrors.username = usernameError;
    
    const phoneError = validatePhone(phone);
    if (phoneError) newErrors.phone = phoneError;
    
    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;
    
    const birthDateError = validateBirthDate(birthDate);
    if (birthDateError) newErrors.birthDate = birthDateError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setErrors({});

    // Валидация перед отправкой
    if (!validateAll()) {
      setMessage("Пожалуйста, исправьте ошибки в форме");
      return;
    }

    const result = await dispatch(register({ username, phone, birthDate, password }));

    if (register.fulfilled.match(result)) {
      setMessage(result.payload.message);
      onNext(phone, { username, phone, birthDate, password });
    } else {
      const errorMessage = getErrorMessage(result.error);
      setMessage(errorMessage);
      
      // Пытаемся извлечь ошибки полей из ответа сервера
      const error = result.error as any;
      if (error?.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  // Валидация при изменении полей
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    if (errors.username) {
      const error = validateUsername(value);
      setErrors({ ...errors, username: error });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    if (errors.phone) {
      const error = validatePhone(value);
      setErrors({ ...errors, phone: error });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (errors.password) {
      const error = validatePassword(value);
      setErrors({ ...errors, password: error });
    }
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBirthDate(value);
    if (errors.birthDate) {
      const error = validateBirthDate(value);
      setErrors({ ...errors, birthDate: error });
    }
  };

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <h2 className={s.title}>Регистрация</h2>
      
      <div className={s.fieldGroup}>
        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={handleUsernameChange}
          onBlur={() => {
            const error = validateUsername(username);
            setErrors({ ...errors, username: error });
          }}
          className={errors.username ? s.error : ""}
          required
        />
        {errors.username && <span className={s.fieldError}>{errors.username}</span>}
      </div>

      <div className={s.fieldGroup}>
        <input
          type="tel"
          placeholder="Телефон (+77001234567)"
          value={phone}
          onChange={handlePhoneChange}
          onBlur={() => {
            const error = validatePhone(phone);
            setErrors({ ...errors, phone: error });
          }}
          className={errors.phone ? s.error : ""}
          required
        />
        {errors.phone && <span className={s.fieldError}>{errors.phone}</span>}
      </div>

      <div className={s.fieldGroup}>
        <input
          type="date"
          placeholder="Дата рождения"
          value={birthDate}
          onChange={handleBirthDateChange}
          onBlur={() => {
            const error = validateBirthDate(birthDate);
            setErrors({ ...errors, birthDate: error });
          }}
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
          className={errors.birthDate ? s.error : ""}
          required
        />
        {errors.birthDate && <span className={s.fieldError}>{errors.birthDate}</span>}
      </div>

      <div className={s.fieldGroup}>
        <input
          type="password"
          placeholder="Пароль (минимум 6 символов)"
          value={password}
          onChange={handlePasswordChange}
          onBlur={() => {
            const error = validatePassword(password);
            setErrors({ ...errors, password: error });
          }}
          className={errors.password ? s.error : ""}
          required
        />
        {errors.password && <span className={s.fieldError}>{errors.password}</span>}
      </div>

      <button type="submit">Зарегистрироваться</button>
      <p className={s.link} onClick={onSwitch}>
        Уже есть аккаунт? Войти
      </p>
      {message && <p className={`${s.msg} ${message.includes("отправлен") ? s.success : ""}`}>{message}</p>}
    </form>
  );
}
