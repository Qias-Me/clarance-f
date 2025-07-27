/**
 * Integrated Validation Test for SF-86 Section 13
 * 
 * This script demonstrates the complete validation workflow:
 * 1. PDF processing in memory
 * 2. Field extraction focused on page 17
 * 3. Integration of pdf-to-images, pdf-page-field-extractor, and clear-data functionality
 * 4. Validation results with detailed reporting
 */

const fs = require('fs').promises;
const path = require('path');

class IntegratedValidationTest {
  constructor() {
    this.targetPage = 17;
    this.targetSection = 13;
    this.testResults = {
      success: false,
      totalFields: 0,
      fieldsWithValues: 0,
      fieldsEmpty: 0,
      supervisorFields: {
        name: { found: false, populated: false, value: null },
        title: { found: false, populated: false, value: null },
        phone: { found: false, populated: false, value: null },
        email: { found: false, populated: false, value: null }
      },
      processingTime: 0,
      errors: []
    };
  }

  /**
   * Main test execution
   */
  async runIntegratedTest(pdfPath) {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting Integrated Section 13 Validation Test...');
      console.log(`📄 PDF: ${pdfPath}`);
      console.log(`🎯 Target Page: ${this.targetPage}`);
      console.log(`📊 Target Section: ${this.targetSection}`);
      console.log('='.repeat(60));

      // Step 1: Validate PDF exists
      await this.validatePdfExists(pdfPath);
      
      // Step 2: Run the existing validation script
      await this.runValidationScript(pdfPath);
      
      // Step 3: Analyze supervisor field mappings
      await this.analyzeSupervisorFields();
      
      // Step 4: Generate comprehensive report
      this.generateReport();
      
      this.testResults.success = true;
      this.testResults.processingTime = Date.now() - startTime;
      
      console.log('\n✅ Integrated validation test completed successfully!');
      return this.testResults;
      
    } catch (error) {
      this.testResults.errors.push(error.message);
      this.testResults.processingTime = Date.now() - startTime;
      console.error('❌ Integrated validation test failed:', error.message);
      throw error;
    }
  }

  /**
   * Validate that the PDF file exists
   */
  async validatePdfExists(pdfPath) {
    try {
      const stats = await fs.stat(pdfPath);
      console.log(`📊 PDF Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`📅 Modified: ${stats.mtime.toISOString()}`);
    } catch (error) {
      throw new Error(`PDF file not found: ${pdfPath}`);
    }
  }

  /**
   * Run the existing validation script and capture results
   */
  async runValidationScript(pdfPath) {
    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      console.log('\n🔍 Running validation script...');
      
      const process = spawn('node', ['scripts/validate-page17.js', pdfPath], {
        cwd: path.resolve(__dirname, '../..')
      });
      
      let output = '';
      let errorOutput = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Validation script completed successfully');
          this.parseValidationOutput(output);
          resolve();
        } else {
          reject(new Error(`Validation script failed with code ${code}: ${errorOutput}`));
        }
      });
    });
  }

  /**
   * Parse the output from the validation script
   */
  parseValidationOutput(output) {
    // Extract field counts
    const totalFieldsMatch = output.match(/Total Fields: (\d+)/);
    const filledFieldsMatch = output.match(/Filled Fields: (\d+)/);
    const emptyFieldsMatch = output.match(/Empty Fields: (\d+)/);
    
    if (totalFieldsMatch) this.testResults.totalFields = parseInt(totalFieldsMatch[1]);
    if (filledFieldsMatch) this.testResults.fieldsWithValues = parseInt(filledFieldsMatch[1]);
    if (emptyFieldsMatch) this.testResults.fieldsEmpty = parseInt(emptyFieldsMatch[1]);
    
    console.log(`📊 Parsed Results: ${this.testResults.totalFields} total, ${this.testResults.fieldsWithValues} filled`);
  }

  /**
   * Analyze supervisor field mappings specifically
   */
  async analyzeSupervisorFields() {
    console.log('\n🔍 Analyzing supervisor field mappings...');
    
    try {
      // Read the extracted field data
      const fieldDataPath = path.resolve(__dirname, '../../api/PDFoutput/page17.json');
      const fieldData = JSON.parse(await fs.readFile(fieldDataPath, 'utf8'));
      
      // Look for supervisor-related fields
      const supervisorFieldPatterns = {
        name: /supervisor.*name|name.*supervisor/i,
        title: /supervisor.*title|title.*supervisor|rank.*supervisor/i,
        phone: /supervisor.*phone|phone.*supervisor/i,
        email: /supervisor.*email|email.*supervisor/i
      };
      
      for (const field of fieldData) {
        for (const [type, pattern] of Object.entries(supervisorFieldPatterns)) {
          if (pattern.test(field.label || '') || pattern.test(field.name || '')) {
            this.testResults.supervisorFields[type].found = true;
            this.testResults.supervisorFields[type].populated = !!(field.value && field.value !== '');
            this.testResults.supervisorFields[type].value = field.value;
            
            console.log(`${this.testResults.supervisorFields[type].populated ? '✅' : '❌'} Supervisor ${type}: ${field.name}`);
            if (field.value) {
              console.log(`   💾 Value: ${field.value}`);
            }
          }
        }
      }
      
    } catch (error) {
      console.warn('⚠️ Could not analyze supervisor fields:', error.message);
    }
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    console.log('\n📊 INTEGRATED VALIDATION REPORT');
    console.log('='.repeat(50));
    console.log(`🎯 Target Page: ${this.targetPage}`);
    console.log(`📊 Total Fields: ${this.testResults.totalFields}`);
    console.log(`✅ Fields with Values: ${this.testResults.fieldsWithValues}`);
    console.log(`❌ Empty Fields: ${this.testResults.fieldsEmpty}`);
    console.log(`📈 Fill Rate: ${((this.testResults.fieldsWithValues / this.testResults.totalFields) * 100).toFixed(2)}%`);
    
    console.log('\n👥 SUPERVISOR FIELD ANALYSIS:');
    console.log('-'.repeat(30));
    
    for (const [type, data] of Object.entries(this.testResults.supervisorFields)) {
      const status = data.found ? (data.populated ? '✅ POPULATED' : '❌ EMPTY') : '❓ NOT FOUND';
      console.log(`${type.toUpperCase().padEnd(8)}: ${status}`);
      if (data.value) {
        console.log(`           Value: ${data.value}`);
      }
    }
    
    console.log(`\n⏱️ Processing Time: ${this.testResults.processingTime}ms`);
    
    if (this.testResults.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.testResults.errors.forEach(error => console.log(`   - ${error}`));
    }
  }
}

// Main execution
async function main() {
  const pdfPath = process.argv[2];
  
  if (!pdfPath) {
    console.error('❌ Usage: node integrated-validation-test.js <pdf-path>');
    process.exit(1);
  }
  
  const test = new IntegratedValidationTest();
  
  try {
    await test.runIntegratedTest(pdfPath);
    console.log('\n🎉 Test completed successfully!');
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { IntegratedValidationTest };
