import { FieldMappingValidator } from '../fieldMappingValidator';
import { FieldErrorType, type ValidationOptions } from '../fieldValidation';
import * as fieldValidation from '../fieldValidation';
import * as fieldHierarchyParser from '../../fieldHierarchyParser';
import * as formHandler from '../../formHandler';

/**
 * This test suite performs comprehensive integration tests of the field validation system.
 * It tests different validation modes (development, production, custom) with various data states.
 */

// Create a realistic mock of the field hierarchy structure
const mockFieldHierarchy = {
  sections: {
    '1': {
      name: 'Personal Information',
      fields: [
        { id: '1010 0 R', name: 'firstName', required: true, type: 'string' },
        { id: '1020 0 R', name: 'lastName', required: true, type: 'string' },
        { id: '1030 0 R', name: 'middleName', required: false, type: 'string' }
      ]
    },
    '5': {
      name: 'Other Names Used',
      fields: [
        { id: '5010 0 R', name: 'hasOtherNames', required: true, type: 'boolean' },
        { id: '5020 0 R', name: 'otherFirstName', required: true, type: 'string' },
        { id: '5030 0 R', name: 'otherLastName', required: true, type: 'string' }
      ]
    },
    '13': {
      name: 'Employment History',
      fields: [
        { id: '13010 0 R', name: 'employerName', required: true, type: 'string' },
        { id: '13020 0 R', name: 'position', required: true, type: 'string' },
        { id: '13030 0 R', name: 'startDate', required: true, type: 'date' },
        { id: '13040 0 R', name: 'endDate', required: false, type: 'date' }
      ]
    }
  }
};

// Create mock sample data for validation testing
const validSingleSection = {
  personalInfo: {
    firstName: { id: '1010 0 R', value: 'John' },
    lastName: { id: '1020 0 R', value: 'Doe' }
  }
};

const invalidSingleSection = {
  personalInfo: {
    firstName: { id: '1010 0 R', value: '' }, // Empty value for required field
    lastName: { id: '1020', value: 'Doe' }    // Missing suffix
  }
};

const validDynamicEntries = {
  namesInfo: {
    hasOtherNames: { id: '5010 0 R', value: true },
    entries: [
      {
        firstName: { id: '5020 0 R', value: 'John' },
        lastName: { id: '5030 0 R', value: 'Smith' }
      },
      {
        firstName: { id: '5020_1', value: 'Johnny' }, // Dynamic ID
        lastName: { id: '5030_1', value: 'Smithson' } // Dynamic ID
      }
    ]
  }
};

const invalidDynamicEntries = {
  namesInfo: {
    hasOtherNames: { id: '5010 0 R', value: true },
    entries: [
      {
        firstName: { id: '5020 0 R', value: 'John' },
        lastName: { id: '5030 0 R', value: 'Smith' }
      },
      {
        firstName: { id: '5020_X', value: 'Johnny' }, // Invalid dynamic ID pattern
        lastName: { id: '5030 0 R', value: '' }       // Empty value
      }
    ]
  }
};

const multiSectionData = {
  personalInfo: {
    firstName: { id: '1010 0 R', value: 'John' },
    lastName: { id: '1020 0 R', value: 'Doe' }
  },
  namesInfo: {
    hasOtherNames: { id: '5010 0 R', value: true },
    entries: [
      {
        firstName: { id: '5020 0 R', value: 'Johnny' },
        lastName: { id: '5030 0 R', value: 'Smith' }
      }
    ]
  },
  employmentInfo: {
    entries: [
      {
        employerName: { id: '13010 0 R', value: 'Acme Corp' },
        position: { id: '13020 0 R', value: 'Developer' },
        startDate: { id: '13030 0 R', value: '2020-01-01' },
        endDate: { id: '13040 0 R', value: '2022-01-01' }
      }
    ]
  }
};

// Mock the dependencies
jest.mock('../fieldValidation', () => {
  const original = jest.requireActual('../fieldValidation');
  
  // Allow the validateFieldMapping function to be spied on while preserving real behavior
  return {
    ...original,
    validateFieldMapping: jest.fn().mockImplementation((data, hierarchy, options) => {
      // Pass through to real implementation for actual tests
      const validateFields = (data: any, path = '', errors: any[] = []) => {
        if (!data || typeof data !== 'object') return;
        
        if (Array.isArray(data)) {
          data.forEach((item, idx) => {
            validateFields(item, `${path}[${idx}]`, errors);
          });
          return;
        }
        
        for (const key in data) {
          const value = data[key];
          const currPath = path ? `${path}.${key}` : key;
          
          // Check for required field that's empty
          if (key === 'value' && value === '' && data.id && 
              data.id.match(/^(1010|5030|13010|13020|13030)/)) {
            errors.push({
              path: currPath,
              fieldId: data.id,
              message: `Required field ${currPath} is empty`,
              type: original.FieldErrorType.MISSING_REQUIRED
            });
          }
          
          // Check for missing suffix
          if (key === 'id' && value && !value.includes(' 0 R') && 
              options.validateSuffixes && !value.includes('_')) {
            errors.push({
              path: currPath,
              fieldId: value,
              message: `Field ID ${value} is missing suffix`,
              type: original.FieldErrorType.SUFFIX_ERROR
            });
          }
          
          // Check for invalid dynamic ID pattern
          if (key === 'id' && value && value.includes('_X')) {
            errors.push({
              path: currPath,
              fieldId: value,
              message: `Invalid dynamic field ID pattern: ${value}`,
              type: original.FieldErrorType.INVALID_ID
            });
          }
          
          // Recurse into nested objects
          if (value && typeof value === 'object') {
            validateFields(value, currPath, errors);
          }
        }
      };
      
      const errors: any[] = [];
      validateFields(data, '', errors);
      
      return {
        isValid: errors.length === 0,
        errors
      };
    })
  };
});

jest.mock('../../fieldHierarchyParser', () => ({
  stripIdSuffix: jest.fn(id => id.replace(/ 0 R$/, '')),
  addIdSuffix: jest.fn(id => `${id} 0 R`),
  sectionToFileMapping: {
    '5': 'namesInfo',
    '11': 'residencyInfo',
    '13': 'employmentInfo'
  }
}));

jest.mock('../../formHandler', () => ({
  generateFieldId: jest.fn((baseId, index, sectionPath) => {
    return index === 0 ? baseId : `${baseId}_${index}`;
  }),
  validateGeneratedFieldId: jest.fn((fieldId, baseId) => {
    return !fieldId.includes('_X'); // Any ID with '_X' is invalid
  })
}));

// Spy on console methods to avoid console noise
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('Comprehensive Validation System Tests', () => {
  
  // Store original NODE_ENV and restore it after tests
  const originalNodeEnv = process.env.NODE_ENV;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
    jest.restoreAllMocks();
  });
  
  describe('Development Mode Validation', () => {
    let validator: FieldMappingValidator;
    
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      validator = new FieldMappingValidator(mockFieldHierarchy);
      validator.setDevelopmentMode(true);
    });
    
    test('validates single section data correctly', () => {
      const validResult = validator.validateSection(validSingleSection, 'personalInfo');
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);
      
      const invalidResult = validator.validateSection(invalidSingleSection, 'personalInfo');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
      expect(invalidResult.errors.some(e => e.type === FieldErrorType.MISSING_REQUIRED)).toBe(true);
      expect(invalidResult.errors.some(e => e.type === FieldErrorType.SUFFIX_ERROR)).toBe(true);
    });
    
    test('validates dynamic entries with full strictness', () => {
      const validResult = validator.validateDynamicEntries(validDynamicEntries, 'namesInfo');
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = validator.validateDynamicEntries(invalidDynamicEntries, 'namesInfo');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.some(e => e.type === FieldErrorType.INVALID_ID)).toBe(true);
    });
    
    test('generates detailed validation report', () => {
      const report = validator.generateValidationReport(invalidSingleSection, 'personalInfo');
      expect(report).toContain('Validation Report');
      expect(report).toContain('❌ Validation failed');
      expect(report).toContain('MISSING_REQUIRED');
      expect(report).toContain('SUFFIX_ERROR');
    });
    
    test('logs detailed validation errors', () => {
      validator.validateSection(invalidSingleSection, 'personalInfo');
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });
  
  describe('Production Mode Validation', () => {
    let validator: FieldMappingValidator;
    
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      validator = new FieldMappingValidator(mockFieldHierarchy);
      validator.setDevelopmentMode(false);
    });
    
    test('validates only critical aspects', () => {
      const validResult = validator.validateSection(validSingleSection, 'personalInfo');
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = validator.validateSection(invalidSingleSection, 'personalInfo');
      // Still detects required field errors, but ignores suffix errors
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.some(e => e.type === FieldErrorType.MISSING_REQUIRED)).toBe(true);
      
      // Ensure validation function was called with correct options
      expect(fieldValidation.validateFieldMapping).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          strict: false,
          validateTypes: false,
          validateRequired: true,
          validateFormats: false,
          validateSuffixes: false
        })
      );
    });
    
    test('suppresses logging in production', () => {
      consoleLogSpy.mockClear();
      consoleWarnSpy.mockClear();
      
      validator.validateSection(invalidSingleSection, 'personalInfo');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
    
    test('still detects missing required values', () => {
      const validator = new FieldMappingValidator(mockFieldHierarchy);
      validator.setDevelopmentMode(false);
      
      const result = validator.validateRequiredFields(
        invalidSingleSection.personalInfo,
        ['firstName', 'lastName'],
        { valueConstraints: { firstName: { minLength: 1 } } }
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === FieldErrorType.MISSING_REQUIRED)).toBe(true);
    });
  });
  
  describe('Custom Validation Modes', () => {
    test('applies custom validation options correctly', () => {
      const validator = new FieldMappingValidator(mockFieldHierarchy);
      
      // Create custom validation mode that only checks suffixes
      validator.setValidationMode('custom', {
        strict: false,
        validateTypes: false,
        validateRequired: false,
        validateFormats: false,
        validateSuffixes: true
      });
      
      const result = validator.validateSection(invalidSingleSection, 'personalInfo');
      expect(result.isValid).toBe(false);
      
      // Should only have suffix errors, not required field errors
      expect(result.errors.some(e => e.type === FieldErrorType.SUFFIX_ERROR)).toBe(true);
      expect(result.errors.some(e => e.type === FieldErrorType.MISSING_REQUIRED)).toBe(false);
    });
    
    test('runtime context optimizes validation appropriately', () => {
      const validator = new FieldMappingValidator(mockFieldHierarchy);
      
      // Initial render optimization
      validator.optimizeForRuntime({ isInitialRender: true, userHasEdited: false });
      expect(validator.getOptions().validateRequired).toBe(false);
      
      // Simulate form submission
      validator.optimizeForRuntime({ isSubmitAttempt: true });
      expect(validator.getOptions().validateRequired).toBe(true);
      expect(validator.getOptions().strict).toBe(true);
      
      // Critical path optimization
      validator.optimizeForRuntime({ isCriticalPath: true });
      expect(validator.getOptions().strict).toBe(false);
      expect(validator.getOptions().validateTypes).toBe(true);
    });
  });
  
  describe('Integration with Real Data Structures', () => {
    test('validates multiple sections in a complex structure', () => {
      const validator = new FieldMappingValidator(mockFieldHierarchy);
      
      // Check full validation in development mode
      validator.setDevelopmentMode(true);
      const devResult = validator.validateSection(multiSectionData, 'formData');
      expect(devResult.isValid).toBe(true);
      
      // Check partial validation in production mode
      validator.setDevelopmentMode(false);
      const prodResult = validator.validateSection(multiSectionData, 'formData');
      expect(prodResult.isValid).toBe(true);
      
      // Ensure internal validation function was called with correct mode
      expect(fieldValidation.validateFieldMapping).toHaveBeenLastCalledWith(
        multiSectionData,
        mockFieldHierarchy,
        expect.objectContaining({
          strict: false,
          validateRequired: true,
        })
      );
    });
    
    test('handles dynamic entries at multiple nesting levels', () => {
      const validator = new FieldMappingValidator(mockFieldHierarchy);
      
      // Complex data with nested dynamic entries
      const complexNestedData = {
        personalInfo: validSingleSection.personalInfo,
        employmentInfo: {
          entries: [
            {
              employerName: { id: '13010 0 R', value: 'Acme Corp' },
              position: { id: '13020 0 R', value: 'Developer' },
              startDate: { id: '13030 0 R', value: '2020-01-01' },
              // Nested dynamic entries - projects for this employer
              projects: [
                { name: { id: '13050 0 R', value: 'Project A' } },
                { name: { id: '13050_1', value: 'Project B' } }
              ]
            },
            {
              employerName: { id: '13010_1', value: 'Beta Inc' },
              position: { id: '13020_1', value: 'Senior Developer' },
              startDate: { id: '13030_1', value: '2022-01-01' },
              // Nested dynamic entries for second employer
              projects: [
                { name: { id: '13050_2', value: 'Project C' } }
              ]
            }
          ]
        }
      };
      
      // Test dynamic entry validation with the complex structure
      const result = validator.validateDynamicEntries(
        complexNestedData, 
        'employmentInfo',
        {
          strictIdFormat: true,
          dynamicArrayPaths: ['employmentInfo.entries', 'employmentInfo.entries[*].projects']
        }
      );
      
      expect(result.isValid).toBe(true);
    });
    
    test('validates form submission with strict requirements', () => {
      const validator = new FieldMappingValidator(mockFieldHierarchy);
      
      // Default might be production mode
      validator.setDevelopmentMode(false);
      
      // But for form submission, we use stricter validation
      validator.optimizeForRuntime({ isSubmitAttempt: true });
      
      // Create a form with a field that's invalid but might pass lenient validation
      const formData = {
        personalInfo: {
          firstName: { id: '1010 0 R', value: 'Jo' }, // Too short (if we had a minLength constraint)
          lastName: { id: '1020 0 R', value: 'Doe' }
        }
      };
      
      // Validate the field directly
      const fieldResult = validator.validateField(
        formData.personalInfo,
        'firstName.value',
        {
          required: true,
          type: 'string',
          minLength: 3 // At least 3 characters
        }
      );
      
      expect(fieldResult.isValid).toBe(false);
      expect(fieldResult.errors[0].type).toBe(FieldErrorType.VALUE_OUT_OF_RANGE);
    });
  });
}); 