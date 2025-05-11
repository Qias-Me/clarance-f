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

  const handleHasPassportChange = (checked: boolean) => {
    onInputChange(`${path}.hasPassport.value`, checked ? "YES" : "NO");
    
    // If toggling to NO, remove the entire section8 object
    if (!checked && passportInfo.section8) {
      // Using undefined to remove the property entirely from the data object
      onInputChange(`${path}.section8`, {});
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">
        SECTION 8 - U.S. Passport Information
      </h3>

      <div className="flex items-center">
        <label className="mr-2">
          <input
            type="checkbox"
            checked={passportInfo.hasPassport?.value === "YES"}
            onChange={(e) => handleHasPassportChange(e.target.checked)}
            className="mr-2"
          />
          Do you possess a U.S. passport (current or expired)?
        </label>
      </div>

      {passportInfo.hasPassport?.value === "YES" && (
        <>
          <label className="block">
            Passport Number:
            <input
              type="text"
              value={passportInfo.section8?.passportNum?.value || ""}
              onChange={(e) => {
                if (isValidValue(`${path}.section8.passportNum.value`, e.target.value)) {
                  onInputChange(`${path}.section8.passportNum.value`, e.target.value);
                }
              }}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
            />
          </label>

          <label className="block">
            Issue Date (Month/Day/Year):
            <input
              type="text"
              value={passportInfo.section8?.issueDate?.value || ""}
              onChange={(e) => {
                if (isValidValue(`${path}.section8.issueDate.value`, e.target.value)) {
                  onInputChange(`${path}.section8.issueDate.value`, e.target.value);
                }
              }}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
            />
            <label className="inline-flex items-center ml-2">
              <input
                type="checkbox"
                checked={passportInfo.section8?.isIssuedEst?.value === "YES"}
                onChange={(e) => onInputChange(`${path}.section8.isIssuedEst.value`, e.target.checked ? "YES" : "NO")}
                className="mr-2"
              />
              Est.
            </label>
          </label>

          <label className="block">
            Expiration Date (Month/Day/Year):
            <input
              type="text"
              value={passportInfo.section8?.expirationDate?.value || ""}
              onChange={(e) => {
                if (isValidValue(`${path}.section8.expirationDate.value`, e.target.value)) {
                  onInputChange(`${path}.section8.expirationDate.value`, e.target.value);
                }
              }}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
            />
            <label className="inline-flex items-center ml-2">
              <input
                type="checkbox"
                checked={passportInfo.section8?.isExpirationEst?.value === "YES"}
                onChange={(e) => onInputChange(`${path}.section8.isExpirationEst.value`, e.target.checked ? "YES" : "NO")}
                className="mr-2"
              />
              Est.
            </label>
          </label>

          <label className="block">
            Last Name:
            <input
              type="text"
              value={passportInfo.section8?.passportLName?.value || ""}
              onChange={(e) => {
                if (isValidValue(`${path}.section8.passportLName.value`, e.target.value)) {
                  onInputChange(`${path}.section8.passportLName.value`, e.target.value);
                }
              }}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
            />
          </label>

          <label className="block">
            First Name:
            <input
              type="text"
              value={passportInfo.section8?.passportFName?.value || ""}
              onChange={(e) => {
                if (isValidValue(`${path}.section8.passportFName.value`, e.target.value)) {
                  onInputChange(`${path}.section8.passportFName.value`, e.target.value);
                }
              }}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
            />
          </label>

          <label className="block">
            Middle Name:
            <input
              type="text"
              value={passportInfo.section8?.passportMName?.value || ""}
              onChange={(e) => {
                if (isValidValue(`${path}.section8.passportMName.value`, e.target.value)) {
                  onInputChange(`${path}.section8.passportMName.value`, e.target.value);
                }
              }}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
            />
          </label>

          <label className="block">
            Suffix:
            <select
              value={passportInfo.section8?.passportSuffix?.value || ""}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
              onChange={(e) => {
                if (isValidValue(`${path}.section8.passportSuffix.value`, e.target.value)) {
                  onInputChange(`${path}.section8.passportSuffix.value`, e.target.value);
                }
              }}
            >
              <option value="">Select a suffix</option>
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