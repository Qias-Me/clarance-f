/**
 * Rules for Section 2: Date of Birth
 * Generated: 2025-05-30T14:50:30.758Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 2,
  name: "Date of Birth",
  ruleCount: 2,
  lastUpdated: "2025-05-30T14:50:30.758Z"
};

/**
 * Rules for matching fields to section 2
 */
export const rules: MatchRule[] = [
  {
    pattern: /form1\\[0\\]\\.Sections1-6\\[0\\]\\.From_Datefield_Name_2\\[0\\]/i,
    section: 2,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 2",
  },
  {
    pattern: /form1\\[0\\]\\.Sections1-6\\[0\\]\\.#field\\[18\\]/i,
    section: 2,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 2",
  }
];

export default {
  sectionInfo,
  rules
};
