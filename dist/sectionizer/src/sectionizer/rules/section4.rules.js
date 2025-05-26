/**
 * Rules for Section 4: Social Security Number
 * Generated: 2025-05-26T14:43:26.901Z
 */
/**
 * Section metadata
 */
export const sectionInfo = {
    section: 4,
    name: "Social Security Number",
    ruleCount: 5,
    lastUpdated: "2025-05-26T14:43:26.901Z"
};
/**
 * Rules for matching fields to section 4
 */
export const rules = [
    {
        pattern: /^form1[0]/,
        section: 4,
        subsection: undefined,
        confidence: 0.85,
        description: "Fields starting with form1[0] belong to section 4",
    },
    {
        pattern: /text/i,
        section: 4,
        subsection: undefined,
        confidence: 0.75,
        description: "text fields belong to section 4",
    },
    {
        pattern: /TextField11[9]$/,
        section: 4,
        subsection: undefined,
        confidence: 0.8,
        description: "Fields ending with TextField11[9] belong to section 4",
    },
    {
        pattern: /dropdown/i,
        section: 4,
        subsection: undefined,
        confidence: 0.75,
        description: "dropdown fields belong to section 4",
    },
    {
        pattern: /radio/i,
        section: 4,
        subsection: undefined,
        confidence: 0.75,
        description: "radio fields belong to section 4",
    }
];
export default {
    sectionInfo,
    rules
};
