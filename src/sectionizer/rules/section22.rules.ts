/**
 * Rules for Section 22: Police Record
 * Generated: 2025-05-26T18:44:25.770Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 22,
  name: "Police Record",
  ruleCount: 15,
  lastUpdated: "2025-05-26T18:44:25.770Z"
};

/**
 * Rules for matching fields to section 22
 */
export const rules: MatchRule[] = [
  {
    pattern: /^form1[0]/,
    section: 22,
    subsection: undefined,
    confidence: 0.85,
    description: "Fields starting with form1[0] belong to section 22",
  },
  {
    pattern: /Cell3[0]$/,
    section: 22,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with Cell3[0] belong to section 22",
  },
  {
    pattern: /Cell4[0]$/,
    section: 22,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with Cell4[0] belong to section 22",
  },
  {
    pattern: /#field[4]$/,
    section: 22,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with #field[4] belong to section 22",
  },
  {
    pattern: /Cell1[0]$/,
    section: 22,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with Cell1[0] belong to section 22",
  },
  {
    pattern: /Cell2[0]$/,
    section: 22,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with Cell2[0] belong to section 22",
  },
  {
    pattern: /2[0]$/,
    section: 22,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with 2[0] belong to section 22",
  },
  {
    pattern: /date/i,
    section: 22,
    subsection: undefined,
    confidence: 0.75,
    description: "date fields belong to section 22",
  },
  {
    pattern: /2[1]$/,
    section: 22,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with 2[1] belong to section 22",
  },
  {
    pattern: /TextField11[0]$/,
    section: 22,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[0] belong to section 22",
  },
  {
    pattern: /text/i,
    section: 22,
    subsection: undefined,
    confidence: 0.75,
    description: "text fields belong to section 22",
  },
  {
    pattern: /radio/i,
    section: 22,
    subsection: undefined,
    confidence: 0.75,
    description: "radio fields belong to section 22",
  },
  {
    pattern: /TextField11[1]$/,
    section: 22,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[1] belong to section 22",
  },
  {
    pattern: /TextField11[2]$/,
    section: 22,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[2] belong to section 22",
  },
  {
    pattern: /State[0]$/,
    section: 22,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with State[0] belong to section 22",
  }
];

export default {
  sectionInfo,
  rules
};
