/**
 * Section 19: Foreign Activities - Context Provider
 *
 * React context provider for SF-86 Section 19 using the new Form Architecture 2.0.
 * This provider manages foreign contacts and activities data with full CRUD operations,
 * validation, and integration with the central SF86FormContext.
 *
 * FIXED: Now uses proper sections-references integration following Section 29 patterns
 * Structure: Section → 4 Subsections (Section19_1, Section19_2, Section19_3, Section19_4) → Fields
 * - 4 subsections with identical field structures (277 total fields)
 * - Uses createFieldFromReference for DRY field creation
 * - Follows Section 29 implementation patterns for proper integration
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
import { createFieldFromReference } from '../../../../api/utils/sections-references-loader';
import type {
  ValidationResult,
  ValidationError,
  ChangeSet
} from '../shared/base-interfaces';
import type { Field } from '../../../../api/interfaces/formDefinition2.0';
import {
  createSection19Field,
  SECTION19_MAIN_FIELDS,
  createSection19EntryFields,
  validateSection19FieldMappings
} from './section19-field-mapping';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Find field by pattern in generated fields
 */
function findFieldByPattern(fields: Record<string, Field<any>>, pattern: string, index: number): Field<any> | null {
  const key = Object.keys(fields).find(k =>
    k.toLowerCase().includes(pattern.toLowerCase()) &&
    k.includes(`_${index}`)
  );
  return key ? fields[key] : null;
}

/**
 * Update field value wrapper to handle different function signatures
 */
function updateFieldValueWrapper(
  updateFn: (path: string, value: any) => void,
  path: string,
  value: any
): void {
  try {
    updateFn(path, value);
  } catch (error) {
    console.warn(`⚠️ Section19: Failed to update field ${path}:`, error);
  }
}

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

export interface Section19ContextType {
  // State
  section19Data: Section19;
  isLoading: boolean;
  errors: ValidationError[];
  isDirty: boolean;

  // Basic Actions
  updateFieldValue: (path: string, value: any) => void;
  updateForeignContactField: (entryIndex: number, fieldPath: string, value: any) => void;
  updateSubsectionFlag: (key: string, value: "YES" | "NO") => void;

  // Entry Management
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
}

// ============================================================================
// FIELD CREATION HELPERS - USING SECTIONS-REFERENCES
// ============================================================================

/**
 * Create Section 19 fields using sections-references as source of truth
 * Following Section 29 implementation patterns
 */
/**
 * COMPREHENSIVE SECTION 19 FIELD CREATION - USING COMPLETE FIELD MAPPINGS
 *
 * Creates the main Section 19 field (hasContact radio button) using the comprehensive
 * field mapping system. Individual entry fields are created dynamically when entries are added.
 */
const createSection19FieldsFromReferences = (): Record<string, Field<any>> => {
  console.log('🔍 Creating main Section 19 fields using complete field mappings...');

  const fields: Record<string, Field<any>> = {};

  // Create the main hasContact field using imported functions
  fields.hasContact = createSection19Field(
    SECTION19_MAIN_FIELDS.mainRadio,
    'NO' as "YES" | "NO (If NO, proceed to Section 20A)"
  );

  console.log('✅ Created main Section 19 field with proper PDF reference');
  return fields;
};

// ============================================================================
// INITIAL STATE CREATION - USING SECTIONS-REFERENCES
// ============================================================================

const createInitialSection19State = (): Section19 => {
  console.log('🚀 Creating initial Section 19 state with comprehensive field validation...');

  // Generate fields from sections-references
  const fields = createSection19FieldsFromReferences();

  // Validate field mappings during initialization
  try {
    const validation = validateSection19FieldMappings();

    console.log('📊 Section 19 Field Validation Results:');
    console.log(`  - Mapped Fields: ${validation.mappedCount}`);
    console.log(`  - Expected Fields: ${validation.expectedCount}`);
    console.log(`  - Missing Fields: ${validation.missingCount}`);
    console.log(`  - Validation Status: ${validation.isValid ? '✅ PASSED' : '❌ FAILED'}`);

    if (!validation.isValid) {
      console.warn(`⚠️ Section 19 is missing ${validation.missingCount} fields from the reference data`);
      console.warn('This may cause issues with PDF generation. All 277 fields should be mapped.');
    }
  } catch (error) {
    console.warn('⚠️ Could not validate Section 19 field mappings:', error);
  }

  const initialState = {
    _id: 19,
    section19: {
      foreignContacts: {
        hasContact: fields.hasContact || createFieldFromReference(
          19,
          'form1[0].Section19_1[0].RadioButtonList[0]',
          'NO' as "YES" | "NO (If NO, proceed to Section 20A)"
        ),
        entries: []
      }
    }
  };

  console.log('✅ Section 19 initial state created with comprehensive field structure');
  return initialState;
};

/**
 * COMPREHENSIVE ENTRY CREATION - USING SUBSECTION-BASED PDF FIELD MAPPINGS
 *
 * Create a complete foreign contact entry using the appropriate subsection (1-4)
 * from the PDF form. Each entry maps to a specific subsection with all fields properly
 * mapped to their corresponding PDF field references from section-19.json.
 */
const createDefaultForeignContactEntry = (entryIndex: number) => {
  const entryId = Date.now() + entryIndex;

  // Map entry index to subsection number (1-4, cycling if more than 4 entries)
  const subsectionNumber = (entryIndex % 4) + 1;

  console.log(`🔍 Creating comprehensive foreign contact entry ${entryIndex} using subsection ${subsectionNumber}...`);

  // Create all fields for this subsection using imported function
  const allFields = createSection19EntryFields(subsectionNumber);

  console.log(`📊 Created ${Object.keys(allFields).length} fields for entry ${entryIndex} (subsection ${subsectionNumber})`);

  // Helper function to get field from the created fields
  const getField = (fieldPath: string) => {
    return allFields[fieldPath] || {
      id: '0000',
      name: `fallback-${fieldPath}`,
      type: 'PDFTextField',
      label: 'Fallback Field',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    };
  };

  // Create comprehensive entry structure with all PDF field mappings
  const entry = {
    _id: entryId,
    subsectionNumber, // Track which PDF subsection this entry maps to
    personalInfo: {
      name: {
        first: getField('name.first'),
        middle: getField('name.middle'),
        last: getField('name.last'),
        suffix: getField('name.suffix'),
        unknown: getField('name.unknown'),
        explanation: getField('name.explanation')
      },
      dateOfBirth: {
        date: getField('dateOfBirth.date'),
        estimated: getField('dateOfBirth.estimated'),
        unknown: getField('dateOfBirth.unknown')
      },
      placeOfBirth: {
        city: getField('placeOfBirth.city'),
        country: getField('placeOfBirth.country'),
        unknown: getField('placeOfBirth.unknown')
      },
      address: {
        street: getField('address.street'),
        city: getField('address.city'),
        state: getField('address.state'),
        zipCode: getField('address.zipCode'),
        country: getField('address.country'),
        unknown: getField('address.unknown')
      }
    },
    citizenship: {
      country1: getField('citizenship.country1'),
      country2: getField('citizenship.country2')
    },
    // Contact Methods (5 checkboxes + explanation)
    contactMethods: {
      inPerson: getField('contactMethods.inPerson'),
      telephone: getField('contactMethods.telephone'),
      electronic: getField('contactMethods.electronic'),
      writtenCorrespondence: getField('contactMethods.writtenCorrespondence'),
      other: getField('contactMethods.other'),
      otherExplanation: getField('contactMethods.otherExplanation')
    },

    // Contact Dates
    contactDates: {
      firstContact: getField('contactDates.firstContact'),
      firstContactEstimated: getField('contactDates.firstContactEstimated'),
      lastContact: getField('contactDates.lastContact'),
      lastContactEstimated: getField('contactDates.lastContactEstimated')
    },

    // Contact Frequency (radio groups)
    contactFrequency: getField('contactFrequency'),
    contactFrequency2: getField('contactFrequency2'),

    // Relationship Types (4 checkboxes + explanations)
    relationshipTypes: {
      professionalBusiness: getField('relationshipTypes.professionalBusiness'),
      personal: getField('relationshipTypes.personal'),
      obligation: getField('relationshipTypes.obligation'),
      other: getField('relationshipTypes.other'),
      professionalExplanation: getField('relationshipTypes.professionalExplanation'),
      personalExplanation: getField('relationshipTypes.personalExplanation'),
      obligationExplanation: getField('relationshipTypes.obligationExplanation'),
      otherExplanation: getField('relationshipTypes.otherExplanation')
    },

    // Additional Names Table (4 rows × 4 columns = 16 fields)
    additionalNames: {
      row1: {
        last: getField('additionalNames.row1.last'),
        first: getField('additionalNames.row1.first'),
        middle: getField('additionalNames.row1.middle'),
        suffix: getField('additionalNames.row1.suffix')
      },
      row2: {
        last: getField('additionalNames.row2.last'),
        first: getField('additionalNames.row2.first'),
        middle: getField('additionalNames.row2.middle'),
        suffix: getField('additionalNames.row2.suffix')
      },
      row3: {
        last: getField('additionalNames.row3.last'),
        first: getField('additionalNames.row3.first'),
        middle: getField('additionalNames.row3.middle'),
        suffix: getField('additionalNames.row3.suffix')
      },
      row4: {
        last: getField('additionalNames.row4.last'),
        first: getField('additionalNames.row4.first'),
        middle: getField('additionalNames.row4.middle'),
        suffix: getField('additionalNames.row4.suffix')
      }
    },
    // Employment Information
    employment: {
      employerName: getField('employment.employerName'),
      unknownEmployer: getField('employment.employerUnknown'),
      employerAddress: {
        street: getField('employment.employerAddress.street'),
        city: getField('employment.employerAddress.city'),
        state: getField('employment.employerAddress.state'),
        zipCode: getField('employment.employerAddress.zipCode'),
        country: getField('employment.employerAddress.country'),
        unknown: getField('employment.employerAddress.unknown')
      }
    },

    // Government/Military/Intelligence Relationship
    governmentRelationship: {
      hasRelationship: getField('governmentRelationship.hasRelationship'),
      description: getField('governmentRelationship.description'),
      additionalDetails: getField('governmentRelationship.additionalDetails'),
      address: {
        street: getField('governmentRelationship.address.street'),
        apoFpo: getField('governmentRelationship.address.apoFpo'),
        state: getField('governmentRelationship.address.state'),
        zipCode: getField('governmentRelationship.address.zipCode')
      }
    }
  };

  console.log(`✅ Created comprehensive foreign contact entry ${entryIndex} with all PDF field mappings`);

  // Validate field count for this entry
  const fieldCount = countFieldsInEntry(entry);
  console.log(`📊 Entry ${entryIndex} contains ${fieldCount} mapped fields`);

  return entry;
};

/**
 * Helper function to count fields in an entry for validation
 */
const countFieldsInEntry = (entry: any): number => {
  let count = 0;

  const countFields = (obj: any): void => {
    Object.values(obj).forEach(value => {
      if (value && typeof value === 'object') {
        if ('id' in value && 'name' in value && 'value' in value) {
          count++; // This is a Field object
        } else {
          countFields(value); // Recurse into nested objects
        }
      }
    });
  };

  countFields(entry);
  return count;
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
  // INTEGRATION WITH SF86 FORM CONTEXT - FOLLOWING SECTION 29 PATTERN
  // ============================================================================

  /**
   * SIMPLIFIED FIELD UPDATE FUNCTION - FOLLOWING SECTION 1 GOLD STANDARD
   *
   * Simple field update using lodash set() - no complex path parsing needed
   */
  const updateFieldValue = useCallback((path: string, value: any) => {
    console.log(`🔍 Section19: updateFieldValue called with path=${path}, value=`, value);

    setSection19Data(prev => {
      const newData = cloneDeep(prev);
      set(newData, path, value);
      console.log(`✅ Section19: Updated field ${path} to:`, value);
      return newData;
    });
  }, []);

  /**
   * Change tracking function for integration
   */
  const getChanges = useCallback((): ChangeSet => {
    return {
      section19: {
        oldValue: initialData,
        newValue: section19Data,
        timestamp: new Date()
      }
    };
  }, [section19Data, initialData]);

  // Integration with main form context using Section 29 pattern
  const integration = useSection86FormIntegration(
    'section19',
    'Foreign Activities',
    section19Data,
    setSection19Data,
    () => ({ isValid: validateSection().isValid, errors: validateSection().errors, warnings: validateSection().warnings }),
    getChanges,
    updateFieldValue // Pass Section 19's updateFieldValue function to integration
  );

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

  // updateFieldValue is now defined in the integration section above

  const updateForeignContactField = useCallback((entryIndex: number, fieldPath: string, value: any) => {
    const fullPath = `section19.foreignContacts.entries.${entryIndex}.${fieldPath}`;
    updateFieldValue(fullPath, value);
  }, [updateFieldValue]);

  const updateSubsectionFlag = useCallback((key: string, value: "YES" | "NO") => {
    setSection19Data(prevData => {
      const newData = cloneDeep(prevData);
      
      if (key === 'foreignContacts') {
        // Convert simplified value to full value for internal storage
        const fullValue = value === "NO" ? "NO (If NO, proceed to Section 20A)" as const : "YES" as const;

        if (!newData.section19.foreignContacts) {
          newData.section19.foreignContacts = {
            hasContact: createFieldFromReference(
              19,
              'form1[0].Section19_1[0].RadioButtonList[0]',
              fullValue
            ),
            entries: []
          };
        } else {
          newData.section19.foreignContacts.hasContact.value = fullValue;
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
    console.log(`🔍 Section19: Adding entry to ${subsectionKey}`);

    if (subsectionKey === 'foreignContacts') {
      setSection19Data(prevData => {
        const newData = cloneDeep(prevData);

        if (!newData.section19.foreignContacts) {
          newData.section19.foreignContacts = {
            hasContact: createFieldFromReference(
              19,
              'form1[0].Section19_1[0].RadioButtonList[0]',
              'YES' as "YES" | "NO (If NO, proceed to Section 20A)"
            ),
            entries: []
          };
        }

        const currentCount = newData.section19.foreignContacts.entries.length;
        console.log(`📊 Section19: Creating entry ${currentCount}`);

        // Create new entry using the proper function
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

  // getChanges is already defined in the integration section above

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
    isLoading,
    errors,
    isDirty,

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
    getChanges
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

// Section19ContextType is already exported in the interface definition above