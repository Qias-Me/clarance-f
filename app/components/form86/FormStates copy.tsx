// Assuming these are your import paths
import React from "react";
import NameForm from "./formv2/Name";
import GetStarted from "./form/GetStarted";
import BirthInfoForm from "./form/BirthInfo";
import PersonalDetailsForm from "./form/PersonalDetails";
import ContactDetailsForm from "./form/ContactDetails";
import PassportInfo from "./form/PassportInfo";
import Citizenship from "./form/CitizenshipInfo";

import {
  PersonalInfo,
  CitizenshipInfo,
  DualCitizenshipInfo,
  ResidenceForm,
} from "../../../api/interfaces/form";
import DualCitizenshipForm from "./form/DuelCitizenship";
import Residence from "./form/Residence";
import Personal from "./form/Personal";
import { ApplicantPersonalInfo, ApplicantNames } from "api_v2/interfaces/form2";
import Birth from "./formv2/Birth";
import Social from "./formv2/Social";
import Alias from "./samples/new_Alias";

interface FormStatesProps {
  updateAlias: (alias: ApplicantNames) => void;
  updatePersonalInfo: (info: Partial<ApplicantPersonalInfo>) => void;
  updateCitizenshipInfo: (info: Partial<CitizenshipInfo>) => void;
  updateDualCitizenshipInfo: (info: Partial<DualCitizenshipInfo>) => void;
  updateResidenceInfo: (info: Partial<ResidenceForm>) => void;
  step: number;
}

const FormStates: React.FC<FormStatesProps> = ({
  step,
  updateAlias,
  updatePersonalInfo,
  updateCitizenshipInfo,
  updateDualCitizenshipInfo,
  updateResidenceInfo,
}) => {
  switch (step) {
    case 0:
      return <GetStarted />;
    // case 1:
    //   return <NameForm updatePersonalInfo={updatePersonalInfo} />;
    // case 1:
    //   return <Birth updatePersonalInfo={updatePersonalInfo} />;
    // case 1:
    // return <Social updatePersonalInfo={updatePersonalInfo} />;
    case 1:
      return <Alias onChangeStep={} updatePersonalInfo={updatePersonalInfo} />;
    // case 3:
    //   return <BirthInfoForm updatePersonalInfo={updatePersonalInfo} />;
    // case 4:
    //   return <AliasForm updateAlias={updateAlias} />;
    // case 5:
    //   return <PersonalDetailsForm updatePersonalInfo={updatePersonalInfo} />;
    // case 6:
    //   return <ContactDetailsForm updatePersonalInfo={updatePersonalInfo} />;
    // case 7:
    //   return <PassportInfo updatePersonalInfo={updatePersonalInfo} />;
    // case 1:
    //   return <Personal updatePersonalInfo={updatePersonalInfo} />;

    default:
      return <div>Step not found</div>;
  }
};

export default FormStates;

// // Assuming these are your import paths
// import React from "react";
// import AliasForm from "./form/AlisaForm";
// import DOBForm from "./form/DOBForm";
// import NameForm from "./form/NameForm";
// import GetStarted from "./form/GetStarted";
// import BirthInfoForm from "./form/BirthInfo";
// import PersonalDetailsForm from "./form/PersonalDetails";
// import ContactDetailsForm from "./form/ContactDetails";
// import PassportInfo from "./form/PassportInfo";
// import Citizenship from "./form/CitizenshipInfo";

// import {
//   Alias,
//   PersonalInfo,
//   CitizenshipInfo,
// } from "../../../api_v2/interfaces/form";

// interface FormStatesProps {
//   updateAlias: (alias: Alias) => void;
//   updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
//   updateCitizenshipInfo: (info: Partial<CitizenshipInfo>) => void;
//   step: number;
// }

// const FormStates: React.FC<FormStatesProps> = ({
//   step,
//   updateAlias,
//   updatePersonalInfo,
//   updateCitizenshipInfo
// }) => {

//   switch (step) {
//     case 0:
//       return <GetStarted />;
//     case 1:
//       return <NameForm updatePersonalInfo={updatePersonalInfo} />;
//     case 2:
//       return <DOBForm updatePersonalInfo={updatePersonalInfo} />;
//     case 3:
//       return <BirthInfoForm updatePersonalInfo={updatePersonalInfo} />;
//     case 4:
//       return <AliasForm updateAlias={updateAlias} />;
//     case 5:
//       return <PersonalDetailsForm updatePersonalInfo={updatePersonalInfo} />;
//     case 6:
//       return <ContactDetailsForm updatePersonalInfo={updatePersonalInfo} />;
//     case 7:
//       return <PassportInfo updatePersonalInfo={updatePersonalInfo} />;
//     case 8:
//       return <Citizenship updateCitizenshipInfo={updateCitizenshipInfo} />;
//     case 9:
// return <DualCitizenshipForm updateDualCitizenshipInfo={updateDualCitizenshipInfo} />;
//     case 10:
//  return ( <Residence updateResidenceInfo={updateResidenceInfo} />);
// default:
//       return <div>Step not found</div>;
//   }
// };

// export default FormStates;
