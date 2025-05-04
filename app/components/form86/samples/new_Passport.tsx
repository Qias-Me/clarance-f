import React from 'react';
import { useForm } from './formContext'; // Ensure the correct import path is used
import Utils from '../../../utils/utils'; // Adjust the import path to where Utils is located

const PassportInfo = () => {
  const { formData, setFormData } = useForm();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = event.target as HTMLInputElement; // Cast to HTMLInputElement for checkboxes
    const { name, value, type } = target;
    const finalValue = type === 'checkbox' ? target.checked : value; // Now safely access `checked`
  
    setFormData({
      ...formData,
      passportInfo: {
        ...formData.passportInfo,
        [name]: finalValue,
      },
    });
  };

  return (
    <section className="p-5 text-center text-sm-start">
      <div className="container">
        <p>Do you currently possess a US Passport?</p>
        {/* Radio buttons for hasPassport yes/no */}
        {/* Assuming your formData structure accommodates for this field */}
        
        {/* Passport number input */}
        <input
          type="text"
          name="passportNum"
          placeholder="Passport Number"
          value={formData.passportInfo?.passportNum || ''}
          onChange={handleChange}
        />
        
        {/* Issue date input */}
        <input
          type="date"
          name="issueDate"
          value={Utils.formatDateToInputValue(formData.passportInfo?.issueDate || '')}
          onChange={handleChange}
        />
        
        {/* Expiration date input */}
        <input
          type="date"
          name="expirationDate"
          value={Utils.formatDateToInputValue(formData.passportInfo?.expirationDate || '')}
          onChange={handleChange}
        />
        
        {/* Additional fields for passport info as needed */}
      </div>
    </section>
  );
};

export default PassportInfo;
