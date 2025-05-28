/**
 * Rules for Section 20: Foreign Business, Activities, Government Contacts
 * Generated: 2025-05-28T17:48:23.448Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 20,
  name: "Foreign Business, Activities, Government Contacts",
  ruleCount: 13,
  lastUpdated: "2025-05-28T17:48:23.448Z"
};

/**
 * Rules for matching fields to section 20
 */
export const rules: MatchRule[] = [
  {
    pattern: /form1\\[0\\]\\.Section20/i,
    section: 20,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 20",
  },
  {
    pattern: /form1\\[0\\]\\.section20/i,
    section: 20,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 20",
  },
  {
    pattern: /foreign.*business/i,
    section: 20,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 20",
  },
  {
    pattern: /foreign.*government/i,
    section: 20,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 20",
  },
  {
    pattern: /foreign.*activity/i,
    section: 20,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 20",
  },
  {
    pattern: /foreign.*activities/i,
    section: 20,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 20",
  },
  {
    pattern: /foreignbus/i,
    section: 20,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 20",
  },
  {
    pattern: /foreigngov/i,
    section: 20,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 20",
  },
  {
    pattern: /overseas.*business/i,
    section: 20,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 20",
  },
  {
    pattern: /international.*business/i,
    section: 20,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 20",
  },
  {
    pattern: /diplomatic/i,
    section: 20,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 20",
  },
  {
    pattern: /embassy/i,
    section: 20,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 20",
  },
  {
    pattern: /consulate/i,
    section: 20,
    subsection: undefined,
    confidence: 0.9,
    description: "Pattern from sectionFieldPatterns for section 20",
  }
];

export default {
  sectionInfo,
  rules
};
