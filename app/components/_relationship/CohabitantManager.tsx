import React from 'react';
import { useRelationshipInfo } from '../../state/hooks/useRelationshipInfo';

/**
 * Component for managing cohabitant information in Section 17.3
 */
const CohabitantManager: React.FC = () => {
  const { 
    relationshipInfo, 
    setHasCohabitant, 
    addCohabitant,
    removeCohabitant,
    updateRelationshipField 
  } = useRelationshipInfo();

  // Get cohabitant information from the state
  const section17_3 = relationshipInfo.section17_3 || {};
  const hasCohabitant = section17_3.hasCohabitant?.value;
  const cohabitants = section17_3.cohabitants || [];

  // Handle cohabitant status change
  const handleHasCohabitantChange = (value: string) => {
    setHasCohabitant(value);
    
    // If YES and no cohabitants, add one by default
    if (value === "YES" && cohabitants.length === 0) {
      addCohabitant();
    }
  };

  // Handle cohabitant field updates
  const handleCohabitantFieldChange = (index: number, field: string, value: any) => {
    updateRelationshipField(`section17_3.cohabitants.${index}.${field}`, value);
  };

  return (
    <div className="cohabitant-manager p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Section 17.3 - Cohabitant Information</h3>
      
      {/* Cohabitant status selection */}
      <div className="mb-4">
        <p className="mb-2">Do you presently reside with a person, other than a spouse, domestic partner, or civil union partner, with whom you share bonds of affection, obligation, or other commitment?</p>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="hasCohabitant"
              value="YES"
              checked={hasCohabitant === "YES"}
              onChange={() => handleHasCohabitantChange("YES")}
              className="h-4 w-4 text-blue-600"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="hasCohabitant"
              value="NO (If NO, proceed to Section 18)"
              checked={hasCohabitant === "NO (If NO, proceed to Section 18)"}
              onChange={() => handleHasCohabitantChange("NO (If NO, proceed to Section 18)")}
              className="h-4 w-4 text-blue-600"
            />
            <span>No (If NO, proceed to Section 18)</span>
          </label>
        </div>
      </div>
      
      {/* Cohabitant information forms */}
      {hasCohabitant === "YES" && (
        <div className="cohabitant-list">
          {cohabitants.map((cohabitant, index) => (
            <div key={index} className="cohabitant-item mb-4 p-4 border rounded">
              <div className="flex justify-between mb-3">
                <h4 className="font-medium">Cohabitant #{index + 1}</h4>
                {cohabitants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCohabitant(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              {/* Name fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={cohabitant.fullName?.firstName?.value || ''}
                    onChange={(e) => handleCohabitantFieldChange(index, 'fullName.firstName.value', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={cohabitant.fullName?.middleName?.value || ''}
                    onChange={(e) => handleCohabitantFieldChange(index, 'fullName.middleName.value', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={cohabitant.fullName?.lastName?.value || ''}
                    onChange={(e) => handleCohabitantFieldChange(index, 'fullName.lastName.value', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Date of birth */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={cohabitant.dateOfBirth?.date?.value || ''}
                  onChange={(e) => handleCohabitantFieldChange(index, 'dateOfBirth.date.value', e.target.value)}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Place of birth */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City of Birth
                  </label>
                  <input
                    type="text"
                    value={cohabitant.placeOfBirth?.city?.value || ''}
                    onChange={(e) => handleCohabitantFieldChange(index, 'placeOfBirth.city.value', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country of Birth
                  </label>
                  <input
                    type="text"
                    value={cohabitant.placeOfBirth?.country?.value || ''}
                    onChange={(e) => handleCohabitantFieldChange(index, 'placeOfBirth.country.value', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Cohabitation date */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cohabitation Start Date
                </label>
                <input
                  type="date"
                  value={cohabitant.cohabitationStartDate?.date?.value || ''}
                  onChange={(e) => handleCohabitantFieldChange(index, 'cohabitationStartDate.date.value', e.target.value)}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          ))}
          
          {/* Add button */}
          <button
            type="button"
            onClick={addCohabitant}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Another Cohabitant
          </button>
        </div>
      )}
    </div>
  );
};

export default CohabitantManager; 