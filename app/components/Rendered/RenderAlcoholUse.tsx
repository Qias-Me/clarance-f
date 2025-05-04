import React from "react";
import {type FormInfo} from "api/interfaces/FormInfo";

import { type AlcoholUse } from "api/interfaces/sections/alcoholUse";

import { RenderSection24_1 } from "../_alcohol/section24_1";
import { RenderSection24_2 } from "../_alcohol/section24_2";
import { RenderSection24_3 } from "../_alcohol/section24_3";
import { RenderSection24_4 } from "../_alcohol/section24_4";

interface FormProps {
  data: AlcoholUse;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
}

const RenderAlcoholUse: React.FC<FormProps> = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  getDefaultNewItem,
  isReadOnlyField,
  path,
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
      negativeImpact: "section24_1",
      suggestedCounseling: "section24_2",
      voluntaryCounseling: "section24_3",
      additionalCounseling: "section24_4",
    };

    const field = path.split(".").pop();
    if (field && sectionMap[field]) {
      const section = sectionMap[field];
      if (!data[section]) {
        onAddEntry(
          `alcoholUse.${section}`,
          getDefaultNewItem(`alcoholUse.${section}`)
        );
      }
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
          <label htmlFor={`${label}-yes`} className="cursor-pointer">Yes</label>
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
          <label htmlFor={`${label}-no`} className="cursor-pointer">No</label>
        </div>
      </div>
    </div>
  );
  

  const renderSection = (section) => {
    const sectionComponents = {
      section24_1: RenderSection24_1,
      section24_2: RenderSection24_2,
      section24_3: RenderSection24_3,
      section24_4: RenderSection24_4,
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
      <h3 className="text-lg font-semibold">Section 24 - Use of Alcohol</h3>

      {renderBooleanInput(
        "Section 24.1 In the last seven (7) years has your use of alcohol had a negative impact on your work performance, your professional or personal relationships, your finances, or resulted in intervention by law enforcement/public safety personnel?",
        data.negativeImpact,
        (value) => handleInputChange(`${path}.negativeImpact`, value)
      )}
      {data.negativeImpact && renderSection("section24_1")}

      {renderBooleanInput(
        "Section 24.2 Have you EVER been ordered, advised, or asked to seek counseling or treatment as a result of your use of alcohol?",
        data.suggestedCounseling,
        (value) => handleInputChange(`${path}.suggestedCounseling`, value)
      )}
      {data.suggestedCounseling && renderSection("section24_2")}

      {renderBooleanInput(
        "Section 24.3 Have you EVER voluntarily sought counseling or treatment as a result of your use of alcohol?",
        data.voluntaryCounseling,
        (value) => handleInputChange(`${path}.voluntaryCounseling`, value)
      )}
      {data.voluntaryCounseling && renderSection("section24_3")}

      {renderBooleanInput(
        "Section 24.4 Have you EVER received counseling or treatment as a result of your use of alcohol in addition to what you have already listed on this form?",
        data.additionalCounseling,
        (value) => handleInputChange(`${path}.additionalCounseling`, value)
      )}
      {data.additionalCounseling && renderSection("section24_4")}
    </div>
  );
};

export { RenderAlcoholUse };
