/**
 * Rules for Section 28: Involvement in Non-Criminal Court Actions
 * Generated: 2025-05-26T18:44:17.737Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 28,
  name: "Involvement in Non-Criminal Court Actions",
  ruleCount: 4,
  lastUpdated: "2025-05-26T18:44:17.737Z"
};

/**
 * Rules for matching fields to section 28
 */
export const rules: MatchRule[] = [
  {
    pattern: /^form1[0]/,
    section: 28,
    subsection: undefined,
    confidence: 0.85,
    description: "Fields starting with form1[0] belong to section 28",
  },
  {
    pattern: /text/i,
    section: 28,
    subsection: undefined,
    confidence: 0.75,
    description: "text fields belong to section 28",
  },
  {
    pattern: /date/i,
    section: 28,
    subsection: undefined,
    confidence: 0.75,
    description: "date fields belong to section 28",
  },
  {
    pattern: /dropdown/i,
    section: 28,
    subsection: undefined,
    confidence: 0.75,
    description: "dropdown fields belong to section 28",
  }
];

export default {
  sectionInfo,
  rules
};
