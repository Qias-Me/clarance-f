/**
 * Section Optimization Utilities
 *
 * Common utilities for DRY implementation across all SF-86 section contexts.
 * These utilities ensure consistent patterns, performance optimization, and
 * createDefaultSection compatibility.
 */

import type { BaseSectionContext, SectionRegistration } from './base-interfaces';

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

/**
 * High-Performance Logging Utility for SF-86 Sections
 *
 * Features:
 * - Debug mode detection with caching for performance
 * - Throttled logging to prevent spam
 * - Memory-efficient message formatting
 * - Production-safe with zero overhead when debug is off
 */
export class SectionLogger {
  private static debugMode: boolean | null = null;
  private static logThrottle: Map<string, number> = new Map();
  private static readonly THROTTLE_MS = 100; // Throttle identical messages within 100ms

  /**
   * Cached debug mode detection for performance
   */
  private static isDebugMode(): boolean {
    if (this.debugMode === null) {
      this.debugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');
    }
    return this.debugMode;
  }

  /**
   * Reset debug mode cache (useful for testing)
   */
  static resetDebugMode(): void {
    this.debugMode = null;
  }

  /**
   * Throttle identical log messages to prevent spam
   */
  private static shouldLog(key: string): boolean {
    const now = Date.now();
    const lastLog = this.logThrottle.get(key) || 0;

    if (now - lastLog > this.THROTTLE_MS) {
      this.logThrottle.set(key, now);
      return true;
    }
    return false;
  }

  /**
   * Clean up old throttle entries to prevent memory leaks
   */
  private static cleanupThrottle(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.logThrottle.entries()) {
      if (now - timestamp > this.THROTTLE_MS * 10) {
        this.logThrottle.delete(key);
      }
    }
  }

  static info(sectionId: string, contextId: string, message: string, data?: any): void {
    if (!this.isDebugMode()) return;

    const logKey = `${sectionId}-${contextId}-${message}`;
    if (this.shouldLog(logKey)) {
      console.log(`🔍 ${sectionId}: ${message} [${contextId}]`, data || '');
    }
  }

  static warn(sectionId: string, contextId: string, message: string, data?: any): void {
    if (!this.isDebugMode()) return;

    const logKey = `${sectionId}-${contextId}-${message}`;
    if (this.shouldLog(logKey)) {
      console.warn(`⚠️ ${sectionId}: ${message} [${contextId}]`, data || '');
    }
  }

  static error(sectionId: string, contextId: string, message: string, data?: any): void {
    if (!this.isDebugMode()) return;

    // Always log errors, but still throttle identical ones
    const logKey = `${sectionId}-${contextId}-${message}`;
    if (this.shouldLog(logKey)) {
      console.error(`❌ ${sectionId}: ${message} [${contextId}]`, data || '');
    }
  }

  static success(sectionId: string, contextId: string, message: string, data?: any): void {
    if (!this.isDebugMode()) return;

    const logKey = `${sectionId}-${contextId}-${message}`;
    if (this.shouldLog(logKey)) {
      console.log(`✅ ${sectionId}: ${message} [${contextId}]`, data || '');
    }
  }

  static fieldChange(sectionId: string, contextId: string, fieldName: string, currentValue: any, newValue: any): void {
    if (!this.isDebugMode()) return;

    // Field changes are high-frequency, so use more aggressive throttling
    const logKey = `${sectionId}-${contextId}-${fieldName}-change`;
    if (this.shouldLog(logKey)) {
      console.log(`🔄 ${sectionId}: Field value change detected in ${fieldName} [${contextId}]:`, {
        currentValue: currentValue || '(empty)',
        newValue: newValue || '(empty)'
      });
    }
  }

  /**
   * Performance monitoring for section operations
   */
  static performance(sectionId: string, contextId: string, operation: string, duration: number): void {
    if (!this.isDebugMode()) return;

    if (duration > 100) { // Only log slow operations
      console.log(`⏱️ ${sectionId}: ${operation} took ${duration}ms [${contextId}]`);
    }
  }

  /**
   * Batch logging for multiple related messages
   */
  static batch(sectionId: string, contextId: string, messages: Array<{type: 'info' | 'warn' | 'error', message: string, data?: any}>): void {
    if (!this.isDebugMode()) return;

    console.group(`📦 ${sectionId} Batch [${contextId}]`);
    messages.forEach(({type, message, data}) => {
      switch(type) {
        case 'info':
          console.log(`🔍 ${message}`, data || '');
          break;
        case 'warn':
          console.warn(`⚠️ ${message}`, data || '');
          break;
        case 'error':
          console.error(`❌ ${message}`, data || '');
          break;
      }
    });
    console.groupEnd();
  }

  /**
   * Periodic cleanup to prevent memory leaks
   */
  static cleanup(): void {
    this.cleanupThrottle();
  }
}

// ============================================================================
// DEFENSIVE CHECK LOGIC UTILITIES
// ============================================================================

/**
 * Standard defensive check logic for field value changes
 * Eliminates code duplication across all section contexts
 */
export interface DefensiveCheckConfig {
  sectionId: string;
  contextId: string;
  fieldsToCheck: string[];
  customFieldChecker?: (currentData: any, newData: any) => boolean;
}

export class DefensiveCheckUtils {
  /**
   * Generic defensive check logic that can be used by all sections
   * Follows the pattern established in Section 29 (no early breaks)
   */
  static createDefensiveCheck(config: DefensiveCheckConfig) {
    return (existingRegistration: SectionRegistration, baseSectionContext: BaseSectionContext, contextId: string): boolean => {
      SectionLogger.info(config.sectionId, contextId, 'Defensive check triggered');

      const currentLastUpdated = existingRegistration.lastUpdated?.getTime() || 0;
      const newLastUpdated = baseSectionContext.lastUpdated?.getTime() || Date.now();

      // Enhanced logic: Update if significantly newer OR field values changed
      let hasFieldValueChanges = false;

      // Get current and new section data
      const currentSectionData = existingRegistration.context.sectionData;
      const newSectionData = baseSectionContext.sectionData;

      if (currentSectionData && newSectionData) {
        // Use custom field checker if provided
        if (config.customFieldChecker) {
          hasFieldValueChanges = config.customFieldChecker(currentSectionData, newSectionData);
        } else {
          // Standard field checking logic
          hasFieldValueChanges = this.checkStandardFields(
            config.sectionId,
            contextId,
            config.fieldsToCheck,
            currentSectionData,
            newSectionData
          );
        }
      }

      const shouldUpdate = (newLastUpdated - currentLastUpdated) > 1000 || hasFieldValueChanges;

      if (shouldUpdate) {
        SectionLogger.success(config.sectionId, contextId, 'Registration update approved');
      }

      return shouldUpdate;
    };
  }

  /**
   * Standard field checking logic for simple field structures
   */
  private static checkStandardFields(
    sectionId: string,
    contextId: string,
    fieldsToCheck: string[],
    currentData: any,
    newData: any
  ): boolean {
    let hasChanges = false;

    // CRITICAL: Don't use early breaks - check ALL fields for changes
    for (const fieldPath of fieldsToCheck) {
      const currentValue = this.getNestedValue(currentData, fieldPath);
      const newValue = this.getNestedValue(newData, fieldPath);

      if (currentValue !== newValue) {
        hasChanges = true;
        SectionLogger.fieldChange(sectionId, contextId, fieldPath, currentValue, newValue);
        // Continue checking all fields - no early break!
      }
    }

    return hasChanges;
  }

  /**
   * Utility to get nested object values safely
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}

// ============================================================================
// FIELD VALIDATION UTILITIES
// ============================================================================

/**
 * Common field validation patterns
 */
export class FieldValidationUtils {
  /**
   * Validate field count against sections-references JSON
   */
  static validateFieldCount(sectionId: string, actualCount: number, expectedCount: number): boolean {
    if (actualCount !== expectedCount) {
      SectionLogger.error(
        `section${sectionId}`,
        'validation',
        `Field count mismatch: expected ${expectedCount}, got ${actualCount}`
      );
      return false;
    }
    return true;
  }

  /**
   * Validate field ID format (4-digit numeric)
   */
  static validateFieldId(fieldId: string): boolean {
    return /^\d{4}$/.test(fieldId);
  }

  /**
   * Normalize field ID (remove " 0 R" suffix if present)
   */
  static normalizeFieldId(fieldId: string): string {
    return fieldId.replace(' 0 R', '').trim();
  }
}

// ============================================================================
// SECTION CONTEXT TEMPLATE
// ============================================================================

/**
 * Standard section context interface for createDefaultSection compatibility
 */
export interface StandardSectionContextType<T> {
  // State
  sectionData: T;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Validation
  validateSection: () => any;

  // Utility
  resetSection: () => void;
  loadSection: (data: T) => void;
  getChanges: () => any;
}

/**
 * Common patterns for section context creation
 */
export class SectionContextUtils {
  /**
   * Generate unique context ID
   */
  static generateContextId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  /**
   * Create standard isDirty computation
   */
  static createIsDirtyComputation<T>(currentData: T, initialData: T): boolean {
    return JSON.stringify(currentData) !== JSON.stringify(initialData);
  }

  /**
   * Create standard error state from validation result
   */
  static createErrorState(validationResult: any): Record<string, string> {
    const errors: Record<string, string> = {};
    if (validationResult.errors) {
      validationResult.errors.forEach((error: any) => {
        errors[error.field] = error.message;
      });
    }
    return errors;
  }
}

// ============================================================================
// PERFORMANCE MONITORING UTILITIES
// ============================================================================

/**
 * Performance monitoring hook for section contexts
 */
export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map();

  /**
   * Start timing an operation
   */
  static startTiming(operationId: string): void {
    this.measurements.set(operationId, performance.now());
  }

  /**
   * End timing and log if operation was slow
   */
  static endTiming(sectionId: string, contextId: string, operationId: string): number {
    const startTime = this.measurements.get(operationId);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.measurements.delete(operationId);

    // Log slow operations
    SectionLogger.performance(sectionId, contextId, operationId, duration);

    return duration;
  }

  /**
   * Measure a function execution time
   */
  static measure<T>(
    sectionId: string,
    contextId: string,
    operationName: string,
    fn: () => T
  ): T {
    const operationId = `${sectionId}-${contextId}-${operationName}-${Date.now()}`;
    this.startTiming(operationId);

    try {
      const result = fn();
      this.endTiming(sectionId, contextId, operationId);
      return result;
    } catch (error) {
      this.endTiming(sectionId, contextId, operationId);
      throw error;
    }
  }

  /**
   * Clean up old measurements to prevent memory leaks
   */
  static cleanup(): void {
    this.measurements.clear();
  }
}

// ============================================================================
// CREATEDEFAULTSECTION COMPATIBILITY
// ============================================================================

/**
 * Interface for createDefaultSection compatibility
 */
export interface CreateDefaultSectionCompatible<T> {
  sectionId: number;
  sectionData: T;
  fieldCount: number;
  validate: () => boolean;
  reset: () => void;
  load: (data: T) => void;
}

/**
 * Utility to ensure section contexts are compatible with createDefaultSection
 */
export class CreateDefaultSectionUtils {
  /**
   * Validate section context compatibility
   */
  static validateCompatibility<T>(context: any, expectedFieldCount: number): boolean {
    const requiredMethods = ['validateSection', 'resetSection', 'loadSection', 'getChanges'];
    const requiredProperties = ['sectionData', 'isLoading', 'errors', 'isDirty'];

    // Check required methods
    for (const method of requiredMethods) {
      if (typeof context[method] !== 'function') {
        SectionLogger.error('validation', 'compatibility', `Missing required method: ${method}`);
        return false;
      }
    }

    // Check required properties
    for (const property of requiredProperties) {
      if (context[property] === undefined) {
        SectionLogger.error('validation', 'compatibility', `Missing required property: ${property}`);
        return false;
      }
    }

    return true;
  }
}
