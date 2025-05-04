import React from "react";
import { Section27_2 } from "api_v2/interfaces/technology";

interface Section27_2Props {
  data: Section27_2[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section27_2) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection27_2: React.FC<Section27_2Props> = ({
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
      onInputChange(`${path}.section27_2[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section27_2, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      <label>
        Incident Date:
        <input
          type="date"
          value={item.incidentDate.date}
          onChange={handleInputChange(index, "incidentDate.date")}
          readOnly={isReadOnlyField(`section27_2[${index}].incidentDate.date`)}
        />
        <input
          type="checkbox"
          checked={item.incidentDate.estimated}
          onChange={handleInputChange(index, "incidentDate.estimated")}
          readOnly={isReadOnlyField(`section27_2[${index}].incidentDate.estimated`)}
        />
        Estimated
      </label>

      <label>
        Description:
        <textarea
          value={item.description}
          onChange={handleInputChange(index, "description")}
          readOnly={isReadOnlyField(`section27_2[${index}].description`)}
        />
      </label>

      <label>
        Street:
        <input
          type="text"
          value={item.location.street}
          onChange={handleInputChange(index, "location.street")}
          readOnly={isReadOnlyField(`section27_2[${index}].location.street`)}
        />
      </label>

      <label>
        City:
        <input
          type="text"
          value={item.location.city}
          onChange={handleInputChange(index, "location.city")}
          readOnly={isReadOnlyField(`section27_2[${index}].location.city`)}
        />
      </label>

      <label>
        State:
        <input
          type="text"
          value={item.location.state}
          onChange={handleInputChange(index, "location.state")}
          readOnly={isReadOnlyField(`section27_2[${index}].location.state`)}
        />
      </label>

      <label>
        Zip Code:
        <input
          type="text"
          value={item.location.zipCode}
          onChange={handleInputChange(index, "location.zipCode")}
          readOnly={isReadOnlyField(`section27_2[${index}].location.zipCode`)}
        />
      </label>

      <label>
        Country:
        <input
          type="text"
          value={item.location.country}
          onChange={handleInputChange(index, "location.country")}
          readOnly={isReadOnlyField(`section27_2[${index}].location.country`)}
        />
      </label>

      <label>
        Action Description:
        <textarea
          value={item.actionDescription}
          onChange={handleInputChange(index, "actionDescription")}
          readOnly={isReadOnlyField(`section27_2[${index}].actionDescription`)}
        />
      </label>

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section27_2`, index);
        }}
        disabled={isReadOnlyField(`section27_2[${index}].remove`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 27.2</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section27_2`,
            getDefaultNewItem(`${path}.section27_2`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection27_2 };
