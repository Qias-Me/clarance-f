/**
 * Rules for Section 3: Place of Birth
 * Generated: 2025-05-26T14:43:20.974Z
 */
/**
 * Section metadata
 */
export const sectionInfo = {
    section: 3,
    name: "Place of Birth",
    ruleCount: 1,
    lastUpdated: "2025-05-26T14:43:20.974Z"
};
/**
 * Rules for matching fields to section 3
 */
export const rules = [
    {
        pattern: /^form1[0]/,
        section: 3,
        subsection: undefined,
        confidence: 0.85,
        description: "Fields starting with form1[0] belong to section 3",
    }
];
export default {
    sectionInfo,
    rules
};
