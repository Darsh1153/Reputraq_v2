import { configureStore } from '@reduxjs/toolkit';
import newsSlice from './slices/newsSlice';
import userSlice from './slices/userSlice';

export const store = configureStore({
  reducer: {
    news: newsSlice,
    user: userSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
