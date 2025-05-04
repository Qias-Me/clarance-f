import { useForm } from "../formContext"; // Adjust the import path
import {
  CitizenshipByBirthInfo,
  CitizenshipNaturalizationInfo,
} from "api_v2/interfaces/Citizenship";

const CitizenshipStatusOne = () => {
  const { formData, setFormData } = useForm();

  // Type guard to check if details is of type CitizenshipByBirthInfo
  const isCitizenshipByBirthInfo = (
    details: CitizenshipNaturalizationInfo["details"]
  ): details is CitizenshipByBirthInfo => {
    return formData.citizenshipInfo.citizenship_status_code === "birth";
  };

  const updateCitizenshipDetails = (
    detailsUpdate: Partial<CitizenshipByBirthInfo>
  ) => {
    if (!isCitizenshipByBirthInfo(formData.citizenshipInfo.details)) {
      console.error("Incorrect details type for citizenship status 'birth'");
      return;
    }

    const updatedDetails = {
      ...formData.citizenshipInfo.details,
      ...detailsUpdate,
    };

    setFormData({
      ...formData,
      citizenshipInfo: {
        ...formData.citizenshipInfo,
        details: updatedDetails,
      },
    });
  };

  return (
    <div>
      <h3>U.S. Citizen Born Abroad Details</h3>
      {isCitizenshipByBirthInfo(formData.citizenshipInfo.details) && (
        <>
          <div>
            <label htmlFor="docType">Document Type:</label>
            <select
              id="docType"
              value={formData.citizenshipInfo.details?.doc_type || ""}
              onChange={(e) =>
                updateCitizenshipDetails({
                  doc_type: e.target
                    .value as CitizenshipByBirthInfo["doc_type"],
                })
              }
            >
              <option value="FS240">FS240</option>
              <option value="DS1350">DS1350</option>
              <option value="FS545">FS545</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {formData.citizenshipInfo.details?.doc_type === "Other" && (
            <div>
              <label htmlFor="otherDoc">Specify Document:</label>
              <input
                id="otherDoc"
                type="text"
                value={formData.citizenshipInfo.details?.other_doc || ""}
                onChange={(e) =>
                  updateCitizenshipDetails({ other_doc: e.target.value })
                }
              />
            </div>
          )}

          <div>
            <label htmlFor="docNum">Document Number:</label>
            <input
              id="docNum"
              type="text"
              value={formData.citizenshipInfo.details?.doc_num || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ doc_num: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="docIssueDate">Document Issue Date:</label>
            <input
              id="docIssueDate"
              type="date"
              value={formData.citizenshipInfo.details?.doc_issue_date || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ doc_issue_date: e.target.value })
              }
            />
            <div>
              <label htmlFor="isIssueDateEst">Issue Date Estimated:</label>
              <input
                id="isIssueDateEst"
                type="checkbox"
                checked={!!formData.citizenshipInfo.details?.is_issue_date_est}
                onChange={(e) =>
                  updateCitizenshipDetails({
                    is_issue_date_est: e.target.checked,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label htmlFor="issueCity">Issue City:</label>
            <input
              id="issueCity"
              type="text"
              value={formData.citizenshipInfo.details?.issue_city || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ issue_city: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="issuedState">Issued State:</label>
            <input
              id="issuedState"
              type="text"
              value={formData.citizenshipInfo.details?.issued_state || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ issued_state: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="issuedCountry">Issued Country:</label>
            <input
              id="issuedCountry"
              type="text"
              value={formData.citizenshipInfo.details?.issued_country || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ issued_country: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="issuedFName">First Name:</label>
            <input
              id="issuedFName"
              type="text"
              value={formData.citizenshipInfo.details?.issued_fname || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ issued_fname: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="issuedLName">Last Name:</label>
            <input
              id="issuedLName"
              type="text"
              value={formData.citizenshipInfo.details?.issued_lname || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ issued_lname: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="issuedMName">Middle Name:</label>
            <input
              id="issuedMName"
              type="text"
              value={formData.citizenshipInfo.details?.issued_mname || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ issued_mname: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="issuedSuffix">Suffix:</label>
            <input
              id="issuedSuffix"
              type="text"
              value={formData.citizenshipInfo.details?.issued_suffix || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ issued_suffix: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="citizenshipNum">Citizenship Number:</label>
            <input
              id="citizenshipNum"
              type="text"
              value={formData.citizenshipInfo.details?.citizenship_num || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ citizenship_num: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="isBornInstallation">
              Born on a U.S. Military Installation:
            </label>
            <input
              id="isBornInstallation"
              type="checkbox"
              checked={!!formData.citizenshipInfo.details?.is_born_installation}
              onChange={(e) =>
                updateCitizenshipDetails({
                  is_born_installation: e.target.checked,
                })
              }
            />
          </div>

          {formData.citizenshipInfo.details?.is_born_installation && (
            <div>
              <label htmlFor="baseName">Base Name:</label>
              <input
                id="baseName"
                type="text"
                value={formData.citizenshipInfo.details?.base_name || ""}
                onChange={(e) =>
                  updateCitizenshipDetails({ base_name: e.target.value })
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CitizenshipStatusOne;
