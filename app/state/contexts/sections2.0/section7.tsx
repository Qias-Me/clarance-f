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
} from '../../../../api/interfaces/sections2.0/section7';
import {
  createDefaultSection7,
  updateSection7Field
} from '../../../../api/interfaces/sections2.0/section7';
import type { ValidationResult, ValidationError } from '../shared/base-interfaces';
import { useSection86FormIntegration } from '../shared/section-context-integration';

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

  // Phone Number CRUD (for compatibility with component)
  addPhoneNumber: () => void;
  removePhoneNumber: (index: number) => void;
  phoneNumbers: Array<{type: {value: string}, number: {value: string}}>;

  // Email Address CRUD (for compatibility with component)
  addEmailAddress: () => void;
  removeEmailAddress: (index: number) => void;
  emailAddresses: Array<{address: {value: string}}>;

  // Social Media CRUD (for compatibility with component)
  addSocialMedia: () => void;
  removeSocialMedia: (index: number) => void;
  updateSocialMedia: (index: number, fieldType: string, value: any) => void;
  socialMedia: Array<{platform: {value: string}, username: {value: string}, url?: {value: string}}>;

  // Validation
  validateSection: () => ValidationResult;
  validateEmail: (email: string) => boolean;
  validatePhoneNumber: (phoneNumber: string) => boolean;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section7) => void;
  getChanges: () => any;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

const createInitialSection7State = (): Section7 => createDefaultSection7();

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
  const [isLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section7>(createInitialSection7State());
  
  // Additional state for dynamic arrays (for component compatibility)
  const [dynamicPhoneNumbers, setDynamicPhoneNumbers] = useState<Array<{type: {value: string}, number: {value: string}}>>([]);
  const [dynamicEmailAddresses, setDynamicEmailAddresses] = useState<Array<{address: {value: string}}>>([]);
  const [dynamicSocialMedia, setDynamicSocialMedia] = useState<Array<{platform: {value: string}, username: {value: string}, url?: {value: string}}>>([]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = JSON.stringify(section7Data) !== JSON.stringify(initialData);

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

    // Validate home email if provided
    if (section7Data.section7.homeEmail.value &&
        !validateEmail(section7Data.section7.homeEmail.value)) {
      validationErrors.push({
        field: 'section7.homeEmail',
        message: 'Please enter a valid home email address',
        code: 'INVALID_EMAIL',
        severity: 'error'
      });
    }

    // Validate work email if provided
    if (section7Data.section7.workEmail.value &&
        !validateEmail(section7Data.section7.workEmail.value)) {
      validationErrors.push({
        field: 'section7.workEmail',
        message: 'Please enter a valid work email address',
        code: 'INVALID_EMAIL',
        severity: 'error'
      });
    }

    // Validate phone numbers if provided (entries array structure)
    if (section7Data.section7.entries && section7Data.section7.entries.length > 0) {
      section7Data.section7.entries.forEach((phoneEntry, index) => {
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

    // Validate dynamic email addresses
    dynamicEmailAddresses.forEach((email, index) => {
      if (email.address.value && !validateEmail(email.address.value)) {
        validationErrors.push({
          field: `emailAddresses[${index}].address`,
          message: 'Please enter a valid email address',
          code: 'INVALID_EMAIL',
          severity: 'error'
        });
      }
    });

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
  }, [section7Data, dynamicPhoneNumbers, dynamicEmailAddresses, validateEmail, validatePhoneNumber]);

  const getChanges = useCallback(() => {
    const changes: Record<string, any> = {};

    if (isDirty) {
      changes.section7 = {
        oldValue: initialData,
        newValue: section7Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section7Data, isDirty, initialData]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const updateHomeEmail = useCallback((email: string) => {
    setSection7Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section7.homeEmail.value = email;
      return newData;
    });
  }, []);

  const updateWorkEmail = useCallback((email: string) => {
    setSection7Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section7.workEmail.value = email;
      return newData;
    });
  }, []);

  const updatePhoneNumber = useCallback((index: number, fieldType: string, value: any) => {
    setSection7Data(prevData => {
      const newData = cloneDeep(prevData);

      // Update the actual section7 data structure (fixed 3 phone entries)
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
        if (fieldType === 'type') {
          newArray[index].type.value = value;
        } else if (fieldType === 'number') {
          newArray[index].number.value = value;
        }
        return newArray;
      });
    }
  }, [dynamicPhoneNumbers]);

  const updateContactField = useCallback((update: Section7FieldUpdate) => {
    setSection7Data(prevData => {
      return updateSection7Field(prevData, update);
    });
  }, []);

  // ============================================================================
  // DYNAMIC CRUD OPERATIONS (for component compatibility)
  // ============================================================================

  const addPhoneNumber = useCallback(() => {
    const phoneTypes = ['MOBILE', 'HOME', 'WORK', 'OTHER'];
    const newPhone = {
      type: { value: phoneTypes[dynamicPhoneNumbers.length % phoneTypes.length] },
      number: { value: '' }
    };
    setDynamicPhoneNumbers(prev => [...prev, newPhone]);
  }, [dynamicPhoneNumbers]);

  const removePhoneNumber = useCallback((index: number) => {
    setDynamicPhoneNumbers(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addEmailAddress = useCallback(() => {
    const newEmail = {
      address: { value: '' }
    };
    setDynamicEmailAddresses(prev => [...prev, newEmail]);
  }, []);

  const removeEmailAddress = useCallback((index: number) => {
    setDynamicEmailAddresses(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addSocialMedia = useCallback(() => {
    const newSocialMedia = {
      platform: { value: '' },
      username: { value: '' },
      url: { value: '' }
    };
    setDynamicSocialMedia(prev => [...prev, newSocialMedia]);
  }, []);

  const removeSocialMedia = useCallback((index: number) => {
    setDynamicSocialMedia(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateSocialMedia = useCallback((index: number, fieldType: string, value: any) => {
    setDynamicSocialMedia(prev => {
      const newArray = cloneDeep(prev);
      if (index < newArray.length) {
        if (fieldType === 'platform') {
          newArray[index].platform.value = value;
        } else if (fieldType === 'username') {
          newArray[index].username.value = value;
        } else if (fieldType === 'url') {
          newArray[index].url = newArray[index].url || { value: '' };
          newArray[index].url!.value = value;
        }
      }
      return newArray;
    });
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    const newData = createInitialSection7State();
    setSection7Data(newData);
    setErrors({});
    setDynamicPhoneNumbers([]);
    setDynamicEmailAddresses([]);
    setDynamicSocialMedia([]);
  }, []);

  const loadSection = useCallback((data: Section7) => {
    setSection7Data(cloneDeep(data));
    setErrors({});
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

  // Integration with main form context using Section 1 gold standard pattern
  // Note: integration variable is used internally by the hook for registration
  const integration = useSection86FormIntegration(
    'section7',
    'Section 7: Your Contact Information',
    section7Data,
    setSection7Data,
    () => ({ isValid: validateSection().isValid, errors: validateSection().errors, warnings: validateSection().warnings }),
    getChanges,
    updateFieldValue // Pass Section 7's updateFieldValue function to integration
  );

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section7ContextType = {
    // State
    section7Data,
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
    emailAddresses: dynamicEmailAddresses,

    // Social Media CRUD
    addSocialMedia,
    removeSocialMedia,
    updateSocialMedia,
    socialMedia: dynamicSocialMedia,

    // Validation
    validateSection,
    validateEmail,
    validatePhoneNumber,

    // Utility
    resetSection,
    loadSection,
    getChanges,
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
