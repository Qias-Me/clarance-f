/**
 * Rules for Section 10: Dual/Multiple Citizenship & Foreign Passport Info
 * Generated: 2025-05-26T14:43:34.313Z
 */
/**
 * Section metadata
 */
export const sectionInfo = {
    section: 10,
    name: "Dual/Multiple Citizenship & Foreign Passport Info",
    ruleCount: 3,
    lastUpdated: "2025-05-26T14:43:34.313Z"
};
/**
 * Rules for matching fields to section 10
 */
export const rules = [
    {
        pattern: /^form1[0]/,
        section: 10,
        subsection: undefined,
        confidence: 0.85,
        description: "Fields starting with form1[0] belong to section 10",
    },
    {
        pattern: /2[0]$/,
        section: 10,
        subsection: undefined,
        confidence: 0.8,
        description: "Fields ending with 2[0] belong to section 10",
    },
    {
        pattern: /date/i,
        section: 10,
        subsection: undefined,
        confidence: 0.75,
        description: "date fields belong to section 10",
    }
];
export default {
    sectionInfo,
    rules
};
