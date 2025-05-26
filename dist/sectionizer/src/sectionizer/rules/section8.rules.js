/**
 * Rules for Section 8: U.S. Passport Information
 * Generated: 2025-05-26T14:43:20.952Z
 */
/**
 * Section metadata
 */
export const sectionInfo = {
    section: 8,
    name: "U.S. Passport Information",
    ruleCount: 2,
    lastUpdated: "2025-05-26T14:43:20.952Z"
};
/**
 * Rules for matching fields to section 8
 */
export const rules = [
    {
        pattern: /^form1[0]/,
        section: 8,
        subsection: undefined,
        confidence: 0.85,
        description: "Fields starting with form1[0] belong to section 8",
    },
    {
        pattern: /text/i,
        section: 8,
        subsection: undefined,
        confidence: 0.75,
        description: "text fields belong to section 8",
    }
];
export default {
    sectionInfo,
    rules
};
