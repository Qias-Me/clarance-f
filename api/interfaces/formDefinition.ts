import { Print } from "~/state/contexts/sections/print";
import { AknowledgeInfo } from "./sections/aknowledgement";
import { AlcoholUse } from "./sections/alcoholUse";
import { Association } from "./sections/association";
import { BirthInfo } from "./sections/birthnfo";
import { CitizenshipInfo } from "./sections/citizenship";
import { Civil } from "./sections/civil";
import { ContactInfo } from "./sections/contact";
import { DrugActivity } from "./sections/drugsActivity";
import { DualCitizenshipInfo } from "./sections/duelCitizenship";
import { EmploymentInfo } from "./sections/employmentInfo";
import { Finances } from "./sections/finances";
import { ForeignActivities } from "./sections/foreignActivities";
import { ForeignContacts } from "./sections/foreignContacts";
import { InvestigationsInfo } from "./sections/InvestigationsInfo";
import { MentalHealth } from "./sections/mentalHealth";
import { MilitaryHistoryInfo } from "./sections/militaryHistoryInfo";
import { NamesInfo } from "./sections/namesInfo";
import { PassportInfo } from "./sections/passport";
import { PeopleThatKnow } from "./sections/peopleThatKnow";
import { PersonalInfo } from "./sections/personalInfo";
import { PhysicalAttributes } from "./sections/physicalAttributes";
import { PoliceRecord } from "./sections/policeRecord";
import { RelationshipInfo } from "./sections/relationshipInfo";
import { RelativesInfo } from "./sections/relativesInfo";
import { ResidencyInfo } from "./sections/residency";
import { SchoolInfo } from "./sections/schoolInfo";
import { ServiceInfo } from "./sections/service";
import { Signature } from "./sections/signature";
import { Technology } from "./sections/technology";

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
