import { type ApplicantFormValues } from "../../../api/interfaces/formDefinition";
import { type FieldMetadata, type FieldHierarchy, type SubsectionInfo } from "../../../api/interfaces/FieldMetadata";
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
import { placeOfBirth } from "./sections/placeOfBirth";
import { policeRecord } from "./sections/policeRecord";
import { relationshipInfo } from "./sections/relationshipInfo";
import { relativesInfo } from "./sections/relativesInfo";
import { residencyInfo } from "./sections/residencyInfo";
import { schoolInfo } from "./sections/schoolInfo";
import { serviceInfo } from "./sections/serviceInfo";
import { signature } from "./sections/signature";
import { technology } from "./sections/technology";
import { print } from "./sections/print";

// Import utility functions for field metadata parsing and ID suffix handling
import { 
  loadFieldHierarchy, 
  groupFieldsBySection, 
  convertToContextField, 
  sectionToFileMapping 
} from "../../utils/fieldHierarchyParser";
import { 
  stripIdSuffix, 
  addIdSuffix, 
  processFormFieldIds 
} from "../../utils/formHandler";

// Import the field-to-context mapping utility
import {
  createFieldToContextMappings,
  updateContextWithFieldHierarchy
} from "../../utils/fieldToContextMapping";

// Import the context-interface alignment utility
import {
  alignContextWithInterfaces,
  type TypeConversionOptions
} from "../../utils/contextInterfaceAlignment";

// Import the FieldMappingService
import { BrowserFieldMappingService } from "api/service/BrowserFieldMappingService";

/**
 * Load and process field hierarchy data
 * 
 * In a client-side context, this would typically be fetched from an API endpoint
 * For simplicity, we're using a mock implementation that returns a static structure
 * In a real implementation, this would be replaced with actual data loading logic
 */
export function getFieldHierarchyData(): FieldHierarchy | null {
  try {
    // In a real implementation, this would call loadFieldHierarchy
    // For client-side use, this would be an API call
    // Mock implementation for now
    console.log("Loading field hierarchy data...");
    // Return null to indicate data could not be loaded
    return null; // Replace with actual implementation when available
  } catch (error) {
    console.error("Failed to load field hierarchy data:", error);
    return null;
  }
}

/**
 * Section-to-context key mapping
 * Maps section numbers to their corresponding context property keys
 */
export const SECTION_TO_CONTEXT_KEY: Record<number, string> = {
  1: 'personalInfo',
  2: 'birthInfo',
  3: 'placeOfBirth',
  4: 'aknowledgementInfo',
  5: 'namesInfo',
  6: 'physicalAttributes',
  7: 'contactInfo',
  8: 'passportInfo',
  9: 'citizenshipInfo',
  10: 'dualCitizenshipInfo',
  11: 'residencyInfo',
  12: 'schoolInfo',
  13: 'employmentInfo',
  14: 'serviceInfo',
  15: 'militaryHistoryInfo',
  16: 'peopleThatKnow',
  17: 'relationshipInfo',
  18: 'relativesInfo',
  19: 'foreignContacts',
  20: 'foreignActivities',
  21: 'mentalHealth',
  22: 'policeRecord',
  23: 'drugActivity',
  24: 'alcoholUse',
  25: 'investigationsInfo',
  26: 'finances',
  27: 'technology',
  28: 'civil',
  29: 'association',
  30: 'signature'
};

/**
 * Mapping of section numbers to their respective subsection key prefixes
 * Used to construct context keys for subsections
 */
const SECTION_SUBSECTION_PREFIX: Record<number, string> = {
  9: 'citizenship_',    // Citizenship
  10: 'dual_',          // Dual/Multiple Citizenship
  13: 'employment_',    // Employment Activities
  14: 'service_',       // Selective Service
  15: 'military_',      // Military History
  16: 'people_',        // People Who Know You Well
  17: 'relationship_',  // Marital/Relationship Status
  18: 'relative_',      // Relatives
  19: 'foreign_contact_', // Foreign Contacts
  20: 'foreign_activity_', // Foreign Activities
  22: 'police_record_', // Police Record
  23: 'drug_activity_', // Drug Activity
  24: 'alcohol_use_',   // Alcohol Use
  25: 'investigation_', // Investigations
  26: 'finance_',       // Finances
  27: 'technology_',    // Technology
  29: 'association_'    // Association Record
};

/**
 * Custom pattern mappings for specific sections
 * For sections that need special field mapping patterns
 */
const SECTION_FIELD_PATTERNS: Record<number, Record<string, Record<string, string[]>>> = {
  9: { // Citizenship
    '9.1': {
      'citizenship_type': ['citizenship type', 'type of citizenship'],
      'citizenship_country': ['citizenship country', 'country of citizenship']
    }
  },
  13: { // Employment
    '13.2': {
      'employer_name': ['employer name', 'name of employer'],
      'position_title': ['position', 'title', 'job title'],
      'employment_dates_from': ['from date', 'start date'],
      'employment_dates_to': ['to date', 'end date']
    }
  },
  18: { // Relatives
    '18.1': {
      'firstName': ['first name', 'given name'],
      'lastName': ['last name', 'surname', 'family name'],
      'middleName': ['middle name'],
      'suffix': ['suffix', 'name suffix'],
      'type': ['relationship type', 'relative type'],
      'hasOtherNames': ['other names', 'has other names', 'used other names'],
      'iDontKnow': ['unknown', 'i don\'t know']
    },
    '18.2': {
      'street': ['street', 'address', 'street address'],
      'city': ['city', 'town'],
      'state': ['state', 'province', 'region'],
      'zipCode': ['zip', 'zip code', 'postal code'],
      'country': ['country'],
      'hasAPOFPOAddress': ['apo fpo', 'military address']
    },
    '18.3': {
      'documentType': ['document type', 'citizenship document type'],
      'documentNumber': ['document number', 'citizenship number'],
      'courtCity': ['court city', 'naturalization city'],
      'courtState': ['court state', 'naturalization state']
    },
    '18.4': {
      'documentType': ['document type', 'us document type'],
      'documentExpirationDate': ['expiration date', 'document expiration'],
      'contactMethod': ['contact method', 'how contacted'],
      'contactFrequency': ['frequency', 'how often', 'contact frequency'],
      'employerName': ['employer name', 'company name', 'organization name']
    },
    '18.5': {
      'firstContactDate': ['first contact', 'initial contact'],
      'lastContactDate': ['last contact', 'final contact', 'most recent contact'],
      'contactFrequency': ['frequency', 'how often', 'contact frequency'],
      'foreignAffiliation': ['foreign government', 'government affiliation']
    }
  },
  24: { // Alcohol Use
    '24.1': {
      'negative_impact_date': ['date of impact', 'negative impact date'],
      'circumstances': ['circumstances', 'situation', 'incident details'],
      'negative_impact': ['negative impact', 'consequences', 'outcome']
    },
    '24.2': {
      'ordered_by': ['ordered by', 'referred by', 'who suggested'],
      'action_taken': ['action taken', 'did you take action'],
      'no_action_explanation': ['explanation', 'reason for no action'],
      'provider_name': ['provider name', 'counselor name', 'facility name'],
      'treatment_completion': ['treatment completion', 'completed treatment'],
      'completion_explanation': ['completion explanation', 'reason for incomplete']
    },
    '24.3': {
      'provider_name': ['provider name', 'counselor name', 'facility name'],
      'treatment_completion': ['treatment completion', 'completed treatment'],
      'completion_explanation': ['completion explanation', 'reason for incomplete']
    },
    '24.4': {
      'counselor_name': ['counselor name', 'therapist name'],
      'agency_name': ['agency name', 'facility name', 'organization name'],
      'treatment_completion': ['treatment completion', 'completed treatment'],
      'completion_explanation': ['completion explanation', 'reason for incomplete']
    }
  },
  25: { // Investigations and Clearance
    '25.1': {
      'investigating_agency': ['investigating agency', 'which agency', 'agency name'],
      'other_agency': ['other agency', 'specify agency', 'agency name'],
      'issued_agency': ['issued agency', 'agency that issued', 'issuing agency'],
      'investigation_completion_date': ['completion date', 'investigation date', 'investigation completion'],
      'clearance_eligibility_date': ['eligibility date', 'clearance date', 'granted date'],
      'level_of_clearance': ['clearance level', 'level of clearance', 'security level']
    },
    '25.2': {
      'denial_date': ['denial date', 'date denied', 'date of denial'],
      'agency': ['agency name', 'denying agency', 'agency'],
      'explanation': ['explanation', 'reason', 'details', 'why denied']
    },
    '25.3': {
      'debarment_date': ['debarment date', 'date debarred', 'date of debarment'],
      'agency': ['agency name', 'debarring agency', 'agency'],
      'explanation': ['explanation', 'reason', 'details', 'why debarred']
    }
  },
  26: { // Financial Record
    '26.1': {
      'bankruptcy_petition_type': ['petition type', 'bankruptcy type', 'chapter'],
      'court_docket_number': ['docket number', 'court number', 'case number'],
      'date_filed': ['date filed', 'filing date', 'bankruptcy date'],
      'date_discharged': ['date discharged', 'discharge date', 'completion date'],
      'amount_involved': ['amount', 'debt amount', 'amount involved'],
      'court_name': ['court name', 'bankruptcy court', 'court'],
      'discharged_of_all_debts': ['discharged of all debts', 'all debts discharged', 'complete discharge'],
      'discharge_explanation': ['discharge explanation', 'why not discharged', 'reason not discharged']
    },
    '26.2': {
      'date_range': ['date range', 'time period', 'period of problems'],
      'gambling_losses': ['gambling losses', 'amount lost', 'financial losses'],
      'description_of_financial_problems': ['financial problems', 'gambling problems', 'description of problems'],
      'actions_taken': ['actions taken', 'remedial steps', 'rectifying actions']
    },
    '26.3': {
      'failed_to_file_or_pay': ['failed to file', 'failed to pay', 'tax filing failure'],
      'year_failed': ['year failed', 'tax year', 'year of failure'],
      'failure_reason': ['reason for failure', 'explanation', 'why failed'],
      'tax_type': ['tax type', 'type of tax', 'which tax'],
      'actions_taken': ['actions taken', 'remedial steps', 'rectifying actions']
    },
    '26.4': {
      'agency_or_company_name': ['agency name', 'company name', 'organization'],
      'warning_date': ['warning date', 'notice date', 'disciplinary date'],
      'warning_reason': ['reason for warning', 'disciplinary reason', 'violation reason'],
      'violation_amount': ['violation amount', 'amount', 'financial amount']
    },
    '26.5': {
      'explanation': ['explanation', 'counseling reason', 'financial problem explanation'],
      'credit_counseling_organization_name': ['organization name', 'counseling organization', 'counselor name'],
      'counseling_actions': ['counseling actions', 'actions taken', 'counseling details']
    },
    '26.6': {
      'agency_name': ['agency name', 'organization name', 'creditor name'],
      'financial_issue_types': ['issue type', 'delinquency type', 'financial problem type'],
      'loan_account_numbers': ['account numbers', 'loan numbers', 'reference numbers'],
      'property_involved': ['property involved', 'asset type', 'collateral'],
      'amount_involved': ['amount involved', 'debt amount', 'financial amount'],
      'issue_reason': ['reason for issue', 'cause of problem', 'explanation'],
      'current_status': ['current status', 'status', 'resolution status'],
      'actions_taken': ['actions taken', 'remedial steps', 'rectifying actions']
    },
    '26.7': {
      'agency_name': ['agency name', 'organization name', 'creditor name'],
      'financial_issue_types': ['issue type', 'problem type', 'repossession type'],
      'loan_account_numbers': ['account numbers', 'loan numbers', 'reference numbers'],
      'property_involved': ['property involved', 'asset type', 'collateral'],
      'amount_involved': ['amount involved', 'debt amount', 'financial amount'],
      'issue_reason': ['reason for issue', 'cause of problem', 'explanation'],
      'current_status': ['current status', 'status', 'resolution status'],
      'actions_taken': ['actions taken', 'remedial steps', 'rectifying actions']
    }
  },
  27: { // Use of Information Technology Systems
    '27.1': {
      'incident_date': ['incident date', 'date of incident', 'when occurred'],
      'incident_description': ['incident description', 'describe incident', 'what happened'],
      'location': ['location', 'where occurred', 'place'],
      'action_taken': ['action taken', 'outcome', 'result']
    },
    '27.2': {
      'incident_date': ['incident date', 'date of incident', 'when occurred'],
      'incident_description': ['incident description', 'describe incident', 'what happened'],
      'location': ['location', 'where occurred', 'place'],
      'action_taken': ['action taken', 'outcome', 'result']
    },
    '27.3': {
      'incident_date': ['incident date', 'date of incident', 'when occurred'],
      'incident_description': ['incident description', 'describe incident', 'what happened'],
      'location': ['location', 'where occurred', 'place'],
      'action_taken': ['action taken', 'outcome', 'result']
    }
  },
  29: { // Association Record
    '29.1': {
      'activity_description': ['activity description', 'describe activity', 'nature of activity']
    },
    '29.2': {
      'organization_name': ['organization name', 'name of organization', 'group name'],
      'positions_held': ['positions held', 'role', 'title'],
      'contributions': ['contributions', 'amount contributed', 'donation'],
      'nature_of_involvement': ['nature of involvement', 'involvement description', 'participation']
    },
    '29.3': {
      'reasons_for_advocacy': ['reasons for advocacy', 'advocacy reasons', 'why advocate']
    },
    '29.4': {
      'organization_name': ['organization name', 'name of organization', 'group name'],
      'positions_held': ['positions held', 'role', 'title'],
      'contributions': ['contributions', 'amount contributed', 'donation'],
      'nature_of_involvement': ['nature of involvement', 'involvement description', 'participation']
    },
    '29.5': {
      'organization_name': ['organization name', 'name of organization', 'group name'],
      'positions_held': ['positions held', 'role', 'title'],
      'contributions': ['contributions', 'amount contributed', 'donation'],
      'nature_of_involvement': ['nature of involvement', 'involvement description', 'participation']
    },
    '29.6': {
      'activity_description': ['activity description', 'describe activity', 'nature of activity']
    },
    '29.7': {
      'explanation': ['explanation', 'details', 'describe']
    }
  }
  // Add more section-specific patterns as needed
};

/**
 * Map fields from field-hierarchy.json to context keys
 * 
 * @param fieldHierarchy The field hierarchy data
 * @param contextData The existing context structure
 * @returns Updated context with mapped fields
 */
export function mapFieldsToContext(
  fieldHierarchy: FieldHierarchy | null,
  contextData: ApplicantFormValues
): ApplicantFormValues {
  if (!fieldHierarchy) {
    return contextData; // Return unmodified if no field data
  }

  // Create instance of FieldMappingService
  const fieldMappingService = new BrowserFieldMappingService();
  
  // Create mappings between field IDs and context keys
  const fieldMappings = createFieldToContextMappings(fieldHierarchy);
  
  // Update context with field values from field hierarchy
  let updatedContext = { ...contextData };

  // Map section-specific fields using dedicated mapping functions
  if (updatedContext.physicalAttributes) {
    updatedContext.physicalAttributes = fieldMappingService.mapPhysicalAttributesFields(
      fieldHierarchy, 
      updatedContext.physicalAttributes
    );
  }
  
  // Map citizenship fields using the dedicated mapping function
  if (updatedContext.citizenshipInfo) {
    updatedContext.citizenshipInfo = fieldMappingService.mapCitizenshipFields(
      fieldHierarchy,
      updatedContext.citizenshipInfo
    );
  }
  
  // Map contact information fields using the dedicated mapping function
  if (updatedContext.contactInfo) {
    updatedContext.contactInfo = fieldMappingService.mapContactFields(
      fieldHierarchy,
      updatedContext.contactInfo
    );
  }
  
  // Map selective service fields using the dedicated mapping function
  if (updatedContext.serviceInfo) {
    updatedContext.serviceInfo = fieldMappingService.mapSelectiveServiceFields(
      fieldHierarchy,
      updatedContext.serviceInfo
    );
  }
  
  // Map mental health fields using the dedicated mapping function
  if (updatedContext.mentalHealth) {
    updatedContext.mentalHealth = fieldMappingService.mapMentalHealthFields(
      fieldHierarchy,
      updatedContext.mentalHealth
    );
  }
  
  // Map investigations and clearance fields using the dedicated mapping function
  if (updatedContext.investigationsInfo) {
    updatedContext.investigationsInfo = fieldMappingService.mapInvestigationsFields(
      fieldHierarchy,
      updatedContext.investigationsInfo
    );
  }
  
  // Map alcohol use fields using the dedicated mapping function
  if (updatedContext.alcoholUse) {
    updatedContext.alcoholUse = fieldMappingService.mapAlcoholFields(
      fieldHierarchy,
      updatedContext.alcoholUse
    );
  }
  
  // Map finances fields using the dedicated mapping function
  if (updatedContext.finances) {
    updatedContext.finances = fieldMappingService.mapFinancesFields(
      fieldHierarchy,
      updatedContext.finances
    );
  }
  
  // Map technology use fields using the dedicated mapping function
  if (updatedContext.technology) {
    updatedContext.technology = fieldMappingService.mapTechnologyUseFields(
      fieldHierarchy,
      updatedContext.technology
    );
  }
  
  // Map association record fields using the dedicated mapping function
  if (updatedContext.association) {
    updatedContext.association = fieldMappingService.mapAssociationFields(
      fieldHierarchy,
      updatedContext.association
    );
  }
  
  // Map relatives fields using the dedicated mapping function
  if (updatedContext.relativesInfo) {
    updatedContext.relativesInfo = fieldMappingService.mapRelativesFields(
      fieldHierarchy,
      updatedContext.relativesInfo
    );
  }
  
  // Get all fields grouped by section
  const fieldsBySection = getAllSectionFields(fieldHierarchy);
  
  // Map subsections for all sections (handles sections with subsections)
  Object.keys(fieldsBySection).forEach(sectionKey => {
    const sectionNumber = parseInt(sectionKey);
    const contextKey = SECTION_TO_CONTEXT_KEY[sectionNumber];
    
    // Skip if section not found in context
    if (!contextKey || !updatedContext[contextKey as keyof ApplicantFormValues]) return;
    
    // Map fields to the section and its subsections
    const sectionData = updatedContext[contextKey as keyof ApplicantFormValues];
    const updatedSectionData = mapSectionAndSubsections(
      sectionNumber,
      fieldsBySection[parseInt(sectionKey)], // Use number to index
      sectionData
    );
    
    // Type assertion to safely assign back to the context
    updatedContext[contextKey as keyof ApplicantFormValues] = updatedSectionData;
  });
  
  // Update context with field values from field hierarchy (general update for unmapped fields)
  updatedContext = updateContextWithFieldHierarchy(updatedContext, fieldHierarchy);
  
  // Ensure context data aligns with interface requirements
  const typeConversionOptions: TypeConversionOptions = {
    dateFormat: 'MM/DD/YYYY',
    booleanTrueValues: ['true', 'yes', 'y', '1'],
    booleanFalseValues: ['false', 'no', 'n', '0']
  };
  
  const { context: alignedContext, validation } = alignContextWithInterfaces(
    updatedContext, 
    fieldMappings,
    typeConversionOptions
  );
  
  // Log validation errors if any
  if (!validation.isValid) {
    console.warn(`Context validation found ${validation.errors.length} errors:`);
    validation.errors.forEach(error => {
      console.warn(`- ${error.message}`);
    });
  }
  
  return alignedContext;
}

/**
 * Enhanced context metadata for form sections
 * Provides additional metadata for handling sensitive information
 * and enforcing appropriate security controls
 */
export const contextWithMetadata = {
  // Psychological and Emotional Health (Section 21)
  mentalHealth: {
    context: mentalHealth,
    section: 21,
    title: "Psychological and Emotional Health",
    confidential: true,
    encryptionEnabled: true,
    accessRestricted: true,
    auditEnabled: true,
    consentRequired: true,
    redactionEnabled: true,
    privacyNoticeRequired: true,
    hipaaProtected: true,
  },
  
  // Add other sections as needed
};

/**
 * Get all fields grouped by section
 * 
 * @param fieldHierarchy The field hierarchy to process
 * @returns Object with section numbers as keys and arrays of fields as values
 */
function getAllSectionFields(fieldHierarchy: FieldHierarchy): Record<number, FieldMetadata[]> {
  const fieldsBySection: Record<number, FieldMetadata[]> = {};
  
  // Process field hierarchy to extract fields by section
  if (fieldHierarchy && typeof fieldHierarchy === 'object') {
    // Handle case where fieldHierarchy is structured by pages
    Object.values(fieldHierarchy).forEach((pageData: any) => {
      if (pageData.fieldsByValuePattern) {
        Object.values(pageData.fieldsByValuePattern).forEach((patternData: any) => {
          if (patternData.fieldsByRegex) {
            Object.values(patternData.fieldsByRegex).forEach((regexData: any) => {
              if (regexData.fields && Array.isArray(regexData.fields)) {
                regexData.fields.forEach((field: FieldMetadata) => {
                  if (field.section) {
                    if (!fieldsBySection[field.section]) {
                      fieldsBySection[field.section] = [];
                    }
                    fieldsBySection[field.section].push(field);
                  }
                });
              }
            });
          }
        });
      } else if (pageData.fields && Array.isArray(pageData.fields)) {
        // Handle simpler structure where fields are directly in page data
        pageData.fields.forEach((field: FieldMetadata) => {
          if (field.section) {
            if (!fieldsBySection[field.section]) {
              fieldsBySection[field.section] = [];
            }
            fieldsBySection[field.section].push(field);
          }
        });
      }
    });
  }
  
  return fieldsBySection;
}

/**
 * Map a section and its subsections to context
 * 
 * @param sectionNumber The section number
 * @param sectionFields Array of fields for this section
 * @param sectionContext The context object for this section
 * @returns Updated section context
 */
function mapSectionAndSubsections(
  sectionNumber: number,
  sectionFields: FieldMetadata[],
  sectionContext: any
): any {
  if (!sectionFields || !Array.isArray(sectionFields) || !sectionContext) {
    return sectionContext;
  }
  
  const updatedContext = { ...sectionContext };
  
  // Group fields by subsection
  const subsectionFields = groupFieldsBySubsection(sectionFields);
  
  // Get the subsection prefix for this section
  const subsectionPrefix = SECTION_SUBSECTION_PREFIX[sectionNumber] || '';
  
  // Map each subsection
  Object.keys(subsectionFields).forEach(subsectionId => {
    const [section, subsection] = subsectionId.split('.').map(Number);
    
    // Skip if section doesn't match
    if (section !== sectionNumber) return;
    
    // Get the subsection key in the context
    const subsectionKey = `${subsectionPrefix}${section}_${subsection}`;
    
    // Check if this subsection exists in the context
    if (updatedContext[subsectionKey]) {
      // Get patterns for this specific subsection if available
      const patterns = 
        SECTION_FIELD_PATTERNS[section]?.[subsectionId] || null;
      
      if (patterns) {
        // Use pattern-based mapping if available
        mapFieldsToContextSubsection(
          subsectionFields[subsectionId],
          updatedContext[subsectionKey],
          patterns
        );
      } else {
        // Use generic mapping
        mapGenericFieldsToSubsection(
          subsectionFields[subsectionId],
          updatedContext[subsectionKey]
        );
      }
    }
  });
  
  return updatedContext;
}

/**
 * Extract subsection identifier from field metadata
 * 
 * @param field Field metadata to extract subsection from
 * @returns Object containing section and subsection numbers, or null if not found
 */
function extractSubsectionInfo(field: FieldMetadata): SubsectionInfo | null {
  if (!field || !field.name) return null;
  
  // Enhanced patterns to detect subsection identifiers in field names
  const subsectionPatterns = [
    // Direct subsection patterns like "Section9.1-9.4[0]"
    /Section(?<section>\d+)\.(?<subsection>\d+)(?:-\d+\.\d+)?(?:\[.*?\])?/i,
    
    // Escaped subsection patterns like "Section9\\.1-9\\.4"
    /Section(?<section>\d+)\\\\.(?<subsection>\d+)(?:-\d+\\\\.d+)?/i,
    
    // Numeric subsection patterns like "9.1" or "18.2"
    /^(?<section>\d+)\.(?<subsection>\d+)$/,
    
    // Section with underscore subsection like "section13_2-2"
    /section(?<section>\d+)_(?<subsection>[0-9.\-]+)/i,
    
    // Fields with subsection value patterns
    /^sect(?<section>\d+)\.(?<subsection>\d+)/i,
    
    // Additional pattern for capturing subsections with hyphens
    /section(?<section>\d+)[-_](?<subsection>\d+)/i,
    
    // Pattern for alternate subsection format
    /(?<section>\d+)-(?<subsection>\d+)/,
    
    // Form1 style subsection patterns like "form1[0].Section15_2[0]"
    /form\d+\[\d+\]\.Section(?<section>\d+)_(?<subsection>\d+)/i,
    
    // Subforms with section identifiers
    /#subform\[\d+\]\.Section(?<section>\d+)_(?<subsection>\d+)/i,
    
    // Handle fieldName patterns with nested areas like "form1[0].Section15_3[0].#area[0]"
    /Section(?<section>\d+)_(?<subsection>\d+)\[\d+\]\.#area/i,
    
    // Handle patterns with multiple area identifiers
    /Section(?<section>\d+)_(?<subsection>\d+)\[\d+\]\.#area\[\d+\]\.#area\[\d+\]/i,

    // Handle fieldName with complex nesting "form1[0].Section15_3[0].#area[2].TextField11[7]"
    /Section(?<section>\d+)_(?<subsection>\d+)\[\d+\]\.#area\[\d+\]\./i,
    
    // Roman numeral subsections like "SectionXV_II"
    /Section(?<section>[IVX]+)_(?<subsection>[IVX]+)/i,

    // Handle patterns with text identifiers like "SectionA_1"
    /Section(?<section>[A-Z])_(?<subsection>\d+)/i,
  ];
  
  // Check field name against all patterns
  for (const pattern of subsectionPatterns) {
    const match = field.name.match(pattern);
    if (match?.groups?.section && match?.groups?.subsection) {
      // Parse section number, handling both numeric and Roman numerals
      let section = match.groups.section;
      let sectionNum = parseInt(section);
      
      // Handle Roman numerals if needed
      if (isNaN(sectionNum) && /^[IVX]+$/.test(section)) {
        sectionNum = romanToInt(section);
      }
      
      // Handle letter sections (A=1, B=2, etc.)
      if (isNaN(sectionNum) && /^[A-Z]$/.test(section)) {
        sectionNum = section.charCodeAt(0) - 64; // A=1, B=2, etc.
      }
      
      // Parse subsection
      let subsection = match.groups.subsection;
      let subsectionNum = parseInt(subsection);
      
      // Handle Roman numerals for subsections
      if (isNaN(subsectionNum) && /^[IVX]+$/.test(subsection)) {
        subsectionNum = romanToInt(subsection);
      }
      
      if (!isNaN(sectionNum) && !isNaN(subsectionNum)) {
        return {
          section: sectionNum,
          subsection: subsectionNum
        };
      }
    }
  }
  
  // Check field label for subsection information
  if (field.label) {
    // Patterns to check in field labels
    const labelPatterns = [
      // Standard patterns like "Section 15.2 Entry #1"
      /section\s+(?<section>\d+)\.(?<subsection>\d+)/i,
      
      // Patterns like "15.2 Entry #2"
      /^(?<section>\d+)\.(?<subsection>\d+)\s+/i,
      
      // Patterns like "Section 15 Subsection 2"
      /section\s+(?<section>\d+)\s+subsection\s+(?<subsection>\d+)/i,
      
      // Enhanced pattern to extract from descriptive text like "15.2 Complete the following..."
      /^(?<section>\d+)\.(?<subsection>\d+)\s+/i
    ];
    
    for (const pattern of labelPatterns) {
      const match = field.label.match(pattern);
      if (match?.groups?.section && match?.groups?.subsection) {
        return {
          section: parseInt(match.groups.section),
          subsection: parseInt(match.groups.subsection)
        };
      }
    }
  }
  
  // Check field value for subsection info if it's a string
  if (typeof field.value === 'string') {
    for (const pattern of subsectionPatterns) {
      const match = field.value.match(pattern);
      if (match?.groups?.section && match?.groups?.subsection) {
        return {
          section: parseInt(match.groups.section),
          subsection: parseInt(match.groups.subsection)
        };
      }
    }
  }
  
  // Check field section and infer subsection from other metadata
  if (field.section && field.name) {
    // Try to extract subsection from parts of the name
    const parts = field.name.split(/[_.\[\]]/);
    for (let i = 0; i < parts.length; i++) {
      if (/^\d+$/.test(parts[i]) && i < parts.length - 1 && /^\d+$/.test(parts[i+1])) {
        const potentialSection = parseInt(parts[i]);
        const potentialSubsection = parseInt(parts[i+1]);
        
        // Only consider it a match if the section matches the field's section
        if (potentialSection === field.section) {
          return {
            section: potentialSection,
            subsection: potentialSubsection
          };
        }
      }
    }
  }
  
  return null;
}

/**
 * Helper function to convert Roman numerals to integers
 */
function romanToInt(s: string): number {
  const romanMap: Record<string, number> = {
    'I': 1,
    'V': 5,
    'X': 10,
    'L': 50,
    'C': 100,
    'D': 500,
    'M': 1000
  };
  
  let result = 0;
  for (let i = 0; i < s.length; i++) {
    // If current value is less than next value, subtract
    if (i + 1 < s.length && romanMap[s[i]] < romanMap[s[i + 1]]) {
      result -= romanMap[s[i]];
    } else {
      result += romanMap[s[i]];
    }
  }
  
  return result;
}

/**
 * Groups fields by subsection
 * 
 * @param fields Array of fields to group
 * @returns Object with subsection IDs as keys and arrays of fields as values
 */
function groupFieldsBySubsection(fields: FieldMetadata[]): Record<string, FieldMetadata[]> {
  const groupedFields: Record<string, FieldMetadata[]> = {};
  
  fields.forEach(field => {
    const subsectionInfo = extractSubsectionInfo(field);
    if (subsectionInfo) {
      const subsectionId = `${subsectionInfo.section}.${subsectionInfo.subsection}`;
      if (!groupedFields[subsectionId]) {
        groupedFields[subsectionId] = [];
      }
      groupedFields[subsectionId].push(field);
    }
  });
  
  return groupedFields;
}

/**
 * Helper function to map fields to a context subsection using pattern matching
 */
function mapFieldsToContextSubsection(
  sourceFields: FieldMetadata[],
  targetSubsection: any,
  fieldPatternMap: Record<string, string[]>
): void {
  if (!sourceFields || !Array.isArray(sourceFields) || !targetSubsection) {
    return;
  }

  // For each field in the pattern map
  for (const [fieldName, patterns] of Object.entries(fieldPatternMap)) {
    // Skip if the field doesn't exist in the target subsection
    if (targetSubsection[fieldName] === undefined) continue;
    
    // Find a matching field
    const matchingField = findFieldByPattern(sourceFields, patterns);
    if (matchingField) {
      // Update the field in the subsection
      if (typeof targetSubsection[fieldName] === 'object') {
        targetSubsection[fieldName] = {
          ...targetSubsection[fieldName],
          value: matchingField.value || targetSubsection[fieldName].value,
          id: matchingField.id || targetSubsection[fieldName].id
        };
      } else {
        targetSubsection[fieldName] = matchingField.value;
      }
    }
  }
}

/**
 * Generic helper for mapping fields to a subsection
 */
function mapGenericFieldsToSubsection(sourceFields: FieldMetadata[], targetSubsection: any): void {
  if (!sourceFields || !Array.isArray(sourceFields) || !targetSubsection) {
    return;
  }

  // Try to intelligently map fields based on name similarity
  sourceFields.forEach(field => {
    if (!field.name) return;
    
    // Skip fields that don't have a value
    if (field.value === undefined || field.value === null) return;
    
    // Try multiple approaches to extract potential property keys
    const potentialKeys = getPotentialContextKeys(field);
    
    // Check if any of these keys exists in the target subsection
    for (const key of potentialKeys) {
      if (key && targetSubsection[key] !== undefined) {
        if (typeof targetSubsection[key] === 'object') {
          targetSubsection[key] = {
            ...targetSubsection[key],
            value: field.value,
            id: field.id || targetSubsection[key].id
          };
        } else {
          targetSubsection[key] = field.value;
        }
        break; // Stop once we've found a matching key
      }
    }
  });
}

/**
 * Extract potential context keys from a field
 */
function getPotentialContextKeys(field: FieldMetadata): string[] {
  const keys = new Set<string>();
  
  // 1. From field name
  if (field.name) {
    // Extract last part of name (after last dot, bracket, or underscore)
    const nameParts = field.name.split(/[\[\]\._]+/).filter(Boolean);
    if (nameParts.length > 0) {
      const lastPart = nameParts[nameParts.length - 1];
      keys.add(lastPart
        .replace(/\d+$/, '') // Remove trailing numbers
        .replace(/^field/i, '') // Remove 'field' prefix
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_') // Replace non-alphanumeric with underscore
        .replace(/^_+|_+$/g, '') // Trim leading/trailing underscores
      );
    }
  }
  
  // 2. From field label
  if (field.label) {
    keys.add(field.label
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_') // Replace spaces and special chars with underscores
      .replace(/^_+|_+$/g, '') // Trim leading/trailing underscores
    );
    
    // Also add camelCase version
    keys.add(field.label
      .replace(/\s+(.)/g, (_, char) => char.toUpperCase()) // Convert to camelCase
      .replace(/[^a-zA-Z0-9]/g, '') // Remove special chars
      .replace(/^[A-Z]/, firstChar => firstChar.toLowerCase()) // Ensure first char is lowercase
    );
  }
  
  return Array.from(keys);
}

/**
 * Helper function to find a field by matching against name patterns
 */
function findFieldByPattern(fields: FieldMetadata[], patterns: string[]): FieldMetadata | null {
  if (!fields || !Array.isArray(fields)) {
    return null;
  }

  for (const field of fields) {
    const fieldName = (field.name || '').toLowerCase();
    const fieldLabel = (field.label || '').toLowerCase();
    
    for (const pattern of patterns) {
      const patternLower = pattern.toLowerCase();
      if (fieldName.includes(patternLower) || fieldLabel.includes(patternLower)) {
        return field;
      }
    }
  }
  
  return null;
}

/**
 * Default form data structure that maps to all 30 sections of the SF-86 form.
 * Each section is mapped to its respective context file which contains the structure
 * with field IDs, types, and values based on field-hierarchy.json.
 * 
 * Section mappings:
 * 1: personalInfo - Full Name
 * 2: birthInfo - Date of Birth
 * 3: placeOfBirth - Place of Birth
 * 4: aknowledgementInfo - Social Security Number
 * 5: namesInfo - Other Names Used
 * 6: physicalAttributes - Your Identifying Information
 * 7: contactInfo - Your Contact Information
 * 8: passportInfo - U.S. Passport Information
 * 9: citizenshipInfo - Citizenship
 * 10: dualCitizenshipInfo - Dual/Multiple Citizenship & Foreign Passport Info
 * 11: residencyInfo - Where You Have Lived
 * 12: schoolInfo - Where you went to School
 * 13: employmentInfo - Employment Activities
 * 14: serviceInfo - Selective Service
 * 15: militaryHistoryInfo - Military History
 * 16: peopleThatKnow - People Who Know You Well
 * 17: relationshipInfo - Marital/Relationship Status
 * 18: relativesInfo - Relatives
 * 19: foreignContacts - Foreign Contacts
 * 20: foreignActivities - Foreign Business, Activities, Government Contacts
 * 21: mentalHealth - Psychological and Emotional Health
 * 22: policeRecord - Police Record
 * 23: drugActivity - Illegal Use of Drugs and Drug Activity
 * 24: alcoholUse - Use of Alcohol
 * 25: investigationsInfo - Investigations and Clearance
 * 26: finances - Financial Record
 * 27: technology - Use of Information Technology Systems
 * 28: civil - Involvement in Non-Criminal Court Actions
 * 29: association - Association Record
 * 30: signature - Continuation Space
 */
const defaultFormData: ApplicantFormValues = {
  // Section 1: Full Name
  personalInfo: personalInfo,
  
  // Section 2: Date of Birth
  birthInfo: birthInfo,
  
  // Section 3: Place of Birth
  placeOfBirth: placeOfBirth,
  
  // Section 4: Social Security Number
  aknowledgementInfo: aknowledgementInfo,
  
  // Section 5: Other Names Used
  namesInfo: namesInfo,
  
  // Section 6: Your Identifying Information
  physicalAttributes: physicalAttributes,
  
  // Section 7: Your Contact Information
  contactInfo: contactInfo,
  
  // Section 8: U.S. Passport Information
  passportInfo: passportInfo,
  
  // Section 9: Citizenship
  citizenshipInfo: citizenshipInfo,
  
  // Section 10: Dual/Multiple Citizenship & Foreign Passport
  dualCitizenshipInfo: dualCitizenshipInfo,
  
  // Section 11: Where You Have Lived
  residencyInfo: residencyInfo,
  
  // Section 12: Where you went to School
  schoolInfo: schoolInfo,
  
  // Section 13: Employment Activities
  employmentInfo: employmentInfo,
  
  // Section 14: Selective Service
  serviceInfo: serviceInfo,
  
  // Section 15: Military History
  militaryHistoryInfo: militaryHistoryInfo,
  
  // Section 16: People Who Know You Well
  peopleThatKnow: peopleThatKnow,
  
  // Section 17: Marital/Relationship Status
  relationshipInfo: relationshipInfo,
  
  // Section 18: Relatives
  relativesInfo: relativesInfo,
  
  // Section 19: Foreign Contacts
  foreignContacts: foreignContacts,
  
  // Section 20: Foreign Activities
  foreignActivities: foreignActivities,
  
  // Section 21: Psychological and Emotional Health
  mentalHealth: mentalHealth,
  
  // Section 22: Police Record
  policeRecord: policeRecord,
  
  // Section 23: Illegal Use of Drugs and Drug Activity
  drugActivity: drugActivity,
  
  // Section 24: Use of Alcohol
  alcoholUse: alcoholUse,
  
  // Section 25: Investigations and Clearance
  investigationsInfo: investigationsInfo,
  
  // Section 26: Financial Record
  finances: finances,
  
  // Section 27: Use of Information Technology Systems
  technology: technology,
  
  // Section 28: Involvement in Non-Criminal Court Actions
  civil: civil,
  
  // Section 29: Association Record
  association: association,
  
  // Section 30: Signature and Continuation Space
  signature: signature,
  
  // Print section (not a numbered section in SF-86)
  print: print
};

// Process the form data with field hierarchy data if available
const fieldHierarchy = getFieldHierarchyData();
const enhancedFormData = mapFieldsToContext(fieldHierarchy, defaultFormData);

export default enhancedFormData;
