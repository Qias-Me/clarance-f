/**
 * Type definitions for Field Mapping Validation system
 */

export interface PageValidationResult {
  pageNumber: number;
  success: boolean;
  coverage: number; // Percentage 0-100
  totalFields: number;
  mappedFields: number;
  unmappedFields: number;
  errors: string[];
}

export interface FieldValidationStatus {
  pdfFieldName: string;
  uiFieldPath: string;
  isMapped: boolean;
  hasValue: boolean;
  expectedValue?: string;
  actualValue?: string;
  fieldType?: string;
  coordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface PageManifest {
  pageNumber: number;
  fieldCount: number;
  fields: FieldValidationStatus[];
  validationStatus: 'pending' | 'in-progress' | 'complete' | 'error';
  coverage: number;
  imagePath?: string;
}

export interface Section13PageMapping {
  page: number;
  fields: string[];
  description: string;
}

// Define which fields appear on which pages for Section 13
export const SECTION_13_PAGE_MAPPINGS: Section13PageMapping[] = [
  {
    page: 17,
    fields: [
      'sect13HasEmployment',
      'sect13HasGaps',
      'sect13GapExplanation',
      'sect13EmploymentType'
    ],
    description: 'Main employment questions and type selection'
  },
  {
    page: 18,
    fields: [
      'sect13A.1Entry1EmployerName',
      'sect13A.1Entry1PositionTitle',
      'sect13A.1Entry1RankTitle',
      'sect13A.1Entry1DutyStation'
    ],
    description: 'Military employment entry 1 - Basic info'
  },
  {
    page: 19,
    fields: [
      'sect13A.1Entry1SupervisorName',
      'sect13A.1Entry1SupervisorTitle',
      'sect13A.1Entry1SupervisorPhone',
      'sect13A.1Entry1SupervisorEmail'
    ],
    description: 'Military employment entry 1 - Supervisor info'
  },
  {
    page: 20,
    fields: [
      'sect13A.1Entry1FromDate',
      'sect13A.1Entry1ToDate',
      'sect13A.1Entry1EmploymentStatus',
      'sect13A.1Entry1OtherExplanation'
    ],
    description: 'Military employment entry 1 - Dates and status'
  },
  // Continue mapping for all Section 13 pages...
];

export interface ValidationWorkflowState {
  currentPage: number;
  totalPages: number;
  startPage: number;
  endPage: number;
  pageManifests: PageManifest[];
  overallCoverage: number;
  isComplete: boolean;
}

export interface FieldMappingReport {
  sectionNumber: number;
  sectionName: string;
  timestamp: Date;
  totalFields: number;
  mappedFields: number;
  unmappedFields: number;
  overallCoverage: number;
  pageReports: PageValidationResult[];
  unmappedFieldsList: string[];
  recommendations: string[];
}