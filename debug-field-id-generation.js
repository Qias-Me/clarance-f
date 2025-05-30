// Debug script to test field ID generation logic directly

// Simulate the field generation logic
const FIELD_PATTERN_MAP = {
  organizationName: (entryIndex) => `TextField11[${entryIndex === 0 ? 1 : 8}]`,
  'address.street': (entryIndex) => `#area[${entryIndex === 0 ? 1 : 3}].TextField11[0]`,
  'dateRange.from': (entryIndex) => `From_Datefield_Name_2[${entryIndex * 2}]`
};

const generateFieldId = (subsectionKey, entryIndex, fieldType) => {
  const subsectionPrefix = subsectionKey === 'terrorismOrganizations' ? 'Section29[0]' : 'Section29_2[0]';
  const fieldPattern = FIELD_PATTERN_MAP[fieldType];
  const fieldSuffix = fieldPattern(entryIndex);
  return `form1[0].${subsectionPrefix}.${fieldSuffix}`;
};

console.log('=== Field ID Generation Test ===');
console.log('');

// Test Entry #1 (entryIndex = 0)
console.log('Entry #1 (entryIndex = 0):');
console.log('  Organization Name:', generateFieldId('terrorismOrganizations', 0, 'organizationName'));
console.log('  Address Street:', generateFieldId('terrorismOrganizations', 0, 'address.street'));
console.log('  From Date:', generateFieldId('terrorismOrganizations', 0, 'dateRange.from'));
console.log('');

// Test Entry #2 (entryIndex = 1)
console.log('Entry #2 (entryIndex = 1):');
console.log('  Organization Name:', generateFieldId('terrorismOrganizations', 1, 'organizationName'));
console.log('  Address Street:', generateFieldId('terrorismOrganizations', 1, 'address.street'));
console.log('  From Date:', generateFieldId('terrorismOrganizations', 1, 'dateRange.from'));
console.log('');

// Expected patterns
console.log('=== Expected Patterns ===');
console.log('Entry #1 Organization Name: form1[0].Section29[0].TextField11[1]');
console.log('Entry #2 Organization Name: form1[0].Section29[0].TextField11[8]');
console.log('Entry #1 Address Street: form1[0].Section29[0].#area[1].TextField11[0]');
console.log('Entry #2 Address Street: form1[0].Section29[0].#area[3].TextField11[0]');
console.log('Entry #1 From Date: form1[0].Section29[0].From_Datefield_Name_2[0]');
console.log('Entry #2 From Date: form1[0].Section29[0].From_Datefield_Name_2[2]');
console.log('');

// Test the logic directly
console.log('=== Logic Test ===');
console.log('entryIndex === 0 ? 1 : 8');
console.log('  entryIndex 0:', 0 === 0 ? 1 : 8); // Should be 1
console.log('  entryIndex 1:', 1 === 0 ? 1 : 8); // Should be 8
console.log('');

console.log('entryIndex === 0 ? 1 : 3');
console.log('  entryIndex 0:', 0 === 0 ? 1 : 3); // Should be 1
console.log('  entryIndex 1:', 1 === 0 ? 1 : 3); // Should be 3
console.log('');

console.log('entryIndex * 2');
console.log('  entryIndex 0:', 0 * 2); // Should be 0
console.log('  entryIndex 1:', 1 * 2); // Should be 2
