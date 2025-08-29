/**
 * Section 15 Field Mapping - Maps logical field paths to actual PDF field names
 *
 * This module provides mapping between the logical field paths used in the Section 15
 * component and the actual complex field names found in the sections-references JSON.
 */

import section15Data from '../../../../api/interfaces/sections-references/section-15.json';

// Type definitions for Section 15 field data
interface Section15Field {
  id: string;
  name: string;
  value: string;
  page: number;
  label: string;
  type: string;
  maxLength?: number;
  options?: string[];
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  section: number;
  confidence: number;
  wasMovedByHealing: boolean;
  isExplicitlyDetected: boolean;
  reason?: string;
  uniqueId: string;
}

interface Section15JsonData {
  metadata: any;
  fields: Section15Field[];
  fieldsBySubsection: Record<string, Section15Field[]>;
  fieldsByEntry: Record<string, Section15Field[]>;
  statistics: any;
}

// Load the actual field data
const section15Fields: Section15Field[] = (section15Data as Section15JsonData).fields;

// Create a mapping from field names to field data
const fieldNameToDataMap = new Map<string, Section15Field>();
section15Fields.forEach(field => {
  fieldNameToDataMap.set(field.name, field);
});

// Create a mapping from field IDs to field data
const fieldIdToDataMap = new Map<string, Section15Field>();
section15Fields.forEach(field => {
  // Extract numeric ID from "17088 0 R" format
  const numericId = field.id.replace(' 0 R', '');
  fieldIdToDataMap.set(numericId, field);
});

/**
 * Section 15 Field Mappings - Maps logical field paths to actual PDF field names
 * 
 * Structure:
 * - Section 15.1: Military Service (Section14_1 fields)
 * - Section 15.2: Disciplinary Procedures (Section15_2 fields)  
 * - Section 15.3: Foreign Military Service (Section15_3 fields)
 */
export const SECTION15_FIELD_MAPPINGS = {
  // Main military service question
  'section15.militaryService.hasServed.value': 'form1[0].Section14_1[0].#area[4].RadioButtonList[1]',

  // Military Service Entry 1 (Section14_1 fields)
  'section15.militaryService.0.branch.value': 'form1[0].Section14_1[0].#area[5].#area[6].RadioButtonList[2]',
  'section15.militaryService.0.serviceState.value': 'form1[0].Section14_1[0].School6_State[0]', // State for National Guard
  'section15.militaryService.0.serviceStatus.value': 'form1[0].Section14_1[0].#area[7].RadioButtonList[3]', // Officer/Enlisted/Other
  'section15.militaryService.0.fromDate.value': 'form1[0].Section14_1[0].#area[8].From_Datefield_Name_2[0]',
  'section15.militaryService.0.fromDateEstimated.value': 'form1[0].Section14_1[0].#area[8].#field[7]',
  'section15.militaryService.0.toDate.value': 'form1[0].Section14_1[0].#area[8].From_Datefield_Name_2[1]',
  'section15.militaryService.0.toDateEstimated.value': 'form1[0].Section14_1[0].#area[8].#field[10]',
  'section15.militaryService.0.isPresent.value': 'form1[0].Section14_1[0].#area[8].#field[9]',
  'section15.militaryService.0.serviceNumber.value': 'form1[0].Section14_1[0].TextField11[3]',
  'section15.militaryService.0.dischargeType.value': 'form1[0].Section14_1[0].#area[9].RadioButtonList[4]',
  'section15.militaryService.0.typeOfDischarge.value': 'form1[0].Section14_1[0].#area[10].RadioButtonList[5]',
  'section15.militaryService.0.dischargeDate.value': 'form1[0].Section14_1[0].From_Datefield_Name_2[2]',
  'section15.militaryService.0.dischargeDateEstimated.value': 'form1[0].Section14_1[0].#field[13]',
  'section15.militaryService.0.otherDischargeType.value': 'form1[0].Section14_1[0].TextField11[4]',
  'section15.militaryService.0.dischargeReason.value': 'form1[0].Section14_1[0].TextField11[5]',
  'section15.militaryService.0.currentStatus.activeDuty.value': 'form1[0].Section14_1[0].#area[19].#field[27]',
  'section15.militaryService.0.currentStatus.activeReserve.value': 'form1[0].Section14_1[0].#area[19].#field[28]',
  'section15.militaryService.0.currentStatus.inactiveReserve.value': 'form1[0].Section14_1[0].#area[19].#field[29]',
  
  // Military Service Entry 2 (Section14_1 fields with different indices)
  'section15.militaryService.1.branch.value': 'form1[0].Section14_1[0].#area[13].#area[14].RadioButtonList[8]',
  'section15.militaryService.1.serviceState.value': 'form1[0].Section14_1[0].School6_State[1]', // State for National Guard
  'section15.militaryService.1.serviceStatus.value': 'form1[0].Section14_1[0].#area[15].RadioButtonList[9]', // Officer/Enlisted/Other
  'section15.militaryService.1.fromDate.value': 'form1[0].Section14_1[0].#area[16].From_Datefield_Name_2[3]',
  'section15.militaryService.1.fromDateEstimated.value': 'form1[0].Section14_1[0].#area[16].#field[18]',
  'section15.militaryService.1.toDate.value': 'form1[0].Section14_1[0].#area[16].From_Datefield_Name_2[4]',
  'section15.militaryService.1.toDateEstimated.value': 'form1[0].Section14_1[0].#area[16].#field[21]',
  'section15.militaryService.1.isPresent.value': 'form1[0].Section14_1[0].#area[16].#field[20]',
  'section15.militaryService.1.serviceNumber.value': 'form1[0].Section14_1[0].TextField11[6]',
  'section15.militaryService.1.dischargeType.value': 'form1[0].Section14_1[0].#area[18].RadioButtonList[11]',
  'section15.militaryService.1.dischargeDate.value': 'form1[0].Section14_1[0].From_Datefield_Name_2[5]',
  'section15.militaryService.1.dischargeDateEstimated.value': 'form1[0].Section14_1[0].#field[24]',
  'section15.militaryService.1.otherDischargeType.value': 'form1[0].Section14_1[0].TextField11[7]',
  'section15.militaryService.1.dischargeReason.value': 'form1[0].Section14_1[0].TextField11[8]',

  // Additional Section14_1 fields that were missing
  'section15.militaryService.0.additionalServiceInfo.value': 'form1[0].Section14_1[0].#area[11].RadioButtonList[6]',
  'section15.militaryService.0.secondaryBranch.value': 'form1[0].Section14_1[0].#area[12].RadioButtonList[7]',

  // Disciplinary Procedures Entry 1 (Section15_2 fields)
  'section15.disciplinaryProcedures.hasDisciplinaryAction.value': 'form1[0].Section15_2[0].#area[0].RadioButtonList[0]',
  'section15.disciplinaryProcedures.0.procedureDate.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[0]',
  'section15.disciplinaryProcedures.0.procedureDateEstimated.value': 'form1[0].Section15_2[0].#field[2]',
  'section15.disciplinaryProcedures.0.ucmjOffenseDescription.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[1]',
  'section15.disciplinaryProcedures.0.disciplinaryProcedureName.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[2]',
  'section15.disciplinaryProcedures.0.militaryCourtDescription.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[3]',
  'section15.disciplinaryProcedures.0.finalOutcome.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[4]',

  // Disciplinary Procedures Entry 2 (Section15_2 fields)
  'section15.disciplinaryProcedures.1.procedureDate.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[5]',
  'section15.disciplinaryProcedures.1.procedureDateEstimated.value': 'form1[0].Section15_2[0].#field[8]',
  'section15.disciplinaryProcedures.1.ucmjOffenseDescription.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[6]',
  'section15.disciplinaryProcedures.1.disciplinaryProcedureName.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[7]',
  'section15.disciplinaryProcedures.1.militaryCourtDescription.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[8]',
  'section15.disciplinaryProcedures.1.finalOutcome.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[9]',

  // Foreign Military Service Entry 1 (Section15_3 fields)
  'section15.foreignMilitaryService.hasForeignService.value': 'form1[0].Section15_3[0].RadioButtonList[0]',
  'section15.foreignMilitaryService.0.additionalRadioOption.value': 'form1[0].Section15_3[0].RadioButtonList[1]',
  'section15.foreignMilitaryService.0.fromDate.value': 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[0]',
  'section15.foreignMilitaryService.0.fromDateEstimated.value': 'form1[0].Section15_3[0].#area[0].#field[3]',
  'section15.foreignMilitaryService.0.toDate.value': 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[1]',
  'section15.foreignMilitaryService.0.toDateEstimated.value': 'form1[0].Section15_3[0].#area[0].#field[5]',
  'section15.foreignMilitaryService.0.isPresent.value': 'form1[0].Section15_3[0].#area[0].#field[6]',
  'section15.foreignMilitaryService.0.organizationName.value': 'form1[0].Section15_3[0].TextField11[0]',
  'section15.foreignMilitaryService.0.country.value': 'form1[0].Section15_3[0].DropDownList29[0]',
  'section15.foreignMilitaryService.0.highestRank.value': 'form1[0].Section15_3[0].TextField11[1]',
  'section15.foreignMilitaryService.0.divisionDepartment.value': 'form1[0].Section15_3[0].TextField11[2]',
  'section15.foreignMilitaryService.0.reasonForLeaving.value': 'form1[0].Section15_3[0].TextField12[0]',
  'section15.foreignMilitaryService.0.circumstancesDescription.value': 'form1[0].Section15_3[0].TextField13[0]',

  // Contact Person 1 for Foreign Military Service Entry 1 - CORRECTED FIELD MAPPINGS
  'section15.foreignMilitaryService.0.contactPerson1.firstName.value': 'form1[0].Section15_3[0].#area[5].TextField11[16]',
  'section15.foreignMilitaryService.0.contactPerson1.middleName.value': 'form1[0].Section15_3[0].#area[5].TextField11[15]',
  'section15.foreignMilitaryService.0.contactPerson1.lastName.value': 'form1[0].Section15_3[0].#area[5].TextField11[14]',
  'section15.foreignMilitaryService.0.contactPerson1.suffix.value': 'form1[0].Section15_3[0].#area[5].suffix[1]',
  'section15.foreignMilitaryService.0.contactPerson1.street.value': 'form1[0].Section15_3[0].#area[5].#area[6].TextField11[11]',
  'section15.foreignMilitaryService.0.contactPerson1.city.value': 'form1[0].Section15_3[0].#area[5].#area[6].TextField11[12]',
  'section15.foreignMilitaryService.0.contactPerson1.state.value': 'form1[0].Section15_3[0].#area[5].#area[6].School6_State[1]',
  'section15.foreignMilitaryService.0.contactPerson1.country.value': 'form1[0].Section15_3[0].#area[5].#area[6].DropDownList7[0]',
  'section15.foreignMilitaryService.0.contactPerson1.zipCode.value': 'form1[0].Section15_3[0].#area[5].#area[6].TextField11[13]',
  'section15.foreignMilitaryService.0.contactPerson1.officialTitle.value': 'form1[0].Section15_3[0].#area[5].TextField11[17]',
  'section15.foreignMilitaryService.0.contactPerson1.frequencyOfContact.value': 'form1[0].Section15_3[0].#area[5].TextField11[18]',
  'section15.foreignMilitaryService.0.contactPerson1.associationFromDate.value': 'form1[0].Section15_3[0].#area[5].#area[7].From_Datefield_Name_2[4]',
  'section15.foreignMilitaryService.0.contactPerson1.associationFromDateEstimated.value': 'form1[0].Section15_3[0].#area[5].#area[7].#field[39]',
  'section15.foreignMilitaryService.0.contactPerson1.associationToDate.value': 'form1[0].Section15_3[0].#area[5].#area[7].From_Datefield_Name_2[5]',
  'section15.foreignMilitaryService.0.contactPerson1.associationToDateEstimated.value': 'form1[0].Section15_3[0].#area[5].#area[7].#field[41]',
  'section15.foreignMilitaryService.0.contactPerson1.associationIsPresent.value': 'form1[0].Section15_3[0].#area[5].#area[7].#field[42]',

  // Contact Person 2 for Foreign Military Service Entry 1 - CORRECTED FIELD MAPPINGS
  'section15.foreignMilitaryService.0.contactPerson2.firstName.value': 'form1[0].Section15_3[0].#area[2].TextField11[8]',
  'section15.foreignMilitaryService.0.contactPerson2.middleName.value': 'form1[0].Section15_3[0].#area[2].TextField11[6]',
  'section15.foreignMilitaryService.0.contactPerson2.lastName.value': 'form1[0].Section15_3[0].#area[2].TextField11[7]',
  'section15.foreignMilitaryService.0.contactPerson2.suffix.value': 'form1[0].Section15_3[0].#area[2].suffix[0]',
  'section15.foreignMilitaryService.0.contactPerson2.street.value': 'form1[0].Section15_3[0].#area[2].#area[3].TextField11[3]',
  'section15.foreignMilitaryService.0.contactPerson2.city.value': 'form1[0].Section15_3[0].#area[2].#area[3].TextField11[4]',
  'section15.foreignMilitaryService.0.contactPerson2.state.value': 'form1[0].Section15_3[0].#area[2].#area[3].School6_State[0]',
  'section15.foreignMilitaryService.0.contactPerson2.country.value': 'form1[0].Section15_3[0].#area[2].#area[3].DropDownList6[0]',
  'section15.foreignMilitaryService.0.contactPerson2.zipCode.value': 'form1[0].Section15_3[0].#area[2].#area[3].TextField11[5]',
  'section15.foreignMilitaryService.0.contactPerson2.associationFromDate.value': 'form1[0].Section15_3[0].#area[2].From_Datefield_Name_2[2]',
  'section15.foreignMilitaryService.0.contactPerson2.associationFromDateEstimated.value': 'form1[0].Section15_3[0].#area[2].#field[23]',
  'section15.foreignMilitaryService.0.contactPerson2.associationToDate.value': 'form1[0].Section15_3[0].#area[2].From_Datefield_Name_2[3]',
  'section15.foreignMilitaryService.0.contactPerson2.associationToDateEstimated.value': 'form1[0].Section15_3[0].#area[2].#field[25]',
  'section15.foreignMilitaryService.0.contactPerson2.associationIsPresent.value': 'form1[0].Section15_3[0].#area[2].#field[26]',

  // Additional Foreign Military Service fields
  'section15.foreignMilitaryService.0.additionalInfo.hasAdditionalContact.value': 'form1[0].Section15_3[0].RadioButtonList[2]',
  'section15.foreignMilitaryService.0.additionalInfo.frequencyOfContact.value': 'form1[0].Section15_3[0].TextField11[9]',
  'section15.foreignMilitaryService.0.additionalInfo.officialTitle.value': 'form1[0].Section15_3[0].TextField11[10]',
  'section15.foreignMilitaryService.0.additionalInfo.specify.value': 'form1[0].Section15_3[0].TextField11[19]',


} as const;

/**
 * Map a logical field path to the actual PDF field name
 */
export function mapLogicalFieldToPdfField(logicalPath: string): string {
  return SECTION15_FIELD_MAPPINGS[logicalPath as keyof typeof SECTION15_FIELD_MAPPINGS] || logicalPath;
}

/**
 * Get field metadata for a logical field path
 */
export function getFieldMetadata(logicalPath: string): Section15Field | undefined {
  const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
  return getPdfFieldByName(pdfFieldName);
}

/**
 * Get PDF field by name
 */
export function getPdfFieldByName(fieldName: string): Section15Field | undefined {
  return fieldNameToDataMap.get(fieldName);
}

/**
 * Get PDF field by ID
 */
export function getPdfFieldById(fieldId: string): Section15Field | undefined {
  return fieldIdToDataMap.get(fieldId);
}

/**
 * Get numeric field ID from field name (for ID-based mapping)
 */
export function getNumericFieldId(fieldName: string): string | null {
  const field = getPdfFieldByName(fieldName);
  if (field) {
    return field.id.replace(' 0 R', '');
  }
  return null;
}

/**
 * Validate that a field exists in the sections-references data
 */
export function validateFieldExists(fieldName: string): boolean {
  return fieldNameToDataMap.has(fieldName);
}

/**
 * Get all available field names for debugging
 */
export function getAllFieldNames(): string[] {
  return Array.from(fieldNameToDataMap.keys());
}

/**
 * Find similar field names for debugging
 */
export function findSimilarFieldNames(searchTerm: string, limit: number = 5): string[] {
  const allFields = getAllFieldNames();
  return allFields
    .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, limit);
}

/**
 * Analyze field coverage for Section 15
 */
export function analyzeSection15FieldCoverage(): {
  totalFields: number;
  mappedFields: number;
  coverage: number;
  missingFields: string[];
  fieldsBySubsection: Record<string, number>;
} {
  const totalFields = section15Fields.length;
  const mappedFieldNames = new Set(Object.values(SECTION15_FIELD_MAPPINGS) as string[]);
  const allFieldNames = section15Fields.map(field => field.name);
  const missingFields = allFieldNames.filter(fieldName => !mappedFieldNames.has(fieldName));

  // Count fields by subsection
  const fieldsBySubsection: Record<string, number> = {};
  section15Fields.forEach(field => {
    if (field.name.includes('Section14_1')) {
      fieldsBySubsection['Section14_1'] = (fieldsBySubsection['Section14_1'] || 0) + 1;
    } else if (field.name.includes('Section15_2')) {
      fieldsBySubsection['Section15_2'] = (fieldsBySubsection['Section15_2'] || 0) + 1;
    } else if (field.name.includes('Section15_3')) {
      fieldsBySubsection['Section15_3'] = (fieldsBySubsection['Section15_3'] || 0) + 1;
    }
  });

  return {
    totalFields,
    mappedFields: mappedFieldNames.size,
    coverage: (mappedFieldNames.size / totalFields) * 100,
    missingFields,
    fieldsBySubsection
  };
}
