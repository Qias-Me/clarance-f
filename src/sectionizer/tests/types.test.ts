/**
 * SF-86 Sectionizer - Type Validation Tests
 * 
 * This file tests the type definitions to ensure they are properly structured.
 * These are compile-time type checks rather than runtime tests.
 */

import type {
  FieldMetadata,
  EnhancedField,
  MatchRule,
  SectionMeta,
  SectionOutput,
  UnknownFields,
  SectionizerConfig,
  SectionizerResults,
  PDFField,
  CategorizedField,
  CategorizationResult,
  CategoryRule,
  SectionRules
} from '../types.js';

// Test field metadata interface
const fieldMetadataTest: FieldMetadata = {
  id: 'field_123',
  name: 'section21a1',
  value: 'Some value',
  page: 42,
  label: 'Test Field',
  type: 'text',
  maxLength: 100,
  options: ['Option 1', 'Option 2'],
  required: true
};

// Test enhanced field interface
const enhancedFieldTest: EnhancedField = {
  id: 'field_456',
  name: 'section22b3',
  value: true,
  page: 53,
  section: 22,
  subSection: 'B',
  entryIndex: 3,
  confidence: 0.95
};

// Test match rule interface
const matchRuleTest: MatchRule = {
  pattern: /^section21d(\d+)$/i,
  subSection: 'D',
  entryIndex: (m: RegExpMatchArray) => Number(m[1]),
  confidence: 0.9,
  description: 'Section 21D fields with entry number'
};

// Test section metadata interface
const sectionMetaTest: SectionMeta = {
  hasSubSections: true,
  confidence: 0.92,
  totalFields: 150,
  matchedFields: 145,
  fieldsBySubsection: {
    'A': 50,
    'B': 45,
    'C': 30,
    'D': 20
  },
  pageRange: [42, 48],
  name: 'Psychological and Emotional Health',
  description: 'Section covers mental health history'
};

// Test section output interface
const sectionOutputTest: SectionOutput = {
  meta: sectionMetaTest,
  fields: {
    'A': [enhancedFieldTest],
    'B': [],
    'C': [],
    'D': []
  }
};

// Test unknown fields interface
const unknownFieldsTest: UnknownFields = {
  fields: [enhancedFieldTest],
  timestamp: '2025-05-17T20:30:00Z',
  iteration: 2,
  attempted_rules: ['rule1', 'rule2'],
  suggested_patterns: ['^section(\\d+)[a-z](\\d*)$']
};

// Test sectionizer config interface
const configTest: SectionizerConfig = {
  maxIterations: 5,
  confidenceThreshold: 0.7,
  keepUnknownHistory: true,
  outputDir: 'scripts/mySections',
  reportPath: 'reports/sectionizer-report.md',
  rulesDir: 'src/sectionizer/rules'
};

// Test sectionizer results interface
const resultsTest: SectionizerResults = {
  totalFields: 6197,
  categorizedFields: 6150,
  uncategorizedFields: 47,
  iterations: 3,
  sections: {
    1: sectionMetaTest,
    2: { ...sectionMetaTest, totalFields: 100, matchedFields: 98 }
  },
  completionTime: 15000,
  successRate: 99.2
};

// Test PDF field interface (deprecated but should work)
const pdfFieldTest: PDFField = fieldMetadataTest;

// Test categorized field interface (deprecated but should work)
const categorizedFieldTest: CategorizedField = {
  ...fieldMetadataTest,
  section: 21,
  subsection: 'A',
  entry: 1,
  confidence: 0.95
};

// Test categorization result interface
const categorizationResultTest: CategorizationResult = {
  section: 21,
  subsection: 'D',
  entry: 3,
  confidence: 0.85
};

// Test category rule interface
const categoryRuleTest: CategoryRule = {
  section: 21,
  subsection: 'D',
  pattern: 'section21d(\\d+)',
  confidence: 0.9,
  description: 'Section 21D fields with entry number',
  entryPattern: 'section21d(\\d+)'
};

// Test section rules interface
const sectionRulesTest: SectionRules = {
  section: 21,
  name: 'Psychological and Emotional Health',
  rules: [categoryRuleTest]
};

// Type compatibility tests
// These variable declarations test that interfaces extend each other properly
// If there are type compatibility issues, TypeScript will flag them

// PDFField should be compatible with FieldMetadata
const pdfToField: FieldMetadata = pdfFieldTest;

// CategorizedField should be compatible with PDFField
const categorizedToPdf: PDFField = categorizedFieldTest;

// EnhancedField should be compatible with FieldMetadata
const enhancedToField: FieldMetadata = enhancedFieldTest;

// This function is only used for type checking and not meant to be called
// It verifies that our test objects correctly implement the interfaces
function validateTypes() {
  console.log(
    fieldMetadataTest,
    enhancedFieldTest,
    matchRuleTest,
    sectionMetaTest,
    sectionOutputTest,
    unknownFieldsTest,
    configTest,
    resultsTest,
    pdfFieldTest,
    categorizedFieldTest,
    categorizationResultTest,
    categoryRuleTest,
    sectionRulesTest
  );
}

// No actual tests to run as these are compile-time type checks
console.log('Type validation complete - all interfaces can be properly implemented'); 