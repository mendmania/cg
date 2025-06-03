// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";

// If you add more slices in the future, import and add them here.
export const store = configureStore({
  reducer: {
    user: userReducer,
    // e.g. polls: pollsReducer, questions: questionsReducer, etc.
  },
});

// Infer RootState & AppDispatch from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
