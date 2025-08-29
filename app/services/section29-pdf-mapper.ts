/**
 * Section 29 PDF Mapper - Association Record
 * Maps Section 29 data to PDF fields with 141 total fields
 * Handles questions about organizational affiliations including terrorism-related organizations
 */

import type { Section29 } from "../../api/interfaces/section-interfaces/section29";
import type { Field } from "../../api/interfaces/formDefinition2.0";

/**
 * Maps Section 29 data to PDF fields
 * Covers association records with 7 subsections and 141 total fields
 */
export function mapSection29ToPDFFields(section29Data: Section29): Map<string, any> {
  const pdfFields = new Map<string, any>();
  
  if (!section29Data?.section29) {
    return pdfFields;
  }

  const { section29 } = section29Data;

  // 29.1: Terrorism Organizations (33 fields)
  if (section29.terrorismOrganizations) {
    const subsection = section29.terrorismOrganizations;
    
    // Main question
    pdfFields.set("form1[0].Section29[0].RadioButtonList[0]", 
      subsection.hasAssociation?.value === "YES" ? "YES" : "NO");

    // Process up to 2 organization entries
    if (subsection.entries && Array.isArray(subsection.entries)) {
      subsection.entries.slice(0, 2).forEach((entry, index) => {
        if (index === 0) {
          // First Entry
          pdfFields.set("form1[0].Section29[0].TextField11[1]", entry.organizationName?.value || "");
          pdfFields.set("form1[0].Section29[0].TextField11[0]", entry.positions?.description?.value || "");
          pdfFields.set("form1[0].Section29[0].#field[6]", entry.positions?.noPositionsHeld?.value || false);
          pdfFields.set("form1[0].Section29[0].TextField11[2]", entry.contributions?.description?.value || "");
          pdfFields.set("form1[0].Section29[0].#field[7]", entry.contributions?.noContributionsMade?.value || false);
          pdfFields.set("form1[0].Section29[0].TextField11[3]", entry.involvementDescription?.value || "");
          
          // Address
          pdfFields.set("form1[0].Section29[0].#area[1].TextField11[4]", entry.address?.street?.value || "");
          pdfFields.set("form1[0].Section29[0].#area[1].TextField11[5]", entry.address?.city?.value || "");
          pdfFields.set("form1[0].Section29[0].#area[1].School6_State[0]", entry.address?.state?.value || "");
          pdfFields.set("form1[0].Section29[0].#area[1].TextField11[6]", entry.address?.zipCode?.value || "");
          pdfFields.set("form1[0].Section29[0].#area[1].DropDownList6[0]", entry.address?.country?.value || "");
          
          // Date Range
          pdfFields.set("form1[0].Section29[0].From_Datefield_Name_2[0]", entry.dateRange?.from?.date?.value || "");
          pdfFields.set("form1[0].Section29[0].#field[15]", entry.dateRange?.from?.estimated?.value || false);
          pdfFields.set("form1[0].Section29[0].#field[13]", entry.dateRange?.present?.value || false);
          pdfFields.set("form1[0].Section29[0].From_Datefield_Name_2[1]", entry.dateRange?.to?.date?.value || "");
          pdfFields.set("form1[0].Section29[0].#field[17]", entry.dateRange?.to?.estimated?.value || false);
        } else if (index === 1) {
          // Second Entry
          pdfFields.set("form1[0].Section29[0].TextField11[8]", entry.organizationName?.value || "");
          pdfFields.set("form1[0].Section29[0].TextField11[7]", entry.positions?.description?.value || "");
          pdfFields.set("form1[0].Section29[0].#field[22]", entry.positions?.noPositionsHeld?.value || false);
          pdfFields.set("form1[0].Section29[0].TextField11[9]", entry.contributions?.description?.value || "");
          pdfFields.set("form1[0].Section29[0].#field[23]", entry.contributions?.noContributionsMade?.value || false);
          pdfFields.set("form1[0].Section29[0].TextField11[10]", entry.involvementDescription?.value || "");
          
          // Address
          pdfFields.set("form1[0].Section29[0].#area[3].TextField11[11]", entry.address?.street?.value || "");
          pdfFields.set("form1[0].Section29[0].#area[3].TextField11[12]", entry.address?.city?.value || "");
          pdfFields.set("form1[0].Section29[0].#area[3].School6_State[1]", entry.address?.state?.value || "");
          pdfFields.set("form1[0].Section29[0].#area[3].TextField11[13]", entry.address?.zipCode?.value || "");
          pdfFields.set("form1[0].Section29[0].#area[3].DropDownList5[0]", entry.address?.country?.value || "");
          
          // Date Range
          pdfFields.set("form1[0].Section29[0].From_Datefield_Name_2[2]", entry.dateRange?.from?.date?.value || "");
          pdfFields.set("form1[0].Section29[0].#field[31]", entry.dateRange?.from?.estimated?.value || false);
          pdfFields.set("form1[0].Section29[0].#field[29]", entry.dateRange?.present?.value || false);
          pdfFields.set("form1[0].Section29[0].From_Datefield_Name_2[3]", entry.dateRange?.to?.date?.value || "");
          pdfFields.set("form1[0].Section29[0].#field[33]", entry.dateRange?.to?.estimated?.value || false);
        }
      });
    }
  }

  // 29.2: Terrorism Activities (13 fields)
  if (section29.terrorismActivities) {
    const subsection = section29.terrorismActivities;
    
    // Main question
    pdfFields.set("form1[0].Section29_2[0].RadioButtonList[0]", 
      subsection.hasActivity?.value === "YES" ? "YES" : "NO");

    // Process up to 2 activity entries
    if (subsection.entries && Array.isArray(subsection.entries)) {
      subsection.entries.slice(0, 2).forEach((entry, index) => {
        if (index === 0) {
          // First Entry
          pdfFields.set("form1[0].Section29_2[0].TextField11[0]", entry.activityDescription?.value || "");
          pdfFields.set("form1[0].Section29_2[0].From_Datefield_Name_2[0]", entry.dateRange?.from?.date?.value || "");
          pdfFields.set("form1[0].Section29_2[0].#field[17]", entry.dateRange?.from?.estimated?.value || false);
          pdfFields.set("form1[0].Section29_2[0].#field[21]", entry.dateRange?.present?.value || false);
          pdfFields.set("form1[0].Section29_2[0].From_Datefield_Name_2[1]", entry.dateRange?.to?.date?.value || "");
          pdfFields.set("form1[0].Section29_2[0].#field[19]", entry.dateRange?.to?.estimated?.value || false);
        } else if (index === 1) {
          // Second Entry
          pdfFields.set("form1[0].Section29_2[0].TextField11[3]", entry.activityDescription?.value || "");
          pdfFields.set("form1[0].Section29_2[0].From_Datefield_Name_2[6]", entry.dateRange?.from?.date?.value || "");
          pdfFields.set("form1[0].Section29_2[0].#field[23]", entry.dateRange?.from?.estimated?.value || false);
          pdfFields.set("form1[0].Section29_2[0].#field[11]", entry.dateRange?.present?.value || false);
          pdfFields.set("form1[0].Section29_2[0].From_Datefield_Name_2[7]", entry.dateRange?.to?.date?.value || "");
          pdfFields.set("form1[0].Section29_2[0].#field[25]", entry.dateRange?.to?.estimated?.value || false);
        }
      });
    }
  }

  // 29.3: Terrorism Advocacy (13 fields - shares PDF section with 29.2)
  if (section29.terrorismAdvocacy) {
    const subsection = section29.terrorismAdvocacy;
    
    // Main question - Different radio button list from 29.2
    pdfFields.set("form1[0].Section29_2[0].RadioButtonList[1]", 
      subsection.hasActivity?.value === "YES" ? "YES" : "NO");

    // Process up to 2 advocacy entries
    if (subsection.entries && Array.isArray(subsection.entries)) {
      subsection.entries.slice(0, 2).forEach((entry, index) => {
        if (index === 0) {
          // First Entry
          pdfFields.set("form1[0].Section29_2[0].TextField11[1]", entry.advocacyReason?.value || "");
          // Note: Date fields may be shared with terrorism activities
          // Using same date fields as mapped in the JSON
          pdfFields.set("form1[0].Section29_2[0].From_Datefield_Name_2[0]", entry.dateRange?.from?.date?.value || "");
          pdfFields.set("form1[0].Section29_2[0].#field[17]", entry.dateRange?.from?.estimated?.value || false);
          pdfFields.set("form1[0].Section29_2[0].#field[21]", entry.dateRange?.present?.value || false);
          pdfFields.set("form1[0].Section29_2[0].From_Datefield_Name_2[1]", entry.dateRange?.to?.date?.value || "");
          pdfFields.set("form1[0].Section29_2[0].#field[19]", entry.dateRange?.to?.estimated?.value || false);
        } else if (index === 1) {
          // Second Entry
          pdfFields.set("form1[0].Section29_2[0].TextField11[2]", entry.advocacyReason?.value || "");
          pdfFields.set("form1[0].Section29_2[0].From_Datefield_Name_2[6]", entry.dateRange?.from?.date?.value || "");
          pdfFields.set("form1[0].Section29_2[0].#field[23]", entry.dateRange?.from?.estimated?.value || false);
          pdfFields.set("form1[0].Section29_2[0].#field[11]", entry.dateRange?.present?.value || false);
          pdfFields.set("form1[0].Section29_2[0].From_Datefield_Name_2[7]", entry.dateRange?.to?.date?.value || "");
          pdfFields.set("form1[0].Section29_2[0].#field[25]", entry.dateRange?.to?.estimated?.value || false);
        }
      });
    }
  }

  // 29.4: Violent Overthrow Organizations (33 fields)
  if (section29.violentOverthrowOrganizations) {
    const subsection = section29.violentOverthrowOrganizations;
    
    // Main question
    pdfFields.set("form1[0].Section29_3[0].RadioButtonList[0]", 
      subsection.hasAssociation?.value === "YES" ? "YES" : "NO");

    // Process up to 2 organization entries
    if (subsection.entries && Array.isArray(subsection.entries)) {
      subsection.entries.slice(0, 2).forEach((entry, index) => {
        if (index === 0) {
          // First Entry
          pdfFields.set("form1[0].Section29_3[0].TextField11[1]", entry.organizationName?.value || "");
          pdfFields.set("form1[0].Section29_3[0].TextField11[0]", entry.positions?.description?.value || "");
          pdfFields.set("form1[0].Section29_3[0].#field[6]", entry.positions?.noPositionsHeld?.value || false);
          pdfFields.set("form1[0].Section29_3[0].TextField11[2]", entry.contributions?.description?.value || "");
          pdfFields.set("form1[0].Section29_3[0].#field[7]", entry.contributions?.noContributionsMade?.value || false);
          pdfFields.set("form1[0].Section29_3[0].TextField11[3]", entry.involvementDescription?.value || "");
          
          // Address
          pdfFields.set("form1[0].Section29_3[0].#area[1].TextField11[4]", entry.address?.street?.value || "");
          pdfFields.set("form1[0].Section29_3[0].#area[1].TextField11[5]", entry.address?.city?.value || "");
          pdfFields.set("form1[0].Section29_3[0].#area[1].School6_State[0]", entry.address?.state?.value || "");
          pdfFields.set("form1[0].Section29_3[0].#area[1].TextField11[6]", entry.address?.zipCode?.value || "");
          pdfFields.set("form1[0].Section29_3[0].#area[1].DropDownList4[0]", entry.address?.country?.value || "");
          
          // Date Range
          pdfFields.set("form1[0].Section29_3[0].From_Datefield_Name_2[0]", entry.dateRange?.from?.date?.value || "");
          pdfFields.set("form1[0].Section29_3[0].#field[15]", entry.dateRange?.from?.estimated?.value || false);
          pdfFields.set("form1[0].Section29_3[0].#field[13]", entry.dateRange?.present?.value || false);
          pdfFields.set("form1[0].Section29_3[0].From_Datefield_Name_2[1]", entry.dateRange?.to?.date?.value || "");
          pdfFields.set("form1[0].Section29_3[0].#field[17]", entry.dateRange?.to?.estimated?.value || false);
        } else if (index === 1) {
          // Second Entry
          pdfFields.set("form1[0].Section29_3[0].TextField11[8]", entry.organizationName?.value || "");
          pdfFields.set("form1[0].Section29_3[0].TextField11[7]", entry.positions?.description?.value || "");
          pdfFields.set("form1[0].Section29_3[0].#field[22]", entry.positions?.noPositionsHeld?.value || false);
          pdfFields.set("form1[0].Section29_3[0].TextField11[9]", entry.contributions?.description?.value || "");
          pdfFields.set("form1[0].Section29_3[0].#field[23]", entry.contributions?.noContributionsMade?.value || false);
          pdfFields.set("form1[0].Section29_3[0].TextField11[10]", entry.involvementDescription?.value || "");
          
          // Address
          pdfFields.set("form1[0].Section29_3[0].#area[3].TextField11[11]", entry.address?.street?.value || "");
          pdfFields.set("form1[0].Section29_3[0].#area[3].TextField11[12]", entry.address?.city?.value || "");
          pdfFields.set("form1[0].Section29_3[0].#area[3].School6_State[1]", entry.address?.state?.value || "");
          pdfFields.set("form1[0].Section29_3[0].#area[3].TextField11[13]", entry.address?.zipCode?.value || "");
          pdfFields.set("form1[0].Section29_3[0].#area[3].DropDownList3[0]", entry.address?.country?.value || "");
          
          // Date Range
          pdfFields.set("form1[0].Section29_3[0].From_Datefield_Name_2[2]", entry.dateRange?.from?.date?.value || "");
          pdfFields.set("form1[0].Section29_3[0].#field[31]", entry.dateRange?.from?.estimated?.value || false);
          pdfFields.set("form1[0].Section29_3[0].#field[29]", entry.dateRange?.present?.value || false);
          pdfFields.set("form1[0].Section29_3[0].From_Datefield_Name_2[3]", entry.dateRange?.to?.date?.value || "");
          pdfFields.set("form1[0].Section29_3[0].#field[33]", entry.dateRange?.to?.estimated?.value || false);
        }
      });
    }
  }

  // 29.5: Violence/Force Organizations (33 fields)
  if (section29.violenceForceOrganizations) {
    const subsection = section29.violenceForceOrganizations;
    
    // Main question
    pdfFields.set("form1[0].Section29_4[0].RadioButtonList[0]", 
      subsection.hasAssociation?.value === "YES" ? "YES" : "NO");

    // Process up to 2 organization entries
    if (subsection.entries && Array.isArray(subsection.entries)) {
      subsection.entries.slice(0, 2).forEach((entry, index) => {
        if (index === 0) {
          // First Entry
          pdfFields.set("form1[0].Section29_4[0].TextField11[1]", entry.organizationName?.value || "");
          pdfFields.set("form1[0].Section29_4[0].TextField11[0]", entry.positions?.description?.value || "");
          pdfFields.set("form1[0].Section29_4[0].#field[6]", entry.positions?.noPositionsHeld?.value || false);
          pdfFields.set("form1[0].Section29_4[0].TextField11[2]", entry.contributions?.description?.value || "");
          pdfFields.set("form1[0].Section29_4[0].#field[7]", entry.contributions?.noContributionsMade?.value || false);
          pdfFields.set("form1[0].Section29_4[0].TextField11[3]", entry.involvementDescription?.value || "");
          
          // Address
          pdfFields.set("form1[0].Section29_4[0].#area[1].TextField11[4]", entry.address?.street?.value || "");
          pdfFields.set("form1[0].Section29_4[0].#area[1].TextField11[5]", entry.address?.city?.value || "");
          pdfFields.set("form1[0].Section29_4[0].#area[1].School6_State[0]", entry.address?.state?.value || "");
          pdfFields.set("form1[0].Section29_4[0].#area[1].TextField11[6]", entry.address?.zipCode?.value || "");
          pdfFields.set("form1[0].Section29_4[0].#area[1].DropDownList2[0]", entry.address?.country?.value || "");
          
          // Date Range
          pdfFields.set("form1[0].Section29_4[0].From_Datefield_Name_2[0]", entry.dateRange?.from?.date?.value || "");
          pdfFields.set("form1[0].Section29_4[0].#field[15]", entry.dateRange?.from?.estimated?.value || false);
          pdfFields.set("form1[0].Section29_4[0].#field[13]", entry.dateRange?.present?.value || false);
          pdfFields.set("form1[0].Section29_4[0].From_Datefield_Name_2[1]", entry.dateRange?.to?.date?.value || "");
          pdfFields.set("form1[0].Section29_4[0].#field[17]", entry.dateRange?.to?.estimated?.value || false);
        } else if (index === 1) {
          // Second Entry
          pdfFields.set("form1[0].Section29_4[0].TextField11[8]", entry.organizationName?.value || "");
          pdfFields.set("form1[0].Section29_4[0].TextField11[7]", entry.positions?.description?.value || "");
          pdfFields.set("form1[0].Section29_4[0].#field[22]", entry.positions?.noPositionsHeld?.value || false);
          pdfFields.set("form1[0].Section29_4[0].TextField11[9]", entry.contributions?.description?.value || "");
          pdfFields.set("form1[0].Section29_4[0].#field[23]", entry.contributions?.noContributionsMade?.value || false);
          pdfFields.set("form1[0].Section29_4[0].TextField11[10]", entry.involvementDescription?.value || "");
          
          // Address
          pdfFields.set("form1[0].Section29_4[0].#area[3].TextField11[11]", entry.address?.street?.value || "");
          pdfFields.set("form1[0].Section29_4[0].#area[3].TextField11[12]", entry.address?.city?.value || "");
          pdfFields.set("form1[0].Section29_4[0].#area[3].School6_State[1]", entry.address?.state?.value || "");
          pdfFields.set("form1[0].Section29_4[0].#area[3].TextField11[13]", entry.address?.zipCode?.value || "");
          pdfFields.set("form1[0].Section29_4[0].#area[3].DropDownList1[0]", entry.address?.country?.value || "");
          
          // Date Range
          pdfFields.set("form1[0].Section29_4[0].From_Datefield_Name_2[2]", entry.dateRange?.from?.date?.value || "");
          pdfFields.set("form1[0].Section29_4[0].#field[31]", entry.dateRange?.from?.estimated?.value || false);
          pdfFields.set("form1[0].Section29_4[0].#field[29]", entry.dateRange?.present?.value || false);
          pdfFields.set("form1[0].Section29_4[0].From_Datefield_Name_2[3]", entry.dateRange?.to?.date?.value || "");
          pdfFields.set("form1[0].Section29_4[0].#field[33]", entry.dateRange?.to?.estimated?.value || false);
        }
      });
    }
  }

  // 29.6: Overthrow Activities (13 fields)
  if (section29.overthrowActivities) {
    const subsection = section29.overthrowActivities;
    
    // Main question
    pdfFields.set("form1[0].Section29_5[0].RadioButtonList[0]", 
      subsection.hasActivity?.value === "YES" ? "YES" : "NO");

    // Process up to 2 activity entries
    if (subsection.entries && Array.isArray(subsection.entries)) {
      subsection.entries.slice(0, 2).forEach((entry, index) => {
        if (index === 0) {
          // First Entry
          pdfFields.set("form1[0].Section29_5[0].TextField11[0]", entry.activityDescription?.value || "");
          pdfFields.set("form1[0].Section29_5[0].From_Datefield_Name_2[0]", entry.dateRange?.from?.date?.value || "");
          pdfFields.set("form1[0].Section29_5[0].#field[7]", entry.dateRange?.from?.estimated?.value || false);
          pdfFields.set("form1[0].Section29_5[0].#field[5]", entry.dateRange?.present?.value || false);
          pdfFields.set("form1[0].Section29_5[0].From_Datefield_Name_2[1]", entry.dateRange?.to?.date?.value || "");
          pdfFields.set("form1[0].Section29_5[0].#field[9]", entry.dateRange?.to?.estimated?.value || false);
        } else if (index === 1) {
          // Second Entry
          pdfFields.set("form1[0].Section29_5[0].TextField11[3]", entry.activityDescription?.value || "");
          pdfFields.set("form1[0].Section29_5[0].From_Datefield_Name_2[2]", entry.dateRange?.from?.date?.value || "");
          pdfFields.set("form1[0].Section29_5[0].#field[13]", entry.dateRange?.from?.estimated?.value || false);
          pdfFields.set("form1[0].Section29_5[0].#field[11]", entry.dateRange?.present?.value || false);
          pdfFields.set("form1[0].Section29_5[0].From_Datefield_Name_2[3]", entry.dateRange?.to?.date?.value || "");
          pdfFields.set("form1[0].Section29_5[0].#field[15]", entry.dateRange?.to?.estimated?.value || false);
        }
      });
    }
  }

  // 29.7: Terrorism Associations (3 fields)
  if (section29.terrorismAssociations) {
    const subsection = section29.terrorismAssociations;
    
    // Main question
    pdfFields.set("form1[0].Section29_5[0].RadioButtonList[1]", 
      subsection.hasAssociation?.value === "YES" ? "YES" : "NO");

    // Process up to 2 association entries
    if (subsection.entries && Array.isArray(subsection.entries)) {
      subsection.entries.slice(0, 2).forEach((entry, index) => {
        if (index === 0) {
          // First Entry
          pdfFields.set("form1[0].Section29_5[0].TextField11[1]", entry.explanation?.value || "");
        } else if (index === 1) {
          // Second Entry
          pdfFields.set("form1[0].Section29_5[0].TextField11[2]", entry.explanation?.value || "");
        }
      });
    }
  }

  // Legacy support for combined 29.6 & 29.7 (backward compatibility)
  if (section29.overthrowActivitiesAndAssociations && 
      !section29.overthrowActivities && 
      !section29.terrorismAssociations) {
    const subsection = section29.overthrowActivitiesAndAssociations;
    
    // Both radio buttons
    pdfFields.set("form1[0].Section29_5[0].RadioButtonList[0]", 
      subsection.hasActivity?.value === "YES" ? "YES" : "NO");
    pdfFields.set("form1[0].Section29_5[0].RadioButtonList[1]", 
      subsection.hasAssociation?.value === "YES" ? "YES" : "NO");

    // Process mixed entries
    if (subsection.entries && Array.isArray(subsection.entries)) {
      let overthrowIndex = 0;
      let associationIndex = 0;
      
      subsection.entries.forEach((entry: any) => {
        // Check if it's an overthrow activity entry (has activityDescription)
        if ('activityDescription' in entry && overthrowIndex < 2) {
          if (overthrowIndex === 0) {
            pdfFields.set("form1[0].Section29_5[0].TextField11[0]", entry.activityDescription?.value || "");
            pdfFields.set("form1[0].Section29_5[0].From_Datefield_Name_2[0]", entry.dateRange?.from?.date?.value || "");
            pdfFields.set("form1[0].Section29_5[0].#field[7]", entry.dateRange?.from?.estimated?.value || false);
            pdfFields.set("form1[0].Section29_5[0].#field[5]", entry.dateRange?.present?.value || false);
            pdfFields.set("form1[0].Section29_5[0].From_Datefield_Name_2[1]", entry.dateRange?.to?.date?.value || "");
            pdfFields.set("form1[0].Section29_5[0].#field[9]", entry.dateRange?.to?.estimated?.value || false);
          } else if (overthrowIndex === 1) {
            pdfFields.set("form1[0].Section29_5[0].TextField11[3]", entry.activityDescription?.value || "");
            pdfFields.set("form1[0].Section29_5[0].From_Datefield_Name_2[2]", entry.dateRange?.from?.date?.value || "");
            pdfFields.set("form1[0].Section29_5[0].#field[13]", entry.dateRange?.from?.estimated?.value || false);
            pdfFields.set("form1[0].Section29_5[0].#field[11]", entry.dateRange?.present?.value || false);
            pdfFields.set("form1[0].Section29_5[0].From_Datefield_Name_2[3]", entry.dateRange?.to?.date?.value || "");
            pdfFields.set("form1[0].Section29_5[0].#field[15]", entry.dateRange?.to?.estimated?.value || false);
          }
          overthrowIndex++;
        }
        // Check if it's a terrorism association entry (has explanation)
        else if ('explanation' in entry && associationIndex < 2) {
          if (associationIndex === 0) {
            pdfFields.set("form1[0].Section29_5[0].TextField11[1]", entry.explanation?.value || "");
          } else if (associationIndex === 1) {
            pdfFields.set("form1[0].Section29_5[0].TextField11[2]", entry.explanation?.value || "");
          }
          associationIndex++;
        }
      });
    }
  }

  return pdfFields;
}

// Type guard to check if a field has a value
function hasFieldValue<T>(field: Field<T> | undefined): field is Field<T> {
  return field !== undefined && field.value !== undefined && field.value !== null && field.value !== "";
}