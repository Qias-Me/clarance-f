import type { Print } from "~/state/contexts/sections/print";
import type { AknowledgeInfo } from "./sections/aknowledgement";
import type { AlcoholUse } from "./sections/alcoholUse";
import type { Association } from "./sections/association";
import type { BirthInfo } from "./sections/birthnfo";
import type { CitizenshipInfo } from "./sections/citizenship";
import type { Civil } from "./sections/civil";
import type { ContactInfo } from "./sections/contact";
import type { DrugActivity } from "./sections/drugsActivity";
import type { DualCitizenshipInfo } from "./sections/duelCitizenship";
import type { EmploymentInfo } from "./sections/employmentInfo";
import type { Finances } from "./sections/finances";
import type { ForeignActivities } from "./sections/foreignActivities";
import type { ForeignContacts } from "./sections/foreignContacts";
import type { InvestigationsInfo } from "./sections/InvestigationsInfo";
import type { MentalHealth } from "./sections/mentalHealth";
import type { MilitaryHistoryInfo } from "./sections/militaryHistoryInfo";
import type { NamesInfo } from "./sections/namesInfo";
import type { PassportInfo } from "./sections/passport";
import type { PeopleThatKnow } from "./sections/peopleThatKnow";
import type { PersonalInfo } from "./sections/personalInfo";
import type { PhysicalAttributes } from "./sections/physicalAttributes";
import type { PlaceOfBirth } from "./sections/placeOfBirth";
import type { PoliceRecord } from "./sections/policeRecord";
import type { RelationshipInfo } from "./sections/relationshipInfo";
import type { RelativesInfo } from "./sections/relativesInfo";
import type { ResidencyInfo } from "./sections/residency";
import type { SchoolInfo } from "./sections/schoolInfo";
import type { ServiceInfo } from "./sections/service";
import type { Signature } from "./sections/signature";
import type { Technology } from "./sections/technology";

/**
 * Represents a field in the form with its metadata
 */
interface Field<T> {
  value: T;
  id: string;
  type: string;
  label: string;
}

/**
 * The main structure representing all form data for the SF-86 application
 * Maps to the 30 sections of the form plus print section
 */
interface ApplicantFormValues {
  // Section 1: Full Name
  personalInfo?: PersonalInfo;
  
  // Section 2: Date of Birth
  birthInfo?: BirthInfo;
  
  // Section 3: Place of Birth
  placeOfBirth?: PlaceOfBirth;
  
  // Section 4: Social Security Number
  aknowledgementInfo?: AknowledgeInfo;
  
  // Section 5: Other Names Used
  namesInfo?: NamesInfo;
  
  // Section 6: Your Identifying Information
  physicalAttributes?: PhysicalAttributes;
  
  // Section 7: Your Contact Information
  contactInfo?: ContactInfo;
  
  // Section 8: U.S. Passport Information
  passportInfo?: PassportInfo;
  
  // Section 9: Citizenship
  citizenshipInfo?: CitizenshipInfo;
  
  // Section 10: Dual/Multiple Citizenship & Foreign Passport
  dualCitizenshipInfo?: DualCitizenshipInfo;
  
  // Section 11: Where You Have Lived
  residencyInfo?: ResidencyInfo | ResidencyInfo[];
  
  // Section 12: Where you went to School
  schoolInfo?: SchoolInfo;
  
  // Section 13: Employment Activities
  employmentInfo?: EmploymentInfo;
  
  // Section 14: Selective Service
  serviceInfo?: ServiceInfo;
  
  // Section 15: Military History
  militaryHistoryInfo?: MilitaryHistoryInfo;
  
  // Section 16: People Who Know You Well
  peopleThatKnow?: PeopleThatKnow | PeopleThatKnow[];
  
  // Section 17: Marital/Relationship Status
  relationshipInfo?: RelationshipInfo;
  
  // Section 18: Relatives
  relativesInfo?: RelativesInfo;
  
  // Section 19: Foreign Contacts
  foreignContacts?: ForeignContacts;
  
  // Section 20: Foreign Activities
  foreignActivities?: ForeignActivities;
  
  // Section 21: Psychological and Emotional Health
  mentalHealth?: MentalHealth;
  
  // Section 22: Police Record
  policeRecord?: PoliceRecord;
  
  // Section 23: Illegal Use of Drugs and Drug Activity
  drugActivity?: DrugActivity;
  
  // Section 24: Use of Alcohol
  alcoholUse?: AlcoholUse;
  
  // Section 25: Investigations and Clearance
  investigationsInfo?: InvestigationsInfo;
  
  // Section 26: Financial Record
  finances?: Finances;
  
  // Section 27: Use of Information Technology Systems
  technology?: Technology;
  
  // Section 28: Involvement in Non-Criminal Court Actions
  civil?: Civil;
  
  // Section 29: Association Record
  association?: Association;
  
  // Section 30: Signature and Continuation Space
  signature?: Signature;
  
  // Print section (not numbered in SF-86)
  print?: Print;
}

export type { Field, ApplicantFormValues };
