import { useForm } from "../formContext"; // Ensure correct import path
import {
  NonCitizenInfo,
  CitizenshipNaturalizationInfo,
} from "api_v2/interfaces/Citizenship";

type documentTypes = {
  document_issued: "I-94" | "U.S. Visa" | "I-20" | "DS-2019" | "Other";
};

const CitizenshipStatusFour = () => {
  const { formData, setFormData } = useForm();

  // Type guard to ensure details is of type NonCitizenInfo
  const isNonCitizenInfo = (
    details: CitizenshipNaturalizationInfo["details"]
  ): details is NonCitizenInfo => {
    return formData.citizenshipInfo.citizenship_status_code === "nonCitizen";
  };

  // Function to update details specific to NonCitizenInfo
  const updateCitizenshipDetails = (detailsUpdate: Partial<NonCitizenInfo>) => {
    if (!isNonCitizenInfo(formData.citizenshipInfo.details)) {
      console.error(
        "Incorrect details type for citizenship status 'nonCitizen'"
      );
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
      <h3>Non-U.S. Citizen Details</h3>
      {isNonCitizenInfo(formData.citizenshipInfo.details) && (
        <>
          <div>
            <label htmlFor="usEntryDate">US Entry Date:</label>
            <input
              id="usEntryDate"
              type="date"
              value={formData.citizenshipInfo.details?.us_entry_date || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ us_entry_date: e.target.value })
              }
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={
                  formData.citizenshipInfo.details?.is_entry_date_est || false
                }
                onChange={(e) =>
                  updateCitizenshipDetails({
                    is_entry_date_est: e.target.checked,
                  })
                }
              />
              Is Entry Date Estimated?
            </label>
          </div>
          <div>
            <label htmlFor="countryOfCitizenship1">
              Country of Citizenship 1:
            </label>
            <input
              id="countryOfCitizenship1"
              type="text"
              value={
                formData.citizenshipInfo.details?.country_of_citizenship1 || ""
              }
              onChange={(e) =>
                updateCitizenshipDetails({
                  country_of_citizenship1: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label htmlFor="countryOfCitizenship2">
              Country of Citizenship 2 (Optional):
            </label>
            <input
              id="countryOfCitizenship2"
              type="text"
              value={
                formData.citizenshipInfo.details?.country_of_citizenship2 || ""
              }
              onChange={(e) =>
                updateCitizenshipDetails({
                  country_of_citizenship2: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label htmlFor="entryCity">Entry City:</label>
            <input
              id="entryCity"
              type="text"
              value={formData.citizenshipInfo.details?.entry_city || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ entry_city: e.target.value })
              }
            />
          </div>
          <div>
            <label htmlFor="entryState">Entry State:</label>
            <input
              id="entryState"
              type="text"
              value={formData.citizenshipInfo.details?.entry_state || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ entry_state: e.target.value })
              }
            />
          </div>
          <div>
            <label htmlFor="alienRegistrationNum">
              Alien Registration Number:
            </label>
            <input
              id="alienRegistrationNum"
              type="text"
              value={
                formData.citizenshipInfo.details?.alien_registration_num || ""
              }
              onChange={(e) =>
                updateCitizenshipDetails({
                  alien_registration_num: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label htmlFor="expirationDate">Expiration Date:</label>
            <input
              id="expirationDate"
              type="date"
              value={formData.citizenshipInfo.details?.expiration_date || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ expiration_date: e.target.value })
              }
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={
                  formData.citizenshipInfo.details?.is_expiration_est || false
                }
                onChange={(e) =>
                  updateCitizenshipDetails({
                    is_expiration_est: e.target.checked,
                  })
                }
              />
              Is Expiration Date Estimated?
            </label>
          </div>
          <div>
  <label htmlFor="documentIssued">Document Issued:</label>
  <select
    id="documentIssued"
    value={formData.citizenshipInfo.details?.document_issued || ""}
    onChange={(e) =>
      updateCitizenshipDetails({
        document_issued: e.target.value as documentTypes["document_issued"],
      })
    }
  >
    <option value="I-94">I-94</option>
    <option value="U.S. Visa">U.S. Visa</option>
    <option value="I-20">I-20</option>
    <option value="DS-2019">DS-2019</option>
    <option value="Other">Other</option>
  </select>
</div>
{formData.citizenshipInfo.details?.document_issued === "Other" && (
  <div>
    <label htmlFor="otherDoc">Other Document:</label>
    <input
      id="otherDoc"
      type="text"
      value={formData.citizenshipInfo.details?.other_doc || ""}
      onChange={(e) => updateCitizenshipDetails({ other_doc: e.target.value })}
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
            <label htmlFor="docIssuedDate">Document Issued Date:</label>
            <input
              id="docIssuedDate"
              type="date"
              value={formData.citizenshipInfo.details?.doc_issued_date || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ doc_issued_date: e.target.value })
              }
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={
                  formData.citizenshipInfo.details?.is_doc_date_est || false
                }
                onChange={(e) =>
                  updateCitizenshipDetails({
                    is_doc_date_est: e.target.checked,
                  })
                }
              />
              Is Document Date Estimated?
            </label>
          </div>
          <div>
            <label htmlFor="docExpireDate">Document Expiry Date:</label>
            <input
              id="docExpireDate"
              type="date"
              value={formData.citizenshipInfo.details?.doc_expire_date || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ doc_expire_date: e.target.value })
              }
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={
                  formData.citizenshipInfo.details?.is_doc_expiration_est ||
                  false
                }
                onChange={(e) =>
                  updateCitizenshipDetails({
                    is_doc_expiration_est: e.target.checked,
                  })
                }
              />
              Is Document Expiry Date Estimated?
            </label>
          </div>
          <div>
            <label htmlFor="docFname">Document First Name:</label>
            <input
              id="docFname"
              type="text"
              value={formData.citizenshipInfo.details?.doc_fname || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ doc_fname: e.target.value })
              }
            />
          </div>
          <div>
            <label htmlFor="docLname">Document Last Name:</label>
            <input
              id="docLname"
              type="text"
              value={formData.citizenshipInfo.details?.doc_lname || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ doc_lname: e.target.value })
              }
            />
          </div>
          <div>
            <label htmlFor="docMname">Document Middle Name (Optional):</label>
            <input
              id="docMname"
              type="text"
              value={formData.citizenshipInfo.details?.doc_mname || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ doc_mname: e.target.value })
              }
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CitizenshipStatusFour;
