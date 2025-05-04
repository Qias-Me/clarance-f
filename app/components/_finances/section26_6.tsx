import React from "react";
import { Section26_6 } from "api_v2/interfaces/finances";

interface Section26_6Props {
  data: Section26_6[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section26_6) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection26_6: React.FC<Section26_6Props> = ({
  data,
  onInputChange,
  onRemoveEntry,
  onAddEntry,
  getDefaultNewItem,
  path,
  isReadOnlyField,
}) => {
  const formatValue = (value: string) => {
    // Convert the value to a number and format it to 2 decimal places, or return an empty string if not a number.
    const numberValue = parseFloat(value);
    return isNaN(numberValue) ? "" : numberValue.toFixed(2);
  };

  const handleTypeCheckboxChange = (
    index: number,
    type: any,
    field: string
  ) => {
    const entry = data[index];
    const specifyArray = initializeSpecify(entry[field]);

    // Check if the type is already selected
    const isSelected = specifyArray.some(
      (spec) =>
        spec.type === type || spec.option === type || spec.reason === type
    );

    // Update specify array based on whether type was already selected
    const updatedSpecify = isSelected
      ? specifyArray.filter(
          (spec) =>
            spec.type !== type && spec.option !== type && spec.reason !== type
        )
      : [
          ...specifyArray,
          { _id: new Date().getTime(), type, option: type, reason: type },
        ];

    // Update the entry specify field in your data state
    onInputChange(`${path}.section26_6[${index}].${field}`, updatedSpecify);
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

  const handleBlur =
    (index: number, fieldPath: string) =>
    (event: React.FocusEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const formattedValue = formatValue(value) || "0.00";
      onInputChange(
        `${path}.section26_6[${index}].${fieldPath}`,
        formattedValue
      );
    };

  // Ensure all entries have a valid specify array when component renders
  const initializeSpecify = (specify: any[]) =>
    Array.isArray(specify) ? specify : [];

  const handleInputChange =
    (index: number, fieldPath: string) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const value =
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value;
      onInputChange(`${path}.section26_6[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section26_6, index: number) => {
    const issues = [
      "Delinquent on alimony or child support payments",
      "Judgment entered against you",
      "Lien placed against your property",
      "Currently delinquent on any Federal debt",
    ];

    const specifyIssuesArray = initializeSpecify(item.financialIssueTypes);

    return (
      <div key={index} className="space-y-4 p-4 border rounded-lg">
        <h3>Entry #{index + 1}</h3>

        <label>
          Agency Name
          <input
            type="text"
            value={item.agencyName}
            onChange={handleInputChange(index, "agencyName")}
            readOnly={isReadOnlyField(`section26_6[${index}].agencyName`)}
          />
        </label>

        {renderBooleanInput(
          "Did/does this financial issue include any of the following? (Check all that apply)",
          item.doesInclude,
          (value) => {
            onInputChange(`${path}.section26_6.[${index}].doesInclude`, value);
            if (!value) {
              onInputChange(
                `${path}.section26_6.[${index}].financialIssueTypes`,
                []
              );
            }
          }
        )}
        {item.doesInclude && (
          <label>
            Financial Issue Types
            {[
              "Delinquent on alimony or child support payments",
              "Judgment entered against you",
              "Lien placed against your property",
              "Currently delinquent on any Federal debt",
            ].map((issue, issueIndex) => {
              return (
                <div key={issueIndex}>
                  <input
                    type="checkbox"
                    id={`specify_${index}_${issue}`}
                    name={`specify_${index}_${issue}`}
                    value={issue}
                    checked={specifyIssuesArray.some(
                      (spec) => spec.type === issue
                    )}
                    onChange={() =>
                      handleTypeCheckboxChange(
                        index,
                        issue,
                        "financialIssueTypes"
                      )
                    }
                    disabled={isReadOnlyField(
                      `${path}.section26_6[${index}].financialIssueTypes`
                    )}
                  />
                  <label htmlFor={`specify_${index}_${issue}`}>{issue}</label>
                </div>
              );
            })}
          </label>
        )}

        <label>
          Loan Account Numbers
          <input
            type="text"
            value={item.loanAccountNumbers}
            onChange={handleInputChange(index, "loanAccountNumbers")}
            readOnly={isReadOnlyField(
              `section26_6[${index}].loanAccountNumbers`
            )}
          />
        </label>

        <label>
          Property Involved
          <input
            type="text"
            value={item.propertyInvolved}
            onChange={handleInputChange(index, "propertyInvolved")}
            readOnly={isReadOnlyField(`section26_6[${index}].propertyInvolved`)}
          />
        </label>

        <label>
          Amount
          <input
            type="number"
            value={item.amount.amount}
            onChange={handleInputChange(index, "amount.amount")}
            onBlur={handleBlur(index, "amount.amount")}
            readOnly={isReadOnlyField(`section26_6[${index}].amount.amount`)}
          />
          <input
            type="checkbox"
            checked={item.amount.estimated}
            onChange={handleInputChange(index, "amount.estimated")}
            readOnly={isReadOnlyField(`section26_6[${index}].amount.estimated`)}
          />
          Estimated
        </label>

        <label>
          Issue Reason
          <input
            type="text"
            value={item.issueReason}
            onChange={handleInputChange(index, "issueReason")}
            readOnly={isReadOnlyField(`section26_6[${index}].issueReason`)}
          />
        </label>

        <label>
          Current Status
          <input
            type="text"
            value={item.currentStatus}
            onChange={handleInputChange(index, "currentStatus")}
            readOnly={isReadOnlyField(`section26_6[${index}].currentStatus`)}
          />
        </label>

        <label>
          Issue Date
          <input
            type="text"
            value={item.issueDate.date}
            onChange={handleInputChange(index, "issueDate.date")}
            readOnly={isReadOnlyField(`section26_6[${index}].issueDate.date`)}
          />
          <input
            type="checkbox"
            checked={item.issueDate.estimated}
            onChange={handleInputChange(index, "issueDate.estimated")}
            readOnly={isReadOnlyField(
              `section26_6[${index}].issueDate.estimated`
            )}
          />
          Estimated
        </label>

        <label>
          Resolution Date
          <input
            type="text"
            value={item.resolutionDate.date}
            onChange={handleInputChange(index, "resolutionDate.date")}
            readOnly={isReadOnlyField(
              `section26_6[${index}].resolutionDate.date`
            )}
          />
          <input
            type="checkbox"
            checked={item.resolutionDate.estimated}
            onChange={handleInputChange(index, "resolutionDate.estimated")}
            readOnly={isReadOnlyField(
              `section26_6[${index}].resolutionDate.estimated`
            )}
          />
          Estimated
        </label>

        <label>
          Court Name
          <input
            type="text"
            value={item.courtName}
            onChange={handleInputChange(index, "courtName")}
            readOnly={isReadOnlyField(`section26_6[${index}].courtName`)}
          />
        </label>

        <label>
          Court Address - Street
          <input
            type="text"
            value={item.courtAddress.street}
            onChange={handleInputChange(index, "courtAddress.street")}
            readOnly={isReadOnlyField(
              `section26_6[${index}].courtAddress.street`
            )}
            placeholder="Street"
          />
        </label>

        <label>
          Court Address - City
          <input
            type="text"
            value={item.courtAddress.city}
            onChange={handleInputChange(index, "courtAddress.city")}
            readOnly={isReadOnlyField(
              `section26_6[${index}].courtAddress.city`
            )}
            placeholder="City"
          />
        </label>

        <label>
          Court Address - State
          <input
            type="text"
            value={item.courtAddress.state}
            onChange={handleInputChange(index, "courtAddress.state")}
            readOnly={isReadOnlyField(
              `section26_6[${index}].courtAddress.state`
            )}
            placeholder="State"
          />
        </label>

        <label>
          Court Address - Zip Code
          <input
            type="text"
            value={item.courtAddress.zipCode}
            onChange={handleInputChange(index, "courtAddress.zipCode")}
            readOnly={isReadOnlyField(
              `section26_6[${index}].courtAddress.zipCode`
            )}
            placeholder="Zip Code"
          />
        </label>

        <label>
          Court Address - Country
          <input
            type="text"
            value={item.courtAddress.country}
            onChange={handleInputChange(index, "courtAddress.country")}
            readOnly={isReadOnlyField(
              `section26_6[${index}].courtAddress.country`
            )}
            placeholder="Country"
          />
        </label>

        <label>
          Actions Taken
          <textarea
            value={item.actionsTaken}
            onChange={handleInputChange(index, "actionsTaken")}
            readOnly={isReadOnlyField(`section26_6[${index}].actionsTaken`)}
          />
        </label>

        <button
          onClick={(event) => {
            event.preventDefault();
            onRemoveEntry(`${path}.section26_6`, index);
          }}
          disabled={isReadOnlyField(`section26_6[${index}].remove`)}
        >
          Remove Entry
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2>Section 26.6</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section26_6`,
            getDefaultNewItem(`${path}.section26_6`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection26_6 };
