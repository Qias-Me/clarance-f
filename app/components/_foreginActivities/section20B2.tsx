import { Section20B2 } from "api_v2/interfaces/foreignActivities";
import React from "react";

interface Section20B2Props {
  data: Section20B2[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section20B2) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection20B2: React.FC<Section20B2Props> = ({
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
        `${path}.section20B2[${index}].${fieldPath}`,
        event.target.value
      );
    };

  const handleCheckboxChange =
    (index: number, fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(
        `${path}.section20B2[${index}].${fieldPath}`,
        event.target.checked
      );
    };

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="border p-4 space-y-2">
          <button
            type="button"
            onClick={() => onRemoveEntry(`${path}.section20B2`, index)}
          >
            Remove Entry
          </button>
          <div>
            <label htmlFor={`${path}.section20B2[${index}].id_`}>ID:</label>
            <input
              id={`${path}.section20B2[${index}].id_`}
              type="number"
              value={item.id_}
              onChange={handleInputChange(index, "id_")}
              readOnly={isReadOnlyField("id_")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B2[${index}].lastName`}>
              Last Name:
            </label>
            <input
              id={`${path}.section20B2[${index}].lastName`}
              type="text"
              value={item.lastName}
              onChange={handleInputChange(index, "lastName")}
              readOnly={isReadOnlyField("lastName")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B2[${index}].firstName`}>
              First Name:
            </label>
            <input
              id={`${path}.section20B2[${index}].firstName`}
              type="text"
              value={item.firstName}
              onChange={handleInputChange(index, "firstName")}
              readOnly={isReadOnlyField("firstName")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B2[${index}].middleName`}>
              Middle Name:
            </label>
            <input
              id={`${path}.section20B2[${index}].middleName`}
              type="text"
              value={item.middleName || ""}
              onChange={handleInputChange(index, "middleName")}
              readOnly={isReadOnlyField("middleName")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B2[${index}].suffix`}>
              Suffix:
            </label>
            <input
              id={`${path}.section20B2[${index}].suffix`}
              type="text"
              value={item.suffix || ""}
              onChange={handleInputChange(index, "suffix")}
              readOnly={isReadOnlyField("suffix")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B2[${index}].agency`}>
              Agency:
            </label>
            <input
              id={`${path}.section20B2[${index}].agency`}
              type="text"
              value={item.agency}
              onChange={handleInputChange(index, "agency")}
              readOnly={isReadOnlyField("agency")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B2[${index}].country`}>
              Country:
            </label>
            <input
              id={`${path}.section20B2[${index}].country`}
              type="text"
              value={item.country}
              onChange={handleInputChange(index, "country")}
              readOnly={isReadOnlyField("country")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B2[${index}].dateOfRequest.date`}>
              Date of Request:
            </label>
            <input
              id={`${path}.section20B2[${index}].dateOfRequest.date`}
              type="text"
              value={item.dateOfRequest.date}
              onChange={handleInputChange(index, "dateOfRequest.date")}
              readOnly={isReadOnlyField("dateOfRequest.date")}
            />
            <label
              htmlFor={`${path}.section20B2[${index}].dateOfRequest.estimated`}
            >
              Estimated:
            </label>
            <input
              id={`${path}.section20B2[${index}].dateOfRequest.estimated`}
              type="checkbox"
              checked={item.dateOfRequest.estimated}
              onChange={(e) =>
                handleCheckboxChange(index, "dateOfRequest.estimated")(e as any)
              }
              readOnly={isReadOnlyField("dateOfRequest.estimated")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B2[${index}].circumstances`}>
              Circumstances:
            </label>
            <input
              id={`${path}.section20B2[${index}].circumstances`}
              type="text"
              value={item.circumstances}
              onChange={handleInputChange(index, "circumstances")}
              readOnly={isReadOnlyField("circumstances")}
            />
          </div>
        </div>
      ))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section20B2`,
            getDefaultNewItem(`${path}.section20B2`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection20B2 };
