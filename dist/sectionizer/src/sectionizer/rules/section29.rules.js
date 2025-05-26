/**
 * Rules for Section 29: Association Record
 * Generated: 2025-05-26T14:43:26.896Z
 */
/**
 * Section metadata
 */
export const sectionInfo = {
    section: 29,
    name: "Association Record",
    ruleCount: 9,
    lastUpdated: "2025-05-26T14:43:26.896Z"
};
/**
 * Rules for matching fields to section 29
 */
export const rules = [
    {
        pattern: /^form1[0]/,
        section: 29,
        subsection: undefined,
        confidence: 0.85,
        description: "Fields starting with form1[0] belong to section 29",
    },
    {
        pattern: /#field[7]$/,
        section: 29,
        subsection: undefined,
        confidence: 0.8,
        description: "Fields ending with #field[7] belong to section 29",
    },
    {
        pattern: /text/i,
        section: 29,
        subsection: undefined,
        confidence: 0.75,
        description: "text fields belong to section 29",
    },
    {
        pattern: /dropdown/i,
        section: 29,
        subsection: undefined,
        confidence: 0.75,
        description: "dropdown fields belong to section 29",
    },
    {
        pattern: /RadioButtonList[0]$/,
        section: 29,
        subsection: undefined,
        confidence: 0.8,
        description: "Fields ending with RadioButtonList[0] belong to section 29",
    },
    {
        pattern: /radio/i,
        section: 29,
        subsection: undefined,
        confidence: 0.75,
        description: "radio fields belong to section 29",
    },
    {
        pattern: /2[0]$/,
        section: 29,
        subsection: undefined,
        confidence: 0.8,
        description: "Fields ending with 2[0] belong to section 29",
    },
    {
        pattern: /date/i,
        section: 29,
        subsection: undefined,
        confidence: 0.75,
        description: "date fields belong to section 29",
    },
    {
        pattern: /2[1]$/,
        section: 29,
        subsection: undefined,
        confidence: 0.8,
        description: "Fields ending with 2[1] belong to section 29",
    }
];
export default {
    sectionInfo,
    rules
};
