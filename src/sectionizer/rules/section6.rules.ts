/**
 * Rules for Section 6: Your Identifying Information
 * Generated: 2025-05-26T18:44:17.753Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 6,
  name: "Your Identifying Information",
  ruleCount: 1,
  lastUpdated: "2025-05-26T18:44:17.753Z"
};

/**
 * Rules for matching fields to section 6
 */
export const rules: MatchRule[] = [
  {
    pattern: /^form1[0]/,
    section: 6,
    subsection: undefined,
    confidence: 0.85,
    description: "Fields starting with form1[0] belong to section 6",
  }
];

export default {
  sectionInfo,
  rules
};
