import React, { useState } from "react";
import FormInfo from "api_v2/interfaces/FormInfo";
import { Finances } from "api_v2/interfaces/finances";

import { RenderSection26_1 } from "../_finances/section26_1";
import { RenderSection26_2 } from "../_finances/section26_2";
import { RenderSection26_3 } from "../_finances/section26_3";
import { RenderSection26_4 } from "../_finances/section26_4";
import { RenderSection26_5 } from "../_finances/section26_5";
import { RenderSection26_6 } from "../_finances/section26_6";
import { RenderSection26_7 } from "../_finances/section26_7";

interface FormProps {
  data: Finances;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
}

const RenderFinances: React.FC<FormProps> = ({
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

  interface DetailedDropdownProps {
    label: string;
    initialShowDetails: boolean;
    details: string[];
    onChange: (value: boolean) => void;
  }

  const DetailsList: React.FC<{ details: string[] }> = ({ details }) => (
    <ul className="list-disc list-inside ml-6">
      {details.map((detail, index) => (
        <li key={index}>{detail}</li>
      ))}
    </ul>
  );

  const DetailedDropdown: React.FC<DetailedDropdownProps> = ({
    label,
    initialShowDetails,
    details,
    onChange,
  }) => {
    const [showDetails, setShowDetails] = useState(initialShowDetails);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleInputChange = (value: boolean) => {
      onChange(value);
    };

    const toggleDetails = () => {
      setIsExpanded(!isExpanded);
    };

    return (
      <div className="flex flex-col space-y-4 p-4  shadow-md rounded-lg">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDetails}
            aria-label="Toggle Details"
            className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-150 ease-in-out"
          >
            <span className="text-xl">{isExpanded ? "▲" : "▼"}</span>
          </button>
          <span className="">{label}</span>
        </div>
        <div className="flex items-center space-x-4 mt-2">
          <div>
            <input
              type="radio"
              id={`${label}-yes`}
              name={label}
              value="true"
              checked={showDetails === true}
              onChange={() => handleInputChange(true)}
            />
            <label htmlFor={`${label}-yes`} className="ml-2 cursor-pointer">
              Yes
            </label>
          </div>
          <div>
            <input
              type="radio"
              id={`${label}-no`}
              name={label}
              value="false"
              checked={showDetails === false}
              onChange={() => handleInputChange(false)}
            />
            <label htmlFor={`${label}-no`} className="ml-2 cursor-pointer">
              No
            </label>
          </div>
        </div>
        {isExpanded && <DetailsList details={details} />}
      </div>
    );
  };

  const handleSectionAdd = (path: string) => {
    const sectionMap: { [key: string]: string } = {
      filedBankruptcy: "section26_1",
      gamblingProblem: "section26_2",
      missedTaxes: "section26_3",
      companyViolation: "section26_4",
      counseling: "section26_5",
      delinquent: "section26_6",
      reposessions: "section26_7",
    };

    const field = path.split(".").pop();
    if (field && sectionMap[field]) {
      const section = sectionMap[field];
      if (!data[section] || data[section].length === 0) {
        onAddEntry(
          `finances.${section}`,
          getDefaultNewItem(`finances.${section}`)
        );
      }
    }
  };

  const handleSectionRemove = (path: string) => {
    const sectionMap: { [key: string]: string } = {
      filedBankruptcy: "section26_1",
      gamblingProblem: "section26_2",
      missedTaxes: "section26_3",
      companyViolation: "section26_4",
      counseling: "section26_5",
      delinquent: "section26_6",
      reposessions: "section26_7",
    };

    const field = path.split(".").pop();
    if (field && sectionMap[field]) {
      const section = sectionMap[field];
      onInputChange(`finances.${section}`, []);
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
      section26_1: RenderSection26_1,
      section26_2: RenderSection26_2,
      section26_3: RenderSection26_3,
      section26_4: RenderSection26_4,
      section26_5: RenderSection26_5,
      section26_6: RenderSection26_6,
      section26_7: RenderSection26_7,
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
      <h3 className="text-lg font-semibold">Section 26 - Financial Record</h3>

      {renderBooleanInput(
        "Section 26.1 In the last seven (7) years have you filed a petition under any chapter of the bankruptcy code?",
        data.filedBankruptcy,
        (value) => handleInputChange(`${path}.filedBankruptcy`, value)
      )}
      {data.filedBankruptcy && renderSection("section26_1")}

      {renderBooleanInput(
        "Section 26.2 Have you EVER experienced financial problems due to gambling?",
        data.gamblingProblem,
        (value) => handleInputChange(`${path}.gamblingProblem`, value)
      )}
      {data.gamblingProblem && renderSection("section26_2")}

      {renderBooleanInput(
        "Section 26.3 In the last seven (7) years have you failed to file or pay Federal, state, or other taxes when required by law or ordinance?",
        data.missedTaxes,
        (value) => handleInputChange(`${path}.missedTaxes`, value)
      )}
      {data.missedTaxes && renderSection("section26_3")}

      {renderBooleanInput(
        "Section 26.4 In the last seven (7) years have you been counseled, warned, or disciplined for violating the terms of agreement for a travel or credit card provided by your employer?",
        data.companyViolation,
        (value) => handleInputChange(`${path}.companyViolation`, value)
      )}
      {data.companyViolation && renderSection("section26_4")}

      {renderBooleanInput(
        "Section 26.5 Are you currently utilizing, or seeking assistance from, a credit counseling service or other similar resource to resolve your financial difficulties? ",
        data.counseling,
        (value) => handleInputChange(`${path}.counseling`, value)
      )}
      {data.counseling && renderSection("section26_5")}

      <DetailedDropdown
        label="Section 26.6 Other than previously listed, have any of the following happened to you? (You will be asked to provide details about each financial obligation that pertains to the items identified below):"
        initialShowDetails={data.delinquent}
        details={[
          "In the last seven (7) years, you have been delinquent on alimony or child support payments.",
          "In the last seven (7) years, you had a judgment entered against you. (Include financial obligations for which you were the sole debtor, as well as those for which you were a cosigner or guarantor).",
          "In the last seven (7) years, you had a lien placed against your property for failing to pay taxes or other debts. (Include financial obligations for which you were the sole debtor, as well as those for which you were a cosigner or guarantor).",
          "You are currently delinquent on any Federal debt. (Include financial obligations for which you are the sole debtor, as well as those for which you are a cosigner or guarantor).",
        ]}
        onChange={(value) => handleInputChange(`${path}.delinquent`, value)}
      />

      {data.delinquent && renderSection("section26_6")}

      <DetailedDropdown
        label="Section 26.7 Other than previously listed, have any of the following happened:"
        initialShowDetails={data.reposessions}
        details={[
          "In the last seven (7) years, you had any possessions or property voluntarily or involuntarily repossessed or foreclosed? (Include financial obligations for which you were the sole debtor, as well as those for which you were a cosigner or guarantor).",
          "In the last seven (7) years, you defaulted on any type of loan? (Include financial obligations for which you were the sole debtor, as well as those for which you were a cosigner or guarantor).",
          "In the last seven (7) years, you had bills or debts turned over to a collection agency? (Include financial obligations for which you were the sole debtor, as well as those for which you were a cosigner or guarantor).",
          "In the last seven (7) years, you had any account or credit card suspended, charged off, or cancelled for failing to pay as agreed? (Include financial obligations for which you were the sole debtor, as well as those for which you were a cosigner or guarantor).",
          "In the last seven (7) years, you were evicted for non,ayment?",
          "In the last seven (7) years, you had wages, benefits, or assets garnished or attached for any reason?",
          "In the last seven (7) years, you were over 120 days delinquent on any debt not previously entered? (Include financial obligations for which you were the sole debtor, as well as those for which you were a cosigner or guarantor).",
          "You are currently over 120 days delinquent on any debt? (Include financial obligations for which you are the sole debtor, as well as those for which you are a cosigner or guarantor).",
        ]}
        onChange={(value) => handleInputChange(`${path}.reposessions`, value)}
      />

      {data.reposessions && renderSection("section26_7")}
    </div>
  );
};

export { RenderFinances };
