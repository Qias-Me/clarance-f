/**
 * Section 1: Personal Information (Refactored)
 * 
 * Uses shared base types and eliminates duplication
 */

import type { Field, FieldWithOptions } from '../formDefinition2.0';
import type {
  BaseSection,
  PersonName,
  BooleanChoice,
  ContactInfo,
  SectionConfig,
  ValidationResult,
  ValidationError
} from './shared/base-types';
import {
  validatePersonName,
  validateSSN,
  validateEmail,
  validatePhone,
  CommonValidationRules
} from './shared/validation-patterns';

/**
 * Section 1 specific data structure
 */
export interface Section1Data {
  personalInfo: PersonalInformation;
  otherNames: OtherNamesUsed;
  identification: Identification;
  contactInfo: ContactInformation;
  additionalInfo: AdditionalInformation;
}

/**
 * Personal information fields
 */
export interface PersonalInformation extends PersonName {
  dateOfBirth: Field<string>;
  placeOfBirth: PlaceOfBirth;
  sex: FieldWithOptions<'Male' | 'Female'>;
  height: {
    feet: Field<number>;
    inches: Field<number>;
  };
  weight: Field<number>;
  hairColor: FieldWithOptions<string>;
  eyeColor: FieldWithOptions<string>;
}

/**
 * Place of birth
 */
export interface PlaceOfBirth {
  city: Field<string>;
  state: FieldWithOptions<string>;
  country: FieldWithOptions<string>;
  countyOrProvince?: Field<string>;
}

/**
 * Other names used
 */
export interface OtherNamesUsed {
  hasOtherNames: BooleanChoice;
  otherNames?: PersonName[];
}

/**
 * Identification documents
 */
export interface Identification {
  ssn: Field<string>;
  alienRegistrationNumber?: Field<string>;
  passportNumber?: Field<string>;
  passportCountry?: FieldWithOptions<string>;
  driversLicense?: {
    number: Field<string>;
    state: FieldWithOptions<string>;
    expirationDate: Field<string>;
  };
}

/**
 * Contact information
 */
export interface ContactInformation extends ContactInfo {
  preferredContactMethod: FieldWithOptions<'email' | 'phone' | 'mail'>;
  bestTimeToContact?: Field<string>;
}

/**
 * Additional information
 */
export interface AdditionalInformation {
  maritalStatus: FieldWithOptions<'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated'>;
  numberOfChildren?: Field<number>;
  emergencyContact?: {
    name: PersonName;
    relationship: Field<string>;
    contactInfo: ContactInfo;
  };
}

/**
 * Section 1 interface extending base
 */
export interface Section1 extends BaseSection<Section1Data> {
  sectionNumber: 1;
  sectionName: 'Personal Information';
}

/**
 * Section 1 configuration
 */
export const section1Config: SectionConfig<Section1Data> = {
  sectionNumber: 1,
  sectionName: 'Personal Information',
  sectionTitle: 'Personal Information',
  sectionDescription: 'Provide your personal information including name, date of birth, and contact details.',
  initialData: createDefaultSection1Data(),
  validationRules: {
    personalInfo: CommonValidationRules.requiredText,
    identification: CommonValidationRules.requiredSSN,
    contactInfo: CommonValidationRules.requiredText
  }
};

/**
 * Create default Section 1 data
 */
export function createDefaultSection1Data(): Section1Data {
  return {
    personalInfo: {
      lastName: createField(''),
      firstName: createField(''),
      middleName: createField(''),
      suffix: createFieldWithOptions(''),
      dateOfBirth: createField(''),
      placeOfBirth: {
        city: createField(''),
        state: createFieldWithOptions(''),
        country: createFieldWithOptions('United States'),
        countyOrProvince: createField('')
      },
      sex: createFieldWithOptions(''),
      height: {
        feet: createField(0),
        inches: createField(0)
      },
      weight: createField(0),
      hairColor: createFieldWithOptions(''),
      eyeColor: createFieldWithOptions('')
    },
    otherNames: {
      hasOtherNames: createField('NO'),
      otherNames: []
    },
    identification: {
      ssn: createField(''),
      alienRegistrationNumber: createField(''),
      passportNumber: createField(''),
      passportCountry: createFieldWithOptions(''),
      driversLicense: {
        number: createField(''),
        state: createFieldWithOptions(''),
        expirationDate: createField('')
      }
    },
    contactInfo: {
      phone: {
        number: createField(''),
        type: createFieldWithOptions('mobile')
      },
      email: createField(''),
      address: {
        street: createField(''),
        street2: createField(''),
        city: createField(''),
        state: createFieldWithOptions(''),
        zipCode: createField(''),
        country: createFieldWithOptions('United States')
      },
      preferredContactMethod: createFieldWithOptions('email'),
      bestTimeToContact: createField('')
    },
    additionalInfo: {
      maritalStatus: createFieldWithOptions('Single'),
      numberOfChildren: createField(0),
      emergencyContact: undefined
    }
  };
}

/**
 * Validate Section 1 data
 */
export function validateSection1(data: Section1Data): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validate personal info
  errors.push(...validatePersonName(data.personalInfo, true));
  
  // Validate date of birth
  if (!data.personalInfo.dateOfBirth?.value) {
    errors.push({
      field: 'dateOfBirth',
      message: 'Date of birth is required'
    });
  } else {
    const dob = new Date(data.personalInfo.dateOfBirth.value);
    const now = new Date();
    const age = Math.floor((now.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    
    if (age < 18) {
      errors.push({
        field: 'dateOfBirth',
        message: 'You must be at least 18 years old'
      });
    }
    
    if (age > 120) {
      errors.push({
        field: 'dateOfBirth',
        message: 'Please verify date of birth'
      });
    }
  }
  
  // Validate place of birth
  if (!data.personalInfo.placeOfBirth.city?.value) {
    errors.push({
      field: 'placeOfBirth.city',
      message: 'Place of birth city is required'
    });
  }
  
  // Validate SSN
  const ssnError = validateSSN(data.identification.ssn, true);
  if (ssnError) errors.push(ssnError);
  
  // Validate contact info
  const emailError = validateEmail(data.contactInfo.email!, true);
  if (emailError) errors.push(emailError);
  
  const phoneError = validatePhone(data.contactInfo.phone!.number, true);
  if (phoneError) errors.push(phoneError);
  
  // Validate other names if applicable
  if (data.otherNames.hasOtherNames?.value === 'YES') {
    if (!data.otherNames.otherNames || data.otherNames.otherNames.length === 0) {
      errors.push({
        field: 'otherNames',
        message: 'Please provide other names used'
      });
    } else {
      data.otherNames.otherNames.forEach((name, index) => {
        const nameErrors = validatePersonName(name, true);
        nameErrors.forEach(error => {
          error.field = `otherNames.${index}.${error.field}`;
        });
        errors.push(...nameErrors);
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Helper to create a Field
 */
function createField<T>(value: T): Field<T> {
  return {
    id: '',
    value,
    label: '',
    name: '',
    type: 'PDFTextField',
    required: false,
    section: 1,
    rect: { x: 0, y: 0, width: 0, height: 0 }
  };
}

/**
 * Helper to create a FieldWithOptions
 */
function createFieldWithOptions<T>(value: T): FieldWithOptions<T> {
  return {
    ...createField(value),
    options: []
  };
}

/**
 * Export field mappings for registration
 */
export const section1FieldMappings = [
  ['personalInfo.lastName', '1000', 'form1[0].Page1[0].LastName[0]'],
  ['personalInfo.firstName', '1001', 'form1[0].Page1[0].FirstName[0]'],
  ['personalInfo.middleName', '1002', 'form1[0].Page1[0].MiddleName[0]'],
  ['personalInfo.suffix', '1003', 'form1[0].Page1[0].Suffix[0]'],
  ['personalInfo.dateOfBirth', '1004', 'form1[0].Page1[0].DateOfBirth[0]'],
  ['personalInfo.placeOfBirth.city', '1005', 'form1[0].Page1[0].PlaceOfBirthCity[0]'],
  ['personalInfo.placeOfBirth.state', '1006', 'form1[0].Page1[0].PlaceOfBirthState[0]'],
  ['personalInfo.placeOfBirth.country', '1007', 'form1[0].Page1[0].PlaceOfBirthCountry[0]'],
  ['personalInfo.sex', '1008', 'form1[0].Page1[0].Sex[0]'],
  ['personalInfo.height.feet', '1009', 'form1[0].Page1[0].HeightFeet[0]'],
  ['personalInfo.height.inches', '1010', 'form1[0].Page1[0].HeightInches[0]'],
  ['personalInfo.weight', '1011', 'form1[0].Page1[0].Weight[0]'],
  ['personalInfo.hairColor', '1012', 'form1[0].Page1[0].HairColor[0]'],
  ['personalInfo.eyeColor', '1013', 'form1[0].Page1[0].EyeColor[0]'],
  ['identification.ssn', '1014', 'form1[0].Page1[0].SSN[0]'],
  ['contactInfo.email', '1015', 'form1[0].Page1[0].Email[0]'],
  ['contactInfo.phone.number', '1016', 'form1[0].Page1[0].Phone[0]'],
  ['contactInfo.address.street', '1017', 'form1[0].Page1[0].Street[0]'],
  ['contactInfo.address.city', '1018', 'form1[0].Page1[0].City[0]'],
  ['contactInfo.address.state', '1019', 'form1[0].Page1[0].State[0]'],
  ['contactInfo.address.zipCode', '1020', 'form1[0].Page1[0].ZipCode[0]']
];