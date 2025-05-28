/**
 * Rules for Section 14: Selective Service
 * Generated: 2025-05-28T11:58:48.648Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 14,
  name: "Selective Service",
  ruleCount: 1,
  lastUpdated: "2025-05-28T11:58:48.648Z"
};

/**
 * Rules for matching fields to section 14
 */
export const rules: MatchRule[] = [
  {
    pattern: /^form1[0]/,
    section: 14,
    subsection: undefined,
    confidence: 0.85,
    description: "Fields starting with form1[0] belong to section 14",
  }
];

export default {
  sectionInfo,
  rules
};
