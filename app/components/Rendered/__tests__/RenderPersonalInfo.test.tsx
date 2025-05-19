import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RenderPersonalInfo from '../RenderPersonalInfo';
import { personalInfo } from 'app/state/contexts/sections/personalInfo';

// Mock the sectionFieldsExtractor utilities
jest.mock('app/utils/sectionFieldsExtractor', () => {
  return {
    getFieldsBySection: jest.fn().mockReturnValue({
      fields: [
        {
          name: 'form1[0].section1[0].firstName[0]',
          id: '9448 0 R',
          label: 'First name',
          value: '',
          type: 'PDFTextField',
          section: 1,
          sectionName: 'Personal Information',
          confidence: 0.95
        },
        {
          name: 'form1[0].section1[0].lastName[0]',
          id: '9449 0 R',
          label: 'Last Name',
          value: '',
          type: 'PDFTextField',
          section: 1,
          sectionName: 'Personal Information',
          confidence: 0.95
        },
        {
          name: 'form1[0].section1[0].middleName[0]',
          id: '9447 0 R',
          label: 'Middle name',
          value: '',
          type: 'PDFTextField',
          section: 1,
          sectionName: 'Personal Information',
          confidence: 0.90
        },
        {
          name: 'form1[0].section1[0].suffix[0]',
          id: '9435 0 R',
          label: 'Suffix',
          value: '',
          type: 'PDFDropdown',
          section: 1,
          sectionName: 'Personal Information',
          confidence: 0.95
        },
        // Additional field not in the PersonalInfo interface
        {
          name: 'form1[0].section1[0].additionalField[0]',
          id: '9999 0 R',
          label: 'Additional Field',
          value: '',
          type: 'PDFTextField',
          section: 1,
          sectionName: 'Personal Information',
          confidence: 0.85
        }
      ],
      count: 5,
      sectionNumber: 1,
      sectionName: 'Personal Information',
      types: { 'PDFTextField': 4, 'PDFDropdown': 1 }
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

// Mock the FormInfo interface to avoid type errors
jest.mock('api/interfaces/FormInfo', () => ({
  __esModule: true,
  SuffixOptions: {
    Jr: "Jr.",
    Sr: "Sr.",
    III: "III",
    IV: "IV",
    MakeASelection: "Make A Selection",
    None: "None"
  }
}));

describe('RenderPersonalInfo', () => {
  const mockProps = {
    data: {
      ...personalInfo,
      firstName: { ...personalInfo.firstName, value: 'John' },
      lastName: { ...personalInfo.lastName, value: 'Doe' },
      middleName: { ...personalInfo.middleName, value: '' },
      suffix: { ...personalInfo.suffix, value: '' }
    },
    onInputChange: jest.fn(),
    onAddEntry: jest.fn(),
    onRemoveEntry: jest.fn(),
    isValidValue: jest.fn().mockReturnValue(true),
    getDefaultNewItem: jest.fn(),
    isReadOnlyField: jest.fn().mockReturnValue(false),
    path: 'personalInfo',
    formInfo: { 
      employee_id: { 
        value: 12345, 
        id: '12345',
        type: 'PDFTextField',
        label: 'Employee ID'
      }, 
      suffix: "Sr." // Use string value instead of enum
    },
    actionType: 'view'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the basic personal information fields', () => {
    render(<RenderPersonalInfo {...mockProps} />);
    
    // Check header renders correctly
    expect(screen.getByText('SECTION 1: Personal Information')).toBeInTheDocument();
    
    // Check that the four main fields are rendered
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Middle Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Suffix/i)).toBeInTheDocument();
    
    // Verify firstName value is populated correctly
    expect(screen.getByLabelText(/First Name/i)).toHaveValue('John');
  });

  test('renders additional fields from section 1', () => {
    render(<RenderPersonalInfo {...mockProps} />);
    
    // Check for the additional section heading
    expect(screen.getByText('Additional Information')).toBeInTheDocument();
    
    // Check for the additional field that isn't part of the core PersonalInfo interface
    expect(screen.getByLabelText(/Additional Field/i)).toBeInTheDocument();
  });

  test('calls onInputChange when field value changes', () => {
    render(<RenderPersonalInfo {...mockProps} />);
    
    // Get the first name input and change its value
    const firstNameInput = screen.getByLabelText(/First Name/i);
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    
    // Verify the onInputChange callback was called with correct parameters
    expect(mockProps.onInputChange).toHaveBeenCalledWith('personalInfo.firstName.value', 'Jane');
  });

  test('handles non-standard field types correctly', () => {
    // Mock more complex fields for this test
    const extendedMock = {
      ...jest.requireMock('app/utils/sectionFieldsExtractor')
    };
    
    extendedMock.getFieldsBySection.mockReturnValueOnce({
      fields: [
        ...extendedMock.getFieldsBySection().fields,
        {
          name: 'form1[0].section1[0].checkbox[0]',
          id: '1111 0 R',
          label: 'Test Checkbox',
          value: 'NO',
          type: 'PDFCheckBox',
          section: 1,
          sectionName: 'Personal Information',
          confidence: 0.95
        },
        {
          name: 'form1[0].section1[0].radio[0]',
          id: '2222 0 R',
          label: 'Test Radio',
          value: 'NO',
          type: 'PDFRadioGroup',
          section: 1,
          sectionName: 'Personal Information',
          confidence: 0.95
        }
      ],
      count: 7,
      sectionNumber: 1,
      sectionName: 'Personal Information',
      types: { 'PDFTextField': 4, 'PDFDropdown': 1, 'PDFCheckBox': 1, 'PDFRadioGroup': 1 }
    });
    
    render(<RenderPersonalInfo {...mockProps} />);
    
    // Check if the additional fields are rendered
    expect(screen.getByText('Test Checkbox')).toBeInTheDocument();
    expect(screen.getByText('Test Radio')).toBeInTheDocument();
  });
}); 