import {
  type CitizenshipDocumentType,
  type Section18_3Details,
} from "api/interfaces/sections/relativesInfo";
import React from "react";

interface RenderSection18_3Props {
  data: Section18_3Details;
  onInputChange: (path: string, value: any) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
}

const RenderSection18_3: React.FC<RenderSection18_3Props> = ({
  data,
  onInputChange,
  path,
  isReadOnlyField,
}) => {
  const handleInputChange =
    (fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      console.log(path, fieldPath, event.target.value, "inComponent");
      onInputChange(`${path}.${fieldPath}`, event.target.value);
    };

  const citizenshipDocumentTypes: CitizenshipDocumentType[] = [
    "FS240or545",
    "DS1350",
    "AlienRegistrationNaturalized",
    "PermanentResidentCardI551Naturalized",
    "CertificateOfNaturalizationN550orN570",
    "AlienRegistrationDerived",
    "PermanentResidentCardI551Derived",
    "CertificateOfCitizenshipN560orN561",
    "Other",
  ];

  return (
    <div className="space-y-6">
      {data.citizenshipDocuments.map((doc, index) => (
        <div key={index} className=" p-4 rounded-lg shadow-md space-y-4">
          <div className="space-y-1">
            <label htmlFor={`citizenshipDocumentType-${index}`} className="block text-sm font-medium text-gray-700">
              Citizenship Document Type:
            </label>
            <select
              id={`citizenshipDocumentType-${index}`}
              value={doc.type}
              onChange={handleInputChange(`citizenshipDocuments[${index}].type`)}
              disabled={isReadOnlyField(`${path}.citizenshipDocuments[${index}].type`)}
              className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {citizenshipDocumentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor={`documentNumber-${index}`} className="block text-sm font-medium text-gray-700">
              Document Number:
            </label>
            <input
              type="text"
              id={`documentNumber-${index}`}
              value={doc.documentNumber}
              onChange={handleInputChange(`citizenshipDocuments[${index}].documentNumber`)}
              disabled={isReadOnlyField(`${path}.citizenshipDocuments[${index}].documentNumber`)}
              className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      ))}
      {data.citizenshipDocuments.some(
        (doc) => doc.type === "CertificateOfNaturalizationN550orN570"
      ) && data.courtDetails && (
        <div className=" p-4 rounded-lg shadow-md space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Court Details:</h4>
          <div className="space-y-1">
            <label htmlFor="courtDetails-street" className="block text-sm font-medium text-gray-700">
              Street:
            </label>
            <input
              type="text"
              id="courtDetails-street"
              value={data.courtDetails.street}
              onChange={handleInputChange("courtDetails.street")}
              disabled={isReadOnlyField(`${path}.courtDetails.street`)}
              className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="courtDetails-city" className="block text-sm font-medium text-gray-700">
              City:
            </label>
            <input
              type="text"
              id="courtDetails-city"
              value={data.courtDetails.city}
              onChange={handleInputChange("courtDetails.city")}
              disabled={isReadOnlyField(`${path}.courtDetails.city`)}
              className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="courtDetails-state" className="block text-sm font-medium text-gray-700">
              State:
            </label>
            <input
              type="text"
              id="courtDetails-state"
              value={data.courtDetails.state}
              onChange={handleInputChange("courtDetails.state")}
              disabled={isReadOnlyField(`${path}.courtDetails.state`)}
              className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="courtDetails-zipCode" className="block text-sm font-medium text-gray-700">
              Zip Code:
            </label>
            <input
              type="text"
              id="courtDetails-zipCode"
              value={data.courtDetails.zipCode}
              onChange={handleInputChange("courtDetails.zipCode")}
              disabled={isReadOnlyField(`${path}.courtDetails.zipCode`)}
              className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export { RenderSection18_3 };
