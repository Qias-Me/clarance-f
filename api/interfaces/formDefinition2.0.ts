import type { Print } from "~/state/contexts/sections/print";
import type { AknowledgeInfo } from "./sections/aknowledgement";
import type { PersonalInfo } from "./sections/personalInfo";
import type { Signature } from "./sections/signature";

// Import all Section 2.0 interfaces
import type { Section1 } from "./sections2.0/section1";
import type { Section2 } from "./sections2.0/section2";
import type { Section3 } from "./sections2.0/section3";
import type { Section7 } from "./sections2.0/section7";
import type { Section8 } from "./sections2.0/section8";
import type { Section29 } from "./sections2.0/section29";

// Legacy imports (commented out for now)
// import type { AlcoholUse } from "./sections/alcoholUse";
// import type { Association } from "./sections/association";
// import type { BirthInfo } from "./sections/birthnfo";
// import type { CitizenshipInfo } from "./sections/citizenship";
// import type { Civil } from "./sections/civil";
// import type { ContactInfo } from "./sections/contact";
// import type { DrugActivity } from "./sections/drugsActivity";
// import type { DualCitizenshipInfo } from "./sections/duelCitizenship";
// import type { EmploymentInfo } from "./sections/employmentInfo";
// import type { Finances } from "./sections/finances";
// import type { ForeignActivities } from "./sections/foreignActivities";
// import type { ForeignContacts } from "./sections/foreignContacts";
// import type { InvestigationsInfo } from "./sections/InvestigationsInfo";
// import type { MentalHealth } from "./sections/mentalHealth";
// import type { MilitaryHistoryInfo } from "./sections/militaryHistoryInfo";
// import type { NamesInfo } from "./sections/namesInfo";
// import type { PassportInfo } from "./sections/passport";
// import type { PeopleThatKnow } from "./sections/peopleThatKnow";
// import type { PhysicalAttributes } from "./sections/physicalAttributes";
// import type { PoliceRecord } from "./sections/policeRecord";
// import type { RelationshipInfo } from "./sections/relationshipInfo";
// import type { RelativesInfo } from "./sections/relativesInfo";
// import type { ResidencyInfo } from "./sections/residency";
// import type { SchoolInfo } from "./sections/schoolInfo";
// import type { ServiceInfo } from "./sections/service";
// import type { Technology } from "./sections/technology";

/**
 * Field interface for PDF form field mapping
 * Complete interface with all PDF field properties for validation and mapping
 */
interface Field<T> {
  value: T;
  id: string;
  type: string;
  label: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}


/**
 * Complete ApplicantFormValues interface with all 30 SF-86 sections
 */
interface ApplicantFormValues {
  // Sections 1-30 (SF-86 Form Structure)
  section1?: Section1;
  section2?: Section2;
  section3?: Section3;
  section4?: any; // TODO: Create Section4 interface
  section5?: any; // TODO: Create Section5 interface
  section6?: any; // TODO: Create Section6 interface
  section7?: Section7;
  section8?: Section8;
  section9?: any; // TODO: Create Section9 interface
  section10?: any; // TODO: Create Section10 interface
  section11?: any; // TODO: Create Section11 interface
  section12?: any; // TODO: Create Section12 interface
  section13?: any; // TODO: Create Section13 interface
  section14?: any; // TODO: Create Section14 interface
  section15?: any; // TODO: Create Section15 interface
  section16?: any; // TODO: Create Section16 interface
  section17?: any; // TODO: Create Section17 interface
  section18?: any; // TODO: Create Section18 interface
  section19?: any; // TODO: Create Section19 interface
  section20?: any; // TODO: Create Section20 interface
  section21?: any; // TODO: Create Section21 interface
  section22?: any; // TODO: Create Section22 interface
  section23?: any; // TODO: Create Section23 interface
  section24?: any; // TODO: Create Section24 interface
  section25?: any; // TODO: Create Section25 interface
  section26?: any; // TODO: Create Section26 interface
  section27?: any; // TODO: Create Section27 interface
  section28?: any; // TODO: Create Section28 interface
  section29?: Section29;
  section30?: any; // TODO: Create Section30 interface

  // Legacy/Additional sections
  signature?: Signature;
  acknowledgement?: AknowledgeInfo;
  print?: Print;
}

export type { Field, ApplicantFormValues };
