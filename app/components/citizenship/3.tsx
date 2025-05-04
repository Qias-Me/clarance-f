import React from "react";
import { CitizenshipInfo } from "api_v2/interfaces/form";

interface CitizenshipStatusThreeProps {
  documentDetails: CitizenshipInfo;
  handleInputChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

const CitizenshipStatusThree: React.FC<CitizenshipStatusThreeProps> = ({
  documentDetails,
  handleInputChange,
}) => {
  return (
    <>
      <p>
        9.3 Complete the following if you answered that you are a derived U.S.
        Citizen. Provide your alien registration number (on Certificate of
        Citizenship utilize USCIS, CIS or INS registration number).
      </p>
      <input
        type="text"
        name="alienRegistrationNumberDerived"
        value={documentDetails.alienRegistrationNumberDerived || ""}
        onChange={handleInputChange}
        className="Section9"
      />

      <p>Provide your Permanent Resident Card number (I-551)</p>
      <input
        type="text"
        name="permanentResidentCardNumber"
        value={documentDetails.permanentResidentCardNumber || ""}
        onChange={handleInputChange}
        className="Section9"
      />

      <p>Provide your Certificate of Citizenship number (N560 or N561)</p>
      <input
        type="text"
        name="certificateOfCitizenshipNumber"
        value={documentDetails.certificateOfCitizenshipNumber || ""}
        onChange={handleInputChange}
        className="Section9"
      />

      <p>Provide the name in which the document was issued.</p>
      <div>
        <p>Last name</p>
        <input
          type="text"
          name="lastNameOnDocument"
          value={documentDetails.lastName || ""}
          onChange={handleInputChange}
          className="Section9 IDLastName"
        />

        <p>First name</p>
        <input
          type="text"
          name="firstNameOnDocument"
          value={documentDetails.firstName || ""}
          onChange={handleInputChange}
          className="Section9 IDFirstName"
        />

        <p>Middle name</p>
        <input
          type="text"
          name="middleNameOnDocument"
          value={documentDetails.middleName || ""}
          onChange={handleInputChange}
          className="Section9 IDMiddleName"
        />
      </div>

      <p>Suffix</p>
      <select
        name="suffixOnDocument"
        value={documentDetails.suffix || ""}
        onChange={handleInputChange}
        className="Section9 IDSuffix"
      >
        <option value="None">None</option>
        <option value="Jr">Jr.</option>
        <option value="Sr">Sr.</option>
        {/* Add other options */}
        <option value="Other">Other</option>
      </select>

      <p>Provide the date document was issued.</p>
      <input
        type="date"
        name="derivedCertificateIssueDate"
        value={documentDetails.derivedCertificateIssueDate || ""}
        onChange={handleInputChange}
        className="Section9 FullDate"
      />
      <label>
        <input
          type="checkbox"
          name="derivedCertificateIssueDateEstimate"
          checked={documentDetails.derivedCertificateIssueDateEstimate || false}
          onChange={handleInputChange}
        />
        Select this box if the date provided was an estimate
      </label>

      <p>Provide the basis of derived citizenship.</p>
      <label>
        <input
          type="checkbox"
          name="basisOfDerivedCitizenshipLaw"
          value="By operation of law through my U.S. citizen parent."
          checked={
            documentDetails.basisOfDerivedCitizenship ===
            "By operation of law through my U.S. citizen parent."
          }
          onChange={handleInputChange}
        />
        By operation of law through my U.S. citizen parent.
      </label>
      <label>
        <input
          type="checkbox"
          name="basisOfDerivedCitizenshipOther"
          value="Other"
          checked={documentDetails.basisOfDerivedCitizenship === "Other"}
          onChange={handleInputChange}
        />
        Other
      </label>

      {documentDetails.basisOfDerivedCitizenship === "Other" && (
        <>
          <p>If you selected other, please provide an explanation</p>
          <input
            type="text"
            name="basisOfDerivedCitizenshipExplanation"
            value={documentDetails.basisOfDerivedCitizenshipExplanation || ""}
            onChange={handleInputChange}
            className="Section9"
          />
        </>
      )}
    </>
  );
};

export default CitizenshipStatusThree;
