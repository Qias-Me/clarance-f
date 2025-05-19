// src/state/store.js

import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import stepperReducer from "./user/formSlice"; // Note: fixed typo from "formSice" to "formSlice"
import formReducer from "./form/formSlice";
import { enhancedIndexedDBMiddleware } from "./form/enhancedIndexedDBMiddleware";
import DynamicService from "../../api/service/dynamicService";

// Create the store with middleware
const store = configureStore({
  reducer: {
    user: userReducer,
    stepper: stepperReducer,
    form: formReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types in serializableCheck
        ignoredActions: ['form/initializeSection']
      }
    }).concat(enhancedIndexedDBMiddleware)
});

// Load form data from IndexedDB when store is created
// Using a setTimeout to ensure the store is fully initialized
setTimeout(async () => {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const dynamicService = new DynamicService();
      const response = await dynamicService.loadAllUserFormData();
      
      if (response.success && response.allData) {
        // Initialize each section in the Redux store
        Object.entries(response.allData).forEach(([sectionPath, data]) => {
          store.dispatch({
            type: 'form/initializeSection',
            payload: { sectionPath, data }
          });
        });
        
        console.log('Form data loaded from IndexedDB');
      } else {
        console.log('No form data found in IndexedDB');
      }
    }
  } catch (error) {
    console.error('Error loading form data from IndexedDB:', error);
  }
}, 0);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
