import React from "react";
import { PersonalInfo } from "../../../../api/interfaces/form";

interface BirthInfoFormProps {
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
}

const BirthInfoForm: React.FC<BirthInfoFormProps> = ({
  updatePersonalInfo,
}) => {
  return (
    <section className="p-5 text-center text-sm-start">
      <div className="container">
        <p>
          Please answer the following questions regarding your place of birth.
          Click next when finished.
        </p>
        <p>What City were you born in?</p>
        <input
          type="Text"
          id=""
          className="Section3"
          onChange={(e) => updatePersonalInfo({ birthCity: e.target.value })}
        />
        <p>What County were you born in?</p>
        <input
          type="Text"
          id=""
          className="Section3"
          onChange={(e) => updatePersonalInfo({ birthCounty: e.target.value })}
        />
        <p>Please Select the State you were born in.</p>
        <select
          id=""
          className="Section3 IDState"
          onChange={(e) => updatePersonalInfo({ birthState: e.target.value })}
        >
          {/* Map through your states here */}
        </select>
        <p>Please Select the Country you were born in</p>
        <select
          id=""
          className="Section3 IDCountry"
          onChange={(e) => updatePersonalInfo({ birthState: e.target.value })}
        >
          {/* Map through your countries here */}
        </select>
      </div>
    </section>
  );
};

export default BirthInfoForm;
