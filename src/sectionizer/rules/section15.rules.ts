/**
 * Rules for Section 15: Military History
 * Generated: 2025-05-28T12:33:34.147Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 15,
  name: "Military History",
  ruleCount: 3,
  lastUpdated: "2025-05-28T12:33:34.147Z"
};

/**
 * Rules for matching fields to section 15
 */
export const rules: MatchRule[] = [
  {
    pattern: /^form1[0]/,
    section: 15,
    subsection: undefined,
    confidence: 0.85,
    description: "Fields starting with form1[0] belong to section 15",
  },
  {
    pattern: /radio/i,
    section: 15,
    subsection: undefined,
    confidence: 0.75,
    description: "radio fields belong to section 15",
  },
  {
    pattern: /text/i,
    section: 15,
    subsection: undefined,
    confidence: 0.75,
    description: "text fields belong to section 15",
  }
];

export default {
  sectionInfo,
  rules
};
