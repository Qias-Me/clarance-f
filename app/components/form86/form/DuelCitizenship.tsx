// DualCitizenshipForm.tsx
import React, { useState } from "react";

interface DualCitizenshipFormData {
  hasDualCitizenship: string;
  countryOfCitizenship: string;
  acquisitionMethod: string;
  citizenshipFromDate: string;
  fromDateEstimate: boolean;
  citizenshipToDate: string;
  toDateEstimate: boolean;
  toDatePresent: boolean;
  renouncedCitizenship: string;
  renouncementExplanation: string;
}

interface DualCitizenshipFormProps {
  updateDualCitizenshipInfo: (info: Partial<DualCitizenshipFormData>) => void;
}

const DualCitizenshipForm: React.FC<DualCitizenshipFormProps> = ({
  updateDualCitizenshipInfo,
}) => {
  const [formState, setFormState] = useState<Partial<DualCitizenshipFormData>>({});

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;
    const newValue = type === "checkbox" ? (event.target as HTMLInputElement).checked : value;
    setFormState((prevState) => ({
      ...prevState,
      [name]: newValue,
    }));
    // Optionally update parent component state
    updateDualCitizenshipInfo({ ...formState, [name]: newValue });
  };
  

  return (
    <section className="p-5 text-center text-sm-start">
    <div className="container">
      <p>Do you now or have you EVER held dual/multiple citizenships?</p>
      <label>
        <input
          type="radio"
          name="hasDualCitizenship"
          value="yes"
          onChange={handleInputChange}
          className="Section10"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="hasDualCitizenship"
          value="no"
          onChange={handleInputChange}
          className="Section10"
        />
        No
      </label>

      {formState.hasDualCitizenship === "yes" && (
        <div>
          <p>
            Complete the following if you answered (YES) to having EVER held
            dual/multiple citizenship. Provide country of citizenship.
          </p>
          <select
            name="countryOfCitizenship"
            onChange={handleInputChange}
            className="Section10 IDCountry"
          >
            <option value="United States">United States</option>
            <option value="Zambia">Zambia</option>
            <option value="Zimbabwe">Zimbabwe</option>
          </select>

          <p>
            How did you acquire this non-U.S. citizenship you now have or
            previously had?
          </p>
          <input
            type="text"
            name="acquisitionMethod"
            onChange={handleInputChange}
            className="Section10"
          />

          <p>From Date</p>
          <input
            type="month"
            name="citizenshipFromDate"
            onChange={handleInputChange}
            className="Section10"
          />
          <label>
            <input
              type="checkbox"
              name="fromDateEstimate"
              onChange={handleInputChange}
            />
            Estimate
          </label>

          <p>To Date</p>
          <input
            type="month"
            name="citizenshipToDate"
            onChange={handleInputChange}
            className="Section10"
          />
          <label>
            <input
              type="checkbox"
              name="toDateEstimate"
              onChange={handleInputChange}
            />
            Estimate
          </label>
          <label>
            <input
              type="checkbox"
              name="toDatePresent"
              onChange={handleInputChange}
            />
            Present
          </label>

          <p>
            Have you taken any action to renounce your foreign citizenship?
          </p>
          <label>
            <input
              type="radio"
              name="renouncedCitizenship"
              value="yes"
              onChange={handleInputChange}
              className="Section10"
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="renouncedCitizenship"
              value="no"
              onChange={handleInputChange}
              className="Section10"
            />
            No
          </label>

          <p>Provide explanation:</p>
          <input
            type="text"
            name="renouncementExplanation"
            onChange={handleInputChange}
            className="Section10"
          />
        </div>
      )}
    </div>
  </section>
  );
};

export default DualCitizenshipForm;
