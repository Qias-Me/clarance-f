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
import type { PoliceRecord } from "./sections/policeRecord";
import type { RelationshipInfo } from "./sections/relationshipInfo";
import type { RelativesInfo } from "./sections/relativesInfo";
import type { ResidencyInfo } from "./sections/residency";
import type { SchoolInfo } from "./sections/schoolInfo";
import type { ServiceInfo } from "./sections/service";
import type { Signature } from "./sections/signature";
import type { Technology } from "./sections/technology";

interface Field<T> {
  value: T;
  id: string;
  type: string;
  label: string;
}

interface ApplicantFormValues {
  personalInfo?: PersonalInfo;
  namesInfo?: NamesInfo;
  aknowledgementInfo?: AknowledgeInfo;
  birthInfo?: BirthInfo;
  physicalInfo?: PhysicalAttributes;
  contactInfo?: ContactInfo;
  passportInfo?: PassportInfo;
  physicalAttributes?: PhysicalAttributes;
  citizenshipInfo?: CitizenshipInfo;
  dualCitizenshipInfo?: DualCitizenshipInfo;
  residencyInfo?: ResidencyInfo[];
  employmentInfo?: EmploymentInfo;
  schoolInfo?: SchoolInfo;
  serviceInfo?: ServiceInfo;
  militaryHistoryInfo?: MilitaryHistoryInfo;
  peopleThatKnow?: PeopleThatKnow[];
  relationshipInfo?: RelationshipInfo;
  relativesInfo?: RelativesInfo;
  foreignContacts?: ForeignContacts;
  foreignActivities?: ForeignActivities;
  mentalHealth?: MentalHealth;
  policeRecord?: PoliceRecord;
  drugActivity?: DrugActivity;
  alcoholUse?: AlcoholUse;
  investigationsInfo?: InvestigationsInfo;
  finances?: Finances;
  technology?: Technology;
  civil?: Civil;
  association?: Association;
  signature?: Signature;
  print?: Print;
}

export type { Field, ApplicantFormValues };
