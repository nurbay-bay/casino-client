import { useEffect } from "react";

import s from "./HistoryPage.module.scss";
import { useAppDispatch, useAppSelector } from "../shared/hooks/reduxHooks";
import { fetchGameHistory, fetchPaymentHistory } from "../store/slices/historySlice";

export default function HistoryPage() {
  const dispatch = useAppDispatch();
  const { games, payments, loading } = useAppSelector((s) => s.history);

  useEffect(() => {
    dispatch(fetchGameHistory());
    dispatch(fetchPaymentHistory());
  }, [dispatch]);

  return (
    <div className={s.wrapper}>
      <h2>История</h2>

      {loading && <p>Загрузка...</p>}

      <div className={s.section}>
        <h3>Игры</h3>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Игра</th>
              <th>Ставка</th>
              <th>Результат</th>
              <th>Выигрыш</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {games.length > 0 ? (
              games.map((g) => (
                <tr key={g.id}>
                  <td>{g.game}</td>
                  <td>{g.bet}</td>
                  <td>{g.result === "win" ? "Победа" : "Проигрыш"}</td>
                  <td>{g.amountWon}</td>
                  <td>{new Date(g.createdAt).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>Нет игр</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={s.section}>
        <h3>💳 Платежи</h3>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((p) => (
                <tr key={p.id}>
                  <td>{p.amount}</td>
                  <td>
                    {p.status === "success" ? (
                      <span className={s.success}>Успешно</span>
                    ) : p.status === "canceled" ? (
                      <span className={s.canceled}>Отменено</span>
                    ) : (
                      <span className={s.pending}>Ожидание</span>
                    )}
                  </td>
                  <td>{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3}>Нет пополнений</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
