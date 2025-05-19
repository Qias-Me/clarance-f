/**
 * Rules for Section 25: Section 25
 * Generated: 2025-05-18T16:19:00.476Z
 */

import type { MatchRule } from '../types.js';

export const rules: MatchRule[] = [
  {
    pattern: /section[_\\. ]*(0*25|25)\\b/i,
    subSection: '_default',
    confidence: 0.9787096774193549,
    description: 'Fields explicitly matching /section[_\. ]*(0*25|25)\b/i (Precision: 98.4%, Adds 61 fields, 1 false positives)',
  }
];
