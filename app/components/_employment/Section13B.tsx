// RenderSection13B.tsx
import React from "react";
import { type Section13B } from "api/interfaces/sections/employmentInfo";

interface Section13BProps {
  data: Section13B;
  onInputChange: (path: string, value: any) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  onAddEntry: (path: string, newItem: any) => void;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection13B: React.FC<Section13BProps> = ({
  data,
  onInputChange,
  getDefaultNewItem,
  onAddEntry,
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

  const handleRadioChange =
    (value: boolean) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        onInputChange(`${path}.hasFormerFederalEmployment`, value);
      }
    };

  const addNewEntry = () => {
    const newItem = getDefaultNewItem(
      `employmentInfo.section13B.employmentEntries`
    );

    console.log(newItem, "newItem", path, "path");
    onAddEntry(`${path}.employmentEntries`, newItem);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold">
          Section 13B - Employment Activities - Former Federal Service
        </h3>

        <label className="block">
          Do you have former federal civilian employment, excluding military
          service, NOT indicated previously, to report?
        </label>
        <div className="mt-2">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="formerFederalEmployment"
              value="yes"
              checked={data.hasFormerFederalEmployment === true}
              onChange={handleRadioChange(true)}
              className="mr-2"
            />
            YES
          </label>
          <label className="inline-flex items-center ml-4">
            <input
              type="radio"
              name="formerFederalEmployment"
              value="no"
              checked={data.hasFormerFederalEmployment === false}
              onChange={handleRadioChange(false)}
              className="mr-2"
            />
            NO
          </label>
        </div>

        {data.hasFormerFederalEmployment && (
          <>
            {console.log(data, "employmentEntries")}
            {data.employmentEntries.map((entry, index) => (
              <div
                key={index}
                className="employment-entry border p-2 rounded-lg shadow space-y-2"
              >
                <h4>Entry #{index + 1}</h4>
                <div className="flex items-center">
                  <label className="mr-2" htmlFor={`fromDate${index}`}>
                    From Date:
                  </label>
                  <input
                    type="text"
                    id={`fromDate${index}`}
                    value={entry.fromDate}
                    onChange={handleInputChange(
                      `employmentEntries[${index}].fromDate`
                    )}
                    className="border rounded p-1"
                    readOnly={isReadOnlyField(
                      `employmentEntries[${index}].fromDate`
                    )}
                  />
                </div>
                <div className="flex items-center">
                  <label className="mr-2" htmlFor={`toDate${index}`}>
                    To Date:
                  </label>
                  <input
                    type="text"
                    id={`toDate${index}`}
                    value={entry.toDate}
                    onChange={handleInputChange(
                      `employmentEntries[${index}].toDate`
                    )}
                    className="border rounded p-1"
                    readOnly={isReadOnlyField(
                      `employmentEntries[${index}].toDate`
                    )}
                  />
                  <label className="ml-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={entry.present}
                      onChange={handleCheckboxChange(
                        `employmentEntries[${index}].present`
                      )}
                      className="mr-2"
                      readOnly={isReadOnlyField(
                        `employmentEntries[${index}].present`
                      )}
                    />
                    Present
                  </label>
                  <label className="ml-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={entry.estimated}
                      onChange={handleCheckboxChange(
                        `employmentEntries[${index}].estimated`
                      )}
                      className="mr-2"
                      readOnly={isReadOnlyField(
                        `employmentEntries[${index}].estimated`
                      )}
                    />
                    Estimated
                  </label>
                </div>
                <div className="flex items-center">
                  <label className="mr-2" htmlFor={`agencyName${index}`}>
                    Agency Name:
                  </label>
                  <input
                    type="text"
                    id={`agencyName${index}`}
                    value={entry.agencyName}
                    onChange={handleInputChange(
                      `employmentEntries[${index}].agencyName`
                    )}
                    className="border rounded p-1"
                    readOnly={isReadOnlyField(
                      `employmentEntries[${index}].agencyName`
                    )}
                  />
                </div>
                <div className="flex items-center">
                  <label className="mr-2" htmlFor={`positionTitle${index}`}>
                    Position Title:
                  </label>
                  <input
                    type="text"
                    id={`positionTitle${index}`}
                    value={entry.positionTitle}
                    onChange={handleInputChange(
                      `employmentEntries[${index}].positionTitle`
                    )}
                    className="border rounded p-1"
                    readOnly={isReadOnlyField(
                      `employmentEntries[${index}].positionTitle`
                    )}
                  />
                </div>
                <div className="flex items-center">
                  <label className="mr-2" htmlFor={`street${index}`}>
                    Street:
                  </label>
                  <input
                    type="text"
                    id={`street${index}`}
                    value={entry.location.street}
                    onChange={handleInputChange(
                      `employmentEntries[${index}].location.street`
                    )}
                    className="border rounded p-1"
                    readOnly={isReadOnlyField(
                      `employmentEntries[${index}].location.street`
                    )}
                  />
                </div>
                <div className="flex items-center">
                  <label className="mr-2" htmlFor={`city${index}`}>
                    City:
                  </label>
                  <input
                    type="text"
                    id={`city${index}`}
                    value={entry.location.city}
                    onChange={handleInputChange(
                      `employmentEntries[${index}].location.city`
                    )}
                    className="border rounded p-1"
                    readOnly={isReadOnlyField(
                      `employmentEntries[${index}].location.city`
                    )}
                  />
                </div>
                <div className="flex items-center">
                  <label className="mr-2" htmlFor={`state${index}`}>
                    State:
                  </label>
                  <input
                    type="text"
                    id={`state${index}`}
                    value={entry.location.state}
                    onChange={handleInputChange(
                      `employmentEntries[${index}].location.state`
                    )}
                    className="border rounded p-1"
                    readOnly={isReadOnlyField(
                      `employmentEntries[${index}].location.state`
                    )}
                  />
                </div>
                <div className="flex items-center">
                  <label className="mr-2" htmlFor={`zipCode${index}`}>
                    Zip Code:
                  </label>
                  <input
                    type="text"
                    id={`zipCode${index}`}
                    value={entry.location.zipCode}
                    onChange={handleInputChange(
                      `employmentEntries[${index}].location.zipCode`
                    )}
                    className="border rounded p-1"
                    readOnly={isReadOnlyField(
                      `employmentEntries[${index}].location.zipCode`
                    )}
                  />
                </div>
                <div className="flex items-center">
                  <label className="mr-2" htmlFor={`country${index}`}>
                    Country:
                  </label>
                  <input
                    type="text"
                    id={`country${index}`}
                    value={entry.location.country}
                    onChange={handleInputChange(
                      `employmentEntries[${index}].location.country`
                    )}
                    className="border rounded p-1"
                    readOnly={isReadOnlyField(
                      `employmentEntries[${index}].location.country`
                    )}
                  />
                </div>
              </div>
            ))}

            {data.employmentEntries.length < 2 && (
              <button
                onClick={(event) => {
                  event.preventDefault();
                  addNewEntry();
                }}
                className="mt-2 p-2 bg-blue-500 text-white rounded-md shadow"
              >
                Add federal civilian employment Entry
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export { RenderSection13B };