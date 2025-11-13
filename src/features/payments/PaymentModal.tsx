import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../shared/hooks/reduxHooks";
import s from "./PaymentModal.module.scss";
import { createPayment } from "../../store/slices/paymentSlice";
import { fetchProfile } from "../../store/slices/authSlice";

import cardImg from "../../assets/images/payment/card.png"
import cryptoImg from "../../assets/images/payment/crypto.png"

interface Props {
  onClose: () => void;
}

export default function PaymentModal({ onClose }: Props) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((s) => s.payments);
  const [amount, setAmount] = useState(1000);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto">("card");
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);

  // Проверка статуса платежа
  useEffect(() => {
    if (!activePaymentId) return;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payments/status/${activePaymentId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success') {
            dispatch(fetchProfile());
            setActivePaymentId(null);
            onClose();
          } else if (data.status === 'failed') {
            setActivePaymentId(null);
          }
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [activePaymentId, dispatch, onClose]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount < 100 || amount > 100000) {
      alert("Сумма должна быть от 100 до 100 000 KZT");
      return;
    }

    try {
      const result = await dispatch(createPayment(amount)).unwrap();
      setActivePaymentId(result.id);

      const paymentWindow = window.open(
        result.paymentUrl,
        'payment',
        'width=600,height=700,scrollbars=no,resizable=no'
      );

      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data.type === 'PAYMENT_SUCCESS') {
          dispatch(fetchProfile());
          setActivePaymentId(null);
          paymentWindow?.close();
          window.removeEventListener('message', handleMessage);
          onClose();
        }
      };

      window.addEventListener('message', handleMessage);

      const checkWindow = setInterval(() => {
        if (paymentWindow?.closed) {
          clearInterval(checkWindow);
          window.removeEventListener('message', handleMessage);
          if (activePaymentId) {
            setTimeout(() => dispatch(fetchProfile()), 1000);
          }
        }
      }, 1000);

    } catch (error: any) {
      console.error('Payment creation error:', error);
      alert(error.message || "Ошибка создания платежа");
    }
  };

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <button className={s.close} onClick={onClose}>×</button>

        <div className={s.header}>
          <h2>Пополнение</h2>
        </div>

        {/* Способы оплаты */}
        <div className={s.paymentMethods}>
          <button
            className={`${s.method} ${paymentMethod === "card" ? s.active : ""}`}
            onClick={() => setPaymentMethod("card")}
            disabled={!!activePaymentId}
          >
            <img src={cardImg} alt="Visa/Mastercard" />
            <span>Карта</span>
          </button>

          <button
            className={`${s.method} ${s.disabled}`}
            disabled
          >
            <img src={cryptoImg} alt="Crypto" />
            <span>Криптовалюта</span>
          </button>

        </div>

        {activePaymentId && (
          <div className={s.paymentStatus}>
            <p>⏳ Ожидаем завершения платежа...</p>
            <button
              type="button"
              onClick={() => setActivePaymentId(null)}
              className={s.cancelBtn}
            >
              Отменить проверку
            </button>
          </div>
        )}

        <form onSubmit={handlePay} className={s.form}>
          <div className={s.amountInput}>
            <label>Сумма пополнения (KZT)</label>
            <input
              type="number"
              min={100}
              max={100000}
              step={100}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              disabled={!!activePaymentId}
              placeholder="от 100 до 100 000"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!activePaymentId}
            className={s.submitBtn}
          >
            {loading ? "Создание платежа..." : "Перейти к оплате"}
          </button>
        </form>

        <div className={s.note}>
          <p>🔒 Данные карты защищены</p>
          <p>⏱ Ссылка активна 15 минут</p>
        </div>
      </div>
    </div>
  );
}