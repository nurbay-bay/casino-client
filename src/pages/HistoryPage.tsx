import { useEffect, useState, useMemo } from "react";
import s from "./HistoryPage.module.scss";
import { useAppDispatch, useAppSelector } from "../shared/hooks/reduxHooks";
import { fetchGameHistory, fetchPaymentHistory } from "../store/slices/historySlice";
import { useSearchParams } from "react-router-dom";

type Tab = "bets" | "payments";

interface Filters {
  dateFrom: string;
  dateTo: string;
  game?: string;
  result?: "win" | "loss";
  status?: "success" | "pending" | "canceled";
}

export default function HistoryPage() {
  const dispatch = useAppDispatch();
  const { games, payments, loading } = useAppSelector((s) => s.history);
  
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    dateFrom: "",
    dateTo: "",
    game: "",
    result: undefined,
    status: undefined,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<Tab>(urlTab === "payments" ? "payments" : "bets");

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };


  const pageSize = 20;

  useEffect(() => {
    dispatch(fetchGameHistory());
    dispatch(fetchPaymentHistory());
  }, [dispatch]);

  // Фильтрация данных
  const filteredData = useMemo(() => {
    const data = activeTab === "bets" ? games : payments;

    return data.filter((item: any) => {
      const itemDate = new Date(item.createdAt).getTime();

      if (filters.dateFrom && itemDate < new Date(filters.dateFrom).getTime()) return false;
      if (filters.dateTo && itemDate > new Date(filters.dateTo).getTime() + 86400000) return false;

      if (activeTab === "bets") {
        if (filters.game && !item.game.toLowerCase().includes(filters.game.toLowerCase())) return false;
        if (filters.result && item.result !== filters.result) return false;
      } else {
        if (filters.status && item.status !== filters.status) return false;
      }

      return true;
    });
  }, [activeTab, games, payments, filters]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const resetFilters = () => {
    setFilters({ dateFrom: "", dateTo: "", game: "", result: undefined, status: undefined });
    setPage(1);
  };

  return (
    <div className={s.wrapper}>
      <h2 className={s.title}>История</h2>

      {/* Вкладки */}
      <div className={s.tabs}>
        <button
          className={`${s.tab} ${activeTab === "bets" ? s.active : ""}`}
          onClick={() => {
            handleTabChange("bets");
            setPage(1);
          }}
        >
          Ставки
        </button>
        <button
          className={`${s.tab} ${activeTab === "payments" ? s.active : ""}`}
          onClick={() => {
            handleTabChange("payments");
            setPage(1);
          }}
        >
          Платежи
        </button>
      </div>

      {/* Гармошка с фильтрами */}
      <div className={s.filterAccordion}>
        <button
          className={s.filterToggle}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <span>Фильтры</span>
          <span className={`${s.arrow} ${isFilterOpen ? s.open : ""}`}>⋁</span>
        </button>

        {isFilterOpen && (
          <div className={s.filterPanel}>
            <div className={s.filterRow}>
              <div className={s.filterGroup}>
                <label>Дата от</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </div>
              <div className={s.filterGroup}>
                <label>Дата до</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </div>
            </div>

            {activeTab === "bets" && (
              <>
                <div className={s.filterGroup}>
                  <label>Игра</label>
                  <input
                    type="text"
                    placeholder="Название игры"
                    value={filters.game || ""}
                    onChange={(e) => setFilters({ ...filters, game: e.target.value })}
                  />
                </div>
                <div className={s.filterGroup}>
                  <label>Результат</label>
                  <select
                    value={filters.result || ""}
                    onChange={(e) => setFilters({ ...filters, result: e.target.value as any })}
                  >
                    <option value="">Все</option>
                    <option value="win">Победа</option>
                    <option value="lose">Проигрыш</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === "payments" && (
              <div className={s.filterGroup}>
                <label>Статус</label>
                <select
                  value={filters.status || ""}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                >
                  <option value="">Все</option>
                  <option value="success">Успешно</option>
                  <option value="pending">Ожидание</option>
                  <option value="canceled">Отменено</option>
                </select>
              </div>
            )}

            <div className={s.filterActions}>
              <button onClick={resetFilters} className={s.resetBtn}>
                Сбросить
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Десктоп: Таблица */}
      <div className={s.desktop}>
        {loading ? (
          <p className={s.loading}>Загрузка...</p>
        ) : (
          <>
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
                    paginatedData.map((item: any) => (
                      <tr key={item.id}>
                        {activeTab === "bets" ? (
                          <>
                            <td>{item.game}</td>
                            <td>{item.bet} ₸</td>
                            <td>
                              {item.result === "win" ? (
                                <span className={s.win}>Победа</span>
                              ) : (
                                <span className={s.loss}>Проигрыш</span>
                              )}
                            </td>
                            <td>{item.amountWon} ₸</td>
                            <td>{new Date(item.createdAt).toLocaleString("ru-RU")}</td>
                          </>
                        ) : (
                          <>
                            <td>{item.amount} ₸</td>
                            <td>
                              {item.status === "success" ? (
                                <span className={s.success}>Успешно</span>
                              ) : item.status === "canceled" ? (
                                <span className={s.canceled}>Отменено</span>
                              ) : (
                                <span className={s.pending}>Ожидание</span>
                              )}
                            </td>
                            <td>{new Date(item.createdAt).toLocaleString("ru-RU")}</td>
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

      {/* Мобильная версия: Карточки */}
      <div className={s.mobile}>
        {loading ? (
          <p className={s.loading}>Загрузка...</p>
        ) : paginatedData.length > 0 ? (
          <div className={s.cards}>
            {paginatedData.map((item: any) => (
              <div key={item.id} className={s.card}>
                {activeTab === "bets" ? (
                  <>
                    <div className={s.cardRow}>
                      <span className={s.label}>Игра:</span>
                      <span>{item.game}</span>
                    </div>
                    <div className={s.cardRow}>
                      <span className={s.label}>Ставка:</span>
                      <span>{item.bet} ₸</span>
                    </div>
                    <div className={s.cardRow}>
                      <span className={s.label}>Результат:</span>
                      <span className={item.result === "win" ? s.win : s.loss}>
                        {item.result === "win" ? "Победа" : "Проигрыш"}
                      </span>
                    </div>
                    <div className={s.cardRow}>
                      <span className={s.label}>Выигрыш:</span>
                      <span>{item.amountWon} ₸</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={s.cardRow}>
                      <span className={s.label}>Сумма:</span>
                      <span>{item.amount} ₸</span>
                    </div>
                    <div className={s.cardRow}>
                      <span className={s.label}>Статус:</span>
                      <span
                        className={
                          item.status === "success"
                            ? s.success
                            : item.status === "canceled"
                            ? s.canceled
                            : s.pending
                        }
                      >
                        {item.status === "success"
                          ? "Успешно"
                          : item.status === "canceled"
                          ? "Отменено"
                          : "Ожидание"}
                      </span>
                    </div>
                  </>
                )}
                <div className={s.cardFooter}>
                  {new Date(item.createdAt).toLocaleString("ru-RU")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={s.emptyMobile}>Нет данных</p>
        )}

        {totalPages > 1 && (
          <div className={s.pagination}>
            <button onClick={handlePrev} disabled={page === 1} className={s.pageBtn}>
              Назад
            </button>
            <span className={s.pageInfo}>
              {page} / {totalPages}
            </span>
            <button onClick={handleNext} disabled={page === totalPages} className={s.pageBtn}>
              Вперёд
            </button>
          </div>
        )}
      </div>
    </div>
  );
}