import React from "react";
import { Section24_1 } from "api_v2/interfaces/alcoholUse";

interface Section24_1Props {
  data: Section24_1[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section24_1) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection24_1: React.FC<Section24_1Props> = ({
  data,
  onInputChange,
  onRemoveEntry,
  onAddEntry,
  getDefaultNewItem,
  path,
  isReadOnlyField,
}) => {
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
      onInputChange(`${path}.section24_1[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section24_1, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>
      <div>
        <label htmlFor={`negativeImpactDate_${index}`}>
          Negative Impact Date:
        </label>
        <input
          id={`negativeImpactDate_${index}`}
          type="date"
          value={item.negativeImpactDate.date}
          onChange={handleInputChange(index, "negativeImpactDate.date")}
          disabled={isReadOnlyField(
            `${path}.section24_1[${index}].negativeImpactDate.date`
          )}
        />
        <label>
          <input
            type="checkbox"
            checked={item.negativeImpactDate.estimated}
            onChange={handleInputChange(index, "negativeImpactDate.estimated")}
            disabled={isReadOnlyField(
              `${path}.section24_1[${index}].negativeImpactDate.estimated`
            )}
          />
          Estimated
        </label>
      </div>
      <div>
        <label htmlFor={`datesOfInvolvement_from_${index}`}>
          Dates of Involvement From:
        </label>
        <input
          id={`datesOfInvolvement_from_${index}`}
          type="date"
          value={item.datesOfInvolvement.from.date}
          onChange={handleInputChange(index, "datesOfInvolvement.from.date")}
          disabled={isReadOnlyField(
            `${path}.section24_1[${index}].datesOfInvolvement.from.date`
          )}
        />
        <label>
          <input
            type="checkbox"
            checked={item.datesOfInvolvement.to.estimated}
            onChange={handleInputChange(
              index,
              "datesOfInvolvement.to.estimated"
            )}
            disabled={isReadOnlyField(
              `${path}.section24_1[${index}].datesOfInvolvement.to.estimated`
            )}
          />
          Estimated
        </label>
        <label htmlFor={`datesOfInvolvement_to_${index}`}>To:</label>
        <input
          id={`datesOfInvolvement_to_${index}`}
          type="date"
          value={item.datesOfInvolvement.to.date}
          onChange={handleInputChange(index, "datesOfInvolvement.to.date")}
          disabled={isReadOnlyField(
            `${path}.section24_1[${index}].datesOfInvolvement.to.date`
          )}
        />
        <label>
          <input
            type="checkbox"
            checked={item.datesOfInvolvement.from.estimated}
            onChange={handleInputChange(
              index,
              "datesOfInvolvement.from.estimated"
            )}
            disabled={isReadOnlyField(
              `${path}.section24_1[${index}].datesOfInvolvement.from.estimated`
            )}
          />
          Estimated
        </label>
        <label>
          <input
            type="checkbox"
            checked={item.datesOfInvolvement.present}
            onChange={handleInputChange(index, "datesOfInvolvement.present")}
            disabled={isReadOnlyField(
              `${path}.section24_1[${index}].datesOfInvolvement.present`
            )}
          />
          Present
        </label>
      </div>
      <div>
        <label htmlFor={`circumstances_${index}`}>Circumstances:</label>
        <textarea
          id={`circumstances_${index}`}
          value={item.circumstances}
          onChange={handleInputChange(index, "circumstances")}
          disabled={isReadOnlyField(
            `${path}.section24_1[${index}].circumstances`
          )}
        />
      </div>
      <div>
        <label htmlFor={`negativeImpact_${index}`}>Negative Impact:</label>
        <textarea
          id={`negativeImpact_${index}`}
          value={item.negativeImpact}
          onChange={handleInputChange(index, "negativeImpact")}
          disabled={isReadOnlyField(
            `${path}.section24_1[${index}].negativeImpact`
          )}
        />
      </div>
      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section24_1`, index);
        }}
        disabled={isReadOnlyField(`${path}.section24_1[${index}]`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 24.1</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section24_1`,
            getDefaultNewItem(`${path}.section24_1`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection24_1 };
