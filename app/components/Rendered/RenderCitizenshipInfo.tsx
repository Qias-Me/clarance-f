import { useState } from 'react';
import { type FormInfo } from "api/interfaces/FormInfo";
import {
  type CitizenshipInfo,
  type CitizenshipByBirthInfo,
  type NaturalizedCitizenInfo,
  type DerivedCitizenInfo,
  type NonCitizenInfo
} from "api/interfaces/sections/citizenship";
import { SuffixOptions, CountryOptions, StateOptions } from "api/enums/enums";

// Define suffixes for dropdown options
// const SuffixOptions = {
//   "": "None",
//   "Jr.": "Jr.",
//   "Sr.": "Sr.",
//   "I": "I",
//   "II": "II",
//   "III": "III",
//   "IV": "IV",
//   "V": "V",
//   "VI": "VI",
//   "VII": "VII",
//   "VIII": "VIII",
//   "IX": "IX",
//   "X": "X",
// };

interface FormProps {
  data: CitizenshipInfo;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  isValidValue: (path: string, value: any) => boolean;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
  actionType?: string;
};

// Mapping descriptions to their corresponding status codes
const citizenshipStatusMapping: Record<string, string> = {
  "I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth. (Proceed to Section 10)   ": "birth",
  "I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country. (Complete 9.1) ": "citizen",
  "I am a naturalized U.S. citizen. (Complete 9.2) ": "naturalized",
  "I am a derived U.S. citizen. (Complete 9.3) ": "derived",
  "I am not a U.S. citizen. (Complete 9.4) ": "nonCitizen",
};

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

const RenderCitizenshipInfo: React.FC<FormProps> = ({
  data,
  onInputChange,
  isValidValue,
  path,
  getDefaultNewItem,
}) => {
  const citizenshipInfo = data;

  const handleCitizenshipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatusDescription = e.target.value;
    const newStatusCode = citizenshipStatusMapping[newStatusDescription] || "";

    if (isValidValue(`${path}.citizenship_status_code.value`, newStatusDescription)) {
      onInputChange(`${path}.citizenship_status_code.value`, newStatusDescription);
      
      // Clear previous section data
      onInputChange(`${path}.section9_1`, undefined);
      onInputChange(`${path}.section9_2`, undefined);
      onInputChange(`${path}.section9_3`, undefined);
      onInputChange(`${path}.section9_4`, undefined);
      
      // Set the appropriate section data based on citizenship type
      if (newStatusCode === "citizen") {
        onInputChange(`${path}.section9_1`, getDefaultNewItem("citizenshipInfo.section9_1"));
      } else if (newStatusCode === "naturalized") {
        onInputChange(`${path}.section9_2`, getDefaultNewItem("citizenshipInfo.section9_2"));
      } else if (newStatusCode === "derived") {
        onInputChange(`${path}.section9_3`, getDefaultNewItem("citizenshipInfo.section9_3"));
      } else if (newStatusCode === "nonCitizen") {
        onInputChange(`${path}.section9_4`, getDefaultNewItem("citizenshipInfo.section9_4"));
      }
    }
  };

  const renderCitizenshipByBirthInfo = (info: CitizenshipByBirthInfo) => (
    <>
      <label className="block">
        Document Type:
        <select
          name={`${path}.section9_1.doc_type.value`}
          value={info?.doc_type?.value || ""}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          onChange={(e) => {
            if (isValidValue(`${path}.section9_1.doc_type.value`, e.target.value)) {
              onInputChange(`${path}.section9_1.doc_type.value`, e.target.value);
            }
          }}
        >
          <option value="">Select document type</option>
          <option value="FS240">FS 240</option>
          <option value="DS1350">DS 1350</option>
          <option value="FS545">FS 545</option>
          <option value="Other (Provide explanation)">Other (Provide explanation)</option>
        </select>
      </label>
      
      {info?.doc_type?.value === "Other (Provide explanation)" && (
        <label className="block">
          Other Document:
          <input
            type="text"
            value={info?.other_doc?.value || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.section9_1.other_doc.value`, e.target.value)) {
                onInputChange(`${path}.section9_1.other_doc.value`, e.target.value);
              }
            }}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          />
        </label>
      )}

      <label className="block">
        Document Number:
        <input
          type="text"
          value={info?.doc_num?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_1.doc_num.value`, e.target.value)) {
              onInputChange(`${path}.section9_1.doc_num.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>
      
      <label className="block">
        Document Issue Date (MM/DD/YYYY):
        <input
          type="text"
          value={info?.doc_issue_date?.value || ""}
          onChange={(e) => {
            handleDateChange(
              e.target.value,
              path,
              "section9_1.doc_issue_date",
              onInputChange,
              isValidValue
            );
          }}
          placeholder="MM/DD/YYYY"
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={info?.is_issue_date_est?.value === "Yes"}
            onChange={(e) =>
              onInputChange(
                `${path}.section9_1.is_issue_date_est.value`,
                e.target.checked ? "Yes" : "No"
              )
            }
            className="mr-2"
          />
          Est.
        </label>
      </label>
      
      <label className="block">
        Born on Military Installation:
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={info?.is_born_installation?.value === "YES"}
            onChange={(e) =>
              onInputChange(
                `${path}.section9_1.is_born_installation.value`,
                e.target.checked ? "YES" : "NO (If NO, proceed to Section 10)"
              )
            }
            className="mr-2"
          />
          Yes
        </label>
      </label>
      
      <label className="block mt-2">
        Country of Issuance:
        <select
          value={info?.issued_country?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_1.issued_country.value`, e.target.value)) {
              onInputChange(`${path}.section9_1.issued_country.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        >
          <option value="">Select country</option>
          {Object.entries(CountryOptions).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="block mt-2">
        State of Issuance (if in U.S.):
        <select
          value={info?.issued_state?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_1.issued_state.value`, e.target.value)) {
              onInputChange(`${path}.section9_1.issued_state.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        >
          <option value="">Select state</option>
          {Object.entries(StateOptions).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </label>
      
      {info?.is_born_installation?.value === "YES" && (
        <label className="block">
          Base Name:
          <input
            type="text"
            value={info?.base_name?.value || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.section9_1.base_name.value`, e.target.value)) {
                onInputChange(`${path}.section9_1.base_name.value`, e.target.value);
              }
            }}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          />
        </label>
      )}
    </>
  );

  const renderNaturalizedCitizenInfo = (info: NaturalizedCitizenInfo) => {
    // Null check on the info object
    if (!info) return null;
    
    return (
    <>
      <label className="block">
        U.S. Entry Date (MM/DD/YYYY):
        <input
          type="text"
          value={info?.us_entry_date?.value || ""}
          onChange={(e) => {
            handleDateChange(
              e.target.value,
              path,
              "section9_2.us_entry_date",
              onInputChange,
              isValidValue
            );
          }}
          placeholder="MM/DD/YYYY"
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={info?.is_us_entry_date_est?.value === "Yes"}
            onChange={(e) =>
              onInputChange(
                `${path}.section9_2.is_us_entry_date_est.value`,
                e.target.checked ? "Yes" : "No"
              )
            }
            className="mr-2"
          />
          Est.
        </label>
      </label>

      <label className="block">
        Entry City:
        <input
          type="text"
          value={info?.entry_city?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_2.entry_city.value`, e.target.value)) {
              onInputChange(`${path}.section9_2.entry_city.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Entry State:
        <select
          value={info?.entry_state?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_2.entry_state.value`, e.target.value)) {
              onInputChange(`${path}.section9_2.entry_state.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        >
          <option value="">Select state</option>
          {Object.entries(StateOptions).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        Country of Citizenship 1:
        <select
          value={info?.country_of_citizenship_1?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_2.country_of_citizenship_1.value`, e.target.value)) {
              onInputChange(`${path}.section9_2.country_of_citizenship_1.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        >
          <option value="">Select country</option>
          {Object.entries(CountryOptions).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        Country of Citizenship 2:
        <select
          value={info?.country_of_citizenship_2?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_2.country_of_citizenship_2.value`, e.target.value)) {
              onInputChange(`${path}.section9_2.country_of_citizenship_2.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        >
          <option value="">Select country</option>
          {Object.entries(CountryOptions).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        Has Alien Registration:
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={info?.has_alien_registration?.value === "YES"}
            onChange={(e) =>
              onInputChange(
                `${path}.section9_2.has_alien_registration.value`,
                e.target.checked ? "YES" : "NO"
              )
            }
            className="mr-2"
          />
          Yes
        </label>
      </label>

      {info?.has_alien_registration?.value === "YES" && (
        <label className="block">
          Alien Registration Number:
          <input
            type="text"
            value={info?.alien_registration_num?.value || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.section9_2.alien_registration_num.value`, e.target.value)) {
                onInputChange(`${path}.section9_2.alien_registration_num.value`, e.target.value);
              }
            }}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          />
        </label>
      )}

      <label className="block">
        Naturalization Number:
        <input
          type="text"
          value={info?.naturalization_num?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_2.naturalization_num.value`, e.target.value)) {
              onInputChange(`${path}.section9_2.naturalization_num.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Naturalization Issue Date (MM/DD/YYYY):
        <input
          type="text"
          value={info?.naturalization_issue_date?.value || ""}
          onChange={(e) => {
            handleDateChange(
              e.target.value,
              path,
              "section9_2.naturalization_issue_date",
              onInputChange,
              isValidValue
            );
          }}
          placeholder="MM/DD/YYYY"
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={info?.is_natural_issue_est?.value === "Yes"}
            onChange={(e) =>
              onInputChange(
                `${path}.section9_2.is_natural_issue_est.value`,
                e.target.checked ? "Yes" : "No"
              )
            }
            className="mr-2"
          />
          Est.
        </label>
      </label>

      <label className="block">
        Court Issued Date (MM/DD/YYYY):
        <input
          type="text"
          value={info?.court_issued_date?.value || ""}
          onChange={(e) => {
            handleDateChange(
              e.target.value,
              path,
              "section9_2.court_issued_date",
              onInputChange,
              isValidValue
            );
          }}
          placeholder="MM/DD/YYYY"
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Court Name:
        <input
          type="text"
          value={info?.court_name?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_2.court_name.value`, e.target.value)) {
              onInputChange(`${path}.section9_2.court_name.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Court Address:
        <input
          type="text"
          value={info?.court_street?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_2.court_street.value`, e.target.value)) {
              onInputChange(`${path}.section9_2.court_street.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          placeholder="Street"
        />
        <div className="grid grid-cols-3 gap-2 mt-1">
          <input
            type="text"
            value={info?.court_city?.value || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.section9_2.court_city.value`, e.target.value)) {
                onInputChange(`${path}.section9_2.court_city.value`, e.target.value);
              }
            }}
            className="p-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            placeholder="City"
          />
          <select
            value={info?.court_state?.value || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.section9_2.court_state.value`, e.target.value)) {
                onInputChange(`${path}.section9_2.court_state.value`, e.target.value);
              }
            }}
            className="p-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          >
            <option value="">Select state</option>
            {Object.entries(StateOptions).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={info?.court_zip?.value || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.section9_2.court_zip.value`, e.target.value)) {
                onInputChange(`${path}.section9_2.court_zip.value`, e.target.value);
              }
            }}
            className="p-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            placeholder="ZIP Code"
          />
        </div>
      </label>

      <label className="block mt-2">
        Court Document Name Information:
        <div className="grid grid-cols-3 gap-2 mt-1">
          <input
            type="text"
            value={info?.court_issued_fname?.value || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.section9_2.court_issued_fname.value`, e.target.value)) {
                onInputChange(`${path}.section9_2.court_issued_fname.value`, e.target.value);
              }
            }}
            className="p-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            placeholder="First Name"
          />
          <input
            type="text"
            value={info?.court_issued_mname?.value || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.section9_2.court_issued_mname.value`, e.target.value)) {
                onInputChange(`${path}.section9_2.court_issued_mname.value`, e.target.value);
              }
            }}
            className="p-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            placeholder="Middle Name"
          />
          <input
            type="text"
            value={info?.court_issued_lname?.value || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.section9_2.court_issued_lname.value`, e.target.value)) {
                onInputChange(`${path}.section9_2.court_issued_lname.value`, e.target.value);
              }
            }}
            className="p-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            placeholder="Last Name"
          />
        </div>
        <select
          value={info?.court_issued_suffix?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_2.court_issued_suffix.value`, e.target.value)) {
              onInputChange(`${path}.section9_2.court_issued_suffix.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-1/3 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        >
          <option value="">Select suffix</option>
          {Object.entries(SuffixOptions).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="block mt-2">
        <input
          type="checkbox"
          checked={info?.is_other?.value === "Yes"}
          onChange={(e) =>
            onInputChange(
              `${path}.section9_2.is_other.value`,
              e.target.checked ? "Yes" : "No"
            )
          }
          className="mr-2"
        />
        Other Basis of Naturalization
      </label>

      {info?.is_other?.value === "Yes" && (
        <label className="block">
          Explanation:
          <input
            type="text"
            value={info?.other_basis_detail?.value || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.section9_2.other_basis_detail.value`, e.target.value)) {
                onInputChange(`${path}.section9_2.other_basis_detail.value`, e.target.value);
              }
            }}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          />
        </label>
      )}
    </>
  );
  };

  const renderDerivedCitizenInfo = (info: DerivedCitizenInfo) => {
    // Null check on the info object
    if (!info) return null;
    
    return (
    <>
        <label className="block">
          Alien Registration Number:
          <input
            type="text"
          value={info?.alien_registration_num?.value || ""}
            onChange={(e) => {
            if (isValidValue(`${path}.section9_3.alien_registration_num.value`, e.target.value)) {
              onInputChange(`${path}.section9_3.alien_registration_num.value`, e.target.value);
              }
            }}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          />
        </label>

        <label className="block">
        Permanent Resident Card Number:
          <input
            type="text"
          value={info?.permanent_resident_num?.value || ""}
            onChange={(e) => {
            if (isValidValue(`${path}.section9_3.permanent_resident_num.value`, e.target.value)) {
              onInputChange(`${path}.section9_3.permanent_resident_num.value`, e.target.value);
              }
            }}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          />
        </label>

      <label className="block">
        Certificate of Citizenship Number:
        <input
          type="text"
          value={info?.certificate_of_citizenship_num?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_3.certificate_of_citizenship_num.value`, e.target.value)) {
              onInputChange(`${path}.section9_3.certificate_of_citizenship_num.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block mt-2">
        Document Name Information:
        <div className="grid grid-cols-3 gap-2 mt-1">
        <input
          type="text"
            value={info?.doc_fname?.value || ""}
          onChange={(e) => {
              if (isValidValue(`${path}.section9_3.doc_fname.value`, e.target.value)) {
                onInputChange(`${path}.section9_3.doc_fname.value`, e.target.value);
            }
          }}
            className="p-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            placeholder="First Name"
        />
        <input
          type="text"
            value={info?.doc_mname?.value || ""}
          onChange={(e) => {
              if (isValidValue(`${path}.section9_3.doc_mname.value`, e.target.value)) {
                onInputChange(`${path}.section9_3.doc_mname.value`, e.target.value);
            }
          }}
            className="p-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            placeholder="Middle Name"
        />
        <input
          type="text"
            value={info?.doc_lname?.value || ""}
          onChange={(e) => {
              if (isValidValue(`${path}.section9_3.doc_lname.value`, e.target.value)) {
                onInputChange(`${path}.section9_3.doc_lname.value`, e.target.value);
            }
          }}
            className="p-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            placeholder="Last Name"
        />
        </div>
        <select
          value={info?.doc_suffix?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_3.doc_suffix.value`, e.target.value)) {
              onInputChange(`${path}.section9_3.doc_suffix.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-1/3 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        >
          <option value="">Select suffix</option>
          {Object.entries(SuffixOptions).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        Document Issue Date (MM/DD/YYYY):
        <input
          type="text"
          value={info?.doc_issue_date?.value || ""}
          onChange={(e) => {
            handleDateChange(
              e.target.value,
              path,
              "section9_3.doc_issue_date",
              onInputChange,
              isValidValue
            );
          }}
          placeholder="MM/DD/YYYY"
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={info?.is_doc_date_est?.value === "Yes"}
            onChange={(e) =>
              onInputChange(
                `${path}.section9_3.is_doc_date_est.value`,
                e.target.checked ? "Yes" : "No"
              )
            }
            className="mr-2"
          />
          Est.
        </label>
      </label>

      <label className="block mt-2">
        <input
          type="checkbox"
          checked={info?.is_other?.value === "Yes"}
          onChange={(e) =>
              onInputChange(
              `${path}.section9_3.is_other.value`,
              e.target.checked ? "Yes" : "No"
            )
          }
          className="mr-2"
        />
        Other Basis of Citizenship
      </label>

      {info?.is_other?.value === "Yes" && (
        <label className="block">
          Explanation:
          <input
            type="text"
            value={info?.basis_of_citizenship_explanation?.value || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.section9_3.basis_of_citizenship_explanation.value`, e.target.value)) {
                onInputChange(`${path}.section9_3.basis_of_citizenship_explanation.value`, e.target.value);
              }
            }}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          />
        </label>
      )}

      <label className="block mt-2">
        <input
          type="checkbox"
          checked={info?.is_basedOn_naturalization?.value === "Yes"}
          onChange={(e) =>
            onInputChange(
              `${path}.section9_3.is_basedOn_naturalization.value`,
              e.target.checked ? "Yes" : "No"
            )
          }
          className="mr-2"
        />
        Based on parent's naturalization
      </label>
    </>
  );
  };

  const renderNonCitizenInfo = (info: NonCitizenInfo) => {
    // Null check on the info object
    if (!info) return null;
    
    return (
    <>
      <label className="block">
        Residence Status:
        <input
          type="text"
          value={info?.residence_status?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_4.residence_status.value`, e.target.value)) {
              onInputChange(`${path}.section9_4.residence_status.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        U.S. Entry Date (MM/DD/YYYY):
        <input
          type="text"
          value={info?.us_entry_date?.value || ""}
          onChange={(e) => {
            handleDateChange(
              e.target.value,
              path,
              "section9_4.us_entry_date",
              onInputChange,
              isValidValue
            );
          }}
          placeholder="MM/DD/YYYY"
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={info?.is_entry_date_est?.value === "Yes"}
            onChange={(e) =>
              onInputChange(
                `${path}.section9_4.is_entry_date_est.value`,
                e.target.checked ? "Yes" : "No"
              )
            }
            className="mr-2"
          />
          Est.
        </label>
      </label>

      <label className="block">
        Country of Citizenship 1:
        <select
          value={info?.country_of_citizenship1?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_4.country_of_citizenship1.value`, e.target.value)) {
              onInputChange(`${path}.section9_4.country_of_citizenship1.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        >
          <option value="">Select country</option>
          {Object.entries(CountryOptions).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        Country of Citizenship 2:
        <select
          value={info?.country_of_citizenship2?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_4.country_of_citizenship2.value`, e.target.value)) {
              onInputChange(`${path}.section9_4.country_of_citizenship2.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        >
          <option value="">Select country</option>
          {Object.entries(CountryOptions).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        Entry City:
        <input
          type="text"
          value={info?.entry_city?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_4.entry_city.value`, e.target.value)) {
              onInputChange(`${path}.section9_4.entry_city.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Entry State:
        <select
          value={info?.entry_state?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_4.entry_state.value`, e.target.value)) {
              onInputChange(`${path}.section9_4.entry_state.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        >
          <option value="">Select state</option>
          {Object.entries(StateOptions).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        Alien Registration Number:
        <input
          type="text"
          value={info?.alien_registration_num?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_4.alien_registration_num.value`, e.target.value)) {
              onInputChange(`${path}.section9_4.alien_registration_num.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Expiration Date (MM/DD/YYYY):
        <input
          type="text"
          value={info?.expiration_date?.value || ""}
          onChange={(e) => {
            handleDateChange(
              e.target.value,
              path,
              "section9_4.expiration_date",
              onInputChange,
              isValidValue
            );
          }}
          placeholder="MM/DD/YYYY"
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={info?.is_expiration_est?.value === "Yes"}
            onChange={(e) =>
              onInputChange(
                `${path}.section9_4.is_expiration_est.value`,
                e.target.checked ? "Yes" : "No"
              )
            }
            className="mr-2"
          />
          Est.
        </label>
      </label>

      <label className="block">
        Document Type:
        <select
          value={info?.document_issued?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_4.document_issued.value`, e.target.value)) {
              onInputChange(`${path}.section9_4.document_issued.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        >
          <option value="">Select document type</option>
          <option value="1">I-94</option>
          <option value="2">U.S. Visa (red foil number)</option>
          <option value="3">I-20</option>
          <option value="4">DS-2019</option>
          <option value="5">Other (Provide explanation)</option>
        </select>
      </label>
      
      {info?.document_issued?.value === "5" && (
        <label className="block">
          Other Document Explanation:
          <input
            type="text"
            value={info?.other_doc?.value || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.section9_4.other_doc.value`, e.target.value)) {
                onInputChange(`${path}.section9_4.other_doc.value`, e.target.value);
              }
            }}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          />
        </label>
      )}

      <label className="block">
        Document Number:
        <input
          type="text"
          value={info?.doc_num?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_4.doc_num.value`, e.target.value)) {
              onInputChange(`${path}.section9_4.doc_num.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Document Issue Date (MM/DD/YYYY):
        <input
          type="text"
          value={info?.doc_issued_date?.value || ""}
          onChange={(e) => {
            handleDateChange(
              e.target.value,
              path,
              "section9_4.doc_issued_date",
              onInputChange,
              isValidValue
            );
          }}
          placeholder="MM/DD/YYYY"
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={info?.is_doc_date_est?.value === "Yes"}
            onChange={(e) =>
              onInputChange(
                `${path}.section9_4.is_doc_date_est.value`,
                e.target.checked ? "Yes" : "No"
              )
            }
            className="mr-2"
          />
          Est.
        </label>
      </label>

      <label className="block">
        Document Expiration Date (MM/DD/YYYY):
        <input
          type="text"
          value={info?.doc_expire_date?.value || ""}
          onChange={(e) => {
            handleDateChange(
              e.target.value,
              path,
              "section9_4.doc_expire_date",
              onInputChange,
              isValidValue
            );
          }}
          placeholder="MM/DD/YYYY"
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={info?.is_doc_expiration_est?.value === "Yes"}
            onChange={(e) =>
              onInputChange(
                `${path}.section9_4.is_doc_expiration_est.value`,
                e.target.checked ? "Yes" : "No"
              )
            }
            className="mr-2"
          />
          Est.
        </label>
      </label>

      <label className="block mt-2">
        Document Name Information:
        <div className="grid grid-cols-3 gap-2 mt-1">
        <input
          type="text"
            value={info?.doc_fname?.value || ""}
          onChange={(e) => {
              if (isValidValue(`${path}.section9_4.doc_fname.value`, e.target.value)) {
                onInputChange(`${path}.section9_4.doc_fname.value`, e.target.value);
            }
          }}
            className="p-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            placeholder="First Name"
        />
        <input
          type="text"
            value={info?.doc_mname?.value || ""}
          onChange={(e) => {
              if (isValidValue(`${path}.section9_4.doc_mname.value`, e.target.value)) {
                onInputChange(`${path}.section9_4.doc_mname.value`, e.target.value);
            }
          }}
            className="p-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            placeholder="Middle Name"
        />
        <input
          type="text"
            value={info?.doc_lname?.value || ""}
          onChange={(e) => {
              if (isValidValue(`${path}.section9_4.doc_lname.value`, e.target.value)) {
                onInputChange(`${path}.section9_4.doc_lname.value`, e.target.value);
            }
          }}
            className="p-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            placeholder="Last Name"
        />
        </div>
        <select
          value={info?.doc_suffix?.value || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.section9_4.doc_suffix.value`, e.target.value)) {
              onInputChange(`${path}.section9_4.doc_suffix.value`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-1/3 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        >
          <option value="">Select suffix</option>
          {Object.entries(SuffixOptions).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
    </>
  );
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">SECTION 9 - Citizenship</h3>

      <label className="block">
        Citizenship Status:
        <select
          name={`${path}.citizenship_status_code.value`}
          value={citizenshipInfo?.citizenship_status_code?.value}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          onChange={handleCitizenshipChange}
        >
          <option value="I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth. (Proceed to Section 10)   ">
            I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth.
          </option>
          <option value="I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country. (Complete 9.1) ">
            I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country.
          </option>
          <option value="I am a naturalized U.S. citizen. (Complete 9.2) ">
            I am a naturalized U.S. citizen.
          </option>
          <option value="I am a derived U.S. citizen. (Complete 9.3) ">
            I am a derived U.S. citizen.
          </option>
          <option value="I am not a U.S. citizen. (Complete 9.4) ">
            I am not a U.S. citizen.
          </option>
        </select>
      </label>

      {/* Determine which section to render based on citizenship status */}
      {citizenshipInfo?.citizenship_status_code?.value === "I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country. (Complete 9.1) " &&
        citizenshipInfo?.section9_1 && renderCitizenshipByBirthInfo(citizenshipInfo?.section9_1)}

      {citizenshipInfo?.citizenship_status_code?.value === "I am a naturalized U.S. citizen. (Complete 9.2) " &&
        citizenshipInfo?.section9_2 && renderNaturalizedCitizenInfo(citizenshipInfo?.section9_2)}

      {citizenshipInfo?.citizenship_status_code?.value === "I am a derived U.S. citizen. (Complete 9.3) " &&
        citizenshipInfo?.section9_3 && renderDerivedCitizenInfo(citizenshipInfo?.section9_3)}

      {citizenshipInfo?.citizenship_status_code?.value === "I am not a U.S. citizen. (Complete 9.4) " &&
        citizenshipInfo?.section9_4 && renderNonCitizenInfo(citizenshipInfo?.section9_4)}
    </div>
  );
};

export { RenderCitizenshipInfo };
