/**
 * Test Enhanced PDF Field Mapping System
 * 
 * This utility tests the enhanced PDF field mapping system with complex structures,
 * validates field path resolution, and provides comprehensive debugging information.
 */

import { 
  parseFieldPath, 
  resolveDynamicFieldPath, 
  enhancedFieldLookup, 
  findSimilarFieldPaths,
  validateFieldPath,
  debugFieldMapping,
  resolveFieldPathFromConfig,
  ENHANCED_FIELD_MAPPINGS
} from '../api/utils/enhanced-pdf-field-mapping';

import { 
  generateAdvancedField, 
  generateSection18FieldPattern,
  generateBatchFields,
  validateFieldGenerationParams
} from '../api/utils/advanced-field-generators';

import { getSectionFields, getSectionMetadata } from '../api/utils/sections-references-loader';

// ============================================================================
// TEST CONFIGURATIONS
// ============================================================================

const TEST_FIELD_PATHS = [
  // Section 18.1 - Basic relative information
  'form1[0].Section18_1[0].TextField11[1]', // First name
  'form1[0].Section18_1[0].TextField11[0]', // Last name
  'form1[0].Section18_1[0].suffix[0]',      // Suffix
  'form1[0].Section18_1[0].DropDownList24[1]', // Relative type
  
  // Section 18.1 - Other names (complex patterns)
  'form1[0].Section18_1[0].TextField11[6]',  // Other name #1 first name
  'form1[0].Section18_1[0].TextField11[4]',  // Other name #1 middle name
  'form1[0].Section18_1[0].TextField11[9]',  // Other name #1 last name
  'form1[0].Section18_1[0].suffix[1]',       // Other name #1 suffix
  'form1[0].Section18_1[0].#area[0].From_Datefield_Name_2[0]', // Other name #1 from date
  'form1[0].Section18_1[0].#field[22]',      // Other name #1 from estimate
  
  // Section 18.2 - Current address
  'form1[0].Section18_2[0].TextField11[6]',  // Street address
  'form1[0].Section18_2[0].TextField11[7]',  // City
  'form1[0].Section18_2[0].School6_State[2]', // State
  'form1[0].Section18_2[0].TextField11[8]',  // ZIP code
  'form1[0].Section18_2[0].DropDownList26[0]', // Country
  
  // Section 18.3 - Contact and foreign relations (complex nested structure)
  'form1[0].Section18_3[0].#field[4]',       // Contact in person
  'form1[0].Section18_3[0].#field[2]',       // Contact telephone
  'form1[0].Section18_3[0].TextField11[5]',  // Contact other explanation
  'form1[0].Section18_3[0].#field[9]',       // Frequency daily
  'form1[0].Section18_3[0].#field[30]',      // I-551 documentation
  'form1[0].Section18_3[0].#area[1].From_Datefield_Name_2[0]', // First contact date
  'form1[0].Section18_3[0].#area[1].#field[25]', // First contact estimate
  
  // Invalid/problematic paths for testing error handling
  'form1[0].Section18_1[0].InvalidField[99]',
  'form1[0].Section18_3[0].#field[999]',
  'form1[0].Section18_1[0].TextField11[',  // Malformed bracket
  'form1[0]..Section18_1[0].TextField11[1]', // Double dots
];

const DYNAMIC_FIELD_TEMPLATES = [
  {
    template: 'form1[0].Section18_1[{entryIndex}].TextField11[{fieldIndex}]',
    variables: { entryIndex: 0, fieldIndex: 1 },
    expected: 'form1[0].Section18_1[0].TextField11[1]'
  },
  {
    template: 'form1[0].Section18_3[{entryIndex}].#field[{fieldIndex}]',
    variables: { entryIndex: 2, fieldIndex: 30 },
    expected: 'form1[0].Section18_3[2].#field[30]'
  },
  {
    template: 'form1[0].Section18_1[{i}].#area[{j}].From_Datefield_Name_2[{k}]',
    variables: { i: 1, j: 0, k: 0 },
    expected: 'form1[0].Section18_1[1].#area[0].From_Datefield_Name_2[0]'
  }
];

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

/**
 * Test field path parsing functionality
 */
export async function testFieldPathParsing(): Promise<void> {
  console.log('\n🧪 Testing Field Path Parsing...\n');
  
  TEST_FIELD_PATHS.forEach((fieldPath, index) => {
    console.log(`\n--- Test ${index + 1}: ${fieldPath} ---`);
    
    const components = parseFieldPath(fieldPath);
    console.log('📋 Parsed Components:', {
      basePath: components.basePath,
      arrayIndex: components.arrayIndex,
      fieldIndex: components.fieldIndex,
      areaIndex: components.areaIndex,
      subPath: components.subPath,
      isComplex: components.isComplex
    });
    
    const validation = validateFieldPath(fieldPath);
    if (!validation.isValid) {
      console.log('⚠️ Validation Issues:', validation.issues);
      console.log('💡 Suggestions:', validation.suggestions);
    } else {
      console.log('✅ Field path is valid');
    }
  });
}

/**
 * Test dynamic field path resolution
 */
export async function testDynamicFieldResolution(): Promise<void> {
  console.log('\n🧪 Testing Dynamic Field Resolution...\n');
  
  DYNAMIC_FIELD_TEMPLATES.forEach((test, index) => {
    console.log(`\n--- Dynamic Test ${index + 1} ---`);
    console.log(`Template: ${test.template}`);
    console.log(`Variables:`, test.variables);
    
    const result = resolveDynamicFieldPath(test.template, test.variables);
    console.log(`Resolved: ${result.resolvedPath}`);
    console.log(`Expected: ${test.expected}`);
    console.log(`✅ Match: ${result.resolvedPath === test.expected ? 'YES' : 'NO'}`);
    
    if (result.resolvedPath !== test.expected) {
      console.log('❌ MISMATCH DETECTED!');
    }
  });
}

/**
 * Test enhanced field lookup with Section 18 data
 */
export async function testEnhancedFieldLookup(): Promise<void> {
  console.log('\n🧪 Testing Enhanced Field Lookup...\n');
  
  const sectionId = 18;
  const samplePaths = TEST_FIELD_PATHS.slice(0, 10); // Test first 10 paths
  
  for (const fieldPath of samplePaths) {
    console.log(`\n--- Lookup Test: ${fieldPath} ---`);
    
    const result = enhancedFieldLookup(sectionId, fieldPath, true);
    
    if (result.success) {
      console.log('✅ Field found successfully');
      console.log('📋 Field Data:', {
        id: result.fieldData?.id,
        name: result.fieldData?.name,
        type: result.fieldData?.type,
        label: result.fieldData?.label
      });
    } else {
      console.log('❌ Field not found');
      console.log('🔍 Error:', result.error);
      if (result.suggestions && result.suggestions.length > 0) {
        console.log('💡 Suggestions:', result.suggestions.slice(0, 3));
      }
    }
  }
}

/**
 * Test Section 18 field pattern generation
 */
export async function testSection18FieldPatterns(): Promise<void> {
  console.log('\n🧪 Testing Section 18 Field Patterns...\n');
  
  const testCases = [
    { entryNumber: 1, subsection: '18_1' as const, fieldType: 'firstName' },
    { entryNumber: 1, subsection: '18_1' as const, fieldType: 'lastName' },
    { entryNumber: 2, subsection: '18_2' as const, fieldType: 'streetAddress' },
    { entryNumber: 3, subsection: '18_3' as const, fieldType: 'contactInPerson' },
    { entryNumber: 1, subsection: '18_1' as const, fieldType: 'otherNameFirstName', fieldIndex: 0 },
    { entryNumber: 1, subsection: '18_1' as const, fieldType: 'otherNameFirstName', fieldIndex: 1 },
    { entryNumber: 2, subsection: '18_3' as const, fieldType: 'firstContactDate', areaIndex: 1 },
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n--- Pattern Test ${index + 1} ---`);
    console.log('Input:', testCase);
    
    const pattern = generateSection18FieldPattern(
      testCase.entryNumber,
      testCase.subsection,
      testCase.fieldType,
      testCase.fieldIndex,
      testCase.areaIndex
    );
    
    console.log(`Generated Pattern: ${pattern}`);
    
    // Validate the generated pattern
    const validation = validateFieldPath(pattern);
    if (validation.isValid) {
      console.log('✅ Generated pattern is valid');
    } else {
      console.log('⚠️ Pattern validation issues:', validation.issues);
    }
  });
}

/**
 * Test enhanced field mapping configuration
 */
export async function testFieldMappingConfig(): Promise<void> {
  console.log('\n🧪 Testing Field Mapping Configuration...\n');
  
  const sectionId = 18;
  const config = ENHANCED_FIELD_MAPPINGS[sectionId];
  
  if (!config) {
    console.log(`❌ No configuration found for section ${sectionId}`);
    return;
  }
  
  console.log(`✅ Configuration found for section ${sectionId}`);
  console.log('📋 Subsections:', Object.keys(config.subsections));
  
  // Test field path resolution from config
  const testCases = [
    { subsection: '18_1', fieldName: 'firstName', variables: { entryIndex: 0 } },
    { subsection: '18_1', fieldName: 'lastName', variables: { entryIndex: 1 } },
    { subsection: '18_2', fieldName: 'streetAddress', variables: { entryIndex: 0 } },
    { subsection: '18_3', fieldName: 'contactInPerson', variables: { entryIndex: 2 } },
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n--- Config Test ${index + 1} ---`);
    console.log('Input:', testCase);
    
    const resolvedPath = resolveFieldPathFromConfig(
      sectionId,
      testCase.subsection,
      testCase.fieldName,
      testCase.variables
    );
    
    if (resolvedPath) {
      console.log(`✅ Resolved Path: ${resolvedPath}`);
      
      // Test the resolved path
      const lookupResult = enhancedFieldLookup(sectionId, resolvedPath);
      console.log(`🔍 Lookup Result: ${lookupResult.success ? 'SUCCESS' : 'FAILED'}`);
    } else {
      console.log('❌ Failed to resolve path from configuration');
    }
  });
}

/**
 * Test advanced field generation
 */
export async function testAdvancedFieldGeneration(): Promise<void> {
  console.log('\n🧪 Testing Advanced Field Generation...\n');
  
  const testFields = [
    { path: 'form1[0].Section18_1[0].TextField11[1]', defaultValue: '', options: undefined },
    { path: 'form1[0].Section18_1[0].suffix[0]', defaultValue: '', options: ['Jr', 'Sr', 'II', 'III'] },
    { path: 'form1[0].Section18_3[0].#field[4]', defaultValue: false, options: undefined },
    { path: 'form1[0].Section18_1[0].InvalidField[99]', defaultValue: '', options: undefined }, // Test fallback
  ];
  
  testFields.forEach((testField, index) => {
    console.log(`\n--- Generation Test ${index + 1} ---`);
    console.log('Input:', testField);
    
    const validation = validateFieldGenerationParams(18, testField.path, testField.defaultValue);
    if (!validation.isValid) {
      console.log('❌ Invalid parameters:', validation.errors);
      return;
    }
    
    try {
      const field = generateAdvancedField(
        18,
        testField.path,
        testField.defaultValue,
        testField.options
      );
      
      console.log('✅ Field generated successfully');
      console.log('📋 Field Details:', {
        id: field.id,
        name: field.name,
        type: field.type,
        label: field.label,
        value: field.value,
        hasOptions: 'options' in field
      });
    } catch (error) {
      console.log('❌ Field generation failed:', error);
    }
  });
}

/**
 * Test comprehensive debugging functionality
 */
export async function testDebuggingFunctionality(): Promise<void> {
  console.log('\n🧪 Testing Debugging Functionality...\n');
  
  const problematicPaths = [
    'form1[0].Section18_1[0].InvalidField[99]',
    'form1[0].Section18_3[0].#field[999]',
    'form1[0].Section18_1[0].TextField11[',
    'form1[0]..Section18_1[0].TextField11[1]',
  ];
  
  problematicPaths.forEach((fieldPath, index) => {
    console.log(`\n--- Debug Test ${index + 1}: ${fieldPath} ---`);
    
    const debugInfo = debugFieldMapping(18, fieldPath);
    
    console.log('📋 Debug Analysis:');
    console.log('  Original Path:', debugInfo.originalPath);
    console.log('  Is Complex:', debugInfo.components.isComplex);
    console.log('  Validation Valid:', debugInfo.validation.isValid);
    console.log('  Lookup Success:', debugInfo.lookupResult.success);
    
    if (debugInfo.validation.issues.length > 0) {
      console.log('  ⚠️ Validation Issues:', debugInfo.validation.issues);
    }
    
    if (debugInfo.recommendations.length > 0) {
      console.log('  💡 Recommendations:', debugInfo.recommendations);
    }
    
    if (debugInfo.lookupResult.suggestions && debugInfo.lookupResult.suggestions.length > 0) {
      console.log('  🔍 Similar Fields:', debugInfo.lookupResult.suggestions.slice(0, 3));
    }
  });
}

/**
 * Run all tests
 */
export async function runAllEnhancedMappingTests(): Promise<void> {
  console.log('🚀 Starting Enhanced PDF Field Mapping Tests...\n');
  
  try {
    await testFieldPathParsing();
    await testDynamicFieldResolution();
    await testEnhancedFieldLookup();
    await testSection18FieldPatterns();
    await testFieldMappingConfig();
    await testAdvancedFieldGeneration();
    await testDebuggingFunctionality();
    
    console.log('\n✅ All Enhanced PDF Field Mapping Tests Completed Successfully!');
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
  }
}

// Export for individual test execution
export {
  testFieldPathParsing,
  testDynamicFieldResolution,
  testEnhancedFieldLookup,
  testSection18FieldPatterns,
  testFieldMappingConfig,
  testAdvancedFieldGeneration,
  testDebuggingFunctionality
};
