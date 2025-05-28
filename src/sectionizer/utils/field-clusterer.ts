/**
 * Field clustering for SF-86 form fields
 *
 * This module implements advanced field clustering based on naming conventions
 * to help identify groups of related fields that should be processed together.
 */

import type { CategorizedField } from "./extractFieldsBySection.js";
import chalk from "chalk";

/**
 * Estimated field counts per section based on PDF analysis and manual review
 * Key is the section number, value is the expected number of fields
 * the entires and subsections are not yet implemented
 * the fields are still a bit scewed.
 */
export const expectedFieldCounts: Record<
  number,
  { fields: number; entries: number; subsections: number }
> = {
  1: { fields: 4, entries: 0, subsections: 0 },
  2: { fields: 2, entries: 0, subsections: 0 },
  3: { fields: 4, entries: 0, subsections: 0 },
  4: { fields: 138, entries: 0, subsections: 0 },
  5: { fields: 45, entries: 4, subsections: 0 },
  6: { fields: 6, entries: 0, subsections: 0 },
  7: { fields: 17, entries: 0, subsections: 0 },
  8: { fields: 10, entries: 0, subsections: 0 },
  9: { fields: 78, entries: 0, subsections: 0 },
  10: { fields: 122, entries: 0, subsections: 4 },
  11: { fields: 252, entries: 0, subsections: 0 },
  12: { fields: 150, entries: 0, subsections: 0 },
  13: { fields: 1086, entries: 0, subsections: 0 },
  14: { fields: 5, entries: 0, subsections: 0 },
  15: { fields: 95, entries: 0, subsections: 0 },
  16: { fields: 154, entries: 0, subsections: 0 },
  17: { fields: 332, entries: 0, subsections: 0 },
  18: { fields: 964, entries: 0, subsections: 0 },
  19: { fields: 277, entries: 0, subsections: 0 },
  20: { fields: 790, entries: 0, subsections: 0 },
  21: { fields: 486, entries: 0, subsections: 0 },
  22: { fields: 267, entries: 0, subsections: 0 },
  23: { fields: 191, entries: 0, subsections: 0 },
  24: { fields: 160, entries: 0, subsections: 0 },
  25: { fields: 79, entries: 0, subsections: 0 },
  26: { fields: 237, entries: 0, subsections: 0 },
  27: { fields: 57, entries: 0, subsections: 0 },
  28: { fields: 23, entries: 0, subsections: 0 },
  29: { fields: 141, entries: 0, subsections: 0 },
  30: { fields: 25, entries: 0, subsections: 0 },
};

// Import section field patterns
export const sectionFieldPatterns: Record<number, RegExp[]> = {
  1: [
    /form1\[0\]\.Sections1-6\[0\]\.TextField11\[0\]/i, // Last name
    /form1\[0\]\.Sections1-6\[0\]\.TextField11\[1\]/i, // First name
    /form1\[0\]\.Sections1-6\[0\]\.TextField11\[2\]/i, // Middle name
    /form1\[0\]\.Sections1-6\[0\]\.suffix\[0\]/i, // Name suffix
  ],
  2: [
    /form1\[0\]\.Sections1-6\[0\]\.From_Datefield_Name_2\[0\]/i, // Date of Birth field
    /form1\[0\]\.Sections1-6\[0\]\.#field\[18\]/i, // Second DOB field
  ],
  3: [
    /form1\[0\]\.Sections1-6\[0\]\.TextField11\[3\]/i, // Birth city
    /form1\[0\]\.Sections1-6\[0\]\.TextField11\[4\]/i, // Birth county
    /form1\[0\]\.Sections1-6\[0\]\.School6_State\[0\]/i, // Birth state
    /form1\[0\]\.Sections1-6\[0\]\.DropDownList1\[0\]/i,
  ],
  4: [
    // CRITICAL: ALL SSN fields should go to Section 4, regardless of their location in the form
    // These patterns have HIGHEST PRIORITY and override any section-specific patterns
    /\.SSN\[\d+\]/i,                                    // Basic SSN pattern - catches any .SSN[0], .SSN[1], etc.
    /form1\[0\]\.Sections1-6\[0\]\.SSN\[\d+\]/i,       // Sections1-6 SSN fields
    /form1\[0\]\.Sections7-9\[0\]\.SSN\[\d+\]/i,       // Sections7-9 SSN fields
    /form1\[0\]\.Section\d+.*\.SSN\[\d+\]/i,           // Any Section with SSN (e.g., Section18_3[5].SSN[0])
    /form1\[0\]\.section\d+.*\.SSN\[\d+\]/i,           // Any section with SSN (lowercase)
    /form1\[0\]\.#subform\[\d+\]\.SSN\[\d+\]/i,        // Subform SSN fields
    /form1\[0\]\.#subform\[\d+\]\.#subform\[\d+\]\.SSN\[\d+\]/i, // Nested subform SSN
    /form1\[0\]\.continuation\d*\[0\]\.SSN\[\d+\]/i,   // Continuation SSN fields
    /form1\[0\]\.Section_\d+.*\.SSN\[\d+\]/i,          // Section_ format SSN fields

    // SPECIFIC: Handle the exact patterns that are being missed
    /form1\[0\]\.Section18_3\[5\]\.SSN\[0\]/i,         // Specific field: form1[0].Section18_3[5].SSN[0]
    /form1\[0\]\.Section18_\d+\[\d+\]\.SSN\[\d+\]/i,   // All Section18_X[Y].SSN[Z] patterns
    /form1\[0\]\.Section\d+_\d+\[\d+\]\.SSN\[\d+\]/i,  // All SectionX_Y[Z].SSN[W] patterns

    // Original Section 4 specific patterns (non-SSN)
    /form1\[0\]\.Sections1-6\[0\]\.CheckBox1\[0\]/i,
    /form1\[0\]\.Sections1-6\[0\]\.RadioButtonList\[0\]/i,
  ],
  5: [
    /\.section5\[(\d+)\]\.TextField11\[(\d+)\]/i,
    /\.section5\[(\d+)\]\.#area\[(\d+)\]\.From_Datefield_Name_2\[(\d+)\]/i,
    /Sections1-6\[\d+\]\.section5\[(\d+)\]\.([^[]+)(?:\[(\d+)\])?/i,
    /Sections1-6\[\d+\]\.section5\[\d+\]\.TextField11\[(\d+)\]/i,
    /Sections1-6\[\d+\]\.section5\[\d+\]\.#area\[\d+\]\.From_Datefield_Name_2\[(\d+)\]/i,
    /form1\[0\]\.Sections1-6\[0\]\.section5\[0\]/,
  ],
  6: [
    // STRICT: Only these 6 specific fields should be in section 6
    /form1\[0\]\.Sections1-6\[0\]\.DropDownList7\[0\]/i, // Height in inches
    /form1\[0\]\.Sections1-6\[0\]\.DropDownList8\[0\]/i, // Height in feets
    /form1\[0\]\.Sections1-6\[0\]\.DropDownList9\[0\]/i, // Eye color
    /form1\[0\]\.Sections1-6\[0\]\.DropDownList10\[0\]/i, // Hair color
    /form1\[0\]\.Sections1-6\[0\]\.p3-rb3b\[0\]/i, // Sex Male or Female
    /form1\[0\]\.Sections1-6\[0\]\.TextField11\[5\]/i, // Wieght in pounds
  ],
  7: [
    /form1\[0\]\.Sections7-9\[0\]\.p3-t68\[3\]/i, // Phone number field

    // CRITICAL: Specific pattern for the field mentioned by user
    /form1\[0\]\.Sections7-9\[0\]\.#field\[35\]/i, // Specific field that was being incorrectly assigned to Section 1


    // Specific patterns for Section 7 (Your Contact Information)
    /form1\[0\]\.Sections7-9\[0\]\.p3-t68\[2\]/i,
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[13\]/i, // Home Email
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[14\]/i, // Work Email - FIXED MISSING PATTERN
    /form1\[0\]\.Sections7-9\[0\]\.p3-t68\[1\]/i, // Phone number field
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[1\]/i, // Extension field
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[2\]/i, // Additional phone field
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[3\]/i, // Additional contact field
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[4\]/i, // Additional contact field
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[5\]/i, // Additional contact field
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[6\]/i, // Additional contact field
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[7\]/i, // Additional contact field
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[8\]/i, // Additional contact field
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[9\]/i, // Additional contact field
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[10\]/i, // Additional contact field
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[11\]/i, // Additional contact field
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[12\]/i, // Additional contact field
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[15\]/i, // Extension fields for contact info
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[16\]/i, // Extension fields for contact info
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[17\]/i, // Extension fields for contact info

  ],
  8: [
    /form1\[0\]\.Sections7-9\[0\]\.#area\[0\]\.From_Datefield_Name_2\[0\]/i,
    /form1\[0\]\.Sections7-9\[0\]\.#area\[0\]\.To_Datefield_Name_2\[0\]/i,
    /form1\[0\]\.Sections7-9\[0\]\.#area\[0\]\.#field\[4\]/i,
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[0\]/i,
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[1\]/i,
    /form1\[0\]\.Sections7-9\[0\]\.RadioButtonList\[0\]/i, // Passport eligibility question
    /form1\[0\]\.Sections7-9\[0\]\.#field\[23\]/i, // Passport estimate checkbox (spatially positioned in passport area)
    /form1\[0\]\.Sections7-9\[0\]\.p3-t68\[0\]/i,
  ],
  9: [
    /form1\[0\]\.Sections7-9\[0\]\.#field\[(?!4\])\d+\]/i, // All #field except [4] which goes to Section 8
    /form1\[0\]\.Sections7-9\[0\]\.#field\[25\]/i, // Citizenship-related estimate checkbox (spatially near citizenship fields)
    /form1\[0\]\.Sections7-9\[0\]\.#field\[28\]/i, // Citizenship-related estimate checkbox (spatially positioned in citizenship area)
    /form1\[0\]\.Sections7-9\[0\]\.RadioButtonList\[1\]/i, // Citizenship status question
    /form1\[0\]\.Sections7-9\[0\]\.Section9/i,
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[18\]/i, // Work Email
    /form1\[0\]\.Sections7-9\[0\]\.School6_State\[0\]/i, // Citizenship documentation state
    /form1\[0\]\.Sections7-9\[0\]\.RadioButtonList\[2\]/i, // Citizenship status questions
    /form1\[0\]\.Sections7-9\[0\]\.RadioButtonList\[3\]/i, // Citizenship documentation type
    /form1\[0\]\.Section9\.1-9\.4\[0\]\./i,
  ],
  11: [
    /form1\[0\]\.Section11/i
  ],
  // Section 12 (Education - Where you went to School)
  12: [
    /form1\[0\]\.section_12_2\[0\]\.Table1\[0\]\.Row1\[0\]\.Cell4\[0\]/i,
    /form1\[0\]\.section_12/i,
    // CRITICAL: Main section_12[0] container - highest priority
    /form1\[0\]\.section_12\[0\]\./i, // All fields under section_12[0] must be Section 12
    // Specific section_12 patterns (most reliable)
    /form1\[0\]\.section_12_1\[0\]/i,
    /form1\[0\]\.section_12_2\[0\]/i,
    /form1\[0\]\.section_12_3\[0\]/i,
    /form1\[0\]\.section_12_4\[0\]/i,
    /form1\[0\]\.section_12_5\[0\]/i,
    // Specific field patterns that are being miscategorized as Section 9
    /form1\[0\]\.section_12\[0\]\.pg10r2\[0\]/i, // Radio button fields
    /form1\[0\]\.section_12\[0\]\.pg10r4\[0\]/i, // Radio button fields
    /form1\[0\]\.section_12\[0\]\.pg2r5\[0\]/i, // Radio button fields
    /form1\[0\]\.section_12\[0\]\.From_Datefield_Name_2\[\d+\]/i, // Date fields
    /form1\[0\]\.section_12\[0\]\.TextField11\[\d+\]/i, // Text fields
    /form1\[0\]\.section_12\[0\]\.School6_State\[\d+\]/i, // State dropdown fields
    /form1\[0\]\.section_12\[0\]\.DropDownList28\[\d+\]/i, // Country dropdown fields
    /form1\[0\]\.section_12\[0\]\.#field\[\d+\]/i, // Generic field patterns
    // Table patterns specific to Section 12 education entries
    /form1\[0\]\.section_12_\d+\[0\]\.Table1\[0\]\.Row\d+\[0\]\.Cell\d+\[0\]/i,
    // Value-based patterns for Section 12 content
    /sect12/i, // Fields with sect12 values
    // ENHANCED: More specific education patterns to reduce over-assignment from #subform
    /\beducation\b/i,
    /\bschool\b/i,
    /\bcollege\b/i,
    /\buniversity\b/i,
    /\bdegree\b/i,
    /\bdiploma\b/i,
    /\bgraduate\b/i,
    /\bstudent\b/i,
    /\bacademic\b/i,
    /educational.*institution/i,
    // SPECIFIC: Only #subform fields that are clearly education-related and on correct pages
    /form1\[0\]\.#subform\[\d+\]\..*school/i,
    /form1\[0\]\.#subform\[\d+\]\..*education/i,
    /form1\[0\]\.#subform\[\d+\]\..*college/i,
    /form1\[0\]\.#subform\[\d+\]\..*university/i,
    /form1\[0\]\.#subform\[\d+\]\..*degree/i,
  ],
  // Add patterns for section 13 (Employment)
  13: [
    /form1\[0\]\.Section13/i,
    /form1\[0\]\.section13/i,
  ],
  // CRITICAL: Section 15 patterns MUST be processed BEFORE Section 14 patterns
  // This ensures most Section14_1 fields are captured by Section 15 (Military History)
  // before Section 14 (Selective Service) gets a chance to see them
  15: [
    // Section 15 (Military History) - should include most Section14_1 fields
    /form1\[0\]\.Section15/i, // Direct Section15 references
    // COMPREHENSIVE Section14_1 patterns that should go to Section 15 (Military History)
    // These patterns will capture most Section14_1 fields BEFORE Section 14 sees them

    // SPECIFIC: The field user mentioned should go to Section 15
    /form1\[0\]\.Section14_1\[0\]\.#area\[16\]\.From_Datefield_Name_2\[4\]/i, // SPECIFIC: The field user mentioned

    // All #area patterns except the one reserved for Section 14
    /form1\[0\]\.Section14_1\[0\]\.#area\[1\]/i, // #area[1] and above go to Section 15
    /form1\[0\]\.Section14_1\[0\]\.#area\[2\]/i,
    /form1\[0\]\.Section14_1\[0\]\.#area\[3\]/i,
    /form1\[0\]\.Section14_1\[0\]\.#area\[4\]/i,
    /form1\[0\]\.Section14_1\[0\]\.#area\[5\]/i,
    /form1\[0\]\.Section14_1\[0\]\.#area\[6\]/i,
    /form1\[0\]\.Section14_1\[0\]\.#area\[7\]/i,
    /form1\[0\]\.Section14_1\[0\]\.#area\[8\]/i,
    /form1\[0\]\.Section14_1\[0\]\.#area\[9\]/i,
    /form1\[0\]\.Section14_1\[0\]\.#area\[1[0-6]\]/i, // #area[10-16] (EXCLUDING #area[17])
    /form1\[0\]\.Section14_1\[0\]\.#area\[1[8-9]\]/i, // #area[18-19] (EXCLUDING #area[17])
    /form1\[0\]\.Section14_1\[0\]\.#area\[2\d+\]/i, // #area[20] and above

    // All TextField11 patterns except [0], [1], and [2] reserved for Section 14
    // EXCLUDE TextField11[2] - this belongs to Section 14
    /form1\[0\]\.Section14_1\[0\]\.TextField11\[3\]/i,
    /form1\[0\]\.Section14_1\[0\]\.TextField11\[4\]/i,
    /form1\[0\]\.Section14_1\[0\]\.TextField11\[5\]/i,
    /form1\[0\]\.Section14_1\[0\]\.TextField11\[6\]/i,
    /form1\[0\]\.Section14_1\[0\]\.TextField11\[7\]/i,
    /form1\[0\]\.Section14_1\[0\]\.TextField11\[8\]/i,
    /form1\[0\]\.Section14_1\[0\]\.TextField11\[9\]/i,
    /form1\[0\]\.Section14_1\[0\]\.TextField11\[1\d+\]/i, // TextField11[10] and above
    /form1\[0\]\.Section14_1\[0\]\.TextField11\[2\d+\]/i, // TextField11[20] and above

    // All #field patterns except [24] and [25] reserved for Section 14
    /form1\[0\]\.Section14_1\[0\]\.#field\[0\]/i, // #field[0] to [23] go to Section 15
    /form1\[0\]\.Section14_1\[0\]\.#field\[1\]/i,
    /form1\[0\]\.Section14_1\[0\]\.#field\[2\]/i,
    /form1\[0\]\.Section14_1\[0\]\.#field\[3\]/i,
    /form1\[0\]\.Section14_1\[0\]\.#field\[4\]/i,
    /form1\[0\]\.Section14_1\[0\]\.#field\[5\]/i,
    /form1\[0\]\.Section14_1\[0\]\.#field\[6\]/i,
    /form1\[0\]\.Section14_1\[0\]\.#field\[7\]/i,
    /form1\[0\]\.Section14_1\[0\]\.#field\[8\]/i,
    /form1\[0\]\.Section14_1\[0\]\.#field\[9\]/i,
    /form1\[0\]\.Section14_1\[0\]\.#field\[1\d+\]/i, // #field[10-19]
    /form1\[0\]\.Section14_1\[0\]\.#field\[2[0-3]\]/i, // #field[20-23]
    /form1\[0\]\.Section14_1\[0\]\.#field\[2[6-9]\]/i, // #field[26-29]
    /form1\[0\]\.Section14_1\[0\]\.#field\[3\d+\]/i, // #field[30] and above

    // All other Section14_1 field types go to Section 15 (EXCLUDING Section 14 specific fields)
    /form1\[0\]\.Section14_1\[0\]\.From_Datefield_Name_2\[\d+\]/i, // Military service dates
    /form1\[0\]\.Section14_1\[0\]\.To_Datefield_Name_2\[\d+\]/i, // Military service end dates
    /form1\[0\]\.Section14_1\[0\]\.DropDownList\[\d+\]/i, // Military dropdown fields
    /form1\[0\]\.Section14_1\[0\]\.CheckBox\[\d+\]/i, // Military checkboxes
    /form1\[0\]\.Section14_1\[0\]\.NumericField\[\d+\]/i, // Military numeric fields
    /form1\[0\]\.Section14_1\[0\]\.School6_State\[\d+\]/i, // CRITICAL: School6_State fields belong to Section 15 (Military History)
    /form1\[0\]\.Section14_1\[0\]\.RadioButtonList\[1\]/i, // RadioButtonList[1] and above (EXCLUDING RadioButtonList[0] and RadioButtonList[10])
    /form1\[0\]\.Section14_1\[0\]\.RadioButtonList\[2\]/i,
    /form1\[0\]\.Section14_1\[0\]\.RadioButtonList\[3\]/i,
    /form1\[0\]\.Section14_1\[0\]\.RadioButtonList\[4\]/i,
    /form1\[0\]\.Section14_1\[0\]\.RadioButtonList\[5\]/i,
    /form1\[0\]\.Section14_1\[0\]\.RadioButtonList\[6\]/i,
    /form1\[0\]\.Section14_1\[0\]\.RadioButtonList\[7\]/i, // Specific RadioButtonList patterns (EXCLUDING 0 and 10)
    /form1\[0\]\.Section14_1\[0\]\.RadioButtonList\[8\]/i,
    /form1\[0\]\.Section14_1\[0\]\.RadioButtonList\[9\]/i,
    /form1\[0\]\.Section14_1\[0\]\.RadioButtonList\[11\]/i, // RadioButtonList[11] and above
    /form1\[0\]\.Section14_1\[0\]\.RadioButtonList\[1[2-9]\]/i, // RadioButtonList[12-19]
    /form1\[0\]\.Section14_1\[0\]\.RadioButtonList\[2\d+\]/i, // RadioButtonList[20] and above
    // EXCLUDE TextField11[0], TextField11[1], TextField11[2] - these belong to Section 14
    /form1\[0\]\.Section14_1\[0\]\.TextField11\[3\]/i, // TextField11[3] and above go to Section 15
    /form1\[0\]\.Section14_1\[0\]\.TextField11\[[4-9]\]/i, // TextField11[4-9]
    /form1\[0\]\.Section14_1\[0\]\.TextField11\[1\d+\]/i, // TextField11[10] and above
    // EXCLUDE #area[0].RadioButtonList[0] and #area[17].RadioButtonList[10] - these belong to Section 14
    /form1\[0\]\.Section14_1\[0\]\.#area\[1\](?!\d)/i, // #area[1] ONLY (not #area[10-19])
    /form1\[0\]\.Section14_1\[0\]\.#area\[[2-9]\](?!\d)/i, // #area[2-9] ONLY (not #area[20-99])
    /form1\[0\]\.Section14_1\[0\]\.#area\[1[0-6]\]/i, // #area[10-16] (EXCLUDING #area[17])
    /form1\[0\]\.Section14_1\[0\]\.#area\[1[8-9]\]/i, // #area[18-19]
    /form1\[0\]\.Section14_1\[0\]\.#area\[2\d+\]/i, // #area[20] and above
    // EXCLUDE #field[24] and #field[25] - these should go to Section 15 (Military History)
    /form1\[0\]\.Section14_1\[0\]\.#field\[24\]/i, // #field[24] goes to Section 15
    /form1\[0\]\.Section14_1\[0\]\.#field\[25\]/i, // #field[25] goes to Section 15
  ],
  14: [
    // STRICT: Only these 5 specific fields should remain in Section 14 (Selective Service)
    // All other Section14_1 fields should be captured by Section 15 above
    /form1\[0\]\.Section14_1\[0\]\.#area\[0\]\.RadioButtonList\[0\]/i, // 1. Main selective service question
    /form1\[0\]\.Section14_1\[0\]\.TextField11\[0\]/i, // 2. Selective service number
    /form1\[0\]\.Section14_1\[0\]\.TextField11\[1\]/i, // 3. Additional selective service field
    /form1\[0\]\.Section14_1\[0\]\.TextField11\[2\]/i, // 4. Additional selective service field
    /form1\[0\]\.Section14_1\[0\]\.#area\[17\]\.RadioButtonList\[10\]/i, // 5. Additional selective service field
  ],
  // Section 18 (Relatives) - ENHANCED: Removed overly broad #subform patterns
  // #subform fields will now be handled by enhanced categorization logic
  18: [
    /form1\[0\]\.Section18/i,
    /form1\[0\]\.section18/i,


    // Section 18 specific content patterns
    /sect18/i,
    /section_18/i,


  ],
  // Add patterns for section 16 (References)
  16: [
    /references/i,
    /people who know/i,
    /know (you )?well/i,
    /verifiers?/i,
    /form1\[0\]\.Section16/i,
    /form1\[0\]\.section16/i,
    /reference\d+/i,
    /section ?16/i,
    /\bsect ?16\b/i,
  ],
  // Add patterns for section 17 (Marital/Relationship Status)
  17: [
    /form1\[0\]\.Section17/i,
    /form1\[0\]\.section17/i,
    /marital/i,
    /relationship/i,
    /spouse/i,
    /cohabitant/i,
    /partner/i,
  ],
  20: [
    /form1\[0\]\.Section20/i,
    /form1\[0\]\.section20/i,
    // ENHANCED: More specific Section 20 patterns for foreign business/government activities
    /foreign.*business/i,
    /foreign.*government/i,
    /foreign.*activity/i,
    /foreign.*activities/i,
    /foreignbus/i,
    /foreigngov/i,
    /overseas.*business/i,
    /international.*business/i,
    /diplomatic/i,
    /embassy/i,
    /consulate/i,
    // Only include fields that are clearly foreign business/government related
  ],

  // Adding more accurate patterns for other sections
  29: [
    /association/i,
    /organization/i,
    /membership/i,
    /^form1\[0\]\.Section29/i,
  ],
  30: [
    // ENHANCED: Section 30 (Continuation Space) patterns
    /form1\[0\]\.continuation/i,
    /form1\[0\]\.Section30/i,
    /form1\[0\]\.section30/i,
    /continuation/i,
    /additional.*information/i,
    /comments/i,
    /remarks/i,
    /notes/i,
    /supplemental/i,
    /overflow/i,
    // Catch-all patterns for unclassified fields that should go to continuation
    /form1\[0\]\.#subform\[\d+\]\..*unclassified/i,
  ],
};

// Define section keywords for content matching
export const sectionKeywords: Record<number, string[]> = {
  1: ["name", "last", "first", "middle", "suffix"],
  2: ["birth", "dob", "date of birth"],
  3: ["place of birth", "city", "county", "country"],
  4: ["ssn", "social security", "number"],
  5: ["other names", "used", "maiden", "nickname"],
  6: ["height", "weight", "hair", "eye", "color", "sex", "gender"],
  7: ["phone", "email", "address", "contact"],
  8: ["passport", "travel", "document", "expiration"],
  9: ["citizenship", "nationality", "birth", "citizen"],
  10: ["dual", "multiple", "citizenship", "foreign", "passport"],
  11: ["residence", "address", "lived", "own", "rent"],
  12: ["education", "school", "college", "university", "degree"],
  13: ["employment", "employer", "job", "work", "position"],
  14: ["selective", "service", "register", "registration"],
  15: [
    "military",
    "service",
    "army",
    "navy",
    "air force",
    "marines",
    "coast guard",
  ],
  16: ["people", "know", "references", "verifier", "verifiers"],
  17: ["marital", "relationship", "spouse", "cohabitant", "partner"],
  18: [
    "relatives",
    "family",
    "father",
    "mother",
    "sibling",
    "child",
    "children",
  ],
  19: ["foreign", "contact", "contacts", "relationship", "allegiance"],
  20: ["foreign", "activity", "activities", "business", "government"],
  21: ["psychological", "mental", "health", "counseling", "treatment"],
  22: ["police", "record", "arrest", "criminal", "offense"],
  23: ["drug", "illegal", "controlled", "substance", "misuse"],
  24: ["alcohol", "abuse", "treatment", "counseling"],
  25: ["investigation", "clearance", "security", "classified"],
  26: ["financial", "debt", "bankruptcy", "delinquent", "taxes"],
  27: ["technology", "computer", "unauthorized", "illegal", "system"],
  28: ["civil", "court", "action", "lawsuit", "legal"],
  29: ["association", "record", "organization", "membership", "terror"],
  30: ["continuation", "additional", "information", "comments"],
};

// Add this section structure definition to replace the existing mapping
export const sectionStructure: Record<number, string[]> = {
  0: ["Unknown"],
  1: ["Full Name"],
  2: ["Date of Birth"],
  3: ["Place of Birth"],
  4: ["Social Security Number"],
  5: ["Other Names Used"],
  6: ["Your Identifying Information"],
  7: ["Your Contact Information"],
  8: ["U.S. Passport Information"],
  9: ["Citizenship"],
  10: ["Dual/Multiple Citizenship & Foreign Passport Info"],
  11: ["Where You Have Lived"],
  12: ["Where you went to School"],
  13: ["Employment Acitivites"],
  14: ["Selective Service"],
  15: ["Military History"],
  16: ["People Who Know You Well"],
  17: ["Maritial/Relationship Status"],
  18: ["Relatives"],
  19: ["Foreign Contacts"],
  20: ["Foreign Business, Activities, Government Contacts"],
  21: ["Psycological and Emotional Health"],
  22: ["Police Record"],
  23: ["Illegal Use of Drugs and Drug Activity"],
  24: ["Use of Alcohol"],
  25: ["Investigations and Clearance"],
  26: ["Financial Record"],
  27: ["Use of Information Technology Systems"],
  28: ["Involvement in Non-Criminal Court Actions"],
  29: ["Association Record"],
  30: ["Continuation Space"],
};

/**
 * Patterns for extracting subsection information from field names
 * Used to identify which fields belong to specific subsections within a section
 */
export const subsectionPatterns: Record<number, RegExp[]> = {
  // Generic patterns that apply to multiple sections
  0: [
    // Generic subsection patterns that can be used as fallback
    /[Ss]ection(\d+)[-_](\d+)/,
    /[Ss]ection(\d+)\.(\d+)/i,
    /\[SubSection[_-]?(\w+)\]/i,
    // Pattern: Section17_1_2 (section 17, subsection 1, entry 2)
    /section(\d+)_(\d+)_(\d+)/i,
    // Pattern: Section17_1 (section 17, subsection 1)
    /section(\d+)_(\d+)(?![_\d])/i,
  ],
  // Section-specific subsection patterns
  1: [],
  2: [],
  3: [],
  4: [
    // SSN fields in Section 4
    /\.SSN\[(\d+)\]/i,
    // RadioButtonList in Sections1-6 format (Section 4)
    /Sections1-6\[\d+\]\.RadioButtonList\[\d+\]/i,
  ],
  5: [
    // Section 5 control fields (radio/checkbox)
    /(Sections1-6|\.)section5[\[\.].*?(Radio|YES|NO)/i,
  ],
  6: [],
  7: [],
  8: [],
  9: [],
  10: [],
  11: [],
  12: [],
  13: [],
  14: [],
  15: [],
  16: [],
  17: [],
  18: [],
  19: [],
  20: [
    // Foreign activities subsections
    /foreign[._-]?activity[._-]?(\d+)/i,
    /foreign[._-]?government[._-]?(\d+)/i,
  ],
  21: [],
  22: [],
  23: [],
  24: [],
  25: [],
  26: [],
  27: [],
  28: [],
  29: [],
  30: [],
};

/**
 * Patterns for extracting entry information from field names
 * Used to identify which fields belong to numbered entries within a section or subsection
 */
export const entryPatterns: Record<number, RegExp[]> = {
  // Generic patterns that apply to multiple sections
  0: [
    // Generic entry patterns for all sections
    /\[(\d+)\]/,
    /entry[-_]?(\d+)/i,
    /(?:item|row|entry|record|instance)[-_](\d+)/i,
    /\w+(\d+)$/,
    /form1\[0\]\.Section\d+\.Entry(\d+)/i,
    // Pattern: section_21_2 (section 21, entry 2)
    /section[_\s]?(\d+)[_\s]?(\d+)/i,
    // Pattern: formX[entry].SectionY or similar
    /form\d+\[(\d+)\][._].*?(?:section(?:s)?(\d+)|sections(\d+)-\d+)/i,
  ],
  // Section-specific entry patterns
  1: [],
  2: [],
  3: [],
  4: [
    // SSN fields in Section 4
    /\.SSN\[(\d+)\]/i,
    // RadioButtonList in Sections1-6 format (Section 4)
    /Sections1-6\[\d+\]\.RadioButtonList\[\d+\]/i,

  ],
  5: [
    // Other names used
    /othername[._-]?(\d+)/i,
    /alias[._-]?(\d+)/i,
    /maiden[._-]?(\d+)/i,
    // Section 5 specific patterns
    /\.section5\[(\d+)\]\.TextField11\[(\d+)\]/i,
    /\.section5\[(\d+)\]\.#area\[(\d+)\]\.From_Datefield_Name_2\[(\d+)\]/i,
    /Sections1-6\[\d+\]\.section5\[(\d+)\]\.([^[]+)(?:\[(\d+)\])?/i,
    /Sections1-6\[\d+\]\.section5\[\d+\]\.TextField11\[(\d+)\]/i,
    /Sections1-6\[\d+\]\.section5\[\d+\]\.#area\[\d+\]\.From_Datefield_Name_2\[(\d+)\]/i,
  ],
  6: [],
  7: [],
  8: [],
  9: [],
  10: [],
  11: [
    // Residence history
    /residence[._-]?(\d+)/i,
    /address[._-]?(\d+)/i,
    /lived[._-]?(\d+)/i,
  ],
  12: [
    // Education history
    /school[._-]?(\d+)/i,
    /education[._-]?(\d+)/i,
    /degree[._-]?(\d+)/i,
  ],
  13: [
    // Employment history
    /employer[._-]?(\d+)/i,
    /employment[._-]?(\d+)/i,
    /job[._-]?(\d+)/i,
    /position[._-]?(\d+)/i,
  ],
  14: [],
  15: [
    // Military history
    /military[._-]?(\d+)/i,
    /service[._-]?(\d+)/i,
    /branch[._-]?(\d+)/i,
  ],
  16: [
    // References
    /reference[._-]?(\d+)/i,
    /knowsyou[._-]?(\d+)/i,
    /contact[._-]?(\d+)/i,
  ],
  17: [
    // Relationships
    /spouse[._-]?(\d+)/i,
    /partner[._-]?(\d+)/i,
    /relationship[._-]?(\d+)/i,
    /cohabitant[._-]?(\d+)/i,
  ],
  18: [
    // Relatives
    /relative[._-]?(\d+)/i,
    /family[._-]?(\d+)/i,
    /member[._-]?(\d+)/i,
  ],
  19: [
    // Foreign contacts
    /foreign[._-]?contact[._-]?(\d+)/i,
    /nonuscitizen[._-]?(\d+)/i,
  ],
  20: [
    // Foreign activities
    /foreignbus[._-]?(\d+)/i,
    /foreigngov[._-]?(\d+)/i,
    /activity[._-]?(\d+)/i,
  ],
  21: [],
  22: [
    // Police record
    /offense[._-]?(\d+)/i,
    /arrest[._-]?(\d+)/i,
    /charge[._-]?(\d+)/i,
  ],
  23: [
    // Drug use
    /drug[._-]?(\d+)/i,
    /substance[._-]?(\d+)/i,
    /controlled[._-]?(\d+)/i,
  ],
  24: [],
  25: [],
  26: [
    // Financial record
    /financial[._-]?(\d+)/i,
    /debt[._-]?(\d+)/i,
    /bankruptcy[._-]?(\d+)/i,
  ],
  27: [],
  28: [],
  29: [],
  30: [],
};

/**
 * Entry field names by section
 * Maps sections to common prefixes used for entry fields
 */
export const sectionEntryPrefixes: Record<number, string[]> = {
  1: [],
  2: [],
  3: [],
  4: [],
  5: ["othername", "alias", "maiden"], // Other names used
  6: [],
  7: [],
  8: [],
  9: [],
  10: [],
  11: ["residence", "address", "lived"], // Where you have lived
  12: ["school", "education", "degree"], // Schools attended
  13: ["employer", "employment", "job"], // Employment history
  14: [],
  15: ["military", "service", "branch"], // Military history
  16: ["reference", "knowsyou", "contact"], // References
  17: ["spouse", "partner", "relationship"], // Relationships
  18: ["relative", "family", "member"], // Relatives
  19: ["foreign", "contact", "nonuscitizen"], // Foreign contacts
  20: ["foreignbus", "foreigngov", "activity"], // Foreign activities
  21: [],
  22: ["offense", "arrest", "charge"], // Police record
  23: ["drug", "substance", "controlled"], // Drug use
  24: [],
  25: [],
  26: ["financial", "debt", "bankruptcy"], // Financial record
  27: [],
  28: [],
  29: [],
  30: [],
};

// Define more accurate section page ranges based on validation
export const sectionPageRanges: Record<number, [number, number]> = {
  1: [5, 5], // Full Name (1 page)
  2: [5, 5], // Date of Birth (1 page)
  3: [5, 5], // Place of Birth (1 page)
  4: [5, 5], // Social Security Number (1 page)
  5: [5, 5], // Other Names Used (1 page)
  6: [5, 5], // Your Identifying Information (1 page)
  7: [6, 6], // Your Contact Information (1 page)
  8: [6, 6], // U.S. Passport Information (1 page)
  9: [6, 7], // Citizenship (2 pages)
  10: [8, 9], // Dual/Multiple Citizenship & Foreign Passport Info (2 pages)
  11: [10, 13], // Where You Have Lived (4 pages)
  12: [14, 16], // Where you went to School (3 pages)
  13: [17, 33], // Employment Activities (17 pages)
  14: [34, 34], // Selective Service (1 page)
  15: [34, 37], // Military History (4 pages)
  16: [38, 38], // People Who Know You Well (1 page)
  17: [39, 44], // Marital/Relationship Status (6 pages)
  18: [45, 62], // Relatives (18 pages)
  19: [63, 66], // Foreign Contacts (4 pages)
  20: [67, 87], // Foreign Business, Activities, Government Contacts (21 pages)
  21: [88, 97], // Psychological and Emotional Health (10 pages)
  22: [98, 104], // Police Record (7 pages)
  23: [105, 111], // Illegal Use of Drugs and Drug Activity (7 pages)
  24: [112, 115], // Use of Alcohol (4 pages)
  25: [116, 117], // Investigations and Clearance (2 pages)
  26: [118, 124], // Financial Record (7 pages)
  27: [125, 126], // Use of Information Technology Systems (2 pages)
  28: [127, 127], // Involvement in Non-Criminal Court Actions (1 page)
  29: [128, 132], // Association Record (5 pages)
  30: [133, 136], // Continuation Space (4 pages)
};

// Function to calculate related sections based on page ranges
export const calculateRelatedSections = (
  relatedSections: Record<number, number[]>
) => {
  // Process each section
  for (const [sectionStr, range] of Object.entries(sectionPageRanges)) {
    const section = parseInt(sectionStr, 10);
    if (isNaN(section)) continue;

    const [startPage, endPage] = range;
    const sectionPageSpan = endPage - startPage;

    // Initialize array for this section
    relatedSections[section] = [];

    // Find sections with adjacent or nearby page ranges
    for (const [otherSectionStr, otherRange] of Object.entries(
      sectionPageRanges
    )) {
      const otherSection = parseInt(otherSectionStr, 10);
      if (isNaN(otherSection) || otherSection === section) continue;

      const [otherStart, otherEnd] = otherRange;

      // Calculate page proximity - lower means closer
      // 1. Adjacent sections (right after or before)
      if (
        Math.abs(startPage - otherEnd) <= 1 ||
        Math.abs(endPage - otherStart) <= 1
      ) {
        relatedSections[section].push(otherSection);
      }
      // 2. Sections within reasonable proximity (within 5 pages)
      else if (
        Math.abs(startPage - otherEnd) <= 5 ||
        Math.abs(endPage - otherStart) <= 5
      ) {
        relatedSections[section].push(otherSection);
      }
      // 3. Special case for long sections - sections contained within
      else if (
        sectionPageSpan > 10 &&
        otherStart >= startPage &&
        otherEnd <= endPage
      ) {
        relatedSections[section].push(otherSection);
      }
    }

    // Add some manually validated relationships based on content domains
    const contentRelationships: Record<number, number[]> = {
      11: [12, 13], // Where you lived -> School, Employment
      12: [11, 13], // School -> Where you lived, Employment
      13: [11, 12, 16], // Employment -> Where you lived, School, References
      15: [16], // Military -> References
      16: [13, 15], // References -> Employment, Military
      17: [18, 19], // Relationships -> Relatives, Foreign Contacts
      18: [17, 19], // Relatives -> Relationships, Foreign Contacts
      19: [17, 18, 20], // Foreign Contacts -> Relationships, Relatives, Foreign Activities
      20: [19], // Foreign Activities -> Foreign Contacts
      22: [23, 24], // Police Record -> Drug Use, Alcohol
      23: [22, 24], // Drug Use -> Police Record, Alcohol
      24: [22, 23], // Alcohol -> Police Record, Drug Use
    };

    // Add content-based relationships if they exist
    if (contentRelationships[section]) {
      // Add relationships but ensure no duplicates
      for (const related of contentRelationships[section]) {
        if (!relatedSections[section].includes(related)) {
          relatedSections[section].push(related);
        }
      }
    }
  }
};

/**
 * Section capacity information for capacity-aware field assignment
 */
export interface SectionCapacityInfo {
  /** Current field count per section */
  currentCounts: Record<number, number>;
  /** Expected field count per section */
  expectedCounts: Record<number, number>;
  /** Sections that are currently over-allocated */
  overAllocatedSections: number[];
  /** Sections that are currently under-allocated */
  underAllocatedSections: number[];
}

/**
 * Create SectionCapacityInfo from current field distribution
 */
export function createSectionCapacityInfo(fields: CategorizedField[]): SectionCapacityInfo {
  // Count current fields per section
  const currentCounts: Record<number, number> = {};

  for (const field of fields) {
    const section = field.section || 0;
    currentCounts[section] = (currentCounts[section] || 0) + 1;
  }

  // Get expected counts from the expectedFieldCounts constant
  const expectedCounts: Record<number, number> = {};
  const overAllocatedSections: number[] = [];
  const underAllocatedSections: number[] = [];

  for (const [sectionStr, counts] of Object.entries(expectedFieldCounts)) {
    const section = parseInt(sectionStr, 10);
    const expectedTotal = counts.fields + counts.entries + counts.subsections;
    expectedCounts[section] = expectedTotal;

    const currentCount = currentCounts[section] || 0;

    // Consider a section over-allocated if it has more than 110% of expected
    if (currentCount > expectedTotal * 1.1) {
      overAllocatedSections.push(section);
    }
    // Consider a section under-allocated if it has less than 90% of expected
    else if (currentCount < expectedTotal * 0.9) {
      underAllocatedSections.push(section);
    }
  }

  return {
    currentCounts,
    expectedCounts,
    overAllocatedSections,
    underAllocatedSections,
  };
}

/**
 * Find sections that are adjacent to a given page
 */
function findAdjacentSections(page: number): number[] {
  const adjacentSections: number[] = [];
  const proximityThreshold = 3; // Pages within 3 pages are considered adjacent

  for (const [sectionStr, [startPage, endPage]] of Object.entries(sectionPageRanges)) {
    const section = parseInt(sectionStr, 10);

    // Check if page is within proximity of this section's range
    const distanceToStart = Math.abs(page - startPage);
    const distanceToEnd = Math.abs(page - endPage);
    const minDistance = Math.min(distanceToStart, distanceToEnd);

    if (minDistance <= proximityThreshold) {
      adjacentSections.push(section);
    }
  }

  // Sort by proximity (closest first)
  adjacentSections.sort((a, b) => {
    const aRange = sectionPageRanges[a];
    const bRange = sectionPageRanges[b];

    const aDistance = Math.min(
      Math.abs(page - aRange[0]),
      Math.abs(page - aRange[1])
    );
    const bDistance = Math.min(
      Math.abs(page - bRange[0]),
      Math.abs(page - bRange[1])
    );

    return aDistance - bDistance;
  });

  return adjacentSections;
}

/**
 * Check if a field legitimately belongs to Section 20 (Foreign Activities)
 */
function isLegitimateSection20Field(field: CategorizedField): boolean {
  const fieldName = field.name.toLowerCase();
  const fieldValue = typeof field.value === 'string' ? field.value.toLowerCase() : '';
  const fieldLabel = field.label?.toLowerCase() || '';

  // Section 20 is about Foreign Activities - look for relevant keywords
  const section20Keywords = [
    'foreign', 'country', 'countries', 'travel', 'passport', 'visa',
    'embassy', 'consulate', 'abroad', 'overseas', 'international',
    'citizenship', 'dual', 'naturalization', 'immigration',
    'business', 'employment', 'work', 'job', 'contract',
    'government', 'official', 'military', 'service',
    'contact', 'relationship', 'family', 'relative',
    'section20', 'section_20'
  ];

  // Check if field name, value, or label contains Section 20 keywords
  const hasSection20Content = section20Keywords.some(keyword =>
    fieldName.includes(keyword) ||
    fieldValue.includes(keyword) ||
    fieldLabel.includes(keyword)
  );

  // Also check if field name explicitly references Section 20
  const hasExplicitSection20Reference =
    fieldName.includes('section20') ||
    fieldName.includes('section_20') ||
    fieldName.includes('section-20');

  return hasSection20Content || hasExplicitSection20Reference;
}

/**
 * Check if a section is under its target field count (helper function)
 * This is enhanced to work with capacity information when available
 */
function isUnderTarget(section: number, capacityInfo?: SectionCapacityInfo): boolean {
  if (capacityInfo) {
    return capacityInfo.underAllocatedSections.includes(section);
  }

  // Fallback logic when no capacity info is available
  // Prioritize sections that are commonly under-allocated based on historical data
  const commonlyUnderAllocatedSections = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 13, 14, 15, 16, 17, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  return commonlyUnderAllocatedSections.includes(section);
}

/**
 * Enhanced #subform categorization result
 */
export interface SubformCategorizationResult {
  /** Suggested section for the #subform field */
  section: number;
  /** Confidence score (0-1) */
  confidence: number;
  /** Reason for the categorization */
  reason: string;
  /** Analysis details */
  analysis: {
    pageAnalysis?: string;
    spatialAnalysis?: string;
    valueAnalysis?: string;
    contextAnalysis?: string;
    capacityAnalysis?: string;
  };
}

/**
 * Enhanced #subform field categorization using page-based and spatial analysis
 * This function properly categorizes #subform fields based on their context rather than
 * blindly assigning them all to Section 18 (Relatives)
 */
export function categorizeSubformField(
  field: CategorizedField,
  capacityInfo?: SectionCapacityInfo
): SubformCategorizationResult {
  const fieldName = field.name || "";
  const fieldValue = typeof field.value === "string" ? field.value : "";
  const fieldLabel = field.label || "";
  const page = field.page || 0;

  console.log(`🔍 SUBFORM ANALYSIS: ${fieldName} (page: ${page})`);

  // Step 1: Page-based analysis (primary factor) - now capacity-aware
  const pageBasedSection = analyzeSubformByPage(page, capacityInfo);

  // Step 2: Spatial proximity analysis (secondary factor)
  const spatialSection = analyzeSubformBySpatialProximity(field);

  // Step 3: Value-based analysis (tertiary factor)
  const valueBasedSection = analyzeSubformByValue(fieldValue, fieldLabel);

  // Step 4: Context analysis (field name patterns)
  const contextSection = analyzeSubformByContext(fieldName);

  // Step 5: Combine analyses to determine final section
  const result = combineSubformAnalyses({
    pageAnalysis: pageBasedSection,
    spatialAnalysis: spatialSection,
    valueAnalysis: valueBasedSection,
    contextAnalysis: contextSection,
    field,
    capacityInfo
  });

  console.log(`   📊 SUBFORM RESULT: Section ${result.section} (${result.confidence.toFixed(2)}) - ${result.reason}`);

  return result;
}

/**
 * Enhanced page-based analysis for #subform fields (PRIMARY classification method)
 * Uses precise page-to-section mapping with high confidence scoring
 */
function analyzeSubformByPage(
  page: number,
  capacityInfo?: SectionCapacityInfo
): { section: number; confidence: number; reason: string } {
  if (page === 0 || !page) {
    return { section: 0, confidence: 0, reason: "No page information available" };
  }

  console.log(`   📍 PAGE ANALYSIS: Analyzing page ${page}`);

  // ENHANCED: Find exact section match with high confidence
  for (const [sectionStr, [startPage, endPage]] of Object.entries(sectionPageRanges)) {
    const section = parseInt(sectionStr, 10);
    if (page >= startPage && page <= endPage) {
      // High confidence for exact page range matches
      let confidence = 0.85; // Increased confidence for page-based analysis

      // CAPACITY-AWARE: Boost confidence for under-allocated sections
      if (capacityInfo && capacityInfo.underAllocatedSections.includes(section)) {
        confidence = Math.min(confidence + 0.1, 0.95); // Boost by 0.1, cap at 0.95
        console.log(`   🎯 CAPACITY BOOST: Section ${section} is under-allocated, boosting confidence to ${confidence.toFixed(2)}`);
      }

      const reason = `Page ${page} falls within Section ${section} range (${startPage}-${endPage})`;
      console.log(`   ✅ EXACT MATCH: ${reason}`);
      return { section, confidence, reason };
    }
  }

  // ENHANCED: Find closest section with distance-based confidence
  let closestSection = 0;
  let minDistance = Infinity;
  let closestSectionInfo = "";

  for (const [sectionStr, [startPage, endPage]] of Object.entries(sectionPageRanges)) {
    const section = parseInt(sectionStr, 10);

    // Calculate distance to section range
    let distance;
    if (page < startPage) {
      distance = startPage - page; // Distance to start of section
    } else if (page > endPage) {
      distance = page - endPage; // Distance from end of section
    } else {
      distance = 0; // Within range (should have been caught above)
    }

    if (distance < minDistance) {
      minDistance = distance;
      closestSection = section;
      closestSectionInfo = `Section ${section} (${startPage}-${endPage})`;
    }
  }

  // ENHANCED: Calculate confidence based on distance with improved scoring
  let confidence;
  if (minDistance === 0) {
    confidence = 0.85; // Within range
  } else if (minDistance <= 2) {
    confidence = 0.8; // IMPROVED: Very close (1-2 pages away) - increased from 0.7
  } else if (minDistance <= 5) {
    confidence = 0.6; // IMPROVED: Moderately close (3-5 pages away) - increased from 0.5
  } else if (minDistance <= 10) {
    confidence = 0.4; // IMPROVED: Somewhat close (6-10 pages away) - increased from 0.3
  } else {
    confidence = 0.2; // IMPROVED: Far away (>10 pages) - increased from 0.1
  }

  // CAPACITY-AWARE: Boost confidence for under-allocated sections
  if (capacityInfo && capacityInfo.underAllocatedSections.includes(closestSection)) {
    const originalConfidence = confidence;
    confidence = Math.min(confidence + 0.15, 0.95); // Boost by 0.15, cap at 0.95
    console.log(`   🎯 CAPACITY BOOST: Section ${closestSection} is under-allocated, boosting confidence from ${originalConfidence.toFixed(2)} to ${confidence.toFixed(2)}`);
  }

  // CAPACITY-AWARE: Reduce confidence for over-allocated sections
  if (capacityInfo && capacityInfo.overAllocatedSections.includes(closestSection)) {
    const originalConfidence = confidence;
    confidence = Math.max(confidence - 0.2, 0.1); // Reduce by 0.2, floor at 0.1
    console.log(`   ⚠️  CAPACITY PENALTY: Section ${closestSection} is over-allocated, reducing confidence from ${originalConfidence.toFixed(2)} to ${confidence.toFixed(2)}`);
  }

  const reason = `Page ${page} closest to ${closestSectionInfo}, distance: ${minDistance} pages`;
  console.log(`   📍 CLOSEST MATCH: ${reason} (confidence: ${confidence.toFixed(2)})`);

  return { section: closestSection, confidence, reason };
}

/**
 * Enhanced spatial proximity analysis for #subform fields (SECONDARY classification method)
 * Uses actual field coordinates to determine spatial relationships with other categorized fields
 */
function analyzeSubformBySpatialProximity(field: CategorizedField): { section: number; confidence: number; reason: string } {
  const fieldRect = field.rect;
  const fieldPage = field.page;

  if (!fieldRect || !fieldPage) {
    return {
      section: 0,
      confidence: 0,
      reason: "No spatial coordinates available for proximity analysis"
    };
  }

  console.log(`   🎯 SPATIAL ANALYSIS: Field at (${fieldRect.x}, ${fieldRect.y}) on page ${fieldPage}`);

  // This would ideally analyze proximity to other already-categorized fields
  // For now, we'll use the field's position on the page to make educated guesses

  const fieldX = fieldRect.x;
  const fieldY = fieldRect.y;

  // Analyze field position patterns based on typical form layout
  let spatialSection = 0;
  let confidence = 0;
  let reason = "";

  // Top of page (header area) - likely section headers or navigation
  if (fieldY > 700) {
    spatialSection = 0; // Neutral - header area
    confidence = 0.1;
    reason = `Field in header area (y: ${fieldY}) - likely navigation or section header`;
  }
  // Middle-left area - often main content
  else if (fieldX < 300 && fieldY > 300 && fieldY < 600) {
    confidence = 0.3;
    reason = `Field in main content area (x: ${fieldX}, y: ${fieldY}) - moderate spatial confidence`;
  }
  // Right side - often continuation or secondary content
  else if (fieldX > 400) {
    confidence = 0.2;
    reason = `Field in right area (x: ${fieldX}, y: ${fieldY}) - possible continuation content`;
  }
  // Bottom area - often continuation or additional information
  else if (fieldY < 200) {
    confidence = 0.2;
    reason = `Field in bottom area (y: ${fieldY}) - possible continuation content`;
  }
  else {
    confidence = 0.1;
    reason = `Field at (${fieldX}, ${fieldY}) - neutral spatial position`;
  }

  console.log(`   🎯 SPATIAL RESULT: Section ${spatialSection} (confidence: ${confidence.toFixed(2)}) - ${reason}`);

  return { section: spatialSection, confidence, reason };
}

/**
 * Analyze #subform field based on field value and label content
 */
function analyzeSubformByValue(value: string, label: string): { section: number; confidence: number; reason: string } {
  const combinedText = `${value} ${label}`.toLowerCase();

  // Employment-related keywords
  if (/\b(employer|employment|job|work|position|company|occupation|supervisor|salary|income)\b/i.test(combinedText)) {
    return { section: 13, confidence: 0.7, reason: "Contains employment-related keywords" };
  }

  // Education-related keywords
  if (/\b(school|education|college|university|degree|diploma|student|teacher|course|grade)\b/i.test(combinedText)) {
    return { section: 12, confidence: 0.7, reason: "Contains education-related keywords" };
  }

  // Address/residence-related keywords
  if (/\b(address|residence|lived|home|apartment|street|city|state|zip|country)\b/i.test(combinedText)) {
    return { section: 11, confidence: 0.7, reason: "Contains address/residence-related keywords" };
  }

  // Relatives-related keywords
  if (/\b(relative|family|father|mother|sibling|child|children|parent|spouse|brother|sister)\b/i.test(combinedText)) {
    return { section: 18, confidence: 0.7, reason: "Contains relatives-related keywords" };
  }

  // References-related keywords
  if (/\b(reference|contact|know|friend|colleague|acquaintance|verifier)\b/i.test(combinedText)) {
    return { section: 16, confidence: 0.7, reason: "Contains references-related keywords" };
  }

  // Foreign contacts-related keywords
  if (/\b(foreign|international|overseas|citizen|nationality|passport|visa)\b/i.test(combinedText)) {
    return { section: 19, confidence: 0.7, reason: "Contains foreign contacts-related keywords" };
  }

  return { section: 0, confidence: 0, reason: "No specific value-based indicators" };
}

/**
 * Analyze #subform field based on field name context patterns
 */
function analyzeSubformByContext(fieldName: string): { section: number; confidence: number; reason: string } {
  // Look for section-specific patterns in the field name structure

  // Employment patterns
  if (/employment|employer|job|work|position/i.test(fieldName)) {
    return { section: 13, confidence: 0.6, reason: "Field name contains employment context" };
  }

  // Education patterns
  if (/education|school|college|university|degree/i.test(fieldName)) {
    return { section: 12, confidence: 0.6, reason: "Field name contains education context" };
  }

  // Address/residence patterns
  if (/address|residence|lived|home/i.test(fieldName)) {
    return { section: 11, confidence: 0.6, reason: "Field name contains residence context" };
  }

  // Relatives patterns
  if (/relative|family|father|mother|sibling|child/i.test(fieldName)) {
    return { section: 18, confidence: 0.6, reason: "Field name contains relatives context" };
  }

  // References patterns
  if (/reference|contact|know|friend/i.test(fieldName)) {
    return { section: 16, confidence: 0.6, reason: "Field name contains references context" };
  }

  return { section: 0, confidence: 0, reason: "No specific context patterns in field name" };
}



/**
 * Combine multiple analyses to determine final section assignment
 */
function combineSubformAnalyses(analyses: {
  pageAnalysis: { section: number; confidence: number; reason: string };
  spatialAnalysis: { section: number; confidence: number; reason: string };
  valueAnalysis: { section: number; confidence: number; reason: string };
  contextAnalysis: { section: number; confidence: number; reason: string };
  field: CategorizedField;
  capacityInfo?: SectionCapacityInfo;
}): SubformCategorizationResult {
  const { pageAnalysis, spatialAnalysis, valueAnalysis, contextAnalysis, field, capacityInfo } = analyses;

  // ENHANCED: Weighted scoring with page-based analysis as primary method
  // Page analysis (60%), Spatial analysis (25%), Value analysis (10%), Context analysis (5%)
  const weights = {
    page: 0.6,    // PRIMARY: Page-based location analysis
    spatial: 0.25, // SECONDARY: Spatial proximity analysis
    value: 0.1,   // TERTIARY: Value-based content analysis
    context: 0.05 // QUATERNARY: Context-based pattern analysis
  };

  // Calculate weighted scores for each potential section
  const sectionScores: Record<number, number> = {};

  // Add page analysis score
  if (pageAnalysis.section > 0) {
    sectionScores[pageAnalysis.section] = (sectionScores[pageAnalysis.section] || 0) +
      (pageAnalysis.confidence * weights.page);
  }

  // Add value analysis score
  if (valueAnalysis.section > 0) {
    sectionScores[valueAnalysis.section] = (sectionScores[valueAnalysis.section] || 0) +
      (valueAnalysis.confidence * weights.value);
  }

  // Add context analysis score
  if (contextAnalysis.section > 0) {
    sectionScores[contextAnalysis.section] = (sectionScores[contextAnalysis.section] || 0) +
      (contextAnalysis.confidence * weights.context);
  }

  // Add spatial analysis score
  if (spatialAnalysis.section > 0) {
    sectionScores[spatialAnalysis.section] = (sectionScores[spatialAnalysis.section] || 0) +
      (spatialAnalysis.confidence * weights.spatial);
  }

  // Find the section with the highest score
  let bestSection = 0;
  let bestScore = 0;

  for (const [sectionStr, score] of Object.entries(sectionScores)) {
    const section = parseInt(sectionStr, 10);
    if (score > bestScore) {
      bestScore = score;
      bestSection = section;
    }
  }

  // ENHANCED: Capacity-aware section assignment with lower confidence threshold
  // IMPROVED: Lower confidence threshold from 0.3 to 0.2 for better assignment rates
  if (bestSection === 0 || bestScore < 0.2) {
    // Try to infer section from page location even with lower confidence
    if (pageAnalysis.section > 0 && pageAnalysis.confidence >= 0.2) {
      // CAPACITY-AWARE: Check if the page-based section is over-allocated
      if (capacityInfo && capacityInfo.overAllocatedSections.includes(pageAnalysis.section)) {
        console.log(`   ⚠️  CAPACITY CHECK: Page-based Section ${pageAnalysis.section} is over-allocated, looking for alternatives`);

        // Try to find an under-allocated section that's close to this page
        const page = field.page || 0;
        const adjacentSections = findAdjacentSections(page);
        const underAllocatedAdjacent = adjacentSections.filter(section =>
          capacityInfo.underAllocatedSections.includes(section)
        );

        if (underAllocatedAdjacent.length > 0) {
          bestSection = underAllocatedAdjacent[0];
          bestScore = pageAnalysis.confidence * 0.9; // Slight penalty for redirection
          console.log(`   🎯 CAPACITY REDIRECT: Redirecting to under-allocated adjacent Section ${bestSection}`);
        } else {
          // Use the page-based section anyway but with reduced confidence
          bestSection = pageAnalysis.section;
          bestScore = pageAnalysis.confidence * 0.7; // Penalty for over-allocation
          console.log(`   📍 FALLBACK: Using over-allocated page-based Section ${bestSection} with penalty`);
        }
      } else {
        bestSection = pageAnalysis.section;
        bestScore = pageAnalysis.confidence;
        console.log(`   📍 FALLBACK: Using page-based assignment to Section ${bestSection}`);
      }
    }
    // Try value-based analysis with lower threshold
    else if (valueAnalysis.section > 0 && valueAnalysis.confidence >= 0.3) {
      bestSection = valueAnalysis.section;
      bestScore = valueAnalysis.confidence;
      console.log(`   📝 FALLBACK: Using value-based assignment to Section ${bestSection}`);
    }
    // Try context-based analysis with lower threshold
    else if (contextAnalysis.section > 0 && contextAnalysis.confidence >= 0.3) {
      bestSection = contextAnalysis.section;
      bestScore = contextAnalysis.confidence;
      console.log(`   🔤 FALLBACK: Using context-based assignment to Section ${bestSection}`);
    }
    // Enhanced page proximity analysis for fields near section boundaries
    else if (pageAnalysis.section > 0) {
      // Check if this field is close to a section boundary and might belong to adjacent section
      const page = field.page || 0;
      const adjacentSections = findAdjacentSections(page);

      if (adjacentSections.length > 0) {
        // Prefer sections that are under their target count
        const undersizedSection = adjacentSections.find(section => isUnderTarget(section, capacityInfo));
        if (undersizedSection) {
          bestSection = undersizedSection;
          bestScore = 0.4;
          console.log(`   🎯 FALLBACK: Assigning to undersized adjacent Section ${bestSection}`);
        } else {
          bestSection = adjacentSections[0];
          bestScore = 0.3;
          console.log(`   📍 FALLBACK: Assigning to adjacent Section ${bestSection}`);
        }
      } else {
        // CRITICAL FIX: Use Section 30 (Continuation Space) instead of Section 20
        bestSection = 30;
        bestScore = 0.3;
        console.log(`   ⚠️  LAST RESORT: Defaulting to Section 30 (Continuation Space)`);
      }
    } else {
      // CRITICAL FIX: Use Section 30 (Continuation Space) for unclassified fields
      bestSection = 30;
      bestScore = 0.3;
      console.log(`   ⚠️  ABSOLUTE FALLBACK: No analysis available, defaulting to Section 30 (Continuation Space)`);
    }
  }

  // PROTECTION: Prevent Section 20 over-assignment
  if (bestSection === 20) {
    // Check if this field actually belongs to Section 20 based on content
    const isLegitimateSection20 = isLegitimateSection20Field(field);
    if (!isLegitimateSection20) {
      console.log(`   🛡️  PROTECTION: Field doesn't appear to be legitimate Section 20, redirecting to Section 30`);
      bestSection = 30;
      bestScore = 0.3;
    }
  }

  // Build comprehensive reason
  const reasons = [];
  if (pageAnalysis.section > 0) reasons.push(`Page: ${pageAnalysis.reason}`);
  if (valueAnalysis.section > 0) reasons.push(`Value: ${valueAnalysis.reason}`);
  if (contextAnalysis.section > 0) reasons.push(`Context: ${contextAnalysis.reason}`);
  if (spatialAnalysis.section > 0) reasons.push(`Spatial: ${spatialAnalysis.reason}`);

  // Add capacity analysis information
  let capacityAnalysis = "No capacity information available";
  if (capacityInfo) {
    const isOverAllocated = capacityInfo.overAllocatedSections.includes(bestSection);
    const isUnderAllocated = capacityInfo.underAllocatedSections.includes(bestSection);
    const currentCount = capacityInfo.currentCounts[bestSection] || 0;
    const expectedCount = capacityInfo.expectedCounts[bestSection] || 0;

    if (isOverAllocated) {
      capacityAnalysis = `Section ${bestSection} is over-allocated (${currentCount}/${expectedCount})`;
    } else if (isUnderAllocated) {
      capacityAnalysis = `Section ${bestSection} is under-allocated (${currentCount}/${expectedCount})`;
    } else {
      capacityAnalysis = `Section ${bestSection} capacity is balanced (${currentCount}/${expectedCount})`;
    }
  }

  return {
    section: bestSection,
    confidence: bestScore,
    reason: reasons.length > 0 ? reasons.join("; ") : "Default assignment to continuation section",
    analysis: {
      pageAnalysis: pageAnalysis.reason,
      spatialAnalysis: spatialAnalysis.reason,
      valueAnalysis: valueAnalysis.reason,
      contextAnalysis: contextAnalysis.reason,
      capacityAnalysis: capacityAnalysis,
    }
  };
}

/**
 * Field cluster result interface
 */
export interface FieldCluster {
  /** Name or pattern of the cluster */
  pattern: string;
  /** Fields belonging to this cluster */
  fields: CategorizedField[];
  /** Confidence score (0-1) */
  confidence: number;
  /** Description of the cluster pattern */
  description: string;
  /** Suggested section if known */
  suggestedSection?: number;
}

/**
 * Field clustering options
 */
export interface ClusteringOptions {
  /** Minimum similarity required to group fields (0-1) */
  similarityThreshold?: number;
  /** Minimum size of a cluster to be considered significant */
  minClusterSize?: number;
  /** Maximum size for a cluster (larger clusters will be subdivided) */
  maxClusterSize?: number;
  /** Whether to use advanced NLP for clustering */
  useAdvancedNLP?: boolean;
  /** Whether to analyze field values in addition to names */
  analyzeValues?: boolean;
  /** Whether to use positional information (pages) in clustering */
  usePositionalInfo?: boolean;
}

export const PageAnalysisSettings = {};

/**
 * Field clusterer for grouping SF-86 form fields based on naming patterns
 */
export class FieldClusterer {
  // Default options for clustering
  private readonly defaultOptions: Required<ClusteringOptions> = {
    similarityThreshold: 0.7,
    minClusterSize: 3,
    maxClusterSize: 30,
    useAdvancedNLP: false,
    analyzeValues: true,
    usePositionalInfo: true,
  };

  // Common field name patterns derived from enhanced-pdf-validation.ts
  private readonly commonPatterns = {
    // Direct section references
    sectionRef: /section(\d+)[._]?(\d+)?/i,
    sectionRange: /sections(\d+)-(\d+)/i,
    // Field indexing patterns
    indexedField: /(\w+)\[(\d+)\]/,
    nestedIndex: /(\w+)\[(\d+)\]\.(\w+)\[(\d+)\]/,
    // SF-86 specific patterns
    subsectionDot: /(\d+)\.(\d+)/,
    subsectionUnderscore: /(\d+)_(\d+)/,
    // Form pattern: form1[0].Section5[0].someField[0]
    formPattern: /form1\[0\]\.(\w+)\[0\]\.(\w+)/i,
  };

  // Common prefixes in field names
  private readonly commonPrefixes = [
    "TextField",
    "CheckBox",
    "DropDownList",
    "RadioButton",
    "Date",
    "SSN",
    "Email",
    "Phone",
    "Address",
    "Name",
    "Birth",
    "Citizenship",
    "Employment",
  ];

  // Common suffixes in field names
  private readonly commonSuffixes = [
    "Name",
    "Date",
    "ID",
    "Number",
    "Code",
    "Status",
    "City",
    "State",
    "Zip",
    "Country",
    "Street",
    "First",
    "Last",
    "Middle",
    "Full",
    "Suffix",
  ];

  /**
   * Create a new field clusterer
   * @param options Clustering options
   */
  constructor(private options: ClusteringOptions = {}) {
    // Merge with default options
    this.options = {
      ...this.defaultOptions,
      ...options,
    };
  }

  /**
   * Cluster fields based on naming patterns
   *
   * @param fields Fields to cluster
   * @param options Optional clustering options to override instance options
   * @returns Array of field clusters
   */
  public clusterFields(
    fields: CategorizedField[],
    options?: ClusteringOptions
  ): FieldCluster[] {
    // Merge options
    const mergedOptions: Required<ClusteringOptions> = {
      ...this.defaultOptions,
      ...this.options,
      ...options,
    };

    // Skip if no fields
    if (!fields || fields.length === 0) {
      return [];
    }

    console.log(
      chalk.cyan(`Starting field clustering for ${fields.length} fields`)
    );

    // Step 1: Extract naming patterns from fields
    const patterns = this.extractNamePatterns(fields);
    console.log(chalk.cyan(`Extracted ${patterns.size} distinct patterns`));

    // Step 2: Group fields by primary pattern
    const initialClusters = this.groupFieldsByPrimaryPattern(
      fields,
      patterns,
      mergedOptions
    );
    console.log(
      chalk.cyan(`Created ${initialClusters.length} initial clusters`)
    );

    // Step 3: Refine clusters - split large ones, merge similar ones
    const refinedClusters = this.refineClusters(initialClusters, mergedOptions);
    console.log(chalk.cyan(`Refined into ${refinedClusters.length} clusters`));

    // Step 4: Calculate confidence for each cluster
    const scoredClusters = this.calculateClusterConfidence(refinedClusters);
    console.log(chalk.cyan(`Final clusters: ${scoredClusters.length}`));

    // Sort clusters by confidence (descending)
    return scoredClusters.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Extract name patterns from fields
   *
   * @param fields Fields to analyze
   * @returns Map of pattern to matching field names
   */
  private extractNamePatterns(
    fields: CategorizedField[]
  ): Map<string, string[]> {
    // Hold patterns with field names that match
    const patternMap = new Map<string, string[]>();

    // Process each field
    for (const field of fields) {
      const fieldName = field.name;

      // Try each pattern matcher

      // 1. Check for direct section reference
      const sectionRefMatch = fieldName.match(this.commonPatterns.sectionRef);
      if (sectionRefMatch) {
        const section = sectionRefMatch[1];
        const subsection = sectionRefMatch[2] || "";
        const pattern = subsection
          ? `section${section}_${subsection}`
          : `section${section}`;
        this.addToPatternMap(patternMap, pattern, fieldName);
        continue;
      }

      // 2. Check for section range
      const sectionRangeMatch = fieldName.match(
        this.commonPatterns.sectionRange
      );
      if (sectionRangeMatch) {
        const pattern = `sections${sectionRangeMatch[1]}-${sectionRangeMatch[2]}`;
        this.addToPatternMap(patternMap, pattern, fieldName);
        continue;
      }

      // 3. Check for form pattern
      const formMatch = fieldName.match(this.commonPatterns.formPattern);
      if (formMatch) {
        const section = formMatch[1];
        const field = formMatch[2];
        const pattern = `form.${section}.${field}`;
        this.addToPatternMap(patternMap, pattern, fieldName);
        continue;
      }

      // 4. Check for indexed fields
      const indexMatch = fieldName.match(this.commonPatterns.indexedField);
      if (indexMatch) {
        const baseField = indexMatch[1];
        // Create pattern with [idx] placeholder
        const pattern = `${baseField}[idx]`;
        this.addToPatternMap(patternMap, pattern, fieldName);
        continue;
      }

      // 5. Extract common prefix if found
      const prefix = this.commonPrefixes.find((p) => fieldName.startsWith(p));
      if (prefix) {
        const pattern = `prefix:${prefix}`;
        this.addToPatternMap(patternMap, pattern, fieldName);
        continue;
      }

      // 6. Extract common suffix if found
      const suffix = this.commonSuffixes.find((s) => fieldName.endsWith(s));
      if (suffix) {
        const pattern = `suffix:${suffix}`;
        this.addToPatternMap(patternMap, pattern, fieldName);
        continue;
      }

      // Default pattern - use first part of name (up to first digit or special char)
      const defaultPattern = fieldName.replace(/[^a-zA-Z].*$/, "");
      if (defaultPattern && defaultPattern !== fieldName) {
        this.addToPatternMap(patternMap, `base:${defaultPattern}`, fieldName);
      } else {
        // For fields that didn't match any pattern, use a general bucket
        this.addToPatternMap(patternMap, "other", fieldName);
      }
    }

    return patternMap;
  }

  /**
   * Helper to add field to pattern map
   */
  private addToPatternMap(
    map: Map<string, string[]>,
    pattern: string,
    fieldName: string
  ): void {
    if (!map.has(pattern)) {
      map.set(pattern, []);
    }
    map.get(pattern)!.push(fieldName);
  }

  /**
   * Group fields by primary pattern
   *
   * @param fields All fields to group
   * @param patterns Pattern map from extractNamePatterns
   * @param options Clustering options
   * @returns Initial field clusters
   */
  private groupFieldsByPrimaryPattern(
    fields: CategorizedField[],
    patterns: Map<string, string[]>,
    options: Required<ClusteringOptions>
  ): FieldCluster[] {
    const clusters: FieldCluster[] = [];
    const fieldMap = new Map<string, CategorizedField>();

    // Create a lookup map for fields by name
    fields.forEach((field) => fieldMap.set(field.name, field));

    // Process each pattern
    for (const [pattern, fieldNames] of patterns.entries()) {
      // Skip patterns with too few fields
      if (fieldNames.length < options.minClusterSize) {
        continue;
      }

      // Create cluster fields array
      const clusterFields = fieldNames
        .map((name) => fieldMap.get(name))
        .filter(Boolean) as CategorizedField[];

      // Skip if we don't have enough fields
      if (clusterFields.length < options.minClusterSize) {
        continue;
      }

      // Generate description for this pattern
      const description = this.generatePatternDescription(pattern);

      // Create the cluster
      const cluster: FieldCluster = {
        pattern,
        fields: clusterFields,
        confidence: 0.5, // Initial confidence
        description,
      };

      // Try to determine section for this cluster
      const suggestedSection = this.suggestSectionForCluster(cluster);
      if (suggestedSection && suggestedSection.confidence > 0.6) {
        cluster.suggestedSection = suggestedSection.section;
      }

      clusters.push(cluster);
    }

    return clusters;
  }

  /**
   * Generate human-readable description for a pattern
   *
   * @param pattern The pattern string
   * @returns Human-readable description
   */
  private generatePatternDescription(pattern: string): string {
    // Handle special pattern prefixes
    if (pattern.startsWith("section")) {
      // Extract section number
      const match = pattern.match(/section(\d+)(?:_(\d+))?/);
      if (match) {
        const section = match[1];
        const subsection = match[2];

        if (subsection) {
          return `Section ${section}.${subsection} fields`;
        }
        return `Section ${section} fields`;
      }
      return `Section fields`;
    }

    if (pattern.startsWith("form1[0].")) {
      const parts = pattern.split(".");
      if (parts.length >= 3) {
        return `Form fields: ${parts[1]} - ${parts[2]}`;
      }
      return `Form fields: ${pattern}`;
    }

    return `Pattern: ${pattern}`;
  }

  /**
   * Refine clusters by splitting large ones and merging similar ones
   *
   * @param clusters Initial clusters to refine
   * @param options Clustering options
   * @returns Refined clusters
   */
  private refineClusters(
    clusters: FieldCluster[],
    options: Required<ClusteringOptions>
  ): FieldCluster[] {
    const result: FieldCluster[] = [];

    // First, split large clusters
    for (const cluster of clusters) {
      if (cluster.fields.length > options.maxClusterSize) {
        // This cluster is too large, subdivide it
        const subClusters = this.subdivideCluster(cluster, options);
        result.push(...subClusters);
      } else {
        // Keep as is
        result.push(cluster);
      }
    }

    return result;
  }

  /**
   * Subdivide a large cluster into smaller ones
   *
   * @param cluster Large cluster to subdivide
   * @param options Clustering options
   * @returns Array of smaller clusters
   */
  private subdivideCluster(
    cluster: FieldCluster,
    options: Required<ClusteringOptions>
  ): FieldCluster[] {
    const result: FieldCluster[] = [];

    // Try different subdivision strategies

    // 1. Try to subdivide by page
    if (options.usePositionalInfo) {
      const fieldsByPage: Record<number, CategorizedField[]> = {};

      // Group fields by page
      for (const field of cluster.fields) {
        if (field.page) {
          if (!fieldsByPage[field.page]) {
            fieldsByPage[field.page] = [];
          }
          fieldsByPage[field.page].push(field);
        }
      }

      // Create clusters for pages with enough fields
      for (const [page, pageFields] of Object.entries(fieldsByPage)) {
        if (pageFields.length >= options.minClusterSize) {
          result.push({
            pattern: `${cluster.pattern}_page${page}`,
            fields: pageFields,
            confidence: 0.6, // Slightly higher than default
            description: `${cluster.description} on page ${page}`,
          });
        }
      }

      // If we successfully subdivided, return the result
      if (result.length > 0) {
        return result;
      }
    }

    // 2. Try to subdivide by field type
    const fieldsByType: Record<string, CategorizedField[]> = {};

    // Group fields by type
    for (const field of cluster.fields) {
      const type = field.type || "unknown";
      if (!fieldsByType[type]) {
        fieldsByType[type] = [];
      }
      fieldsByType[type].push(field);
    }

    // Create clusters for types with enough fields
    for (const [type, typeFields] of Object.entries(fieldsByType)) {
      if (typeFields.length >= options.minClusterSize) {
        result.push({
          pattern: `${cluster.pattern}_${type}`,
          fields: typeFields,
          confidence: 0.55,
          description: `${cluster.description} (${type})`,
        });
      }
    }

    // If we successfully subdivided, return the result
    if (result.length > 0) {
      return result;
    }

    // 3. If all subdivision strategies failed, just split the cluster arbitrarily
    const chunks: CategorizedField[][] = [];
    const chunkSize = options.maxClusterSize;

    for (let i = 0; i < cluster.fields.length; i += chunkSize) {
      chunks.push(cluster.fields.slice(i, i + chunkSize));
    }

    // Create clusters for each chunk
    chunks.forEach((chunk, index) => {
      result.push({
        pattern: `${cluster.pattern}_part${index + 1}`,
        fields: chunk,
        confidence: 0.5,
        description: `${cluster.description} (Part ${index + 1})`,
      });
    });

    return result;
  }

  /**
   * Calculate confidence scores for clusters
   *
   * @param clusters Clusters to score
   * @returns Clusters with confidence scores
   */
  private calculateClusterConfidence(clusters: FieldCluster[]): FieldCluster[] {
    return clusters.map((cluster) => {
      // Start with basic confidence based on number of fields
      let confidence = Math.min(
        0.5 + (cluster.fields.length / 20) * 0.25,
        0.75
      );

      // Factor 1: Field naming consistency
      const nameConsistency = this.calculateNamingConsistency(cluster.fields);

      // Factor 2: Page consistency (if all fields are on same/adjacent pages)
      const pageConsistency = this.calculatePageConsistency(cluster.fields);

      // Factor 3: Value pattern consistency
      const valueConsistency = this.calculateValueConsistency(cluster.fields);

      // Factor 4: Match to known section patterns
      const sectionPatternMatch = this.calculateSectionPatternMatch(
        cluster.fields
      );

      // Combine all factors, giving more weight to naming consistency and section matches
      confidence =
        0.3 * confidence +
        0.25 * nameConsistency +
        0.15 * pageConsistency +
        0.1 * valueConsistency +
        0.2 * sectionPatternMatch;

      // Ensure confidence is between 0 and 1
      confidence = Math.max(0, Math.min(1, confidence));

      // Return updated cluster
      return {
        ...cluster,
        confidence,
      };
    });
  }

  /**
   * Calculate naming consistency score for fields in a cluster
   */
  private calculateNamingConsistency(fields: CategorizedField[]): number {
    if (fields.length < 2) return 0.5;

    // Look for shared prefix/suffix patterns
    const names = fields.map((f) => f.name);

    // Get longest common prefix
    let prefix = names[0];
    for (let i = 1; i < names.length; i++) {
      while (!names[i].startsWith(prefix) && prefix.length > 0) {
        prefix = prefix.substring(0, prefix.length - 1);
      }
      if (prefix.length === 0) break;
    }

    // Get longest common suffix
    let suffix = names[0];
    for (let i = 1; i < names.length; i++) {
      while (!names[i].endsWith(suffix) && suffix.length > 0) {
        suffix = suffix.substring(1);
      }
      if (suffix.length === 0) break;
    }

    // Calculate score based on common prefix/suffix
    const prefixScore = prefix.length > 3 ? prefix.length / 10 : 0;
    const suffixScore = suffix.length > 3 ? suffix.length / 10 : 0;

    // Check for sequential numbering
    let sequentialScore = 0;
    const numbers: number[] = [];
    const pattern = /(\D+)(\d+)(\D*)/;

    for (const name of names) {
      const match = name.match(pattern);
      if (match) {
        numbers.push(parseInt(match[2], 10));
      }
    }

    if (numbers.length > 0) {
      numbers.sort((a, b) => a - b);
      let sequential = 0;
      for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] === numbers[i - 1] + 1) {
          sequential++;
        }
      }
      sequentialScore = sequential / (numbers.length - 1);
    }

    // Combine scores
    return Math.min(prefixScore + suffixScore + sequentialScore, 1);
  }

  /**
   * Calculate page consistency score for fields in a cluster
   */
  private calculatePageConsistency(fields: CategorizedField[]): number {
    // Extract pages from fields
    const pages = fields.map((f) => f.page).filter(Boolean);

    if (pages.length < 2) return 0.5;

    // If all on same page, perfect consistency
    const uniquePages = new Set(pages);
    if (uniquePages.size === 1) {
      return 1.0;
    }

    // If pages span 2-3 consecutive pages, good consistency
    const minPage = Math.min(...pages);
    const maxPage = Math.max(...pages);

    if (maxPage - minPage <= 2) {
      return 0.8;
    }

    // If pages span within section range, reasonable consistency
    const pageInSection = (page: number, section: number): boolean => {
      const range = sectionPageRanges[section];
      return range && page >= range[0] && page <= range[1];
    };

    // Get section from first field, check if all pages are in that section
    const firstSectionMatch = fields[0].name.match(/section(\d+)/i);
    if (firstSectionMatch) {
      const section = parseInt(firstSectionMatch[1], 10);
      if (section && pages.every((page) => pageInSection(page, section))) {
        return 0.7;
      }
    }

    // Otherwise, score based on page spread
    return Math.max(0.1, 1 - (maxPage - minPage) / 10);
  }

  /**
   * Calculate value consistency score for fields in a cluster
   */
  private calculateValueConsistency(fields: CategorizedField[]): number {
    // Count fields with values
    const fieldsWithValues = fields.filter((f) => f.value !== undefined);
    if (fieldsWithValues.length < 2) return 0.5;

    // Check if values follow a common pattern
    let patternCount = 0;

    // Look for section number in values
    const sectionPattern = /^(?:sect)?(\d+)(?:\.|_)/i;
    const sectionMatches = fieldsWithValues
      .map((f) => String(f.value).match(sectionPattern))
      .filter(Boolean);

    if (sectionMatches.length > fieldsWithValues.length * 0.6) {
      patternCount++;
    }

    // Look for empty but present values (placeholder fields)
    const emptyValues = fieldsWithValues.filter(
      (f) => String(f.value).trim() === ""
    );

    if (emptyValues.length > fieldsWithValues.length * 0.8) {
      patternCount++;
    }

    // Look for similar lengths
    const valueLengths = fieldsWithValues.map((f) => String(f.value).length);

    const averageLength =
      valueLengths.reduce((sum, len) => sum + len, 0) / valueLengths.length;
    const similarLengths = valueLengths.filter(
      (len) => Math.abs(len - averageLength) < 5
    ).length;

    if (similarLengths > fieldsWithValues.length * 0.7) {
      patternCount++;
    }

    return patternCount / 3;
  }

  /**
   * Calculate section pattern match score for fields in a cluster
   */
  private calculateSectionPatternMatch(fields: CategorizedField[]): number {
    // For each section, check what percentage of fields match its patterns
    const scores: Record<number, number> = {};

    // Check each section's patterns
    for (const [section, patterns] of Object.entries(sectionFieldPatterns)) {
      const sectionNum = parseInt(section, 10);

      // Count fields matching this section's patterns
      let matchCount = 0;
      for (const field of fields) {
        for (const pattern of patterns) {
          if (pattern.test(field.name)) {
            matchCount++;
            break;
          }
        }
      }

      // Calculate score for this section
      scores[sectionNum] = matchCount / fields.length;
    }

    // Check for section keywords in field values
    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      const sectionNum = parseInt(section, 10);

      // Initialize score for this section if not already set
      if (!scores[sectionNum]) {
        scores[sectionNum] = 0;
      }

      // Count fields with values matching this section's keywords
      let valueMatchCount = 0;
      let fieldsWithValues = 0;

      for (const field of fields) {
        if (field.value) {
          fieldsWithValues++;
          const value = String(field.value).toLowerCase();
          if (keywords.some((keyword) => value.includes(keyword))) {
            valueMatchCount++;
          }
        }
      }

      // Add value match score (weighted less than pattern matches)
      if (fieldsWithValues > 0) {
        scores[sectionNum] += (valueMatchCount / fieldsWithValues) * 0.5;
      }
    }

    // Return highest score for any section
    const bestScore = Math.max(0, ...Object.values(scores));
    return Math.min(bestScore, 1);
  }

  /**
   * Suggest section for a cluster based on name patterns, page ranges, etc.
   *
   * @param cluster Cluster to analyze
   * @returns Suggested section with confidence score
   */
  public suggestSectionForCluster(
    cluster: FieldCluster
  ): { section: number; confidence: number } | null {
    // Check if cluster already has a suggested section
    if (cluster.suggestedSection) {
      return {
        section: cluster.suggestedSection,
        confidence: cluster.confidence,
      };
    }

    // Scoring for each section
    const sectionScores: Record<number, number> = {};

    // Method 1: Check pattern name for section references
    const sectionMatch = cluster.pattern.match(/section(\d+)/i);
    if (sectionMatch) {
      const section = parseInt(sectionMatch[1], 10);
      sectionScores[section] = (sectionScores[section] || 0) + 0.8;
    }

    // Method 2: Check field naming patterns for each section
    for (const [section, patterns] of Object.entries(sectionFieldPatterns)) {
      const sectionNum = parseInt(section, 10);

      // Count fields matching this section's patterns
      let matchCount = 0;
      for (const field of cluster.fields) {
        for (const pattern of patterns) {
          if (pattern.test(field.name)) {
            matchCount++;
            break;
          }
        }
      }

      // Calculate score for this section (0-1)
      const patternScore = matchCount / cluster.fields.length;
      sectionScores[sectionNum] =
        (sectionScores[sectionNum] || 0) + patternScore * 0.6;
    }

    // Method 3: Check page ranges
    const pages = cluster.fields.map((f) => f.page).filter(Boolean);

    if (pages.length > 0) {
      const avgPage = pages.reduce((sum, page) => sum + page, 0) / pages.length;

      // Find sections whose page range contains this average
      for (const [section, [minPage, maxPage]] of Object.entries(
        sectionPageRanges
      )) {
        const sectionNum = parseInt(section, 10);
        if (avgPage >= minPage && avgPage <= maxPage) {
          sectionScores[sectionNum] = (sectionScores[sectionNum] || 0) + 0.4;
        }
      }
    }

    // Method 4: Check field values for section keywords
    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      const sectionNum = parseInt(section, 10);

      // Count fields with values matching this section's keywords
      let valueMatchCount = 0;
      let fieldsWithValues = 0;

      for (const field of cluster.fields) {
        if (field.value) {
          fieldsWithValues++;
          const value = String(field.value).toLowerCase();
          if (keywords.some((keyword) => value.includes(keyword))) {
            valueMatchCount++;
          }
        }
      }

      // Add value match score
      if (fieldsWithValues > 0) {
        const keywordScore = (valueMatchCount / fieldsWithValues) * 0.3;
        sectionScores[sectionNum] =
          (sectionScores[sectionNum] || 0) + keywordScore;
      }
    }

    // Find section with highest score
    let bestSection = 0;
    let bestScore = 0;

    for (const [section, score] of Object.entries(sectionScores)) {
      const sectionNum = parseInt(section, 10);
      if (score > bestScore) {
        bestScore = score;
        bestSection = sectionNum;
      }
    }

    // Return section if confidence is reasonable
    if (bestScore >= 0.4 && bestSection > 0) {
      return {
        section: bestSection,
        confidence: Math.min(bestScore, 1),
      };
    }

    return null;
  }
}

// Export singleton instance for easier usage
export const fieldClusterer = new FieldClusterer();
