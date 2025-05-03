// import { FieldType, ValidationState, ConfidenceLevel, ClassificationCategory } from '../enums/SF86DataEnums';
// import { ProcessingError, ErrorSummary } from './ErrorHandling'; // Import error types

// /**
//  * Represents the raw data extracted for a single field from the PDF.
//  */
// export interface RawPdfFieldData {
//   fieldName: string;
//   rawValue: string | null;
//   pageNumber: number;
//   coordinates?: { x: number; y: number; width: number; height: number }; // Optional bounding box
// }

// /**
//  * Represents a field after initial normalization and type conversion.
//  */
// export interface NormalizedFieldData {
//   fieldName: string;
//   originalFieldName?: string; // If name was changed/mapped
//   value: string | number | boolean | Date | string[] | null;
//   fieldType: FieldType;
//   sourcePage: number;
//   sourceRawValue: string | null;
// }

// /**
//  * Represents the classification assigned to a field.
//  */
// export interface FieldClassification {
//   fieldName: string;
//   category: ClassificationCategory;
//   subCategory?: string; // Optional finer classification
// }

// /**
//  * Represents the confidence score assigned to a field's extraction or validation.
//  */
// export interface ConfidenceScore {
//   fieldName: string;
//   score: number; // e.g., 0 to 1
//   level: ConfidenceLevel;
//   reason?: string; // Optional explanation for the score
// }

// /**
//  * Represents a single validation check result for a field or group of fields.
//  */
// export interface ValidationResult {
//   validationRuleId: string;
//   targetFields: string[]; // Field(s) being validated
//   state: ValidationState;
//   message: string;
//   details?: any; // Additional context
// }

// /**
//  * Represents the overall structure of the processed SF-86 application data.
//  * This is a high-level structure; specific sections will need detailed interfaces.
//  */
// export interface StructuredApplicationData {
//   metadata: {
//     formVersion: string;
//     processingDate: Date;
//     sourceFileName: string;
//     processingTimeMs?: number; // Optional: track processing time
//   };
//   sections: {
//     [sectionName: string]: { // e.g., 'PersonalInformation', 'EmploymentHistory'
//       [fieldName: string]: NormalizedFieldData & { // Combine normalized data
//         classification?: FieldClassification;
//         confidence?: ConfidenceScore;
//         validationResults?: ValidationResult[];
//         fieldLevelErrors?: ProcessingError[]; // Errors specific to this field
//       };
//     };
//   };
//   overallValidationStatus: ValidationState;
//   processingErrors: ProcessingError[]; // Document-level errors
//   errorSummary?: ErrorSummary; // Optional summary of all errors
//   // Could add specific section interfaces later, e.g.:
//   // personalInformation: PersonalInformationSection;
//   // employmentHistory: EmploymentHistorySection;
// }

// /**
//  * Represents a report mapping raw PDF fields to normalized/structured data fields.
//  */
// export interface MappingReport {
//   rawField: RawPdfFieldData;
//   normalizedField?: NormalizedFieldData;
//   structuredFieldLocation?: string; // e.g., 'sections.PersonalInformation.FullName'
//   mappingConfidence?: ConfidenceLevel;
//   issues?: string[];
// }

// // --- Placeholder for more detailed Section Interfaces (Example) ---
// // interface PersonalInformationSection {
// //   FullName: NormalizedFieldData;
// //   DateOfBirth: NormalizedFieldData;
// //   // ... other fields
// // } 