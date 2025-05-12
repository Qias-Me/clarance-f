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
  // Function to update all SSN fields in the form
  const updateAllSSNFields = (ssnValue: string) => {
    // Update the main SSN field
    onInputChange(`${path}.ssn.value`, ssnValue);
    
    // Update all page SSN fields if they exist
    if (data.pageSSN && Array.isArray(data.pageSSN)) {
      data.pageSSN.forEach((_, index) => {
        onInputChange(`${path}.pageSSN[${index}].ssn.value`, ssnValue);
      });
    }
  };

  // Count total SSN fields for verification
  const totalSSNFields = data.pageSSN ? data.pageSSN.length + 1 : 1; // +1 for the main SSN field

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">Section 4</h3>
        <span className="text-sm text-gray-500">Total SSN fields: {totalSSNFields}</span>
      </div>

      <label className="block">
        Not Applicable
        <input
          type="checkbox"
          checked={data.notApplicable.value === "Yes"}
          onChange={(e) => {
            const newValue = e.target.checked ? "Yes" : "No";
            if (isValidValue(`${path}.notApplicable.value`, newValue)) {
              onInputChange(`${path}.notApplicable.value`, newValue);
            }
          }}
          className="mt-1 p-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        SSN 
        <input
          type="text"
          value={data.ssn?.value || ""}
          onChange={(e) => {
            const newValue = e.target.value;
            if (isValidValue(`${path}.ssn.value`, newValue)) {
              // Update all SSN fields with the same value
              updateAllSSNFields(newValue);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>
      
      {/* Display the current values of all SSN fields (for debugging, can be removed) */}
      <div className="text-xs text-gray-500 mt-2">
        <p>Main SSN: {data.ssn?.value}</p>
        <p>Total SSN fields in pageSSN: {data.pageSSN?.length || 0}</p>
        <p>First few pageSSN values: {data.pageSSN?.slice(0, 3).map(page => page.ssn.value).join(', ')}</p>
      </div>
    </div>
  );
};

export { RenderAcknowledgementInfo };
