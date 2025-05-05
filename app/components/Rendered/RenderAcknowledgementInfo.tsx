import { type AknowledgeInfo } from "api/interfaces/sections/aknowledgement"; // Assuming this import path is correct
import {type FormInfo} from "api/interfaces/FormInfo";


interface FormProps {
  data: AknowledgeInfo; // Use the correct data type
  onInputChange: (path: string, value: any) => void;
  isValidValue: (path: string, value: any) => boolean;
  path: string;
  formInfo: FormInfo;
}

const RenderAcknowledgementInfo = ({
  data,
  onInputChange,
  isValidValue,
  path
}: FormProps) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">Section 4</h3>
      </div>

      <label className="block">
        Not Applicable
        <input
          type="checkbox"
          checked={data.notApplicable.value === "Yes"}
          onChange={(e) => {
            const newValue = e.target.checked;
            if (isValidValue(`${path}.notApplicable`, newValue)) {
              onInputChange(`${path}.notApplicable`, newValue);
            }
          }}
          className="mt-1 p-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        SSN 
        <input
          type="text"
          defaultValue={data.ssn?.value || ""}
          onChange={(e) => {
            const newValue = e.target.value;
            if (isValidValue(`${path}.ssn`, newValue)) {
              onInputChange(`${path}.ssn`, newValue);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>
    </div>
  );
};

export { RenderAcknowledgementInfo };
