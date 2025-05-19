/**
 * Rules for Section 1: Section 1
 * Generated: 2025-05-18T18:13:42.997Z
 */

import type { MatchRule } from '../types.js';

export const rules: MatchRule[] = [
  {
    pattern: /^form1/i,
    subSection: '_default',
    confidence: 0.93,
    description: 'Fields starting with \'form1\' (5 fields)',
  },
  {
    pattern: /^form1\\[/i,
    subSection: '_default',
    confidence: 0.93,
    description: 'Fields starting with \'form1[\' (5 fields)',
  },
  {
    pattern: /^form1\\[0/i,
    subSection: '_default',
    confidence: 0.93,
    description: 'Fields starting with \'form1[0\' (5 fields)',
  },
  {
    pattern: /^form1\\[0\\]/i,
    subSection: '_default',
    confidence: 0.93,
    description: 'Fields starting with \'form1[0]\' (5 fields)',
  },
  {
    pattern: /^form1\\[0\\]\\./i,
    subSection: '_default',
    confidence: 0.93,
    description: 'Fields starting with \'form1[0].\' (5 fields)',
  },
  {
    pattern: /^form1\\[0\\]\\.S/i,
    subSection: '_default',
    confidence: 0.93,
    description: 'Fields starting with \'form1[0].S\' (5 fields)',
  },
  {
    pattern: /^form1\\[0\\]\\.Se/i,
    subSection: '_default',
    confidence: 0.93,
    description: 'Fields starting with \'form1[0].Se\' (5 fields)',
  },
  {
    pattern: /^form1\\[0\\]\\.Sec/i,
    subSection: '_default',
    confidence: 0.93,
    description: 'Fields starting with \'form1[0].Sec\' (5 fields)',
  },
  {
    pattern: /^form1\\[0\\]\\.Sect/i,
    subSection: '_default',
    confidence: 0.93,
    description: 'Fields starting with \'form1[0].Sect\' (5 fields)',
  },
  {
    pattern: /^form1\\[0\\]\\.Secti/i,
    subSection: '_default',
    confidence: 0.93,
    description: 'Fields starting with \'form1[0].Secti\' (5 fields)',
  },
  {
    pattern: /^form1\\[0\\]\\.Sectio/i,
    subSection: '_default',
    confidence: 0.93,
    description: 'Fields starting with \'form1[0].Sectio\' (5 fields)',
  },
  {
    pattern: /^form1\\[0\\]\\.Section/i,
    subSection: '_default',
    confidence: 0.93,
    description: 'Fields starting with \'form1[0].Section\' (5 fields)',
  },
  {
    pattern: /^form1\\[0\\]\\.Sections/i,
    subSection: '_default',
    confidence: 0.93,
    description: 'Fields starting with \'form1[0].Sections\' (5 fields)',
  },
  {
    pattern: /^form1\\[0\\]\\.Sections1/i,
    subSection: '_default',
    confidence: 0.93,
    description: 'Fields starting with \'form1[0].Sections1\' (5 fields)',
  },
  {
    pattern: /^form1\\[0\\]\\.Sections1-/i,
    subSection: '_default',
    confidence: 0.93,
    description: 'Fields starting with \'form1[0].Sections1-\' (5 fields)',
  },
  {
    pattern: /^form1\\[0\\]\\.Sections1-6/i,
    subSection: '_default',
    confidence: 0.93,
    description: 'Fields starting with \'form1[0].Sections1-6\' (5 fields)',
  },
  {
    pattern: /form1/i,
    subSection: '_default',
    confidence: 0.87,
    description: 'Distinctive pattern matching 5 fields',
  },
  {
    pattern: /Sections1/i,
    subSection: '_default',
    confidence: 0.87,
    description: 'Distinctive pattern matching 5 fields',
  },
  {
    pattern: /formN\\[N\\]_sectionsN_N\\[N\\]_dropdownlistN\\[N\\]/i,
    subSection: '_default',
    confidence: 0.86,
    description: 'Specific field name match: \'formN[N]_sectionsN_N[N]_dropdownlistN[N]\'',
  },
  {
    pattern: /formN\\[N\\]_sectionsN_N\\[N\\]_textfieldN\\[N\\]/i,
    subSection: '_default',
    confidence: 0.86,
    description: 'Specific field name match: \'formN[N]_sectionsN_N[N]_textfieldN[N]\'',
  }
];
