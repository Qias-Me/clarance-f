/**
 * Rules for Section 21: Psycological and Emotional Health
 * Generated: 2025-05-26T18:44:27.698Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 21,
  name: "Psycological and Emotional Health",
  ruleCount: 3,
  lastUpdated: "2025-05-26T18:44:27.698Z"
};

/**
 * Rules for matching fields to section 21
 */
export const rules: MatchRule[] = [
  {
    pattern: /^form1[0]/,
    section: 21,
    subsection: undefined,
    confidence: 0.85,
    description: "Fields starting with form1[0] belong to section 21",
  },
  {
    pattern: /date/i,
    section: 21,
    subsection: undefined,
    confidence: 0.75,
    description: "date fields belong to section 21",
  },
  {
    pattern: /text/i,
    section: 21,
    subsection: undefined,
    confidence: 0.75,
    description: "text fields belong to section 21",
  }
];

export default {
  sectionInfo,
  rules
};
