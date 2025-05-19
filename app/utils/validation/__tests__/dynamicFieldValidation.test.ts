import { FieldMappingValidator } from '../fieldMappingValidator';
import { FieldErrorType } from '../fieldValidation';

// Mock the fieldHierarchyParser module
jest.mock('../../../utils/fieldHierarchyParser', () => ({
  stripIdSuffix: jest.fn((id) => id.replace(/ 0 R$/, '')),
  addIdSuffix: jest.fn((id) => `${id} 0 R`),
  sectionToFileMapping: {
    5: 'namesInfo',
    11: 'residencyInfo',
    13: 'employmentInfo'
  }
}));

// Mock the formHandler module
jest.mock('../../../utils/formHandler', () => ({
  generateFieldId: jest.fn((baseId, index, sectionPath) => {
    // Simple mock implementation for testing
    if (index === 0) return baseId;
    
    // Mock section-specific ID generation
    if (sectionPath === 'namesInfo') {
      // For namesInfo, subtract 14 for each index
      const numericId = parseInt(baseId, 10);
      return (numericId - (14 * index)).toString();
    } else if (sectionPath === 'residencyInfo') {
      // For residencyInfo, subtract 12 for each index
      const numericId = parseInt(baseId, 10);
      return (numericId - (12 * index)).toString();
    }
    
    // Default fallback
    return `${baseId}_${index}`;
  }),
  validateGeneratedFieldId: jest.fn(() => true)
}));

describe('Dynamic Field Validation Tests', () => {
  let validator: FieldMappingValidator;
  
  beforeEach(() => {
    // Create a new validator instance with mock field hierarchy
    validator = new FieldMappingValidator({
      section5: {
        fields: [
          { id: '9500', type: 'text', required: true },
          { id: '9501', type: 'text', required: true }
        ]
      },
      section11: {
        fields: [
          { id: '11100', type: 'text', required: true },
          { id: '11101', type: 'date', required: true }
        ]
      }
    });
  });
  
  it('should validate dynamic entries with correct IDs', () => {
    // Test data with correctly generated IDs for namesInfo (section 5)
    const contextData = {
      namesInfo: [
        {
          lastName: { id: '9500', value: 'Smith' },
          firstName: { id: '9501', value: 'John' }
        },
        {
          lastName: { id: '9486', value: 'Smith' },  // 9500 - 14
          firstName: { id: '9487', value: 'Jane' }   // 9501 - 14
        }
      ]
    };
    
    const result = validator.validateDynamicEntries(contextData, 'namesInfo');
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  it('should detect incorrect IDs in dynamic entries', () => {
    // Test data with incorrectly generated IDs for namesInfo (section 5)
    const contextData = {
      namesInfo: [
        {
          lastName: { id: '9500', value: 'Smith' },
          firstName: { id: '9501', value: 'John' }
        },
        {
          lastName: { id: '9499', value: 'Smith' },  // Incorrect ID (should be 9486)
          firstName: { id: '9487', value: 'Jane' }   // Correct ID
        }
      ]
    };
    
    const result = validator.validateDynamicEntries(contextData, 'namesInfo');
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].type).toBe(FieldErrorType.INVALID_ID);
    expect(result.errors[0].fieldId).toBe('9499');
    expect(result.errors[0].expectedId).toBe('9486');
  });
  
  it('should validate nested dynamic entries', () => {
    // Test data with nested dynamic arrays
    const contextData = {
      residencyInfo: [
        {
          address: { id: '11100', value: '123 Main St' },
          dates: [
            { 
              from: { id: '11101', value: '2020-01-01' },
              to: { id: '11102', value: '2021-01-01' }
            },
            {
              from: { id: '11089', value: '2019-01-01' },  // 11101 - 12
              to: { id: '11090', value: '2020-01-01' }     // 11102 - 12
            }
          ]
        }
      ]
    };
    
    const result = validator.validateDynamicEntries(contextData, 'residencyInfo', {
      dynamicArrayPaths: ['residencyInfo', 'residencyInfo[*].dates']
    });
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  it('should validate suffix format when strictIdFormat is true', () => {
    // Test data with missing "0 R" suffixes
    const contextData = {
      namesInfo: [
        {
          lastName: { id: '9500 0 R', value: 'Smith' },  // Correct suffix
          firstName: { id: '9501', value: 'John' }       // Missing suffix
        }
      ]
    };
    
    const result = validator.validateDynamicEntries(contextData, 'namesInfo', {
      strictIdFormat: true
    });
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].type).toBe(FieldErrorType.SUFFIX_ERROR);
    expect(result.errors[0].fieldId).toBe('9501');
  });
  
  it('should ignore empty entries when ignoreEmptyEntries is true', () => {
    // Test data with an empty entry
    const contextData = {
      namesInfo: [
        {
          lastName: { id: '9500', value: 'Smith' },
          firstName: { id: '9501', value: 'John' }
        },
        {}, // Empty entry
        {
          lastName: { id: '9472', value: 'Doe' },    // 9500 - (14 * 2)
          firstName: { id: '9473', value: 'Jane' }   // 9501 - (14 * 2)
        }
      ]
    };
    
    const result = validator.validateDynamicEntries(contextData, 'namesInfo', {
      ignoreEmptyEntries: true
    });
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  it('should detect missing entries when validateArrayIndices is true', () => {
    // Test data with gaps in the array
    const contextData = {
      namesInfo: [
        {
          lastName: { id: '9500', value: 'Smith' },
          firstName: { id: '9501', value: 'John' }
        },
        undefined, // Gap in the array
        {
          lastName: { id: '9472', value: 'Doe' },    // 9500 - (14 * 2)
          firstName: { id: '9473', value: 'Jane' }   // 9501 - (14 * 2)
        }
      ]
    };
    
    const result = validator.validateDynamicEntries(contextData, 'namesInfo', {
      validateArrayIndices: true,
      ignoreEmptyEntries: false
    });
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].type).toBe(FieldErrorType.OTHER);
    expect(result.errors[0].message).toContain('Missing entry at index 1');
  });
}); 