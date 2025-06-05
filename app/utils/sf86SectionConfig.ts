/**
 * SF-86 Section Configuration
 *
 * Shared configuration for all SF-86 sections to eliminate redundancy
 * across different components and routes.
 */

// Section component imports
import Section1Component from "~/components/Rendered2.0/Section1Component";
import Section2Component from "~/components/Rendered2.0/Section2Component";
import Section4Component from "~/components/Rendered2.0/Section4Component";
import Section5Component from "~/components/Rendered2.0/Section5Component";
import Section6Component from "~/components/Rendered2.0/Section6Component";
import Section7Component from "~/components/Rendered2.0/Section7Component";
import Section8Component from "~/components/Rendered2.0/Section8Component";
import Section9Component from "~/components/Rendered2.0/Section9Component";
import Section10Component from "~/components/Rendered2.0/Section10Component";
import Section11Component from "~/components/Rendered2.0/Section11Component";
import Section12Component from "~/components/Rendered2.0/Section12Component";
import Section13Component from "~/components/Rendered2.0/Section13Component";
import Section14Component from "~/components/Rendered2.0/Section14Component";
import Section15Component from "~/components/Rendered2.0/Section15Component";
import Section16Component from "~/components/Rendered2.0/Section16Component";
import Section17Component from "~/components/Rendered2.0/Section17Component";
import Section18Component from "~/components/Rendered2.0/Section18Component";
import Section19Component from "~/components/Rendered2.0/Section19Component";
import Section20Component from "~/components/Rendered2.0/Section20Component";
import Section21Component from "~/components/Rendered2.0/Section21Component";
import Section22Component from "~/components/Rendered2.0/Section22Component";
import Section23Component from "~/components/Rendered2.0/Section23Component";
import Section24Component from "~/components/Rendered2.0/Section24Component";
import Section25Component from "~/components/Rendered2.0/Section25Component";
import Section26Component from "~/components/Rendered2.0/Section26Component";
import Section27Component from "~/components/Rendered2.0/Section27Component";
import Section28Component from "~/components/Rendered2.0/Section28Component";
import Section29Component from "~/components/Rendered2.0/Section29Component";
import Section30Component from "~/components/Rendered2.0/Section30Component";

export interface SectionDefinition {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  isImplemented?: boolean;
}

/**
 * Complete SF-86 sections configuration
 * All 30 sections with their components and metadata
 */
export const ALL_SF86_SECTIONS: SectionDefinition[] = [
  { id: "section1", name: "Full Name", component: Section1Component, isImplemented: true },
  { id: "section2", name: "Date / Place of Birth", component: Section2Component, isImplemented: true },
  { id: "section3", name: "Place of Birth", component: Section2Component, isImplemented: true },
  { id: "section4", name: "Social Security Number", component: Section4Component, isImplemented: true },
  { id: "section5", name: "Residence", component: Section5Component, isImplemented: true },
  { id: "section6", name: "Physical Characteristics", component: Section6Component, isImplemented: true },
  { id: "section7", name: "Contact Information", component: Section7Component, isImplemented: true },
  { id: "section8", name: "U.S. Passport Information", component: Section8Component, isImplemented: true },
  { id: "section9", name: "Citizenship", component: Section9Component, isImplemented: true },
  { id: "section10", name: "Dual Citizenship", component: Section10Component, isImplemented: true },
  { id: "section11", name: "Where You Have Lived", component: Section11Component, isImplemented: true },
  { id: "section12", name: "Where You Went to School", component: Section12Component, isImplemented: true },
  { id: "section13", name: "Employment Activities", component: Section13Component, isImplemented: true },
  { id: "section14", name: "Selective Service", component: Section14Component, isImplemented: true },
  { id: "section15", name: "Military Service", component: Section15Component, isImplemented: true },
  { id: "section16", name: "People Who Know You Well", component: Section16Component, isImplemented: true },
  { id: "section17", name: "Marital / Relationship", component: Section17Component, isImplemented: true },
  { id: "section18", name: "Relatives", component: Section18Component, isImplemented: true },
  { id: "section19", name: "Foreign Contacts", component: Section19Component, isImplemented: true },
  { id: "section20", name: "Foreign Activities", component: Section20Component, isImplemented: true },
  { id: "section21", name: "Mental Health", component: Section21Component, isImplemented: true },
  { id: "section22", name: "Police Record", component: Section22Component, isImplemented: true },
  { id: "section23", name: "Illegal Use of Drugs or Drug Activity", component: Section23Component, isImplemented: true },
  { id: "section24", name: "Use of Alcohol", component: Section24Component, isImplemented: true },
  { id: "section25", name: "Investigation and Clearance Record", component: Section25Component, isImplemented: true },
  { id: "section26", name: "Financial Record", component: Section26Component, isImplemented: true },
  { id: "section27", name: "Information Technology Systems", component: Section27Component, isImplemented: true },
  { id: "section28", name: "Involvement in Non-Criminal Court Actions", component: Section28Component, isImplemented: true },
  { id: "section29", name: "Associations", component: Section29Component, isImplemented: true },
  { id: "section30", name: "Continuation", component: Section30Component, isImplemented: true },
];

/**
 * Get only implemented sections
 */
export const getImplementedSections = (): SectionDefinition[] => {
  return ALL_SF86_SECTIONS.filter(section => section.isImplemented);
};

/**
 * Get sections that are currently active/enabled for testing
 * This can be used to gradually enable sections during development
 */
export const getActiveSections = (): SectionDefinition[] => {
  // For now, return the main sections that are being actively used
  const activeSectionIds = ['section1', 'section2', 'section10', 'section11', 'section17', 'section28', 'section29', 'section30'];
  return ALL_SF86_SECTIONS.filter(section =>
    activeSectionIds.includes(section.id)
  );
};

/**
 * Get section definition by ID
 */
export const getSectionById = (sectionId: string): SectionDefinition | undefined => {
  return ALL_SF86_SECTIONS.find(section => section.id === sectionId);
};

/**
 * Get section name by ID
 */
export const getSectionNameById = (sectionId: string): string => {
  const section = getSectionById(sectionId);
  return section?.name || sectionId;
};

/**
 * Create a mapping of section IDs to section names
 */
export const createSectionTitleMapping = (): Record<string, string> => {
  return ALL_SF86_SECTIONS.reduce((mapping, section) => {
    mapping[section.id] = section.name;
    return mapping;
  }, {} as Record<string, string>);
};


/**
 * Section order for navigation
 */
export const SECTION_ORDER: string[] = [
  "section1", "section2", "section3", "section4", "section5",
  "section6", "section7", "section8", "section9", "section10",
  "section11", "section12", "section13", "section14", "section15",
  "section16", "section17", "section18", "section19", "section20",
  "section21", "section22", "section23", "section24", "section25",
  "section26", "section27", "section28", "section29", "section30",
];