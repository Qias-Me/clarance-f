/**
 * Mapping utility for SF-86 form sections to components and contexts
 * 
 * This utility maps section numbers from field-hierarchy.json to their corresponding
 * React components in app/components/Rendered and context files in app/state/contexts/sections
 */

/**
 * Section information interface
 */
export interface SectionInfo {
  id: number;
  name: string;
  componentName: string;
  contextFile: string;
}

/**
 * Subsection information interface
 */
export interface SubsectionInfo {
  id: number;
  name: string;
  componentName: string;
  contextFile: string;
  parentSectionId: number;
}

/**
 * Comprehensive mapping of all 30 form sections to their components and context files
 */
export const sectionMapping: Record<number, SectionInfo> = {
  1: {
    id: 1,
    name: "Full Name",
    componentName: "RenderBasicInfo",
    contextFile: "personalInfo"
  },
  2: {
    id: 2,
    name: "Date of Birth",
    componentName: "RenderBirthInfo",
    contextFile: "birthInfo"
  },
  3: {
    id: 3,
    name: "Place of Birth",
    componentName: "RenderBirthInfo", // Part of birth info component
    contextFile: "birthInfo"
  },
  4: {
    id: 4,
    name: "Social Security Number",
    componentName: "RenderAcknowledgementInfo",
    contextFile: "aknowledgementInfo"
  },
  5: {
    id: 5,
    name: "Other Names Used",
    componentName: "RenderNames",
    contextFile: "namesInfo"
  },
  6: {
    id: 6,
    name: "Your Identifying Information",
    componentName: "RenderPhysicals",
    contextFile: "physicalAttributes"
  },
  7: {
    id: 7,
    name: "Your Contact Information",
    componentName: "RenderContactInfo",
    contextFile: "contactInfo"
  },
  8: {
    id: 8,
    name: "U.S. Passport Information",
    componentName: "RenderPassportInfo",
    contextFile: "passportInfo"
  },
  9: {
    id: 9,
    name: "Citizenship",
    componentName: "RenderCitizenshipInfo",
    contextFile: "citizenshipInfo"
  },
  10: {
    id: 10,
    name: "Dual/Multiple Citizenship & Foreign Passport Info",
    componentName: "RenderDualCitizenship",
    contextFile: "dualCitizenshipInfo"
  },
  11: {
    id: 11,
    name: "Where You Have Lived",
    componentName: "RenderResidencyInfo",
    contextFile: "residencyInfo"
  },
  12: {
    id: 12,
    name: "Where you went to School",
    componentName: "RenderSchoolInfo",
    contextFile: "schoolInfo"
  },
  13: {
    id: 13,
    name: "Employment Activities",
    componentName: "RenderEmployementInfo", // Note: Typo in component name
    contextFile: "employmentInfo"
  },
  14: {
    id: 14,
    name: "Selective Service",
    componentName: "RenderServiceInfo",
    contextFile: "serviceInfo"
  },
  15: {
    id: 15,
    name: "Military History",
    componentName: "RenderMilitaryInfo",
    contextFile: "militaryHistoryInfo"
  },
  16: {
    id: 16,
    name: "People Who Know You Well",
    componentName: "RenderPeopleThatKnow",
    contextFile: "peopleThatKnow"
  },
  17: {
    id: 17,
    name: "Marital/Relationship Status",
    componentName: "RenderRelationshipInfo",
    contextFile: "relationshipInfo"
  },
  18: {
    id: 18,
    name: "Relatives",
    componentName: "RenderRelativesInfo",
    contextFile: "relativesInfo"
  },
  19: {
    id: 19,
    name: "Foreign Contacts",
    componentName: "RenderForeignContacts",
    contextFile: "foreignContacts"
  },
  20: {
    id: 20,
    name: "Foreign Business, Activities, Government Contacts",
    componentName: "RenderForeignActivities",
    contextFile: "foreignActivities"
  },
  21: {
    id: 21,
    name: "Psychological and Emotional Health",
    componentName: "RenderMentalHealth",
    contextFile: "mentalHealth"
  },
  22: {
    id: 22,
    name: "Police Record",
    componentName: "RenderPolice",
    contextFile: "policeRecord"
  },
  23: {
    id: 23,
    name: "Illegal Use of Drugs and Drug Activity",
    componentName: "RenderDrugActivity",
    contextFile: "drugActivity"
  },
  24: {
    id: 24,
    name: "Use of Alcohol",
    componentName: "RenderAlcoholUse",
    contextFile: "alcoholUse"
  },
  25: {
    id: 25,
    name: "Investigations and Clearance",
    componentName: "RenderInvestigationsInfo",
    contextFile: "investigationsInfo"
  },
  26: {
    id: 26,
    name: "Financial Record",
    componentName: "RenderFinances",
    contextFile: "finances"
  },
  27: {
    id: 27,
    name: "Use of Information Technology Systems",
    componentName: "RenderTechnology",
    contextFile: "technology"
  },
  28: {
    id: 28,
    name: "Involvement in Non-Criminal Court Actions",
    componentName: "RenderCivil",
    contextFile: "civil"
  },
  29: {
    id: 29,
    name: "Association Record",
    componentName: "RenderAssociation",
    contextFile: "association"
  },
  30: {
    id: 30,
    name: "Continuation Space",
    componentName: "RenderSignature",
    contextFile: "signature"
  }
};

/**
 * Mapping of subsections to their components
 * The key is in the format "parentId.subsectionId" (e.g., "18.1")
 */
export const subsectionMapping: Record<string, SubsectionInfo> = {
  // Section 18 (Relatives)
  "18.1": {
    id: 1801,
    name: "Relatives - Parent Info",
    componentName: "RenderSection18_1",
    contextFile: "relativesInfo",
    parentSectionId: 18
  },
  "18.2": {
    id: 1802,
    name: "Relatives - Address",
    componentName: "RenderSection18_2",
    contextFile: "relativesInfo",
    parentSectionId: 18
  },
  "18.3": {
    id: 1803,
    name: "Relatives - Citizenship",
    componentName: "RenderSection18_3",
    contextFile: "relativesInfo",
    parentSectionId: 18
  },
  "18.4": {
    id: 1804,
    name: "Relatives - US Documentation",
    componentName: "RenderSection18_4",
    contextFile: "relativesInfo",
    parentSectionId: 18
  },
  "18.5": {
    id: 1805,
    name: "Relatives - Contact Information",
    componentName: "RenderSection18_5",
    contextFile: "relativesInfo",
    parentSectionId: 18
  },
  
  // Section 20 (Foreign Activities)
  "20.1": {
    id: 2001,
    name: "Foreign Activities - Financial Interests",
    componentName: "RenderSection20A1",
    contextFile: "foreignActivities",
    parentSectionId: 20
  },
  "20.2": {
    id: 2002,
    name: "Foreign Activities - Foreign Interests",
    componentName: "RenderSection20A2",
    contextFile: "foreignActivities",
    parentSectionId: 20
  },
  
  // Section 28 (Civil)
  "28.1": {
    id: 2801,
    name: "Civil Court Actions - Details",
    componentName: "RenderSection28_1",
    contextFile: "civil",
    parentSectionId: 28
  }
};

/**
 * Returns the subsection info for a given section and subsection number
 * 
 * @param sectionNumber The main section number from field-hierarchy.json
 * @param subsectionNumber The subsection number (e.g., 1, 2, 3)
 * @returns The subsection info or undefined if not found
 */
export function getSubsectionInfo(sectionNumber: number, subsectionNumber: number): SubsectionInfo | undefined {
  return subsectionMapping[`${sectionNumber}.${subsectionNumber}`];
}

/**
 * Returns the component name for a subsection
 * 
 * @param sectionNumber The main section number from field-hierarchy.json
 * @param subsectionNumber The subsection number (e.g., 1, 2, 3)
 * @returns The component name or undefined if not found
 */
export function getComponentNameForSubsection(sectionNumber: number, subsectionNumber: number): string | undefined {
  return getSubsectionInfo(sectionNumber, subsectionNumber)?.componentName;
}

/**
 * Returns the component import path for a subsection
 * 
 * @param sectionNumber The main section number from field-hierarchy.json
 * @param subsectionNumber The subsection number (e.g., 1, 2, 3)
 * @returns The component import path or undefined if not found
 */
export function getComponentPathForSubsection(sectionNumber: number, subsectionNumber: number): string | undefined {
  const subsectionInfo = getSubsectionInfo(sectionNumber, subsectionNumber);
  
  if (!subsectionInfo) return undefined;
  
  // Handle special cases based on component naming conventions
  if (subsectionInfo.componentName.startsWith('Render')) {
    return `app/components/Rendered/${subsectionInfo.componentName}`;
  }
  
  // Default pattern for subsection components
  const sectionInfo = sectionMapping[sectionNumber];
  if (!sectionInfo) return undefined;
  
  const contextBase = sectionInfo.contextFile.replace('Info', '');
  return `app/components/_${contextBase}/${subsectionInfo.componentName}`;
}

/**
 * Returns all subsections for a given section
 * 
 * @param sectionNumber The section number from field-hierarchy.json
 * @returns Array of subsection info objects
 */
export function getSubsectionsForSection(sectionNumber: number): SubsectionInfo[] {
  return Object.values(subsectionMapping).filter(
    subsection => subsection.parentSectionId === sectionNumber
  );
}

/**
 * Checks if a section has subsections
 * 
 * @param sectionNumber The section number from field-hierarchy.json
 * @returns True if the section has subsections
 */
export function sectionHasSubsections(sectionNumber: number): boolean {
  return getSubsectionsForSection(sectionNumber).length > 0;
}

/**
 * Returns the component name for a given section number
 * 
 * @param sectionNumber The section number from field-hierarchy.json
 * @returns The component name or undefined if not found
 */
export function getComponentNameForSection(sectionNumber: number): string | undefined {
  return sectionMapping[sectionNumber]?.componentName;
}

/**
 * Returns the component import path for a given section number
 * 
 * @param sectionNumber The section number from field-hierarchy.json
 * @returns The component import path or undefined if not found
 */
export function getComponentPathForSection(sectionNumber: number): string | undefined {
  const componentName = getComponentNameForSection(sectionNumber);
  return componentName ? `app/components/Rendered/${componentName}` : undefined;
}

/**
 * Returns the context file name for a given section number
 * 
 * @param sectionNumber The section number from field-hierarchy.json
 * @returns The context file name or undefined if not found
 */
export function getContextFileForSection(sectionNumber: number): string | undefined {
  return sectionMapping[sectionNumber]?.contextFile;
}

/**
 * Returns the context file import path for a given section number
 * 
 * @param sectionNumber The section number from field-hierarchy.json
 * @returns The context file import path or undefined if not found
 */
export function getContextPathForSection(sectionNumber: number): string | undefined {
  const contextFile = getContextFileForSection(sectionNumber);
  return contextFile ? `app/state/contexts/sections/${contextFile}` : undefined;
}

/**
 * Returns the section name for a given section number
 * 
 * @param sectionNumber The section number from field-hierarchy.json
 * @returns The section name or undefined if not found
 */
export function getSectionName(sectionNumber: number): string | undefined {
  return sectionMapping[sectionNumber]?.name;
}

/**
 * Returns the section info for a given section number
 * 
 * @param sectionNumber The section number from field-hierarchy.json
 * @returns The section info or undefined if not found
 */
export function getSectionInfo(sectionNumber: number): SectionInfo | undefined {
  return sectionMapping[sectionNumber];
}

/**
 * Returns information for all sections
 * 
 * @returns Array of section info objects
 */
export function getAllSectionInfo(): SectionInfo[] {
  return Object.values(sectionMapping);
}

/**
 * Returns information for all subsections
 * 
 * @returns Array of subsection info objects
 */
export function getAllSubsectionInfo(): SubsectionInfo[] {
  return Object.values(subsectionMapping);
} 