/**
 * Section 7: Your Contact Information - Context Provider
 *
 * React context provider for SF-86 Section 7 using the new Form Architecture 2.0.
 * This provider manages contact information data with full CRUD operations,
 * validation, and integration with the central SF86FormContext.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
} from 'react';
import cloneDeep from 'lodash/cloneDeep';
import type {
  Section7,
  Section7FieldUpdate,
  PhoneNumberUpdate,
  ContactInformation,
  PhoneNumber
} from '../../../../api/interfaces/section-interfaces/section7';
import {
  createDefaultSection7,
  updateSection7Field
} from '../../../../api/interfaces/section-interfaces/section7';
import type { ValidationResult, ValidationError } from '../shared/base-interfaces';

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

export interface Section7ContextType {
  // State
  section7Data: Section7;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions
  updateHomeEmail: (email: string) => void;
  updateWorkEmail: (email: string) => void;
  updatePhoneNumber: (index: number, fieldType: string, value: any) => void;
  updateContactField: (update: Section7FieldUpdate) => void;
  updateFieldValue: (path: string, value: any) => void;

  // Phone Number Updates (fixed 3 entries - no add/remove)
  // addPhoneNumber and removePhoneNumber removed - PDF has fixed 3 entries
  phoneNumbers: Array<{
    number: {value: string},
    extension: {value: string},
    dayTime: {value: boolean},
    nightTime: {value: boolean},
    isInternational: {value: boolean}
  }>;

  // Email fields are fixed (homeEmail and workEmail only)
  // No additional email addresses or social media - not in PDF

  // Validation
  validateSection: () => ValidationResult;
  validateEmail: (email: string) => boolean;
  validatePhoneNumber: (phoneNumber: string) => boolean;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section7) => void;
  getChanges: () => any;
  commitDraft: () => Section7;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

const createInitialSection7State = (): Section7 => {
  const defaultSection = createDefaultSection7();
  // Ensure we always have exactly 3 phone entries as per PDF structure
  if (!defaultSection.section7.entries || defaultSection.section7.entries.length !== 3) {
    defaultSection.section7.entries = [
      // Home phone (entry 0)
      {
        number: { id: 'section7-phone-0-number', value: '' },
        extension: { id: 'section7-phone-0-extension', value: '' },
        dayTime: { id: 'section7-phone-0-dayTime', value: false },
        nightTime: { id: 'section7-phone-0-nightTime', value: false },
        isInternational: { id: 'section7-phone-0-isInternational', value: false }
      },
      // Work phone (entry 1)
      {
        number: { id: 'section7-phone-1-number', value: '' },
        extension: { id: 'section7-phone-1-extension', value: '' },
        dayTime: { id: 'section7-phone-1-dayTime', value: false },
        nightTime: { id: 'section7-phone-1-nightTime', value: false },
        isInternational: { id: 'section7-phone-1-isInternational', value: false }
      },
      // Mobile phone (entry 2)
      {
        number: { id: 'section7-phone-2-number', value: '' },
        extension: { id: 'section7-phone-2-extension', value: '' },
        dayTime: { id: 'section7-phone-2-dayTime', value: false },
        nightTime: { id: 'section7-phone-2-nightTime', value: false },
        isInternational: { id: 'section7-phone-2-isInternational', value: false }
      }
    ];
  }
  return defaultSection;
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section7Context = createContext<Section7ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section7ProviderProps {
  children: React.ReactNode;
}

export const Section7Provider: React.FC<Section7ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section7Data, setSection7Data] = useState<Section7>(createInitialSection7State());
  const [draftData, setDraftData] = useState<Section7>(createInitialSection7State()); // Draft state for input changes
  const [isLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section7>(createInitialSection7State());
  
  // Fixed state for exactly 3 phone entries (matching PDF structure)
  const [dynamicPhoneNumbers, setDynamicPhoneNumbers] = useState<Array<{
    number: {value: string},
    extension: {value: string},
    dayTime: {value: boolean},
    nightTime: {value: boolean},
    isInternational: {value: boolean}
  }>>([
    // Initialize with exactly 3 phone entries as per PDF (Home, Work, Mobile)
    {
      number: { value: '' },
      extension: { value: '' },
      dayTime: { value: false },
      nightTime: { value: false },
      isInternational: { value: false }
    },
    {
      number: { value: '' },
      extension: { value: '' },
      dayTime: { value: false },
      nightTime: { value: false },
      isInternational: { value: false }
    },
    {
      number: { value: '' },
      extension: { value: '' },
      dayTime: { value: false },
      nightTime: { value: false },
      isInternational: { value: false }
    }
  ]);
  // No dynamic email addresses - only homeEmail and workEmail as per PDF
  // No social media fields - not present in PDF

  // ============================================================================
  // SYNCHRONIZATION EFFECTS
  // ============================================================================

  // Synchronize dynamic phone numbers when draftData changes (for real-time display)
  useEffect(() => {
    if (draftData.section7.entries && draftData.section7.entries.length > 0) {
      const syncedPhoneNumbers = draftData.section7.entries.map(entry => ({
        number: { value: entry.number?.value || '' },
        extension: { value: entry.extension?.value || '' },
        dayTime: { value: entry.dayTime?.value || false },
        nightTime: { value: entry.nightTime?.value || false },
        isInternational: { value: entry.isInternational?.value || false }
      }));

      // Only update if the arrays are different to avoid infinite loops
      const currentPhoneNumbers = JSON.stringify(dynamicPhoneNumbers);
      const newPhoneNumbers = JSON.stringify(syncedPhoneNumbers);

      if (currentPhoneNumbers !== newPhoneNumbers) {
        setDynamicPhoneNumbers(syncedPhoneNumbers);
      }
    }
  }, [draftData.section7.entries]); // Use draftData for real-time updates

  // Synchronize draftData when section7Data changes (e.g., from data loading)
  useEffect(() => {
    setDraftData(cloneDeep(section7Data));
  }, [section7Data]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = JSON.stringify(draftData) !== JSON.stringify(section7Data);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validatePhoneNumber = useCallback((phoneNumber: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''));
  }, []);

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Validate home email if provided (use draftData for real-time validation)
    if (draftData.section7.homeEmail.value &&
        !validateEmail(draftData.section7.homeEmail.value)) {
      validationErrors.push({
        field: 'section7.homeEmail',
        message: 'Please enter a valid home email address',
        code: 'INVALID_EMAIL',
        severity: 'error'
      });
    }

    // Validate work email if provided (use draftData for real-time validation)
    if (draftData.section7.workEmail.value &&
        !validateEmail(draftData.section7.workEmail.value)) {
      validationErrors.push({
        field: 'section7.workEmail',
        message: 'Please enter a valid work email address',
        code: 'INVALID_EMAIL',
        severity: 'error'
      });
    }

    // Validate phone numbers if provided (use draftData for real-time validation)
    if (draftData.section7.entries && draftData.section7.entries.length > 0) {
      draftData.section7.entries.forEach((phoneEntry, index) => {
        const phoneType = index === 0 ? 'home' : index === 1 ? 'work' : 'mobile';

        if (phoneEntry.number.value && !validatePhoneNumber(phoneEntry.number.value)) {
          validationErrors.push({
            field: `section7.entries[${index}].number`,
            message: `Please enter a valid ${phoneType} phone number`,
            code: 'INVALID_PHONE',
            severity: 'error'
          });
        }
      });
    }

    // Validate dynamic phone numbers
    dynamicPhoneNumbers.forEach((phone, index) => {
      if (phone.number.value && !validatePhoneNumber(phone.number.value)) {
        validationErrors.push({
          field: `phoneNumbers[${index}].number`,
          message: 'Please enter a valid phone number',
          code: 'INVALID_PHONE',
          severity: 'error'
        });
      }
    });

    // No dynamic email addresses - only homeEmail and workEmail are validated above

    // Update local errors
    const newErrors: Record<string, string> = {};
    validationErrors.forEach(error => {
      newErrors[error.field] = error.message;
    });
    setErrors(newErrors);

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [draftData, dynamicPhoneNumbers, validateEmail, validatePhoneNumber]);

  const getChanges = useCallback(() => {
    const changes: Record<string, any> = {};

    if (isDirty) {
      changes.section7 = {
        oldValue: section7Data,
        newValue: draftData,
        timestamp: new Date()
      };
    }

    return changes;
  }, [draftData, isDirty, section7Data]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const updateHomeEmail = useCallback((email: string) => {
    setDraftData(prevData => {
      const newData = cloneDeep(prevData);
      newData.section7.homeEmail.value = email;
      return newData;
    });
  }, []);

  const updateWorkEmail = useCallback((email: string) => {
    setDraftData(prevData => {
      const newData = cloneDeep(prevData);
      newData.section7.workEmail.value = email;
      return newData;
    });
  }, []);

  const updatePhoneNumber = useCallback((index: number, fieldType: string, value: any) => {
    setDraftData(prevData => {
      const newData = cloneDeep(prevData);

      // Update the draft section7 data structure (fixed 3 phone entries)
      if (newData.section7.entries && newData.section7.entries[index]) {
        const phoneEntry = newData.section7.entries[index];
        if (phoneEntry[fieldType as keyof PhoneNumber]) {
          (phoneEntry[fieldType as keyof PhoneNumber] as any).value = value;
        }
      }

      return newData;
    });

    // Also update dynamic phone numbers for component compatibility
    if (index < dynamicPhoneNumbers.length) {
      setDynamicPhoneNumbers(prev => {
        const newArray = cloneDeep(prev);
        if (fieldType === 'number') {
          newArray[index].number.value = value;
        } else if (fieldType === 'extension') {
          newArray[index].extension.value = value;
        } else if (fieldType === 'dayTime') {
          newArray[index].dayTime.value = value;
        } else if (fieldType === 'nightTime') {
          newArray[index].nightTime.value = value;
        } else if (fieldType === 'isInternational') {
          newArray[index].isInternational.value = value;
        }
        return newArray;
      });
    }
  }, [dynamicPhoneNumbers]);

  const updateContactField = useCallback((update: Section7FieldUpdate) => {
    setDraftData(prevData => {
      return updateSection7Field(prevData, update);
    });
  }, []);

  // ============================================================================
  // DRAFT MANAGEMENT
  // ============================================================================

  const commitDraft = useCallback(() => {
    const committedData = cloneDeep(draftData);
    setSection7Data(committedData);
    return committedData; // Return the committed data for immediate use
  }, [draftData]);

  // ============================================================================
  // DYNAMIC CRUD OPERATIONS (for component compatibility)
  // ============================================================================

  const addPhoneNumber = useCallback(() => {
    const newPhone = {
      number: { value: '' },
      extension: { value: '' },
      dayTime: { value: false },
      nightTime: { value: false },
      isInternational: { value: false }
    };

    // Update dynamic phone numbers
    setDynamicPhoneNumbers(prev => [...prev, newPhone]);

    // Also update the main section7Data structure
    setSection7Data(prevData => {
      const newData = cloneDeep(prevData);
      if (!newData.section7.entries) {
        newData.section7.entries = [];
      }

      // Add new phone entry to section7 data structure
      const newEntry = {
        number: { id: `section7-phone-${newData.section7.entries.length}-number`, value: '' },
        extension: { id: `section7-phone-${newData.section7.entries.length}-extension`, value: '' },
        dayTime: { id: `section7-phone-${newData.section7.entries.length}-dayTime`, value: false },
        nightTime: { id: `section7-phone-${newData.section7.entries.length}-nightTime`, value: false },
        isInternational: { id: `section7-phone-${newData.section7.entries.length}-isInternational`, value: false }
      };
      newData.section7.entries.push(newEntry);

      return newData;
    });
  }, []);

  const removePhoneNumber = useCallback((index: number) => {
    // Update dynamic phone numbers
    setDynamicPhoneNumbers(prev => prev.filter((_, i) => i !== index));

    // Also update the main section7Data structure
    setSection7Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section7.entries && newData.section7.entries[index]) {
        newData.section7.entries.splice(index, 1);
      }
      return newData;
    });
  }, []);

  // No additional email addresses or social media - not in PDF
  const addEmailAddress = useCallback(() => {
    console.warn('Cannot add email addresses - Section 7 only has homeEmail and workEmail per PDF');
  }, []);

  const removeEmailAddress = useCallback((index: number) => {
    console.warn(`Cannot remove email ${index} - Section 7 only has homeEmail and workEmail per PDF`);
  }, []);

  // Social media not in PDF - stub functions for compatibility
  const addSocialMedia = useCallback(() => {
    console.warn('Social media not supported - not present in PDF form');
  }, []);

  const removeSocialMedia = useCallback((index: number) => {
    console.warn(`Social media not supported - not present in PDF form`);
  }, []);

  const updateSocialMedia = useCallback((index: number, fieldType: string, value: any) => {
    console.warn('Social media not supported - not present in PDF form');
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    const newData = createInitialSection7State();
    setSection7Data(newData);
    setErrors({});
    setDynamicPhoneNumbers([
      {
        number: { value: '' },
        extension: { value: '' },
        dayTime: { value: false },
        nightTime: { value: false },
        isInternational: { value: false }
      }
    ]);
    setDynamicEmailAddresses([]);
    setDynamicSocialMedia([]);
  }, []);

  const loadSection = useCallback((data: Section7) => {
    setSection7Data(cloneDeep(data));
    setErrors({});

    // Synchronize dynamic phone numbers from loaded data
    if (data.section7.entries && data.section7.entries.length > 0) {
      const syncedPhoneNumbers = data.section7.entries.map(entry => ({
        number: { value: entry.number?.value || '' },
        extension: { value: entry.extension?.value || '' },
        dayTime: { value: entry.dayTime?.value || false },
        nightTime: { value: entry.nightTime?.value || false },
        isInternational: { value: entry.isInternational?.value || false }
      }));
      setDynamicPhoneNumbers(syncedPhoneNumbers);
    } else {
      // If no entries, reset to default single phone entry
      setDynamicPhoneNumbers([
        {
          number: { value: '' },
          extension: { value: '' },
          dayTime: { value: false },
          nightTime: { value: false },
          isInternational: { value: false }
        }
      ]);
    }
  }, []);

  // ============================================================================
  // FIELD FLATTENING FOR PDF GENERATION
  // ============================================================================

  /**
   * Flatten Section7 data structure into Field objects for PDF generation
   * This converts the nested Section7 structure into a flat object with Field<T> objects
   * Following the Section 29 pattern for consistency
   *
   * NOTE: Currently unused but kept for potential future PDF generation needs
   */
  const flattenSection7Fields = useCallback((): Record<string, any> => {
    const flatFields: Record<string, any> = {};

    const addField = (field: any, _path: string) => {
      if (
        field &&
        typeof field === "object" &&
        "id" in field &&
        "value" in field
      ) {
        flatFields[field.id] = field;
      }
    };

    // Flatten section7 contact information fields
    if (section7Data.section7) {
      // Email fields
      addField(section7Data.section7.homeEmail, 'section7.homeEmail');
      addField(section7Data.section7.workEmail, 'section7.workEmail');

      // Phone entries (home, work, mobile)
      if (section7Data.section7.entries) {
        section7Data.section7.entries.forEach((phoneEntry, index) => {
          const phoneType = index === 0 ? 'home' : index === 1 ? 'work' : 'mobile';

          addField(phoneEntry.number, `section7.${phoneType}Phone.number`);
          addField(phoneEntry.extension, `section7.${phoneType}Phone.extension`);
          addField(phoneEntry.isInternational, `section7.${phoneType}Phone.isInternational`);
          addField(phoneEntry.dayTime, `section7.${phoneType}Phone.dayTime`);
          addField(phoneEntry.nightTime, `section7.${phoneType}Phone.nightTime`);
        });
      }
    }

    return flatFields;
  }, [section7Data]);

  // ============================================================================
  // FIELD UPDATE INTEGRATION
  // ============================================================================

  /**
   * Generic field update function for integration compatibility
   * Maps generic field paths to Section 7 specific update functions
   */
  const updateFieldValue = useCallback((path: string, value: any) => {
    // Parse path to update the correct field
    if (path === 'section7.homeEmail') {
      updateHomeEmail(value);
    } else if (path === 'section7.workEmail') {
      updateWorkEmail(value);
    } else if (path.includes('section7.entries[')) {
      // Handle phone number field updates
      const match = path.match(/section7\.entries\[(\d+)\]\.(\w+)/);
      if (match) {
        const entryIndex = parseInt(match[1], 10);
        const fieldType = match[2];
        updatePhoneNumber(entryIndex, fieldType, value);
      }
    } else {
      // Fallback to generic field update
      updateContactField({ fieldPath: path, newValue: value });
    }
  }, [updateHomeEmail, updateWorkEmail, updatePhoneNumber, updateContactField]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================



  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section7ContextType = {
    // State
    section7Data: draftData, // Expose draftData as section7Data for component compatibility
    isLoading,
    errors,
    isDirty,

    // Basic Actions
    updateHomeEmail,
    updateWorkEmail,
    updatePhoneNumber,
    updateContactField,
    updateFieldValue,

    // Phone Number CRUD
    addPhoneNumber,
    removePhoneNumber,
    phoneNumbers: dynamicPhoneNumbers,

    // Email Address CRUD
    addEmailAddress,
    removeEmailAddress,
    emailAddresses: [], // No dynamic emails - only homeEmail and workEmail

    // Social Media CRUD
    addSocialMedia,
    removeSocialMedia,
    updateSocialMedia,
    socialMedia: [], // No social media in PDF

    // Validation
    validateSection,
    validateEmail,
    validatePhoneNumber,

    // Utility
    resetSection,
    loadSection,
    getChanges,
    commitDraft, // Add commitDraft function
  };

  return (
    <Section7Context.Provider value={contextValue}>
      {children}
    </Section7Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection7 = (): Section7ContextType => {
  const context = useContext(Section7Context);
  if (!context) {
    throw new Error('useSection7 must be used within a Section7Provider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Section7Provider;
