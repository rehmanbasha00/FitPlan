import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AuthUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null
};

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  const res = await fetch('/api/auth/me');
  if (!res.ok) return rejectWithValue('Not authenticated');
  const data = (await res.json()) as { user: AuthUser };
  return data.user;
});

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload: { name: string; email: string; password: string; phone: string; otp: string; channel?: 'phone' | 'email' }, { rejectWithValue }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, action: 'verify' })
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message ?? 'Registration failed');
    return data.user as AuthUser;
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message ?? 'Login failed');
    return data.user as AuthUser;
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.status = 'failed';
        state.user = null;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Registration failed';
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Login failed';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
      });
  }
});

export default authSlice.reducer;
