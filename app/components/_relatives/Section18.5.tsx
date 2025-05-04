import {
  Section18_5Details,
  ContactMethod,
} from "api_v2/interfaces/relativesInfo";
import React from "react";

interface Section18_5Props {
  data: Section18_5Details;
  onInputChange: (path: string, value: any) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
}

const RenderSection18_5: React.FC<Section18_5Props> = ({
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

  const contactMethods: ContactMethod[] = [
    "InPerson",
    "Telephone",
    "WrittenCorrespondence",
    "Electronic",
    "Other",
  ];

  return (
    <div className="space-y-6 p-6  shadow rounded-md">
      <div className="space-y-4">
        <div className="flex flex-col">
          <label
            htmlFor="firstContactDate"
            className="font-semibold text-gray-700"
          >
            First Contact Date:
          </label>
          <input
            type="text"
            id="firstContactDate"
            value={data.firstContactDate}
            onChange={handleInputChange("firstContactDate")}
            disabled={isReadOnlyField(`${path}.firstContactDate`)}
            className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="lastContactDate"
            className="font-semibold text-gray-700"
          >
            Last Contact Date:
          </label>
          <input
            type="text"
            id="lastContactDate"
            value={data.lastContactDate || ""}
            onChange={handleInputChange("lastContactDate")}
            disabled={isReadOnlyField(`${path}.lastContactDate`)}
            className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700">
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
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor={`contactMethod-${method}`}
                className="text-gray-700"
              >
                {method}
              </label>
            </div>
          ))}
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="contactFrequency-frequency"
            className="font-semibold text-gray-700"
          >
            Contact Frequency:
          </label>
          <select
            id="contactFrequency-frequency"
            value={data.contactFrequency.frequency}
            onChange={handleInputChange("contactFrequency.frequency")}
            disabled={isReadOnlyField(`${path}.contactFrequency.frequency`)}
            className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Annually">Annually</option>
            <option value="Other">Other</option>
          </select>
          {data.contactFrequency.frequency === "Other" && (
            <div className="mt-4 flex flex-col">
              <label
                htmlFor="contactFrequency-explanation"
                className="font-semibold text-gray-700"
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
                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700">
            Employer Details:
          </label>
          {data.employerDetails && (
            <>
              <div className="mt-2 flex flex-col">
                <label
                  htmlFor="employerDetails-name"
                  className="font-semibold text-gray-700"
                >
                  Name:
                </label>
                <input
                  type="text"
                  id="employerDetails-name"
                  value={data.employerDetails.name}
                  onChange={handleInputChange("employerDetails.name")}
                  disabled={isReadOnlyField(`${path}.employerDetails.name`)}
                  className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {data.employerDetails.address && (
                <>
                  <div className="mt-2 flex flex-col">
                    <label
                      htmlFor="employerDetails-street"
                      className="font-semibold text-gray-700"
                    >
                      Street:
                    </label>
                    <input
                      type="text"
                      id="employerDetails-street"
                      value={data.employerDetails.address.street || ""}
                      onChange={handleInputChange(
                        "employerDetails.address.street"
                      )}
                      disabled={isReadOnlyField(
                        `${path}.employerDetails.address.street`
                      )}
                      className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="mt-2 flex flex-col">
                    <label
                      htmlFor="employerDetails-city"
                      className="font-semibold text-gray-700"
                    >
                      City:
                    </label>
                    <input
                      type="text"
                      id="employerDetails-city"
                      value={data.employerDetails.address.city}
                      onChange={handleInputChange(
                        "employerDetails.address.city"
                      )}
                      disabled={isReadOnlyField(
                        `${path}.employerDetails.address.city`
                      )}
                      className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="mt-2 flex flex-col">
                    <label
                      htmlFor="employerDetails-state"
                      className="font-semibold text-gray-700"
                    >
                      State:
                    </label>
                    <input
                      type="text"
                      id="employerDetails-state"
                      value={data.employerDetails.address.state || ""}
                      onChange={handleInputChange(
                        "employerDetails.address.state"
                      )}
                      disabled={isReadOnlyField(
                        `${path}.employerDetails.address.state`
                      )}
                      className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="mt-2 flex flex-col">
                    <label
                      htmlFor="employerDetails-zipCode"
                      className="font-semibold text-gray-700"
                    >
                      Zip Code:
                    </label>
                    <input
                      type="text"
                      id="employerDetails-zipCode"
                      value={data.employerDetails.address.zipCode || ""}
                      onChange={handleInputChange(
                        "employerDetails.address.zipCode"
                      )}
                      disabled={isReadOnlyField(
                        `${path}.employerDetails.address.zipCode`
                      )}
                      className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="mt-2 flex flex-col">
                    <label
                      htmlFor="employerDetails-country"
                      className="font-semibold text-gray-700"
                    >
                      Country:
                    </label>
                    <input
                      type="text"
                      id="employerDetails-country"
                      value={data.employerDetails.address.country}
                      onChange={handleInputChange(
                        "employerDetails.address.country"
                      )}
                      disabled={isReadOnlyField(
                        `${path}.employerDetails.address.country`
                      )}
                      className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="employerDetails-unknown"
                  checked={data.employerDetails.unknown}
                  onChange={(event) => {
                    onInputChange(
                      `${path}.employerDetails.unknown`,
                      event.target.checked
                    );
                  }}
                  disabled={isReadOnlyField(`${path}.employerDetails.unknown`)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="employerDetails-unknown"
                  className="text-gray-700"
                >
                  Unknown Employer
                </label>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700">
            Foreign Government Affiliation:
          </label>
          {data.foreignGovernmentAffiliation && (
            <>
              <div className="mt-2 flex flex-col">
                <label
                  htmlFor="foreignGovernmentAffiliation-description"
                  className="font-semibold text-gray-700"
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
                  className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { RenderSection18_5 };
