/**
 * Rules for Section 5: Other Names Used
 * Generated: 2025-05-28T23:19:08.562Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 5,
  name: "Other Names Used",
  ruleCount: 6,
  lastUpdated: "2025-05-28T23:19:08.562Z"
};

/**
 * Rules for matching fields to section 5
 */
export const rules: MatchRule[] = [
  {
    pattern: /\\.section5\\[(\\d+)\\]\\.TextField11\\[(\\d+)\\]/i,
    section: 5,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 5",
  },
  {
    pattern: /\\.section5\\[(\\d+)\\]\\.#area\\[(\\d+)\\]\\.From_Datefield_Name_2\\[(\\d+)\\]/i,
    section: 5,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 5",
  },
  {
    pattern: /Sections1-6\\[\\d+\\]\\.section5\\[(\\d+)\\]\\.([^[]+)(?:\\[(\\d+)\\])?/i,
    section: 5,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 5",
  },
  {
    pattern: /Sections1-6\\[\\d+\\]\\.section5\\[\\d+\\]\\.TextField11\\[(\\d+)\\]/i,
    section: 5,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 5",
  },
  {
    pattern: /Sections1-6\\[\\d+\\]\\.section5\\[\\d+\\]\\.#area\\[\\d+\\]\\.From_Datefield_Name_2\\[(\\d+)\\]/i,
    section: 5,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 5",
  },
  {
    pattern: /form1\\[0\\]\\.Sections1-6\\[0\\]\\.section5\\[0\\]/,
    section: 5,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 5",
  }
];

export default {
  sectionInfo,
  rules
};
