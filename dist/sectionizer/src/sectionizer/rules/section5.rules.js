/**
 * Rules for Section 5: Section 5
 * Generated: 2025-05-18T16:19:00.322Z
 */
export const rules = [
    {
        pattern: /section[_\\. ]*(0*5|5)\\b/i,
        subSection: '_default',
        confidence: 0.98,
        description: 'Fields explicitly matching /section[_\. ]*(0*5|5)\b/i (Precision: 100%, Recall: 100.0%, 45/45 fields)',
    },
    {
        pattern: /\\bsection5\\b/i,
        subSection: '_default',
        confidence: 0.98,
        description: 'Fields explicitly matching /\bsection5\b/i (Precision: 100%, Recall: 100.0%, 45/45 fields)',
    },
    {
        pattern: /section5/i,
        subSection: '_default',
        confidence: 0.98,
        description: 'Distinctive pattern matching 45 fields (Precision: 100%, Recall: 100.0%, 45/45 fields)',
    }
];
