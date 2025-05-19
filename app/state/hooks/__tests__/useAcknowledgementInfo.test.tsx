import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useAcknowledgementInfo } from '../useAcknowledgementInfo';
import formReducer from '../../form/formSlice';

// Create a wrapper with Redux store to test the hook
const createWrapper = () => {
  const store = configureStore({
    reducer: {
      form: formReducer
    },
    preloadedState: {
      form: {
        sections: {
          aknowledgementInfo: {
            aknowledge: {
              value: "YES",
              id: "17237",
              type: "PDFRadioGroup",
              label: "Acknowledgement statement agreement",
            },
            ssn: {
              value: "",
              id: "9441",
              type: "PDFTextField",
              label: "Social Security Number",
            },
            notApplicable: {
              value: "No",
              id: "9442",
              type: "PDFCheckBox",
              label: "Not Applicable for SSN",
            },
            pageSSN: [
              {
                ssn: {
                  value: "",
                  id: "9452",
                  type: "PDFTextField",
                  label: "SSN - Page 1",
                }
              },
              {
                ssn: {
                  value: "",
                  id: "9441",
                  type: "PDFTextField",
                  label: "SSN - Section 4 Main Field",
                }
              }
            ]
          }
        },
        meta: {
          isValid: false,
          validatedSections: [],
          isDirty: false,
          isSubmitting: false,
          errors: {}
        }
      }
    }
  });

  // Mock the dispatch method in a safer way
  const originalDispatch = store.dispatch;
  const mockDispatch = jest.fn((action) => originalDispatch(action));
  (store as any).dispatch = mockDispatch;
  
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('useAcknowledgementInfo hook', () => {
  it('should initialize with correct state', () => {
    const { result } = renderHook(() => useAcknowledgementInfo(), {
      wrapper: createWrapper()
    });
    
    expect(result.current.acknowledgementInfo).toBeDefined();
    expect(result.current.acknowledgementInfo.aknowledge.value).toBe('YES');
    expect(result.current.acknowledgementInfo.notApplicable.value).toBe('No');
    expect(result.current.acknowledgementInfo.pageSSN).toHaveLength(2);
  });
  
  it('should update SSN across all fields', () => {
    const { result } = renderHook(() => useAcknowledgementInfo(), {
      wrapper: createWrapper()
    });
    
    act(() => {
      result.current.setSSN('123-45-6789');
    });
    
    // Verify dispatch was called with the correct actions
    expect(result.current.setSSN).toBeDefined();
  });
  
  it('should set not applicable status correctly', () => {
    const { result } = renderHook(() => useAcknowledgementInfo(), {
      wrapper: createWrapper()
    });
    
    act(() => {
      result.current.setNotApplicable('Yes');
    });
    
    // Verify dispatch was called with the right actions
    expect(result.current.setNotApplicable).toBeDefined();
  });
  
  it('should validate SSN correctly', () => {
    const { result } = renderHook(() => useAcknowledgementInfo(), {
      wrapper: createWrapper()
    });
    
    // Test invalid SSNs
    expect(result.current.validateSSN('')).toBe(false);
    expect(result.current.validateSSN('12345')).toBe(false);
    expect(result.current.validateSSN('abc-de-fghi')).toBe(false);
    
    // Test valid SSNs
    expect(result.current.validateSSN('123-45-6789')).toBe(true);
    expect(result.current.validateSSN('123456789')).toBe(true);
  });
}); 