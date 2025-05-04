import React from "react";
import {type FormInfo} from "api/interfaces/FormInfo";

import { type Civil } from "api/interfaces/sections/civil";

import { RenderSection28_1 } from "../_civil/section28_1";

interface FormProps {
  data: Civil;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
}

const RenderCivil: React.FC<FormProps> = ({
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
      civilCourt: "section28_1"
    };

    const field = path.split(".").pop();
    if (field && sectionMap[field]) {
      const section = sectionMap[field];
      if (!data[section] || data[section].length === 0) {
        onAddEntry(
          `civil.${section}`,
          getDefaultNewItem(`civil.${section}`)
        );
      }
    }
  };

  const handleSectionRemove = (path: string) => {
    const sectionMap: { [key: string]: string } = {
      civilCourt: "section28_1"
    };

    const field = path.split(".").pop();
    if (field && sectionMap[field]) {
      const section = sectionMap[field];
      onInputChange(`civil.${section}`, []);
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
      section28_1: RenderSection28_1
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
        Section 28 - Use of Information Civil Systems
      </h3>

      {renderBooleanInput(
        "Section 28 In the last ten (10) years, have you been a party to any public record civil court action not listed elsewhere on this form?",
        data.civilCourt,
        (value) => handleInputChange(`${path}.civilCourt`, value)
      )}
      {data.civilCourt && renderSection("section28_1")}

    </div>
  );
};

export { RenderCivil };
