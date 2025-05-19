import type { Field } from 'api/interfaces/formDefinition';
import type { ContactNumber } from 'api/interfaces/sections/contact';

/**
 * Represents a validation result
 */
interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Phone number formats
 */
enum PhoneFormat {
  US = 'US',        // (XXX) XXX-XXXX
  INTERNATIONAL = 'INTERNATIONAL', // Country code + national number
  DSN = 'DSN'       // Defense Switched Network format
}

/**
 * Validates an email address
 * 
 * @param email The email address to validate
 * @returns Validation result with error message if invalid
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: true }; // Empty is allowed (not required)
  }
  
  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      errorMessage: 'Please enter a valid email address'
    };
  }
  
  return { isValid: true };
}

/**
 * Formats a phone number based on specified format
 * 
 * @param phone The phone number to format
 * @param format The desired format (defaults to US)
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string, format: PhoneFormat = PhoneFormat.US): string {
  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, '');
  
  if (!digits) return phone;
  
  switch (format) {
    case PhoneFormat.US:
      // Format as (XXX) XXX-XXXX if 10 digits
      if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      }
      // Handle longer numbers (with country code)
      else if (digits.length > 10) {
        const countryCode = digits.slice(0, digits.length - 10);
        const areaCode = digits.slice(digits.length - 10, digits.length - 7);
        const prefix = digits.slice(digits.length - 7, digits.length - 4);
        const lineNumber = digits.slice(digits.length - 4);
        return `+${countryCode} (${areaCode}) ${prefix}-${lineNumber}`;
      }
      break;
      
    case PhoneFormat.INTERNATIONAL:
      // Attempt to format as international
      if (digits.length >= 11) {
        const countryCode = digits.slice(0, digits.length - 10);
        const nationalNumber = digits.slice(digits.length - 10);
        return `+${countryCode} ${nationalNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}`;
      }
      break;
      
    case PhoneFormat.DSN:
      // Format DSN numbers (typically 7 digits)
      if (digits.length === 7) {
        return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      }
      break;
  }
  
  // Return original if no formatting applied
  return phone;
}

/**
 * Validates a phone number
 * 
 * @param phone The phone number to validate
 * @param format The expected format
 * @returns Validation result with error message if invalid
 */
export function validatePhoneNumber(phone: string, format: PhoneFormat = PhoneFormat.US): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: true }; // Empty is allowed (not required)
  }
  
  // Remove all non-numeric characters for validation
  const digits = phone.replace(/\D/g, '');
  
  switch (format) {
    case PhoneFormat.US:
      // US numbers should have 10 digits
      if (digits.length < 10) {
        return {
          isValid: false,
          errorMessage: 'US phone numbers must have at least 10 digits'
        };
      }
      break;
      
    case PhoneFormat.INTERNATIONAL:
      // International numbers typically have country code + national number
      if (digits.length < 11) {
        return {
          isValid: false,
          errorMessage: 'International numbers must include country code'
        };
      }
      break;
      
    case PhoneFormat.DSN:
      // DSN numbers are typically 7 digits
      if (digits.length !== 7) {
        return {
          isValid: false,
          errorMessage: 'DSN numbers must have 7 digits'
        };
      }
      break;
  }
  
  return { isValid: true };
}

/**
 * Creates a new formatted phone field
 * 
 * @param phone The phone number string
 * @param format The format to apply
 * @param id Optional field ID
 * @param label Optional field label
 * @returns A formatted Field<string> for a phone number
 */
export function createPhoneField(
  phone: string,
  format: PhoneFormat = PhoneFormat.US,
  id?: string,
  label?: string
): Field<string> {
  return {
    value: formatPhoneNumber(phone, format),
    id: id || '',
    type: 'PDFTextField',
    label: label || 'Phone Number'
  };
}

/**
 * Creates a new empty ContactNumber object with default field values
 * 
 * @param id The contact number ID
 * @param label Label prefix for the fields
 * @returns A new ContactNumber object
 */
export function createEmptyContactNumber(id: number, label: string = ''): ContactNumber {
  return {
    _id: id,
    phoneNumber: {
      value: '',
      id: '',
      type: 'PDFTextField',
      label: label ? `${label} telephone number` : 'Telephone number'
    },
    extension: {
      value: '',
      id: '',
      type: 'PDFTextField',
      label: 'Extension'
    },
    isUsableDay: {
      value: 'NO',
      id: '',
      type: 'PDFCheckBox',
      label: 'Day'
    },
    isUsableNight: {
      value: 'NO',
      id: '',
      type: 'PDFCheckBox',
      label: 'Night'
    },
    internationalOrDSN: {
      value: 'NO',
      id: '',
      type: 'PDFCheckBox',
      label: label ? `${label} telephone number: International or D S N phone number` : 'International or D S N phone number'
    }
  };
}

/**
 * Determines if a phone number is formatted as international or DSN
 * 
 * @param phone The phone number to check
 * @returns The detected format
 */
export function detectPhoneFormat(phone: string): PhoneFormat {
  if (!phone) return PhoneFormat.US;
  
  const digits = phone.replace(/\D/g, '');
  
  // Check for international format (has + or more than 10 digits)
  if (phone.includes('+') || digits.length > 10) {
    return PhoneFormat.INTERNATIONAL;
  }
  
  // Check for DSN format (exactly 7 digits with specific pattern)
  if (digits.length === 7 && /^\d{3}-\d{4}$/.test(phone.replace(/\s/g, ''))) {
    return PhoneFormat.DSN;
  }
  
  // Default to US format
  return PhoneFormat.US;
}

/**
 * Provides accessibility attributes for phone number input fields
 * 
 * @param isInvalid Whether the field has an invalid value
 * @param errorMessage Error message if invalid
 * @returns Accessibility attributes for the input field
 */
export function getPhoneFieldAccessibilityProps(isInvalid: boolean, errorMessage?: string) {
  return {
    'aria-invalid': isInvalid,
    'aria-errormessage': isInvalid && errorMessage ? errorMessage : undefined,
    'aria-describedby': isInvalid && errorMessage ? 'phone-error' : undefined
  };
}

/**
 * Provides accessibility attributes for email input fields
 * 
 * @param isInvalid Whether the field has an invalid value
 * @param errorMessage Error message if invalid
 * @returns Accessibility attributes for the input field
 */
export function getEmailFieldAccessibilityProps(isInvalid: boolean, errorMessage?: string) {
  return {
    'aria-invalid': isInvalid,
    'aria-errormessage': isInvalid && errorMessage ? errorMessage : undefined,
    'aria-describedby': isInvalid && errorMessage ? 'email-error' : undefined
  };
}

// Export the phone format enum for use in other components
export { PhoneFormat }; 