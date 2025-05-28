/**
 * Rules for Section 13: Employment Acitivites
 * Generated: 2025-05-28T17:48:23.447Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 13,
  name: "Employment Acitivites",
  ruleCount: 2,
  lastUpdated: "2025-05-28T17:48:23.447Z"
};

/**
 * Rules for matching fields to section 13
 */
export const rules: MatchRule[] = [
  {
    pattern: /form1\\[0\\]\\.Section13/i,
    section: 13,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 13",
  },
  {
    pattern: /form1\\[0\\]\\.section13/i,
    section: 13,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 13",
  }
];

export default {
  sectionInfo,
  rules
};
