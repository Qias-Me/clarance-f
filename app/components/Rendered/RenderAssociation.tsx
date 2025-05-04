import React from "react";
import FormInfo from "api_v2/interfaces/FormInfo";
import { Association } from "api_v2/interfaces/association";

import { RenderSection29_1 } from "../_association/section29_1";
import { RenderSection29_2 } from "../_association/section29_2";
import { RenderSection29_3 } from "../_association/section29_3";
import { RenderSection29_4 } from "../_association/section29_4";
import { RenderSection29_5 } from "../_association/section29_5";
import { RenderSection29_6 } from "../_association/section29_6";
import { RenderSection29_7 } from "../_association/section29_7";

interface FormProps {
  data: Association;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
}

const RenderAssociation: React.FC<FormProps> = ({
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
      terrorismMember: "section29_1",
      actsOfTerrorism: "section29_2",
      overthrowByForce: "section29_3",
      dedicatedViolent: "section29_4",
      advocatesViolence: "section29_5",
      engagedInOverthrow: "section29_6",
      terrorismAssociate: "section29_7",
    };

    const field = path.split(".").pop();
    if (field && sectionMap[field]) {
      const section = sectionMap[field];
      if (!data[section] || data[section].length === 0) {
        onAddEntry(
          `association.${section}`,
          getDefaultNewItem(`association.${section}`)
        );
      }
    }
  };

  const handleSectionRemove = (path: string) => {
    const sectionMap: { [key: string]: string } = {
      terrorismMember: "section29_1",
      actsOfTerrorism: "section29_2",
      overthrowByForce: "section29_3",
      dedicatedViolent: "section29_4",
      advocatesViolence: "section29_5",
      engagedInOverthrow: "section29_6",
      terrorismAssociate: "section29_7",
    };

    const field = path.split(".").pop();
    if (field && sectionMap[field]) {
      const section = sectionMap[field];
      onInputChange(`association.${section}`, []);
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
      section29_1: RenderSection29_1,
      section29_2: RenderSection29_2,
      section29_3: RenderSection29_3,
      section29_4: RenderSection29_4,
      section29_5: RenderSection29_5,
      section29_6: RenderSection29_6,
      section29_7: RenderSection29_7,
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
      Section 29 - Association Record
      </h3>

      {renderBooleanInput(
        "Section 29.1 Are you now or have you EVER been a member of an organization dedicated to terrorism, either with an awareness of the organization's dedication to that end, or with the specific intent to further such activities?",
        data.terrorismMember,
        (value) => handleInputChange(`${path}.terrorismMember`, value)
      )}
      {data.terrorismMember && renderSection("section29_1")}

      {renderBooleanInput(
        "Section 29.2 Have you EVER knowingly engaged in any acts of terrorism?",
        data.actsOfTerrorism,
        (value) => handleInputChange(`${path}.actsOfTerrorism`, value)
      )}
      {data.actsOfTerrorism && renderSection("section29_2")}

      {renderBooleanInput(
        "Section 29.3 Have you EVER advocated any acts of terrorism or activities designed to overthrow the U.S. Government by force?",
        data.overthrowByForce,
        (value) => handleInputChange(`${path}.overthrowByForce`, value)
      )}
      {data.overthrowByForce && renderSection("section29_3")}

      {renderBooleanInput(
        "Section 29.4 Have you EVER been a member of an organization dedicated to the use of violence or force to overthrow the United States Government, and which engaged in activities to that end with an awareness of the organization's dedication to that end or with the specific intent to further such activities?",
        data.dedicatedViolent,
        (value) => handleInputChange(`${path}.dedicatedViolent`, value)
      )}
      {data.dedicatedViolent && renderSection("section29_4")}

      {renderBooleanInput(
        "Section 29.5 Have you EVER been a member of an organization that advocates or practices commission of acts of force or violence to discourage others from exercising their rights under the U.S. Constitution or any state of the United States with the specific intent to further such action?",
        data.advocatesViolence,
        (value) => handleInputChange(`${path}.advocatesViolence`, value)
      )}
      {data.advocatesViolence && renderSection("section29_5")}

      {renderBooleanInput(
        "Section 29.6 Have you EVER knowingly engaged in activities designed to overthrow the U.S. Government by force?",
        data.engagedInOverthrow,
        (value) => handleInputChange(`${path}.engagedInOverthrow`, value)
      )}
      {data.engagedInOverthrow && renderSection("section29_6")}

      {renderBooleanInput(
        "Section 29.7 Have you EVER associated with anyone involved in activities to further terrorism?",
        data.terrorismAssociate,
        (value) => handleInputChange(`${path}.terrorismAssociate`, value)
      )}
      {data.terrorismAssociate && renderSection("section29_7")}
    </div>
  );
};

export { RenderAssociation };
