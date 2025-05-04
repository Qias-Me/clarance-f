import React from "react";
import {type FormInfo} from "api/interfaces/FormInfo";

import { type DrugActivity } from "api/interfaces/sections/drugsActivity";

import { RenderSection23_1 } from "../_drugs/section23_1";
import { RenderSection23_2 } from "../_drugs/section23_2";
import { RenderSection23_3 } from "../_drugs/section23_3";
import { RenderSection23_4 } from "../_drugs/section23_4";
import { RenderSection23_5 } from "../_drugs/section23_5";
import { RenderSection23_6 } from "../_drugs/section23_6";
import { RenderSection23_7 } from "../_drugs/section23_7";

interface FormProps {
  data: DrugActivity;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
}

const RenderDrugActivity: React.FC<FormProps> = ({
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
      hasUsed: "section23_1",
      hasInvolvement: "section23_2",
      illegalWhileProcessing: "section23_3",
      usedWhilePublicSaftey: "section23_4",
      usedNotPerscribed: "section23_5",
      suggestedCounsoling: "section23_6",
      voluntaryCounsoling: "section23_7",
    };

    const field = path.split(".").pop();
    if (field && sectionMap[field]) {
      const section = sectionMap[field];
      if (!data[section] || data[section].length === 0) {
        onAddEntry(
          `drugActivity.${section}`,
          getDefaultNewItem(`drugActivity.${section}`)
        );
      }
    }
  };

  const handleSectionRemove = (path: string) => {
    const sectionMap: { [key: string]: string } = {
      hasUsed: "section23_1",
      hasInvolvement: "section23_2",
      illegalWhileProcessing: "section23_3",
      usedWhilePublicSaftey: "section23_4",
      usedNotPerscribed: "section23_5",
      suggestedCounsoling: "section23_6",
      voluntaryCounsoling: "section23_7",
    };

    const field = path.split(".").pop();
    if (field && sectionMap[field]) {
      const section = sectionMap[field];
      onInputChange(`drugActivity.${section}`, []);
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
      section23_1: RenderSection23_1,
      section23_2: RenderSection23_2,
      section23_3: RenderSection23_3,
      section23_4: RenderSection23_4,
      section23_5: RenderSection23_5,
      section23_6: RenderSection23_6,
      section23_7: RenderSection23_7,
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
        Section 23 - Illegal Use of Drugs and Drug Activity
      </h3>

      {renderBooleanInput(
        "Section 23.1 In the last seven (7) years, have you illegally used any drugs or controlled substances? Use of a drug or controlled substance includes injecting, snorting, inhaling, swallowing, experimenting with or otherwise consuming any drug or controlled substance.",
        data.hasUsed,
        (value) => handleInputChange(`${path}.hasUsed`, value)
      )}
      {data.hasUsed && renderSection("section23_1")}

      {renderBooleanInput(
        "Section 23.2 In the last seven (7) years, have you been involved in the illegal purchase, manufacture, cultivation, trafficking, production, transfer, shipping, receiving, handling or sale of any drug or controlled substance?",
        data.hasInvolvement,
        (value) => handleInputChange(`${path}.hasInvolvement`, value)
      )}
      {data.hasInvolvement && renderSection("section23_2")}

      {renderBooleanInput(
        "Section 23.3 Have you EVER illegally used or otherwise been illegally involved with a drug or controlled substance while possessing a security clearance other than previously listed?",
        data.illegalWhileProcessing,
        (value) => handleInputChange(`${path}.illegalWhileProcessing`, value)
      )}
      {data.illegalWhileProcessing && renderSection("section23_3")}

      {renderBooleanInput(
        "Section 23.4 Have you EVER illegally used or otherwise been involved with a drug or controlled substance while employed as a law enforcement officer, prosecutor, or courtroom official; or while in a position directly and immediately affecting the public safety other than previously listed?",
        data.usedWhilePublicSaftey,
        (value) => handleInputChange(`${path}.usedWhilePublicSaftey`, value)
      )}
      {data.usedWhilePublicSaftey && renderSection("section23_4")}

      {renderBooleanInput(
        "Section 23.5 In the last seven (7) years have you intentionally engaged in the misuse of prescription drugs, regardless of whether or not the drugs were prescribed for you or someone else?",
        data.usedNotPerscribed,
        (value) => handleInputChange(`${path}.usedNotPerscribed`, value)
      )}
      {data.usedNotPerscribed && renderSection("section23_5")}

      {renderBooleanInput(
        "Section 23.6 Have you EVER been ordered, advised, or asked to seek counseling or treatment as a result of your illegal use of drugs or controlled substances?",
        data.suggestedCounsoling,
        (value) => handleInputChange(`${path}.suggestedCounsoling`, value)
      )}
      {data.suggestedCounsoling && renderSection("section23_6")}

      {renderBooleanInput(
        "Section 23.7 Have you EVER voluntarily sought counseling or treatment as a result of your use of a drug or controlled substance?",
        data.voluntaryCounsoling,
        (value) => handleInputChange(`${path}.voluntaryCounsoling`, value)
      )}
      {data.voluntaryCounsoling && renderSection("section23_7")}
    </div>
  );
};

export { RenderDrugActivity };
