import type { FieldHierarchy, FieldMetadata } from 'api/interfaces/FieldMetadata';
import type { ContactInfo, ContactNumber } from 'api/interfaces/sections/contact';

/**
 * Represents a field with an additional category property
 */
interface CategorizedField extends FieldMetadata {
  category?: string;
}

/**
 * Extract all contact information fields from Section 7 in the field hierarchy
 * 
 * @param fieldHierarchy The complete field hierarchy data
 * @returns Object containing extracted contact fields categorized by type
 */
export function extractContactFields(fieldHierarchy: FieldHierarchy) {
  const contactFields = {
    emails: [] as CategorizedField[],
    phones: [] as CategorizedField[],
    extensions: [] as FieldMetadata[],
    dayUsability: [] as FieldMetadata[],
    nightUsability: [] as FieldMetadata[],
    internationalFlags: [] as FieldMetadata[]
  };

  // Go through all forms in the hierarchy
  Object.values(fieldHierarchy).forEach(form => {
    if (!form.fields) return;
    
    // Filter fields to those in Section 7
    const section7Fields = form.fields.filter(field => {
      // Check section number directly in id, name, or section property
      const sectionMatch = 
        (field.section === 7) || 
        (field.id && field.id.includes('section7')) ||
        (field.name && field.name.toLowerCase().includes('section 7')) ||
        (field.label && field.label.toLowerCase().includes('section 7'));
      
      // Match specific contact-related keywords in name or label
      const contactMatch = 
        (field.name && /email|phone|telephone|contact|extension/i.test(field.name)) ||
        (field.label && /email|phone|telephone|contact|extension/i.test(field.label));
      
      return sectionMatch && contactMatch;
    });
    
    // Categorize the fields
    section7Fields.forEach(field => {
      const name = (field.name || '').toLowerCase();
      const label = (field.label || '').toLowerCase();
      
      // Email fields
      if (name.includes('email') || label.includes('email')) {
        if (name.includes('home') || label.includes('home')) {
          contactFields.emails.push({...field, category: 'homeEmail'});
        } else if (name.includes('work') || label.includes('work')) {
          contactFields.emails.push({...field, category: 'workEmail'});
        } else {
          contactFields.emails.push({...field, category: 'otherEmail'});
        }
      }
      
      // Phone fields
      else if (name.includes('phone') || name.includes('telephone') || 
               label.includes('phone') || label.includes('telephone')) {
        if (name.includes('home') || label.includes('home')) {
          contactFields.phones.push({...field, category: 'homePhone'});
        } else if (name.includes('work') || label.includes('work')) {
          contactFields.phones.push({...field, category: 'workPhone'});
        } else if (name.includes('mobile') || name.includes('cell') || 
                  label.includes('mobile') || label.includes('cell')) {
          contactFields.phones.push({...field, category: 'mobilePhone'});
        } else {
          contactFields.phones.push({...field, category: 'otherPhone'});
        }
      }
      
      // Extension fields
      else if (name.includes('extension') || label.includes('extension')) {
        contactFields.extensions.push(field);
      }
      
      // Day usability fields
      else if ((name.includes('day') || label.includes('day')) && 
              !name.includes('night') && !label.includes('night')) {
        contactFields.dayUsability.push(field);
      }
      
      // Night usability fields
      else if ((name.includes('night') || label.includes('night')) && 
              !name.includes('day') && !label.includes('day')) {
        contactFields.nightUsability.push(field);
      }
      
      // International flags
      else if (name.includes('international') || label.includes('international') ||
              name.includes('dsn') || label.includes('dsn')) {
        contactFields.internationalFlags.push(field);
      }
    });
  });
  
  return contactFields;
}

/**
 * Maps contact fields to the ContactInfo interface structure
 * 
 * @param contactFields The extracted contact fields
 * @returns ContactInfo object with mapped fields
 */
export function mapFieldsToContactInfo(contactFields: ReturnType<typeof extractContactFields>): ContactInfo {
  const contactInfo: ContactInfo = {
    homeEmail: findHomeEmailField(contactFields.emails),
    workEmail: findWorkEmailField(contactFields.emails),
    contactNumbers: buildContactNumbers(contactFields)
  };
  
  return contactInfo;
}

/**
 * Finds and returns the home email field
 */
function findHomeEmailField(emailFields: CategorizedField[]): any {
  const homeEmail = emailFields.find(field => 
    field.category === 'homeEmail' ||
    (field.name && field.name.toLowerCase().includes('home')) ||
    (field.label && field.label.toLowerCase().includes('home'))
  );
  
  if (!homeEmail) return { value: '', id: '', type: 'PDFTextField', label: 'Home e-mail address' };
  
  return {
    value: homeEmail.value || '',
    id: homeEmail.id || '',
    type: homeEmail.type || 'PDFTextField',
    label: homeEmail.label || 'Home e-mail address'
  };
}

/**
 * Finds and returns the work email field
 */
function findWorkEmailField(emailFields: CategorizedField[]): any {
  const workEmail = emailFields.find(field => 
    field.category === 'workEmail' ||
    (field.name && field.name.toLowerCase().includes('work')) ||
    (field.label && field.label.toLowerCase().includes('work'))
  );
  
  if (!workEmail) return { value: '', id: '', type: 'PDFTextField', label: 'Work e-mail address' };
  
  return {
    value: workEmail.value || '',
    id: workEmail.id || '',
    type: workEmail.type || 'PDFTextField',
    label: workEmail.label || 'Work e-mail address'
  };
}

/**
 * Builds the contact numbers array
 */
function buildContactNumbers(contactFields: ReturnType<typeof extractContactFields>): ContactNumber[] {
  const contactNumbers: ContactNumber[] = [];
  
  // Group 1: Home phone
  const homePhone = contactFields.phones.find(field => field.category === 'homePhone');
  if (homePhone) {
    contactNumbers.push(buildContactNumber(
      1,
      homePhone, 
      findMatchingExtension(contactFields.extensions, 'home'),
      findMatchingUsabilityField(contactFields.dayUsability, 'home'),
      findMatchingUsabilityField(contactFields.nightUsability, 'home'),
      findMatchingInternationalFlag(contactFields.internationalFlags, 'home')
    ));
  }
  
  // Group 2: Work phone
  const workPhone = contactFields.phones.find(field => field.category === 'workPhone');
  if (workPhone) {
    contactNumbers.push(buildContactNumber(
      2,
      workPhone, 
      findMatchingExtension(contactFields.extensions, 'work'),
      findMatchingUsabilityField(contactFields.dayUsability, 'work'),
      findMatchingUsabilityField(contactFields.nightUsability, 'work'),
      findMatchingInternationalFlag(contactFields.internationalFlags, 'work')
    ));
  }
  
  // Group 3: Mobile phone
  const mobilePhone = contactFields.phones.find(field => field.category === 'mobilePhone');
  if (mobilePhone) {
    contactNumbers.push(buildContactNumber(
      3,
      mobilePhone, 
      findMatchingExtension(contactFields.extensions, 'mobile'),
      findMatchingUsabilityField(contactFields.dayUsability, 'mobile'),
      findMatchingUsabilityField(contactFields.nightUsability, 'mobile'),
      findMatchingInternationalFlag(contactFields.internationalFlags, 'mobile')
    ));
  }
  
  // If no contact numbers were found, add default objects
  if (contactNumbers.length === 0) {
    // Add default phone numbers (home, work, mobile)
    contactNumbers.push(createDefaultContactNumber(1, 'Home'));
    contactNumbers.push(createDefaultContactNumber(2, 'Work'));
    contactNumbers.push(createDefaultContactNumber(3, 'Mobile/Cell'));
  }
  
  return contactNumbers;
}

/**
 * Creates a contact number object from field data
 */
function buildContactNumber(
  id: number,
  phoneField: CategorizedField,
  extensionField?: FieldMetadata,
  dayField?: FieldMetadata,
  nightField?: FieldMetadata,
  internationalField?: FieldMetadata
): ContactNumber {
  return {
    _id: id,
    phoneNumber: {
      value: phoneField.value || '',
      id: phoneField.id || '',
      type: phoneField.type || 'PDFTextField',
      label: phoneField.label || `Phone number ${id}`
    },
    extension: {
      value: extensionField?.value || '',
      id: extensionField?.id || '',
      type: extensionField?.type || 'PDFTextField',
      label: extensionField?.label || 'Extension'
    },
    isUsableDay: {
      value: isFieldChecked(dayField) ? 'YES' : 'NO',
      id: dayField?.id || '',
      type: dayField?.type || 'PDFCheckBox',
      label: dayField?.label || 'Day'
    },
    isUsableNight: {
      value: isFieldChecked(nightField) ? 'YES' : 'NO',
      id: nightField?.id || '',
      type: nightField?.type || 'PDFCheckBox',
      label: nightField?.label || 'Night'
    },
    internationalOrDSN: {
      value: isFieldChecked(internationalField) ? 'YES' : 'NO',
      id: internationalField?.id || '',
      type: internationalField?.type || 'PDFCheckBox',
      label: internationalField?.label || 'International or DSN number'
    }
  };
}

/**
 * Creates a default contact number for when fields aren't found
 */
function createDefaultContactNumber(id: number, type: string): ContactNumber {
  return {
    _id: id,
    phoneNumber: {
      value: '',
      id: '',
      type: 'PDFTextField',
      label: `${type} telephone number`
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
      label: `${type} telephone number: International or DSN phone number`
    }
  };
}

/**
 * Finds a matching extension field for a given phone type
 */
function findMatchingExtension(extensionFields: FieldMetadata[], phoneType: string): FieldMetadata | undefined {
  return extensionFields.find(field => {
    const name = (field.name || '').toLowerCase();
    const label = (field.label || '').toLowerCase();
    
    // Try to match extension to phone type
    return name.includes(phoneType) || label.includes(phoneType);
  });
}

/**
 * Finds a matching day/night usability field for a given phone type
 */
function findMatchingUsabilityField(usabilityFields: FieldMetadata[], phoneType: string): FieldMetadata | undefined {
  return usabilityFields.find(field => {
    const name = (field.name || '').toLowerCase();
    const label = (field.label || '').toLowerCase();
    
    // Try to match usability to phone type
    return name.includes(phoneType) || label.includes(phoneType);
  });
}

/**
 * Finds a matching international flag field for a given phone type
 */
function findMatchingInternationalFlag(flagFields: FieldMetadata[], phoneType: string): FieldMetadata | undefined {
  return flagFields.find(field => {
    const name = (field.name || '').toLowerCase();
    const label = (field.label || '').toLowerCase();
    
    // Try to match flag to phone type
    return name.includes(phoneType) || label.includes(phoneType);
  });
}

/**
 * Checks if a checkbox field has a truthy value
 */
function isFieldChecked(field?: FieldMetadata): boolean {
  if (!field) return false;
  
  const value = (field.value || '').toString().toLowerCase();
  return ['yes', 'true', 'y', 't', '1', 'on', 'checked'].includes(value);
}

/**
 * Validates contact information for completeness and format
 * 
 * @param contactInfo The contact information to validate
 * @returns Validation results with errors if any
 */
export function validateContactInfo(contactInfo: ContactInfo) {
  const errors: string[] = [];
  
  // Validate emails
  if (!contactInfo.homeEmail?.value && !contactInfo.workEmail?.value) {
    errors.push('At least one email address (home or work) is required');
  }
  
  if (contactInfo.homeEmail?.value && !isValidEmail(contactInfo.homeEmail.value)) {
    errors.push('Home email address format is invalid');
  }
  
  if (contactInfo.workEmail?.value && !isValidEmail(contactInfo.workEmail.value)) {
    errors.push('Work email address format is invalid');
  }
  
  // Validate phone numbers
  let hasValidPhone = false;
  
  contactInfo.contactNumbers.forEach((contact, index) => {
    if (contact.phoneNumber.value) {
      hasValidPhone = true;
      
      if (!isValidPhoneNumber(contact.phoneNumber.value)) {
        errors.push(`Phone number ${index + 1} format is invalid`);
      }
    }
  });
  
  if (!hasValidPhone) {
    errors.push('At least one phone number is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates an email address format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a phone number format
 * Supports common US formats and basic international formats
 */
function isValidPhoneNumber(phone: string): boolean {
  // Remove common separators and whitespace for validation
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // US domestic: 10 digits
  if (/^\d{10}$/.test(cleanPhone)) {
    return true;
  }
  
  // US with country code: +1 followed by 10 digits
  if (/^\+?1\d{10}$/.test(cleanPhone)) {
    return true;
  }
  
  // Basic international format: + followed by 6-15 digits
  if (/^\+\d{6,15}$/.test(cleanPhone)) {
    return true;
  }
  
  return false;
} 