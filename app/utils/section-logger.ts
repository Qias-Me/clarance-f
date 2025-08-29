/**
 * Section-Aware Logger Utility
 * 
 * Scalable logging system that works across all SF-86 sections (1-30)
 * Provides consistent logging with section-specific context
 * 
 * @module utils/section-logger
 */

import { LogLevel, logger } from './logger';

export interface SectionLogContext {
  section: number;
  component?: string;
  action?: string;
  fieldPath?: string;
  entryIndex?: number;
  metadata?: Record<string, any>;
}

/**
 * Section-aware logger that automatically includes section context
 */
export class SectionLogger {
  private sectionId: number;
  private sectionName: string;

  constructor(sectionId: number, sectionName?: string) {
    this.sectionId = sectionId;
    this.sectionName = sectionName || `Section ${sectionId}`;
  }

  private formatContext(context?: Partial<SectionLogContext>): SectionLogContext {
    return {
      section: this.sectionId,
      component: context?.component || this.sectionName,
      ...context
    };
  }

  debug(message: string, context?: Partial<SectionLogContext>, data?: any) {
    logger.debug(
      `[Section ${this.sectionId}] ${message}`,
      this.formatContext(context),
      data
    );
  }

  info(message: string, context?: Partial<SectionLogContext>, data?: any) {
    logger.info(
      `[Section ${this.sectionId}] ${message}`,
      this.formatContext(context),
      data
    );
  }

  warn(message: string, context?: Partial<SectionLogContext>, data?: any) {
    logger.warn(
      `[Section ${this.sectionId}] ${message}`,
      this.formatContext(context),
      data
    );
  }

  error(message: string, context?: Partial<SectionLogContext>, error?: Error | any) {
    logger.error(
      `[Section ${this.sectionId}] ${message}`,
      this.formatContext(context),
      error
    );
  }

  /**
   * Log field mapping operations
   */
  fieldMapping(uiPath: string, pdfFieldId: string, metadata?: any) {
    this.debug(
      `Field Mapping: ${uiPath} → ${pdfFieldId}`,
      { action: 'fieldMapping', fieldPath: uiPath },
      metadata
    );
  }

  /**
   * Log validation operations
   */
  validation(isValid: boolean, errors: string[], warnings?: string[]) {
    const level = isValid ? 'info' : 'warn';
    const message = isValid ? 'Validation passed' : `Validation failed with ${errors.length} errors`;
    
    this[level](message, { action: 'validation' }, {
      errors,
      warnings: warnings || [],
      errorCount: errors.length,
      warningCount: warnings?.length || 0
    });
  }

  /**
   * Log entry operations (for sections with multiple entries)
   */
  entryOperation(operation: 'add' | 'update' | 'delete', entryIndex: number, data?: any) {
    this.info(
      `Entry ${operation}: index ${entryIndex}`,
      { action: `entry_${operation}`, entryIndex },
      data
    );
  }

  /**
   * Log state changes
   */
  stateChange(fieldPath: string, oldValue: any, newValue: any) {
    this.debug(
      `State change: ${fieldPath}`,
      { action: 'stateChange', fieldPath },
      { oldValue, newValue }
    );
  }

  /**
   * Log PDF generation operations
   */
  pdfOperation(operation: 'generate' | 'validate' | 'export', success: boolean, data?: any) {
    const level = success ? 'info' : 'error';
    const status = success ? 'successful' : 'failed';
    
    this[level](
      `PDF ${operation} ${status}`,
      { action: `pdf_${operation}` },
      data
    );
  }

  /**
   * Performance logging
   */
  performance(operation: string, duration: number, metadata?: any) {
    const level = duration > 1000 ? 'warn' : 'debug';
    this[level](
      `Performance: ${operation} took ${duration}ms`,
      { action: 'performance' },
      { operation, duration, ...metadata }
    );
  }
}

/**
 * Factory function to create section-specific loggers
 */
export function createSectionLogger(sectionId: number, sectionName?: string): SectionLogger {
  return new SectionLogger(sectionId, sectionName);
}

/**
 * Pre-configured loggers for all 30 sections
 */
export const SECTION_LOGGERS = {
  1: createSectionLogger(1, 'Information About You'),
  2: createSectionLogger(2, 'Citizenship'),
  3: createSectionLogger(3, 'Physical Addresses'),
  4: createSectionLogger(4, 'Telephone & Email'),
  5: createSectionLogger(5, 'Current Residence'),
  6: createSectionLogger(6, 'People Who Know You'),
  7: createSectionLogger(7, 'Relatives'),
  8: createSectionLogger(8, 'Citizenship of Relatives'),
  9: createSectionLogger(9, 'Education'),
  10: createSectionLogger(10, 'Residence'),
  11: createSectionLogger(11, 'Employment Activities'),
  12: createSectionLogger(12, 'Foreign Activities'),
  13: createSectionLogger(13, 'Employment Activities'),
  14: createSectionLogger(14, 'Security Clearance'),
  15: createSectionLogger(15, 'Military History'),
  16: createSectionLogger(16, 'Foreign Contacts'),
  17: createSectionLogger(17, 'Marital Status'),
  18: createSectionLogger(18, 'Relatives and Associates'),
  19: createSectionLogger(19, 'Foreign Activities'),
  20: createSectionLogger(20, 'Foreign Activities'),
  21: createSectionLogger(21, 'Psychological'),
  22: createSectionLogger(22, 'Police Record'),
  23: createSectionLogger(23, 'Illegal Drug Use'),
  24: createSectionLogger(24, 'Alcohol Use'),
  25: createSectionLogger(25, 'Investigations'),
  26: createSectionLogger(26, 'Financial Record'),
  27: createSectionLogger(27, 'IT Systems'),
  28: createSectionLogger(28, 'Involvement'),
  29: createSectionLogger(29, 'Association Record'),
  30: createSectionLogger(30, 'References')
} as const;

/**
 * Get logger for a specific section
 */
export function getSectionLogger(sectionId: number): SectionLogger {
  return SECTION_LOGGERS[sectionId as keyof typeof SECTION_LOGGERS] || createSectionLogger(sectionId);
}