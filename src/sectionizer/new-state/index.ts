/**
 * SF-86 Form State Management
 * 
 * Comprehensive TypeScript interfaces and utilities for managing SF-86 form data
 * in an online form application. This module provides:
 * 
 * - Type-safe interfaces for hierarchical form structure
 * - Conversion utilities between different data formats
 * - Validation functions with business rules
 * - Helper functions for form state management
 * 
 * @example
 * ```typescript
 * import { SF86Form, createSF86Form, validateForm } from './src/sectionizer/new-state';
 * 
 * // Convert legacy categorized fields to form structure
 * const form = createSF86Form(categorizedFields);
 * 
 * // Validate the form
 * const validation = validateForm(form);
 * 
 * // Update completion percentages
 * const updatedForm = updateFormCompletion(form);
 * ```
 */

// Core type definitions
export type {
  // Enums
  SF86FieldType,
  ValidationState,
  ConfidenceLevel,
  
  // Core interfaces
  FieldCoordinates,
  SF86FieldMetadata,
  SF86CategorizedField,
  SF86FormField,
  SF86Entry,
  SF86Subsection,
  SF86Section,
  SF86Form
} from './SF86FormTypes.js';

// Helper functions and utilities
export {
  // Constants
  SF86_SECTION_NAMES,
  SECTIONS_WITHOUT_SUBSECTIONS,
  REPEATABLE_SECTIONS,
  
  // Utility functions
  getConfidenceLevel,
  mapFieldType,
  generateFieldId,
  convertToFormField,
  groupFieldsHierarchically,
  createEntry,
  createSubsection,
  createSection,
  createSF86Form,
  calculateSectionCompletion,
  updateFormCompletion
} from './SF86FormHelpers.js';

// Validation utilities
export type {
  ValidationResult,
  FieldValidationRule
} from './SF86FormValidation.js';

export {
  // Validation patterns
  VALIDATION_PATTERNS,
  
  // Validation functions
  validateField,
  validateEntry,
  validateSubsection,
  validateSection,
  validateForm,
  updateValidationStates
} from './SF86FormValidation.js';

// Conversion utilities
export {
  // Conversion functions
  convertLegacyField,
  convertLegacyFieldsToForm,
  convertSectionExportsToForm,
  loadFormFromSectionExports,
  
  // Serialization
  serializeForm,
  deserializeForm,
  
  // Export functions
  exportFormToSectionFiles,
  
  // Utility functions
  createMinimalForm
} from './SF86FormConverter.js';

/**
 * Quick start example for converting existing categorized fields
 */
export function quickStartExample() {
  return `
// Quick Start Example: Converting Categorized Fields to SF86Form

import { 
  createSF86Form, 
  validateForm, 
  updateFormCompletion,
  type SF86Form,
  type CategorizedField 
} from './src/sectionizer/new-state';

// 1. Convert your existing categorized fields
const categorizedFields: CategorizedField[] = [
  // Your existing field data...
];

// 2. Create the form structure
let form: SF86Form = createSF86Form(categorizedFields);

// 3. Update completion percentages
form = updateFormCompletion(form);

// 4. Validate the form
const validation = validateForm(form);
if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
}

// 5. Access form data hierarchically
const section7 = form.sections[7]; // Where You Have Lived
const subsectionA = section7.subsections['A'];
const entry1 = subsectionA.entries[0];
const addressField = entry1.fields.find(f => f.name.includes('address'));

// 6. Update field values
if (addressField) {
  addressField.value = '123 Main Street';
  addressField.validationState = 'valid';
}

// 7. Serialize for storage
const serialized = JSON.stringify(form);

// 8. Load from section exports
import { loadFormFromSectionExports } from './SF86FormConverter';
const formFromExports = await loadFormFromSectionExports('./output/sections/');
`;
}

/**
 * Type guard to check if an object is a valid SF86Form
 */
export function isSF86Form(obj: any): obj is SF86Form {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.metadata &&
    typeof obj.metadata === 'object' &&
    obj.sections &&
    typeof obj.sections === 'object' &&
    typeof obj.metadata.version === 'string' &&
    typeof obj.metadata.totalFields === 'number'
  );
}

/**
 * Type guard to check if an object is a valid SF86Section
 */
export function isSF86Section(obj: any): obj is SF86Section {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.sectionId === 'number' &&
    typeof obj.sectionName === 'string' &&
    typeof obj.hasSubsections === 'boolean' &&
    obj.subsections &&
    typeof obj.subsections === 'object'
  );
}

/**
 * Type guard to check if an object is a valid SF86FormField
 */
export function isSF86FormField(obj: any): obj is SF86FormField {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.section === 'number' &&
    typeof obj.confidence === 'number'
  );
}

/**
 * Default export with all utilities
 */
export default {
  // Types (re-exported for convenience)
  SF86FieldType: {} as any, // Enum placeholder
  ValidationState: {} as any, // Enum placeholder
  ConfidenceLevel: {} as any, // Enum placeholder
  
  // Helper functions
  createSF86Form,
  validateForm,
  updateFormCompletion,
  convertLegacyFieldsToForm,
  loadFormFromSectionExports,
  
  // Type guards
  isSF86Form,
  isSF86Section,
  isSF86FormField,
  
  // Constants
  SF86_SECTION_NAMES,
  SECTIONS_WITHOUT_SUBSECTIONS,
  REPEATABLE_SECTIONS,
  VALIDATION_PATTERNS
};
