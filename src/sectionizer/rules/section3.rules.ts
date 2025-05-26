/**
 * Rules for Section 3: Place of Birth
 * Generated: 2025-05-26T18:44:17.770Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 3,
  name: "Place of Birth",
  ruleCount: 1,
  lastUpdated: "2025-05-26T18:44:17.770Z"
};

/**
 * Rules for matching fields to section 3
 */
export const rules: MatchRule[] = [
  {
    pattern: /^form1[0]/,
    section: 3,
    subsection: undefined,
    confidence: 0.85,
    description: "Fields starting with form1[0] belong to section 3",
  }
];

export default {
  sectionInfo,
  rules
};
