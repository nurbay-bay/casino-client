import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import API from '../../api/api';
import type { User } from '../../shared/types/types';

interface UserState {
  profile: User | null;
  loading: boolean;
}

const initialState: UserState = {
  profile: null,
  loading: false,
};

export const fetchProfile = createAsyncThunk('user/fetchProfile', async () => {
  const res = await API.get<{ user: User }>('/auth/profile');
  return res.data.user;
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateBalanceLocally(state, action: PayloadAction<number>) {
      if (state.profile) {
        state.profile.balance += action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { updateBalanceLocally } = userSlice.actions;
export default userSlice.reducer;


