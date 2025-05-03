import { ApplicantFormValues } from "../../../api/interfaces/formDefinition";
import { aknowledgementInfo } from "./sections/aknowledgementInfo";
import { alcoholUse } from "./sections/alcoholUse";
import { association } from "./sections/association";
import { birthInfo } from "./sections/birthInfo";
import { citizenshipInfo } from "./sections/citizenshipInfo";
import { civil } from "./sections/civil";
import { contactInfo } from "./sections/contactInfo";
import { drugActivity } from "./sections/drugActivity";
import { dualCitizenshipInfo } from "./sections/dualCitizenshipInfo";
import { employmentInfo } from "./sections/employmentInfo";
import { finances } from "./sections/finances";
import { foreignActivities } from "./sections/foreignActivities";
import { foreignContacts } from "./sections/foreignContacts";
import { investigationsInfo } from "./sections/investigationsInfo";
import { mentalHealth } from "./sections/mentalHealth";
import { militaryHistoryInfo } from "./sections/militaryHistoryInfo";
import { namesInfo } from "./sections/namesInfo";
import { passportInfo } from "./sections/passportInfo";
import { peopleThatKnow } from "./sections/peopleThatKnow";
import { personalInfo } from "./sections/personalInfo";
import { physicalAttributes } from "./sections/physicalAttributes";
import { policeRecord } from "./sections/policeRecord";
import { relationshipInfo } from "./sections/relationshipInfo";
import { relativesInfo } from "./sections/relativesInfo";
import { residencyInfo } from "./sections/residencyInfo";
import { schoolInfo } from "./sections/schoolInfo";
import { serviceInfo } from "./sections/serviceInfo";
import { signature } from "./sections/signature";
import { technology } from "./sections/technology";
import { print } from "./sections/print";

const defaultFormData: ApplicantFormValues = {
  // personalInfo: personalInfo,
  // namesInfo: namesInfo,
  // physicalAttributes: physicalAttributes,
  // relationshipInfo: relationshipInfo,
  // aknowledgementInfo: aknowledgementInfo,
  // birthInfo: birthInfo,
  // contactInfo: contactInfo,
  // passportInfo: passportInfo,
  // citizenshipInfo: citizenshipInfo,
  // dualCitizenshipInfo: dualCitizenshipInfo,
  // residencyInfo: residencyInfo,
  // employmentInfo: employmentInfo,
  // schoolInfo: schoolInfo,
  // serviceInfo: serviceInfo,
  // militaryHistoryInfo: militaryHistoryInfo,
  // peopleThatKnow: peopleThatKnow,
  relativesInfo: relativesInfo,
  // foreignContacts: foreignContacts,
  // foreignActivities: foreignActivities,
  // mentalHealth: mentalHealth,
  // policeRecord: policeRecord,
  // drugActivity: drugActivity,
  // alcoholUse: alcoholUse,
  // investigationsInfo: investigationsInfo,
  // finances: finances,
  // technology: technology,
  // civil: civil,
  // association: association,
  // signature: signature,
  // print: print
};

export default defaultFormData;
