/**
 * Section 30 Field ID Collision Analysis
 * 
 * This script analyzes the exact field mapping issue where field 16262 (ZIP Code)
 * is receiving a date value "2025-06-27" instead of a ZIP code value.
 * 
 * The issue appears to be:
 * - Field 16262 should map to "form1[0].continuation2[0].p17-t10[0]" (ZIP Code field)
 * - Date fields like DATE_SIGNED_PAGE2 (16269) and DATE_OF_BIRTH (16267) should receive date values
 * - PDF service detects maxLength: 5 but sections-references shows maxLength: 0
 */

// Import required modules
const fs = require('fs');
const path = require('path');

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Analyze Section 30 field mappings for collisions
 */
function analyzeSection30FieldMappings() {
  console.log('🔍 SECTION 30 FIELD MAPPING COLLISION ANALYSIS');
  console.log('===============================================\n');

  try {
    // Load section-30.json
    const section30Path = path.join(__dirname, 'api/sections-references/section-30.json');
    const section30Data = JSON.parse(fs.readFileSync(section30Path, 'utf8'));
    
    console.log('📊 Section 30 Reference Data Analysis:');
    console.log(`   Total fields: ${section30Data.fields.length}`);
    console.log(`   Metadata total: ${section30Data.metadata.totalFields}`);
    console.log(`   Duplicates removed: ${section30Data.metadata.duplicatesRemoved}`);
    
    // Find all instances of field 16262
    const field16262Instances = section30Data.fields.filter(field => 
      field.id === '16262 0 R' || field.id === '16262'
    );
    
    console.log(`\n🎯 FIELD 16262 ANALYSIS:`);
    console.log(`   Found ${field16262Instances.length} instances of field 16262`);
    
    field16262Instances.forEach((field, index) => {
      console.log(`\n   Instance ${index + 1}:`);
      console.log(`     ID: "${field.id}"`);
      console.log(`     Name: "${field.name}"`);
      console.log(`     Label: "${field.label}"`);
      console.log(`     Type: "${field.type}"`);
      console.log(`     MaxLength: ${field.maxLength}`);
      console.log(`     Page: ${field.page}`);
      console.log(`     UniqueId: "${field.uniqueId}"`);
    });

    // Find date fields
    const dateFields = section30Data.fields.filter(field => 
      field.label && (
        field.label.toLowerCase().includes('date') ||
        field.label.toLowerCase().includes('birth')
      )
    );
    
    console.log(`\n📅 DATE FIELDS ANALYSIS:`);
    console.log(`   Found ${dateFields.length} date-related fields`);
    
    dateFields.forEach((field, index) => {
      console.log(`\n   Date Field ${index + 1}:`);
      console.log(`     ID: "${field.id}"`);
      console.log(`     Name: "${field.name}"`);
      console.log(`     Label: "${field.label}"`);
      console.log(`     Type: "${field.type}"`);
      console.log(`     MaxLength: ${field.maxLength}`);
    });

    // Check for field ID duplicates
    const fieldIdCounts = {};
    section30Data.fields.forEach(field => {
      const cleanId = field.id.replace(' 0 R', '');
      fieldIdCounts[cleanId] = (fieldIdCounts[cleanId] || 0) + 1;
    });

    const duplicateIds = Object.entries(fieldIdCounts).filter(([id, count]) => count > 1);
    
    console.log(`\n🔍 DUPLICATE FIELD ID ANALYSIS:`);
    console.log(`   Found ${duplicateIds.length} duplicate field IDs`);
    
    duplicateIds.forEach(([id, count]) => {
      console.log(`\n   Duplicate ID: "${id}" (${count} occurrences)`);
      const instances = section30Data.fields.filter(field => 
        field.id.replace(' 0 R', '') === id
      );
      
      instances.forEach((field, index) => {
        console.log(`     [${index + 1}] Name: "${field.name}" | Label: "${field.label}"`);
      });
    });

    return {
      totalFields: section30Data.fields.length,
      field16262Instances: field16262Instances.length,
      dateFields: dateFields.length,
      duplicateIds: duplicateIds.length,
      section30Data
    };

  } catch (error) {
    console.error('❌ Error analyzing Section 30 field mappings:', error);
    return null;
  }
}

/**
 * Simulate the PDF service field mapping logic
 */
function simulatePdfServiceMapping() {
  console.log('\n🎯 PDF SERVICE MAPPING SIMULATION');
  console.log('==================================\n');

  // Simulate form data that would be generated
  const mockFormData = {
    section30: {
      continuationSheets: {
        hasContinuationSheets: { id: "16424", value: "YES" },
        entries: [
          {
            personalInfo: {
              zipCode: { id: "16262", value: "12345" },
              dateSigned: { id: "16269", value: "2025-06-27" },
              dateOfBirth: { id: "16267", value: "1990-01-15" }
            }
          }
        ]
      }
    }
  };

  console.log('📊 Mock Form Data Structure:');
  console.log(JSON.stringify(mockFormData, null, 2));

  // Simulate field flattening
  const flattenedFields = new Map();
  
  function flattenFormValues(data, prefix = '') {
    if (!data || typeof data !== 'object') return;
    
    Object.entries(data).forEach(([key, val]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      
      if (val && typeof val === 'object' && 'id' in val && 'value' in val) {
        const cleanId = String(val.id).replace(' 0 R', '').trim();
        console.log(`🗂️ FIELD MAPPING: "${path}" → ID:"${cleanId}" → Value:"${val.value}"`);
        
        // Check for collision
        if (flattenedFields.has(cleanId)) {
          console.log(`🚨 COLLISION DETECTED: Field ID "${cleanId}" already mapped!`);
          console.log(`   Previous: ${flattenedFields.get(cleanId)}`);
          console.log(`   Current: ${val.value}`);
        }
        
        flattenedFields.set(cleanId, val.value);
      } else if (val && typeof val === 'object') {
        flattenFormValues(val, path);
      }
    });
  }

  flattenFormValues(mockFormData);

  console.log('\n📋 Final Field Mappings:');
  for (const [id, value] of flattenedFields.entries()) {
    console.log(`   ID ${id}: "${value}"`);
  }

  return flattenedFields;
}

/**
 * Analyze Section 30 context field ID assignments
 */
function analyzeSection30ContextIds() {
  console.log('\n🎯 SECTION 30 CONTEXT FIELD ID ANALYSIS');
  console.log('========================================\n');

  // Field IDs from the context file
  const SECTION30_NUMERIC_FIELD_IDS = {
    REMARKS: "16259",
    DATE_SIGNED_PAGE1: "16258",
    FULL_NAME_PAGE2: "16270",
    DATE_SIGNED_PAGE2: "16269",
    DATE_OF_BIRTH: "16267",
    OTHER_NAMES_PAGE2: "16266",
    STREET_ADDRESS_PAGE2: "16265",
    CITY_PAGE2: "16264",
    STATE_DROPDOWN_PAGE2: "16263",
    ZIP_CODE_PAGE2: "16262", // ← This should be the ZIP code field
    PHONE_PAGE2: "16261",
  };

  console.log('📊 Section 30 Context Field ID Mappings:');
  Object.entries(SECTION30_NUMERIC_FIELD_IDS).forEach(([fieldName, fieldId]) => {
    const isDateField = fieldName.includes('DATE');
    const isZipField = fieldName.includes('ZIP');
    
    console.log(`   ${fieldName}: "${fieldId}" ${isDateField ? '(DATE FIELD)' : isZipField ? '(ZIP FIELD)' : ''}`);
  });

  // Check for ID conflicts
  const idValues = Object.values(SECTION30_NUMERIC_FIELD_IDS);
  const duplicateContextIds = idValues.filter((id, index) => idValues.indexOf(id) !== index);
  
  if (duplicateContextIds.length > 0) {
    console.log('\n🚨 DUPLICATE IDs IN CONTEXT:');
    duplicateContextIds.forEach(id => {
      const fields = Object.entries(SECTION30_NUMERIC_FIELD_IDS)
        .filter(([name, fieldId]) => fieldId === id);
      console.log(`   ID "${id}": ${fields.map(([name]) => name).join(', ')}`);
    });
  } else {
    console.log('\n✅ No duplicate IDs found in context mappings');
  }

  return SECTION30_NUMERIC_FIELD_IDS;
}

/**
 * Cross-reference analysis between context and reference data
 */
function crossReferenceAnalysis(contextIds, section30Data) {
  console.log('\n🎯 CROSS-REFERENCE ANALYSIS');
  console.log('============================\n');

  console.log('🔍 Checking context IDs against reference data...');

  Object.entries(contextIds).forEach(([contextName, contextId]) => {
    const matchingFields = section30Data.fields.filter(field => 
      field.id.replace(' 0 R', '') === contextId
    );

    console.log(`\n📋 Context Field: ${contextName} (ID: ${contextId})`);
    
    if (matchingFields.length === 0) {
      console.log('   ❌ NO MATCHING REFERENCE FIELD');
    } else if (matchingFields.length === 1) {
      const field = matchingFields[0];
      console.log(`   ✅ MATCH: "${field.name}" - "${field.label}"`);
      console.log(`      Type: ${field.type}, MaxLength: ${field.maxLength}`);
    } else {
      console.log(`   ⚠️ MULTIPLE MATCHES (${matchingFields.length}):`);
      matchingFields.forEach((field, index) => {
        console.log(`      [${index + 1}] "${field.name}" - "${field.label}"`);
      });
    }
  });
}

/**
 * Identify the root cause of the field collision
 */
function identifyRootCause() {
  console.log('\n🎯 ROOT CAUSE ANALYSIS');
  console.log('======================\n');

  console.log('🔍 Problem Summary:');
  console.log('   - Field 16262 should be ZIP Code field');
  console.log('   - Field 16262 is receiving date value "2025-06-27"');
  console.log('   - Date fields 16269 and 16267 should receive date values');
  console.log('   - PDF service detects maxLength: 5 for ZIP field');
  console.log('   - Reference data shows maxLength: 0');

  console.log('\n🎯 Potential Root Causes:');
  console.log('   1. Field creation logic assigns wrong ID to zipCode field');
  console.log('   2. Form data flattening overwrites field mappings');
  console.log('   3. Multiple field entries cause ID collision');
  console.log('   4. Field name to ID mapping is incorrect');
  console.log('   5. Date value gets assigned to wrong field during form processing');

  console.log('\n🔧 Investigation Steps:');
  console.log('   1. ✅ Check section-30.json for field 16262 duplicates');
  console.log('   2. ✅ Verify context field ID mappings');
  console.log('   3. ✅ Simulate PDF service field flattening');
  console.log('   4. 🔄 Test actual field creation with createFieldFromReference');
  console.log('   5. 🔄 Trace form data flow from component to PDF service');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  console.log('🚀 STARTING SECTION 30 FIELD COLLISION ANALYSIS\n');

  try {
    // Step 1: Analyze Section 30 field mappings
    const analysisResult = analyzeSection30FieldMappings();
    
    if (!analysisResult) {
      console.error('❌ Failed to load Section 30 data');
      return;
    }

    // Step 2: Analyze context field IDs
    const contextIds = analyzeSection30ContextIds();

    // Step 3: Simulate PDF service mapping
    const fieldMappings = simulatePdfServiceMapping();

    // Step 4: Cross-reference analysis
    crossReferenceAnalysis(contextIds, analysisResult.section30Data);

    // Step 5: Root cause analysis
    identifyRootCause();

    console.log('\n✅ ANALYSIS COMPLETE');
    console.log('====================\n');

    console.log('📊 Summary:');
    console.log(`   Total fields in reference: ${analysisResult.totalFields}`);
    console.log(`   Field 16262 instances: ${analysisResult.field16262Instances}`);
    console.log(`   Date fields found: ${analysisResult.dateFields}`);
    console.log(`   Duplicate IDs: ${analysisResult.duplicateIds}`);
    console.log(`   Simulated mappings: ${fieldMappings.size}`);

  } catch (error) {
    console.error('❌ Error during analysis:', error);
  }
}

// Run the analysis
if (require.main === module) {
  main();
}

module.exports = {
  analyzeSection30FieldMappings,
  simulatePdfServiceMapping,
  analyzeSection30ContextIds,
  crossReferenceAnalysis,
  identifyRootCause
}; 