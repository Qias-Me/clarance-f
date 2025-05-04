import React from "react";
import {type FormInfo} from "api/interfaces/FormInfo";

import { type MentalHealth } from "api/interfaces/sections/mentalHealth";

import { RenderSection21A } from "../_mental/section21A";
import { RenderSection21B } from "../_mental/section21B";
import { RenderSection21C } from "../_mental/section21C";
import { RenderSection21D } from "../_mental/section21D";
import { RenderSection21D1 } from "../_mental/section21D1";
import { RenderSection21E } from "../_mental/section21E";

interface FormProps {
  data: MentalHealth;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
}

const RenderMentalHealth: React.FC<FormProps> = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  getDefaultNewItem,
  isReadOnlyField,
  path,
  formInfo,
}) => {
  const handleInputChange = (path: string, value: any) => {
    console.log(path, value, "path and value");
    onInputChange(path, value);

    if (value === true) {
      handleSectionAdd(path);
    }
  };

  const handleSectionAdd = (path: string) => {
    const sectionMap: { [key: string]: string } = {
      declaredMentallyIncompetent: "section21A",
      consultMentalHealth: "section21B",
      hospitalizedMentalHealth: "section21C",
      beenDiagnosed: "section21D",
      currentlyInTreatment: "section21D1",
      substantialAffects: "section21E"
    };

    const field = path.split(".").pop();
    if (field && sectionMap[field]) {
      const section = sectionMap[field];
      if (!data[section]) {
        onAddEntry(
          `mentalHealth.${section}`,
          getDefaultNewItem(`mentalHealth.${section}`)
        );
      }
    }
  };

  const renderBooleanInput = (
    label: string,
    value: boolean,
    onChange: (value: boolean) => void
  ) => (
    <div className="flex items-center space-x-4">
      <span>{label}</span>
      <div>
        <input
          type="radio"
          id={`${label}-yes`}
          name={label}
          value="true"
          checked={value === true}
          onChange={() => onChange(true)}
        />
        <label htmlFor={`${label}-yes`}>Yes</label>
      </div>
      <div>
        <input
          type="radio"
          id={`${label}-no`}
          name={label}
          value="false"
          checked={value === false}
          onChange={() => onChange(false)}
        />
        <label htmlFor={`${label}-no`}>No</label>
      </div>
    </div>
  );

  const renderSection = (section) => {
    const sectionComponents = {
      section21A: RenderSection21A,
      section21B: RenderSection21B,
      section21C: RenderSection21C,
      section21D: RenderSection21D,
      section21D1: RenderSection21D1,
      section21E: RenderSection21E,
    };

    const SectionComponent = sectionComponents[section];
    const sectionData = data[section];

    if (!SectionComponent || !sectionData) {
      return null;
    }

    return (
      <SectionComponent
        data={sectionData}
        onInputChange={(path, value) => handleInputChange(path, value)}
        path={`${path}`}
        isReadOnlyField={isReadOnlyField}
        onAddEntry={onAddEntry}
        onRemoveEntry={onRemoveEntry}
        getDefaultNewItem={getDefaultNewItem}
      />
    );
  };

  const shouldRenderSection21E = () => {
    return (
      !data.declaredMentallyIncompetent &&
      !data.consultMentalHealth &&
      !data.hospitalizedMentalHealth &&
      !data.beenDiagnosed &&
      renderBooleanInput(
        "Section 21E Do you have a mental health or other health condition that substantially adversely affects your judgment, reliability, or trustworthiness even if you are not experiencing such symptoms today?",
        data.substantialAffects,
        (value) => handleInputChange(`${path}.substantialAffects`, value)
      )
    );
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">
        Section 21 - Psychological and Emotional Health
      </h3>

      {renderBooleanInput(
        "Section 21A Has a court or administrative agency EVER issued an order declaring you mentally incompetent",
        data.declaredMentallyIncompetent,
        (value) =>
          handleInputChange(`${path}.declaredMentallyIncompetent`, value)
      )}
      {data.declaredMentallyIncompetent && renderSection("section21A")}

      {renderBooleanInput(
        "Section 21B Has a court or administrative agency EVER ordered you to consult with a mental health professional (for example, a psychiatrist, psychologist, licensed clinical social worker, etc.)?",
        data.consultMentalHealth,
        (value) => handleInputChange(`${path}.consultMentalHealth`, value)
      )}
      {data.consultMentalHealth && renderSection("section21B")}

      {renderBooleanInput(
        "Section 21C Have you EVER been hospitalized for a mental health condition?",
        data.hospitalizedMentalHealth,
        (value) => handleInputChange(`${path}.hospitalizedMentalHealth`, value)
      )}
      {data.hospitalizedMentalHealth && renderSection("section21C")}

      {renderBooleanInput(
        "Section 21D Have you EVER been diagnosed by a physician or other health professional (for example, a psychiatrist, psychologist, licensed clinical social worker, or nurse practitioner) with psychotic disorder, schizophrenia, schizoaffective disorder, delusional disorder, bipolar mood disorder, borderline personality disorder, or antisocial personality disorder?",
        data.beenDiagnosed,
        (value) => handleInputChange(`${path}.beenDiagnosed`, value)
      )}
      {data.beenDiagnosed && renderSection("section21D")}

      {data.beenDiagnosed && renderBooleanInput(
        "Section 21D.1 Are you currently in treatment?",
        data.currentlyInTreatment,
        (value) => handleInputChange(`${path}.currentlyInTreatment`, value)
      )}
      {data.currentlyInTreatment && renderSection("section21D1")}

      {shouldRenderSection21E() && renderSection("section21E")}
    </div>
  );
};

export { RenderMentalHealth };
