import { Section18_1Details } from "api_v2/interfaces/relativesInfo";
import React from "react";

interface Section18_1Props {
  data: Section18_1Details;
  onInputChange: (path: string, value: any) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
}

const RenderSection18_1: React.FC<Section18_1Props> = ({
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

  return (
    <div className="space-y-6">
      <div className=" p-4 rounded-lg shadow-md space-y-4">
        <div className="space-y-1">
          <label
            htmlFor="ifMother-lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name:
          </label>
          <input
            type="text"
            id="ifMother-lastName"
            value={data.ifMother?.lastName || ""}
            onChange={handleInputChange("ifMother.lastName")}
            disabled={isReadOnlyField(`${path}.ifMother.lastName`)}
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="ifMother-firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name:
          </label>
          <input
            type="text"
            id="ifMother-firstName"
            value={data.ifMother?.firstName || ""}
            onChange={handleInputChange("ifMother.firstName")}
            disabled={isReadOnlyField(`${path}.ifMother.firstName`)}
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="ifMother-middleName"
            className="block text-sm font-medium text-gray-700"
          >
            Middle Name:
          </label>
          <input
            type="text"
            id="ifMother-middleName"
            value={data.ifMother?.middleName || ""}
            onChange={handleInputChange("ifMother.middleName")}
            disabled={isReadOnlyField(`${path}.ifMother.middleName`)}
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="ifMother-suffix"
            className="block text-sm font-medium text-gray-700"
          >
            Suffix:
          </label>
          <input
            type="text"
            id="ifMother-suffix"
            value={data.ifMother?.suffix || ""}
            onChange={handleInputChange("ifMother.suffix")}
            disabled={isReadOnlyField(`${path}.ifMother.suffix`)}
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="ifMother-sameAsListed"
            checked={data.ifMother?.sameAsListed || false}
            onChange={handleInputChange("ifMother.sameAsListed")}
            disabled={isReadOnlyField(`${path}.ifMother.sameAsListed`)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label
            htmlFor="ifMother-sameAsListed"
            className="block text-sm font-medium text-gray-700"
          >
            Same as Listed
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="ifMother-iDontKnow"
            checked={data.ifMother?.iDontKnow || false}
            onChange={handleInputChange("ifMother.iDontKnow")}
            disabled={isReadOnlyField(`${path}.ifMother.iDontKnow`)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label
            htmlFor="ifMother-iDontKnow"
            className="block text-sm font-medium text-gray-700"
          >
            I don't know
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="hasOtherNames"
            checked={data.hasOtherNames}
            onChange={handleInputChange("hasOtherNames")}
            disabled={isReadOnlyField(`${path}.hasOtherNames`)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label
            htmlFor="hasOtherNames"
            className="block text-sm font-medium text-gray-700"
          >
            Has Other Names
          </label>
        </div>
        {data.hasOtherNames && data.otherNamesUsed && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">
              Other Names Used:
            </h4>
            {data.otherNamesUsed.map((otherName, index) => (
              <div
                key={otherName._id}
                className="bg-gray-50 p-4 rounded-lg shadow space-y-4"
              >
                <div className="space-y-1">
                  <label
                    htmlFor={`otherName-lastName-${otherName._id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name:
                  </label>
                  <input
                    type="text"
                    id={`otherName-lastName-${otherName._id}`}
                    value={otherName.lastName}
                    onChange={handleInputChange(
                      `otherNamesUsed[${index}].lastName`
                    )}
                    disabled={isReadOnlyField(
                      `${path}.otherNamesUsed[${index}].lastName`
                    )}
                    className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={`otherName-firstName-${otherName._id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name:
                  </label>
                  <input
                    type="text"
                    id={`otherName-firstName-${otherName._id}`}
                    value={otherName.firstName}
                    onChange={handleInputChange(
                      `otherNamesUsed[${index}].firstName`
                    )}
                    disabled={isReadOnlyField(
                      `${path}.otherNamesUsed[${index}].firstName`
                    )}
                    className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={`otherName-middleName-${otherName._id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Middle Name:
                  </label>
                  <input
                    type="text"
                    id={`otherName-middleName-${otherName._id}`}
                    value={otherName.middleName || ""}
                    onChange={handleInputChange(
                      `otherNamesUsed[${index}].middleName`
                    )}
                    disabled={isReadOnlyField(
                      `${path}.otherNamesUsed[${index}].middleName`
                    )}
                    className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={`otherName-suffix-${otherName._id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Suffix:
                  </label>
                  <input
                    type="text"
                    id={`otherName-suffix-${otherName._id}`}
                    value={otherName.suffix || ""}
                    onChange={handleInputChange(
                      `otherNamesUsed[${index}].suffix`
                    )}
                    disabled={isReadOnlyField(
                      `${path}.otherNamesUsed[${index}].suffix`
                    )}
                    className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`otherName-maidenName-${otherName._id}`}
                    checked={otherName.maidenName}
                    onChange={handleInputChange(
                      `otherNamesUsed[${index}].maidenName`
                    )}
                    disabled={isReadOnlyField(
                      `${path}.otherNamesUsed[${index}].maidenName`
                    )}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label
                    htmlFor={`otherName-ma
                  idenName-${otherName._id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Maiden Name
                  </label>
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={`otherName-from-${otherName._id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    From (Month/Year):
                  </label>
                  <input
                    type="text"
                    id={`otherName-from-${otherName._id}`}
                    value={otherName.from || ""}
                    onChange={handleInputChange(
                      `otherNamesUsed[${index}].from`
                    )}
                    disabled={isReadOnlyField(
                      `${path}.otherNamesUsed[${index}].from`
                    )}
                    className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={`otherName-to-${otherName._id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    To (Month/Year):
                  </label>
                  <input
                    type="text"
                    id={`otherName-to-${otherName._id}`}
                    value={otherName.to || ""}
                    onChange={handleInputChange(`otherNamesUsed[${index}].to`)}
                    disabled={isReadOnlyField(
                      `${path}.otherNamesUsed[${index}].to`
                    )}
                    className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`otherName-estimatedFrom-${otherName._id}`}
                    checked={otherName.estimatedFrom || false}
                    onChange={handleInputChange(
                      `otherNamesUsed[${index}].estimatedFrom`
                    )}
                    disabled={isReadOnlyField(
                      `${path}.otherNamesUsed[${index}].estimatedFrom`
                    )}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label
                    htmlFor={`otherName-estimatedFrom-${otherName._id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Estimated From
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`otherName-estimatedTo-${otherName._id}`}
                    checked={otherName.estimatedTo || false}
                    onChange={handleInputChange(
                      `otherNamesUsed[${index}].estimatedTo`
                    )}
                    disabled={isReadOnlyField(
                      `${path}.otherNamesUsed[${index}].estimatedTo`
                    )}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label
                    htmlFor={`otherName-estimatedTo-${otherName._id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Estimated To
                  </label>
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={`otherName-reasonForChange-${otherName._id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Reason for Change:
                  </label>
                  <input
                    type="text"
                    id={`otherName-reasonForChange-${otherName._id}`}
                    value={otherName.reasonForChange || ""}
                    onChange={handleInputChange(
                      `otherNamesUsed[${index}].reasonForChange`
                    )}
                    disabled={isReadOnlyField(
                      `${path}.otherNamesUsed[${index}].reasonForChange`
                    )}
                    className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { RenderSection18_1 };
