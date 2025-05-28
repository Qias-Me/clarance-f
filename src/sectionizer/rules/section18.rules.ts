/**
 * Rules for Section 18: Relatives
 * Generated: 2025-05-28T17:48:23.448Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 18,
  name: "Relatives",
  ruleCount: 4,
  lastUpdated: "2025-05-28T17:48:23.448Z"
};

/**
 * Rules for matching fields to section 18
 */
export const rules: MatchRule[] = [
  {
    pattern: /form1\\[0\\]\\.Section18/i,
    section: 18,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 18",
  },
  {
    pattern: /form1\\[0\\]\\.section18/i,
    section: 18,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 18",
  },
  {
    pattern: /sect18/i,
    section: 18,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 18",
  },
  {
    pattern: /section_18/i,
    section: 18,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 18",
  }
];

export default {
  sectionInfo,
  rules
};
