/**
 * Rules for Section 23: Illegal Use of Drugs and Drug Activity
 * Generated: 2025-05-26T18:44:24.806Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 23,
  name: "Illegal Use of Drugs and Drug Activity",
  ruleCount: 8,
  lastUpdated: "2025-05-26T18:44:24.806Z"
};

/**
 * Rules for matching fields to section 23
 */
export const rules: MatchRule[] = [
  {
    pattern: /^form1[0]/,
    section: 23,
    subsection: undefined,
    confidence: 0.85,
    description: "Fields starting with form1[0] belong to section 23",
  },
  {
    pattern: /RadioButtonList[2]$/,
    section: 23,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with RadioButtonList[2] belong to section 23",
  },
  {
    pattern: /radio/i,
    section: 23,
    subsection: undefined,
    confidence: 0.75,
    description: "radio fields belong to section 23",
  },
  {
    pattern: /TextField11[8]$/,
    section: 23,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[8] belong to section 23",
  },
  {
    pattern: /text/i,
    section: 23,
    subsection: undefined,
    confidence: 0.75,
    description: "text fields belong to section 23",
  },
  {
    pattern: /TextField11[9]$/,
    section: 23,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[9] belong to section 23",
  },
  {
    pattern: /RadioButtonList[3]$/,
    section: 23,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with RadioButtonList[3] belong to section 23",
  },
  {
    pattern: /date/i,
    section: 23,
    subsection: undefined,
    confidence: 0.75,
    description: "date fields belong to section 23",
  }
];

export default {
  sectionInfo,
  rules
};
