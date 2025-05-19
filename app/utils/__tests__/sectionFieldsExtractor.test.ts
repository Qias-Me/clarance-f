import { 
  getFieldsBySection, 
  getAllSectionFields, 
  findSectionsByFieldCriteria,
  SortBy,
  SortDirection
} from '../sectionFieldsExtractor';
import { loadFieldHierarchy } from '../fieldHierarchyParser';
import type { FieldMetadata } from '../fieldHierarchyParser';

// Mock the field hierarchy parser
jest.mock('../fieldHierarchyParser', () => {
  // Create a mock field hierarchy with test data
  const mockFieldHierarchy = {
    'form1': {
      regex: 'form1',
      confidence: 0.9,
      fields: [
        // Section 1 fields (Personal Info)
        {
          name: 'form1[0].section1[0].firstName[0]',
          id: '1001 0 R',
          label: 'First Name',
          value: '',
          type: 'PDFTextField',
          section: 1,
          sectionName: 'Personal Information',
          confidence: 0.95
        },
        {
          name: 'form1[0].section1[0].lastName[0]',
          id: '1002 0 R',
          label: 'Last Name',
          value: '',
          type: 'PDFTextField',
          section: 1,
          sectionName: 'Personal Information',
          confidence: 0.95
        },
        {
          name: 'form1[0].section1[0].middleName[0]',
          id: '1003 0 R',
          label: 'Middle Name',
          value: '',
          type: 'PDFTextField',
          section: 1,
          sectionName: 'Personal Information',
          confidence: 0.9
        },
        // Section 5 fields (Other Names)
        {
          name: 'form1[0].section5[0].otherName1[0]',
          id: '5001 0 R',
          label: 'Have you used any other names?',
          value: 'NO',
          type: 'PDFRadioButton',
          section: 5,
          sectionName: 'Other Names Used',
          confidence: 0.9
        },
        {
          name: 'form1[0].section5[0].subsection1[0].otherFirstName[0]',
          id: '5002 0 R',
          label: 'Other First Name',
          value: '',
          type: 'PDFTextField',
          section: 5,
          sectionName: 'Other Names Used',
          confidence: 0.85
        },
        {
          name: 'form1[0].section5[0].subsection1[0].otherLastName[0]',
          id: '5003 0 R',
          label: 'Other Last Name',
          value: '',
          type: 'PDFTextField',
          section: 5,
          sectionName: 'Other Names Used',
          confidence: 0.85
        },
        {
          name: 'form1[0].section5[0].subsection2[0].otherFirstName[0]',
          id: '5004 0 R',
          label: 'Other First Name',
          value: '',
          type: 'PDFTextField',
          section: 5,
          sectionName: 'Other Names Used',
          confidence: 0.75
        },
        // Section 13 fields (Employment)
        {
          name: 'form1[0].section13[0].employment1[0]',
          id: '13001 0 R',
          label: 'Employment Type',
          value: '',
          type: 'PDFDropDown',
          section: 13,
          sectionName: 'Employment Activities',
          confidence: 0.9
        },
        {
          name: 'form1[0].section13[0].employmentStartDate[0]',
          id: '13002 0 R',
          label: 'Employment Start Date',
          value: '',
          type: 'PDFDateField',
          section: 13,
          sectionName: 'Employment Activities',
          confidence: 0.85
        }
      ]
    }
  };

  // Return mocked functions
  return {
    loadFieldHierarchy: jest.fn().mockReturnValue(mockFieldHierarchy),
    getFieldsForSection: jest.fn().mockImplementation((sectionNumber, hierarchy) => {
      return hierarchy.form1.fields.filter(field => field.section === sectionNumber);
    }),
    stripIdSuffix: jest.fn().mockImplementation(id => id.replace(/ 0 R$/, '')),
    FieldType: {
      TEXT: 'PDFTextField',
      CHECKBOX: 'PDFCheckBox',
      RADIO: 'PDFRadioButton',
      DROPDOWN: 'PDFDropDown',
      DATE: 'PDFDateField'
    }
  };
});

describe('Section Fields Extractor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFieldsBySection', () => {
    test('should extract fields for a specific section', () => {
      const result = getFieldsBySection(1);
      
      expect(result.sectionNumber).toBe(1);
      expect(result.sectionName).toBe('Personal Information');
      expect(result.fields.length).toBe(3);
      expect(result.count).toBe(3);
      expect(loadFieldHierarchy).toHaveBeenCalledTimes(1);
    });

    test('should sort fields by specified property', () => {
      const result = getFieldsBySection(5, {
        sortBy: SortBy.ID,
        sortDirection: SortDirection.ASC
      });
      
      expect(result.fields.length).toBe(4);
      expect(result.fields[0].id).toBe('5001 0 R');
      expect(result.fields[1].id).toBe('5002 0 R');
      expect(result.fields[2].id).toBe('5003 0 R');
      expect(result.fields[3].id).toBe('5004 0 R');
    });

    test('should sort fields in descending order when specified', () => {
      const result = getFieldsBySection(5, {
        sortBy: SortBy.ID,
        sortDirection: SortDirection.DESC
      });
      
      expect(result.fields.length).toBe(4);
      expect(result.fields[0].id).toBe('5004 0 R');
      expect(result.fields[1].id).toBe('5003 0 R');
      expect(result.fields[2].id).toBe('5002 0 R');
      expect(result.fields[3].id).toBe('5001 0 R');
    });

    test('should filter fields by type', () => {
      const result = getFieldsBySection(5, {
        filterByType: 'PDFTextField'
      });
      
      expect(result.fields.length).toBe(3);
      expect(result.fields.every(field => field.type === 'PDFTextField')).toBe(true);
    });

    test('should filter fields by multiple types', () => {
      const result = getFieldsBySection(5, {
        filterByType: ['PDFTextField', 'PDFRadioButton']
      });
      
      expect(result.fields.length).toBe(4);
      expect(result.fields.every(field => 
        field.type === 'PDFTextField' || field.type === 'PDFRadioButton'
      )).toBe(true);
    });

    test('should filter fields by confidence level', () => {
      const result = getFieldsBySection(5, {
        minConfidence: 0.85
      });
      
      expect(result.fields.length).toBe(3);
      expect(result.fields.every(field => field.confidence >= 0.85)).toBe(true);
    });

    test('should filter fields by search query on label', () => {
      const result = getFieldsBySection(1, {
        searchQuery: 'middle'
      });
      
      expect(result.fields.length).toBe(1);
      expect(result.fields[0].label).toBe('Middle Name');
    });

    test('should group fields by subsection when requested', () => {
      const result = getFieldsBySection(5, {
        groupBySubsection: true
      });
      
      expect(result.subsections).toBeDefined();
      expect(result.groupedFields).toBeDefined();
      
      if (result.subsections && result.groupedFields) {
        expect(Object.keys(result.groupedFields).length).toBeGreaterThan(1);
        expect(result.subsections.length).toBeGreaterThan(1);
        
        // Check if properly grouped
        const subsection1Fields = result.groupedFields['Subsection 1'] || [];
        const subsection2Fields = result.groupedFields['Subsection 2'] || [];
        
        expect(subsection1Fields.length).toBeGreaterThan(0);
        expect(subsection2Fields.length).toBeGreaterThan(0);
      }
    });

    test('should combine multiple filtering and sorting options', () => {
      const result = getFieldsBySection(5, {
        filterByType: 'PDFTextField',
        minConfidence: 0.8,
        sortBy: SortBy.CONFIDENCE,
        sortDirection: SortDirection.DESC
      });
      
      expect(result.fields.length).toBe(2);
      expect(result.fields[0].confidence).toBeGreaterThanOrEqual(result.fields[1].confidence);
      expect(result.fields.every(field => field.type === 'PDFTextField')).toBe(true);
      expect(result.fields.every(field => field.confidence >= 0.8)).toBe(true);
    });
  });

  describe('getAllSectionFields', () => {
    test('should return fields for all sections', () => {
      const result = getAllSectionFields();
      
      expect(Object.keys(result).length).toBe(30);
      expect(result[1].fields.length).toBe(3);
      expect(result[5].fields.length).toBe(4);
      expect(result[13].fields.length).toBe(2);
    });

    test('should apply the same options to all sections', () => {
      const result = getAllSectionFields({
        filterByType: 'PDFTextField'
      });
      
      expect(result[1].fields.length).toBe(3);
      expect(result[5].fields.length).toBe(3);
      expect(result[13].fields.length).toBe(0);
      
      // Check fields are of the correct type
      Object.values(result).forEach((section) => {
        section.fields.forEach((field: FieldMetadata) => {
          expect(field.type).toBe('PDFTextField');
        });
      });
    });
  });

  describe('findSectionsByFieldCriteria', () => {
    test('should find sections that match simple criteria', () => {
      const result = findSectionsByFieldCriteria({
        fieldType: 'PDFTextField'
      });
      
      expect(result.includes(1)).toBe(true);
      expect(result.includes(5)).toBe(true);
      expect(result.length).toBe(2);
    });

    test('should find sections with minimum field count', () => {
      const result = findSectionsByFieldCriteria({
        minFieldCount: 3
      });
      
      expect(result.includes(1)).toBe(true);
      expect(result.includes(5)).toBe(true);
      expect(result.length).toBe(2);
    });

    test('should find sections with fields matching name pattern', () => {
      const result = findSectionsByFieldCriteria({
        hasFieldWithName: 'subsection'
      });
      
      expect(result.includes(5)).toBe(true);
      expect(result.length).toBe(1);
    });

    test('should find sections with fields matching label pattern', () => {
      const result = findSectionsByFieldCriteria({
        hasFieldWithLabel: 'Employment'
      });
      
      expect(result.includes(13)).toBe(true);
      expect(result.length).toBe(1);
    });

    test('should combine multiple criteria', () => {
      const result = findSectionsByFieldCriteria({
        fieldType: 'PDFTextField',
        minFieldCount: 3
      });
      
      expect(result.includes(1)).toBe(true);
      expect(result.includes(5)).toBe(true);
      expect(result.length).toBe(2);
    });
  });
}); 