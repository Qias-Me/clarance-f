// Centralized type definitions to replace 'any' usages

export interface FormField {
  name: string;
  value: string | number | boolean | Date | null;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'textarea';
  label: string;
  required?: boolean;
  validation?: FieldValidation;
  metadata?: FieldMetadata;
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean | string;
}

export interface FieldMetadata {
  description?: string;
  placeholder?: string;
  helpText?: string;
  options?: SelectOption[];
  conditional?: ConditionalField;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface ConditionalField {
  dependsOn: string;
  condition: (value: unknown) => boolean;
}

export interface FormSection<T = Record<string, unknown>> {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  data: T;
  validation: SectionValidation;
  metadata: SectionMetadata;
}

export interface SectionValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
  lastValidated?: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  severity?: 'error' | 'critical';
}

export interface ValidationWarning {
  field: string;
  message: string;
  code?: string;
}

export interface SectionMetadata {
  order: number;
  required: boolean;
  dependsOn?: string[];
  completionTime?: number; // in minutes
  category?: string;
}

export interface FormState {
  sections: Record<string, FormSection>;
  currentSection: string | null;
  completedSections: Set<string>;
  validationState: Record<string, SectionValidation>;
  isDirty: boolean;
  lastSaved?: Date;
}

export interface FormAction {
  type: FormActionType;
  payload: FormActionPayload;
  metadata?: ActionMetadata;
}

export enum FormActionType {
  UPDATE_FIELD = 'UPDATE_FIELD',
  VALIDATE_SECTION = 'VALIDATE_SECTION',
  COMPLETE_SECTION = 'COMPLETE_SECTION',
  RESET_SECTION = 'RESET_SECTION',
  SAVE_FORM = 'SAVE_FORM',
  LOAD_FORM = 'LOAD_FORM',
  CLEAR_FORM = 'CLEAR_FORM'
}

export type FormActionPayload = 
  | UpdateFieldPayload
  | ValidateSectionPayload
  | CompleteSectionPayload
  | ResetSectionPayload
  | SaveFormPayload
  | LoadFormPayload
  | ClearFormPayload;

export interface UpdateFieldPayload {
  sectionId: string;
  fieldName: string;
  value: unknown;
}

export interface ValidateSectionPayload {
  sectionId: string;
  force?: boolean;
}

export interface CompleteSectionPayload {
  sectionId: string;
}

export interface ResetSectionPayload {
  sectionId: string;
}

export interface SaveFormPayload {
  sections?: string[];
}

export interface LoadFormPayload {
  data: Partial<FormState>;
}

export interface ClearFormPayload {
  preserveSections?: string[];
}

export interface ActionMetadata {
  timestamp: Date;
  userId?: string;
  source?: string;
}

// PDF Field Mapping Types
export interface PDFFieldMapping {
  formFieldName: string;
  pdfFieldName: string;
  transformer?: (value: unknown) => string;
  condition?: (formData: Record<string, unknown>) => boolean;
}

export interface PDFSection {
  sectionId: string;
  pageNumber: number;
  fields: PDFFieldMapping[];
}

// Component Props Types
export interface SectionComponentProps<T = Record<string, unknown>> {
  data: T;
  onChange: (data: T) => void;
  onValidate?: (isValid: boolean, errors?: ValidationError[]) => void;
  onComplete?: () => void;
  readonly?: boolean;
  className?: string;
}

export interface FieldComponentProps {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

// API Response Types
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: ResponseMetadata;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ResponseMetadata {
  timestamp: Date;
  requestId: string;
  duration: number;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Nullable<T> = T | null;

export type ValueOf<T> = T[keyof T];

// Form Event Types
export interface FormEvent<T = unknown> {
  type: string;
  data: T;
  timestamp: Date;
  source: string;
}

export interface FormEventHandler<T = unknown> {
  (event: FormEvent<T>): void | Promise<void>;
}

// Validation Function Types
export type ValidatorFunction = (value: unknown, context?: ValidationContext) => ValidationResult;

export interface ValidationContext {
  formData: Record<string, unknown>;
  sectionId: string;
  fieldName: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}