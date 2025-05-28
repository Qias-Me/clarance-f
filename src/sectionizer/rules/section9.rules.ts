/**
 * Rules for Section 9: Citizenship
 * Generated: 2025-05-28T22:50:54.329Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 9,
  name: "Citizenship",
  ruleCount: 10,
  lastUpdated: "2025-05-28T22:50:54.329Z"
};

/**
 * Rules for matching fields to section 9
 */
export const rules: MatchRule[] = [
  {
    pattern: /form1\\[0\\]\\.Sections7-9\\[0\\]\\.#field\\[(?!4\\])\\d+\\]/i,
    section: 9,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 9",
  },
  {
    pattern: /form1\\[0\\]\\.Sections7-9\\[0\\]\\.#field\\[25\\]/i,
    section: 9,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 9",
  },
  {
    pattern: /form1\\[0\\]\\.Sections7-9\\[0\\]\\.#field\\[28\\]/i,
    section: 9,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 9",
  },
  {
    pattern: /form1\\[0\\]\\.Sections7-9\\[0\\]\\.RadioButtonList\\[1\\]/i,
    section: 9,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 9",
  },
  {
    pattern: /form1\\[0\\]\\.Sections7-9\\[0\\]\\.Section9/i,
    section: 9,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 9",
  },
  {
    pattern: /form1\\[0\\]\\.Sections7-9\\[0\\]\\.TextField11\\[18\\]/i,
    section: 9,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 9",
  },
  {
    pattern: /form1\\[0\\]\\.Sections7-9\\[0\\]\\.School6_State\\[0\\]/i,
    section: 9,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 9",
  },
  {
    pattern: /form1\\[0\\]\\.Sections7-9\\[0\\]\\.RadioButtonList\\[2\\]/i,
    section: 9,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 9",
  },
  {
    pattern: /form1\\[0\\]\\.Sections7-9\\[0\\]\\.RadioButtonList\\[3\\]/i,
    section: 9,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 9",
  },
  {
    pattern: /form1\\[0\\]\\.Section9\\.1-9\\.4\\[0\\]\\./i,
    section: 9,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 9",
  }
];

export default {
  sectionInfo,
  rules
};
