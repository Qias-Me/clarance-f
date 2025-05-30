/**
 * Quality Assurance Validation System
 * 
 * Comprehensive validation system to ensure all 30 SF-86 sections can be
 * accurately written to PDF with proper field mapping and complete workflow testing.
 */

import type { ApplicantFormValues, Field } from '../../api/interfaces/formDefinition2.0';
import { clientPdfService2 } from '../../api/service/clientPdfService';
import { validateFieldCompatibility, checkPdfServiceCompatibility } from './fieldCompatibilityValidator';
import { runPdfIntegrationTests } from './pdfIntegrationTest';

// Quality assurance result interfaces
interface SectionValidationResult {
  sectionId: string;
  sectionName: string;
  isValid: boolean;
  fieldCount: number;
  validFields: number;
  invalidFields: number;
  errors: string[];
  warnings: string[];
  pdfMappingAccuracy: number;
}

interface WorkflowValidationResult {
  workflowName: string;
  isValid: boolean;
  steps: {
    stepName: string;
    isValid: boolean;
    duration: number;
    errors: string[];
  }[];
  totalDuration: number;
  errors: string[];
}

interface QualityAssuranceReport {
  overallStatus: 'PASS' | 'FAIL' | 'WARNING';
  timestamp: string;
  totalSections: number;
  validSections: number;
  invalidSections: number;
  sectionResults: SectionValidationResult[];
  workflowResults: WorkflowValidationResult[];
  pdfIntegrationStatus: {
    isValid: boolean;
    fieldsMapped: number;
    fieldsApplied: number;
    mappingAccuracy: number;
    errors: string[];
  };
  performanceMetrics: {
    averageRenderTime: number;
    averageValidationTime: number;
    averagePdfGenerationTime: number;
    memoryUsage: number;
  };
  recommendations: string[];
  criticalIssues: string[];
}

/**
 * Section definitions for all 30 SF-86 sections
 */
const SF86_SECTIONS = [
  { id: 'section1', name: 'Information About You', implemented: true },
  { id: 'section2', name: 'Date of Birth', implemented: true },
  { id: 'section3', name: 'Place of Birth', implemented: true },
  { id: 'section4', name: 'Other Names Used', implemented: false },
  { id: 'section5', name: 'Citizenship', implemented: false },
  { id: 'section6', name: 'Dual/Multiple Citizenship', implemented: false },
  { id: 'section7', name: 'Contact Information', implemented: true },
  { id: 'section8', name: 'U.S. Passport Information', implemented: true },
  { id: 'section9', name: 'Citizenship Documentation', implemented: false },
  { id: 'section10', name: 'Residence History', implemented: false },
  { id: 'section11', name: 'Employment Activities', implemented: false },
  { id: 'section12', name: 'Education', implemented: false },
  { id: 'section13', name: 'Federal Service', implemented: false },
  { id: 'section14', name: 'Selective Service', implemented: false },
  { id: 'section15', name: 'Military History', implemented: false },
  { id: 'section16', name: 'Foreign Activities', implemented: false },
  { id: 'section17', name: 'Foreign Business', implemented: false },
  { id: 'section18', name: 'Relatives and Associates', implemented: false },
  { id: 'section19', name: 'Foreign Contacts', implemented: false },
  { id: 'section20', name: 'Foreign Travel', implemented: false },
  { id: 'section21', name: 'Psychological and Emotional Health', implemented: false },
  { id: 'section22', name: 'Police Record', implemented: false },
  { id: 'section23', name: 'Illegal Use of Drugs or Drug Activity', implemented: false },
  { id: 'section24', name: 'Use of Alcohol', implemented: false },
  { id: 'section25', name: 'Investigation and Clearance Record', implemented: false },
  { id: 'section26', name: 'Financial Record', implemented: false },
  { id: 'section27', name: 'Use of Information Technology Systems', implemented: false },
  { id: 'section28', name: 'Involvement in Non-Criminal Court Actions', implemented: false },
  { id: 'section29', name: 'Associations', implemented: true },
  { id: 'section30', name: 'Additional Comments', implemented: false }
];

/**
 * Validate a single section for PDF mapping accuracy
 */
export const validateSectionPdfMapping = async (
  sectionId: string, 
  sectionData: any
): Promise<SectionValidationResult> => {
  const section = SF86_SECTIONS.find(s => s.id === sectionId);
  const sectionName = section?.name || 'Unknown Section';
  
  const result: SectionValidationResult = {
    sectionId,
    sectionName,
    isValid: true,
    fieldCount: 0,
    validFields: 0,
    invalidFields: 0,
    errors: [],
    warnings: [],
    pdfMappingAccuracy: 0
  };

  if (!sectionData) {
    result.isValid = false;
    result.errors.push('Section data is null or undefined');
    return result;
  }

  // Count and validate fields
  const fields = extractFieldsFromSection(sectionData);
  result.fieldCount = fields.length;

  if (fields.length === 0) {
    result.warnings.push('No fields found in section');
    return result;
  }

  // Validate each field
  fields.forEach((field, index) => {
    const fieldValidation = validateField(field, `${sectionId}.field${index}`);
    
    if (fieldValidation.isValid) {
      result.validFields++;
    } else {
      result.invalidFields++;
      result.errors.push(...fieldValidation.errors);
    }
    
    result.warnings.push(...fieldValidation.warnings);
  });

  // Calculate PDF mapping accuracy
  result.pdfMappingAccuracy = result.fieldCount > 0 ? (result.validFields / result.fieldCount) * 100 : 0;
  
  // Determine overall validity
  result.isValid = result.invalidFields === 0 && result.errors.length === 0;

  return result;
};

/**
 * Validate complete workflow from form filling to PDF generation
 */
export const validateCompleteWorkflow = async (
  formData: ApplicantFormValues
): Promise<WorkflowValidationResult> => {
  const result: WorkflowValidationResult = {
    workflowName: 'Complete SF-86 Form to PDF Workflow',
    isValid: true,
    steps: [],
    totalDuration: 0,
    errors: []
  };

  const startTime = Date.now();

  // Step 1: Form Data Validation
  const step1Start = Date.now();
  try {
    const formValidation = validateFieldCompatibility(formData);
    const step1Duration = Date.now() - step1Start;
    
    result.steps.push({
      stepName: 'Form Data Validation',
      isValid: formValidation.overallValid,
      duration: step1Duration,
      errors: formValidation.overallValid ? [] : ['Form data validation failed']
    });
    
    if (!formValidation.overallValid) {
      result.isValid = false;
      result.errors.push('Form data validation failed');
    }
  } catch (error) {
    result.steps.push({
      stepName: 'Form Data Validation',
      isValid: false,
      duration: Date.now() - step1Start,
      errors: [`Validation error: ${error}`]
    });
    result.isValid = false;
    result.errors.push(`Form validation error: ${error}`);
  }

  // Step 2: PDF Service Compatibility Check
  const step2Start = Date.now();
  try {
    const compatibilityCheck = checkPdfServiceCompatibility(formData);
    const step2Duration = Date.now() - step2Start;
    
    result.steps.push({
      stepName: 'PDF Service Compatibility',
      isValid: compatibilityCheck.isCompatible,
      duration: step2Duration,
      errors: compatibilityCheck.isCompatible ? [] : compatibilityCheck.issues
    });
    
    if (!compatibilityCheck.isCompatible) {
      result.isValid = false;
      result.errors.push(...compatibilityCheck.issues);
    }
  } catch (error) {
    result.steps.push({
      stepName: 'PDF Service Compatibility',
      isValid: false,
      duration: Date.now() - step2Start,
      errors: [`Compatibility check error: ${error}`]
    });
    result.isValid = false;
    result.errors.push(`PDF compatibility error: ${error}`);
  }

  // Step 3: PDF Generation
  const step3Start = Date.now();
  try {
    const pdfResult = await clientPdfService2.generateFilledPdf(formData);
    const step3Duration = Date.now() - step3Start;
    
    result.steps.push({
      stepName: 'PDF Generation',
      isValid: pdfResult.success,
      duration: step3Duration,
      errors: pdfResult.success ? [] : pdfResult.errors
    });
    
    if (!pdfResult.success) {
      result.isValid = false;
      result.errors.push(...pdfResult.errors);
    }
  } catch (error) {
    result.steps.push({
      stepName: 'PDF Generation',
      isValid: false,
      duration: Date.now() - step3Start,
      errors: [`PDF generation error: ${error}`]
    });
    result.isValid = false;
    result.errors.push(`PDF generation error: ${error}`);
  }

  // Step 4: Field Mapping Validation
  const step4Start = Date.now();
  try {
    const mappingValidation = await clientPdfService2.validateFieldMapping(formData);
    const step4Duration = Date.now() - step4Start;
    
    const mappingErrors = mappingValidation.filter(r => !r.isValid);
    
    result.steps.push({
      stepName: 'Field Mapping Validation',
      isValid: mappingErrors.length === 0,
      duration: step4Duration,
      errors: mappingErrors.map(e => `Field ${e.fieldName}: ${e.error || 'Mapping failed'}`)
    });
    
    if (mappingErrors.length > 0) {
      result.isValid = false;
      result.errors.push(`${mappingErrors.length} field mapping errors`);
    }
  } catch (error) {
    result.steps.push({
      stepName: 'Field Mapping Validation',
      isValid: false,
      duration: Date.now() - step4Start,
      errors: [`Field mapping validation error: ${error}`]
    });
    result.isValid = false;
    result.errors.push(`Field mapping validation error: ${error}`);
  }

  result.totalDuration = Date.now() - startTime;
  return result;
};

/**
 * Run comprehensive quality assurance validation
 */
export const runQualityAssurance = async (
  formData: ApplicantFormValues
): Promise<QualityAssuranceReport> => {
  console.log('🔍 Starting comprehensive quality assurance validation...');
  
  const startTime = Date.now();
  const report: QualityAssuranceReport = {
    overallStatus: 'PASS',
    timestamp: new Date().toISOString(),
    totalSections: SF86_SECTIONS.length,
    validSections: 0,
    invalidSections: 0,
    sectionResults: [],
    workflowResults: [],
    pdfIntegrationStatus: {
      isValid: false,
      fieldsMapped: 0,
      fieldsApplied: 0,
      mappingAccuracy: 0,
      errors: []
    },
    performanceMetrics: {
      averageRenderTime: 0,
      averageValidationTime: 0,
      averagePdfGenerationTime: 0,
      memoryUsage: 0
    },
    recommendations: [],
    criticalIssues: []
  };

  // Validate each section
  for (const section of SF86_SECTIONS) {
    const sectionData = (formData as any)[section.id];
    const sectionResult = await validateSectionPdfMapping(section.id, sectionData);
    
    report.sectionResults.push(sectionResult);
    
    if (sectionResult.isValid) {
      report.validSections++;
    } else {
      report.invalidSections++;
      if (section.implemented) {
        report.criticalIssues.push(`Implemented section ${section.name} failed validation`);
      }
    }
  }

  // Validate complete workflow
  const workflowResult = await validateCompleteWorkflow(formData);
  report.workflowResults.push(workflowResult);

  // Run PDF integration tests
  try {
    const pdfIntegrationResult = await runPdfIntegrationTests();
    report.pdfIntegrationStatus = {
      isValid: pdfIntegrationResult.success,
      fieldsMapped: pdfIntegrationResult.pdfMappingTest.results.totalFields,
      fieldsApplied: pdfIntegrationResult.pdfMappingTest.results.mappedFields,
      mappingAccuracy: pdfIntegrationResult.pdfMappingTest.results.totalFields > 0 
        ? (pdfIntegrationResult.pdfMappingTest.results.mappedFields / pdfIntegrationResult.pdfMappingTest.results.totalFields) * 100 
        : 0,
      errors: pdfIntegrationResult.summary.errors
    };
  } catch (error) {
    report.pdfIntegrationStatus.errors.push(`PDF integration test failed: ${error}`);
  }

  // Calculate performance metrics
  const totalValidationTime = Date.now() - startTime;
  report.performanceMetrics.averageValidationTime = totalValidationTime / report.totalSections;
  
  // Determine overall status
  if (report.criticalIssues.length > 0 || !workflowResult.isValid || !report.pdfIntegrationStatus.isValid) {
    report.overallStatus = 'FAIL';
  } else if (report.invalidSections > 0 || report.pdfIntegrationStatus.mappingAccuracy < 95) {
    report.overallStatus = 'WARNING';
  }

  // Generate recommendations
  generateRecommendations(report);

  console.log(`✅ Quality assurance validation completed in ${totalValidationTime}ms`);
  return report;
};

/**
 * Extract fields from section data recursively
 */
const extractFieldsFromSection = (sectionData: any): any[] => {
  const fields: any[] = [];
  
  const traverse = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    
    if ('id' in obj && 'value' in obj && 'type' in obj) {
      fields.push(obj);
    } else {
      Object.values(obj).forEach(value => {
        if (Array.isArray(value)) {
          value.forEach(item => traverse(item));
        } else {
          traverse(value);
        }
      });
    }
  };
  
  traverse(sectionData);
  return fields;
};

/**
 * Validate individual field structure
 */
const validateField = (field: any, fieldPath: string) => {
  const result = {
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[]
  };

  // Required properties
  const requiredProps = ['id', 'value', 'type', 'label', 'rect'];
  for (const prop of requiredProps) {
    if (!(prop in field)) {
      result.errors.push(`${fieldPath}: Missing required property '${prop}'`);
      result.isValid = false;
    }
  }

  // Validate field ID pattern
  if (field.id && typeof field.id === 'string') {
    const validPatterns = [
      /^form1\[0\]\.Sections1-6\[0\]\./,
      /^form1\[0\]\.Sections7-9\[0\]\./,
      /^form1\[0\]\.Section\d+(_\d+)?\[0\]\./,
      /^form1\[0\]\.#subform\[/
    ];
    
    const hasValidPattern = validPatterns.some(pattern => pattern.test(field.id));
    if (!hasValidPattern) {
      result.warnings.push(`${fieldPath}: Field ID doesn't match expected PDF patterns`);
    }
  }

  return result;
};

/**
 * Generate recommendations based on validation results
 */
const generateRecommendations = (report: QualityAssuranceReport) => {
  if (report.invalidSections > 0) {
    report.recommendations.push(`${report.invalidSections} sections need attention. Review field structures and PDF mappings.`);
  }
  
  if (report.pdfIntegrationStatus.mappingAccuracy < 95) {
    report.recommendations.push(`PDF mapping accuracy is ${report.pdfIntegrationStatus.mappingAccuracy.toFixed(1)}%. Target 95%+ for production.`);
  }
  
  if (report.performanceMetrics.averageValidationTime > 1000) {
    report.recommendations.push('Validation performance is slow. Consider optimizing field validation logic.');
  }
  
  const unimplementedSections = SF86_SECTIONS.filter(s => !s.implemented).length;
  if (unimplementedSections > 0) {
    report.recommendations.push(`${unimplementedSections} sections are not yet implemented. Prioritize based on business requirements.`);
  }
};
