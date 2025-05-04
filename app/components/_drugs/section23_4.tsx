import React from "react";
import { Section23_4 } from "api_v2/interfaces/drugsActivity";

interface Section23_4Props {
  data: Section23_4[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section23_4) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection23_4: React.FC<Section23_4Props> = ({
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
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value =
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value;
      onInputChange(`${path}.section23_4[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section23_4, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      <label htmlFor={`descriptionOfInvolvement-${index}`}>
        Description of Involvement
      </label>
      <textarea
        id={`descriptionOfInvolvement-${index}`}
        value={item.descriptionOfInvolvement}
        onChange={handleInputChange(index, "descriptionOfInvolvement")}
        disabled={isReadOnlyField(`${path}.section23_4[${index}].descriptionOfInvolvement`)}
        placeholder="Description of Involvement"
      />

      <label htmlFor={`dateRange-from-${index}`}>From (Month/Year)</label>
      <input
        id={`dateRange-from-${index}`}
        type="date"
        value={item.dateRange.from}
        onChange={handleInputChange(index, "dateRange.from")}
        disabled={isReadOnlyField(`${path}.section23_4[${index}].dateRange.from`)}
      />
      
      <label htmlFor={`dateRange-to-${index}`}>To (Month/Year)</label>
      <input
        id={`dateRange-to-${index}`}
        type="date"
        value={item.dateRange.to}
        onChange={handleInputChange(index, "dateRange.to")}
        disabled={isReadOnlyField(`${path}.section23_4[${index}].dateRange.to`)}
      />

      <input
        type="checkbox"
        id={`dateRange-estimated-${index}`}
        checked={item.dateRange.estimated}
        onChange={handleInputChange(index, "dateRange.estimated")}
        disabled={isReadOnlyField(`${path}.section23_4[${index}].dateRange.estimated`)}
      />
      <label htmlFor={`dateRange-estimated-${index}`}>Estimated</label>

      <input
        type="checkbox"
        id={`dateRange-present-${index}`}
        checked={item.dateRange.present}
        onChange={handleInputChange(index, "dateRange.present")}
        disabled={isReadOnlyField(`${path}.section23_4[${index}].dateRange.present`)}
      />
      <label htmlFor={`dateRange-present-${index}`}>Present</label>

      <label htmlFor={`numberOfTimesInvolved-${index}`}>
        Number of Times Involved
      </label>
      <input
        id={`numberOfTimesInvolved-${index}`}
        type="number"
        value={item.numberOfTimesInvolved}
        onChange={handleInputChange(index, "numberOfTimesInvolved")}
        disabled={isReadOnlyField(`${path}.section23_4[${index}].numberOfTimesInvolved`)}
        placeholder="Number of Times Involved"
      />

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section23_4`, index);
        }}
        disabled={isReadOnlyField(`${path}.section23_4[${index}]`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 23.4</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section23_4`,
            getDefaultNewItem(`${path}.section23_4`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection23_4 };
