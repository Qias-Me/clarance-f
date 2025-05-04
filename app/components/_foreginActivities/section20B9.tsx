import { type Section20B9 } from "api/interfaces/sections/foreignActivities";
import React from "react";

interface Section20B9Props {
  data: Section20B9[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section20B9) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => Section20B9;
}

const RenderSection20B9: React.FC<Section20B9Props> = ({
  data,
  onInputChange,
  onRemoveEntry,
  onAddEntry,
  path,
  isReadOnlyField,
  getDefaultNewItem,
}) => {
  const handleInputChange =
    (index: number, fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onInputChange(
        `${path}.section20B9[${index}].${fieldPath}`,
        event.target.value
      );
    };

  const handleCheckboxChange =
    (index: number, fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(
        `${path}.section20B9[${index}].${fieldPath}`,
        event.target.checked
      );
    };

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="border p-4 space-y-2">
          <button
            type="button"
            onClick={() => onRemoveEntry(`${path}.section20B9`, index)}
          >
            Remove Entry
          </button>
          <div>
            <label htmlFor={`${path}.section20B9[${index}].id_`}>ID:</label>
            <input
              id={`${path}.section20B9[${index}].id_`}
              type="number"
              value={item.id_}
              onChange={handleInputChange(index, "id_")}
              readOnly={isReadOnlyField("id_")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B9[${index}].dateVoted.date`}>
              Date Voted:
            </label>
            <input
              id={`${path}.section20B9[${index}].dateVoted.date`}
              type="text"
              value={item.dateVoted.date}
              onChange={handleInputChange(index, "dateVoted.date")}
              readOnly={isReadOnlyField("dateVoted.date")}
            />
            <label
              htmlFor={`${path}.section20B9[${index}].dateVoted.estimated`}
            >
              Estimated:
            </label>
            <input
              id={`${path}.section20B9[${index}].dateVoted.estimated`}
              type="checkbox"
              checked={item.dateVoted.estimated}
              onChange={(e) =>
                handleCheckboxChange(index, "dateVoted.estimated")(e as any)
              }
              readOnly={isReadOnlyField("dateVoted.estimated")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B9[${index}].countryInvolved`}>
              Country Involved:
            </label>
            <input
              id={`${path}.section20B9[${index}].countryInvolved`}
              type="text"
              value={item.countryInvolved}
              onChange={handleInputChange(index, "countryInvolved")}
              readOnly={isReadOnlyField("countryInvolved")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B9[${index}].reasons`}>
              Reasons:
            </label>
            <input
              id={`${path}.section20B9[${index}].reasons`}
              type="text"
              value={item.reasons}
              onChange={handleInputChange(index, "reasons")}
              readOnly={isReadOnlyField("reasons")}
            />
          </div>
          <div>
            <label
              htmlFor={`${path}.section20B9[${index}].currentEligibility`}
            >
              Current Eligibility:
            </label>
            <input
              id={`${path}.section20B9[${index}].currentEligibility`}
              type="text"
              value={item.currentEligibility}
              onChange={handleInputChange(index, "currentEligibility")}
              readOnly={isReadOnlyField("currentEligibility")}
            />
          </div>
        </div>
      ))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section20B9`,
            getDefaultNewItem(`${path}.section20B9`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection20B9 };
