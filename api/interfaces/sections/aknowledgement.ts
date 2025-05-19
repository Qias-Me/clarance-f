import {type Field } from "../formDefinition";

/**
 * Interface for Section 4 (Social Security Number) data
 * 
 * This interface represents the data structure for the Acknowledgement Information
 * section of the SF-86 form, which includes the Social Security Number (SSN) fields
 * and related data.
 * 
 * The main fields are:
 * - aknowledge: Acknowledgement of information accuracy
 * - ssn: The primary Social Security Number field
 * - notApplicable: Checkbox for when SSN is not applicable
 * - pageSSN: Array of SSN fields that appear at the bottom of each page
 * - sectionMetadata: Additional metadata about the section
 */
interface AknowledgeInfo {
  aknowledge: Field<"YES" | "NO">;
  ssn?: Field<string>;
  notApplicable: Field<"Yes" | "No">;
  pageSSN: PageSSN[];
  sectionMetadata?: SectionMetadata;
}

/**
 * Interface for SSN fields that appear at the bottom of each page
 * 
 * Each page of the SF-86 form contains an SSN field at the bottom
 * that is automatically populated based on the main SSN entry.
 */
interface PageSSN {
  ssn: Field<string>;
}

/**
 * Additional metadata for Section 4
 * 
 * This interface contains supplementary information about the
 * Social Security Number section, including section numbering
 * and contextual information.
 */
interface SectionMetadata {
  sectionNumber: number;
  sectionTitle: string;
  ssnFormatExample: Field<string>;
}

export type { AknowledgeInfo, PageSSN, SectionMetadata };
