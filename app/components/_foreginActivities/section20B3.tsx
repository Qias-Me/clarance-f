import { type Section20B3 } from "api/interfaces/sections/foreignActivities";
import React from "react";

interface Section20B3Props {
  data: Section20B3[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section20B3) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection20B3: React.FC<Section20B3Props> = ({
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
        `${path}.section20B3[${index}].${fieldPath}`,
        event.target.value
      );
    };

  const handleCheckboxChange =
    (index: number, fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(
        `${path}.section20B3[${index}].${fieldPath}`,
        event.target.checked
      );
    };

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="border p-4 space-y-2">
          <button
            type="button"
            onClick={() => onRemoveEntry(`${path}.section20B3`, index)}
          >
            Remove Entry
          </button>
          <div>
            <label htmlFor={`${path}.section20B3[${index}].id_`}>ID:</label>
            <input
              id={`${path}.section20B3[${index}].id_`}
              type="number"
              value={item.id_}
              onChange={handleInputChange(index, "id_")}
              readOnly={isReadOnlyField("id_")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B3[${index}].lastName`}>
              Last Name:
            </label>
            <input
              id={`${path}.section20B3[${index}].lastName`}
              type="text"
              value={item.lastName}
              onChange={handleInputChange(index, "lastName")}
              readOnly={isReadOnlyField("lastName")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B3[${index}].firstName`}>
              First Name:
            </label>
            <input
              id={`${path}.section20B3[${index}].firstName`}
              type="text"
              value={item.firstName}
              onChange={handleInputChange(index, "firstName")}
              readOnly={isReadOnlyField("firstName")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B3[${index}].middleName`}>
              Middle Name:
            </label>
            <input
              id={`${path}.section20B3[${index}].middleName`}
              type="text"
              value={item.middleName || ""}
              onChange={handleInputChange(index, "middleName")}
              readOnly={isReadOnlyField("middleName")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B3[${index}].suffix`}>
              Suffix:
            </label>
            <input
              id={`${path}.section20B3[${index}].suffix`}
              type="text"
              value={item.suffix || ""}
              onChange={handleInputChange(index, "suffix")}
              readOnly={isReadOnlyField("suffix")}
            />
          </div>
          <div>
            <label
              htmlFor={`${path}.section20B3[${index}].positionDescription`}
            >
              Position Description:
            </label>
            <input
              id={`${path}.section20B3[${index}].positionDescription`}
              type="text"
              value={item.positionDescription}
              onChange={handleInputChange(index, "positionDescription")}
              readOnly={isReadOnlyField("positionDescription")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B3[${index}].dateOffered.date`}>
              Date Offered:
            </label>
            <input
              id={`${path}.section20B3[${index}].dateOffered.date`}
              type="text"
              value={item.dateOffered.date}
              onChange={handleInputChange(index, "dateOffered.date")}
              readOnly={isReadOnlyField("dateOffered.date")}
            />
            <label
              htmlFor={`${path}.section20B3[${index}].dateOffered.estimated`}
            >
              Estimated:
            </label>
            <input
              id={`${path}.section20B3[${index}].dateOffered.estimated`}
              type="checkbox"
              checked={item.dateOffered.estimated}
              onChange={(e) =>
                handleCheckboxChange(index, "dateOffered.estimated")(e as any)
              }
              readOnly={isReadOnlyField("dateOffered.estimated")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B3[${index}].accepted`}>
              Accepted:
            </label>
            <input
              id={`${path}.section20B3[${index}].accepted`}
              type="checkbox"
              checked={item.accepted}
              onChange={(e) =>
                handleCheckboxChange(index, "accepted")(e as any)
              }
              readOnly={isReadOnlyField("accepted")}
            />
          </div>
          {item.explanation && (
            <div>
              <label htmlFor={`${path}.section20B3[${index}].explanation`}>
                Explanation:
              </label>
              <input
                id={`${path}.section20B3[${index}].explanation`}
                type="text"
                value={item.explanation}
                onChange={handleInputChange(index, "explanation")}
                readOnly={isReadOnlyField("explanation")}
              />
            </div>
          )}
          <div>
            <label htmlFor={`${path}.section20B3[${index}].location.street`}>
              Location - Street:
            </label>
            <input
              id={`${path}.section20B3[${index}].location.street`}
              type="text"
              value={item.location.street}
              onChange={handleInputChange(index, "location.street")}
              readOnly={isReadOnlyField("location.street")}
            />
            <label htmlFor={`${path}.section20B3[${index}].location.city`}>
              Location - City:
            </label>
            <input
              id={`${path}.section20B3[${index}].location.city`}
              type="text"
              value={item.location.city}
              onChange={handleInputChange(index, "location.city")}
              readOnly={isReadOnlyField("location.city")}
            />
            <label htmlFor={`${path}.section20B3[${index}].location.state`}>
              Location - State:
            </label>
            <input
              id={`${path}.section20B3[${index}].location.state`}
              type="text"
              value={item.location.state}
              onChange={handleInputChange(index, "location.state")}
              readOnly={isReadOnlyField("location.state")}
            />
            <label htmlFor={`${path}.section20B3[${index}].location.zipCode`}>
              Location - Zip Code:
            </label>
            <input
              id={`${path}.section20B3[${index}].location.zipCode`}
              type="text"
              value={item.location.zipCode}
              onChange={handleInputChange(index, "location.zipCode")}
              readOnly={isReadOnlyField("location.zipCode")}
            />
            <label htmlFor={`${path}.section20B3[${index}].location.country`}>
              Location - Country:
            </label>
            <input
              id={`${path}.section20B3[${index}].location.country`}
              type="text"
              value={item.location.country}
              onChange={handleInputChange(index, "location.country")}
              readOnly={isReadOnlyField("location.country")}
            />
          </div>
        </div>
      ))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section20B3`,
            getDefaultNewItem(`${path}.section20B3`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection20B3 };
