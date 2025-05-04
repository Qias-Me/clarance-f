// Assuming these are your import paths
import React from "react";
import GetStarted from "./form/GetStarted";

import {
  CitizenshipInfo,
  DualCitizenshipInfo,
  ResidenceForm,
} from "../../../api/interfaces/form";
import { ApplicantPersonalInfo, ApplicantNames } from "api_v2/interfaces/form2";
import Birth from "./formv2/Birth";
import Alias from "./samples/new_Alias";

interface FormStatesProps {
  updateAliasInfo: (info: Partial<{ otherNames: ApplicantNames[] }>) => void;
  updatePersonalInfo: (info: Partial<ApplicantPersonalInfo>) => void;
  updateCitizenshipInfo: (info: Partial<CitizenshipInfo>) => void;
  updateDualCitizenshipInfo: (info: Partial<DualCitizenshipInfo>) => void;
  updateResidenceInfo: (info: Partial<ResidenceForm>) => void;
  onChangeStep: (step: number) => void;
  step: number;
}

const FormStates: React.FC<FormStatesProps> = ({
  step,
  updateAliasInfo,
  updatePersonalInfo,
  onChangeStep,
}) => {
  const handleNoAliases = () => {
    onChangeStep(step + 1);
  };

  switch (step) {
    case 0:
      return <GetStarted />;
    case 1:
      return (
        <Alias
        updateAliasInfo={updateAliasInfo}
        onNoAliases={handleNoAliases} // Providing a specific handler for "No" aliases
      />
      );
    case 2:
      return <Birth updatePersonalInfo={updatePersonalInfo} />;

    default:
      return <div>Step not found</div>;
  }
};

export default FormStates;
