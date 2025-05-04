import FormInfo from "api_v2/interfaces/FormInfo";
import { ApplicantPhysicalAttributes } from "../../../api/interfaces2.0/formDefinition";

type FormProps = {
  data: ApplicantPhysicalAttributes;
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
          defaultValue={data.heightFeet || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.heightFeet`, e.target.value)) {
              onInputChange(`${path}.heightFeet`, e.target.value);
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
          defaultValue={data.heightInch || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.heightInch`, e.target.value)) {
              onInputChange(`${path}.heightInch`, e.target.value);
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
          defaultValue={data.weight || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.weight`, e.target.value)) {
              onInputChange(`${path}.weight`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          readOnly={isReadOnlyField(`${path}.weight`)}
        />
      </label>

      {/* Hair Color */}
      <label className="block">
        Hair Color:
        <input
          type="text"
          defaultValue={data.hairColor || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.hairColor`, e.target.value)) {
              onInputChange(`${path}.hairColor`, e.target.value);
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
          defaultValue={data.eyeColor || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.eyeColor`, e.target.value)) {
              onInputChange(`${path}.eyeColor`, e.target.value);
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
