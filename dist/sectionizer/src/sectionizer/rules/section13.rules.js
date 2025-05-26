/**
 * Rules for Section 13: Employment Acitivites
 * Generated: 2025-05-26T14:43:33.127Z
 */
/**
 * Section metadata
 */
export const sectionInfo = {
    section: 13,
    name: "Employment Acitivites",
    ruleCount: 8,
    lastUpdated: "2025-05-26T14:43:33.127Z"
};
/**
 * Rules for matching fields to section 13
 */
export const rules = [
    {
        pattern: /^form1[0]/,
        section: 13,
        subsection: undefined,
        confidence: 0.85,
        description: "Fields starting with form1[0] belong to section 13",
    },
    {
        pattern: /2[2]$/,
        section: 13,
        subsection: undefined,
        confidence: 0.8,
        description: "Fields ending with 2[2] belong to section 13",
    },
    {
        pattern: /date/i,
        section: 13,
        subsection: undefined,
        confidence: 0.75,
        description: "date fields belong to section 13",
    },
    {
        pattern: /2[3]$/,
        section: 13,
        subsection: undefined,
        confidence: 0.8,
        description: "Fields ending with 2[3] belong to section 13",
    },
    {
        pattern: /text/i,
        section: 13,
        subsection: undefined,
        confidence: 0.75,
        description: "text fields belong to section 13",
    },
    {
        pattern: /dropdown/i,
        section: 13,
        subsection: undefined,
        confidence: 0.75,
        description: "dropdown fields belong to section 13",
    },
    {
        pattern: /2[4]$/,
        section: 13,
        subsection: undefined,
        confidence: 0.8,
        description: "Fields ending with 2[4] belong to section 13",
    },
    {
        pattern: /radio/i,
        section: 13,
        subsection: undefined,
        confidence: 0.75,
        description: "radio fields belong to section 13",
    }
];
export default {
    sectionInfo,
    rules
};
