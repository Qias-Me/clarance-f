import { ResidenceForm } from "api_v2/interfaces/form";
import React, { useState } from "react";

interface ResidenceFormProps {
  updateResidenceInfo: (info: Partial<ResidenceForm>) => void;
}

const Residence: React.FC<ResidenceFormProps> = ({ updateResidenceInfo }) => {
  const initialState: ResidenceForm = {
    residenceStartDate: "",
    residenceStartDateEstimate: false,
    residenceEndDate: "",
    residenceEndDateEstimate: false,
    residenceEndDatePresent: false,
    relationshipToResidence: "",
    streetAddress: "",
    city: "",
    zipCode: "",
    state: "",
    country: "",
    otherRelationshipDescription: "",
    // Initialize other fields
  };

  const [formState, setFormState] = useState<ResidenceForm>(initialState);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;
    const newValue =
      type === "checkbox" ? (event.target as HTMLInputElement).checked : value;
    setFormState((prevState) => ({
      ...prevState,
      [name]: newValue,
    }));
    // Optionally update parent component state
    updateResidenceInfo({ ...formState, [name]: newValue });
  };

  return (
    <section className="p-5 text-center text-sm-start">
      <div className="container">
        <p>Residence Information</p>
        <div className="Residence1">
          {/* Start of residence */}
          <p>When did you start living in your current residence?</p>
          <input
            type="month"
            name="residenceStartDate"
            value={formState.residenceStartDate}
            onChange={handleInputChange}
            className="Section11 Month TableResidence Entry1"
          />
          <label>
            <input
              type="checkbox"
              name="residenceStartDateEstimate"
              checked={formState.residenceStartDateEstimate}
              onChange={handleInputChange}
            />
            Estimate
          </label>

          {/* To Date */}
          <p>To Date</p>
          <input
            type="month"
            name="residenceEndDate"
            value={formState.residenceEndDate}
            onChange={handleInputChange}
            className="Section11 Month TableResidence Entry1"
          />
          <label>
            <input
              type="checkbox"
              name="residenceEndDatePresent"
              checked={formState.residenceEndDatePresent}
              onChange={handleInputChange}
            />
            Present
          </label>
          <label>
            <input
              type="checkbox"
              name="residenceEndDateEstimate"
              checked={formState.residenceEndDateEstimate}
              onChange={handleInputChange}
            />
            Estimate
          </label>

          {/* Relationship to Residence */}
          <p>
            Select the option that best describes your relationship with the
            residence
          </p>
          <div>
            <label>
              <input
                type="radio"
                name="relationshipToResidence"
                value="owned"
                checked={formState.relationshipToResidence === "owned"}
                onChange={handleInputChange}
              />
              Owned By You
            </label>
            {/* Repeat for other options */}
          </div>

          {formState.relationshipToResidence === "other" && (
            <input
              type="text"
              name="otherRelationshipDescription"
              value={formState.otherRelationshipDescription}
              onChange={handleInputChange}
              placeholder="If you selected Other, please provide an explanation"
            />
          )}

          {/* Address Fields */}
          <p>Street address</p>
          <input
            type="text"
            name="streetAddress"
            value={formState.streetAddress}
            onChange={handleInputChange}
            className="Section11 IDStreet TableResidence Entry1"
          />
          {/* Repeat for city, state, zip code, and country */}

          <p>Was the address for APO or FPO, or was it outside of the United States?</p>
      <div>
        <label>
          <input
            type="radio"
            name="addressType"
            value="APOFPO"
            checked={formState.isAPOFPO}
            onChange={handleInputChange} // Adjust based on your handling of radio buttons
          /> APO/FPO within the United States
        </label>
        <label>
          <input
            type="radio"
            name="addressType"
            value="Foreign"
            checked={formState.isForeign}
            onChange={handleInputChange}
          /> Address outside of the United States
        </label>
        <label>
          <input
            type="radio"
            name="addressType"
            value="Normal"
            checked={formState.isNormal}
            onChange={handleInputChange}
          /> Not an APO/FPO or any location outside of the United States
        </label>
      </div>

      {/* Dynamic content based on address type choice... */}
      {formState.isAPOFPO && (
        <div>
          {/* APO/FPO specific fields */}
        </div>
      )}
      {formState.isForeign && (
        <div>
          {/* Fields for addresses outside the United States */}
        </div>
      )}

      {/* Example of adding neighbor/contact person details */}
      <div>
        <p>Provide the name of a neighbor, landlord (if rental), or other person who knows you at this address.</p>
        {/* Last name */}
        <input
          type="text"
          name="neighborLastName"
          value={formState.neighborLastName}
          onChange={handleInputChange}
          placeholder="Last Name"
        />
        {/* More fields for first name, middle name, etc. */}
      </div>

      {/* Continue adding fields based on the provided HTML structure */}
        </div>
      </div>
    </section>
  );
};

export default Residence;
