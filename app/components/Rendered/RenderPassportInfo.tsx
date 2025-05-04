import { SuffixOptions } from "api/enums/enums";
import { type FormInfo} from "api/interfaces/FormInfo";
import { type PassportInfo } from "api/interfaces/sections/passport";


type FormProps = {
  data: PassportInfo;
  onInputChange: (path: string, value: any) => void; // Handles changes for the values from all keys in ApplicationFormValues
  onAddEntry: (path: string, newItem: any) => void; // Adds a default item
  onRemoveEntry: (path: string, index: number) => void; // Removes a default item
  isValidValue: (path: string, value: any) => boolean; // This value is any value in the ApplicationFormValues
  getDefaultNewItem: (itemType: string) => any; // This is any sub-object type for ApplicantFormValues
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo; // Specify more detailed type if possible
  actionType?: string;
};

const RenderPassportInfo = ({
  data,
  isReadOnlyField,
  onInputChange,
  isValidValue,
  path,
}: FormProps) => {
  const passportInfo = data as PassportInfo;

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">
        SECTION 8 - U.S. Passport Information
      </h3>

      <div className="flex items-center">
        <label className="mr-2">
          <input
            type="checkbox"
            checked={passportInfo.hasPassport}
            onChange={(e) => onInputChange(`${path}.hasPassport`, e.target.checked)}
            className="mr-2"
          />
          Do you possess a U.S. passport (current or expired)?
        </label>
        {passportInfo.hasPassport ? null : <span></span>}
      </div>

      {passportInfo.hasPassport && (
        <>
          <label className="block">
            Passport Number:
            <input
              type="text"
              defaultValue={passportInfo.passportNum || ""}
              onChange={(e) => {
                if (isValidValue(`${path}.passportNum`, e.target.value)) {
                  onInputChange(`${path}.passportNum`, e.target.value);
                }
              }}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
            />
          </label>

          <label className="block">
            Issue Date (Month/Day/Year):
            <input
              type="text"
              defaultValue={passportInfo.issueDate || ""}
              onChange={(e) => {
                if (isValidValue(`${path}.issueDate`, e.target.value)) {
                  onInputChange(`${path}.issueDate`, e.target.value);
                }
              }}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
            />
            <label className="inline-flex items-center ml-2">
              <input
                type="checkbox"
                checked={passportInfo.isIssuedEst}
                onChange={(e) => onInputChange(`${path}.isIssuedEst`, e.target.checked)}
                className="mr-2"
              />
              Est.
            </label>
          </label>

          <label className="block">
            Expiration Date (Month/Day/Year):
            <input
              type="text"
              defaultValue={passportInfo.expirationDate || ""}
              onChange={(e) => {
                if (isValidValue(`${path}.expirationDate`, e.target.value)) {
                  onInputChange(`${path}.expirationDate`, e.target.value);
                }
              }}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
            />
            <label className="inline-flex items-center ml-2">
              <input
                type="checkbox"
                checked={passportInfo.isExpirationEst}
                onChange={(e) => onInputChange(`${path}.isExpirationEst`, e.target.checked)}
                className="mr-2"
              />
              Est.
            </label>
          </label>

          <label className="block">
            Last Name:
            <input
              type="text"
              defaultValue={passportInfo.passportLName || ""}
              onChange={(e) => {
                if (isValidValue(`${path}.passportLName`, e.target.value)) {
                  onInputChange(`${path}.passportLName`, e.target.value);
                }
              }}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
            />
          </label>

          <label className="block">
            First Name:
            <input
              type="text"
              defaultValue={passportInfo.passportFName || ""}
              onChange={(e) => {
                if (isValidValue(`${path}.passportFName`, e.target.value)) {
                  onInputChange(`${path}.passportFName`, e.target.value);
                }
              }}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
            />
          </label>

          <label className="block">
            Middle Name:
            <input
              type="text"
              defaultValue={passportInfo.passportMName || ""}
              onChange={(e) => {
                if (isValidValue(`${path}.passportMName`, e.target.value)) {
                  onInputChange(`${path}.passportMName`, e.target.value);
                }
              }}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
            />
          </label>

          <label className="block">
            Suffix:
            <select
              name={`${path}.passportSuffix`}
              defaultValue={passportInfo.passportSuffix}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
              onChange={(e) => {
                if (isValidValue(`${path}.passportSuffix`, e.target.value)) {
                  onInputChange(`${path}.passportSuffix`, e.target.value);
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
        </>
      )}
    </div>
  );
};

export { RenderPassportInfo };
