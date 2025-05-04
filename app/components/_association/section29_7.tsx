import React from "react";
import { Section29_7 } from "api_v2/interfaces/association";

interface Section29_7Props {
  data: Section29_7[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section29_7) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection29_7: React.FC<Section29_7Props> = ({
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
      onInputChange(`${path}.section29_7[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section29_7, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      <div>
        <label htmlFor={`explanation-${index}`}>Explanation</label>
        <textarea
          id={`explanation-${index}`}
          value={item.explanation}
          onChange={handleInputChange(index, "explanation")}
          readOnly={isReadOnlyField(`section29_7[${index}].explanation`)}
        />
      </div>

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section29_7`, index);
        }}
        disabled={isReadOnlyField(`section29_7[${index}].remove`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 29.7</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section29_7`,
            getDefaultNewItem(`${path}.section29_7`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection29_7 };
