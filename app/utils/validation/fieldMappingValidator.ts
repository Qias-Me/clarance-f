import { 
  type FieldValidationResult, 
  type ValidationOptions,
  type FieldValidationError,
  defaultValidationOptions,
  validateFieldMapping,
  FieldErrorType,
  validateType,
  validatePattern,
  validateDynamicFieldId
} from './fieldValidation';
import { stripIdSuffix, addIdSuffix, sectionToFileMapping } from '../fieldHierarchyParser';
import { generateFieldId, validateGeneratedFieldId } from '../formHandler';

/**
 * Service for validating field mapping between context data and field hierarchy
 */
export class FieldMappingValidator {
  private fieldHierarchy: any;
  private options: ValidationOptions;
  private environmentMode: 'development' | 'production' | 'custom' = 'development';
  
  /**
   * Constructor for the FieldMappingValidator
   * 
   * @param fieldHierarchy The field hierarchy to validate against
   * @param options Validation options
   */
  constructor(fieldHierarchy: any, options: ValidationOptions = defaultValidationOptions) {
    this.fieldHierarchy = fieldHierarchy;
    this.options = options;
    
    // Set initial environment mode based on options
    this.environmentMode = this.determineEnvironmentMode(options);
  }
  
  /**
   * Determine the current environment mode based on validation options
   * 
   * @param options The validation options to evaluate
   * @returns The determined environment mode
   */
  private determineEnvironmentMode(options: ValidationOptions): 'development' | 'production' | 'custom' {
    // Development mode has all validations enabled
    if (options.strict && 
        options.validateTypes && 
        options.validateRequired && 
        options.validateFormats && 
        options.validateSuffixes) {
      return 'development';
    }
    
    // Production mode has minimal validations enabled
    if (!options.strict && 
        !options.validateTypes && 
        options.validateRequired && 
        !options.validateFormats && 
        !options.validateSuffixes) {
      return 'production';
    }
    
    // Custom mode is anything else
    return 'custom';
  }
  
  /**
   * Get the current validation environment mode
   * 
   * @returns The current environment mode
   */
  getEnvironmentMode(): 'development' | 'production' | 'custom' {
    return this.environmentMode;
  }
  
  /**
   * Get the current validation options
   * 
   * @returns The current validation options
   */
  getOptions(): ValidationOptions {
    return { ...this.options };
  }
  
  /**
   * Validate a value based on type and empty-check requirements
   * 
   * @param value The value to validate
   * @param options Validation options
   * @returns True if the value is valid
   */
  private validateValue(value: any, options: {
    allowEmptyObjects?: boolean;
    allowEmptyArrays?: boolean;
    allowZero?: boolean;
    allowFalse?: boolean;
    allowEmptyString?: boolean;
  }): boolean {
    // Handle undefined and null cases
    if (value === undefined || value === null) {
      return false;
    }
    
    // Type-specific validation
    switch (typeof value) {
      case 'string':
        // String is empty and we don't allow empty strings
        return options.allowEmptyString || value.trim().length > 0;
        
      case 'number':
        // Number is zero and we don't allow zero
        return options.allowZero || value !== 0;
        
      case 'boolean':
        // Boolean is false and we don't allow false
        return options.allowFalse || value !== false;
        
      case 'object':
        if (Array.isArray(value)) {
          // Array is empty and we don't allow empty arrays
          return options.allowEmptyArrays || value.length > 0;
        } else {
          // Object is empty and we don't allow empty objects
          return options.allowEmptyObjects || Object.keys(value).length > 0;
        }
        
      default:
        return true; // Other types are considered valid
    }
  }
  
  /**
   * Set the validation options
   * 
   * @param options The new validation options
   */
  setOptions(options: Partial<ValidationOptions>): void {
    this.options = { ...this.options, ...options };
    this.environmentMode = this.determineEnvironmentMode(this.options);
  }
  
  /**
   * Set one of the predefined validation modes (development, production, or custom)
   * 
   * @param mode The validation mode to set
   * @param customOptions Optional custom validation options (required when mode is 'custom')
   */
  setValidationMode(
    mode: 'development' | 'production' | 'custom',
    customOptions?: Partial<ValidationOptions>
  ): void {
    switch (mode) {
      case 'development':
        this.setDevelopmentMode(true);
        break;
        
      case 'production':
        this.setDevelopmentMode(false);
        break;
        
      case 'custom':
        if (!customOptions) {
          console.warn('Custom validation mode requires customOptions parameter');
          return;
        }
        this.setOptions(customOptions);
        break;
    }
    
    this.environmentMode = mode;
  }
  
  /**
   * Set the development mode (strict validation)
   * 
   * @param isDevelopment Whether the application is in development mode
   */
  setDevelopmentMode(isDevelopment: boolean): void {
    this.options.strict = isDevelopment;
    
    // In development mode, enable all validations by default
    if (isDevelopment) {
      this.options.validateTypes = true;
      this.options.validateRequired = true;
      this.options.validateFormats = true;
      this.options.validateSuffixes = true;
      this.environmentMode = 'development';
    } else {
      // In production mode, only enable critical validations
      this.options.validateTypes = false;
      this.options.validateRequired = true;
      this.options.validateFormats = false;
      this.options.validateSuffixes = false;
      this.environmentMode = 'production';
    }
  }
  
  /**
   * Enable or disable specific validation features individually
   * 
   * @param feature The validation feature to toggle
   * @param enabled Whether the feature should be enabled
   * @param preserveMode If false, sets mode to 'custom' when changing individual features
   */
  setValidationFeature(
    feature: keyof ValidationOptions,
    enabled: boolean,
    preserveMode: boolean = false
  ): void {
    if (feature in this.options) {
      (this.options as any)[feature] = enabled;
      
      if (!preserveMode) {
        this.environmentMode = this.determineEnvironmentMode(this.options);
      }
    } else {
      console.warn(`Unknown validation feature: ${feature}`);
    }
  }
  
  /**
   * Configure validation for optimal performance based on runtime context
   * 
   * @param contextConfig Configuration options for the runtime context
   */
  optimizeForRuntime(contextConfig: {
    isServerSide?: boolean;
    isCriticalPath?: boolean;
    isInitialRender?: boolean;
    userHasEdited?: boolean;
    isSubmitAttempt?: boolean;
  }): void {
    const { 
      isServerSide = false,
      isCriticalPath = false,
      isInitialRender = false,
      userHasEdited = false,
      isSubmitAttempt = false
    } = contextConfig;
    
    // Configure validation based on runtime context
    if (isSubmitAttempt) {
      // Always perform thorough validation on submit
      this.setOptions({
        strict: true,
        validateTypes: true,
        validateRequired: true,
        validateFormats: true,
        validateSuffixes: this.options.validateSuffixes // Preserve suffix validation setting
      });
    } else if (isServerSide) {
      // On server-side, focus on critical validations only
      this.setOptions({
        strict: false,
        validateTypes: false,
        validateRequired: true,
        validateFormats: false,
        validateSuffixes: false
      });
    } else if (isInitialRender && !userHasEdited) {
      // On initial render before user edits, use minimal validation
      this.setOptions({
        strict: false,
        validateTypes: false,
        validateRequired: false, // Don't validate required fields until user starts editing
        validateFormats: false,
        validateSuffixes: false
      });
    } else if (isCriticalPath) {
      // For critical-path operations, balance validation and performance
      this.setOptions({
        strict: false,
        validateTypes: true,
        validateRequired: true,
        validateFormats: true,
        validateSuffixes: false
      });
    }
    
    // Update environment mode
    this.environmentMode = this.determineEnvironmentMode(this.options);
  }
  
  /**
   * Validate a section context against the field hierarchy
   * 
   * @param contextData The section context data to validate
   * @param sectionName The name of the section being validated
   * @returns The validation result
   */
  validateSection(contextData: any, sectionName: string): FieldValidationResult {
    const logEnabled = process.env.NODE_ENV === 'development' || this.options.strict;
    
    if (logEnabled) {
      console.log(`Validating section: ${sectionName}`);
    }
    
    // Perform validation
    const result = validateFieldMapping(contextData, this.fieldHierarchy, this.options);
    
    // Log validation results in development mode or when strict mode is enabled
    if (logEnabled && !result.isValid) {
      console.warn(`Validation failed for section ${sectionName}. Found ${result.errors.length} issues:`);
      
      // Group errors by type for better readability
      const errorsByType: Record<string, number> = {};
      
      result.errors.forEach(error => {
        errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
        
        // Log detailed error information in development mode
        if (this.options.strict) {
          console.warn(`- ${error.message} at path: ${error.path}`);
        }
      });
      
      // Log error summary
      console.warn('Error summary:');
      for (const [type, count] of Object.entries(errorsByType)) {
        console.warn(`- ${type}: ${count} issues`);
      }
    } else if (logEnabled) {
      console.log(`Validation successful for section ${sectionName}`);
    }
    
    return result;
  }
  
  /**
   * Validate a specific field ID against the field hierarchy
   * 
   * @param fieldId The field ID to validate
   * @param fieldPath The path to the field in the context
   * @returns Whether the field ID is valid
   */
  validateFieldId(fieldId: string, fieldPath: string): boolean {
    // Create a mock field object for validation
    const mockField = { id: fieldId, value: '' };
    
    // Validate the field
    const result = validateFieldMapping({ mockField }, this.fieldHierarchy, this.options);
    
    // Check if there are any ID-related errors
    const hasIdErrors = result.errors.some(error => 
      error.type === FieldErrorType.INVALID_ID || 
      error.type === FieldErrorType.SUFFIX_ERROR
    );
    
    return !hasIdErrors;
  }
  
  /**
   * Helper function to create a validation error object
   * 
   * @param path The path to the field with the error
   * @param type The type of error
   * @param details Additional error details
   * @returns A field validation error object
   */
  private createError(
    path: string,
    type: FieldErrorType,
    details: {
      message?: string;
      fieldId?: string;
      expectedId?: string;
      expectedType?: string;
      actualValue?: any;
    } = {}
  ): FieldValidationError {
    return {
      path,
      fieldId: details.fieldId,
      expectedId: details.expectedId,
      message: details.message || `Validation error at ${path}`,
      type,
      // These properties might not be in the FieldValidationError interface yet
      // but they're useful for debugging and error reporting
      ...(details.expectedType ? { expectedType: details.expectedType } : {}),
      ...(details.actualValue !== undefined ? { actualValue: details.actualValue } : {})
    } as FieldValidationError;
  }
  
  /**
   * Helper method to validate a field value against various constraints
   * 
   * @param value The value to validate
   * @param fieldPath The path to the field
   * @param constraints The validation constraints
   * @param fieldId Optional field ID for error reporting
   * @returns An array of validation errors (empty if value is valid)
   */
  private validateFieldValue(
    value: any,
    fieldPath: string,
    constraints: {
      required?: boolean;
      type?: string;
      minLength?: number;
      maxLength?: number;
      minValue?: number;
      maxValue?: number;
      pattern?: string | RegExp;
      allowEmptyString?: boolean;
      allowZero?: boolean;
      allowFalse?: boolean;
      allowEmptyObjects?: boolean;
      allowEmptyArrays?: boolean;
      customValidator?: (val: any) => boolean | string;
    },
    fieldId?: string
  ): FieldValidationError[] {
    const errors: FieldValidationError[] = [];
    
    // Skip validation if value is undefined/null and not required
    if ((value === undefined || value === null) && !constraints.required) {
      return errors;
    }
    
    // Required validation
    if (constraints.required && !this.validateValue(value, {
      allowEmptyString: constraints.allowEmptyString,
      allowZero: constraints.allowZero,
      allowFalse: constraints.allowFalse,
      allowEmptyObjects: constraints.allowEmptyObjects,
      allowEmptyArrays: constraints.allowEmptyArrays
    })) {
      errors.push(this.createError(fieldPath, FieldErrorType.MISSING_REQUIRED, {
        message: `Required field "${fieldPath}" is empty or invalid`,
        fieldId
      }));
      return errors; // Skip further validation if the required check fails
    }
    
    // Skip further validation if value is null/undefined (and not required)
    if (value === undefined || value === null) {
      return errors;
    }
    
    // Type validation
    if (constraints.type && !validateType(value, constraints.type)) {
      errors.push(this.createError(fieldPath, FieldErrorType.TYPE_MISMATCH, {
        message: `Field "${fieldPath}" has incorrect type, expected ${constraints.type}`,
        fieldId,
        expectedType: constraints.type,
        actualValue: value
      }));
      // Continue validation even if type doesn't match
    }
    
    // String/Array length validation
    if ((typeof value === 'string' || Array.isArray(value))) {
      if (constraints.minLength !== undefined && value.length < constraints.minLength) {
        errors.push(this.createError(fieldPath, FieldErrorType.VALUE_OUT_OF_RANGE, {
          message: `Field "${fieldPath}" is too short (minimum length: ${constraints.minLength})`,
          fieldId,
          expectedType: 'length >= ' + constraints.minLength,
          actualValue: value.length
        }));
      }
      
      if (constraints.maxLength !== undefined && value.length > constraints.maxLength) {
        errors.push(this.createError(fieldPath, FieldErrorType.VALUE_OUT_OF_RANGE, {
          message: `Field "${fieldPath}" is too long (maximum length: ${constraints.maxLength})`,
          fieldId,
          expectedType: 'length <= ' + constraints.maxLength,
          actualValue: value.length
        }));
      }
    }
    
    // Numeric range validation
    if (typeof value === 'number') {
      if (constraints.minValue !== undefined && value < constraints.minValue) {
        errors.push(this.createError(fieldPath, FieldErrorType.VALUE_OUT_OF_RANGE, {
          message: `Field "${fieldPath}" is below minimum value (${constraints.minValue})`,
          fieldId,
          expectedType: '>= ' + constraints.minValue,
          actualValue: value
        }));
      }
      
      if (constraints.maxValue !== undefined && value > constraints.maxValue) {
        errors.push(this.createError(fieldPath, FieldErrorType.VALUE_OUT_OF_RANGE, {
          message: `Field "${fieldPath}" exceeds maximum value (${constraints.maxValue})`,
          fieldId,
          expectedType: '<= ' + constraints.maxValue,
          actualValue: value
        }));
      }
    }
    
    // Pattern validation
    if (typeof value === 'string' && constraints.pattern) {
      if (!validatePattern(value, constraints.pattern)) {
        const patternStr = constraints.pattern instanceof RegExp 
          ? constraints.pattern.toString() 
          : `"${constraints.pattern}"`;
        
        errors.push(this.createError(fieldPath, FieldErrorType.PATTERN_MISMATCH, {
          message: `Field "${fieldPath}" does not match the required pattern ${patternStr}`,
          fieldId,
          expectedType: 'pattern match',
          actualValue: value
        }));
      }
    }
    
    // Custom validator
    if (constraints.customValidator) {
      const customResult = constraints.customValidator(value);
      if (customResult !== true) {
        const errorMsg = typeof customResult === 'string' 
          ? customResult 
          : `Field "${fieldPath}" failed custom validation`;
        
        errors.push(this.createError(fieldPath, FieldErrorType.OTHER, {
          message: errorMsg,
          fieldId,
          actualValue: value
        }));
      }
    }
    
    return errors;
  }
  
  /**
   * Navigates to a field in the context data using a dot-notation path
   * 
   * @param contextData The context data to navigate
   * @param fieldPath The path to the field (dot notation with array indices in brackets)
   * @returns An object containing the field value, whether the path is valid, and the current path for error reporting
   */
  private navigateToField(contextData: any, fieldPath: string): { 
    value: any;
    isPathValid: boolean;
    currentPath: string;
    lastValidPath: string;
    fieldId?: string;
  } {
    // Handle empty path
    if (!fieldPath) {
      return { 
        value: contextData, 
        isPathValid: true, 
        currentPath: '', 
        lastValidPath: '' 
      };
    }
    
    const pathParts = fieldPath.split('.');
    let current = contextData;
    let isPathValid = true;
    let currentPath = '';
    let lastValidPath = '';
    
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      
      // Update the current path for error reporting
      currentPath = currentPath ? `${currentPath}.${part}` : part;
      
      // Handle array indices in the path
      const match = part.match(/^([^\[]+)(?:\[(\d+)\])?$/);
      
      if (match) {
        const propName = match[1];
        const arrayIndex = match[2] ? parseInt(match[2]) : undefined;
        
        if (arrayIndex !== undefined) {
          // Handle array properties
          if (!current || !current[propName] || !Array.isArray(current[propName]) || 
               current[propName].length <= arrayIndex) {
            isPathValid = false;
            break;
          }
          lastValidPath = currentPath.replace(/\[\d+\]$/, '');
          current = current[propName][arrayIndex];
        } else {
          // Handle regular properties
          if (!current || current[propName] === undefined) {
            isPathValid = false;
            break;
          }
          lastValidPath = currentPath;
          current = current[propName];
        }
      } else {
        if (!current || current[part] === undefined) {
          isPathValid = false;
          break;
        }
        lastValidPath = currentPath;
        current = current[part];
      }
    }
    
    // Extract field ID if available
    const fieldId = current?.id;
    
    // Extract field value (handle both value property and direct value)
    const fieldValue = current?.value !== undefined ? current.value : current;
    
    return {
      value: fieldValue,
      isPathValid,
      currentPath,
      lastValidPath,
      fieldId
    };
  }
  
  /**
   * Check if all required fields are present in the context data with enhanced validation
   * 
   * @param contextData The context data to validate
   * @param requiredFields An array of required field paths
   * @param validationOptions Additional validation options
   * @returns The validation result focusing on required fields
   */
  validateRequiredFields(
    contextData: any, 
    requiredFields: string[],
    validationOptions?: {
      allowEmptyObjects?: boolean;
      allowEmptyArrays?: boolean;
      allowZero?: boolean;
      allowFalse?: boolean;
      allowEmptyString?: boolean;
      valueConstraints?: {
        [fieldPath: string]: {
          type?: string;
          minLength?: number;
          maxLength?: number;
          minValue?: number;
          maxValue?: number;
          pattern?: string | RegExp;
          customValidator?: (val: any) => boolean | string;
        }
      }
    }
  ): FieldValidationResult {
    const result: FieldValidationResult = {
      isValid: true,
      errors: []
    };
    
    // Default validation options if not provided
    const options = {
      allowEmptyObjects: validationOptions?.allowEmptyObjects ?? false,
      allowEmptyArrays: validationOptions?.allowEmptyArrays ?? false,
      allowZero: validationOptions?.allowZero ?? true,
      allowFalse: validationOptions?.allowFalse ?? true,
      allowEmptyString: validationOptions?.allowEmptyString ?? false,
      valueConstraints: validationOptions?.valueConstraints ?? {}
    };
    
    // Check each required field
    for (const fieldPath of requiredFields) {
      // Navigate to the field using the path
      const { value, isPathValid, currentPath, fieldId } = this.navigateToField(contextData, fieldPath);
      
      // If the path is invalid, add a missing field error
      if (!isPathValid) {
        result.isValid = false;
        result.errors.push(this.createError(currentPath, FieldErrorType.MISSING_FIELD, {
          message: `Field "${currentPath}" is missing`,
          fieldId
        }));
        continue;
      }
      
      // Get the constraints for this field
      const constraints = options.valueConstraints[fieldPath] || {};
      
      // Validate the field value against all constraints
      const fieldErrors = this.validateFieldValue(
        value,
        fieldPath,
        {
          required: true,
          allowEmptyObjects: options.allowEmptyObjects,
          allowEmptyArrays: options.allowEmptyArrays,
          allowZero: options.allowZero,
          allowFalse: options.allowFalse,
          allowEmptyString: options.allowEmptyString,
          ...constraints
        },
        fieldId
      );
      
      // Add any field validation errors to the result
      if (fieldErrors.length > 0) {
        result.isValid = false;
        result.errors.push(...fieldErrors);
      }
    }
    
    return result;
  }
  
  /**
   * Validate a specific field against constraints
   * 
   * @param contextData The context data containing the field
   * @param fieldPath The path to the field to validate
   * @param constraints The validation constraints to apply
   * @returns The validation result for this field
   */
  validateField(
    contextData: any,
    fieldPath: string,
    constraints: {
      required?: boolean;
      type?: string;
      minLength?: number;
      maxLength?: number;
      minValue?: number;
      maxValue?: number;
      pattern?: string | RegExp;
      allowEmptyString?: boolean;
      allowZero?: boolean;
      allowFalse?: boolean;
      allowEmptyObjects?: boolean;
      allowEmptyArrays?: boolean;
      customValidator?: (val: any) => boolean | string;
    }
  ): FieldValidationResult {
    const result: FieldValidationResult = {
      isValid: true,
      errors: []
    };
    
    // Navigate to the field
    const { value, isPathValid, currentPath, fieldId } = this.navigateToField(contextData, fieldPath);
    
    // Check if the path is valid
    if (!isPathValid) {
      // Only report missing if field is required
      if (constraints.required) {
        result.isValid = false;
        result.errors.push(this.createError(currentPath, FieldErrorType.MISSING_FIELD, {
          message: `Field "${currentPath}" is missing`,
          fieldId
        }));
      }
      return result;
    }
    
    // Validate the field value
    const fieldErrors = this.validateFieldValue(value, fieldPath, constraints, fieldId);
    
    if (fieldErrors.length > 0) {
      result.isValid = false;
      result.errors.push(...fieldErrors);
    }
    
    return result;
  }
  
  /**
   * Validate multiple fields against specified constraints
   * 
   * @param contextData The context data containing the fields
   * @param fieldConstraints Map of field paths to their constraints
   * @returns The validation result for all fields
   */
  validateFields(
    contextData: any,
    fieldConstraints: {
      [fieldPath: string]: {
        required?: boolean;
        type?: string;
        minLength?: number;
        maxLength?: number;
        minValue?: number;
        maxValue?: number;
        pattern?: string | RegExp;
        allowEmptyString?: boolean;
        allowZero?: boolean;
        allowFalse?: boolean;
        allowEmptyObjects?: boolean;
        allowEmptyArrays?: boolean;
        customValidator?: (val: any) => boolean | string;
      }
    }
  ): FieldValidationResult {
    const result: FieldValidationResult = {
      isValid: true,
      errors: []
    };
    
    // Validate each field
    for (const [fieldPath, constraints] of Object.entries(fieldConstraints)) {
      const fieldResult = this.validateField(contextData, fieldPath, constraints);
      
      if (!fieldResult.isValid) {
        result.isValid = false;
        result.errors.push(...fieldResult.errors);
      }
    }
    
    return result;
  }
  
  /**
   * Generate a validation report for a section
   * 
   * @param contextData The section context data to validate
   * @param sectionName The name of the section being validated
   * @returns A formatted validation report
   */
  generateValidationReport(contextData: any, sectionName: string): string {
    const result = this.validateSection(contextData, sectionName);
    
    let report = `Validation Report for Section: ${sectionName}\n`;
    report += `=======================================\n\n`;
    
    if (result.isValid) {
      report += `✅ All fields validated successfully\n`;
    } else {
      report += `❌ Validation failed with ${result.errors.length} issues\n\n`;
      
      // Group errors by type
      const errorsByType: Record<string, FieldValidationResult['errors']> = {};
      
      result.errors.forEach(error => {
        if (!errorsByType[error.type]) {
          errorsByType[error.type] = [];
        }
        errorsByType[error.type].push(error);
      });
      
      // Report errors by type
      for (const [type, errors] of Object.entries(errorsByType)) {
        report += `${type} (${errors.length} issues):\n`;
        
        errors.forEach(error => {
          report += `  - ${error.message}\n`;
          report += `    Path: ${error.path}\n`;
          if (error.fieldId) {
            report += `    Field ID: ${error.fieldId}\n`;
          }
          if (error.expectedId) {
            report += `    Expected ID: ${error.expectedId}\n`;
          }
          report += `\n`;
        });
      }
    }
    
    return report;
  }
  
  /**
   * Validates fields with dynamic entries (repeated sections) and handles ID suffix variations
   * 
   * @param contextData The context data containing dynamic entries to validate
   * @param sectionPath The path to the section in the context data (e.g., 'namesInfo', 'residencyInfo')
   * @param options Additional validation options
   * @returns The validation result focusing on dynamic entries and suffix handling
   */
  validateDynamicEntries(
    contextData: any,
    sectionPath: string,
    options?: {
      strictIdFormat?: boolean;
      validateArrayIndices?: boolean;
      ignoreEmptyEntries?: boolean;
      allowPartialEntries?: boolean;
      dynamicArrayPaths?: string[];
    }
  ): FieldValidationResult {
    const validationResult: FieldValidationResult = {
      isValid: true,
      errors: []
    };
    
    const {
      strictIdFormat = this.options.validateSuffixes,
      validateArrayIndices = true,
      ignoreEmptyEntries = true,
      allowPartialEntries = true,
      dynamicArrayPaths = []
    } = options || {};
    
    // Determine section number from section path
    let sectionNumber: number | undefined;
    for (const [key, value] of Object.entries(sectionToFileMapping)) {
      if (value === sectionPath) {
        sectionNumber = parseInt(key, 10);
        break;
      }
    }
    
    if (!sectionNumber) {
      console.warn(`Could not determine section number for path: ${sectionPath}`);
    }
    
    // Find dynamic arrays in the context data
    const dynamicArrays: {path: string, array: any[]}[] = [];
    
    // Function to recursively find arrays in the context data
    const findDynamicArrays = (data: any, path: string = '') => {
      if (!data || typeof data !== 'object') return;
      
      if (Array.isArray(data)) {
        // Check if this is a dynamic array we should validate
        const shouldValidate = dynamicArrayPaths.length === 0 || 
          dynamicArrayPaths.some(pattern => {
            if (pattern.includes('*')) {
              // Handle wildcard pattern matching
              const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
              return regex.test(path);
            }
            return path === pattern;
          });
          
        if (shouldValidate && data.length > 0) {
          dynamicArrays.push({path, array: data});
        }
        
        // Also check array items for nested dynamic arrays
        data.forEach((item, index) => {
          findDynamicArrays(item, `${path}[${index}]`);
        });
      } else {
        // Process object properties
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            const nestedPath = path ? `${path}.${key}` : key;
            findDynamicArrays(data[key], nestedPath);
          }
        }
      }
    };
    
    // Start the search for dynamic arrays
    findDynamicArrays(contextData);
    
    // Process each dynamic array
    dynamicArrays.forEach(({path, array}) => {
      // Validate each entry in the array
      array.forEach((entry, index) => {
        // Skip empty entries if specified
        if (ignoreEmptyEntries && (entry === null || entry === undefined || 
            (typeof entry === 'object' && Object.keys(entry).length === 0))) {
          return;
        }
        
        // Process fields in this entry
        const validateEntryFields = (entryData: any, entryPath: string) => {
          if (!entryData || typeof entryData !== 'object') return;
          
          // Process each property in the entry
          for (const key in entryData) {
            const value = entryData[key];
            const fieldPath = `${entryPath}.${key}`;
            
            // Check if this property is a field with an ID
            if (value && typeof value === 'object' && 'id' in value) {
              const fieldId = value.id;
              
              // Validate field ID suffix if required
              if (strictIdFormat) {
                const hasSuffix = fieldId.endsWith(' 0 R');
                const baseId = stripIdSuffix(fieldId);
                
                if (this.options.validateSuffixes && !hasSuffix) {
                  validationResult.errors.push(this.createError(fieldPath, FieldErrorType.SUFFIX_ERROR, {
                    fieldId,
                    message: `Field ${fieldPath} is missing the required "0 R" suffix`,
                    expectedId: addIdSuffix(baseId)
                  }));
                }
              }
              
              // For non-first entries, validate the dynamic field ID pattern
              if (index > 0) {
                // Find the first entry's corresponding field to get the base ID
                const firstEntry = array[0];
                const firstEntryField = getNestedProperty(firstEntry, key);
                
                if (firstEntryField && firstEntryField.id) {
                  const baseId = stripIdSuffix(firstEntryField.id);
                  const expectedId = generateFieldId(baseId, index, sectionPath);
                  
                  // Compare with the actual ID (after stripping suffix if necessary)
                  const actualBaseId = stripIdSuffix(fieldId);
                  
                  if (actualBaseId !== expectedId) {
                    validationResult.errors.push(this.createError(fieldPath, FieldErrorType.INVALID_ID, {
                      fieldId: actualBaseId,
                      expectedId,
                      message: `Dynamic field ID ${actualBaseId} doesn't match expected pattern for entry ${index}`
                    }));
                  }
                }
              }
            }
            
            // Recursively validate nested objects
            if (value && typeof value === 'object' && !Array.isArray(value)) {
              validateEntryFields(value, fieldPath);
            }
          }
        };
        
        validateEntryFields(entry, `${path}[${index}]`);
      });
      
      // Validate array indices if required
      if (validateArrayIndices) {
        // Check for contiguous indices (no gaps)
        // This is important for dynamic entries like repeating sections
        for (let i = 0; i < array.length; i++) {
          if (array[i] === undefined) {
            validationResult.errors.push(this.createError(path, FieldErrorType.OTHER, {
              message: `Missing entry at index ${i} in dynamic array ${path}`
            }));
          }
        }
      }
    });
    
    validationResult.isValid = validationResult.errors.length === 0;
    return validationResult;
  }
}

/**
 * Helper function to create a validation error
 * This is exported to ensure consistent error creation across validation modules
 * 
 * @param path The path to the field
 * @param type The error type
 * @param details Additional details about the error
 * @returns A field validation error object
 */
export function createValidationError(
  path: string, 
  type: FieldErrorType, 
  details: { 
    message?: string, 
    fieldId?: string, 
    expectedId?: string,
    expectedType?: string,
    actualValue?: any
  } = {}
): FieldValidationError {
  return {
    path,
    fieldId: details.fieldId,
    expectedId: details.expectedId,
    message: details.message || `Validation error at ${path}`,
    type,
    // These properties might not be in the FieldValidationError interface
    ...(details.expectedType ? { expectedType: details.expectedType } : {}),
    ...(details.actualValue !== undefined ? { actualValue: details.actualValue } : {})
  } as FieldValidationError;
}

/**
 * Helper function to get a nested property from an object using a path
 * 
 * @param obj The object to get the property from
 * @param path The path to the property (dot notation)
 * @returns The property value or undefined if not found
 */
function getNestedProperty(obj: any, path: string): any {
  if (!obj || typeof obj !== 'object') return undefined;
  
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (!current || typeof current !== 'object') return undefined;
    current = current[part];
  }
  
  return current;
} 