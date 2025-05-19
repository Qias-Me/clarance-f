/**
 * Rules for Section 10: Section 10
 * Generated: 2025-05-18T16:19:00.339Z
 */

import type { MatchRule } from '../types.js';

export const rules: MatchRule[] = [
  {
    pattern: /section[_\\. ]*(0*10|10)\\b/i,
    subSection: '_default',
    confidence: 0.9787096774193549,
    description: 'Fields explicitly matching /section[_\. ]*(0*10|10)\b/i (Precision: 98.4%, Adds 122 fields, 2 false positives)',
  }
];
