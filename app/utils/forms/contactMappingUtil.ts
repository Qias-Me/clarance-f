/**
 * Contact Info Mapping Utility
 * 
 * This utility provides bidirectional mapping between form fields in Section 7 (Contact Information)
 * and the ContactInfo context state. It follows the section-to-component mapping pattern
 * established in the project.
 */

import { type FieldMetadata } from 'api/interfaces/FieldMetadata';
import { type ContactInfo, type ContactNumber } from 'api/interfaces/sections/contact';
import { contactInfo as defaultContactInfo } from '../../state/contexts/sections/contactInfo';

/**
 * Maps form field data from Section 7 to ContactInfo context state
 * 
 * @param fields - Array of form fields from Section 7
 * @returns A properly structured ContactInfo object
 */
export function mapFieldsToContactInfo(fields: FieldMetadata[]): ContactInfo {
  // Start with default structure to ensure all required fields exist
  const contactInfo: ContactInfo = JSON.parse(JSON.stringify(defaultContactInfo));
  
  if (!fields || !Array.isArray(fields)) {
    return contactInfo;
  }
  
  // Process fields by their IDs
  fields.forEach(field => {
    // Match field ID to the appropriate context field
    
    // Email fields
    if (field.id === "9513") {
      contactInfo.homeEmail.value = field.value as string;
      contactInfo.homeEmail.id = field.id;
      contactInfo.homeEmail.type = field.type;
    } else if (field.id === "9512") {
      contactInfo.workEmail.value = field.value as string;
      contactInfo.workEmail.id = field.id;
      contactInfo.workEmail.type = field.type;
    }
    
    // Home phone fields
    else if (field.id === "9511") {
      updateContactNumber(contactInfo, 1, 'phoneNumber', field);
    } else if (field.id === "9510") {
      updateContactNumber(contactInfo, 1, 'extension', field);
    } else if (field.id === "9507") {
      updateContactNumber(contactInfo, 1, 'isUsableDay', field);
    } else if (field.id === "9508") {
      updateContactNumber(contactInfo, 1, 'isUsableNight', field);
    } else if (field.id === "9509") {
      updateContactNumber(contactInfo, 1, 'internationalOrDSN', field);
    }
    
    // Work phone fields
    else if (field.id === "9506") {
      updateContactNumber(contactInfo, 2, 'phoneNumber', field);
    } else if (field.id === "9505") {
      updateContactNumber(contactInfo, 2, 'extension', field);
    } else if (field.id === "9562") {
      updateContactNumber(contactInfo, 2, 'isUsableDay', field);
    } else if (field.id === "9503") {
      updateContactNumber(contactInfo, 2, 'isUsableNight', field);
    } else if (field.id === "9504") {
      updateContactNumber(contactInfo, 2, 'internationalOrDSN', field);
    }
    
    // Mobile phone fields
    else if (field.id === "9561") {
      updateContactNumber(contactInfo, 3, 'phoneNumber', field);
    } else if (field.id === "9560") {
      updateContactNumber(contactInfo, 3, 'extension', field);
    } else if (field.id === "9557") {
      updateContactNumber(contactInfo, 3, 'isUsableDay', field);
    } else if (field.id === "9558") {
      updateContactNumber(contactInfo, 3, 'isUsableNight', field);
    } else if (field.id === "9559") {
      updateContactNumber(contactInfo, 3, 'internationalOrDSN', field);
    }
  });
  
  return contactInfo;
}

/**
 * Maps ContactInfo context state to form field data format
 * 
 * @param contactInfo - The ContactInfo context state
 * @returns Array of form fields in the expected format for Section 7
 */
export function mapContactInfoToFields(contactInfo: ContactInfo): FieldMetadata[] {
  const fields: FieldMetadata[] = [];
  
  // Add email fields
  if (contactInfo.homeEmail) {
    fields.push({
      id: contactInfo.homeEmail.id || "9513",
      name: "form1[0].Sections7[0].Section7HomeEmail[0]",
      label: contactInfo.homeEmail.label,
      value: contactInfo.homeEmail.value,
      type: contactInfo.homeEmail.type || "PDFTextField",
      section: 7,
      sectionName: "Your Contact Information",
      confidence: 1.0
    });
  }
  
  if (contactInfo.workEmail) {
    fields.push({
      id: contactInfo.workEmail.id || "9512",
      name: "form1[0].Sections7[0].Section7WorkEmail[0]",
      label: contactInfo.workEmail.label,
      value: contactInfo.workEmail.value,
      type: contactInfo.workEmail.type || "PDFTextField",
      section: 7,
      sectionName: "Your Contact Information",
      confidence: 1.0
    });
  }
  
  // Add contact number fields
  contactInfo.contactNumbers.forEach(contact => {
    // Home phone
    if (contact._id === 1) {
      addContactNumberFields(fields, contact, {
        phoneNumber: {
          id: "9511",
          name: "form1[0].Sections7[0].Section7HomePhone[0]"
        },
        extension: {
          id: "9510",
          name: "form1[0].Sections7[0].Section7HomeExt[0]"
        },
        isUsableDay: {
          id: "9507",
          name: "form1[0].Sections7[0].Section7HomeDay[0]"
        },
        isUsableNight: {
          id: "9508",
          name: "form1[0].Sections7[0].Section7HomeNight[0]"
        },
        internationalOrDSN: {
          id: "9509",
          name: "form1[0].Sections7[0].Section7HomeInternational[0]"
        }
      });
    }
    // Work phone
    else if (contact._id === 2) {
      addContactNumberFields(fields, contact, {
        phoneNumber: {
          id: "9506",
          name: "form1[0].Sections7[0].Section7WorkPhone[0]"
        },
        extension: {
          id: "9505",
          name: "form1[0].Sections7[0].Section7WorkExt[0]"
        },
        isUsableDay: {
          id: "9562",
          name: "form1[0].Sections7[0].Section7WorkDay[0]"
        },
        isUsableNight: {
          id: "9503",
          name: "form1[0].Sections7[0].Section7WorkNight[0]"
        },
        internationalOrDSN: {
          id: "9504",
          name: "form1[0].Sections7[0].Section7WorkInternational[0]"
        }
      });
    }
    // Mobile phone
    else if (contact._id === 3) {
      addContactNumberFields(fields, contact, {
        phoneNumber: {
          id: "9561",
          name: "form1[0].Sections7[0].Section7MobilePhone[0]"
        },
        extension: {
          id: "9560",
          name: "form1[0].Sections7[0].Section7MobileExt[0]"
        },
        isUsableDay: {
          id: "9557",
          name: "form1[0].Sections7[0].Section7MobileDay[0]"
        },
        isUsableNight: {
          id: "9558",
          name: "form1[0].Sections7[0].Section7MobileNight[0]"
        },
        internationalOrDSN: {
          id: "9559",
          name: "form1[0].Sections7[0].Section7MobileInternational[0]"
        }
      });
    }
  });
  
  return fields;
}

/**
 * Helper function to update a contact number field in the context
 */
function updateContactNumber(
  contactInfo: ContactInfo, 
  contactId: number, 
  fieldName: keyof Omit<ContactNumber, '_id'>, 
  field: FieldMetadata
) {
  // Find the contact number by ID
  const contactIndex = contactInfo.contactNumbers.findIndex(c => c._id === contactId);
  
  if (contactIndex !== -1) {
    // Get a reference to the field object
    const contactField = contactInfo.contactNumbers[contactIndex][fieldName];
    
    // Update field properties
    if (typeof contactField === 'object' && contactField !== null) {
      if (field.type === "PDFCheckBox") {
        // Handle checkbox values properly by converting to YES/NO
        const checkValue = typeof field.value === 'boolean' 
          ? (field.value ? "YES" : "NO")
          : (field.value === "YES" ? "YES" : "NO");
        contactField.value = checkValue;
      } else {
        contactField.value = String(field.value);
      }
      contactField.id = field.id;
      contactField.type = field.type;
    }
  }
}

/**
 * Helper interface for field mapping information
 */
interface FieldMapping {
  id: string;
  name: string;
}

/**
 * Interface for contact number field mappings
 */
interface ContactNumberFieldMappings {
  phoneNumber: FieldMapping;
  extension: FieldMapping;
  isUsableDay: FieldMapping;
  isUsableNight: FieldMapping;
  internationalOrDSN: FieldMapping;
}

/**
 * Helper function to add contact number fields to the fields array
 */
function addContactNumberFields(
  fields: FieldMetadata[],
  contact: ContactNumber,
  mappings: ContactNumberFieldMappings
) {
  // Phone number
  fields.push({
    id: mappings.phoneNumber.id,
    name: mappings.phoneNumber.name,
    label: contact.phoneNumber.label,
    value: contact.phoneNumber.value,
    type: contact.phoneNumber.type || "PDFTextField",
    section: 7,
    sectionName: "Your Contact Information",
    confidence: 1.0
  });
  
  // Extension
  fields.push({
    id: mappings.extension.id,
    name: mappings.extension.name,
    label: contact.extension.label,
    value: contact.extension.value,
    type: contact.extension.type || "PDFTextField",
    section: 7,
    sectionName: "Your Contact Information",
    confidence: 1.0
  });
  
  // Is usable day
  fields.push({
    id: mappings.isUsableDay.id,
    name: mappings.isUsableDay.name,
    label: contact.isUsableDay.label,
    value: contact.isUsableDay.value,
    type: contact.isUsableDay.type || "PDFCheckBox",
    section: 7,
    sectionName: "Your Contact Information",
    confidence: 1.0
  });
  
  // Is usable night
  fields.push({
    id: mappings.isUsableNight.id,
    name: mappings.isUsableNight.name,
    label: contact.isUsableNight.label,
    value: contact.isUsableNight.value,
    type: contact.isUsableNight.type || "PDFCheckBox",
    section: 7,
    sectionName: "Your Contact Information",
    confidence: 1.0
  });
  
  // International or DSN
  fields.push({
    id: mappings.internationalOrDSN.id,
    name: mappings.internationalOrDSN.name,
    label: contact.internationalOrDSN.label,
    value: contact.internationalOrDSN.value,
    type: contact.internationalOrDSN.type || "PDFCheckBox",
    section: 7,
    sectionName: "Your Contact Information",
    confidence: 1.0
  });
} 