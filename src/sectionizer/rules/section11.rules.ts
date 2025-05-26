/**
 * Rules for Section 11: Where You Have Lived
 * Generated: 2025-05-26T18:44:25.778Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 11,
  name: "Where You Have Lived",
  ruleCount: 15,
  lastUpdated: "2025-05-26T18:44:25.778Z"
};

/**
 * Rules for matching fields to section 11
 */
export const rules: MatchRule[] = [
  {
    pattern: /^form1[0]/,
    section: 11,
    subsection: undefined,
    confidence: 0.85,
    description: "Fields starting with form1[0] belong to section 11",
  },
  {
    pattern: /TextField11[14]$/,
    section: 11,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[14] belong to section 11",
  },
  {
    pattern: /text/i,
    section: 11,
    subsection: undefined,
    confidence: 0.75,
    description: "text fields belong to section 11",
  },
  {
    pattern: /TextField11[2]$/,
    section: 11,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[2] belong to section 11",
  },
  {
    pattern: /TextField11[5]$/,
    section: 11,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[5] belong to section 11",
  },
  {
    pattern: /TextField11[16]$/,
    section: 11,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[16] belong to section 11",
  },
  {
    pattern: /TextField11[20]$/,
    section: 11,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[20] belong to section 11",
  },
  {
    pattern: /TextField11[22]$/,
    section: 11,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[22] belong to section 11",
  },
  {
    pattern: /TextField11[9]$/,
    section: 11,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[9] belong to section 11",
  },
  {
    pattern: /#field[5]$/,
    section: 11,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with #field[5] belong to section 11",
  },
  {
    pattern: /Cell2[0]$/,
    section: 11,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with Cell2[0] belong to section 11",
  },
  {
    pattern: /Cell3[0]$/,
    section: 11,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with Cell3[0] belong to section 11",
  },
  {
    pattern: /Cell4[0]$/,
    section: 11,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with Cell4[0] belong to section 11",
  },
  {
    pattern: /Cell3[1]$/,
    section: 11,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with Cell3[1] belong to section 11",
  },
  {
    pattern: /#field[4]$/,
    section: 11,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with #field[4] belong to section 11",
  }
];

export default {
  sectionInfo,
  rules
};
