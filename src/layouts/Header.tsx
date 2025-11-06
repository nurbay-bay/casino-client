import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../shared/hooks/reduxHooks";
import PaymentModal from "../features/payments/PaymentModal";
import { fetchProfile, logout } from "../store/slices/authSlice";
import AuthModal from "../features/auth/AuthModal";
import { Link } from "react-router-dom";
import s from "./Header.module.scss";

export default function Header() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const [authOpen, setAuthOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      dispatch(fetchProfile());
    }
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    window.location.reload();
  };

  return (
    <header className={s.header}>
      <Link to="/" className={s.link}>
        <h1 className={s.logo}>🎰 Casino</h1>
      </Link>

      {user ? (
        <div className={s.info}>
          <Link to="/history" className={s.link}>
            История
          </Link>
          <span className={s.balance}>Баланс: {user.balance} ₸</span>
          <button onClick={() => setPayOpen(true)}>Пополнить</button>
          <button onClick={handleLogout}>Выйти</button>
        </div>
      ) : (
        <button onClick={() => setAuthOpen(true)}>Войти</button>
      )}

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {payOpen && <PaymentModal onClose={() => setPayOpen(false)} />}
    </header>
  );
}