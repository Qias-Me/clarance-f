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
      onInputChange(`${path}.${field}.value`, value);
    };

  const handleRadioChange =
    (field: string, value: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        onInputChange(`${path}.${field}.value`, value);
      }
    };

  const renderExplanationField = (status: string) => {
    if (!data.explanations?.[status as "Yes" | "No" | "I don't know"]) return null;
    
    return (
      <label className="block mt-2">
        <span className="text-gray-700">
          {status === "Yes" 
            ? "Registration Number" 
            : "Explanation"}
        </span>
        <input
          type="text"
          value={data.explanations[status as "Yes" | "No" | "I don't know"]?.value || ""}
          onChange={(e) => onInputChange(`${path}.explanations.${status}.value`, e.target.value)}
          disabled={isReadOnlyField(`${path}.explanations.${status}`)}
          className="mt-1 block w-full"
        />
      </label>
    );
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">Section 14 - Selective Service Record</h3>
      <div className="mt-2 space-y-4">
        <div>
          <p className="text-gray-700">Were you born male after December 31, 1959?</p>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="bornAfter1959"
                value="YES"
                checked={data.bornAfter1959?.value === "YES"}
                onChange={handleRadioChange("bornAfter1959", "YES")}
                className="mr-2"
              />
              YES
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="bornAfter1959"
                value="NO (Proceed to Section 15)"
                checked={data.bornAfter1959?.value === "NO (Proceed to Section 15)"}
                onChange={handleRadioChange("bornAfter1959", "NO (Proceed to Section 15)")}
                className="mr-2"
              />
              NO (Proceed to Section 15)
            </label>
          </div>
        </div>
        
        {data.bornAfter1959?.value === "YES" && (
          <div className="space-y-2">
            <label className="block">
              <span className="text-gray-700">Have you registered with the Selective Service System (SSS)?</span>
              <select
                value={data.registeredWithSSS?.value || ""}
                onChange={handleInputChange("registeredWithSSS")}
                disabled={isReadOnlyField(`${path}.registeredWithSSS`)}
                className="mt-1 block w-full"
              >
                <option value="" disabled>
                  Select an option
                </option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="I don't know">I don't know</option>
              </select>
            </label>
            
            {data.registeredWithSSS?.value === "Yes" && renderExplanationField("Yes")}
            {data.registeredWithSSS?.value === "No" && renderExplanationField("No")}
            {data.registeredWithSSS?.value === "I don't know" && renderExplanationField("I don't know")}
            
            {/* Military service history could be expanded here with additional fields */}
            {/* This would include fields for military branches, service dates, and discharge information */}
          </div>
        )}
      </div>
    </div>
  );
};

export { RenderServiceInfo };
