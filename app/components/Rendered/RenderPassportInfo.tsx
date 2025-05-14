import { useState, useEffect } from 'react';
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
    if (!data) return;
    
    // Ensure the passport object exists when "hasPassport" is YES
    if (data.hasPassport?.value === "YES" && !data.passport) {
      // Get default passport template from the context
      const defaultPassport = getDefaultNewItem("passportInfo.passport");
      if (defaultPassport) {
        // Set the passport in the form data
        onInputChange(`${path}.passport`, defaultPassport);
      }
    }
  }, [data, data?.hasPassport?.value, onInputChange, path, getDefaultNewItem]);

  const handleHasPassportChange = (checked: boolean) => {
    // Update form data
    setHasPassport(checked);
    onInputChange(`${path}.hasPassport.value`, checked ? "YES" : "NO");
    
    // If toggling to YES and passport doesn't exist
    if (checked && !data.passport) {
      // Get default passport template from the context
      const defaultPassport = getDefaultNewItem("passportInfo.passport");
      if (defaultPassport) {
        // Set the passport in the form data
        onInputChange(`${path}.passport`, defaultPassport);
      }
    }
  };

  // Get the passport (single object, not an array)
  const passport = data.passport;

  return (
    <div className="p-4 bg-gray-100 rounded mb-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800 text-lg">
          Section 8 - Passport Information
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
                value={passport.bookType?.value || "Regular"}
                onChange={(e) =>
                  onInputChange(
                    `${path}.passport.bookType.value`,
                    e.target.value
                  )
                }
                className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                disabled={isReadOnlyField(
                  `${path}.passport.bookType.value`
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
                value={passport.passportNumber?.value || ""}
                onChange={(e) =>
                  onInputChange(
                    `${path}.passport.passportNumber.value`,
                    e.target.value
                  )
                }
                className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                readOnly={isReadOnlyField(
                  `${path}.passport.passportNumber.value`
                )}
              />
            </label>
            
            <div className="block">
              <label className="block">Issue Date:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={passport.issuedDate?.date?.value || ""}
                  onChange={(e) =>
                    onInputChange(
                      `${path}.passport.issuedDate.date.value`,
                      e.target.value
                    )
                  }
                  placeholder="mm-dd-yyyy"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  readOnly={isReadOnlyField(
                    `${path}.passport.issuedDate.date.value`
                  )}
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={passport.issuedDate?.isEstimated?.value === "YES"}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.passport.issuedDate.isEstimated.value`,
                        e.target.checked ? "YES" : "NO"
                      )
                    }
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <label className="ml-1 text-xs text-gray-600">Estimated</label>
                </div>
              </div>
            </div>
            
            <div className="block">
              <label className="block">Expiration Date:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={passport.expirationDate?.date?.value || ""}
                  onChange={(e) =>
                    onInputChange(
                      `${path}.passport.expirationDate.date.value`,
                      e.target.value
                    )
                  }
                  placeholder="mm-dd-yyyy"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  readOnly={isReadOnlyField(
                    `${path}.passport.expirationDate.date.value`
                  )}
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={passport.expirationDate?.isEstimated?.value === "YES"}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.passport.expirationDate.isEstimated.value`,
                        e.target.checked ? "YES" : "NO"
                      )
                    }
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <label className="ml-1 text-xs text-gray-600">Estimated</label>
                </div>
              </div>
            </div>
            
            <label className="block">
              Name on Passport:
              <input
                type="text"
                value={passport.name?.value || ""}
                onChange={(e) =>
                  onInputChange(
                    `${path}.passport.name.value`,
                    e.target.value
                  )
                }
                className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                readOnly={isReadOnlyField(
                  `${path}.passport.name.value`
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