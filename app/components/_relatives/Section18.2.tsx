import { type Section18_2Details } from "api/interfaces/sections/relativesInfo";
import React from "react";

interface Section18_2Props {
  data: Section18_2Details;
  onInputChange: (path: string, value: any) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
}

const RenderSection18_2: React.FC<Section18_2Props> = ({
  data,
  onInputChange,
  path,
  isReadOnlyField,
}) => {
  const handleInputChange =
    (fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLInputElement>) => {
      console.log(path, fieldPath, event.target.value, "inComponent");
      onInputChange(`${path}.${fieldPath}`, event.target.type === "checkbox" ? event.target.checked : event.target.value);
    };

  return (
    <div className="space-y-6">
      <div className=" p-4 rounded-lg shadow-md space-y-4">
        <div className="space-y-1">
          <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street:</label>
          <input
            type="text"
            id="street"
            value={data.street}
            onChange={handleInputChange("street")}
            disabled={isReadOnlyField(`${path}.street`)}
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">City:</label>
          <input
            type="text"
            id="city"
            value={data.city}
            onChange={handleInputChange("city")}
            disabled={isReadOnlyField(`${path}.city`)}
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">State:</label>
          <input
            type="text"
            id="state"
            value={data.state || ""}
            onChange={handleInputChange("state")}
            disabled={isReadOnlyField(`${path}.state`)}
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip Code:</label>
          <input
            type="text"
            id="zipCode"
            value={data.zipCode || ""}
            onChange={handleInputChange("zipCode")}
            disabled={isReadOnlyField(`${path}.zipCode`)}
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country:</label>
          <input
            type="text"
            id="country"
            value={data.country}
            onChange={handleInputChange("country")}
            disabled={isReadOnlyField(`${path}.country`)}
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="hasAPOFPOAddress"
            checked={data.hasAPOFPOAddress}
            onChange={handleInputChange("hasAPOFPOAddress")}
            disabled={isReadOnlyField(`${path}.hasAPOFPOAddress`)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="hasAPOFPOAddress" className="block text-sm font-medium text-gray-700">
            Has APO/FPO Address
          </label>
        </div>
        {data.hasAPOFPOAddress && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="apofpoAddress-address" className="block text-sm font-medium text-gray-700">
                APO/FPO Address:
              </label>
              <input
                type="text"
                id="apofpoAddress-address"
                value={data.apofpoAddress?.address || ""}
                onChange={handleInputChange("apofpoAddress.address")}
                disabled={isReadOnlyField(`${path}.apofpoAddress.address`)}
                className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="apofpoAddress-apofpoStateCode" className="block text-sm font-medium text-gray-700">
                APO/FPO State Code:
              </label>
              <input
                type="text"
                id="apofpoAddress-apofpoStateCode"
                value={data.apofpoAddress?.apofpoStateCode || ""}
                onChange={handleInputChange("apofpoAddress.apofpoStateCode")}
                disabled={isReadOnlyField(`${path}.apofpoAddress.apofpoStateCode`)}
                className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="apofpoAddress-apofpoZipCode" className="block text-sm font-medium text-gray-700">
                APO/FPO Zip Code:
              </label>
              <input
                type="text"
                id="apofpoAddress-apofpoZipCode"
                value={data.apofpoAddress?.apofpoZipCode || ""}
                onChange={handleInputChange("apofpoAddress.apofpoZipCode")}
                disabled={isReadOnlyField(`${path}.apofpoAddress.apofpoZipCode`)}
                className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="dontKnowAPOFPO"
            checked={data.dontKnowAPOFPO}
            onChange={handleInputChange("dontKnowAPOFPO")}
            disabled={isReadOnlyField(`${path}.dontKnowAPOFPO`)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="dontKnowAPOFPO" className="block text-sm font-medium text-gray-700">
            I don't know APO/FPO
          </label>
        </div>
      </div>
    </div>
  );
};

export { RenderSection18_2 };
