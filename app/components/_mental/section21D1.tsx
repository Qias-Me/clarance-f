import {
  type Section21D1,
  type HealthCareProfessional,
} from "api/interfaces/sections/mentalHealth";
import React from "react";

interface Section21D1Props {
  data: Section21D1[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section21D1) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection21D1: React.FC<Section21D1Props> = ({
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

  const renderEntry = (item: Section21D1, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      <label>
        Health Care Professional Name
        <input
          type="text"
          value={item.healthCareProfessional.name}
          onChange={handleInputChange(`section21D1[${index}].healthCareProfessional.name`)}
          readOnly={isReadOnlyField(`section21D1[${index}].healthCareProfessional.name`)}
        />
      </label>

      <label>
        Telephone Number
        <input
          type="text"
          value={item.healthCareProfessional.telephoneNumber}
          onChange={handleInputChange(`section21D1[${index}].healthCareProfessional.telephoneNumber`)}
          readOnly={isReadOnlyField(`section21D1[${index}].healthCareProfessional.telephoneNumber`)}
        />
      </label>

      <label>
        Extension
        <input
          type="text"
          value={item.healthCareProfessional.extension}
          onChange={handleInputChange(`section21D1[${index}].healthCareProfessional.extension`)}
          readOnly={isReadOnlyField(`section21D1[${index}].healthCareProfessional.extension`)}
        />
      </label>

      <label>
        Day
        <input
          type="checkbox"
          checked={item.healthCareProfessional.day}
          onChange={handleCheckboxChange(`section21D1[${index}].healthCareProfessional.day`)}
          readOnly={isReadOnlyField(`section21D1[${index}].healthCareProfessional.day`)}
        />
      </label>

      <label>
        Night
        <input
          type="checkbox"
          checked={item.healthCareProfessional.night}
          onChange={handleCheckboxChange(`section21D1[${index}].healthCareProfessional.night`)}
          readOnly={isReadOnlyField(`section21D1[${index}].healthCareProfessional.night`)}
        />
      </label>

      <label>
        International or DSN Phone Number
        <input
          type="checkbox"
          checked={item.healthCareProfessional.internationalOrDsnPhoneNumber}
          onChange={handleCheckboxChange(`section21D1[${index}].healthCareProfessional.internationalOrDsnPhoneNumber`)}
          readOnly={isReadOnlyField(`section21D1[${index}].healthCareProfessional.internationalOrDsnPhoneNumber`)}
        />
      </label>

      <label>
        Street
        <input
          type="text"
          value={item.healthCareProfessional.address.street}
          onChange={handleInputChange(`section21D1[${index}].healthCareProfessional.address.street`)}
          readOnly={isReadOnlyField(`section21D1[${index}].healthCareProfessional.address.street`)}
        />
      </label>

      <label>
        City
        <input
          type="text"
          value={item.healthCareProfessional.address.city}
          onChange={handleInputChange(`section21D1[${index}].healthCareProfessional.address.city`)}
          readOnly={isReadOnlyField(`section21D1[${index}].healthCareProfessional.address.city`)}
        />
      </label>

      <label>
        State
        <input
          type="text"
          value={item.healthCareProfessional.address.state}
          onChange={handleInputChange(`section21D1[${index}].healthCareProfessional.address.state`)}
          readOnly={isReadOnlyField(`section21D1[${index}].healthCareProfessional.address.state`)}
        />
      </label>

      <label>
        Zip Code
        <input
          type="text"
          value={item.healthCareProfessional.address.zipCode}
          onChange={handleInputChange(`section21D1[${index}].healthCareProfessional.address.zipCode`)}
          readOnly={isReadOnlyField(`section21D1[${index}].healthCareProfessional.address.zipCode`)}
        />
      </label>

      <label>
        Country
        <input
          type="text"
          value={item.healthCareProfessional.address.country}
          onChange={handleInputChange(`section21D1[${index}].healthCareProfessional.address.country`)}
          readOnly={isReadOnlyField(`section21D1[${index}].healthCareProfessional.address.country`)}
        />
      </label>

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section21D1`, index);
        }}
        disabled={isReadOnlyField(`section21D1[${index}]`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 21D</h2>
      {data.map(renderEntry)}

      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(`${path}.section21D1`, getDefaultNewItem(`${path}.section21D1`));
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection21D1 };
