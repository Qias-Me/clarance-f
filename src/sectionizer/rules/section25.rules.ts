/**
 * Rules for Section 25: Investigations and Clearance
 * Generated: 2025-05-26T18:44:20.852Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 25,
  name: "Investigations and Clearance",
  ruleCount: 3,
  lastUpdated: "2025-05-26T18:44:20.852Z"
};

/**
 * Rules for matching fields to section 25
 */
export const rules: MatchRule[] = [
  {
    pattern: /^form1[0]/,
    section: 25,
    subsection: undefined,
    confidence: 0.85,
    description: "Fields starting with form1[0] belong to section 25",
  },
  {
    pattern: /text/i,
    section: 25,
    subsection: undefined,
    confidence: 0.75,
    description: "text fields belong to section 25",
  },
  {
    pattern: /date/i,
    section: 25,
    subsection: undefined,
    confidence: 0.75,
    description: "date fields belong to section 25",
  }
];

export default {
  sectionInfo,
  rules
};
