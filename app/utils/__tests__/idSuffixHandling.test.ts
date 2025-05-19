/**
 * Tests for ID suffix handling utilities
 */
import { 
  updateIdFormat, 
  processFormFieldIds, 
  verifyFieldIdFormat, 
  prepareFormForSubmission, 
  prepareFormForStorage 
} from '../formHandler';
import { transformFieldId } from '../forms/FormEntryManager';

describe('ID Suffix Handling Utilities', () => {
  describe('transformFieldId', () => {
    describe('toPdfFormat', () => {
      it('should add "0 R" suffix when missing', () => {
        expect(transformFieldId.toPdfFormat('9502')).toBe('9502 0 R');
      });
      
      it('should not add suffix when already present', () => {
        expect(transformFieldId.toPdfFormat('9502 0 R')).toBe('9502 0 R');
      });
      
      it('should handle empty input', () => {
        expect(transformFieldId.toPdfFormat('')).toBe('');
        expect(transformFieldId.toPdfFormat(undefined as any)).toBe(undefined);
      });
      
      it('should fix duplicated suffixes', () => {
        expect(transformFieldId.toPdfFormat('9502 0 R 0 R')).toBe('9502 0 R');
      });
    });
    
    describe('toContextFormat', () => {
      it('should remove "0 R" suffix when present', () => {
        expect(transformFieldId.toContextFormat('9502 0 R')).toBe('9502');
      });
      
      it('should not modify id without suffix', () => {
        expect(transformFieldId.toContextFormat('9502')).toBe('9502');
      });
      
      it('should handle empty input', () => {
        expect(transformFieldId.toContextFormat('')).toBe('');
        expect(transformFieldId.toContextFormat(undefined as any)).toBe(undefined);
      });
      
      it('should remove multiple suffixes', () => {
        expect(transformFieldId.toContextFormat('9502 0 R 0 R')).toBe('9502');
      });
    });
    
    describe('isValidFormat', () => {
      it('should validate pdf format correctly', () => {
        expect(transformFieldId.isValidFormat('9502 0 R', 'pdf')).toBe(true);
        expect(transformFieldId.isValidFormat('9502', 'pdf')).toBe(false);
      });
      
      it('should validate context format correctly', () => {
        expect(transformFieldId.isValidFormat('9502', 'context')).toBe(true);
        expect(transformFieldId.isValidFormat('9502 0 R', 'context')).toBe(false);
      });
      
      it('should handle empty input', () => {
        expect(transformFieldId.isValidFormat('', 'pdf')).toBe(false);
        expect(transformFieldId.isValidFormat(undefined as any, 'context')).toBe(false);
      });
    });
    
    describe('areEquivalent', () => {
      it('should correctly identify equivalent IDs with different formats', () => {
        expect(transformFieldId.areEquivalent('9502', '9502 0 R')).toBe(true);
      });
      
      it('should handle identical IDs', () => {
        expect(transformFieldId.areEquivalent('9502', '9502')).toBe(true);
        expect(transformFieldId.areEquivalent('9502 0 R', '9502 0 R')).toBe(true);
      });
      
      it('should identify different IDs as not equivalent', () => {
        expect(transformFieldId.areEquivalent('9502', '9503')).toBe(false);
        expect(transformFieldId.areEquivalent('9502 0 R', '9503 0 R')).toBe(false);
      });
      
      it('should handle empty input', () => {
        expect(transformFieldId.areEquivalent('', '9502')).toBe(false);
        expect(transformFieldId.areEquivalent('9502', undefined as any)).toBe(false);
      });
    });
  });
  
  describe('formHandler utilities', () => {
    describe('updateIdFormat', () => {
      it('should format to PDF format when specified', () => {
        expect(updateIdFormat('9502', 'pdf')).toBe('9502 0 R');
      });
      
      it('should format to context format when specified', () => {
        expect(updateIdFormat('9502 0 R', 'context')).toBe('9502');
      });
      
      it('should use PDF format by default', () => {
        expect(updateIdFormat('9502')).toBe('9502 0 R');
      });
    });
    
    describe('processFormFieldIds', () => {
      const sampleFormData = {
        personalInfo: {
          firstName: 'John',
          id: '9502'
        },
        otherIds: [
          { name: 'ID1', id: '9503' },
          { name: 'ID2', id: '9504 0 R' }
        ]
      };
      
      it('should add suffix to all IDs when addSuffix is true', () => {
        const processed = processFormFieldIds(sampleFormData, true);
        expect(processed.personalInfo.id).toBe('9502 0 R');
        expect(processed.otherIds[0].id).toBe('9503 0 R');
        expect(processed.otherIds[1].id).toBe('9504 0 R');
      });
      
      it('should remove suffix from all IDs when addSuffix is false', () => {
        const processed = processFormFieldIds(sampleFormData, false);
        expect(processed.personalInfo.id).toBe('9502');
        expect(processed.otherIds[0].id).toBe('9503');
        expect(processed.otherIds[1].id).toBe('9504');
      });
      
      it('should handle null and undefined values', () => {
        const nullData = null;
        const undefinedField = { id: undefined };
        
        expect(processFormFieldIds(nullData, true)).toBe(null);
        expect(processFormFieldIds(undefinedField, true).id).toBe(undefined);
      });
    });
    
    describe('verifyFieldIdFormat', () => {
      const mixedFormatData = {
        personalInfo: {
          id: '9502'
        },
        otherIds: [
          { id: '9503 0 R' },
          { id: '9504' }
        ]
      };
      
      it('should detect pdf format violations correctly', () => {
        const { isValid, invalidIds } = verifyFieldIdFormat(mixedFormatData, 'pdf');
        expect(isValid).toBe(false);
        expect(invalidIds.length).toBe(2);
        expect(invalidIds.some(item => item.id === '9502')).toBe(true);
        expect(invalidIds.some(item => item.id === '9504')).toBe(true);
      });
      
      it('should detect context format violations correctly', () => {
        const { isValid, invalidIds } = verifyFieldIdFormat(mixedFormatData, 'context');
        expect(isValid).toBe(false);
        expect(invalidIds.length).toBe(1);
        expect(invalidIds.some(item => item.id === '9503 0 R')).toBe(true);
      });
      
      it('should report correct paths for invalid IDs', () => {
        const { invalidIds } = verifyFieldIdFormat(mixedFormatData, 'pdf');
        expect(invalidIds.some(item => item.path === 'personalInfo.id')).toBe(true);
        expect(invalidIds.some(item => item.path === 'otherIds[1].id')).toBe(true);
      });
    });
  });
}); 