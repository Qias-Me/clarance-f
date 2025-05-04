import React from "react";
import {type FormInfo} from "api/interfaces/FormInfo";

import { type ServiceInfo } from "api/interfaces/sections/service";

type FormProps = {
  data: ServiceInfo;
  onInputChange: (path: string, value: any) => void;
  isValidValue: (path: string, value: any) => boolean;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
};

const RenderServiceInfo: React.FC<FormProps> = ({
  data,
  isReadOnlyField,
  onInputChange,
  path,
}) => {
  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { value } = event.target;
      onInputChange(`${path}.${field}`, value);
    };

  const handleRadioChange =
    (value: boolean) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        onInputChange(`${path}.bornAfter1959`, value);
      }
    };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">Section 14 - Selective Service Record</h3>
      <div className="mt-2 space-y-4">
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="bornAfter1959"
              value="yes"
              checked={data.bornAfter1959 === true}
              onChange={handleRadioChange(true)}
              className="mr-2"
            />
            YES
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="bornAfter1959"
              value="no"
              checked={data.bornAfter1959 === false}
              onChange={handleRadioChange(false)}
              className="mr-2"
            />
            NO
          </label>
        </div>
        {data.bornAfter1959 !== null && data.bornAfter1959 === true && (
          <div className="space-y-2">
            <label className="block">
              <span className="text-gray-700">Are you registered with SSS?</span>
              <select
                value={data.registeredWithSSS || ""}
                onChange={handleInputChange("registeredWithSSS")}
                disabled={isReadOnlyField(`${path}.registeredWithSSS`)}
                className="mt-1 block w-full"
              >
                <option value="" disabled>
                  Select an option
                </option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="dontKnow">Don&apos;t Know</option>
              </select>
            </label>
            {data.registeredWithSSS === "yes" && (
              <label className="block mt-2">
                <span className="text-gray-700">Registration Number</span>
                <input
                  type="text"
                  value={data.registrationNumber || ""}
                  onChange={handleInputChange("registrationNumber")}
                  disabled={isReadOnlyField(`${path}.registrationNumber`)}
                  className="mt-1 block w-full"
                />
              </label>
            )}
            {(data.registeredWithSSS === "no" || data.registeredWithSSS === "dontKnow") && (
              <label className="block mt-2">
                <span className="text-gray-700">Explanation</span>
                <input
                  type="text"
                  value={data.explanation || ""}
                  onChange={handleInputChange("explanation")}
                  disabled={isReadOnlyField(`${path}.explanation`)}
                  className="mt-1 block w-full"
                />
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { RenderServiceInfo };
