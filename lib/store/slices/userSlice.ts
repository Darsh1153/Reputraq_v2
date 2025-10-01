import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  plan: 'normal' | 'pro' | 'enterprise';
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'denied';
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    addKeyword: (state, action: PayloadAction<string>) => {
      if (state.user && !state.user.keywords.includes(action.payload)) {
        state.user.keywords.push(action.payload);
      }
    },
    removeKeyword: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.keywords = state.user.keywords.filter(keyword => keyword !== action.payload);
      }
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setUser,
  updateUser,
  addKeyword,
  removeKeyword,
  clearUser,
} = userSlice.actions;

export default userSlice.reducer;
