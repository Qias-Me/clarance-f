/**
 * Rules for Section 14: Selective Service
 * Generated: 2025-05-26T14:43:20.961Z
 */
/**
 * Section metadata
 */
export const sectionInfo = {
    section: 14,
    name: "Selective Service",
    ruleCount: 2,
    lastUpdated: "2025-05-26T14:43:20.961Z"
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
        pattern: /text/i,
        section: 14,
        subsection: undefined,
        confidence: 0.75,
        description: "text fields belong to section 14",
    }
];
export default {
    sectionInfo,
    rules
};
