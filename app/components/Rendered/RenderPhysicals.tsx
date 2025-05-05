import {type FormInfo} from "api/interfaces/FormInfo";

import { type PhysicalAttributes } from "api/interfaces/sections/physicalAttributes";

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
        <input
          type="number"
          defaultValue={data.heightFeet.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.heightFeet.value`, e.target.value)) {
              onInputChange(`${path}.heightFeet.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          readOnly={isReadOnlyField(`${path}.heightFeet`)}
        />
      </label>

      {/* Height in Inches */}
      <label className="block">
        Height (Inches):
        <input
          type="number"
          defaultValue={data.heightInch.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.heightInch.value`, e.target.value)) {
              onInputChange(`${path}.heightInch.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          readOnly={isReadOnlyField(`${path}.heightInch`)}
        />
      </label>

      {/* Weight */}
      <label className="block">
        Weight:
        <input
          type="number"
          defaultValue={data.weight.value || ""}
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
        <input
          type="text"
          defaultValue={data.hairColor.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.hairColor.value`, e.target.value)) {
              onInputChange(`${path}.hairColor.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          readOnly={isReadOnlyField(`${path}.hairColor`)}
        />
      </label>

      {/* Eye Color */}
      <label className="block">
        Eye Color:
        <input
          type="text"
          defaultValue={data.eyeColor.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.eyeColor.value`, e.target.value)) {
              onInputChange(`${path}.eyeColor.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          readOnly={isReadOnlyField(`${path}.eyeColor`)}
        />
      </label>
    </div>
  );
};

export { RenderPhysicalsInfo };
