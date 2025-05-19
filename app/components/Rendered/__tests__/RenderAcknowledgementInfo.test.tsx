import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RenderAcknowledgementInfo } from '../RenderAcknowledgementInfo';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import formReducer from '../../../state/form/formSlice';

// Mock Redux data
const createTestStore = () => {
  return configureStore({
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
};

// Mock form data for the component
const mockData = {
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
};

describe('RenderAcknowledgementInfo', () => {
  const mockOnInputChange = jest.fn();
  const mockIsValidValue = jest.fn(() => true);
  
  beforeEach(() => {
    mockOnInputChange.mockClear();
    mockIsValidValue.mockClear();
  });
  
  it('renders the component with correct structure', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <RenderAcknowledgementInfo
          data={mockData}
          onInputChange={mockOnInputChange}
          isValidValue={mockIsValidValue}
          path="aknowledgementInfo"
          formInfo={{}}
        />
      </Provider>
    );
    
    // Check that heading is present
    expect(screen.getByText(/Section 4 - Social Security Number/i)).toBeInTheDocument();
    
    // Check for label text
    expect(screen.getByText(/Not Applicable/i)).toBeInTheDocument();
    expect(screen.getByText(/Social Security Number/i)).toBeInTheDocument();
    
    // Check for inputs
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g., 123-45-6789/i)).toBeInTheDocument();
  });
  
  it('handles SSN input changes', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <RenderAcknowledgementInfo
          data={mockData}
          onInputChange={mockOnInputChange}
          isValidValue={mockIsValidValue}
          path="aknowledgementInfo"
          formInfo={{}}
        />
      </Provider>
    );
    
    const ssnInput = screen.getByPlaceholderText(/e.g., 123-45-6789/i);
    
    // Enter a valid SSN
    fireEvent.change(ssnInput, { target: { value: '123-45-6789' } });
    
    // Check that onInputChange was called for main SSN field
    expect(mockOnInputChange).toHaveBeenCalledWith('aknowledgementInfo.ssn.value', '123-45-6789');
    
    // Check that onInputChange was called twice more for the page SSN fields
    expect(mockOnInputChange).toHaveBeenCalledWith('aknowledgementInfo.pageSSN[0].ssn.value', '123-45-6789');
    expect(mockOnInputChange).toHaveBeenCalledWith('aknowledgementInfo.pageSSN[1].ssn.value', '123-45-6789');
  });
  
  it('handles Not Applicable checkbox changes', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <RenderAcknowledgementInfo
          data={mockData}
          onInputChange={mockOnInputChange}
          isValidValue={mockIsValidValue}
          path="aknowledgementInfo"
          formInfo={{}}
        />
      </Provider>
    );
    
    const checkbox = screen.getByRole('checkbox');
    
    // Check the Not Applicable box
    fireEvent.click(checkbox);
    
    // Check that onInputChange was called for notApplicable field
    expect(mockOnInputChange).toHaveBeenCalledWith('aknowledgementInfo.notApplicable.value', 'Yes');
    
    // Check that SSN fields were cleared when Not Applicable was checked
    expect(mockOnInputChange).toHaveBeenCalledWith('aknowledgementInfo.ssn.value', '');
    expect(mockOnInputChange).toHaveBeenCalledWith('aknowledgementInfo.pageSSN[0].ssn.value', '');
    expect(mockOnInputChange).toHaveBeenCalledWith('aknowledgementInfo.pageSSN[1].ssn.value', '');
  });
  
  it('disables SSN input when Not Applicable is checked', () => {
    const store = createTestStore();
    
    const dataWithNotApplicable = {
      ...mockData,
      notApplicable: {
        ...mockData.notApplicable,
        value: "Yes"
      }
    };
    
    render(
      <Provider store={store}>
        <RenderAcknowledgementInfo
          data={dataWithNotApplicable}
          onInputChange={mockOnInputChange}
          isValidValue={mockIsValidValue}
          path="aknowledgementInfo"
          formInfo={{}}
        />
      </Provider>
    );
    
    const ssnInput = screen.getByPlaceholderText(/e.g., 123-45-6789/i);
    
    // Check that the SSN input is disabled
    expect(ssnInput).toBeDisabled();
  });
}); 