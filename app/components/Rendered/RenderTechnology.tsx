import React from "react";
import {type FormInfo} from "api/interfaces/FormInfo";

import { type Technology } from "api/interfaces/sections/technology";

import { RenderSection27_1 } from "../_technology/section27_1";
import { RenderSection27_2 } from "../_technology/section27_2";
import { RenderSection27_3 } from "../_technology/section27_3";

interface FormProps {
  data: Technology;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
}

const RenderTechnology: React.FC<FormProps> = ({
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
      illegalAccess: "section27_1",
      illegalModification: "section27_2",
      unauthorizedUse: "section27_3",
    };

    const field = path.split(".").pop();
    if (field && sectionMap[field]) {
      const section = sectionMap[field];
      if (!data[section] || data[section].length === 0) {
        onAddEntry(
          `technology.${section}`,
          getDefaultNewItem(`technology.${section}`)
        );
      }
    }
  };

  const handleSectionRemove = (path: string) => {
    const sectionMap: { [key: string]: string } = {
      illegalAccess: "section27_1",
      illegalModification: "section27_2",
      unauthorizedUse: "section27_3",
    };

    const field = path.split(".").pop();
    if (field && sectionMap[field]) {
      const section = sectionMap[field];
      onInputChange(`technology.${section}`, []);
    }
  };

  const renderBooleanInput = (
    label: string,
    value: boolean,
    onChange: (value: boolean) => void
  ) => (
    <div className="flex flex-col space-y-2 p-4  shadow-md rounded-lg">
      <span className="">{label}</span>
      <div className="flex items-center space-x-4 mt-2">
        <div>
          <input
            type="radio"
            id={`${label}-yes`}
            name={label}
            value="true"
            checked={value === true}
            onChange={() => onChange(true)}
            className="mr-2"
          />
          <label htmlFor={`${label}-yes`} className="cursor-pointer">
            Yes
          </label>
        </div>
        <div>
          <input
            type="radio"
            id={`${label}-no`}
            name={label}
            value="false"
            checked={value === false}
            onChange={() => onChange(false)}
            className="mr-2"
          />
          <label htmlFor={`${label}-no`} className="cursor-pointer">
            No
          </label>
        </div>
      </div>
    </div>
  );

  const renderSection = (section) => {
    const sectionComponents = {
      section27_1: RenderSection27_1,
      section27_2: RenderSection27_2,
      section27_3: RenderSection27_3,
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
        Section 27 - Use of Information Technology Systems
      </h3>

      {renderBooleanInput(
        "Section 27.1 In the last seven (7) years have you illegally or without proper authorization accessed or attempted to access any information technology system?",
        data.illegalAccess,
        (value) => handleInputChange(`${path}.illegalAccess`, value)
      )}
      {data.illegalAccess && renderSection("section27_1")}

      {renderBooleanInput(
        "Section 27.2 In the last seven (7) years have you illegally or without authorization, modified, destroyed, manipulated, or denied others access to information residing on an information technology system or attempted any of the above?",
        data.illegalModification,
        (value) => handleInputChange(`${path}.illegalModification`, value)
      )}
      {data.illegalModification && renderSection("section27_2")}

      {renderBooleanInput(
        "Section 27.3 In the last seven (7) years have you introduced, removed, or used hardware, software, or media in connection with any information technology system without authorization, when specifically prohibited by rules, procedures, guidelines, or regulations or attempted any of the above?",
        data.unauthorizedUse,
        (value) => handleInputChange(`${path}.unauthorizedUse`, value)
      )}
      {data.unauthorizedUse && renderSection("section27_3")}
    </div>
  );
};

export { RenderTechnology };
