import React, { useState } from 'react';
import { PersonalInfo } from '../../../../api/interfaces/form';

interface ContactDetailsFormProps {
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
}

const ContactDetailsForm: React.FC<ContactDetailsFormProps> = ({ updatePersonalInfo }) => {
  const [contactInfo, setContactInfo] = useState({
    homeEmail: '',
    workEmail: '',
    homePhone: '',
    homePhoneExt: '',
    workPhone: '',
    workPhoneExt: '',
    cellPhone: '',
    cellPhoneExt: '',
  });
  const [showHomePhone, setShowHomePhone] = useState(false);
  const [showWorkPhone, setShowWorkPhone] = useState(false);
  const [showCellPhone, setShowCellPhone] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setContactInfo(prevState => ({ ...prevState, [name]: value }));
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "CheckNumber1") setShowHomePhone(value === "1");
    else if (name === "CheckNumber2") setShowWorkPhone(value === "1");
    else if (name === "CheckNumber3") setShowCellPhone(value === "1");
  };

  return (
    <section className="p-5 text-center text-sm-start">
      <div className="container">
        <p>Provide your contact information</p>

        <p>Home e-mail address</p>
        <input 
          type="text" 
          id="Section7Applicant_9513" 
          className="Section7" 
          name="homeEmail"
          value={contactInfo.homeEmail}
          onChange={handleInputChange} 
        />

        <p>Work e-mail address</p>
        <input 
          type="text" 
          id="Section7Applicant_9512" 
          className="Section7" 
          name="workEmail"
          value={contactInfo.workEmail}
          onChange={handleInputChange}
        />

        <div className="Radio1">
          <p>Do you have a usable Home Telephone number?</p>
          <p>
            <input 
              id="Yes1" 
              type="radio" 
              name="CheckNumber1" 
              value="1" 
              className="HasEntry1" 
              onChange={handleRadioChange}
            /> Yes
          </p>
          <p>
            <input 
              id="No1" 
              type="radio" 
              name="CheckNumber1" 
              value="0" 
              className="NoEntry1" 
              onChange={handleRadioChange}
            /> No
          </p>
        </div>

        {showHomePhone && (
          <div className="Entry1">
            <p>Home telephone number</p>
            <input 
              type="text" 
              id="Section7Applicant_9511" 
              className="Section7" 
              name="homePhone"
              value={contactInfo.homePhone}
              onChange={handleInputChange}
            />

            <p>Extension</p>
            <input 
              type="text" 
              id="Section7Applicant_9510" 
              className="Section7" 
              name="homePhoneExt"
              value={contactInfo.homePhoneExt}
              onChange={handleInputChange}
            />
          </div>
        )}

        {/* Work Phone Section */}
        <div className="Radio2">
          <p>Do you have a usable Work Telephone number?</p>
          <p>
            <input 
              id="Yes2" 
              type="radio" 
              name="CheckNumber2" 
              value="1" 
              className="HasEntry2" 
              onChange={handleRadioChange}
            /> Yes
          </p>
          <p>
            <input 
              id="No2" 
              type="radio" 
              name="CheckNumber2" 
              value="0" 
              className="NoEntry2" 
              onChange={handleRadioChange}
            /> No
          </p>
        </div>

        {showWorkPhone && (
          <div className="Entry2">
            <p>Work telephone number</p>
            <input 
              type="text" 
              id="Section7Applicant_9506" 
              className="Section7" 
              name="workPhone"
              value={contactInfo.workPhone}
              onChange={handleInputChange}
            />

            <p>Extension</p>
            <input 
              type="text" 
              id="Section7Applicant_9505" 
              className="Section7" 
              name="workPhoneExt"
              value={contactInfo.workPhoneExt}
              onChange={handleInputChange}
            />
          </div>
        )}

        {/* Cell Phone Section */}
        <div className="Radio3">
          <p>Do you have a usable Cell Phone number?</p>
          <p>
            <input 
              id="Yes3" 
              type="radio" 
              name="CheckNumber3" 
              value="1" 
              className="HasEntry3" 
              onChange={handleRadioChange}
            /> Yes
          </p>
          <p>
            <input 
              id="No3" 
              type="radio" 
              name="CheckNumber3" 
              value="0" 
              className="NoEntry3" 
              onChange={handleRadioChange}
            /> No
          </p>
        </div>

        {showCellPhone && (
          <div className="Entry3">
            <p>Mobile/Cell telephone number</p>
            <input 
              type="text" 
              id="Section7Applicant_9561" 
              className="Section7" 
              name="cellPhone"
              value={contactInfo.cellPhone}
              onChange={handleInputChange}
            />

            <p>Extension</p>
            <input 
              type="text" 
              id="Section7Applicant_9560" 
              className="Section7" 
              name="cellPhoneExt"
              value={contactInfo.cellPhoneExt}
              onChange={handleInputChange}
            />
          </div>
        )}

      </div>
    </section>
  );
};

export default ContactDetailsForm;
