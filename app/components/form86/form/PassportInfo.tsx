import React, { useState } from "react";
import { PersonalInfo } from "../../../../api/interfaces/form";

interface PersonalDetailsFormProps {
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
}

const PassportInfo: React.FC<PersonalDetailsFormProps> = ({
  updatePersonalInfo,
}) => {
  const [hasPassport, setHasPassport] = useState<boolean | null>(null);
  const [passportInfo, setPassportInfo] = useState({
    passportNumber: "",
    issueDate: "",
    issueDateEstimate: false,
    expirationDate: "",
    expirationDateEstimate: false,
    lastName: "",
    firstName: "",
    middleName: "",
    suffix: "None", // Default value as 'None'
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = event.target;
    const value =
      target.type === "checkbox"
        ? (target as HTMLInputElement).checked
        : target.value;
    const name = target.name;

    setPassportInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHasPassport(event.target.value === "0"); // Assuming '0' means Yes, they have a passport
  };

  return (
    <section className="p-5 text-center text-sm-start">
      <div className="container">
        <p>Do you currently possess a US Passport?</p>
        <div className="radio1">
          <p>
            <input
              id="Section8Applicant_95550"
              type="radio"
              name="PassportPossessed"
              value="0"
              className="Section8 HasEntry1"
              onChange={handleRadioChange}
            />
            Yes
          </p>
          <p>
            <input
              id="Section8Applicant_95541"
              type="radio"
              name="PassportPossessed"
              value="1"
              className="Section8 NoEntry1"
              onChange={handleRadioChange}
            />
            No
          </p>
        </div>

        {hasPassport && (
          <div className="Entry1">
            <p>
              Provide the following information for the most recent U.S.
              passport you currently possess.
            </p>
            <p>Passport number</p>
            <input
              type="text"
              id="Section8Applicant_9553"
              className="Section8"
              name="passportNumber"
              value={passportInfo.passportNumber}
              onChange={handleChange}
            />

            <p>Issue date (Month/Day/Year)</p>
            <input
              type="date"
              id="Section8Applicant_9551"
              className="Section8 FullDate"
              name="issueDate"
              value={passportInfo.issueDate}
              onChange={handleChange}
            />

            <p>
              This date was an estimate and may not be correct
              <input
                type="checkbox"
                id="Section8Applicant_9523"
                className="Section8"
                name="issueDateEstimate"
                checked={passportInfo.issueDateEstimate}
                onChange={handleChange}
              />
            </p>

            <p>Expiration date (Month/Day/Year)</p>
            <input
              type="date"
              id="Section8Applicant_9550"
              className="Section8 FullDate"
              name="expirationDate"
              value={passportInfo.expirationDate}
              onChange={handleChange}
            />

            <p>
              This date was an estimate and may not be correct
              <input
                type="checkbox"
                id="Section8Applicant_9549"
                className="Section8"
                name="expirationDateEstimate"
                checked={passportInfo.expirationDateEstimate}
                onChange={handleChange}
              />
            </p>

            <p>Provide the name in which passport was first issued.</p>
            <p>Last name</p>
            <input
              type="text"
              id="Section8ApplicantLastName_9547"
              className="Section8 IDLastName"
              name="lastName"
              value={passportInfo.lastName}
              onChange={handleChange}
            />

            <p>First name</p>
            <input
              type="text"
              id="Section8ApplicantFirstName_9546"
              className="Section8 IDFirstName"
              name="firstName"
              value={passportInfo.firstName}
              onChange={handleChange}
            />

            <p>Middle name</p>
            <input
              type="text"
              id="Section8ApplicantMiddleName_9548"
              className="Section8 IDMiddleName"
              name="middleName"
              value={passportInfo.middleName}
              onChange={handleChange}
            />

            <p>Suffix</p>
            <select
              id="Section8ApplicantSuffix_9545"
              className="Section8 IDSuffix"
              name="suffix"
              value={passportInfo.suffix}
              onChange={handleChange}
            >
              <option value="None">None</option>
              {/* Additional options */}
            </select>
          </div>
        )}
      </div>
    </section>
  );
};

export default PassportInfo;
