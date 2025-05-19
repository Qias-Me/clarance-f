/**
 * Field Metadata Interface Tests
 * 
 * These tests validate that the interfaces can be used with sample data
 * matching expected patterns from field-hierarchy.json
 */

import { FieldType } from '../FieldMetadata';
import type { 
  FieldMetadata, 
  SectionMetadata, 
  FieldValue,
  FormStructure,
  FieldHierarchy
} from '../FieldMetadata';

// Import test types
import { describe, test, expect } from 'vitest';

describe('FieldMetadata Interface', () => {
  test('validates with string value type (default)', () => {
    const field: FieldMetadata = {
      name: "form1[0].Sections1-6[0].section1[0].FirstName[0]",
      id: "1234 0 R",
      label: "First Name",
      value: "John",
      type: FieldType.TEXT,
      section: 1,
      sectionName: "Personal Information",
      confidence: 0.95
    };

    expect(field.name).toBe("form1[0].Sections1-6[0].section1[0].FirstName[0]");
    expect(field.id).toBe("1234 0 R");
    expect(field.value).toBe("John");
  });

  test('validates with number value type', () => {
    const field: FieldMetadata<number> = {
      name: "form1[0].Sections1-6[0].section1[0].Age[0]",
      id: "1235 0 R",
      label: "Age",
      value: 30,
      type: FieldType.TEXT,
      section: 1,
      sectionName: "Personal Information",
      confidence: 0.95
    };

    expect(field.value).toBe(30);
  });

  test('validates with boolean value type', () => {
    const field: FieldMetadata<boolean> = {
      name: "form1[0].Sections1-6[0].section1[0].USCitizen[0]",
      id: "1236 0 R",
      label: "US Citizen",
      value: true,
      type: FieldType.CHECKBOX,
      section: 1,
      sectionName: "Personal Information",
      confidence: 0.95
    };

    expect(field.value).toBe(true);
  });

  test('validates with validation rules', () => {
    const field: FieldMetadata = {
      name: "form1[0].Sections1-6[0].section1[0].SSN[0]",
      id: "1237 0 R",
      label: "Social Security Number",
      value: "123-45-6789",
      type: FieldType.TEXT,
      section: 1,
      sectionName: "Personal Information",
      confidence: 0.95,
      validation: {
        required: true,
        pattern: "\\d{3}-\\d{2}-\\d{4}",
        minLength: 11,
        maxLength: 11
      }
    };

    expect(field.validation?.required).toBe(true);
    expect(field.validation?.pattern).toBe("\\d{3}-\\d{2}-\\d{4}");
  });
});

describe('SectionMetadata Interface', () => {
  test('validates section with non-repeatable fields', () => {
    const section: SectionMetadata = {
      sectionNumber: 1,
      sectionName: "Personal Information",
      fields: [
        {
          name: "form1[0].Sections1-6[0].section1[0].FirstName[0]",
          id: "1234 0 R",
          label: "First Name",
          value: "John",
          type: FieldType.TEXT,
          section: 1,
          sectionName: "Personal Information",
          confidence: 0.95
        },
        {
          name: "form1[0].Sections1-6[0].section1[0].LastName[0]",
          id: "1238 0 R",
          label: "Last Name",
          value: "Doe",
          type: FieldType.TEXT,
          section: 1,
          sectionName: "Personal Information",
          confidence: 0.95
        }
      ],
      isRepeatable: false
    };

    expect(section.sectionNumber).toBe(1);
    expect(section.fields.length).toBe(2);
    expect(section.isRepeatable).toBe(false);
  });

  test('validates section with repeatable fields', () => {
    const section: SectionMetadata = {
      sectionNumber: 5,
      sectionName: "Other Names Used",
      fields: [
        {
          name: "form1[0].Sections1-6[0].section5[0].OtherName[0]",
          id: "5001 0 R",
          label: "Other Name",
          value: "Johnny",
          type: FieldType.TEXT,
          section: 5,
          sectionName: "Other Names Used",
          confidence: 0.95
        }
      ],
      isRepeatable: true,
      maxEntries: 10
    };

    expect(section.isRepeatable).toBe(true);
    expect(section.maxEntries).toBe(10);
  });
});

describe('Form Structure and Hierarchy', () => {
  test('validates form structure', () => {
    const formStructure: FormStructure = {
      regex: "SF-86",
      confidence: 0.98,
      fields: [
        {
          name: "form1[0].Sections1-6[0].section1[0].FirstName[0]",
          id: "1234 0 R",
          label: "First Name",
          value: "John",
          type: FieldType.TEXT,
          section: 1,
          sectionName: "Personal Information",
          confidence: 0.95
        }
      ]
    };

    expect(formStructure.regex).toBe("SF-86");
    expect(formStructure.fields.length).toBe(1);
  });

  test('validates field hierarchy', () => {
    const hierarchy: FieldHierarchy = {
      "SF-86": {
        regex: "SF-86",
        confidence: 0.98,
        fields: [
          {
            name: "form1[0].Sections1-6[0].section1[0].FirstName[0]",
            id: "1234 0 R",
            label: "First Name",
            value: "John",
            type: FieldType.TEXT,
            section: 1,
            sectionName: "Personal Information",
            confidence: 0.95
          }
        ]
      }
    };

    expect(hierarchy["SF-86"].fields[0].label).toBe("First Name");
  });
}); 