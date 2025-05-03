/**
 * Enumeration for field types in the SF-86 form
 */
export enum FieldType {
  Text = 'text',
  Dropdown = 'dropdown',
  RadioGroup = 'radioGroup',
  Checkbox = 'checkbox',
  Date = 'date',
  TextArea = 'textarea',
  PhoneNumber = 'phoneNumber',
  Email = 'email',
  SocialSecurityNumber = 'ssn'
}

/**
 * Enumeration for validation states
 */
export enum ValidationState {
  Valid = 'valid',
  Invalid = 'invalid',
  Unknown = 'unknown',
  Empty = 'empty'
}

/**
 * Enumeration for confidence levels in field mapping
 */
export enum ConfidenceLevel {
  High = 'high',     // Confidence score >= 0.8
  Medium = 'medium', // Confidence score >= 0.5 and < 0.8
  Low = 'low'        // Confidence score < 0.5
}

/**
 * Enumeration for classification categories
 */
export enum ClassificationCategory {
  PersonalInformation = 'personalInformation',
  ContactInformation = 'contactInformation',
  CitizenshipInformation = 'citizenshipInformation',
  EmploymentHistory = 'employmentHistory',
  EducationHistory = 'educationHistory',
  ResidenceHistory = 'residenceHistory',
  References = 'references',
  MilitaryHistory = 'militaryHistory',
  ForeignContacts = 'foreignContacts',
  ForeignActivities = 'foreignActivities',
  MedicalHistory = 'medicalHistory',
  LegalHistory = 'legalHistory',
  FinancialHistory = 'financialHistory'
} 