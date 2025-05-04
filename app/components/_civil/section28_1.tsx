import React from "react";
import { Section28_1 } from "api_v2/interfaces/civil";

interface Section28_1Props {
  data: Section28_1[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section28_1) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection28_1: React.FC<Section28_1Props> = ({
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
      onInputChange(`${path}.section28_1[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section28_1, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      <div>
        <label htmlFor={`dateOfAction_${index}`}>Date of Action</label>
        <input
          id={`dateOfAction_${index}`}
          type="text"
          value={item.dateOfAction.date}
          onChange={handleInputChange(index, 'dateOfAction.date')}
          readOnly={isReadOnlyField(`section28_1[${index}].dateOfAction.date`)}
        />
      </div>

      <div>
        <label htmlFor={`estimated_${index}`}>Estimated</label>
        <input
          id={`estimated_${index}`}
          type="checkbox"
          checked={item.dateOfAction.estimated}
          onChange={handleInputChange(index, 'dateOfAction.estimated')}
          readOnly={isReadOnlyField(`section28_1[${index}].dateOfAction.estimated`)}
        />
      </div>

      <div>
        <label htmlFor={`courtName_${index}`}>Court Name</label>
        <input
          id={`courtName_${index}`}
          type="text"
          value={item.courtName}
          onChange={handleInputChange(index, 'courtName')}
          readOnly={isReadOnlyField(`section28_1[${index}].courtName`)}
        />
      </div>

      <div>
        <label htmlFor={`courtAddress_${index}`}>Court Address</label>
        <input
          id={`courtAddress_${index}_street`}
          type="text"
          value={item.courtAddress.street}
          onChange={handleInputChange(index, 'courtAddress.street')}
          readOnly={isReadOnlyField(`section28_1[${index}].courtAddress.street`)}
        />
        <input
          id={`courtAddress_${index}_city`}
          type="text"
          value={item.courtAddress.city}
          onChange={handleInputChange(index, 'courtAddress.city')}
          readOnly={isReadOnlyField(`section28_1[${index}].courtAddress.city`)}
        />
        <input
          id={`courtAddress_${index}_state`}
          type="text"
          value={item.courtAddress.state}
          onChange={handleInputChange(index, 'courtAddress.state')}
          readOnly={isReadOnlyField(`section28_1[${index}].courtAddress.state`)}
        />
        <input
          id={`courtAddress_${index}_zipCode`}
          type="text"
          value={item.courtAddress.zipCode}
          onChange={handleInputChange(index, 'courtAddress.zipCode')}
          readOnly={isReadOnlyField(`section28_1[${index}].courtAddress.zipCode`)}
        />
        <input
          id={`courtAddress_${index}_country`}
          type="text"
          value={item.courtAddress.country}
          onChange={handleInputChange(index, 'courtAddress.country')}
          readOnly={isReadOnlyField(`section28_1[${index}].courtAddress.country`)}
        />
      </div>

      <div>
        <label htmlFor={`description_${index}`}>Description</label>
        <textarea
          id={`description_${index}`}
          value={item.description}
          onChange={handleInputChange(index, 'description')}
          readOnly={isReadOnlyField(`section28_1[${index}].description`)}
        />
      </div>

      <div>
        <label htmlFor={`principalParties_${index}`}>Principal Parties</label>
        {item.principalParties.map((party, partyIndex) => (
          <div key={partyIndex}>
            <input
              id={`principalParties_${index}_${partyIndex}_name`}
              type="text"
              value={party.name}
              onChange={handleInputChange(index, `principalParties[${partyIndex}].name`)}
              readOnly={isReadOnlyField(`section28_1[${index}].principalParties[${partyIndex}].name`)}
            />
          </div>
        ))}
      </div>

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section28_1`, index);
        }}
        disabled={isReadOnlyField(`section28_1[${index}].remove`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 28.1</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section28_1`,
            getDefaultNewItem(`${path}.section28_1`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection28_1 };
