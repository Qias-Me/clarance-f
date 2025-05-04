import { useState } from 'react';
import { useForm } from './formContext'; // Adjust the import path as needed
import { ApplicantPersonalInfo } from 'api_v2/interfaces/form3';

const FormSectionThree = () => {
  const [showSSN, setShowSSN] = useState(false);
  const { formData, setFormData } = useForm();

  const toggleSSNVisibility = () => setShowSSN(!showSSN);

  const updatePersonalInfo = (info: Partial<ApplicantPersonalInfo>) => {
    setFormData({
      ...formData,
      personalInfo: {
        ...formData.personalInfo,
        ...info,
      },
    });
  };

  return (
    <section className="p-5 text-center text-sm-start">
      <div className="container">
        <p>Social Security Number</p>
        <input
          type={showSSN ? "text" : "password"}
          className="form-control" // Assuming you're using a framework like Bootstrap, adjust if not
          onChange={(e) => updatePersonalInfo({ ssn: e.target.value })}
        />
        <div className="form-check mt-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="toggleSsnVisibility"
            checked={showSSN}
            onChange={toggleSSNVisibility}
          />
          <label className="form-check-label" htmlFor="toggleSsnVisibility">
            Show SSN
          </label>
        </div>
      </div>
    </section>
  );
};

export default FormSectionThree;
