// PersonalDetailsForm.tsx
import React, { useState } from "react";
import { ApplicantNames, ApplicantPersonalInfo } from "api_v2/interfaces/form2";

// Extending the PersonalInfo interface to include new details
interface PersonalInfo extends ApplicantPersonalInfo {
  dateOfBirth: string; // Assuming format MM/DD/YYYY
  dateOfBirthEstimated: boolean;
  birthCity: string;
  birthState: string;
  birthCountry: string;
  socialSecurityNumber: string; // Assuming U.S. format
  hasOtherNames: boolean;
  otherNames?: ApplicantNames[]; // Aligning with the ApplicantNames structure
  weight: number;
  heightFeet: number;
  heightInches: number;
  hairColor: string;
  eyeColor: string;
  gender: "Male" | "Female";
}

// Assuming PersonalInfo and ApplicantNames are defined and imported

interface PersonalDetailsFormProps {
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
}

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  updatePersonalInfo,
}) => {
  const [personalInfo, setPersonalInfo] = useState<Partial<PersonalInfo>>({
    otherNames: [],
    dateOfBirthEstimated: false,
  });

  // Adjusted type for `handleAliasChange` to avoid `any`
  const handleAliasChange = (
    index: number,
    field: keyof ApplicantNames,
    value: string | boolean // Adjust this type based on the actual fields in ApplicantNames
  ) => {
    const updatedOtherNames =
      personalInfo.otherNames?.map((name, idx) => {
        if (idx === index) {
          // Use type assertion if necessary, e.g., for boolean fields
          return { ...name, [field]: value };
        }
        return name;
      }) ?? [];
    setPersonalInfo((prev) => ({ ...prev, otherNames: updatedOtherNames }));
  };

  // Adjust `handleAddAlias` to ensure that the new alias has default values for all required fields
  const handleAddAlias = () => {
    // This assumes you adjust your logic or interfaces so that missing fields are handled or have default values
    const newAlias = {
      lastName: "",
      firstName: "",
      // Ensure all required fields are included here with appropriate default values
    };
    setPersonalInfo((prev) => ({
      ...prev,
      otherNames: [...(prev.otherNames ?? []), newAlias as ApplicantNames], // Cast to `ApplicantNames` if safe to do so
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const checked = isCheckbox
      ? (e.target as HTMLInputElement).checked
      : undefined;
    setPersonalInfo((prev) => ({
      ...prev,
      [name]: isCheckbox ? checked : value,
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePersonalInfo(personalInfo);
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 text-center text-sm-start">
      <div className="container">
      {/* Full Name Section */}
        {/* Date of Birth and Place of Birth Section */}
        <input
          type="text"
          name="birthCity"
          onChange={handleChange}
          placeholder="Birth City"
        />
        <input
          type="text"
          name="birthState"
          onChange={handleChange}
          placeholder="Birth State"
        />
        <input
          type="text"
          name="birthCountry"
          onChange={handleChange}
          placeholder="Birth Country"
        />
        {/* Social Security Number Section */}
        <input
          type="text"
          name="socialSecurityNumber"
          onChange={handleChange}
          placeholder="Social Security Number"
        />

        {/* Dynamic Aliases Section */}

{
  personalInfo.otherNames?.map((alias, index) => (
    <div key={index} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
      <h4>Alias #{index + 1}</h4>
      <input
        type="text"
        value={alias.firstName}
        onChange={(e) => handleAliasChange(index, 'firstName', e.target.value)}
        placeholder="First name"
      />
      <input
        type="text"
        value={alias.lastName}
        onChange={(e) => handleAliasChange(index, 'lastName', e.target.value)}
        placeholder="Last name"
      />
      <input
        type="text"
        value={alias.middleName}
        onChange={(e) => handleAliasChange(index, 'middleName', e.target.value)}
        placeholder="Middle name"
      />
      <input
        type="text"
        value={alias.suffix}
        onChange={(e) => handleAliasChange(index, 'suffix', e.target.value)}
        placeholder="Suffix (Jr., Sr., etc.)"
      />
      <input
        type="text"
        value={alias.nameStarted}
        onChange={(e) => handleAliasChange(index, 'nameStarted', e.target.value)}
        placeholder="From (Month/Year)"
      />
      <input
        type="text"
        value={alias.nameEnded}
        onChange={(e) => handleAliasChange(index, 'nameEnded', e.target.value)}
        placeholder="To (Month/Year)"
      />
      <label>
        <input
          type="checkbox"
          checked={alias.isStartDateEst}
          onChange={(e) => handleAliasChange(index, 'isStartDateEst', e.target.checked)}
        />
        Start Date Estimated?
      </label>
      <label>
        <input
          type="checkbox"
          checked={alias.isEndDateEst}
          onChange={(e) => handleAliasChange(index, 'isEndDateEst', e.target.checked)}
        />
        End Date Estimated?
      </label>
      <label>
        <input
          type="checkbox"
          checked={alias.isNamePresent}
          onChange={(e) => handleAliasChange(index, 'isNamePresent', e.target.checked)}
        />
        Name Currently Used?
      </label>
      <label>
        <input
          type="checkbox"
          checked={alias.isMaidenName}
          onChange={(e) => handleAliasChange(index, 'isMaidenName', e.target.checked)}
        />
        Is Maiden Name?
      </label>
      <input
        type="text"
        value={alias.reasonChanged}
        onChange={(e) => handleAliasChange(index, 'reasonChanged', e.target.value)}
        placeholder="Reason for Name Change"
      />
    </div>
  ))
}

        {(personalInfo.otherNames?.length ?? 0) < 4 &&  (
          <button type="button" onClick={handleAddAlias}>
            Add Another Alias
          </button>
        )}

        {/* Section for Date of Birth with Estimation Option */}

        
        <div>
          <input
            type="text"
            name="dateOfBirth"
            onChange={handleChange}
            placeholder="Date of Birth (MM/DD/YYYY)"
          />
          <label>
            <input
              type="checkbox"
              name="dateOfBirthEstimated"
              onChange={handleChange}
              checked={personalInfo.dateOfBirthEstimated || false}
            />
            Estimated?
          </label>
        </div>

        {/* Additional sections and Submit Button */}
        <button type="submit">Submit</button>
      </div>
    </form>
  );
};

export default PersonalDetailsForm;
