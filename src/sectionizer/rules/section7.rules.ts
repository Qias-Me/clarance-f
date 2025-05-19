/**
 * Rules for Section 7: Your Contact Information
 * Generated: 2025-05-18T02:45:32.142Z
 */

import type { MatchRule } from '../types.js';

export const rules: MatchRule[] = [
  {
    pattern: /form1\[0\]\.Sections7-9\[0\]\.TextField11\[13\]/i,
    subSection: '_default',
    confidence: 0.99,
    description: 'Home email address field - Section 7 Contact Info',
  },
  {
    pattern: /form1\[0\]\.Sections7-9\[0\]\.TextField11\[14\]/i,
    subSection: '_default',
    confidence: 0.99,
    description: 'Work email address field - Section 7 Contact Info',
  },
  {
    pattern: /form1\[0\]\.Sections7-9\[0\]\.p3-t68\[\d+\]/i,
    subSection: '_default',
    confidence: 0.99,
    description: 'Telephone number fields - Section 7 Contact Info',
  },
  {
    pattern: /form1\[0\]\.Sections7-9\[0\]\.TextField11\[1[567]\]/i,
    subSection: '_default',
    confidence: 0.99,
    description: 'Phone extension fields - Section 7 Contact Info',
  },
  {
    pattern: /form1\[0\]\.Sections7-9\[0\]\.#field\[3[3-9]|4[0-5]\]/i,
    subSection: '_default',
    confidence: 0.99,
    description: 'Phone checkbox fields (Day/Night/International) - Section 7 Contact Info',
  },
  {
    pattern: /sect7(phone|email|Extension)/i,
    subSection: '_default',
    confidence: 0.99,
    description: 'Fields with sect7phone, sect7email, or sect7Extension in the value',
  },
  {
    pattern: /your contact information/i,
    subSection: '_default',
    confidence: 0.85,
    description: 'Fields with "your contact information" in the label',
  }
];

export const exclude: MatchRule[] = [
  {
    pattern: /RadioButtonList\[0\]/i,
    subSection: '_default',
    confidence: 0.95,
    description: 'Exclude RadioButtonList fields as they typically belong to citizenship sections',
  },
  {
    pattern: /DropDownList12\[0\]/i,
    subSection: '_default',
    confidence: 0.95,
    description: 'Exclude country dropdown fields as they belong to citizenship sections',
  },
  {
    pattern: /School6_State\[0\]/i,
    subSection: '_default',
    confidence: 0.95,
    description: 'Exclude state dropdown fields as they belong to other sections',
  },
  {
    pattern: /suffix\[\d+\]/i,
    subSection: '_default',
    confidence: 0.95,
    description: 'Exclude name suffix fields as they belong to identification sections',
  },
  {
    pattern: /sect9/i,
    subSection: '_default',
    confidence: 0.95,
    description: 'Exclude any field with "sect9" in the value',
  },
  {
    pattern: /DocumentNumber/i,
    subSection: '_default',
    confidence: 0.95,
    description: 'Exclude document number fields as they belong to citizenship sections',
  }
]; 