import React from 'react';
import { createSectionContext, ValidationUtils, ValidationError } from './base/BaseSectionContext';

/**
 * Section 1: Personal Information types with full type safety
 */
export interface Section1PersonalInfo {
  fullName: string;
  otherNamesUsed: string[];
  dateOfBirth: string;
  placeOfBirth: string;
  ssn: string;
  currentAddress: Section1Address;
  phoneNumbers: Section1PhoneNumber[];
  email: string;
}

export interface Section1Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  fromDate: string;
  toDate?: string;
  isCurrent: boolean;
}

export interface Section1PhoneNumber {
  type: 'home' | 'work' | 'mobile';
  number: string;
  isPrimary: boolean;
}

export interface Section1Data {
  personalInfo: Section1PersonalInfo;
  citizenship: {
    usCitizen: boolean;
    citizenshipStatus: 'birth' | 'naturalization' | 'derivation' | '';
    naturalizationDate?: string;
    naturalizationLocation?: string;
    alienRegistrationNumber?: string;
    countryOfCitizenship?: string;
  };
  passportInfo: {
    hasPassport: boolean;
    passportNumber?: string;
    issuingCountry?: string;
    issueDate?: string;
    expirationDate?: string;
  };
}

/**
 * Default data factory
 */
const createDefaultSection1Data = (): Section1Data => ({
  personalInfo: {
    fullName: '',
    otherNamesUsed: [],
    dateOfBirth: '',
    placeOfBirth: '',
    ssn: '',
    currentAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      fromDate: '',
      isCurrent: true,
    },
    phoneNumbers: [
      {
        type: 'mobile',
        number: '',
        isPrimary: true,
      },
    ],
    email: '',
  },
  citizenship: {
    usCitizen: true,
    citizenshipStatus: 'birth',
  },
  passportInfo: {
    hasPassport: false,
  },
});

/**
 * Section 1 validation logic
 */
const validateSection1 = (data: Section1Data): ValidationError[] => {
  const errors: ValidationError[] = [];
  const { personalInfo, citizenship, passportInfo } = data;

  // Personal Info validations
  const nameError = ValidationUtils.required(personalInfo.fullName, 'Full Name');
  if (nameError) errors.push(nameError);

  const nameLength = ValidationUtils.maxLength(personalInfo.fullName, 100, 'Full Name');
  if (nameLength) errors.push(nameLength);

  const dobError = ValidationUtils.required(personalInfo.dateOfBirth, 'Date of Birth');
  if (dobError) errors.push(dobError);

  const dateError = ValidationUtils.date(personalInfo.dateOfBirth, 'Date of Birth');
  if (dateError) errors.push(dateError);

  const ssnError = ValidationUtils.required(personalInfo.ssn, 'SSN');
  if (ssnError) errors.push(ssnError);

  // SSN format validation
  if (personalInfo.ssn && !/^\d{3}-\d{2}-\d{4}$/.test(personalInfo.ssn)) {
    errors.push({
      field: 'SSN',
      message: 'SSN must be in format XXX-XX-XXXX',
      severity: 'error',
    });
  }

  // Email validation
  const emailError = ValidationUtils.email(personalInfo.email, 'Email');
  if (emailError) errors.push(emailError);

  // Phone validation
  personalInfo.phoneNumbers.forEach((phone, index) => {
    const phoneError = ValidationUtils.phone(phone.number, `Phone ${index + 1}`);
    if (phoneError) errors.push(phoneError);
  });

  // Address validation
  const { currentAddress } = personalInfo;
  if (!currentAddress.street || !currentAddress.city || !currentAddress.state || !currentAddress.zipCode) {
    errors.push({
      field: 'Current Address',
      message: 'Complete address is required',
      severity: 'error',
    });
  }

  // Citizenship validation
  if (citizenship.citizenshipStatus === 'naturalization') {
    if (!citizenship.naturalizationDate) {
      errors.push({
        field: 'Naturalization Date',
        message: 'Naturalization date is required',
        severity: 'error',
      });
    }
    if (!citizenship.naturalizationLocation) {
      errors.push({
        field: 'Naturalization Location',
        message: 'Naturalization location is required',
        severity: 'error',
      });
    }
  }

  // Passport validation
  if (passportInfo.hasPassport) {
    if (!passportInfo.passportNumber) {
      errors.push({
        field: 'Passport Number',
        message: 'Passport number is required when passport is indicated',
        severity: 'error',
      });
    }
    if (!passportInfo.expirationDate) {
      errors.push({
        field: 'Passport Expiration',
        message: 'Passport expiration date is required',
        severity: 'warning',
      });
    }
  }

  return errors;
};

/**
 * Create the Section 1 context using the factory
 */
const section1Context = createSectionContext<Section1Data>({
  sectionName: 'Section1',
  defaultData: createDefaultSection1Data(),
  validateSection: validateSection1,
  transformData: (data) => {
    // Auto-format SSN
    if (data.personalInfo.ssn) {
      const cleaned = data.personalInfo.ssn.replace(/\D/g, '');
      if (cleaned.length === 9) {
        data.personalInfo.ssn = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
      }
    }
    
    // Auto-format phone numbers
    data.personalInfo.phoneNumbers = data.personalInfo.phoneNumbers.map(phone => ({
      ...phone,
      number: formatPhoneNumber(phone.number),
    }));

    return data;
  },
});

/**
 * Export the provider and hook
 */
export const Section1Provider = section1Context.Provider;
export const useSection1 = section1Context.useContext;

/**
 * Additional helper hooks for Section 1
 */
export const useSection1Helpers = () => {
  const context = useSection1();

  const addPhoneNumber = () => {
    const newPhone: Section1PhoneNumber = {
      type: 'mobile',
      number: '',
      isPrimary: false,
    };
    context.updateField(
      'personalInfo.phoneNumbers',
      [...context.data.personalInfo.phoneNumbers, newPhone]
    );
  };

  const removePhoneNumber = (index: number) => {
    const newPhones = context.data.personalInfo.phoneNumbers.filter((_, i) => i !== index);
    context.updateField('personalInfo.phoneNumbers', newPhones);
  };

  const addOtherName = (name: string) => {
    context.updateField(
      'personalInfo.otherNamesUsed',
      [...context.data.personalInfo.otherNamesUsed, name]
    );
  };

  const removeOtherName = (index: number) => {
    const newNames = context.data.personalInfo.otherNamesUsed.filter((_, i) => i !== index);
    context.updateField('personalInfo.otherNamesUsed', newNames);
  };

  const isComplete = () => {
    const { personalInfo, citizenship } = context.data;
    return !!(
      personalInfo.fullName &&
      personalInfo.dateOfBirth &&
      personalInfo.ssn &&
      personalInfo.currentAddress.street &&
      personalInfo.email &&
      citizenship.citizenshipStatus
    );
  };

  return {
    addPhoneNumber,
    removePhoneNumber,
    addOtherName,
    removeOtherName,
    isComplete,
  };
};

/**
 * Utility functions
 */
function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}