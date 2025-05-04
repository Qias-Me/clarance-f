import React from "react";
import { Section25_2 } from "api_v2/interfaces/InvestigationsInfo";

interface Section25_2Props {
  data: Section25_2[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section25_2) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection25_2: React.FC<Section25_2Props> = ({
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
      onInputChange(`${path}.section25_2[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section25_2, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      <div>
        <label htmlFor={`denialDate_${index}`}>Denial Date</label>
        <input
          type="text"
          id={`denialDate_${index}`}
          value={item.denialDate}
          onChange={handleInputChange(index, "denialDate")}
          disabled={isReadOnlyField(`${path}.section25_2[${index}].denialDate`)}
        />
      </div>

      <div>
        <label htmlFor={`agency_${index}`}>Agency</label>
        <input
          type="text"
          id={`agency_${index}`}
          value={item.agency}
          onChange={handleInputChange(index, "agency")}
          disabled={isReadOnlyField(`${path}.section25_2[${index}].agency`)}
        />
      </div>

      <div>
        <label htmlFor={`explanation_${index}`}>Explanation</label>
        <textarea
          id={`explanation_${index}`}
          value={item.explanation}
          onChange={handleInputChange(index, "explanation")}
          disabled={isReadOnlyField(`${path}.section25_2[${index}].explanation`)}
        />
      </div>

      <button
          onClick={(event) => {
            event.preventDefault();
            onRemoveEntry(`${path}.section25_2`, index);
          }}
          disabled={isReadOnlyField(`section25_2[${index}].remove`)}
        >
          Remove Entry
        </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 25.2</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section25_2`,
            getDefaultNewItem(`${path}.section25_2`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection25_2 };
