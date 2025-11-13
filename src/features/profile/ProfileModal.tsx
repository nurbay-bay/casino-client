import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../shared/hooks/reduxHooks";
import {
  changePassword,
  requestPhoneChange,
  verifyPhoneChange,
  logout,
} from "../../store/slices/authSlice";
import PaymentModal from "../payments/PaymentModal"; // ← добавили
import s from "./ProfileModal.module.scss";

import settingImg from "../../assets/images/profile/setting.svg"
import payImg from "../../assets/images/profile/pay-history.svg"
import betImg from "../../assets/images/profile/bet-history.svg"

type Step = "main" | "settings" | "changePassword" | "changePhone" | "verifyPhone" | "payment";

export default function ProfileModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const [step, setStep] = useState<Step>("main");

  // --- Состояния для платежей ---
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // --- Смена пароля ---
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [msgPwd, setMsgPwd] = useState("");

  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgPwd("");
    try {
      await dispatch(changePassword({ oldPassword: oldPwd, newPassword: newPwd })).unwrap();
      setMsgPwd("Пароль успешно изменён");
      setTimeout(() => setStep("settings"), 1500);
    } catch (err: any) {
      setMsgPwd(err.message || "Ошибка при смене пароля");
    }
  };

  // --- Смена телефона ---
  const [newPhone, setNewPhone] = useState("");
  const [code, setCode] = useState("");
  const [msgPhone, setMsgPhone] = useState("");

  const handleRequestPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgPhone("");
    try {
      await dispatch(requestPhoneChange(newPhone)).unwrap();
      setMsgPhone("Код отправлен на новый номер");
      setStep("verifyPhone");
    } catch (err: any) {
      setMsgPhone(err.message || "Ошибка");
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgPhone("");
    try {
      await dispatch(verifyPhoneChange(code)).unwrap();
      setMsgPhone("Телефон успешно обновлён");
      setTimeout(() => setStep("settings"), 1500);
    } catch (err: any) {
      setMsgPhone(err.message || "Неверный код");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    onClose();
    navigate("/login");
  };

  const goToHistory = (type: "bets" | "payments") => {
    onClose();
    navigate(`/history?tab=${type}`);
  };

  // --- ОТКРЫТИЕ ПЛАТЁЖНОЙ МОДАЛКИ ---
  const openPayment = () => {
    setPaymentModalOpen(true);
  };

  const closePayment = () => {
    setPaymentModalOpen(false);
  };

  if (!user) return null;

  return (
    <>
      {/* === ОСНОВНАЯ МОДАЛКА ПРОФИЛЯ === */}
      <div className={s.overlay} onClick={onClose}>
        <div className={s.modal} onClick={(e) => e.stopPropagation()}>
          <button className={s.close} onClick={onClose}>×</button>

          {/* === ОСНОВНОЙ ЭКРАН === */}
          {step === "main" && (
            <div className={s.mainStep}>
              <h2 className={s.title}>Профиль</h2>

              <div className={s.userInfo}>
                <p className={s.username}>{user.username}</p>
                <p className={s.userId}>ID {user.id || "скрытый"}</p>
              </div>

              <div className={s.balanceSection}>
                <div className={s.balanceLabel}>Основной счет</div>
                <div className={s.balanceAmount}>
                  {user.balance?.toFixed(2) || "0.00"} KZT
                </div>
                <div className={s.balanceActions}>
                  <button className={s.depositBtn} onClick={openPayment}>
                    Пополнить
                  </button>
                  <button className={s.withdrawBtn} disabled>
                    Вывести
                  </button>
                </div>
              </div>

              <div className={s.menuList}>
                <button className={s.menuItem} onClick={() => setStep("settings")}>
                  <img src={settingImg} alt="setting" className={s.icon} />
                  <div className={s.group}>
                    <span>Настройки</span>
                    <span className={s.menuHint}>Редактирование личных данных</span>
                  </div>
                </button>

                <button className={s.menuItem} onClick={() => goToHistory("bets")}>
                  <img src={betImg} alt="bet-history" className={s.icon} />
                  <div className={s.group}>
                    <span>История ставок</span>
                    <span className={s.menuHint}>Открытые и рассчитанные</span>
                  </div>
                </button>

                <button className={s.menuItem} onClick={() => goToHistory("payments")}>
                  <img src={payImg} alt="pay-history" className={s.icon} />
                  <div className={s.group}>
                    <span>История платежей</span>
                    <span className={s.menuHint}>Статусы депозитов и выводов</span>
                  </div>
                </button>
              </div>

              <button className={s.logoutBtn} onClick={handleLogout}>
                Выйти из аккаунта
              </button>
            </div>
          )}

          {/* === ДРУГИЕ ШАГИ (настройки, смена пароля и т.д.) === */}
          {step === "settings" && (
            <div className={s.settingsStep}>
              <button className={s.backBtn} onClick={() => setStep("main")}>
                Назад
              </button>
              <h2 className={s.title}>Настройки</h2>
              {/* ... остальной код настроек без изменений ... */}
              <div className={s.settingsList}>
                <div className={s.settingItem}>
                  <div>
                    <label>Телефон</label>
                    <div className={s.settingValue}>{user.phone}</div>
                  </div>
                  <button className={s.changeBtn} onClick={() => setStep("changePhone")}>
                    Изменить
                  </button>
                </div>

                <div className={s.settingItem}>
                  <div>
                    <label>Пароль</label>
                    <p className={s.settingHint}>Для изменения нужно ввести текущий пароль</p>
                  </div>
                  <button className={s.changeBtn} onClick={() => setStep("changePassword")}>
                    Изменить
                  </button>
                </div>

                <div className={s.settingItem}>
                  <div>
                    <label>Дата рождения</label>
                    <div className={s.settingValue}>
                      {user.birthDate
                        ? new Date(user.birthDate).toLocaleDateString("ru-RU")
                        : "Не указана"}
                    </div>
                    <p className={s.settingHint}>Изменение невозможно</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "changePassword" && (
            <form onSubmit={handleChangePwd} className={s.form}>
              <button className={s.backBtn} onClick={() => setStep("settings")}>
                Назад
              </button>
              <h3 className={s.subtitle}>Смена пароля</h3>
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
              <button type="submit" className={s.submitBtn}>Сохранить</button>
              {msgPwd && (
                <p className={`${s.msg} ${msgPwd.includes("успешно") ? s.success : s.error}`}>
                  {msgPwd}
                </p>
              )}
            </form>
          )}

          {step === "changePhone" && (
            <form onSubmit={handleRequestPhone} className={s.form}>
              <button className={s.backBtn} onClick={() => setStep("settings")}>
                Назад
              </button>
              <h3 className={s.subtitle}>Смена телефона</h3>
              <input
                type="tel"
                placeholder="Новый номер"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                required
              />
              <button type="submit" className={s.submitBtn}>Отправить код</button>
              {msgPhone && <p className={s.msg}>{msgPhone}</p>}
            </form>
          )}

          {step === "verifyPhone" && (
            <form onSubmit={handleVerifyPhone} className={s.form}>
              <button className={s.backBtn} onClick={() => setStep("changePhone")}>
                Назад
              </button>
              <h3 className={s.subtitle}>Подтверждение</h3>
              <p className={s.infoText}>Код отправлен на {newPhone}</p>
              <input
                type="text"
                placeholder="Код из SMS"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
              />
              <button type="submit" className={s.submitBtn}>Подтвердить</button>
              {msgPhone && (
                <p className={`${s.msg} ${msgPhone.includes("успешно") ? s.success : s.error}`}>
                  {msgPhone}
                </p>
              )}
            </form>
          )}
        </div>
      </div>

      {/* === ПЛАТЁЖНАЯ МОДАЛКА (внутри профиля) === */}
      {paymentModalOpen && (
        <PaymentModal
          onClose={() => {
            closePayment();
          }}
        />
      )}
    </>
  );
}