/**
 * Rules for Section 15: Military History
 * Generated: 2025-05-26T18:44:23.568Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 15,
  name: "Military History",
  ruleCount: 4,
  lastUpdated: "2025-05-26T18:44:23.568Z"
};

/**
 * Rules for matching fields to section 15
 */
export const rules: MatchRule[] = [
  {
    pattern: /^form1[0]/,
    section: 15,
    subsection: undefined,
    confidence: 0.85,
    description: "Fields starting with form1[0] belong to section 15",
  },
  {
    pattern: /text/i,
    section: 15,
    subsection: undefined,
    confidence: 0.75,
    description: "text fields belong to section 15",
  },
  {
    pattern: /dropdown/i,
    section: 15,
    subsection: undefined,
    confidence: 0.75,
    description: "dropdown fields belong to section 15",
  },
  {
    pattern: /date/i,
    section: 15,
    subsection: undefined,
    confidence: 0.75,
    description: "date fields belong to section 15",
  }
];

export default {
  sectionInfo,
  rules
};
