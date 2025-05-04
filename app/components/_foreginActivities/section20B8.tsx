import { Section20B8 } from "api_v2/interfaces/foreignActivities";
import React from "react";

interface Section20B8Props {
  data: Section20B8[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section20B8) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => Section20B8;
}

const RenderSection20B8: React.FC<Section20B8Props> = ({
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
        `${path}.section20B8[${index}].${fieldPath}`,
        event.target.value
      );
    };

  const handleCheckboxChange =
    (index: number, fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(
        `${path}.section20B8[${index}].${fieldPath}`,
        event.target.checked
      );
    };

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="border p-4 space-y-2">
          <button
            type="button"
            onClick={() => onRemoveEntry(`${path}.section20B8`, index)}
          >
            Remove Entry
          </button>
          <div>
            <label htmlFor={`${path}.section20B8[${index}].id_`}>ID:</label>
            <input
              id={`${path}.section20B8[${index}].id_`}
              type="number"
              value={item.id_}
              onChange={handleInputChange(index, "id_")}
              readOnly={isReadOnlyField("id_")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B8[${index}].positionHeld`}>
              Position Held:
            </label>
            <input
              id={`${path}.section20B8[${index}].positionHeld`}
              type="text"
              value={item.positionHeld}
              onChange={handleInputChange(index, "positionHeld")}
              readOnly={isReadOnlyField("positionHeld")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B8[${index}].datesHeld.fromDate.date`}>
              Dates Held From:
            </label>
            <input
              id={`${path}.section20B8[${index}].datesHeld.fromDate.date`}
              type="text"
              value={item.datesHeld.fromDate.date}
              onChange={handleInputChange(index, "datesHeld.fromDate.date")}
              readOnly={isReadOnlyField("datesHeld.fromDate.date")}
            />
            <label htmlFor={`${path}.section20B8[${index}].datesHeld.fromDate.estimated`}>
              Estimated:
            </label>
            <input
              id={`${path}.section20B8[${index}].datesHeld.fromDate.estimated`}
              type="checkbox"
              checked={item.datesHeld.fromDate.estimated}
              onChange={(e) => handleCheckboxChange(index, "datesHeld.fromDate.estimated")(e as any)}
              readOnly={isReadOnlyField("datesHeld.fromDate.estimated")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B8[${index}].datesHeld.toDate.date`}>
              Dates Held To:
            </label>
            <input
              id={`${path}.section20B8[${index}].datesHeld.toDate.date`}
              type="text"
              value={item.datesHeld.toDate.date}
              onChange={handleInputChange(index, "datesHeld.toDate.date")}
              readOnly={isReadOnlyField("datesHeld.toDate.date")}
            />
            <label htmlFor={`${path}.section20B8[${index}].datesHeld.toDate.estimated`}>
              Estimated:
            </label>
            <input
              id={`${path}.section20B8[${index}].datesHeld.toDate.estimated`}
              type="checkbox"
              checked={item.datesHeld.toDate.estimated}
              onChange={(e) => handleCheckboxChange(index, "datesHeld.toDate.estimated")(e as any)}
              readOnly={isReadOnlyField("datesHeld.toDate.estimated")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B8[${index}].datesHeld.present`}>
              Present:
            </label>
            <input
              id={`${path}.section20B8[${index}].datesHeld.present`}
              type="checkbox"
              checked={item.datesHeld.present}
              onChange={(e) => handleCheckboxChange(index, "datesHeld.present")(e as any)}
              readOnly={isReadOnlyField("datesHeld.present")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B8[${index}].reasonForActivities`}>
              Reason for Activities:
            </label>
            <input
              id={`${path}.section20B8[${index}].reasonForActivities`}
              type="text"
              value={item.reasonForActivities}
              onChange={handleInputChange(index, "reasonForActivities")}
              readOnly={isReadOnlyField("reasonForActivities")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B8[${index}].currentEligibility`}>
              Current Eligibility:
            </label>
            <input
              id={`${path}.section20B8[${index}].currentEligibility`}
              type="text"
              value={item.currentEligibility}
              onChange={handleInputChange(index, "currentEligibility")}
              readOnly={isReadOnlyField("currentEligibility")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B8[${index}].countryInvolved`}>
              Country Involved:
            </label>
            <input
              id={`${path}.section20B8[${index}].countryInvolved`}
              type="text"
              value={item.countryInvolved}
              onChange={handleInputChange(index, "countryInvolved")}
              readOnly={isReadOnlyField("countryInvolved")}
            />
          </div>
        </div>
      ))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section20B8`,
            getDefaultNewItem(`${path}.section20B8`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection20B8 };
