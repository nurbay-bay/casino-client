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

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (data: { oldPassword: string; newPassword: string }) => {
    await api.post("/auth/change-password", data);
    return true;
  }
);

export const requestPhoneChange = createAsyncThunk(
  "auth/requestPhoneChange",
  async (newPhone: string) => {
    const res = await api.post("/auth/change-phone", { newPhone });
    return res.data;
  }
);

export const verifyPhoneChange = createAsyncThunk(
  "auth/verifyPhoneChange",
  async (code: string) => {
    const res = await api.post("/auth/verify-phone-change", { code });
    return res.data;
  }
);

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
      })

      .addCase(changePassword.fulfilled, (s) => {
        s.error = null;
      })
      .addCase(requestPhoneChange.fulfilled, (s) => {
        s.error = null;
      })
      .addCase(verifyPhoneChange.fulfilled, (s, a) => {
        if (s.user) s.user.phone = a.payload.phone; // если бэк возвращает
        s.error = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
