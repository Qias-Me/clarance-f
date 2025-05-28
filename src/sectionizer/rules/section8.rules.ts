/**
 * Rules for Section 8: U.S. Passport Information
 * Generated: 2025-05-28T22:50:54.329Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 8,
  name: "U.S. Passport Information",
  ruleCount: 8,
  lastUpdated: "2025-05-28T22:50:54.329Z"
};

/**
 * Rules for matching fields to section 8
 */
export const rules: MatchRule[] = [
  {
    pattern: /form1\\[0\\]\\.Sections7-9\\[0\\]\\.#area\\[0\\]\\.From_Datefield_Name_2\\[0\\]/i,
    section: 8,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 8",
  },
  {
    pattern: /form1\\[0\\]\\.Sections7-9\\[0\\]\\.#area\\[0\\]\\.To_Datefield_Name_2\\[0\\]/i,
    section: 8,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 8",
  },
  {
    pattern: /form1\\[0\\]\\.Sections7-9\\[0\\]\\.#area\\[0\\]\\.#field\\[4\\]/i,
    section: 8,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 8",
  },
  {
    pattern: /form1\\[0\\]\\.Sections7-9\\[0\\]\\.TextField11\\[0\\]/i,
    section: 8,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 8",
  },
  {
    pattern: /form1\\[0\\]\\.Sections7-9\\[0\\]\\.TextField11\\[1\\]/i,
    section: 8,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 8",
  },
  {
    pattern: /form1\\[0\\]\\.Sections7-9\\[0\\]\\.RadioButtonList\\[0\\]/i,
    section: 8,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 8",
  },
  {
    pattern: /form1\\[0\\]\\.Sections7-9\\[0\\]\\.#field\\[23\\]/i,
    section: 8,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 8",
  },
  {
    pattern: /form1\\[0\\]\\.Sections7-9\\[0\\]\\.p3-t68\\[0\\]/i,
    section: 8,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 8",
  }
];

export default {
  sectionInfo,
  rules
};
