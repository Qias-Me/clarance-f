import React from 'react';
import { ApplicantPersonalInfo } from 'api_v2/interfaces/form2';
import Suffix from 'api_v2/interfaces/enums/suffix';


interface NameFormProps {
  updatePersonalInfo: (info: Partial<ApplicantPersonalInfo>) => void;
}

const NameForm: React.FC<NameFormProps> = ({ updatePersonalInfo }) => {
  return (
    <section className="p-5 text-center text-sm-start">
      <div className="container">
        <p>First Name</p>
        <input
          type="text"
          className="Section1 IDLastName"
          onChange={(e) => updatePersonalInfo({ firstName: e.target.value })}
        />

        <p>Middle Name</p>
        <input
          type="text"
          className="Section1 IDLastName"
          onChange={(e) => updatePersonalInfo({ middleName: e.target.value })}
        />

        <p>Last Name</p>
        <input
          type="text"
          className="Section1 IDLastName"
          onChange={(e) => updatePersonalInfo({ lastName: e.target.value })}
        />

        <p>Suffix</p>
        <select
          className="Section1 IDSuffix"
          onChange={(e) => updatePersonalInfo({ suffix: e.target.value })}
        >
          {Object.values(Suffix).map((suffix) => (
            <option key={suffix} value={suffix}>
              {suffix !== 'None' ? suffix : ''}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
};

export default NameForm;
