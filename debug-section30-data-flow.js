/**
 * Debug Script: Section 30 Data Flow Analysis
 * 
 * This script simulates the complete data flow for Section 30 to identify
 * exactly where the date value "2025-06-27" is getting assigned to field 16262 (zipcode)
 * instead of the correct date field.
 */

console.log('🔍 Section 30 Data Flow Analysis Starting...\n');

// ============================================================================
// SIMULATED SECTION 30 DATA
// ============================================================================

console.log('📋 STEP 1: SIMULATED FORM DATA CREATION');
console.log('========================================');

// Simulate what the Section 30 form data looks like when filled out
const section30FormData = {
  _id: 30,
  continuationSheets: {
    hasContinuationSheets: {
      id: "16424",
      name: "form1[0].continuation3[0].RadioButtonList[0]",
      type: "radio",
      label: "Do you need continuation sheets?",
      value: "YES",
      rect: { x: 31, y: 200.07, width: 10, height: 10 }
    },
    entries: [
      {
        _id: Date.now(),
        remarks: {
          id: "16259",
          name: "form1[0].continuation1[0].p15-t28[0]",
          type: "textarea",
          label: "Use the space below to continue answers...",
          value: "This is a continuation of my answer for Section 12.",
          rect: { x: 21.6, y: 187.2, width: 569, height: 487.8 }
        },
        personalInfo: {
          fullName: {
            id: "16270",
            name: "form1[0].continuation2[0].p17-t1[0]",
            type: "text",
            label: "Full Name (Type or Print legibly)",
            value: "John Doe",
            rect: { x: 266.59, y: 159.31, width: 218.9, height: 15.84 }
          },
          dateSigned: {
            id: "16269", // ← This should be a date field
            name: "form1[0].continuation2[0].p17-t2[0]",
            type: "date",
            label: "Date signed (m m/d d/y y y y)",
            value: "2025-06-27", // ← This is our problematic date value
            rect: { x: 490.36, y: 159.31, width: 96.6, height: 15.84 }
          },
          dateOfBirth: {
            id: "16267", // ← This should be a date field
            name: "form1[0].continuation2[0].p17-t4[0]",
            type: "date",
            label: "Date of Birth (m m/d d/y y y y)",
            value: "1990-01-15", // ← Another date value
            rect: { x: 406.09, y: 133.31, width: 78.26, height: 15.84 }
          },
          otherNamesUsed: {
            id: "16266",
            name: "form1[0].continuation2[0].p17-t3[0]",
            type: "text",
            label: "Other names used",
            value: "Johnny Doe",
            rect: { x: 26.1, y: 133.31, width: 375.9, height: 15.84 }
          },
          currentAddress: {
            street: {
              id: "16265",
              name: "form1[0].continuation2[0].p17-t6[0]",
              type: "text",
              label: "Current Street Address, Apt. #",
              value: "123 Main St",
              rect: { x: 30.39, y: 107.31, width: 167.71, height: 15.84 }
            },
            city: {
              id: "16264",
              name: "form1[0].continuation2[0].p17-t8[0]",
              type: "text",
              label: "City (Country)",
              value: "Anytown",
              rect: { x: 202.36, y: 107.31, width: 199.47, height: 15.84 }
            },
            state: {
              id: "16263",
              name: "form1[0].continuation2[0].p17-t9[0]",
              type: "dropdown",
              label: "State",
              value: "CA",
              rect: { x: 406.09, y: 107.31, width: 39.9, height: 15.84 }
            },
            zipCode: {
              id: "16262", // ← This should be a zipcode field
              name: "form1[0].continuation2[0].p17-t10[0]",
              type: "text",
              label: "ZIP Code",
              value: "12345", // ← This should be a 5-digit zipcode, NOT a date
              rect: { x: 406.09, y: 105.32, width: 80.4, height: 15.84 }
            },
            telephoneNumber: {
              id: "16261",
              name: "form1[0].continuation2[0].p17-t11[0]",
              type: "text",
              label: "Telephone number",
              value: "(555) 123-4567",
              rect: { x: 490.1, y: 105.32, width: 96.98, height: 15.84 }
            }
          }
        }
      }
    ]
  }
};

console.log('✅ Simulated Section 30 data created');
console.log('📊 Expected Field Mappings:');
console.log('   dateSigned (ID: 16269) → "2025-06-27"');
console.log('   dateOfBirth (ID: 16267) → "1990-01-15"');
console.log('   zipCode (ID: 16262) → "12345"');

// ============================================================================
// FORM DATA FLATTENING SIMULATION
// ============================================================================

console.log('\n📋 STEP 2: FORM DATA FLATTENING SIMULATION');
console.log('============================================');

const idValueMap = new Map();

function flattenFormData(data, prefix = '', depth = 0) {
  const indent = '  '.repeat(depth);
  console.log(`${indent}🔍 [DEPTH ${depth}] Analyzing: "${prefix}"`);
  
  if (!data || typeof data !== 'object') {
    return;
  }
  
  Object.entries(data).forEach(([key, val]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    
    if (val && typeof val === "object") {
      // Check if this is a Field<T> object
      if ('id' in val && 'value' in val) {
        console.log(`${indent}🎯 FOUND FIELD: "${path}"`);
        console.log(`${indent}   ID: "${val.id}"`);
        console.log(`${indent}   Value: "${val.value}"`);
        console.log(`${indent}   Type: "${val.type}"`);
        console.log(`${indent}   Label: "${val.label}"`);
        
        // Clean the ID and store in map
        const cleanId = String(val.id).replace(/ 0 R$/, '').trim();
        idValueMap.set(cleanId, val.value);
        
        console.log(`${indent}   ✅ MAPPED: ID "${cleanId}" → Value "${val.value}"`);
      } else {
        flattenFormData(val, path, depth + 1);
      }
    }
  });
}

flattenFormData(section30FormData);

console.log('\n📊 FIELD VALUE MAPPING RESULTS:');
console.log('===============================');
console.log('idValueMap contents:');
Array.from(idValueMap.entries()).forEach(([id, value]) => {
  console.log(`   "${id}" → "${value}"`);
});

// ============================================================================
// FIELD MAPPING VERIFICATION
// ============================================================================

console.log('\n📋 STEP 3: FIELD MAPPING VERIFICATION');
console.log('======================================');

const expectedMappings = {
  '16269': '2025-06-27',  // dateSigned
  '16267': '1990-01-15',  // dateOfBirth  
  '16262': '12345',       // zipCode
  '16270': 'John Doe',    // fullName
  '16266': 'Johnny Doe',  // otherNamesUsed
  '16265': '123 Main St', // street
  '16264': 'Anytown',     // city
  '16263': 'CA',          // state
  '16261': '(555) 123-4567' // telephoneNumber
};

console.log('🔍 Checking for mapping discrepancies:');
let hasDiscrepancies = false;

Object.entries(expectedMappings).forEach(([fieldId, expectedValue]) => {
  const actualValue = idValueMap.get(fieldId);
  const isCorrect = actualValue === expectedValue;
  
  console.log(`${isCorrect ? '✅' : '❌'} Field ${fieldId}:`);
  console.log(`   Expected: "${expectedValue}"`);
  console.log(`   Actual: "${actualValue}"`);
  
  if (!isCorrect) {
    hasDiscrepancies = true;
    console.log(`   🚨 DISCREPANCY DETECTED!`);
  }
});

// ============================================================================
// ROOT CAUSE ANALYSIS
// ============================================================================

console.log('\n📋 STEP 4: ROOT CAUSE ANALYSIS');
console.log('===============================');

if (!hasDiscrepancies) {
  console.log('✅ No discrepancies found in form data flattening');
  console.log('   → The issue is likely in the PDF service or field name mapping');
  console.log('   → Date value should NOT be going to field 16262');
} else {
  console.log('❌ Discrepancies found in form data flattening');
  console.log('   → Check field creation logic or data structure');
}

// Check if date value is incorrectly mapped to zipcode field
const zipCodeValue = idValueMap.get('16262');
const dateSignedValue = idValueMap.get('16269');

console.log('\n🎯 SPECIFIC ISSUE CHECK:');
console.log('========================');
console.log(`ZIP Code field (16262) value: "${zipCodeValue}"`);
console.log(`Date Signed field (16269) value: "${dateSignedValue}"`);

if (zipCodeValue === '2025-06-27' || zipCodeValue === dateSignedValue) {
  console.log('🚨 ISSUE CONFIRMED: Date value is in zipcode field!');
  console.log('   → This suggests field ID confusion during data creation');
} else if (zipCodeValue === '12345') {
  console.log('✅ ZIP Code field has correct value');
  console.log('   → Issue must be in PDF service field name to ID mapping');
} else {
  console.log('❓ Unexpected ZIP Code value found');
  console.log('   → Need to investigate data source');
}

// ============================================================================
// INVESTIGATION RECOMMENDATIONS
// ============================================================================

console.log('\n🔧 INVESTIGATION RECOMMENDATIONS:');
console.log('==================================');

if (!hasDiscrepancies && zipCodeValue === '12345') {
  console.log('1. 🔍 CHECK PDF SERVICE FIELD NAME MAPPING:');
  console.log('   → Verify fieldNameToIdMap in clientPdfService2.0.ts');
  console.log('   → Check if "form1[0].continuation2[0].p17-t10[0]" maps to "16262"');
  console.log('   → Look for field name conflicts or duplicates');
  
  console.log('\n2. 🔍 CHECK PDF FIELD maxLength DETECTION:');
  console.log('   → The PDF service detects maxLength=5 for field 16262');
  console.log('   → But sections-references shows maxLength=0');
  console.log('   → This suggests PDF document has different constraints');
  
  console.log('\n3. 🔍 CHECK FOR FIELD ID COLLISION:');
  console.log('   → Multiple field names might map to same ID');
  console.log('   → Check for duplicate or conflicting field mappings');
} else {
  console.log('1. 🔍 CHECK FIELD CREATION LOGIC:');
  console.log('   → Verify createFieldFromReference() returns correct IDs');
  console.log('   → Check sections-references data integrity');
  
  console.log('\n2. 🔍 CHECK COMPONENT onChange HANDLERS:');
  console.log('   → Verify field paths in Section30Component.tsx');
  console.log('   → Check for incorrect field targeting');
}

console.log('\n🔍 Section 30 Data Flow Analysis Complete!'); 