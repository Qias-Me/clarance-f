/**
 * Rules for Section 29: Association Record
 * Modified: 2025-05-18T04:02:00.000Z
 */
export const rules = [
    // ONLY match exact form-specific patterns
    {
        pattern: /^form1\\[0\\]\\.#subform\\[83\\].*section29/i,
        subSection: '_default',
        confidence: 0.99,
        description: 'Fields starting with specific Section 29 subform on page 83 with section29 mention',
    },
    {
        pattern: /^form1\\[0\\]\\.section29(?!.*section13|.*section27|.*section24)/i,
        subSection: '_default',
        confidence: 0.99,
        description: 'Fields exactly starting with form1[0].section29 not in other sections',
    },
    // Explicit section29 mentions with negative lookaheads
    {
        pattern: /^section29(?!.*section13|.*section27|.*section24)/i,
        subSection: '_default',
        confidence: 0.98,
        description: 'Fields starting with section29 not in other sections',
    },
    // Extremely specific subsection markers
    {
        pattern: /^form1\\[0\\]\\.section29_2\\b/i,
        subSection: '2',
        confidence: 0.99,
        description: 'Section 29.2 fields with exact form path',
    },
    {
        pattern: /^form1\\[0\\]\\.section29_3\\b/i,
        subSection: '3',
        confidence: 0.99,
        description: 'Section 29.3 fields with exact form path',
    },
    {
        pattern: /^form1\\[0\\]\\.section29_4\\b/i,
        subSection: '4',
        confidence: 0.99,
        description: 'Section 29.4 fields with exact form path',
    },
    {
        pattern: /^form1\\[0\\]\\.section29_5\\b/i,
        subSection: '5',
        confidence: 0.99,
        description: 'Section 29.5 fields with exact form path',
    },
    // Context-aware section mentions with association record
    {
        pattern: /\\bassociation record\\b.*\\bsection29\\b/i,
        subSection: '_default',
        confidence: 0.95,
        description: 'Association record with explicit section29 mention',
    },
    {
        pattern: /\\bterrorist organization\\b.*\\bsection29\\b/i,
        subSection: '_default',
        confidence: 0.95,
        description: 'Terrorist organization with explicit section29 mention',
    }
];
