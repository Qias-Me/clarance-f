/**
 * Complete Field Analysis for SF-86 Section 13 Page 17
 * 
 * This script analyzes all 51+ fields on page 17 and categorizes them
 * to ensure complete UI implementation.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CompleteFieldAnalysis {
  constructor() {
    this.fieldCategories = {
      supervisorFields: [],
      employmentFields: [],
      addressFields: [],
      phoneFields: [],
      dateFields: [],
      checkboxFields: [],
      dropdownFields: [],
      radioFields: [],
      otherFields: []
    };
  }

  async analyzeAllFields() {
    console.log('🔍 Complete Field Analysis for SF-86 Section 13 Page 17');
    console.log('='.repeat(60));
    
    try {
      // Read the current page 17 data
      const dataPath = path.resolve(__dirname, '../../api/PDFoutput/page17.json');
      const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
      
      console.log(`📊 Total Fields Found: ${data.fields.length}`);
      console.log(`📄 PDF Source: ${data.pdfSource}`);
      console.log(`⏰ Last Updated: ${data.metadata.extractedAt}`);
      
      // Categorize all fields
      this.categorizeFields(data.fields);
      
      // Generate comprehensive report
      this.generateFieldReport();
      
      // Generate UI implementation plan
      this.generateUIImplementationPlan();
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      throw error;
    }
  }

  categorizeFields(fields) {
    console.log('\n🔍 Categorizing Fields...');
    
    for (const field of fields) {
      const label = (field.label || '').toLowerCase();
      const name = (field.name || '').toLowerCase();
      const type = field.type;
      
      // Categorize by content and type
      if (label.includes('supervisor')) {
        this.fieldCategories.supervisorFields.push(field);
      } else if (label.includes('date') || name.includes('date') || label.includes('from') || label.includes('to')) {
        this.fieldCategories.dateFields.push(field);
      } else if (label.includes('phone') || label.includes('telephone')) {
        this.fieldCategories.phoneFields.push(field);
      } else if (label.includes('address') || label.includes('street') || label.includes('city') || 
                 label.includes('state') || label.includes('zip') || label.includes('country')) {
        this.fieldCategories.addressFields.push(field);
      } else if (type === 'PDFCheckBox') {
        this.fieldCategories.checkboxFields.push(field);
      } else if (type === 'PDFDropdown') {
        this.fieldCategories.dropdownFields.push(field);
      } else if (type === 'PDFRadioGroup') {
        this.fieldCategories.radioFields.push(field);
      } else if (label.includes('employer') || label.includes('position') || label.includes('rank') || 
                 label.includes('duty') || label.includes('employment')) {
        this.fieldCategories.employmentFields.push(field);
      } else {
        this.fieldCategories.otherFields.push(field);
      }
    }
  }

  generateFieldReport() {
    console.log('\n📊 FIELD CATEGORIZATION REPORT');
    console.log('='.repeat(40));
    
    for (const [category, fields] of Object.entries(this.fieldCategories)) {
      console.log(`\n📋 ${category.toUpperCase()}: ${fields.length} fields`);
      
      fields.forEach((field, index) => {
        const status = field.value ? '✅' : '❌';
        console.log(`   ${status} ${field.name}`);
        console.log(`      📝 ${field.label.substring(0, 80)}${field.label.length > 80 ? '...' : ''}`);
        console.log(`      🔧 Type: ${field.type}`);
        if (field.value) {
          console.log(`      💾 Value: ${field.value}`);
        }
        console.log('');
      });
    }
  }

  generateUIImplementationPlan() {
    console.log('\n🔧 UI IMPLEMENTATION PLAN');
    console.log('='.repeat(40));
    
    console.log('\n🎯 PRIORITY 1: Supervisor Fields (CRITICAL)');
    console.log('   These fields are essential for validation:');
    this.fieldCategories.supervisorFields.forEach(field => {
      console.log(`   • ${field.name} - ${field.label.substring(0, 50)}...`);
    });
    
    console.log('\n🎯 PRIORITY 2: Employment Fields');
    console.log('   Basic employment information:');
    this.fieldCategories.employmentFields.forEach(field => {
      console.log(`   • ${field.name} - ${field.label.substring(0, 50)}...`);
    });
    
    console.log('\n🎯 PRIORITY 3: Address Fields');
    console.log('   Location and address information:');
    this.fieldCategories.addressFields.forEach(field => {
      console.log(`   • ${field.name} - ${field.label.substring(0, 50)}...`);
    });
    
    console.log('\n🎯 PRIORITY 4: Phone Fields');
    console.log('   Contact information:');
    this.fieldCategories.phoneFields.forEach(field => {
      console.log(`   • ${field.name} - ${field.label.substring(0, 50)}...`);
    });
    
    console.log('\n🎯 PRIORITY 5: Date Fields');
    console.log('   Employment dates and timelines:');
    this.fieldCategories.dateFields.forEach(field => {
      console.log(`   • ${field.name} - ${field.label.substring(0, 50)}...`);
    });
    
    console.log('\n🎯 PRIORITY 6: Interactive Fields');
    console.log('   Checkboxes, dropdowns, and radio buttons:');
    [...this.fieldCategories.checkboxFields, ...this.fieldCategories.dropdownFields, ...this.fieldCategories.radioFields].forEach(field => {
      console.log(`   • ${field.name} (${field.type}) - ${field.label.substring(0, 40)}...`);
    });
    
    console.log('\n🔧 IMPLEMENTATION STRATEGY:');
    console.log('   1. ✅ Add missing supervisor fields to UI');
    console.log('   2. ✅ Add comprehensive address fields');
    console.log('   3. ✅ Add phone number fields with extensions');
    console.log('   4. ✅ Add employment date fields');
    console.log('   5. ✅ Add checkbox fields for options');
    console.log('   6. ✅ Add dropdown fields for states/countries');
    console.log('   7. ✅ Add radio button groups');
    console.log('   8. ✅ Test complete field population');
    console.log('   9. ✅ Validate all 51+ fields are working');
    console.log('   10. ✅ Achieve 100% field population');
  }

  generateMissingFieldsList() {
    console.log('\n📋 MISSING FIELDS ANALYSIS');
    console.log('='.repeat(30));
    
    const allFields = Object.values(this.fieldCategories).flat();
    const emptyFields = allFields.filter(field => !field.value || field.value === '' || field.value === false);
    
    console.log(`📊 Total Fields: ${allFields.length}`);
    console.log(`❌ Empty Fields: ${emptyFields.length}`);
    console.log(`✅ Populated Fields: ${allFields.length - emptyFields.length}`);
    console.log(`📈 Current Fill Rate: ${(((allFields.length - emptyFields.length) / allFields.length) * 100).toFixed(2)}%`);
    
    console.log('\n🎯 FIELDS THAT NEED UI IMPLEMENTATION:');
    emptyFields.forEach((field, index) => {
      console.log(`${index + 1}. ${field.name}`);
      console.log(`   📝 ${field.label}`);
      console.log(`   🔧 Type: ${field.type}`);
      console.log('');
    });
    
    return emptyFields;
  }
}

// Main execution
async function main() {
  const analysis = new CompleteFieldAnalysis();
  
  try {
    await analysis.analyzeAllFields();
    const missingFields = analysis.generateMissingFieldsList();
    
    console.log('\n🎉 Field Analysis Complete!');
    console.log(`📋 Total fields analyzed: ${Object.values(analysis.fieldCategories).flat().length}`);
    console.log(`🎯 Fields needing UI implementation: ${missingFields.length}`);
    
  } catch (error) {
    console.error('\n💥 Analysis failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { CompleteFieldAnalysis };
