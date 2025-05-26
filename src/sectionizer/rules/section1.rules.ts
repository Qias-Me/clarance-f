/**
 * Rules for Section 1: Full Name
 * Generated: 2025-05-26T18:44:17.765Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 1,
  name: "Full Name",
  ruleCount: 1,
  lastUpdated: "2025-05-26T18:44:17.765Z"
};

/**
 * Rules for matching fields to section 1
 */
export const rules: MatchRule[] = [
  {
    pattern: /^form1[0]/,
    section: 1,
    subsection: undefined,
    confidence: 0.85,
    description: "Fields starting with form1[0] belong to section 1",
  }
];

export default {
  sectionInfo,
  rules
};
