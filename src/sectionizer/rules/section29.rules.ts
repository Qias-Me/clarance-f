/**
 * Rules for Section 29: Association Record
 * Generated: 2025-05-28T17:48:23.450Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 29,
  name: "Association Record",
  ruleCount: 4,
  lastUpdated: "2025-05-28T17:48:23.450Z"
};

/**
 * Rules for matching fields to section 29
 */
export const rules: MatchRule[] = [
  {
    pattern: /association/i,
    section: 29,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 29",
  },
  {
    pattern: /organization/i,
    section: 29,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 29",
  },
  {
    pattern: /membership/i,
    section: 29,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 29",
  },
  {
    pattern: /^form1\\[0\\]\\.Section29/i,
    section: 29,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 29",
  }
];

export default {
  sectionInfo,
  rules
};
