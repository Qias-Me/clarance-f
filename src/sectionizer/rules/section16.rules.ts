/**
 * Rules for Section 16: People Who Know You Well
 * Generated: 2025-05-28T17:48:23.447Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 16,
  name: "People Who Know You Well",
  ruleCount: 9,
  lastUpdated: "2025-05-28T17:48:23.447Z"
};

/**
 * Rules for matching fields to section 16
 */
export const rules: MatchRule[] = [
  {
    pattern: /references/i,
    section: 16,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 16",
  },
  {
    pattern: /people who know/i,
    section: 16,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 16",
  },
  {
    pattern: /know (you )?well/i,
    section: 16,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 16",
  },
  {
    pattern: /verifiers?/i,
    section: 16,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 16",
  },
  {
    pattern: /form1\\[0\\]\\.Section16/i,
    section: 16,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 16",
  },
  {
    pattern: /form1\\[0\\]\\.section16/i,
    section: 16,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 16",
  },
  {
    pattern: /reference\\d+/i,
    section: 16,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 16",
  },
  {
    pattern: /section ?16/i,
    section: 16,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 16",
  },
  {
    pattern: /\\bsect ?16\\b/i,
    section: 16,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 16",
  }
];

export default {
  sectionInfo,
  rules
};
