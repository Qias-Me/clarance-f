/**
 * Rules for Section 17: Maritial/Relationship Status
 * Generated: 2025-05-26T14:43:29.124Z
 */
/**
 * Section metadata
 */
export const sectionInfo = {
    section: 17,
    name: "Maritial/Relationship Status",
    ruleCount: 8,
    lastUpdated: "2025-05-26T14:43:29.124Z"
};
/**
 * Rules for matching fields to section 17
 */
export const rules = [
    {
        pattern: /^form1[0]/,
        section: 17,
        subsection: undefined,
        confidence: 0.85,
        description: "Fields starting with form1[0] belong to section 17",
    },
    {
        pattern: /text/i,
        section: 17,
        subsection: undefined,
        confidence: 0.75,
        description: "text fields belong to section 17",
    },
    {
        pattern: /2[0]$/,
        section: 17,
        subsection: undefined,
        confidence: 0.8,
        description: "Fields ending with 2[0] belong to section 17",
    },
    {
        pattern: /date/i,
        section: 17,
        subsection: undefined,
        confidence: 0.75,
        description: "date fields belong to section 17",
    },
    {
        pattern: /radio/i,
        section: 17,
        subsection: undefined,
        confidence: 0.75,
        description: "radio fields belong to section 17",
    },
    {
        pattern: /2[1]$/,
        section: 17,
        subsection: undefined,
        confidence: 0.8,
        description: "Fields ending with 2[1] belong to section 17",
    },
    {
        pattern: /dropdown/i,
        section: 17,
        subsection: undefined,
        confidence: 0.75,
        description: "dropdown fields belong to section 17",
    },
    {
        pattern: /2[2]$/,
        section: 17,
        subsection: undefined,
        confidence: 0.8,
        description: "Fields ending with 2[2] belong to section 17",
    }
];
export default {
    sectionInfo,
    rules
};
