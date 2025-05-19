import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  formatPhoneNumber,
  validatePhoneNumber,
  createPhoneField,
  createEmptyContactNumber,
  detectPhoneFormat,
  getPhoneFieldAccessibilityProps,
  getEmailFieldAccessibilityProps,
  PhoneFormat
} from '../contactHandlers';

describe('Email Validation', () => {
  it('should validate correct email addresses', () => {
    expect(validateEmail('test@example.com').isValid).toBe(true);
    expect(validateEmail('user.name+tag@example.co.uk').isValid).toBe(true);
    expect(validateEmail('firstname.lastname@domain.com').isValid).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(validateEmail('test@example').isValid).toBe(false);
    expect(validateEmail('test@.com').isValid).toBe(false);
    expect(validateEmail('test@com').isValid).toBe(false);
    expect(validateEmail('test@@example.com').isValid).toBe(false);
    expect(validateEmail('test.com').isValid).toBe(false);
  });

  it('should allow empty email addresses', () => {
    expect(validateEmail('').isValid).toBe(true);
    expect(validateEmail('   ').isValid).toBe(true);
  });
});

describe('Phone Number Formatting', () => {
  it('should format US phone numbers correctly', () => {
    expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
    expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890');
    expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
  });

  it('should format international phone numbers correctly', () => {
    expect(formatPhoneNumber('442071234567', PhoneFormat.INTERNATIONAL))
      .toBe('+44 207 123 4567');
    expect(formatPhoneNumber('+44 20 7123 4567', PhoneFormat.INTERNATIONAL))
      .toBe('+44 207 123 4567');
  });

  it('should format DSN numbers correctly', () => {
    expect(formatPhoneNumber('1234567', PhoneFormat.DSN)).toBe('123-4567');
    expect(formatPhoneNumber('123-4567', PhoneFormat.DSN)).toBe('123-4567');
  });

  it('should return original value if formatting cannot be applied', () => {
    expect(formatPhoneNumber('123')).toBe('123');
    expect(formatPhoneNumber('', PhoneFormat.DSN)).toBe('');
  });
});

describe('Phone Number Validation', () => {
  it('should validate US phone numbers correctly', () => {
    expect(validatePhoneNumber('1234567890').isValid).toBe(true);
    expect(validatePhoneNumber('(123) 456-7890').isValid).toBe(true);
    expect(validatePhoneNumber('123-456-7890').isValid).toBe(true);
    expect(validatePhoneNumber('123456789').isValid).toBe(false);
  });

  it('should validate international phone numbers correctly', () => {
    expect(validatePhoneNumber('442071234567', PhoneFormat.INTERNATIONAL).isValid).toBe(true);
    expect(validatePhoneNumber('+44 20 7123 4567', PhoneFormat.INTERNATIONAL).isValid).toBe(true);
    expect(validatePhoneNumber('1234567890', PhoneFormat.INTERNATIONAL).isValid).toBe(false);
  });

  it('should validate DSN numbers correctly', () => {
    expect(validatePhoneNumber('1234567', PhoneFormat.DSN).isValid).toBe(true);
    expect(validatePhoneNumber('123-4567', PhoneFormat.DSN).isValid).toBe(true);
    expect(validatePhoneNumber('12345', PhoneFormat.DSN).isValid).toBe(false);
  });

  it('should allow empty phone numbers', () => {
    expect(validatePhoneNumber('').isValid).toBe(true);
    expect(validatePhoneNumber('   ').isValid).toBe(true);
  });
});

describe('Phone Format Detection', () => {
  it('should detect US format correctly', () => {
    expect(detectPhoneFormat('1234567890')).toBe(PhoneFormat.US);
    expect(detectPhoneFormat('(123) 456-7890')).toBe(PhoneFormat.US);
  });

  it('should detect international format correctly', () => {
    expect(detectPhoneFormat('+442071234567')).toBe(PhoneFormat.INTERNATIONAL);
    expect(detectPhoneFormat('442071234567')).toBe(PhoneFormat.INTERNATIONAL);
  });

  it('should detect DSN format correctly', () => {
    expect(detectPhoneFormat('123-4567')).toBe(PhoneFormat.DSN);
  });

  it('should default to US format for empty values', () => {
    expect(detectPhoneFormat('')).toBe(PhoneFormat.US);
    expect(detectPhoneFormat(null as unknown as string)).toBe(PhoneFormat.US);
  });
});

describe('Field Creation Utilities', () => {
  it('should create a phone field with correct values', () => {
    const field = createPhoneField('1234567890', PhoneFormat.US, '123', 'Test Label');
    expect(field.value).toBe('(123) 456-7890');
    expect(field.id).toBe('123');
    expect(field.type).toBe('PDFTextField');
    expect(field.label).toBe('Test Label');
  });

  it('should create an empty contact number with correct structure', () => {
    const contactNumber = createEmptyContactNumber(5, 'Home');
    expect(contactNumber._id).toBe(5);
    expect(contactNumber.phoneNumber.value).toBe('');
    expect(contactNumber.phoneNumber.label).toBe('Home telephone number');
    expect(contactNumber.extension.value).toBe('');
    expect(contactNumber.isUsableDay.value).toBe('NO');
    expect(contactNumber.isUsableNight.value).toBe('NO');
    expect(contactNumber.internationalOrDSN.value).toBe('NO');
  });
});

describe('Accessibility Utilities', () => {
  it('should generate correct phone field accessibility props when invalid', () => {
    const props = getPhoneFieldAccessibilityProps(true, 'Invalid phone number');
    expect(props['aria-invalid']).toBe(true);
    expect(props['aria-errormessage']).toBe('Invalid phone number');
    expect(props['aria-describedby']).toBe('phone-error');
  });

  it('should generate correct phone field accessibility props when valid', () => {
    const props = getPhoneFieldAccessibilityProps(false);
    expect(props['aria-invalid']).toBe(false);
    expect(props['aria-errormessage']).toBeUndefined();
    expect(props['aria-describedby']).toBeUndefined();
  });

  it('should generate correct email field accessibility props when invalid', () => {
    const props = getEmailFieldAccessibilityProps(true, 'Invalid email address');
    expect(props['aria-invalid']).toBe(true);
    expect(props['aria-errormessage']).toBe('Invalid email address');
    expect(props['aria-describedby']).toBe('email-error');
  });
}); 