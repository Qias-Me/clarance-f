import { type FieldHierarchy } from '../../../api/interfaces/FieldMetadata';
import { type ApplicantFormValues } from '../../../api/interfaces/formDefinition';
import { CrossSectionValidator, CrossSectionValidationType } from './crossSectionValidator';

/**
 * Result of context mapping validation
 */
export interface ContextMappingValidationResult {
  isValid: boolean;
  missingInContext: string[];
  missingInHierarchy: string[];
  sectionConsistencyErrors: string[];
  referentialErrors: string[];
  dependencyErrors: string[];
  rawErrors: any[];
}

/**
 * Options for context mapping validation
 */
export interface ContextMappingValidationOptions {
  includeWarnings?: boolean;
  validateAllTypes?: boolean;
  excludeSections?: number[];
  validateDependencies?: boolean;
  validateReferentialIntegrity?: boolean;
  environmentMode?: 'development' | 'production';
}

/**
 * Validator for context mapping against field hierarchy
 */
export class ContextMappingValidator {
  private fieldHierarchy: FieldHierarchy;
  private options: ContextMappingValidationOptions;
  private contextCoverageValidator: CrossSectionValidator;
  private hierarchyCoverageValidator: CrossSectionValidator;
  private fieldConsistencyValidator: CrossSectionValidator;
  private referentialIntegrityValidator: CrossSectionValidator;
  private dependencyValidator: CrossSectionValidator;
  
  /**
   * Create a new context mapping validator
   * 
   * @param fieldHierarchy The field hierarchy data to validate against
   * @param options Options for validation
   */
  constructor(
    fieldHierarchy: FieldHierarchy,
    options: ContextMappingValidationOptions = {}
  ) {
    this.fieldHierarchy = fieldHierarchy;
    this.options = {
      includeWarnings: true,
      validateAllTypes: true,
      excludeSections: [],
      validateDependencies: true,
      validateReferentialIntegrity: true,
      environmentMode: 'development',
      ...options
    };
    
    // Create separate validators for each validation type
    this.contextCoverageValidator = new CrossSectionValidator(
      this.fieldHierarchy, 
      {
        includeWarnings: this.options.includeWarnings || true,
        validationTypes: [CrossSectionValidationType.CONTEXT_COVERAGE]
      }
    );
    
    this.hierarchyCoverageValidator = new CrossSectionValidator(
      this.fieldHierarchy, 
      {
        includeWarnings: this.options.includeWarnings || true,
        validationTypes: [CrossSectionValidationType.HIERARCHY_COVERAGE]
      }
    );
    
    this.fieldConsistencyValidator = new CrossSectionValidator(
      this.fieldHierarchy, 
      {
        includeWarnings: this.options.includeWarnings || true,
        validationTypes: [CrossSectionValidationType.FIELD_CONSISTENCY]
      }
    );
    
    this.referentialIntegrityValidator = new CrossSectionValidator(
      this.fieldHierarchy, 
      {
        includeWarnings: this.options.includeWarnings || true,
        validationTypes: [CrossSectionValidationType.REFERENTIAL_INTEGRITY]
      }
    );
    
    this.dependencyValidator = new CrossSectionValidator(
      this.fieldHierarchy, 
      {
        includeWarnings: this.options.includeWarnings || true,
        validationTypes: [CrossSectionValidationType.DEPENDENCY_VALIDATION]
      }
    );
  }
  
  /**
   * Validate context data against field hierarchy
   * 
   * @param contextData The context data to validate
   * @returns Validation result
   */
  validate(contextData: ApplicantFormValues): ContextMappingValidationResult {
    if (!contextData) {
      throw new Error('Context data is required for validation');
    }
    
    if (!this.fieldHierarchy) {
      throw new Error('Field hierarchy is required for validation');
    }
    
    // Default validation result
    const result: ContextMappingValidationResult = {
      isValid: true,
      missingInContext: [],
      missingInHierarchy: [],
      sectionConsistencyErrors: [],
      referentialErrors: [],
      dependencyErrors: [],
      rawErrors: []
    };
    
    try {
      // Check context coverage (fields in hierarchy exist in context)
      const contextCoverageResults = this.contextCoverageValidator.validateContextAgainstHierarchy(contextData);
      
      if (!contextCoverageResults.isValid) {
        result.isValid = false;
        result.missingInContext = contextCoverageResults.errors.map(
          (err: any) => `${err.fieldId || 'Unknown field'}: ${err.message || 'Unknown error'}`
        );
        result.rawErrors.push(...contextCoverageResults.errors);
      }
      
      // Check hierarchy coverage (fields in context exist in hierarchy)
      const hierarchyCoverageResults = this.hierarchyCoverageValidator.validateContextAgainstHierarchy(contextData);
      
      if (!hierarchyCoverageResults.isValid) {
        result.isValid = false;
        result.missingInHierarchy = hierarchyCoverageResults.errors.map(
          (err: any) => `${err.fieldId || 'Unknown field'}: ${err.message || 'Unknown error'}`
        );
        result.rawErrors.push(...hierarchyCoverageResults.errors);
      }
      
      // Check field consistency (fields are in the correct sections)
      const fieldConsistencyResults = this.fieldConsistencyValidator.validateContextAgainstHierarchy(contextData);
      
      if (!fieldConsistencyResults.isValid) {
        result.isValid = false;
        result.sectionConsistencyErrors = fieldConsistencyResults.errors.map(
          (err: any) => `${err.fieldId || 'Unknown field'}: ${err.message || 'Unknown error'}`
        );
        result.rawErrors.push(...fieldConsistencyResults.errors);
      }
      
      // Check referential integrity if enabled
      if (this.options.validateReferentialIntegrity) {
        const referentialResults = this.referentialIntegrityValidator.validateContextAgainstHierarchy(contextData);
        
        if (!referentialResults.isValid) {
          result.isValid = false;
          result.referentialErrors = referentialResults.errors.map(
            (err: any) => `${err.fieldId || 'Unknown field'}: ${err.message || 'Unknown error'}`
          );
          result.rawErrors.push(...referentialResults.errors);
        }
      }
      
      // Check dependencies if enabled
      if (this.options.validateDependencies) {
        const dependencyResults = this.dependencyValidator.validateContextAgainstHierarchy(contextData);
        
        if (!dependencyResults.isValid) {
          result.isValid = false;
          result.dependencyErrors = dependencyResults.errors.map(
            (err: any) => `${err.fieldId || 'Unknown field'}: ${err.message || 'Unknown error'}`
          );
          result.rawErrors.push(...dependencyResults.errors);
        }
      }
      
      // In development mode, log all validation errors
      if (this.options.environmentMode === 'development' && !result.isValid) {
        console.group('Context Mapping Validation Errors');
        console.log('Raw Errors:', result.rawErrors);
        console.log('Missing in Context:', result.missingInContext);
        console.log('Missing in Hierarchy:', result.missingInHierarchy);
        console.log('Section Consistency:', result.sectionConsistencyErrors);
        console.log('Referential Integrity:', result.referentialErrors);
        console.log('Dependencies:', result.dependencyErrors);
        console.groupEnd();
      }
      
      return result;
    } catch (error) {
      // In development mode, log validation errors
      if (this.options.environmentMode === 'development') {
        console.error('Error in context mapping validation:', error);
      }
      
      throw error;
    }
  }
  
  /**
   * Generate a human-readable report of context mapping validation
   * 
   * @param validationResult The validation result
   * @returns String report with validation summary
   */
  generateReport(validationResult: ContextMappingValidationResult): string {
    const lines: string[] = [];
    
    // Add header
    lines.push('# Context Mapping Validation Report');
    lines.push('');
    
    // Add summary
    lines.push('## Summary');
    lines.push('');
    lines.push(`Overall validity: ${validationResult.isValid ? '✅ Valid' : '❌ Invalid'}`);
    lines.push(`Total issues: ${validationResult.rawErrors.length}`);
    lines.push(`- Missing in context: ${validationResult.missingInContext.length}`);
    lines.push(`- Missing in hierarchy: ${validationResult.missingInHierarchy.length}`);
    lines.push(`- Section consistency errors: ${validationResult.sectionConsistencyErrors.length}`);
    lines.push(`- Referential integrity errors: ${validationResult.referentialErrors.length}`);
    lines.push(`- Dependency errors: ${validationResult.dependencyErrors.length}`);
    lines.push('');
    
    // Add detailed errors if any
    if (validationResult.missingInHierarchy.length > 0) {
      lines.push('## Fields in Context but Missing in Hierarchy');
      lines.push('');
      validationResult.missingInHierarchy.forEach(error => {
        lines.push(`- ${error}`);
      });
      lines.push('');
    }
    
    if (validationResult.missingInContext.length > 0) {
      lines.push('## Fields in Hierarchy but Missing in Context');
      lines.push('');
      validationResult.missingInContext.forEach(error => {
        lines.push(`- ${error}`);
      });
      lines.push('');
    }
    
    if (validationResult.sectionConsistencyErrors.length > 0) {
      lines.push('## Section Consistency Errors');
      lines.push('');
      validationResult.sectionConsistencyErrors.forEach(error => {
        lines.push(`- ${error}`);
      });
      lines.push('');
    }
    
    if (validationResult.referentialErrors.length > 0) {
      lines.push('## Referential Integrity Errors');
      lines.push('');
      validationResult.referentialErrors.forEach(error => {
        lines.push(`- ${error}`);
      });
      lines.push('');
    }
    
    if (validationResult.dependencyErrors.length > 0) {
      lines.push('## Dependency Errors');
      lines.push('');
      validationResult.dependencyErrors.forEach(error => {
        lines.push(`- ${error}`);
      });
      lines.push('');
    }
    
    return lines.join('\n');
  }
  
  /**
   * Validate context mapping and generate a report
   * 
   * @param contextData The context data to validate
   * @returns String report with validation summary
   */
  validateAndGenerateReport(contextData: ApplicantFormValues): string {
    const validationResult = this.validate(contextData);
    return this.generateReport(validationResult);
  }
} 