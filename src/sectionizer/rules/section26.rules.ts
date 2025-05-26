/**
 * Rules for Section 26: Financial Record
 * Generated: 2025-05-26T18:44:25.783Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 26,
  name: "Financial Record",
  ruleCount: 17,
  lastUpdated: "2025-05-26T18:44:25.783Z"
};

/**
 * Rules for matching fields to section 26
 */
export const rules: MatchRule[] = [
  {
    pattern: /^form1[0]/,
    section: 26,
    subsection: undefined,
    confidence: 0.85,
    description: "Fields starting with form1[0] belong to section 26",
  },
  {
    pattern: /TextField11[1]$/,
    section: 26,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[1] belong to section 26",
  },
  {
    pattern: /text/i,
    section: 26,
    subsection: undefined,
    confidence: 0.75,
    description: "text fields belong to section 26",
  },
  {
    pattern: /#field[4]$/,
    section: 26,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with #field[4] belong to section 26",
  },
  {
    pattern: /NumericField2[0]$/,
    section: 26,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with NumericField2[0] belong to section 26",
  },
  {
    pattern: /radio/i,
    section: 26,
    subsection: undefined,
    confidence: 0.75,
    description: "radio fields belong to section 26",
  },
  {
    pattern: /#field[6]$/,
    section: 26,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with #field[6] belong to section 26",
  },
  {
    pattern: /#field[7]$/,
    section: 26,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with #field[7] belong to section 26",
  },
  {
    pattern: /TextField11[2]$/,
    section: 26,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[2] belong to section 26",
  },
  {
    pattern: /TextField11[3]$/,
    section: 26,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[3] belong to section 26",
  },
  {
    pattern: /TextField11[4]$/,
    section: 26,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[4] belong to section 26",
  },
  {
    pattern: /#field[11]$/,
    section: 26,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with #field[11] belong to section 26",
  },
  {
    pattern: /#field[12]$/,
    section: 26,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with #field[12] belong to section 26",
  },
  {
    pattern: /#field[13]$/,
    section: 26,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with #field[13] belong to section 26",
  },
  {
    pattern: /TextField11[5]$/,
    section: 26,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[5] belong to section 26",
  },
  {
    pattern: /2[0]$/,
    section: 26,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with 2[0] belong to section 26",
  },
  {
    pattern: /date/i,
    section: 26,
    subsection: undefined,
    confidence: 0.75,
    description: "date fields belong to section 26",
  }
];

export default {
  sectionInfo,
  rules
};
