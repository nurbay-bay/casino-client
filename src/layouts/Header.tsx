import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../shared/hooks/reduxHooks";
import PaymentModal from "../features/payments/PaymentModal";
import { fetchProfile, logout } from "../store/slices/authSlice";
import AuthModal from "../features/auth/AuthModal";
import { Link } from "react-router-dom";
import s from "./Header.module.scss";
import ProfileModal from "../features/profile/ProfileModal";

export default function Header() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const [authOpen, setAuthOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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
        <>
          <Link to="/history">История</Link>
          <span>Баланс: {user.balance} ₸</span>
          <button onClick={() => setPayOpen(true)}>Пополнить</button>
          <button onClick={() => setProfileOpen(true)}>Профиль</button>
          <button onClick={handleLogout}>Выйти</button>
        </>
      ) : (
        <button onClick={() => setAuthOpen(true)}>Войти</button>
      )}
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {payOpen && <PaymentModal onClose={() => setPayOpen(false)} />}
    </header>
  );
}