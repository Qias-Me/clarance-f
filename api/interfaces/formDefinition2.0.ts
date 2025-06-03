import type { Print } from "~/state/contexts/sections/print";
import type { AknowledgeInfo } from "./sections/aknowledgement";
import type { PersonalInfo } from "./sections/personalInfo";
import type { Signature } from "./sections/signature";

// Import all Section 2.0 interfaces
import type { Section1 } from "./sections2.0/section1";
import type { Section2 } from "./sections2.0/section2";
import type { Section3 } from "./sections2.0/section3";
import type { Section4 } from "./sections2.0/section4";
import type { Section5 } from "./sections2.0/section5";
import type { Section6 } from "./sections2.0/section6";
import type { Section7 } from "./sections2.0/section7";
import type { Section8 } from "./sections2.0/section8";
import type { Section9 } from "./sections2.0/section9";
import type { Section10 } from "./sections2.0/section10";
import type { Section14 } from "./sections2.0/section14";
import type { Section15 } from "./sections2.0/section15";
import type { Section29 } from "./sections2.0/section29";
import type { Section19 } from "./sections2.0/section19";
import type { Section18 } from "./sections2.0/section18";
import type { Section26 } from "./sections2.0/section26";

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
 * Includes standardized field ID format with 4-digit numeric IDs and full field paths
 */
interface Field<T> {
  value: T;
  id: string; // 4-digit numeric field ID (e.g., "9513")
  name: string; // Full field path (e.g., "form1[0].Sections7-9[0].TextField11[13]")
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
 * Extended Field interface that includes options for dropdown fields
 */
interface FieldWithOptions<T> extends Field<T> {
  options: readonly string[];
}


/**
 * Complete ApplicantFormValues interface with all 30 SF-86 sections
 */
interface ApplicantFormValues {
  // Sections 1-30 (SF-86 Form Structure)
  section1?: Section1;
  section2?: Section2;
  section3?: Section3;
  section4?: Section4;
  section5?: Section5;
  section6?: Section6;
  section7?: Section7;
  section8?: Section8;
  section9?: Section9;
  section10?: Section10;
  section11?: any; // TODO: Create Section11 interface
  section12?: any; // TODO: Create Section12 interface
  section13?: any; // TODO: Create Section13 interface
  section14?: Section14;
  section15?: Section15;
  section16?: any; // TODO: Create Section16 interface
  section17?: any; // TODO: Create Section17 interface
  section18?: Section18;
  section19?: Section19;
  section20?: any; // TODO: Create Section20 interface
  section21?: any; // TODO: Create Section21 interface
  section22?: any; // TODO: Create Section22 interface
  section23?: any; // TODO: Create Section23 interface
  section24?: any; // TODO: Create Section24 interface
  section25?: any; // TODO: Create Section25 interface
  section26?: Section26;
  section27?: any; // TODO: Create Section27 interface
  section28?: any; // TODO: Create Section28 interface
  section29?: Section29;
  section30?: any; // TODO: Create Section30 interface

  // Legacy/Additional sections
  signature?: Signature;
  acknowledgement?: AknowledgeInfo;
  print?: Print;
}

export type { Field, FieldWithOptions, ApplicantFormValues };
