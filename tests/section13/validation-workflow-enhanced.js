/**
 * Enhanced Section 13 Validation Workflow
 * Combines form population, PDF generation, and immediate validation
 * Supports both in-memory and file-based validation workflows
 */

const { generateAndValidatePdf } = require('../../app/utils/pdfGenerationUtils');

class Section13ValidationWorkflow {
  constructor() {
    this.testData = {
      // Sample Section 13 data for testing
      section13: {
        employmentActivities: [{
          employer: "Test Company Inc",
          position: "Software Engineer",
          fromDate: "01/2020",
          toDate: "12/2023",
          address: {
            street: "123 Main St",
            city: "Anytown",
            state: "CA",
            zipcode: "12345"
          },
          phoneNumber: "555-123-4567",
          supervisor: "John Smith"
        }],
        hasEmployment: "YES",
        hasGaps: "YES",
        gapExplanation: "UNIQUE_GAP_EXPLANATION_TEST_789"
      }
    };

    this.validationConfigs = {
      inMemory: {
        targetPage: 33,
        sectionReference: "section-13",
        inMemoryValidation: true
      },
      withDownload: {
        targetPage: 33,
        sectionReference: "section-13",
        inMemoryValidation: false
      }
    };
  }

  /**
   * Execute in-memory validation workflow (no file downloads)
   */
  async executeInMemoryValidation() {
    console.log("🚀 Starting In-Memory Section 13 Validation Workflow");
    
    try {
      const result = await generateAndValidatePdf(
        this.testData,
        this.validationConfigs.inMemory,
        {
          filename: `SF86_Section13_InMemory_${new Date().toISOString().split('T')[0]}.pdf`,
          showConsoleOutput: true,
          onProgress: (msg) => console.log(`📋 ${msg}`),
          onError: (err) => console.error(`❌ ${err}`),
          onSuccess: (res) => console.log(`✅ Success: ${res.fieldsApplied} fields applied`)
        }
      );

      return this.generateValidationReport(result, 'in-memory');

    } catch (error) {
      console.error("💥 In-memory validation workflow failed:", error);
      throw error;
    }
  }

  /**
   * Execute traditional validation workflow (with file download)
   */
  async executeTraditionalValidation() {
    console.log("🚀 Starting Traditional Section 13 Validation Workflow");
    
    try {
      const result = await generateAndValidatePdf(
        this.testData,
        this.validationConfigs.withDownload,
        {
          filename: `SF86_Section13_Traditional_${new Date().toISOString().split('T')[0]}.pdf`,
          showConsoleOutput: true,
          onProgress: (msg) => console.log(`📋 ${msg}`),
          onError: (err) => console.error(`❌ ${err}`),
          onSuccess: (res) => console.log(`✅ Success: ${res.fieldsApplied} fields applied`)
        }
      );

      return this.generateValidationReport(result, 'traditional');

    } catch (error) {
      console.error("💥 Traditional validation workflow failed:", error);
      throw error;
    }
  }

  /**
   * Compare both validation workflows
   */
  async executeComparativeValidation() {
    console.log("🔄 Starting Comparative Validation Analysis");
    
    try {
      const [inMemoryResult, traditionalResult] = await Promise.all([
        this.executeInMemoryValidation(),
        this.executeTraditionalValidation()
      ]);

      const comparison = {
        timestamp: new Date().toISOString(),
        inMemory: inMemoryResult,
        traditional: traditionalResult,
        performance: {
          inMemoryTime: inMemoryResult.executionTime,
          traditionalTime: traditionalResult.executionTime,
          timeSaved: traditionalResult.executionTime - inMemoryResult.executionTime
        },
        consistency: {
          fieldsMatchedSame: inMemoryResult.fieldsMatched === traditionalResult.fieldsMatched,
          fieldsFoundSame: inMemoryResult.totalFieldsFound === traditionalResult.totalFieldsFound,
          successRateSame: inMemoryResult.successRate === traditionalResult.successRate
        }
      };

      console.log("\n📊 COMPARATIVE VALIDATION ANALYSIS");
      console.log(JSON.stringify(comparison, null, 2));

      // Save comparison report
      const fs = require('fs').promises;
      await fs.writeFile(
        `workspace/section13-comparative-validation-${new Date().toISOString().split('T')[0]}.json`,
        JSON.stringify(comparison, null, 2)
      );

      return comparison;

    } catch (error) {
      console.error("💥 Comparative validation failed:", error);
      throw error;
    }
  }

  /**
   * Generate comprehensive validation report
   */
  generateValidationReport(result, workflowType) {
    const startTime = Date.now();
    
    if (result.validation) {
      const validationReport = {
        timestamp: new Date().toISOString(),
        workflowType: workflowType,
        targetPage: 33,
        totalFieldsFound: result.validation.fieldsFound.length,
        fieldsMatched: result.validation.fieldsMatched,
        fieldsMissing: result.validation.fieldsMissing.length,
        successRate: (result.validation.fieldsMatched / result.validation.fieldsFound.length * 100).toFixed(2),
        missingFields: result.validation.fieldsMissing.map(f => f.name),
        executionTime: Date.now() - startTime,
        pdfGeneration: {
          success: result.success,
          fieldsMapped: result.fieldsMapped,
          fieldsApplied: result.fieldsApplied,
          errors: result.errors,
          warnings: result.warnings
        }
      };

      console.log(`\n📊 ${workflowType.toUpperCase()} VALIDATION REPORT`);
      console.log(JSON.stringify(validationReport, null, 2));

      return validationReport;
    }

    return null;
  }

  /**
   * Execute specific validation workflow based on flag
   */
  async executeValidationWorkflow(inMemoryOnly = false) {
    if (inMemoryOnly) {
      return await this.executeInMemoryValidation();
    } else {
      return await this.executeComparativeValidation();
    }
  }
}

// Export for use in other scripts
module.exports = { Section13ValidationWorkflow };

// CLI execution
if (require.main === module) {
  const workflow = new Section13ValidationWorkflow();
  
  // Check command line arguments
  const args = process.argv.slice(2);
  const inMemoryOnly = args.includes('--in-memory-only');
  const traditionalOnly = args.includes('--traditional-only');
  const comparative = args.includes('--comparative') || (!inMemoryOnly && !traditionalOnly);

  (async () => {
    try {
      if (inMemoryOnly) {
        await workflow.executeInMemoryValidation();
      } else if (traditionalOnly) {
        await workflow.executeTraditionalValidation();
      } else {
        await workflow.executeComparativeValidation();
      }
      
      console.log("🎉 Validation workflow completed successfully!");
    } catch (error) {
      console.error("💥 Validation workflow failed:", error);
      process.exit(1);
    }
  })();
}
