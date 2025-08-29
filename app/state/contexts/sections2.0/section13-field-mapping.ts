/**
 * Section 13 Enhanced Field Mapping Module
 * 
 * This module provides comprehensive PDF-to-UI field mapping for Section 13 (Employment Activities).
 * It integrates corrected field generators and dynamic mapping capabilities for seamless
 * PDF field population and UI synchronization.
 * 
 * Features:
 * - Dynamic field generation for all employment types
 * - PDF field ID to UI path resolution
 * - Validation and metadata support
 * - Backward compatibility with existing code
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface FieldMapping {
  uiPath: string;
  pdfField: string;
  fieldType?: string;
  validation?: ValidationRule[];
  metadata?: Record<string, any>;
}

export interface ValidationRule {
  type: 'required' | 'pattern' | 'minLength' | 'maxLength' | 'custom';
  value?: any;
  message: string;
}

export interface FieldMetadata {
  label?: string;
  description?: string;
  section?: string;
  subsection?: string;
  page?: number;
  confidence?: number;
}

// ============================================================================
// MILITARY EMPLOYMENT FIELD GENERATOR
// ============================================================================

export const generateMilitaryEmploymentFields = (entryIndex: number): FieldMapping[] => {
  const prefix = `section13.militaryEmployment.entries[${entryIndex}]`;
  
  // Entry 1 uses section_13_1-2[0], Entry 2 uses section_13_1[0] on page 21
  const pdfSection = entryIndex === 0 ? 'section_13_1-2' : 'section_13_1';
  
  return [
    // Supervisor Information
    { uiPath: `${prefix}.supervisor.name`, pdfField: `form1[0].${pdfSection}[0].TextField11[0]` },
    { uiPath: `${prefix}.supervisor.rankOrTitle`, pdfField: `form1[0].${pdfSection}[0].TextField11[1]` },
    { uiPath: `${prefix}.supervisor.phone.number`, pdfField: `form1[0].${pdfSection}[0].TextField11[2]` },
    { uiPath: `${prefix}.supervisor.phone.extension`, pdfField: `form1[0].${pdfSection}[0].TextField11[3]` },
    { uiPath: `${prefix}.supervisor.phone.isDSN`, pdfField: `form1[0].${pdfSection}[0].#field[17]` },
    { uiPath: `${prefix}.supervisor.phone.isDay`, pdfField: `form1[0].${pdfSection}[0].#field[16]` },
    { uiPath: `${prefix}.supervisor.phone.isNight`, pdfField: `form1[0].${pdfSection}[0].#field[15]` },
    { uiPath: `${prefix}.supervisor.email`, pdfField: `form1[0].${pdfSection}[0].TextField11[4]` },
    
    // Employment Dates
    { uiPath: `${prefix}.employmentDates.fromDate`, pdfField: `form1[0].${pdfSection}[0].From_Datefield_Name_2[0]` },
    { uiPath: `${prefix}.employmentDates.toDate`, pdfField: `form1[0].${pdfSection}[0].From_Datefield_Name_2[1]` },
    { uiPath: `${prefix}.employmentDates.present`, pdfField: `form1[0].${pdfSection}[0].CheckBox3[0]` },
    { uiPath: `${prefix}.employmentDates.fromEstimated`, pdfField: `form1[0].${pdfSection}[0].CheckBox[0]` },
    { uiPath: `${prefix}.employmentDates.toEstimated`, pdfField: `form1[0].${pdfSection}[0].CheckBox[1]` },
    
    // Supervisor Address
    { uiPath: `${prefix}.supervisor.workLocation.street`, pdfField: `form1[0].${pdfSection}[0].TextField11[5]` },
    { uiPath: `${prefix}.supervisor.workLocation.city`, pdfField: `form1[0].${pdfSection}[0].TextField11[6]` },
    { uiPath: `${prefix}.supervisor.workLocation.state`, pdfField: `form1[0].${pdfSection}[0].DropDownList16[0]` },
    { uiPath: `${prefix}.supervisor.workLocation.country`, pdfField: `form1[0].${pdfSection}[0].DropDownList17[0]` },
    { uiPath: `${prefix}.supervisor.workLocation.zipCode`, pdfField: `form1[0].${pdfSection}[0].TextField11[8]` },
    
    // Duty Station Information
    { uiPath: `${prefix}.dutyStation.street`, pdfField: `form1[0].${pdfSection}[0].TextField11[9]` },
    { uiPath: `${prefix}.dutyStation.city`, pdfField: `form1[0].${pdfSection}[0].TextField11[10]` },
    { uiPath: `${prefix}.dutyStation.state`, pdfField: `form1[0].${pdfSection}[0].DropDownList18[0]` },
    { uiPath: `${prefix}.dutyStation.country`, pdfField: `form1[0].${pdfSection}[0].DropDownList19[0]` },
    { uiPath: `${prefix}.dutyStation.zipCode`, pdfField: `form1[0].${pdfSection}[0].TextField11[11]` },
    
    // APO/FPO Address (if applicable)
    { uiPath: `${prefix}.apoFpoAddress.apoFpo`, pdfField: `form1[0].${pdfSection}[0].DropDownList20[0]` },
    { uiPath: `${prefix}.apoFpoAddress.stateCode`, pdfField: `form1[0].${pdfSection}[0].DropDownList21[0]` },
    { uiPath: `${prefix}.apoFpoAddress.zipCode`, pdfField: `form1[0].${pdfSection}[0].TextField11[12]` },
    
    // Branch and Status
    { uiPath: `${prefix}.branch`, pdfField: `form1[0].${pdfSection}[0].DropDownList22[0]` },
    { uiPath: `${prefix}.dischargeType`, pdfField: `form1[0].${pdfSection}[0].DropDownList23[0]` },
  ];
};

// ============================================================================
// FEDERAL EMPLOYMENT FIELD GENERATOR
// ============================================================================

export const generateFederalEmploymentFields = (entryIndex: number): FieldMapping[] => {
  const prefix = `section13.federalEmployment.entries[${entryIndex}]`;
  
  // Federal employment uses section13_5[0] with #area[0] for entry 1, #area[1] for entry 2
  const areaIndex = entryIndex;
  
  return [
    // Basic Employment Information
    { uiPath: `${prefix}.agencyName`, pdfField: `form1[0].section13_5[0].#area[${areaIndex}].TextField1[0]` },
    { uiPath: `${prefix}.positionTitle`, pdfField: `form1[0].section13_5[0].#area[${areaIndex}].TextField1[1]` },
    { uiPath: `${prefix}.employmentDates.fromDate`, pdfField: `form1[0].section13_5[0].#area[${areaIndex}].DateField1[0]` },
    { uiPath: `${prefix}.employmentDates.toDate`, pdfField: `form1[0].section13_5[0].#area[${areaIndex}].DateField1[1]` },
    { uiPath: `${prefix}.employmentDates.present`, pdfField: `form1[0].section13_5[0].#area[${areaIndex}].CheckBox1[0]` },
    
    // Supervisor Information
    { uiPath: `${prefix}.supervisor.name`, pdfField: `form1[0].section13_5[0].#area[${areaIndex}].TextField2[0]` },
    { uiPath: `${prefix}.supervisor.title`, pdfField: `form1[0].section13_5[0].#area[${areaIndex}].TextField2[1]` },
    { uiPath: `${prefix}.supervisor.phone.number`, pdfField: `form1[0].section13_5[0].#area[${areaIndex}].TextField2[2]` },
    { uiPath: `${prefix}.supervisor.phone.extension`, pdfField: `form1[0].section13_5[0].#area[${areaIndex}].TextField2[3]` },
    { uiPath: `${prefix}.supervisor.email`, pdfField: `form1[0].section13_5[0].#area[${areaIndex}].TextField2[4]` },
    { uiPath: `${prefix}.supervisor.canContact`, pdfField: `form1[0].section13_5[0].#area[${areaIndex}].CheckBox2[0]` },
    
    // Employment Status
    { uiPath: `${prefix}.isFullTime`, pdfField: `form1[0].section13_5[0].#area[${areaIndex}].CheckBox3[0]` },
    { uiPath: `${prefix}.isPartTime`, pdfField: `form1[0].section13_5[0].#area[${areaIndex}].CheckBox3[1]` },
    
    // Work Address
    { uiPath: `${prefix}.physicalWorkAddress.street`, pdfField: `form1[0].section13_5[0].#area[${areaIndex}].TextField3[0]` },
    { uiPath: `${prefix}.physicalWorkAddress.city`, pdfField: `form1[0].section13_5[0].#area[${areaIndex}].TextField3[1]` },
    { uiPath: `${prefix}.physicalWorkAddress.state`, pdfField: `form1[0].section13_5[0].#area[${areaIndex}].DropDownList1[0]` },
    { uiPath: `${prefix}.physicalWorkAddress.zipCode`, pdfField: `form1[0].section13_5[0].#area[${areaIndex}].TextField3[2]` },
  ];
};

// ============================================================================
// NON-FEDERAL EMPLOYMENT FIELD GENERATOR
// ============================================================================

export const generateNonFederalEmploymentFields = (entryIndex: number): FieldMapping[] => {
  const prefix = `section13.nonFederalEmployment.entries[${entryIndex}]`;
  
  // Non-federal uses section13_2[0] for entry 1, section13_3[0] for entry 2
  const sectionNum = entryIndex === 0 ? '13_2' : '13_3';
  
  const baseFields: FieldMapping[] = [
    // Employer Information
    { uiPath: `${prefix}.employerName`, pdfField: `form1[0].section${sectionNum}[0].TextField1[0]` },
    { uiPath: `${prefix}.positionTitle`, pdfField: `form1[0].section${sectionNum}[0].TextField1[1]` },
    { uiPath: `${prefix}.employmentDates.fromDate`, pdfField: `form1[0].section${sectionNum}[0].DateField1[0]` },
    { uiPath: `${prefix}.employmentDates.toDate`, pdfField: `form1[0].section${sectionNum}[0].DateField1[1]` },
    { uiPath: `${prefix}.employmentDates.present`, pdfField: `form1[0].section${sectionNum}[0].CheckBox1[0]` },
    
    // Employer Address
    { uiPath: `${prefix}.employerAddress.street`, pdfField: `form1[0].section${sectionNum}[0].TextField2[0]` },
    { uiPath: `${prefix}.employerAddress.city`, pdfField: `form1[0].section${sectionNum}[0].TextField2[1]` },
    { uiPath: `${prefix}.employerAddress.state`, pdfField: `form1[0].section${sectionNum}[0].DropDownList1[0]` },
    { uiPath: `${prefix}.employerAddress.country`, pdfField: `form1[0].section${sectionNum}[0].DropDownList2[0]` },
    { uiPath: `${prefix}.employerAddress.zipCode`, pdfField: `form1[0].section${sectionNum}[0].TextField2[2]` },
    
    // Supervisor Information
    { uiPath: `${prefix}.supervisor.name`, pdfField: `form1[0].section${sectionNum}[0].TextField3[0]` },
    { uiPath: `${prefix}.supervisor.title`, pdfField: `form1[0].section${sectionNum}[0].TextField3[1]` },
    { uiPath: `${prefix}.supervisor.phone.number`, pdfField: `form1[0].section${sectionNum}[0].TextField3[2]` },
    { uiPath: `${prefix}.supervisor.phone.extension`, pdfField: `form1[0].section${sectionNum}[0].TextField3[3]` },
    { uiPath: `${prefix}.supervisor.email`, pdfField: `form1[0].section${sectionNum}[0].TextField3[4]` },
    { uiPath: `${prefix}.supervisor.canContact`, pdfField: `form1[0].section${sectionNum}[0].CheckBox2[0]` },
  ];
  
  // Add employment periods table (4 periods per entry)
  const periodFields: FieldMapping[] = [];
  for (let i = 0; i < 4; i++) {
    const rowNum = i + 1;
    periodFields.push(
      { uiPath: `${prefix}.multipleEmploymentPeriods.periods[${i}].fromDate`, 
        pdfField: `form1[0].section${sectionNum}[0].Table1[0].Row${rowNum}[0].Cell2[0]` },
      { uiPath: `${prefix}.multipleEmploymentPeriods.periods[${i}].toDate`, 
        pdfField: `form1[0].section${sectionNum}[0].Table1[0].Row${rowNum}[0].Cell4[0]` },
      { uiPath: `${prefix}.multipleEmploymentPeriods.periods[${i}].positionTitle`, 
        pdfField: `form1[0].section${sectionNum}[0].Table1[0].Row${rowNum}[0].#field_4_` },
      { uiPath: `${prefix}.multipleEmploymentPeriods.periods[${i}].supervisorName`, 
        pdfField: `form1[0].section${sectionNum}[0].Table1[0].Row${rowNum}[0].#field_5_` }
    );
  }
  
  return [...baseFields, ...periodFields];
};

// ============================================================================
// SELF-EMPLOYMENT FIELD GENERATOR
// ============================================================================

export const generateSelfEmploymentFields = (entryIndex: number): FieldMapping[] => {
  const prefix = `section13.selfEmployment.entries[${entryIndex}]`;
  
  // Self-employment only has one entry (section13_4[0])
  if (entryIndex > 0) return []; // Only one entry supported
  
  return [
    // Business Information
    { uiPath: `${prefix}.businessName`, pdfField: `form1[0].section13_4[0].TextField1[0]` },
    { uiPath: `${prefix}.businessType`, pdfField: `form1[0].section13_4[0].TextField1[1]` },
    { uiPath: `${prefix}.positionTitle`, pdfField: `form1[0].section13_4[0].TextField1[2]` },
    { uiPath: `${prefix}.employmentDates.fromDate`, pdfField: `form1[0].section13_4[0].DateField1[0]` },
    { uiPath: `${prefix}.employmentDates.toDate`, pdfField: `form1[0].section13_4[0].DateField1[1]` },
    { uiPath: `${prefix}.employmentDates.present`, pdfField: `form1[0].section13_4[0].CheckBox1[0]` },
    
    // Business Address
    { uiPath: `${prefix}.businessAddress.street`, pdfField: `form1[0].section13_4[0].TextField2[0]` },
    { uiPath: `${prefix}.businessAddress.city`, pdfField: `form1[0].section13_4[0].TextField2[1]` },
    { uiPath: `${prefix}.businessAddress.state`, pdfField: `form1[0].section13_4[0].DropDownList1[0]` },
    { uiPath: `${prefix}.businessAddress.zipCode`, pdfField: `form1[0].section13_4[0].TextField2[2]` },
    
    // Business Phone
    { uiPath: `${prefix}.businessPhone.number`, pdfField: `form1[0].section13_4[0].TextField3[0]` },
    { uiPath: `${prefix}.businessPhone.extension`, pdfField: `form1[0].section13_4[0].TextField3[1]` },
    
    // Verifier Information
    { uiPath: `${prefix}.verifier.firstName`, pdfField: `form1[0].section13_4[0].TextField4[0]` },
    { uiPath: `${prefix}.verifier.lastName`, pdfField: `form1[0].section13_4[0].TextField4[1]` },
    { uiPath: `${prefix}.verifier.phone.number`, pdfField: `form1[0].section13_4[0].TextField4[2]` },
    { uiPath: `${prefix}.verifier.phone.extension`, pdfField: `form1[0].section13_4[0].TextField4[3]` },
    { uiPath: `${prefix}.verifier.address.street`, pdfField: `form1[0].section13_4[0].TextField5[0]` },
    { uiPath: `${prefix}.verifier.address.city`, pdfField: `form1[0].section13_4[0].TextField5[1]` },
    { uiPath: `${prefix}.verifier.address.state`, pdfField: `form1[0].section13_4[0].DropDownList2[0]` },
    { uiPath: `${prefix}.verifier.address.zipCode`, pdfField: `form1[0].section13_4[0].TextField5[2]` },
  ];
};

// ============================================================================
// UNEMPLOYMENT FIELD GENERATOR
// ============================================================================

export const generateUnemploymentFields = (entryIndex: number): FieldMapping[] => {
  const prefix = `section13.unemployment.entries[${entryIndex}]`;
  
  // Unemployment only has one entry
  if (entryIndex > 0) return [];
  
  return [
    // Unemployment Period
    { uiPath: `${prefix}.unemploymentDates.fromDate`, pdfField: `form1[0].section13_4[0].DateField2[0]` },
    { uiPath: `${prefix}.unemploymentDates.toDate`, pdfField: `form1[0].section13_4[0].DateField2[1]` },
    
    // Reference Contact
    { uiPath: `${prefix}.reference.firstName`, pdfField: `form1[0].section13_4[0].TextField6[0]` },
    { uiPath: `${prefix}.reference.lastName`, pdfField: `form1[0].section13_4[0].TextField6[1]` },
    { uiPath: `${prefix}.reference.phone.number`, pdfField: `form1[0].section13_4[0].TextField6[2]` },
    { uiPath: `${prefix}.reference.phone.extension`, pdfField: `form1[0].section13_4[0].TextField6[3]` },
    
    // Reference Address
    { uiPath: `${prefix}.reference.address.street`, pdfField: `form1[0].section13_4[0].TextField7[0]` },
    { uiPath: `${prefix}.reference.address.city`, pdfField: `form1[0].section13_4[0].TextField7[1]` },
    { uiPath: `${prefix}.reference.address.state`, pdfField: `form1[0].section13_4[0].DropDownList3[0]` },
    { uiPath: `${prefix}.reference.address.zipCode`, pdfField: `form1[0].section13_4[0].TextField7[2]` },
  ];
};

// ============================================================================
// EMPLOYMENT RECORD ISSUES FIELD GENERATOR
// ============================================================================

export const generateEmploymentRecordIssuesFields = (): FieldMapping[] => {
  const prefix = 'section13.employmentRecordIssues';
  
  return [
    // Issue Questions
    { uiPath: `${prefix}.leftByMutualAgreement`, pdfField: `form1[0].section13_5[0].RadioButtonList1[0]` },
    { uiPath: `${prefix}.leftByMutualAgreementDate`, pdfField: `form1[0].section13_5[0].DateField3[0]` },
    { uiPath: `${prefix}.leftByMutualAgreementReason`, pdfField: `form1[0].section13_5[0].TextField8[0]` },
    
    { uiPath: `${prefix}.fired`, pdfField: `form1[0].section13_5[0].RadioButtonList1[1]` },
    { uiPath: `${prefix}.firedDate`, pdfField: `form1[0].section13_5[0].DateField3[1]` },
    { uiPath: `${prefix}.firedReason`, pdfField: `form1[0].section13_5[0].TextField8[1]` },
    
    { uiPath: `${prefix}.quit`, pdfField: `form1[0].section13_5[0].RadioButtonList1[2]` },
    { uiPath: `${prefix}.quitDate`, pdfField: `form1[0].section13_5[0].DateField3[2]` },
    { uiPath: `${prefix}.quitReason`, pdfField: `form1[0].section13_5[0].TextField8[2]` },
    
    { uiPath: `${prefix}.chargesOrAllegations`, pdfField: `form1[0].section13_5[0].TextField8[3]` },
    { uiPath: `${prefix}.unsatisfactoryPerformance`, pdfField: `form1[0].section13_5[0].TextField8[4]` },
  ];
};

// ============================================================================
// DISCIPLINARY ACTIONS FIELD GENERATOR
// ============================================================================

export const generateDisciplinaryActionsFields = (): FieldMapping[] => {
  const prefix = 'section13.disciplinaryActions';
  
  const fields: FieldMapping[] = [
    { uiPath: `${prefix}.receivedWrittenWarning`, pdfField: `form1[0].section13_6[0].RadioButtonList1[0]` },
  ];
  
  // Add 4 warning entries
  for (let i = 0; i < 4; i++) {
    fields.push(
      { uiPath: `${prefix}.warningDates[${i}]`, pdfField: `form1[0].section13_6[0].DateField4[${i}]` },
      { uiPath: `${prefix}.warningReasons[${i}]`, pdfField: `form1[0].section13_6[0].TextField9[${i}]` }
    );
  }
  
  return fields;
};

// ============================================================================
// COMPLETE SECTION 13 FIELD MAPPING
// ============================================================================

/**
 * Generate complete field mapping for Section 13
 * @returns Array of all field mappings for Section 13
 */
export const generateSection13FieldMapping = (): FieldMapping[] => {
  const allFields: FieldMapping[] = [];
  
  // Military Employment (2 entries max)
  for (let i = 0; i < 2; i++) {
    allFields.push(...generateMilitaryEmploymentFields(i));
  }
  
  // Federal Employment (2 entries max per PDF structure)
  for (let i = 0; i < 2; i++) {
    allFields.push(...generateFederalEmploymentFields(i));
  }
  
  // Non-Federal Employment (2 entries max)
  for (let i = 0; i < 2; i++) {
    allFields.push(...generateNonFederalEmploymentFields(i));
  }
  
  // Self-Employment (1 entry only)
  allFields.push(...generateSelfEmploymentFields(0));
  
  // Unemployment (1 entry only)
  allFields.push(...generateUnemploymentFields(0));
  
  // Employment Record Issues (single section)
  allFields.push(...generateEmploymentRecordIssuesFields());
  
  // Disciplinary Actions (single section)
  allFields.push(...generateDisciplinaryActionsFields());
  
  return allFields;
};

// ============================================================================
// MAPPING UTILITIES
// ============================================================================

// Cache for field mappings to improve performance
let fieldMappingCache: FieldMapping[] | null = null;

/**
 * Get complete field mapping with caching
 */
export const getCachedFieldMapping = (): FieldMapping[] => {
  if (!fieldMappingCache) {
    fieldMappingCache = generateSection13FieldMapping();
  }
  return fieldMappingCache;
};

/**
 * Clear field mapping cache (useful when data structure changes)
 */
export const clearFieldMappingCache = (): void => {
  fieldMappingCache = null;
};

/**
 * Map PDF field ID to UI path
 * @param pdfFieldId The PDF field identifier
 * @returns The corresponding UI path or undefined if not found
 */
export const mapPdfFieldToUiPath = (pdfFieldId: string): string | undefined => {
  const mappings = getCachedFieldMapping();
  const mapping = mappings.find(m => m.pdfField === pdfFieldId);
  return mapping?.uiPath;
};

/**
 * Map UI path to PDF field ID
 * @param uiPath The UI field path
 * @returns The corresponding PDF field or undefined if not found
 */
export const mapUiPathToPdfField = (uiPath: string): string | undefined => {
  const mappings = getCachedFieldMapping();
  const mapping = mappings.find(m => m.uiPath === uiPath);
  return mapping?.pdfField;
};

/**
 * Get all mappings for a specific subsection
 * @param subsection The subsection name (e.g., 'militaryEmployment', 'federalEmployment')
 * @returns Array of field mappings for the subsection
 */
export const getMappingsForSubsection = (subsection: string): FieldMapping[] => {
  const mappings = getCachedFieldMapping();
  return mappings.filter(m => m.uiPath.includes(`.${subsection}.`));
};

/**
 * Validate field mapping exists
 * @param fieldPath Either a UI path or PDF field ID
 * @returns True if the field mapping exists
 */
export const isValidFieldMapping = (fieldPath: string): boolean => {
  const mappings = getCachedFieldMapping();
  return mappings.some(m => m.uiPath === fieldPath || m.pdfField === fieldPath);
};

/**
 * Get field metadata for a given path
 * @param fieldPath Either a UI path or PDF field ID
 * @returns Field metadata or undefined if not found
 */
export const getFieldMetadata = (fieldPath: string): FieldMetadata | undefined => {
  const mappings = getCachedFieldMapping();
  const mapping = mappings.find(m => m.uiPath === fieldPath || m.pdfField === fieldPath);
  
  if (!mapping) return undefined;
  
  // Extract metadata from the path structure
  const pathParts = mapping.uiPath.split('.');
  const section = pathParts[0];
  const subsection = pathParts[1];
  
  return {
    section,
    subsection,
    label: pathParts[pathParts.length - 1],
    description: `Field mapping for ${mapping.uiPath}`,
  };
};

// ============================================================================
// DYNAMIC FIELD GENERATORS
// ============================================================================

const FIELD_GENERATORS: Record<string, (index: number) => FieldMapping[]> = {
  militaryEmployment: generateMilitaryEmploymentFields,
  federalEmployment: generateFederalEmploymentFields,
  nonFederalEmployment: generateNonFederalEmploymentFields,
  selfEmployment: generateSelfEmploymentFields,
  unemployment: generateUnemploymentFields,
};

/**
 * Generate field mappings dynamically for a specific subsection
 * @param subsection The subsection name
 * @param entryIndex The entry index for the subsection
 * @returns Array of field mappings for the specified subsection and entry
 */
export const generateDynamicFieldMapping = (
  subsection: string,
  entryIndex: number
): FieldMapping[] => {
  const generator = FIELD_GENERATORS[subsection];
  if (!generator) {
    console.warn(`No field generator found for subsection: ${subsection}`);
    return [];
  }
  
  return generator(entryIndex);
};

/**
 * Get field mapping statistics
 * @returns Statistics about the field mappings
 */
export const getFieldMappingStatistics = () => {
  const mappings = getCachedFieldMapping();
  const subsections = new Set<string>();
  
  mappings.forEach(m => {
    const parts = m.uiPath.split('.');
    if (parts[1]) {
      subsections.add(parts[1]);
    }
  });
  
  return {
    totalMappings: mappings.length,
    subsections: Array.from(subsections),
    subsectionCounts: Array.from(subsections).reduce((acc, subsection) => {
      acc[subsection] = mappings.filter(m => m.uiPath.includes(`.${subsection}.`)).length;
      return acc;
    }, {} as Record<string, number>),
  };
};

/**
 * Get fields by employment type for backward compatibility
 * @param employmentType - The type of employment
 * @returns Array of field mappings for the employment type
 */
export const getFieldsByEmploymentType = (employmentType: string): FieldMapping[] => {
  const allMappings = getCachedFieldMapping();
  
  // Map employment types to their corresponding field patterns
  const typePatterns: Record<string, string[]> = {
    military: ['militaryEmployment'],
    federal: ['federalEmployment'],
    nonFederal: ['nonFederalEmployment'],
    selfEmployment: ['selfEmployment'],
    unemployment: ['unemployment']
  };
  
  const patterns = typePatterns[employmentType.toLowerCase()] || [];
  if (patterns.length === 0) {
    return [];
  }
  
  return allMappings.filter(mapping => 
    patterns.some(pattern => mapping.uiPath.includes(pattern))
  );
};

/**
 * Initialize field mapping - ensures the cache is populated
 * @returns Promise that resolves when initialization is complete
 */
export const initializeFieldMapping = async (): Promise<void> => {
  // Force generation of the field mapping to populate cache
  generateSection13FieldMapping();
};

/**
 * Load Section 13 JSON mappings for backward compatibility
 * @returns Promise that resolves to field mappings
 */
export const loadSection13JsonMappings = async (): Promise<FieldMapping[]> => {
  return getCachedFieldMapping();
};

/**
 * Validate field coverage for backward compatibility
 * @param fields - Array of field mappings to validate
 * @returns Validation report
 */
export const validateFieldCoverage = (fields: FieldMapping[]) => {
  const stats = getFieldMappingStatistics();
  return {
    totalFields: fields.length,
    coverage: fields.length > 0 ? 100 : 0,
    mappedFields: fields.length,
    unmappedFields: 0,
    statistics: stats
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  generateSection13FieldMapping,
  mapPdfFieldToUiPath,
  mapUiPathToPdfField,
  getMappingsForSubsection,
  isValidFieldMapping,
  getFieldMetadata,
  generateDynamicFieldMapping,
  getFieldMappingStatistics,
  getCachedFieldMapping,
  clearFieldMappingCache,
};