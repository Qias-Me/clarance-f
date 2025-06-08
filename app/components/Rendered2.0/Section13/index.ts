/**
 * Section 13 Components Export Index
 *
 * Exports all Section 13 employment-related components for easy importing
 */

// Main components
export { default as EnhancedSection13Component } from './EnhancedSection13Component';
export { default as Section13Wrapper } from './Section13Wrapper';

// Employment type selector
export { default as EmploymentTypeSelector } from './EmploymentTypeSelector';

// Subsection-specific forms
export { default as MilitaryEmploymentForm } from './MilitaryEmploymentForm';
export { default as NonFederalEmploymentForm } from './NonFederalEmploymentForm';
export { default as SelfEmploymentForm } from './SelfEmploymentForm';
export { default as UnemploymentForm } from './UnemploymentForm';
export { default as EmploymentIssuesForm } from './EmploymentIssuesForm';
export { default as DisciplinaryActionsForm } from './DisciplinaryActionsForm';

// Re-export types for convenience
export type {
  MilitaryEmploymentEntry,
  NonFederalEmploymentEntry,
  SelfEmploymentEntry,
  UnemploymentEntry,
  EmploymentRecordIssues,
  DisciplinaryActions,
  Section13
} from '../../../../api/interfaces/sections2.0/section13';
