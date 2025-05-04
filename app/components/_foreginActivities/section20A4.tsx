import React from "react";
import {
  type BenefitDetail,
  type OwnershipType,
  type Section20A4,
  type SpecifyType,
} from "api/interfaces/sections/foreignActivities";

interface Section20A4Props {
  data: Section20A4[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section20A4) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection20A4: React.FC<Section20A4Props> = ({
  data,
  onInputChange,
  onRemoveEntry,
  onAddEntry,
  getDefaultNewItem,
  path,
  isReadOnlyField,
}) => {
  // Ensure all entries have a valid specify array when component renders
  const initializeSpecify = (specify: SpecifyType[]) =>
    Array.isArray(specify) ? specify : [];

  // Handle checkbox changes
  const handleCheckboxChange = (index: number, type: SpecifyType["type"]) => {
    const entry = data[index];
    const specifyArray = initializeSpecify(entry.ownershipType);

    // Check if the type is already selected
    const isSelected = specifyArray.some((spec) => spec.type === type);

    // Update specify array based on whether type was already selected
    const updatedSpecify = isSelected
      ? specifyArray.filter((spec) => spec.type !== type)
      : [...specifyArray, { _id: new Date().getTime(), type }];

    // Update the entry specify field in your data state
    onInputChange(`${path}.section20A4[${index}].ownershipType`, updatedSpecify);
  };

  // Handle input changes
  const handleInputChange =
    (fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onInputChange(fieldPath, event.target.value);
    };

  const renderBenefitDetail = (
    benefitDetail: BenefitDetail | undefined,
    benefitPath: string
  ) => {
    if (!benefitDetail) return null;

    const formatValue = (value) => {
      // Convert the value to a number and format it to 2 decimal places, or return an empty string if not a number.
      const numberValue = parseFloat(value);
      return isNaN(numberValue) ? "" : numberValue.toFixed(2);
    };

    const handleCheckboxChange = (path, checked) => {
      console.log(path, "pathhh", checked, "checked");
      onInputChange(path, checked);
    };

    const handleBlur = (event) => {
      const value = event.target.value;
      console.log(value, "valueee");
      const formattedValue = formatValue(value) || "0.00";
      onInputChange(`${benefitPath}.totalValue.value`, formattedValue);
    };

    return (
      <div className="benefit-detail">
        <label htmlFor={`${benefitPath}-dateReceived`}>Date Received</label>
        <input
          id={`${benefitPath}-dateReceived`}
          type="text"
          value={benefitDetail.dateReceived.date}
          onChange={handleInputChange(`${benefitPath}.dateReceived.date`)}
        />
        <label htmlFor={`${benefitPath}-countryProviding`}>
          Country Providing
        </label>
        <input
          id={`${benefitPath}-countryProviding`}
          type="text"
          value={benefitDetail.countryProviding}
          onChange={handleInputChange(`${benefitPath}.countryProviding`)}
        />
        <label htmlFor={`${benefitPath}-totalValue`}>Total Value</label>
        <input
          id={`${benefitPath}-totalValue`}
          type="text"
          value={benefitDetail.totalValue.value}
          onChange={handleInputChange(`${benefitPath}.totalValue.value`)}
          onBlur={handleBlur}
        />
        <label htmlFor={`${benefitPath}-reason`}>Reason</label>
        <input
          id={`${benefitPath}-reason`}
          type="text"
          value={benefitDetail.reason}
          onChange={handleInputChange(`${benefitPath}.reason`)}
        />
        <label htmlFor={`${benefitPath}-obligated`}>
          Obligated To Foreign Country
        </label>
        <input
          id={`${benefitPath}-obligated`}
          type="checkbox"
          checked={benefitDetail.obligatedToForeignCountry}
          onChange={(event) =>
            handleCheckboxChange(
              `${benefitPath}.obligatedToForeignCountry`,
              event.target.checked
            )
          }
        />
        {benefitDetail.explanation && (
          <div>
            <label htmlFor={`${benefitPath}-explanation`}>Explanation</label>
            <input
              id={`${benefitPath}-explanation`}
              type="text"
              value={benefitDetail.explanation}
              onChange={handleInputChange(`${benefitPath}.explanation`)}
            />
          </div>
        )}
        {benefitDetail.frequency && (
          <div>
            <label htmlFor={`${benefitPath}-frequency`}>Frequency</label>
            <select
              id={`${benefitPath}-frequency`}
              value={benefitDetail.frequency.type}
              onChange={handleInputChange(`${benefitPath}.frequency.type`)}
            >
              {["Annually", "Monthly", "Quarterly", "Weekly", "Other"].map(
                (freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                )
              )}
            </select>
            {benefitDetail.frequency.type === "Other" && (
              <input
                id={`${benefitPath}-frequencyOther`}
                type="text"
                value={benefitDetail.frequency.other}
                onChange={handleInputChange(`${benefitPath}.frequency.other`)}
              />
            )}
          </div>
        )}
      </div>
    );
  };



  return (
    <div className="space-y-4">
      {data.map((entry, index) => {
        const specifyArray = initializeSpecify(entry.ownershipType);
        return (
          <div key={entry.id_} className="entry">
            <label>Specify Type</label>
            <div>
              {[
                "Yourself",
                "Spouse or legally recognized civil union/domestic partner",
                "Cohabitant",
                "Dependent children",
              ].map((type) => (
                <div key={type}>
                  <input
                    type="checkbox"
                    id={`specify_${index}_${type}`}
                    name={`specify_${index}_${type}`}
                    value={type}
                    checked={specifyArray.some((spec) => spec.type === type)}
                    onChange={() =>
                      handleCheckboxChange(index, type as OwnershipType["type"])
                    }
                    disabled={isReadOnlyField(
                      `${path}.section20A4[${index}].ownershipType`
                    )}
                  />
                  <label htmlFor={`specify_${index}_${type}`}>{type}</label>
                </div>
              ))}
            </div>

            <label htmlFor={`benefitType_${index}`}>Benefit Type</label>
            <select
              id={`benefitType_${index}`}
              value={entry.benefitType.type || ""}
              onChange={handleInputChange(
                `${path}.section20A4[${index}].benefitType.type`
              )}
              disabled={isReadOnlyField(
                `${path}.section20A4[${index}].benefitType.type`
              )}
            >
              <option value="">Select Benefit Type</option>
              {[
                "Educational",
                "Medical",
                "Retirement",
                "Social Welfare",
                "Other",
              ].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {entry.benefitType.type === "Other" && (
              <input
                type="text"
                value={entry.benefitType.other}
                onChange={handleInputChange(
                  `${path}.section20A4[${index}].benefitType.other`
                )}
                disabled={isReadOnlyField(`data.${index}.benefitType.other`)}
              />
            )}

            <label htmlFor={`benefitFrequency_${index}`}>
              Benefit Frequency
            </label>
            <select
              id={`benefitFrequency_${index}`}
              value={entry.benefitFrequency.type || ""} // Set to empty string if undefined
              onChange={handleInputChange(
                `${path}.section20A4[${index}].benefitFrequency.type`
              )}
              disabled={isReadOnlyField(
                `${path}.section20A4[${index}].benefitFrequency.type`
              )}
            >
              <option value="">Select Benefit Frequency</option>
              {[
                "Onetime benefit",
                "Future benefit",
                "Continuing benefit",
                "Other",
              ].map((frequency) => (
                <option key={frequency} value={frequency}>
                  {frequency}
                </option>
              ))}
            </select>

            {entry.benefitFrequency.type === "Other" && (
              <input
                type="text"
                value={entry.benefitFrequency.other}
                onChange={handleInputChange(
                  `${path}.section20A4[${index}].benefitFrequency.other`
                )}
                disabled={isReadOnlyField(
                  `data.${index}.benefitFrequency.other`
                )}
              />
            )}

            {entry.benefitFrequency.type === "Onetime benefit" &&
              renderBenefitDetail(
                entry.oneTimeBenefit,
                `${path}.section20A4[${index}].oneTimeBenefit`
              )}
            {entry.benefitFrequency.type === "Future benefit" &&
              renderBenefitDetail(
                entry.futureBenefit,
                `${path}.section20A4[${index}].futureBenefit`
              )}
            {entry.benefitFrequency.type === "Continuing benefit" &&
              renderBenefitDetail(
                entry.continuingBenefit,
                `${path}.section20A4[${index}].continuingBenefit`
              )}

            <button type="button" onClick={() => onRemoveEntry(`${path}.section20A4`, index)}>
              Remove Entry
            </button>
          </div>
        );
      })}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section20A4`,
            getDefaultNewItem(`${path}.section20A4`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection20A4 };
