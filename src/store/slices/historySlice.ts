import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
import type { GameHistory, Payment } from "../../shared/types/types";
import type { RootState } from "../store";


interface HistoryState {
  games: GameHistory[];
  payments: Payment[];
  loading: boolean;
  error: string | null;
}

const initialState: HistoryState = {
  games: [],
  payments: [],
  loading: false,
  error: null,
};

// 🎮 Получить историю игр
export const fetchGameHistory = createAsyncThunk("history/games", async () => {
  const res = await api.get<{ bets: GameHistory[] }>("/games/history");
  return res.data.bets;
});

// 💳 Получить историю платежей
export const fetchPaymentHistory = createAsyncThunk(
  "history/payments",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    if (!userId) throw new Error("Неизвестный пользователь");
    const res = await api.get<{ payments: Payment[] }>(`/payments/user/${userId}`);
    return res.data.payments;
  }
);

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGameHistory.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchGameHistory.fulfilled, (s, a) => {
        s.loading = false;
        s.games = a.payload;
      })
      .addCase(fetchPaymentHistory.fulfilled, (s, a) => {
        s.payments = a.payload;
      })
      .addCase(fetchGameHistory.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Ошибка истории";
      });
  },
});

export default historySlice.reducer;
