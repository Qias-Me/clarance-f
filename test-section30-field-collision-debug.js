/**
 * Section 30 Field Mapping Collision Debug Script
 * 
 * This script identifies and resolves the field mapping collision where
 * date field values are being incorrectly assigned to ZIP code field 16262.
 */

console.log('🔍 ===== SECTION 30 FIELD MAPPING COLLISION DEBUG =====\n');

// ============================================================================
// FIELD MAPPING ANALYSIS
// ============================================================================

const SECTION30_FIELD_MAPPINGS = {
  // Date fields that should receive date values
  "16269": { // DATE_SIGNED_PAGE2
    name: "form1[0].continuation2[0].p17-t2[0]",
    label: "Date signed (m m/d d/y y y y)",
    type: "PDFTextField",
    expectedValueType: "date",
    maxLength: 0
  },
  "16267": { // DATE_OF_BIRTH
    name: "form1[0].continuation2[0].p17-t4[0]",
    label: "Date of Birth (m m/d d/y y y y)",
    type: "PDFTextField", 
    expectedValueType: "date",
    maxLength: 0
  },
  
  // ZIP code field that should only receive ZIP values
  "16262": { // ZIP_CODE_PAGE2
    name: "form1[0].continuation2[0].p17-t10[0]",
    label: "ZIP Code",
    type: "PDFTextField",
    expectedValueType: "string", // ZIP codes are strings like "12345"
    maxLength: 5, // This is what the PDF service detects, despite reference showing 0
    duplicateCount: 3 // This field appears 3 times in section-30.json
  }
};

console.log('📊 Field Mapping Analysis:');
Object.entries(SECTION30_FIELD_MAPPINGS).forEach(([fieldId, field]) => {
  console.log(`  🆔 Field ${fieldId}:`);
  console.log(`     📛 Name: ${field.name}`);
  console.log(`     🏷️ Label: ${field.label}`);
  console.log(`     📝 Type: ${field.type}`);
  console.log(`     💾 Expected Value Type: ${field.expectedValueType}`);
  console.log(`     📏 Max Length: ${field.maxLength}`);
  if (field.duplicateCount) {
    console.log(`     ⚠️ Duplicate Count: ${field.duplicateCount}`);
  }
  console.log('');
});

// ============================================================================
// PROBLEM SIMULATION
// ============================================================================

console.log('🚨 ===== PROBLEM SIMULATION =====\n');

// Simulated form data that would cause the issue
const problematicFormData = {
  section30: {
    continuationSheets: {
      entries: [
        {
          personalInfo: {
            dateSigned: {
              id: "16269", // Correct field ID for date signed
              value: "2025-06-27", // Date value
              name: "form1[0].continuation2[0].p17-t2[0]"
            },
            dateOfBirth: {
              id: "16267", // Correct field ID for date of birth
              value: "1990-01-15", // Date value
              name: "form1[0].continuation2[0].p17-t4[0]"
            },
            currentAddress: {
              zipCode: {
                id: "16262", // Correct field ID for ZIP code
                value: "12345", // ZIP code value
                name: "form1[0].continuation2[0].p17-t10[0]"
              }
            }
          }
        }
      ]
    }
  }
};

console.log('🎯 Simulated Form Data:');
console.log(JSON.stringify(problematicFormData, null, 2));

// ============================================================================
// FIELD EXTRACTION SIMULATION
// ============================================================================

console.log('\n🔄 ===== FIELD EXTRACTION SIMULATION =====\n');

// Simulate the flattenFormValues function processing
const extractedFields = new Map();

function simulateFieldExtraction(data, path = '') {
  console.log(`🔍 Processing path: "${path}"`);
  
  if (!data || typeof data !== 'object') return;
  
  Object.entries(data).forEach(([key, value]) => {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (value && typeof value === 'object') {
      if ('id' in value && 'value' in value) {
        // Found a Field<T> object
        const fieldId = String(value.id).replace(' 0 R', '').trim();
        const fieldValue = value.value;
        
        console.log(`  ✅ Found Field at "${currentPath}"`);
        console.log(`     🆔 ID: "${fieldId}"`);
        console.log(`     💾 Value: "${fieldValue}"`);
        console.log(`     📊 Value Type: ${typeof fieldValue}`);
        
        // Check for potential collision
        if (extractedFields.has(fieldId)) {
          console.log(`     ⚠️ COLLISION DETECTED! Field ID "${fieldId}" already exists with value: "${extractedFields.get(fieldId)}"`);
          console.log(`     🔄 Overwriting with new value: "${fieldValue}"`);
        }
        
        extractedFields.set(fieldId, fieldValue);
        
        // Check if this is a problematic mapping
        if (fieldId === "16262" && typeof fieldValue === 'string' && fieldValue.match(/\d{4}-\d{2}-\d{2}/)) {
          console.log(`     🚨 PROBLEM DETECTED: Date value "${fieldValue}" assigned to ZIP code field 16262!`);
        }
      } else {
        simulateFieldExtraction(value, currentPath);
      }
    }
  });
}

simulateFieldExtraction(problematicFormData);

console.log('\n📊 Final Extracted Fields Map:');
extractedFields.forEach((value, fieldId) => {
  const field = SECTION30_FIELD_MAPPINGS[fieldId];
  const isCorrectType = field ? (
    (field.expectedValueType === 'date' && typeof value === 'string' && value.match(/\d{4}-\d{2}-\d{2}/)) ||
    (field.expectedValueType === 'string' && typeof value === 'string' && !value.match(/\d{4}-\d{2}-\d{2}/))
  ) : false;
  
  console.log(`  🆔 ${fieldId}: "${value}" ${isCorrectType ? '✅' : '❌'}`);
  if (field) {
    console.log(`     Expected for: ${field.label} (${field.expectedValueType})`);
  }
});

// ============================================================================
// ROOT CAUSE ANALYSIS
// ============================================================================

console.log('\n🔍 ===== ROOT CAUSE ANALYSIS =====\n');

console.log('🧐 Potential Root Causes:');
console.log('1. 📊 DUPLICATE FIELD ENTRIES: Field 16262 appears 3 times in section-30.json');
console.log('   - This could cause the findFieldById function to return the wrong field reference');
console.log('   - Or cause Map.set() operations to overwrite previous values');
console.log('');

console.log('2. 🔄 FIELD CREATION COLLISION: createFieldFromReference might be creating multiple fields with same ID');
console.log('   - Multiple calls to createFieldFromReference(30, "16262", value) with different values');
console.log('   - Last value wins in the Map, overwriting previous correct values');
console.log('');

console.log('3. 🗂️ FIELD MAPPING ORDER: fieldNameToIdMap might be mapping multiple field names to same ID');
console.log('   - Multiple field names could resolve to ID "16262"');
console.log('   - Processing order determines which value gets assigned');
console.log('');

console.log('4. 📏 MAXLENGTH DISCREPANCY: Reference data shows maxLength: 0, PDF service detects maxLength: 5');
console.log('   - This suggests the PDF service is reading actual PDF constraints');
console.log('   - Date values like "2025-06-27" (10 chars) get truncated to "2025-" (5 chars)');
console.log('');

// ============================================================================
// SOLUTION STRATEGIES
// ============================================================================

console.log('🔧 ===== SOLUTION STRATEGIES =====\n');

console.log('1. 🧹 DEDUPLICATE REFERENCE DATA:');
console.log('   - Remove duplicate entries for field 16262 from section-30.json');
console.log('   - Keep only one canonical entry per field ID');
console.log('   - Ensures findFieldById returns consistent results');
console.log('');

console.log('2. 🔒 FIELD ID UNIQUENESS VALIDATION:');
console.log('   - Add validation in createFieldFromReference to detect ID collisions');
console.log('   - Throw error if attempting to create multiple fields with same ID');
console.log('   - Force explicit field ID assignment to prevent accidents');
console.log('');

console.log('3. 🏷️ USE UNIQUE FIELD IDENTIFIERS:');
console.log('   - Instead of using raw field IDs, use uniqueId from reference data');
console.log('   - Each field has a unique identifier like "section_30_entry_1_field_form1_0__continuation2_0__p17_t2_0__healed"');
console.log('   - This ensures no collisions even with duplicate IDs');
console.log('');

console.log('4. 🛡️ FIELD VALUE TYPE VALIDATION:');
console.log('   - Add type checking before field assignment in PDF service');
console.log('   - Reject date values for ZIP code fields and vice versa');
console.log('   - Provide clear error messages for type mismatches');
console.log('');

console.log('5. 📏 MAXLENGTH ENFORCEMENT:');
console.log('   - Update reference data with correct maxLength values from actual PDF');
console.log('   - Add pre-validation before PDF field assignment');
console.log('   - Warn about potential truncation before it happens');

// ============================================================================
// IMMEDIATE FIX RECOMMENDATION
// ============================================================================

console.log('\n🎯 ===== IMMEDIATE FIX RECOMMENDATION =====\n');

console.log('🚀 Recommended Immediate Fix:');
console.log('');
console.log('1. 📊 UPDATE FIELD CREATION LOGIC:');
console.log('   - Modify createFieldFromReference to use uniqueId instead of field ID for lookups');
console.log('   - This ensures each field gets a truly unique identifier');
console.log('');
console.log('2. 🧹 CLEAN REFERENCE DATA:');
console.log('   - Remove duplicate entries for field 16262 in section-30.json');
console.log('   - Keep the first occurrence and remove the other two');
console.log('');
console.log('3. 🔍 ADD FIELD MAPPING VALIDATION:');
console.log('   - Add validation in PDF service to detect value type mismatches');
console.log('   - Prevent date values from being assigned to ZIP code fields');
console.log('');
console.log('4. 📏 UPDATE MAXLENGTH VALUES:');
console.log('   - Correct the maxLength value for field 16262 to 5 in reference data');
console.log('   - This matches what the PDF service actually detects');

console.log('\n✅ This fix should resolve the field mapping collision and prevent date values');
console.log('   from being incorrectly assigned to ZIP code fields.'); 