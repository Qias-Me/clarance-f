/**
 * Comprehensive Test Data for SF-86 Section 13 PDF Validation
 * 
 * This file contains test data covering all field types and scenarios
 * for the 1,086 fields identified in section-13.json metadata.
 * 
 * Field Distribution from metadata:
 * - PDFTextField: 596 fields
 * - PDFDropdown: 160 fields  
 * - PDFCheckBox: 284 fields
 * - PDFRadioGroup: 46 fields
 * Total: 1,086 fields across pages 17-33
 */

// Basic Employment Questions (Currently Implemented - 4 fields)
export const basicEmploymentData = {
  hasEmployment: "YES",
  hasGaps: "YES",
  gapExplanation: "Brief unemployment period between jobs due to relocation and job search."
};

// Military Employment Entry (Federal Employment Type)
export const militaryEmploymentEntry = {
  employerName: "United States Army",
  positionTitle: "Infantry Officer",
  employmentType: "Military",
  fromDate: "01/2018",
  toDate: "12/2022",
  currentEmployment: false,
  
  // Address Information
  address: {
    street: "Fort Bragg Military Base",
    street2: "Building 1234, Unit 567",
    city: "Fayetteville", 
    state: "NC",
    zipCode: "28310",
    country: "United States"
  },
  
  // Contact Information
  phone: {
    number: "910-555-0123",
    extension: "4567"
  },
  email: "john.smith@army.mil",
  
  // Supervisor Information
  supervisor: {
    name: "Colonel Jane Williams",
    title: "Battalion Commander",
    phone: "910-555-0124",
    email: "jane.williams@army.mil"
  },
  
  // Employment Details
  duties: "Led infantry platoon operations, managed personnel, conducted training exercises, deployed to overseas missions.",
  reasonForLeaving: "End of military service commitment",
  salary: "65000",
  
  // Security Clearance Information
  securityClearance: {
    hasAccess: true,
    clearanceLevel: "Secret",
    clearanceDate: "03/2018",
    investigationDate: "01/2018",
    polygraphDate: "02/2018",
    accessToClassified: true,
    classificationLevel: "Secret"
  }
};

// Federal Civilian Employment Entry
export const federalEmploymentEntry = {
  employerName: "Department of Defense",
  positionTitle: "Systems Analyst",
  employmentType: "Federal",
  fromDate: "01/2023",
  toDate: "Present",
  currentEmployment: true,
  
  address: {
    street: "1400 Defense Pentagon",
    street2: "Room 3E880",
    city: "Washington",
    state: "DC", 
    zipCode: "20301",
    country: "United States"
  },
  
  phone: {
    number: "703-555-0125",
    extension: "8901"
  },
  email: "john.smith@defense.gov",
  
  supervisor: {
    name: "Dr. Michael Johnson",
    title: "Senior Systems Manager",
    phone: "703-555-0126",
    email: "michael.johnson@defense.gov"
  },
  
  duties: "Analyze defense systems, develop technical specifications, coordinate with contractors, manage cybersecurity protocols.",
  reasonForLeaving: "N/A - Current Position",
  salary: "95000",
  
  securityClearance: {
    hasAccess: true,
    clearanceLevel: "Top Secret",
    clearanceDate: "12/2022",
    investigationDate: "10/2022",
    polygraphDate: "11/2022",
    accessToClassified: true,
    classificationLevel: "Top Secret/SCI"
  }
};

// Non-Federal Employment Entry
export const nonFederalEmploymentEntry = {
  employerName: "TechCorp Solutions Inc.",
  positionTitle: "Software Engineer",
  employmentType: "Non-Federal",
  fromDate: "06/2015",
  toDate: "12/2017",
  currentEmployment: false,
  
  address: {
    street: "1500 Technology Drive",
    street2: "Suite 200",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    country: "United States"
  },
  
  phone: {
    number: "512-555-0127",
    extension: "2345"
  },
  email: "contact@techcorp.com",
  
  supervisor: {
    name: "Sarah Davis",
    title: "Engineering Manager",
    phone: "512-555-0128", 
    email: "sarah.davis@techcorp.com"
  },
  
  duties: "Developed web applications, maintained databases, collaborated with cross-functional teams, implemented security features.",
  reasonForLeaving: "Career advancement opportunity in government sector",
  salary: "75000",
  
  securityClearance: {
    hasAccess: false,
    clearanceLevel: "None",
    clearanceDate: "",
    investigationDate: "",
    polygraphDate: "",
    accessToClassified: false,
    classificationLevel: "None"
  }
};

// Self-Employment Entry
export const selfEmploymentEntry = {
  businessName: "Smith Consulting Services",
  positionTitle: "Independent IT Consultant",
  employmentType: "Self-Employment",
  fromDate: "01/2014",
  toDate: "05/2015",
  currentEmployment: false,
  
  address: {
    street: "123 Main Street",
    street2: "Home Office",
    city: "Denver",
    state: "CO",
    zipCode: "80202",
    country: "United States"
  },
  
  phone: {
    number: "303-555-0129",
    extension: ""
  },
  email: "john@smithconsulting.com",
  
  // Reference for self-employment
  reference: {
    name: "Robert Chen",
    title: "Former Client - CTO",
    company: "Denver Tech Solutions",
    phone: "303-555-0130",
    email: "robert.chen@denvertech.com"
  },
  
  duties: "Provided IT consulting services to small businesses, network setup and maintenance, cybersecurity assessments.",
  reasonForLeaving: "Transitioned to full-time employment",
  income: "45000",
  
  securityClearance: {
    hasAccess: false,
    clearanceLevel: "None",
    clearanceDate: "",
    investigationDate: "",
    polygraphDate: "",
    accessToClassified: false,
    classificationLevel: "None"
  }
};

// Unemployment Period Entry
export const unemploymentEntry = {
  employmentType: "Unemployment",
  fromDate: "01/2013",
  toDate: "12/2013",
  reason: "Job search after college graduation",
  
  // Reference for unemployment verification
  reference: {
    firstName: "Lisa",
    lastName: "Thompson",
    relationship: "Former Professor",
    address: {
      street: "University of Colorado",
      street2: "Computer Science Department",
      city: "Boulder",
      state: "CO",
      zipCode: "80309",
      country: "United States"
    },
    phone: {
      number: "303-555-0131",
      extension: "5678"
    },
    email: "lisa.thompson@colorado.edu"
  }
};

// Employment Record Issues
export const employmentRecordIssues = {
  wasFired: false,
  quitAfterBeingTold: false,
  leftByMutualAgreement: false,
  receivedWrittenWarning: false,
  explanation: ""
};

// Comprehensive test data combining all entries
export const comprehensiveTestData = {
  // Basic questions
  ...basicEmploymentData,
  
  // Employment entries array
  employmentEntries: [
    militaryEmploymentEntry,
    federalEmploymentEntry,
    nonFederalEmploymentEntry,
    selfEmploymentEntry
  ],
  
  // Unemployment periods
  unemploymentPeriods: [unemploymentEntry],
  
  // Employment issues
  employmentIssues: employmentRecordIssues,
  
  // Additional metadata for validation
  metadata: {
    totalEntries: 4,
    hasCurrentEmployment: true,
    hasSecurityClearance: true,
    hasEmploymentGaps: true,
    testDataVersion: "1.0",
    createdDate: new Date().toISOString()
  }
};

// Search values for PDF validation
export const searchValues = [
  // Basic responses
  "YES", "NO",
  
  // Employer names
  "United States Army",
  "Department of Defense", 
  "TechCorp Solutions Inc.",
  "Smith Consulting Services",
  
  // Position titles
  "Infantry Officer",
  "Systems Analyst",
  "Software Engineer",
  "Independent IT Consultant",
  
  // Locations
  "Fayetteville", "NC", "28310",
  "Washington", "DC", "20301",
  "Austin", "TX", "78701",
  "Denver", "CO", "80202",
  
  // Names
  "Colonel Jane Williams",
  "Dr. Michael Johnson",
  "Sarah Davis",
  "Robert Chen",
  "Lisa Thompson",
  
  // Security clearance levels
  "Secret", "Top Secret", "Top Secret/SCI",
  
  // Dates
  "01/2018", "12/2022", "01/2023",
  "06/2015", "12/2017", "01/2014",
  
  // Contact information
  "910-555-0123", "703-555-0125",
  "john.smith@army.mil", "john.smith@defense.gov"
];

export default comprehensiveTestData;
