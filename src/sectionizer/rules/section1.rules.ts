/**
 * Rules for Section 1: Full Name
 * Generated: 2025-05-28T23:19:08.561Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 1,
  name: "Full Name",
  ruleCount: 4,
  lastUpdated: "2025-05-28T23:19:08.561Z"
};

/**
 * Rules for matching fields to section 1
 */
export const rules: MatchRule[] = [
  {
    pattern: /form1\\[0\\]\\.Sections1-6\\[0\\]\\.TextField11\\[0\\]/i,
    section: 1,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 1",
  },
  {
    pattern: /form1\\[0\\]\\.Sections1-6\\[0\\]\\.TextField11\\[1\\]/i,
    section: 1,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 1",
  },
  {
    pattern: /form1\\[0\\]\\.Sections1-6\\[0\\]\\.TextField11\\[2\\]/i,
    section: 1,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 1",
  },
  {
    pattern: /form1\\[0\\]\\.Sections1-6\\[0\\]\\.suffix\\[0\\]/i,
    section: 1,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 1",
  }
];

export default {
  sectionInfo,
  rules
};
