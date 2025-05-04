import { ApplicantBirthInfo } from "../../../api/interfaces2.0/formDefinition";
import FormInfo from "api_v2/interfaces/FormInfo";

interface FormProps {
  data: ApplicantBirthInfo;
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
          defaultValue={data.birthCity || ""}
          onChange={(e) => {
            const newValue = e.target.value;
            if (isValidValue(`${path}.birthCity`, newValue)) {
              onInputChange(`${path}.birthCity`, newValue);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Birth State:
        <input
          type="text"
          defaultValue={data.birthState || ""}
          onChange={(e) => {
            const newValue = e.target.value;
            if (isValidValue(`${path}.birthState`, newValue)) {
              onInputChange(`${path}.birthState`, newValue);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Birth Country:
        <input
          type="text"
          defaultValue={data.birthCountry || ""}
          onChange={(e) => {
            const newValue = e.target.value;
            if (isValidValue(`${path}.birthCountry`, newValue)) {
              onInputChange(`${path}.birthCountry`, newValue);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Is Birth Date Estimate:
        <input
          type="checkbox"
          checked={data.isBirthDateEstimate}
          onChange={(e) => {
            const newValue = e.target.checked;
            if (isValidValue(`${path}.isBirthDateEstimate`, newValue)) {
              onInputChange(`${path}.isBirthDateEstimate`, newValue);
            }
          }}
          className="ml-2"
        />
      </label>
    </div>
  );
};

export { RenderBirthInfo };
