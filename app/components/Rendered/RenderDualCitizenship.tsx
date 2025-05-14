import React, { useCallback, useMemo, memo } from "react";
import { type DualCitizenshipInfo } from "api/interfaces/sections/duelCitizenship";
import { type FormInfo } from "api/interfaces/FormInfo";
import { CountryOptions, SuffixOptions } from "api/enums/enums";

interface FormProps {
  data: DualCitizenshipInfo;
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

// Helper function to format dates as mm/dd/yyyy
const formatDateInput = (value: string) => {
  if (!value) return "";
  
  // Remove non-numeric characters
  let numericValue = value.replace(/\D/g, '');
  
  // Limit to 8 digits
  if (numericValue.length > 8) {
    numericValue = numericValue.substring(0, 8);
  }
  
  // Format as mm/dd/yyyy
  if (numericValue.length >= 5) {
    return `${numericValue.substring(0, 2)}/${numericValue.substring(2, 4)}/${numericValue.substring(4)}`;
  } else if (numericValue.length >= 3) {
    return `${numericValue.substring(0, 2)}/${numericValue.substring(2)}`;
  } else if (numericValue.length > 0) {
    return numericValue;
  }
  
  return "";
};

// Helper function to handle date input changes
const handleDateChange = (
  value: string, 
  path: string, 
  fieldPath: string, 
  onInputChange: (path: string, value: any) => void,
  isValidValue: (path: string, value: any) => boolean
) => {
  const formattedDate = formatDateInput(value);
  if (isValidValue(`${path}.${fieldPath}.value`, formattedDate)) {
    onInputChange(`${path}.${fieldPath}.value`, formattedDate);
  }
};

// This component renders section 10: Dual/Multiple Citizenship
const RenderDualCitizenshipInfo: React.FC<FormProps> = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  isValidValue,
  getDefaultNewItem,
  path,
}) => {
  const dualCitizenshipInfo = data;

  const handleAddCitizenship = useCallback(() => {
    const newCitizenship = getDefaultNewItem("dualCitizenshipInfo.citizenships");
    onAddEntry(`${path}.citizenships`, newCitizenship);
  }, [getDefaultNewItem, onAddEntry, path]);

  const handleRemoveCitizenship = useCallback((index: number) => {
    onRemoveEntry(`${path}.citizenships`, index);
  }, [onRemoveEntry, path]);

  const handleAddPassport = useCallback(() => {
    const newPassport = getDefaultNewItem("dualCitizenshipInfo.passports");
    onAddEntry(`${path}.passports`, newPassport);
  }, [getDefaultNewItem, onAddEntry, path]);

  const handleRemovePassport = useCallback((index: number) => {
    onRemoveEntry(`${path}.passports`, index);
  }, [onRemoveEntry, path]);

  const handleAddPassportUse = useCallback((passportIndex: number) => {
    const newPassportUse = getDefaultNewItem("dualCitizenshipInfo.passports.passportUses");
    // Ensure the passportUses array exists before adding to it
    if (!dualCitizenshipInfo.passports?.[passportIndex]?.passportUses) {
      onInputChange(`${path}.passports[${passportIndex}].passportUses`, []);
    }
    onAddEntry(`${path}.passports[${passportIndex}].passportUses`, newPassportUse);
  }, [getDefaultNewItem, onAddEntry, onInputChange, path, dualCitizenshipInfo.passports]);

  const handleRemovePassportUse = useCallback((passportIndex: number, useIndex: number) => {
    onRemoveEntry(`${path}.passports[${passportIndex}].passportUses`, useIndex);
  }, [onRemoveEntry, path]);

  // Optimize date change handling
  const handleDateChangeCallback = useCallback((
    value: string,
    fieldPath: string,
    parentPath: string,
  ) => {
    handleDateChange(
      value,
      parentPath,
      fieldPath,
      onInputChange,
      isValidValue
    );
  }, [onInputChange, isValidValue]);

  const renderCitizenshipEntries = useMemo(() => {
    if (!dualCitizenshipInfo.citizenships) return null;
    
    return dualCitizenshipInfo.citizenships.map((citizenship, index) => (
      <div key={citizenship._id} className="border p-4 rounded-md mb-4 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h5 className="font-medium">Citizenship {index + 1}</h5>
          {index > 0 && (
            <button
              type="button"
              onClick={() => handleRemoveCitizenship(index)}
              className="px-2 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
            >
              Remove
            </button>
          )}
          </div>

        {/* Country and acquisition method */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country of citizenship
            </label>
            <select
              value={citizenship.country.value}
              onChange={(e) => {
                if (isValidValue(`${path}.citizenships[${index}].country.value`, e.target.value)) {
                  onInputChange(`${path}.citizenships[${index}].country.value`, e.target.value);
                }
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select a country</option>
              {Object.entries(CountryOptions).map(([key, value]) => (
                <option key={key} value={value}>
                  {value}
                </option>
              ))}
            </select>
                    </div>
                    
                    <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How was this citizenship acquired?
            </label>
            <input
              type="text"
              value={citizenship.howCitizenshipAcquired.value}
              onChange={(e) => {
                if (isValidValue(`${path}.citizenships[${index}].howCitizenshipAcquired.value`, e.target.value)) {
                  onInputChange(`${path}.citizenships[${index}].howCitizenshipAcquired.value`, e.target.value);
                }
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
                    </div>
                    
        {/* Start and end dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date citizenship acquired (MM/DD/YYYY)
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={citizenship.citizenshipStart.value}
                onChange={(e) => {
                  handleDateChangeCallback(
                    e.target.value,
                    "citizenshipStart",
                    `${path}.citizenships[${index}]`
                  );
                }}
                placeholder="MM/DD/YYYY"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <label className="inline-flex items-center ml-2">
                <input
                  type="checkbox"
                  checked={citizenship.isCitizenshipStartEstimated.value === "Yes"}
                  onChange={(e) => {
                    onInputChange(
                      `${path}.citizenships[${index}].isCitizenshipStartEstimated.value`,
                      e.target.checked ? "Yes" : "No"
                    );
                  }}
                  className="mr-1"
                />
                <span className="text-sm">Est</span>
              </label>
            </div>
                      </div>
                      
                      <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date citizenship renounced, relinquished, or ended (MM/DD/YYYY)
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={citizenship.citizenshipEnd?.value || ""}
                onChange={(e) => {
                  handleDateChangeCallback(
                    e.target.value,
                    "citizenshipEnd",
                    `${path}.citizenships[${index}]`
                  );
                }}
                placeholder="MM/DD/YYYY"
                disabled={citizenship.isCitizenshipEndPresent.value === "Yes"}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              />
              <div className="flex flex-col ml-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={citizenship.isCitizenshipEndPresent.value === "Yes"}
                    onChange={(e) => {
                      onInputChange(
                        `${path}.citizenships[${index}].isCitizenshipEndPresent.value`,
                        e.target.checked ? "Yes" : "No"
                      );
                      if (e.target.checked) {
                        onInputChange(`${path}.citizenships[${index}].citizenshipEnd.value`, "");
                      }
                    }}
                    className="mr-1"
                  />
                  <span className="text-sm">Present</span>
                </label>
                {citizenship.isCitizenshipEndPresent.value !== "Yes" && (
                  <label className="inline-flex items-center mt-1">
                    <input
                      type="checkbox"
                      checked={citizenship.isCitizenshipEndEstimated?.value === "Yes"}
                      onChange={(e) => {
                        onInputChange(
                          `${path}.citizenships[${index}].isCitizenshipEndEstimated.value`,
                          e.target.checked ? "Yes" : "No"
                        );
                      }}
                      className="mr-1"
                    />
                    <span className="text-sm">Est</span>
                  </label>
                )}
              </div>
            </div>
                      </div>
                    </div>
                    
        {/* Remaining citizenship fields... */}
        <div className="mb-4">
          <label className="block font-medium text-gray-700 mb-2">
            Have you taken any action to renounce your foreign citizenship?
          </label>
          <div className="mt-1 space-y-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name={`${path}.citizenships[${index}].isRenounced.value`}
                value="YES"
                checked={citizenship.isRenounced.value === "YES"}
                onChange={() => onInputChange(`${path}.citizenships[${index}].isRenounced.value`, "YES")}
                className="mr-2"
              />
              Yes
            </label>
            <label className="inline-flex items-center ml-4">
              <input
                type="radio"
                name={`${path}.citizenships[${index}].isRenounced.value`}
                value="NO"
                checked={citizenship.isRenounced.value === "NO"}
                onChange={() => onInputChange(`${path}.citizenships[${index}].isRenounced.value`, "NO")}
                className="mr-2"
              />
              No
            </label>
          </div>
        </div>
                      
                      {citizenship.isRenounced.value === "YES" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provide explanation
            </label>
            <textarea
              value={citizenship.renouncementDetails?.value || ""}
              onChange={(e) => {
                if (isValidValue(`${path}.citizenships[${index}].renouncementDetails.value`, e.target.value)) {
                  onInputChange(`${path}.citizenships[${index}].renouncementDetails.value`, e.target.value);
                }
              }}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
                        </div>
                      )}

        <div className="mb-4">
          <label className="block font-medium text-gray-700 mb-2">
            Do you currently hold this citizenship?
          </label>
          <div className="mt-1 space-y-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name={`${path}.citizenships[${index}].isCitizenshipHeld.value`}
                value="YES"
                checked={citizenship.isCitizenshipHeld.value === "YES"}
                onChange={() => onInputChange(`${path}.citizenships[${index}].isCitizenshipHeld.value`, "YES")}
                className="mr-2"
              />
              Yes
            </label>
            <label className="inline-flex items-center ml-4">
              <input
                type="radio"
                name={`${path}.citizenships[${index}].isCitizenshipHeld.value`}
                value="NO"
                checked={citizenship.isCitizenshipHeld.value === "NO"}
                onChange={() => onInputChange(`${path}.citizenships[${index}].isCitizenshipHeld.value`, "NO")}
                className="mr-2"
              />
              No
            </label>
          </div>
                    </div>
                      
                      {citizenship.isCitizenshipHeld.value === "NO" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provide explanation
            </label>
            <textarea
              value={citizenship.citizenshipExplanation?.value || ""}
              onChange={(e) => {
                if (isValidValue(`${path}.citizenships[${index}].citizenshipExplanation.value`, e.target.value)) {
                  onInputChange(`${path}.citizenships[${index}].citizenshipExplanation.value`, e.target.value);
                }
              }}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
                        </div>
                      )}
                    </div>
    ));
  }, [dualCitizenshipInfo.citizenships, handleDateChangeCallback, handleRemoveCitizenship, isValidValue, onInputChange, path]);

  // Use memo for heldMultipleCitizenships radio group to prevent re-renders
  const renderMultipleCitizenshipRadio = useMemo(() => (
    <div className="mb-4">
      <label className="block font-medium text-gray-700 mb-2">
        Have you EVER held dual/multiple citizenships?
      </label>
      <div className="mt-1 space-y-2">
        <label className="inline-flex items-center">
          <input
            type="radio"
            name={`${path}.heldMultipleCitizenships.value`}
            value="YES"
            checked={dualCitizenshipInfo.heldMultipleCitizenships.value === "YES"}
            onChange={() => onInputChange(`${path}.heldMultipleCitizenships.value`, "YES")}
            className="mr-2"
          />
          Yes
        </label>
        <label className="inline-flex items-center ml-4">
          <input
            type="radio"
            name={`${path}.heldMultipleCitizenships.value`}
            value="NO (If NO, proceed to 10.2)"
            checked={dualCitizenshipInfo.heldMultipleCitizenships.value === "NO (If NO, proceed to 10.2)"}
            onChange={() => onInputChange(`${path}.heldMultipleCitizenships.value`, "NO (If NO, proceed to 10.2)")}
            className="mr-2"
          />
          No (If NO, proceed to 10.2)
        </label>
      </div>
    </div>
  ), [dualCitizenshipInfo.heldMultipleCitizenships.value, onInputChange, path]);

  // Use memo for hadNonUSPassport radio group
  const renderNonUSPassportRadio = useMemo(() => (
    <div className="mb-4">
      <label className="block font-medium text-gray-700 mb-2">
        Have you EVER been issued a passport (or identity card for travel) by a country other than the U.S.?
      </label>
      <div className="mt-1 space-y-2">
        <label className="inline-flex items-center">
          <input
            type="radio"
            name={`${path}.hadNonUSPassport.value`}
            value="YES"
            checked={dualCitizenshipInfo.hadNonUSPassport.value === "YES"}
            onChange={() => onInputChange(`${path}.hadNonUSPassport.value`, "YES")}
            className="mr-2"
          />
          Yes
        </label>
        <label className="inline-flex items-center ml-4">
          <input
            type="radio"
            name={`${path}.hadNonUSPassport.value`}
            value="NO (If NO, proceed to Section 11)"
            checked={dualCitizenshipInfo.hadNonUSPassport.value === "NO (If NO, proceed to Section 11)"}
            onChange={() => onInputChange(`${path}.hadNonUSPassport.value`, "NO (If NO, proceed to Section 11)")}
            className="mr-2"
          />
          No (If NO, proceed to Section 11)
        </label>
                  </div>
              </div>
  ), [dualCitizenshipInfo.hadNonUSPassport.value, onInputChange, path]);

  // Use memo for renderPassportEntries to prevent re-renders
  const renderPassportEntries = useMemo(() => {
    if (!dualCitizenshipInfo.passports) return null;
    
    return dualCitizenshipInfo.passports.map((passport, index) => (
      <div key={passport._id} className="border p-4 rounded-md mb-4 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h5 className="font-medium">Passport {index + 1}</h5>
          {index > 0 && (
            <button
              type="button"
              onClick={() => handleRemovePassport(index)}
              className="px-2 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
            >
              Remove
            </button>
          )}
        </div>

        {/* Country issued and date issued */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country in which passport was issued
            </label>
            <select
              value={passport.countryIssued.value}
              onChange={(e) => {
                if (isValidValue(`${path}.passports[${index}].countryIssued.value`, e.target.value)) {
                  onInputChange(`${path}.passports[${index}].countryIssued.value`, e.target.value);
                }
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select a country</option>
              {Object.entries(CountryOptions).map(([key, value]) => (
                <option key={key} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date passport issued (MM/DD/YYYY)
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={passport.passportDateIssued.value}
                onChange={(e) => {
                  handleDateChangeCallback(
                    e.target.value,
                    "passportDateIssued",
                    `${path}.passports[${index}]`
                  );
                }}
                placeholder="MM/DD/YYYY"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <label className="inline-flex items-center ml-2">
                <input
                  type="checkbox"
                  checked={passport.isPassportDateEst.value === "Yes"}
                  onChange={(e) => {
                    onInputChange(
                      `${path}.passports[${index}].isPassportDateEst.value`,
                      e.target.checked ? "Yes" : "No"
                    );
                  }}
                  className="mr-1"
                />
                <span className="text-sm">Est</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Passport location fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City where issued
            </label>
            <input
              type="text"
              value={passport.passportCity.value}
              onChange={(e) => {
                if (isValidValue(`${path}.passports[${index}].passportCity.value`, e.target.value)) {
                  onInputChange(`${path}.passports[${index}].passportCity.value`, e.target.value);
                }
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
                    </div>
                    
                      <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country where issued
            </label>
            <select
              value={passport.passportCountry.value}
              onChange={(e) => {
                if (isValidValue(`${path}.passports[${index}].passportCountry.value`, e.target.value)) {
                  onInputChange(`${path}.passports[${index}].passportCountry.value`, e.target.value);
                }
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select a country</option>
              {Object.entries(CountryOptions).map(([key, value]) => (
                <option key={key} value={value}>
                  {value}
                </option>
              ))}
            </select>
                      </div>
                    </div>

        {/* Passport name fields */}
        <h6 className="text-sm font-medium text-gray-700 mb-2">Name in which passport was issued</h6>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last name
            </label>
            <input
              type="text"
              value={passport.passportLName.value}
              onChange={(e) => {
                if (isValidValue(`${path}.passports[${index}].passportLName.value`, e.target.value)) {
                  onInputChange(`${path}.passports[${index}].passportLName.value`, e.target.value);
                }
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
                      </div>

                      <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First name
            </label>
            <input
              type="text"
              value={passport.passportFName.value}
              onChange={(e) => {
                if (isValidValue(`${path}.passports[${index}].passportFName.value`, e.target.value)) {
                  onInputChange(`${path}.passports[${index}].passportFName.value`, e.target.value);
                }
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
                    </div>

                    <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Middle name
            </label>
            <input
              type="text"
              value={passport.passportMName.value}
              onChange={(e) => {
                if (isValidValue(`${path}.passports[${index}].passportMName.value`, e.target.value)) {
                  onInputChange(`${path}.passports[${index}].passportMName.value`, e.target.value);
                }
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
                        </div>
          
                        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Suffix
            </label>
            <select
              value={passport.passportSuffix.value}
              onChange={(e) => {
                if (isValidValue(`${path}.passports[${index}].passportSuffix.value`, e.target.value)) {
                  onInputChange(`${path}.passports[${index}].passportSuffix.value`, e.target.value);
                }
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select a suffix</option>
              {Object.entries(SuffixOptions).map(([key, value]) => (
                <option key={key} value={value}>
                  {value}
                </option>
              ))}
            </select>
                      </div>
                    </div>

        {/* Passport number and expiration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passport number
            </label>
            <input
              type="text"
              value={passport.passportNumber.value}
              onChange={(e) => {
                if (isValidValue(`${path}.passports[${index}].passportNumber.value`, e.target.value)) {
                  onInputChange(`${path}.passports[${index}].passportNumber.value`, e.target.value);
                }
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
                    </div>

                      <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passport expiration date (MM/DD/YYYY)
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={passport.passportExpiration.value}
                onChange={(e) => {
                  handleDateChangeCallback(
                    e.target.value,
                    "passportExpiration",
                    `${path}.passports[${index}]`
                  );
                }}
                placeholder="MM/DD/YYYY"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <label className="inline-flex items-center ml-2">
                <input
                  type="checkbox"
                  checked={passport.isExpirationEst.value === "Yes"}
                  onChange={(e) => {
                    onInputChange(
                      `${path}.passports[${index}].isExpirationEst.value`,
                      e.target.checked ? "Yes" : "No"
                    );
                  }}
                  className="mr-1"
                />
                <span className="text-sm">Est</span>
              </label>
            </div>
                      </div>
                    </div>

        {/* Passport usage question */}
        <div className="mb-4">
          <label className="block font-medium text-gray-700 mb-2">
            Have you EVER used this passport for travel?
          </label>
          <div className="mt-1 space-y-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name={`passportUsed-${passport._id}`}
                value="YES"
                checked={passport.isPassportUsed.value === "YES"}
                onChange={() => onInputChange(`${path}.passports[${index}].isPassportUsed.value`, "YES")}
                className="mr-2"
              />
              Yes
            </label>
            <label className="inline-flex items-center ml-4">
              <input
                type="radio"
                name={`passportUsed-${passport._id}`}
                value="NO"
                checked={passport.isPassportUsed.value === "NO"}
                onChange={() => onInputChange(`${path}.passports[${index}].isPassportUsed.value`, "NO")}
                className="mr-2"
              />
              No
            </label>
          </div>
                    </div>

        {/* Passport usage details */}
        {passport.isPassportUsed.value === "YES" && (
          <div className="mt-4 mb-4">
            <h6 className="text-sm font-medium text-gray-700 mb-2">Travel Information</h6>
            
            {passport.passportUses && Array.isArray(passport.passportUses) && passport.passportUses.map((use, useIndex) => (
              <div key={use._id} className="border p-3 rounded-md mb-3 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium">Travel Entry {useIndex + 1}</p>
                  <button
                    type="button"
                    onClick={() => handleRemovePassportUse(index, useIndex)}
                    className="px-2 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country of travel
                  </label>
                  <select
                    value={use.passportCountry.value}
                    onChange={(e) => {
                      if (isValidValue(`${path}.passports[${index}].passportUses[${useIndex}].passportCountry.value`, e.target.value)) {
                        onInputChange(`${path}.passports[${index}].passportUses[${useIndex}].passportCountry.value`, e.target.value);
                      }
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select a country</option>
                    {Object.entries(CountryOptions).map(([key, value]) => (
                      <option key={key} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                              </div>
                              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date from (MM/DD/YYYY)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={use.fromDate.value}
                        onChange={(e) => {
                          handleDateChangeCallback(
                            e.target.value,
                            "fromDate",
                            `${path}.passports[${index}].passportUses[${useIndex}]`
                          );
                        }}
                        placeholder="MM/DD/YYYY"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <label className="inline-flex items-center ml-2">
                        <input
                          type="checkbox"
                          checked={use.isFromDateEst.value === "Yes"}
                          onChange={(e) => {
                            onInputChange(
                              `${path}.passports[${index}].passportUses[${useIndex}].isFromDateEst.value`,
                              e.target.checked ? "Yes" : "No"
                            );
                          }}
                          className="mr-1"
                        />
                        <span className="text-sm">Est</span>
                      </label>
                    </div>
                                </div>

                                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date to (MM/DD/YYYY)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={use.toDate.value}
                        onChange={(e) => {
                          handleDateChangeCallback(
                            e.target.value,
                            "toDate",
                            `${path}.passports[${index}].passportUses[${useIndex}]`
                          );
                        }}
                        placeholder="MM/DD/YYYY"
                        disabled={use.isVisitCurrent.value === "Yes"}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                      />
                      <div className="flex flex-col ml-2">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={use.isVisitCurrent.value === "Yes"}
                            onChange={(e) => {
                              onInputChange(
                                `${path}.passports[${index}].passportUses[${useIndex}].isVisitCurrent.value`,
                                e.target.checked ? "Yes" : "No"
                              );
                              if (e.target.checked) {
                                onInputChange(`${path}.passports[${index}].passportUses[${useIndex}].toDate.value`, "");
                              }
                            }}
                            className="mr-1"
                          />
                          <span className="text-sm">Present</span>
                        </label>
                        {use.isVisitCurrent.value !== "Yes" && (
                          <label className="inline-flex items-center mt-1">
                            <input
                              type="checkbox"
                              checked={use.isToDateEst.value === "Yes"}
                              onChange={(e) => {
                                onInputChange(
                                  `${path}.passports[${index}].passportUses[${useIndex}].isToDateEst.value`,
                                  e.target.checked ? "Yes" : "No"
                                );
                              }}
                              className="mr-1"
                            />
                            <span className="text-sm">Est</span>
                          </label>
                                  )}
                                </div>
                              </div>
                            </div>
                  </div>
              </div>
            ))}
            
            <div className="mt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => handleAddPassportUse(index)}
                disabled={passport.passportUses && Array.isArray(passport.passportUses) && passport.passportUses.length >= 6}
                className={`px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 ${
                  passport.passportUses && Array.isArray(passport.passportUses) && passport.passportUses.length >= 6
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                Add Travel Record
              </button>
              <span className="text-sm text-gray-500">
                {passport.passportUses && Array.isArray(passport.passportUses) ? passport.passportUses.length : 0} of 6 entries
              </span>
            </div>
          </div>
        )}
      </div>
    ));
  }, [dualCitizenshipInfo.passports, handleDateChangeCallback, handleRemovePassport, handleAddPassportUse, handleRemovePassportUse, isValidValue, onInputChange, path]);

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">SECTION 10 - Dual/Multiple Citizenship</h3>

      {/* Multiple Citizenship Question */}
      {renderMultipleCitizenshipRadio}

      {/* Multiple Citizenship Details */}
      {dualCitizenshipInfo.heldMultipleCitizenships.value === "YES" && (
        <div className="border p-4 rounded-md mb-6">
          <h4 className="font-medium text-lg mb-4">Citizenship History</h4>
          
          {renderCitizenshipEntries}
          
          <div className="mt-4 flex justify-between items-center">
            <button
              type="button"
              onClick={handleAddCitizenship}
              disabled={dualCitizenshipInfo.citizenships && dualCitizenshipInfo.citizenships.length >= 2}
              className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${
                dualCitizenshipInfo.citizenships && dualCitizenshipInfo.citizenships.length >= 2
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              Add Another Citizenship
            </button>
            <span className="text-sm text-gray-500">
              {dualCitizenshipInfo.citizenships ? dualCitizenshipInfo.citizenships.length : 0} of 2 entries
            </span>
          </div>
        </div>
      )}

      {/* Foreign Passport Question */}
      {renderNonUSPassportRadio}

      {/* Foreign Passport Details */}
      {dualCitizenshipInfo.hadNonUSPassport.value === "YES" && (
        <div className="border p-4 rounded-md mb-6">
          <h4 className="font-medium text-lg mb-4">Non-U.S. Passport Information</h4>
          
          {renderPassportEntries}
          
          <div className="mt-4 flex justify-between items-center">
            <button
              type="button"
              onClick={handleAddPassport}
              disabled={dualCitizenshipInfo.passports && dualCitizenshipInfo.passports.length >= 2}
              className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${
                dualCitizenshipInfo.passports && dualCitizenshipInfo.passports.length >= 2
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              Add Another Passport
            </button>
            <span className="text-sm text-gray-500">
              {dualCitizenshipInfo.passports ? dualCitizenshipInfo.passports.length : 0} of 2 entries
            </span>
        </div>
      </div>
      )}
    </div>
  );
};

const MemoizedRenderDualCitizenshipInfo = memo(RenderDualCitizenshipInfo);
export { MemoizedRenderDualCitizenshipInfo as RenderDualCitizenshipInfo }; 