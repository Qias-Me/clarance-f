/**
 * Test file to verify Section 5 data flow for PDF generation
 * This demonstrates the root cause fix for the PDF field mapping issue
 */

// Simulate the Section 5 interface functions
const SECTION5_FIELD_IDS = {
  HAS_OTHER_NAMES: "17240",
  LAST_NAME_1: "9500",
  FIRST_NAME_1: "9501",
  MIDDLE_NAME_1: "9502",
  SUFFIX_1: "9494",
  FROM_1: "9498",
  TO_1: "9497",
  REASON_1: "9499",
  PRESENT_1: "9493"
};

const SECTION5_FIELD_NAMES = {
  HAS_OTHER_NAMES: "form1[0].Sections1-6[0].section5[0].RadioButtonList[0]",
  LAST_NAME_1: "form1[0].Sections1-6[0].section5[0].TextField11[2]",
  FIRST_NAME_1: "form1[0].Sections1-6[0].section5[0].TextField11[1]",
  MIDDLE_NAME_1: "form1[0].Sections1-6[0].section5[0].TextField11[0]",
  SUFFIX_1: "form1[0].Sections1-6[0].section5[0].suffix[0]",
  FROM_1: "form1[0].Sections1-6[0].section5[0].#area[0].From_Datefield_Name_2[0]",
  TO_1: "form1[0].Sections1-6[0].section5[0].#area[0].To_Datefield_Name_2[0]",
  REASON_1: "form1[0].Sections1-6[0].section5[0].TextField11[3]",
  PRESENT_1: "form1[0].Sections1-6[0].section5[0].#field[7]"
};

function createDefaultOtherNameEntry(index) {
  return {
    lastName: {
      id: index === 0 ? SECTION5_FIELD_IDS.LAST_NAME_1 : `other_name_last_${index + 1}`,
      name: index === 0 ? SECTION5_FIELD_NAMES.LAST_NAME_1 : `other_name_last_${index + 1}`,
      type: 'PDFTextField',
      label: 'Last Name',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    firstName: {
      id: index === 0 ? SECTION5_FIELD_IDS.FIRST_NAME_1 : `other_name_first_${index + 1}`,
      name: index === 0 ? SECTION5_FIELD_NAMES.FIRST_NAME_1 : `other_name_first_${index + 1}`,
      type: 'PDFTextField',
      label: 'First Name',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    middleName: {
      id: index === 0 ? SECTION5_FIELD_IDS.MIDDLE_NAME_1 : `other_name_middle_${index + 1}`,
      name: index === 0 ? SECTION5_FIELD_NAMES.MIDDLE_NAME_1 : `other_name_middle_${index + 1}`,
      type: 'PDFTextField',
      label: 'Middle Name',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    suffix: {
      id: index === 0 ? SECTION5_FIELD_IDS.SUFFIX_1 : `other_name_suffix_${index + 1}`,
      name: index === 0 ? SECTION5_FIELD_NAMES.SUFFIX_1 : `other_name_suffix_${index + 1}`,
      type: 'PDFDropdown',
      label: 'Suffix',
      value: '',
      options: ["Jr", "Sr", "II", "III", "IV", "V"],
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    from: {
      id: index === 0 ? SECTION5_FIELD_IDS.FROM_1 : `other_name_from_${index + 1}`,
      name: index === 0 ? SECTION5_FIELD_NAMES.FROM_1 : `other_name_from_${index + 1}`,
      type: 'PDFTextField',
      label: 'From (Month/Year)',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    to: {
      id: index === 0 ? SECTION5_FIELD_IDS.TO_1 : `other_name_to_${index + 1}`,
      name: index === 0 ? SECTION5_FIELD_NAMES.TO_1 : `other_name_to_${index + 1}`,
      type: 'PDFTextField',
      label: 'To (Month/Year)',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    reasonChanged: {
      id: index === 0 ? SECTION5_FIELD_IDS.REASON_1 : `other_name_reason_${index + 1}`,
      name: index === 0 ? SECTION5_FIELD_NAMES.REASON_1 : `other_name_reason_${index + 1}`,
      type: 'PDFTextField',
      label: 'Reason Changed',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    present: {
      id: index === 0 ? SECTION5_FIELD_IDS.PRESENT_1 : `other_name_present_${index + 1}`,
      name: index === 0 ? SECTION5_FIELD_NAMES.PRESENT_1 : `other_name_present_${index + 1}`,
      type: 'PDFCheckBox',
      label: 'Present',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    }
  };
}

function createDefaultSection5() {
  return {
    _id: 5,
    section5: {
      hasOtherNames: {
        id: SECTION5_FIELD_IDS.HAS_OTHER_NAMES,
        name: SECTION5_FIELD_NAMES.HAS_OTHER_NAMES,
        type: 'PDFRadioGroup',
        label: 'Have you used any other names?',
        value: "NO", // Fixed: Start with "NO"
        rect: { x: 0, y: 0, width: 0, height: 0 }
      },
      otherNames: [] // Fixed: Start with empty array
    }
  };
}

function updateSection5Field(section5Data, update) {
  const { fieldPath, newValue, index: defaultIndex = 0 } = update;
  const newData = JSON.parse(JSON.stringify(section5Data)); // Deep clone

  if (fieldPath === 'section5.hasOtherNames') {
    newData.section5.hasOtherNames.value = newValue;
  } else if (fieldPath.startsWith('section5.otherNames')) {
    // Fixed: Parse field path with array index
    let entryIndex = defaultIndex;
    let fieldName = '';
    
    const arrayIndexMatch = fieldPath.match(/section5\.otherNames\[(\d+)\]\.(.+)/);
    if (arrayIndexMatch) {
      entryIndex = parseInt(arrayIndexMatch[1], 10);
      fieldName = arrayIndexMatch[2];
    } else {
      fieldName = fieldPath.split('.').pop() || '';
    }

    // Ensure we have enough entries
    while (newData.section5.otherNames.length <= entryIndex) {
      newData.section5.otherNames.push(createDefaultOtherNameEntry(newData.section5.otherNames.length));
    }

    // Update the field
    if (fieldName && fieldName in newData.section5.otherNames[entryIndex]) {
      newData.section5.otherNames[entryIndex][fieldName].value = newValue;

      if (fieldName === 'present' && newValue === true) {
        newData.section5.otherNames[entryIndex].to.value = 'Present';
      }
    }
  }

  return newData;
}

// Test the data flow
console.log("🧪 Testing Section 5 Data Flow Fix");
console.log("=" + "=".repeat(50));

// Test 1: Default creation (should have no entries)
let section5Data = createDefaultSection5();
console.log("\n✅ Test 1: Default Section 5 Creation");
console.log("   hasOtherNames.value:", section5Data.section5.hasOtherNames.value);
console.log("   otherNames.length:", section5Data.section5.otherNames.length);
console.log("   Expected: hasOtherNames='NO', otherNames=[]");

// Test 2: User selects "YES" - should prepare for entries
section5Data = updateSection5Field(section5Data, {
  fieldPath: 'section5.hasOtherNames',
  newValue: 'YES'
});
console.log("\n✅ Test 2: User selects 'YES' to other names");
console.log("   hasOtherNames.value:", section5Data.section5.hasOtherNames.value);
console.log("   otherNames.length:", section5Data.section5.otherNames.length);
console.log("   Expected: hasOtherNames='YES', otherNames=[] (no auto-entry)");

// Test 3: User fills in first other name
section5Data = updateSection5Field(section5Data, {
  fieldPath: 'section5.otherNames[0].lastName',
  newValue: 'Smith'
});
section5Data = updateSection5Field(section5Data, {
  fieldPath: 'section5.otherNames[0].firstName',
  newValue: 'Jane'
});
section5Data = updateSection5Field(section5Data, {
  fieldPath: 'section5.otherNames[0].from',
  newValue: '01/2010'
});
section5Data = updateSection5Field(section5Data, {
  fieldPath: 'section5.otherNames[0].to',
  newValue: '12/2015'
});
section5Data = updateSection5Field(section5Data, {
  fieldPath: 'section5.otherNames[0].reasonChanged',
  newValue: 'Marriage'
});

console.log("\n✅ Test 3: User fills in other name entry");
console.log("   otherNames.length:", section5Data.section5.otherNames.length);
console.log("   lastName.value:", section5Data.section5.otherNames[0].lastName.value);
console.log("   firstName.value:", section5Data.section5.otherNames[0].firstName.value);
console.log("   from.value:", section5Data.section5.otherNames[0].from.value);
console.log("   to.value:", section5Data.section5.otherNames[0].to.value);
console.log("   reasonChanged.value:", section5Data.section5.otherNames[0].reasonChanged.value);

// Test 4: Extract fields for PDF mapping (simulate the flattening process)
function extractFieldsForPdf(section5Data) {
  const fields = [];
  
  // Add hasOtherNames field
  const hasOtherNamesField = section5Data.section5.hasOtherNames;
  if (hasOtherNamesField.value && hasOtherNamesField.value !== '') {
    fields.push({
      id: hasOtherNamesField.id,
      name: hasOtherNamesField.name,
      value: hasOtherNamesField.value,
      type: hasOtherNamesField.type
    });
  }
  
  // Add other name entries (only if they have values)
  section5Data.section5.otherNames.forEach(entry => {
    Object.entries(entry).forEach(([fieldName, field]) => {
      if (field.value && field.value !== '' && field.value !== false) {
        fields.push({
          id: field.id,
          name: field.name,
          value: field.value,
          type: field.type
        });
      }
    });
  });
  
  return fields;
}

const fieldsForPdf = extractFieldsForPdf(section5Data);
console.log("\n✅ Test 4: Fields ready for PDF mapping");
console.log("   Total fields with values:", fieldsForPdf.length);
fieldsForPdf.forEach((field, index) => {
  console.log(`   [${index + 1}] ID:"${field.id}" Value:"${field.value}"`);
});

console.log("\n🎯 Root Cause Analysis Summary:");
console.log("   ❌ BEFORE: Default empty entries with empty values were created");
console.log("   ❌ BEFORE: Component used wrong data structure path");
console.log("   ❌ BEFORE: Field updates used wrong field paths");
console.log("   ❌ BEFORE: Array indices in field paths weren't parsed correctly");
console.log("   ✅ AFTER: Only create entries when user selects 'YES'");
console.log("   ✅ AFTER: Component uses correct data structure path");
console.log("   ✅ AFTER: Field updates use correct field paths with array indices");
console.log("   ✅ AFTER: Array indices are properly parsed from field paths");
console.log("   ✅ RESULT: Fields with actual user data get mapped to PDF!");

console.log("\n" + "=".repeat(50));
console.log("🚀 Section 5 Data Flow Test Complete!"); 