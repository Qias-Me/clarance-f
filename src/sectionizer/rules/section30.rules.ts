/**
 * Rules for Section 30: Continuation Space
 * Generated: 2025-05-28T17:48:23.450Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 30,
  name: "Continuation Space",
  ruleCount: 11,
  lastUpdated: "2025-05-28T17:48:23.450Z"
};

/**
 * Rules for matching fields to section 30
 */
export const rules: MatchRule[] = [
  {
    pattern: /form1\\[0\\]\\.continuation/i,
    section: 30,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 30",
  },
  {
    pattern: /form1\\[0\\]\\.Section30/i,
    section: 30,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 30",
  },
  {
    pattern: /form1\\[0\\]\\.section30/i,
    section: 30,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 30",
  },
  {
    pattern: /continuation/i,
    section: 30,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 30",
  },
  {
    pattern: /additional.*information/i,
    section: 30,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 30",
  },
  {
    pattern: /comments/i,
    section: 30,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 30",
  },
  {
    pattern: /remarks/i,
    section: 30,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 30",
  },
  {
    pattern: /notes/i,
    section: 30,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 30",
  },
  {
    pattern: /supplemental/i,
    section: 30,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 30",
  },
  {
    pattern: /overflow/i,
    section: 30,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 30",
  },
  {
    pattern: /form1\\[0\\]\\.#subform\\[\\d+\\]\\..*unclassified/i,
    section: 30,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 30",
  }
];

export default {
  sectionInfo,
  rules
};
