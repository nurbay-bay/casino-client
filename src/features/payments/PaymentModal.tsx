import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../shared/hooks/reduxHooks";

import s from "./PaymentModal.module.scss";
import { createPayment } from "../../store/slices/paymentSlice";

interface Props {
  onClose: () => void;
}

export default function PaymentModal({ onClose }: Props) {
  const dispatch = useAppDispatch();
  const { loading, success } = useAppSelector((s) => s.payments);
  const [amount, setAmount] = useState(1000);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(createPayment(amount));
    setTimeout(onClose, 2000);
  };

  return (
    <div className={s.modal}>
      <div className={s.box}>
        <h2>Пополнение баланса</h2>
        <form onSubmit={handlePay}>
          <input
            type="number"
            min={100}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Обработка..." : "Пополнить"}
          </button>
        </form>
        {success && <p>Успешно пополнено!</p>}
        <button className={s.close} onClick={onClose}>×</button>
      </div>
    </div>
  );
}
