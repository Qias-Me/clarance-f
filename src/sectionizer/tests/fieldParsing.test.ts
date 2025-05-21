import { describe, test, expect } from '@jest/globals';
import { extractSectionInfo, extractSectionInfoFromField } from '../utils/fieldParsing.js';
import type { SectionInfo } from '../utils/fieldParsing.js';

describe('Field Parsing Utils', () => {
  describe('extractSectionInfo', () => {
    test('should extract section info from form section pattern', () => {
      const result = extractSectionInfo('form1[0].#subform[0].Section21[0].ControlField');
      
      expect(result).not.toBeNull();
      expect(result?.section).toBe(21);
      expect(result?.confidence).toBeGreaterThanOrEqual(0.9);
    });

    test('should extract section info from explicit pattern', () => {
      const result = extractSectionInfo('username_section:15_entry');
      
      expect(result).not.toBeNull();
      expect(result?.section).toBe(15);
      expect(result?.confidence).toBeGreaterThanOrEqual(0.9);
    });

    test('should extract section and subsection from subset pattern', () => {
      const result = extractSectionInfo('section_21_subset_2_field');
      
      expect(result).not.toBeNull();
      expect(result?.section).toBe(21);
      expect(result?.subsection).toBe('2');
      expect(result?.confidence).toBeGreaterThanOrEqual(0.9);
    });

    test('should extract section and subsection from section letter pattern', () => {
      const result = extractSectionInfo('section21A_field');
      
      expect(result).not.toBeNull();
      expect(result?.section).toBe(21);
      expect(result?.subsection).toBe('A');
      expect(result?.confidence).toBeGreaterThanOrEqual(0.9);
    });

    test('should extract section and entry from section entry pattern', () => {
      const result = extractSectionInfo('section_21_2_field');
      
      expect(result).not.toBeNull();
      expect(result?.section).toBe(21);
      expect(result?.entry).toBe(2);
      expect(result?.confidence).toBeGreaterThanOrEqual(0.9);
    });

    test('should extract section, subsection, and entry from section sub entry pattern', () => {
      const result = extractSectionInfo('Section17_1_2_field');
      
      expect(result).not.toBeNull();
      expect(result?.section).toBe(17);
      expect(result?.subsection).toBe('1');
      expect(result?.entry).toBe(2);
      expect(result?.confidence).toBeGreaterThanOrEqual(0.9);
    });

    test('should extract section and subsection from section sub pattern', () => {
      const result = extractSectionInfo('Section17_1_field');
      
      expect(result).not.toBeNull();
      expect(result?.section).toBe(17);
      expect(result?.subsection).toBe('1');
      expect(result?.entry).toBe(1); // Default value
      expect(result?.confidence).toBeGreaterThanOrEqual(0.9);
    });

    test('should extract from camel case pattern', () => {
      const result = extractSectionInfo('section13AEntry2Date');
      
      expect(result).not.toBeNull();
      expect(result?.section).toBe(13);
      expect(result?.subsection).toBe('A');
      expect(result?.entry).toBe(2);
      expect(result?.confidence).toBeGreaterThanOrEqual(0.9);
    });

    test('should extract from sectDot pattern', () => {
      const result = extractSectionInfo('sect13A.1Entry2StartDate');
      
      expect(result).not.toBeNull();
      expect(result?.section).toBe(13);
      expect(result?.subsection).toBe('A.1');
      expect(result?.entry).toBe(2);
      expect(result?.confidence).toBeGreaterThanOrEqual(0.9);
    });

    test('should extract from s-prefix pattern', () => {
      const result = extractSectionInfo('s-21_field_name');
      
      expect(result).not.toBeNull();
      expect(result?.section).toBe(21);
      expect(result?.confidence).toBeGreaterThanOrEqual(0.8);
    });

    test('should extract from basic section pattern', () => {
      const result = extractSectionInfo('this is section 13 field');
      
      expect(result).not.toBeNull();
      expect(result?.section).toBe(13);
      expect(result?.confidence).toBeGreaterThanOrEqual(0.7);
    });

    test('should return null for unrecognized formats', () => {
      const result = extractSectionInfo('some_random_field_name');
      expect(result).toBeNull();
    });

    test('should include pattern details when verbose is true', () => {
      interface ExtendedSectionInfo extends SectionInfo {
        matchDetails?: string;
      }
      
      const result = extractSectionInfo('section21A_field', { verbose: true }) as ExtendedSectionInfo | null;
      
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('matchDetails');
      expect(typeof result?.matchDetails).toBe('string');
    });

    test('should enforce minimum confidence threshold', () => {
      // Create a field that would normally be matched with low confidence
      // but should be rejected due to minConfidence
      const result = extractSectionInfo('this is section 13 field', { minConfidence: 0.9 });
      expect(result).toBeNull();
    });
  });

  describe('extractSectionInfoFromField', () => {
    test('should extract info from name property', () => {
      const field = { name: 'section21A_field', id: 'test1' };
      const result = extractSectionInfoFromField(field);
      
      expect(result).not.toBeNull();
      expect(result?.section).toBe(21);
      expect(result?.subsection).toBe('A');
    });

    test('should extract from label if name has no pattern', () => {
      const field = { 
        name: 'random_field', 
        label: 'Section 13 Details',
        id: 'test2'
      };
      const result = extractSectionInfoFromField(field);
      
      expect(result).not.toBeNull();
      expect(result?.section).toBe(13);
    });

    test('should extract from title if name and label have no pattern', () => {
      const field = { 
        name: 'random_field', 
        label: 'Random Label',
        title: 'Section 14 Entry',
        id: 'test3'
      };
      const result = extractSectionInfoFromField(field);
      
      expect(result).not.toBeNull();
      expect(result?.section).toBe(14);
    });

    test('should extract from other properties if needed', () => {
      const field = { 
        name: 'random_field', 
        label: 'Random Label',
        description: 'This is section 15 subsection B',
        id: 'test4'
      };
      const result = extractSectionInfoFromField(field);
      
      expect(result).not.toBeNull();
      expect(result?.section).toBe(15);
    });

    test('should return null if no pattern matches in any property', () => {
      const field = { 
        name: 'random_field', 
        label: 'Random Label',
        id: 'test5'
      };
      const result = extractSectionInfoFromField(field);
      
      expect(result).toBeNull();
    });

    test('should handle null/undefined fields', () => {
      expect(extractSectionInfoFromField(null)).toBeNull();
      expect(extractSectionInfoFromField(undefined)).toBeNull();
    });
  });
}); 