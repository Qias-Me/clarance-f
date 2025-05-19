/**
 * Rules for Section 24: Use of Alcohol
 * Modified: 2025-05-18T04:04:00.000Z
 */
export const rules = [
    // Exact form field patterns ONLY
    {
        pattern: /^form1\[0\]\.Section24\[0\](?!.*section13|.*section27|.*section29)/i,
        subSection: '_default',
        confidence: 0.99,
        description: 'Exact match for Section 24 area not in other sections',
    },
    {
        pattern: /^form1\[0\]\.section24(?!.*section13|.*section27|.*section29)/i,
        subSection: '_default',
        confidence: 0.99,
        description: 'Exact form section 24 match not in other sections',
    },
    // Subsection patterns with exact form paths
    {
        pattern: /^form1\[0\]\.section24_2(?!.*section13|.*section27|.*section29)/i,
        subSection: '2',
        confidence: 0.99,
        description: 'Exact Section 24.2 fields',
    },
    {
        pattern: /^form1\[0\]\.section24_3(?!.*section13|.*section27|.*section29)/i,
        subSection: '3',
        confidence: 0.99,
        description: 'Exact Section 24.3 fields',
    },
    {
        pattern: /^form1\[0\]\.section24_4(?!.*section13|.*section27|.*section29)/i,
        subSection: '4',
        confidence: 0.99,
        description: 'Exact Section 24.4 fields',
    },
    // Context-specific patterns with section24 reference
    {
        pattern: /\buse of alcohol\b.*\bsection24\b/i,
        subSection: '_default',
        confidence: 0.95,
        description: 'Use of alcohol with explicit section 24 mention',
    },
    {
        pattern: /\bsection24\b.*\balcohol\b/i,
        subSection: '_default',
        confidence: 0.95,
        description: 'Section 24 with alcohol mention',
    },
    // Form-specific alcohol patterns that only apply to known section 24 forms
    {
        pattern: /^form1\[0\]\.Section24\[0\].*alcohol/i,
        subSection: '_default',
        confidence: 0.95,
        description: 'Section 24 form with alcohol mention',
    },
    {
        pattern: /^form1\[0\]\.Section24\[0\].*drinking/i,
        subSection: '_default',
        confidence: 0.95,
        description: 'Section 24 form with drinking mention',
    },
    // Only match these patterns with very high confidence in form layout
    {
        pattern: /^form1\[0\]\.Section24.*dui/i,
        subSection: '_default',
        confidence: 0.95,
        description: 'Section 24 form with DUI mention',
    },
    {
        pattern: /^form1\[0\]\.Section24.*dwi/i,
        subSection: '_default',
        confidence: 0.95,
        description: 'Section 24 form with DWI mention',
    }
];
