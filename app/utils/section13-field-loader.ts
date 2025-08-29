/**
 * Section 13 Field Loader
 * Loads and processes field mappings for Section 13
 */

export interface Section13Field {
  id: string;
  name: string;
  value: string;
  page: number;
  label: string;
  type: 'PDFTextField' | 'PDFDropdown' | 'PDFCheckBox' | 'PDFRadioGroup';
  rect?: any;
}

export interface Section13Mapping {
  uiPath: string;
  pdfFieldId: string;
  confidence: number;
  page: number;
  label: string;
  type: string;
}

/**
 * Load Section 13 field definitions
 */
export async function loadSection13Fields(): Promise<Section13Field[]> {
  try {
    const response = await fetch('/api/sections-references/section-13.json');
    const data = await response.json();
    return data.fields || [];
  } catch (error) {
    console.error('Failed to load Section 13 fields:', error);
    // Return a subset of hardcoded fields as fallback
    return getHardcodedFields();
  }
}

/**
 * Load Section 13 field mappings
 */
export async function loadSection13Mappings(): Promise<Section13Mapping[]> {
  try {
    const response = await fetch('/integration/mappings/section-13-mappings.json');
    const data = await response.json();
    return data.mappings || [];
  } catch (error) {
    console.error('Failed to load Section 13 mappings:', error);
    return getHardcodedMappings();
  }
}

/**
 * Get hardcoded fields as fallback (subset of all 1086 fields)
 */
function getHardcodedFields(): Section13Field[] {
  return [
    // Military Employment fields
    {
      id: "10270 0 R",
      name: "form1[0].section_13_1-2[0].TextField11[0]",
      value: "sect13A.1Entry1SupervisorName",
      page: 17,
      label: "Provide the name of your supervisor.",
      type: "PDFTextField"
    },
    {
      id: "10269 0 R",
      name: "form1[0].section_13_1-2[0].TextField11[1]",
      value: "sect13A.1Entry1SupervisorRank",
      page: 17,
      label: "Provide the rank/position title of your supervisor.",
      type: "PDFTextField"
    },
    {
      id: "10268 0 R",
      name: "form1[0].section_13_1-2[0].p3-t68[0]",
      value: "sect13A.1Entry1SupervisorPhone",
      page: 17,
      label: "Provide supervisor's telephone number.",
      type: "PDFTextField"
    },
    // Federal Employment fields
    {
      id: "10287 0 R",
      name: "form1[0].section_13A_2[0].TextField12[0]",
      value: "sect13A.2Entry1_EmployerName",
      page: 18,
      label: "Provide employer name.",
      type: "PDFTextField"
    },
    {
      id: "10286 0 R",
      name: "form1[0].section_13A_2[0].TextField12[1]",
      value: "sect13A.2Entry1_PositionTitle",
      page: 18,
      label: "Provide your position title.",
      type: "PDFTextField"
    },
    // Non-Federal Employment fields
    {
      id: "10350 0 R",
      name: "form1[0].section_13B[0].TextField14[0]",
      value: "sect13B.1Entry1_EmployerName",
      page: 20,
      label: "Provide employer name.",
      type: "PDFTextField"
    },
    {
      id: "10351 0 R",
      name: "form1[0].section_13B[0].TextField14[1]",
      value: "sect13B.1Entry1_PositionTitle",
      page: 20,
      label: "Provide your position title.",
      type: "PDFTextField"
    },
    // Self-Employment fields
    {
      id: "10400 0 R",
      name: "form1[0].section_13C[0].TextField15[0]",
      value: "sect13C.Entry1_BusinessName",
      page: 22,
      label: "Provide business name.",
      type: "PDFTextField"
    },
    // Unemployment fields
    {
      id: "10450 0 R",
      name: "form1[0].section_13D[0].TextField16[0]",
      value: "sect13D.Entry1_Reason",
      page: 24,
      label: "Provide reason for unemployment.",
      type: "PDFTextField"
    },
    // Add checkbox examples
    {
      id: "10500 0 R",
      name: "form1[0].section_13_issues[0].CheckBox1[0]",
      value: "sect13_wasFired",
      page: 30,
      label: "Have you ever been fired from a job?",
      type: "PDFCheckBox"
    },
    // Add dropdown examples
    {
      id: "10550 0 R",
      name: "form1[0].section_13_branch[0].Dropdown1[0]",
      value: "sect13_militaryBranch",
      page: 17,
      label: "Select military branch",
      type: "PDFDropdown"
    }
  ];
}

/**
 * Get hardcoded mappings as fallback
 */
function getHardcodedMappings(): Section13Mapping[] {
  return [
    {
      uiPath: "section13.militaryEmployment.entries[0].supervisor.name",
      pdfFieldId: "form1[0].section_13_1-2[0].TextField11[0]",
      confidence: 1,
      page: 17,
      label: "Provide the name of your supervisor.",
      type: "PDFTextField"
    },
    {
      uiPath: "section13.militaryEmployment.entries[0].supervisor.title",
      pdfFieldId: "form1[0].section_13_1-2[0].TextField11[1]",
      confidence: 1,
      page: 17,
      label: "Provide the rank/position title of your supervisor.",
      type: "PDFTextField"
    },
    {
      uiPath: "section13.militaryEmployment.entries[0].supervisor.phone.number",
      pdfFieldId: "form1[0].section_13_1-2[0].p3-t68[0]",
      confidence: 0.8,
      page: 17,
      label: "Provide supervisor's telephone number.",
      type: "PDFTextField"
    },
    {
      uiPath: "section13.federalEmployment.entries[0].employerName",
      pdfFieldId: "form1[0].section_13A_2[0].TextField12[0]",
      confidence: 0.9,
      page: 18,
      label: "Provide employer name.",
      type: "PDFTextField"
    },
    {
      uiPath: "section13.federalEmployment.entries[0].positionTitle",
      pdfFieldId: "form1[0].section_13A_2[0].TextField12[1]",
      confidence: 0.9,
      page: 18,
      label: "Provide your position title.",
      type: "PDFTextField"
    },
    {
      uiPath: "section13.nonFederalEmployment.entries[0].employerName",
      pdfFieldId: "form1[0].section_13B[0].TextField14[0]",
      confidence: 0.9,
      page: 20,
      label: "Provide employer name.",
      type: "PDFTextField"
    },
    {
      uiPath: "section13.selfEmployment.entries[0].businessName",
      pdfFieldId: "form1[0].section_13C[0].TextField15[0]",
      confidence: 0.9,
      page: 22,
      label: "Provide business name.",
      type: "PDFTextField"
    },
    {
      uiPath: "section13.unemployment.entries[0].reason",
      pdfFieldId: "form1[0].section_13D[0].TextField16[0]",
      confidence: 0.9,
      page: 24,
      label: "Provide reason for unemployment.",
      type: "PDFTextField"
    },
    {
      uiPath: "section13.employmentRecordIssues.wasFired",
      pdfFieldId: "form1[0].section_13_issues[0].CheckBox1[0]",
      confidence: 0.95,
      page: 30,
      label: "Have you ever been fired from a job?",
      type: "PDFCheckBox"
    }
  ];
}

/**
 * Process and combine fields with mappings
 */
export function combineFieldsAndMappings(
  fields: Section13Field[], 
  mappings: Section13Mapping[]
): any[] {
  const mappingMap = new Map(mappings.map(m => [m.pdfFieldId, m]));
  
  return fields.map(field => {
    const mapping = mappingMap.get(field.name);
    return {
      ...field,
      uiPath: mapping?.uiPath || convertValueToUiPath(field.value),
      confidence: mapping?.confidence || 0.5,
      fieldType: getFieldType(field.type)
    };
  });
}

/**
 * Convert field value to UI path
 */
function convertValueToUiPath(value: string): string {
  if (!value) return '';
  
  // Simple conversion logic
  return value
    .replace(/sect13A\.1/, 'section13.militaryEmployment.')
    .replace(/sect13A\.2/, 'section13.federalEmployment.')
    .replace(/sect13B/, 'section13.nonFederalEmployment.')
    .replace(/sect13C/, 'section13.selfEmployment.')
    .replace(/sect13D/, 'section13.unemployment.')
    .replace(/Entry(\d+)/, 'entries[$1]');
}

/**
 * Get simplified field type
 */
function getFieldType(pdfType: string): 'text' | 'select' | 'checkbox' | 'radio' {
  switch (pdfType) {
    case 'PDFCheckBox': return 'checkbox';
    case 'PDFDropdown': return 'select';
    case 'PDFRadioGroup': return 'radio';
    default: return 'text';
  }
}