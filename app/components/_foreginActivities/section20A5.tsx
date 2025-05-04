import { Section20A5 } from "api_v2/interfaces/foreignActivities";
import React from "react";

interface Section20A5Props {
  data: Section20A5[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section20A5) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection20A5: React.FC<Section20A5Props> = ({
  data,
  onInputChange,
  path,
  isReadOnlyField,
  onAddEntry,
  onRemoveEntry,
  getDefaultNewItem,
}) => {
  const handleInputChange =
    (index: number, fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onInputChange(
        `${path}.section20A5[${index}].${fieldPath}`,
        event.target.value
      );
    };

  const handleCheckboxChange =
    (index: number, fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(
        `${path}.section20A5[${index}].${fieldPath}`,
        event.target.checked
      );
    };

  const formatValue = (value: string) => {
    const numberValue = parseFloat(value);
    return isNaN(numberValue) ? "" : numberValue.toFixed(2);
  };

  const handleBlur =
    (index: number) => (event: React.FocusEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const formattedValue = formatValue(value) || "0.00";
      onInputChange(
        `${path}.section20A5[${index}].amountProvided.value`,
        formattedValue
      );
    };

  const countryOptions = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
  ];
  const frequencyOptions = [
    "Annually",
    "Monthly",
    "Quarterly",
    "Weekly",
    "Other",
  ];

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="border p-4 space-y-2">
          <div>
            <label htmlFor={`${path}.section20A5[${index}].id_`}>ID:</label>
            <input
              id={`${path}.section20A5[${index}].id_`}
              type="number"
              value={item.id_}
              onChange={handleInputChange(index, "id_")}
              readOnly={isReadOnlyField("id_")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20A5[${index}].lastName`}>
              Last Name:
            </label>
            <input
              id={`${path}.section20A5[${index}].lastName`}
              type="text"
              value={item.lastName}
              onChange={handleInputChange(index, "lastName")}
              readOnly={isReadOnlyField("lastName")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20A5[${index}].firstName`}>
              First Name:
            </label>
            <input
              id={`${path}.section20A5[${index}].firstName`}
              type="text"
              value={item.firstName}
              onChange={handleInputChange(index, "firstName")}
              readOnly={isReadOnlyField("firstName")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20A5[${index}].middleName`}>
              Middle Name:
            </label>
            <input
              id={`${path}.section20A5[${index}].middleName`}
              type="text"
              value={item.middleName || ""}
              onChange={handleInputChange(index, "middleName")}
              readOnly={isReadOnlyField("middleName")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20A5[${index}].suffix`}>
              Suffix:
            </label>
            <input
              id={`${path}.section20A5[${index}].suffix`}
              type="text"
              value={item.suffix || ""}
              onChange={handleInputChange(index, "suffix")}
              readOnly={isReadOnlyField("suffix")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20A5[${index}].address.street`}>
              Street:
            </label>
            <input
              id={`${path}.section20A5[${index}].address.street`}
              type="text"
              value={item.address.street}
              onChange={handleInputChange(index, "address.street")}
              readOnly={isReadOnlyField("address.street")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20A5[${index}].address.city`}>
              City:
            </label>
            <input
              id={`${path}.section20A5[${index}].address.city`}
              type="text"
              value={item.address.city}
              onChange={handleInputChange(index, "address.city")}
              readOnly={isReadOnlyField("address.city")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20A5[${index}].address.state`}>
              State:
            </label>
            <input
              id={`${path}.section20A5[${index}].address.state`}
              type="text"
              value={item.address.state || ""}
              onChange={handleInputChange(index, "address.state")}
              readOnly={isReadOnlyField("address.state")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20A5[${index}].address.zipCode`}>
              Zip Code:
            </label>
            <input
              id={`${path}.section20A5[${index}].address.zipCode`}
              type="text"
              value={item.address.zipCode || ""}
              onChange={handleInputChange(index, "address.zipCode")}
              readOnly={isReadOnlyField("address.zipCode")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20A5[${index}].address.country`}>
              Country:
            </label>
            <input
              id={`${path}.section20A5[${index}].address.country`}
              type="text"
              value={item.address.country}
              onChange={handleInputChange(index, "address.country")}
              readOnly={isReadOnlyField("address.country")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20A5[${index}].relationship`}>
              Relationship:
            </label>
            <input
              id={`${path}.section20A5[${index}].relationship`}
              type="text"
              value={item.relationship}
              onChange={handleInputChange(index, "relationship")}
              readOnly={isReadOnlyField("relationship")}
            />
          </div>
          <div>
            <label
              htmlFor={`${path}.section20A5[${index}].amountProvided.value`}
            >
              Amount Provided:
            </label>
            <input
              id={`${path}.section20A5[${index}].amountProvided.value`}
              type="text"
              value={item.amountProvided.value}
              onChange={handleInputChange(index, "amountProvided.value")}
              readOnly={isReadOnlyField("amountProvided.value")}
              onBlur={handleBlur(index)}
            />
            <label
              htmlFor={`${path}.section20A5[${index}].amountProvided.estimated`}
            >
              Estimated:
            </label>
            <input
              id={`${path}.section20A5[${index}].amountProvided.estimated`}
              type="checkbox"
              checked={item.amountProvided.estimated}
              onChange={handleCheckboxChange(index, "amountProvided.estimated")}
              readOnly={isReadOnlyField("amountProvided.estimated")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20A5[${index}].citizenships`}>
              Citizenships:
            </label>
            {item.citizenships.map((citizenship, citizenshipIndex) => (
              <select
                key={citizenshipIndex}
                id={`${path}.section20A5[${index}].citizenships[${citizenshipIndex}]`}
                value={citizenship.type}
                onChange={handleInputChange(
                  index,
                  `citizenships[${citizenshipIndex}]`
                )}
              >
                {countryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            ))}
          </div>
          <div>
            <label htmlFor={`${path}.section20A5[${index}].frequency.type`}>
              Frequency Type:
            </label>
            <select
              id={`${path}.section20A5[${index}].frequency.type`}
              value={item.frequency.type}
              onChange={handleInputChange(index, "frequency.type")}
            >
              {frequencyOptions.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {frequency}
                </option>
              ))}
            </select>
            {item.frequency.type === "Other" && (
              <div>
                <label
                  htmlFor={`${path}.section20A5[${index}].frequency.other`}
                >
                  Frequency Explanation:
                </label>
                <input
                  id={`${path}.section20A5[${index}].frequency.other`}
                  type="text"
                  value={item.frequency.other}
                  onChange={handleInputChange(index, "frequency.other")}
                  readOnly={isReadOnlyField("frequency.other")}
                />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onRemoveEntry(`${path}.section20A5`, index)}
          >
            Remove Entry
          </button>
        </div>
      ))}

      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section20A5`,
            getDefaultNewItem(`${path}.section20A5`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection20A5 };
