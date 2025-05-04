import FormInfo from "api/interfaces2.0/FormInfo";
import { CitizenshipByBirthInfo, CitizenshipInfo } from "api/interfaces2.0/sections/citizenship";


type FormProps = {
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
const citizenshipStatusMapping = {
  "I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth. (Proceed to Section 10)":
    "birth",
  "I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country. (Complete 9.1)":
    "citizen",
  "I am a naturalized U.S. citizen. (Complete 9.2)": "naturalized",
  "I am a derived U.S. citizen. (Complete 9.3)": "derived",
  "I am not a U.S. citizen. (Complete 9.4)": "nonCitizen",
};

const RenderCitizenshipInfo: React.FC<FormProps> = ({
  data,
  onInputChange,
  isValidValue,
  path,
  getDefaultNewItem,
}) => {
  const citizenshipInfo = data as CitizenshipInfo;

  const handleCitizenshipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatusDescription = e.target.value;
    const newStatusCode =
      citizenshipStatusMapping[
        newStatusDescription as keyof typeof citizenshipStatusMapping
      ];

    if (isValidValue(`${path}.citizenship_status_code`, newStatusDescription)) {
      onInputChange(`${path}.citizenship_status_code`, newStatusDescription);
      if (newStatusCode !== "citizen") {
        onInputChange(
          `${path}.details`,
          getDefaultNewItem(`citizenshipInfo.${newStatusCode}`)
        );
      }
      if (newStatusCode !== "None") {
        onInputChange(`${path}.details`, undefined);
      }
    }
  };

  const renderCitizenshipByBirthInfo = (info: CitizenshipByBirthInfo) => (
    <>
      <label className="block">
        Document Type:
        <select
          name={`${path}.details.doc_type`}
          defaultValue={info.doc_type}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          onChange={(e) => {
            if (isValidValue(`${path}.details.doc_type`, e.target.value)) {
              onInputChange(`${path}.details.doc_type`, e.target.value);
            }
          }}
        >
          <option value="FS240">FS 240</option>
          <option value="DS1350">DS 1350</option>
          <option value="FS545">FS 545</option>
          <option value="Other">Other</option>
        </select>
      </label>
      {info.doc_type === "Other" && (
        <label className="block">
          Other Document:
          <input
            type="text"
            defaultValue={info.other_doc || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.details.other_doc`, e.target.value)) {
                onInputChange(`${path}.details.other_doc`, e.target.value);
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
          defaultValue={info.doc_num || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.doc_num`, e.target.value)) {
              onInputChange(`${path}.details.doc_num`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>
      <label className="block">
        Document Issue Date:
        <input
          type="text"
          defaultValue={info.doc_issue_date || ""}
          onChange={(e) => {
            if (
              isValidValue(`${path}.details.doc_issue_date`, e.target.value)
            ) {
              onInputChange(`${path}.details.doc_issue_date`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={info.is_issue_date_est || false}
            onChange={(e) =>
              onInputChange(
                `${path}.details.is_issue_date_est`,
                e.target.checked
              )
            }
            className="mr-2"
          />
          Est.
        </label>
      </label>
      <label className="block">
        Issue City:
        <input
          type="text"
          defaultValue={info.issue_city || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.issue_city`, e.target.value)) {
              onInputChange(`${path}.details.issue_city`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>
      <label className="block">
        Issued State:
        <input
          type="text"
          defaultValue={info.issued_state || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.issued_state`, e.target.value)) {
              onInputChange(`${path}.details.issued_state`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>
      <label className="block">
        Issued Country:
        <input
          type="text"
          defaultValue={info.issued_country || ""}
          onChange={(e) => {
            if (
              isValidValue(`${path}.details.issued_country`, e.target.value)
            ) {
              onInputChange(`${path}.details.issued_country`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>
      <label className="block">
        Issued First Name:
        <input
          type="text"
          defaultValue={info.issued_fname || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.issued_fname`, e.target.value)) {
              onInputChange(`${path}.details.issued_fname`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>
      <label className="block">
        Issued Last Name:
        <input
          type="text"
          defaultValue={info.issued_lname || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.issued_lname`, e.target.value)) {
              onInputChange(`${path}.details.issued_lname`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>
      <label className="block">
        Issued Middle Name:
        <input
          type="text"
          defaultValue={info.issued_mname || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.issued_mname`, e.target.value)) {
              onInputChange(`${path}.details.issued_mname`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>
      <label className="block">
        Issued Suffix:
        <input
          type="text"
          defaultValue={info.issued_suffix || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.issued_suffix`, e.target.value)) {
              onInputChange(`${path}.details.issued_suffix`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>
      <label className="block">
        Citizenship Number:
        <input
          type="text"
          defaultValue={info.citizenship_num || ""}
          onChange={(e) => {
            if (
              isValidValue(`${path}.details.citizenship_num`, e.target.value)
            ) {
              onInputChange(`${path}.details.citizenship_num`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>
      <label className="block">
        Certificate Issue Date:
        <input
          type="text"
          defaultValue={info.certificate_issue_date || ""}
          onChange={(e) => {
            if (
              isValidValue(
                `${path}.details.certificate_issue_date`,
                e.target.value
              )
            ) {
              onInputChange(
                `${path}.details.certificate_issue_date`,
                e.target.value
              );
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={info.is_certificate_date_est || false}
            onChange={(e) =>
              onInputChange(
                `${path}.details.is_certificate_date_est`,
                e.target.checked
              )
            }
            className="mr-2"
          />
          Est.
        </label>
      </label>
      <label className="block">
        Certificate First Name:
        <input
          type="text"
          defaultValue={info.certificate_fname || ""}
          onChange={(e) => {
            if (
              isValidValue(`${path}.details.certificate_fname`, e.target.value)
            ) {
              onInputChange(
                `${path}.details.certificate_fname`,
                e.target.value
              );
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>
      <label className="block">
        Certificate Last Name:
        <input
          type="text"
          defaultValue={info.certificate_lname || ""}
          onChange={(e) => {
            if (
              isValidValue(`${path}.details.certificate_lname`, e.target.value)
            ) {
              onInputChange(
                `${path}.details.certificate_lname`,
                e.target.value
              );
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>
      <label className="block">
        Certificate Middle Name:
        <input
          type="text"
          defaultValue={info.certificate_mname || ""}
          onChange={(e) => {
            if (
              isValidValue(`${path}.details.certificate_mname`, e.target.value)
            ) {
              onInputChange(
                `${path}.details.certificate_mname`,
                e.target.value
              );
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>
      <label className="block">
        Certificate Suffix:
        <input
          type="text"
          defaultValue={info.certificate_suffix || ""}
          onChange={(e) => {
            if (
              isValidValue(`${path}.details.certificate_suffix`, e.target.value)
            ) {
              onInputChange(
                `${path}.details.certificate_suffix`,
                e.target.value
              );
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>
      <label className="block">
        Born on Installation:
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={info.is_born_installation || false}
            onChange={(e) =>
              onInputChange(
                `${path}.details.is_born_installation`,
                e.target.checked
              )
            }
            className="mr-2"
          />
          Yes
        </label>
      </label>
      {info.is_born_installation && (
        <label className="block">
          Base Name:
          <input
            type="text"
            defaultValue={info.base_name || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.details.base_name`, e.target.value)) {
                onInputChange(`${path}.details.base_name`, e.target.value);
              }
            }}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          />
        </label>
      )}
    </>
  );

  const renderNaturalizedCitizenInfo = (info: NaturalizedCitizenInfo) => (
    <>
      <label className="block">
        U.S. Entry Date:
        <input
          type="text"
          defaultValue={info.us_entry_date || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.us_entry_date`, e.target.value)) {
              onInputChange(`${path}.details.us_entry_date`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={info.is_us_entry_date_est}
            onChange={(e) =>
              onInputChange(
                `${path}.details.is_us_entry_date_est`,
                e.target.checked
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
          defaultValue={info.entry_city || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.entry_city`, e.target.value)) {
              onInputChange(`${path}.details.entry_city`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Entry State:
        <input
          type="text"
          defaultValue={info.entry_state || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.entry_state`, e.target.value)) {
              onInputChange(`${path}.details.entry_state`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Country of Citizenship 1:
        <input
          type="text"
          defaultValue={info.country_of_citizenship_1 || ""}
          onChange={(e) => {
            if (
              isValidValue(
                `${path}.details.country_of_citizenship_1`,
                e.target.value
              )
            ) {
              onInputChange(
                `${path}.details.country_of_citizenship_1`,
                e.target.value
              );
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Country of Citizenship 2:
        <input
          type="text"
          defaultValue={info.country_of_citizenship_2 || ""}
          onChange={(e) => {
            if (
              isValidValue(
                `${path}.details.country_of_citizenship_2`,
                e.target.value
              )
            ) {
              onInputChange(
                `${path}.details.country_of_citizenship_2`,
                e.target.value
              );
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Has Alien Registration:
        <input
          type="checkbox"
          checked={info.has_alien_registration || false}
          onChange={(e) =>
            onInputChange(
              `${path}.details.has_alien_registration`,
              e.target.checked
            )
          }
          className="mr-2"
        />
      </label>

      {info.has_alien_registration && (
        <label className="block">
          Alien Registration Number:
          <input
            type="text"
            defaultValue={info.alien_registration_num || ""}
            onChange={(e) => {
              if (
                isValidValue(
                  `${path}.details.alien_registration_num`,
                  e.target.value
                )
              ) {
                onInputChange(
                  `${path}.details.alien_registration_num`,
                  e.target.value
                );
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
          defaultValue={info.naturalization_num || ""}
          onChange={(e) => {
            if (
              isValidValue(`${path}.details.naturalization_num`, e.target.value)
            ) {
              onInputChange(
                `${path}.details.naturalization_num`,
                e.target.value
              );
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Naturalization Issue Date:
        <input
          type="text"
          defaultValue={info.naturalization_issue_date || ""}
          onChange={(e) => {
            if (
              isValidValue(
                `${path}.details.naturalization_issue_date`,
                e.target.value
              )
            ) {
              onInputChange(
                `${path}.details.naturalization_issue_date`,
                e.target.value
              );
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={info.is_natural_issue_est}
            onChange={(e) =>
              onInputChange(
                `${path}.details.is_natural_issue_est`,
                e.target.checked
              )
            }
            className="mr-2"
          />
          Est.
        </label>
      </label>

      <label className="block">
        Court Issued Date:
        <input
          type="text"
          defaultValue={info.court_issued_date || ""}
          onChange={(e) => {
            if (
              isValidValue(`${path}.details.court_issued_date`, e.target.value)
            ) {
              onInputChange(
                `${path}.details.court_issued_date`,
                e.target.value
              );
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Court Street:
        <input
          type="text"
          defaultValue={info.court_street || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.court_street`, e.target.value)) {
              onInputChange(`${path}.details.court_street`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Court City:
        <input
          type="text"
          defaultValue={info.court_city || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.court_city`, e.target.value)) {
              onInputChange(`${path}.details.court_city`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Court State:
        <input
          type="text"
          defaultValue={info.court_state || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.court_state`, e.target.value)) {
              onInputChange(`${path}.details.court_state`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Court Zip Code:
        <input
          type="text"
          defaultValue={info.court_zip || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.court_zip`, e.target.value)) {
              onInputChange(`${path}.details.court_zip`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Court Issued First Name:
        <input
          type="text"
          defaultValue={info.court_issued_fname || ""}
          onChange={(e) => {
            if (
              isValidValue(`${path}.details.court_issued_fname`, e.target.value)
            ) {
              onInputChange(
                `${path}.details.court_issued_fname`,
                e.target.value
              );
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Court Issued Last Name:
        <input
          type="text"
          defaultValue={info.court_issued_lname || ""}
          onChange={(e) => {
            if (
              isValidValue(`${path}.details.court_issued_lname`, e.target.value)
            ) {
              onInputChange(
                `${path}.details.court_issued_lname`,
                e.target.value
              );
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Court Issued Middle Name:
        <input
          type="text"
          defaultValue={info.court_issued_mname || ""}
          onChange={(e) => {
            if (
              isValidValue(`${path}.details.court_issued_mname`, e.target.value)
            ) {
              onInputChange(
                `${path}.details.court_issued_mname`,
                e.target.value
              );
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Court Issued Suffix:
        <select
          name={`${path}.details.court_issued_suffix`}
          defaultValue={info.court_issued_suffix}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          onChange={(e) => {
            if (
              isValidValue(
                `${path}.details.court_issued_suffix`,
                e.target.value
              )
            ) {
              onInputChange(
                `${path}.details.court_issued_suffix`,
                e.target.value
              );
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

      <label className="block">
        Basis of Naturalization:
        <input
          type="text"
          defaultValue={info.basis_of_naturalization || ""}
          onChange={(e) => {
            if (
              isValidValue(
                `${path}.details.basis_of_naturalization`,
                e.target.value
              )
            ) {
              onInputChange(
                `${path}.details.basis_of_naturalization`,
                e.target.value
              );
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Other Basis Detail:
        <input
          type="text"
          defaultValue={info.other_basis_detail || ""}
          onChange={(e) => {
            if (
              isValidValue(`${path}.details.other_basis_detail`, e.target.value)
            ) {
              onInputChange(
                `${path}.details.other_basis_detail`,
                e.target.value
              );
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>
    </>
  );

  const renderDerivedCitizenInfo = (info: DerivedCitizenInfo) => (
    <>
      {info.alien_registration_num !== undefined && (
        <label className="block">
          Alien Registration Number:
          <input
            type="text"
            defaultValue={info.alien_registration_num || ""}
            onChange={(e) => {
              if (
                isValidValue(
                  `${path}.details.alien_registration_num`,
                  e.target.value
                )
              ) {
                onInputChange(
                  `${path}.details.alien_registration_num`,
                  e.target.value
                );
              }
            }}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          />
        </label>
      )}

      {info.permanent_resident_num !== undefined && (
        <label className="block">
          Permanent Resident Number:
          <input
            type="text"
            defaultValue={info.permanent_resident_num || ""}
            onChange={(e) => {
              if (
                isValidValue(
                  `${path}.details.permanent_resident_num`,
                  e.target.value
                )
              ) {
                onInputChange(
                  `${path}.details.permanent_resident_num`,
                  e.target.value
                );
              }
            }}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          />
        </label>
      )}

      <label className="block">
        Certificate of Citizenship Number:
        <input
          type="text"
          defaultValue={info.certificate_of_citizenship_num || ""}
          onChange={(e) => {
            if (
              isValidValue(
                `${path}.details.certificate_of_citizenship_num`,
                e.target.value
              )
            ) {
              onInputChange(
                `${path}.details.certificate_of_citizenship_num`,
                e.target.value
              );
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Document First Name:
        <input
          type="text"
          defaultValue={info.doc_fname || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.doc_fname`, e.target.value)) {
              onInputChange(`${path}.details.doc_fname`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Document Last Name:
        <input
          type="text"
          defaultValue={info.doc_lname || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.doc_lname`, e.target.value)) {
              onInputChange(`${path}.details.doc_lname`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Document Middle Name:
        <input
          type="text"
          defaultValue={info.doc_mname || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.doc_mname`, e.target.value)) {
              onInputChange(`${path}.details.doc_mname`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Document Suffix:
        <select
          name={`${path}.details.doc_suffix`}
          defaultValue={info.doc_suffix}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          onChange={(e) => {
            if (isValidValue(`${path}.details.doc_suffix`, e.target.value)) {
              onInputChange(`${path}.details.doc_suffix`, e.target.value);
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

      <label className="block">
        Document Issue Date:
        <input
          type="text"
          defaultValue={info.doc_issue_date || ""}
          onChange={(e) => {
            if (
              isValidValue(`${path}.details.doc_issue_date`, e.target.value)
            ) {
              onInputChange(`${path}.details.doc_issue_date`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={info.is_doc_date_est}
            onChange={(e) =>
              onInputChange(`${path}.details.is_doc_date_est`, e.target.checked)
            }
            className="mr-2"
          />
          Est.
        </label>
      </label>

      <label className="block">
        Basis of Citizenship:
        <select
          name={`${path}.details.basis_of_citizenship`}
          defaultValue={info.basis_of_citizenship}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          onChange={(e) => {
            if (
              isValidValue(
                `${path}.details.basis_of_citizenship`,
                e.target.value
              )
            ) {
              onInputChange(
                `${path}.details.basis_of_citizenship`,
                e.target.value
              );
            }
          }}
        >
          <option value="other">Other</option>
          <option value="byOp">By Operation of Law</option>
        </select>
      </label>

      {info.basis_of_citizenship === "other" && (
        <label className="block">
          Basis of Citizenship Explanation:
          <input
            type="text"
            defaultValue={info.basis_of_citizenship_explanation || ""}
            onChange={(e) => {
              if (
                isValidValue(
                  `${path}.details.basis_of_citizenship_explanation`,
                  e.target.value
                )
              ) {
                onInputChange(
                  `${path}.details.basis_of_citizenship_explanation`,
                  e.target.value
                );
              }
            }}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          />
        </label>
      )}
    </>
  );

  const renderNonCitizenInfo = (info: NonCitizenInfo) => (
    <>
      <label className="block">
        Residence Status:
        <input
          type="text"
          defaultValue={info.residence_status || ""}
          onChange={(e) => {
            if (
              isValidValue(`${path}.details.residence_status`, e.target.value)
            ) {
              onInputChange(`${path}.details.residence_status`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        U.S. Entry Date:
        <input
          type="text"
          defaultValue={info.us_entry_date || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.us_entry_date`, e.target.value)) {
              onInputChange(`${path}.details.us_entry_date`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={info.is_entry_date_est}
            onChange={(e) =>
              onInputChange(
                `${path}.details.is_entry_date_est`,
                e.target.checked
              )
            }
            className="mr-2"
          />
          Est.
        </label>
      </label>

      <label className="block">
        Country of Citizenship 1:
        <input
          type="text"
          defaultValue={info.country_of_citizenship1 || ""}
          onChange={(e) => {
            if (
              isValidValue(
                `${path}.details.country_of_citizenship1`,
                e.target.value
              )
            ) {
              onInputChange(
                `${path}.details.country_of_citizenship1`,
                e.target.value
              );
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Country of Citizenship 2:
        <input
          type="text"
          defaultValue={info.country_of_citizenship2 || ""}
          onChange={(e) => {
            if (
              isValidValue(
                `${path}.details.country_of_citizenship2`,
                e.target.value
              )
            ) {
              onInputChange(
                `${path}.details.country_of_citizenship2`,
                e.target.value
              );
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Entry City:
        <input
          type="text"
          defaultValue={info.entry_city || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.entry_city`, e.target.value)) {
              onInputChange(`${path}.details.entry_city`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Entry State:
        <input
          type="text"
          defaultValue={info.entry_state || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.entry_state`, e.target.value)) {
              onInputChange(`${path}.details.entry_state`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Alien Registration Number:
        <input
          type="text"
          defaultValue={info.alien_registration_num || ""}
          onChange={(e) => {
            if (
              isValidValue(
                `${path}.details.alien_registration_num`,
                e.target.value
              )
            ) {
              onInputChange(
                `${path}.details.alien_registration_num`,
                e.target.value
              );
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Expiration Date:
        <input
          type="text"
          defaultValue={info.expiration_date || ""}
          onChange={(e) => {
            if (
              isValidValue(`${path}.details.expiration_date`, e.target.value)
            ) {
              onInputChange(`${path}.details.expiration_date`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={info.is_expiration_est}
            onChange={(e) =>
              onInputChange(
                `${path}.details.is_expiration_est`,
                e.target.checked
              )
            }
            className="mr-2"
          />
          Est.
        </label>
      </label>

      <label className="block">
        Document Issued:
        <select
          name={`${path}.details.document_issued`}
          defaultValue={info.document_issued}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          onChange={(e) => {
            if (
              isValidValue(`${path}.details.document_issued`, e.target.value)
            ) {
              onInputChange(`${path}.details.document_issued`, e.target.value);
            }
          }}
        >
          <option value="I-94">I-94</option>
          <option value="U.S. Visa">U.S. Visa</option>
          <option value="I-20">I-20</option>
          <option value="DS-2019">DS-2019</option>
          <option value="Other">Other</option>
        </select>
      </label>
      {info.document_issued === "Other" && (
        <label className="block">
          Other Document:
          <input
            type="text"
            defaultValue={info.other_doc || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.details.other_doc`, e.target.value)) {
                onInputChange(`${path}.details.other_doc`, e.target.value);
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
          defaultValue={info.doc_num || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.doc_num`, e.target.value)) {
              onInputChange(`${path}.details.doc_num`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Document Issue Date:
        <input
          type="text"
          defaultValue={info.doc_issued_date || ""}
          onChange={(e) => {
            if (
              isValidValue(`${path}.details.doc_issued_date`, e.target.value)
            ) {
              onInputChange(`${path}.details.doc_issued_date`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={info.is_doc_date_est}
            onChange={(e) =>
              onInputChange(`${path}.details.is_doc_date_est`, e.target.checked)
            }
            className="mr-2"
          />
          Est.
        </label>
      </label>

      <label className="block">
        Document Expiration Date:
        <input
          type="text"
          defaultValue={info.doc_expire_date || ""}
          onChange={(e) => {
            if (
              isValidValue(`${path}.details.doc_expire_date`, e.target.value)
            ) {
              onInputChange(`${path}.details.doc_expire_date`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
        <label className="inline-flex items-center ml-2">
          <input
            type="checkbox"
            checked={info.is_doc_expiration_est}
            onChange={(e) =>
              onInputChange(
                `${path}.details.is_doc_expiration_est`,
                e.target.checked
              )
            }
            className="mr-2"
          />
          Est.
        </label>
      </label>

      <label className="block">
        Document First Name:
        <input
          type="text"
          defaultValue={info.doc_fname || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.doc_fname`, e.target.value)) {
              onInputChange(`${path}.details.doc_fname`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Document Last Name:
        <input
          type="text"
          defaultValue={info.doc_lname || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.doc_lname`, e.target.value)) {
              onInputChange(`${path}.details.doc_lname`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Document Middle Name:
        <input
          type="text"
          defaultValue={info.doc_mname || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.details.doc_mname`, e.target.value)) {
              onInputChange(`${path}.details.doc_mname`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Document Suffix:
        <select
          name={`${path}.details.doc_suffix`}
          defaultValue={info.doc_suffix}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          onChange={(e) => {
            if (isValidValue(`${path}.details.doc_suffix`, e.target.value)) {
              onInputChange(`${path}.details.doc_suffix`, e.target.value);
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
  );

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">SECTION 9 - Citizenship</h3>

      <label className="block">
        Citizenship Status:
        <select
          name={`${path}.citizenship_status_code`}
          defaultValue={citizenshipInfo.citizenship_status_code.value}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          onChange={handleCitizenshipChange}
        >
          <option value="citizen">U.S. Citizen</option>
          <option value="birth">
            U.S. Citizen by Birth in Foreign Territory
          </option>
          <option value="naturalized">Naturalized U.S. Citizen</option>
          <option value="derived">Derived U.S. Citizen</option>
          <option value="nonCitizen">Non U.S. Citizen</option>
        </select>
      </label>

      {citizenshipInfo.citizenship_status_code.value === "birth" &&
        renderCitizenshipByBirthInfo(
          citizenshipInfo.details as CitizenshipByBirthInfo
        )}

      {citizenshipInfo.citizenship_status_code.value === "naturalized" &&
        renderNaturalizedCitizenInfo(
          citizenshipInfo.details as NaturalizedCitizenInfo
        )}
      {citizenshipInfo.citizenship_status_code.value === "derived" &&
        renderDerivedCitizenInfo(citizenshipInfo.details as DerivedCitizenInfo)}
      {citizenshipInfo.citizenship_status_code.value === "nonCitizen" &&
        renderNonCitizenInfo(citizenshipInfo.details as NonCitizenInfo)}
    </div>
  );
};

export { RenderCitizenshipInfo };
