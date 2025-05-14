import { type CitizenshipInfo } from "api/interfaces/sections/citizenship";
import React from "react";



interface CitizenshipStatusOneProps {
  documentDetails: CitizenshipInfo;
  handleInputChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

const CitizenshipStatusOne: React.FC<CitizenshipStatusOneProps> = ({
  documentDetails,
  handleInputChange,
}) => {
  return (
    <div className="Hidden1">
      <p>
        Provide the type of documentation for being a U.S citizen born abroad
      </p>
      <div>
        <label>
          <input
            type="radio"
            name="documentationTypeBornAbroad"
            value="FS 240"
            checked={documentDetails.documentationTypeBornAbroad === "FS 240"}
            onChange={handleInputChange}
          />
          FS 240
        </label>
        <label>
          <input
            type="radio"
            name="documentationTypeBornAbroad"
            value="DS 1350"
            checked={documentDetails.documentationTypeBornAbroad === "DS 1350"}
            onChange={handleInputChange}
          />
          DS 1350
        </label>
        <label>
          <input
            type="radio"
            name="documentationTypeBornAbroad"
            value="FS 545"
            checked={documentDetails.documentationTypeBornAbroad === "FS 545"}
            onChange={handleInputChange}
          />
          FS 545
        </label>
        <label>
          <input
            type="radio"
            name="documentationTypeBornAbroad"
            value="Other"
            checked={documentDetails.documentationTypeBornAbroad === "Other"}
            onChange={handleInputChange}
          />
          Other
        </label>
        {documentDetails.documentationTypeBornAbroad === "Other" && (
          <div>
            <p>If you selected other, please provide an explanation</p>
            <input
              type="text"
              name="documentationTypeBornAbroadExplanation"
              value={
                documentDetails.documentationTypeBornAbroadExplanation || ""
              }
              onChange={handleInputChange}
              className="Section9"
            />
          </div>
        )}
      </div>

      <p>Provide document number for U.S. citizen born abroad.</p>
      <input
        type="text"
        name="documentNumberBornAbroad"
        value={documentDetails.documentNumberBornAbroad || ""}
        onChange={handleInputChange}
        className="Section9"
      />

      <p>Provide the date the document was issued.</p>
      <input
        type="date"
        name="documentIssueDateBornAbroad"
        value={documentDetails.documentIssueDateBornAbroad || ""}
        onChange={handleInputChange}
        className="Section9 FullDate"
      />
      <div>
        <input
          type="checkbox"
          name="documentIssueDateBornAbroadEstimate"
          checked={documentDetails.documentIssueDateBornAbroadEstimate || false}
          onChange={handleInputChange}
        />
        Select this box if the date provided was an estimate
      </div>

      <p>
        Provide the place of issuance. Provide City and Country. If it is within
        the United States, please provide the state.
      </p>
      <div>
        <p>City</p>
        <input
          type="text"
          name="issuanceCity"
          value={documentDetails.issuanceCity || ""}
          onChange={handleInputChange}
          className="Section9"
        />

        <p>Country</p>
        <select
          name="issuanceCountry"
          value={documentDetails.issuanceCountry || ""}
          onChange={handleInputChange}
          className="Section9 IDCountry"
        >
          {/* Dynamically generate options here */}
          <option value="United States">United States</option>
          <option value="Afghanistan">Afghanistan</option>
          {/* Add other countries as options */}
        </select>
      </div>

      {/* Implement additional fields as per the structure provided */}
      {/* Names, Suffix, Military Installation, etc. */}
    </div>
  );
};

export default CitizenshipStatusOne;
