/**
 * Section 18 Field Analyzer and Test Data Generator
 * 
 * This utility analyzes all 964 fields in Section 18 and generates
 * comprehensive test data and field mappings for Playwright tests.
 */

const fs = require('fs');
const path = require('path');

class Section18FieldAnalyzer {
  constructor() {
    this.section18Data = this.loadSection18Data();
    this.fieldAnalysis = new Map();
    this.fieldsByType = new Map();
    this.fieldsByPage = new Map();
    this.fieldsByLabel = new Map();
  }

  loadSection18Data() {
    try {
      const dataPath = path.join(__dirname, 'api/sections-references/section-18.json');
      return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (error) {
      console.error('❌ Error loading Section 18 data:', error.message);
      return null;
    }
  }

  analyzeFields() {
    if (!this.section18Data || !this.section18Data.fields) {
      console.error('❌ No Section 18 data available for analysis');
      return;
    }

    console.log('🔍 Analyzing 964 Section 18 fields...');
    
    this.section18Data.fields.forEach((field, index) => {
      const analysis = this.analyzeField(field, index);
      this.fieldAnalysis.set(field.id, analysis);
      
      // Group by type
      if (!this.fieldsByType.has(field.type)) {
        this.fieldsByType.set(field.type, []);
      }
      this.fieldsByType.get(field.type).push(analysis);
      
      // Group by page
      if (!this.fieldsByPage.has(field.page)) {
        this.fieldsByPage.set(field.page, []);
      }
      this.fieldsByPage.get(field.page).push(analysis);
      
      // Group by label keywords
      this.categorizeByLabel(field, analysis);
    });

    this.generateSummary();
  }

  analyzeField(field, index) {
    const analysis = {
      id: field.id,
      name: field.name,
      type: field.type,
      label: field.label,
      page: field.page,
      index: index,
      testData: this.generateTestData(field, index),
      selectors: this.generateSelectors(field),
      category: this.categorizeField(field),
      priority: this.calculatePriority(field),
      complexity: this.calculateComplexity(field)
    };

    return analysis;
  }

  generateTestData(field, index) {
    const testData = {
      primary: null,
      alternatives: [],
      validation: null
    };

    switch (field.type) {
      case 'PDFTextField':
        testData.primary = this.generateTextFieldData(field, index);
        testData.alternatives = [
          `Alt${index}`,
          `Test${index}`,
          `Value${index}`
        ];
        testData.validation = this.generateValidationData(field);
        break;

      case 'PDFDropdown':
        if (field.options && field.options.length > 0) {
          testData.primary = field.options.find(opt => opt && opt.trim() !== '') || field.options[0];
          testData.alternatives = field.options.slice(0, 3);
        } else {
          testData.primary = 'TestOption';
          testData.alternatives = ['Option1', 'Option2', 'Option3'];
        }
        break;

      case 'PDFCheckBox':
        testData.primary = index % 2 === 0;
        testData.alternatives = [true, false];
        break;

      case 'PDFRadioGroup':
        if (field.options && field.options.length > 0) {
          testData.primary = field.options[index % field.options.length];
          testData.alternatives = field.options;
        } else {
          testData.primary = 'YES';
          testData.alternatives = ['YES', 'NO'];
        }
        break;

      default:
        testData.primary = `TestValue${index}`;
        testData.alternatives = [`Alt${index}`];
    }

    return testData;
  }

  generateTextFieldData(field, index) {
    const label = field.label.toLowerCase();
    
    if (label.includes('name') && label.includes('last')) {
      return `TestLastName${index}`;
    } else if (label.includes('name') && label.includes('first')) {
      return `TestFirstName${index}`;
    } else if (label.includes('name') && label.includes('middle')) {
      return `TestMiddleName${index}`;
    } else if (label.includes('city')) {
      return `TestCity${index}`;
    } else if (label.includes('address') || label.includes('street')) {
      return `123 Test Street ${index}`;
    } else if (label.includes('phone')) {
      return `(555) 123-${String(index).padStart(4, '0')}`;
    } else if (label.includes('email')) {
      return `test${index}@example.com`;
    } else if (label.includes('zip') || label.includes('postal')) {
      return `${String(index).padStart(5, '0')}`;
    } else if (label.includes('date') || label.includes('month')) {
      return '01';
    } else if (label.includes('year')) {
      return '1990';
    } else if (label.includes('organization') || label.includes('employer')) {
      return `Test Organization ${index}`;
    } else if (label.includes('position') || label.includes('title')) {
      return `Test Position ${index}`;
    } else {
      return `TestValue${index}`;
    }
  }

  generateValidationData(field) {
    const label = field.label.toLowerCase();
    
    const validation = {
      valid: [],
      invalid: [],
      edge: []
    };

    if (label.includes('phone')) {
      validation.valid = ['(555) 123-4567', '555-123-4567'];
      validation.invalid = ['123', 'invalid-phone', ''];
      validation.edge = ['(000) 000-0000', '(999) 999-9999'];
    } else if (label.includes('email')) {
      validation.valid = ['test@example.com', 'user.name@domain.org'];
      validation.invalid = ['invalid-email', '@domain.com', 'user@'];
      validation.edge = ['a@b.co', 'very.long.email.address@very.long.domain.name.com'];
    } else if (label.includes('zip')) {
      validation.valid = ['12345', '12345-6789'];
      validation.invalid = ['123', 'abcde', ''];
      validation.edge = ['00000', '99999'];
    } else if (label.includes('year')) {
      validation.valid = ['1990', '2000', '2023'];
      validation.invalid = ['90', 'abcd', ''];
      validation.edge = ['1900', '2100'];
    } else if (label.includes('month')) {
      validation.valid = ['01', '06', '12'];
      validation.invalid = ['0', '13', 'ab'];
      validation.edge = ['01', '12'];
    }

    return validation;
  }

  generateSelectors(field) {
    const selectors = [];
    
    // Primary selectors based on field type
    switch (field.type) {
      case 'PDFTextField':
        selectors.push(`input[name*="${field.name}"]`);
        selectors.push(`textarea[name*="${field.name}"]`);
        break;
      case 'PDFDropdown':
        selectors.push(`select[name*="${field.name}"]`);
        break;
      case 'PDFCheckBox':
        selectors.push(`input[type="checkbox"][name*="${field.name}"]`);
        break;
      case 'PDFRadioGroup':
        selectors.push(`input[type="radio"][name*="${field.name}"]`);
        break;
    }
    
    // Additional selectors
    selectors.push(`[data-field-id="${field.id}"]`);
    selectors.push(`[id*="${field.id}"]`);
    
    // Clean field name for selector
    const cleanName = field.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    selectors.push(`[name*="${cleanName}"]`);
    
    return selectors;
  }

  categorizeField(field) {
    const label = field.label.toLowerCase();
    
    if (label.includes('name')) return 'personal_info';
    if (label.includes('address') || label.includes('city') || label.includes('state') || label.includes('country')) return 'address';
    if (label.includes('phone') || label.includes('email')) return 'contact';
    if (label.includes('date') || label.includes('birth') || label.includes('year') || label.includes('month')) return 'dates';
    if (label.includes('relationship') || label.includes('relative')) return 'relationship';
    if (label.includes('citizenship') || label.includes('country')) return 'citizenship';
    if (label.includes('employment') || label.includes('employer') || label.includes('work')) return 'employment';
    if (label.includes('government') || label.includes('affiliation')) return 'government';
    if (label.includes('travel') || label.includes('foreign')) return 'travel';
    if (label.includes('contact') || label.includes('frequency')) return 'contact_frequency';
    
    return 'other';
  }

  categorizeByLabel(field, analysis) {
    const category = analysis.category;
    
    if (!this.fieldsByLabel.has(category)) {
      this.fieldsByLabel.set(category, []);
    }
    this.fieldsByLabel.get(category).push(analysis);
  }

  calculatePriority(field) {
    const label = field.label.toLowerCase();
    
    // High priority fields (required/critical)
    if (label.includes('required') || 
        label.includes('last name') || 
        label.includes('first name') ||
        label.includes('relationship')) {
      return 'high';
    }
    
    // Medium priority fields (important but not critical)
    if (label.includes('address') ||
        label.includes('phone') ||
        label.includes('citizenship') ||
        label.includes('birth')) {
      return 'medium';
    }
    
    // Low priority fields (optional/supplementary)
    return 'low';
  }

  calculateComplexity(field) {
    let complexity = 1;
    
    // Type complexity
    if (field.type === 'PDFDropdown' && field.options && field.options.length > 10) {
      complexity += 2;
    } else if (field.type === 'PDFRadioGroup') {
      complexity += 1;
    }
    
    // Label complexity
    if (field.label.length > 100) {
      complexity += 1;
    }
    
    // Validation complexity
    const label = field.label.toLowerCase();
    if (label.includes('phone') || label.includes('email') || label.includes('date')) {
      complexity += 2;
    }
    
    return complexity;
  }

  generateSummary() {
    console.log('\n📊 === SECTION 18 FIELD ANALYSIS SUMMARY ===');
    console.log(`Total fields analyzed: ${this.fieldAnalysis.size}`);
    
    console.log('\n📋 Fields by type:');
    for (const [type, fields] of this.fieldsByType) {
      console.log(`  ${type}: ${fields.length} fields`);
    }
    
    console.log('\n📋 Fields by category:');
    for (const [category, fields] of this.fieldsByLabel) {
      console.log(`  ${category}: ${fields.length} fields`);
    }
    
    console.log('\n📋 Fields by page:');
    const pageStats = Array.from(this.fieldsByPage.entries())
      .sort((a, b) => a[0] - b[0])
      .slice(0, 10); // Show first 10 pages
    
    for (const [page, fields] of pageStats) {
      console.log(`  Page ${page}: ${fields.length} fields`);
    }
    
    console.log('\n📋 Priority distribution:');
    const priorities = { high: 0, medium: 0, low: 0 };
    for (const analysis of this.fieldAnalysis.values()) {
      priorities[analysis.priority]++;
    }
    console.log(`  High priority: ${priorities.high} fields`);
    console.log(`  Medium priority: ${priorities.medium} fields`);
    console.log(`  Low priority: ${priorities.low} fields`);
  }

  exportTestData(outputPath = 'section18-test-data.json') {
    const testData = {
      metadata: {
        totalFields: this.fieldAnalysis.size,
        generatedAt: new Date().toISOString(),
        fieldTypes: Object.fromEntries(this.fieldsByType.entries()),
        categories: Object.fromEntries(this.fieldsByLabel.entries())
      },
      fields: Array.from(this.fieldAnalysis.values()),
      testSuites: this.generateTestSuites()
    };
    
    try {
      fs.writeFileSync(outputPath, JSON.stringify(testData, null, 2));
      console.log(`✅ Test data exported to ${outputPath}`);
    } catch (error) {
      console.error(`❌ Error exporting test data: ${error.message}`);
    }
  }

  generateTestSuites() {
    return {
      smoke: {
        description: 'Quick smoke test with high-priority fields',
        fields: Array.from(this.fieldAnalysis.values())
          .filter(f => f.priority === 'high')
          .slice(0, 20)
          .map(f => f.id)
      },
      comprehensive: {
        description: 'Full test of all 964 fields',
        fields: Array.from(this.fieldAnalysis.values()).map(f => f.id)
      },
      byType: {
        textFields: this.fieldsByType.get('PDFTextField')?.map(f => f.id) || [],
        dropdowns: this.fieldsByType.get('PDFDropdown')?.map(f => f.id) || [],
        checkboxes: this.fieldsByType.get('PDFCheckBox')?.map(f => f.id) || [],
        radioButtons: this.fieldsByType.get('PDFRadioGroup')?.map(f => f.id) || []
      },
      byCategory: Object.fromEntries(
        Array.from(this.fieldsByLabel.entries()).map(([category, fields]) => [
          category,
          fields.map(f => f.id)
        ])
      )
    };
  }

  getFieldById(fieldId) {
    return this.fieldAnalysis.get(fieldId);
  }

  getFieldsByCategory(category) {
    return this.fieldsByLabel.get(category) || [];
  }

  getFieldsByType(type) {
    return this.fieldsByType.get(type) || [];
  }

  getFieldsByPriority(priority) {
    return Array.from(this.fieldAnalysis.values())
      .filter(f => f.priority === priority);
  }
}

// CLI usage
if (require.main === module) {
  const analyzer = new Section18FieldAnalyzer();
  analyzer.analyzeFields();
  analyzer.exportTestData();
  
  console.log('\n🎯 Analysis complete! Use the exported data for comprehensive testing.');
}

module.exports = Section18FieldAnalyzer;
