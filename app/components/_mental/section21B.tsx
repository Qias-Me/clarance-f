import { Section21B } from "api_v2/interfaces/mentalHealth";
import React from "react";

interface Section21BProps {
  data: Section21B[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section21B) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection21B: React.FC<Section21BProps> = ({
  data,
  onInputChange,
  onRemoveEntry,
  onAddEntry,
  getDefaultNewItem,
  path,
  isReadOnlyField,
}) => {

  const handleInputChange =
    (fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onInputChange(`${path}.${fieldPath}`, event.target.value);
    };

  const handleCheckboxChange =
    (fieldPath: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(`${path}.${fieldPath}`, event.target.checked);
    };

  const renderAppeals = (appeals: Appeal[], entryIndex: number) =>
    appeals.map((appeal, appealIndex) => (
      <div key={appeal._id} className="space-y-2 p-2 border rounded-lg">
        <label>
          Provide the name of the court or administrative agency.
          <input
            type="text"
            value={appeal.courtAgency.name}
            onChange={handleInputChange(`section21B[${entryIndex}].appeals[${appealIndex}].courtAgency.name`)}
            readOnly={isReadOnlyField(`section21B[${entryIndex}].appeals[${appealIndex}].courtAgency.name`)}
          />
        </label>
        <label>
          Provide the final disposition.
          <input
            type="text"
            value={appeal.finalDisposition}
            onChange={handleInputChange(`section21B[${entryIndex}].appeals[${appealIndex}].finalDisposition`)}
            readOnly={isReadOnlyField(`section21B[${entryIndex}].appeals[${appealIndex}].finalDisposition`)}
          />
        </label>
        {/* Address fields */}
        <label>
          Street
          <input
            type="text"
            value={appeal.courtAgency.address.street}
            onChange={handleInputChange(`section21B[${entryIndex}].appeals[${appealIndex}].courtAgency.address.street`)}
            readOnly={isReadOnlyField(`section21B[${entryIndex}].appeals[${appealIndex}].courtAgency.address.street`)}
          />
        </label>
        <label>
          City
          <input
            type="text"
            value={appeal.courtAgency.address.city}
            onChange={handleInputChange(`section21B[${entryIndex}].appeals[${appealIndex}].courtAgency.address.city`)}
            readOnly={isReadOnlyField(`section21B[${entryIndex}].appeals[${appealIndex}].courtAgency.address.city`)}
          />
        </label>
        <label>
          State
          <input
            type="text"
            value={appeal.courtAgency.address.state}
            onChange={handleInputChange(`section21B[${entryIndex}].appeals[${appealIndex}].courtAgency.address.state`)}
            readOnly={isReadOnlyField(`section21B[${entryIndex}].appeals[${appealIndex}].courtAgency.address.state`)}
          />
        </label>
        <label>
          Zip Code
          <input
            type="text"
            value={appeal.courtAgency.address.zipCode}
            onChange={handleInputChange(`section21B[${entryIndex}].appeals[${appealIndex}].courtAgency.address.zipCode`)}
            readOnly={isReadOnlyField(`section21B[${entryIndex}].appeals[${appealIndex}].courtAgency.address.zipCode`)}
          />
        </label>
        <label>
          Country
          <input
            type="text"
            value={appeal.courtAgency.address.country}
            onChange={handleInputChange(`section21B[${entryIndex}].appeals[${appealIndex}].courtAgency.address.country`)}
            readOnly={isReadOnlyField(`section21B[${entryIndex}].appeals[${appealIndex}].courtAgency.address.country`)}
          />
        </label>
      </div>
    ));

  const renderEntry = (item: Section21B, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <label>
        Provide the date this occurred.
        <input
          type="month"
          value={item.dateOccurred}
          onChange={handleInputChange(`section21B[${index}].dateOccurred`)}
          readOnly={isReadOnlyField(`section21B[${index}].dateOccurred`)}
        />
      </label>
      <label>
        Estimated
        <input
          type="checkbox"
          checked={item.estimated}
          onChange={handleCheckboxChange(`section21B[${index}].estimated`)}
          readOnly={isReadOnlyField(`section21B[${index}].estimated`)}
        />
      </label>
      <label>
        Provide the name of the court or administrative agency that ordered you to consult with a mental health professional.
        <input
          type="text"
          value={item.courtAgency.name}
          onChange={handleInputChange(`section21B[${index}].courtAgency.name`)}
          readOnly={isReadOnlyField(`section21B[${index}].courtAgency.name`)}
        />
      </label>
      {/* Address fields */}
      <label>
        Street
        <input
          type="text"
          value={item.courtAgency.address.street}
          onChange={handleInputChange(`section21B[${index}].courtAgency.address.street`)}
          readOnly={isReadOnlyField(`section21B[${index}].courtAgency.address.street`)}
        />
      </label>
      <label>
        City
        <input
          type="text"
          value={item.courtAgency.address.city}
          onChange={handleInputChange(`section21B[${index}].courtAgency.address.city`)}
          readOnly={isReadOnlyField(`section21B[${index}].courtAgency.address.city`)}
        />
      </label>
      <label>
        State
        <input
          type="text"
          value={item.courtAgency.address.state}
          onChange={handleInputChange(`section21B[${index}].courtAgency.address.state`)}
          readOnly={isReadOnlyField(`section21B[${index}].courtAgency.address.state`)}
        />
      </label>
      <label>
        Zip Code
        <input
          type="text"
          value={item.courtAgency.address.zipCode}
          onChange={handleInputChange(`section21B[${index}].courtAgency.address.zipCode`)}
          readOnly={isReadOnlyField(`section21B[${index}].courtAgency.address.zipCode`)}
        />
      </label>
      <label>
        Country
        <input
          type="text"
          value={item.courtAgency.address.country}
          onChange={handleInputChange(`section21B[${index}].courtAgency.address.country`)}
          readOnly={isReadOnlyField(`section21B[${index}].courtAgency.address.country`)}
        />
      </label>
      <label>
        Provide the final disposition.
        <input
          type="text"
          value={item.finalDisposition}
          onChange={handleInputChange(`section21B[${index}].finalDisposition`)}
          readOnly={isReadOnlyField(`section21B[${index}].finalDisposition`)}
        />
      </label>
      <label>
        Was this matter appealed to a higher court or administrative agency?
        <input
          type="checkbox"
          checked={item.appealed}
          onChange={handleCheckboxChange(`section21B[${index}].appealed`)}
          readOnly={isReadOnlyField(`section21B[${index}].appealed`)}
        />
      </label>
      {item.appeals && renderAppeals(item.appeals, index)}
      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section21B`, index);
        }}
        disabled={isReadOnlyField(`section21B[${index}]`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 21B</h2>
      {data.map(renderEntry)}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(`${path}.section21B`, getDefaultNewItem(`${path}.section21B`));
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection21B };
