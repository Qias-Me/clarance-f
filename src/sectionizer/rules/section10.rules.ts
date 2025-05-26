/**
 * Rules for Section 10: Dual/Multiple Citizenship & Foreign Passport Info
 * Generated: 2025-05-26T18:44:23.574Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 10,
  name: "Dual/Multiple Citizenship & Foreign Passport Info",
  ruleCount: 3,
  lastUpdated: "2025-05-26T18:44:23.574Z"
};

/**
 * Rules for matching fields to section 10
 */
export const rules: MatchRule[] = [
  {
    pattern: /^form1[0]/,
    section: 10,
    subsection: undefined,
    confidence: 0.85,
    description: "Fields starting with form1[0] belong to section 10",
  },
  {
    pattern: /dropdown/i,
    section: 10,
    subsection: undefined,
    confidence: 0.75,
    description: "dropdown fields belong to section 10",
  },
  {
    pattern: /text/i,
    section: 10,
    subsection: undefined,
    confidence: 0.75,
    description: "text fields belong to section 10",
  }
];

export default {
  sectionInfo,
  rules
};
