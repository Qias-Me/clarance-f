import { mapContextToPdfFields } from '../contextToPdfFieldMapping';
import type { FieldHierarchy, FieldMetadata } from '../../../api/interfaces/FieldMetadata';
import type { ApplicantFormValues } from '../../../api/interfaces/formDefinition';

// Mock field hierarchy for testing
const createMockFieldHierarchy = (): FieldHierarchy => {
  // Create mock field metadata
  const fields: FieldMetadata[] = [
    // Personal info section fields (section 1)
    {
      name: 'form1[0].personalInfo[0].firstName[0]',
      id: '1001',
      label: 'First Name',
      value: '',
      type: 'PDFTextField',
      section: 1,
      sectionName: 'Personal Information',
      confidence: 1.0
    },
    {
      name: 'form1[0].personalInfo[0].lastName[0]',
      id: '1002',
      label: 'Last Name',
      value: '',
      type: 'PDFTextField',
      section: 1,
      sectionName: 'Personal Information',
      confidence: 1.0
    },
    {
      name: 'form1[0].personalInfo[0].middleName[0]',
      id: '1003',
      label: 'Middle Name',
      value: '',
      type: 'PDFTextField',
      section: 1,
      sectionName: 'Personal Information',
      confidence: 1.0
    },
    // Employment section fields with dynamic entries (section 13)
    {
      name: 'form1[0].employment[0].entries[0].employerName[0]',
      id: '2001',
      label: 'Employer Name',
      value: '',
      type: 'PDFTextField',
      section: 13,
      sectionName: 'Employment',
      confidence: 1.0
    },
    {
      name: 'form1[0].employment[0].entries[0].position[0]',
      id: '2002',
      label: 'Position',
      value: '',
      type: 'PDFTextField',
      section: 13,
      sectionName: 'Employment',
      confidence: 1.0
    },
    {
      name: 'form1[0].employment[0].entries[1].employerName[0]',
      id: '2003',
      label: 'Employer Name',
      value: '',
      type: 'PDFTextField',
      section: 13,
      sectionName: 'Employment',
      confidence: 1.0
    },
    {
      name: 'form1[0].employment[0].entries[1].position[0]',
      id: '2004',
      label: 'Position',
      value: '',
      type: 'PDFTextField',
      section: 13,
      sectionName: 'Employment',
      confidence: 1.0
    },
    // Nested field structure (section 7 - contact info)
    {
      name: 'form1[0].contactInfo[0].address.street[0]',
      id: '3001',
      label: 'Street',
      value: '',
      type: 'PDFTextField',
      section: 7,
      sectionName: 'Contact Information',
      confidence: 1.0
    },
    {
      name: 'form1[0].contactInfo[0].address.city[0]',
      id: '3002',
      label: 'City',
      value: '',
      type: 'PDFTextField',
      section: 7,
      sectionName: 'Contact Information',
      confidence: 1.0
    },
    {
      name: 'form1[0].contactInfo[0].address.state[0]',
      id: '3003',
      label: 'State',
      value: '',
      type: 'PDFTextField',
      section: 7,
      sectionName: 'Contact Information',
      confidence: 1.0
    },
    {
      name: 'form1[0].contactInfo[0].address.zipCode[0]',
      id: '3004',
      label: 'Zip Code',
      value: '',
      type: 'PDFTextField',
      section: 7,
      sectionName: 'Contact Information',
      confidence: 1.0
    },
    // Checkbox field (section 22 - police record)
    {
      name: 'form1[0].policeRecord[0].hasConvictions[0]',
      id: '4001',
      label: 'Have you ever been convicted',
      value: '',
      type: 'PDFCheckBox',
      section: 22,
      sectionName: 'Police Record',
      confidence: 1.0
    }
  ];

  // Create the field hierarchy
  return {
    'form1': {
      regex: 'form1',
      confidence: 1.0,
      fields
    }
  };
};

// For testing, we'll use a partial implementation of the context
// with just the properties needed for tests
interface TestContext {
  personalInfo?: {
    firstName?: any;
    lastName?: any;
    middleName?: any;
  };
  employmentInfo?: {
    entries?: Array<{
      employerName?: any;
      position?: any;
    }>;
  };
  contactInfo?: {
    address?: {
      street?: any;
      city?: any;
      state?: any;
      zipCode?: any;
    };
  };
  policeRecord?: {
    hasConvictions?: any;
  };
}

// Sample context data for testing
const createSampleContext = (): TestContext => {
  return {
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'Michael'
    },
    employmentInfo: {
      entries: [
        {
          employerName: 'Acme Corp',
          position: 'Software Engineer'
        },
        {
          employerName: 'Globex Inc',
          position: 'Senior Developer'
        }
      ]
    },
    contactInfo: {
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '90210'
      }
    },
    policeRecord: {
      hasConvictions: false
    }
  };
};

describe('mapContextToPdfFields', () => {
  test('should map simple fields correctly', () => {
    const fieldHierarchy = createMockFieldHierarchy();
    const context = createSampleContext();
    
    const result = mapContextToPdfFields(context as any, fieldHierarchy);
    
    // Check personal info field mappings
    expect(result['1001 0 R']).toBe('John');
    expect(result['1002 0 R']).toBe('Doe');
    expect(result['1003 0 R']).toBe('Michael');
  });
  
  test('should handle dynamic entries correctly', () => {
    const fieldHierarchy = createMockFieldHierarchy();
    const context = createSampleContext();
    
    const result = mapContextToPdfFields(context as any, fieldHierarchy);
    
    // Check employment entries mappings
    expect(result['2001 0 R']).toBe('Acme Corp');
    expect(result['2002 0 R']).toBe('Software Engineer');
    expect(result['2003 0 R']).toBe('Globex Inc');
    expect(result['2004 0 R']).toBe('Senior Developer');
  });
  
  test('should map nested object structures', () => {
    const fieldHierarchy = createMockFieldHierarchy();
    const context = createSampleContext();
    
    const result = mapContextToPdfFields(context as any, fieldHierarchy);
    
    // Check address field mappings
    expect(result['3001 0 R']).toBe('123 Main St');
    expect(result['3002 0 R']).toBe('Anytown');
    expect(result['3003 0 R']).toBe('CA');
    expect(result['3004 0 R']).toBe('90210');
  });
  
  test('should handle boolean values correctly', () => {
    const fieldHierarchy = createMockFieldHierarchy();
    const context = createSampleContext();
    
    const result = mapContextToPdfFields(context as any, fieldHierarchy);
    
    // Check checkbox field mapping
    expect(result['4001 0 R']).toBe('false');
  });
  
  test('should handle missing sections gracefully', () => {
    const fieldHierarchy = createMockFieldHierarchy();
    const context = {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe'
        // middleName is missing
      }
    };
    
    const result = mapContextToPdfFields(context as any, fieldHierarchy);
    
    // Should map existing fields
    expect(result['1001 0 R']).toBe('John');
    expect(result['1002 0 R']).toBe('Doe');
    // Missing fields should not be in the result
    expect(result['1003 0 R']).toBeUndefined();
  });
  
  test('should return empty object if context or fieldHierarchy is invalid', () => {
    const fieldHierarchy = createMockFieldHierarchy();
    const context = createSampleContext();
    
    // Test with null context
    expect(mapContextToPdfFields(null as any, fieldHierarchy)).toEqual({});
    
    // Test with null field hierarchy
    expect(mapContextToPdfFields(context as any, null as any)).toEqual({});
  });
}); 