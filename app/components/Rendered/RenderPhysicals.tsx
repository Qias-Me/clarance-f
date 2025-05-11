import {type FormInfo} from "api/interfaces/FormInfo";
import { type PhysicalAttributes } from "api/interfaces/sections/physicalAttributes";
import { 
  HeightFeetOptions, 
  HeightInchOptions, 
  HairColorOptions, 
  EyeColorOptions,
  GenderOptions 
} from "api/enums/enums";

type FormProps = {
  data: PhysicalAttributes;
  onInputChange: (path: string, value: any) => void;
  isValidValue: (path: string, value: any) => boolean;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
};

const RenderPhysicalsInfo = ({
  data,
  isReadOnlyField,
  onInputChange,
  isValidValue,
  path
}: FormProps) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">
        Section 6.
      </h3>

      {/* Height in Feet */}
      <label className="block">
        Height (Feet):
        <select
          value={data.heightFeet.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.heightFeet.value`, e.target.value)) {
              onInputChange(`${path}.heightFeet.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          disabled={isReadOnlyField(`${path}.heightFeet`)}
        >
          <option value="">Select feet</option>
          {Object.entries(HeightFeetOptions).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      {/* Height in Inches */}
      <label className="block">
        Height (Inches):
        <select
          value={data.heightInch.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.heightInch.value`, e.target.value)) {
              onInputChange(`${path}.heightInch.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          disabled={isReadOnlyField(`${path}.heightInch`)}
        >
          <option value="">Select inches</option>
          {Object.entries(HeightInchOptions).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      {/* Weight */}
      <label className="block">
        Weight:
        <input
          type="number"
          value={data.weight.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.weight.value`, e.target.value)) {
              onInputChange(`${path}.weight.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          readOnly={isReadOnlyField(`${path}.weight.value`)}
        />
      </label>

      {/* Hair Color */}
      <label className="block">
        Hair Color:
        <select
          value={data.hairColor.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.hairColor.value`, e.target.value)) {
              onInputChange(`${path}.hairColor.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          disabled={isReadOnlyField(`${path}.hairColor`)}
        >
          <option value="">Select hair color</option>
          {Object.entries(HairColorOptions).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      {/* Eye Color */}
      <label className="block">
        Eye Color:
        <select
          value={data.eyeColor.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.eyeColor.value`, e.target.value)) {
              onInputChange(`${path}.eyeColor.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          disabled={isReadOnlyField(`${path}.eyeColor`)}
        >
          <option value="">Select eye color</option>
          {Object.entries(EyeColorOptions).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      {/* Gender */}
      <label className="block">
        Gender:
        <select
          value={data.gender.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.gender.value`, e.target.value)) {
              onInputChange(`${path}.gender.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          disabled={isReadOnlyField(`${path}.gender`)}
        >
          <option value="">Select gender</option>
          {Object.entries(GenderOptions).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export { RenderPhysicalsInfo };
