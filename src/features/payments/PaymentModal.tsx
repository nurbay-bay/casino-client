import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../shared/hooks/reduxHooks";
import s from "./PaymentModal.module.scss";
import { createPayment, cancelPayment } from "../../store/slices/paymentSlice";
import { fetchProfile } from "../../store/slices/authSlice";
import { fetchPaymentHistory } from "../../store/slices/historySlice";

import cardImg from "../../assets/images/payment/card.png"
import cryptoImg from "../../assets/images/payment/crypto.png"

interface Props {
  onClose: () => void;
}

export default function PaymentModal({ onClose }: Props) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((s) => s.payments);
  const { user } = useAppSelector((s) => s.auth);
  const [amount, setAmount] = useState(1000);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto">("card");
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [activePaymentToken, setActivePaymentToken] = useState<string | null>(null);
  const [initialBalance, setInitialBalance] = useState<number | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { payments } = useAppSelector((s) => s.history);

  // Извлекаем токен из paymentUrl
  const extractTokenFromUrl = (url: string): string | null => {
    try {
      // Формат: http://localhost:8000/payment/page/TOKEN
      const match = url.match(/\/payment\/page\/([^/?]+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

  // Polling для проверки статуса платежа
  useEffect(() => {
    if (activePaymentId && activePaymentToken) {
      // Проверяем статус платежа каждые 3 секунды
      pollingIntervalRef.current = setInterval(async () => {
        // Обновляем историю платежей для проверки статуса
        await dispatch(fetchPaymentHistory());
      }, 3000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    }
  }, [activePaymentId, activePaymentToken, dispatch]);

  // Проверяем статус платежа в истории
  useEffect(() => {
    if (activePaymentId && payments.length > 0) {
      const payment = payments.find((p) => p._id === activePaymentId || (p as any).id === activePaymentId);
      
      if (payment) {
        if (payment.status === 'success') {
          // Платеж успешен
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setActivePaymentId(null);
          setActivePaymentToken(null);
          setInitialBalance(null);
          dispatch(fetchProfile());
          setTimeout(() => {
            onClose();
          }, 500);
        } else if (payment.status === 'canceled') {
          // Платеж отменен
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setActivePaymentId(null);
          setActivePaymentToken(null);
          setInitialBalance(null);
        }
      }
    }
  }, [payments, activePaymentId, dispatch, onClose]);

  // Отслеживаем изменение баланса после платежа
  useEffect(() => {
    if (activePaymentId && initialBalance !== null && user?.balance !== undefined) {
      // Если баланс увеличился, значит платеж прошел
      if (user.balance > initialBalance) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setActivePaymentId(null);
        setActivePaymentToken(null);
        setInitialBalance(null);
        // Небольшая задержка перед закрытием, чтобы пользователь увидел обновление
        setTimeout(() => {
          onClose();
        }, 500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.balance, activePaymentId, initialBalance]);

  // Проверка статуса платежа через сообщения от окна оплаты
  // Статус обновляется автоматически через webhook и сообщение PAYMENT_SUCCESS

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount < 100 || amount > 100000) {
      alert("Сумма должна быть от 100 до 100 000 KZT");
      return;
    }

    try {
      // Сохраняем начальный баланс для проверки изменений
      const currentBalance = user?.balance || 0;
      setInitialBalance(currentBalance);

      const result = await dispatch(createPayment(amount)).unwrap();
      const paymentId = result.id;
      const paymentToken = extractTokenFromUrl(result.paymentUrl);
      
      setActivePaymentId(paymentId);
      setActivePaymentToken(paymentToken);
      
      // Загружаем историю платежей для начальной проверки
      dispatch(fetchPaymentHistory());

      const paymentWindow = window.open(
        result.paymentUrl,
        'payment',
        'width=600,height=700,scrollbars=no,resizable=no'
      );

      if (!paymentWindow) {
        alert("Не удалось открыть окно оплаты. Проверьте блокировку всплывающих окон.");
        setActivePaymentId(null);
        setActivePaymentToken(null);
        setInitialBalance(null);
        return;
      }

      // Обработчик сообщений от окна оплаты
      const handleMessage = (event: MessageEvent) => {
        // Проверяем тип сообщения (origin может быть другим для платежной страницы)
        if (event.data && event.data.type === 'PAYMENT_SUCCESS') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          dispatch(fetchProfile()).then(() => {
            setActivePaymentId(null);
            setActivePaymentToken(null);
            setInitialBalance(null);
            paymentWindow?.close();
            window.removeEventListener('message', handleMessage);
            onClose();
          });
        }
      };

      window.addEventListener('message', handleMessage);

      // Проверка закрытия окна оплаты и изменения баланса
      let checkCount = 0;
      const maxChecks = 30; // Проверяем максимум 30 секунд
      
      const checkWindow = setInterval(async () => {
        checkCount++;
        
        if (paymentWindow.closed) {
          clearInterval(checkWindow);
          window.removeEventListener('message', handleMessage);
          
          // Обновляем баланс при закрытии окна
          // useEffect автоматически проверит изменение баланса
          dispatch(fetchProfile());
          
          // Если баланс не изменится за 3 секунды, просто очищаем
          setTimeout(() => {
            if (activePaymentId) {
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
              setActivePaymentId(null);
              setActivePaymentToken(null);
              setInitialBalance(null);
            }
          }, 3000);
        } else if (checkCount >= maxChecks) {
          // Если окно не закрылось за 30 секунд, прекращаем проверку
          clearInterval(checkWindow);
        }
      }, 1000);

    } catch (error: any) {
      console.error('Payment creation error:', error);
      alert(error.message || "Ошибка создания платежа");
      setActivePaymentId(null);
      setActivePaymentToken(null);
      setInitialBalance(null);
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
            <p className={s.statusHint}>После завершения платежа окно закроется автоматически</p>
            <button
              type="button"
              onClick={async () => {
                // Отменяем платеж на сервере, если есть токен
                if (activePaymentToken) {
                  try {
                    await dispatch(cancelPayment(activePaymentToken)).unwrap();
                    // Обновляем историю после отмены
                    await dispatch(fetchPaymentHistory());
                  } catch (error) {
                    console.error('Ошибка отмены платежа:', error);
                  }
                }
                
                // Останавливаем polling
                if (pollingIntervalRef.current) {
                  clearInterval(pollingIntervalRef.current);
                  pollingIntervalRef.current = null;
                }
                
                setActivePaymentId(null);
                setActivePaymentToken(null);
                setInitialBalance(null);
                dispatch(fetchProfile()); // Обновляем баланс на всякий случай
              }}
              className={s.cancelBtn}
            >
              Отменить платеж
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