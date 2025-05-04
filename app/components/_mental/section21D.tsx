import { Section21D, HealthCareProfessional, AgencyOrFacility } from "api_v2/interfaces/mentalHealth";
import React from "react";

interface Section21DProps {
  data: Section21D[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section21D) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection21D: React.FC<Section21DProps> = ({
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

  const renderEntry = (item: Section21D, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>
      
      <div>
        <label htmlFor={`diagnosis-${index}`}>Identify the diagnosis or health condition:</label>
        <input
          type="text"
          id={`diagnosis-${index}`}
          value={item.diagnosis}
          onChange={handleInputChange(`section21D[${index}].diagnosis`)}
          disabled={isReadOnlyField(`section21D[${index}].diagnosis`)}
        />
      </div>

      <div>
        <label htmlFor={`fromDate-${index}`}>From Date (Month/Year):</label>
        <input
          type="text"
          id={`fromDate-${index}`}
          value={item.datesOfDiagnosis.fromDate}
          onChange={handleInputChange(`section21D[${index}].datesOfDiagnosis.fromDate`)}
          disabled={isReadOnlyField(`section21D[${index}].datesOfDiagnosis.fromDate`)}
        />
        <label htmlFor={`toDate-${index}`}>To Date (Month/Year):</label>
        <input
          type="text"
          id={`toDate-${index}`}
          value={item.datesOfDiagnosis.toDate}
          onChange={handleInputChange(`section21D[${index}].datesOfDiagnosis.toDate`)}
          disabled={isReadOnlyField(`section21D[${index}].datesOfDiagnosis.toDate`)}
        />
        <label>
          <input
            type="checkbox"
            checked={item.datesOfDiagnosis.present}
            onChange={handleCheckboxChange(`section21D[${index}].datesOfDiagnosis.present`)}
            disabled={isReadOnlyField(`section21D[${index}].datesOfDiagnosis.present`)}
          />
          Present
        </label>
        <label>
          <input
            type="checkbox"
            checked={item.datesOfDiagnosis.estimatedFrom}
            onChange={handleCheckboxChange(`section21D[${index}].datesOfDiagnosis.estimatedFrom`)}
            disabled={isReadOnlyField(`section21D[${index}].datesOfDiagnosis.estimatedFrom`)}
          />
          Est.
        </label>
        <label>
          <input
            type="checkbox"
            checked={item.datesOfDiagnosis.estimatedTo}
            onChange={handleCheckboxChange(`section21D[${index}].datesOfDiagnosis.estimatedTo`)}
            disabled={isReadOnlyField(`section21D[${index}].datesOfDiagnosis.estimatedTo`)}
          />
          Est.
        </label>
      </div>

      <div>
        <label htmlFor={`healthCareProfessionalName-${index}`}>Health Care Professional's Name:</label>
        <input
          type="text"
          id={`healthCareProfessionalName-${index}`}
          value={item.healthCareProfessional.name}
          onChange={handleInputChange(`section21D[${index}].healthCareProfessional.name`)}
          disabled={isReadOnlyField(`section21D[${index}].healthCareProfessional.name`)}
        />
        <label htmlFor={`healthCareProfessionalPhone-${index}`}>Telephone Number:</label>
        <input
          type="text"
          id={`healthCareProfessionalPhone-${index}`}
          value={item.healthCareProfessional.telephoneNumber}
          onChange={handleInputChange(`section21D[${index}].healthCareProfessional.telephoneNumber`)}
          disabled={isReadOnlyField(`section21D[${index}].healthCareProfessional.telephoneNumber`)}
        />
        <label htmlFor={`healthCareProfessionalExtension-${index}`}>Extension:</label>
        <input
          type="text"
          id={`healthCareProfessionalExtension-${index}`}
          value={item.healthCareProfessional.extension}
          onChange={handleInputChange(`section21D[${index}].healthCareProfessional.extension`)}
          disabled={isReadOnlyField(`section21D[${index}].healthCareProfessional.extension`)}
        />
        <label>
          <input
            type="checkbox"
            checked={item.healthCareProfessional.day}
            onChange={handleCheckboxChange(`section21D[${index}].healthCareProfessional.day`)}
            disabled={isReadOnlyField(`section21D[${index}].healthCareProfessional.day`)}
          />
          Day
        </label>
        <label>
          <input
            type="checkbox"
            checked={item.healthCareProfessional.night}
            onChange={handleCheckboxChange(`section21D[${index}].healthCareProfessional.night`)}
            disabled={isReadOnlyField(`section21D[${index}].healthCareProfessional.night`)}
          />
          Night
        </label>
        <label>
          <input
            type="checkbox"
            checked={item.healthCareProfessional.internationalOrDsnPhoneNumber}
            onChange={handleCheckboxChange(`section21D[${index}].healthCareProfessional.internationalOrDsnPhoneNumber`)}
            disabled={isReadOnlyField(`section21D[${index}].healthCareProfessional.internationalOrDsnPhoneNumber`)}
          />
          International or DSN Phone Number
        </label>
      </div>

      <div>
        <label htmlFor={`healthCareProfessionalAddress-${index}`}>Health Care Professional's Address:</label>
        <input
          type="text"
          id={`healthCareProfessionalAddress-${index}`}
          value={item.healthCareProfessional.address.street}
          onChange={handleInputChange(`section21D[${index}].healthCareProfessional.address.street`)}
          disabled={isReadOnlyField(`section21D[${index}].healthCareProfessional.address.street`)}
        />
        <input
          type="text"
          id={`healthCareProfessionalCity-${index}`}
          value={item.healthCareProfessional.address.city}
          onChange={handleInputChange(`section21D[${index}].healthCareProfessional.address.city`)}
          disabled={isReadOnlyField(`section21D[${index}].healthCareProfessional.address.city`)}
        />
        <input
          type="text"
          id={`healthCareProfessionalState-${index}`}
          value={item.healthCareProfessional.address.state}
          onChange={handleInputChange(`section21D[${index}].healthCareProfessional.address.state`)}
          disabled={isReadOnlyField(`section21D[${index}].healthCareProfessional.address.state`)}
        />
        <input
          type="text"
          id={`healthCareProfessionalZipCode-${index}`}
          value={item.healthCareProfessional.address.zipCode}
          onChange={handleInputChange(`section21D[${index}].healthCareProfessional.address.zipCode`)}
          disabled={isReadOnlyField(`section21D[${index}].healthCareProfessional.address.zipCode`)}
        />
        <input
          type="text"
          id={`healthCareProfessionalCountry-${index}`}
          value={item.healthCareProfessional.address.country}
          onChange={handleInputChange(`section21D[${index}].healthCareProfessional.address.country`)}
          disabled={isReadOnlyField(`section21D[${index}].healthCareProfessional.address.country`)}
        />
      </div>

      <div>
        <label htmlFor={`agencyOrFacilityName-${index}`}>Agency/Organization/Facility Name:</label>
        <input
          type="text"
          id={`agencyOrFacilityName-${index}`}
          value={item.agencyOrFacility.name}
          onChange={handleInputChange(`section21D[${index}].agencyOrFacility.name`)}
          disabled={isReadOnlyField(`section21D[${index}].agencyOrFacility.name`)}
        />
        <label htmlFor={`agencyOrFacilityPhone-${index}`}>Telephone Number:</label>
        <input
          type="text"
          id={`agencyOrFacilityPhone-${index}`}
          value={item.agencyOrFacility.telephoneNumber}
          onChange={handleInputChange(`section21D[${index}].agencyOrFacility.telephoneNumber`)}
          disabled={isReadOnlyField(`section21D[${index}].agencyOrFacility.telephoneNumber`)}
        />
        <label htmlFor={`agencyOrFacilityExtension-${index}`}>Extension:</label>
        <input
          type="text"
          id={`agencyOrFacilityExtension-${index}`}
          value={item.agencyOrFacility.extension}
          onChange={handleInputChange(`section21D[${index}].agencyOrFacility.extension`)}
          disabled={isReadOnlyField(`section21D[${index}].agencyOrFacility.extension`)}
        />
        <label>
          <input
            type="checkbox"
            checked={item.agencyOrFacility.day}
            onChange={handleCheckboxChange(`section21D[${index}].agencyOrFacility.day`)}
            disabled={isReadOnlyField(`section21D[${index}].agencyOrFacility.day`)}
          />
          Day
        </label>
        <label>
          <input
            type="checkbox"
            checked={item.agencyOrFacility.night}
            onChange={handleCheckboxChange(`section21D[${index}].agencyOrFacility.night`)}
            disabled={isReadOnlyField(`section21D[${index}].agencyOrFacility.night`)}
          />
          Night
        </label>
        <label>
          <input
            type="checkbox"
            checked={item.agencyOrFacility.internationalOrDsnPhoneNumber}
            onChange={handleCheckboxChange(`section21D[${index}].agencyOrFacility.internationalOrDsnPhoneNumber`)}
            disabled={isReadOnlyField(`section21D[${index}].agencyOrFacility.internationalOrDsnPhoneNumber`)}
          />
          International or DSN Phone Number
        </label>
      </div>

      <div>
        <label htmlFor={`agencyOrFacilityAddress-${index}`}>Agency/Organization/Facility Address:</label>
        <input
          type="text"
          id={`agencyOrFacilityAddress-${index}`}
          value={item.agencyOrFacility.address.street}
          onChange={handleInputChange(`section21D[${index}].agencyOrFacility.address.street`)}
          disabled={isReadOnlyField(`section21D[${index}].agencyOrFacility.address.street`)}
        />
        <input
          type="text"
          id={`agencyOrFacilityCity-${index}`}
          value={item.agencyOrFacility.address.city}
          onChange={handleInputChange(`section21D[${index}].agencyOrFacility.address.city`)}
          disabled={isReadOnlyField(`section21D[${index}].agencyOrFacility.address.city`)}
        />
        <input
          type="text"
          id={`agencyOrFacilityState-${index}`}
          value={item.agencyOrFacility.address.state}
          onChange={handleInputChange(`section21D[${index}].agencyOrFacility.address.state`)}
          disabled={isReadOnlyField(`section21D[${index}].agencyOrFacility.address.state`)}
        />
        <input
          type="text"
          id={`agencyOrFacilityZipCode-${index}`}
          value={item.agencyOrFacility.address.zipCode}
          onChange={handleInputChange(`section21D[${index}].agencyOrFacility.address.zipCode`)}
          disabled={isReadOnlyField(`section21D[${index}].agencyOrFacility.address.zipCode`)}
        />
        <input
          type="text"
          id={`agencyOrFacilityCountry-${index}`}
          value={item.agencyOrFacility.address.country}
          onChange={handleInputChange(`section21D[${index}].agencyOrFacility.address.country`)}
          disabled={isReadOnlyField(`section21D[${index}].agencyOrFacility.address.country`)}
        />
      </div>

      <div>
        <label>Was the counseling/treatment effective in managing your symptoms?</label>
        <label>
          <input
            type="radio"
            name={`counselingEffective-${index}`}
            checked={item.counselingEffective}
            onChange={() => onInputChange(`section21D[${index}].counselingEffective`, true)}
            disabled={isReadOnlyField(`section21D[${index}].counselingEffective`)}
          />
          Yes
        </label>
        <label>
          <input
            type="radio"
            name={`counselingEffective-${index}`}
            checked={!item.counselingEffective}
            onChange={() => onInputChange(`section21D[${index}].counselingEffective`, false)}
            disabled={isReadOnlyField(`section21D[${index}].counselingEffective`)}
          />
          No
        </label>
        {item.counselingEffective === false && (
          <div>
            <label htmlFor={`counselingExplanation-${index}`}>If no, provide explanation:</label>
            <input
              type="text"
              id={`counselingExplanation-${index}`}
              value={item.counselingExplanation}
              onChange={handleInputChange(`section21D[${index}].counselingExplanation`)}
              disabled={isReadOnlyField(`section21D[${index}].counselingExplanation`)}
            />
          </div>
        )}
      </div>

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section21D`, index);
        }}
        disabled={isReadOnlyField(`section21D[${index}]`)}
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
          onAddEntry(`${path}.section21D`, getDefaultNewItem(`${path}.section21D`));
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection21D };
