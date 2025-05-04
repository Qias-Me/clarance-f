import { type Section21C, type Facility } from "api/interfaces/sections/mentalHealth";
import React from "react";

interface Section21CProps {
  data: Section21C[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section21C) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection21C: React.FC<Section21CProps> = ({
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

  const renderEntry = (item: Section21C, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <div>
        <label htmlFor={`voluntary-${index}`}>Voluntary:</label>
        <input
          type="checkbox"
          id={`voluntary-${index}`}
          checked={item.voluntary}
          onChange={handleCheckboxChange(`section21C[${index}].voluntary`)}
          disabled={isReadOnlyField(`section21C[${index}].voluntary`)}
        />
      </div>

      <div>
        <label htmlFor={`explanation-${index}`}>Explanation:</label>
        <input
          type="text"
          id={`explanation-${index}`}
          value={item.explanation}
          onChange={handleInputChange(`section21C[${index}].explanation`)}
          disabled={isReadOnlyField(`section21C[${index}].explanation`)}
        />
      </div>

      <div>
        <label htmlFor={`facility-name-${index}`}>Facility Name:</label>
        <input
          type="text"
          id={`facility-name-${index}`}
          value={item.facility.name}
          onChange={handleInputChange(`section21C[${index}].facility.name`)}
          disabled={isReadOnlyField(`section21C[${index}].facility.name`)}
        />
      </div>

      <div>
        <label htmlFor={`facility-address-${index}`}>Facility Address:</label>
        <input
          type="text"
          id={`facility-address-${index}`}
          value={item.facility.address.street}
          onChange={handleInputChange(`section21C[${index}].facility.address.street`)}
          disabled={isReadOnlyField(`section21C[${index}].facility.address.street`)}
        />
      </div>
      <div>
        <label htmlFor={`fromDate-${index}`}>From Date:</label>
        <input
          type="text"
          id={`fromDate-${index}`}
          value={item.fromDate}
          onChange={handleInputChange(`section21C[${index}].fromDate`)}
          disabled={isReadOnlyField(`section21C[${index}].fromDate`)}
        />
      </div>

      <div>
        <label htmlFor={`toDate-${index}`}>To Date:</label>
        <input
          type="text"
          id={`toDate-${index}`}
          value={item.toDate}
          onChange={handleInputChange(`section21C[${index}].toDate`)}
          disabled={isReadOnlyField(`section21C[${index}].toDate`)}
        />
      </div>

      <div>
        <label htmlFor={`present-${index}`}>Present:</label>
        <input
          type="checkbox"
          id={`present-${index}`}
          checked={item.present}
          onChange={handleCheckboxChange(`section21C[${index}].present`)}
          disabled={isReadOnlyField(`section21C[${index}].present`)}
        />
      </div>

      <div>
        <label htmlFor={`estimatedFrom-${index}`}>Estimated From:</label>
        <input
          type="checkbox"
          id={`estimatedFrom-${index}`}
          checked={item.estimatedFrom}
          onChange={handleCheckboxChange(`section21C[${index}].estimatedFrom`)}
          disabled={isReadOnlyField(`section21C[${index}].estimatedFrom`)}
        />
      </div>

      <div>
        <label htmlFor={`estimatedTo-${index}`}>Estimated To:</label>
        <input
          type="checkbox"
          id={`estimatedTo-${index}`}
          checked={item.estimatedTo}
          onChange={handleCheckboxChange(`section21C[${index}].estimatedTo`)}
          disabled={isReadOnlyField(`section21C[${index}].estimatedTo`)}
        />
      </div>

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section21C`, index);
        }}
        disabled={isReadOnlyField(`section21C[${index}]`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 21C</h2>
      {data.map(renderEntry)}

      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(`${path}.section21C`, getDefaultNewItem(`${path}.section21C`));
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection21C };
