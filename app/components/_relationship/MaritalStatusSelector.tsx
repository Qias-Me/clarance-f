import React from 'react';
import { useRelationshipInfo } from '../../state/hooks/useRelationshipInfo';

/**
 * Component for selecting marital status with conditional rendering based on selection
 */
const MaritalStatusSelector: React.FC = () => {
  // Use the relationship info hook
  const { 
    relationshipInfo, 
    setMaritalStatus,
    updateRelationshipField 
  } = useRelationshipInfo();
  
  // Function to handle status change
  const handleStatusChange = (status: string) => {
    setMaritalStatus(status);
  };
  
  // Determine which status is currently selected
  const getCurrentStatus = (): string => {
    if (relationshipInfo.neverEntered?.value === "Yes") return "NeverEntered";
    if (relationshipInfo.currentlyIn?.value === "Yes") return "CurrentlyIn";
    if (relationshipInfo.separated?.value === "Yes") return "Separated";
    if (relationshipInfo.annulled?.value === "Yes") return "Annulled";
    if (relationshipInfo.divorcedDissolved?.value === "Yes") return "Divorced";
    if (relationshipInfo.widowed?.value === "Yes") return "Widowed";
    return "";
  };
  
  // Set the checkbox values based on the selected status
  const setCheckboxValues = (status: string) => {
    // Reset all status values
    updateRelationshipField('neverEntered.value', "No");
    updateRelationshipField('currentlyIn.value', "No");
    updateRelationshipField('separated.value', "No");
    updateRelationshipField('annulled.value', "No");
    updateRelationshipField('divorcedDissolved.value', "No");
    updateRelationshipField('widowed.value', "No");
    
    // Set the selected status value
    switch (status) {
      case "NeverEntered":
        updateRelationshipField('neverEntered.value', "Yes");
        break;
      case "CurrentlyIn":
        updateRelationshipField('currentlyIn.value', "Yes");
        break;
      case "Separated":
        updateRelationshipField('separated.value', "Yes");
        break;
      case "Annulled":
        updateRelationshipField('annulled.value', "Yes");
        break;
      case "Divorced":
        updateRelationshipField('divorcedDissolved.value', "Yes");
        break;
      case "Widowed":
        updateRelationshipField('widowed.value', "Yes");
        break;
    }
    
    // Call setMaritalStatus to initialize necessary sections
    handleStatusChange(status);
  };
  
  return (
    <div className="marital-status-selector p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Section 17 - Marital Status</h2>
      <p className="mb-4">Select your current marital status:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Never Entered */}
        <div className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50">
          <input
            type="radio"
            id="status-never-entered"
            name="maritalStatus"
            checked={relationshipInfo.neverEntered?.value === "Yes"}
            onChange={() => setCheckboxValues("NeverEntered")}
            className="h-4 w-4 text-blue-600"
          />
          <label htmlFor="status-never-entered" className="cursor-pointer">
            Never entered in marriage/civil union/domestic partnership
          </label>
        </div>
        
        {/* Currently In */}
        <div className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50">
          <input
            type="radio"
            id="status-currently-in"
            name="maritalStatus"
            checked={relationshipInfo.currentlyIn?.value === "Yes"}
            onChange={() => setCheckboxValues("CurrentlyIn")}
            className="h-4 w-4 text-blue-600"
          />
          <label htmlFor="status-currently-in" className="cursor-pointer">
            Currently in marriage/civil union/domestic partnership
          </label>
        </div>
        
        {/* Separated */}
        <div className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50">
          <input
            type="radio"
            id="status-separated"
            name="maritalStatus"
            checked={relationshipInfo.separated?.value === "Yes"}
            onChange={() => setCheckboxValues("Separated")}
            className="h-4 w-4 text-blue-600"
          />
          <label htmlFor="status-separated" className="cursor-pointer">
            Separated
          </label>
        </div>
        
        {/* Annulled */}
        <div className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50">
          <input
            type="radio"
            id="status-annulled"
            name="maritalStatus"
            checked={relationshipInfo.annulled?.value === "Yes"}
            onChange={() => setCheckboxValues("Annulled")}
            className="h-4 w-4 text-blue-600"
          />
          <label htmlFor="status-annulled" className="cursor-pointer">
            Annulled
          </label>
        </div>
        
        {/* Divorced */}
        <div className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50">
          <input
            type="radio"
            id="status-divorced"
            name="maritalStatus"
            checked={relationshipInfo.divorcedDissolved?.value === "Yes"}
            onChange={() => setCheckboxValues("Divorced")}
            className="h-4 w-4 text-blue-600"
          />
          <label htmlFor="status-divorced" className="cursor-pointer">
            Divorced/Dissolved
          </label>
        </div>
        
        {/* Widowed */}
        <div className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50">
          <input
            type="radio"
            id="status-widowed"
            name="maritalStatus"
            checked={relationshipInfo.widowed?.value === "Yes"}
            onChange={() => setCheckboxValues("Widowed")}
            className="h-4 w-4 text-blue-600"
          />
          <label htmlFor="status-widowed" className="cursor-pointer">
            Widowed
          </label>
        </div>
      </div>
      
      {/* Conditional rendering based on selected status */}
      <div className="mt-4 p-4 border-t">
        {getCurrentStatus() === "NeverEntered" && (
          <p className="text-gray-600">
            Please proceed to the Cohabitant Information section.
          </p>
        )}
        
        {(getCurrentStatus() === "CurrentlyIn" || getCurrentStatus() === "Separated") && (
          <p className="text-gray-600">
            Please provide current marriage information and cohabitant information.
          </p>
        )}
        
        {(getCurrentStatus() === "Annulled" || getCurrentStatus() === "Divorced" || getCurrentStatus() === "Widowed") && (
          <p className="text-gray-600">
            Please provide information about previous marriages and cohabitant information.
          </p>
        )}
      </div>
    </div>
  );
};

export default MaritalStatusSelector; 