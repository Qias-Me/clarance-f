/**
 * Rules for Section 17: Maritial/Relationship Status
 * Generated: 2025-05-28T17:48:23.447Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 17,
  name: "Maritial/Relationship Status",
  ruleCount: 7,
  lastUpdated: "2025-05-28T17:48:23.447Z"
};

/**
 * Rules for matching fields to section 17
 */
export const rules: MatchRule[] = [
  {
    pattern: /form1\\[0\\]\\.Section17/i,
    section: 17,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 17",
  },
  {
    pattern: /form1\\[0\\]\\.section17/i,
    section: 17,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 17",
  },
  {
    pattern: /marital/i,
    section: 17,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 17",
  },
  {
    pattern: /relationship/i,
    section: 17,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 17",
  },
  {
    pattern: /spouse/i,
    section: 17,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 17",
  },
  {
    pattern: /cohabitant/i,
    section: 17,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 17",
  },
  {
    pattern: /partner/i,
    section: 17,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 17",
  }
];

export default {
  sectionInfo,
  rules
};
