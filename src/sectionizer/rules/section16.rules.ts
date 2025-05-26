/**
 * Rules for Section 16: People Who Know You Well
 * Generated: 2025-05-26T18:44:23.584Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 16,
  name: "People Who Know You Well",
  ruleCount: 3,
  lastUpdated: "2025-05-26T18:44:23.584Z"
};

/**
 * Rules for matching fields to section 16
 */
export const rules: MatchRule[] = [
  {
    pattern: /^form1[0]/,
    section: 16,
    subsection: undefined,
    confidence: 0.85,
    description: "Fields starting with form1[0] belong to section 16",
  },
  {
    pattern: /text/i,
    section: 16,
    subsection: undefined,
    confidence: 0.75,
    description: "text fields belong to section 16",
  },
  {
    pattern: /date/i,
    section: 16,
    subsection: undefined,
    confidence: 0.75,
    description: "date fields belong to section 16",
  }
];

export default {
  sectionInfo,
  rules
};
