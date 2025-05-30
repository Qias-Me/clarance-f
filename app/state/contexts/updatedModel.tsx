/**
 * Updated SF-86 Form Model
 *
 * Centralized form data model that integrates with the scalable SF-86 form architecture.
 * This file demonstrates integration with both legacy section implementations and
 * the new scalable architecture (Section 7, Section 29).
 */

import { type ApplicantFormValues } from "../../../api/interfaces/formDefinition";
import { type Section7 } from "../../../api/interfaces/sections2.0/section7";

// Legacy section imports (existing implementation)
import { aknowledgementInfo } from "./sections/aknowledgementInfo";
import { alcoholUse } from "./sections/alcoholUse";
import { association } from "./sections/association";
import { birthInfo } from "./sections/birthInfo";
import { citizenshipInfo } from "./sections/citizenshipInfo";
import { civil } from "./sections/civil";
import { contactInfo } from "./sections/contactInfo";
import { drugActivity } from "./sections/drugActivity";
import { dualCitizenshipInfo } from "./sections/dualCitizenshipInfo";
import { employmentInfo } from "./sections/employmentInfo";
import { finances } from "./sections/finances";
import { foreignActivities } from "./sections/foreignActivities";
import { foreignContacts } from "./sections/foreignContacts";
import { investigationsInfo } from "./sections/investigationsInfo";
import { mentalHealth } from "./sections/mentalHealth";
import { militaryHistoryInfo } from "./sections/militaryHistoryInfo";
import { namesInfo } from "./sections/namesInfo";
import { passportInfo } from "./sections/passportInfo";
import { peopleThatKnow } from "./sections/peopleThatKnow";
import { personalInfo } from "./sections/personalInfo";
import { physicalAttributes } from "./sections/physicalAttributes";
import { policeRecord } from "./sections/policeRecord";
import { relationshipInfo } from "./sections/relationshipInfo";
import { relativesInfo } from "./sections/relativesInfo";
import { residencyInfo } from "./sections/residencyInfo";
import { schoolInfo } from "./sections/schoolInfo";
import { serviceInfo } from "./sections/serviceInfo";
import { signature } from "./sections/signature";
import { technology } from "./sections/technology";
import { print } from "./sections/print";

// ============================================================================
// ENHANCED SF-86 FORM DATA MODEL
// ============================================================================

/**
 * Enhanced default form data that demonstrates integration between legacy
 * section implementations and the new scalable architecture.
 */
const defaultFormData: ApplicantFormValues = {
  // Legacy sections (commented out for now, can be enabled as needed)
  // personalInfo: personalInfo,
  // namesInfo: namesInfo,
  // physicalAttributes: physicalAttributes,
  // relationshipInfo: relationshipInfo,
  // aknowledgementInfo: aknowledgementInfo,
  // birthInfo: birthInfo,
  // contactInfo: contactInfo,
  // passportInfo: passportInfo,
  // citizenshipInfo: citizenshipInfo,
  // dualCitizenshipInfo: dualCitizenshipInfo,
  // residencyInfo: residencyInfo,
  // employmentInfo: employmentInfo,
  // schoolInfo: schoolInfo,
  // serviceInfo: serviceInfo,
  // militaryHistoryInfo: militaryHistoryInfo,
  // peopleThatKnow: peopleThatKnow,
  // relativesInfo: relativesInfo,
  // foreignContacts: foreignContacts,
  // foreignActivities: foreignActivities,
  // mentalHealth: mentalHealth,
  // policeRecord: policeRecord,
  // drugActivity: drugActivity,
  // alcoholUse: alcoholUse,
  // investigationsInfo: investigationsInfo,
  // finances: finances,
  // technology: technology,
  // civil: civil,
  // association: association,
  // signature: signature,
  // print: print

  // New scalable architecture sections
  // Note: Section 7 and Section 29 are now managed through their respective
  // context providers and integrated via SF86FormContext

  // Section 7 (Where You Have Lived) - managed by Section7Provider
  // Section 29 (Associations) - managed by Section29Provider
};

/**
 * Extended form data interface that includes the new scalable sections.
 * This demonstrates how the architecture can be extended while maintaining
 * backward compatibility with existing implementations.
 */
export interface ExtendedApplicantFormValues extends ApplicantFormValues {
  // New scalable architecture sections
  section7?: Section7;
  section29?: any; // Will be properly typed when Section 29 interface is created

  // Metadata for form management
  formMetadata?: {
    version: string;
    lastUpdated: string;
    completedSections: string[];
    validationStatus: 'valid' | 'invalid' | 'pending';
    saveStatus: 'saved' | 'unsaved' | 'saving';
  };
}

/**
 * Factory function to create a complete form data object with all sections
 * initialized to their default states.
 */
export function createCompleteFormData(): ExtendedApplicantFormValues {
  return {
    ...defaultFormData,

    // Initialize new scalable sections with their default states
    // section7: createInitialSection7State(), // Uncomment when needed

    // Initialize form metadata
    formMetadata: {
      version: '2.0.0',
      lastUpdated: new Date().toISOString(),
      completedSections: [],
      validationStatus: 'pending',
      saveStatus: 'unsaved'
    }
  };
}

/**
 * Utility function to check if a section is using the new scalable architecture
 */
export function isScalableSection(sectionId: string): boolean {
  const scalableSections = ['section7', 'section29'];
  return scalableSections.includes(sectionId);
}

/**
 * Utility function to get the list of all available sections
 */
export function getAllSectionIds(): string[] {
  return [
    // Legacy sections
    'personalInfo', 'namesInfo', 'physicalAttributes', 'relationshipInfo',
    'aknowledgementInfo', 'birthInfo', 'contactInfo', 'passportInfo',
    'citizenshipInfo', 'dualCitizenshipInfo', 'residencyInfo', 'employmentInfo',
    'schoolInfo', 'serviceInfo', 'militaryHistoryInfo', 'peopleThatKnow',
    'relativesInfo', 'foreignContacts', 'foreignActivities', 'mentalHealth',
    'policeRecord', 'drugActivity', 'alcoholUse', 'investigationsInfo',
    'finances', 'technology', 'civil', 'association', 'signature', 'print',

    // New scalable sections
    'section7', 'section29'
  ];
}

export default defaultFormData;
