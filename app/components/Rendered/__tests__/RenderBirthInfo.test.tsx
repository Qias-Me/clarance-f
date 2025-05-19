import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RenderBirthInfo } from '../RenderBirthInfo';
import { birthInfo } from 'app/state/contexts/sections/birthInfo';
import { SuffixOptions } from 'api/interfaces/FormInfo';

// Mock the sectionFieldsExtractor utilities
jest.mock('app/utils/sectionFieldsExtractor', () => {
  return {
    getFieldsBySection: jest.fn().mockImplementation((sectionNumber) => {
      // Return different mock data based on section number
      if (sectionNumber === 2) {
        return {
          fields: [
            {
              name: 'form1[0].section2[0].birthDate[0]',
              id: '9432 0 R',
              label: 'Date of Birth',
              value: '',
              type: 'PDFTextField',
              section: 2,
              sectionName: 'Date of Birth',
              confidence: 0.95
            },
            {
              name: 'form1[0].section2[0].isBirthDateEstimate[0]',
              id: '9431 0 R',
              label: 'Estimate',
              value: '',
              type: 'PDFCheckBox',
              section: 2,
              sectionName: 'Date of Birth',
              confidence: 0.95
            },
            // Additional field for section 2
            {
              name: 'form1[0].section2[0].additionalDateField[0]',
              id: '9433 0 R',
              label: 'Additional Date Field',
              value: '',
              type: 'PDFTextField',
              section: 2,
              sectionName: 'Date of Birth',
              confidence: 0.85
            }
          ],
          count: 3,
          sectionNumber: 2,
          sectionName: 'Date of Birth',
          types: { 'PDFTextField': 2, 'PDFCheckBox': 1 }
        };
      } else if (sectionNumber === 3) {
        return {
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
              type: 'PDFDropdown',
              section: 3,
              sectionName: 'Place of Birth',
              confidence: 0.95
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
            },
            // Additional field for section 3
            {
              name: 'form1[0].section3[0].additionalField[0]',
              id: '9447 0 R',
              label: 'Additional Place Field',
              value: '',
              type: 'PDFTextField',
              section: 3,
              sectionName: 'Place of Birth',
              confidence: 0.85
            }
          ],
          count: 5,
          sectionNumber: 3,
          sectionName: 'Place of Birth',
          types: { 'PDFTextField': 3, 'PDFDropdown': 2 }
        };
      }
      return { fields: [], count: 0, sectionNumber, sectionName: '', types: {} };
    }),
    SortBy: {
      ID: 'id',
      NAME: 'name',
      LABEL: 'label',
      TYPE: 'type',
      CONFIDENCE: 'confidence'
    }
  };
});

// Mock the field hierarchy parser utilities
jest.mock('app/utils/fieldHierarchyParser', () => {
  return {
    stripIdSuffix: jest.fn(id => id.replace(/ 0 R$/, ''))
  };
});

// Create test props that match the FormProps interface
const mockProps = {
  data: {
    ...birthInfo,
    birthDate: { ...birthInfo.birthDate, value: '2000-01-01' },
    isBirthDateEstimate: { ...birthInfo.isBirthDateEstimate, value: "No" as "Yes" | "No" },
    birthCity: { ...birthInfo.birthCity, value: 'Anytown' },
    birthCounty: { ...birthInfo.birthCounty, value: 'Anycounty' },
    birthState: { ...birthInfo.birthState, value: 'CA' },
    birthCountry: { ...birthInfo.birthCountry, value: 'USA' }
  },
  onInputChange: jest.fn(),
  onAddEntry: jest.fn(),
  onRemoveEntry: jest.fn(),
  isValidValue: jest.fn().mockReturnValue(true),
  getDefaultNewItem: jest.fn(),
  isReadOnlyField: jest.fn().mockReturnValue(false),
  path: 'birthInfo',
  formInfo: {
    // Add some basic form info required by the component
    employee_id: {
      value: 12345, // Changed to number to match Field<number>
      id: '12345',
      type: 'PDFTextField',
      label: 'Employee ID'
    },
    suffix: SuffixOptions.Sr
  }
};

describe('RenderBirthInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders section headers correctly', () => {
    render(<RenderBirthInfo {...mockProps} />);
    
    // Check for section headers
    expect(screen.getByText('SECTION 2: Date of Birth')).toBeInTheDocument();
    expect(screen.getByText('SECTION 3: Place of Birth')).toBeInTheDocument();
  });

  test('renders the date of birth fields correctly', () => {
    render(<RenderBirthInfo {...mockProps} />);
    
    // Check date of birth field
    const dateInput = screen.getByLabelText('Date of Birth');
    expect(dateInput).toBeInTheDocument();
    expect(dateInput).toHaveValue('2000-01-01');
    
    // Check estimated checkbox
    const estimateCheckbox = screen.getByLabelText('Estimated Date');
    expect(estimateCheckbox).toBeInTheDocument();
    expect(estimateCheckbox).not.toBeChecked();
  });

  test('renders the place of birth fields correctly', () => {
    render(<RenderBirthInfo {...mockProps} />);
    
    // Check city field
    const cityInput = screen.getByLabelText('City');
    expect(cityInput).toBeInTheDocument();
    expect(cityInput).toHaveValue('Anytown');
    
    // Check county field
    const countyInput = screen.getByLabelText('County');
    expect(countyInput).toBeInTheDocument();
    expect(countyInput).toHaveValue('Anycounty');
    
    // Check state dropdown
    const stateSelect = screen.getByLabelText('State');
    expect(stateSelect).toBeInTheDocument();
    expect(stateSelect).toHaveValue('CA');
    
    // Check country dropdown
    const countrySelect = screen.getByLabelText('Country');
    expect(countrySelect).toBeInTheDocument();
    expect(countrySelect).toHaveValue('USA');
  });

  test('renders additional fields from section 2 and 3', () => {
    render(<RenderBirthInfo {...mockProps} />);
    
    // Check for additional fields from mock data
    expect(screen.getByLabelText('Additional Date Field')).toBeInTheDocument();
    expect(screen.getByLabelText('Additional Place Field')).toBeInTheDocument();
  });

  test('calls onInputChange when field values change', () => {
    render(<RenderBirthInfo {...mockProps} />);
    
    // Change date of birth
    const dateInput = screen.getByLabelText('Date of Birth');
    fireEvent.change(dateInput, { target: { value: '2001-02-03' } });
    expect(mockProps.onInputChange).toHaveBeenCalledWith('birthInfo.birthDate.value', '2001-02-03');
    
    // Toggle estimated checkbox
    const estimateCheckbox = screen.getByLabelText('Estimated Date');
    fireEvent.click(estimateCheckbox);
    expect(mockProps.onInputChange).toHaveBeenCalledWith('birthInfo.isBirthDateEstimate.value', 'Yes');
    
    // Change city
    const cityInput = screen.getByLabelText('City');
    fireEvent.change(cityInput, { target: { value: 'New City' } });
    expect(mockProps.onInputChange).toHaveBeenCalledWith('birthInfo.birthCity.value', 'New City');
    
    // Change state
    const stateSelect = screen.getByLabelText('State');
    fireEvent.change(stateSelect, { target: { value: 'NY' } });
    expect(mockProps.onInputChange).toHaveBeenCalledWith('birthInfo.birthState.value', 'NY');
  });

  test('handles field mapping for additional fields correctly', () => {
    render(<RenderBirthInfo {...mockProps} />);
    
    // Change an additional field from section 2
    const additionalDateField = screen.getByLabelText('Additional Date Field');
    fireEvent.change(additionalDateField, { target: { value: 'Additional Value' } });
    
    // Since our field is not in the interface directly, it should be mapped using the renderField logic
    // The exact behavior depends on our fieldNameMap in the component, but we can check the call happened
    expect(mockProps.onInputChange).toHaveBeenCalled();
    
    // Reset the mock to check the additional field from section 3
    mockProps.onInputChange.mockClear();
    
    const additionalPlaceField = screen.getByLabelText('Additional Place Field');
    fireEvent.change(additionalPlaceField, { target: { value: 'Another Value' } });
    expect(mockProps.onInputChange).toHaveBeenCalled();
  });

  test('handles read-only fields correctly', () => {
    // Create a new props object with isReadOnlyField returning true for birthCity
    const readOnlyProps = {
      ...mockProps,
      isReadOnlyField: (path: string) => path === 'birthInfo.birthCity.value'
    };
    
    render(<RenderBirthInfo {...readOnlyProps} />);
    
    // Check that birthCity is disabled
    const cityInput = screen.getByLabelText('City');
    expect(cityInput).toBeDisabled();
    
    // But birthCounty is not disabled
    const countyInput = screen.getByLabelText('County');
    expect(countyInput).not.toBeDisabled();
  });
}); 