import { type Section17_1 } from "api/interfaces/sections/relationshipInfo";
import React from "react";

interface Section17_1Props {
  data: Section17_1;
  onInputChange: (path: string, value: any) => void;
  path: string;
  getDefaultNewItem: (itemType: string) => any;
  onAddEntry: (path: string, newItem: any) => void;
  isReadOnlyField: (fieldName: string) => boolean;
  onRemoveEntry: (path: string, index: number) => void;
}

const RenderSection17_1: React.FC<Section17_1Props> = ({
  data,
  onInputChange,
  getDefaultNewItem,
  path,
  onAddEntry,
  onRemoveEntry,
  isReadOnlyField,
}) => {
  const handleInputChange =
    (fieldPath: string) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      onInputChange(`${path}.${fieldPath}`, event.target.value);
    };

  const handleAddName = () => {
    console.log({ path: path });
    const newName = getDefaultNewItem(
      "relationshipInfo.section17_1.otherNames"
    );
    onAddEntry(`${path}.otherNames`, newName);
  };

  const handleRemoveName = (index:number) => {
    onRemoveEntry(`${path}.otherNames`, index);
  };

  console.log(data, "data");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <input
              type="text"
              value={data.fullName.lastName}
              onChange={handleInputChange("fullName.lastName")}
              placeholder="Last Name"
              readOnly={isReadOnlyField(`${path}.fullName.lastName`)}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={data.fullName.firstName}
              onChange={handleInputChange("fullName.firstName")}
              placeholder="First Name"
              readOnly={isReadOnlyField(`${path}.fullName.firstName`)}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={data.fullName.middleName || ""}
              onChange={handleInputChange("fullName.middleName")}
              placeholder="Middle Name"
              readOnly={isReadOnlyField(`${path}.fullName.middleName`)}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={data.fullName.suffix || ""}
              onChange={handleInputChange("fullName.suffix")}
              placeholder="Suffix"
              readOnly={isReadOnlyField(`${path}.fullName.suffix`)}
              className="p-2 border rounded w-full"
            />
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Place of Birth
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <input
              type="text"
              value={data.placeOfBirth.city}
              onChange={handleInputChange("placeOfBirth.city")}
              placeholder="City"
              readOnly={isReadOnlyField(`${path}.placeOfBirth.city`)}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={data.placeOfBirth.county || ""}
              onChange={handleInputChange("placeOfBirth.county")}
              placeholder="County"
              readOnly={isReadOnlyField(`${path}.placeOfBirth.county`)}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={data.placeOfBirth.state || ""}
              onChange={handleInputChange("placeOfBirth.state")}
              placeholder="State"
              readOnly={isReadOnlyField(`${path}.placeOfBirth.state`)}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={data.placeOfBirth.country}
              onChange={handleInputChange("placeOfBirth.country")}
              placeholder="Country"
              readOnly={isReadOnlyField(`${path}.placeOfBirth.country`)}
              className="p-2 border rounded w-full"
            />
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Date of Birth
          </label>
          <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
            <input
              type="text"
              value={data.dateOfBirth.date}
              onChange={handleInputChange("dateOfBirth.date")}
              placeholder="MM/DD/YYYY"
              readOnly={isReadOnlyField(`${path}.dateOfBirth.date`)}
              className="p-2 border rounded w-full"
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={data.dateOfBirth.estimated}
                onChange={(e) =>
                  handleInputChange("dateOfBirth.estimated")({
                    target: { value: e.target.checked },
                  } as any)
                }
                readOnly={isReadOnlyField(`${path}.dateOfBirth.estimated`)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Estimated
              </label>
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Citizenship
          </label>
          {data.citizenship.map((citizen, index) => {
            return (
              <div key={citizen._id} className="flex space-x-2">
                <input
                  type="text"
                  value={citizen.country}
                  onChange={handleInputChange(`citizenship[${index}].country`)}
                  placeholder="Country"
                  readOnly={isReadOnlyField(
                    `${path}.citizenship[${index}].country`
                  )}
                  className="p-2 border rounded w-full"
                />
              </div>
            );
          })}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Documentation
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={data.documentation.type}
              onChange={handleInputChange("documentation.type")}
              placeholder="Type"
              readOnly={isReadOnlyField(`${path}.documentation.type`)}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={data.documentation.documentNumber || ""}
              onChange={handleInputChange("documentation.documentNumber")}
              placeholder="Document Number"
              readOnly={isReadOnlyField(`${path}.documentation.documentNumber`)}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={data.documentation.documentExpirationDate?.date || ""}
              onChange={handleInputChange(
                "documentation.documentExpirationDate.date"
              )}
              placeholder="Expiration Date (MM/DD/YYYY)"
              readOnly={isReadOnlyField(
                `${path}.documentation.documentExpirationDate.date`
              )}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={data.documentation.otherExplanation || ""}
              onChange={handleInputChange("documentation.otherExplanation")}
              placeholder="Other Explanation"
              readOnly={isReadOnlyField(
                `${path}.documentation.otherExplanation`
              )}
              className="p-2 border rounded w-full"
            />
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            US Social Security Number
          </label>
          <input
            type="text"
            value={data.usSocialSecurityNumber || ""}
            onChange={handleInputChange("usSocialSecurityNumber")}
            placeholder="SSN"
            readOnly={isReadOnlyField(`${path}.usSocialSecurityNumber`)}
            className="p-2 border rounded w-full"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Other Names
          </label>
          {data.otherNames.map((name, index) => {
            return (
              <div
                key={name._id}
                className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-2"
              >
                <input
                  type="text"
                  value={name.lastName}
                  onChange={handleInputChange(`otherNames[${index}].lastName`)}
                  placeholder="Last Name"
                  readOnly={isReadOnlyField(
                    `${path}.otherNames[${index}].lastName`
                  )}
                  className="p-2 border rounded w-full"
                />
                <input
                  type="text"
                  value={name.firstName}
                  onChange={handleInputChange(`otherNames[${index}].firstName`)}
                  placeholder="First Name"
                  readOnly={isReadOnlyField(
                    `${path}.otherNames[${index}].firstName`
                  )}
                  className="p-2 border rounded w-full"
                />
                <input
                  type="text"
                  value={name.middleName || ""}
                  onChange={handleInputChange(
                    `otherNames[${index}].middleName`
                  )}
                  placeholder="Middle Name"
                  readOnly={isReadOnlyField(
                    `${path}.otherNames[${index}].middleName`
                  )}
                  className="p-2 border rounded w-full"
                />
                <input
                  type="text"
                  value={name.suffix || ""}
                  onChange={handleInputChange(`otherNames[${index}].suffix`)}
                  placeholder="Suffix"
                  readOnly={isReadOnlyField(
                    `${path}.otherNames[${index}].suffix`
                  )}
                  className="p-2 border rounded w-full"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={name.maidenName}
                    onChange={(e) =>
                      handleInputChange(`otherNames[${index}].maidenName`)({
                        target: { value: e.target.checked },
                      } as any)
                    }
                    readOnly={isReadOnlyField(
                      `${path}.otherNames[${index}].maidenName`
                    )}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    Maiden Name
                  </label>
                </div>
                <input
                  type="text"
                  value={name.fromDate.date}
                  onChange={handleInputChange(
                    `otherNames[${index}].fromDate.date`
                  )}
                  placeholder="From Date (MM/DD/YYYY)"
                  readOnly={isReadOnlyField(
                    `${path}.otherNames[${index}].fromDate.date`
                  )}
                  className="p-2 border rounded w-full"
                />
                <input
                  type="text"
                  value={name.toDate?.date || ""}
                  onChange={handleInputChange(
                    `otherNames[${index}].toDate.date`
                  )}
                  placeholder="To Date (MM/DD/YYYY)"
                  readOnly={isReadOnlyField(
                    `${path}.otherNames[${index}].toDate.date`
                  )}
                  className="p-2 border rounded w-full"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveName(index)}
                  className="col-span-2 p-2 border rounded text-red-600"
                >
                  Remove
                </button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={handleAddName}
            className="p-2 border rounded bg-blue-500 text-white"
          >
            Add Name
          </button>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Relationship Status
          </label>
          <select
            value={data.relationshipStatus || ""}
            onChange={handleInputChange("relationshipStatus")}
            readOnly={isReadOnlyField(`${path}.relationshipStatus`)}
            className="p-2 border rounded w-full"
          >
            <option value="">Select Status</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
            <option value="Annulled">Annulled</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Status Details
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <input
              type="text"
              value={data.statusDetails?.location.city || ""}
              onChange={handleInputChange("statusDetails.location.city")}
              placeholder="City"
              readOnly={isReadOnlyField(`${path}.statusDetails.location.city`)}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={data.statusDetails?.location.county || ""}
              onChange={handleInputChange("statusDetails.location.county")}
              placeholder="County"
              readOnly={isReadOnlyField(
                `${path}.statusDetails.location.county`
              )}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={data.statusDetails?.location.state || ""}
              onChange={handleInputChange("statusDetails.location.state")}
              placeholder="State"
              readOnly={isReadOnlyField(`${path}.statusDetails.location.state`)}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={data.statusDetails?.location.country || ""}
              onChange={handleInputChange("statusDetails.location.country")}
              placeholder="Country"
              readOnly={isReadOnlyField(
                `${path}.statusDetails.location.country`
              )}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={data.statusDetails?.date.date || ""}
              onChange={handleInputChange("statusDetails.date.date")}
              placeholder="Date (MM/DD/YYYY)"
              readOnly={isReadOnlyField(`${path}.statusDetails.date.date`)}
              className="p-2 border rounded w-full"
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={data.statusDetails?.date.estimated || false}
                onChange={(e) =>
                  handleInputChange("statusDetails.date.estimated")({
                    target: { value: e.target.checked },
                  } as any)
                }
                readOnly={isReadOnlyField(
                  `${path}.statusDetails.date.estimated`
                )}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Estimated
              </label>
            </div>
            <input
              type="text"
              value={data.statusDetails?.recordLocation.city || ""}
              onChange={handleInputChange("statusDetails.recordLocation.city")}
              placeholder="Record Location City"
              readOnly={isReadOnlyField(
                `${path}.statusDetails.recordLocation.city`
              )}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={data.statusDetails?.recordLocation.county || ""}
              onChange={handleInputChange(
                "statusDetails.recordLocation.county"
              )}
              placeholder="Record Location County"
              readOnly={isReadOnlyField(
                `${path}.statusDetails.recordLocation.county`
              )}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={data.statusDetails?.recordLocation.state || ""}
              onChange={handleInputChange("statusDetails.recordLocation.state")}
              placeholder="Record Location State"
              readOnly={isReadOnlyField(
                `${path}.statusDetails.recordLocation.state`
              )}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={data.statusDetails?.recordLocation.country || ""}
              onChange={handleInputChange(
                "statusDetails.recordLocation.country"
              )}
              placeholder="Record Location Country"
              readOnly={isReadOnlyField(
                `${path}.statusDetails.recordLocation.country`
              )}
              className="p-2 border rounded w-full"
            />
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <input
              type="checkbox"
              checked={data.statusDetails?.deceased || false}
              onChange={(e) =>
                handleInputChange("statusDetails.deceased")({
                  target: { value: e.target.checked },
                } as any)
              }
              readOnly={isReadOnlyField(`${path}.statusDetails.deceased`)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Deceased
            </label>
          </div>
          {data.statusDetails?.deceased && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Last Known Address
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <input
                  type="text"
                  value={data.statusDetails.lastKnownAddress?.street || ""}
                  onChange={handleInputChange(
                    "statusDetails.lastKnownAddress.street"
                  )}
                  placeholder="Street"
                  readOnly={isReadOnlyField(
                    `${path}.statusDetails.lastKnownAddress.street`
                  )}
                  className="p-2 border rounded w-full"
                />
                <input
                  type="text"
                  value={data.statusDetails.lastKnownAddress?.city || ""}
                  onChange={handleInputChange(
                    "statusDetails.lastKnownAddress.city"
                  )}
                  placeholder="City"
                  readOnly={isReadOnlyField(
                    `${path}.statusDetails.lastKnownAddress.city`
                  )}
                  className="p-2 border rounded w-full"
                />
                <input
                  type="text"
                  value={data.statusDetails.lastKnownAddress?.state || ""}
                  onChange={handleInputChange(
                    "statusDetails.lastKnownAddress.state"
                  )}
                  placeholder="State"
                  readOnly={isReadOnlyField(
                    `${path}.statusDetails.lastKnownAddress.state`
                  )}
                  className="p-2 border rounded w-full"
                />
                <input
                  type="text"
                  value={data.statusDetails.lastKnownAddress?.zipCode || ""}
                  onChange={handleInputChange(
                    "statusDetails.lastKnownAddress.zipCode"
                  )}
                  placeholder="Zip Code"
                  readOnly={isReadOnlyField(
                    `${path}.statusDetails.lastKnownAddress.zipCode`
                  )}
                  className="p-2 border rounded w-full"
                />
                <input
                  type="text"
                  value={data.statusDetails.lastKnownAddress?.country || ""}
                  onChange={handleInputChange(
                    "statusDetails.lastKnownAddress.country"
                  )}
                  placeholder="Country"
                  readOnly={isReadOnlyField(
                    `${path}.statusDetails.lastKnownAddress.country`
                  )}
                  className="p-2 border rounded w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { RenderSection17_1 };
