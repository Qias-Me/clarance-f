import {
  validateType,
  validateFieldId,
  validatePattern,
  validateRequired,
  validateFieldMapping,
  findFieldInHierarchy,
  FieldErrorType
} from '../fieldValidation';

// Mock the stripIdSuffix and addIdSuffix functions from fieldHierarchyParser
jest.mock('../../fieldHierarchyParser', () => ({
  stripIdSuffix: (id: string) => id.split(' ')[0],
  addIdSuffix: (id: string) => `${id} 0 R`
}));

// Mock the validateGeneratedFieldId function from formHandler
jest.mock('../../formHandler', () => ({
  validateGeneratedFieldId: jest.fn().mockReturnValue(true)
}));

describe('Field Validation Utilities', () => {
  describe('validateType', () => {
    test('validates string type correctly', () => {
      expect(validateType('test', 'string')).toBe(true);
      expect(validateType(123, 'string')).toBe(false);
      expect(validateType(true, 'string')).toBe(false);
    });

    test('validates number type correctly', () => {
      expect(validateType(123, 'number')).toBe(true);
      expect(validateType(123.45, 'number')).toBe(true);
      expect(validateType('123', 'number')).toBe(false);
      expect(validateType(NaN, 'number')).toBe(false);
    });

    test('validates boolean type correctly', () => {
      expect(validateType(true, 'boolean')).toBe(true);
      expect(validateType(false, 'boolean')).toBe(true);
      expect(validateType('true', 'boolean')).toBe(false);
      expect(validateType(0, 'boolean')).toBe(false);
    });

    test('validates object type correctly', () => {
      expect(validateType({}, 'object')).toBe(true);
      expect(validateType({ prop: 'value' }, 'object')).toBe(true);
      expect(validateType([], 'object')).toBe(false);
      expect(validateType('object', 'object')).toBe(false);
    });

    test('validates array type correctly', () => {
      expect(validateType([], 'array')).toBe(true);
      expect(validateType([1, 2, 3], 'array')).toBe(true);
      expect(validateType({}, 'array')).toBe(false);
      expect(validateType('array', 'array')).toBe(false);
    });

    test('validates date type correctly', () => {
      expect(validateType(new Date(), 'date')).toBe(true);
      expect(validateType('2023-01-01', 'date')).toBe(true);
      expect(validateType('invalid date', 'date')).toBe(false);
      expect(validateType(123, 'date')).toBe(false);
    });

    test('validates null type correctly', () => {
      expect(validateType(null, 'null')).toBe(true);
      expect(validateType(undefined, 'null')).toBe(false);
      expect(validateType({}, 'null')).toBe(false);
    });

    test('validates union types correctly', () => {
      expect(validateType('string', 'string|number')).toBe(true);
      expect(validateType(123, 'string|number')).toBe(true);
      expect(validateType(true, 'string|number')).toBe(false);
    });
  });

  describe('validateFieldId', () => {
    test('validates matching field IDs', () => {
      expect(validateFieldId('12345', '12345')).toBe(true);
      expect(validateFieldId('12345 0 R', '12345 0 R')).toBe(true);
    });

    test('validates field IDs with suffix handling', () => {
      expect(validateFieldId('12345', '12345 0 R', { 
        strict: true, 
        validateTypes: true,
        validateRequired: true,
        validateFormats: true,
        validateSuffixes: false
      })).toBe(true);
    });

    test('rejects mismatched field IDs', () => {
      expect(validateFieldId('12345', '54321')).toBe(false);
      expect(validateFieldId('12345 0 R', '54321 0 R')).toBe(false);
    });
  });

  describe('validatePattern', () => {
    test('validates string patterns', () => {
      expect(validatePattern('abc', 'abc')).toBe(true);
      expect(validatePattern('abc', 'def')).toBe(false);
    });

    test('validates regex patterns', () => {
      expect(validatePattern('abc123', /^[a-z]+\d+$/)).toBe(true);
      expect(validatePattern('123abc', /^[a-z]+\d+$/)).toBe(false);
    });

    test('handles null/undefined values', () => {
      expect(validatePattern(null as any, 'pattern')).toBe(false);
      expect(validatePattern(undefined as any, 'pattern')).toBe(false);
    });
  });

  describe('validateRequired', () => {
    test('validates string values', () => {
      expect(validateRequired('value')).toBe(true);
      expect(validateRequired('')).toBe(false);
    });

    test('validates number values', () => {
      expect(validateRequired(0)).toBe(true);
      expect(validateRequired(123)).toBe(true);
    });

    test('validates boolean values', () => {
      expect(validateRequired(false)).toBe(true);
      expect(validateRequired(true)).toBe(true);
    });

    test('validates object values', () => {
      expect(validateRequired({})).toBe(false); // Empty object considered invalid
      expect(validateRequired({ prop: 'value' })).toBe(true);
    });

    test('validates array values', () => {
      expect(validateRequired([])).toBe(false); // Empty array considered invalid
      expect(validateRequired([1, 2, 3])).toBe(true);
    });

    test('handles null/undefined values', () => {
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
    });
  });

  describe('findFieldInHierarchy', () => {
    const mockFieldHierarchy = {
      "5": {
        fields: [
          { id: "9500 0 R", name: "firstNameField" },
          { id: "9501 0 R", name: "lastNameField" }
        ]
      },
      "13": {
        fieldsByValuePattern: {
          "section13A": {
            pattern: "section13A",
            confidence: 0.8,
            fieldsByRegex: {
              "form1_0": {
                regex: "form1_0",
                confidence: 0.5,
                fields: [
                  { id: "13100 0 R", name: "employmentField" }
                ]
              }
            }
          }
        }
      }
    };

    test('finds field with exact ID match', () => {
      const result = findFieldInHierarchy("9500 0 R", mockFieldHierarchy);
      expect(result).toEqual({ id: "9500 0 R", name: "firstNameField" });
    });

    test('finds field with ID only (no suffix)', () => {
      const result = findFieldInHierarchy("9501", mockFieldHierarchy);
      expect(result).toEqual({ id: "9501 0 R", name: "lastNameField" });
    });

    test('finds field in nested structure', () => {
      const result = findFieldInHierarchy("13100", mockFieldHierarchy);
      expect(result).toEqual({ id: "13100 0 R", name: "employmentField" });
    });

    test('returns null for non-existent field ID', () => {
      const result = findFieldInHierarchy("99999", mockFieldHierarchy);
      expect(result).toBeNull();
    });
  });

  describe('validateFieldMapping', () => {
    const mockFieldHierarchy = {
      "5": {
        fields: [
          { 
            id: "9500 0 R", 
            name: "firstNameField",
            type: "PDFTextField"
          },
          { 
            id: "9501 0 R", 
            name: "lastNameField",
            type: "PDFTextField"
          }
        ]
      }
    };

    test('validates correct field mapping', () => {
      const contextData = {
        firstName: {
          id: "9500 0 R",
          value: "John",
          type: "PDFTextField"
        },
        lastName: {
          id: "9501 0 R",
          value: "Doe",
          type: "PDFTextField"
        }
      };

      const result = validateFieldMapping(contextData, mockFieldHierarchy);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects invalid field IDs', () => {
      const contextData = {
        firstName: {
          id: "9500 0 R",
          value: "John",
          type: "PDFTextField"
        },
        lastName: {
          id: "9999 0 R", // Invalid ID
          value: "Doe",
          type: "PDFTextField"
        }
      };

      const result = validateFieldMapping(contextData, mockFieldHierarchy);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe(FieldErrorType.INVALID_ID);
    });

    test('detects type mismatches', () => {
      const contextData = {
        firstName: {
          id: "9500 0 R",
          value: "John",
          type: "PDFRadioGroup" // Type mismatch
        }
      };

      const result = validateFieldMapping(contextData, mockFieldHierarchy);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe(FieldErrorType.TYPE_MISMATCH);
    });

    test('validates nested objects', () => {
      const contextData = {
        personalInfo: {
          name: {
            firstName: {
              id: "9500 0 R",
              value: "John",
              type: "PDFTextField"
            }
          }
        }
      };

      const result = validateFieldMapping(contextData, mockFieldHierarchy);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validates arrays of objects', () => {
      const contextData = {
        names: [
          {
            firstName: {
              id: "9500 0 R",
              value: "John",
              type: "PDFTextField"
            }
          },
          {
            firstName: {
              id: "9999 0 R", // Invalid ID in second array item
              value: "Jane",
              type: "PDFTextField"
            }
          }
        ]
      };

      const result = validateFieldMapping(contextData, mockFieldHierarchy);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].path).toBe('names[1].firstName');
    });
  });
}); 