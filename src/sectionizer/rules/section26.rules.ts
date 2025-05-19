/**
 * Rules for Section 26: Section 26
 * Generated: 2025-05-18T16:19:00.483Z
 */

import type { MatchRule } from '../types.js';

export const rules: MatchRule[] = [
  {
    pattern: /section[_\\. ]*(0*26|26)\\b/i,
    subSection: '_default',
    confidence: 0.9785714285714286,
    description: 'Fields explicitly matching /section[_\. ]*(0*26|26)\b/i (Precision: 98.2%, Adds 55 fields, 1 false positives)',
  }
];
