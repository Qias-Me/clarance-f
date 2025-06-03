/**
 * Test script to verify Section 29 field flattening for PDF generation
 * This script simulates the data flow from Section29Context to PDF service
 */

// Mock Section 29 data structure (similar to what's in the context)
const mockSection29Data = {
  _id: 29,
  terrorismOrganizations: {
    hasAssociation: {
      id: "16435",
      name: "form1[0].Section29[0].RadioButtonList[0]",
      type: "radio",
      label: "Have you EVER been a member of an organization dedicated to terrorism?",
      value: "YES",
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    entries: [
      {
        _id: 12345,
        organizationName: {
          id: "16135",
          name: "form1[0].Section29[0].TextField11[1]",
          type: "PDFTextField",
          label: "Organization Name",
          value: "Test Organization",
          rect: { x: 0, y: 0, width: 0, height: 0 }
        },
        address: {
          street: {
            id: "16130",
            name: "form1[0].Section29[0].#area[1].TextField11[4]",
            type: "PDFTextField",
            label: "Street Address",
            value: "123 Test Street",
            rect: { x: 0, y: 0, width: 0, height: 0 }
          },
          city: {
            id: "16129",
            name: "form1[0].Section29[0].#area[1].TextField11[5]",
            type: "PDFTextField",
            label: "City",
            value: "Test City",
            rect: { x: 0, y: 0, width: 0, height: 0 }
          }
        }
      }
    ]
  },
  terrorismActivities: {
    hasActivity: {
      id: "16433",
      name: "form1[0].Section29_2[0].RadioButtonList[0]",
      type: "radio",
      label: "Have you EVER engaged in activities designed to overthrow the U.S. Government by force?",
      value: "NO (If NO, proceed to 29.3)",
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    entries: []
  }
};

// Simulate the flattenSection29Fields function
function flattenSection29Fields(section29Data) {
  const flatFields = {};

  const addField = (field, path) => {
    if (field && typeof field === 'object' && 'id' in field && 'value' in field) {
      flatFields[field.id] = field;
    }
  };

  // Flatten main subsection flags
  Object.entries(section29Data).forEach(([subsectionKey, subsectionData]) => {
    if (subsectionKey === '_id') return;

    if (subsectionData && typeof subsectionData === 'object') {
      // Add the main flag field (hasAssociation/hasActivity)
      if ('hasAssociation' in subsectionData && subsectionData.hasAssociation) {
        addField(subsectionData.hasAssociation, `${subsectionKey}.hasAssociation`);
      }
      if ('hasActivity' in subsectionData && subsectionData.hasActivity) {
        addField(subsectionData.hasActivity, `${subsectionKey}.hasActivity`);
      }

      // Flatten entries
      if ('entries' in subsectionData && Array.isArray(subsectionData.entries)) {
        subsectionData.entries.forEach((entry, entryIndex) => {
          const flattenEntry = (obj, prefix) => {
            Object.entries(obj).forEach(([key, value]) => {
              if (key === '_id') return;

              const currentPath = `${prefix}.${key}`;
              
              if (value && typeof value === 'object' && 'id' in value && 'value' in value) {
                // This is a Field object
                addField(value, currentPath);
              } else if (value && typeof value === 'object') {
                // This is a nested object, recurse
                flattenEntry(value, currentPath);
              }
            });
          };

          flattenEntry(entry, `${subsectionKey}.entries.${entryIndex}`);
        });
      }
    }
  });

  return flatFields;
}

// Test the flattening
console.log("🧪 Testing Section 29 field flattening...");
console.log("\n📊 Original Section 29 data structure:");
console.log(JSON.stringify(mockSection29Data, null, 2));

const flattenedFields = flattenSection29Fields(mockSection29Data);

console.log("\n🔄 Flattened fields for PDF generation:");
console.log("📈 Total flattened fields:", Object.keys(flattenedFields).length);

Object.entries(flattenedFields).forEach(([fieldId, field]) => {
  console.log(`✅ Field ID: "${fieldId}" → Value: "${field.value}" (${field.type})`);
});

console.log("\n🎯 Expected field IDs that should be found:");
console.log("- 16435 (terrorismOrganizations.hasAssociation)");
console.log("- 16135 (organizationName)");
console.log("- 16130 (street address)");
console.log("- 16129 (city)");
console.log("- 16433 (terrorismActivities.hasActivity)");

console.log("\n✅ Test completed!");

// Verify specific fields
const expectedFields = ['16435', '16135', '16130', '16129', '16433'];
const foundFields = expectedFields.filter(id => flattenedFields[id]);
const missingFields = expectedFields.filter(id => !flattenedFields[id]);

console.log(`\n📊 Field verification:`);
console.log(`✅ Found fields: ${foundFields.length}/${expectedFields.length}`);
console.log(`✅ Found: ${foundFields.join(', ')}`);
if (missingFields.length > 0) {
  console.log(`❌ Missing: ${missingFields.join(', ')}`);
} else {
  console.log(`🎉 All expected fields found!`);
}
