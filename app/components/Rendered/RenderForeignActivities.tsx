import React from "react";
import {type FormInfo} from "api/interfaces/FormInfo";

import { type ForeignActivities } from "api/interfaces/sections/foreignActivities";
import { RenderSection20A1 } from "../_foreginActivities/section20A1";
import { RenderSection20A2 } from "../_foreginActivities/section20A2";
import { RenderSection20A3 } from "../_foreginActivities/section20A3";
import { RenderSection20A4 } from "../_foreginActivities/section20A4";
import { RenderSection20A5 } from "../_foreginActivities/section20A5";
import { RenderSection20B1 } from "../_foreginActivities/section20B1";
import { RenderSection20B2 } from "../_foreginActivities/section20B2";
import { RenderSection20B3 } from "../_foreginActivities/section20B3";
import { RenderSection20B4 } from "../_foreginActivities/section20B4";
import { RenderSection20B5 } from "../_foreginActivities/section20B5";
import { RenderSection20B6 } from "../_foreginActivities/section20B6";
import { RenderSection20B7 } from "../_foreginActivities/section20B7";
import { RenderSection20B8 } from "../_foreginActivities/section20B8";
import { RenderSection20B9 } from "../_foreginActivities/section20B9";
import { RenderSection20C } from "../_foreginActivities/section20C";

interface FormProps {
  data: ForeignActivities;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
}

const RenderForeignActivities: React.FC<FormProps> = ({
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
      hasForeignFinancialInterest: "section20A1",
      hasForeignInterestOnBehalf: "section20A2",
      wantForeignRealEstate: "section20A3",
      hasForeignSupport: "section20A4",
      providedForeignSupport: "section20A5",
      providedForeignAdvice: "section20B1",
      familyProvidedForeignAdvice: "section20B2",
      offeredForeignJob: "section20B3",
      offeredBuisnessVenture: "section20B4",
      foreignConferences: "section20B5",
      contactForeignGovernment: "section20B6",
      sponsoredForeignNational: "section20B7",
      foreignPoliticalOffice: "section20B8",
      foreignVote: "section20B9",
      traveledOutsideUSA: "section20C",
      traveledOutsideUSA_Government: "section20C",
    };

    const field = path.split(".").pop();
    if (field && sectionMap[field]) {
      const section = sectionMap[field];
      if (!data[section]) {
        onAddEntry(
          `foreignActivities.${section}`,
          getDefaultNewItem(`foreignActivities.${section}`)
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
      section20A1: RenderSection20A1,
      section20A2: RenderSection20A2,
      section20A3: RenderSection20A3,
      section20A4: RenderSection20A4,
      section20A5: RenderSection20A5,
      section20B1: RenderSection20B1,
      section20B2: RenderSection20B2,
      section20B3: RenderSection20B3,
      section20B4: RenderSection20B4,
      section20B5: RenderSection20B5,
      section20B6: RenderSection20B6,
      section20B7: RenderSection20B7,
      section20B8: RenderSection20B8,
      section20B9: RenderSection20B9,
      section20C: RenderSection20C,
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
        Section 20A - Foreign Activities
      </h3>

      {renderBooleanInput(
        "Section 20A.1 Has Foreign Financial Interest",
        data.hasForeignFinancialInterest,
        (value) =>
          handleInputChange(`${path}.hasForeignFinancialInterest`, value)
      )}
      {data.hasForeignFinancialInterest && renderSection("section20A1")}

      {renderBooleanInput(
        "Section 20A.2 Has Foreign Interest On Behalf",
        data.hasForeignInterestOnBehalf,
        (value) =>
          handleInputChange(`${path}.hasForeignInterestOnBehalf`, value)
      )}
      {data.hasForeignInterestOnBehalf && renderSection("section20A2")}

      {renderBooleanInput(
        "Section 20A.3 Want Foreign Real Estate",
        data.wantForeignRealEstate,
        (value) => handleInputChange(`${path}.wantForeignRealEstate`, value)
      )}
      {data.wantForeignRealEstate && renderSection("section20A3")}

      {renderBooleanInput(
        "Section 20A.4 Has Foreign Support",
        data.hasForeignSupport,
        (value) => handleInputChange(`${path}.hasForeignSupport`, value)
      )}
      {data.hasForeignSupport && renderSection("section20A4")}

      {renderBooleanInput(
        "Section 20A.5 Provided Foreign Support",
        data.providedForeignSupport,
        (value) => handleInputChange(`${path}.providedForeignSupport`, value)
      )}
      {data.providedForeignSupport && renderSection("section20A5")}

      {renderBooleanInput(
        "Section 20B.1 Provided Foreign Advice",
        data.providedForeignAdvice,
        (value) => handleInputChange(`${path}.providedForeignAdvice`, value)
      )}
      {data.providedForeignAdvice && renderSection("section20B1")}

      {renderBooleanInput(
        "Section 20B.2 Family Provided Foreign Advice",
        data.familyProvidedForeignAdvice,
        (value) =>
          handleInputChange(`${path}.familyProvidedForeignAdvice`, value)
      )}
      {data.familyProvidedForeignAdvice && renderSection("section20B2")}

      {renderBooleanInput(
        "Section 20B.3 Offered Foreign Job",
        data.offeredForeignJob,
        (value) => handleInputChange(`${path}.offeredForeignJob`, value)
      )}
      {data.offeredForeignJob && renderSection("section20B3")}

      {renderBooleanInput(
        "Section 20B.4 Offered Business Venture",
        data.offeredBuisnessVenture,
        (value) => handleInputChange(`${path}.offeredBuisnessVenture`, value)
      )}
      {data.offeredBuisnessVenture && renderSection("section20B4")}

      {renderBooleanInput(
        "Section 20B.5 Foreign Conferences",
        data.foreignConferences,
        (value) => handleInputChange(`${path}.foreignConferences`, value)
      )}
      {data.foreignConferences && renderSection("section20B5")}

      {renderBooleanInput(
        "Section 20B.6 Contact with Foreign Government",
        data.contactForeignGovernment,
        (value) => handleInputChange(`${path}.contactForeignGovernment`, value)
      )}
      {data.contactForeignGovernment && renderSection("section20B6")}

      {renderBooleanInput(
        "Section 20B.7 Sponsored Foreign National",
        data.sponsoredForeignNational,
        (value) => handleInputChange(`${path}.sponsoredForeignNational`, value)
      )}
      {data.sponsoredForeignNational && renderSection("section20B7")}

      {renderBooleanInput(
        "Section 20B.8 Held Foreign Political Office",
        data.foreignPoliticalOffice,
        (value) => handleInputChange(`${path}.foreignPoliticalOffice`, value)
      )}
      {data.foreignPoliticalOffice && renderSection("section20B8")}

      {renderBooleanInput(
        "Section 20B.9 Voted in Election Outside of USA",
        data.foreignVote,
        (value) => handleInputChange(`${path}.foreignVote`, value)
      )}
      {data.foreignVote && renderSection("section20B9")}

      {renderBooleanInput(
        "Section 20C Traveled Outside USA",
        data.traveledOutsideUSA,
        (value) => handleInputChange(`${path}.traveledOutsideUSA`, value)
      )}
      {data.traveledOutsideUSA &&
        renderBooleanInput(
          "Section 20C Traveled Outside USA for Government",
          data.traveledOutsideUSA_Government,
          (value) =>
            handleInputChange(`${path}.traveledOutsideUSA_Government`, value)
        )}
      {data.traveledOutsideUSA &&
        data.traveledOutsideUSA_Government &&
        renderSection("section20C")}
    </div>
  );
};

export { RenderForeignActivities };
