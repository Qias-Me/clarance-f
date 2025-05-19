/**
 * Rules for Section 18: Section 18
 * Generated: 2025-05-18T18:13:43.069Z
 */

import type { MatchRule } from '../types.js';

export const rules: MatchRule[] = [
  {
    pattern: /\\bsection18_/i,
    subSection: '_default',
    confidence: 0.98,
    description: 'Fields explicitly matching /\bsection18_/i',
  },
  {
    pattern: /foreign.*travel/i,
    subSection: '_default',
    confidence: 0.95,
    description: 'Foreign travel fields',
  },
  {
    pattern: /passport/i,
    subSection: '_default',
    confidence: 0.95,
    description: 'Passport fields',
  },
  {
    pattern: /travel/i,
    subSection: '_default',
    confidence: 0.9,
    description: 'Travel fields',
  }
];
