/**
 * Section-Specific Error Types
 * 
 * Scalable error handling system for all SF-86 sections
 * Extends base error types with section-specific context
 * 
 * @module utils/section-errors
 */

import { AppError } from './errors';

/**
 * Section-specific error with section context
 */
export class SectionError extends AppError {
  public readonly sectionId: number;
  public readonly sectionName: string;
  public readonly fieldPath?: string;
  public readonly entryIndex?: number;

  constructor(
    message: string,
    sectionId: number,
    code: string,
    statusCode?: number,
    context?: Record<string, any>
  ) {
    super(message, code, statusCode, context);
    this.sectionId = sectionId;
    this.sectionName = `Section ${sectionId}`;
  }
}

/**
 * Section validation error
 */
export class SectionValidationError extends SectionError {
  public readonly validationErrors: string[];
  public readonly validationWarnings: string[];
  public readonly fieldErrors: Map<string, string>;

  constructor(
    sectionId: number,
    errors: string[],
    warnings: string[] = [],
    fieldErrors?: Map<string, string>
  ) {
    const message = `Section ${sectionId} validation failed with ${errors.length} errors`;
    super(message, sectionId, 'SECTION_VALIDATION_ERROR', 400);
    this.validationErrors = errors;
    this.validationWarnings = warnings;
    this.fieldErrors = fieldErrors || new Map();
  }
}

/**
 * Section field mapping error
 */
export class SectionFieldMappingError extends SectionError {
  public readonly uiPath: string;
  public readonly pdfFieldId?: string;
  public readonly mappingType: 'UI_TO_PDF' | 'PDF_TO_UI';

  constructor(
    sectionId: number,
    uiPath: string,
    pdfFieldId?: string,
    mappingType: 'UI_TO_PDF' | 'PDF_TO_UI' = 'UI_TO_PDF'
  ) {
    const message = `Field mapping failed for Section ${sectionId}: ${uiPath}`;
    super(message, sectionId, 'SECTION_FIELD_MAPPING_ERROR', 500);
    this.uiPath = uiPath;
    this.pdfFieldId = pdfFieldId;
    this.mappingType = mappingType;
  }
}

/**
 * Section state error
 */
export class SectionStateError extends SectionError {
  public readonly expectedState: any;
  public readonly actualState: any;
  public readonly operation: string;

  constructor(
    sectionId: number,
    operation: string,
    expectedState?: any,
    actualState?: any
  ) {
    const message = `Section ${sectionId} state error during ${operation}`;
    super(message, sectionId, 'SECTION_STATE_ERROR', 500);
    this.operation = operation;
    this.expectedState = expectedState;
    this.actualState = actualState;
  }
}

/**
 * Section entry error (for sections with multiple entries)
 */
export class SectionEntryError extends SectionError {
  public readonly entryIndex: number;
  public readonly entryOperation: 'ADD' | 'UPDATE' | 'DELETE' | 'VALIDATE';
  public readonly maxEntries?: number;

  constructor(
    sectionId: number,
    entryIndex: number,
    operation: 'ADD' | 'UPDATE' | 'DELETE' | 'VALIDATE',
    message?: string,
    maxEntries?: number
  ) {
    const errorMessage = message || `Entry ${entryIndex} operation '${operation}' failed in Section ${sectionId}`;
    super(errorMessage, sectionId, 'SECTION_ENTRY_ERROR', 400);
    this.entryIndex = entryIndex;
    this.entryOperation = operation;
    this.maxEntries = maxEntries;
  }
}

/**
 * Section PDF generation error
 */
export class SectionPdfError extends SectionError {
  public readonly pdfOperation: 'GENERATE' | 'VALIDATE' | 'EXPORT' | 'FLATTEN';
  public readonly fieldCount?: number;
  public readonly mappedFieldCount?: number;

  constructor(
    sectionId: number,
    operation: 'GENERATE' | 'VALIDATE' | 'EXPORT' | 'FLATTEN',
    message?: string,
    fieldCount?: number,
    mappedFieldCount?: number
  ) {
    const errorMessage = message || `PDF ${operation} failed for Section ${sectionId}`;
    super(errorMessage, sectionId, 'SECTION_PDF_ERROR', 500);
    this.pdfOperation = operation;
    this.fieldCount = fieldCount;
    this.mappedFieldCount = mappedFieldCount;
  }
}

/**
 * Section data integrity error
 */
export class SectionDataIntegrityError extends SectionError {
  public readonly integrityType: 'MISSING_FIELD' | 'TYPE_MISMATCH' | 'CONSTRAINT_VIOLATION' | 'REFERENCE_ERROR';
  public readonly affectedField?: string;
  public readonly expectedType?: string;
  public readonly actualType?: string;

  constructor(
    sectionId: number,
    integrityType: 'MISSING_FIELD' | 'TYPE_MISMATCH' | 'CONSTRAINT_VIOLATION' | 'REFERENCE_ERROR',
    affectedField?: string,
    message?: string
  ) {
    const errorMessage = message || `Data integrity error in Section ${sectionId}: ${integrityType}`;
    super(errorMessage, sectionId, 'SECTION_DATA_INTEGRITY_ERROR', 500);
    this.integrityType = integrityType;
    this.affectedField = affectedField;
  }
}

/**
 * Factory function to create section-specific errors
 */
export class SectionErrorFactory {
  /**
   * Create a validation error for a section
   */
  static validationError(
    sectionId: number,
    errors: string[],
    warnings?: string[],
    fieldErrors?: Map<string, string>
  ): SectionValidationError {
    return new SectionValidationError(sectionId, errors, warnings, fieldErrors);
  }

  /**
   * Create a field mapping error for a section
   */
  static fieldMappingError(
    sectionId: number,
    uiPath: string,
    pdfFieldId?: string,
    mappingType?: 'UI_TO_PDF' | 'PDF_TO_UI'
  ): SectionFieldMappingError {
    return new SectionFieldMappingError(sectionId, uiPath, pdfFieldId, mappingType);
  }

  /**
   * Create a state error for a section
   */
  static stateError(
    sectionId: number,
    operation: string,
    expectedState?: any,
    actualState?: any
  ): SectionStateError {
    return new SectionStateError(sectionId, operation, expectedState, actualState);
  }

  /**
   * Create an entry error for a section
   */
  static entryError(
    sectionId: number,
    entryIndex: number,
    operation: 'ADD' | 'UPDATE' | 'DELETE' | 'VALIDATE',
    message?: string,
    maxEntries?: number
  ): SectionEntryError {
    return new SectionEntryError(sectionId, entryIndex, operation, message, maxEntries);
  }

  /**
   * Create a PDF error for a section
   */
  static pdfError(
    sectionId: number,
    operation: 'GENERATE' | 'VALIDATE' | 'EXPORT' | 'FLATTEN',
    message?: string,
    fieldCount?: number,
    mappedFieldCount?: number
  ): SectionPdfError {
    return new SectionPdfError(sectionId, operation, message, fieldCount, mappedFieldCount);
  }

  /**
   * Create a data integrity error for a section
   */
  static dataIntegrityError(
    sectionId: number,
    integrityType: 'MISSING_FIELD' | 'TYPE_MISMATCH' | 'CONSTRAINT_VIOLATION' | 'REFERENCE_ERROR',
    affectedField?: string,
    message?: string
  ): SectionDataIntegrityError {
    return new SectionDataIntegrityError(sectionId, integrityType, affectedField, message);
  }
}

/**
 * Type guard to check if error is a section error
 */
export function isSectionError(error: unknown): error is SectionError {
  return error instanceof SectionError;
}

/**
 * Type guard to check if error is a section validation error
 */
export function isSectionValidationError(error: unknown): error is SectionValidationError {
  return error instanceof SectionValidationError;
}

/**
 * Extract section information from any error
 */
export function extractSectionInfo(error: unknown): {
  sectionId?: number;
  sectionName?: string;
  message: string;
} {
  if (isSectionError(error)) {
    return {
      sectionId: error.sectionId,
      sectionName: error.sectionName,
      message: error.message
    };
  }
  
  if (error instanceof Error) {
    return { message: error.message };
  }
  
  return { message: 'Unknown error occurred' };
}