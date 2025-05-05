import { SuffixOptions } from "api/enums/enums";
import type { FormInfo } from "api/interfaces/FormInfo";
import { type PersonalInfo } from "api/interfaces/sections/personalInfo";


type FormProps = {
  data: PersonalInfo;
  onInputChange: (path: string, value: any) => void; // Handles changes for the values from all keys in ApplicationFormValues
  onAddEntry: (path: string, newItem: any) => void; // Adds a default item
  onRemoveEntry: (path: string, index: number) => void; // Removes a default item
  isValidValue: (path: string, value: any) => boolean; // This value is any value in the ApplicationFormValues
  getDefaultNewItem: (itemType: string) => any; // THis is any sub-object type for ApplicantFormValues
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo; // Specify more detailed type if possible
  actionType?: string;
};

const RenderBasicInfo = ({
  data,
  isReadOnlyField,
  onInputChange,
  isValidValue,
  path,
}: FormProps) => {
  const personalInfo = data as PersonalInfo;

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      {personalInfo.applicantID ? (
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">
            SECTION 1.
          </h3>

          <p className="text-xs font-semibold">
            Applicant ID: {personalInfo.applicantID}
          </p>
        </div>
      ) : (
        <div className="text-lg font-semibold">SECTION 1.</div>
      )}

      <label className="block">
        First Name:
        <input
          type="text"
          defaultValue={personalInfo.firstName.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.firstName.value`, e.target.value)) {
              onInputChange(`${path}.firstName.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Last Name:
        <input
          type="text"
          defaultValue={personalInfo.lastName.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.lastName.value`, e.target.value)) {
              onInputChange(`${path}.lastName.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Middle Name:
        <input
          type="text"
          defaultValue={personalInfo.middleName.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.middleName.value`, e.target.value)) {
              onInputChange(`${path}.middleName.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Suffix:
        <select
          name={`${path}.suffix.value`}
          defaultValue={personalInfo.suffix.value}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          onChange={(e) => {
            if (isValidValue(`${path}.suffix.value`, e.target.value)) {
              onInputChange(`${path}.suffix.value`, e.target.value);
            }
          }}
        >
          {Object.entries(SuffixOptions).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export { RenderBasicInfo };
