import { useEffect, useState } from "react";
import s from "./HistoryPage.module.scss";
import { useAppDispatch, useAppSelector } from "../shared/hooks/reduxHooks";
import { fetchGameHistory, fetchPaymentHistory } from "../store/slices/historySlice";

type Tab = "bets" | "payments";

export default function HistoryPage() {
  const dispatch = useAppDispatch();
  const { games, payments, loading } = useAppSelector((s) => s.history);
  const [activeTab, setActiveTab] = useState<Tab>("bets");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    dispatch(fetchGameHistory());
    dispatch(fetchPaymentHistory());
  }, [dispatch]);

  // Пагинация
  const currentData = activeTab === "bets" ? games : payments;
  const totalPages = Math.ceil(currentData.length / pageSize);
  const paginatedData = currentData.slice((page - 1) * pageSize, page * pageSize);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className={s.wrapper}>
      <h2 className={s.title}>История</h2>

      {/* Вкладки */}
      <div className={s.tabs}>
        <button
          className={`${s.tab} ${activeTab === "bets" ? s.active : ""}`}
          onClick={() => {
            setActiveTab("bets");
            setPage(1);
          }}
        >
          Ставки
        </button>
        <button
          className={`${s.tab} ${activeTab === "payments" ? s.active : ""}`}
          onClick={() => {
            setActiveTab("payments");
            setPage(1);
          }}
        >
          Платежи
        </button>
      </div>

      {loading ? (
        <p className={s.loading}>Загрузка...</p>
      ) : (
        <>
          {/* Таблица */}
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead>
                <tr>
                  {activeTab === "bets" ? (
                    <>
                      <th>Игра</th>
                      <th>Ставка</th>
                      <th>Результат</th>
                      <th>Выигрыш</th>
                      <th>Дата</th>
                    </>
                  ) : (
                    <>
                      <th>Сумма</th>
                      <th>Статус</th>
                      <th>Дата</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr key={item.id}>
                      {activeTab === "bets" ? (
                        <>
                          <td>{(item as any).game}</td>
                          <td>{(item as any).bet} ₸</td>
                          <td>
                            {(item as any).result === "win" ? (
                              <span className={s.win}>Победа</span>
                            ) : (
                              <span className={s.loss}>Проигрыш</span>
                            )}
                          </td>
                          <td>{(item as any).amountWon} ₸</td>
                          <td>{new Date((item as any).createdAt).toLocaleString("ru-RU")}</td>
                        </>
                      ) : (
                        <>
                          <td>{(item as any).amount} ₸</td>
                          <td>
                            {(item as any).status === "success" ? (
                              <span className={s.success}>Успешно</span>
                            ) : (item as any).status === "canceled" ? (
                              <span className={s.canceled}>Отменено</span>
                            ) : (
                              <span className={s.pending}>Ожидание</span>
                            )}
                          </td>
                          <td>{new Date((item as any).createdAt).toLocaleString("ru-RU")}</td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === "bets" ? 5 : 3} className={s.empty}>
                      Нет данных
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className={s.pagination}>
              <button onClick={handlePrev} disabled={page === 1} className={s.pageBtn}>
                Назад
              </button>
              <span className={s.pageInfo}>
                Страница {page} из {totalPages}
              </span>
              <button onClick={handleNext} disabled={page === totalPages} className={s.pageBtn}>
                Вперёд
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}