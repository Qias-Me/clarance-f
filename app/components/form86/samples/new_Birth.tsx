import React from 'react';
import { useForm } from './formContext'; // Ensure the import path matches your project structure
import { ApplicantBirthInfo } from 'api_v2/interfaces/form3';

const BirthInfo = () => {
  const { formData, setFormData } = useForm();

  const updateBirthInfo = (info: Partial<ApplicantBirthInfo>) => {
    setFormData({
      ...formData,
      birthInfo: {
        ...formData.birthInfo,
        ...info,
      },
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    // Use the input's name to determine which field to update, and check the type for checkboxes
    updateBirthInfo({ [name]: type === "checkbox" ? checked : value });
  };

  return (
    <section className="p-5 text-center text-sm-start">
      <div className="container">
        <p>Please enter your Date of Birth.</p>
        <p>
          If you do not know your birthday, leave the date of birth blank, and
          select &quot;Estimate DOB&quot;. Click next when finished.
        </p>
        <p>Date of Birth</p>
        <input
          type="date"
          name="birthDate" // Matched with interface property
          className="Section2 FullDate"
          onChange={handleInputChange}
        />

        <div>
          <label htmlFor="isBirthDateEstimate">Estimate DOB</label>
          <input
            type="checkbox"
            id="isBirthDateEstimate" // Added an id that matches the htmlFor value of the label
            name="isBirthDateEstimate" // Matched with interface property
            className="Section2"
            onChange={handleInputChange}
          />
        </div>

        <p>Place of Birth</p>
        <input
          type="text"
          name="birthCity"
          placeholder="City"
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="birthState"
          placeholder="State"
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="birthCountry" // Assuming this was intended as 'Country', not 'County'
          placeholder="Country (Required)"
          onChange={handleInputChange}
          required
        />
      </div>
    </section>
  );
};

export default BirthInfo;
