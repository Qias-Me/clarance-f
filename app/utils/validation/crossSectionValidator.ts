import { 
  type FieldValidationResult, 
  type ValidationOptions,
  type FieldValidationError,
  defaultValidationOptions,
  validateFieldMapping,
  FieldErrorType,
  validateType,
  validatePattern
} from './fieldValidation';
import { stripIdSuffix } from '../fieldHierarchyParser';
import { FieldMappingValidator } from './fieldMappingValidator';

// Add new error types
// Extend the existing FieldErrorType enum
enum ExtendedFieldErrorType {
  REFERENTIAL_INTEGRITY = 'referential_integrity',
  DEPENDENCY_ERROR = 'dependency_error'
}

// Combined error types
const CombinedErrorType = {
  ...FieldErrorType,
  ...ExtendedFieldErrorType
};

// Define interface structures if imports are not available
interface FieldMetadata {
  id: string;
  name: string;
  label: string;
  value: string;
  section: number;
  sectionName: string;
  type: string;
  confidence: number;
}

interface FormStructure {
  regex: string;
  confidence: number;
  fields: FieldMetadata[];
}

interface FieldHierarchy {
  [formKey: string]: FormStructure;
}

interface ApplicantFormValues {
  [key: string]: any;
}

// Define section to context key mapping
const SECTION_TO_CONTEXT_KEY: Record<number, string> = {
  1: 'personalInfo',
  2: 'birthInfo',
  3: 'placeOfBirthInfo',
  4: 'acknowledgementInfo',
  5: 'namesInfo',
  6: 'physicalAttributes',
  7: 'contactInfo',
  8: 'militaryHistory',
  9: 'citizenshipInfo',
  10: 'dualCitizenshipInfo',
  11: 'residencyInfo',
  12: 'educationInfo',
  13: 'employmentInfo',
  14: 'serviceInfo',
  15: 'militaryDetails',
  16: 'referencesInfo',
  17: 'relationshipInfo',
  18: 'relativesInfo',
  19: 'foreignContacts',
  20: 'foreignActivities',
  21: 'mentalHealth',
  22: 'policeRecord',
  23: 'drugUse',
  24: 'alcoholUse',
  25: 'investigationsInfo',
  26: 'finances',
  27: 'technology',
  28: 'courtActions',
  29: 'association',
  30: 'signature'
};

// Extend FieldValidationError to include context
interface ExtendedFieldValidationError extends FieldValidationError {
  context?: Record<string, any>;
}

// Create our own validation error type to avoid type conflicts
interface ValidationError {
  type: string;
  message: string;
  path: string;
  context?: Record<string, any>;
}

/**
 * Types of cross-section validation to perform
 */
export enum CrossSectionValidationType {
  FIELD_CONSISTENCY = 'field_consistency',
  REFERENTIAL_INTEGRITY = 'referential_integrity',
  DEPENDENCY_VALIDATION = 'dependency_validation',
  CONTEXT_COVERAGE = 'context_coverage',
  HIERARCHY_COVERAGE = 'hierarchy_coverage'
}

/**
 * Options for cross-section validation
 */
export interface CrossSectionValidationOptions extends ValidationOptions {
  validationTypes: CrossSectionValidationType[];
  includeWarnings: boolean;
  logLevel: 'error' | 'warning' | 'info' | 'debug';
  environmentMode?: 'development' | 'production';
}

/**
 * Default options for cross-section validation
 */
export const defaultCrossSectionValidationOptions: CrossSectionValidationOptions = {
  ...defaultValidationOptions,
  validationTypes: [
    CrossSectionValidationType.FIELD_CONSISTENCY,
    CrossSectionValidationType.REFERENTIAL_INTEGRITY,
    CrossSectionValidationType.CONTEXT_COVERAGE,
    CrossSectionValidationType.HIERARCHY_COVERAGE
  ],
  includeWarnings: true,
  logLevel: 'error',
  strict: true,  // Set a default value for strict
  validateTypes: true
};

/**
 * Extended validation result
 */
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Service for validating cross-section integrity and consistency
 */
export class CrossSectionValidator {
  private fieldHierarchy: FieldHierarchy;
  private options: CrossSectionValidationOptions;
  private fieldMappingValidator: FieldMappingValidator;
  
  /**
   * Constructor for the CrossSectionValidator
   * 
   * @param fieldHierarchy The field hierarchy to validate against
   * @param options Validation options
   */
  constructor(
    fieldHierarchy: FieldHierarchy, 
    options: Partial<CrossSectionValidationOptions> = {}
  ) {
    this.fieldHierarchy = fieldHierarchy;
    this.options = { ...defaultCrossSectionValidationOptions, ...options };
    this.fieldMappingValidator = new FieldMappingValidator(fieldHierarchy, this.options);
  }
  
  /**
   * Validate the context data against the field hierarchy
   * 
   * @param contextData The context data to validate
   * @returns The validation result
   */
  validateContextAgainstHierarchy(contextData: ApplicantFormValues): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: []
    };
    
    // Validate each type of cross-section validation
    if (this.options.validationTypes.includes(CrossSectionValidationType.CONTEXT_COVERAGE)) {
      this.validateContextCoverage(contextData, result);
    }
    
    if (this.options.validationTypes.includes(CrossSectionValidationType.HIERARCHY_COVERAGE)) {
      this.validateHierarchyCoverage(contextData, result);
    }
    
    if (this.options.validationTypes.includes(CrossSectionValidationType.FIELD_CONSISTENCY)) {
      this.validateFieldConsistency(contextData, result);
    }
    
    if (this.options.validationTypes.includes(CrossSectionValidationType.REFERENTIAL_INTEGRITY)) {
      this.validateReferentialIntegrity(contextData, result);
    }
    
    if (this.options.validationTypes.includes(CrossSectionValidationType.DEPENDENCY_VALIDATION)) {
      this.validateDependencies(contextData, result);
    }
    
    // Update the overall validity based on errors
    result.isValid = result.errors.length === 0;
    
    return result;
  }
  
  /**
   * Create a validation error object
   * 
   * @param path The path to the field
   * @param type The error type
   * @param message The error message
   * @param context Additional context information
   * @returns The validation error
   */
  private createError(
    path: string,
    type: string,
    message: string,
    context?: Record<string, any>
  ): ValidationError {
    return {
      type,
      message,
      path,
      context
    };
  }
  
  /**
   * Validate that all fields in context have valid mappings to the field hierarchy
   * 
   * @param contextData The context data to validate
   * @param result The validation result to update
   */
  private validateContextCoverage(contextData: ApplicantFormValues, result: ValidationResult): void {
    // Track field IDs used in context
    const usedFieldIds = new Set<string>();

    // Process each section in context
    Object.entries(SECTION_TO_CONTEXT_KEY).forEach(([sectionNum, contextKey]) => {
      const section = Number(sectionNum);
      const sectionData = contextData[contextKey as keyof ApplicantFormValues];
      
      if (!sectionData) return;
      
      // Recursively find all field IDs in the section data
      this.findFieldIds(sectionData, usedFieldIds);
    });
    
    // For each field ID in context, verify it exists in the hierarchy
    usedFieldIds.forEach(fieldId => {
      // Skip empty IDs
      if (!fieldId) return;
      
      // Strip the suffix for lookup
      const strippedId = stripIdSuffix(fieldId);
      
      // Check if field exists in hierarchy
      const found = this.findFieldInHierarchy(strippedId);
      
      if (!found) {
        result.errors.push(this.createError(
          `field.${fieldId}`,
          FieldErrorType.INVALID_ID,
          `Field ID ${fieldId} in context not found in field hierarchy`,
          { fieldId }
        ));
      }
    });
  }
  
  /**
   * Validate that all fields in the hierarchy are represented in the context
   * 
   * @param contextData The context data to validate
   * @param result The validation result to update
   */
  private validateHierarchyCoverage(contextData: ApplicantFormValues, result: ValidationResult): void {
    // Get all field IDs from the hierarchy
    const hierarchyFieldIds = new Set<string>();
    const usedFieldIds = new Set<string>();
    
    // Extract field IDs from the hierarchy
    this.extractFieldsFromHierarchy(this.fieldHierarchy, hierarchyFieldIds);
    
    // Extract used field IDs from context
    Object.entries(SECTION_TO_CONTEXT_KEY).forEach(([sectionNum, contextKey]) => {
      const sectionData = contextData[contextKey as keyof ApplicantFormValues];
      if (!sectionData) return;
      
      this.findFieldIds(sectionData, usedFieldIds);
    });
    
    // Check for hierarchy fields not in context
    hierarchyFieldIds.forEach(hierarchyId => {
      // Skip fields that should be excluded from validation
      if (this.shouldExcludeFromValidation(hierarchyId)) {
        return;
      }
      
      // Check if this field is represented in context
      const found = Array.from(usedFieldIds).some(contextId => {
        // Strip suffixes for comparison
        return stripIdSuffix(contextId) === stripIdSuffix(hierarchyId);
      });
      
      if (!found) {
        // This is a warning rather than an error
        if (this.options.includeWarnings) {
          result.errors.push(this.createError(
            `field.${hierarchyId}`,
            FieldErrorType.OTHER,
            `Field ID ${hierarchyId} from hierarchy not found in context`,
            { fieldId: hierarchyId, severity: 'warning' }
          ));
        }
      }
    });
  }
  
  /**
   * Validate field consistency across sections
   * 
   * @param contextData The context data to validate
   * @param result The validation result to update
   */
  private validateFieldConsistency(contextData: ApplicantFormValues, result: ValidationResult): void {
    // Map to track fields that are referenced in multiple sections
    const fieldIdToSections = new Map<string, Set<number>>();
    
    // Collect field IDs by section
    Object.entries(SECTION_TO_CONTEXT_KEY).forEach(([sectionNum, contextKey]) => {
      const section = Number(sectionNum);
      const sectionData = contextData[contextKey as keyof ApplicantFormValues];
      
      if (!sectionData) return;
      
      // Find all field IDs in this section
      const sectionFieldIds = new Set<string>();
      this.findFieldIds(sectionData, sectionFieldIds);
      
      // Add each field to the mapping
      sectionFieldIds.forEach(fieldId => {
        if (!fieldId) return;
        
        const strippedId = stripIdSuffix(fieldId);
        if (!fieldIdToSections.has(strippedId)) {
          fieldIdToSections.set(strippedId, new Set<number>());
        }
        
        fieldIdToSections.get(strippedId)?.add(section);
      });
    });
    
    // Find fields that appear in multiple sections
    fieldIdToSections.forEach((sections, fieldId) => {
      if (sections.size > 1) {
        // Get the expected section from field hierarchy
        const field = this.findFieldInHierarchy(fieldId);
        
        if (field && field.section) {
          const expectedSection = field.section;
          
          // Check if the field appears in sections other than the expected one
          if (!sections.has(expectedSection)) {
            result.errors.push(this.createError(
              `field.${fieldId}`,
              FieldErrorType.OTHER,
              `Field ID ${fieldId} belongs to section ${expectedSection} but is used in sections ${Array.from(sections).join(', ')}`,
              { 
                fieldId,
                expectedSection,
                actualSections: Array.from(sections)
              }
            ));
          }
        }
      }
    });
  }
  
  /**
   * Validate referential integrity between sections
   * 
   * @param contextData The context data to validate
   * @param result The validation result to update
   */
  private validateReferentialIntegrity(contextData: ApplicantFormValues, result: ValidationResult): void {
    // Define known cross-section references
    const crossSectionReferences = [
      // Example: Employment references to residency
      { source: 'employmentInfo', 
        target: 'residencyInfo', 
        refFields: ['residenceId'] },
      
      // Example: Relative references to citizenship
      { source: 'relativesInfo', 
        target: 'citizenshipInfo', 
        refFields: ['citizenshipId'] },
      
      // Add more known cross-section references as needed
    ];
    
    // Validate each cross-section reference
    crossSectionReferences.forEach(ref => {
      const sourceData = contextData[ref.source as keyof ApplicantFormValues];
      const targetData = contextData[ref.target as keyof ApplicantFormValues];
      
      if (!sourceData || !targetData) return;
      
      // Find all reference fields in the source data
      const referenceValues = new Set<string>();
      this.findReferenceValues(sourceData, ref.refFields, referenceValues);
      
      // Find all target IDs in the target data
      const targetIds = new Set<string>();
      this.findTargetIds(targetData, targetIds);
      
      // Check that all reference values exist in target IDs
      referenceValues.forEach(refValue => {
        if (refValue && !targetIds.has(refValue)) {
          result.errors.push(this.createError(
            `${ref.source}.${refValue}`,
            'referential_integrity',
            `Reference ${refValue} in ${ref.source} not found in ${ref.target}`,
            {
              sourceSection: ref.source,
              targetSection: ref.target,
              referenceValue: refValue
            }
          ));
        }
      });
    });
  }
  
  /**
   * Validate dependencies between fields
   * 
   * @param contextData The context data to validate
   * @param result The validation result to update
   */
  private validateDependencies(contextData: ApplicantFormValues, result: ValidationResult): void {
    // Define field dependencies across sections
    const fieldDependencies = [
      // Example: If hasOtherNames is true, otherNames should have entries
      { 
        condition: { field: 'namesInfo.hasOtherNames', value: true },
        dependent: { field: 'namesInfo.otherNames', check: (value: any) => Array.isArray(value) && value.length > 0 }
      },
      
      // Example: If hasForeignContacts is true, contacts should have entries
      { 
        condition: { field: 'contactInfo.hasForeignContacts', value: true },
        dependent: { field: 'foreignContacts.contacts', check: (value: any) => Array.isArray(value) && value.length > 0 }
      },
      
      // Add more dependencies as needed
    ];
    
    // Validate each dependency
    fieldDependencies.forEach(dep => {
      // Get the condition field value
      const conditionValue = this.getFieldValue(contextData, dep.condition.field);
      
      // If the condition is met, check the dependent field
      if (conditionValue === dep.condition.value) {
        const dependentValue = this.getFieldValue(contextData, dep.dependent.field);
        
        // Check if the dependent field meets the requirement
        if (!dep.dependent.check(dependentValue)) {
          result.errors.push(this.createError(
            dep.dependent.field,
            'dependency_error',
            `Dependency error: When ${dep.condition.field} is ${dep.condition.value}, ${dep.dependent.field} must meet the required condition`,
            {
              conditionField: dep.condition.field,
              conditionValue: dep.condition.value,
              dependentField: dep.dependent.field,
              dependentValue: dependentValue
            }
          ));
        }
      }
    });
  }
  
  /**
   * Recursively find all field IDs in an object
   * 
   * @param data The object to search
   * @param fieldIds Set to collect field IDs
   */
  private findFieldIds(data: any, fieldIds: Set<string>): void {
    if (!data || typeof data !== 'object') {
      return;
    }
    
    if (Array.isArray(data)) {
      // Process each array element
      data.forEach(item => this.findFieldIds(item, fieldIds));
    } else {
      // Check if this object has an ID field
      if ('id' in data && typeof data.id === 'string') {
        fieldIds.add(data.id);
      }
      
      // Recursively process all properties
      Object.values(data).forEach(value => {
        if (value && typeof value === 'object') {
          this.findFieldIds(value, fieldIds);
        }
      });
    }
  }
  
  /**
   * Extract all field IDs from the hierarchy
   * 
   * @param hierarchy The field hierarchy
   * @param fieldIds Set to collect field IDs
   */
  private extractFieldsFromHierarchy(hierarchy: FieldHierarchy, fieldIds: Set<string>): void {
    // Process each form in the hierarchy
    Object.values(hierarchy).forEach(form => {
      if (!form.fields) return;
      
      // Add each field ID
      form.fields.forEach(field => {
        if (field.id) {
          fieldIds.add(field.id);
        }
      });
    });
  }
  
  /**
   * Find a field in the hierarchy by ID
   * 
   * @param fieldId The field ID to find
   * @returns The field if found, null otherwise
   */
  private findFieldInHierarchy(fieldId: string): FieldMetadata | null {
    // Search each form in the hierarchy
    for (const form of Object.values(this.fieldHierarchy)) {
      if (!form.fields) continue;
      
      // Find the field by ID
      const field = form.fields.find(f => stripIdSuffix(f.id) === fieldId);
      if (field) {
        return field;
      }
    }
    
    return null;
  }
  
  /**
   * Check if a field should be excluded from validation
   * 
   * @param fieldId The field ID to check
   * @returns Whether to exclude the field
   */
  private shouldExcludeFromValidation(fieldId: string): boolean {
    // List of field patterns to exclude
    const excludePatterns = [
      // Comments fields
      /comments/i,
      // Continuation fields
      /continuation/i,
      // Example fields from documentation
      /example/i,
      // Placeholder fields
      /placeholder/i
    ];
    
    // Check against exclusion patterns
    return excludePatterns.some(pattern => {
      // Get field information
      const field = this.findFieldInHierarchy(fieldId);
      if (!field) return false;
      
      // Check name, label, and value against pattern
      return pattern.test(field.name) || 
             pattern.test(field.label) || 
             pattern.test(field.value);
    });
  }
  
  /**
   * Find all reference values of specified fields in an object
   * 
   * @param data The object to search
   * @param refFields The reference field names to find
   * @param refValues Set to collect reference values
   */
  private findReferenceValues(data: any, refFields: string[], refValues: Set<string>): void {
    if (!data || typeof data !== 'object') {
      return;
    }
    
    if (Array.isArray(data)) {
      // Process each array element
      data.forEach(item => this.findReferenceValues(item, refFields, refValues));
    } else {
      // Check for reference fields
      Object.entries(data).forEach(([key, value]) => {
        // If this is a reference field, add its value
        if (refFields.includes(key) && typeof value === 'string') {
          refValues.add(value);
        }
        
        // Recursively process nested objects
        if (value && typeof value === 'object') {
          this.findReferenceValues(value, refFields, refValues);
        }
      });
    }
  }
  
  /**
   * Find all target IDs in an object
   * 
   * @param data The object to search
   * @param targetIds Set to collect target IDs
   */
  private findTargetIds(data: any, targetIds: Set<string>): void {
    if (!data || typeof data !== 'object') {
      return;
    }
    
    if (Array.isArray(data)) {
      // Process each array element
      data.forEach(item => this.findTargetIds(item, targetIds));
    } else {
      // Look for ID fields
      if ('id' in data && typeof data.id === 'string') {
        targetIds.add(data.id);
      }
      
      // Also look for entryId fields
      if ('entryId' in data && typeof data.entryId === 'string') {
        targetIds.add(data.entryId);
      }
      
      // Recursively process nested objects
      Object.values(data).forEach(value => {
        if (value && typeof value === 'object') {
          this.findTargetIds(value, targetIds);
        }
      });
    }
  }
  
  /**
   * Get a field value from a path in the context data
   * 
   * @param contextData The context data
   * @param path The path to the field (dot notation)
   * @returns The field value
   */
  private getFieldValue(contextData: any, path: string): any {
    if (!contextData || !path) {
      return undefined;
    }
    
    const parts = path.split('.');
    let value = contextData;
    
    for (const part of parts) {
      if (!value || typeof value !== 'object') {
        return undefined;
      }
      
      // Handle array index notation (e.g., "items[0]")
      const match = part.match(/^([^\[]+)(?:\[(\d+)\])?$/);
      if (match) {
        const [_, property, index] = match;
        
        value = value[property];
        
        if (index !== undefined && Array.isArray(value)) {
          value = value[parseInt(index)];
        }
      } else {
        value = value[part];
      }
    }
    
    return value;
  }
} 