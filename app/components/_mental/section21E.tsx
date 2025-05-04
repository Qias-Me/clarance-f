import { type Section21E } from "api/interfaces/sections/mentalHealth";
import React from "react";

interface Section21EProps {
  data: Section21E[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section21E) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection21E: React.FC<Section21EProps> = ({
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

  const renderEntry = (item: Section21E, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      <div>
        <label htmlFor={`fromDate-${index}`}>From Date (Month/Year):</label>
        <input
          type="text"
          id={`fromDate-${index}`}
          value={item.fromDate}
          placeholder="MM/YYYY"
          onChange={handleInputChange(`section21E[${index}].fromDate`)}
          disabled={isReadOnlyField(`section21E[${index}].fromDate`)}
        />
        <label htmlFor={`toDate-${index}`}>To Date (Month/Year):</label>
        <input
          type="text"
          id={`toDate-${index}`}
          value={item.toDate}
          placeholder="MM/YYYY"
          onChange={handleInputChange(`section21E[${index}].toDate`)}
          disabled={isReadOnlyField(`section21E[${index}].toDate`)}
        />
        <label>
          <input
            type="checkbox"
            checked={item.present}
            onChange={handleCheckboxChange(`section21E[${index}].present`)}
            disabled={isReadOnlyField(`section21E[${index}].present`)}
          />
          Present
        </label>
        <label>
          <input
            type="checkbox"
            checked={item.estimatedFrom}
            onChange={handleCheckboxChange(`section21E[${index}].estimatedFrom`)}
            disabled={isReadOnlyField(`section21E[${index}].estimatedFrom`)}
          />
          Est.
        </label>
        <label>
          <input
            type="checkbox"
            checked={item.estimatedTo}
            onChange={handleCheckboxChange(`section21E[${index}].estimatedTo`)}
            disabled={isReadOnlyField(`section21E[${index}].estimatedTo`)}
          />
          Est.
        </label>
      </div>

      <div>
        <label htmlFor={`healthCareProfessionalName-${index}`}>
          Health Care Professional's Name:
        </label>
        <input
          type="text"
          id={`healthCareProfessionalName-${index}`}
          value={item.healthCareProfessional.name}
          placeholder="Health Care Professional's Name"
          onChange={handleInputChange(`section21E[${index}].healthCareProfessional.name`)}
          disabled={isReadOnlyField(`section21E[${index}].healthCareProfessional.name`)}
        />
        <label htmlFor={`healthCareProfessionalPhone-${index}`}>
          Telephone Number:
        </label>
        <input
          type="text"
          id={`healthCareProfessionalPhone-${index}`}
          value={item.healthCareProfessional.telephoneNumber}
          placeholder="Phone Number"
          onChange={handleInputChange(`section21E[${index}].healthCareProfessional.telephoneNumber`)}
          disabled={isReadOnlyField(`section21E[${index}].healthCareProfessional.telephoneNumber`)}
        />
        <label htmlFor={`healthCareProfessionalExtension-${index}`}>
          Extension:
        </label>
        <input
          type="text"
          id={`healthCareProfessionalExtension-${index}`}
          value={item.healthCareProfessional.extension}
          placeholder="Extension"
          onChange={handleInputChange(`section21E[${index}].healthCareProfessional.extension`)}
          disabled={isReadOnlyField(`section21E[${index}].healthCareProfessional.extension`)}
        />
        <label>
          <input
            type="checkbox"
            checked={item.healthCareProfessional.day}
            onChange={handleCheckboxChange(`section21E[${index}].healthCareProfessional.day`)}
            disabled={isReadOnlyField(`section21E[${index}].healthCareProfessional.day`)}
          />
          Day
        </label>
        <label>
          <input
            type="checkbox"
            checked={item.healthCareProfessional.night}
            onChange={handleCheckboxChange(`section21E[${index}].healthCareProfessional.night`)}
            disabled={isReadOnlyField(`section21E[${index}].healthCareProfessional.night`)}
          />
          Night
        </label>
        <label>
          <input
            type="checkbox"
            checked={item.healthCareProfessional.internationalOrDsnPhoneNumber}
            onChange={handleCheckboxChange(`section21E[${index}].healthCareProfessional.internationalOrDsnPhoneNumber`)}
            disabled={isReadOnlyField(`section21E[${index}].healthCareProfessional.internationalOrDsnPhoneNumber`)}
          />
          International or DSN Phone Number
        </label>
      </div>

      <div>
        <label htmlFor={`healthCareProfessionalAddress-${index}`}>
          Health Care Professional's Address:
        </label>
        <input
          type="text"
          id={`healthCareProfessionalAddress-${index}`}
          value={item.healthCareProfessional.address.street}
          placeholder="Street"
          onChange={handleInputChange(`section21E[${index}].healthCareProfessional.address.street`)}
          disabled={isReadOnlyField(`section21E[${index}].healthCareProfessional.address.street`)}
        />
        <input
          type="text"
          id={`healthCareProfessionalCity-${index}`}
          value={item.healthCareProfessional.address.city}
          placeholder="City"
          onChange={handleInputChange(`section21E[${index}].healthCareProfessional.address.city`)}
          disabled={isReadOnlyField(`section21E[${index}].healthCareProfessional.address.city`)}
        />
        <input
          type="text"
          id={`healthCareProfessionalState-${index}`}
          value={item.healthCareProfessional.address.state}
          placeholder="State"
          onChange={handleInputChange(`section21E[${index}].healthCareProfessional.address.state`)}
          disabled={isReadOnlyField(`section21E[${index}].healthCareProfessional.address.state`)}
        />
        <input
          type="text"
          id={`healthCareProfessionalZipCode-${index}`}
          value={item.healthCareProfessional.address.zipCode}
          placeholder="Zip Code"
          onChange={handleInputChange(`section21E[${index}].healthCareProfessional.address.zipCode`)}
          disabled={isReadOnlyField(`section21E[${index}].healthCareProfessional.address.zipCode`)}
        />
        <input
          type="text"
          id={`healthCareProfessionalCountry-${index}`}
          value={item.healthCareProfessional.address.country}
          placeholder="Country"
          onChange={handleInputChange(`section21E[${index}].healthCareProfessional.address.country`)}
          disabled={isReadOnlyField(`section21E[${index}].healthCareProfessional.address.country`)}
        />
      </div>

      <div>
        <label htmlFor={`agencyOrFacilityName-${index}`}>
          Agency/Organization/Facility Name:
        </label>
        <input
          type="text"
          id={`agencyOrFacilityName-${index}`}
          value={item.agencyOrFacility.name}
          placeholder="Agency/Organization/Facility Name"
          onChange={handleInputChange(`section21E[${index}].agencyOrFacility.name`)}
          disabled={isReadOnlyField(`section21E[${index}].agencyOrFacility.name`)}
        />
        <label htmlFor={`agencyOrFacilityPhone-${index}`}>
          Telephone Number:
        </label>
        <input
          type="text"
          id={`agencyOrFacilityPhone-${index}`}
          value={item.agencyOrFacility.telephoneNumber}
          placeholder="Phone Number"
          onChange={handleInputChange(`section21E[${index}].agencyOrFacility.telephoneNumber`)}
          disabled={isReadOnlyField(`section21E[${index}].agencyOrFacility.telephoneNumber`)}
        />
        <label htmlFor={`agencyOrFacilityExtension-${index}`}>Extension:</label>
        <input
          type="text"
          id={`agencyOrFacilityExtension-${index}`}
          value={item.agencyOrFacility.extension}
          placeholder="Extension"
          onChange={handleInputChange(`section21E[${index}].agencyOrFacility.extension`)}
          disabled={isReadOnlyField(`section21E[${index}].agencyOrFacility.extension`)}
        />
        <label>
          <input
            type="checkbox"
            checked={item.agencyOrFacility.day}
            onChange={handleCheckboxChange(`section21E[${index}].agencyOrFacility.day`)}
            disabled={isReadOnlyField(`section21E[${index}].agencyOrFacility.day`)}
          />
          Day
        </label>
        <label>
          <input
            type="checkbox"
            checked={item.agencyOrFacility.night}
            onChange={handleCheckboxChange(`section21E[${index}].agencyOrFacility.night`)}
            disabled={isReadOnlyField(`section21E[${index}].agencyOrFacility.night`)}
          />
          Night
        </label>
        <label>
          <input
            type="checkbox"
            checked={item.agencyOrFacility.internationalOrDsnPhoneNumber}
            onChange={handleCheckboxChange(`section21E[${index}].agencyOrFacility.internationalOrDsnPhoneNumber`)}
            disabled={isReadOnlyField(`section21E[${index}].agencyOrFacility.internationalOrDsnPhoneNumber`)}
          />
          International or DSN Phone Number
        </label>
      </div>

      <div>
        <label htmlFor={`agencyOrFacilityAddress-${index}`}>
          Agency/Organization/Facility Address:
        </label>
        <input
          type="text"
          id={`agencyOrFacilityAddress-${index}`}
          value={item.agencyOrFacility.address.street}
          placeholder="Street"
          onChange={handleInputChange(`section21E[${index}].agencyOrFacility.address.street`)}
          disabled={isReadOnlyField(`section21E[${index}].agencyOrFacility.address.street`)}
        />
        <input
          type="text"
          id={`agencyOrFacilityCity-${index}`}
          value={item.agencyOrFacility.address.city}
          placeholder="City"
          onChange={handleInputChange(`section21E[${index}].agencyOrFacility.address.city`)}
          disabled={isReadOnlyField(`section21E[${index}].agencyOrFacility.address.city`)}
        />
        <input
          type="text"
          id={`agencyOrFacilityState-${index}`}
          value={item.agencyOrFacility.address.state}
          placeholder="State"
          onChange={handleInputChange(`section21E[${index}].agencyOrFacility.address.state`)}
          disabled={isReadOnlyField(`section21E[${index}].agencyOrFacility.address.state`)}
        />
        <input
          type="text"
          id={`agencyOrFacilityZipCode-${index}`}
          value={item.agencyOrFacility.address.zipCode}
          placeholder="Zip Code"
          onChange={handleInputChange(`section21E[${index}].agencyOrFacility.address.zipCode`)}
          disabled={isReadOnlyField(`section21E[${index}].agencyOrFacility.address.zipCode`)}
        />
        <input
          type="text"
          id={`agencyOrFacilityCountry-${index}`}
          value={item.agencyOrFacility.address.country}
          placeholder="Country"
          onChange={handleInputChange(`section21E[${index}].agencyOrFacility.address.country`)}
          disabled={isReadOnlyField(`section21E[${index}].agencyOrFacility.address.country`)}
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={item.choseNotToFollow}
            onChange={handleCheckboxChange(`section21E[${index}].choseNotToFollow`)}
            disabled={isReadOnlyField(`section21E[${index}].choseNotToFollow`)}
          />
          Chose Not To Follow
        </label>
      </div>

      {item.choseNotToFollow && (
        <div>
          <label htmlFor={`explanation-${index}`}>Explanation:</label>
          <input
            type="text"
            id={`explanation-${index}`}
            value={item.explanation}
            placeholder="Explanation"
            onChange={handleInputChange(`section21E[${index}].explanation`)}
            disabled={isReadOnlyField(`section21E[${index}].explanation`)}
          />
        </div>
      )}

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section21E`, index);
        }}
        disabled={isReadOnlyField(`section21E[${index}]`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 21E</h2>
      {data.map(renderEntry)}

      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(`${path}.section21E`, getDefaultNewItem(`${path}.section21E`));
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection21E };
