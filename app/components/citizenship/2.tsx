import React from 'react';
import { CitizenshipInfo } from "api_v2/interfaces/form";

// Define props type to ensure proper usage of the component
interface CitizenshipStatusTwoProps {
  documentDetails: CitizenshipInfo;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const CitizenshipStatusTwo: React.FC<CitizenshipStatusTwoProps> = ({ documentDetails, handleInputChange }) => {
  return (
    <>
      <p>Provide the location of entry into the U.S. City.</p>
      <input
        type="text"
        name="entryCity"
        onChange={handleInputChange}
        className="Section9"
      />

      <p>Provide the date of entry into the U.S.</p>
      <input
        type="date"
        name="entryDate"
        onChange={handleInputChange}
        className="Section9 FullDate"
      />
      <label>
        <input
          type="checkbox"
          name="entryDateEstimate"
          onChange={handleInputChange}
        />
        This date is an estimate.
      </label>

      <p>State</p>
      <select
        name="entryState"
        onChange={handleInputChange}
        className="Section9 IDState"
      >
        <option value="">Select State</option>
        {/* Dynamically generate state options here */}
        <option value="AK">AK</option>
        {/* Add other states */}
      </select>

      <p>Provide country(ies) of prior citizenship.</p>
      <input
        type="text"
        name="priorCitizenships"
        onChange={handleInputChange}
        className="Section9"
        placeholder="List countries separated by commas"
      />

      <p>Do you have an alien registration number?</p>
      <label>
        <input
          type="radio"
          name="hasAlienRegistrationNumber"
          value="yes"
          onChange={handleInputChange}
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="hasAlienRegistrationNumber"
          value="no"
          onChange={handleInputChange}
        />
        No
      </label>

      {documentDetails.alienRegistrationNumber === "yes" && (
        <>
          <p>Provide your U.S. alien registration number.</p>
          <input
            type="text"
            name="alienRegistrationNumber"
            onChange={handleInputChange}
            className="Section9"
          />
        </>
      )}

      <p>Provide your Certificate of Naturalization number (N550 or N570).</p>
      <input
        type="text"
        name="certificateOfNaturalizationNumber"
        onChange={handleInputChange}
        className="Section9"
      />

      <p>Provide the date the naturalization certificate was issued.</p>
      <input
        type="date"
        name="naturalizationCertificateIssueDate"
        onChange={handleInputChange}
        className="Section9 FullDate"
      />
      <label>
        <input
          type="checkbox"
          name="naturalizationCertificateIssueDateEstimate"
          onChange={handleInputChange}
        />
        This date is an estimate.
      </label>

      <p>Provide the basis of naturalization.</p>
      <label>
        <input
          type="checkbox"
          name="basisOfNaturalization"
          value="individualApplication"
          onChange={handleInputChange}
        />
        Based on my own individual naturalization application.
      </label>
      <label>
        <input
          type="checkbox"
          name="basisOfNaturalizationOther"
          onChange={handleInputChange}
        />
        Other (provide explanation)
      </label>
      {documentDetails.basisOfNaturalization && (
        <input
          type="text"
          name="basisOfNaturalizationExplanation"
          onChange={handleInputChange}
          className="Section9"
          placeholder="Provide explanation"
        />
      )}
    </>
  );
};

export default CitizenshipStatusTwo;
