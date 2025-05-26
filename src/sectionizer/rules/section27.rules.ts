/**
 * Rules for Section 27: Use of Information Technology Systems
 * Generated: 2025-05-26T18:44:20.857Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 27,
  name: "Use of Information Technology Systems",
  ruleCount: 2,
  lastUpdated: "2025-05-26T18:44:20.857Z"
};

/**
 * Rules for matching fields to section 27
 */
export const rules: MatchRule[] = [
  {
    pattern: /^form1[0]/,
    section: 27,
    subsection: undefined,
    confidence: 0.85,
    description: "Fields starting with form1[0] belong to section 27",
  },
  {
    pattern: /text/i,
    section: 27,
    subsection: undefined,
    confidence: 0.75,
    description: "text fields belong to section 27",
  }
];

export default {
  sectionInfo,
  rules
};
