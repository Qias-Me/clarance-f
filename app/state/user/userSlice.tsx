import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export interface UserModel {
  id: number;
  username: string;
  role: string;
}

export interface UserContext {
  isLoading: boolean;
  isLoggedIn: boolean;
  locale: string;
  error: string | null;
  isModalOpen: boolean; // New field to track if a modal is open
}

export interface UserState {
  user: UserModel | null;
  context: UserContext;
}

const initialStateValue: UserState = {
  user: null,
  context: {
    isLoading: true,
    isLoggedIn: false,
    locale: "en-US",
    error: null,
    isModalOpen: false, // Initialize modal state as closed
  }
};

const userSlice = createSlice({
  name: "user",
  initialState: { value: initialStateValue },
  reducers: {
    setUser: (state, action: PayloadAction<UserModel>) => {
      state.value.user = action.payload;
      state.value.context.isLoggedIn = true;
      state.value.context.isLoading = false;
      state.value.context.error = null;
    },
    setLogout: (state) => {
      state.value.user = null;
      state.value.context.isLoggedIn = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.value.context.isLoading = action.payload;
    },
    openModal: (state) => {
      state.value.context.isModalOpen = true; // Open modal
    },
    closeModal: (state) => {
      state.value.context.isModalOpen = false; // Close modal
    },
    resetState: (state) => {
      state.value = initialStateValue; // Reset state to initial
    },
  },
});

export const { setUser, setLogout, setLoading, openModal, closeModal, resetState } = userSlice.actions;

export default userSlice.reducer;

// Selectors
export const selectIsLoggedIn = (state: RootState) => state.user.value.context.isLoggedIn;
export const selectIsLoading = (state: RootState) => state.user.value.context.isLoading;
export const selectIsModalOpen = (state: RootState) => state.user.value.context.isModalOpen; // New selector for modal state
