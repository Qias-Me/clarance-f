// src/state/store.js

import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import stepperReducer from "./user/formSlice"; // Note: fixed typo from "formSice" to "formSlice"

// Create and export the store directly
const store = configureStore({
  reducer: {
    user: userReducer,
    stepper: stepperReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
