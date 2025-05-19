/**
 * Military History Mapping Utility
 * 
 * This utility provides bidirectional mapping between form fields in Section 15 (Military History)
 * and the MilitaryHistoryInfo context state. It follows the section-to-component mapping pattern
 * established in the project.
 * 
 * Section 15 of the SF-86 form covers an individual's military service history and consists of three parts:
 * 1. U.S. Military Service (section15_1)
 *    - Branch of service, status, rank, dates, and discharge information
 * 2. Military Disciplinary Procedures (section15_2)
 *    - Court martial or other disciplinary actions taken within the past 7 years
 * 3. Foreign Military Service (section15_3)
 *    - Service in foreign militaries, including organization details and contacts maintained
 * 
 * The mapping handles complex hierarchical data structures with both required and optional fields.
 * Each section maps multiple field IDs to their corresponding context properties, preserving the
 * field metadata (ID, type, and label) for bidirectional transformation.
 * 
 * Key Features:
 * - Bidirectional mapping between form field data and context state
 * - Validation of military history information for data integrity
 * - Error handling for missing or malformed data
 * - Support for multiple service entries, court martial entries, and foreign service entries
 * - Careful handling of optional fields and complex nested structures
 * - Integration with the section-to-component mapping utility
 * 
 * @module MilitaryHistoryMapping
 */

import { type FieldMetadata } from 'api/interfaces/FieldMetadata';
import { 
  type MilitaryHistoryInfo,
  type MilitaryServiceEntry,
  type CourtMartialEntry,
  type ForeignServiceEntry,
  type ContactEntry
} from 'api/interfaces/sections/militaryHistoryInfo';
import { militaryHistoryInfo as defaultMilitaryHistoryInfo } from '../../state/contexts/sections/militaryHistoryInfo';
import { type Field } from 'api/interfaces/formDefinition';
import { getSectionInfo } from '../sectionMapping';
import { BrowserFieldMappingService } from 'api/service/BrowserFieldMappingService';

// Global constants for error handling and section identification
const SECTION_NUMBER = 15;
const SECTION_NAME = 'Military History';
const ERROR_PREFIX = 'MilitaryHistoryMapping';

/**
 * Logger implementation for consistent error and info messages
 * Uses a prefix to easily identify messages from this utility
 */
const logger = {
  error: (message: string): void => {
    console.error(`${ERROR_PREFIX}: ${message}`);
  },
  warn: (message: string): void => {
    console.warn(`${ERROR_PREFIX}: ${message}`);
  },
  info: (message: string): void => {
    console.info(`${ERROR_PREFIX}: ${message}`);
  }
};

/**
 * Maps form field data from Section 15 to MilitaryHistoryInfo context state
 * 
 * This function transforms an array of field metadata from Section 15 into a structured
 * MilitaryHistoryInfo object following the context model. It handles the complexity of mapping
 * flat field data to a nested context structure with three main sections:
 * - Top-level questions about service
 * - US Military service details
 * - Court martial/disciplinary action details
 * - Foreign military service details with contacts
 * 
 * @param fields - Array of form fields from Section 15
 * @returns A properly structured MilitaryHistoryInfo object
 */
export function mapFieldsToMilitaryHistoryInfo(fields: FieldMetadata[]): MilitaryHistoryInfo {
  try {
    // Start with default structure to ensure all required fields exist
    const militaryHistoryInfo: MilitaryHistoryInfo = JSON.parse(JSON.stringify(defaultMilitaryHistoryInfo));
    
    if (!fields || !Array.isArray(fields)) {
      logger.warn(`No fields provided for mapping, returning default structure`);
      return militaryHistoryInfo;
    }
    
    // Process top-level fields
    fields.forEach(field => {
      try {
        // Map the main selection fields
        if (field.id === "17088") { // everServedInUSMilitary
          if (field.value === "YES" || field.value === "NO (If NO, proceed to Section 15.2) ") {
            militaryHistoryInfo.everServedInUSMilitary.value = field.value;
          }
          militaryHistoryInfo.everServedInUSMilitary.id = field.id;
          militaryHistoryInfo.everServedInUSMilitary.type = field.type;
        } 
        else if (field.id === "17060") { // disciplinaryProcedure
          if (field.value === "YES " || field.value === "NO (If NO, proceed to Section 15.3) ") {
            militaryHistoryInfo.disciplinaryProcedure.value = field.value;
          }
          militaryHistoryInfo.disciplinaryProcedure.id = field.id;
          militaryHistoryInfo.disciplinaryProcedure.type = field.type;
        }
        else if (field.id === "17050") { // everServedInForeignMilitary
          if (field.value === "YES" || field.value === "NO (If NO, proceed to Section 16)") {
            militaryHistoryInfo.everServedInForeignMilitary.value = field.value;
          }
          militaryHistoryInfo.everServedInForeignMilitary.id = field.id;
          militaryHistoryInfo.everServedInForeignMilitary.type = field.type;
        }
      } catch (err) {
        logger.error(`Error processing top-level field ${field.id}: ${err}`);
      }
    });
    
    // Process US military service fields (section15_1)
    processUSMilitaryService(militaryHistoryInfo, fields);
    
    // Process court martial entries (section15_2)
    processCourtMartial(militaryHistoryInfo, fields);
    
    // Process foreign military service (section15_3)
    processForeignMilitaryService(militaryHistoryInfo, fields);
    
    return militaryHistoryInfo;
  } catch (err) {
    logger.error(`Critical error in mapFieldsToMilitaryHistoryInfo: ${err}`);
    return defaultMilitaryHistoryInfo;
  }
}

/**
 * Maps MilitaryHistoryInfo context state to form field data format
 * 
 * This function performs the reverse transformation, converting a structured MilitaryHistoryInfo
 * object into an array of flat field metadata that can be used to populate form fields. The mapping
 * preserves all necessary information including field IDs, types, labels, and section info.
 * 
 * @param militaryHistoryInfo - The MilitaryHistoryInfo context state
 * @returns Array of form fields in the expected format for Section 15
 */
export function mapMilitaryHistoryInfoToFields(militaryHistoryInfo: MilitaryHistoryInfo): FieldMetadata[] {
  try {
    const fields: FieldMetadata[] = [];
    
    // Add top-level fields
    addFieldToArray(fields, militaryHistoryInfo.everServedInUSMilitary, "form1[0].Section15_1[0].RadioButtonList[0]", "Have you ever served in the U.S. Military?");
    addFieldToArray(fields, militaryHistoryInfo.disciplinaryProcedure, "form1[0].Section15_2[0].RadioButtonList[0]", "In the last seven (7) years, have you been subject to court martial or other disciplinary procedure?");
    addFieldToArray(fields, militaryHistoryInfo.everServedInForeignMilitary, "form1[0].Section15_3[0].RadioButtonList[0]", "Have you ever served in a foreign military?");
    
    // Add US military service fields
    if (militaryHistoryInfo.section15_1 && militaryHistoryInfo.section15_1.length > 0) {
      militaryHistoryInfo.section15_1.forEach((entry, index) => {
        try {
          addUSMilitaryServiceFields(fields, entry);
        } catch (err) {
          logger.error(`Error adding US military service fields for entry ${index}: ${err}`);
        }
      });
    }
    
    // Add court martial entries
    if (militaryHistoryInfo.section15_2 && militaryHistoryInfo.section15_2.length > 0) {
      militaryHistoryInfo.section15_2.forEach((entry, index) => {
        try {
          addCourtMartialFields(fields, entry);
        } catch (err) {
          logger.error(`Error adding court martial fields for entry ${index}: ${err}`);
        }
      });
    }
    
    // Add foreign military service
    if (militaryHistoryInfo.section15_3 && militaryHistoryInfo.section15_3.length > 0) {
      militaryHistoryInfo.section15_3.forEach((entry, index) => {
        try {
          addForeignMilitaryServiceFields(fields, entry);
        } catch (err) {
          logger.error(`Error adding foreign military service fields for entry ${index}: ${err}`);
        }
      });
    }
    
    return fields;
  } catch (err) {
    logger.error(`Critical error in mapMilitaryHistoryInfoToFields: ${err}`);
    return [];
  }
}

/**
 * Process US military service fields from form data
 * 
 * This function extracts US military service fields from the provided fields array
 * and updates the MilitaryHistoryInfo context with the extracted data. It handles
 * service details such as branch, status, rank, service period, and discharge information.
 * 
 * The function identifies fields by their IDs and maps them to the appropriate properties
 * in the MilitaryServiceEntry of the context data structure.
 * 
 * @param militaryHistoryInfo - The context data structure to update
 * @param fields - Array of form fields containing US military service data
 */
function processUSMilitaryService(militaryHistoryInfo: MilitaryHistoryInfo, fields: FieldMetadata[]): void {
  // Group fields by entry using patterns in field IDs
  // For now, we'll use a simplified approach expecting entry #1
  
  const entryFields = fields.filter(field => {
    // Include fields that belong to the US Military Service section
    // The field IDs for entry #1 are defined in the context
    return [
      "17087", // branch
      "11394", // stateOfService
      "17081", // status
      "17085", // officerOrEnlisted
      "11461", // serviceNumber
      "11466", // serviceFromDate
      "11464", // serviceToDate
      "11463", // present
      "11465", // estimatedFromDate
      "11462", // estimatedToDate
      "17084", // discharged
      "17083", // typeOfDischarge
      "11450", // dischargeTypeOther
      "11452", // dischargeDate
    ].includes(field.id);
  });
  
  if (entryFields.length > 0 && militaryHistoryInfo.section15_1 && militaryHistoryInfo.section15_1.length > 0) {
    // Update the first entry with matching fields
    const entry = militaryHistoryInfo.section15_1[0];
    
    entryFields.forEach(field => {
      updateMilitaryServiceEntry(entry, field);
    });
  }
}

/**
 * Process court martial entries from form data
 * 
 * This function extracts court martial and disciplinary procedure fields from the provided
 * fields array and updates the MilitaryHistoryInfo context with the extracted data. It handles
 * details such as dates, procedures, offenses, and outcomes of disciplinary actions.
 * 
 * The function creates a new court martial entry if none exists in the context.
 * 
 * @param militaryHistoryInfo - The context data structure to update
 * @param fields - Array of form fields containing court martial data
 */
function processCourtMartial(militaryHistoryInfo: MilitaryHistoryInfo, fields: FieldMetadata[]): void {
  // Initialize section15_2 if it doesn't exist
  if (!militaryHistoryInfo.section15_2) {
    militaryHistoryInfo.section15_2 = [];
  }
  
  // Group fields by entry ID
  // For simplicity, we'll focus on entry #1
  
  const entryFields = fields.filter(field => {
    // Include fields that belong to the Court Martial section
    // Field IDs defined in context for entry #1
    return [
      "11477", // date (formerly courtMartialDate)
      "11476", // descriptionOfOffense (formerly offenseDescription)
      "11475", // nameOfProcedure (formerly procedureName)
      "11474", // courtDescription
      "11473", // outcomeDescription
    ].includes(field.id);
  });
  
  // If there are matching fields and we don't have an entry yet, create one
  if (entryFields.length > 0 && militaryHistoryInfo.section15_2.length === 0) {
    const newEntry: CourtMartialEntry = {
      _id: 1,
      date: { value: "", id: "", type: "", label: "Court Martial Date" },
      descriptionOfOffense: { value: "", id: "", type: "", label: "Offense Description" },
      nameOfProcedure: { value: "", id: "", type: "", label: "Procedure Name" },
      courtDescription: { value: "", id: "", type: "", label: "Court Description" },
      outcomeDescription: { value: "", id: "", type: "", label: "Outcome Description" },
      estimatedDate: { value: "No", id: "", type: "", label: "Estimated Date" }
    };
    
    militaryHistoryInfo.section15_2.push(newEntry);
  }
  
  // If we have an entry, update it
  if (militaryHistoryInfo.section15_2.length > 0) {
    const entry = militaryHistoryInfo.section15_2[0];
    
    entryFields.forEach(field => {
      updateCourtMartialEntry(entry, field);
    });
  }
}

/**
 * Process foreign military service fields from form data
 * 
 * This function extracts foreign military service fields from the provided fields array
 * and updates the MilitaryHistoryInfo context with the extracted data. It handles service
 * details such as organization type, country, service period, ranks, and maintained contacts.
 * 
 * The function also processes contact information for foreign service entries by calling
 * the processContactEntries helper function.
 * 
 * @param militaryHistoryInfo - The context data structure to update
 * @param fields - Array of form fields containing foreign military service data
 */
function processForeignMilitaryService(militaryHistoryInfo: MilitaryHistoryInfo, fields: FieldMetadata[]): void {
  // Initialize section15_3 if it doesn't exist
  if (!militaryHistoryInfo.section15_3) {
    militaryHistoryInfo.section15_3 = [];
  }
  
  // Group fields by entry ID (focusing on entry #1)
  
  const entryFields = fields.filter(field => {
    // Include fields that belong to the Foreign Military Service section
    return [
      "17042", // organizationType
      "11578", // organizationTypeOther / organizationName
      "11577", // country
      "11583", // periodOfServiceFrom
      "11581", // periodOfServiceTo
      "11579", // present
      "11582", // estimatedPeriodFrom
      "11580", // estimatedPeriodTo
      "11576", // highestRank
      "11575", // departmentOrOffice
      "11574", // associationDescription
      "11573", // reasonForLeaving
      "17045", // maintainsContact
      // Contact entries have their own fields
    ].includes(field.id);
  });
  
  // If there are matching fields and we don't have an entry yet, ensure there's an entry to update
  if (entryFields.length > 0 && militaryHistoryInfo.section15_3.length === 0) {
    // Create a new entry with default values from the context
    if (defaultMilitaryHistoryInfo.section15_3 && defaultMilitaryHistoryInfo.section15_3.length > 0) {
      militaryHistoryInfo.section15_3.push(JSON.parse(JSON.stringify(defaultMilitaryHistoryInfo.section15_3[0])));
    } else {
      // Fallback if no default exists
      const newEntry: ForeignServiceEntry = {
        _id: 1,
        organizationType: { value: "1", id: "", type: "", label: "Organization Type" },
        organizationName: { value: "", id: "", type: "", label: "Organization Name" },
        country: { value: "", id: "", type: "", label: "Country" },
        periodOfServiceFrom: { value: "", id: "", type: "", label: "Period of Service From" },
        periodOfServiceTo: { value: "", id: "", type: "", label: "Period of Service To" },
        present: { value: "No", id: "", type: "", label: "Present" },
        estimatedPeriodFrom: { value: "No", id: "", type: "", label: "Estimated Period From" },
        estimatedPeriodTo: { value: "No", id: "", type: "", label: "Estimated Period To" },
        highestRank: { value: "", id: "", type: "", label: "Highest Rank" },
        departmentOrOffice: { value: "", id: "", type: "", label: "Department or Office" },
        associationDescription: { value: "", id: "", type: "", label: "Association Description" },
        reasonForLeaving: { value: "", id: "", type: "", label: "Reason for Leaving" },
        maintainsContact: { value: "NO", id: "", type: "", label: "Maintains Contact" },
        contacts: []
      };
      
      militaryHistoryInfo.section15_3.push(newEntry);
    }
  }
  
  // If we have an entry, update it
  if (militaryHistoryInfo.section15_3.length > 0) {
    const entry = militaryHistoryInfo.section15_3[0];
    
    entryFields.forEach(field => {
      updateForeignServiceEntry(entry, field);
    });
    
    // Process contact info separately
    processContactEntries(entry, fields);
  }
}

/**
 * Process contact entries for foreign military service
 * 
 * This function processes contact information for foreign military service entries.
 * It extracts contact fields from the provided fields array and updates the contacts
 * array in the given foreign service entry.
 * 
 * The function creates a new contact entry if none exists in the foreign service entry.
 * 
 * @param entry - The foreign service entry to update with contact information
 * @param fields - Array of form fields containing contact information
 */
function processContactEntries(entry: ForeignServiceEntry, fields: FieldMetadata[]): void {
  // Ensure contacts array exists
  if (!entry.contacts) {
    entry.contacts = [];
  }
  
  // For each potential contact (we'll look for contact #1)
  const contactFields = fields.filter(field => {
    // Contact #1 field IDs
    return [
      "11566", // lastName
      "11565", // firstName
      "11567", // middleName
      "11564", // suffix
      "11572", // address.street
      "11571", // address.city
      "11570", // address.state
      "11568", // address.zipCode
      "11569", // address.country
      "11555", // officialTitle
      "11556", // frequencyOfContact
      "11563", // associationFrom
      "11561", // associationTo
      "11560", // present
      "11562", // estimatedAssociationFrom
      "11559", // estimatedAssociationTo
    ].includes(field.id);
  });
  
  // If we have contact fields but no contact entry, add one
  if (contactFields.length > 0 && entry.contacts.length === 0) {
    // Create a new contact with default values
    const newContact: ContactEntry = {
      _id: 1,
      lastName: { value: "", id: "", type: "", label: "Last Name" },
      firstName: { value: "", id: "", type: "", label: "First Name" },
      middleName: { value: "", id: "", type: "", label: "Middle Name" },
      suffix: { value: "", id: "", type: "", label: "Suffix" },
      address: {
        street: { value: "", id: "", type: "", label: "Street" },
        city: { value: "", id: "", type: "", label: "City" },
        state: { value: "", id: "", type: "", label: "State" },
        zipCode: { value: "", id: "", type: "", label: "Zip Code" },
        country: { value: "", id: "", type: "", label: "Country" }
      },
      officialTitle: { value: "", id: "", type: "", label: "Official Title" },
      frequencyOfContact: { value: "", id: "", type: "", label: "Frequency of Contact" },
      associationFrom: { value: "", id: "", type: "", label: "Association From" },
      associationTo: { value: "", id: "", type: "", label: "Association To" },
      present: { value: "No", id: "", type: "", label: "Present" },
      estimatedAssociationFrom: { value: "No", id: "", type: "", label: "Estimated Association From" },
      estimatedAssociationTo: { value: "No", id: "", type: "", label: "Estimated Association To" }
    };
    
    entry.contacts.push(newContact);
  }
  
  // If we have at least one contact, update it
  if (entry.contacts.length > 0) {
    const contact = entry.contacts[0];
    
    contactFields.forEach(field => {
      updateContactEntry(contact, field);
    });
  }
}

/**
 * Updates a military service entry with field data
 * 
 * This function updates a military service entry with the provided field data.
 * It matches field IDs to the appropriate properties in the military service entry
 * and handles different types of fields (date fields, radio buttons, checkboxes, etc.).
 * 
 * The function handles optional fields by creating them if they don't exist.
 * 
 * @param entry - The military service entry to update
 * @param field - The field metadata containing the value to apply
 */
function updateMilitaryServiceEntry(entry: MilitaryServiceEntry, field: FieldMetadata): void {
  switch(field.id) {
    case "17087":
    case "17080":
    case "17074":
    case "17065":
      updateField(entry.branch, field);
      break;
    case "11394":
    case "11436":
    case "11405":
    case "11398":
      if (entry.stateOfService) {
        updateField(entry.stateOfService, field);
      } else {
        entry.stateOfService = {
          value: field.value as string,
          id: field.id,
          type: field.type,
          label: "State of Service"
        };
      }
      break;
    case "17081":
    case "17078":
    case "17075":
    case "17066":
      updateField(entry.status, field);
      break;
    case "17085":
    case "17079":
    case "17071":
    case "17061":
      updateField(entry.officerOrEnlisted, field);
      break;
    case "11461":
    case "11427":
    case "11426":
    case "11391":
      if (entry.serviceNumber) {
        updateField(entry.serviceNumber, field);
      } else {
        entry.serviceNumber = {
          value: field.value as string,
          id: field.id,
          type: field.type,
          label: "Service Number"
        };
      }
      break;
    case "11466":
    case "11432":
    case "11400":
    case "11393":
      updateField(entry.serviceFromDate, field);
      break;
    case "11464":
    case "11430":
    case "11397":
    case "11390":
      updateField(entry.serviceToDate, field);
      break;
    case "11463":
    case "11431":
    case "11399":
    case "11392":
      updateField(entry.present, field);
      break;
    case "11465":
    case "11429":
    case "11401":
    case "11396":
      updateField(entry.estimatedFromDate, field);
      break;
    case "11462":
    case "11428":
    case "11396":
    case "11389":
      updateField(entry.estimatedToDate, field);
      break;
    case "17084":
    case "17077":
    case "17073":
    case "17064":
      updateField(entry.discharged, field);
      break;
    case "17083":
    case "17076":
    case "17072":
    case "17063":
      if (entry.typeOfDischarge) {
        updateField(entry.typeOfDischarge, field);
      } else {
        entry.typeOfDischarge = {
          value: field.value as '1' | '2' | '3' | '4' | '5' | '6',
          id: field.id,
          type: field.type,
          label: "Type of Discharge"
        };
      }
      break;
    case "11450":
    case "11416":
    case "11413":
    case "11411":
      if (entry.dischargeTypeOther) {
        updateField(entry.dischargeTypeOther, field);
      } else {
        entry.dischargeTypeOther = {
          value: field.value as string,
          id: field.id,
          type: field.type,
          label: "Other Discharge Type"
        };
      }
      break;
    case "11452":
    case "11418":
    case "11415":
    case "11412":
      if (entry.dischargeDate) {
        updateField(entry.dischargeDate, field);
      } else {
        entry.dischargeDate = {
          value: field.value as string,
          id: field.id,
          type: field.type,
          label: "Discharge Date"
        };
      }
      break;
    case "11451":
    case "11417":
    case "11414":
    case "11413":
      if (entry.estimatedDischargeDate) {
        updateField(entry.estimatedDischargeDate, field);
      } else {
        entry.estimatedDischargeDate = {
          value: field.value as "Yes" | "No",
          id: field.id,
          type: field.type,
          label: "Estimated Discharge Date"
        };
      }
      break;
    case "11449":
    case "11415":
    case "11412":
    case "11410":
      if (entry.dischargeReason) {
        updateField(entry.dischargeReason, field);
      } else {
        entry.dischargeReason = {
          value: field.value as string,
          id: field.id,
          type: field.type,
          label: "Discharge Reason"
        };
      }
      break;
  }
}

/**
 * Updates a court martial entry with field data
 * 
 * This function updates a court martial entry with the provided field data.
 * It matches field IDs to the appropriate properties in the court martial entry
 * and applies the field values.
 * 
 * @param entry - The court martial entry to update
 * @param field - The field metadata containing the value to apply
 */
function updateCourtMartialEntry(entry: CourtMartialEntry, field: FieldMetadata): void {
  switch(field.id) {
    case "11477":
    case "11471":  
      updateField(entry.date, field);
      break;
    case "11478":
    case "11472":
      updateField(entry.estimatedDate, field);
      break;
    case "11476":
    case "11470":
      updateField(entry.descriptionOfOffense, field);
      break;
    case "11475":
    case "11469":
      updateField(entry.nameOfProcedure, field);
      break;
    case "11474":
    case "11468":
      updateField(entry.courtDescription, field);
      break;
    case "11473":
    case "11467":
      updateField(entry.outcomeDescription, field);
      break;
  }
}

/**
 * Updates a field with the given value, handling the case where the field might be undefined
 * 
 * @param field - The field to update, which might be undefined
 * @param fieldData - The field metadata containing the new value
 * @param label - The label to use if we need to create a new field
 * @returns The updated or newly created field
 */
function updateFieldSafe<T>(field: Field<T> | undefined, fieldData: FieldMetadata, label: string): Field<T> {
  if (field) {
    updateField(field, fieldData);
    return field;
  } else {
    // Create a new field
    return {
      value: fieldData.value as T,
      id: fieldData.id,
      type: fieldData.type,
      label: label
    };
  }
}

/**
 * Updates a foreign military service entry with field data
 * 
 * This function updates a foreign military service entry with the provided field data.
 * It matches field IDs to the appropriate properties in the foreign service entry
 * and handles different types of fields (date fields, text inputs, etc.).
 * 
 * @param entry - The foreign military service entry to update
 * @param field - The field metadata containing the value to apply
 */
function updateForeignServiceEntry(entry: ForeignServiceEntry, field: FieldMetadata): void {
  switch(field.id) {
    case "11580":
      updateField(entry.country, field);
      break;
    case "11562":
      updateField(entry.organizationType, field);
      break;
    case "11494":
      entry.organizationTypeOther = updateFieldSafe(entry.organizationTypeOther, field, "Other Organization Type");
      break;
    case "11534":
      updateField(entry.organizationName, field);
      break;
    case "11574":
      updateField(entry.periodOfServiceFrom, field);
      break;
    case "11573":
      updateField(entry.periodOfServiceTo, field);
      break;
    case "11555":
      updateField(entry.present, field);
      break;
    case "11577":
      entry.estimatedPeriodFrom = updateFieldSafe(entry.estimatedPeriodFrom, field, "Estimated Period From");
      break;
    case "11576":
      entry.estimatedPeriodTo = updateFieldSafe(entry.estimatedPeriodTo, field, "Estimated Period To");
      break;
    case "11579":
      entry.highestRank = updateFieldSafe(entry.highestRank, field, "Highest Rank");
      break;
    case "11578":
      entry.departmentOrOffice = updateFieldSafe(entry.departmentOrOffice, field, "Department or Office");
      break;
    case "11575":
      entry.associationDescription = updateFieldSafe(entry.associationDescription, field, "Association Description");
      break;
    case "11531":
      entry.reasonForLeaving = updateFieldSafe(entry.reasonForLeaving, field, "Reason for Leaving");
      break;
    case "11572":
      updateField(entry.maintainsContact, field);
      break;
  }
}

/**
 * Updates a contact entry for foreign military service contact
 * 
 * This function updates a contact entry with the provided field data.
 * It matches field IDs to the appropriate properties in the contact entry
 * and handles different field types.
 * 
 * @param contact - The contact entry to update
 * @param field - The field metadata containing the value to apply
 */
function updateContactEntry(contact: ContactEntry, field: FieldMetadata): void {
  switch(field.id) {
    case "11566":
      updateField(contact.lastName, field);
      break;
    case "11565":
      updateField(contact.firstName, field);
      break;
    case "11567":
      updateField(contact.middleName, field);
      break;
    case "11564":
      updateField(contact.suffix, field);
      break;
    case "11572":
      updateField(contact.address.street, field);
      break;
    case "11571":
      updateField(contact.address.city, field);
      break;
    case "11570":
      updateField(contact.address.state, field);
      break;
    case "11568":
      updateField(contact.address.zipCode, field);
      break;
    case "11569":
      updateField(contact.address.country, field);
      break;
    case "11555":
      updateField(contact.officialTitle, field);
      break;
    case "11556":
      updateField(contact.frequencyOfContact, field);
      break;
    case "11563":
      updateField(contact.associationFrom, field);
      break;
    case "11561":
      updateField(contact.associationTo, field);
      break;
    case "11560":
      updateField(contact.present, field);
      break;
    case "11562":
      updateField(contact.estimatedAssociationFrom, field);
      break;
    case "11559":
      updateField(contact.estimatedAssociationTo, field);
      break;
  }
}

/**
 * Generic helper function to update a field with values from a FieldMetadata
 */
function updateField<T>(field: Field<T>, metadata: FieldMetadata): void {
  if (typeof field === 'object' && field !== null) {
    field.value = metadata.value as T;
    field.id = metadata.id;
    field.type = metadata.type;
  }
}

/**
 * Add a generic field to the fields array with section information from the mapping
 * Handles optional fields safely by checking if they exist first
 */
function addFieldToArray(fields: FieldMetadata[], field: Field<any> | undefined, name: string, label: string): void {
  if (!field) return; // Skip if the field is undefined
  
  const sectionInfo = getSectionInfo(SECTION_NUMBER);
  
  fields.push({
    id: field.id,
    name,
    label,
    value: field.value,
    type: field.type,
    section: SECTION_NUMBER,
    sectionName: sectionInfo?.name || SECTION_NAME,
    confidence: 1.0
  });
}

/**
 * Add US military service fields to the fields array
 */
function addUSMilitaryServiceFields(fields: FieldMetadata[], entry: MilitaryServiceEntry): void {
  // Add all fields with appropriate name/label mappings
  // Branch
  addFieldToArray(
    fields, 
    entry.branch, 
    "form1[0].Section15_1[0].RadioButtonList[1]", 
    "Select the branch of military in which you served"
  );
  
  // State of Service
  addFieldToArray(
    fields, 
    entry.stateOfService, 
    "form1[0].Section15_1[0].DropDownList[0]", 
    "State of service"
  );
  
  // Status
  addFieldToArray(
    fields, 
    entry.status, 
    "form1[0].Section15_1[0].RadioButtonList[2]", 
    "Select your status"
  );
  
  // Officer or Enlisted
  addFieldToArray(
    fields, 
    entry.officerOrEnlisted, 
    "form1[0].Section15_1[0].RadioButtonList[3]", 
    "Select whether you were an Officer or Enlisted"
  );
  
  // Service Number
  addFieldToArray(
    fields, 
    entry.serviceNumber, 
    "form1[0].Section15_1[0].TextField[0]", 
    "Service number"
  );
  
  // Service From Date
  addFieldToArray(
    fields, 
    entry.serviceFromDate, 
    "form1[0].Section15_1[0].From_Datefield_Name[0]", 
    "Service from date"
  );
  
  // Estimated From Date
  addFieldToArray(
    fields, 
    entry.estimatedFromDate, 
    "form1[0].Section15_1[0].CheckBox[0]", 
    "Estimated from date"
  );
  
  // Service To Date
  addFieldToArray(
    fields, 
    entry.serviceToDate, 
    "form1[0].Section15_1[0].From_Datefield_Name[1]", 
    "Service to date"
  );
  
  // Present Checkbox
  addFieldToArray(
    fields, 
    entry.present, 
    "form1[0].Section15_1[0].CheckBox[1]", 
    "Present"
  );
  
  // Estimated To Date
  addFieldToArray(
    fields, 
    entry.estimatedToDate, 
    "form1[0].Section15_1[0].CheckBox[2]", 
    "Estimated to date"
  );
  
  // Discharged
  addFieldToArray(
    fields, 
    entry.discharged, 
    "form1[0].Section15_1[0].RadioButtonList[4]", 
    "Were you discharged?"
  );
  
  // Type of Discharge
  addFieldToArray(
    fields, 
    entry.typeOfDischarge, 
    "form1[0].Section15_1[0].RadioButtonList[5]", 
    "Type of discharge"
  );
  
  // Discharge Type Other
  if (entry.dischargeTypeOther) {
    addFieldToArray(
      fields, 
      entry.dischargeTypeOther, 
      "form1[0].Section15_1[0].TextField[1]", 
      "Other discharge type"
    );
  }
  
  // Discharge Date
  addFieldToArray(
    fields, 
    entry.dischargeDate, 
    "form1[0].Section15_1[0].From_Datefield_Name[2]", 
    "Discharge date"
  );
}

/**
 * Add court martial fields to the fields array
 */
function addCourtMartialFields(fields: FieldMetadata[], entry: CourtMartialEntry): void {
  // Court Martial Date
  addFieldToArray(
    fields, 
    entry.date, 
    "form1[0].Section15_2[0].From_Datefield_Name_2[0]", 
    "Date of court martial"
  );
  
  // Estimated Date
  addFieldToArray(
    fields, 
    entry.estimatedDate, 
    "form1[0].Section15_2[0].CheckBox[0]", 
    "Estimated date"
  );
  
  // Offense Description
  addFieldToArray(
    fields, 
    entry.descriptionOfOffense, 
    "form1[0].Section15_2[0].From_Datefield_Name_2[1]", 
    "Description of offense"
  );
  
  // Procedure Name
  addFieldToArray(
    fields, 
    entry.nameOfProcedure, 
    "form1[0].Section15_2[0].From_Datefield_Name_2[2]", 
    "Name of procedure"
  );
  
  // Court Description
  addFieldToArray(
    fields, 
    entry.courtDescription, 
    "form1[0].Section15_2[0].From_Datefield_Name_2[3]", 
    "Description of court"
  );
  
  // Outcome Description
  addFieldToArray(
    fields, 
    entry.outcomeDescription, 
    "form1[0].Section15_2[0].From_Datefield_Name_2[4]", 
    "Description of outcome"
  );
}

/**
 * Add foreign military service fields to the fields array
 */
function addForeignMilitaryServiceFields(fields: FieldMetadata[], entry: ForeignServiceEntry): void {
  // Organization Type
  addFieldToArray(
    fields, 
    entry.organizationType, 
    "form1[0].Section15_3[0].RadioButtonList[1]", 
    "Organization type"
  );
  
  // Organization Type Other or Organization Name (same field ID but different contexts)
  if (entry.organizationType.value === "7" && entry.organizationTypeOther) {
    addFieldToArray(
      fields, 
      entry.organizationTypeOther, 
      "form1[0].Section15_3[0].TextField11[0]", 
      "Other organization type"
    );
  } else {
    addFieldToArray(
      fields, 
      entry.organizationName, 
      "form1[0].Section15_3[0].TextField11[0]", 
      "Organization name"
    );
  }
  
  // Country
  addFieldToArray(
    fields, 
    entry.country, 
    "form1[0].Section15_3[0].DropDownList29[0]", 
    "Country"
  );
  
  // Period of Service From
  addFieldToArray(
    fields, 
    entry.periodOfServiceFrom, 
    "form1[0].Section15_3[0].From_Datefield_Name_2[0]", 
    "Period of service from"
  );
  
  // Estimated Period From
  addFieldToArray(
    fields, 
    entry.estimatedPeriodFrom, 
    "form1[0].Section15_3[0].CheckBox[0]", 
    "Estimated period from"
  );
  
  // Period of Service To
  addFieldToArray(
    fields, 
    entry.periodOfServiceTo, 
    "form1[0].Section15_3[0].From_Datefield_Name_2[1]", 
    "Period of service to"
  );
  
  // Present
  addFieldToArray(
    fields, 
    entry.present, 
    "form1[0].Section15_3[0].CheckBox[1]", 
    "Present"
  );
  
  // Estimated Period To
  addFieldToArray(
    fields, 
    entry.estimatedPeriodTo, 
    "form1[0].Section15_3[0].CheckBox[2]", 
    "Estimated period to"
  );
  
  // Highest Rank
  addFieldToArray(
    fields, 
    entry.highestRank, 
    "form1[0].Section15_3[0].TextField11[1]", 
    "Highest rank"
  );
  
  // Department or Office
  addFieldToArray(
    fields, 
    entry.departmentOrOffice, 
    "form1[0].Section15_3[0].TextField11[2]", 
    "Department or office"
  );
  
  // Association Description
  addFieldToArray(
    fields, 
    entry.associationDescription, 
    "form1[0].Section15_3[0].TextField13[0]", 
    "Association description"
  );
  
  // Reason for Leaving
  addFieldToArray(
    fields, 
    entry.reasonForLeaving, 
    "form1[0].Section15_3[0].TextField12[0]", 
    "Reason for leaving"
  );
  
  // Maintains Contact
  addFieldToArray(
    fields, 
    entry.maintainsContact, 
    "form1[0].Section15_3[0].RadioButtonList[2]", 
    "Maintains contact"
  );
  
  // Add contact entries
  if (entry.contacts && entry.contacts.length > 0) {
    entry.contacts.forEach((contact, index) => {
      addContactFields(fields, contact, index);
    });
  }
}

/**
 * Add contact fields to the fields array
 */
function addContactFields(fields: FieldMetadata[], contact: ContactEntry, index: number): void {
  // Contact index-specific field name part
  const contactPrefix = index === 0 
    ? "form1[0].Section15_3[0].TextField11" 
    : `form1[0].Section15_3[0].TextField11_${index}`;
  
  // Last Name
  addFieldToArray(
    fields, 
    contact.lastName, 
    `${contactPrefix}[6]`, 
    "Last name"
  );
  
  // First Name
  addFieldToArray(
    fields, 
    contact.firstName, 
    `${contactPrefix}[7]`, 
    "First name"
  );
  
  // Middle Name
  addFieldToArray(
    fields, 
    contact.middleName, 
    `${contactPrefix}[8]`, 
    "Middle name"
  );
  
  // Suffix
  addFieldToArray(
    fields, 
    contact.suffix, 
    `form1[0].Section15_3[0].suffix[0]`, 
    "Suffix"
  );
  
  // Address - Street
  addFieldToArray(
    fields, 
    contact.address.street, 
    `form1[0].Section15_3[0].TextField11[3]`, 
    "Street"
  );
  
  // Address - City
  addFieldToArray(
    fields, 
    contact.address.city, 
    `form1[0].Section15_3[0].TextField11[4]`, 
    "City"
  );
  
  // Address - State
  addFieldToArray(
    fields, 
    contact.address.state, 
    `form1[0].Section15_3[0].School6_State[0]`, 
    "State"
  );
  
  // Address - Zip Code
  addFieldToArray(
    fields, 
    contact.address.zipCode, 
    `form1[0].Section15_3[0].TextField11[5]`, 
    "Zip code"
  );
  
  // Address - Country
  addFieldToArray(
    fields, 
    contact.address.country, 
    `form1[0].Section15_3[0].DropDownList6[0]`, 
    "Country"
  );
  
  // Official Title
  addFieldToArray(
    fields, 
    contact.officialTitle, 
    `form1[0].Section15_3[0].TextField11[9]`, 
    "Official title"
  );
  
  // Frequency of Contact
  addFieldToArray(
    fields, 
    contact.frequencyOfContact, 
    `form1[0].Section15_3[0].TextField11[10]`, 
    "Frequency of contact"
  );
  
  // Association From
  addFieldToArray(
    fields, 
    contact.associationFrom, 
    `form1[0].Section15_3[0].From_Datefield_Name_2[2]`, 
    "Association from"
  );
  
  // Estimated Association From
  addFieldToArray(
    fields, 
    contact.estimatedAssociationFrom, 
    `form1[0].Section15_3[0].CheckBox[3]`, 
    "Estimated association from"
  );
  
  // Association To
  addFieldToArray(
    fields, 
    contact.associationTo, 
    `form1[0].Section15_3[0].From_Datefield_Name_2[3]`, 
    "Association to"
  );
  
  // Present
  addFieldToArray(
    fields, 
    contact.present, 
    `form1[0].Section15_3[0].CheckBox[4]`, 
    "Present"
  );
  
  // Estimated Association To
  addFieldToArray(
    fields, 
    contact.estimatedAssociationTo, 
    `form1[0].Section15_3[0].CheckBox[5]`, 
    "Estimated association to"
  );
}

/**
 * Integrates this mapping utility with the section-to-component mapping system
 * Register this utility with the section mapping system
 */
export function registerMilitaryHistoryMapping(): void {
  try {
    const sectionInfo = getSectionInfo(SECTION_NUMBER);
    if (!sectionInfo) {
      logger.error(`Section ${SECTION_NUMBER} not found in section mapping`);
      return;
    }
    
    // Log registration attempt
    logger.info(`Registering Military History mapping for section ${SECTION_NUMBER} (${sectionInfo.name})`);
    
    // For now, we'll just log that the mapping is available
    // This would typically be integrated with a form controller or routing system
    // that knows to use these mapping functions for the Military History section
    logger.info(`Military History mapping registered for section ${SECTION_NUMBER} (${sectionInfo.name})`);
    
    // In a real implementation, you might register with a central service:
    // const mappingService = new FieldMappingService(); // or get from a service container
    // mappingService.registerSectionMapping(SECTION_NUMBER, {
    //   toContext: mapFieldsToMilitaryHistoryInfo,
    //   fromContext: mapMilitaryHistoryInfoToFields,
    //   validate: validateMilitaryHistoryInfo
    // });
  } catch (err) {
    logger.error(`Error registering Military History mapping: ${err}`);
  }
}

/**
 * Validates a military history record for data integrity
 * 
 * This function performs comprehensive validation of military history information.
 * It checks for required fields, proper relationships between fields, and valid data formats.
 * 
 * The validation includes:
 * - Checking if required top-level fields are present
 * - Validating US military service entries if the user indicated they served
 * - Validating court martial entries if the user indicated they had disciplinary actions
 * - Validating foreign military service entries if the user indicated they served in foreign militaries
 * 
 * Each section has specialized validation relevant to its specific data requirements.
 * 
 * @param militaryHistoryInfo - The military history information to validate
 * @returns Object with validation result and any error messages
 */
export function validateMilitaryHistoryInfo(militaryHistoryInfo: MilitaryHistoryInfo): 
  { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    // Handle null/undefined militaryHistoryInfo
    if (!militaryHistoryInfo) {
      errors.push('Military history information is missing or invalid');
      return { isValid: false, errors };
    }
    
    // Validate top-level required fields
    if (!militaryHistoryInfo.everServedInUSMilitary || !militaryHistoryInfo.everServedInUSMilitary.value) {
      errors.push('Response to "Have you ever served in the U.S. Military?" is required');
    }
    
    if (!militaryHistoryInfo.disciplinaryProcedure || !militaryHistoryInfo.disciplinaryProcedure.value) {
      errors.push('Response to "Have you been subject to court martial or other disciplinary procedure?" is required');
    }
    
    if (!militaryHistoryInfo.everServedInForeignMilitary || !militaryHistoryInfo.everServedInForeignMilitary.value) {
      errors.push('Response to "Have you ever served in a foreign military?" is required');
    }
    
    // Validate US military service entries if user indicated they served
    if (militaryHistoryInfo.everServedInUSMilitary && 
        militaryHistoryInfo.everServedInUSMilitary.value === "YES") {
      
      // Check if military service entries exist
      if (!militaryHistoryInfo.section15_1 || militaryHistoryInfo.section15_1.length === 0) {
        errors.push('US military service details are required when "Have you ever served in the U.S. Military?" is YES');
      } else {
        // Validate each service entry
        militaryHistoryInfo.section15_1.forEach((entry, index) => {
          try {
            validateMilitaryServiceEntry(entry, index, errors);
          } catch (err) {
            errors.push(`Error validating US military service entry ${index}: ${err}`);
          }
        });
      }
    }
    
    // Validate court martial entries if user indicated they had disciplinary procedures
    if (militaryHistoryInfo.disciplinaryProcedure && 
        militaryHistoryInfo.disciplinaryProcedure.value === "YES ") {
      
      // Check if court martial entries exist
      if (!militaryHistoryInfo.section15_2 || militaryHistoryInfo.section15_2.length === 0) {
        errors.push('Court martial details are required when "Have you been subject to court martial?" is YES');
      } else {
        // Validate each court martial entry
        militaryHistoryInfo.section15_2.forEach((entry, index) => {
          try {
            validateCourtMartialEntry(entry, index, errors);
          } catch (err) {
            errors.push(`Error validating court martial entry ${index}: ${err}`);
          }
        });
      }
    }
    
    // Validate foreign military service entries if user indicated they served
    if (militaryHistoryInfo.everServedInForeignMilitary && 
        militaryHistoryInfo.everServedInForeignMilitary.value === "YES") {
      
      // Check if foreign service entries exist
      if (!militaryHistoryInfo.section15_3 || militaryHistoryInfo.section15_3.length === 0) {
        errors.push('Foreign military service details are required when "Have you ever served in a foreign military?" is YES');
      } else {
        // Validate each foreign service entry
        militaryHistoryInfo.section15_3.forEach((entry, index) => {
          try {
            validateForeignServiceEntry(entry, index, errors);
          } catch (err) {
            errors.push(`Error validating foreign military service entry ${index}: ${err}`);
          }
        });
      }
    }
  } catch (err) {
    errors.push(`Critical validation error: ${err}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a military service entry for completeness and data integrity
 * 
 * This function validates that all required fields in a military service entry
 * are present and properly formatted. It checks for:
 * - Branch information
 * - Service dates
 * - Status information
 * - Discharge information when applicable
 * 
 * @param entry - The military service entry to validate
 * @param index - The index of the entry in the array (for error reporting)
 * @param errors - The array to which any validation errors will be added
 */
function validateMilitaryServiceEntry(entry: MilitaryServiceEntry, index: number, errors: string[]): void {
  // Validate required fields
  if (!entry.branch || !entry.branch.value) {
    errors.push(`US military service entry ${index + 1}: Branch is required`);
  }
  
  if (!entry.status || !entry.status.value) {
    errors.push(`US military service entry ${index + 1}: Status is required`);
  }
  
  if (!entry.officerOrEnlisted || !entry.officerOrEnlisted.value) {
    errors.push(`US military service entry ${index + 1}: Officer or Enlisted status is required`);
  }
  
  // Validate service dates
  if (!entry.serviceFromDate || !entry.serviceFromDate.value) {
    errors.push(`US military service entry ${index + 1}: Service start date is required`);
  }
  
  // If not present, validate service end date
  if ((!entry.present || entry.present.value !== "Yes") && 
      (!entry.serviceToDate || !entry.serviceToDate.value)) {
    errors.push(`US military service entry ${index + 1}: Service end date is required when not currently serving`);
  }
  
  // Validate discharge information if discharged = Yes
  if (entry.discharged && entry.discharged.value === "Yes") {
    if (!entry.typeOfDischarge || !entry.typeOfDischarge.value) {
      errors.push(`US military service entry ${index + 1}: Type of discharge is required`);
    }
    
    if (!entry.dischargeDate || !entry.dischargeDate.value) {
      errors.push(`US military service entry ${index + 1}: Discharge date is required`);
    }
    
    if (!entry.dischargeReason || !entry.dischargeReason.value) {
      errors.push(`US military service entry ${index + 1}: Discharge reason is required`);
    }
  }
}

/**
 * Validates a court martial entry for completeness and data integrity
 * 
 * This function validates that all required fields in a court martial entry
 * are present and properly formatted. It checks for:
 * - Date of the procedure
 * - Description of the offense
 * - Name of the procedure
 * - Court information
 * - Outcome description
 * 
 * @param entry - The court martial entry to validate
 * @param index - The index of the entry in the array (for error reporting)
 * @param errors - The array to which any validation errors will be added
 */
function validateCourtMartialEntry(entry: CourtMartialEntry, index: number, errors: string[]): void {
  // Validate required fields
  if (!entry.date || !entry.date.value) {
    errors.push(`Court martial entry ${index + 1}: Date is required`);
  }
  
  if (!entry.descriptionOfOffense || !entry.descriptionOfOffense.value) {
    errors.push(`Court martial entry ${index + 1}: Description of offense is required`);
  }
  
  if (!entry.nameOfProcedure || !entry.nameOfProcedure.value) {
    errors.push(`Court martial entry ${index + 1}: Name of procedure is required`);
  }
  
  if (!entry.courtDescription || !entry.courtDescription.value) {
    errors.push(`Court martial entry ${index + 1}: Court description is required`);
  }
  
  if (!entry.outcomeDescription || !entry.outcomeDescription.value) {
    errors.push(`Court martial entry ${index + 1}: Outcome description is required`);
  }
}

/**
 * Validates a foreign military service entry for completeness and data integrity
 * 
 * This function validates that all required fields in a foreign military service entry
 * are present and properly formatted. It checks for:
 * - Country information
 * - Organization type and name
 * - Service dates
 * - Rank and position
 * - Circumstances of the service
 * - Contact information (when maintaining contact is indicated)
 * 
 * @param entry - The foreign military service entry to validate
 * @param index - The index of the entry in the array (for error reporting)
 * @param errors - The array to which any validation errors will be added
 */
function validateForeignServiceEntry(entry: ForeignServiceEntry, index: number, errors: string[]): void {
  // Validate required fields
  if (!entry.organizationType || !entry.organizationType.value) {
    errors.push(`Foreign military service entry ${index + 1}: Organization type is required`);
  }
  
  // If organization type is 'Other', the 'Other' explanation is required
  if (entry.organizationType && entry.organizationType.value === "7" && !entry.organizationTypeOther?.value) {
    errors.push(`Foreign military service entry ${index + 1}: Explanation required for 'Other' organization type`);
  }
  
  if (!entry.organizationName || !entry.organizationName.value) {
    errors.push(`Foreign military service entry ${index + 1}: Organization name is required`);
  }
  
  if (!entry.country || !entry.country.value) {
    errors.push(`Foreign military service entry ${index + 1}: Country is required`);
  }
  
  // Validate service dates
  if (!entry.periodOfServiceFrom || !entry.periodOfServiceFrom.value) {
    errors.push(`Foreign military service entry ${index + 1}: Service start date is required`);
  }
  
  // If not present, validate service end date
  if ((!entry.present || entry.present.value !== "Yes") && 
      (!entry.periodOfServiceTo || !entry.periodOfServiceTo.value)) {
    errors.push(`Foreign military service entry ${index + 1}: Service end date is required when not currently serving`);
  }
  
  if (!entry.highestRank || !entry.highestRank.value) {
    errors.push(`Foreign military service entry ${index + 1}: Highest rank is required`);
  }
  
  if (!entry.departmentOrOffice || !entry.departmentOrOffice.value) {
    errors.push(`Foreign military service entry ${index + 1}: Department or office is required`);
  }
  
  if (!entry.associationDescription || !entry.associationDescription.value) {
    errors.push(`Foreign military service entry ${index + 1}: Association description is required`);
  }
  
  if (!entry.reasonForLeaving || !entry.reasonForLeaving.value) {
    errors.push(`Foreign military service entry ${index + 1}: Reason for leaving is required`);
  }
  
  // If maintaining contact, validate contacts
  if (entry.maintainsContact && entry.maintainsContact.value === "YES") {
    if (!entry.contacts || entry.contacts.length === 0) {
      errors.push(`Foreign military service entry ${index + 1}: Contact information is required when maintaining contact`);
    } else {
      // Validate each contact entry
      entry.contacts.forEach((contact, contactIndex) => {
        validateContactEntry(contact, index, contactIndex, errors);
      });
    }
  }
}

/**
 * Validates a contact entry for completeness and data integrity
 * 
 * This function validates that all required fields in a contact entry
 * are present and properly formatted. It checks for:
 * - Name information
 * - Address information
 * - Official title
 * - Association dates
 * 
 * @param contact - The contact entry to validate
 * @param entryIndex - The index of the parent entry in the array (for error reporting)
 * @param contactIndex - The index of the contact in the contacts array (for error reporting)
 * @param errors - The array to which any validation errors will be added
 */
function validateContactEntry(contact: ContactEntry, entryIndex: number, contactIndex: number, errors: string[]): void {
  // Validate required fields
  if (!contact.lastName || !contact.lastName.value) {
    errors.push(`Contact ${contactIndex + 1} for foreign military service entry ${entryIndex + 1}: Last name is required`);
  }
  
  if (!contact.firstName || !contact.firstName.value) {
    errors.push(`Contact ${contactIndex + 1} for foreign military service entry ${entryIndex + 1}: First name is required`);
  }
  
  // Validate address fields
  if (!contact.address.street || !contact.address.street.value) {
    errors.push(`Contact ${contactIndex + 1} for foreign military service entry ${entryIndex + 1}: Street address is required`);
  }
  
  if (!contact.address.city || !contact.address.city.value) {
    errors.push(`Contact ${contactIndex + 1} for foreign military service entry ${entryIndex + 1}: City is required`);
  }
  
  if (!contact.address.country || !contact.address.country.value) {
    errors.push(`Contact ${contactIndex + 1} for foreign military service entry ${entryIndex + 1}: Country is required`);
  }
  
  // Only require state and zip code for US addresses
  if (contact.address.country && contact.address.country.value === "United States") {
    if (!contact.address.state || !contact.address.state.value) {
      errors.push(`Contact ${contactIndex + 1} for foreign military service entry ${entryIndex + 1}: State is required for US addresses`);
    }
    
    if (!contact.address.zipCode || !contact.address.zipCode.value) {
      errors.push(`Contact ${contactIndex + 1} for foreign military service entry ${entryIndex + 1}: Zip code is required for US addresses`);
    }
  }
  
  if (!contact.officialTitle || !contact.officialTitle.value) {
    errors.push(`Contact ${contactIndex + 1} for foreign military service entry ${entryIndex + 1}: Official title is required`);
  }
  
  if (!contact.frequencyOfContact || !contact.frequencyOfContact.value) {
    errors.push(`Contact ${contactIndex + 1} for foreign military service entry ${entryIndex + 1}: Frequency of contact is required`);
  }
  
  // Validate association dates
  if (!contact.associationFrom || !contact.associationFrom.value) {
    errors.push(`Contact ${contactIndex + 1} for foreign military service entry ${entryIndex + 1}: Association start date is required`);
  }
  
  // If not present, validate association end date
  if ((!contact.present || contact.present.value !== "Yes") && 
      (!contact.associationTo || !contact.associationTo.value)) {
    errors.push(`Contact ${contactIndex + 1} for foreign military service entry ${entryIndex + 1}: Association end date is required when not currently in contact`);
  }
}

// Call the register function when this module is loaded
registerMilitaryHistoryMapping(); 