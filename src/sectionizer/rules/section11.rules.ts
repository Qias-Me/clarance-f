/**
 * Rules for Section 11: Where You Have Lived
 * Generated: 2025-05-28T17:48:23.446Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 11,
  name: "Where You Have Lived",
  ruleCount: 1,
  lastUpdated: "2025-05-28T17:48:23.446Z"
};

/**
 * Rules for matching fields to section 11
 */
export const rules: MatchRule[] = [
  {
    pattern: /form1\\[0\\]\\.Section11/i,
    section: 11,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 11",
  }
];

export default {
  sectionInfo,
  rules
};
