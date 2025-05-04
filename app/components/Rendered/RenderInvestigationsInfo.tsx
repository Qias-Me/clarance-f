import React from "react";
import FormInfo from "api_v2/interfaces/FormInfo";
import { InvestigationsInfo } from "api_v2/interfaces/InvestigationsInfo";

import { RenderSection25_1 } from "../_investigations/section25_1";
import { RenderSection25_2 } from "../_investigations/section25_2";
import { RenderSection25_3 } from "../_investigations/section25_3";

interface FormProps {
  data: InvestigationsInfo;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
}

const RenderInvestigationsInfo: React.FC<FormProps> = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  getDefaultNewItem,
  isReadOnlyField,
  path,
}) => {
  const handleInputChange = (path: string, value: any) => {
    onInputChange(path, value);

    if (value === true) {
      handleSectionAdd(path);
    } else if (value === false) {
      handleSectionRemove(path);
      handleSectionAdd(path); // Add the default entry after clearing
    }
  };

  const handleSectionAdd = (path: string) => {
    const sectionMap: { [key: string]: string } = {
      governmentInvestigated: "section25_1",
      revocation: "section25_2",
      debarred: "section25_3",
    };

    const field = path.split(".").pop();
    if (field && sectionMap[field]) {
      const section = sectionMap[field];
      if (!data[section] || data[section].length === 0) {
        onAddEntry(
          `investigationsInfo.${section}`,
          getDefaultNewItem(`investigationsInfo.${section}`)
        );
      }
    }
  };

  const handleSectionRemove = (path: string) => {
    const sectionMap: { [key: string]: string } = {
      governmentInvestigated: "section25_1",
      revocation: "section25_2",
      debarred: "section25_3",
    };

    const field = path.split(".").pop();
    if (field && sectionMap[field]) {
      const section = sectionMap[field];
      onInputChange(`investigationsInfo.${section}`, []);
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
      section25_1: RenderSection25_1,
      section25_2: RenderSection25_2,
      section25_3: RenderSection25_3,
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

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">
        Section 25 - Investigations and Clearance Record
      </h3>

      {renderBooleanInput(
        "Section 25.1 Has the U.S. Government (or a foreign government) EVER investigated your background and/or granted you a security clearance eligibility/access?",
        data.governmentInvestigated,
        (value) => handleInputChange(`${path}.governmentInvestigated`, value)
      )}
      {data.governmentInvestigated && renderSection("section25_1")}

      {renderBooleanInput(
        "Section 25.2 Have you EVER had a security clearance eligibility/access authorization denied, suspended, or revoked? (Note: An administrative downgrade or administrative termination of a security clearance is not a revocation.",
        data.revocation,
        (value) => handleInputChange(`${path}.revocation`, value)
      )}
      {data.revocation && renderSection("section25_2")}

      {renderBooleanInput(
        "Section 25.3 Have you EVER been debarred from government employment?",
        data.debarred,
        (value) => handleInputChange(`${path}.debarred`, value)
      )}
      {data.debarred && renderSection("section25_3")}
    </div>
  );
};

export { RenderInvestigationsInfo };
