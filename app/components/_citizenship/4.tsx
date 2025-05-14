import { type CitizenshipInfo } from "api/interfaces/sections/citizenship";
import React from "react";

interface CitizenshipStatusOneProps {
  documentDetails: CitizenshipInfo;
  handleInputChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

const CitizenshipStatusFour: React.FC<CitizenshipStatusOneProps> = ({
  documentDetails,
  handleInputChange,
}) => {
  return (
    <div className="Hidden4">
      <label>
        <input
          type="checkbox"
          name="documentationIssueDateEstimate"
          checked={documentDetails.documentationIssueDateEstimate || false}
          onChange={handleInputChange}
        />
        Select this box if the date provided was an estimate.
      </label>

      <p>
        Complete the following if you answered that you are not a U.S. Citizen.
      </p>

      <p>Provide your residence status.</p>
      <input
        type="text"
        name="residenceStatus"
        value={documentDetails.residenceStatus || ""}
        onChange={handleInputChange}
        className="Section9"
      />

      <p>Provide your date of entry into the U.S.</p>
      <input
        type="date"
        name="nonCitizenEntryDate"
        value={documentDetails.nonCitizenEntryDate || ""}
        onChange={handleInputChange}
        className="Section9 FullDate"
      />

      <p>Provide country(ies) of citizenship.</p>
      <select
        name="countryOfCitizenship"
        value={documentDetails.countryOfCitizenship || ""}
        onChange={handleInputChange}
        className="Section9 IDCountry"
      >
        <option value="">Select Country</option>
        {/* Dynamically generate country options */}
      </select>

      <p>Provide your place of entry in the U.S. City</p>
      <input
        type="text"
        name="placeOfEntry"
        value={documentDetails.placeOfEntry || ""}
        onChange={handleInputChange}
        className="Section9"
      />

      <p>Provide your alien registration number (I-551, I-766)</p>
      <input
        type="text"
        name="alienRegistrationNumberNonCitizen"
        value={documentDetails.alienRegistrationNumberNonCitizen || ""}
        onChange={handleInputChange}
        className="Section9"
      />

      <p>Provide the type of documentation that you have</p>
      {/* Implement radio buttons for documentationType selection */}
    </div>
  );
};

export default CitizenshipStatusFour;
