/**
 * Rules for Section 4: Social Security Number
 * Generated: 2025-05-30T14:50:30.759Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 4,
  name: "Social Security Number",
  ruleCount: 14,
  lastUpdated: "2025-05-30T14:50:30.759Z"
};

/**
 * Rules for matching fields to section 4
 */
export const rules: MatchRule[] = [
  {
    pattern: /\\.SSN\\[\\d+\\]/i,
    section: 4,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 4",
  },
  {
    pattern: /form1\\[0\\]\\.Sections1-6\\[0\\]\\.SSN\\[\\d+\\]/i,
    section: 4,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 4",
  },
  {
    pattern: /form1\\[0\\]\\.Sections7-9\\[0\\]\\.SSN\\[\\d+\\]/i,
    section: 4,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 4",
  },
  {
    pattern: /form1\\[0\\]\\.Section\\d+.*\\.SSN\\[\\d+\\]/i,
    section: 4,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 4",
  },
  {
    pattern: /form1\\[0\\]\\.section\\d+.*\\.SSN\\[\\d+\\]/i,
    section: 4,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 4",
  },
  {
    pattern: /form1\\[0\\]\\.#subform\\[\\d+\\]\\.SSN\\[\\d+\\]/i,
    section: 4,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 4",
  },
  {
    pattern: /form1\\[0\\]\\.#subform\\[\\d+\\]\\.#subform\\[\\d+\\]\\.SSN\\[\\d+\\]/i,
    section: 4,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 4",
  },
  {
    pattern: /form1\\[0\\]\\.continuation\\d*\\[0\\]\\.SSN\\[\\d+\\]/i,
    section: 4,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 4",
  },
  {
    pattern: /form1\\[0\\]\\.Section_\\d+.*\\.SSN\\[\\d+\\]/i,
    section: 4,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 4",
  },
  {
    pattern: /form1\\[0\\]\\.Section18_3\\[5\\]\\.SSN\\[0\\]/i,
    section: 4,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 4",
  },
  {
    pattern: /form1\\[0\\]\\.Section18_\\d+\\[\\d+\\]\\.SSN\\[\\d+\\]/i,
    section: 4,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 4",
  },
  {
    pattern: /form1\\[0\\]\\.Section\\d+_\\d+\\[\\d+\\]\\.SSN\\[\\d+\\]/i,
    section: 4,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 4",
  },
  {
    pattern: /form1\\[0\\]\\.Sections1-6\\[0\\]\\.CheckBox1\\[0\\]/i,
    section: 4,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 4",
  },
  {
    pattern: /form1\\[0\\]\\.Sections1-6\\[0\\]\\.RadioButtonList\\[0\\]/i,
    section: 4,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 4",
  }
];

export default {
  sectionInfo,
  rules
};
