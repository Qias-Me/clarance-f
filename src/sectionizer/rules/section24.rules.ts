/**
 * Rules for Section 24: Use of Alcohol
 * Generated: 2025-05-26T18:44:23.541Z
 */

import type { MatchRule } from '../types.js';

/**
 * Section metadata
 */
export const sectionInfo = {
  section: 24,
  name: "Use of Alcohol",
  ruleCount: 16,
  lastUpdated: "2025-05-26T18:44:23.541Z"
};

/**
 * Rules for matching fields to section 24
 */
export const rules: MatchRule[] = [
  {
    pattern: /^form1[0]/,
    section: 24,
    subsection: undefined,
    confidence: 0.85,
    description: "Fields starting with form1[0] belong to section 24",
  },
  {
    pattern: /RadioButtonList[0]$/,
    section: 24,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with RadioButtonList[0] belong to section 24",
  },
  {
    pattern: /radio/i,
    section: 24,
    subsection: undefined,
    confidence: 0.75,
    description: "radio fields belong to section 24",
  },
  {
    pattern: /TextField11[5]$/,
    section: 24,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[5] belong to section 24",
  },
  {
    pattern: /text/i,
    section: 24,
    subsection: undefined,
    confidence: 0.75,
    description: "text fields belong to section 24",
  },
  {
    pattern: /RadioButtonList[1]$/,
    section: 24,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with RadioButtonList[1] belong to section 24",
  },
  {
    pattern: /TextField11[6]$/,
    section: 24,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[6] belong to section 24",
  },
  {
    pattern: /TextField11[7]$/,
    section: 24,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[7] belong to section 24",
  },
  {
    pattern: /State[1]$/,
    section: 24,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with State[1] belong to section 24",
  },
  {
    pattern: /dropdown/i,
    section: 24,
    subsection: undefined,
    confidence: 0.75,
    description: "dropdown fields belong to section 24",
  },
  {
    pattern: /TextField11[8]$/,
    section: 24,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[8] belong to section 24",
  },
  {
    pattern: /TextField11[9]$/,
    section: 24,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[9] belong to section 24",
  },
  {
    pattern: /TextField11[10]$/,
    section: 24,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[10] belong to section 24",
  },
  {
    pattern: /date/i,
    section: 24,
    subsection: undefined,
    confidence: 0.75,
    description: "date fields belong to section 24",
  },
  {
    pattern: /RadioButtonList[2]$/,
    section: 24,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with RadioButtonList[2] belong to section 24",
  },
  {
    pattern: /TextField11[11]$/,
    section: 24,
    subsection: undefined,
    confidence: 0.8,
    description: "Fields ending with TextField11[11] belong to section 24",
  }
];

export default {
  sectionInfo,
  rules
};
