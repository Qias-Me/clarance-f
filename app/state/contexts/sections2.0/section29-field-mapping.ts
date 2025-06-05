// /**
//  * Section 29 Field Mapping - Load actual PDF field names from section-29.json
//  *
//  * This module loads the actual PDF field names and IDs from the section-29.json
//  * reference file and provides mapping functions for Section 29 fields.
//  *
//  * Section 29 Structure:
//  * - 7 Subsections: Section29[0], Section29_2[0], Section29_3[0], Section29_4[0], Section29_5[0], Section29_6[0], Section29_7[0]
//  * - Each subsection has 2 entries (Entry #1 and Entry #2)
//  * - Total: 141 fields across all subsections
//  */

// import section29Data from '../../../../api/sections-references/section-29.json';
// import { SECTION29_RADIO_FIELD_IDS, SECTION29_RADIO_FIELD_NAMES } from '../../../../api/interfaces/sections2.0/section29';

// // Types for the JSON structure
// interface Section29Field {
//   id: string;
//   name: string;
//   page: number;
//   label: string;
//   type: string;
//   options: any[];
//   rect: {
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//   };
//   section: number;
//   confidence: number;
//   wasMovedByHealing: boolean;
//   isExplicitlyDetected?: boolean;
//   uniqueId: string;
// }

// interface Section29JsonData {
//   metadata: {
//     sectionId: number;
//     sectionName: string;
//     totalFields: number;
//     subsectionCount: number;
//     entryCount: number;
//     exportDate: string;
//     averageConfidence: number;
//     pageRange: number[];
//   };
//   fields: Section29Field[];
// }

// // Load the actual field data
// const section29Fields: Section29Field[] = (section29Data as Section29JsonData).fields;

// // Create a mapping from field names to field data
// const fieldNameToDataMap = new Map<string, Section29Field>();
// section29Fields.forEach(field => {
//   fieldNameToDataMap.set(field.name, field);
// });

// // Create a mapping from field IDs to field data
// const fieldIdToDataMap = new Map<string, Section29Field>();
// section29Fields.forEach(field => {
//   // Extract numeric ID from "16435 0 R" format
//   const numericId = field.id.replace(' 0 R', '');
//   fieldIdToDataMap.set(numericId, field);
// });

// /**
//  * Get the actual PDF field data for a given field name
//  */
// export function getPdfFieldByName(fieldName: string): Section29Field | undefined {
//   return fieldNameToDataMap.get(fieldName);
// }

// /**
//  * Get the actual PDF field data for a given numeric field ID
//  */
// export function getPdfFieldById(fieldId: string): Section29Field | undefined {
//   return fieldIdToDataMap.get(fieldId);
// }

// /**
//  * Get the numeric field ID for a given field name
//  */
// export function getNumericFieldId(fieldName: string): string | undefined {
//   const field = fieldNameToDataMap.get(fieldName);
//   if (field) {
//     return field.id.replace(' 0 R', '');
//   }
//   return undefined;
// }

// /**
//  * Get all available field names for Section 29
//  */
// export function getAllSection29FieldNames(): string[] {
//   return Array.from(fieldNameToDataMap.keys());
// }

// /**
//  * Get all available numeric field IDs for Section 29
//  */
// export function getAllSection29FieldIds(): string[] {
//   return Array.from(fieldIdToDataMap.keys());
// }

// /**
//  * Search for fields by pattern (useful for debugging)
//  */
// export function searchFieldsByPattern(pattern: string): Section29Field[] {
//   const regex = new RegExp(pattern, 'i');
//   return section29Fields.filter(field =>
//     regex.test(field.name) || regex.test(field.label || '')
//   );
// }

// /**
//  * Get field mapping statistics
//  */
// export function getFieldMappingStats() {
//   return {
//     totalFields: section29Fields.length,
//     fieldNames: fieldNameToDataMap.size,
//     fieldIds: fieldIdToDataMap.size,
//     sectionName: (section29Data as Section29JsonData).metadata.sectionName,
//     confidence: (section29Data as Section29JsonData).metadata.averageConfidence
//   };
// }

// /**
//  * Validate if a field name exists in the PDF
//  */
// export function isValidFieldName(fieldName: string): boolean {
//   return fieldNameToDataMap.has(fieldName);
// }

// /**
//  * Validate if a field ID exists in the PDF
//  */
// export function isValidFieldId(fieldId: string): boolean {
//   return fieldIdToDataMap.has(fieldId);
// }

// /**
//  * Get field suggestions for a partial field name (useful for debugging)
//  */
// export function getFieldSuggestions(partialName: string): string[] {
//   const suggestions: string[] = [];
//   const lowerPartial = partialName.toLowerCase();

//   for (const fieldName of fieldNameToDataMap.keys()) {
//     if (fieldName.toLowerCase().includes(lowerPartial)) {
//       suggestions.push(fieldName);
//     }
//   }

//   return suggestions.slice(0, 10); // Limit to 10 suggestions
// }

// /**
//  * Get the correct subsection pattern based on subsection key and entry index
//  *
//  * Section 29 has 7 radio questions across 5 PDF subsections with 141 total fields:
//  * - Section29[0]: Subsection A - Terrorism Organizations (1 radio + organization entries)
//  * - Section29_2[0]: Subsection B - Terrorism Activities (1 radio + activity entries)
//  * - Section29_3[0]: Subsection C - Violent Overthrow Organizations (1 radio + organization entries)
//  * - Section29_4[0]: Subsection D - Violence/Force Organizations (1 radio + organization entries)
//  * - Section29_5[0]: Subsection E & F - Overthrow Activities + Terrorism Associations (2 radios + entries)
//  *
//  * Each subsection supports 2 entries maximum, with specific field patterns per entry.
//  */
// export function getSubsectionPattern(subsectionKey: string, entryIndex: number): string {
//   // Map subsection keys to actual PDF subsection patterns
//   // Total 141 fields across 7 subsections:
//   // - Organization subsections (29.1, 29.4, 29.5): 33 fields each = 99 fields
//   // - Activity subsections (29.2, 29.3, 29.6): 13, 13, 13 fields = 39 fields
//   // - Association subsection (29.7): 3 fields
//   const subsectionMap: Record<string, string[]> = {
//     // 29.1: Terrorism Organizations (Section29[0]) - 33 fields
//     'terrorismOrganizations': [
//       'Section29[0]',      // All entries use Section29[0]
//       'Section29[0]'       // Entry #2 also uses Section29[0]
//     ],

//     // 29.2: Terrorism Activities (Section29_2[0]) - 13 fields
//     'terrorismActivities': [
//       'Section29_2[0]',    // All entries use Section29_2[0]
//       'Section29_2[0]'     // Entry #2 also uses Section29_2[0]
//     ],

//     // 29.3: Terrorism Advocacy (Section29_2[0]) - 13 fields (shares PDF section with 29.2)
//     'terrorismAdvocacy': [
//       'Section29_2[0]',    // All entries use Section29_2[0]
//       'Section29_2[0]'     // Entry #2 also uses Section29_2[0]
//     ],

//     // 29.4: Violent Overthrow Organizations (Section29_3[0]) - 33 fields
//     'violentOverthrowOrganizations': [
//       'Section29_3[0]',    // All entries use Section29_3[0]
//       'Section29_3[0]'     // Entry #2 also uses Section29_3[0]
//     ],

//     // 29.5: Violence/Force Organizations (Section29_4[0]) - 33 fields
//     'violenceForceOrganizations': [
//       'Section29_4[0]',    // All entries use Section29_4[0]
//       'Section29_4[0]'     // Entry #2 also uses Section29_4[0]
//     ],

//     // 29.6: Overthrow Activities (Section29_5[0] RadioButtonList[0]) - 13 fields
//     'overthrowActivities': [
//       'Section29_5[0]',    // All entries use Section29_5[0]
//       'Section29_5[0]'     // Entry #2 also uses Section29_5[0]
//     ],

//     // 29.7: Terrorism Associations (Section29_5[0] RadioButtonList[1]) - 3 fields
//     'terrorismAssociations': [
//       'Section29_5[0]',    // All entries use Section29_5[0]
//       'Section29_5[0]'     // Entry #2 also uses Section29_5[0]
//     ],

//     // Legacy mappings for backward compatibility
//     'overthrowActivitiesAndAssociations': [
//       'Section29_5[0]',    // Combined subsection for both 29.6 & 29.7
//       'Section29_5[0]'     // Entry #2 also uses Section29_5[0]
//     ],

//     'violenceOrganizations': [
//       'Section29_3[0]',    // Entry #1 (29.4)
//       'Section29_4[0]'     // Entry #2 (29.5)
//     ],

//     // Additional mappings for common subsection keys
//     'associations': [
//       'Section29[0]',      // Default to main subsection
//       'Section29_2[0]'
//     ],

//     // Default fallback for any unmapped keys
//     'default': [
//       'Section29[0]',      // Always default to main subsection
//       'Section29_2[0]'
//     ]
//   };

//   let patterns = subsectionMap[subsectionKey];

//   // If no specific mapping found, try to infer from key name
//   if (!patterns) {
//     console.warn(`Unknown subsection key: ${subsectionKey}, attempting to infer pattern...`);

//     // Try to match common patterns in the key name
//     if (subsectionKey.toLowerCase().includes('terrorism')) {
//       patterns = subsectionMap['terrorismOrganizations'];
//     } else if (subsectionKey.toLowerCase().includes('violence')) {
//       patterns = subsectionMap['violenceOrganizations'];
//     } else if (subsectionKey.toLowerCase().includes('overthrow')) {
//       patterns = subsectionMap['overthrowActivities'];
//     } else if (subsectionKey.toLowerCase().includes('association')) {
//       patterns = subsectionMap['terrorismAssociations'];
//     } else {
//       // Use default pattern
//       patterns = subsectionMap['default'];
//     }

//     console.warn(`Inferred pattern for ${subsectionKey}: ${patterns[0]}`);
//   }

//   // Return the appropriate pattern for the entry index
//   const patternIndex = Math.min(entryIndex, patterns.length - 1);
//   return patterns[patternIndex];
// }

// /**
//  * Get radio button field by subsection key and field type
//  * Handles the special case of Section29_5[0] having two radio buttons
//  */
// function getRadioButtonFieldBySubsection(
//   subsectionKey: string,
//   fieldType: string
// ): Section29Field | undefined {

//   // Use the exact field names from the constants
//   let radioButtonFieldName = '';

//   switch (subsectionKey) {
//     case 'terrorismOrganizations':
//       radioButtonFieldName = SECTION29_RADIO_FIELD_NAMES.TERRORISM_ORGANIZATIONS;
//       break;

//     case 'terrorismActivities':
//       radioButtonFieldName = SECTION29_RADIO_FIELD_NAMES.TERRORISM_ACTIVITIES;
//       break;

//     case 'terrorismAdvocacy':
//       radioButtonFieldName = SECTION29_RADIO_FIELD_NAMES.TERRORISM_ADVOCACY;
//       break;

//     case 'violentOverthrowOrganizations':
//       radioButtonFieldName = SECTION29_RADIO_FIELD_NAMES.VIOLENT_OVERTHROW_ORGANIZATIONS;
//       break;

//     case 'violenceForceOrganizations':
//       radioButtonFieldName = SECTION29_RADIO_FIELD_NAMES.VIOLENCE_FORCE_ORGANIZATIONS;
//       break;

//     case 'overthrowActivities':
//       radioButtonFieldName = SECTION29_RADIO_FIELD_NAMES.OVERTHROW_ACTIVITIES;
//       break;

//     case 'terrorismAssociations':
//       radioButtonFieldName = SECTION29_RADIO_FIELD_NAMES.TERRORISM_ASSOCIATIONS;
//       break;

//     case 'overthrowActivitiesAndAssociations':
//       // Legacy combined subsection - determine which radio button based on field type
//       if (fieldType === 'hasActivity') {
//         radioButtonFieldName = SECTION29_RADIO_FIELD_NAMES.OVERTHROW_ACTIVITIES;
//       } else if (fieldType === 'hasAssociation') {
//         radioButtonFieldName = SECTION29_RADIO_FIELD_NAMES.TERRORISM_ASSOCIATIONS;
//       }
//       break;

//     default:
//       console.warn(`Unknown subsection key for radio button: ${subsectionKey}`);
//       return undefined;
//   }

//   if (radioButtonFieldName) {
//     const field = fieldNameToDataMap.get(radioButtonFieldName);
//     if (field) {
//       console.log(`✅ Found radio button field for ${subsectionKey}.${fieldType}: ${field.name} (ID: ${field.id})`);
//       return field;
//     } else {
//       console.warn(`⚠️ Radio button field not found in PDF: ${radioButtonFieldName}`);
//     }
//   }

//   return undefined;
// }

// /**
//  * Get field by subsection pattern and field type
//  */
// export function getFieldBySubsectionAndType(
//   subsectionPattern: string,
//   fieldType: string,
//   entryIndex: number = 0,
//   subsectionKey?: string
// ): Section29Field | undefined {

//   // PRIORITY 1: Handle radio button fields with exact field names
//   if ((fieldType === 'hasAssociation' || fieldType === 'hasActivity') && subsectionKey) {
//     const radioButtonField = getRadioButtonFieldBySubsection(subsectionKey, fieldType);
//     if (radioButtonField) {
//       return radioButtonField;
//     }
//   }

//   // PRIORITY 2: Handle other field types with pattern-based mapping
//   let exactFieldName = '';

//   switch (fieldType) {
//     case 'hasAssociation':
//     case 'hasActivity':
//       // Fallback radio button mapping if subsectionKey not provided
//       // Special case: Section29_5[0] has 2 radio buttons for subsections 29.6 and 29.7
//       let radioButtonIndex = '0';

//       // Determine which radio button to use based on subsection context
//       if (subsectionPattern.includes('Section29_5')) {
//         // For Section29_5[0], default to RadioButtonList[0] for overthrow activities
//         // RadioButtonList[1] would be for terrorism associations
//         radioButtonIndex = '0'; // Default to first radio button
//       }

//       exactFieldName = `form1[0].${subsectionPattern}.RadioButtonList[${radioButtonIndex}]`;
//       break;

//     case 'organizationName':
//       // Entry #1 uses TextField11[1], Entry #2 uses TextField11[8]
//       const nameFieldIndex = entryIndex === 0 ? '1' : '8';
//       exactFieldName = `form1[0].${subsectionPattern}.TextField11[${nameFieldIndex}]`;
//       break;

//     case 'address.street':
//       // Entry #1 uses #area[1].TextField11[4], Entry #2 uses #area[3].TextField11[11]
//       const streetArea = entryIndex === 0 ? '1' : '3';
//       const streetField = entryIndex === 0 ? '4' : '11';
//       exactFieldName = `form1[0].${subsectionPattern}.#area[${streetArea}].TextField11[${streetField}]`;
//       break;

//     case 'address.city':
//       const cityArea = entryIndex === 0 ? '1' : '3';
//       const cityField = entryIndex === 0 ? '5' : '12';
//       exactFieldName = `form1[0].${subsectionPattern}.#area[${cityArea}].TextField11[${cityField}]`;
//       break;

//     case 'address.state':
//       const stateArea = entryIndex === 0 ? '1' : '3';
//       const stateIndex = entryIndex === 0 ? '0' : '1';
//       exactFieldName = `form1[0].${subsectionPattern}.#area[${stateArea}].School6_State[${stateIndex}]`;
//       break;

//     case 'address.zipCode':
//       const zipArea = entryIndex === 0 ? '1' : '3';
//       const zipField = entryIndex === 0 ? '6' : '13';
//       exactFieldName = `form1[0].${subsectionPattern}.#area[${zipArea}].TextField11[${zipField}]`;
//       break;

//     case 'address.country':
//       const countryArea = entryIndex === 0 ? '1' : '3';
//       // Different dropdown patterns for different subsections
//       let countryDropdown = 'DropDownList6[0]'; // Default for Section29[0]
//       if (subsectionPattern.includes('Section29_3')) {
//         countryDropdown = 'DropDownList4[0]';
//       } else if (subsectionPattern.includes('Section29_4')) {
//         countryDropdown = 'DropDownList1[0]';
//       }
//       exactFieldName = `form1[0].${subsectionPattern}.#area[${countryArea}].${countryDropdown}`;
//       break;

//     case 'dateRange.from':
//       // Date fields have different indices based on subsection and entry
//       let fromDateIndex = '0';
//       if (subsectionPattern.includes('Section29_2')) {
//         fromDateIndex = entryIndex === 0 ? '4' : '6';
//       } else if (subsectionPattern.includes('Section29_4')) {
//         fromDateIndex = entryIndex === 0 ? '2' : '4';
//       }
//       exactFieldName = `form1[0].${subsectionPattern}.From_Datefield_Name_2[${fromDateIndex}]`;
//       break;

//     case 'dateRange.to':
//       let toDateIndex = '1';
//       if (subsectionPattern.includes('Section29_2')) {
//         toDateIndex = entryIndex === 0 ? '5' : '7';
//       } else if (subsectionPattern.includes('Section29_4')) {
//         toDateIndex = entryIndex === 0 ? '3' : '5';
//       }
//       exactFieldName = `form1[0].${subsectionPattern}.From_Datefield_Name_2[${toDateIndex}]`;
//       break;

//     case 'positions.description':
//       const posFieldIndex = entryIndex === 0 ? '0' : '7';
//       exactFieldName = `form1[0].${subsectionPattern}.TextField11[${posFieldIndex}]`;
//       break;

//     case 'positions.noPositionsHeld':
//       const noPosFieldIndex = entryIndex === 0 ? '6' : '22';
//       exactFieldName = `form1[0].${subsectionPattern}.#field[${noPosFieldIndex}]`;
//       break;

//     case 'contributions.description':
//       const contribFieldIndex = entryIndex === 0 ? '2' : '9';
//       exactFieldName = `form1[0].${subsectionPattern}.TextField11[${contribFieldIndex}]`;
//       break;

//     case 'contributions.noContributionsMade':
//       const noContribFieldIndex = entryIndex === 0 ? '7' : '23';
//       exactFieldName = `form1[0].${subsectionPattern}.#field[${noContribFieldIndex}]`;
//       break;

//     case 'involvementDescription':
//       const involvementFieldIndex = entryIndex === 0 ? '3' : '10';
//       exactFieldName = `form1[0].${subsectionPattern}.TextField11[${involvementFieldIndex}]`;
//       break;

//     case 'activityDescription':
//       // Activity description fields for terrorism activities (29.2) and overthrow activities (29.6)
//       let activityFieldIndex = '0';
//       if (subsectionPattern.includes('Section29_2')) {
//         activityFieldIndex = entryIndex === 0 ? '0' : '3';
//       } else if (subsectionPattern.includes('Section29_5')) {
//         activityFieldIndex = entryIndex === 0 ? '0' : '3';
//       }
//       exactFieldName = `form1[0].${subsectionPattern}.TextField11[${activityFieldIndex}]`;
//       break;

//     case 'advocacyReason':
//       // Advocacy reason fields for terrorism advocacy (29.3) - shares Section29_2[0] with 29.2
//       const advocacyFieldIndex = entryIndex === 0 ? '1' : '4';
//       exactFieldName = `form1[0].${subsectionPattern}.TextField11[${advocacyFieldIndex}]`;
//       break;

//     case 'explanation':
//       // Explanation fields for terrorism associations (29.7)
//       const explanationFieldIndex = entryIndex === 0 ? '1' : '2';
//       exactFieldName = `form1[0].${subsectionPattern}.TextField11[${explanationFieldIndex}]`;
//       break;

//     case 'dateRange.present':
//       // Present checkbox fields - different indices per subsection
//       let presentFieldIndex = '13';
//       if (subsectionPattern.includes('Section29_2')) {
//         presentFieldIndex = entryIndex === 0 ? '21' : '11';
//       } else if (subsectionPattern.includes('Section29_5')) {
//         presentFieldIndex = entryIndex === 0 ? '5' : '11';
//       }
//       exactFieldName = `form1[0].${subsectionPattern}.#field[${presentFieldIndex}]`;
//       break;

//     case 'dateRange.from.estimated':
//       // From date estimate checkboxes
//       let fromEstFieldIndex = '15';
//       if (subsectionPattern.includes('Section29_2')) {
//         fromEstFieldIndex = entryIndex === 0 ? '17' : '23';
//       } else if (subsectionPattern.includes('Section29_5')) {
//         fromEstFieldIndex = entryIndex === 0 ? '7' : '13';
//       }
//       exactFieldName = `form1[0].${subsectionPattern}.#field[${fromEstFieldIndex}]`;
//       break;

//     case 'dateRange.to.estimated':
//       // To date estimate checkboxes
//       let toEstFieldIndex = '17';
//       if (subsectionPattern.includes('Section29_2')) {
//         toEstFieldIndex = entryIndex === 0 ? '19' : '25';
//       } else if (subsectionPattern.includes('Section29_5')) {
//         toEstFieldIndex = entryIndex === 0 ? '9' : '15';
//       }
//       exactFieldName = `form1[0].${subsectionPattern}.#field[${toEstFieldIndex}]`;
//       break;

//     default:
//       console.warn(`Unknown field type: ${fieldType}`);
//       return undefined;
//   }

//   // Look up the field directly by exact name
//   console.log(`🔍 Looking for exact field name: "${exactFieldName}"`);
//   console.log(`🗂️ Field map has ${fieldNameToDataMap.size} entries`);

//   const field = fieldNameToDataMap.get(exactFieldName);

//   if (field) {
//     console.log(`✅ Found PDF field for ${fieldType} in ${subsectionPattern}: ${field.name}`);
//     return field;
//   } else {
//     console.warn(`⚠️ No PDF field found for ${fieldType} in ${subsectionPattern} with exact name: ${exactFieldName}`);

//     // Debug: Show similar field names
//     const similarFields = Array.from(fieldNameToDataMap.keys()).filter(name =>
//       name.includes(subsectionPattern) || name.includes(fieldType)
//     ).slice(0, 5);
//     console.warn(`🔍 Similar fields found:`, similarFields);

//     return undefined;
//   }
// }

// // Export the raw data for advanced usage
// export { section29Fields, fieldNameToDataMap, fieldIdToDataMap };

// // // Log initialization info
// // console.log(`🔧 Section 29 Field Mapping initialized with ${section29Fields.length} fields`);
// // console.log(`🗂️ Field name mapping: ${fieldNameToDataMap.size} entries`);
// // console.log(`🆔 Field ID mapping: ${fieldIdToDataMap.size} entries`);

// // // Debug: Show first few field names to verify data is loaded correctly
// // console.log(`📋 First 5 field names:`, Array.from(fieldNameToDataMap.keys()).slice(0, 5));

// // // Debug: Check if specific expected fields exist
// // const expectedFields = [
// //   'form1[0].Section29[0].RadioButtonList[0]',
// //   'form1[0].Section29[0].TextField11[1]',
// //   'form1[0].Section29[0].#area[1].TextField11[4]'
// // ];

// // expectedFields.forEach(fieldName => {
// //   const exists = fieldNameToDataMap.has(fieldName);
// //   console.log(`🔍 Field "${fieldName}" exists: ${exists}`);
// //   if (exists) {
// //     const field = fieldNameToDataMap.get(fieldName);
// //     console.log(`   📄 Field details: ID=${field?.id}, Type=${field?.type}`);
// //   }
// // });
