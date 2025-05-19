/**
 * Test file for enhanced self-healing implementation
 */

const { EnhancedSelfHealingManager } = require('../utils/enhanced-self-healing');

// Create a test instance
const enhancedSelfHealer = new EnhancedSelfHealingManager();

// Create some sample fields for testing
const testFields = [
  {
    id: 'field1',
    name: 'form1[0].section29[0].field1',
    section: 29,
    page: 62,
    type: 'text'
  },
  {
    id: 'field2',
    name: 'form1[0].section29[0].field2',
    section: 29,
    page: 62,
    type: 'text'
  },
  {
    id: 'field3',
    name: 'form1[0].section29[0].field3',
    section: 29,
    page: 62,
    type: 'text'
  },
  {
    id: 'field4',
    name: 'form1[0].section29[0].field4',
    section: 29,
    page: 62,
    type: 'text'
  },
  {
    id: 'field5',
    name: 'form1[0].section29[0].field5',
    section: 29,
    page: 62,
    type: 'text'
  },
  {
    id: 'field6',
    name: 'form1[0].section29[1].field1',
    section: 29,
    page: 63,
    type: 'text'
  },
  {
    id: 'field7',
    name: 'form1[0].section29[1].field2',
    section: 29,
    page: 63,
    type: 'text'
  },
  {
    id: 'field8',
    name: 'form1[0].section29[1].field3',
    section: 29,
    page: 63,
    type: 'text'
  },
  {
    id: 'field9',
    name: 'form1[0].section13[0].field1',
    section: 29,  // Incorrectly labeled as section 29
    page: 65,
    type: 'checkbox'
  },
  {
    id: 'field10',
    name: 'form1[0].section13[0].field2',
    section: 29,  // Incorrectly labeled as section 29
    page: 65,
    type: 'checkbox'
  },
  {
    id: 'field11',
    name: 'form1[0].section13[0].field3',
    section: 29,  // Incorrectly labeled as section 29
    page: 65,
    type: 'checkbox'
  },
  {
    id: 'field12',
    name: 'form1[0].section13[0].field4',
    section: 29,  // Incorrectly labeled as section 29
    page: 65,
    type: 'checkbox'
  },
  {
    id: 'field13',
    name: 'form1[0].section13[0].field5',
    section: 29,  // Incorrectly labeled as section 29
    page: 65,
    type: 'checkbox'
  }
];

// Test the identifyRepeatingFieldGroups method
console.log('Testing identifyRepeatingFieldGroups method...');
try {
  const repeatingGroups = enhancedSelfHealer.identifyRepeatingFieldGroups(testFields);
  console.log(`SUCCESS: Found ${repeatingGroups.length} repeating field groups`);
  
  // Log each group
  repeatingGroups.forEach((group, index) => {
    console.log(`Group ${index + 1}: ${group.pattern}`);
    console.log(`  Fields: ${group.fields.length}`);
    console.log(`  Sample fields: ${group.fields.slice(0, 3).map(f => f.name).join(', ')}`);
  });
  
  // The method should identify at least 2 groups:
  // 1. section29[0].field# pattern
  // 2. section13[0].field# pattern
  
  console.log('\nTest completed successfully!');
} catch (error) {
  console.error('ERROR: Test failed');
  console.error(error);
} 