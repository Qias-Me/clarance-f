import React, { useState } from 'react';
import { PersonalInfo } from '../../../../api/interfaces/form';

interface PersonalDetailsFormProps {
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
}

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({ updatePersonalInfo }) => {
  const [personalInfo, setPersonalInfo] = useState({
    gender: '',
    weight: '',
    hairColor: '',
    eyeColor: '',
    heightFeet: '',
    heightInches: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Don't forget to return JSX from the component.
  return (
    <section className="p-5 text-center text-sm-start">
      <div className="container">
        <p>Please provide the following details about yourself</p>
        <div>
          <p>Gender:</p>
          <p>
            <input
              id="Section6Applicant_9440"
              type="radio"
              name="gender"
              value="male"
              className="Section6"
              onChange={handleChange}
            /> Male
          </p>
          <p>
            <input
              id="Section6Applicant_9439"
              type="radio"
              name="gender"
              value="female"
              className="Section6"
              onChange={handleChange}
            /> Female
          </p>
        </div>
        <div>
          <p>Weight (in pounds)</p>
          <input
            type="text"
            name="weight"
            className="Section6"
            onChange={handleChange}
          />
        </div>
        <div>
          <p>Hair color</p>
          <select
            id="Section6Applicant_9437"
            name="hairColor"
            className="Section6"
            onChange={handleChange}
          >
            {/* Options for hair color */}
          </select>
        </div>
        <div>
          <p>Eye color</p>
          <select
            id="Section6Applicant_9436" // Corrected ID
            name="eyeColor" // Corrected Name
            className="Section6"
            onChange={handleChange}
          >
            {/* Options for eye color */}
          </select>
        </div>
      </div>
    </section>
  );
};

export default PersonalDetailsForm;
