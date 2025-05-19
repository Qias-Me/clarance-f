// RenderSection13B.tsx
import React from "react";
import { type Section13B, type EmploymentEntry } from "api/interfaces/sections/employmentInfo";

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
  const handleInputChange = (fieldPath: string) => 
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onInputChange(`${path}.${fieldPath}`, event.target.value);
    };

  const addNewEntry = () => {
    const newItem = getDefaultNewItem(
      `employmentInfo.section13B.employmentEntries`
    );
    onAddEntry(`${path}.employmentEntries`, newItem);
  };

  const renderEmploymentEntry = (entry: EmploymentEntry, index: number) => {
    return (
      <div
        key={index}
        className="employment-entry border p-4 rounded-lg bg-gray-50 shadow-sm space-y-4 mb-4"
      >
        <div className="flex justify-between items-center border-b pb-2">
          <h4 className="text-md font-medium">Federal Employment Entry #{index + 1}</h4>
          {/* Optional: Add delete button here if needed */}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block font-medium text-sm" htmlFor={`fromDate${index}`}>
              From Date:
            </label>
            <div className="flex items-center">
              <input
                type="text"
                id={`fromDate${index}`}
                value={entry.fromDate?.value || ""}
                onChange={handleInputChange(
                  `employmentEntries[${index}].fromDate`
                )}
                className="border rounded p-2 w-full"
                placeholder="MM/DD/YYYY"
                readOnly={isReadOnlyField(
                  `employmentEntries[${index}].fromDate`
                )}
              />
            </div>
            <p className="text-xs text-gray-500">Format: MM/DD/YYYY</p>
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium text-sm" htmlFor={`toDate${index}`}>
              To Date:
            </label>
            <div className="flex items-center flex-wrap">
              <input
                type="text"
                id={`toDate${index}`}
                value={entry.toDate?.value || ""}
                onChange={handleInputChange(
                  `employmentEntries[${index}].toDate`
                )}
                className="border rounded p-2 w-full"
                placeholder="MM/DD/YYYY"
                readOnly={isReadOnlyField(
                  `employmentEntries[${index}].toDate`
                )}
              />
            </div>
            <div className="flex space-x-4 mt-1">
              <label className="inline-flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={entry.present?.value === "Yes"}
                  onChange={(e) =>
                    onInputChange(
                      `${path}.employmentEntries[${index}].present`,
                      e.target.checked ? "Yes" : "No"
                    )
                  }
                  className="mr-2"
                  readOnly={isReadOnlyField(
                    `employmentEntries[${index}].present`
                  )}
                />
                Present
              </label>
              <label className="inline-flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={entry.estimated?.value === "Yes"}
                  onChange={(e) =>
                    onInputChange(
                      `${path}.employmentEntries[${index}].estimated`,
                      e.target.checked ? "Yes" : "No"
                    )
                  }
                  className="mr-2"
                  readOnly={isReadOnlyField(
                    `employmentEntries[${index}].estimated`
                  )}
                />
                Estimated
              </label>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block font-medium text-sm" htmlFor={`agencyName${index}`}>
            Agency Name:
          </label>
          <input
            type="text"
            id={`agencyName${index}`}
            value={entry.agencyName?.value || ""}
            onChange={handleInputChange(
              `employmentEntries[${index}].agencyName`
            )}
            className="border rounded p-2 w-full"
            placeholder="Federal agency name"
            readOnly={isReadOnlyField(
              `employmentEntries[${index}].agencyName`
            )}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block font-medium text-sm" htmlFor={`positionTitle${index}`}>
            Position Title:
          </label>
          <input
            type="text"
            id={`positionTitle${index}`}
            value={entry.positionTitle?.value || ""}
            onChange={handleInputChange(
              `employmentEntries[${index}].positionTitle`
            )}
            className="border rounded p-2 w-full"
            placeholder="Your job title"
            readOnly={isReadOnlyField(
              `employmentEntries[${index}].positionTitle`
            )}
          />
        </div>
        
        <div className="border-t pt-3 mt-3">
          <h5 className="font-medium text-sm mb-3">Agency Location</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm" htmlFor={`street${index}`}>
                Street:
              </label>
              <input
                type="text"
                id={`street${index}`}
                value={entry.location?.street?.value || ""}
                onChange={handleInputChange(
                  `employmentEntries[${index}].location.street`
                )}
                className="border rounded p-2 w-full"
                placeholder="Street address"
                readOnly={isReadOnlyField(
                  `employmentEntries[${index}].location.street`
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm" htmlFor={`city${index}`}>
                City:
              </label>
              <input
                type="text"
                id={`city${index}`}
                value={entry.location?.city?.value || ""}
                onChange={handleInputChange(
                  `employmentEntries[${index}].location.city`
                )}
                className="border rounded p-2 w-full"
                placeholder="City"
                readOnly={isReadOnlyField(
                  `employmentEntries[${index}].location.city`
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm" htmlFor={`state${index}`}>
                State:
              </label>
              <input
                type="text"
                id={`state${index}`}
                value={entry.location?.state?.value || ""}
                onChange={handleInputChange(
                  `employmentEntries[${index}].location.state`
                )}
                className="border rounded p-2 w-full"
                placeholder="State"
                readOnly={isReadOnlyField(
                  `employmentEntries[${index}].location.state`
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm" htmlFor={`zipCode${index}`}>
                Zip Code:
              </label>
              <input
                type="text"
                id={`zipCode${index}`}
                value={entry.location?.zipCode?.value || ""}
                onChange={handleInputChange(
                  `employmentEntries[${index}].location.zipCode`
                )}
                className="border rounded p-2 w-full"
                placeholder="Zip code"
                readOnly={isReadOnlyField(
                  `employmentEntries[${index}].location.zipCode`
                )}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm" htmlFor={`country${index}`}>
                Country:
              </label>
              <input
                type="text"
                id={`country${index}`}
                value={entry.location?.country?.value || ""}
                onChange={handleInputChange(
                  `employmentEntries[${index}].location.country`
                )}
                className="border rounded p-2 w-full"
                placeholder="Country"
                readOnly={isReadOnlyField(
                  `employmentEntries[${index}].location.country`
                )}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">
        Section 13B - Employment Activities - Former Federal Service
      </h3>

      <div className="space-y-3">
        <label className="block font-medium">
          Do you have former federal civilian employment, excluding military
          service, NOT indicated previously, to report?
        </label>
        <div className="mt-2 space-x-6">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="formerFederalEmployment"
              value="YES "
              checked={data.hasFormerFederalEmployment?.value === "YES "}
              onChange={() => onInputChange(`${path}.hasFormerFederalEmployment`, "YES ")}
              className="mr-2"
            />
            <span>YES</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="formerFederalEmployment"
              value="NO (If NO, proceed to Section 13C)"
              checked={data.hasFormerFederalEmployment?.value === "NO (If NO, proceed to Section 13C)"}
              onChange={() => onInputChange(`${path}.hasFormerFederalEmployment`, "NO (If NO, proceed to Section 13C)")}
              className="mr-2"
            />
            <span>NO</span> <span className="text-sm text-gray-600">(If NO, proceed to Section 13C)</span>
          </label>
        </div>
      </div>

      {data.hasFormerFederalEmployment?.value === "YES " && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-600">
            List all of your federal civilian employment, excluding military service, 
            that was not included in previous sections.
          </p>
          
          {Array.isArray(data.employmentEntries) && data.employmentEntries.map((entry, index) => 
            renderEmploymentEntry(entry, index)
          )}

          {(!Array.isArray(data.employmentEntries) || data.employmentEntries.length === 0) && (
            <div className="bg-yellow-50 border border-yellow-100 p-3 rounded text-sm text-yellow-800">
              No employment entries added yet. Click the button below to add your first federal employment entry.
            </div>
          )}

          {Array.isArray(data.employmentEntries) && data.employmentEntries.length < 2 && (
            <div className="mt-4 text-center">
              <button
                onClick={(event) => {
                  event.preventDefault();
                  addNewEntry();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 transition-colors"
              >
                {data.employmentEntries?.length === 0 ? 
                  "Add Federal Employment Entry" : 
                  "Add Another Federal Employment Entry"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { RenderSection13B };