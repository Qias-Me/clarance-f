/**
 * Shared Base Interfaces for SF-86 Form Architecture
 * 
 * This module provides the foundational interfaces and types that all section contexts
 * will use. It ensures consistency across all 30 sections while maintaining the proven
 * patterns from Section29 Context.
 */

import type { Field } from "../../../../api/interfaces/formDefinition2.0";

// ============================================================================
// CORE BASE INTERFACES
// ============================================================================

/**
 * Base interface for all section contexts
 * Provides the common structure and methods that every section must implement
 */
export interface BaseSectionContext {
  // Section identification
  sectionId: string;
  sectionName: string;
  
  // Core state
  sectionData: any;
  isLoading: boolean;
  errors: ValidationError[];
  isDirty: boolean;
  
  // Standard CRUD operations (following Section29 pattern)
  updateFieldValue: (path: string, value: any) => void;
  validateSection: () => ValidationResult;
  resetSection: () => void;
  loadSection: (data: any) => void;
  getChanges: () => ChangeSet;
  
  // Entry management (for sections with entries)
  getEntryCount?: (subsectionKey: string) => number;
  addEntry?: (subsectionKey: string, entryType?: string) => void;
  removeEntry?: (subsectionKey: string, index: number) => void;
  moveEntry?: (subsectionKey: string, fromIndex: number, toIndex: number) => void;
  duplicateEntry?: (subsectionKey: string, index: number) => void;
  clearEntry?: (subsectionKey: string, index: number) => void;
  
  // Advanced operations
  bulkUpdateFields?: (updates: BulkUpdate[]) => void;
  updateSubsectionFlag?: (key: string, value: "YES" | "NO") => void;
}

/**
 * Base interface for all entries across sections
 * Provides common properties that every entry should have
 */
export interface BaseEntry {
  _id: string | number;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

/**
 * Base interface for subsections that contain entries
 * Follows the proven Section29 pattern
 */
export interface BaseSubsection {
  hasFlag?: Field<"YES" | "NO">;
  entries: BaseEntry[];
  entriesCount: number;
  [key: string]: any;
}

/**
 * Base interface for sections with simple flag-based structure
 * For sections that only have YES/NO questions without entries
 */
export interface BaseFlagSection {
  [key: string]: Field<"YES" | "NO"> | any;
}

// ============================================================================
// FIELD AND VALIDATION INTERFACES
// ============================================================================

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Validation result structure
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Change tracking structure
 */
export interface ChangeSet {
  [path: string]: {
    oldValue: any;
    newValue: any;
    timestamp: Date;
  };
}

/**
 * Bulk update structure
 */
export interface BulkUpdate {
  path: string;
  value: any;
}

// ============================================================================
// FIELD ID GENERATION INTERFACES
// ============================================================================

/**
 * Field ID generation configuration for each section
 */
export interface SectionFieldConfig {
  sectionId: string;
  prefix: string;
  subsections: Record<string, SubsectionConfig>;
}

/**
 * Subsection configuration for field ID generation
 */
export interface SubsectionConfig {
  prefix: string;
  entryPatterns?: Record<string, EntryFieldPattern>;
  simpleFields?: Record<string, string>;
}

/**
 * Entry field pattern for dynamic field ID generation
 */
export interface EntryFieldPattern {
  pattern: (entryIndex: number) => string;
  fieldType: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date';
  label: (entryIndex: number) => string;
}

// ============================================================================
// SECTION REGISTRATION INTERFACES
// ============================================================================

/**
 * Section registration information for the central SF86FormContext
 */
export interface SectionRegistration {
  sectionId: string;
  sectionName: string;
  context: BaseSectionContext;
  isActive: boolean;
  lastUpdated: Date;
}

/**
 * Section metadata for tracking and coordination
 */
export interface SectionMetadata {
  sectionId: string;
  sectionName: string;
  fieldCount: number;
  hasEntries: boolean;
  isRequired: boolean;
  dependencies: string[];
  pageRange?: [number, number];
}

// ============================================================================
// COMMON FIELD STRUCTURES
// ============================================================================

/**
 * Address structure used across multiple sections
 * Based on Section29 proven pattern
 */
export interface Address {
  street: Field<string>;
  city: Field<string>;
  state: Field<string>;
  zipCode: Field<string>;
  country: Field<string>;
}

/**
 * Date range structure used across multiple sections
 * Based on Section29 proven pattern
 */
export interface DateRange {
  from: DateInfo;
  to: DateInfo;
  present: Field<boolean>;
}

/**
 * Date information with estimation flag
 * Based on Section29 proven pattern
 */
export interface DateInfo {
  date: Field<string>;
  estimated: Field<boolean>;
}

/**
 * Name structure used across multiple sections
 */
export interface NameInfo {
  first: Field<string>;
  middle: Field<string>;
  last: Field<string>;
  suffix?: Field<string>;
}

/**
 * Contact information structure
 */
export interface ContactInfo {
  phone: Field<string>;
  extension?: Field<string>;
  email: Field<string>;
  isInternational?: Field<boolean>;
  isDaytime?: Field<boolean>;
  isNighttime?: Field<boolean>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Section identifiers for all 30 sections
 */
export type SectionId = 
  | 'section1' | 'section2' | 'section3' | 'section4' | 'section5'
  | 'section6' | 'section7' | 'section8' | 'section9' | 'section10'
  | 'section11' | 'section12' | 'section13' | 'section14' | 'section15'
  | 'section16' | 'section17' | 'section18' | 'section19' | 'section20'
  | 'section21' | 'section22' | 'section23' | 'section24' | 'section25'
  | 'section26' | 'section27' | 'section28' | 'section29' | 'section30';

/**
 * Common field types across all sections
 */
export type FieldType = 
  | 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date'
  | 'email' | 'phone' | 'number' | 'currency' | 'ssn' | 'file';

/**
 * Entry types that can exist across different sections
 */
export type EntryType = 
  | 'organization' | 'activity' | 'address' | 'employment' | 'education'
  | 'relative' | 'contact' | 'investigation' | 'financial' | 'legal'
  | 'medical' | 'substance' | 'technology' | 'travel' | 'association';

// ============================================================================
// CONTEXT COMMUNICATION INTERFACES
// ============================================================================

/**
 * Event types for inter-context communication
 */
export type ContextEventType = 
  | 'SECTION_UPDATE' | 'VALIDATION_REQUEST' | 'NAVIGATION_REQUEST'
  | 'DATA_SYNC' | 'ERROR_OCCURRED' | 'SECTION_COMPLETE';

/**
 * Context event structure for communication between contexts
 */
export interface ContextEvent {
  type: ContextEventType;
  sectionId: string;
  payload: any;
  timestamp: Date;
  source: string;
}

/**
 * Context event listener function type
 */
export type ContextEventListener = (event: ContextEvent) => void;

