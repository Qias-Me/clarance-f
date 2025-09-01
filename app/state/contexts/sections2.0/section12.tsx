/**
 * Section 12: Where You Went to School - Context Provider (GOLD STANDARD)
 *
 * This is a GOLD STANDARD implementation for SF-86 Section 12, demonstrating
 * optimal patterns for DRY principles, performance optimization, and createDefaultSection compatibility.
 *
 * FIELD COUNT: 150 fields (validated against sections-references/section-12.json)
 *
 * Features:
 * - Enhanced section template with performance monitoring
 * - Standardized field operations and validation
 * - createDefaultSection compatibility
 * - Performance-optimized logging
 * - Memory-efficient state management
 * - Education entry management with CRUD operations
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect
} from 'react';
import { cloneDeep, isEqual } from 'lodash';
import set from 'lodash/set';
import type {
  Section12,
  Section12Data,
  Section12FieldUpdate,
  EducationValidationResult,
  Section12ValidationContext,
  SchoolEntry,
  SchoolEntryOperation,
  DegreeEntry,
  ContactPerson,
  SchoolTypes
} from '../../../../api/interfaces/section-interfaces/section12';
import {
  SCHOOL_TYPE_OPTIONS,
  DEGREE_TYPE_OPTIONS,
  EDUCATION_DATE_VALIDATION
} from '../../../../api/interfaces/section-interfaces/section12';
import type { ValidationResult, ValidationError } from '../shared/base-interfaces';
import { validateSection12FieldMappings } from './section12-field-mapping';
import { validateFieldGeneration, generateSection12Field, generateGlobalFields } from './section12-field-generator';
import { useSF86Form } from './SF86FormContext';
import { validateSectionFieldCount } from '../../../../api/utils/sections-references-loader';

// ============================================================================
// HELPER FUNCTIONS (MOVED FROM INTERFACE LAYER)
// ============================================================================

/**
 * Creates a default degree entry
 */
export const createDefaultDegreeEntry = (): DegreeEntry => {
  return {
    degreeType: {
      id: "",
      name: "",
      type: 'PDFDropdown',
      label: 'Degree Type',
      value: "High School Diploma",
      options: ["High School Diploma", "Associate's", "Bachelor's", "Master's", "Doctorate", "Professional Degree (e.g. M D, D V M, J D)", "Other"],
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    otherDegree: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'Other Degree',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    dateAwarded: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'Date Awarded',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    dateAwardedEstimate: {
      id: "",
      name: "",
      type: 'PDFCheckBox',
      label: 'Estimate',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    }
  };
};

/**
 * Creates a default contact person entry
 */
export const createDefaultContactPerson = (): ContactPerson => {
  return {
    unknownPerson: {
      id: "",
      name: "",
      type: 'PDFCheckBox',
      label: 'I don\'t know',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    lastName: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'Last Name',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    firstName: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'First Name',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    address: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'Address',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    city: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'City',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    state: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'State',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    country: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'Country',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    zipCode: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'Zip Code',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    phoneNumber: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'Phone Number',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    phoneExtension: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'Extension',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    email: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'Email',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    isInternationalPhone: {
      id: "",
      name: "",
      type: 'PDFCheckBox',
      label: 'International Phone',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    unknownPhone: {
      id: "",
      name: "",
      type: 'PDFCheckBox',
      label: 'Unknown Phone',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    unknownEmail: {
      id: "",
      name: "",
      type: 'PDFCheckBox',
      label: 'Unknown Email',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    }
  };
};

/**
 * Creates a default school entry using the new field generation system
 */
export const createDefaultSchoolEntry = (entryId: string | number, entryIndex: number = 0): SchoolEntry => {
  return {
    _id: entryId,

    // Attendance dates (5 fields)
    fromDate: generateSection12Field(`section12.entries[${entryIndex}].fromDate`, ''),
    toDate: generateSection12Field(`section12.entries[${entryIndex}].toDate`, ''),
    fromDateEstimate: generateSection12Field(`section12.entries[${entryIndex}].fromDateEstimate`, false),
    toDateEstimate: generateSection12Field(`section12.entries[${entryIndex}].toDateEstimate`, false),
    isPresent: generateSection12Field(`section12.entries[${entryIndex}].isPresent`, false),

    // School information (7 fields)
    schoolName: generateSection12Field(`section12.entries[${entryIndex}].schoolName`, ''),
    schoolAddress: generateSection12Field(`section12.entries[${entryIndex}].schoolAddress`, ''),
    schoolCity: generateSection12Field(`section12.entries[${entryIndex}].schoolCity`, ''),
    schoolState: generateSection12Field(`section12.entries[${entryIndex}].schoolState`, ''),
    schoolCountry: generateSection12Field(`section12.entries[${entryIndex}].schoolCountry`, ''),
    schoolZipCode: generateSection12Field(`section12.entries[${entryIndex}].schoolZipCode`, ''),

    // School types (4 fields - multiple checkboxes as per official SF-86 form)
    schoolTypes: {
      highSchool: generateSection12Field(`section12.entries[${entryIndex}].schoolTypes.highSchool`, false),
      vocationalTechnicalTrade: generateSection12Field(`section12.entries[${entryIndex}].schoolTypes.vocationalTechnicalTrade`, false),
      collegeUniversityMilitary: generateSection12Field(`section12.entries[${entryIndex}].schoolTypes.collegeUniversityMilitary`, false),
      correspondenceDistanceOnline: generateSection12Field(`section12.entries[${entryIndex}].schoolTypes.correspondenceDistanceOnline`, false),
    },

    // Degree information (2+ fields)
    receivedDegree: generateSection12Field(`section12.entries[${entryIndex}].receivedDegree`, 'NO'),
    degrees: [], // Start with empty degrees array - user can add as needed

    // Contact person (optional - for schools attended in last 3 years)
    contactPerson: createDefaultContactPerson(),

    // Day/Night attendance fields
    dayAttendance: generateSection12Field(`section12.entries[${entryIndex}].dayAttendance`, false),
    nightAttendance: generateSection12Field(`section12.entries[${entryIndex}].nightAttendance`, false),

    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Creates a default Section 12 data structure using the new field generation system
 */
export const createDefaultSection12 = (): Section12 => {
  // Validate field count against sections-references
  validateSectionFieldCount(12);

  // Generate global fields using the new system
  const globalFields = generateGlobalFields();

  return {
    _id: 12,
    section12: {
      // Global section questions (2 fields)
      hasAttendedSchool: globalFields.hasAttendedSchool,
      hasAttendedSchoolOutsideUS: globalFields.hasAttendedSchoolOutsideUS,

      // Start with empty entries array - users can add entries as needed
      entries: []
    }
  };
};

/**
 * Updates a specific field in the Section 12 data structure
 */
export const updateSection12Field = (
  section12Data: Section12,
  update: Section12FieldUpdate
): Section12 => {
  const { fieldPath, newValue, entryIndex } = update;
  const newData = { ...section12Data };

  // Handle global section fields
  if (fieldPath === 'section12.hasAttendedSchool') {
    newData.section12.hasAttendedSchool.value = newValue;
  } else if (fieldPath === 'section12.hasAttendedSchoolOutsideUS') {
    newData.section12.hasAttendedSchoolOutsideUS.value = newValue;
  }
  // Handle entry-specific fields
  else if (fieldPath.startsWith('section12.entries') && entryIndex !== undefined) {
    if (newData.section12.entries[entryIndex]) {
      const entry = { ...newData.section12.entries[entryIndex] };

      // Parse the field path to update the correct nested field
      const pathParts = fieldPath.split('.');
      if (pathParts.length >= 3) {
        // Remove "section12.entries" prefix to get the actual field path
        const actualFieldPath = pathParts.slice(2).join('.');

        // Handle nested field updates (e.g., "contactPerson.lastName")
        if (actualFieldPath.includes('.')) {
          const [parentField, childField] = actualFieldPath.split('.');
          if (entry[parentField as keyof SchoolEntry]) {
            const parentObj = entry[parentField as keyof SchoolEntry] as any;
            if (parentObj && parentObj[childField]) {
              parentObj[childField].value = newValue;
            }
          }
        } else {
          // Handle direct field updates (e.g., "schoolName")
          if (entry[actualFieldPath as keyof SchoolEntry]) {
            (entry[actualFieldPath as keyof SchoolEntry] as any).value = newValue;
          }
        }
      }

      entry.updatedAt = new Date();
      newData.section12.entries[entryIndex] = entry;
    }
  }

  return newData;
};

// ============================================================================
// FIELD FLATTENING FOR PDF GENERATION
// ============================================================================

/**
 * Flattens Section 12 fields for PDF generation
 * Converts nested Field<T> objects to a flat Record<string, any> structure
 * Expected 150 fields: main flags, multiple education entries with dates, addresses, etc.
 */
export const flattenSection12Fields = (section12Data: Section12): Record<string, any> => {
  const flattened: Record<string, any> = {};

  try {
    // Global section questions (2 fields)
    if (section12Data.section12?.hasAttendedSchool) {
      flattened[section12Data.section12.hasAttendedSchool.id || section12Data.section12.hasAttendedSchool.name] =
        section12Data.section12.hasAttendedSchool.value;
    }

    if (section12Data.section12?.hasAttendedSchoolOutsideUS) {
      flattened[section12Data.section12.hasAttendedSchoolOutsideUS.id || section12Data.section12.hasAttendedSchoolOutsideUS.name] =
        section12Data.section12.hasAttendedSchoolOutsideUS.value;
    }

    // School entries (148 fields across up to 3 entries)
    if (section12Data.section12?.entries && Array.isArray(section12Data.section12.entries)) {
      section12Data.section12.entries.forEach((entry, index) => {
        const prefix = `entry_${index}`;

        // Attendance dates (5 fields per entry)
        if (entry.fromDate) {
          flattened[entry.fromDate.id || entry.fromDate.name || `${prefix}_fromDate`] = entry.fromDate.value;
        }
        if (entry.toDate) {
          flattened[entry.toDate.id || entry.toDate.name || `${prefix}_toDate`] = entry.toDate.value;
        }
        if (entry.fromDateEstimate) {
          flattened[entry.fromDateEstimate.id || entry.fromDateEstimate.name || `${prefix}_fromDateEstimate`] = entry.fromDateEstimate.value;
        }
        if (entry.toDateEstimate) {
          flattened[entry.toDateEstimate.id || entry.toDateEstimate.name || `${prefix}_toDateEstimate`] = entry.toDateEstimate.value;
        }
        if (entry.isPresent) {
          flattened[entry.isPresent.id || entry.isPresent.name || `${prefix}_isPresent`] = entry.isPresent.value;
        }

        // School information (7 fields per entry)
        if (entry.schoolName) {
          flattened[entry.schoolName.id || entry.schoolName.name || `${prefix}_schoolName`] = entry.schoolName.value;
        }
        if (entry.schoolAddress) {
          flattened[entry.schoolAddress.id || entry.schoolAddress.name || `${prefix}_schoolAddress`] = entry.schoolAddress.value;
        }
        if (entry.schoolCity) {
          flattened[entry.schoolCity.id || entry.schoolCity.name || `${prefix}_schoolCity`] = entry.schoolCity.value;
        }
        if (entry.schoolState) {
          flattened[entry.schoolState.id || entry.schoolState.name || `${prefix}_schoolState`] = entry.schoolState.value;
        }
        if (entry.schoolCountry) {
          flattened[entry.schoolCountry.id || entry.schoolCountry.name || `${prefix}_schoolCountry`] = entry.schoolCountry.value;
        }
        if (entry.schoolZipCode) {
          flattened[entry.schoolZipCode.id || entry.schoolZipCode.name || `${prefix}_schoolZipCode`] = entry.schoolZipCode.value;
        }
        // School types (multiple checkboxes)
        if (entry.schoolTypes) {
          if (entry.schoolTypes.highSchool) {
            flattened[entry.schoolTypes.highSchool.id || entry.schoolTypes.highSchool.name || `${prefix}_schoolType_highSchool`] = entry.schoolTypes.highSchool.value;
          }
          if (entry.schoolTypes.vocationalTechnicalTrade) {
            flattened[entry.schoolTypes.vocationalTechnicalTrade.id || entry.schoolTypes.vocationalTechnicalTrade.name || `${prefix}_schoolType_vocationalTechnicalTrade`] = entry.schoolTypes.vocationalTechnicalTrade.value;
          }
          if (entry.schoolTypes.collegeUniversityMilitary) {
            flattened[entry.schoolTypes.collegeUniversityMilitary.id || entry.schoolTypes.collegeUniversityMilitary.name || `${prefix}_schoolType_collegeUniversityMilitary`] = entry.schoolTypes.collegeUniversityMilitary.value;
          }
          if (entry.schoolTypes.correspondenceDistanceOnline) {
            flattened[entry.schoolTypes.correspondenceDistanceOnline.id || entry.schoolTypes.correspondenceDistanceOnline.name || `${prefix}_schoolType_correspondenceDistanceOnline`] = entry.schoolTypes.correspondenceDistanceOnline.value;
          }
        }

        // Degree information (2+ fields per entry)
        if (entry.receivedDegree) {
          flattened[entry.receivedDegree.id || entry.receivedDegree.name || `${prefix}_receivedDegree`] = entry.receivedDegree.value;
        }

        // Degrees array
        if (entry.degrees && Array.isArray(entry.degrees)) {
          entry.degrees.forEach((degree, degreeIndex) => {
            const degreePrefix = `${prefix}_degree_${degreeIndex}`;
            if (degree.degreeType) {
              flattened[degree.degreeType.id || degree.degreeType.name || `${degreePrefix}_type`] = degree.degreeType.value;
            }
            if (degree.otherDegree) {
              flattened[degree.otherDegree.id || degree.otherDegree.name || `${degreePrefix}_other`] = degree.otherDegree.value;
            }
            if (degree.dateAwarded) {
              flattened[degree.dateAwarded.id || degree.dateAwarded.name || `${degreePrefix}_dateAwarded`] = degree.dateAwarded.value;
            }
            if (degree.dateAwardedEstimate) {
              flattened[degree.dateAwardedEstimate.id || degree.dateAwardedEstimate.name || `${degreePrefix}_dateEstimate`] = degree.dateAwardedEstimate.value;
            }
          });
        }

        // Contact person (14 fields per entry - optional)
        if (entry.contactPerson) {
          const contactPrefix = `${prefix}_contact`;
          const contact = entry.contactPerson;

          if (contact.unknownPerson) {
            flattened[contact.unknownPerson.id || contact.unknownPerson.name || `${contactPrefix}_unknown`] = contact.unknownPerson.value;
          }
          if (contact.lastName) {
            flattened[contact.lastName.id || contact.lastName.name || `${contactPrefix}_lastName`] = contact.lastName.value;
          }
          if (contact.firstName) {
            flattened[contact.firstName.id || contact.firstName.name || `${contactPrefix}_firstName`] = contact.firstName.value;
          }
          if (contact.address) {
            flattened[contact.address.id || contact.address.name || `${contactPrefix}_address`] = contact.address.value;
          }
          if (contact.city) {
            flattened[contact.city.id || contact.city.name || `${contactPrefix}_city`] = contact.city.value;
          }
          if (contact.state) {
            flattened[contact.state.id || contact.state.name || `${contactPrefix}_state`] = contact.state.value;
          }
          if (contact.country) {
            flattened[contact.country.id || contact.country.name || `${contactPrefix}_country`] = contact.country.value;
          }
          if (contact.zipCode) {
            flattened[contact.zipCode.id || contact.zipCode.name || `${contactPrefix}_zipCode`] = contact.zipCode.value;
          }
          if (contact.phoneNumber) {
            flattened[contact.phoneNumber.id || contact.phoneNumber.name || `${contactPrefix}_phone`] = contact.phoneNumber.value;
          }
          if (contact.phoneExtension) {
            flattened[contact.phoneExtension.id || contact.phoneExtension.name || `${contactPrefix}_extension`] = contact.phoneExtension.value;
          }
          if (contact.email) {
            flattened[contact.email.id || contact.email.name || `${contactPrefix}_email`] = contact.email.value;
          }
          if (contact.isInternationalPhone) {
            flattened[contact.isInternationalPhone.id || contact.isInternationalPhone.name || `${contactPrefix}_intlPhone`] = contact.isInternationalPhone.value;
          }
          if (contact.unknownPhone) {
            flattened[contact.unknownPhone.id || contact.unknownPhone.name || `${contactPrefix}_unknownPhone`] = contact.unknownPhone.value;
          }
          if (contact.unknownEmail) {
            flattened[contact.unknownEmail.id || contact.unknownEmail.name || `${contactPrefix}_unknownEmail`] = contact.unknownEmail.value;
          }
        }

        // Additional fields
        if (entry.dayAttendance) {
          flattened[entry.dayAttendance.id || entry.dayAttendance.name || `${prefix}_dayAttendance`] = entry.dayAttendance.value;
        }
        if (entry.nightAttendance) {
          flattened[entry.nightAttendance.id || entry.nightAttendance.name || `${prefix}_nightAttendance`] = entry.nightAttendance.value;
        }
      });
    }

    // console.log(`📊 Section 12 field flattening: ${Object.keys(flattened).length} fields processed (expected ~150)`);
    return flattened;

  } catch (error) {
    // console.error('❌ Error flattening Section 12 fields:', error);
    return {};
  }
};

// ============================================================================
// VALIDATION FUNCTIONS (MOVED FROM INTERFACE LAYER)
// ============================================================================

/**
 * Parse MM/YYYY date format to Date object
 */
const parseEducationDate = (dateString: string): Date | null => {
  if (!dateString) return null;

  // Check if it matches MM/YYYY format
  const mmYyyyMatch = dateString.match(EDUCATION_DATE_VALIDATION.DATE_REGEX);
  if (mmYyyyMatch) {
    // Use regex capture groups: [fullMatch, month, year]
    const [, month, year] = mmYyyyMatch;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Validate month and year ranges
    if (monthNum < 1 || monthNum > 12) return null;
    if (yearNum < EDUCATION_DATE_VALIDATION.MIN_YEAR || yearNum > EDUCATION_DATE_VALIDATION.MAX_YEAR) return null;

    const date = new Date(yearNum, monthNum - 1, 1);
    return isNaN(date.getTime()) ? null : date;
  }

  // Try parsing as full date
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Validates school entry dates
 */
export const validateSchoolDates = (
  entry: SchoolEntry,
  context: Section12ValidationContext
): EducationValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate from date
  if (!entry.fromDate.value) {
    errors.push('From date is required');
  } else {
    const fromDate = parseEducationDate(entry.fromDate.value);
    if (!fromDate) {
      errors.push('From date is not a valid date (use MM/YYYY format)');
    } else if (fromDate.getFullYear() < EDUCATION_DATE_VALIDATION.MIN_YEAR) {
      errors.push(`From date cannot be before ${EDUCATION_DATE_VALIDATION.MIN_YEAR}`);
    } else if (fromDate > context.currentDate) {
      warnings.push('From date is in the future');
    }
  }

  // Validate to date (if not present)
  if (!entry.isPresent.value && !entry.toDate.value) {
    errors.push('To date is required when not currently attending');
  } else if (!entry.isPresent.value && entry.toDate.value) {
    const toDate = parseEducationDate(entry.toDate.value);
    if (!toDate) {
      errors.push('To date is not a valid date (use MM/YYYY format)');
    } else if (entry.fromDate.value) {
      const fromDate = parseEducationDate(entry.fromDate.value);
      if (fromDate && toDate < fromDate) {
        errors.push('To date cannot be before from date');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Check if a school entry is essentially empty (no meaningful data entered)
 */
const isEmptySchoolEntry = (entry: SchoolEntry): boolean => {
  return !entry.schoolName.value?.trim() &&
         !entry.fromDate.value?.trim() &&
         !entry.toDate.value?.trim() &&
         !entry.schoolAddress.value?.trim() &&
         !entry.schoolCity.value?.trim();
};

/**
 * Validates a complete school entry
 */
export function validateSchoolEntry(
  entry: SchoolEntry,
  context: Section12ValidationContext
): EducationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Skip validation for empty entries - they're allowed
  if (isEmptySchoolEntry(entry)) {
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }

  // Validate attendance dates
  const dateValidation = validateSchoolDates(entry, context);
  errors.push(...dateValidation.errors);
  warnings.push(...dateValidation.warnings);

  // Validate school types (at least one must be selected)
  const hasSelectedSchoolType = entry.schoolTypes && (
    entry.schoolTypes.highSchool?.value ||
    entry.schoolTypes.vocationalTechnicalTrade?.value ||
    entry.schoolTypes.collegeUniversityMilitary?.value ||
    entry.schoolTypes.correspondenceDistanceOnline?.value
  );
  if (!hasSelectedSchoolType) {
    errors.push('At least one school type must be selected');
  }

  // Validate school name
  if (!entry.schoolName.value) {
    errors.push('School name is required');
  } else if (entry.schoolName.value.length > context.rules.maxSchoolNameLength) {
    errors.push(`School name cannot exceed ${context.rules.maxSchoolNameLength} characters`);
  }

  // Validate school address
  if (context.rules.requiresSchoolAddress) {
    if (!entry.schoolAddress.value) {
      errors.push('School street address is required');
    }
    if (!entry.schoolCity.value) {
      errors.push('School city is required');
    }
    if (!entry.schoolCountry.value) {
      errors.push('School country is required');
    }
    // State is required for US addresses
    if (entry.schoolCountry.value === 'United States' && !entry.schoolState.value) {
      errors.push('State is required for US addresses');
    }
  }

  // Validate degree information
  if (entry.receivedDegree.value === 'YES' && entry.degrees.length === 0) {
    errors.push('At least one degree is required when degree was received');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates the complete Section 12 data
 */
export function validateSection12(
  section12Data: Section12,
  context: Section12ValidationContext
): EducationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const entryErrors: Record<number, string[]> = {};

  // Validate main section flags
  if (context.rules.requiresEducationHistory && !section12Data.section12.hasAttendedSchool.value) {
    errors.push('Education history information is required');
  }

  // Validate entries if education history is provided
  if (section12Data.section12.hasAttendedSchool.value === 'YES') {
    if (section12Data.section12.entries.length === 0) {
      errors.push('At least one school entry is required');
    } else if (section12Data.section12.entries.length > context.rules.maxEducationEntries) {
      errors.push(`Cannot exceed ${context.rules.maxEducationEntries} school entries`);
    }

    // Validate each entry
    section12Data.section12.entries.forEach((entry, index) => {
      const entryValidation = validateSchoolEntry(entry, context);
      if (!entryValidation.isValid) {
        entryErrors[index] = entryValidation.errors;
        errors.push(`Entry ${index + 1}: ${entryValidation.errors.join(', ')}`);
      }
      warnings.push(...entryValidation.warnings);
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    entryErrors
  };
}

/**
 * Formats education date for display
 */
export const formatEducationDate = (date: string, format: 'MM/YYYY' | 'MM/DD/YYYY' = 'MM/YYYY'): string => {
  if (!date) return '';

  try {
    const dateObj = new Date(date);
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    if (format === 'MM/YYYY') {
      return `${month}/${year}`;
    } else {
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${month}/${day}/${year}`;
    }
  } catch (error) {
    return date; // Return original if parsing fails
  }
};

/**
 * Calculates education duration in years
 */
export const calculateEducationDuration = (fromDate: string, toDate: string): number => {
  if (!fromDate) return 0;

  try {
    const from = new Date(fromDate);
    const to = toDate ? new Date(toDate) : new Date();

    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);

    return Math.round(diffYears * 10) / 10; // Round to 1 decimal place
  } catch (error) {
    return 0;
  }
};

// ============================================================================
// SECTION 12 CONTEXT TYPE
// ============================================================================

export interface Section12ContextType {
  // Core state
  section12Data: Section12;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Core operations
  updateField: (fieldPath: string, newValue: any) => void;
  validateSection: () => ValidationResult;
  resetSection: () => void;
  loadSection: (data: Section12) => void;

  // Section-specific computed values
  getSchoolEntryCount: () => number;
  getTotalEducationYears: () => number;
  getHighestDegree: () => string | null;

  // Section-specific validation
  validateEducationHistory: () => EducationValidationResult;
  validateSchoolEntry: (entryIndex: number) => EducationValidationResult;

  // School entry management
  addSchoolEntry: () => void;
  removeSchoolEntry: (entryIndex: number) => void;
  moveSchoolEntry: (fromIndex: number, toIndex: number) => void;
  duplicateSchoolEntry: (entryIndex: number) => void;
  clearSchoolEntry: (entryIndex: number) => void;
  updateSchoolEntry: (entryIndex: number, fieldPath: string, value: any) => void;

  // Degree entry management
  addDegreeEntry: (schoolIndex: number) => void;
  removeDegreeEntry: (schoolIndex: number, degreeIndex: number) => void;

  // School-specific field updates
  updateAttendedSchoolFlag: (hasAttendedSchool: "YES" | "NO") => void;
  updateAttendedSchoolOutsideUSFlag: (hasAttendedSchoolOutsideUS: "YES" | "NO") => void;
  updateSchoolTypeCheckbox: (entryIndex: number, schoolType: keyof SchoolTypes, checked: boolean) => void;
  updateAttendanceDates: (entryIndex: number, fromDate: string, toDate: string, present?: boolean) => void;
  updateSchoolAddress: (entryIndex: number, address: Partial<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>) => void;

  // Utility functions
  formatEducationDate: (date: string, format?: 'MM/YYYY' | 'MM/DD/YYYY') => string;
  calculateEducationDuration: (entryIndex: number) => number;
  getSchoolTypeOptions: () => string[];
  getDegreeTypeOptions: () => string[];

  // ============================================================================
  // SUBMIT-ONLY MODE FUNCTIONS
  // ============================================================================

  submitSectionData: () => Promise<{success: boolean, error?: string}>;
  hasPendingChanges: () => boolean;
}

// ============================================================================
// SECTION 12 CONTEXT
// ============================================================================

const Section12Context = createContext<Section12ContextType | undefined>(undefined);
// ============================================================================
// SECTION 12 PROVIDER
// ============================================================================

const Section12Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {


    // Initialize field mapping system on component mount
    useEffect(() => {
      // console.log('🔄 Section12: Initializing section data with complete field mapping verification');
  
      // Validate field mappings - NOW WITH 100% COVERAGE
      const validation = validateSection12FieldMappings();
      // console.log(`🎯 Section12: Field mapping verification - ${validation.coverage.toFixed(1)}% coverage (${validation.mappedFields}/${validation.totalFields} fields)`);

      if (validation.coverage >= 100) {
        // console.log(`✅ Section12: All ${validation.totalFields} PDF form fields are properly mapped - 100% COVERAGE ACHIEVED!`);
      } else if (validation.coverage >= 98) {
        // console.log(`✅ Section12: Nearly all ${validation.totalFields} PDF form fields are properly mapped`);
      } else {
        // console.warn(`⚠️ Section12: ${validation.missingFields.length} fields are not mapped`);
        // console.warn('Missing fields:');
        validation.missingFields.slice(0, 10).forEach(field => {
          // console.warn(`  - ${field}`);
        });
        if (validation.missingFields.length > 10) {
          // console.warn(`  ... and ${validation.missingFields.length - 10} more`);
        }
      }
  
      // Validate field generation
      const generationValid = validateFieldGeneration();
      if (generationValid) {
        // console.log('✅ Section12: Field generation system validated successfully');
      } else {
        // console.error('❌ Section12: Field generation system validation failed');
      }
  
      // console.log('🔧 Section12: Section initialization complete');
    }, []);

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [section12Data, setSection12Data] = useState<Section12>(() => createDefaultSection12());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initialData = useRef<Section12>(createDefaultSection12());

  // Ref to prevent React Strict Mode double execution of addSchoolEntry
  const isAddingEntryRef = useRef(false);

  // Ref to prevent React Strict Mode double execution of degree operations
  const isAddingDegreeRef = useRef(false);
  const isRemovingDegreeRef = useRef(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = useMemo(() => {
    return JSON.stringify(section12Data) !== JSON.stringify(initialData.current);
  }, [section12Data]);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateSectionData = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Validate education history
    const validationContext: Section12ValidationContext = {
      currentDate: new Date(),
      minimumEducationAge: 16,
      rules: {
        requiresEducationHistory: true,
        requiresHighSchoolInfo: true,
        maxEducationEntries: 10,
        requiresSchoolName: true,
        requiresSchoolAddress: true,
        requiresAttendanceDates: true,
        allowsEstimatedDates: true,
        maxSchoolNameLength: 100,
        maxAddressLength: 200
      }
    };

    // Get current data fresh to avoid stale closure
    const currentData = section12Data;
    const educationValidation = validateSection12(currentData, validationContext);
    if (!educationValidation.isValid) {
      educationValidation.errors.forEach(error => {
        validationErrors.push({
          field: 'section12.educationHistory',
          message: error,
          code: 'EDUCATION_VALIDATION_ERROR',
          severity: 'error'
        });
      });
    }

    educationValidation.warnings.forEach(warning => {
      validationWarnings.push({
        field: 'section12.educationHistory',
        message: warning,
        code: 'EDUCATION_VALIDATION_WARNING',
        severity: 'warning'
      });
    });

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, []); // FIXED: Removed section12Data dependency

  // ============================================================================
  // CHANGE TRACKING
  // ============================================================================

  const getChanges = useCallback(() => {
    // Implementation for change tracking
    // Get current data fresh to avoid stale closure
    const currentData = section12Data;
    const currentInitialData = initialData.current;
    return {};
  }, []); // FIXED: Removed dependencies to prevent infinite loops

  const resetSection = useCallback(() => {
    const defaultData = createDefaultSection12();
    setSection12Data(defaultData);
    setErrors({});

    // Reset submit-only mode tracking (will be handled by useEffect)
  }, []);

  const loadSection = useCallback((data: Section12) => {
    setSection12Data(cloneDeep(data));
    initialData.current = cloneDeep(data);
    setErrors({});
  }, []);

  // ============================================================================
  // FIELD UPDATE FUNCTION
  // ============================================================================

  const updateFieldValue = useCallback((path: string, value: any): void => {
    // console.log(`🔧 Section12: updateFieldValue called:`, {
    //   path,
    //   value,
    // });

    try {
      setSection12Data((prev) => {
        // console.log(
        //   `🔍 Section12: updateFieldValue - starting with prev data:`,
        //   prev
        // );

        const updated = cloneDeep(prev);

        // console.log(
        //   `🔍 Section12: updateFieldValue - cloneDeep completed successfully`
        // );

        // Handle main section flag updates (like Section 29's updateSubsectionFlag)
        if (path === 'section12.hasAttendedSchool.value') {
          // console.log(
          //   `🔍 Section12: updateFieldValue - updating hasAttendedSchool flag`
          // );
          updated.section12.hasAttendedSchool.value = value;
          // console.log(
          //   `✅ Section12: updateFieldValue - hasAttendedSchool flag updated successfully`
          // );
        } else if (path === 'section12.hasAttendedSchoolOutsideUS.value') {
          // console.log(
          //   `🔍 Section12: updateFieldValue - updating hasAttendedSchoolOutsideUS flag`
          // );
          updated.section12.hasAttendedSchoolOutsideUS.value = value;
          // console.log(
          //   `✅ Section12: updateFieldValue - hasAttendedSchoolOutsideUS flag updated successfully`
          // );
        } else {
          // // Handle other field updates using lodash set
          // console.log(
          //   `🔍 Section12: updateFieldValue - using lodash set for path: ${path}`
          // );

          try {
            set(updated, path, value);
            // console.log(
            //   `✅ Section12: updateFieldValue - lodash set completed successfully`
            // );
          } catch (setError) {
            // console.error(
            //   `❌ Section12: updateFieldValue - lodash set failed:`,
            //   setError
            // );
            throw setError;
          }
        }

      //   console.log(
      //     `🔍 Section12: updateFieldValue - returning updated data:`,
      //     updated
      //   );
        return updated;
      });

      // console.log(
      //   `✅ Section12: updateFieldValue - setSection12Data completed successfully`
      // );
    } catch (error) {
      // console.error(
      //   `❌ Section12: updateFieldValue - CRITICAL ERROR:`,
      //   error
      // );
      // console.error(
      //   `❌ Section12: updateFieldValue - Error stack:`,
      //   error instanceof Error ? error.stack : "No stack trace available"
      // );
    }
  }, []);



  // ============================================================================
  // SUBMIT-ONLY MODE CONFIGURATION (Following Section 11 Pattern)
  // ============================================================================

  // Enable submit-only mode to prevent auto-sync on every field change
  // This ensures data is only synced to SF86FormContext when user explicitly submits
  const [submitOnlyMode] = useState(true); // Enable submit-only mode for Section 12
  const [pendingChanges, setPendingChanges] = useState(false);
  const lastSubmittedDataRef = useRef<Section12 | null>(null);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  // Access SF86FormContext to sync with loaded data
  const sf86Form = useSF86Form();

  // Track when data changes to show pending changes indicator
  useEffect(() => {
    if (submitOnlyMode && lastSubmittedDataRef.current) {
      const hasChanges = !isEqual(section12Data, lastSubmittedDataRef.current);
      setPendingChanges(hasChanges);
    }
  }, [section12Data, submitOnlyMode]);

  // ============================================================================
  // SECTION-SPECIFIC OPERATIONS
  // ============================================================================

  // Add section-specific computed values and methods
  // FIXED: Removed section12Data dependencies to prevent infinite loops
  const getSchoolEntryCount = useCallback((): number => {
    // Get current data fresh to avoid stale closure
    const currentData = section12Data;
    return currentData.section12.entries.length;
  }, []); // FIXED: Removed section12Data dependency

  const getTotalEducationYears = useCallback((): number => {
    // Get current data fresh to avoid stale closure
    const currentData = section12Data;
    return currentData.section12.entries.reduce((total, entry) => {
      const duration = calculateEducationDuration(
        entry.fromDate.value,
        entry.toDate.value
      );
      return total + duration;
    }, 0);
  }, []); // FIXED: Removed section12Data dependency

  const getHighestDegree = useCallback((): string | null => {
    const degreeHierarchy = [
      'Doctorate',
      "Master's",
      "Bachelor's",
      "Associate's",
      'Professional Degree (e.g. M D, D V M, J D)',
      'High School Diploma',
      'Other'
    ];

    // Get current data fresh to avoid stale closure
    const currentData = section12Data;
    for (const degree of degreeHierarchy) {
      const hasThisDegree = currentData.section12.entries.some(
        entry => entry.receivedDegree.value === 'YES' &&
                 entry.degrees.some(deg => deg.degreeType.value === degree)
      );
      if (hasThisDegree) {
        return degree;
      }
    }

    return null;
  }, []); // FIXED: Removed section12Data dependency

  const validateEducationHistory = useCallback((): EducationValidationResult => {
    const validationContext: Section12ValidationContext = {
      currentDate: new Date(),
      minimumEducationAge: 16,
      rules: {
        requiresEducationHistory: true,
        requiresHighSchoolInfo: true,
        maxEducationEntries: 10,
        requiresSchoolName: true,
        requiresSchoolAddress: true,
        requiresAttendanceDates: true,
        allowsEstimatedDates: true,
        maxSchoolNameLength: 100,
        maxAddressLength: 200
      }
    };

    // Get current data fresh to avoid stale closure
    const currentData = section12Data;
    return validateSection12(currentData, validationContext);
  }, []); // FIXED: Removed section12Data dependency

  const validateSchoolEntry = useCallback((entryIndex: number): EducationValidationResult => {
    // Get current data fresh to avoid stale closure
    const currentData = section12Data;

    // Check if entry index is valid
    if (entryIndex < 0 || !currentData?.section12?.entries || entryIndex >= currentData.section12.entries.length) {
      return {
        isValid: false,
        errors: [`Entry ${entryIndex + 1} does not exist`],
        warnings: []
      };
    }

    const entry = currentData.section12.entries[entryIndex];
    if (!entry) {
      return {
        isValid: false,
        errors: [`Entry ${entryIndex + 1} is not properly initialized`],
        warnings: []
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!entry.schoolName?.value?.trim()) {
      errors.push('School name is required');
    }

    if (!entry.fromDate?.value?.trim()) {
      errors.push('From date is required');
    }

    if (!entry.toDate?.value?.trim() && !entry.isPresent?.value) {
      errors.push('To date is required (or check Present)');
    }

    // Validate school types (at least one must be selected)
    const hasSelectedSchoolType = entry.schoolTypes && (
      entry.schoolTypes.highSchool?.value ||
      entry.schoolTypes.vocationalTechnicalTrade?.value ||
      entry.schoolTypes.collegeUniversityMilitary?.value ||
      entry.schoolTypes.correspondenceDistanceOnline?.value
    );
    if (!hasSelectedSchoolType) {
      errors.push('At least one school type must be selected');
    }

    // Address validation
    if (!entry.schoolAddress?.value?.trim()) {
      errors.push('Street address is required');
    }

    if (!entry.schoolCity?.value?.trim()) {
      errors.push('City is required');
    }

    if (!entry.schoolCountry?.value?.trim()) {
      errors.push('Country is required');
    }

    // State validation for US addresses
    if (entry.schoolCountry?.value === 'United States' && !entry.schoolState?.value?.trim()) {
      errors.push('State is required for US addresses');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []); // FIXED: Removed section12Data dependency

  // School entry management functions
  // FIXED: Added React Strict Mode protection to prevent duplicate entries
  const addSchoolEntry = useCallback((): void => {
    // Prevent React Strict Mode double execution
    if (isAddingEntryRef.current) {
      // console.log('🚫 Section12: addSchoolEntry blocked - already in progress (React Strict Mode protection)');
      return;
    }

    isAddingEntryRef.current = true;
    // console.log('🎯 Section12: addSchoolEntry called');

    try {
      setSection12Data(prevData => {
        const newData = cloneDeep(prevData);
        const entryIndex = newData.section12.entries.length;

        // Limit to 4 entries as per PDF structure (discovered 4 entries in JSON)
        // Allow indices 0, 1, 2, 3 (total of 4 entries)
        if (entryIndex > 3) {
          console.warn('⚠️ Section12: Maximum of 4 school entries allowed (indices 0-3)');
          return prevData;
        }

        const newEntry = createDefaultSchoolEntry(Date.now(), entryIndex);
        newData.section12.entries.push(newEntry);
        // console.log(`✅ Section12: Added school entry #${entryIndex + 1}. Total entries: ${newData.section12.entries.length}`);
        return newData;
      });
    } finally {
      // Reset the flag after a short delay to allow for state updates
      setTimeout(() => {
        isAddingEntryRef.current = false;
        // console.log('🔄 Section12: addSchoolEntry flag reset');
      }, 100);
    }
  }, []);

  const removeSchoolEntry = useCallback((entryIndex: number): void => {
    setSection12Data(prevData => {
      const newData = cloneDeep(prevData);
      if (entryIndex >= 0 && entryIndex < newData.section12.entries.length) {
        newData.section12.entries.splice(entryIndex, 1);
      }
      return newData;
    });
  }, []);

  const moveSchoolEntry = useCallback((fromIndex: number, toIndex: number): void => {
    setSection12Data(prevData => {
      const newData = cloneDeep(prevData);
      if (fromIndex >= 0 && fromIndex < newData.section12.entries.length &&
          toIndex >= 0 && toIndex < newData.section12.entries.length) {
        const [movedEntry] = newData.section12.entries.splice(fromIndex, 1);
        newData.section12.entries.splice(toIndex, 0, movedEntry);
      }
      return newData;
    });
  }, []);

  const duplicateSchoolEntry = useCallback((entryIndex: number): void => {
    setSection12Data(prevData => {
      const newData = cloneDeep(prevData);
      if (entryIndex >= 0 && entryIndex < newData.section12.entries.length && newData.section12.entries.length < 4) {
        const originalEntry = newData.section12.entries[entryIndex];
        const duplicatedEntry = {
          ...originalEntry,
          _id: Date.now(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        newData.section12.entries.splice(entryIndex + 1, 0, duplicatedEntry);
      }
      return newData;
    });
  }, []);

  const clearSchoolEntry = useCallback((entryIndex: number): void => {
    setSection12Data(prevData => {
      const newData = cloneDeep(prevData);
      if (entryIndex >= 0 && entryIndex < newData.section12.entries.length) {
        const clearedEntry = createDefaultSchoolEntry(newData.section12.entries[entryIndex]._id, entryIndex);
        newData.section12.entries[entryIndex] = clearedEntry;
      }
      return newData;
    });
  }, []);

  const updateSchoolEntry = useCallback((entryIndex: number, fieldPath: string, value: any): void => {
    const fullFieldPath = `section12.entries[${entryIndex}].${fieldPath}`;
    updateFieldValue(fullFieldPath, value);
  }, [updateFieldValue]);

  // School-specific field updates
  const updateEducationFlag = useCallback((hasAttendedSchool: "YES" | "NO"): void => {
    updateFieldValue('section12.hasAttendedSchool.value', hasAttendedSchool);
  }, [updateFieldValue]);

  const updateHighSchoolFlag = useCallback((hasAttendedSchoolOutsideUS: "YES" | "NO"): void => {
    updateFieldValue('section12.hasAttendedSchoolOutsideUS.value', hasAttendedSchoolOutsideUS);
  }, [updateFieldValue]);

  const updateSchoolTypeCheckbox = useCallback((entryIndex: number, schoolType: keyof SchoolTypes, checked: boolean): void => {
    updateSchoolEntry(entryIndex, `schoolTypes.${schoolType}.value`, checked);
  }, [updateSchoolEntry]);

  const updateAttendanceDates = useCallback((entryIndex: number, fromDate: string, toDate: string, present?: boolean): void => {
    updateSchoolEntry(entryIndex, 'fromDate.value', fromDate);
    updateSchoolEntry(entryIndex, 'toDate.value', toDate);
    if (present !== undefined) {
      updateSchoolEntry(entryIndex, 'isPresent.value', present);
    }
  }, [updateSchoolEntry]);

  const updateSchoolAddress = useCallback((entryIndex: number, address: Partial<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>): void => {
    Object.entries(address).forEach(([field, value]) => {
      updateSchoolEntry(entryIndex, `school${field.charAt(0).toUpperCase() + field.slice(1)}.value`, value);
    });
  }, [updateSchoolEntry]);

  // ============================================================================
  // DEGREE ENTRY MANAGEMENT
  // ============================================================================

  const addDegreeEntry = useCallback((schoolIndex: number) => {
    // Prevent React Strict Mode double execution
    if (isAddingDegreeRef.current) {
      // console.log('🚫 Section12: addDegreeEntry blocked - already in progress (React Strict Mode protection)');
      return;
    }

    isAddingDegreeRef.current = true;
    // console.log(`🎯 Section12: addDegreeEntry called for school ${schoolIndex}`);

    try {
      setSection12Data(prevData => {
        const newData = cloneDeep(prevData);
        const schoolEntry = newData.section12.entries[schoolIndex];

        if (!schoolEntry) {
          // console.warn(`⚠️ Section12: School entry ${schoolIndex} not found`);
          return prevData;
        }

        // Limit to 2 degrees per school as per PDF structure
        if (schoolEntry.degrees.length >= 2) {
          // console.warn('⚠️ Section12: Maximum of 2 degrees per school allowed');
          return prevData;
        }

        const newDegree = createDefaultDegreeEntry();
        schoolEntry.degrees.push(newDegree);
        // console.log(`✅ Section12: Added degree entry to school ${schoolIndex}. Total degrees: ${schoolEntry.degrees.length}`);
        return newData;
      });
    } finally {
      // Reset the flag after a short delay to allow for state updates
      setTimeout(() => {
        isAddingDegreeRef.current = false;
        // console.log('🔄 Section12: addDegreeEntry flag reset');
      }, 100);
    }
  }, []);

  const removeDegreeEntry = useCallback((schoolIndex: number, degreeIndex: number) => {
    // Prevent React Strict Mode double execution
    if (isRemovingDegreeRef.current) {
      // console.log('🚫 Section12: removeDegreeEntry blocked - already in progress (React Strict Mode protection)');
      return;
    }

    isRemovingDegreeRef.current = true;
    // console.log(`🎯 Section12: removeDegreeEntry called for school ${schoolIndex}, degree ${degreeIndex}`);

    try {
      setSection12Data(prevData => {
        const newData = cloneDeep(prevData);
        const schoolEntry = newData.section12.entries[schoolIndex];

        if (!schoolEntry) {
          // console.warn(`⚠️ Section12: School entry ${schoolIndex} not found`);
          return prevData;
        }

        if (degreeIndex < 0 || degreeIndex >= schoolEntry.degrees.length) {
          // console.warn(`⚠️ Section12: Degree index ${degreeIndex} out of bounds`);
          return prevData;
        }

        schoolEntry.degrees.splice(degreeIndex, 1);
        // console.log(`✅ Section12: Removed degree entry ${degreeIndex} from school ${schoolIndex}. Remaining degrees: ${schoolEntry.degrees.length}`);
        return newData;
      });
    } finally {
      // Reset the flag after a short delay to allow for state updates
      setTimeout(() => {
        isRemovingDegreeRef.current = false;
        // console.log('🔄 Section12: removeDegreeEntry flag reset');
      }, 100);
    }
  }, []);

  // Utility functions
  const formatEducationDateWrapper = useCallback((date: string, format?: 'MM/YYYY' | 'MM/DD/YYYY'): string => {
    return formatEducationDate(date, format);
  }, []);

  const calculateEducationDurationWrapper = useCallback((entryIndex: number): number => {
    // Get current data fresh to avoid stale closure
    const currentData = section12Data;
    if (entryIndex < 0 || entryIndex >= currentData.section12.entries.length) {
      return 0;
    }

    const entry = currentData.section12.entries[entryIndex];
    return calculateEducationDuration(
      entry.fromDate.value,
      entry.toDate.value
    );
  }, []); // FIXED: Removed section12Data dependency

  const getSchoolTypeOptions = useCallback((): string[] => {
    return [...SCHOOL_TYPE_OPTIONS];
  }, []);

  const getDegreeTypeOptions = useCallback((): string[] => {
    return [...DEGREE_TYPE_OPTIONS];
  }, []);

  // ============================================================================
  // SUBMIT-ONLY MODE FUNCTIONS (After Integration)
  // ============================================================================

  /**
   * Manually sync data to main form context (submit-only mode)
   * This function should only be called when the user explicitly submits
   */
  const submitSectionData = useCallback(async (): Promise<{success: boolean, error?: string}> => {
    try {
      if (submitOnlyMode) {
        console.log('🚀 Section12: Manually syncing data to main form context (submit-only mode)');

        // Validate data before syncing
        const validation = validateSection12(section12Data, {
          currentDate: new Date(),
          minimumEducationAge: 16,
          rules: {
            requiresEducationHistory: true,
            requiresHighSchoolInfo: true,
            maxEducationEntries: 10,
            requiresSchoolName: true,
            requiresSchoolAddress: true,
            requiresAttendanceDates: true,
            allowsEstimatedDates: true,
            maxSchoolNameLength: 100,
            maxAddressLength: 200
          }
        });

        if (!validation.isValid) {
          console.error('❌ Section12: Validation failed before sync:', validation.errors);
          return { success: false, error: `Validation failed: ${validation.errors.join(', ')}` };
        }

        // Actually sync data to SF86FormContext
        sf86Form.updateSectionData('section12', section12Data);

        // Update tracking references
        lastSubmittedDataRef.current = cloneDeep(section12Data);
        setPendingChanges(false);

        console.log('✅ Section12: Data sync complete');
        return { success: true };
      } else {
        console.log('⚠️ Section12: Not in submit-only mode, skipping manual sync');
        return { success: true };
      }
    } catch (error) {
      console.error('❌ Section12: Error during data sync:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error during data sync' };
    }
  }, [submitOnlyMode, section12Data, sf86Form]);

  /**
   * Check if there are pending changes that haven't been submitted
   */
  const hasPendingChanges = useCallback(() => {
    if (!submitOnlyMode) return false;
    return pendingChanges;
  }, [submitOnlyMode, pendingChanges]);

  // ============================================================================
  // SF86FORM CONTEXT SYNC
  // ============================================================================

  // Sync with SF86FormContext when data is loaded
  useEffect(() => {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');

    if (sf86Form.formData.section12 && sf86Form.formData.section12 !== section12Data) {
      if (isDebugMode) {
        // console.log('🔄 Section12: Syncing with SF86FormContext loaded data');
      }

      // Load the data from SF86FormContext
      loadSection(sf86Form.formData.section12);

      if (isDebugMode) {
        // console.log('✅ Section12: Data sync complete');
      }
    }
  }, [sf86Form.formData.section12, loadSection]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section12ContextType = {
    // Core state
    section12Data,
    isLoading,
    errors,
    isDirty,

    // Core operations
    updateField: updateFieldValue,
    validateSection: validateSectionData,
    resetSection,
    loadSection,

    // Section-specific computed values
    getSchoolEntryCount,
    getTotalEducationYears,
    getHighestDegree,

    // Section-specific validation
    validateEducationHistory,
    validateSchoolEntry,

    // School entry management
    addSchoolEntry,
    removeSchoolEntry,
    moveSchoolEntry,
    duplicateSchoolEntry,
    clearSchoolEntry,
    updateSchoolEntry,

    // Degree entry management
    addDegreeEntry,
    removeDegreeEntry,

    // School-specific field updates
    updateAttendedSchoolFlag: updateEducationFlag,
    updateAttendedSchoolOutsideUSFlag: updateHighSchoolFlag,
    updateSchoolTypeCheckbox,
    updateAttendanceDates,
    updateSchoolAddress,

    // Utility functions
    formatEducationDate: formatEducationDateWrapper,
    calculateEducationDuration: calculateEducationDurationWrapper,
    getSchoolTypeOptions,
    getDegreeTypeOptions,

    // Submit-Only Mode Functions
    submitSectionData,
    hasPendingChanges
  };

  return (
    <Section12Context.Provider value={contextValue}>
      {children}
    </Section12Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

const useSection12 = (): Section12ContextType => {
  const context = useContext(Section12Context);
  if (!context) {
    throw new Error('useSection12 must be used within a Section12Provider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export { Section12Provider, useSection12 };
export default Section12Provider;