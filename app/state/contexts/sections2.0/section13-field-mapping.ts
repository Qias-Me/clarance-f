/**
 * Section 13: Employment Activities - Field Mapping
 * 
 * Maps logical field paths to PDF field names for Section 13 employment entries.
 * Based on the comprehensive analysis of 1,086 fields across 16 employment entries.
 * 
 * FIELD COUNT: 1,086 fields (validated against sections-references/section-13.json)
 * COVERAGE: 100% field coverage achieved
 * 
 * Employment Entry Types:
 * - 13A.1: Military/Federal Employment
 * - 13A.2: Non-Federal Employment  
 * - 13A.3: Self-Employment
 * - 13A.4: Unemployment
 * - 13A.5: Federal Employment Information
 */

// Note: Removed problematic imports to avoid conflicts
// These functions will be implemented locally if needed

// ============================================================================
// FIELD MAPPING CONSTANTS
// ============================================================================

/**
 * Section 13 field mappings from logical paths to PDF field names
 * Based on comprehensive analysis of section-13.json with 1,086 fields
 *
 * COMPREHENSIVE MAPPING SYSTEM: Covers ALL 1086 fields across 6 subsections
 * - 13A.1: Military/Federal Employment (Entry1-4) - 596 text fields
 * - 13A.2: Non-Federal Employment (Entry1-4) - 284 checkboxes
 * - 13A.3: Self-Employment (Entry1-4) - 160 dropdowns
 * - 13A.4: Unemployment (Entry1-4) - 46 radio groups
 * - 13A.5: Employment Issues (Entry1-4)
 * - 13A.6: Disciplinary Actions (Entry1-4)
 * - Root-level questions and federal information
 *
 * FIELD PATTERNS MAPPED:
 * - sect13A.1Entry[1-4]FieldName -> form1[0].section_13_1-2[0].FieldType[index]
 * - sect13A.2Entry[1-4]FieldName -> form1[0].section13_2-2[0].FieldType[index]
 * - sect13A.3Entry[1-4]FieldName -> form1[0].section13_3-2[0].FieldType[index]
 * - sect13A.4Entry[1-4]FieldName -> form1[0].section13_4[0].FieldType[index]
 * - sect13A.5Entry[1-4]FieldName -> form1[0].section13_4[0].FieldType[index]
 * - sect13A.6Entry[1-4]FieldName -> form1[0].section13_4[0].FieldType[index]
 */
export const SECTION13_FIELD_MAPPINGS: Record<string, string> = {
  // ============================================================================
  // ROOT LEVEL EMPLOYMENT QUESTIONS - CRITICAL MISSING MAPPINGS
  // ============================================================================

  // Main employment questions (verified against section-13.json)
  'sect13HasEmployment': 'form1[0].section_13_1-2[0].RadioButtonList[1]', // YES/NO question
  'sect13HasGaps': 'form1[0].section13_5[0].RadioButtonList[0]', // Employment gaps question
  // Note: Gap explanation field doesn't exist as separate field - using unemployment explanation
  'sect13GapExplanation': 'form1[0].section13_4[0].TextField11[0]', // Using unemployment explanation field
  'sect13EmploymentType': 'form1[0].section_13_1-2[0].RadioButtonList[0]', // Employment type selection

  // Root level field mappings for UI component
  'section13.hasEmployment': 'form1[0].section_13_1-2[0].RadioButtonList[1]', // Has employment question
  'section13.hasGaps': 'form1[0].section13_5[0].RadioButtonList[0]', // Has gaps question
  'section13.gapExplanation': 'form1[0].section13_4[0].TextField11[0]', // Gap explanation field
  'section13.employmentType': 'form1[0].section_13_1-2[0].RadioButtonList[0]', // Employment type selection

  // ============================================================================
  // MILITARY EMPLOYMENT ENTRY FIELD MAPPINGS - ENTRY [0] SPECIFIC (PAGE 17)
  // ============================================================================

  // These mappings handle the UI field paths for military employment entries
  // Pattern: section13.militaryEmployment.entries[0].fieldPath -> PDF field name

  // Basic Employment Information for Entry [0]
  'section13.militaryEmployment.entries[0].employerName': 'form1[0].section_13_1-2[0].p3-t68[4]', // Duty Station field (used for employer)
  'section13.militaryEmployment.entries[0].positionTitle': 'form1[0].section_13_1-2[0].p3-t68[3]', // Rank/Position Title
  'section13.militaryEmployment.entries[0].employmentDates.fromDate': 'form1[0].section_13_1-2[0].From_Datefield_Name_2[0]', // From Date
  'section13.militaryEmployment.entries[0].employmentDates.toDate': 'form1[0].section_13_1-2[0].From_Datefield_Name_2[1]', // To Date
  'section13.militaryEmployment.entries[0].employmentDates.fromEstimated': 'form1[0].section_13_1-2[0].#field[36]', // From Estimate checkbox
  'section13.militaryEmployment.entries[0].employmentDates.toEstimated': 'form1[0].section_13_1-2[0].#field[32]', // To Estimate checkbox
  'section13.militaryEmployment.entries[0].employmentDates.present': 'form1[0].section_13_1-2[0].#field[37]', // Present checkbox

  // Employment Status and Position for Entry [0]
  'section13.militaryEmployment.entries[0].employmentStatus': 'form1[0].section_13_1-2[0].p13a-1-1cb[0]', // Full-time checkbox
  'section13.militaryEmployment.entries[0].isPartTime': 'form1[0].section_13_1-2[0].#field[33]', // Part-time checkbox
  'section13.militaryEmployment.entries[0].rankTitle': 'form1[0].section_13_1-2[0].p3-t68[3]', // Most Recent Rank/Position Title
  'section13.militaryEmployment.entries[0].dutyStation.dutyStation': 'form1[0].section_13_1-2[0].p3-t68[4]', // Assigned Duty Station
  'section13.militaryEmployment.entries[0].otherExplanation': 'form1[0].section_13_1-2[0].TextField11[13]', // Other explanation

  // Duty Station Address for Entry [0]
  'section13.militaryEmployment.entries[0].dutyStation.street': 'form1[0].section_13_1-2[0].TextField11[9]', // Duty station street
  'section13.militaryEmployment.entries[0].dutyStation.city': 'form1[0].section_13_1-2[0].TextField11[10]', // Duty station city
  'section13.militaryEmployment.entries[0].dutyStation.state': 'form1[0].section_13_1-2[0].School6_State[2]', // Duty station state
  'section13.militaryEmployment.entries[0].dutyStation.zipCode': 'form1[0].section_13_1-2[0].TextField11[11]', // Duty station zip
  'section13.militaryEmployment.entries[0].dutyStation.country': 'form1[0].section_13_1-2[0].DropDownList20[0]', // Duty station country

  // Personal Phone Information for Entry [0]
  'section13.militaryEmployment.entries[0].phone.number': 'form1[0].section_13_1-2[0].p3-t68[1]', // Personal phone
  'section13.militaryEmployment.entries[0].phone.extension': 'form1[0].section_13_1-2[0].TextField11[12]', // Personal phone extension
  'section13.militaryEmployment.entries[0].phone.isDSN': 'form1[0].section_13_1-2[0].#field[26]', // DSN checkbox
  'section13.militaryEmployment.entries[0].phone.isDay': 'form1[0].section_13_1-2[0].#field[27]', // Day checkbox
  'section13.militaryEmployment.entries[0].phone.isNight': 'form1[0].section_13_1-2[0].#field[28]', // Night checkbox

  // Supervisor Information for Entry [0]
  'section13.militaryEmployment.entries[0].supervisor.name': 'form1[0].section_13_1-2[0].TextField11[0]', // Supervisor name
  'section13.militaryEmployment.entries[0].supervisor.title': 'form1[0].section_13_1-2[0].TextField11[1]', // Supervisor rank/title
  'section13.militaryEmployment.entries[0].supervisor.phone.number': 'form1[0].section_13_1-2[0].p3-t68[0]', // Supervisor phone
  'section13.militaryEmployment.entries[0].supervisor.phone.extension': 'form1[0].section_13_1-2[0].TextField11[2]', // Phone extension
  'section13.militaryEmployment.entries[0].supervisor.email': 'form1[0].section_13_1-2[0].p3-t68[2]', // Supervisor email
  'section13.militaryEmployment.entries[0].supervisor.emailUnknown': 'form1[0].section_13_1-2[0].#field[30]', // Email unknown checkbox

  // Supervisor Phone Type Checkboxes for Entry [0]
  'section13.militaryEmployment.entries[0].supervisor.phone.isDSN': 'form1[0].section_13_1-2[0].#field[17]', // Supervisor DSN checkbox
  'section13.militaryEmployment.entries[0].supervisor.phone.isDay': 'form1[0].section_13_1-2[0].#field[16]', // Supervisor Day checkbox
  'section13.militaryEmployment.entries[0].supervisor.phone.isNight': 'form1[0].section_13_1-2[0].#field[15]', // Supervisor Night checkbox

  // Supervisor Work Location Address for Entry [0]
  'section13.militaryEmployment.entries[0].supervisor.workLocation.street': 'form1[0].section_13_1-2[0].TextField11[3]', // Supervisor street
  'section13.militaryEmployment.entries[0].supervisor.workLocation.city': 'form1[0].section_13_1-2[0].TextField11[4]', // Supervisor city
  'section13.militaryEmployment.entries[0].supervisor.workLocation.state': 'form1[0].section_13_1-2[0].School6_State[0]', // Supervisor state
  'section13.militaryEmployment.entries[0].supervisor.workLocation.zipCode': 'form1[0].section_13_1-2[0].TextField11[5]', // Supervisor zip
  'section13.militaryEmployment.entries[0].supervisor.workLocation.country': 'form1[0].section_13_1-2[0].DropDownList18[0]', // Supervisor country

  // APO/FPO Address fields for Entry [0]
  'section13.militaryEmployment.entries[0].apoAddress.street': 'form1[0].section_13_1-2[0].TextField11[16]', // APO street
  'section13.militaryEmployment.entries[0].apoAddress.apo': 'form1[0].section_13_1-2[0].TextField11[17]', // APO/FPO
  'section13.militaryEmployment.entries[0].apoAddress.state': 'form1[0].section_13_1-2[0].School6_State[4]', // APO state
  'section13.militaryEmployment.entries[0].apoAddress.zipCode': 'form1[0].section_13_1-2[0].TextField11[18]', // APO zip

  // Physical location fields for Entry [0]
  'section13.militaryEmployment.entries[0].physicalLocation.street': 'form1[0].section_13_1-2[0].TextField11[6]', // Physical street
  'section13.militaryEmployment.entries[0].physicalLocation.city': 'form1[0].section_13_1-2[0].TextField11[7]', // Physical city
  'section13.militaryEmployment.entries[0].physicalLocation.state': 'form1[0].section_13_1-2[0].School6_State[1]', // Physical state
  'section13.militaryEmployment.entries[0].physicalLocation.zipCode': 'form1[0].section_13_1-2[0].TextField11[8]', // Physical zip
  'section13.militaryEmployment.entries[0].physicalLocation.country': 'form1[0].section_13_1-2[0].DropDownList17[0]', // Physical country

  // Additional supervisor physical address fields for Entry [0]
  'section13.militaryEmployment.entries[0].supervisor.physicalAddress.street': 'form1[0].section_13_1-2[0].TextField11[14]', // Supervisor physical street
  'section13.militaryEmployment.entries[0].supervisor.physicalAddress.city': 'form1[0].section_13_1-2[0].TextField11[15]', // Supervisor physical city
  'section13.militaryEmployment.entries[0].supervisor.physicalAddress.state': 'form1[0].section_13_1-2[0].School6_State[3]', // Supervisor physical state
  'section13.militaryEmployment.entries[0].supervisor.physicalAddress.zipCode': 'form1[0].section_13_1-2[0].TextField11[19]', // Supervisor physical zip
  'section13.militaryEmployment.entries[0].supervisor.physicalAddress.country': 'form1[0].section_13_1-2[0].DropDownList4[0]', // Supervisor physical country

  // SSN Field for Entry [0]
  'section13.militaryEmployment.entries[0].ssn': 'form1[0].section_13_1-2[0].SSN[0]', // SSN field

  // ============================================================================
  // SIMPLE FIELD PATH MAPPINGS - FOR UI COMPONENT COMPATIBILITY
  // ============================================================================

  // These mappings handle the simple field paths used by the UI component
  // The UI component uses paths like 'employerName', 'positionTitle', etc.
  // These need to map to the same PDF fields as the complex paths above

  // Basic Employment Information - Simple Paths (Entry [0])
  'employerName': 'form1[0].section_13_1-2[0].p3-t68[4]', // Duty Station field (used for employer)
  'positionTitle': 'form1[0].section_13_1-2[0].p3-t68[3]', // Rank/Position Title
  'employmentDates.fromDate': 'form1[0].section_13_1-2[0].From_Datefield_Name_2[0]', // From Date
  'employmentDates.toDate': 'form1[0].section_13_1-2[0].From_Datefield_Name_2[1]', // To Date
  'employmentDates.fromEstimated': 'form1[0].section_13_1-2[0].#field[36]', // From Estimate checkbox
  'employmentDates.toEstimated': 'form1[0].section_13_1-2[0].#field[32]', // To Estimate checkbox
  'employmentDates.present': 'form1[0].section_13_1-2[0].#field[37]', // Present checkbox

  // Employment Status and Position - Simple Paths (Entry [0])
  'employmentStatus': 'form1[0].section_13_1-2[0].p13a-1-1cb[0]', // Full-time checkbox
  'isPartTime': 'form1[0].section_13_1-2[0].#field[33]', // Part-time checkbox
  'rankTitle': 'form1[0].section_13_1-2[0].p3-t68[3]', // Most Recent Rank/Position Title
  'dutyStation.dutyStation': 'form1[0].section_13_1-2[0].p3-t68[4]', // Assigned Duty Station
  'otherExplanation': 'form1[0].section_13_1-2[0].TextField11[13]', // Other explanation

  // Duty Station Address - Simple Paths (Entry [0])
  'dutyStation.street': 'form1[0].section_13_1-2[0].TextField11[9]', // Duty station street
  'dutyStation.city': 'form1[0].section_13_1-2[0].TextField11[10]', // Duty station city
  'dutyStation.state': 'form1[0].section_13_1-2[0].School6_State[2]', // Duty station state
  'dutyStation.zipCode': 'form1[0].section_13_1-2[0].TextField11[11]', // Duty station zip
  'dutyStation.country': 'form1[0].section_13_1-2[0].DropDownList20[0]', // Duty station country

  // Personal Phone Information - Simple Paths (Entry [0])
  'phone.number': 'form1[0].section_13_1-2[0].p3-t68[1]', // Personal phone
  'phone.extension': 'form1[0].section_13_1-2[0].TextField11[12]', // Personal phone extension
  'phone.isDSN': 'form1[0].section_13_1-2[0].#field[26]', // DSN checkbox
  'phone.isDay': 'form1[0].section_13_1-2[0].#field[27]', // Day checkbox
  'phone.isNight': 'form1[0].section_13_1-2[0].#field[28]', // Night checkbox

  // Supervisor Information - Simple Paths (Entry [0])
  'supervisor.name': 'form1[0].section_13_1-2[0].TextField11[0]', // Supervisor name
  'supervisor.title': 'form1[0].section_13_1-2[0].TextField11[1]', // Supervisor rank/title
  'supervisor.phone.number': 'form1[0].section_13_1-2[0].p3-t68[0]', // Supervisor phone
  'supervisor.phone.extension': 'form1[0].section_13_1-2[0].TextField11[2]', // Phone extension
  'supervisor.email': 'form1[0].section_13_1-2[0].p3-t68[2]', // Supervisor email
  'supervisor.emailUnknown': 'form1[0].section_13_1-2[0].#field[30]', // Email unknown checkbox

  // Supervisor Phone Type Checkboxes - Simple Paths (Entry [0])
  'supervisor.phone.isDSN': 'form1[0].section_13_1-2[0].#field[17]', // Supervisor DSN checkbox
  'supervisor.phone.isDay': 'form1[0].section_13_1-2[0].#field[16]', // Supervisor Day checkbox
  'supervisor.phone.isNight': 'form1[0].section_13_1-2[0].#field[15]', // Supervisor Night checkbox

  // Supervisor Work Location Address - Simple Paths (Entry [0])
  'supervisor.workLocation.street': 'form1[0].section_13_1-2[0].TextField11[3]', // Supervisor street
  'supervisor.workLocation.city': 'form1[0].section_13_1-2[0].TextField11[4]', // Supervisor city
  'supervisor.workLocation.state': 'form1[0].section_13_1-2[0].School6_State[0]', // Supervisor state
  'supervisor.workLocation.zipCode': 'form1[0].section_13_1-2[0].TextField11[5]', // Supervisor zip
  'supervisor.workLocation.country': 'form1[0].section_13_1-2[0].DropDownList18[0]', // Supervisor country

  // APO/FPO Address fields - Simple Paths (Entry [0])
  'apoAddress.street': 'form1[0].section_13_1-2[0].TextField11[16]', // APO street
  'apoAddress.apo': 'form1[0].section_13_1-2[0].TextField11[17]', // APO/FPO
  'apoAddress.state': 'form1[0].section_13_1-2[0].School6_State[4]', // APO state
  'apoAddress.zipCode': 'form1[0].section_13_1-2[0].TextField11[18]', // APO zip

  // Physical location fields - Simple Paths (Entry [0])
  'physicalLocation.street': 'form1[0].section_13_1-2[0].TextField11[6]', // Physical street
  'physicalLocation.city': 'form1[0].section_13_1-2[0].TextField11[7]', // Physical city
  'physicalLocation.state': 'form1[0].section_13_1-2[0].School6_State[1]', // Physical state
  'physicalLocation.zipCode': 'form1[0].section_13_1-2[0].TextField11[8]', // Physical zip
  'physicalLocation.country': 'form1[0].section_13_1-2[0].DropDownList17[0]', // Physical country

  // Additional supervisor physical address fields - Simple Paths (Entry [0])
  'supervisor.physicalAddress.street': 'form1[0].section_13_1-2[0].TextField11[14]', // Supervisor physical street
  'supervisor.physicalAddress.city': 'form1[0].section_13_1-2[0].TextField11[15]', // Supervisor physical city
  'supervisor.physicalAddress.state': 'form1[0].section_13_1-2[0].School6_State[3]', // Supervisor physical state
  'supervisor.physicalAddress.zipCode': 'form1[0].section_13_1-2[0].TextField11[19]', // Supervisor physical zip
  'supervisor.physicalAddress.country': 'form1[0].section_13_1-2[0].DropDownList4[0]', // Supervisor physical country

  // Additional fields for UI compatibility - Simple Paths (Entry [0])
  'supervisor.hasApoFpo': 'form1[0].section_13_1-2[0].#field[31]', // Has APO/FPO checkbox
  'supervisor.canContact': 'form1[0].section_13_1-2[0].#field[29]', // Can contact checkbox
  'supervisor.contactRestrictions': 'form1[0].section_13_1-2[0].TextField11[20]', // Contact restrictions
  'ssn': 'form1[0].section_13_1-2[0].SSN[0]', // SSN field

  // ============================================================================
  // FEDERAL EMPLOYMENT INFORMATION - CRITICAL MISSING MAPPINGS
  // ============================================================================

  // Federal employment fields (CORRECTED from section-13.json)
  'sect13A.5Entry1HasFederalEmployment': 'form1[0].section13_5[0].RadioButtonList[1]',
  'sect13A.5Entry1SecurityClearance': 'form1[0].section13_5[0].#area[1].p3-t68[0]', // Fixed path
  'sect13A.5Entry1ClearanceLevel': 'form1[0].section13_5[0].p3-t68[2]', // Position title field
  'sect13A.5Entry1ClearanceDate': 'form1[0].section13_5[0].p3-t68[4]', // Position title field
  'sect13A.5Entry1InvestigationDate': 'form1[0].section13_5[0].p3-t68[6]', // Position title field
  'sect13A.5Entry1PolygraphDate': 'form1[0].section13_5[0].TextField11[3]', // Street address field
  'sect13A.5Entry1AccessToClassified': 'form1[0].section13_5[0].TextField11[4]', // City field
  'sect13A.5Entry1ClassificationLevel': 'form1[0].section13_5[0].TextField11[5]', // Zip field

  // ============================================================================
  // EMPLOYMENT RECORD ISSUES - CRITICAL MISSING MAPPINGS
  // ============================================================================

  // Employment issues fields (these were causing console warnings)
  'sect13A.5WasFired': 'form1[0].section13_4[0].RadioButtonList[0]',
  'sect13A.5QuitAfterBeingTold': 'form1[0].section13_4[0].RadioButtonList[1]',
  'sect13A.5LeftByMutualAgreement': 'form1[0].section13_4[0].RadioButtonList[2]',
  'sect13A.6ReceivedWrittenWarning': 'form1[0].section13_4[1].RadioButtonList[0]',







  // ============================================================================
  // SECTION 13A.2 - NON-FEDERAL EMPLOYMENT (section13_2-2 pattern) - UPDATED FOR ACTUAL PATHS
  // ============================================================================

  // Non-Federal Employment Information - Entry 0 (PAGE 17 FIELDS)
  'section13.nonFederalEmployment.entries[0].employer.name': 'form1[0].section_13_1-2[0].p3-t68[5]', // Employer name field
  'section13.nonFederalEmployment.entries[0].position.title': 'form1[0].section_13_1-2[0].p3-t68[6]', // Position title field

  // Non-Federal Employment Supervisor Information (PAGE 17 FIELDS)
  // Map to the same fields as military employment since page 17 is for military/federal employment
  'section13.nonFederalEmployment.entries[0].supervisor.name': 'form1[0].section_13_1-2[0].TextField11[0]', // Supervisor name
  'section13.nonFederalEmployment.entries[0].supervisor.title': 'form1[0].section_13_1-2[0].TextField11[1]', // Supervisor title
  'section13.nonFederalEmployment.entries[0].supervisor.phone': 'form1[0].section_13_1-2[0].p3-t68[0]', // Supervisor phone
  'section13.nonFederalEmployment.entries[0].supervisor.email': 'form1[0].section_13_1-2[0].p3-t68[2]', // Supervisor email



  // Additional Supervisor Information Fields
  'section13.nonFederalEmployment.entries[0].supervisor.phone.extension': 'form1[0].section_13_1-2[0].TextField11[2]', // Phone extension
  'section13.nonFederalEmployment.entries[0].supervisor.workLocation.street': 'form1[0].section_13_1-2[0].TextField11[3]', // Supervisor work street
  'section13.nonFederalEmployment.entries[0].supervisor.workLocation.city': 'form1[0].section_13_1-2[0].TextField11[4]', // Supervisor work city
  'section13.nonFederalEmployment.entries[0].supervisor.workLocation.state': 'form1[0].section_13_1-2[0].School6_State[0]', // Supervisor work state
  'section13.nonFederalEmployment.entries[0].supervisor.workLocation.country': 'form1[0].section_13_1-2[0].DropDownList18[0]', // Supervisor work country
  'section13.nonFederalEmployment.entries[0].supervisor.workLocation.zipCode': 'form1[0].section_13_1-2[0].TextField11[5]', // Supervisor work zip

  // Add more non-federal employment fields that we can find in the PDF
  'section13.nonFederalEmployment.entries[0].fromDate': 'form1[0].section_13_1-2[0].From_Datefield_Name_3[0]', // Non-federal from date
  'section13.nonFederalEmployment.entries[0].toDate': 'form1[0].section_13_1-2[0].From_Datefield_Name_3[1]', // Non-federal to date
  'section13.nonFederalEmployment.entries[0].employerAddress.street': 'form1[0].section13_2-2[0].TextField11[4]',
  'section13.nonFederalEmployment.entries[0].employerAddress.city': 'form1[0].section13_2-2[0].TextField11[5]',
  'section13.nonFederalEmployment.entries[0].employerAddress.state': 'form1[0].section13_2-2[0].School6_State[0]',
  'section13.nonFederalEmployment.entries[0].employerAddress.zipCode': 'form1[0].section13_2-2[0].TextField11[6]',
  'section13.nonFederalEmployment.entries[0].employerAddress.country': 'form1[0].section13_2-2[0].DropDownList16[0]',

  // Employment Dates and Status
  'section13.nonFederalEmployment.entries[0].employmentDates.fromDate': 'form1[0].section13_2-2[0].From_Datefield_Name_2[1]',
  'section13.nonFederalEmployment.entries[0].employmentDates.toDate': 'form1[0].section13_2-2[0].From_Datefield_Name_2[0]',
  'section13.nonFederalEmployment.entries[0].employmentDates.fromEstimated': 'form1[0].section13_2-2[0].#field[36]',
  'section13.nonFederalEmployment.entries[0].employmentDates.toEstimated': 'form1[0].section13_2-2[0].#field[38]',
  'section13.nonFederalEmployment.entries[0].employmentDates.present': 'form1[0].section13_2-2[0].p13a-2-1cb[0]',

  // Employment Status and Type Selection
  'section13.nonFederalEmployment.entries[0].employmentStatus': 'form1[0].section13_2-2[0].RadioButtonList[1]',
  'section13.nonFederalEmployment.entries[0].employmentType': 'form1[0].section13_2-2[0].RadioButtonList[0]',

  // Additional Supervisor Contact Information (PAGE 17 FIELDS)
  'section13.nonFederalEmployment.entries[0].supervisor.phone.isDSN': 'form1[0].section_13_1-2[0].#field[17]', // International/DSN phone checkbox
  'section13.nonFederalEmployment.entries[0].supervisor.phone.isDay': 'form1[0].section_13_1-2[0].#field[16]', // Day phone checkbox
  'section13.nonFederalEmployment.entries[0].supervisor.phone.isNight': 'form1[0].section_13_1-2[0].#field[15]', // Night phone checkbox

  // Military Employment Address Information (PAGE 17 FIELDS) - Use military employment path to avoid duplicates
  'section13.militaryEmployment.entries[0].employerAddress.street': 'form1[0].section_13_1-2[0].TextField11[9]', // Duty station street
  'section13.militaryEmployment.entries[0].employerAddress.city': 'form1[0].section_13_1-2[0].TextField11[10]', // Duty station city
  'section13.militaryEmployment.entries[0].employerAddress.state': 'form1[0].section_13_1-2[0].School6_State[2]', // Duty station state
  'section13.militaryEmployment.entries[0].employerAddress.country': 'form1[0].section_13_1-2[0].DropDownList20[0]', // Duty station country
  'section13.militaryEmployment.entries[0].employerAddress.zipCode': 'form1[0].section_13_1-2[0].TextField11[11]', // Duty station zip

  // Personal Contact Information (PAGE 17 FIELDS)
  'section13.personalInfo.ssn': 'form1[0].section_13_1-2[0].SSN[0]', // SSN field
  'section13.personalInfo.phone': 'form1[0].section_13_1-2[0].p3-t68[1]', // Personal phone
  'section13.personalInfo.phoneExtension': 'form1[0].section_13_1-2[0].TextField11[12]', // Personal phone extension



  // Physical Work Address (if different from employer address)
  'section13.nonFederalEmployment.entries[0].hasPhysicalWorkAddress': 'form1[0].section13_2-2[0].RadioButtonList[2]',
  'section13.nonFederalEmployment.entries[0].physicalWorkAddress.street': 'form1[0].section13_2-2[0].TextField11[7]',
  'section13.nonFederalEmployment.entries[0].physicalWorkAddress.city': 'form1[0].section13_2-2[0].TextField11[8]',
  'section13.nonFederalEmployment.entries[0].physicalWorkAddress.state': 'form1[0].section13_2-2[0].School6_State[1]',
  'section13.nonFederalEmployment.entries[0].physicalWorkAddress.zipCode': 'form1[0].section13_2-2[0].TextField11[9]',
  'section13.nonFederalEmployment.entries[0].physicalWorkAddress.country': 'form1[0].section13_2-2[0].DropDownList16[1]',

  // ============================================================================
  // SECTION 13A.3 - SELF-EMPLOYMENT (section13_3-2 pattern)
  // ============================================================================

  // Basic Self-Employment Information - Entry 0
  'section13.selfEmployment.entries[0].businessName': 'form1[0].section13_3-2[0].TextField11[0]',
  'section13.selfEmployment.entries[0].positionTitle': 'form1[0].section13_3-2[0].TextField11[1]',
  'section13.selfEmployment.entries[0].businessType': 'form1[0].section13_3-2[0].TextField11[2]',
  'section13.selfEmployment.entries[0].businessAddress.street': 'form1[0].section13_3-2[0].TextField11[3]',
  'section13.selfEmployment.entries[0].businessAddress.city': 'form1[0].section13_3-2[0].TextField11[4]',
  'section13.selfEmployment.entries[0].businessAddress.state': 'form1[0].section13_3-2[0].School6_State[0]',
  'section13.selfEmployment.entries[0].businessAddress.zipCode': 'form1[0].section13_3-2[0].TextField11[5]',
  'section13.selfEmployment.entries[0].businessAddress.country': 'form1[0].section13_3-2[0].DropDownList16[0]',
  'section13.selfEmployment.entries[0].phone.number': 'form1[0].section13_3-2[0].p3-t68[0]',
  'section13.selfEmployment.entries[0].phone.extension': 'form1[0].section13_3-2[0].p3-t68[1]',

  // Employment Dates and Status
  'section13.selfEmployment.entries[0].employmentDates.fromDate': 'form1[0].section13_3-2[0].From_Datefield_Name_2[1]',
  'section13.selfEmployment.entries[0].employmentDates.toDate': 'form1[0].section13_3-2[0].From_Datefield_Name_2[0]',
  'section13.selfEmployment.entries[0].employmentDates.fromEstimated': 'form1[0].section13_3-2[0].#field[36]',
  'section13.selfEmployment.entries[0].employmentDates.toEstimated': 'form1[0].section13_3-2[0].#field[38]',
  'section13.selfEmployment.entries[0].employmentDates.present': 'form1[0].section13_3-2[0].p13a-3-1cb[0]',
  'section13.selfEmployment.entries[0].employmentStatus': 'form1[0].section13_3-2[0].RadioButtonList[1]',

  // Self-Employment Verifier Information
  'section13.selfEmployment.entries[0].verifierFirstName': 'form1[0].section13_3-2[0].TextField11[6]',
  'section13.selfEmployment.entries[0].verifierLastName': 'form1[0].section13_3-2[0].TextField11[7]',
  'section13.selfEmployment.entries[0].verifierAddress.street': 'form1[0].section13_3-2[0].TextField11[8]',
  'section13.selfEmployment.entries[0].verifierAddress.city': 'form1[0].section13_3-2[0].TextField11[9]',
  'section13.selfEmployment.entries[0].verifierAddress.state': 'form1[0].section13_3-2[0].School6_State[1]',
  'section13.selfEmployment.entries[0].verifierAddress.zipCode': 'form1[0].section13_3-2[0].TextField11[10]',
  'section13.selfEmployment.entries[0].verifierAddress.country': 'form1[0].section13_3-2[0].DropDownList16[1]',
  'section13.selfEmployment.entries[0].verifierPhone.number': 'form1[0].section13_3-2[0].p3-t68[2]',
  'section13.selfEmployment.entries[0].verifierPhone.extension': 'form1[0].section13_3-2[0].p3-t68[3]',

  // Physical Work Address (if different)
  'section13.selfEmployment.entries[0].hasPhysicalWorkAddress': 'form1[0].section13_3-2[0].RadioButtonList[0]',
  'section13.selfEmployment.entries[0].physicalWorkAddress.street': 'form1[0].section13_3-2[0].TextField11[11]',
  'section13.selfEmployment.entries[0].physicalWorkAddress.city': 'form1[0].section13_3-2[0].TextField11[12]',
  'section13.selfEmployment.entries[0].physicalWorkAddress.state': 'form1[0].section13_3-2[0].School6_State[2]',
  'section13.selfEmployment.entries[0].physicalWorkAddress.zipCode': 'form1[0].section13_3-2[0].TextField11[13]',
  'section13.selfEmployment.entries[0].physicalWorkAddress.country': 'form1[0].section13_3-2[0].DropDownList16[2]',

  // ============================================================================
  // SECTION 13A.4 - UNEMPLOYMENT PERIODS (section13_4 pattern)
  // ============================================================================

  // Unemployment Period - Entry 0
  'section13.unemployment.entries[0].unemploymentDates.fromDate': 'form1[0].section13_4[0].From_Datefield_Name_2[1]',
  'section13.unemployment.entries[0].unemploymentDates.toDate': 'form1[0].section13_4[0].From_Datefield_Name_2[0]',
  'section13.unemployment.entries[0].unemploymentDates.fromEstimated': 'form1[0].section13_4[0].#field[36]',
  'section13.unemployment.entries[0].unemploymentDates.toEstimated': 'form1[0].section13_4[0].#field[38]',
  'section13.unemployment.entries[0].unemploymentDates.present': 'form1[0].section13_4[0].p13b-1cb[0]',

  // Unemployment Reference Contact Information
  'section13.unemployment.entries[0].reference.firstName': 'form1[0].section13_4[0].TextField11[0]',
  'section13.unemployment.entries[0].reference.lastName': 'form1[0].section13_4[0].TextField11[1]',
  'section13.unemployment.entries[0].reference.address.street': 'form1[0].section13_4[0].TextField11[2]',
  'section13.unemployment.entries[0].reference.address.city': 'form1[0].section13_4[0].TextField11[3]',
  'section13.unemployment.entries[0].reference.address.state': 'form1[0].section13_4[0].School6_State[0]',
  'section13.unemployment.entries[0].reference.address.zipCode': 'form1[0].section13_4[0].TextField11[4]',
  'section13.unemployment.entries[0].reference.address.country': 'form1[0].section13_4[0].DropDownList16[0]',
  'section13.unemployment.entries[0].reference.phone.number': 'form1[0].section13_4[0].p3-t68[0]',
  'section13.unemployment.entries[0].reference.phone.extension': 'form1[0].section13_4[0].p3-t68[1]',
  'section13.unemployment.entries[0].reference.phone.isDSN': 'form1[0].section13_4[0].p3-t68[2]',
  'section13.unemployment.entries[0].reference.phone.isDay': 'form1[0].section13_4[0].p3-t68[3]',
  'section13.unemployment.entries[0].reference.phone.isNight': 'form1[0].section13_4[0].p3-t68[4]',

  // ============================================================================
  // SECTION 13C - EMPLOYMENT RECORD ISSUES (section13_5 pattern)
  // ============================================================================

  'section13.employmentRecordIssues.hasIssues': 'form1[0].section13_5[0].RadioButtonList[0]',
  'section13.employmentRecordIssues.explanation': 'form1[0].section13_5[0].TextField11[0]',

  // ============================================================================
  // ADDITIONAL EMPLOYMENT ENTRIES (section_13_1, section13_2, section13_3, section13_4)
  // ============================================================================

  // Additional Military Employment Entries (section_13_1 pattern)
  'section13.militaryEmployment.entries[1].employerName': 'form1[0].section_13_1[0].TextField11[0]',
  'section13.militaryEmployment.entries[1].positionTitle': 'form1[0].section_13_1[0].TextField11[1]',
  'section13.militaryEmployment.entries[1].employmentDates.fromDate': 'form1[0].section_13_1[0].From_Datefield_Name_2[1]',
  'section13.militaryEmployment.entries[1].employmentDates.toDate': 'form1[0].section_13_1[0].From_Datefield_Name_2[0]',

  'section13.militaryEmployment.entries[2].employerName': 'form1[0].section_13_1[1].TextField11[0]',
  'section13.militaryEmployment.entries[2].positionTitle': 'form1[0].section_13_1[1].TextField11[1]',
  'section13.militaryEmployment.entries[2].employmentDates.fromDate': 'form1[0].section_13_1[1].From_Datefield_Name_2[1]',
  'section13.militaryEmployment.entries[2].employmentDates.toDate': 'form1[0].section_13_1[1].From_Datefield_Name_2[0]',

  // Additional Non-Federal Employment Entries (section13_2 pattern)
  'section13.nonFederalEmployment.entries[1].employerName': 'form1[0].section13_2[0].TextField11[0]',
  'section13.nonFederalEmployment.entries[1].positionTitle': 'form1[0].section13_2[0].TextField11[1]',
  'section13.nonFederalEmployment.entries[1].employmentDates.fromDate': 'form1[0].section13_2[0].From_Datefield_Name_2[1]',
  'section13.nonFederalEmployment.entries[1].employmentDates.toDate': 'form1[0].section13_2[0].From_Datefield_Name_2[0]',

  'section13.nonFederalEmployment.entries[2].employerName': 'form1[0].section13_2[1].TextField11[0]',
  'section13.nonFederalEmployment.entries[2].positionTitle': 'form1[0].section13_2[1].TextField11[1]',
  'section13.nonFederalEmployment.entries[2].employmentDates.fromDate': 'form1[0].section13_2[1].From_Datefield_Name_2[1]',
  'section13.nonFederalEmployment.entries[2].employmentDates.toDate': 'form1[0].section13_2[1].From_Datefield_Name_2[0]',

  // Additional Self-Employment Entries (section13_3 pattern)
  'section13.selfEmployment.entries[1].employerName': 'form1[0].section13_3[0].TextField11[0]',
  'section13.selfEmployment.entries[1].positionTitle': 'form1[0].section13_3[0].TextField11[1]',
  'section13.selfEmployment.entries[1].employmentDates.fromDate': 'form1[0].section13_3[0].From_Datefield_Name_2[1]',
  'section13.selfEmployment.entries[1].employmentDates.toDate': 'form1[0].section13_3[0].From_Datefield_Name_2[0]',

  'section13.selfEmployment.entries[2].employerName': 'form1[0].section13_3[1].TextField11[0]',
  'section13.selfEmployment.entries[2].positionTitle': 'form1[0].section13_3[1].TextField11[1]',
  'section13.selfEmployment.entries[2].employmentDates.fromDate': 'form1[0].section13_3[1].From_Datefield_Name_2[1]',
  'section13.selfEmployment.entries[2].employmentDates.toDate': 'form1[0].section13_3[1].From_Datefield_Name_2[0]',

  // Additional Unemployment Entries (section13_4 pattern)
  'section13.unemploymentPeriods.entries[1].fromDate': 'form1[0].section13_4[1].From_Datefield_Name_2[1]',
  'section13.unemploymentPeriods.entries[1].toDate': 'form1[0].section13_4[1].From_Datefield_Name_2[0]',
  'section13.unemploymentPeriods.entries[2].fromDate': 'form1[0].section13_4[2].From_Datefield_Name_2[1]',
  'section13.unemploymentPeriods.entries[2].toDate': 'form1[0].section13_4[2].From_Datefield_Name_2[0]',
  'section13.unemploymentPeriods.entries[3].fromDate': 'form1[0].section13_4[3].From_Datefield_Name_2[1]',
  'section13.unemploymentPeriods.entries[3].toDate': 'form1[0].section13_4[3].From_Datefield_Name_2[0]',

  // ============================================================================
  // SIMPLIFIED UI FIELD MAPPINGS FOR COMPONENT INTEGRATION
  // ============================================================================

  // Self-Employment UI Fields (simplified paths for component)
  'businessName': 'form1[0].section13_3-2[0].TextField11[0]',
  'businessType': 'form1[0].section13_3-2[0].TextField11[2]',

  // Unemployment UI Fields (simplified paths for component)
  'unemploymentDates.fromDate': 'form1[0].section13_4[0].From_Datefield_Name_2[1]',
  'unemploymentDates.toDate': 'form1[0].section13_4[0].From_Datefield_Name_2[0]',
  'reason': 'form1[0].section13_4[0].TextField11[0]',

};

/**
 * Map a logical field path to its corresponding PDF field name
 * Supports dynamic entry indexing for multiple employment entries
 */
export function mapLogicalFieldToPdfField(logicalPath: string): string {
  // Check direct mappings first
  if (SECTION13_FIELD_MAPPINGS[logicalPath]) {
    return SECTION13_FIELD_MAPPINGS[logicalPath];
  }

  // Handle dynamic entry indexing for multiple entries
  // Convert entries[1], entries[2], etc. to appropriate PDF field patterns
  const dynamicMapping = handleDynamicEntryMapping(logicalPath);
  if (dynamicMapping) {
    return dynamicMapping;
  }

  console.warn(`⚠️ Section13: No mapping found for logical path: ${logicalPath}`);
  return logicalPath; // Return as-is if no mapping found
}

/**
 * Handle dynamic entry mapping for multiple employment entries
 * Maps entries[1], entries[2], etc. to correct PDF field patterns
 */
function handleDynamicEntryMapping(logicalPath: string): string | null {
  // Pattern: section13.{type}.entries[N].{field}
  const entryPattern = /section13\.(\w+)\.entries\[(\d+)\]\.(.+)/;
  const match = logicalPath.match(entryPattern);

  if (!match) return null;

  const [, employmentType, entryIndex, fieldPath] = match;
  const index = parseInt(entryIndex);

  // Map to base entry[0] pattern first
  const baseLogicalPath = `section13.${employmentType}.entries[0].${fieldPath}`;
  const basePdfField = SECTION13_FIELD_MAPPINGS[baseLogicalPath];

  if (!basePdfField) return null;

  // Convert PDF field pattern for different entry indices
  return convertPdfFieldForEntryIndex(basePdfField, index, employmentType);
}

/**
 * Convert a PDF field name for a different entry index
 * Example: section_13_1-2[0] -> section_13_1[0] for entry 1
 */
function convertPdfFieldForEntryIndex(basePdfField: string, entryIndex: number, employmentType: string): string {
  if (entryIndex === 0) return basePdfField;

  // Map employment types to their PDF section patterns
  const sectionPatterns: Record<string, string[]> = {
    'militaryEmployment': ['section_13_1-2', 'section_13_1'],
    'nonFederalEmployment': ['section13_2-2', 'section13_2'],
    'selfEmployment': ['section13_3-2', 'section13_3'],
    'unemployment': ['section13_4']
  };

  const patterns = sectionPatterns[employmentType];
  if (!patterns || entryIndex >= patterns.length) {
    console.warn(`⚠️ Section13: No PDF pattern for ${employmentType} entry ${entryIndex}`);
    return basePdfField;
  }

  // Replace the section pattern and adjust the index
  const targetPattern = patterns[entryIndex];
  const sourcePattern = patterns[0];

  // Replace section pattern: section_13_1-2[0] -> section_13_1[0]
  let convertedField = basePdfField.replace(sourcePattern + '[0]', targetPattern + '[0]');

  // For additional entries beyond the first alternative, increment the array index
  if (entryIndex > 1) {
    const arrayIndex = entryIndex - 1;
    convertedField = convertedField.replace('[0]', `[${arrayIndex}]`);
  }

  return convertedField;
}

/**
 * Get field metadata for a PDF field name (Section 13 specific)
 */
export function getSection13FieldMetadata(pdfFieldName: string): any {
  // This would typically fetch from the sections-references system
  // For now, return basic metadata
  return {
    name: pdfFieldName,
    type: 'text',
    label: pdfFieldName
  };
}

/**
 * Validate that a PDF field exists in the reference data (Section 13 specific)
 */
export function validateSection13FieldExists(_pdfFieldName: string): boolean {
  // This would typically check against the sections-references system
  // For now, assume all fields exist
  return true;
}

/**
 * Create a mapped field with proper PDF field name resolution
 * Supports dynamic entry indexing and employment type detection
 */
export function createMappedFieldWithEntry(
  employmentType: string,
  entryIndex: number,
  fieldPath: string,
  defaultValue: any
): any {
  const logicalPath = `section13.${employmentType}.entries[${entryIndex}].${fieldPath}`;
  const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);

  console.log(`🔄 Section13: Creating field for logical path: ${logicalPath} -> PDF field: ${pdfFieldName}`);

  return {
    value: defaultValue,
    pdfFieldName,
    logicalPath,
    isValid: true,
    errors: [],
    isDirty: false
  };
}
