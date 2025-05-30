/**
 * Field Compatibility Validator
 * 
 * This utility validates that our Field<T> interface and section interfaces
 * are fully compatible with the PDF service requirements. It checks field
 * structure, ID patterns, and value types.
 */

import type { Field } from '../../api/interfaces/formDefinition2.0';

// PDF field type mapping
const PDF_FIELD_TYPES = {
  'PDFTextField': ['text', 'textarea', 'email', 'phone', 'number', 'ssn'],
  'PDFDropdown': ['select', 'dropdown'],
  'PDFRadioGroup': ['radio'],
  'PDFCheckBox': ['checkbox'],
  'PDFButton': ['button']
} as const;

// Field ID pattern validation
const FIELD_ID_PATTERNS = {
  sections1to6: /^form1\[0\]\.Sections1-6\[0\]\./,
  sections7to9: /^form1\[0\]\.Sections7-9\[0\]\./,
  individualSection: /^form1\[0\]\.Section\d+(_\d+)?\[0\]\./,
  subform: /^form1\[0\]\.#subform\[/
} as const;

/**
 * Validation result interface
 */
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fieldPath: string;
}

/**
 * Comprehensive validation result
 */
interface ComprehensiveValidationResult {
  overallValid: boolean;
  totalFields: number;
  validFields: number;
  invalidFields: number;
  results: ValidationResult[];
  summary: {
    structureErrors: number;
    idPatternErrors: number;
    typeErrors: number;
    valueErrors: number;
  };
}

/**
 * Validate a single Field<T> object
 */
export const validateField = <T>(field: any, fieldPath: string, expectedType?: string): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    fieldPath
  };

  // Check if it's a valid Field<T> structure
  if (!field || typeof field !== 'object') {
    result.errors.push('Field is not an object');
    result.isValid = false;
    return result;
  }

  // Required properties check
  const requiredProps = ['id', 'value', 'type', 'label', 'rect'];
  for (const prop of requiredProps) {
    if (!(prop in field)) {
      result.errors.push(`Missing required property: ${prop}`);
      result.isValid = false;
    }
  }

  // ID validation
  if (field.id) {
    if (typeof field.id !== 'string') {
      result.errors.push('Field ID must be a string');
      result.isValid = false;
    } else {
      // Check ID pattern
      const idPatterns = Object.values(FIELD_ID_PATTERNS);
      const hasValidPattern = idPatterns.some(pattern => pattern.test(field.id));
      
      if (!hasValidPattern) {
        result.warnings.push(`Field ID doesn't match expected PDF patterns: ${field.id}`);
      }
    }
  }

  // Type validation
  if (field.type) {
    if (typeof field.type !== 'string') {
      result.errors.push('Field type must be a string');
      result.isValid = false;
    } else if (expectedType && field.type !== expectedType) {
      result.warnings.push(`Field type mismatch: expected ${expectedType}, got ${field.type}`);
    }
  }

  // Label validation
  if (field.label && typeof field.label !== 'string') {
    result.errors.push('Field label must be a string');
    result.isValid = false;
  }

  // Rect validation
  if (field.rect) {
    if (typeof field.rect !== 'object' || !field.rect) {
      result.errors.push('Field rect must be an object');
      result.isValid = false;
    } else {
      const rectProps = ['x', 'y', 'width', 'height'];
      for (const prop of rectProps) {
        if (!(prop in field.rect) || typeof field.rect[prop] !== 'number') {
          result.errors.push(`Field rect.${prop} must be a number`);
          result.isValid = false;
        }
      }
    }
  }

  // Value validation (basic type checking)
  if (field.value !== undefined && field.value !== null) {
    const valueType = typeof field.value;
    
    // Check if value type is compatible with field type
    if (field.type === 'checkbox' && valueType !== 'boolean') {
      result.warnings.push(`Checkbox field should have boolean value, got ${valueType}`);
    } else if (field.type === 'number' && valueType !== 'number') {
      result.warnings.push(`Number field should have number value, got ${valueType}`);
    } else if (['text', 'textarea', 'email', 'phone', 'select', 'radio'].includes(field.type) && valueType !== 'string') {
      result.warnings.push(`Text-based field should have string value, got ${valueType}`);
    }
  }

  return result;
};

/**
 * Validate all fields in a nested object structure
 */
export const validateFieldsRecursively = (obj: any, basePath = ''): ValidationResult[] => {
  const results: ValidationResult[] = [];

  if (!obj || typeof obj !== 'object') {
    return results;
  }

  Object.entries(obj).forEach(([key, value]) => {
    const currentPath = basePath ? `${basePath}.${key}` : key;

    if (value && typeof value === 'object') {
      // Check if this is a Field<T> object
      if ('id' in value && 'value' in value && 'type' in value) {
        const fieldResult = validateField(value, currentPath);
        results.push(fieldResult);
      } else {
        // Recursively validate nested objects
        const nestedResults = validateFieldsRecursively(value, currentPath);
        results.push(...nestedResults);
      }
    }
  });

  return results;
};

/**
 * Run comprehensive field compatibility validation
 */
export const validateFieldCompatibility = (formData: any): ComprehensiveValidationResult => {
  console.log('Starting comprehensive field compatibility validation...');

  const results = validateFieldsRecursively(formData);
  
  const totalFields = results.length;
  const validFields = results.filter(r => r.isValid).length;
  const invalidFields = totalFields - validFields;

  // Categorize errors
  let structureErrors = 0;
  let idPatternErrors = 0;
  let typeErrors = 0;
  let valueErrors = 0;

  results.forEach(result => {
    result.errors.forEach(error => {
      if (error.includes('Missing required property') || error.includes('must be an object')) {
        structureErrors++;
      } else if (error.includes('ID')) {
        idPatternErrors++;
      } else if (error.includes('type')) {
        typeErrors++;
      } else if (error.includes('value')) {
        valueErrors++;
      }
    });
  });

  const overallValid = invalidFields === 0;

  console.log(`Field compatibility validation completed. Valid: ${validFields}/${totalFields}`);

  return {
    overallValid,
    totalFields,
    validFields,
    invalidFields,
    results,
    summary: {
      structureErrors,
      idPatternErrors,
      typeErrors,
      valueErrors
    }
  };
};

/**
 * Check PDF service compatibility
 */
export const checkPdfServiceCompatibility = (formData: any): {
  isCompatible: boolean;
  issues: string[];
  recommendations: string[];
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check if form data has the expected structure for PDF service
  if (!formData || typeof formData !== 'object') {
    issues.push('Form data is not an object');
    return { isCompatible: false, issues, recommendations };
  }

  // Validate field structure compatibility
  const validation = validateFieldCompatibility(formData);
  
  if (!validation.overallValid) {
    issues.push(`${validation.invalidFields} fields have structural issues`);
    
    if (validation.summary.structureErrors > 0) {
      recommendations.push('Ensure all fields have required properties: id, value, type, label, rect');
    }
    
    if (validation.summary.idPatternErrors > 0) {
      recommendations.push('Verify field IDs match PDF form field patterns');
    }
    
    if (validation.summary.typeErrors > 0) {
      recommendations.push('Check field type compatibility with PDF field types');
    }
  }

  // Check for PDF service specific requirements
  const hasFieldsWithIds = validation.results.some(r => 
    r.fieldPath.includes('id') && !r.errors.some(e => e.includes('Missing required property: id'))
  );

  if (!hasFieldsWithIds) {
    issues.push('No fields with valid IDs found for PDF mapping');
    recommendations.push('Ensure fields have proper PDF field IDs for mapping');
  }

  const isCompatible = issues.length === 0;

  return {
    isCompatible,
    issues,
    recommendations
  };
};

/**
 * Generate compatibility report
 */
export const generateCompatibilityReport = (formData: any): string => {
  const validation = validateFieldCompatibility(formData);
  const compatibility = checkPdfServiceCompatibility(formData);

  let report = '=== PDF Service Compatibility Report ===\n\n';
  
  report += `Overall Status: ${compatibility.isCompatible ? 'COMPATIBLE' : 'INCOMPATIBLE'}\n`;
  report += `Total Fields: ${validation.totalFields}\n`;
  report += `Valid Fields: ${validation.validFields}\n`;
  report += `Invalid Fields: ${validation.invalidFields}\n\n`;

  if (validation.summary.structureErrors > 0) {
    report += `Structure Errors: ${validation.summary.structureErrors}\n`;
  }
  if (validation.summary.idPatternErrors > 0) {
    report += `ID Pattern Errors: ${validation.summary.idPatternErrors}\n`;
  }
  if (validation.summary.typeErrors > 0) {
    report += `Type Errors: ${validation.summary.typeErrors}\n`;
  }
  if (validation.summary.valueErrors > 0) {
    report += `Value Errors: ${validation.summary.valueErrors}\n`;
  }

  if (compatibility.issues.length > 0) {
    report += '\n=== Issues ===\n';
    compatibility.issues.forEach(issue => {
      report += `- ${issue}\n`;
    });
  }

  if (compatibility.recommendations.length > 0) {
    report += '\n=== Recommendations ===\n';
    compatibility.recommendations.forEach(rec => {
      report += `- ${rec}\n`;
    });
  }

  if (validation.invalidFields > 0) {
    report += '\n=== Field Validation Details ===\n';
    validation.results.filter(r => !r.isValid).forEach(result => {
      report += `\nField: ${result.fieldPath}\n`;
      result.errors.forEach(error => {
        report += `  Error: ${error}\n`;
      });
      result.warnings.forEach(warning => {
        report += `  Warning: ${warning}\n`;
      });
    });
  }

  return report;
};
