import {
  type Appeal,
  type Section21A,
} from "api/interfaces/sections/mentalHealth";
import React from "react";

interface Section21AProps {
  data: Section21A[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section21A) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection21A: React.FC<Section21AProps> = ({
  data,
  onInputChange,
  onRemoveEntry,
  onAddEntry,
  getDefaultNewItem,
  path,
  isReadOnlyField,
}) => {

  console.log(data, "data");

  const handleInputChange =
    (fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onInputChange(`${path}.${fieldPath}`, event.target.value);
    };

  const handleCheckboxChange =
    (fieldPath: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(`${path}.${fieldPath}`, event.target.checked);
    };

  const renderEntry = (item: Section21A, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <div>
        <label htmlFor={`dateOccurred-${index}`}>Provide the date this occurred. (Month/Year)</label>
        <input
          type="text"
          id={`dateOccurred-${index}`}
          value={item.dateOccurred}
          onChange={handleInputChange(`section21A[${index}].dateOccurred`)}
          disabled={isReadOnlyField(`section21A[${index}].dateOccurred`)}
        />
        <label htmlFor={`estimated-${index}`}>
          <input
            type="checkbox"
            id={`estimated-${index}`}
            checked={item.estimated}
            onChange={handleCheckboxChange(`section21A[${index}].estimated`)}
            disabled={isReadOnlyField(`section21A[${index}].estimated`)}
          />
          Est.
        </label>
      </div>

      <div>
        <label htmlFor={`courtAgencyName-${index}`}>Provide the name of the court or administrative agency that declared you mentally incompetent.</label>
        <input
          type="text"
          id={`courtAgencyName-${index}`}
          value={item.courtAgency.name}
          onChange={handleInputChange(`section21A[${index}].courtAgency.name`)}
          disabled={isReadOnlyField(`section21A[${index}].courtAgency.name`)}
        />
      </div>

      <div>
        <label>Provide the address of the court or administrative agency.</label>
        <input
          type="text"
          placeholder="Street"
          value={item.courtAgency.address.street}
          onChange={handleInputChange(`section21A[${index}].courtAgency.address.street`)}
          disabled={isReadOnlyField(`section21A[${index}].courtAgency.address.street`)}
        />
        <input
          type="text"
          placeholder="City"
          value={item.courtAgency.address.city}
          onChange={handleInputChange(`section21A[${index}].courtAgency.address.city`)}
          disabled={isReadOnlyField(`section21A[${index}].courtAgency.address.city`)}
        />
        <input
          type="text"
          placeholder="State"
          value={item.courtAgency.address.state}
          onChange={handleInputChange(`section21A[${index}].courtAgency.address.state`)}
          disabled={isReadOnlyField(`section21A[${index}].courtAgency.address.state`)}
        />
        <input
          type="text"
          placeholder="Zip Code"
          value={item.courtAgency.address.zipCode}
          onChange={handleInputChange(`section21A[${index}].courtAgency.address.zipCode`)}
          disabled={isReadOnlyField(`section21A[${index}].courtAgency.address.zipCode`)}
        />
        <input
          type="text"
          placeholder="Country"
          value={item.courtAgency.address.country}
          onChange={handleInputChange(`section21A[${index}].courtAgency.address.country`)}
          disabled={isReadOnlyField(`section21A[${index}].courtAgency.address.country`)}
        />
      </div>

      <div>
        <label>Was this matter appealed to a higher court or administrative agency?</label>
        <input
          type="radio"
          id={`appealedYes-${index}`}
          name={`appealed-${index}`}
          value="true"
          checked={item.appealed === true}
          onChange={() => onInputChange(`${path}.section21A[${index}].appealed`, true)}
          disabled={isReadOnlyField(`section21A[${index}].appealed`)}
        />
        <label htmlFor={`appealedYes-${index}`}>Yes</label>
        <input
          type="radio"
          id={`appealedNo-${index}`}
          name={`appealed-${index}`}
          value="false"
          checked={item.appealed === false}
          onChange={() => onInputChange(`${path}.section21A[${index}].appealed`, false)}
          disabled={isReadOnlyField(`section21A[${index}].appealed`)}
        />
        <label htmlFor={`appealedNo-${index}`}>No</label>
      </div>

      {item.appealed && (
        <div>
          <h3>Appeals</h3>
          {item.appeals?.map((appeal: Appeal, appealIndex: number) => (
            <div key={appealIndex} className="space-y-2">
              <div>
                <label htmlFor={`appealCourtAgencyName-${index}-${appealIndex}`}>Provide the name of the court or administrative agency.</label>
                <input
                  type="text"
                  id={`appealCourtAgencyName-${index}-${appealIndex}`}
                  value={appeal.courtAgency.name}
                  onChange={handleInputChange(`section21A[${index}].appeals[${appealIndex}].courtAgency.name`)}
                  disabled={isReadOnlyField(`section21A[${index}].appeals[${appealIndex}].courtAgency.name`)}
                />
              </div>
              <div>
                <label htmlFor={`appealFinalDisposition-${index}-${appealIndex}`}>Provide the final disposition.</label>
                <input
                  type="text"
                  id={`appealFinalDisposition-${index}-${appealIndex}`}
                  value={appeal.finalDisposition}
                  onChange={handleInputChange(`section21A[${index}].appeals[${appealIndex}].finalDisposition`)}
                  disabled={isReadOnlyField(`section21A[${index}].appeals[${appealIndex}].finalDisposition`)}
                />
              </div>
              <div>
                <label>Provide the address of the court or administrative agency.</label>
                <input
                  type="text"
                  placeholder="Street"
                  value={appeal.courtAgency.address.street}
                  onChange={handleInputChange(`section21A[${index}].appeals[${appealIndex}].courtAgency.address.street`)}
                  disabled={isReadOnlyField(`section21A[${index}].appeals[${appealIndex}].courtAgency.address.street`)}
                />
                <input
                  type="text"
                  placeholder="City"
                  value={appeal.courtAgency.address.city}
                  onChange={handleInputChange(`section21A[${index}].appeals[${appealIndex}].courtAgency.address.city`)}
                  disabled={isReadOnlyField(`section21A[${index}].appeals[${appealIndex}].courtAgency.address.city`)}
                />
                <input
                  type="text"
                  placeholder="State"
                  value={appeal.courtAgency.address.state}
                  onChange={handleInputChange(`section21A[${index}].appeals[${appealIndex}].courtAgency.address.state`)}
                  disabled={isReadOnlyField(`section21A[${index}].appeals[${appealIndex}].courtAgency.address.state`)}
                />
                <input
                  type="text"
                  placeholder="Zip Code"
                  value={appeal.courtAgency.address.zipCode}
                  onChange={handleInputChange(`section21A[${index}].appeals[${appealIndex}].courtAgency.address.zipCode`)}
                  disabled={isReadOnlyField(`section21A[${index}].appeals[${appealIndex}].courtAgency.address.zipCode`)}
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={appeal.courtAgency.address.country}
                  onChange={handleInputChange(`section21A[${index}].appeals[${appealIndex}].courtAgency.address.country`)}
                  disabled={isReadOnlyField(`section21A[${index}].appeals[${appealIndex}].courtAgency.address.country`)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section21A`, index);
        }}
        disabled={isReadOnlyField(`section21A[${index}]`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 21A</h2>
      {data.map(renderEntry)}

      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(`${path}.section21A`, getDefaultNewItem(`${path}.section21A`));
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection21A };
