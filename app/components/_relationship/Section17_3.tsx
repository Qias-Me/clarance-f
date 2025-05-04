import React from "react";
import { Section17_3 } from "api_v2/interfaces/relationshipInfo";

interface Section17_3Props {
  data: Section17_3;
  onInputChange: (path: string, value: any) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
}

const RenderSection17_3: React.FC<Section17_3Props> = ({
  data,
  onInputChange,
  path,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={data.hasCohabitant}
          onChange={(e) =>
            handleInputChange("hasCohabitant")({
              target: { value: e.target.checked },
            } as any)
          }
          readOnly={isReadOnlyField(`${path}.hasCohabitant`)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label className="ml-1 text-sm font-medium text-gray-700">Has Cohabitant</label>
      </div>
      {data.hasCohabitant && data.cohabitants.length > 0 && (
        <div className="space-y-4">
          {data.cohabitants.map((cohabitant, index) => (
            <div key={cohabitant._id} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={cohabitant.fullName.lastName}
                    onChange={handleInputChange(`cohabitants[${index}].fullName.lastName`)}
                    placeholder="Last Name"
                    readOnly={isReadOnlyField(`${path}.cohabitants[${index}].fullName.lastName`)}
                    className="p-2 border rounded w-full"
                  />
                  <input
                    type="text"
                    value={cohabitant.fullName.firstName}
                    onChange={handleInputChange(`cohabitants[${index}].fullName.firstName`)}
                    placeholder="First Name"
                    readOnly={isReadOnlyField(`${path}.cohabitants[${index}].fullName.firstName`)}
                    className="p-2 border rounded w-full"
                  />
                  <input
                    type="text"
                    value={cohabitant.fullName.middleName || ""}
                    onChange={handleInputChange(`cohabitants[${index}].fullName.middleName`)}
                    placeholder="Middle Name"
                    readOnly={isReadOnlyField(`${path}.cohabitants[${index}].fullName.middleName`)}
                    className="p-2 border rounded w-full"
                  />
                  <input
                    type="text"
                    value={cohabitant.fullName.suffix || ""}
                    onChange={handleInputChange(`cohabitants[${index}].fullName.suffix`)}
                    placeholder="Suffix"
                    readOnly={isReadOnlyField(`${path}.cohabitants[${index}].fullName.suffix`)}
                    className="p-2 border rounded w-full"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Place of Birth</label>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={cohabitant.placeOfBirth.city}
                    onChange={handleInputChange(`cohabitants[${index}].placeOfBirth.city`)}
                    placeholder="City"
                    readOnly={isReadOnlyField(`${path}.cohabitants[${index}].placeOfBirth.city`)}
                    className="p-2 border rounded w-full"
                  />
                  <input
                    type="text"
                    value={cohabitant.placeOfBirth.county || ""}
                    onChange={handleInputChange(`cohabitants[${index}].placeOfBirth.county`)}
                    placeholder="County"
                    readOnly={isReadOnlyField(`${path}.cohabitants[${index}].placeOfBirth.county`)}
                    className="p-2 border rounded w-full"
                  />
                  <input
                    type="text"
                    value={cohabitant.placeOfBirth.state || ""}
                    onChange={handleInputChange(`cohabitants[${index}].placeOfBirth.state`)}
                    placeholder="State"
                    readOnly={isReadOnlyField(`${path}.cohabitants[${index}].placeOfBirth.state`)}
                    className="p-2 border rounded w-full"
                  />
                  <input
                    type="text"
                    value={cohabitant.placeOfBirth.country}
                    onChange={handleInputChange(`cohabitants[${index}].placeOfBirth.country`)}
                    placeholder="Country"
                    readOnly={isReadOnlyField(`${path}.cohabitants[${index}].placeOfBirth.country`)}
                    className="p-2 border rounded w-full"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={cohabitant.dateOfBirth.date}
                    onChange={handleInputChange(`cohabitants[${index}].dateOfBirth.date`)}
                    placeholder="MM/DD/YYYY"
                    readOnly={isReadOnlyField(`${path}.cohabitants[${index}].dateOfBirth.date`)}
                    className="p-2 border rounded w-full"
                  />
                  <input
                    type="checkbox"
                    checked={cohabitant.dateOfBirth.estimated}
                    onChange={(e) =>
                      handleInputChange(`cohabitants[${index}].dateOfBirth.estimated`)({
                        target: { value: e.target.checked },
                      } as any)
                    }
                    readOnly={isReadOnlyField(`${path}.cohabitants[${index}].dateOfBirth.estimated`)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-1 text-sm font-medium text-gray-700">Estimated</label>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Citizenship</label>
                {cohabitant.citizenship.map((citizen, citizenIndex) => (
                  <div key={citizen._id} className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={citizen.country}
                      onChange={handleInputChange(
                        `cohabitants[${index}].citizenship[${citizenIndex}].country`
                      )}
                      placeholder="Country"
                      readOnly={isReadOnlyField(
                        `${path}.cohabitants[${index}].citizenship[${citizenIndex}].country`
                      )}
                      className="p-2 border rounded w-full"
                    />
                  </div>
                ))}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Documentation</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={cohabitant.documentation.type}
                    onChange={handleInputChange(`cohabitants[${index}].documentation.type`)}
                    placeholder="Type"
                    readOnly={isReadOnlyField(`${path}.cohabitants[${index}].documentation.type`)}
                    className="p-2 border rounded w-full"
                  />
                  <input
                    type="text"
                    value={cohabitant.documentation.documentNumber || ""}
                    onChange={handleInputChange(
                      `cohabitants[${index}].documentation.documentNumber`
                    )}
                    placeholder="Document Number"
                    readOnly={isReadOnlyField(
                      `${path}.cohabitants[${index}].documentation.documentNumber`
                    )}
                    className="p-2 border rounded w-full"
                  />
                  <input
                    type="text"
                    value={
                      cohabitant.documentation.documentExpirationDate?.date || ""
                    }
                    onChange={handleInputChange(
                      `cohabitants[${index}].documentation.documentExpirationDate.date`
                    )}
                    placeholder="Expiration Date (MM/DD/YYYY)"
                    readOnly={isReadOnlyField(
                      `${path}.cohabitants[${index}].documentation.documentExpirationDate.date`
                    )}
                    className="p-2 border rounded w-full"
                  />
                  <input
                    type="text"
                    value={cohabitant.documentation.otherExplanation || ""}
                    onChange={handleInputChange(
                      `cohabitants[${index}].documentation.otherExplanation`
                    )}
                    placeholder="Other Explanation"
                    readOnly={isReadOnlyField(
                      `${path}.cohabitants[${index}].documentation.otherExplanation`
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
                  value={cohabitant.usSocialSecurityNumber || ""}
                  onChange={handleInputChange(
                    `cohabitants[${index}].usSocialSecurityNumber`
                  )}
                  placeholder="SSN"
                  readOnly={isReadOnlyField(
                    `${path}.cohabitants[${index}].usSocialSecurityNumber`
                  )}
                  className="p-2 border rounded w-full"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Other Names
                </label>
                {cohabitant.otherNames.map((name, nameIndex) => (
                  <div key={name._id} className="grid grid-cols-8 gap-2 mb-2">
                    <input
                      type="text"
                      value={name.lastName}
                      onChange={handleInputChange(
                        `cohabitants[${index}].otherNames[${nameIndex}].lastName`
                      )}
                      placeholder="Last Name"
                      readOnly={isReadOnlyField(
                        `${path}.cohabitants[${index}].otherNames[${nameIndex}].lastName`
                      )}
                      className="p-2 border rounded col-span-2"
                    />
                    <input
                      type="text"
                      value={name.firstName}
                      onChange={handleInputChange(
                        `cohabitants[${index}].otherNames[${nameIndex}].firstName`
                      )}
                      placeholder="First Name"
                      readOnly={isReadOnlyField(
                        `${path}.cohabitants[${index}].otherNames[${nameIndex}].firstName`
                      )}
                      className="p-2 border rounded col-span-2"
                    />
                    <input
                      type="text"
                      value={name.middleName || ""}
                      onChange={handleInputChange(
                        `cohabitants[${index}].otherNames[${nameIndex}].middleName`
                      )}
                      placeholder="Middle Name"
                      readOnly={isReadOnlyField(
                        `${path}.cohabitants[${index}].otherNames[${nameIndex}].middleName`
                      )}
                      className="p-2 border rounded col-span-2"
                    />
                    <input
                      type="text"
                      value={name.suffix || ""}
                      onChange={handleInputChange(
                        `cohabitants[${index}].otherNames[${nameIndex}].suffix`
                      )}
                      placeholder="Suffix"
                      readOnly={isReadOnlyField(
                        `${path}.cohabitants[${index}].otherNames[${nameIndex}].suffix`
                      )}
                      className="p-2 border rounded col-span-2"
                    />
                    <div className="flex items-center col-span-2">
                      <input
                        type="checkbox"
                        checked={name.maidenName}
                        onChange={(e) =>
                          handleInputChange(
                            `cohabitants[${index}].otherNames[${nameIndex}].maidenName`
                          )({
                            target: { value: e.target.checked },
                          } as any)
                        }
                        readOnly={isReadOnlyField(
                          `${path}.cohabitants[${index}].otherNames[${nameIndex}].maidenName`
                        )}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-1 text-sm font-medium text-gray-700">Maiden Name</label>
                    </div>
                    <input
                      type="text"
                      value={name.fromDate.date}
                      onChange={handleInputChange(
                        `cohabitants[${index}].otherNames[${nameIndex}].fromDate.date`
                      )}
                      placeholder="From Date (MM/DD/YYYY)"
                      readOnly={isReadOnlyField(
                        `${path}.cohabitants[${index}].otherNames[${nameIndex}].fromDate.date`
                      )}
                      className="p-2 border rounded col-span-2"
                    />
                    <input
                      type="text"
                      value={name.toDate?.date || ""}
                      onChange={handleInputChange(
                        `cohabitants[${index}].otherNames[${nameIndex}].toDate.date`
                      )}
                      placeholder="To Date (MM/DD/YYYY)"
                      readOnly={isReadOnlyField(
                        `${path}.cohabitants[${index}].otherNames[${nameIndex}].toDate.date`
                      )}
                      className="p-2 border rounded col-span-2"
                    />
                  </div>
                ))}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cohabitation Start Date
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={cohabitant.cohabitationStartDate.date}
                    onChange={handleInputChange(
                      `cohabitants[${index}].cohabitationStartDate.date`
                    )}
                    placeholder="MM/DD/YYYY"
                    readOnly={isReadOnlyField(
                      `${path}.cohabitants[${index}].cohabitationStartDate.date`
                    )}
                    className="p-2 border rounded w-full"
                  />
                  <input
                    type="checkbox"
                    checked={cohabitant.cohabitationStartDate.estimated}
                    onChange={(e) =>
                      handleInputChange(
                        `cohabitants[${index}].cohabitationStartDate.estimated`
                      )({
                        target: { value: e.target.checked },
                      } as any)
                    }
                    readOnly={isReadOnlyField(
                      `${path}.cohabitants[${index}].cohabitationStartDate.estimated`
                    )}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-1 text-sm font-medium text-gray-700">Estimated</label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { RenderSection17_3 };
