import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../shared/hooks/reduxHooks";
import PaymentModal from "../features/payments/PaymentModal";
import { fetchProfile } from "../store/slices/authSlice";
import AuthModal from "../features/auth/AuthModal";
import ProfileModal from "../features/profile/ProfileModal";
import s from "./Header.module.scss";

import logo from "../assets/images/logo2.svg";
import casinoIcon from "../assets/images/casino.svg";
import homeIcon from "../assets/images/home.svg";
import userIcon from "../assets/images/user.svg";
import historyIcon from "../assets/images/history.svg";

export default function Header() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user } = useAppSelector((s) => s.auth);
  const [authOpen, setAuthOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Используем number вместо NodeJS.Timeout
  const intervalRef = useRef<number | null>(null);

  // === Загрузка профиля при старте ===
  useEffect(() => {
    if (localStorage.getItem("token")) {
      dispatch(fetchProfile());
    }
  }, [dispatch]);

  // === LIVE-ОБНОВЛЕНИЕ БАЛАНСА каждые 5 сек ===
  useEffect(() => {
    if (!localStorage.getItem("token")) return;

    // Первичная загрузка
    dispatch(fetchProfile());

    // Запускаем интервал
    intervalRef.current = window.setInterval(() => {
      dispatch(fetchProfile());
    }, 5000);

    // Очистка при размонтировании
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [dispatch]);

  // === Обработка скролла (сжатие хедера) ===
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;

      if (scrollingDown && currentScrollY > 50) {
        setIsScrolled(true);
      } else if (!scrollingDown && currentScrollY <= 50) {
        setIsScrolled(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleUserClick = () => {
    if (user) setProfileOpen(true);
    else setAuthOpen(true);
  };

  const handlePayClick = () => {
    if (user) setPayOpen(true);
    else setAuthOpen(true);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* === ПРИЛИПАЮЩИЙ ХЕДЕР === */}
      <header className={`${s.header} ${isScrolled ? s.scrolled : ""}`}>
        <Link to="/" className={s.logoLink}>
          <div className={s.logo}>
            <img src={logo} alt="logo" className={s.logoImg} />
            <h1 className={s.logoText}>UDOMAN</h1>
          </div>
        </Link>

        <nav className={s.nav}>
          <Link to="/" className={`${s.navItem} ${isActive("/") ? s.active : ""}`}>
            <img src={homeIcon} alt="home" className={s.iconImg} />
            <span className={s.navText}>Главная</span>
          </Link>

          <Link to="/casino" className={`${s.navItem} ${isActive("/casino") ? s.active : ""}`}>
            <img src={casinoIcon} alt="casino" className={s.iconImg} />
            <span className={s.navText}>Казино</span>
          </Link>

          <Link to="/history" className={`${s.navItem} ${isActive("/history") ? s.active : ""}`}>
            <img src={historyIcon} alt="history" className={s.iconImg} />
            <span className={s.navText}>История</span>
          </Link>
        </nav>

        <div className={s.rightSection}>
          <div className={s.balance}>
            <span className={s.currency}>KZT</span>
            <span className={s.amount}>
              {user?.balance !== undefined ? user.balance.toFixed(2) : "0.00"}
            </span>
          </div>

          <button onClick={handlePayClick} className={s.depositBtn}>
            Пополнить
          </button>

          <button onClick={handleUserClick} className={s.profileBtn}>
            <img src={userIcon} alt="user" className={s.iconImg} />
          </button>
        </div>
      </header>

      {/* === МОБИЛЬНЫЙ BOTTOM NAV === */}
      <nav className={s.bottomNav}>
        <Link to="/" className={`${s.bottomItem} ${isActive("/") ? s.active : ""}`}>
          <img src={homeIcon} alt="home" className={s.bottomIcon} />
          <span>Главная</span>
        </Link>

        <Link to="/casino" className={`${s.bottomItem} ${isActive("/casino") ? s.active : ""}`}>
          <img src={casinoIcon} alt="casino" className={s.bottomIcon} />
          <span>Казино</span>
        </Link>

        <Link to="/history" className={`${s.bottomItem} ${isActive("/history") ? s.active : ""}`}>
          <img src={historyIcon} alt="history" className={s.bottomIcon} />
          <span>История</span>
        </Link>

        <button
          onClick={handleUserClick}
          className={`${s.bottomItem} ${profileOpen ? s.active : ""}`}
        >
          <img src={userIcon} alt="profile" className={s.bottomIcon} />
          <span>Профиль</span>
        </button>
      </nav>

      {/* Модальные окна */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {payOpen && <PaymentModal onClose={() => setPayOpen(false)} />}
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </>
  );
}