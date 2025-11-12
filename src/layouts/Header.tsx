import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../shared/hooks/reduxHooks";
import PaymentModal from "../features/payments/PaymentModal";
import { fetchProfile } from "../store/slices/authSlice";
import AuthModal from "../features/auth/AuthModal";
import { Link } from "react-router-dom";
import s from "./Header.module.scss";
import ProfileModal from "../features/profile/ProfileModal";
import logo from '../assets/images/logo2.svg';
import casinoIcon from '../assets/images/casino.svg';
import homeIcon from '../assets/images/home.svg';
import userIcon from '../assets/images/user.svg';


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

  const handleUserClick = () => {
    if (user) {
      setProfileOpen(true);
    } else {
      setAuthOpen(true);
    }
  };

  const handlePayClick = () => {
    if (user) {
      setPayOpen(true);
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <header className={s.header}>
      {/* Логотип */}
      <Link to="/" className={s.logoLink}>
        <div className={s.logo}>
          <img src={logo} alt="logo" className={s.logoImg} />
          <h1 className={s.logoText}>UDOMAN</h1>
        </div>
      </Link>

      {/* Навигация */}
      <nav className={s.nav}>
        <Link to="/" className={`${s.navItem} ${s.active}`}>
          <img src={homeIcon} alt="home" className={s.iconImg} />
          <span className={s.navText}>Главная</span>
        </Link>
        <Link to="/casino" className={s.navItem}>
          <img src={casinoIcon} alt="casino" className={s.iconImg} />
          <span className={s.navText}>Казино</span>
        </Link>
      </nav>

      {/* Правая часть: баланс + пополнить + профиль */}
      <div className={s.rightSection}>
        <div className={s.balance}>
          <span className={s.currency}>KZT</span>
          <span className={s.amount}>{user?.balance?.toFixed(2) || "0.00"}</span>
        </div>

        <button onClick={handlePayClick} className={s.depositBtn}>
          Пополнить
        </button>

        <button onClick={handleUserClick} className={s.profileBtn}>
          <img src={userIcon} alt="user" className={s.iconImg} />
        </button>
      </div>

      {/* Модальные окна */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {payOpen && <PaymentModal onClose={() => setPayOpen(false)} />}
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </header>
  );
}