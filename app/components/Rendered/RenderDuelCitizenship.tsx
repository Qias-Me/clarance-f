import React from "react";
import FormInfo from "api_v2/interfaces/FormInfo";
import {
  CitizenshipDetail,
  DualCitizenshipFormData,
  PassportDetail,
  PassportUse,
} from "api_v2/interfaces/DuelCitizenship";

interface FormProps {
  data: DualCitizenshipFormData;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, inpersonalInfodex: number) => void;
  isValidValue: (path: string, value: any) => boolean;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
  actionType?: string;
}

const RenderDualCitizenshipInfo: React.FC<FormProps> = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  isValidValue,
  getDefaultNewItem,
  isReadOnlyField,
  path,
  formInfo,
}) => {
  // Updated styling for buttons
  const addButtonStyles =
    "mt-2 px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out";
  const removeButtonStyles =
    "mt-2 px-4 py-2 bg-red-600 text-white font-semibold text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 ease-in-out";

  const handleRemovePassport = (index: number) => {
    onRemoveEntry(`${path}.passports`, index);
  };

  const handleRemovePassportUse = (passportIndex: number, useIndex: number) => {
    onRemoveEntry(`${path}.passports[${passportIndex}].passportUses`, useIndex);
  };

  const handleRemoveCitizenship = (index: number) => {
    onRemoveEntry(`${path}.citizenships`, index);
  };

  const renderCitizenshipDetail = (
    citizenship: CitizenshipDetail,
    index: number
  ) => (
    <div key={index} className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h4 className="text-lg font-semibold">Entry #{index + 1}</h4>

      <label className="block">
        Provide country of citizenship:
        <input
          type="text"
          value={citizenship.country}
          onChange={(e) =>
            onInputChange(
              `${path}.citizenships[${index}].country`,
              e.target.value
            )
          }
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        How did you acquire this non-U.S. citizenship you now have or previously
        had?
        <input
          type="text"
          value={citizenship.howCitizenshipAcquired}
          onChange={(e) =>
            onInputChange(
              `${path}.citizenships[${index}].howCitizenshipAcquired`,
              e.target.value
            )
          }
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        From Date (Month/Year):
        <input
          type="text"
          value={citizenship.citizenshipStart}
          onChange={(e) =>
            onInputChange(
              `${path}.citizenships[${index}].citizenshipStart`,
              e.target.value
            )
          }
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={citizenship.isCitizenshipStartEstimated}
            onChange={(e) =>
              onInputChange(
                `${path}.citizenships[${index}].isCitizenshipStartEstimated`,
                e.target.checked
              )
            }
            className="mr-2"
          />
          Est.
        </label>
      </label>

      <label className="block">
        To Date (Month/Year):
        <input
          type="text"
          value={citizenship.citizenshipEnd}
          onChange={(e) =>
            onInputChange(
              `${path}.citizenships[${index}].citizenshipEnd`,
              e.target.value
            )
          }
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={citizenship.isCitizenshipEndEstimated}
            onChange={(e) =>
              onInputChange(
                `${path}.citizenships[${index}].isCitizenshipEndEstimated`,
                e.target.checked
              )
            }
            className="mr-2"
          />
          Est.
        </label>
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={citizenship.isCitizenshipEndPresent}
            onChange={(e) =>
              onInputChange(
                `${path}.citizenships[${index}].isCitizenshipEndPresent`,
                e.target.checked
              )
            }
            className="mr-2"
          />
          Present
        </label>
      </label>

      <label className="block">
        Have you taken any action to renounce your foreign citizenship?
        <input
          type="checkbox"
          checked={citizenship.isRenounced}
          onChange={(e) =>
            onInputChange(
              `${path}.citizenships[${index}].isRenounced`,
              e.target.checked
            )
          }
          className="mt-1 mr-2"
        />
        YES
        <input
          type="text"
          value={citizenship.renouncementDetails}
          onChange={(e) =>
            onInputChange(
              `${path}.citizenships[${index}].renouncementDetails`,
              e.target.value
            )
          }
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Do you currently hold citizenship with this country?
        <input
          type="checkbox"
          checked={citizenship.isCitizenshipHeld}
          onChange={(e) =>
            onInputChange(
              `${path}.citizenships[${index}].isCitizenshipHeld`,
              e.target.checked
            )
          }
          className="mt-1 mr-2"
        />
        YES
        <input
          type="text"
          value={citizenship.citizenshipExplanation}
          onChange={(e) =>
            onInputChange(
              `${path}.citizenships[${index}].citizenshipExplanation`,
              e.target.value
            )
          }
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <button
        onClick={() => handleRemoveCitizenship(index)}
        className="mt-2 p-2 bg-red-500 text-white rounded-md"
      >
        Remove Entry
      </button>
    </div>
  );

  const renderPassportUseDetail = (
    passportIndex: number,
    passportUse: PassportUse,
    useIndex: number
  ) => (
    <div key={useIndex} className="p-4 bg-gray-100 rounded-lg shadow space-y-4">
      <h4 className="text-lg font-semibold">Travel Entry #{useIndex + 1}</h4>

      <label className="block">
        Country:
        <input
          type="text"
          value={passportUse.passportCountry}
          onChange={(e) =>
            onInputChange(
              `${path}.passports[${passportIndex}].passportUses[${useIndex}].passportCountry`,
              e.target.value
            )
          }
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        From Date (Month/Year):
        <input
          type="text"
          value={passportUse.fromDate}
          onChange={(e) =>
            onInputChange(
              `${path}.passports[${passportIndex}].passportUses[${useIndex}].fromDate`,
              e.target.value
            )
          }
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={passportUse.isFromDateEst}
            onChange={(e) =>
              onInputChange(
                `${path}.passports[${passportIndex}].passportUses[${useIndex}].isFromDateEst`,
                e.target.checked
              )
            }
            className="mr-2"
          />
          Est.
        </label>
      </label>

      <label className="block">
        To Date (Month/Year):
        <input
          type="text"
          value={passportUse.toDate}
          onChange={(e) =>
            onInputChange(
              `${path}.passports[${passportIndex}].passportUses[${useIndex}].toDate`,
              e.target.value
            )
          }
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={passportUse.isToDateEst}
            onChange={(e) =>
              onInputChange(
                `${path}.passports[${passportIndex}].passportUses[${useIndex}].isToDateEst`,
                e.target.checked
              )
            }
            className="mr-2"
          />
          Est.
        </label>
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={passportUse.isVisitCurrent}
            onChange={(e) =>
              onInputChange(
                `${path}.passports[${passportIndex}].passportUses[${useIndex}].isVisitCurrent`,
                e.target.checked
              )
            }
            className="mr-2"
          />
          Present
        </label>
      </label>

      <button
        onClick={() => handleRemovePassportUse(passportIndex, useIndex)}
        className={removeButtonStyles}
      >
        Remove Travel Entry
      </button>
    </div>
  );

  const renderPassportDetail = (passport: PassportDetail, index: number) => (
    <div key={index} className="p-4 bg-gray-100 rounded-lg shadow space-y-4">
      <h4 className="text-lg font-semibold">Entry #{index + 1}</h4>

      <div className="space-y-2">
        <label htmlFor={`countryIssued-${index}`} className="block">
          Provide the country in which the passport (or identity card) was
          issued:
        </label>
        <input
          type="text"
          id={`countryIssued-${index}`}
          value={passport.countryIssued}
          placeholder="Country Issued"
          onChange={(e) =>
            onInputChange(
              `${path}.passports[${index}].countryIssued`,
              e.target.value
            )
          }
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={`passportDateIssued-${index}`} className="block">
          Provide the date the passport (or identity card) was issued
          (Month/Day/Year):
        </label>
        <input
          type="text"
          id={`passportDateIssued-${index}`}
          value={passport.passportDateIssued}
          placeholder="Date Issued"
          onChange={(e) =>
            onInputChange(
              `${path}.passports[${index}].passportDateIssued`,
              e.target.value
            )
          }
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            id={`isPassportDateEst-${index}`}
            checked={passport.isPassportDateEst}
            onChange={(e) =>
              onInputChange(
                `${path}.passports[${index}].isPassportDateEst`,
                e.target.checked
              )
            }
            className="mr-2"
          />
          Est.
        </label>
      </div>

      <div className="space-y-2">
        <label htmlFor={`passportCity-${index}`} className="block">
          Provide the place the passport (or identity card) was issued:
        </label>
        <input
          type="text"
          id={`passportCity-${index}`}
          value={passport.passportCity}
          placeholder="City"
          onChange={(e) =>
            onInputChange(
              `${path}.passports[${index}].passportCity`,
              e.target.value
            )
          }
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <input
          type="text"
          id={`passportCountry-${index}`}
          value={passport.passportCountry}
          placeholder="Country"
          onChange={(e) =>
            onInputChange(
              `${path}.passports[${index}].passportCountry`,
              e.target.value
            )
          }
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={`passportLName-${index}`} className="block">
          Provide the name in which passport (or identity card) was issued:
        </label>
        <input
          type="text"
          id={`passportLName-${index}`}
          value={passport.passportLName}
          placeholder="Last Name"
          onChange={(e) =>
            onInputChange(
              `${path}.passports[${index}].passportLName`,
              e.target.value
            )
          }
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <input
          type="text"
          id={`passportFName-${index}`}
          value={passport.passportFName}
          placeholder="First Name"
          onChange={(e) =>
            onInputChange(
              `${path}.passports[${index}].passportFName`,
              e.target.value
            )
          }
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <input
          type="text"
          id={`passportMName-${index}`}
          value={passport.passportMName}
          placeholder="Middle Name"
          onChange={(e) =>
            onInputChange(
              `${path}.passports[${index}].passportMName`,
              e.target.value
            )
          }
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <input
          type="text"
          id={`passportSuffix-${index}`}
          value={passport.passportSuffix}
          placeholder="Suffix"
          onChange={(e) =>
            onInputChange(
              `${path}.passports[${index}].passportSuffix`,
              e.target.value
            )
          }
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={`passportNumber-${index}`} className="block">
          Provide the passport (or identity card) number:
        </label>
        <input
          type="text"
          id={`passportNumber-${index}`}
          value={passport.passportNumber}
          placeholder="Passport Number"
          onChange={(e) =>
            onInputChange(
              `${path}.passports[${index}].passportNumber`,
              e.target.value
            )
          }
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={`passportExpiration-${index}`} className="block">
          Provide the passport (or identity card) expiration date
          (Month/Day/Year):
        </label>
        <input
          type="text"
          id={`passportExpiration-${index}`}
          value={passport.passportExpiration}
          placeholder="Expiration Date"
          onChange={(e) =>
            onInputChange(
              `${path}.passports[${index}].passportExpiration`,
              e.target.value
            )
          }
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            id={`isExpirationEst-${index}`}
            checked={passport.isExpirationEst}
            onChange={(e) =>
              onInputChange(
                `${path}.passports[${index}].isExpirationEst`,
                e.target.checked
              )
            }
            className="mr-2"
          />
          Est.
        </label>
      </div>

      <div className="space-y-2">
        <label htmlFor={`isPassportUsed-${index}`} className="block">
          Have you EVER used this passport (or identity card) for foreign
          travel?
        </label>
        <input
          type="checkbox"
          id={`isPassportUsed-${index}`}
          checked={passport.isPassportUsed}
          onChange={(e) =>
            onInputChange(
              `${path}.passports[${index}].isPassportUsed`,
              e.target.checked
            )
          }
          className="mt-1 mr-2"
        />
        YES
      </div>

  
  
      <button
        onClick={() => handleRemovePassport(index)}
        className={removeButtonStyles}
      >
        Remove Passport Entry
      </button>
    </div>
  );

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold">
          SECTION 10 - Dual/Multiple Citizenship & Foreign Passport Information
        </h3>

        <label className="block">
          Do you now or have you EVER held dual/multiple citizenships?
          <input
            type="checkbox"
            checked={data.heldMultipleCitizenships}
            onChange={(e) =>
              onInputChange(
                `${path}.heldMultipleCitizenships`,
                e.target.checked
              )
            }
            className="mt-1 mr-2"
          />
          YES
        </label>

        {data.heldMultipleCitizenships && (
          <div>
            {data.citizenships.map((citizenship, index) =>
              renderCitizenshipDetail(citizenship, index)
            )}
            {data.citizenships.length < 2 && (
              <button
                onClick={(event) => {
                  event.preventDefault();

                  onAddEntry(
                    `${path}.citizenships`,
                    getDefaultNewItem("dualCitizenshipInfo.citizenships")
                  );
                  
                }}
                className="mt-2 p-2 bg-blue-500 text-white rounded-md"
              >
                Add Citizenship Entry
              </button>
            )}
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold">
        10.2 Have you EVER been issued a passport (or identity card for travel)
        by a country other than the U.S.?
      </h3>

      <label className="block">
        Do you now or have you EVER held dual/multiple passports?
        <input
          type="checkbox"
          checked={data.hadNonUSPassport}
          onChange={(e) =>
            onInputChange(`${path}.hadNonUSPassport`, e.target.checked)
          }
          className="mt-1 mr-2"
        />
        YES
      </label>

      {data.hadNonUSPassport && (
        <div>
          {data.passports.map((passport, index) =>
            renderPassportDetail(passport, index)
          )}
          {data.passports.length < 2 && (
            <button
              onClick={(event) => {
                event.preventDefault();

                onAddEntry(
                  `${path}.passports`,
                  getDefaultNewItem("dualCitizenshipInfo.passports")
                );
              }}
              className={addButtonStyles}
            >
              Add Passport Entry
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export { RenderDualCitizenshipInfo };
