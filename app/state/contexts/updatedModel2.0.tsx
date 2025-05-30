/**
 * SF-86 Form Architecture 2.0 - Updated Model
 *
 * Centralized form data model that integrates with the complete SF-86 form architecture 2.0.
 * This file demonstrates the new scalable architecture with all 30 sections and proper
 * integration with the enhanced SF86FormContext and PDF service.
 */

import { type ApplicantFormValues } from "../../../api/interfaces/formDefinition2.0";
import { type Section1 } from "../../../api/interfaces/sections2.0/section1";
import { type Section2 } from "../../../api/interfaces/sections2.0/section2";
import { type Section3 } from "../../../api/interfaces/sections2.0/section3";
import { type Section7 } from "../../../api/interfaces/sections2.0/section7";
import { type Section8 } from "../../../api/interfaces/sections2.0/section8";
import { type Section29 } from "../../../api/interfaces/sections2.0/section29";

// ============================================================================
// SF-86 FORM ARCHITECTURE 2.0 MODEL
// ============================================================================

/**
 * Complete SF-86 Form Data Model with all 30 sections
 * This represents the full form structure as defined in formDefinition2.0.ts
 */
const defaultSF86FormData: ApplicantFormValues = {
  // Implemented sections with proper interfaces
  section1: undefined, // Information About You
  section2: undefined, // Date of Birth
  section3: undefined, // Place of Birth
  section4: undefined, // Other Names Used
  section5: undefined, // Citizenship
  section6: undefined, // Dual/Multiple Citizenship
  section7: undefined, // Contact Information
  section8: undefined, // U.S. Passport Information
  section9: undefined, // Citizenship Documentation
  section10: undefined, // Residence History
  section11: undefined, // Employment Activities
  section12: undefined, // Education
  section13: undefined, // Federal Service
  section14: undefined, // Selective Service
  section15: undefined, // Military History
  section16: undefined, // Foreign Activities
  section17: undefined, // Foreign Business
  section18: undefined, // Relatives and Associates
  section19: undefined, // Foreign Contacts
  section20: undefined, // Foreign Travel
  section21: undefined, // Psychological and Emotional Health
  section22: undefined, // Police Record
  section23: undefined, // Illegal Use of Drugs or Drug Activity
  section24: undefined, // Use of Alcohol
  section25: undefined, // Investigation and Clearance Record
  section26: undefined, // Financial Record
  section27: undefined, // Use of Information Technology Systems
  section28: undefined, // Involvement in Non-Criminal Court Actions
  section29: undefined, // Associations
  section30: undefined, // Additional Comments
  print: undefined // Print/Signature section
};

/**
 * Enhanced form data interface that extends the base ApplicantFormValues
 * with additional metadata and tracking capabilities for the 2.0 architecture
 */
export interface EnhancedApplicantFormValues extends ApplicantFormValues {
  // Form metadata for enhanced tracking
  formMetadata?: {
    version: string;
    lastUpdated: string;
    completedSections: string[];
    validationStatus: 'valid' | 'invalid' | 'pending';
    saveStatus: 'saved' | 'unsaved' | 'saving';
    pdfGenerationStatus: 'ready' | 'generating' | 'complete' | 'error';
    fieldMappingAccuracy: number;
    totalFields: number;
    validFields: number;
  };

  // Section completion tracking
  sectionProgress?: {
    [sectionId: string]: {
      isComplete: boolean;
      isValid: boolean;
      completionPercentage: number;
      lastModified: string;
      fieldCount: number;
      validFieldCount: number;
    };
  };

  // Cross-section dependencies
  dependencies?: {
    [sectionId: string]: {
      dependsOn: string[];
      blockedBy: string[];
      isBlocked: boolean;
    };
  };
}

/**
 * Factory function to create a complete form data object with all sections
 * initialized to their default states using the 2.0 architecture
 */
export function createCompleteSF86FormData(): EnhancedApplicantFormValues {
  return {
    ...defaultSF86FormData,

    // Initialize form metadata
    formMetadata: {
      version: '2.0.0',
      lastUpdated: new Date().toISOString(),
      completedSections: [],
      validationStatus: 'pending',
      saveStatus: 'unsaved',
      pdfGenerationStatus: 'ready',
      fieldMappingAccuracy: 0,
      totalFields: 0,
      validFields: 0
    },

    // Initialize section progress tracking
    sectionProgress: createInitialSectionProgress(),

    // Initialize dependencies
    dependencies: createSectionDependencies()
  };
}

/**
 * Create initial section progress tracking for all 30 sections
 */
function createInitialSectionProgress(): EnhancedApplicantFormValues['sectionProgress'] {
  const progress: any = {};
  
  for (let i = 1; i <= 30; i++) {
    const sectionId = `section${i}`;
    progress[sectionId] = {
      isComplete: false,
      isValid: false,
      completionPercentage: 0,
      lastModified: new Date().toISOString(),
      fieldCount: 0,
      validFieldCount: 0
    };
  }
  
  // Add print section
  progress['print'] = {
    isComplete: false,
    isValid: false,
    completionPercentage: 0,
    lastModified: new Date().toISOString(),
    fieldCount: 0,
    validFieldCount: 0
  };
  
  return progress;
}

/**
 * Create section dependencies mapping
 */
function createSectionDependencies(): EnhancedApplicantFormValues['dependencies'] {
  return {
    section1: { dependsOn: [], blockedBy: [], isBlocked: false },
    section2: { dependsOn: ['section1'], blockedBy: [], isBlocked: false },
    section3: { dependsOn: ['section1'], blockedBy: [], isBlocked: false },
    section4: { dependsOn: ['section1'], blockedBy: [], isBlocked: false },
    section5: { dependsOn: ['section3'], blockedBy: [], isBlocked: false },
    section6: { dependsOn: ['section5'], blockedBy: [], isBlocked: false },
    section7: { dependsOn: ['section1'], blockedBy: [], isBlocked: false },
    section8: { dependsOn: ['section5'], blockedBy: [], isBlocked: false },
    section9: { dependsOn: ['section5'], blockedBy: [], isBlocked: false },
    section10: { dependsOn: ['section7'], blockedBy: [], isBlocked: false },
    // ... continue for all sections
  };
}

/**
 * Utility function to check if a section is using the new 2.0 architecture
 */
export function isArchitecture2Section(sectionId: string): boolean {
  const architecture2Sections = [
    'section1', 'section2', 'section3', 'section7', 'section8', 'section29'
  ];
  return architecture2Sections.includes(sectionId);
}

/**
 * Get the list of all implemented sections in 2.0 architecture
 */
export function getImplementedSections(): string[] {
  return [
    'section1', // Information About You
    'section2', // Date of Birth
    'section3', // Place of Birth
    'section7', // Contact Information
    'section8', // U.S. Passport Information
    'section29'  // Associations
  ];
}

/**
 * Get the list of all pending sections (not yet implemented)
 */
export function getPendingSections(): string[] {
  const allSections = Array.from({ length: 30 }, (_, i) => `section${i + 1}`);
  const implemented = getImplementedSections();
  return allSections.filter(section => !implemented.includes(section));
}

/**
 * Calculate overall form completion percentage
 */
export function calculateFormCompletionPercentage(formData: EnhancedApplicantFormValues): number {
  if (!formData.sectionProgress) return 0;
  
  const totalSections = 30;
  const completedSections = Object.values(formData.sectionProgress)
    .filter(progress => progress.isComplete).length;
  
  return (completedSections / totalSections) * 100;
}

/**
 * Get form validation summary
 */
export function getFormValidationSummary(formData: EnhancedApplicantFormValues): {
  totalSections: number;
  validSections: number;
  invalidSections: number;
  pendingSections: number;
  overallValid: boolean;
} {
  if (!formData.sectionProgress) {
    return {
      totalSections: 30,
      validSections: 0,
      invalidSections: 0,
      pendingSections: 30,
      overallValid: false
    };
  }
  
  const sections = Object.values(formData.sectionProgress);
  const validSections = sections.filter(s => s.isValid).length;
  const invalidSections = sections.filter(s => !s.isValid && s.isComplete).length;
  const pendingSections = sections.filter(s => !s.isComplete).length;
  
  return {
    totalSections: 30,
    validSections,
    invalidSections,
    pendingSections,
    overallValid: validSections === 30
  };
}

/**
 * Check if form is ready for PDF generation
 */
export function isFormReadyForPdf(formData: EnhancedApplicantFormValues): {
  isReady: boolean;
  requiredSections: string[];
  missingSections: string[];
} {
  const requiredSections = ['section1', 'section2', 'section3']; // Minimum required sections
  const missingSections: string[] = [];
  
  requiredSections.forEach(sectionId => {
    const progress = formData.sectionProgress?.[sectionId];
    if (!progress?.isComplete || !progress?.isValid) {
      missingSections.push(sectionId);
    }
  });
  
  return {
    isReady: missingSections.length === 0,
    requiredSections,
    missingSections
  };
}

/**
 * Update section progress
 */
export function updateSectionProgress(
  formData: EnhancedApplicantFormValues,
  sectionId: string,
  updates: Partial<EnhancedApplicantFormValues['sectionProgress'][string]>
): EnhancedApplicantFormValues {
  if (!formData.sectionProgress) {
    formData.sectionProgress = createInitialSectionProgress();
  }
  
  formData.sectionProgress[sectionId] = {
    ...formData.sectionProgress[sectionId],
    ...updates,
    lastModified: new Date().toISOString()
  };
  
  // Update form metadata
  if (formData.formMetadata) {
    formData.formMetadata.lastUpdated = new Date().toISOString();
    
    // Update completed sections list
    const completedSections = Object.entries(formData.sectionProgress)
      .filter(([_, progress]) => progress.isComplete)
      .map(([sectionId, _]) => sectionId);
    
    formData.formMetadata.completedSections = completedSections;
    
    // Update validation status
    const validationSummary = getFormValidationSummary(formData);
    formData.formMetadata.validationStatus = validationSummary.overallValid ? 'valid' : 
      validationSummary.invalidSections > 0 ? 'invalid' : 'pending';
  }
  
  return formData;
}

export default defaultSF86FormData;
