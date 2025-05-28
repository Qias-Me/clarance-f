/**
 * Rules for Section 14: Selective Service
 * Generated: 2025-05-26T22:59:49.863Z
 */
/**
 * Section metadata
 */
export const sectionInfo = {
    section: 14,
    name: "Selective Service",
    ruleCount: 4,
    lastUpdated: "2025-05-26T22:59:49.863Z"
};
/**
 * Rules for matching fields to section 14
 */
export const rules = [
    {
        pattern: /^form1[0]/,
        section: 14,
        subsection: undefined,
        confidence: 0.85,
        description: "Fields starting with form1[0] belong to section 14",
    },
    {
        pattern: /TextField11[1]$/,
        section: 14,
        subsection: undefined,
        confidence: 0.8,
        description: "Fields ending with TextField11[1] belong to section 14",
    },
    {
        pattern: /text/i,
        section: 14,
        subsection: undefined,
        confidence: 0.75,
        description: "text fields belong to section 14",
    },
    {
        pattern: /t68[3]$/,
        section: 14,
        subsection: undefined,
        confidence: 0.8,
        description: "Fields ending with t68[3] belong to section 14",
    }
];
export default {
    sectionInfo,
    rules
};
