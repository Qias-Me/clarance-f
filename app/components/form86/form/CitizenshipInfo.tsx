import React, { useState, ChangeEvent } from "react";
import { CitizenshipInfo } from "../../../../api/interfaces/form";
import CitizenshipStatusOne from "../../citizenship/1";
import CitizenshipStatusTwo from "~/components/citizenship/2";
import CitizenshipStatusThree from "~/components/citizenship/3";
import CitizenshipStatusFour from "~/components/citizenship/4";
// Import other CitizenshipStatus components as needed

interface PersonalDetailsFormProps {
  updateCitizenshipInfo: (info: Partial<CitizenshipInfo>) => void;
}

const CitizenshipInfo: React.FC<PersonalDetailsFormProps> = ({
  updateCitizenshipInfo,
}) => {
  const [citizenshipStatus, setCitizenshipStatus] = useState<string>("");
  const [documentDetails, setDocumentDetails] = useState<CitizenshipInfo>({
    documentNumber: "",
    issueDate: "",
    issueDateEstimate: false,
    expirationDate: "",
    expirationDateEstimate: false,
    lastName: "",
    firstName: "",
    middleName: "",
    suffix: "",
    entryDate: "",
    entryDateEstimate: false,
    entryCity: "", // Add default value for entryCity
    entryState: "", // Add default value for entryState
    priorCitizenships: [],
    alienRegistrationNumber: undefined, // Optional, can be undefined
    certificateOfNaturalizationNumber: "", // Add default value
    naturalizationCertificateIssueDate: "", // Add default value
    naturalizationCertificateIssueDateEstimate: false, // Add default value
    courtName: "", // Add default value
    courtAddress: "", // Add default value, consider breaking down further if needed
    courtCity: "", // Add default value
    courtState: "", // Add default value
    courtZipCode: "", // Add default value
    basisOfNaturalization: "", // Add default value
    basisOfNaturalizationExplanation: undefined, // Optional, can be undefined
    permanentResidentCardNumber: undefined, // Optional, can be undefined
    certificateOfCitizenshipNumber: undefined, // Optional, can be undefined
    derivedCertificateIssueDate: undefined, // Optional, can be undefined
    derivedCertificateIssueDateEstimate: undefined, // Optional, can be undefined
    alienRegistrationNumberDerived: undefined, // Optional, can be undefined
    residenceStatus: undefined, // Optional, can be undefined
    nonCitizenEntryDate: undefined, // Optional, can be undefined
    nonCitizenEntryDateEstimate: undefined, // Optional, can be undefined
    countryOfCitizenship: undefined, // Optional, can be undefined
    placeOfEntry: undefined, // Optional, can be undefined
    alienRegistrationNumberNonCitizen: undefined, // Optional, can be undefined
    documentExpirationDate: undefined, // Optional, can be undefined
    documentExpirationDateEstimate: undefined, // Optional, can be undefined
    documentationType: undefined, // Optional, can be undefined
    documentationNumber: undefined, // Optional, can be undefined
    documentationIssueDate: undefined, // Optional, can be undefined
    documentationIssueDateEstimate: undefined, // Optional, can be undefined
    documentationExpirationDate: undefined, // Optional, can be undefined
    documentationExpirationDateEstimate: undefined, // Optional, can be undefined
    nameOnDocumentation: undefined, // Optional, can be undefined
    //Option 3
    bornOnMilitaryInstallation: undefined,
    documentIssueDateBornAbroadEstimate: undefined,
    issuanceCity: undefined,
    issuanceCountry: undefined,
    documentIssueDateBornAbroad: undefined,

    militaryBaseName: undefined,
    basisOfDerivedCitizenship: "",
    documentationTypeBornAbroadExplanation: undefined,
    documentationTypeBornAbroad: undefined,
    basisOfDerivedCitizenshipExplanation: "",

    //Option 4
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = event.target;
    const value =
      target.type === "checkbox"
        ? (target as HTMLInputElement).checked
        : target.value;
    const name = target.name;

    setDocumentDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setCitizenshipStatus(event.target.value);
  };

  return (
    <section className="p-5 text-center text-sm-start">
      <div className="container">
        <div>
          <label htmlFor="citizenshipStatus">Citizenship Status: </label>
          <select
            id="citizenshipStatus"
            value={citizenshipStatus}
            onChange={handleStatusChange}
            className="Section9"
          >
            <option value="0">Select Status</option>
            <option value="1">U.S. Citizen Born Abroad</option>
            <option value="2">I am a naturalized U.S. citizen.</option>
            <option value="3">I am a derived U.S. citizen.</option>
            <option value="4">I am not a U.S. citizen.</option>
          </select>
        </div>

        {citizenshipStatus === "1" && (
          <CitizenshipStatusOne
            documentDetails={documentDetails}
            handleInputChange={handleInputChange}
          />
        )}
         {citizenshipStatus === "2" && (
          <CitizenshipStatusTwo
            documentDetails={documentDetails}
            handleInputChange={handleInputChange}
          />
        )}
         {citizenshipStatus === "3" && (
          <CitizenshipStatusThree
            documentDetails={documentDetails}
            handleInputChange={handleInputChange}
          />
        )}
         {citizenshipStatus === "4" && (
          <CitizenshipStatusFour
            documentDetails={documentDetails}
            handleInputChange={handleInputChange}
          />
        )}
      </div>
    </section>
  );
};

export default CitizenshipInfo;
