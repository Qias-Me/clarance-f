import { useForm } from './formContext'; // Ensure path is correct
import { ApplicantPersonalInfo } from 'api_v2/interfaces/form3';

const FormSectionOne = () => {
  const { formData, setFormData, goToNextStep } = useForm();

  const updatePersonalInfo = (info: Partial<ApplicantPersonalInfo>) => {
    setFormData({
      ...formData,
      personalInfo: {
        ...formData.personalInfo,
        ...info
      }
    });

    console.log(formData);
  };

  return (
    <section className="p-5 text-center text-sm-start">
      <div className="container">
        <p>First Name</p>
        <input
          type="text"
          onChange={(e) => updatePersonalInfo({ firstName: e.target.value })}
        />

        <p>Middle Name</p>
        <input
          type="text"
          onChange={(e) => updatePersonalInfo({ middleName: e.target.value })}
        />

        <p>Last Name</p>
        <input
          type="text"
          onChange={(e) => updatePersonalInfo({ lastName: e.target.value })}
        />

        {/* Example suffix dropdown. Adjust based on actual Suffix enum */}
        <p>Suffix</p>
        <select
          onChange={(e) => updatePersonalInfo({ suffix: e.target.value })}
        >
          {/* Populate dropdown options dynamically */}
        </select>
        <button onClick={goToNextStep}>Next</button>
      </div>
    </section>
  );
};

export default FormSectionOne;
