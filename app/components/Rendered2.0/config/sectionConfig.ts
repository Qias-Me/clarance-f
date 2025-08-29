/**
 * Section Configuration
 * Centralized configuration for all section components
 */

export interface SectionConfig {
  sectionNumber: number;
  title: string;
  description: string;
  route: string;
  requiredFields: string[];
  dependencies?: number[]; // Section numbers that must be completed first
}

export const SECTION_CONFIGS: Record<string, SectionConfig> = {
  section1: {
    sectionNumber: 1,
    title: 'Information About You',
    description: 'Provide your full legal name as it appears on official documents.',
    route: '/form/section1',
    requiredFields: ['lastName', 'firstName']
  },
  section2: {
    sectionNumber: 2,
    title: 'Date and Place of Birth',
    description: 'Provide your date of birth information.',
    route: '/form/section2',
    requiredFields: ['dateOfBirth']
  },
  section3: {
    sectionNumber: 3,
    title: 'Place of Birth',
    description: 'Provide information about your place of birth including country, state, city, and county.',
    route: '/form/section3',
    requiredFields: ['country', 'city'],
    dependencies: [1, 2]
  },
  section4: {
    sectionNumber: 4,
    title: 'Citizenship',
    description: 'Provide information about your citizenship status.',
    route: '/form/section4',
    requiredFields: ['citizenshipStatus']
  },
  section5: {
    sectionNumber: 5,
    title: 'Physical Attributes',
    description: 'Provide your physical characteristics.',
    route: '/form/section5',
    requiredFields: ['height', 'weight', 'hairColor', 'eyeColor']
  },
  section6: {
    sectionNumber: 6,
    title: 'Identifying Information',
    description: 'Provide your Social Security Number and other identifying information.',
    route: '/form/section6',
    requiredFields: ['ssn']
  },
  section7: {
    sectionNumber: 7,
    title: 'Contact Information',
    description: 'Provide your current contact information.',
    route: '/form/section7',
    requiredFields: ['phoneNumber', 'email']
  },
  section8: {
    sectionNumber: 8,
    title: 'Marital Status',
    description: 'Provide information about your marital status.',
    route: '/form/section8',
    requiredFields: ['maritalStatus']
  },
  section9: {
    sectionNumber: 9,
    title: 'Residences',
    description: 'List your residences for the past 10 years.',
    route: '/form/section9',
    requiredFields: ['residences']
  },
  section10: {
    sectionNumber: 10,
    title: 'Education',
    description: 'Provide your educational background.',
    route: '/form/section10',
    requiredFields: ['schools']
  },
  section11: {
    sectionNumber: 11,
    title: 'Federal Service',
    description: 'Provide information about your federal service.',
    route: '/form/section11',
    requiredFields: []
  },
  section12: {
    sectionNumber: 12,
    title: 'Employment Activities',
    description: 'List your employment activities for the past 10 years.',
    route: '/form/section12',
    requiredFields: ['employments']
  },
  section13: {
    sectionNumber: 13,
    title: 'People Who Know You Well',
    description: 'List people who know you well.',
    route: '/form/section13',
    requiredFields: ['references']
  },
  section14: {
    sectionNumber: 14,
    title: 'Relatives',
    description: 'Provide information about your relatives.',
    route: '/form/section14',
    requiredFields: ['relatives']
  },
  section15: {
    sectionNumber: 15,
    title: 'Military History',
    description: 'Provide your military service history.',
    route: '/form/section15',
    requiredFields: []
  },
  // Additional sections can be added here
};

export const getSectionConfig = (sectionKey: string): SectionConfig | undefined => {
  return SECTION_CONFIGS[sectionKey];
};

export const getSectionTitle = (sectionNumber: number): string => {
  const config = Object.values(SECTION_CONFIGS).find(
    c => c.sectionNumber === sectionNumber
  );
  return config?.title || `Section ${sectionNumber}`;
};

export const isSectionRequired = (sectionKey: string, fieldName: string): boolean => {
  const config = SECTION_CONFIGS[sectionKey];
  return config?.requiredFields.includes(fieldName) || false;
};