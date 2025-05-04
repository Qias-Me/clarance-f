import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export interface StepperContext {
  currentStep: number;
  totalSteps: number;
}

export interface StepperState {
  stepper: StepperContext;
}

const initialStateValue: StepperState = {
  stepper: {
    currentStep: 29,
    totalSteps: 30, // Assuming there are 5 steps by default, adjust as necessary
  }
};


const stepperSlice = createSlice({
  name: "stepper",
  initialState: { value: initialStateValue },
  reducers: {
    goToNextStep: (state) => {
      if (state.value.stepper.currentStep < state.value.stepper.totalSteps - 1) {
        state.value.stepper.currentStep += 1;
      }
    },
    goToPreviousStep: (state) => {
      if (state.value.stepper.currentStep > 0) {
        state.value.stepper.currentStep -= 1;
      }
    },
    setTotalSteps: (state, action: PayloadAction<number>) => {
      state.value.stepper.totalSteps = action.payload;
    },
    resetStepper: (state) => {
      state.value.stepper.currentStep = 0;
    },
    goToStep(state, action) {
      const step = action.payload;
      if (step >= 0 && step < state.value.stepper.totalSteps) { // Ensure the step is within valid range
        state.value.stepper.currentStep = step;
      }
    },
  },
});

export const {
  goToNextStep, goToPreviousStep, setTotalSteps, resetStepper, goToStep
} = stepperSlice.actions;

export default stepperSlice.reducer;

// Selectors
export const selectCurrentStep = (state: RootState) => state.stepper.value.stepper.currentStep;
export const selectTotalSteps = (state: RootState) => state.stepper.value.stepper.totalSteps;
