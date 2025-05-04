import React from "react";
import { type Section25_3 } from "api/interfaces/sections/InvestigationsInfo";

interface Section25_3Props {
  data: Section25_3[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section25_3) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection25_3: React.FC<Section25_3Props> = ({
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
      onInputChange(`${path}.section25_3[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section25_3, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      <div>
        <label htmlFor={`debarmentDate_${index}`}>Debarment Date</label>
        <input
          type="text"
          id={`debarmentDate_${index}`}
          value={item.debarmentDate}
          onChange={handleInputChange(index, "debarmentDate")}
          disabled={isReadOnlyField(`${path}.section25_3[${index}].debarmentDate`)}
        />
      </div>

      <div>
        <label htmlFor={`agency_${index}`}>Agency</label>
        <input
          type="text"
          id={`agency_${index}`}
          value={item.agency}
          onChange={handleInputChange(index, "agency")}
          disabled={isReadOnlyField(`${path}.section25_3[${index}].agency`)}
        />
      </div>

      <div>
        <label htmlFor={`explanation_${index}`}>Explanation</label>
        <textarea
          id={`explanation_${index}`}
          value={item.explanation}
          onChange={handleInputChange(index, "explanation")}
          disabled={isReadOnlyField(`${path}.section25_3[${index}].explanation`)}
        />
      </div>

      <button
          onClick={(event) => {
            event.preventDefault();
            onRemoveEntry(`${path}.section25_3`, index);
          }}
          disabled={isReadOnlyField(`section25_3[${index}].remove`)}
        >
          Remove Entry
        </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 25.3</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section25_3`,
            getDefaultNewItem(`${path}.section25_3`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection25_3 };
