import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import type { User, AuthResponse, RegisterData, LoginData } from "../../shared/types/types";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
};

// === THUNKS ===
export const register = createAsyncThunk("auth/register", async (data: RegisterData) => {
  const res = await api.post("/auth/register", data);
  return res.data;
});

export const verify = createAsyncThunk("auth/verify", async (data: { phone: string; code: string }) => {
  const res = await api.post<AuthResponse>("/auth/verify", data);
  localStorage.setItem("token", res.data.token);
  return res.data;
});

export const login = createAsyncThunk("auth/login", async (data: LoginData) => {
  const res = await api.post<AuthResponse>("/auth/login", data);
  localStorage.setItem("token", res.data.token);
  return res.data;
});

export const fetchProfile = createAsyncThunk("auth/profile", async () => {
  const res = await api.get<{ user: User }>("/auth/profile");
  return res.data.user;
});

// === SLICE ===
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (s) => {
        s.loading = true;
      })
      .addCase(register.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.user = a.payload.user;
        s.token = a.payload.token;
        s.loading = false;
      })
      .addCase(verify.fulfilled, (s, a) => {
        s.user = a.payload.user;
        s.token = a.payload.token;
        s.loading = false;
      })
      .addCase(fetchProfile.fulfilled, (s, a) => {
        s.user = a.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
