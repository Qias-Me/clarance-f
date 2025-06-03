/**
 * Section 19: Foreign Activities - Context Provider
 *
 * React context provider for SF-86 Section 19 using the new Form Architecture 2.0.
 * This provider manages foreign contacts and activities data with full CRUD operations,
 * validation, and integration with the central SF86FormContext.
 *
 * Structure: Section → Subsection → Entry → Fields
 * - 1 main subsection: Foreign Contacts (foreignContacts)
 * - Each entry contains detailed foreign national information
 * - Fields represent individual form fields with typed values
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo
} from 'react';
import { cloneDeep, set, get } from 'lodash';
import type {
  Section19,
  Section19SubsectionKey,
  Section19FieldUpdate,
  Section19ValidationRules,
  Section19ValidationContext,
  ForeignContactEntryUpdate,
  CreateForeignContactEntryParams
} from '../../../../api/interfaces/sections2.0/section19';

import { useSection86FormIntegration } from '../shared/section-context-integration';
import type { 
  ValidationResult, 
  ValidationError, 
  ChangeSet,
  BaseSectionContext 
} from '../shared/base-interfaces';
import type { Field } from '../../../../api/interfaces/formDefinition2.0';

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

export interface Section19ContextType extends BaseSectionContext {
  // State
  section19Data: Section19;
  sectionData: Section19; // Required by BaseSectionContext
  isLoading: boolean;
  errors: ValidationError[];
  isDirty: boolean;

  // Section identification (required by BaseSectionContext)
  sectionId: string;
  sectionName: string;

  // Basic Actions
  updateFieldValue: (path: string, value: any) => void;
  updateForeignContactField: (entryIndex: number, fieldPath: string, value: any) => void;
  updateSubsectionFlag: (key: Section19SubsectionKey, value: "YES" | "NO (If NO, proceed to Section 20A)") => void;

  // Entry Management - Override base interface with proper types
  getEntryCount: (subsectionKey: string) => number;
  addEntry: (subsectionKey: string, entryType?: string) => void;
  removeEntry: (subsectionKey: string, index: number) => void;
  moveEntry: (subsectionKey: string, fromIndex: number, toIndex: number) => void;
  duplicateEntry: (subsectionKey: string, index: number) => void;
  clearEntry: (subsectionKey: string, index: number) => void;

  // Validation
  validateSection: () => ValidationResult;
  validateEntry: (subsectionKey: Section19SubsectionKey, entryIndex: number) => ValidationResult;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section19) => void;
  getChanges: () => ChangeSet;
  exportSection: () => Section19;

  // Bulk Operations
  bulkUpdateFields: (updates: Section19FieldUpdate[]) => void;
  bulkUpdateEntries: (subsectionKey: Section19SubsectionKey, updates: ForeignContactEntryUpdate[]) => void;
}

// ============================================================================
// FIELD CREATION HELPERS
// ============================================================================

const createField = function<T>(id: string, value: T, fieldType: string = "text", label: string = ""): Field<T> {
  return {
    id,
    name: `form1[0].Section19_1[0].${id}`,
    type: fieldType,
    label,
    value,
    rect: { x: 0, y: 0, width: 0, height: 0 }
  };
};

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

const createInitialSection19State = (): Section19 => {
  return {
    _id: 19,
    section19: {
      foreignContacts: {
        hasContact: createField("RadioButtonList[0]", "NO" as "YES" | "NO (If NO, proceed to Section 20A)", "radio", "Foreign Contacts"),
        entries: []
      }
    }
  };
};

const createDefaultForeignContactEntry = (entryIndex: number) => {
  const entryId = Date.now() + entryIndex;
  
  return {
    _id: entryId,
    personalInfo: {
      name: {
        first: createField(`entry_${entryIndex}_name_first`, "", "text", "First Name"),
        middle: createField(`entry_${entryIndex}_name_middle`, "", "text", "Middle Name"),
        last: createField(`entry_${entryIndex}_name_last`, "", "text", "Last Name"),
        suffix: createField(`entry_${entryIndex}_name_suffix`, "", "text", "Suffix"),
        unknown: createField(`entry_${entryIndex}_name_unknown`, false, "checkbox", "Unknown Name")
      },
      dateOfBirth: {
        date: createField(`entry_${entryIndex}_dob_date`, "", "date", "Date of Birth"),
        estimated: createField(`entry_${entryIndex}_dob_estimated`, false, "checkbox", "Estimated"),
        unknown: createField(`entry_${entryIndex}_dob_unknown`, false, "checkbox", "Unknown DOB")
      },
      placeOfBirth: {
        city: createField(`entry_${entryIndex}_pob_city`, "", "text", "City of Birth"),
        country: createField(`entry_${entryIndex}_pob_country`, "", "select", "Country of Birth"),
        unknown: createField(`entry_${entryIndex}_pob_unknown`, false, "checkbox", "Unknown Place of Birth")
      },
      address: {
        street: createField(`entry_${entryIndex}_address_street`, "", "text", "Street Address"),
        city: createField(`entry_${entryIndex}_address_city`, "", "text", "City"),
        state: createField(`entry_${entryIndex}_address_state`, "", "text", "State"),
        zipCode: createField(`entry_${entryIndex}_address_zip`, "", "text", "ZIP Code"),
        country: createField(`entry_${entryIndex}_address_country`, "", "select", "Country")
      }
    },
    citizenship: {
      country1: createField(`entry_${entryIndex}_citizenship_country1`, "", "select", "Primary Citizenship"),
      country2: createField(`entry_${entryIndex}_citizenship_country2`, "", "select", "Secondary Citizenship"),
      additionalCountries: createField(`entry_${entryIndex}_citizenship_additional`, "", "text", "Additional Countries"),
      unknown: createField(`entry_${entryIndex}_citizenship_unknown`, false, "checkbox", "Unknown Citizenship")
    },
    contact: {
      phone: createField(`entry_${entryIndex}_contact_phone`, "", "phone", "Phone Number"),
      email: createField(`entry_${entryIndex}_contact_email`, "", "email", "Email Address"),
      relationship: createField(`entry_${entryIndex}_contact_relationship`, "", "text", "Relationship"),
      correspondenceMethods: createField(`entry_${entryIndex}_contact_methods`, "", "text", "Correspondence Methods")
    },
    employment: {
      employerName: createField(`entry_${entryIndex}_employment_name`, "", "text", "Employer Name"),
      employerAddress: {
        street: createField(`entry_${entryIndex}_employment_address_street`, "", "text", "Employer Street"),
        city: createField(`entry_${entryIndex}_employment_address_city`, "", "text", "Employer City"),
        state: createField(`entry_${entryIndex}_employment_address_state`, "", "text", "Employer State"),
        zipCode: createField(`entry_${entryIndex}_employment_address_zip`, "", "text", "Employer ZIP"),
        country: createField(`entry_${entryIndex}_employment_address_country`, "", "select", "Employer Country")
      },
      position: createField(`entry_${entryIndex}_employment_position`, "", "text", "Position"),
      dateRange: {
        from: {
          date: createField(`entry_${entryIndex}_employment_from_date`, "", "date", "Employment From Date"),
          estimated: createField(`entry_${entryIndex}_employment_from_estimated`, false, "checkbox", "From Date Estimated"),
          unknown: createField(`entry_${entryIndex}_employment_from_unknown`, false, "checkbox", "From Date Unknown")
        },
        to: {
          date: createField(`entry_${entryIndex}_employment_to_date`, "", "date", "Employment To Date"),
          estimated: createField(`entry_${entryIndex}_employment_to_estimated`, false, "checkbox", "To Date Estimated"),
          unknown: createField(`entry_${entryIndex}_employment_to_unknown`, false, "checkbox", "To Date Unknown")
        },
        present: createField(`entry_${entryIndex}_employment_present`, false, "checkbox", "Currently Employed")
      },
      unknownEmployer: createField(`entry_${entryIndex}_employment_unknown`, false, "checkbox", "Unknown Employer")
    },
    governmentRelationship: {
      hasRelationship: createField(`entry_${entryIndex}_gov_has_relationship`, "NO" as "YES" | "NO", "radio", "Government Relationship"),
      relationshipDescription: createField(`entry_${entryIndex}_gov_description`, "", "textarea", "Relationship Description"),
      entityType: createField(`entry_${entryIndex}_gov_entity_type`, "", "text", "Entity Type"),
      securityAccess: createField(`entry_${entryIndex}_gov_security_access`, "", "text", "Security Access")
    },
    contactDetails: {
      firstContact: {
        date: createField(`entry_${entryIndex}_contact_first_date`, "", "date", "First Contact Date"),
        estimated: createField(`entry_${entryIndex}_contact_first_estimated`, false, "checkbox", "First Contact Estimated"),
        unknown: createField(`entry_${entryIndex}_contact_first_unknown`, false, "checkbox", "First Contact Unknown")
      },
      lastContact: {
        date: createField(`entry_${entryIndex}_contact_last_date`, "", "date", "Last Contact Date"),
        estimated: createField(`entry_${entryIndex}_contact_last_estimated`, false, "checkbox", "Last Contact Estimated"),
        unknown: createField(`entry_${entryIndex}_contact_last_unknown`, false, "checkbox", "Last Contact Unknown")
      },
      frequency: createField(`entry_${entryIndex}_contact_frequency`, "", "text", "Contact Frequency"),
      natureOfContact: createField(`entry_${entryIndex}_contact_nature`, "", "textarea", "Nature of Contact"),
      initialMeetingCircumstances: createField(`entry_${entryIndex}_contact_initial_circumstances`, "", "textarea", "Initial Meeting Circumstances"),
      otherPersonsPresent: createField(`entry_${entryIndex}_contact_others_present`, "", "textarea", "Other Persons Present"),
      contactLocations: createField(`entry_${entryIndex}_contact_locations`, "", "textarea", "Contact Locations"),
      sponsoredBy: createField(`entry_${entryIndex}_contact_sponsored_by`, "", "text", "Sponsored By"),
      purpose: createField(`entry_${entryIndex}_contact_purpose`, "", "textarea", "Purpose of Contact")
    }
  };
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

const defaultValidationRules: Section19ValidationRules = {
  requireContactDetails: true,
  requireEmploymentInfo: false,
  requireGovernmentRelationship: false,
  maxEntries: 10
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section19Context = createContext<Section19ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section19ProviderProps {
  children: React.ReactNode;
}

export const Section19Provider: React.FC<Section19ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section19Data, setSection19Data] = useState<Section19>(createInitialSection19State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [initialData] = useState<Section19>(createInitialSection19State());

  // ============================================================================
  // INTEGRATION WITH SF86 FORM CONTEXT
  // ============================================================================

  const integration = useSection86FormIntegration({
    sectionId: 'section19',
    sectionName: 'Foreign Activities',
    sectionData: section19Data,
    isDirty: JSON.stringify(section19Data) !== JSON.stringify(initialData),
    validate: () => validateSection(),
    reset: () => resetSection(),
    load: (data: Section19) => loadSection(data)
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = useMemo(() => {
    return JSON.stringify(section19Data) !== JSON.stringify(initialData);
  }, [section19Data, initialData]);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Validate foreign contacts subsection
    const foreignContacts = section19Data.section19.foreignContacts;
    if (foreignContacts?.hasContact?.value === "YES") {
      if (!foreignContacts.entries || foreignContacts.entries.length === 0) {
        validationErrors.push({
          field: 'foreignContacts.entries',
          message: 'At least one foreign contact is required when answering YES',
          code: 'REQUIRED_ENTRY',
          severity: 'error'
        });
      } else {
        // Validate each entry
        foreignContacts.entries.forEach((entry, index) => {
          const entryValidation = validateEntry('foreignContacts', index);
          validationErrors.push(...entryValidation.errors);
          validationWarnings.push(...entryValidation.warnings);
        });
      }
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [section19Data]);

  const validateEntry = useCallback((subsectionKey: Section19SubsectionKey, entryIndex: number): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    if (subsectionKey === 'foreignContacts') {
      const entry = section19Data.section19.foreignContacts?.entries[entryIndex];
      if (!entry) {
        validationErrors.push({
          field: `foreignContacts.entries.${entryIndex}`,
          message: 'Entry not found',
          code: 'ENTRY_NOT_FOUND',
          severity: 'error'
        });
        return { isValid: false, errors: validationErrors, warnings: validationWarnings };
      }

      // Validate required fields
      if (!entry.personalInfo.name.last.value) {
        validationErrors.push({
          field: `foreignContacts.entries.${entryIndex}.personalInfo.name.last`,
          message: 'Last name is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      if (!entry.personalInfo.name.first.value) {
        validationErrors.push({
          field: `foreignContacts.entries.${entryIndex}.personalInfo.name.first`,
          message: 'First name is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      if (!entry.citizenship.country1.value && !entry.citizenship.unknown.value) {
        validationErrors.push({
          field: `foreignContacts.entries.${entryIndex}.citizenship.country1`,
          message: 'Primary citizenship country is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      if (!entry.contact.relationship.value) {
        validationErrors.push({
          field: `foreignContacts.entries.${entryIndex}.contact.relationship`,
          message: 'Relationship description is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [section19Data]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const updateFieldValue = useCallback((path: string, value: any) => {
    setSection19Data(prevData => {
      const newData = cloneDeep(prevData);
      set(newData, path, value);
      return newData;
    });
  }, []);

  const updateForeignContactField = useCallback((entryIndex: number, fieldPath: string, value: any) => {
    const fullPath = `section19.foreignContacts.entries.${entryIndex}.${fieldPath}`;
    updateFieldValue(fullPath, value);
  }, [updateFieldValue]);

  const updateSubsectionFlag = useCallback((key: Section19SubsectionKey, value: "YES" | "NO") => {
    setSection19Data(prevData => {
      const newData = cloneDeep(prevData);
      
      if (key === 'foreignContacts') {
        if (!newData.section19.foreignContacts) {
          newData.section19.foreignContacts = {
            hasContact: { id: "RadioButtonList[0]", value },
            entries: []
          };
        } else {
          newData.section19.foreignContacts.hasContact.value = value;
        }

        // Clear entries if answering NO
        if (value === "NO") {
          newData.section19.foreignContacts.entries = [];
        }
      }

      return newData;
    });
  }, []);

  // ============================================================================
  // ENTRY MANAGEMENT
  // ============================================================================

  const getEntryCount = useCallback((subsectionKey: string): number => {
    if (subsectionKey === 'foreignContacts') {
      return section19Data.section19.foreignContacts?.entries?.length || 0;
    }
    return 0;
  }, [section19Data]);

  const addEntry = useCallback((subsectionKey: string, entryType?: string) => {
    if (subsectionKey === 'foreignContacts') {
      setSection19Data(prevData => {
        const newData = cloneDeep(prevData);
        
        if (!newData.section19.foreignContacts) {
          newData.section19.foreignContacts = {
            hasContact: { id: "RadioButtonList[0]", value: "YES" },
            entries: []
          };
        }

        const currentCount = newData.section19.foreignContacts.entries.length;
        const newEntry = createDefaultForeignContactEntry(currentCount);
        newData.section19.foreignContacts.entries.push(newEntry);

        return newData;
      });
    }
  }, []);

  const removeEntry = useCallback((subsectionKey: string, index: number) => {
    if (subsectionKey === 'foreignContacts') {
      setSection19Data(prevData => {
        const newData = cloneDeep(prevData);
        
        if (newData.section19.foreignContacts?.entries) {
          newData.section19.foreignContacts.entries.splice(index, 1);
        }

        return newData;
      });
    }
  }, []);

  const moveEntry = useCallback((subsectionKey: string, fromIndex: number, toIndex: number) => {
    if (subsectionKey === 'foreignContacts') {
      setSection19Data(prevData => {
        const newData = cloneDeep(prevData);
        
        if (newData.section19.foreignContacts?.entries) {
          const entries = newData.section19.foreignContacts.entries;
          const [movedEntry] = entries.splice(fromIndex, 1);
          entries.splice(toIndex, 0, movedEntry);
        }

        return newData;
      });
    }
  }, []);

  const duplicateEntry = useCallback((subsectionKey: string, index: number) => {
    if (subsectionKey === 'foreignContacts') {
      setSection19Data(prevData => {
        const newData = cloneDeep(prevData);
        
        if (newData.section19.foreignContacts?.entries?.[index]) {
          const entryToDuplicate = cloneDeep(newData.section19.foreignContacts.entries[index]);
          
          // Update IDs for the duplicated entry
          const newEntryIndex = newData.section19.foreignContacts.entries.length;
          entryToDuplicate._id = Date.now() + newEntryIndex;
          
          // Update field IDs to be unique
          const updateFieldIds = (obj: any, basePath: string) => {
            Object.keys(obj).forEach(key => {
              if (obj[key] && typeof obj[key] === 'object') {
                if ('id' in obj[key] && 'value' in obj[key]) {
                  obj[key].id = obj[key].id.replace(`_${index}_`, `_${newEntryIndex}_`);
                } else {
                  updateFieldIds(obj[key], `${basePath}.${key}`);
                }
              }
            });
          };
          
          updateFieldIds(entryToDuplicate, 'entry');
          newData.section19.foreignContacts.entries.push(entryToDuplicate);
        }

        return newData;
      });
    }
  }, []);

  const clearEntry = useCallback((subsectionKey: string, index: number) => {
    if (subsectionKey === 'foreignContacts') {
      setSection19Data(prevData => {
        const newData = cloneDeep(prevData);
        
        if (newData.section19.foreignContacts?.entries?.[index]) {
          const clearedEntry = createDefaultForeignContactEntry(index);
          clearedEntry._id = newData.section19.foreignContacts.entries[index]._id; // Keep same ID
          newData.section19.foreignContacts.entries[index] = clearedEntry;
        }

        return newData;
      });
    }
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    setSection19Data(createInitialSection19State());
    setErrors([]);
  }, []);

  const loadSection = useCallback((data: Section19) => {
    setSection19Data(cloneDeep(data));
  }, []);

  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};
    
    // Implementation for change tracking would go here
    // This is a simplified version
    if (isDirty) {
      changes['section19'] = {
        oldValue: initialData,
        newValue: section19Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [isDirty, initialData, section19Data]);

  const exportSection = useCallback((): Section19 => {
    return cloneDeep(section19Data);
  }, [section19Data]);

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  const bulkUpdateFields = useCallback((updates: Section19FieldUpdate[]) => {
    setSection19Data(prevData => {
      const newData = cloneDeep(prevData);
      
      updates.forEach(update => {
        set(newData, update.fieldPath, update.newValue);
      });

      return newData;
    });
  }, []);

  const bulkUpdateEntries = useCallback((subsectionKey: Section19SubsectionKey, updates: ForeignContactEntryUpdate[]) => {
    if (subsectionKey === 'foreignContacts') {
      setSection19Data(prevData => {
        const newData = cloneDeep(prevData);
        
        updates.forEach(update => {
          const fullPath = `section19.foreignContacts.entries.${update.entryIndex}.${update.fieldPath}`;
          set(newData, fullPath, update.newValue);
        });

        return newData;
      });
    }
  }, []);

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  useEffect(() => {
    const validationResult = validateSection();
    setErrors(validationResult.errors);
  }, [section19Data, validateSection]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section19ContextType = {
    // State
    section19Data,
    sectionData: section19Data, // Required by BaseSectionContext
    isLoading,
    errors,
    isDirty,

    // Section identification
    sectionId: 'section19',
    sectionName: 'Foreign Activities',

    // Basic Actions
    updateFieldValue,
    updateForeignContactField,
    updateSubsectionFlag,

    // Entry Management
    getEntryCount,
    addEntry,
    removeEntry,
    moveEntry,
    duplicateEntry,
    clearEntry,

    // Validation
    validateSection,
    validateEntry,

    // Utility
    resetSection,
    loadSection,
    getChanges,
    exportSection,

    // Bulk Operations
    bulkUpdateFields,
    bulkUpdateEntries
  };

  return (
    <Section19Context.Provider value={contextValue}>
      {children}
    </Section19Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection19 = (): Section19ContextType => {
  const context = useContext(Section19Context);
  if (!context) {
    throw new Error('useSection19 must be used within a Section19Provider');
  }
  return context;
};

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type { Section19ContextType }; 