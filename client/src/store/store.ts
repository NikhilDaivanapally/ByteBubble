import { configureStore, Middleware } from "@reduxjs/toolkit";
import { rootReducer } from "./rootReducer";
import { apiSlice } from "./slices/api";

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat(apiSlice.middleware as Middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export { store };
