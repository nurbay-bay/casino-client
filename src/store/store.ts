import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import paymentReducer from "./slices/paymentSlice";
import gameReducer from "./slices/gameSlice";
import historyReducer from "./slices/historySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    payments: paymentReducer,
    game: gameReducer,
    history: historyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
