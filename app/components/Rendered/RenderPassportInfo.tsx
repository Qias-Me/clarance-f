import { useState, useEffect } from 'react';
import { SuffixOptions } from "api/enums/enums";
import { type FormInfo} from "api/interfaces/FormInfo";
import {
  type PassportInfo,
  type PassportEntry
} from "api/interfaces/sections/passport";
import FormEntryManager, { useFormEntryManager } from "../../utils/forms/FormEntryManager";

interface FormProps {
  data: PassportInfo;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  isValidValue: (path: string, value: any) => boolean;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
  actionType?: string;
}

const RenderPassportInfo = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  isValidValue,
  getDefaultNewItem,
  isReadOnlyField,
  path,
}: FormProps) => {
  // Track if passport section is active
  const [hasPassport, setHasPassport] = useState<boolean>(data.hasPassport?.value === "YES");
  
  // Initialize passport if needed
  useEffect(() => {
    if (data && data.hasPassport?.value === "YES") {
      if (!data.passports || data.passports.length === 0) {
        // If no passport exists, create one
        const defaultPassport = getDefaultNewItem("passportInfo.passports");
        onAddEntry(`${path}.passports`, defaultPassport);
      }
    }
  }, [data.hasPassport?.value]);

  const handleHasPassportChange = (checked: boolean) => {
    // Update form data
    setHasPassport(checked);
    onInputChange(`${path}.hasPassport.value`, checked ? "YES" : "NO (If NO, proceed to Section 9)");
    
    // If toggling to YES and no passport exists, create one
    if (checked && (!data.passports || data.passports.length === 0)) {
      const defaultPassport = getDefaultNewItem("passportInfo.passports");
      onAddEntry(`${path}.passports`, defaultPassport);
    }
  };

  // Get the current passport (should only be one)
  const passport = data.passports && data.passports.length > 0 ? data.passports[0] : null;

  return (
    <div className="p-4 bg-gray-100 rounded mb-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800 text-lg">
          Section 7 - Passport Information
        </h3>
        <label className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Have Passport:</span>
          <input
            type="checkbox"
            checked={hasPassport}
            onChange={(e) => handleHasPassportChange(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
        </label>
      </div>

      {hasPassport && passport && (
        <div className="mb-6 p-4 border border-gray-300 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              Passport Type:
              <select
                value={passport.type?.value || "Regular"}
                onChange={(e) =>
                  onInputChange(
                    `${path}.passports[0].type.value`,
                    e.target.value
                  )
                }
                className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                disabled={isReadOnlyField(
                  `${path}.passports[0].type.value`
                )}
              >
                <option value="Regular">Regular</option>
                <option value="Diplomatic">Diplomatic</option>
                <option value="Official">Official</option>
              </select>
            </label>
            <label className="block">
              Passport Number:
              <input
                type="text"
                value={passport.number?.value || ""}
                onChange={(e) =>
                  onInputChange(
                    `${path}.passports[0].number.value`,
                    e.target.value
                  )
                }
                className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                readOnly={isReadOnlyField(
                  `${path}.passports[0].number.value`
                )}
              />
            </label>
            <label className="block">
              Issue Date:
              <input
                type="text"
                value={passport.issueDate?.value || ""}
                onChange={(e) =>
                  onInputChange(
                    `${path}.passports[0].issueDate.value`,
                    e.target.value
                  )
                }
                placeholder="mm-dd-yyyy"
                className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                readOnly={isReadOnlyField(
                  `${path}.passports[0].issueDate.value`
                )}
              />
            </label>
            <label className="block">
              Expiration Date:
              <input
                type="text"
                value={passport.expirationDate?.value || ""}
                onChange={(e) =>
                  onInputChange(
                    `${path}.passports[0].expirationDate.value`,
                    e.target.value
                  )
                }
                placeholder="mm-dd-yyyy"
                className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                readOnly={isReadOnlyField(
                  `${path}.passports[0].expirationDate.value`
                )}
              />
            </label>
            <label className="block">
              Issuing Country:
              <input
                type="text"
                value={passport.issueCountry?.value || ""}
                onChange={(e) =>
                  onInputChange(
                    `${path}.passports[0].issueCountry.value`,
                    e.target.value
                  )
                }
                className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                readOnly={isReadOnlyField(
                  `${path}.passports[0].issueCountry.value`
                )}
              />
            </label>
            <label className="block">
              Place of Issue:
              <input
                type="text"
                value={passport.placeOfIssue?.value || ""}
                onChange={(e) =>
                  onInputChange(
                    `${path}.passports[0].placeOfIssue.value`,
                    e.target.value
                  )
                }
                className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                readOnly={isReadOnlyField(
                  `${path}.passports[0].placeOfIssue.value`
                )}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export { RenderPassportInfo };