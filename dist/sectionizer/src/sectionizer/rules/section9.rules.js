/**
 * Rules for Section 9: Citizenship
 * Generated: 2025-05-26T14:43:23.686Z
 */
/**
 * Section metadata
 */
export const sectionInfo = {
    section: 9,
    name: "Citizenship",
    ruleCount: 4,
    lastUpdated: "2025-05-26T14:43:23.686Z"
};
/**
 * Rules for matching fields to section 9
 */
export const rules = [
    {
        pattern: /^form1[0]/,
        section: 9,
        subsection: undefined,
        confidence: 0.85,
        description: "Fields starting with form1[0] belong to section 9",
    },
    {
        pattern: /2[0]$/,
        section: 9,
        subsection: undefined,
        confidence: 0.8,
        description: "Fields ending with 2[0] belong to section 9",
    },
    {
        pattern: /date/i,
        section: 9,
        subsection: undefined,
        confidence: 0.75,
        description: "date fields belong to section 9",
    },
    {
        pattern: /text/i,
        section: 9,
        subsection: undefined,
        confidence: 0.75,
        description: "text fields belong to section 9",
    }
];
export default {
    sectionInfo,
    rules
};
