/**
 * Rules for Section 7: Your Contact Information
 * Generated: 2025-05-26T14:43:20.944Z
 */
/**
 * Section metadata
 */
export const sectionInfo = {
    section: 7,
    name: "Your Contact Information",
    ruleCount: 2,
    lastUpdated: "2025-05-26T14:43:20.944Z"
};
/**
 * Rules for matching fields to section 7
 */
export const rules = [
    {
        pattern: /^form1[0]/,
        section: 7,
        subsection: undefined,
        confidence: 0.85,
        description: "Fields starting with form1[0] belong to section 7",
    },
    {
        pattern: /text/i,
        section: 7,
        subsection: undefined,
        confidence: 0.75,
        description: "text fields belong to section 7",
    }
];
export default {
    sectionInfo,
    rules
};
