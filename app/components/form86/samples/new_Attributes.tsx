import { useForm } from './formContext'; // Ensure path is correct
import { ApplicantPhysicalAttributes } from 'api_v2/interfaces/form3';

const FormSectionSix = () => {
  const { formData, setFormData } = useForm();

  const updatePersonalInfo = (info: Partial<ApplicantPhysicalAttributes>) => {
    setFormData({
      ...formData,
      physicalAttributes: {
        ...formData.physicalAttributes,
        ...info
      }
    });
  };

  return (
    <section className="p-5 text-center text-sm-start">
      <div className="container">
        <p>eye Color</p>
        <input
          type="text"
          className=""
          onChange={(e) => updatePersonalInfo({ eyeColor: e.target.value })}
        />

        <p>hair Color</p>
        <input
          type="text"
          className=""
          onChange={(e) => updatePersonalInfo({ hairColor: e.target.value })}
        />

        <p>heightFeet</p>
        <input
          type="text"
          className=""
          onChange={(e) => updatePersonalInfo({ heightFeet: parseInt(e.target.value )})}
        />
       <p>height Inches</p>
        <input
          type="text"
          className=""
          onChange={(e) => updatePersonalInfo({ heightInch: parseInt(e.target.value )})}
        />

      </div>
    </section>
  );
};

export default FormSectionSix;
