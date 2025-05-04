import React from "react";
import { Section29_3 } from "api_v2/interfaces/association";

interface Section29_3Props {
  data: Section29_3[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section29_3) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection29_3: React.FC<Section29_3Props> = ({
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
      onInputChange(`${path}.section29_3[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section29_3, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      <div>
        <label htmlFor={`reasonsForAdvocacy-${index}`}>Reasons for Advocacy</label>
        <textarea
          id={`reasonsForAdvocacy-${index}`}
          value={item.reasonsForAdvocacy}
          onChange={handleInputChange(index, "reasonsForAdvocacy")}
          readOnly={isReadOnlyField(`section29_3[${index}].reasonsForAdvocacy`)}
        />
      </div>

      <div>
        <label htmlFor={`from-date-${index}`}>From Date</label>
        <input
          type="date"
          id={`from-date-${index}`}
          value={item.dateRange.from.date}
          onChange={handleInputChange(index, "dateRange.from.date")}
          readOnly={isReadOnlyField(`section29_3[${index}].dateRange.from.date`)}
        />
        <label htmlFor={`from-estimated-${index}`}>Estimated</label>
        <input
          type="checkbox"
          id={`from-estimated-${index}`}
          checked={item.dateRange.from.estimated}
          onChange={handleInputChange(index, "dateRange.from.estimated")}
          readOnly={isReadOnlyField(`section29_3[${index}].dateRange.from.estimated`)}
        />
      </div>

      <div>
        <label htmlFor={`to-date-${index}`}>To Date</label>
        <input
          type="date"
          id={`to-date-${index}`}
          value={item.dateRange.to.date}
          onChange={handleInputChange(index, "dateRange.to.date")}
          readOnly={isReadOnlyField(`section29_3[${index}].dateRange.to.date`)}
        />
        <label htmlFor={`to-estimated-${index}`}>Estimated</label>
        <input
          type="checkbox"
          id={`to-estimated-${index}`}
          checked={item.dateRange.to.estimated}
          onChange={handleInputChange(index, "dateRange.to.estimated")}
          readOnly={isReadOnlyField(`section29_3[${index}].dateRange.to.estimated`)}
        />
        <label htmlFor={`present-${index}`}>Present</label>
        <input
          type="checkbox"
          id={`present-${index}`}
          checked={item.dateRange.present}
          onChange={handleInputChange(index, "dateRange.present")}
          readOnly={isReadOnlyField(`section29_3[${index}].dateRange.present`)}
        />
      </div>

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section29_3`, index);
        }}
        disabled={isReadOnlyField(`section29_3[${index}].remove`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 29.3</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section29_3`,
            getDefaultNewItem(`${path}.section29_3`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection29_3 };
