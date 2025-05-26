/**
 * Rules for Section 20: Foreign Business, Activities, Government Contacts
 * Generated: 2025-05-26T18:44:29.313Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 20,
  name: "Foreign Business, Activities, Government Contacts",
  ruleCount: 5,
  lastUpdated: "2025-05-26T18:44:29.313Z"
};

/**
 * Rules for matching fields to section 20
 */
export const rules: MatchRule[] = [
  {
    pattern: /^form1[0]/,
    section: 20,
    subsection: undefined,
    confidence: 0.85,
    description: "Fields starting with form1[0] belong to section 20",
  },
  {
    pattern: /date/i,
    section: 20,
    subsection: undefined,
    confidence: 0.75,
    description: "date fields belong to section 20",
  },
  {
    pattern: /radio/i,
    section: 20,
    subsection: undefined,
    confidence: 0.75,
    description: "radio fields belong to section 20",
  },
  {
    pattern: /text/i,
    section: 20,
    subsection: undefined,
    confidence: 0.75,
    description: "text fields belong to section 20",
  },
  {
    pattern: /dropdown/i,
    section: 20,
    subsection: undefined,
    confidence: 0.75,
    description: "dropdown fields belong to section 20",
  }
];

export default {
  sectionInfo,
  rules
};
