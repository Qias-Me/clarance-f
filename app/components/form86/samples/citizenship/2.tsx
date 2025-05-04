import { useForm } from "../formContext"; // Adjust the import path
import {
  NaturalizedCitizenInfo,
  CitizenshipNaturalizationInfo,
} from "api_v2/interfaces/Citizenship";

const CitizenshipStatusTwo = () => {
  const { formData, setFormData } = useForm();

  // Type guard to check if details? is of type NaturalizedCitizenInfo
  const isNaturalizedCitizenInfo = (
    details: CitizenshipNaturalizationInfo["details"]
  ): details is NaturalizedCitizenInfo => {
    return formData.citizenshipInfo.citizenship_status_code === "naturalized";
  };

  const updateCitizenshipDetails = (
    detailsUpdate: Partial<NaturalizedCitizenInfo>
  ) => {
    if (!isNaturalizedCitizenInfo(formData.citizenshipInfo.details)) {
      console.error(
        "Incorrect details type for citizenship status 'naturalized'"
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
      <h3>Naturalized U.S. Citizen Details</h3>

      {isNaturalizedCitizenInfo(formData.citizenshipInfo.details) && (
        <>
          <div>
            <label htmlFor="usEntryDate">U.S. Entry Date:</label>
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
            <label htmlFor="countryOfCitizenship1">
              Country of Prior Citizenship #1:
            </label>
            <input
              id="countryOfCitizenship1"
              type="text"
              value={
                formData.citizenshipInfo.details?.country_of_citizenship_1 || ""
              }
              onChange={(e) =>
                updateCitizenshipDetails({
                  country_of_citizenship_1: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label htmlFor="countryOfCitizenship2">
              Country of Prior Citizenship #2:
            </label>
            <input
              id="countryOfCitizenship2"
              type="text"
              value={
                formData.citizenshipInfo.details?.country_of_citizenship_2 || ""
              }
              onChange={(e) =>
                updateCitizenshipDetails({
                  country_of_citizenship_2: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label htmlFor="hasAlienRegistrationYes">
              Do/did you have a U.S. alien registration number?
            </label>
            <div>
              <input
                type="radio"
                id="hasAlienRegistrationYes"
                name="hasAlienRegistration"
                value="yes"
                checked={
                  formData.citizenshipInfo.details?.has_alien_registration ||
                  false
                }
                onChange={() =>
                  updateCitizenshipDetails({ has_alien_registration: true })
                }
              />
              <label htmlFor="hasAlienRegistrationYes">Yes</label>

              <input
                type="radio"
                id="hasAlienRegistrationNo"
                name="hasAlienRegistration"
                value="no"
                checked={
                  !formData.citizenshipInfo.details?.has_alien_registration ||
                  false
                }
                onChange={() =>
                  updateCitizenshipDetails({
                    has_alien_registration: false,
                    alien_registration_num: undefined,
                  })
                }
              />
              <label htmlFor="hasAlienRegistrationNo">No</label>
            </div>
          </div>

          {formData.citizenshipInfo.details?.has_alien_registration && (
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
          )}

          <div>
            <label htmlFor="naturalizationNum">Naturalization Number:</label>
            <input
              id="naturalizationNum"
              type="text"
              value={formData.citizenshipInfo.details?.naturalization_num || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ naturalization_num: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="naturalizationIssueDate">
              Naturalization Issue Date:
            </label>
            <input
              id="naturalizationIssueDate"
              type="date"
              value={
                formData.citizenshipInfo.details?.naturalization_issue_date ||
                ""
              }
              onChange={(e) =>
                updateCitizenshipDetails({
                  naturalization_issue_date: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label htmlFor="courtIssuedDate">Court Issued Date:</label>
            <input
              id="courtIssuedDate"
              type="date"
              value={formData.citizenshipInfo.details?.court_issued_date || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ court_issued_date: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="courtCity">Court City:</label>
            <input
              id="courtCity"
              type="text"
              value={formData.citizenshipInfo.details?.court_city || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ court_city: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="courtState">Court State:</label>
            <input
              id="courtState"
              type="text"
              value={formData.citizenshipInfo.details?.court_state || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ court_state: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="courtZip">Court Zip Code:</label>
            <input
              id="courtZip"
              type="text"
              value={formData.citizenshipInfo.details?.court_zip || ""}
              onChange={(e) =>
                updateCitizenshipDetails({ court_zip: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="basisOfNaturalization">
              Basis of Naturalization:
            </label>
            <select
              id="basisOfNaturalization"
              value={
                formData.citizenshipInfo.details?.basis_of_naturalization || ""
              }
              onChange={(e) =>
                updateCitizenshipDetails({
                  basis_of_naturalization: e.target.value,
                })
              }
            >
              <option value="">Select One</option>
              <option value="individual_application">
                Based on my own individual naturalization application
              </option>
              <option value="other">Other</option>
            </select>
          </div>

          {formData.citizenshipInfo.details?.basis_of_naturalization ===
            "other" && (
            <div>
              <label htmlFor="otherBasisDetail">
                If other, provide explanation:
              </label>
              <input
                id="otherBasisDetail"
                type="text"
                value={
                  formData.citizenshipInfo.details?.other_basis_detail || ""
                }
                onChange={(e) =>
                  updateCitizenshipDetails({
                    other_basis_detail: e.target.value,
                  })
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CitizenshipStatusTwo;
