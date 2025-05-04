import { useForm } from "../formContext"; // Adjust the import path
import {
  DerivedCitizenInfo,
  CitizenshipNaturalizationInfo,
} from "api_v2/interfaces/Citizenship";

const CitizenshipStatusThree = () => {
  const { formData, setFormData } = useForm();

  const isDerivedCitizenInfo = (
    details: CitizenshipNaturalizationInfo["details"]
  ): details is DerivedCitizenInfo => {
    return formData.citizenshipInfo.citizenship_status_code === "derived";
  };

  const updateCitizenshipDetails = (
    detailsUpdate: Partial<DerivedCitizenInfo>
  ) => {
    if (!isDerivedCitizenInfo(formData.citizenshipInfo.details)) {
      console.error("Incorrect details type for citizenship status 'derived'");
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
      <h3>Derived U.S. Citizen Details</h3>

      {isDerivedCitizenInfo(formData.citizenshipInfo.details) && (
        <div>
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
            <label htmlFor="permanentResidentNum">
              Permanent Resident Number:
            </label>
            <input
              id="permanentResidentNum"
              type="text"
              value={
                formData.citizenshipInfo.details?.permanent_resident_num || ""
              }
              onChange={(e) =>
                updateCitizenshipDetails({
                  permanent_resident_num: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label htmlFor="certificateOfCitizenshipNum">
              Certificate of Citizenship Number:
            </label>
            <input
              id="certificateOfCitizenshipNum"
              type="text"
              value={
                formData.citizenshipInfo.details
                  ?.certificate_of_citizenship_num || ""
              }
              onChange={(e) =>
                updateCitizenshipDetails({
                  certificate_of_citizenship_num: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label htmlFor="docFname">Document First Name:</label>
            <input
              id="docFname"
              type="text"
              value={formData.citizenshipInfo.details?.doc_fname || ""}
              onChange={(e) =>
                updateCitizenshipDetails({
                  doc_fname: e.target.value,
                })
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
                updateCitizenshipDetails({
                  doc_lname: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label htmlFor="docMname">
              Document Middle Name (if applicable):
            </label>
            <input
              id="docMname"
              type="text"
              value={formData.citizenshipInfo.details?.doc_mname || ""}
              onChange={(e) =>
                updateCitizenshipDetails({
                  doc_mname: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label htmlFor="docSuffix">Document Suffix (if applicable):</label>
            <input
              id="docSuffix"
              type="text"
              value={formData.citizenshipInfo.details?.doc_suffix || ""}
              onChange={(e) =>
                updateCitizenshipDetails({
                  doc_suffix: e.target.value,
                })
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
                updateCitizenshipDetails({
                  doc_issue_date: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label>
              Is the Document Date Estimated?
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
            </label>
          </div>

          <div>
  <label htmlFor="basisOfCitizenship">Basis of Citizenship:</label>
  <select
    id="basisOfCitizenship"
    value={formData.citizenshipInfo.details?.basis_of_citizenship}
    onChange={(e) => {
      // Asserting the value to the specific type expected by the interface
      updateCitizenshipDetails({
        basis_of_citizenship: e.target.value as "other" | "byOp",
      });
    }}
  >
    <option value="">Select One</option>
    <option value="ByOp">By operation of law through my U.S. citizen parent</option>
    <option value="Other">Other</option>
  </select>
</div>

{formData.citizenshipInfo.details?.basis_of_citizenship === "other" && (
  <div>
    <label htmlFor="basisOfCitizenshipExplanation">If Other, provide explanation:</label>
    <input
      id="basisOfCitizenshipExplanation"
      type="text"
      value={formData.citizenshipInfo.details?.basis_of_citizenship_explanation || ""}
      onChange={(e) =>
        updateCitizenshipDetails({
          basis_of_citizenship_explanation: e.target.value,
        })
      }
    />
  </div>
)}


        </div>
      )}
    </div>
  );
};

export default CitizenshipStatusThree;
