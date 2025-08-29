/**
 * Centralized Field Configuration System
 * Eliminates duplication across 30+ sections with standardized field definitions
 */

export interface BaseFieldConfig {
  id: string;
  type: 'text' | 'select' | 'checkbox' | 'textarea' | 'date' | 'email' | 'tel' | 'number';
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  maxLength?: number;
  pattern?: string;
  validation?: ValidationConfig[];
  conditional?: ConditionalConfig;
  accessibility?: AccessibilityConfig;
}

export interface SelectFieldConfig extends BaseFieldConfig {
  type: 'select';
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  multiple?: boolean;
}

export interface TextFieldConfig extends BaseFieldConfig {
  type: 'text' | 'email' | 'tel';
  autoComplete?: string;
  spellCheck?: boolean;
}

export interface DateFieldConfig extends BaseFieldConfig {
  type: 'date';
  min?: string;
  max?: string;
  format?: 'MM/dd/yyyy' | 'yyyy-MM-dd';
}

export interface CheckboxFieldConfig extends BaseFieldConfig {
  type: 'checkbox';
  checkedLabel?: string;
  uncheckedLabel?: string;
}

export interface TextareaFieldConfig extends BaseFieldConfig {
  type: 'textarea';
  rows?: number;
  cols?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

export type FieldConfig = 
  | TextFieldConfig 
  | SelectFieldConfig 
  | DateFieldConfig 
  | CheckboxFieldConfig 
  | TextareaFieldConfig;

export interface ValidationConfig {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  severity: 'error' | 'warning';
}

export interface ConditionalConfig {
  dependsOn: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'custom';
  value: any;
  customFn?: (dependentValue: any, formData: any) => boolean;
}

export interface AccessibilityConfig {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
}

/**
 * Standard field configurations used across multiple sections
 */
export const COMMON_FIELDS = {
  // Personal Information Fields
  firstName: {
    id: 'firstName',
    type: 'text',
    label: 'First Name',
    required: true,
    maxLength: 50,
    autoComplete: 'given-name',
    validation: [
      { type: 'required', message: 'First name is required', severity: 'error' },
      { type: 'maxLength', value: 50, message: 'First name cannot exceed 50 characters', severity: 'error' }
    ],
    accessibility: {
      ariaLabel: 'Enter your legal first name'
    }
  } as TextFieldConfig,

  lastName: {
    id: 'lastName',
    type: 'text',
    label: 'Last Name',
    required: true,
    maxLength: 50,
    autoComplete: 'family-name',
    validation: [
      { type: 'required', message: 'Last name is required', severity: 'error' },
      { type: 'maxLength', value: 50, message: 'Last name cannot exceed 50 characters', severity: 'error' }
    ],
    accessibility: {
      ariaLabel: 'Enter your legal last name'
    }
  } as TextFieldConfig,

  middleName: {
    id: 'middleName',
    type: 'text',
    label: 'Middle Name',
    required: false,
    maxLength: 50,
    autoComplete: 'additional-name',
    helpText: 'Leave blank if no middle name',
    validation: [
      { type: 'maxLength', value: 50, message: 'Middle name cannot exceed 50 characters', severity: 'error' }
    ]
  } as TextFieldConfig,

  dateOfBirth: {
    id: 'dateOfBirth',
    type: 'date',
    label: 'Date of Birth',
    required: true,
    max: new Date().toISOString().split('T')[0], // Today
    autoComplete: 'bday',
    validation: [
      { type: 'required', message: 'Date of birth is required', severity: 'error' },
      { type: 'custom', message: 'Date must be in the past', severity: 'error' }
    ],
    accessibility: {
      ariaLabel: 'Enter your date of birth in MM/DD/YYYY format'
    }
  } as DateFieldConfig,

  // Contact Information
  email: {
    id: 'email',
    type: 'email',
    label: 'Email Address',
    required: true,
    autoComplete: 'email',
    validation: [
      { type: 'required', message: 'Email address is required', severity: 'error' },
      { type: 'pattern', value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address', severity: 'error' }
    ]
  } as TextFieldConfig,

  phone: {
    id: 'phone',
    type: 'tel',
    label: 'Phone Number',
    placeholder: '(555) 123-4567',
    autoComplete: 'tel',
    pattern: '[0-9]{3}-[0-9]{3}-[0-9]{4}',
    validation: [
      { type: 'pattern', value: /^\(\d{3}\)\s\d{3}-\d{4}$/, message: 'Please enter a valid phone number', severity: 'error' }
    ]
  } as TextFieldConfig,

  // Address Fields
  streetAddress: {
    id: 'streetAddress',
    type: 'text',
    label: 'Street Address',
    required: true,
    maxLength: 100,
    autoComplete: 'street-address',
    validation: [
      { type: 'required', message: 'Street address is required', severity: 'error' },
      { type: 'maxLength', value: 100, message: 'Street address cannot exceed 100 characters', severity: 'error' }
    ]
  } as TextFieldConfig,

  city: {
    id: 'city',
    type: 'text',
    label: 'City',
    required: true,
    maxLength: 50,
    autoComplete: 'address-level2',
    validation: [
      { type: 'required', message: 'City is required', severity: 'error' },
      { type: 'maxLength', value: 50, message: 'City name cannot exceed 50 characters', severity: 'error' }
    ]
  } as TextFieldConfig,

  state: {
    id: 'state',
    type: 'select',
    label: 'State',
    required: true,
    autoComplete: 'address-level1',
    options: [
      { value: '', label: 'Select State...' },
      { value: 'AL', label: 'Alabama' },
      { value: 'AK', label: 'Alaska' },
      { value: 'AZ', label: 'Arizona' },
      { value: 'AR', label: 'Arkansas' },
      { value: 'CA', label: 'California' },
      { value: 'CO', label: 'Colorado' },
      { value: 'CT', label: 'Connecticut' },
      { value: 'DE', label: 'Delaware' },
      { value: 'DC', label: 'District of Columbia' },
      { value: 'FL', label: 'Florida' },
      { value: 'GA', label: 'Georgia' },
      { value: 'HI', label: 'Hawaii' },
      { value: 'ID', label: 'Idaho' },
      { value: 'IL', label: 'Illinois' },
      { value: 'IN', label: 'Indiana' },
      { value: 'IA', label: 'Iowa' },
      { value: 'KS', label: 'Kansas' },
      { value: 'KY', label: 'Kentucky' },
      { value: 'LA', label: 'Louisiana' },
      { value: 'ME', label: 'Maine' },
      { value: 'MD', label: 'Maryland' },
      { value: 'MA', label: 'Massachusetts' },
      { value: 'MI', label: 'Michigan' },
      { value: 'MN', label: 'Minnesota' },
      { value: 'MS', label: 'Mississippi' },
      { value: 'MO', label: 'Missouri' },
      { value: 'MT', label: 'Montana' },
      { value: 'NE', label: 'Nebraska' },
      { value: 'NV', label: 'Nevada' },
      { value: 'NH', label: 'New Hampshire' },
      { value: 'NJ', label: 'New Jersey' },
      { value: 'NM', label: 'New Mexico' },
      { value: 'NY', label: 'New York' },
      { value: 'NC', label: 'North Carolina' },
      { value: 'ND', label: 'North Dakota' },
      { value: 'OH', label: 'Ohio' },
      { value: 'OK', label: 'Oklahoma' },
      { value: 'OR', label: 'Oregon' },
      { value: 'PA', label: 'Pennsylvania' },
      { value: 'RI', label: 'Rhode Island' },
      { value: 'SC', label: 'South Carolina' },
      { value: 'SD', label: 'South Dakota' },
      { value: 'TN', label: 'Tennessee' },
      { value: 'TX', label: 'Texas' },
      { value: 'UT', label: 'Utah' },
      { value: 'VT', label: 'Vermont' },
      { value: 'VA', label: 'Virginia' },
      { value: 'WA', label: 'Washington' },
      { value: 'WV', label: 'West Virginia' },
      { value: 'WI', label: 'Wisconsin' },
      { value: 'WY', label: 'Wyoming' }
    ],
    validation: [
      { type: 'required', message: 'State is required', severity: 'error' }
    ]
  } as SelectFieldConfig,

  zipCode: {
    id: 'zipCode',
    type: 'text',
    label: 'ZIP Code',
    required: true,
    maxLength: 10,
    pattern: '[0-9]{5}(-[0-9]{4})?',
    placeholder: '12345 or 12345-6789',
    autoComplete: 'postal-code',
    validation: [
      { type: 'required', message: 'ZIP code is required', severity: 'error' },
      { type: 'pattern', value: /^\d{5}(-\d{4})?$/, message: 'Please enter a valid ZIP code', severity: 'error' }
    ]
  } as TextFieldConfig,

  country: {
    id: 'country',
    type: 'select',
    label: 'Country',
    required: true,
    autoComplete: 'country',
    options: [
      { value: 'US', label: 'United States' },
      { value: 'CA', label: 'Canada' },
      { value: 'MX', label: 'Mexico' },
      { value: 'OTHER', label: 'Other (specify in comments)' }
    ],
    validation: [
      { type: 'required', message: 'Country is required', severity: 'error' }
    ]
  } as SelectFieldConfig,

  // Yes/No Questions
  yesNo: {
    id: 'yesNo',
    type: 'select',
    label: 'Yes/No Question',
    required: true,
    options: [
      { value: '', label: 'Select...' },
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ],
    validation: [
      { type: 'required', message: 'Please select yes or no', severity: 'error' }
    ]
  } as SelectFieldConfig
} as const;

/**
 * Section-specific field configurations
 */
export const SECTION_CONFIGS = {
  section1: {
    title: 'Information About You',
    description: 'Provide your full legal name as it appears on official documents.',
    fields: [
      COMMON_FIELDS.lastName,
      COMMON_FIELDS.firstName,
      COMMON_FIELDS.middleName,
      {
        ...COMMON_FIELDS.dateOfBirth,
        helpText: 'Enter your date of birth as it appears on your birth certificate'
      },
      {
        id: 'placeOfBirth',
        type: 'text',
        label: 'Place of Birth (City, State/Province, Country)',
        required: true,
        maxLength: 100,
        validation: [
          { type: 'required', message: 'Place of birth is required', severity: 'error' }
        ]
      } as TextFieldConfig
    ]
  },

  section2: {
    title: 'Your Citizenship',
    description: 'Provide information about your citizenship status.',
    fields: [
      {
        id: 'usCitizen',
        type: 'select',
        label: 'Are you a citizen of the United States?',
        required: true,
        options: [
          { value: '', label: 'Select...' },
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        validation: [
          { type: 'required', message: 'Please indicate your citizenship status', severity: 'error' }
        ]
      } as SelectFieldConfig
    ]
  },

  section3: {
    title: 'Your Military History',
    description: 'Provide information about your military service history.',
    fields: [
      {
        id: 'militaryService',
        type: 'select',
        label: 'Have you ever served in the United States military?',
        required: true,
        options: [
          { value: '', label: 'Select...' },
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        validation: [
          { type: 'required', message: 'Please indicate your military service status', severity: 'error' }
        ],
        conditional: {
          dependsOn: 'militaryService',
          condition: 'equals',
          value: 'yes'
        }
      } as SelectFieldConfig
    ]
  }
} as const;

/**
 * Field configuration utilities
 */
export class FieldConfigManager {
  /**
   * Get field configuration by section and field ID
   */
  static getFieldConfig(sectionNumber: number, fieldId: string): FieldConfig | undefined {
    const sectionKey = `section${sectionNumber}` as keyof typeof SECTION_CONFIGS;
    const sectionConfig = SECTION_CONFIGS[sectionKey];
    return sectionConfig?.fields.find(field => field.id === fieldId);
  }

  /**
   * Get all fields for a section
   */
  static getSectionFields(sectionNumber: number): FieldConfig[] {
    const sectionKey = `section${sectionNumber}` as keyof typeof SECTION_CONFIGS;
    return SECTION_CONFIGS[sectionKey]?.fields || [];
  }

  /**
   * Validate field configuration
   */
  static validateFieldConfig(config: FieldConfig): string[] {
    const errors: string[] = [];
    
    if (!config.id) errors.push('Field ID is required');
    if (!config.label) errors.push('Field label is required');
    if (!config.type) errors.push('Field type is required');
    
    if (config.type === 'select' && !(config as SelectFieldConfig).options?.length) {
      errors.push('Select fields must have options');
    }
    
    return errors;
  }

  /**
   * Create field configuration with defaults
   */
  static createFieldConfig(overrides: Partial<FieldConfig>): FieldConfig {
    return {
      type: 'text',
      required: false,
      ...overrides
    } as FieldConfig;
  }
}