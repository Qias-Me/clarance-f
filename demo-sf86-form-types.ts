/**
 * Demo: SF-86 Form Types and Interfaces
 * 
 * This demo shows how to use the new SF-86 form type system
 * for creating an online form application.
 */

import type { 
  SF86Form, 
  SF86FormField, 
  SF86Section,
  ValidationResult,
  CategorizedField 
} from './src/sectionizer/new-state/index.js';

import {
  createSF86Form,
  validateForm,
  updateFormCompletion,
  convertLegacyFieldsToForm,
  SF86_SECTION_NAMES,
  ValidationState,
  SF86FieldType
} from './src/sectionizer/new-state/index.js';

// Sample legacy categorized fields (simulating existing data)
const sampleLegacyFields: CategorizedField[] = [
  {
    id: "field_001",
    name: "form1[0].Section1[0].TextField[0]",
    value: "John",
    page: 1,
    label: "First Name",
    type: "PDFTextField",
    section: 1,
    subsection: undefined,
    entry: undefined,
    confidence: 0.95,
    rect: [100, 200, 150, 20]
  },
  {
    id: "field_002", 
    name: "form1[0].Section1[0].TextField[1]",
    value: "Doe",
    page: 1,
    label: "Last Name", 
    type: "PDFTextField",
    section: 1,
    subsection: undefined,
    entry: undefined,
    confidence: 0.92,
    rect: [260, 200, 150, 20]
  },
  {
    id: "field_003",
    name: "form1[0].Section7[0].AddressLine1[0]",
    value: "123 Main Street",
    page: 5,
    label: "Current Address Line 1",
    type: "PDFTextField", 
    section: 7,
    subsection: "A",
    entry: 1,
    confidence: 0.88,
    rect: [100, 300, 200, 20]
  },
  {
    id: "field_004",
    name: "form1[0].Section7[0].City[0]",
    value: "Anytown",
    page: 5,
    label: "Current Address City",
    type: "PDFTextField",
    section: 7,
    subsection: "A", 
    entry: 1,
    confidence: 0.90,
    rect: [100, 325, 150, 20]
  },
  {
    id: "field_005",
    name: "form1[0].Section8[0].PassportNumber[0]",
    value: "123456789",
    page: 6,
    label: "Passport Number",
    type: "PDFTextField",
    section: 8,
    subsection: undefined,
    entry: undefined,
    confidence: 0.98,
    rect: [100, 400, 180, 20]
  }
];

async function demonstrateSF86FormTypes() {
  console.log('🚀 SF-86 Form Types Demo');
  console.log('========================\n');

  // 1. Convert legacy fields to new form structure
  console.log('1. Converting legacy categorized fields to SF86Form...');
  const form: SF86Form = convertLegacyFieldsToForm(sampleLegacyFields);
  
  console.log(`   ✅ Created form with ${form.metadata.totalFields} fields`);
  console.log(`   📊 Sections: ${Object.keys(form.sections).join(', ')}`);
  console.log();

  // 2. Explore the hierarchical structure
  console.log('2. Exploring hierarchical structure...');
  
  Object.values(form.sections).forEach(section => {
    console.log(`   📁 Section ${section.sectionId}: ${section.sectionName}`);
    console.log(`      - Has subsections: ${section.hasSubsections}`);
    console.log(`      - Standalone fields: ${section.standaloneFields?.length || 0}`);
    
    Object.entries(section.subsections).forEach(([subId, subsection]) => {
      console.log(`      📂 Subsection ${subId}: ${subsection.entries.length} entries`);
      
      subsection.entries.forEach(entry => {
        console.log(`         📄 Entry ${entry.entryNumber}: ${entry.fields.length} fields`);
        entry.fields.forEach(field => {
          console.log(`            🔸 ${field.displayName}: "${field.value}"`);
        });
      });
    });
  });
  console.log();

  // 3. Demonstrate field access and manipulation
  console.log('3. Accessing and manipulating fields...');
  
  // Access Section 7 (Where You Have Lived)
  const section7 = form.sections[7];
  if (section7) {
    console.log(`   📍 Working with ${section7.sectionName}`);
    
    const subsectionA = section7.subsections['A'];
    if (subsectionA && subsectionA.entries.length > 0) {
      const firstEntry = subsectionA.entries[0];
      const addressField = firstEntry.fields.find(f => f.name.includes('AddressLine1'));
      
      if (addressField) {
        console.log(`   🏠 Found address field: ${addressField.value}`);
        
        // Update the field value
        addressField.value = '456 Oak Avenue';
        addressField.validationState = ValidationState.VALID;
        
        console.log(`   ✏️  Updated address to: ${addressField.value}`);
      }
    }
  }
  console.log();

  // 4. Validate the form
  console.log('4. Validating form...');
  const validation: ValidationResult = validateForm(form);
  
  console.log(`   ✅ Form valid: ${validation.isValid}`);
  if (validation.errors.length > 0) {
    console.log(`   ❌ Errors: ${validation.errors.length}`);
    validation.errors.forEach(error => console.log(`      - ${error}`));
  }
  if (validation.warnings.length > 0) {
    console.log(`   ⚠️  Warnings: ${validation.warnings.length}`);
    validation.warnings.forEach(warning => console.log(`      - ${warning}`));
  }
  console.log();

  // 5. Update completion percentages
  console.log('5. Calculating completion...');
  const updatedForm = updateFormCompletion(form);
  
  console.log(`   📈 Overall completion: ${updatedForm.metadata.completionPercentage}%`);
  Object.values(updatedForm.sections).forEach(section => {
    console.log(`   📊 Section ${section.sectionId}: ${section.completionPercentage}%`);
  });
  console.log();

  // 6. Demonstrate form navigation
  console.log('6. Form navigation...');
  const nav = form.navigation;
  if (nav) {
    console.log(`   🧭 Current section: ${nav.currentSection}`);
    console.log(`   ✅ Completed sections: [${nav.completedSections.join(', ')}]`);
    console.log(`   📋 Available sections: [${nav.availableSections.join(', ')}]`);
    
    // Simulate navigation
    nav.currentSection = 8;
    nav.completedSections.push(7);
    console.log(`   ➡️  Navigated to section ${nav.currentSection}`);
  }
  console.log();

  // 7. Show field type information
  console.log('7. Field type analysis...');
  const allFields: SF86FormField[] = [];
  
  Object.values(form.sections).forEach(section => {
    if (section.standaloneFields) {
      allFields.push(...section.standaloneFields);
    }
    Object.values(section.subsections).forEach(subsection => {
      if (subsection.standaloneFields) {
        allFields.push(...subsection.standaloneFields);
      }
      subsection.entries.forEach(entry => {
        allFields.push(...entry.fields);
      });
    });
  });

  const fieldTypeCount: Record<string, number> = {};
  allFields.forEach(field => {
    const type = field.type || 'unknown';
    fieldTypeCount[type] = (fieldTypeCount[type] || 0) + 1;
  });

  console.log('   📊 Field types:');
  Object.entries(fieldTypeCount).forEach(([type, count]) => {
    console.log(`      - ${type}: ${count} fields`);
  });
  console.log();

  // 8. Demonstrate serialization
  console.log('8. Form serialization...');
  const serialized = JSON.stringify(form, null, 2);
  console.log(`   💾 Serialized form size: ${serialized.length} characters`);
  
  // Parse it back
  const deserialized: SF86Form = JSON.parse(serialized);
  console.log(`   🔄 Deserialized successfully: ${deserialized.metadata.totalFields} fields`);
  console.log();

  // 9. Show section names
  console.log('9. Available SF-86 sections...');
  Object.entries(SF86_SECTION_NAMES).forEach(([id, name]) => {
    const hasData = form.sections[parseInt(id)] ? '✅' : '⭕';
    console.log(`   ${hasData} Section ${id}: ${name}`);
  });
  console.log();

  console.log('🎉 Demo completed successfully!');
  console.log('\n📝 Key Benefits:');
  console.log('   - Type-safe hierarchical structure');
  console.log('   - Built-in validation and completion tracking');
  console.log('   - Easy conversion from existing data');
  console.log('   - Form state management capabilities');
  console.log('   - Compatible with existing sectionizer output');
}

// Run the demonstration
demonstrateSF86FormTypes().catch(error => {
  console.error('Demo failed:', error);
});
