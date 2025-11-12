import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../shared/hooks/reduxHooks";
import s from "./PaymentModal.module.scss";
import { createPayment } from "../../store/slices/paymentSlice";
import { fetchProfile } from "../../store/slices/authSlice";

interface Props {
  onClose: () => void;
}

export default function PaymentModal({ onClose }: Props) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((s) => s.payments);
  const [amount, setAmount] = useState(1000);
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);

  // Периодическая проверка статуса активного платежа
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
            // Обновляем баланс если платеж прошел
            dispatch(fetchProfile());
            setActivePaymentId(null);
          } else if (data.status === 'failed') {
            // Сбрасываем активный платеж если он провалился
            setActivePaymentId(null);
          }
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    };

    const interval = setInterval(checkStatus, 5000); // Проверяем каждые 5 секунд
    return () => clearInterval(interval);
  }, [activePaymentId, dispatch]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await dispatch(createPayment(amount)).unwrap();
      setActivePaymentId(result.id);
      
      // Открываем платежную страницу в новом окне
      const paymentWindow = window.open(
        result.paymentUrl,
        'payment',
        'width=600,height=700,scrollbars=no,resizable=no'
      );

      // Слушаем сообщения от платежного окна
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data.type === 'PAYMENT_SUCCESS') {
          // Обновляем баланс
          dispatch(fetchProfile());
          setActivePaymentId(null);
          paymentWindow?.close();
          window.removeEventListener('message', handleMessage);
          onClose();
        }
      };

      window.addEventListener('message', handleMessage);

      // Проверяем закрытие окна
      const checkWindow = setInterval(() => {
        if (paymentWindow?.closed) {
          clearInterval(checkWindow);
          window.removeEventListener('message', handleMessage);
          // Проверяем статус платежа при закрытии окна
          if (activePaymentId) {
            setTimeout(() => dispatch(fetchProfile()), 1000);
          }
        }
      }, 1000);

    } catch (error: any) {
      console.error('Payment creation error:', error);
    }
  };

  return (
    <div className={s.modal}>
      <div className={s.box}>
        <h2>Пополнение баланса</h2>
        
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
        
        <form onSubmit={handlePay}>
          <div className={s.amountInput}>
            <label>Сумма пополнения (₽)</label>
            <input
              type="number"
              min={100}
              max={100000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              disabled={!!activePaymentId}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !!activePaymentId}
          >
            {loading ? "Создание платежа..." : "Перейти к оплате"}
          </button>
        </form>
        
        <div className={s.note}>
          <p>💡 Откроется безопасная платежная страница</p>
          <p>🔒 Данные карты обрабатываются через Stripe</p>
          <p>⏱ Ссылка действительна 30 минут</p>
          {activePaymentId && <p>🔄 Статус платежа обновляется автоматически</p>}
        </div>
        
        <button className={s.close} onClick={onClose}>×</button>
      </div>
    </div>
  );
}