import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import type { CreatePaymentResponse } from "../../shared/types/types";


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
  async (amount: number) => {
    const res = await api.post<CreatePaymentResponse>("/payments/create", { amount });
    return res.data;
  }
);

// Отменить платеж по токену (извлекается из paymentUrl)
export const cancelPayment = createAsyncThunk(
  "payments/cancel",
  async (token: string) => {
    const res = await api.post(`/payments/cancel/${token}`);
    return res.data;
  }
);

// Получить статус платежа по ID
export const getPaymentStatus = createAsyncThunk(
  "payments/status",
  async (paymentId: string) => {
    const res = await api.get<{ id: string; status: string; amount: number }>(`/payments/status/${paymentId}`);
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
