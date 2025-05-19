/// <reference types="jest" />

import { 
  generateFieldId, 
  generateSectionSpecificId, 
  validateGeneratedFieldId,
  processEntryFieldIds
} from '../formHandler';

describe('Dynamic Field ID Generation', () => {
  describe('generateFieldId', () => {
    test('should return original ID for index 0', () => {
      expect(generateFieldId('9500', 0)).toBe('9500');
      expect(generateFieldId('9500 0 R', 0, 'namesInfo')).toBe('9500');
    });

    test('should generate IDs for namesInfo (section 5) with correct pattern', () => {
      // First entry (index 0) - original ID
      expect(generateFieldId('9500', 0, 'namesInfo')).toBe('9500');
      
      // Second entry (index 1) - should adjust by -14
      expect(generateFieldId('9500', 1, 'namesInfo')).toBe('9486');
      expect(generateFieldId('9501', 1, 'namesInfo')).toBe('9487');
      
      // Third entry (index 2) - should adjust by -28
      expect(generateFieldId('9500', 2, 'namesInfo')).toBe('9472');
      
      // Test with suffix in ID
      expect(generateFieldId('9500 0 R', 1, 'namesInfo')).toBe('9486');
    });

    test('should generate IDs for residencyInfo (section 11) with correct pattern', () => {
      // Base ID for residencyInfo
      const baseResidenceId = '8500';
      
      // First entry (index 0) - original ID
      expect(generateFieldId(baseResidenceId, 0, 'residencyInfo')).toBe(baseResidenceId);
      
      // Second entry (index 1) - should adjust by -12
      expect(generateFieldId(baseResidenceId, 1, 'residencyInfo')).toBe('8488');
      
      // Third entry (index 2) - should adjust by -24
      expect(generateFieldId(baseResidenceId, 2, 'residencyInfo')).toBe('8476');
    });

    test('should generate IDs for unknown sections using fallback logic', () => {
      const baseId = '1234';
      // Unknown section should append index
      expect(generateFieldId(baseId, 1, 'unknownSection')).toBe(`${baseId}_1`);
      expect(generateFieldId(baseId, 2, 'unknownSection')).toBe(`${baseId}_2`);
    });
  });

  describe('generateSectionSpecificId', () => {
    test('should apply correct section-specific offsets', () => {
      // Section 5 (namesInfo)
      expect(generateSectionSpecificId('9500', 1, 5)).toBe('9486');
      expect(generateSectionSpecificId('9500', 2, 5)).toBe('9472');
      
      // Section 11 (residencyInfo)
      expect(generateSectionSpecificId('8500', 1, 11)).toBe('8488');
      
      // Section 13 (employmentInfo)
      expect(generateSectionSpecificId('7500', 1, 13)).toBe('7490');
      
      // Section 18 (relativesInfo)
      expect(generateSectionSpecificId('6500', 1, 18)).toBe('6484');
      
      // Section 19 (foreignContacts)
      expect(generateSectionSpecificId('5500', 1, 19)).toBe('5490');
    });

    test('should handle non-numeric IDs with a fallback pattern', () => {
      expect(generateSectionSpecificId('ABC123', 1, 5)).toBe('ABC123_1');
    });
    
    test('should handle zero or negative resulting IDs with a fallback pattern', () => {
      // Edge case: ID is too small and offset would make it negative
      expect(generateSectionSpecificId('5', 1, 5)).toBe('5_1');
    });
  });

  describe('validateGeneratedFieldId', () => {
    test('should validate against string patterns', () => {
      expect(validateGeneratedFieldId('9486', '9486')).toBe(true);
      expect(validateGeneratedFieldId('9486', '9487')).toBe(false);
    });

    test('should validate against regex patterns', () => {
      expect(validateGeneratedFieldId('9486', /^94\d+$/)).toBe(true);
      expect(validateGeneratedFieldId('9486', /^95\d+$/)).toBe(false);
    });

    test('should validate non-empty IDs when no pattern is provided', () => {
      expect(validateGeneratedFieldId('9486')).toBe(true);
      expect(validateGeneratedFieldId('')).toBe(false);
    });
  });

  describe('processEntryFieldIds', () => {
    test('should recursively process all field IDs in an entry', () => {
      const templateEntry = {
        lastName: {
          id: '9500',
          value: '',
          type: 'text',
          label: 'Last Name'
        },
        firstName: {
          id: '9501',
          value: '',
          type: 'text',
          label: 'First Name'
        },
        middleName: {
          id: '9502',
          value: '',
          type: 'text',
          label: 'Middle Name'
        },
        _id: 1 // This should be preserved
      };
      
      // Process for second entry (index 1)
      const processedEntry = processEntryFieldIds(templateEntry, 1, 'namesInfo');
      
      // _id should remain unchanged
      expect(processedEntry._id).toBe(1);
      
      // IDs should be updated according to pattern (-14 for namesInfo)
      expect(processedEntry.lastName.id).toBe('9486');
      expect(processedEntry.firstName.id).toBe('9487');
      expect(processedEntry.middleName.id).toBe('9488');
      
      // Other properties should remain unchanged
      expect(processedEntry.lastName.label).toBe('Last Name');
      expect(processedEntry.firstName.type).toBe('text');
      expect(processedEntry.middleName.value).toBe('');
    });
    
    test('should handle deeply nested field objects', () => {
      const nestedEntry = {
        personal: {
          name: {
            lastName: {
              id: '9500',
              value: '',
              type: 'text',
              label: 'Last Name'
            }
          },
          contact: {
            phone: {
              id: '9550',
              value: '',
              type: 'text',
              label: 'Phone'
            }
          }
        }
      };
      
      // Process for second entry (index 1)
      const processedEntry = processEntryFieldIds(nestedEntry, 1, 'namesInfo');
      
      // Check nested IDs were updated
      expect(processedEntry.personal.name.lastName.id).toBe('9486');
      expect(processedEntry.personal.contact.phone.id).toBe('9536');
    });
    
    test('should handle null/undefined values', () => {
      expect(processEntryFieldIds(null, 1, 'namesInfo')).toBeNull();
      expect(processEntryFieldIds(undefined, 1, 'namesInfo')).toBeUndefined();
    });
    
    test('should not modify non-object values', () => {
      expect(processEntryFieldIds('string', 1, 'namesInfo')).toBe('string');
      expect(processEntryFieldIds(123, 1, 'namesInfo')).toBe(123);
    });
  });
}); 