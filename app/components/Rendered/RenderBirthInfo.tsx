import {type FormInfo} from "api/interfaces/FormInfo";
import { type BirthInfo } from "api/interfaces/sections/birthnfo";
import { StateOptions, CountryOptions } from "api/enums/enums";

interface FormProps {
  data: BirthInfo;
  onInputChange: (path: string, value: any) => void;
  isValidValue: (path: string, value: any) => boolean;
  path: string;
  formInfo: FormInfo;
}

const RenderBirthInfo = ({
  data,
  onInputChange,
  isValidValue,
  path
}: FormProps) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">Section 2 & 3</h3>
      </div>

      <label className="block">
        Birth City:
        <input
          type="text"
          defaultValue={data.birthCity.value || ""}
          onChange={(e) => {
            const newValue = e.target.value;
            if (isValidValue(`${path}.birthCity.value`, newValue)) {
              onInputChange(`${path}.birthCity.value`, newValue);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Birth State:
        <select
          defaultValue={data.birthState.value || ""}
          onChange={(e) => {
            const newValue = e.target.value;
            if (isValidValue(`${path}.birthState.value`, newValue)) {
              onInputChange(`${path}.birthState.value`, newValue);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        >
          <option value="">Select a state</option>
          {Object.entries(StateOptions).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        Birth Country:
        <select
          defaultValue={data.birthCountry.value || ""}
          onChange={(e) => {
            const newValue = e.target.value;
            if (isValidValue(`${path}.birthCountry.value`, newValue)) {
              onInputChange(`${path}.birthCountry.value`, newValue);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        >
          <option value="">Select a country</option>
          {Object.entries(CountryOptions).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        Is Birth Date Estimate:
        <input
          type="checkbox"
          checked={data.isBirthDateEstimate.value === "Yes"}
          onChange={(e) => {
            const newValue = e.target.checked ? "Yes" : "No";
            if (isValidValue(`${path}.isBirthDateEstimate.value`, newValue)) {
              onInputChange(`${path}.isBirthDateEstimate.value`, newValue);
            }
          }}
          className="ml-2"
        />
      </label>
    </div>
  );
};

export { RenderBirthInfo };
