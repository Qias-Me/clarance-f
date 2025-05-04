import React from "react";
import { Section24_4 } from "api_v2/interfaces/alcoholUse";

interface Section24_1Props {
  data: Section24_4[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section24_4) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection24_4: React.FC<Section24_1Props> = ({
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
      onInputChange(`${path}.section24_4[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section24_4, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section24_4`, index);
        }}
        disabled={isReadOnlyField(`${path}.section24_4[${index}]`)}
      >
        Remove Entry
      </button>

      <div>
        <label htmlFor={`counselorName-${index}`}>Counselor Name</label>
        <input
          id={`counselorName-${index}`}
          type="text"
          value={item.counselorName}
          onChange={handleInputChange(index, "counselorName")}
          readOnly={isReadOnlyField(`${path}.section24_4[${index}].counselorName`)}
        />
      </div>

      <div>
        <h4>Counselor Address</h4>
        {["city", "county", "state", "zip", "country"].map((field) => (
          <div key={field}>
            <label htmlFor={`counselorAddress-${field}-${index}`}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              id={`counselorAddress-${field}-${index}`}
              type="text"
              value={item.counselorAddress[field]}
              onChange={handleInputChange(index, `counselorAddress.${field}`)}
              readOnly={isReadOnlyField(`${path}.section24_4[${index}].counselorAddress.${field}`)}
            />
          </div>
        ))}
      </div>

      <div>
        <label htmlFor={`agencyName-${index}`}>Agency Name</label>
        <input
          id={`agencyName-${index}`}
          type="text"
          value={item.agencyName}
          onChange={handleInputChange(index, "agencyName")}
          readOnly={isReadOnlyField(`${path}.section24_4[${index}].agencyName`)}
        />
      </div>

      <div>
        <h4>Agency Address</h4>
        {["city", "county", "state", "zip", "country"].map((field) => (
          <div key={field}>
            <label htmlFor={`agencyAddress-${field}-${index}`}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              id={`agencyAddress-${field}-${index}`}
              type="text"
              value={item.agencyAddress[field]}
              onChange={handleInputChange(index, `agencyAddress.${field}`)}
              readOnly={isReadOnlyField(`${path}.section24_4[${index}].agencyAddress.${field}`)}
            />
          </div>
        ))}
      </div>

      <div>
        <h4>Date Range</h4>
        <div>
          <label htmlFor={`dateRange-from-${index}`}>From</label>
          <input
            id={`dateRange-from-${index}`}
            type="date"
            value={item.dateRange.from}
            onChange={handleInputChange(index, "dateRange.from")}
            readOnly={isReadOnlyField(`${path}.section24_4[${index}].dateRange.from`)}
          />
        </div>
        <div>
          <label htmlFor={`dateRange-to-${index}`}>To</label>
          <input
            id={`dateRange-to-${index}`}
            type="date"
            value={item.dateRange.to}
            onChange={handleInputChange(index, "dateRange.to")}
            readOnly={isReadOnlyField(`${path}.section24_4[${index}].dateRange.to`)}
          />
        </div>
        <div>
          <label htmlFor={`dateRange-estimated-${index}`}>Estimated</label>
          <input
            id={`dateRange-estimated-${index}`}
            type="checkbox"
            checked={item.dateRange.estimated}
            onChange={handleInputChange(index, "dateRange.estimated")}
            readOnly={isReadOnlyField(`${path}.section24_4[${index}].dateRange.estimated`)}
          />
        </div>
        <div>
          <label htmlFor={`dateRange-present-${index}`}>Present</label>
          <input
            id={`dateRange-present-${index}`}
            type="checkbox"
            checked={item.dateRange.present}
            onChange={handleInputChange(index, "dateRange.present")}
            readOnly={isReadOnlyField(`${path}.section24_4[${index}].dateRange.present`)}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`treatmentCompletion-${index}`}>Treatment Completion</label>
        <input
          id={`treatmentCompletion-${index}`}
          type="checkbox"
          checked={item.treatmentCompletion}
          onChange={handleInputChange(index, "treatmentCompletion")}
          readOnly={isReadOnlyField(`${path}.section24_4[${index}].treatmentCompletion`)}
        />
      </div>

      <div>
        <label htmlFor={`completionExplanation-${index}`}>Completion Explanation</label>
        <textarea
          id={`completionExplanation-${index}`}
          value={item.completionExplanation}
          onChange={handleInputChange(index, "completionExplanation")}
          readOnly={isReadOnlyField(`${path}.section24_4[${index}].completionExplanation`)}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 24.4</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section24_4`,
            getDefaultNewItem(`${path}.section24_4`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection24_4 };
