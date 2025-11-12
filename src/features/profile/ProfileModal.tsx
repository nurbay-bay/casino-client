import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../shared/hooks/reduxHooks";
import {
  changePassword,
  requestPhoneChange,
  verifyPhoneChange,
  logout,
} from "../../store/slices/authSlice";
import s from "./ProfileModal.module.scss";

type Step = "main" | "changePassword" | "changePhone" | "verifyPhone";

export default function ProfileModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const [step, setStep] = useState<Step>("main");

  // --- Смена пароля ---
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [msgPwd, setMsgPwd] = useState("");

  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(changePassword({ oldPassword: oldPwd, newPassword: newPwd })).unwrap();
      setMsgPwd("Пароль изменён");
      setTimeout(() => setStep("main"), 1500);
    } catch (err: any) {
      setMsgPwd(err.message || "Ошибка");
    }
  };

  // --- Смена телефона ---
  const [newPhone, setNewPhone] = useState("");
  const [code, setCode] = useState("");
  const [msgPhone, setMsgPhone] = useState("");

  const handleRequestPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(requestPhoneChange(newPhone)).unwrap();
      setMsgPhone("Код отправлен");
      setStep("verifyPhone");
    } catch (err: any) {
      setMsgPhone(err.message);
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(verifyPhoneChange(code)).unwrap();
      setMsgPhone("Телефон обновлён");
      setTimeout(() => setStep("main"), 1500);
    } catch (err: any) {
      setMsgPhone(err.message);
    }
  };

  if (!user) return null;

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <button className={s.close} onClick={onClose}>×</button>

        {step === "main" && (
          <>
            <h2>Профиль</h2>
            <p><strong>Имя:</strong> {user.username}</p>
            <p><strong>Телефон:</strong> {user.phone}</p>
            <p><strong>Баланс:</strong> {user.balance} ₸</p>

            <button onClick={() => setStep("changePassword")}>Сменить пароль</button>
            <button onClick={() => setStep("changePhone")}>Сменить телефон</button>
            <button onClick={() => dispatch(logout())}>Выйти</button>
          </>
        )}

        {step === "changePassword" && (
          <form onSubmit={handleChangePwd}>
            <h3>Смена пароля</h3>
            <input
              type="password"
              placeholder="Старый пароль"
              value={oldPwd}
              onChange={(e) => setOldPwd(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Новый пароль"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              minLength={6}
              required
            />
            <button type="submit">Сохранить</button>
            <button type="button" onClick={() => setStep("main")}>Назад</button>
            {msgPwd && <p className={s.msg}>{msgPwd}</p>}
          </form>
        )}

        {step === "changePhone" && (
          <form onSubmit={handleRequestPhone}>
            <h3>Смена телефона</h3>
            <input
              type="tel"
              placeholder="Новый номер"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              required
            />
            <button type="submit">Отправить код</button>
            <button type="button" onClick={() => setStep("main")}>Назад</button>
            {msgPhone && <p className={s.msg}>{msgPhone}</p>}
          </form>
        )}

        {step === "verifyPhone" && (
          <form onSubmit={handleVerifyPhone}>
            <h3>Подтверждение</h3>
            <p>Код отправлен на {newPhone}</p>
            <input
              type="text"
              placeholder="Код"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button type="submit">Подтвердить</button>
            <button type="button" onClick={() => setStep("changePhone")}>Назад</button>
            {msgPhone && <p className={s.msg}>{msgPhone}</p>}
          </form>
        )}
      </div>
    </div>
  );
}