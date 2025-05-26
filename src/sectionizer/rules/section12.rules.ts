/**
 * Rules for Section 12: Where you went to School
 * Generated: 2025-05-26T18:44:23.549Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 12,
  name: "Where you went to School",
  ruleCount: 9,
  lastUpdated: "2025-05-26T18:44:23.549Z"
};

/**
 * Rules for matching fields to section 12
 */
export const rules: MatchRule[] = [
  {
    pattern: /^form1[0]/,
    section: 12,
    subsection: undefined,
    confidence: 0.85,
    description: "Fields starting with form1[0] belong to section 12",
  },
  {
    pattern: /Cell4[0]$/,
    section: 12,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with Cell4[0] belong to section 12",
  },
  {
    pattern: /Cell5[0]$/,
    section: 12,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with Cell5[0] belong to section 12",
  },
  {
    pattern: /2[1]$/,
    section: 12,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with 2[1] belong to section 12",
  },
  {
    pattern: /date/i,
    section: 12,
    subsection: undefined,
    confidence: 0.75,
    description: "date fields belong to section 12",
  },
  {
    pattern: /text/i,
    section: 12,
    subsection: undefined,
    confidence: 0.75,
    description: "text fields belong to section 12",
  },
  {
    pattern: /dropdown/i,
    section: 12,
    subsection: undefined,
    confidence: 0.75,
    description: "dropdown fields belong to section 12",
  },
  {
    pattern: /Cell1[0]$/,
    section: 12,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with Cell1[0] belong to section 12",
  },
  {
    pattern: /Cell2[0]$/,
    section: 12,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with Cell2[0] belong to section 12",
  }
];

export default {
  sectionInfo,
  rules
};
