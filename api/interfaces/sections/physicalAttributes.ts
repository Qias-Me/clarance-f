import {type Field } from "../formDefinition";

/**
 * Interface for Section 6: Physical Attributes (Your Identifying Information)
 * 
 * This interface captures physical characteristics data such as height, weight,
 * hair color, eye color, and gender for the SF-86 form.
 */
interface PhysicalAttributes {
  /**
   * Height in feet (1-9)
   */
  heightFeet: Field<string>;
  
  /**
   * Height in inches (0-11)
   */
  heightInch: Field<string>;
  
  /**
   * Weight in pounds
   */
  weight: Field<string>;
  
  /**
   * Hair color (e.g., Black, Brown, Blonde, Red, etc.)
   */
  hairColor: Field<string>;
  
  /**
   * Eye color (e.g., Blue, Brown, Green, etc.)
   */
  eyeColor: Field<string>;
  
  /**
   * Gender (Male or Female)
   */
  gender: Field<'Male' | 'Female'>;

  /**
   * Additional metadata about the section
   */
  sectionMetadata?: SectionMetadata;
}

/**
 * Metadata about the Physical Attributes section
 */
interface SectionMetadata {
  /**
   * Section number (6)
   */
  sectionNumber: number;
  
  /**
   * Section title
   */
  sectionTitle: string;
  
  /**
   * Last updated timestamp
   */
  lastUpdated?: string;
}

export type { PhysicalAttributes, SectionMetadata };