import { configureStore } from '@reduxjs/toolkit';
import { importApi } from './api/import-api';
import { importReducer } from './slices/import-slice';

export const store = configureStore({
  reducer: {
    importFlow: importReducer,
    [importApi.reducerPath]: importApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(importApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
