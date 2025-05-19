import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RenderPlaceOfBirth from '../RenderPlaceOfBirth';
import { placeOfBirth } from 'app/state/contexts/sections/placeOfBirth';

// Mock the sectionFieldsExtractor utilities
jest.mock('app/utils/sectionFieldsExtractor', () => {
  return {
    getFieldsBySection: jest.fn().mockReturnValue({
      fields: [
        {
          name: 'form1[0].section3[0].birthCity[0]',
          id: '9446 0 R',
          label: 'City',
          value: '',
          type: 'PDFTextField',
          section: 3,
          sectionName: 'Place of Birth',
          confidence: 0.95
        },
        {
          name: 'form1[0].section3[0].birthCounty[0]',
          id: '9445 0 R',
          label: 'County',
          value: '',
          type: 'PDFTextField',
          section: 3,
          sectionName: 'Place of Birth',
          confidence: 0.95
        },
        {
          name: 'form1[0].section3[0].birthState[0]',
          id: '9443 0 R',
          label: 'State',
          value: '',
          type: 'PDFTextField',
          section: 3,
          sectionName: 'Place of Birth',
          confidence: 0.90
        },
        {
          name: 'form1[0].section3[0].birthCountry[0]',
          id: '9444 0 R',
          label: 'Country',
          value: '',
          type: 'PDFDropdown',
          section: 3,
          sectionName: 'Place of Birth',
          confidence: 0.95
        }
      ],
      count: 4,
      sectionNumber: 3,
      sectionName: 'Place of Birth'
    }),
    SortBy: {
      LABEL: 'label'
    }
  };
});

describe('RenderPlaceOfBirth Component', () => {
  const mockOnInputChange = jest.fn();
  const mockIsValidValue = jest.fn().mockReturnValue(true);
  const mockIsReadOnlyField = jest.fn().mockReturnValue(false);
  
  const renderComponent = (customProps = {}) => {
    const defaultProps = {
      data: placeOfBirth,
      onInputChange: mockOnInputChange,
      isValidValue: mockIsValidValue,
      isReadOnlyField: mockIsReadOnlyField,
      path: 'placeOfBirth'
    };
    
    return render(<RenderPlaceOfBirth {...defaultProps} {...customProps} />);
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText(/SECTION 3: Place of Birth/i)).toBeInTheDocument();
  });
  
  it('displays all fields', () => {
    renderComponent();
    expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/County/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/State/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
  });
  
  it('calls onInputChange when input value changes', () => {
    renderComponent();
    
    // Test input field change
    const cityInput = screen.getByLabelText(/City/i);
    fireEvent.change(cityInput, { target: { value: 'Boston' } });
    
    expect(mockIsValidValue).toHaveBeenCalledWith('placeOfBirth.birthCity.value', 'Boston');
    expect(mockOnInputChange).toHaveBeenCalledWith('placeOfBirth.birthCity.value', 'Boston');
  });
  
  it('calls onInputChange when select value changes', () => {
    renderComponent();
    
    // Test select field change
    const countrySelect = screen.getByLabelText(/Country/i);
    fireEvent.change(countrySelect, { target: { value: 'United States' } });
    
    expect(mockIsValidValue).toHaveBeenCalledWith('placeOfBirth.birthCountry.value', 'United States');
    expect(mockOnInputChange).toHaveBeenCalledWith('placeOfBirth.birthCountry.value', 'United States');
  });
  
  it('respects isReadOnlyField function', () => {
    const customIsReadOnlyField = jest.fn().mockImplementation(
      (field: string) => field === 'placeOfBirth.birthCity.value'
    );
    
    renderComponent({ isReadOnlyField: customIsReadOnlyField });
    
    const cityInput = screen.getByLabelText(/City/i);
    const countyInput = screen.getByLabelText(/County/i);
    
    expect(cityInput).toBeDisabled();
    expect(countyInput).not.toBeDisabled();
  });
}); 