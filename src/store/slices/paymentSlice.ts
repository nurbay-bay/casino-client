import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import { fetchProfile } from "./authSlice";


interface PaymentState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  loading: false,
  success: false,
  error: null,
};

export const createPayment = createAsyncThunk(
  "payments/create",
  async (amount: number, { dispatch }) => {
    const res = await api.post("/payments/create", { amount });
    // имитация успешного платежа через несколько секунд
    setTimeout(() => dispatch(fetchProfile()), 2000);
    return res.data;
  }
);

const paymentSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(createPayment.pending, (s) => {
      s.loading = true;
      s.success = false;
    });
    b.addCase(createPayment.fulfilled, (s) => {
      s.loading = false;
      s.success = true;
    });
    b.addCase(createPayment.rejected, (s, a) => {
      s.loading = false;
      s.error = a.error.message || "Ошибка пополнения";
    });
  },
});

export default paymentSlice.reducer;
