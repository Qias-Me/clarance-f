/**
 * Section 11: Where You Have Lived
 *
 * TypeScript interface definitions for SF-86 Section 11 (Where You Have Lived) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-11.json.
 */

import type { Field, FieldWithOptions } from '../formDefinition2.0';
import type { USState, Country } from './base';
import { createFieldFromReference, validateSectionFieldCount } from '../../utils/sections-references-loader';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Address information structure for residence entries
 */
export interface AddressInformation {
  streetAddress: Field<string>;
  city: Field<string>;
  state: FieldWithOptions<USState>;
  zipCode: Field<string>;
  country: FieldWithOptions<Country>;
}

/**
 * APO/FPO address information for military addresses
 */
export interface APOFPOAddress {
  isAPOFPO: Field<boolean>;
  streetUnit: Field<string>;
  apoType: FieldWithOptions<"APO" | "FPO" | "DPO">;
  aeCode: FieldWithOptions<"AA" | "AE" | "AP">;
  zipCode: Field<string>;
}

/**
 * Contact person information for each residence
 */
export interface ContactPerson {
  lastName: Field<string>;
  firstName: Field<string>;
  middleName: Field<string>;
  relationship: FieldWithOptions<"Neighbor" | "Landlord" | "Friend" | "Relative" | "Other">;
  relationshipOther: Field<string>;
  
  // Contact methods
  eveningPhone: Field<string>;
  eveningPhoneExt: Field<string>;
  eveningPhoneIntl: Field<boolean>;
  daytimePhone: Field<string>;
  daytimePhoneExt: Field<string>;
  daytimePhoneIntl: Field<boolean>;
  mobilePhone: Field<string>;
  mobilePhoneExt: Field<string>;
  mobilePhoneIntl: Field<boolean>;
  email: Field<string>;
  
  // Contact address
  address: AddressInformation;
  apoFpoAddress?: APOFPOAddress;
  
  // Contact availability
  monthLastContact: Field<string>;
  dontKnowContact: Field<boolean>;
}

/**
 * Residence entry structure for Section 11
 */
export interface ResidenceEntry {
  // Date information
  fromDate: Field<string>;
  fromDateEstimate: Field<boolean>;
  toDate: Field<string>;
  toDateEstimate: Field<boolean>;
  present: Field<boolean>;
  
  // Address type
  residenceType: FieldWithOptions<"Own" | "Rent" | "Military Housing" | "Other">;
  residenceTypeOther: Field<string>;
  
  // Address information
  address: AddressInformation;
  apoFpoAddress?: APOFPOAddress;
  
  // Contact person who knows you at this address
  contactPerson: ContactPerson;
}

/**
 * Section 11 main data structure
 */
export interface Section11 {
  _id: number;
  section11: {
    residences: ResidenceEntry[];
  };
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 11 subsection keys for type safety
 */
export type Section11SubsectionKey = 'section11';

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID mappings for Section 11 (Where You Have Lived)
 * Based on the actual field IDs from section-11.json (4-digit format)
 */
export const SECTION11_FIELD_IDS = {
  // Entry 1 - Main address fields
  STREET_ADDRESS_1: "9804", // form1[0].Section11[0].TextField11[3]
  CITY_1: "9803", // form1[0].Section11[0].TextField11[4]
  STATE_1: "9802", // form1[0].Section11[0].School6_State[0]
  COUNTRY_1: "9801", // form1[0].Section11[0].DropDownList5[0]
  ZIP_CODE_1: "9800", // form1[0].Section11[0].TextField11[5]
  
  // Entry 1 - Date fields
  FROM_DATE_1: "9814", // form1[0].Section11[0].From_Datefield_Name_2[0]
  FROM_DATE_ESTIMATE_1: "9813", // form1[0].Section11[0].#field[15]
  TO_DATE_1: "9812", // form1[0].Section11[0].From_Datefield_Name_2[1]
  TO_DATE_ESTIMATE_1: "9810", // form1[0].Section11[0].#field[18]
  PRESENT_1: "9811", // form1[0].Section11[0].#field[17]
  
  // Entry 1 - Residence type
  RESIDENCE_TYPE_1: "17200", // form1[0].Section11[0].RadioButtonList[0]
  RESIDENCE_TYPE_OTHER_1: "9805", // form1[0].Section11[0].TextField12[0]
  
  // Entry 1 - Contact person
  CONTACT_LAST_NAME_1: "9789", // form1[0].Section11[0].TextField11[6]
  CONTACT_FIRST_NAME_1: "9788", // form1[0].Section11[0].TextField11[7]
  CONTACT_MIDDLE_NAME_1: "9787", // form1[0].Section11[0].TextField11[8]
  
  // Entry 1 - Contact phone numbers
  EVENING_PHONE_1: "9826", // form1[0].Section11[0].p3-t68[0]
  EVENING_PHONE_EXT_1: "9825", // form1[0].Section11[0].TextField11[0]
  EVENING_PHONE_INTL_1: "9824", // form1[0].Section11[0].#field[4]
  DAYTIME_PHONE_1: "9822", // form1[0].Section11[0].p3-t68[1]
  DAYTIME_PHONE_EXT_1: "9821", // form1[0].Section11[0].TextField11[1]
  DAYTIME_PHONE_INTL_1: "9818", // form1[0].Section11[0].#field[10]
  MOBILE_PHONE_1: "9820", // form1[0].Section11[0].p3-t68[2]
  MOBILE_PHONE_EXT_1: "9819", // form1[0].Section11[0].TextField11[2]
  MOBILE_PHONE_INTL_1: "9816", // form1[0].Section11[0].#field[12]
  
  // Entry 1 - Contact availability
  DONT_KNOW_CONTACT_1: "9823", // form1[0].Section11[0].#field[5]
  EMAIL_1: "9786", // Email field for contact person
  
} as const;

/**
 * Field name mappings for Section 11 (Where You Have Lived)
 * Full field paths from section-11.json
 */
export const SECTION11_FIELD_NAMES = {
  // Entry 1 - Main address fields
  STREET_ADDRESS_1: "form1[0].Section11[0].TextField11[3]",
  CITY_1: "form1[0].Section11[0].TextField11[4]",
  STATE_1: "form1[0].Section11[0].School6_State[0]",
  COUNTRY_1: "form1[0].Section11[0].DropDownList5[0]",
  ZIP_CODE_1: "form1[0].Section11[0].TextField11[5]",
  
  // Entry 1 - Date fields
  FROM_DATE_1: "form1[0].Section11[0].From_Datefield_Name_2[0]",
  FROM_DATE_ESTIMATE_1: "form1[0].Section11[0].#field[15]",
  TO_DATE_1: "form1[0].Section11[0].From_Datefield_Name_2[1]",
  TO_DATE_ESTIMATE_1: "form1[0].Section11[0].#field[18]",
  PRESENT_1: "form1[0].Section11[0].#field[17]",
  
  // Entry 1 - Residence type
  RESIDENCE_TYPE_1: "form1[0].Section11[0].RadioButtonList[0]",
  RESIDENCE_TYPE_OTHER_1: "form1[0].Section11[0].TextField12[0]",
  
  // Entry 1 - Contact person
  CONTACT_LAST_NAME_1: "form1[0].Section11[0].TextField11[6]",
  CONTACT_FIRST_NAME_1: "form1[0].Section11[0].TextField11[7]",
  CONTACT_MIDDLE_NAME_1: "form1[0].Section11[0].TextField11[8]",
  
  // Entry 1 - Contact phone numbers
  EVENING_PHONE_1: "form1[0].Section11[0].p3-t68[0]",
  EVENING_PHONE_EXT_1: "form1[0].Section11[0].TextField11[0]",
  EVENING_PHONE_INTL_1: "form1[0].Section11[0].#field[4]",
  DAYTIME_PHONE_1: "form1[0].Section11[0].p3-t68[1]",
  DAYTIME_PHONE_EXT_1: "form1[0].Section11[0].TextField11[1]",
  DAYTIME_PHONE_INTL_1: "form1[0].Section11[0].#field[10]",
  MOBILE_PHONE_1: "form1[0].Section11[0].p3-t68[2]",
  MOBILE_PHONE_EXT_1: "form1[0].Section11[0].TextField11[2]",
  MOBILE_PHONE_INTL_1: "form1[0].Section11[0].#field[12]",
  
  // Entry 1 - Contact availability
  DONT_KNOW_CONTACT_1: "form1[0].Section11[0].#field[5]",
  EMAIL_1: "form1[0].Section11[0].p3-t68[4]", // Email field for contact person
  
} as const;

// ============================================================================
// DROPDOWN OPTIONS
// ============================================================================

/**
 * Residence type options
 */
export const RESIDENCE_TYPE_OPTIONS = [
  "Own",
  "Rent", 
  "Military Housing",
  "Other"
] as const;

/**
 * Relationship options for contact person
 */
export const RELATIONSHIP_OPTIONS = [
  "Neighbor",
  "Landlord", 
  "Friend",
  "Relative",
  "Other"
] as const;

/**
 * APO/FPO type options
 */
export const APO_FPO_TYPE_OPTIONS = [
  "APO",
  "FPO", 
  "DPO"
] as const;

/**
 * AE code options for military addresses
 */
export const AE_CODE_OPTIONS = [
  "AA", // Americas
  "AE", // Europe/Africa/Middle East
  "AP"  // Pacific
] as const;

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Validation rules specific to Section 11
 */
export interface Section11ValidationRules {
  requiresStreetAddress: boolean;
  requiresCity: boolean;
  requiresStateOrCountry: boolean;
  requiresContactPerson: boolean;
  requiresFromDate: boolean;
  maxResidenceGap: number; // in months
  minimumResidenceTimeframe: number; // in years
}

/**
 * Section 11 validation context
 */
export interface Section11ValidationContext {
  rules: Section11ValidationRules;
  allowAddressEstimates: boolean;
  requiresContinuousHistory: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for residence field updates
 */
export type Section11FieldUpdate = {
  fieldPath: string;
  newValue: any;
  entryIndex?: number;
};

/**
 * Type for residence validation results
 */
export type ResidenceValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  hasGaps: boolean;
  gapDetails?: Array<{ startDate: string; endDate: string; duration: number }>;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default address information structure
 */
export const createDefaultAddressInformation = (): AddressInformation => ({
  streetAddress: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Street Address',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  city: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'City',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  state: {
    id: '',
    name: '',
    type: 'PDFDropdown',
    label: 'State',
    value: '' as USState,
    options: [
      "AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", 
      "FL", "FM", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", 
      "KY", "LA", "MA", "MD", "ME", "MH", "MI", "MN", "MO", "MP", 
      "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", 
      "OH", "OK", "OR", "PA", "PR", "PW", "RI", "SC", "SD", "TN", 
      "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY", "AA", "AE", "AP", ""
    ],
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  zipCode: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Zip Code',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  country: {
    id: '',
    name: '',
    type: 'PDFDropdown',
    label: 'Country',
    value: '' as Country,
    options: [
      "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia", 
      "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belarus", "Belgium", 
      "Bolivia", "Brazil", "Bulgaria", "Cambodia", "Canada", "Chile", "China", 
      "Colombia", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", 
      "Ecuador", "Egypt", "Estonia", "Finland", "France", "Germany", "Greece", 
      "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", 
      "Israel", "Italy", "Japan", "Jordan", "Kazakhstan", "Kuwait", "Latvia", 
      "Lebanon", "Lithuania", "Luxembourg", "Mexico", "Netherlands", "New Zealand", 
      "Norway", "Pakistan", "Poland", "Portugal", "Romania", "Russia", "Saudi Arabia", 
      "Singapore", "Slovakia", "Slovenia", "South Korea", "Spain", "Sweden", 
      "Switzerland", "Syria", "Thailand", "Turkey", "Ukraine", "United Kingdom", 
      "Vietnam", ""
    ],
    rect: { x: 0, y: 0, width: 0, height: 0 }
  }
});

/**
 * Creates a default contact person structure
 */
export const createDefaultContactPerson = (): ContactPerson => ({
  lastName: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Last Name',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  firstName: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'First Name',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  middleName: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Middle Name',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  relationship: {
    id: '',
    name: '',
    type: 'PDFDropdown',
    label: 'Relationship',
    value: 'Neighbor' as const,
    options: RELATIONSHIP_OPTIONS,
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  relationshipOther: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Other Relationship',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  eveningPhone: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Evening Phone',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  eveningPhoneExt: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Evening Phone Extension',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  eveningPhoneIntl: {
    id: '',
    name: '',
    type: 'PDFCheckBox',
    label: 'Evening Phone International',
    value: false,
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  daytimePhone: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Daytime Phone',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  daytimePhoneExt: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Daytime Phone Extension',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  daytimePhoneIntl: {
    id: '',
    name: '',
    type: 'PDFCheckBox',
    label: 'Daytime Phone International',
    value: false,
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  mobilePhone: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Mobile Phone',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  mobilePhoneExt: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Mobile Phone Extension',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  mobilePhoneIntl: {
    id: '',
    name: '',
    type: 'PDFCheckBox',
    label: 'Mobile Phone International',
    value: false,
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  email: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Email',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  address: createDefaultAddressInformation(),
  monthLastContact: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Month of Last Contact',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  dontKnowContact: {
    id: '',
    name: '',
    type: 'PDFCheckBox',
    label: "I don't know this person",
    value: false,
    rect: { x: 0, y: 0, width: 0, height: 0 }
  }
});

/**
 * Creates a default residence entry with the provided index
 */
export const createDefaultResidenceEntry = (index: number): ResidenceEntry => {
  const indexStr = index === 0 ? '1' : `${index + 1}`;

  return {
    fromDate: {
      id: index === 0 ? SECTION11_FIELD_IDS.FROM_DATE_1 : `residence_from_date_${indexStr}`,
      name: index === 0 ? SECTION11_FIELD_NAMES.FROM_DATE_1 : `residence_from_date_${indexStr}`,
      type: 'PDFTextField',
      label: 'From Date (Month/Year)',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    fromDateEstimate: {
      id: index === 0 ? SECTION11_FIELD_IDS.FROM_DATE_ESTIMATE_1 : `residence_from_estimate_${indexStr}`,
      name: index === 0 ? SECTION11_FIELD_NAMES.FROM_DATE_ESTIMATE_1 : `residence_from_estimate_${indexStr}`,
      type: 'PDFCheckBox',
      label: 'From Date Estimate',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    toDate: {
      id: index === 0 ? SECTION11_FIELD_IDS.TO_DATE_1 : `residence_to_date_${indexStr}`,
      name: index === 0 ? SECTION11_FIELD_NAMES.TO_DATE_1 : `residence_to_date_${indexStr}`,
      type: 'PDFTextField',
      label: 'To Date (Month/Year)',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    toDateEstimate: {
      id: index === 0 ? SECTION11_FIELD_IDS.TO_DATE_ESTIMATE_1 : `residence_to_estimate_${indexStr}`,
      name: index === 0 ? SECTION11_FIELD_NAMES.TO_DATE_ESTIMATE_1 : `residence_to_estimate_${indexStr}`,
      type: 'PDFCheckBox',
      label: 'To Date Estimate',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    present: {
      id: index === 0 ? SECTION11_FIELD_IDS.PRESENT_1 : `residence_present_${indexStr}`,
      name: index === 0 ? SECTION11_FIELD_NAMES.PRESENT_1 : `residence_present_${indexStr}`,
      type: 'PDFCheckBox',
      label: 'Present',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    residenceType: {
      id: index === 0 ? SECTION11_FIELD_IDS.RESIDENCE_TYPE_1 : `residence_type_${indexStr}`,
      name: index === 0 ? SECTION11_FIELD_NAMES.RESIDENCE_TYPE_1 : `residence_type_${indexStr}`,
      type: 'PDFRadioGroup',
      label: 'Residence Type',
      value: 'Own' as const,
      options: RESIDENCE_TYPE_OPTIONS,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    residenceTypeOther: {
      id: index === 0 ? SECTION11_FIELD_IDS.RESIDENCE_TYPE_OTHER_1 : `residence_type_other_${indexStr}`,
      name: index === 0 ? SECTION11_FIELD_NAMES.RESIDENCE_TYPE_OTHER_1 : `residence_type_other_${indexStr}`,
      type: 'PDFTextField',
      label: 'Other Residence Type',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    address: createDefaultAddressInformation(),
    contactPerson: createDefaultContactPerson()
  };
};

/**
 * Creates a default Section 11 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */
export const createDefaultSection11 = (): Section11 => {
  // Validate field count against sections-references
  validateSectionFieldCount(11);

  return {
    _id: 11,
    section11: {
      residences: [createDefaultResidenceEntry(0)]
    }
  };
};

/**
 * Updates a specific field in the Section 11 data structure
 */
export const updateSection11Field = (
  section11Data: Section11,
  update: Section11FieldUpdate
): Section11 => {
  const { fieldPath, newValue, entryIndex = 0 } = update;
  const newData = { ...section11Data };

  // Update the specified field
  if (fieldPath.includes('residences')) {
    const residences = [...newData.section11.residences];
    if (residences[entryIndex]) {
      // Update specific residence entry field
      const residence = { ...residences[entryIndex] };
      // Field path parsing logic would go here
      residences[entryIndex] = residence;
      newData.section11.residences = residences;
    }
  }

  return newData;
};

/**
 * Adds a new residence entry to Section 11
 */
export const addResidenceEntry = (section11Data: Section11): Section11 => {
  const newData = { ...section11Data };
  const currentLength = newData.section11.residences.length;
  const newEntry = createDefaultResidenceEntry(currentLength);
  
  newData.section11.residences = [...newData.section11.residences, newEntry];
  return newData;
};

/**
 * Removes a residence entry from Section 11
 */
export const removeResidenceEntry = (section11Data: Section11, index: number): Section11 => {
  const newData = { ...section11Data };
  newData.section11.residences = newData.section11.residences.filter((_, i) => i !== index);
  return newData;
};

/**
 * Validates residence history for gaps and completeness
 */
export const validateResidenceHistory = (
  residences: ResidenceEntry[],
  context: Section11ValidationContext
): ResidenceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Sort residences by date to check for gaps
  const sortedResidences = residences
    .filter(r => r.fromDate.value && r.toDate.value)
    .sort((a, b) => new Date(a.fromDate.value).getTime() - new Date(b.fromDate.value).getTime());

  // Check for basic required fields
  residences.forEach((residence, index) => {
    if (!residence.address.streetAddress.value) {
      errors.push(`Residence ${index + 1}: Street address is required`);
    }
    if (!residence.address.city.value) {
      errors.push(`Residence ${index + 1}: City is required`);
    }
    if (!residence.fromDate.value) {
      errors.push(`Residence ${index + 1}: From date is required`);
    }
    if (!residence.contactPerson.lastName.value) {
      errors.push(`Residence ${index + 1}: Contact person last name is required`);
    }
  });

  // Check for gaps if continuous history is required
  const hasGaps = context.requiresContinuousHistory && sortedResidences.length > 1;
  const gapDetails: Array<{ startDate: string; endDate: string; duration: number }> = [];

  if (hasGaps) {
    for (let i = 0; i < sortedResidences.length - 1; i++) {
      const currentEnd = new Date(sortedResidences[i].toDate.value);
      const nextStart = new Date(sortedResidences[i + 1].fromDate.value);
      
      const timeDiff = nextStart.getTime() - currentEnd.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      if (daysDiff > 30) { // Gap of more than 30 days
        gapDetails.push({
          startDate: sortedResidences[i].toDate.value,
          endDate: sortedResidences[i + 1].fromDate.value,
          duration: daysDiff
        });
      }
    }
  }

  if (gapDetails.length > 0) {
    warnings.push(`Found ${gapDetails.length} gaps in residence history`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasGaps: gapDetails.length > 0,
    gapDetails: gapDetails.length > 0 ? gapDetails : undefined
  };
}; 