import React from "react";
import { type Section17_2 } from "api/interfaces/sections/relationshipInfo";

interface SectionProps {
  data: Section17_2[];
  onInputChange: (path: string, value: any) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
}

const RenderSection17_2: React.FC<SectionProps> = ({
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
      {data.map((section, sectionIndex) => (
        <div key={section._id} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Marriage Status
            </label>
            <input
              type="text"
              value={section.marriageStatus}
              onChange={handleInputChange(`${sectionIndex}.marriageStatus`)}
              placeholder="Marriage Status"
              readOnly={isReadOnlyField(`${path}[${sectionIndex}].marriageStatus`)}
              className="p-2 border rounded w-full"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Date of Marriage
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={section.dateOfMarriage.date}
                onChange={handleInputChange(`${sectionIndex}.dateOfMarriage.date`)}
                placeholder="MM/DD/YYYY"
                readOnly={isReadOnlyField(`${path}[${sectionIndex}].dateOfMarriage.date`)}
                className="p-2 border rounded w-full"
              />
              <input
                type="checkbox"
                checked={section.dateOfMarriage.estimated}
                onChange={(e) =>
                  handleInputChange(`${sectionIndex}.dateOfMarriage.estimated`)({
                    target: { value: e.target.checked },
                  } as any)
                }
                readOnly={isReadOnlyField(`${path}[${sectionIndex}].dateOfMarriage.estimated`)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-1 text-sm font-medium text-gray-700">Estimated</label>
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Place of Marriage
            </label>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="text"
                value={section.placeOfMarriage.city}
                onChange={handleInputChange(`${sectionIndex}.placeOfMarriage.city`)}
                placeholder="City"
                readOnly={isReadOnlyField(`${path}[${sectionIndex}].placeOfMarriage.city`)}
                className="p-2 border rounded w-full"
              />
              <input
                type="text"
                value={section.placeOfMarriage.county || ""}
                onChange={handleInputChange(`${sectionIndex}.placeOfMarriage.county`)}
                placeholder="County"
                readOnly={isReadOnlyField(`${path}[${sectionIndex}].placeOfMarriage.county`)}
                className="p-2 border rounded w-full"
              />
              <input
                type="text"
                value={section.placeOfMarriage.state || ""}
                onChange={handleInputChange(`${sectionIndex}.placeOfMarriage.state`)}
                placeholder="State"
                readOnly={isReadOnlyField(`${path}[${sectionIndex}].placeOfMarriage.state`)}
                className="p-2 border rounded w-full"
              />
              <input
                type="text"
                value={section.placeOfMarriage.country}
                onChange={handleInputChange(`${sectionIndex}.placeOfMarriage.country`)}
                placeholder="Country"
                readOnly={isReadOnlyField(`${path}[${sectionIndex}].placeOfMarriage.country`)}
                className="p-2 border rounded w-full"
              />
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Spouse Name
            </label>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="text"
                value={section.spouseName.lastName}
                onChange={handleInputChange(`${sectionIndex}.spouseName.lastName`)}
                placeholder="Last Name"
                readOnly={isReadOnlyField(`${path}[${sectionIndex}].spouseName.lastName`)}
                className="p-2 border rounded w-full"
              />
              <input
                type="text"
                value={section.spouseName.firstName}
                onChange={handleInputChange(`${sectionIndex}.spouseName.firstName`)}
                placeholder="First Name"
                readOnly={isReadOnlyField(`${path}[${sectionIndex}].spouseName.firstName`)}
                className="p-2 border rounded w-full"
              />
              <input
                type="text"
                value={section.spouseName.middleName || ""}
                onChange={handleInputChange(`${sectionIndex}.spouseName.middleName`)}
                placeholder="Middle Name"
                readOnly={isReadOnlyField(`${path}[${sectionIndex}].spouseName.middleName`)}
                className="p-2 border rounded w-full"
              />
              <input
                type="text"
                value={section.spouseName.suffix || ""}
                onChange={handleInputChange(`${sectionIndex}.spouseName.suffix`)}
                placeholder="Suffix"
                readOnly={isReadOnlyField(`${path}[${sectionIndex}].spouseName.suffix`)}
                className="p-2 border rounded w-full"
              />
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Spouse Place of Birth
            </label>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="text"
                value={section.spousePlaceOfBirth.city}
                onChange={handleInputChange(`${sectionIndex}.spousePlaceOfBirth.city`)}
                placeholder="City"
                readOnly={isReadOnlyField(`${path}[${sectionIndex}].spousePlaceOfBirth.city`)}
                className="p-2 border rounded w-full"
              />
              <input
                type="text"
                value={section.spousePlaceOfBirth.county || ""}
                onChange={handleInputChange(`${sectionIndex}.spousePlaceOfBirth.county`)}
                placeholder="County"
                readOnly={isReadOnlyField(`${path}[${sectionIndex}].spousePlaceOfBirth.county`)}
                className="p-2 border rounded w-full"
              />
              <input
                type="text"
                value={section.spousePlaceOfBirth.state || ""}
                onChange={handleInputChange(`${sectionIndex}.spousePlaceOfBirth.state`)}
                placeholder="State"
                readOnly={isReadOnlyField(`${path}[${sectionIndex}].spousePlaceOfBirth.state`)}
                className="p-2 border rounded w-full"
              />
              <input
                type="text"
                value={section.spousePlaceOfBirth.country}
                onChange={handleInputChange(`${sectionIndex}.spousePlaceOfBirth.country`)}
                placeholder="Country"
                readOnly={isReadOnlyField(`${path}[${sectionIndex}].spousePlaceOfBirth.country`)}
                className="p-2 border rounded w-full"
              />
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Spouse Date of Birth
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={section.spouseDateOfBirth.date}
                onChange={handleInputChange(`${sectionIndex}.spouseDateOfBirth.date`)}
                placeholder="MM/DD/YYYY"
                readOnly={isReadOnlyField(`${path}[${sectionIndex}].spouseDateOfBirth.date`)}
                className="p-2 border rounded w-full"
              />
              <input
                type="checkbox"
                checked={section.spouseDateOfBirth.estimated}
                onChange={(e) =>
                  handleInputChange(`${sectionIndex}.spouseDateOfBirth.estimated`)({
                    target: { value: e.target.checked },
                  } as any)
                }
                readOnly={isReadOnlyField(`${path}[${sectionIndex}].spouseDateOfBirth.estimated`)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-1 text-sm font-medium text-gray-700">Estimated</label>
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Spouse Citizenship
            </label>
            {section.spouseCitizenship.map((citizen, index) => (
              <div key={citizen._id} className="grid grid-cols-4 gap-2">
                <input
                  type="text"
                  value={citizen.country}
                  onChange={handleInputChange(`${sectionIndex}.spouseCitizenship[${index}].country`)}
                  placeholder="Country"
                  readOnly={isReadOnlyField(`${path}[${sectionIndex}].spouseCitizenship[${index}].country`)}
                  className="p-2 border rounded w-full"
                />
              </div>
            ))}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Spouse Documentation
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={section.spouseDocumentation.type}
                onChange={handleInputChange(`${sectionIndex}.spouseDocumentation.type`)}
                placeholder="Type"
                readOnly={isReadOnlyField(`${path}[${sectionIndex}].spouseDocumentation.type`)}
                className="p-2 border rounded w-full"
              />
              <input
                type="text"
                value={section.spouseDocumentation.documentNumber || ""}
                onChange={handleInputChange(`${sectionIndex}.spouseDocumentation.documentNumber`)}
                placeholder="Document Number"
                readOnly={isReadOnlyField(`${path}[${sectionIndex}].spouseDocumentation.documentNumber`)}
                className="p-2 border rounded w-full"
              />
              <input
                type="text"
                value={section.spouseDocumentation.documentExpirationDate?.date || ""}
                onChange={handleInputChange(`${sectionIndex}.spouseDocumentation.documentExpirationDate.date`)}
                placeholder="Expiration Date (MM/DD/YYYY)"
                readOnly={isReadOnlyField(`${path}[${sectionIndex}].spouseDocumentation.documentExpirationDate.date`)}
                className="p-2 border rounded w-full"
              />
              <input
                type="text"
                value={section.spouseDocumentation.otherExplanation || ""}
                onChange={handleInputChange(`${sectionIndex}.spouseDocumentation.otherExplanation`)}
                placeholder="Other Explanation"
                readOnly={isReadOnlyField(`${path}[${sectionIndex}].spouseDocumentation.otherExplanation`)}
                className="p-2 border rounded w-full"
              />
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Spouse US Social Security Number
            </label>
            <input
              type="text"
              value={section.spouseUsSocialSecurityNumber || ""}
              onChange={handleInputChange(`${sectionIndex}.spouseUsSocialSecurityNumber`)}
              placeholder="SSN"
              readOnly={isReadOnlyField(`${path}[${sectionIndex}].spouseUsSocialSecurityNumber`)}
              className="p-2 border rounded w-full"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Spouse Other Names
            </label>
            {section.spouseOtherNames.map((name, nameIndex) => (
              <div key={name._id} className="grid grid-cols-8 gap-2 mb-2">
                <input
                  type="text"
                  value={name.lastName}
                  onChange={handleInputChange(`${sectionIndex}.spouseOtherNames[${nameIndex}].lastName`)}
                  placeholder="Last Name"
                  readOnly={isReadOnlyField(`${path}[${sectionIndex}].spouseOtherNames[${nameIndex}].lastName`)}
                  className="p-2 border rounded col-span-2"
                />
                <input
                  type="text"
                  value={name.firstName}
                  onChange={handleInputChange(`${sectionIndex}.spouseOtherNames[${nameIndex}].firstName`)}
                  placeholder="First Name"
                  readOnly={isReadOnlyField(`${path}[${sectionIndex}].spouseOtherNames[${nameIndex}].firstName`)}
                  className="p-2 border rounded col-span-2"
                />
                <input
                  type="text"
                  value={name.middleName || ""}
                  onChange={handleInputChange(`${sectionIndex}.spouseOtherNames[${nameIndex}].middleName`)}
                  placeholder="Middle Name"
                  readOnly={isReadOnlyField(`${path}[${sectionIndex}].spouseOtherNames[${nameIndex}].middleName`)}
                  className="p-2 border rounded col-span-2"
                />
                <input
                  type="text"
                  value={name.suffix || ""}
                  onChange={handleInputChange(`${sectionIndex}.spouseOtherNames[${nameIndex}].suffix`)}
                  placeholder="Suffix"
                  readOnly={isReadOnlyField(`${path}[${sectionIndex}].spouseOtherNames[${nameIndex}].suffix`)}
                  className="p-2 border rounded col-span-2"
                />
                <div className="flex items-center col-span-2">
                  <input
                    type="checkbox"
                    checked={name.maidenName}
                    onChange={(e) =>
                      handleInputChange(`${sectionIndex}.spouseOtherNames[${nameIndex}].maidenName`)({
                        target: { value: e.target.checked },
                      } as any)
                    }
                    readOnly={isReadOnlyField(`${path}[${sectionIndex}].spouseOtherNames[${nameIndex}].maidenName`)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-1 text-sm font-medium text-gray-700">Maiden Name</label>
                </div>
                <input
                  type="text"
                  value={name.fromDate.date}
                  onChange={handleInputChange(`${sectionIndex}.spouseOtherNames[${nameIndex}].fromDate.date`)}
                  placeholder="From Date (MM/DD/YYYY)"
                  readOnly={isReadOnlyField(`${path}[${sectionIndex}].spouseOtherNames[${nameIndex}].fromDate.date`)}
                  className="p-2 border rounded col-span-2"
                />
                <input
                  type="text"
                  value={name.toDate?.date || ""}
                  onChange={handleInputChange(`${sectionIndex}.spouseOtherNames[${nameIndex}].toDate.date`)}
                  placeholder="To Date (MM/DD/YYYY)"
                  readOnly={isReadOnlyField(`${path}[${sectionIndex}].spouseOtherNames[${nameIndex}].toDate.date`)}
                  className="p-2 border rounded col-span-2"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export { RenderSection17_2 };
