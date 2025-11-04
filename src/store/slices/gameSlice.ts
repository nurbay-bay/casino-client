import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
import type { GameHistory, PlayResponse } from "../../shared/types/types";
import { fetchProfile } from "./authSlice";


interface GameState {
  loading: boolean;
  history: GameHistory[];
  lastResult: PlayResponse | null;
  error: string | null;
}

const initialState: GameState = {
  loading: false,
  history: [],
  lastResult: null,
  error: null,
};

// 🎰 Играть (слоты или плинко)
export const playGame = createAsyncThunk(
  "game/play",
  async (data: { game: "slots" | "plinko"; bet: number }, { dispatch }) => {
    const res = await api.post<PlayResponse>("/games/play", data);
    dispatch(fetchProfile()); // обновить баланс
    return res.data;
  }
);

// 📜 История игр
export const fetchGameHistory = createAsyncThunk("game/history", async () => {
  const res = await api.get<{ bets: GameHistory[] }>("/games/history");
  return res.data.bets;
});

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(playGame.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(playGame.fulfilled, (s, a) => {
        s.loading = false;
        s.lastResult = a.payload;
      })
      .addCase(playGame.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Ошибка игры";
      })
      .addCase(fetchGameHistory.fulfilled, (s, a) => {
        s.history = a.payload;
      });
  },
});

export default gameSlice.reducer;
