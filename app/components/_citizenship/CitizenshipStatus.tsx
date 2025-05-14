import React from 'react';
import { type CitizenshipInfo } from "api/interfaces/sections/citizenship";
import { SuffixOptions, CountryOptions } from "api/enums/enums";

interface CitizenshipStatusProps {
  citizenship: CitizenshipInfo;
  path: string;
  onInputChange: (path: string, value: any) => void;
  isValidValue: (path: string, value: any) => boolean;
}

const CitizenshipStatus: React.FC<CitizenshipStatusProps> = ({
  citizenship,
  path,
  onInputChange,
  isValidValue,
}) => {
  // Mapping descriptions to their corresponding status codes
  const citizenshipStatusMapping: Record<string, string> = {
    "I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth. (Proceed to Section 10)   ": "birth",
    "I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country. (Complete 9.1) ": "citizen",
    "I am a naturalized U.S. citizen. (Complete 9.2) ": "naturalized",
    "I am a derived U.S. citizen. (Complete 9.3) ": "derived",
    "I am not a U.S. citizen. (Complete 9.4) ": "nonCitizen",
  };

  const handleCitizenshipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatusDescription = e.target.value;
    const newStatusCode = citizenshipStatusMapping[newStatusDescription] || "";

    if (isValidValue(`${path}.citizenship_status_code.value`, newStatusDescription)) {
      onInputChange(`${path}.citizenship_status_code.value`, newStatusDescription);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">SECTION 9 - Citizenship</h3>

      <label className="block">
        Citizenship Status:
        <select
          name={`${path}.citizenship_status_code.value`}
          value={citizenship.citizenship_status_code.value}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          onChange={handleCitizenshipChange}
        >
          <option value="I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth. (Proceed to Section 10)   ">
            I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth.
          </option>
          <option value="I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country. (Complete 9.1) ">
            I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country.
          </option>
          <option value="I am a naturalized U.S. citizen. (Complete 9.2) ">
            I am a naturalized U.S. citizen.
          </option>
          <option value="I am a derived U.S. citizen. (Complete 9.3) ">
            I am a derived U.S. citizen.
          </option>
          <option value="I am not a U.S. citizen. (Complete 9.4) ">
            I am not a U.S. citizen.
          </option>
        </select>
      </label>

      {/* Render appropriate section based on citizenship status code */}
      {citizenship.citizenship_status_code.value === "I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country. (Complete 9.1) " && 
        citizenship.section9_1 && renderSection9_1()}
      
      {citizenship.citizenship_status_code.value === "I am a naturalized U.S. citizen. (Complete 9.2) " && 
        citizenship.section9_2 && renderSection9_2()}
      
      {citizenship.citizenship_status_code.value === "I am a derived U.S. citizen. (Complete 9.3) " && 
        citizenship.section9_3 && renderSection9_3()}
      
      {citizenship.citizenship_status_code.value === "I am not a U.S. citizen. (Complete 9.4) " && 
        citizenship.section9_4 && renderSection9_4()}
    </div>
  );

  // Helper function to render section 9.1 - Citizenship by Birth
  function renderSection9_1() {
    if (!citizenship.section9_1) return null;
    
    const section = citizenship.section9_1;
    
    return (
      <div className="mt-4 space-y-3">
        <h4 className="font-medium">U.S. Citizen by Birth, Born Abroad</h4>
        
        <label className="block">
          Document Type:
          <select
            value={section.doc_type.value}
            onChange={(e) => {
              if (isValidValue(`${path}.section9_1.doc_type.value`, e.target.value)) {
                onInputChange(`${path}.section9_1.doc_type.value`, e.target.value);
              }
            }}
            className="mt-1 p-2 w-full border-gray-300 rounded-md"
          >
            <option value="FS240">FS 240</option>
            <option value="DS1350">DS 1350</option>
            <option value="FS545">FS 545</option>
            <option value="Other (Provide explanation)">Other (Provide explanation)</option>
          </select>
        </label>
        
        {section.doc_type.value === "Other (Provide explanation)" && (
          <label className="block">
            Other Document:
            <input
              type="text"
              value={section.other_doc?.value || ""}
              onChange={(e) => {
                if (isValidValue(`${path}.section9_1.other_doc.value`, e.target.value)) {
                  onInputChange(`${path}.section9_1.other_doc.value`, e.target.value);
                }
              }}
              className="mt-1 p-2 w-full border-gray-300 rounded-md"
            />
          </label>
        )}
        
        {/* Other fields for section 9.1 would go here */}
      </div>
    );
  }

  // Helper function to render section 9.2 - Naturalized Citizen
  function renderSection9_2() {
    if (!citizenship.section9_2) return null;
    
    const section = citizenship.section9_2;
    
    return (
      <div className="mt-4 space-y-3">
        <h4 className="font-medium">Naturalized U.S. Citizen</h4>
        
        {/* Fields for section 9.2 would go here */}
      </div>
    );
  }

  // Helper function to render section 9.3 - Derived Citizen
  function renderSection9_3() {
    if (!citizenship.section9_3) return null;
    
    const section = citizenship.section9_3;
    
    return (
      <div className="mt-4 space-y-3">
        <h4 className="font-medium">Derived U.S. Citizen</h4>
        
        {/* Fields for section 9.3 would go here */}
      </div>
    );
  }

  // Helper function to render section 9.4 - Non-Citizen
  function renderSection9_4() {
    if (!citizenship.section9_4) return null;
    
    const section = citizenship.section9_4;
    
    return (
      <div className="mt-4 space-y-3">
        <h4 className="font-medium">Non-U.S. Citizen</h4>
        
        {/* Fields for section 9.4 would go here */}
      </div>
    );
  }
};

export default CitizenshipStatus; 