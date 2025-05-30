/**
 * Rules for Section 3: Place of Birth
 * Generated: 2025-05-30T14:50:30.758Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 3,
  name: "Place of Birth",
  ruleCount: 4,
  lastUpdated: "2025-05-30T14:50:30.758Z"
};

/**
 * Rules for matching fields to section 3
 */
export const rules: MatchRule[] = [
  {
    pattern: /form1\\[0\\]\\.Sections1-6\\[0\\]\\.TextField11\\[3\\]/i,
    section: 3,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 3",
  },
  {
    pattern: /form1\\[0\\]\\.Sections1-6\\[0\\]\\.TextField11\\[4\\]/i,
    section: 3,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 3",
  },
  {
    pattern: /form1\\[0\\]\\.Sections1-6\\[0\\]\\.School6_State\\[0\\]/i,
    section: 3,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 3",
  },
  {
    pattern: /form1\\[0\\]\\.Sections1-6\\[0\\]\\.DropDownList1\\[0\\]/i,
    section: 3,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 3",
  }
];

export default {
  sectionInfo,
  rules
};
