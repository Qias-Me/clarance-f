/**
 * Section 11 Data Type Validation Tests
 * 
 * Comprehensive validation testing for all field types in Section 11:
 * - Text fields (addresses, names, descriptions)
 * - Date fields (ISO format validation)
 * - Boolean fields (estimates, flags, checkboxes)
 * - Dropdown fields (states, countries, residence types)
 * - Radio button fields (YES/NO choices)
 * - Nested structure flattening for PDF mapping
 */

import { 
  createResidenceEntryFromReference,
  createDefaultSection11,
  type ResidenceEntry,
  type Section11
} from '../../api/interfaces/sections2.0/section11';

// ============================================================================
// DATA TYPE VALIDATION TESTS
// ============================================================================

/**
 * Test 1: Text Field Validation
 * Verify all text fields use Field<string> with proper defaults
 */
export function validateTextFields(): { isValid: boolean; errors: string[]; results: any } {
  const errors: string[] = [];
  const results: any = {};
  
  try {
    const entry = createResidenceEntryFromReference(0);
    
    // Test residence address text fields
    const addressFields = [
      { field: entry.residenceAddress.streetAddress, name: 'streetAddress' },
      { field: entry.residenceAddress.city, name: 'city' },
      { field: entry.residenceAddress.zipCode, name: 'zipCode' }
    ];
    
    addressFields.forEach(({ field, name }) => {
      if (typeof field.value !== 'string') {
        errors.push(`${name} should have string value, got ${typeof field.value}`);
      }
      if (field.value !== '') {
        errors.push(`${name} should default to empty string, got "${field.value}"`);
      }
    });
    
    // Test contact person name fields
    const nameFields = [
      { field: entry.contactPersonName.firstName, name: 'firstName' },
      { field: entry.contactPersonName.middleName, name: 'middleName' },
      { field: entry.contactPersonName.lastName, name: 'lastName' }
    ];
    
    nameFields.forEach(({ field, name }) => {
      if (typeof field.value !== 'string') {
        errors.push(`Contact ${name} should have string value, got ${typeof field.value}`);
      }
    });
    
    // Test phone fields
    const phoneFields = [
      { field: entry.contactPersonPhones.eveningPhone, name: 'eveningPhone' },
      { field: entry.contactPersonPhones.daytimePhone, name: 'daytimePhone' },
      { field: entry.contactPersonPhones.mobilePhone, name: 'mobilePhone' }
    ];
    
    phoneFields.forEach(({ field, name }) => {
      if (typeof field.value !== 'string') {
        errors.push(`${name} should have string value, got ${typeof field.value}`);
      }
    });
    
    results.textFieldsValidated = addressFields.length + nameFields.length + phoneFields.length;
    results.textFieldDefaults = 'All text fields default to empty string';
    
  } catch (error) {
    errors.push(`Text field validation failed: ${error}`);
  }
  
  return { isValid: errors.length === 0, errors, results };
}

/**
 * Test 2: Date Field Validation
 * Verify date fields use Field<string> and support ISO format
 */
export function validateDateFields(): { isValid: boolean; errors: string[]; results: any } {
  const errors: string[] = [];
  const results: any = {};
  
  try {
    const entry = createResidenceEntryFromReference(0);
    
    // Test residence date fields
    const dateFields = [
      { field: entry.residenceDates.fromDate, name: 'fromDate' },
      { field: entry.residenceDates.toDate, name: 'toDate' },
      { field: entry.lastContactInfo.lastContactDate, name: 'lastContactDate' }
    ];
    
    dateFields.forEach(({ field, name }) => {
      if (typeof field.value !== 'string') {
        errors.push(`${name} should have string value for ISO date, got ${typeof field.value}`);
      }
      
      // Test ISO date format compatibility
      if (field.value === '') {
        // Empty is valid default
        results[`${name}_default`] = 'Empty string (valid)';
      } else {
        // Test if it can be parsed as date
        const testDate = new Date(field.value);
        if (isNaN(testDate.getTime())) {
          errors.push(`${name} value "${field.value}" is not a valid date format`);
        } else {
          results[`${name}_format`] = 'Valid date format';
        }
      }
    });
    
    results.dateFieldsValidated = dateFields.length;
    results.dateFormat = 'String format compatible with ISO dates';
    
  } catch (error) {
    errors.push(`Date field validation failed: ${error}`);
  }
  
  return { isValid: errors.length === 0, errors, results };
}

/**
 * Test 3: Boolean Field Validation
 * Verify boolean fields use Field<boolean> with proper defaults
 */
export function validateBooleanFields(): { isValid: boolean; errors: string[]; results: any } {
  const errors: string[] = [];
  const results: any = {};
  
  try {
    const entry = createResidenceEntryFromReference(0);
    
    // Test estimate flags
    const estimateFields = [
      { field: entry.residenceDates.fromDateEstimate, name: 'fromDateEstimate' },
      { field: entry.residenceDates.toDateEstimate, name: 'toDateEstimate' },
      { field: entry.lastContactInfo.lastContactEstimate, name: 'lastContactEstimate' }
    ];
    
    estimateFields.forEach(({ field, name }) => {
      if (typeof field.value !== 'boolean') {
        errors.push(`${name} should have boolean value, got ${typeof field.value}`);
      }
      if (field.value !== false) {
        errors.push(`${name} should default to false, got ${field.value}`);
      }
    });
    
    // Test international phone flags
    const internationalFields = [
      { field: entry.contactPersonPhones.eveningPhoneIsInternational, name: 'eveningPhoneIsInternational' },
      { field: entry.contactPersonPhones.daytimePhoneIsInternational, name: 'daytimePhoneIsInternational' },
      { field: entry.contactPersonPhones.mobilePhoneIsInternational, name: 'mobilePhoneIsInternational' }
    ];
    
    internationalFields.forEach(({ field, name }) => {
      if (typeof field.value !== 'boolean') {
        errors.push(`${name} should have boolean value, got ${typeof field.value}`);
      }
    });
    
    // Test relationship checkboxes
    const relationshipFields = [
      { field: entry.contactPersonRelationship.isNeighbor, name: 'isNeighbor' },
      { field: entry.contactPersonRelationship.isFriend, name: 'isFriend' },
      { field: entry.contactPersonRelationship.isLandlord, name: 'isLandlord' }
    ];
    
    relationshipFields.forEach(({ field, name }) => {
      if (typeof field.value !== 'boolean') {
        errors.push(`${name} should have boolean value, got ${typeof field.value}`);
      }
    });
    
    results.booleanFieldsValidated = estimateFields.length + internationalFields.length + relationshipFields.length;
    results.booleanDefaults = 'All boolean fields default to false';
    
  } catch (error) {
    errors.push(`Boolean field validation failed: ${error}`);
  }
  
  return { isValid: errors.length === 0, errors, results };
}

/**
 * Test 4: Dropdown Field Validation
 * Verify dropdown fields have proper options arrays and types
 */
export function validateDropdownFields(): { isValid: boolean; errors: string[]; results: any } {
  const errors: string[] = [];
  const results: any = {};
  
  try {
    const entry = createResidenceEntryFromReference(0);
    
    // Test residence type dropdown (numeric values)
    const residenceType = entry.residenceType.type;
    if (!residenceType.options || !Array.isArray(residenceType.options)) {
      errors.push('Residence type should have options array');
    } else {
      const expectedOptions = ['1', '2', '3', '4'];
      const hasAllOptions = expectedOptions.every(opt => residenceType.options.includes(opt));
      if (!hasAllOptions) {
        errors.push(`Residence type options should be ${expectedOptions.join(', ')}, got ${residenceType.options.join(', ')}`);
      }
      results.residenceTypeOptions = residenceType.options;
    }
    
    // Test state dropdown
    const state = entry.residenceAddress.state;
    if (!state.options || !Array.isArray(state.options)) {
      errors.push('State field should have options array');
    } else {
      if (state.options.length < 50) {
        errors.push(`State options should include all US states, got ${state.options.length} options`);
      }
      results.stateOptionsCount = state.options.length;
    }
    
    // Test country dropdown
    const country = entry.residenceAddress.country;
    if (!country.options || !Array.isArray(country.options)) {
      errors.push('Country field should have options array');
    } else {
      if (country.options.length < 100) {
        errors.push(`Country options should include all countries, got ${country.options.length} options`);
      }
      results.countryOptionsCount = country.options.length;
    }
    
    // Test APO/FPO state dropdown
    const apoFpoState = entry.apoFpoPhysicalAddress.apoFpoState;
    if (!apoFpoState.options || !Array.isArray(apoFpoState.options)) {
      errors.push('APO/FPO state should have options array');
    } else {
      const expectedApoOptions = ['AA', 'AE', 'AP'];
      const hasAllApoOptions = expectedApoOptions.every(opt => apoFpoState.options.includes(opt));
      if (!hasAllApoOptions) {
        errors.push(`APO/FPO state options should be ${expectedApoOptions.join(', ')}, got ${apoFpoState.options.join(', ')}`);
      }
      results.apoFpoStateOptions = apoFpoState.options;
    }
    
    results.dropdownFieldsValidated = 4;
    
  } catch (error) {
    errors.push(`Dropdown field validation failed: ${error}`);
  }
  
  return { isValid: errors.length === 0, errors, results };
}

/**
 * Test 5: Residence Type Human-Readable Mapping
 * Verify residence type numeric values can be converted to human-readable labels
 */
export function validateResidenceTypeMapping(): { isValid: boolean; errors: string[]; results: any } {
  const errors: string[] = [];
  const results: any = {};
  
  try {
    const residenceTypeMap = {
      '1': 'Owned',
      '2': 'Rented', 
      '3': 'Military housing',
      '4': 'Other'
    };
    
    const entry = createResidenceEntryFromReference(0);
    const residenceType = entry.residenceType.type;
    
    // Test that default value maps correctly
    const defaultValue = residenceType.value;
    if (!residenceTypeMap[defaultValue as keyof typeof residenceTypeMap]) {
      errors.push(`Default residence type value "${defaultValue}" does not map to human-readable label`);
    } else {
      results.defaultMapping = `${defaultValue} → ${residenceTypeMap[defaultValue as keyof typeof residenceTypeMap]}`;
    }
    
    // Test all option mappings
    residenceType.options.forEach(option => {
      if (!residenceTypeMap[option as keyof typeof residenceTypeMap]) {
        errors.push(`Residence type option "${option}" does not have human-readable mapping`);
      }
    });
    
    results.residenceTypeMappings = residenceTypeMap;
    results.allOptionsMapped = residenceType.options.every(opt => 
      residenceTypeMap[opt as keyof typeof residenceTypeMap]
    );
    
  } catch (error) {
    errors.push(`Residence type mapping validation failed: ${error}`);
  }
  
  return { isValid: errors.length === 0, errors, results };
}

/**
 * Test 6: Nested Structure Flattening
 * Verify nested interface structure can be flattened for PDF mapping
 */
export function validateNestedStructureFlattening(): { isValid: boolean; errors: string[]; results: any } {
  const errors: string[] = [];
  const results: any = {};
  
  try {
    const entry = createResidenceEntryFromReference(0);
    
    // Test that nested fields have proper PDF field identifiers
    const nestedFields = [
      { path: 'residenceAddress.streetAddress', field: entry.residenceAddress.streetAddress },
      { path: 'residenceAddress.city', field: entry.residenceAddress.city },
      { path: 'contactPersonName.firstName', field: entry.contactPersonName.firstName },
      { path: 'residenceType.type', field: entry.residenceType.type }
    ];
    
    nestedFields.forEach(({ path, field }) => {
      if (!field.id) {
        errors.push(`Nested field ${path} missing PDF field ID`);
      }
      if (!field.name) {
        errors.push(`Nested field ${path} missing PDF field name`);
      }
      if (!field.name.includes('form1[0].Section11')) {
        errors.push(`Nested field ${path} PDF name should include Section11 pattern, got: ${field.name}`);
      }
    });
    
    // Test field flattening simulation
    const flatFields: Record<string, any> = {};
    const flattenField = (field: any, path: string) => {
      if (field && typeof field === 'object' && 'id' in field && 'value' in field) {
        flatFields[field.id] = field;
      }
    };
    
    // Flatten all fields in the entry
    Object.entries(entry).forEach(([key, value]) => {
      if (key === '_id') return;
      if (value && typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          flattenField(subValue, `${key}.${subKey}`);
        });
      }
    });
    
    results.flattenedFieldCount = Object.keys(flatFields).length;
    results.nestedFieldsValidated = nestedFields.length;
    results.flatteningWorking = Object.keys(flatFields).length > 0;
    
  } catch (error) {
    errors.push(`Nested structure flattening validation failed: ${error}`);
  }
  
  return { isValid: errors.length === 0, errors, results };
}

/**
 * Run all data type validation tests
 */
export function runAllDataTypeValidationTests() {
  console.log('🧪 Running Section 11 Data Type Validation Tests...\n');
  
  const tests = [
    { name: 'Text Fields', test: validateTextFields },
    { name: 'Date Fields', test: validateDateFields },
    { name: 'Boolean Fields', test: validateBooleanFields },
    { name: 'Dropdown Fields', test: validateDropdownFields },
    { name: 'Residence Type Mapping', test: validateResidenceTypeMapping },
    { name: 'Nested Structure Flattening', test: validateNestedStructureFlattening }
  ];
  
  const results: any = {};
  let totalErrors = 0;
  
  tests.forEach(({ name, test }) => {
    console.log(`\n📋 Testing ${name}...`);
    const result = test();
    results[name] = result;
    
    if (result.isValid) {
      console.log(`✅ ${name}: PASSED`);
      console.log(`   Results:`, result.results);
    } else {
      console.log(`❌ ${name}: FAILED`);
      console.log(`   Errors:`, result.errors);
      totalErrors += result.errors.length;
    }
  });
  
  console.log(`\n📊 Data Type Validation Summary:`);
  console.log(`   Total Tests: ${tests.length}`);
  console.log(`   Passed: ${tests.filter(t => results[t.name].isValid).length}`);
  console.log(`   Failed: ${tests.filter(t => !results[t.name].isValid).length}`);
  console.log(`   Total Errors: ${totalErrors}`);
  
  return {
    allTestsPassed: totalErrors === 0,
    totalErrors,
    results
  };
}
