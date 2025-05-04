import {
 type  Section18_4Details,
 type  ContactMethod,
 type  USDocumentationType,
} from "api/interfaces/sections/relativesInfo";
import React from "react";

interface Section18_4Props {
  data: Section18_4Details;
  onInputChange: (path: string, value: any) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
}

const RenderSection18_4: React.FC<Section18_4Props> = ({
  data,
  onInputChange,
  path,
  isReadOnlyField,
}) => {
  const handleInputChange =
    (fieldPath: string) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLInputElement
      >
    ) => {
      console.log(path, fieldPath, event.target.value, "inComponent");
      onInputChange(
        `${path}.${fieldPath}`,
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value
      );
    };

  const usDocumentationTypes: USDocumentationType[] = [
    "I551PermanentResident",
    "I766EmploymentAuthorization",
    "I94ArrivalDepartureRecord",
    "I20CertificateEligibilityF1Student",
    "DS2019CertificateEligibilityJ1Status",
    "Other",
  ];

  const contactMethods: ContactMethod[] = [
    "InPerson",
    "Telephone",
    "WrittenCorrespondence",
    "Electronic",
    "Other",
  ];

  console.log(data, "data in ResidenceInfoo");

  return (
    <div className="space-y-6">
      <div className=" p-4 rounded-lg shadow-md space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            US Documentation:
          </label>
          {data.usDocumentation.map((doc, index) => (
            <div key={index} className="space-y-1">
              <select
                value={doc.type}
                onChange={handleInputChange(`usDocumentation[${index}].type`)}
                disabled={isReadOnlyField(
                  `${path}.usDocumentation[${index}].type`
                )}
                className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {usDocumentationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <label
            htmlFor="documentNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Document Number:
          </label>
          <input
            type="text"
            id="documentNumber"
            value={data.documentNumber}
            onChange={handleInputChange("documentNumber")}
            disabled={isReadOnlyField(`${path}.documentNumber`)}
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="documentExpirationDate"
            className="block text-sm font-medium text-gray-700"
          >
            Document Expiration Date:
          </label>
          <input
            type="text"
            id="documentExpirationDate"
            value={data.documentExpirationDate}
            onChange={handleInputChange("documentExpirationDate")}
            disabled={isReadOnlyField(`${path}.documentExpirationDate`)}
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="firstContactDate"
            className="block text-sm font-medium text-gray-700"
          >
            First Contact Date:
          </label>
          <input
            type="text"
            id="firstContactDate"
            value={data.firstContactDate}
            onChange={handleInputChange("firstContactDate")}
            disabled={isReadOnlyField(`${path}.firstContactDate`)}
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="lastContactDate"
            className="block text-sm font-medium text-gray-700"
          >
            Last Contact Date:
          </label>
          <input
            type="text"
            id="lastContactDate"
            value={data.lastContactDate || ""}
            onChange={handleInputChange("lastContactDate")}
            disabled={isReadOnlyField(`${path}.lastContactDate`)}
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Contact Methods:
          </label>
          {contactMethods.map((method) => (
            <div key={method} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`contactMethod-${method}`}
                value={method}
                checked={data.contactMethods.includes(method)}
                onChange={(event) => {
                  const updatedMethods = event.target.checked
                    ? [...data.contactMethods, method]
                    : data.contactMethods.filter((m) => m !== method);
                  onInputChange(`${path}.contactMethods`, updatedMethods);
                }}
                disabled={isReadOnlyField(`${path}.contactMethods`)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label
                htmlFor={`contactMethod-${method}`}
                className="block text-sm font-medium text-gray-700"
              >
                {method}
              </label>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <label
            htmlFor="contactFrequency-frequency"
            className="block text-sm font-medium text-gray-700"
          >
            Contact Frequency:
          </label>
          <select
            id="contactFrequency-frequency"
            value={data.contactFrequency.frequency}
            onChange={handleInputChange("contactFrequency.frequency")}
            disabled={isReadOnlyField(`${path}.contactFrequency.frequency`)}
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Annually">Annually</option>
            <option value="Other">Other</option>
          </select>
          {data.contactFrequency.frequency === "Other" && (
            <div className="space-y-1">
              <label
                htmlFor="contactFrequency-explanation"
                className="block text-sm font-medium text-gray-700"
              >
                Explanation:
              </label>
              <input
                type="text"
                id="contactFrequency-explanation"
                value={data.contactFrequency.explanation || ""}
                onChange={handleInputChange("contactFrequency.explanation")}
                disabled={isReadOnlyField(
                  `${path}.contactFrequency.explanation`
                )}
                className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Current Employer:
          </label>
          {data.currentEmployer && (
            <>
              <div className="space-y-1">
                <label
                  htmlFor="currentEmployer-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name:
                </label>
                <input
                  type="text"
                  id="currentEmployer-name"
                  value={data.currentEmployer.name}
                  onChange={handleInputChange("currentEmployer.name")}
                  disabled={isReadOnlyField(`${path}.currentEmployer.name`)}
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="currentEmployer-street"
                  className="block text-sm font-medium text-gray-700"
                >
                  Street:
                </label>
                <input
                  type="text"
                  id="currentEmployer-street"
                  value={data.currentEmployer.street || ""}
                  onChange={handleInputChange("currentEmployer.street")}
                  disabled={isReadOnlyField(`${path}.currentEmployer.street`)}
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="currentEmployer-city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City:
                </label>
                <input
                  type="text"
                  id="currentEmployer-city"
                  value={data.currentEmployer.city}
                  onChange={handleInputChange("currentEmployer.city")}
                  disabled={isReadOnlyField(`${path}.currentEmployer.city`)}
                  className="block w-full                   p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="currentEmployer-state"
                  className="block text-sm font-medium text-gray-700"
                >
                  State:
                </label>
                <input
                  type="text"
                  id="currentEmployer-state"
                  value={data.currentEmployer.state || ""}
                  onChange={handleInputChange("currentEmployer.state")}
                  disabled={isReadOnlyField(`${path}.currentEmployer.state`)}
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="currentEmployer-zipCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Zip Code:
                </label>
                <input
                  type="text"
                  id="currentEmployer-zipCode"
                  value={data.currentEmployer.zipCode || ""}
                  onChange={handleInputChange("currentEmployer.zipCode")}
                  disabled={isReadOnlyField(`${path}.currentEmployer.zipCode`)}
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="currentEmployer-country"
                  className="block text-sm font-medium text-gray-700"
                >
                  Country:
                </label>
                <input
                  type="text"
                  id="currentEmployer-country"
                  value={data.currentEmployer.country}
                  onChange={handleInputChange("currentEmployer.country")}
                  disabled={isReadOnlyField(`${path}.currentEmployer.country`)}
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </>
          )}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Recent Employer:
          </label>
          {data.recentEmployer && (
            <>
              <div className="space-y-1">
                <label
                  htmlFor="recentEmployer-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name:
                </label>
                <input
                  type="text"
                  id="recentEmployer-name"
                  value={data.recentEmployer.name}
                  onChange={handleInputChange("recentEmployer.name")}
                  disabled={isReadOnlyField(`${path}.recentEmployer.name`)}
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="recentEmployer-street"
                  className="block text-sm font-medium text-gray-700"
                >
                  Street:
                </label>
                <input
                  type="text"
                  id="recentEmployer-street"
                  value={data.recentEmployer.street || ""}
                  onChange={handleInputChange("recentEmployer.street")}
                  disabled={isReadOnlyField(`${path}.recentEmployer.street`)}
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="recentEmployer-city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City:
                </label>
                <input
                  type="text"
                  id="recentEmployer-city"
                  value={data.recentEmployer.city}
                  onChange={handleInputChange("recentEmployer.city")}
                  disabled={isReadOnlyField(`${path}.recentEmployer.city`)}
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="recentEmployer-state"
                  className="block text-sm font-medium text-gray-700"
                >
                  State:
                </label>
                <input
                  type="text"
                  id="recentEmployer-state"
                  value={data.recentEmployer.state || ""}
                  onChange={handleInputChange("recentEmployer.state")}
                  disabled={isReadOnlyField(`${path}.recentEmployer.state`)}
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="recentEmployer-zipCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Zip Code:
                </label>
                <input
                  type="text"
                  id="recentEmployer-zipCode"
                  value={data.recentEmployer.zipCode || ""}
                  onChange={handleInputChange("recentEmployer.zipCode")}
                  disabled={isReadOnlyField(`${path}.recentEmployer.zipCode`)}
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="recentEmployer-country"
                  className="block text-sm font-medium text-gray-700"
                >
                  Country:
                </label>
                <input
                  type="text"
                  id="recentEmployer-country"
                  value={data.recentEmployer.country}
                  onChange={handleInputChange("recentEmployer.country")}
                  disabled={isReadOnlyField(`${path}.recentEmployer.country`)}
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </>
          )}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Foreign Government Affiliation:
          </label>
          {data.foreignGovernmentAffiliation && (
            <>
              <div className="space-y-1">
                <label
                  htmlFor="foreignGovernmentAffiliation-description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description:
                </label>
                <input
                  type="text"
                  id="foreignGovernmentAffiliation-description"
                  value={data.foreignGovernmentAffiliation.description}
                  onChange={handleInputChange(
                    "foreignGovernmentAffiliation.description"
                  )}
                  disabled={isReadOnlyField(
                    `${path}.foreignGovernmentAffiliation.description`
                  )}
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="foreignGovernmentAffiliation-relatedTo"
                  className="block text-sm font-medium text-gray-700"
                >
                  Related To:
                </label>
                <input
                  type="text"
                  id="foreignGovernmentAffiliation-relatedTo"
                  value={data.foreignGovernmentAffiliation.relatedTo}
                  onChange={handleInputChange(
                    "foreignGovernmentAffiliation.relatedTo"
                  )}
                  disabled={isReadOnlyField(
                    `${path}.foreignGovernmentAffiliation.relatedTo`
                  )}
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { RenderSection18_4 };
