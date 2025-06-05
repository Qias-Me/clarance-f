/**
 * Section 17: Marital Status - Component
 *
 * React component for SF-86 Section 17 using the new Form Architecture 2.0.
 * This component handles comprehensive marital status information including
 * current spouse/partner, former spouses, and cohabitant information.
 */

import React, { useEffect, useState } from 'react';
import { useSection17 } from '~/state/contexts/sections2.0/section17';
import { useSF86Form } from '~/state/contexts/SF86FormContext';
import type { CurrentSpouseEntry, FormerSpouseEntry, CohabitantEntry } from '../../../api/interfaces/sections2.0/section17';
import {
  MARITAL_STATUS_OPTIONS,
  YES_NO_OPTIONS,
  DOCUMENT_TYPE_OPTIONS
} from '../../../api/interfaces/sections2.0/section17';

// Additional options not in the simplified interface
const CITIZENSHIP_OPTIONS = [
  'United States',
  'Dual citizenship',
  'Foreign citizen'
];

const END_OF_MARRIAGE_OPTIONS = [
  'Divorced/Dissolved',
  'Annulled',
  'Widowed',
  'Separated'
];

// Styling constants
const sectionStyles = {
  container: 'bg-white p-6 rounded-lg shadow-md mb-6',
  header: 'text-2xl font-semibold mb-4',
  subHeader: 'text-xl font-medium mb-3 border-b pb-2',
  formGroup: 'mb-4',
  label: 'block text-gray-700 mb-2',
  input: 'w-full p-2 border rounded',
  button: {
    primary: 'bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700',
    secondary: 'bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 mr-2',
    danger: 'bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600'
  },
  tabContainer: 'mb-4 border-b',
  tab: 'inline-block px-4 py-2 font-medium',
  tabActive: 'inline-block px-4 py-2 font-medium border-b-2 border-blue-500 text-blue-600',
  entryContainer: 'border rounded-lg p-4 mb-4',
  entryHeader: 'flex justify-between items-center mb-2',
  validationError: 'text-red-500 text-sm mt-1',
  row: 'flex flex-wrap -mx-2',
  col: 'px-2',
  grid2: 'w-1/2',
  grid3: 'w-1/3',
  grid4: 'w-1/4'
};

interface Section17ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

export const Section17Component: React.FC<Section17ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  // Section 17 Context
  const {
    section17Data,
    updateCurrentSpouse,
    addCurrentSpouse,
    removeCurrentSpouse,
    updateFormerSpouse,
    addFormerSpouse,
    removeFormerSpouse,
    updateCohabitant,
    addCohabitant,
    removeCohabitant,
    updateFieldValue,
    validateSection,
    resetSection,
    isDirty
  } = useSection17();

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Component state
  const [isValid, setIsValid] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'former' | 'cohabitant'>('current');
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section17Data, validateSection, onValidationChange]);

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationErrors(true);

    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    if (result.isValid) {
      try {
        sf86Form.updateSectionData('section17', section17Data);
        await sf86Form.saveForm();
        console.log('✅ Section 17 data saved successfully:', section17Data);

        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('❌ Failed to save Section 17 data:', error);
      }
    }
  };

  // Helper to update a nested field with type safety
  const handleFieldChange = (
    subsection: 'currentSpouse' | 'formerSpouses' | 'cohabitants',
    entryIndex: number,
    fieldPath: string,
    value: any
  ) => {
    // Form the full path including the correct subsection and entry index
    const fullPath = `section17.${subsection}[${entryIndex}].${fieldPath}`;
    updateFieldValue(fullPath, value);
    
    // Debug logging to help with troubleshooting
    console.log(`Updating field at path: ${fullPath}`, { 
      value, 
      updatedSection: subsection,
      entryIndex,
      fieldPath
    });
  };

  // Current Spouse Tab Content
  const renderCurrentSpouseTab = () => {
    const currentSpouseEntries = section17Data.section17.currentSpouse;
    
    return (
      <div>
        <div className={sectionStyles.subHeader}>Current Spouse/Partner Information</div>
        
        {currentSpouseEntries.length === 0 ? (
          <p className="mb-4">No current spouse/partner added. Click below to add one.</p>
        ) : (
          currentSpouseEntries.map((spouse, index) => (
            <div key={spouse._id} className={sectionStyles.entryContainer}>
              <div className={sectionStyles.entryHeader}>
                <h3 className="font-semibold">
                  {spouse.name.first.value || spouse.name.last.value 
                    ? `${spouse.name.first.value} ${spouse.name.last.value}` 
                    : `Spouse #${index + 1}`}
                </h3>
                <button
                  type="button"
                  className={sectionStyles.button.danger}
                  onClick={() => removeCurrentSpouse(index)}
                >
                  Remove
                </button>
      </div>

              {/* Name Fields */}
              <div className={sectionStyles.formGroup}>
                <div className={sectionStyles.row}>
                  <div className={`${sectionStyles.col} ${sectionStyles.grid4}`}>
                    <label className={sectionStyles.label}>First Name</label>
                  <input
                    type="text"
                      className={sectionStyles.input}
                      value={spouse.name.first.value}
                      onChange={(e) => handleFieldChange('currentSpouse', index, 'name.first', e.target.value)}
                  />
                </div>
                  <div className={`${sectionStyles.col} ${sectionStyles.grid4}`}>
                    <label className={sectionStyles.label}>Middle Name</label>
                  <input
                    type="text"
                      className={sectionStyles.input}
                      value={spouse.name.middle.value}
                      onChange={(e) => handleFieldChange('currentSpouse', index, 'name.middle', e.target.value)}
                  />
                </div>
                  <div className={`${sectionStyles.col} ${sectionStyles.grid4}`}>
                    <label className={sectionStyles.label}>Last Name</label>
                  <input
                    type="text"
                      className={sectionStyles.input}
                      value={spouse.name.last.value}
                      onChange={(e) => handleFieldChange('currentSpouse', index, 'name.last', e.target.value)}
                  />
                </div>
                  <div className={`${sectionStyles.col} ${sectionStyles.grid4}`}>
                    <label className={sectionStyles.label}>Suffix</label>
                  <input
                    type="text"
                      className={sectionStyles.input}
                      value={spouse.name.suffix.value}
                      onChange={(e) => handleFieldChange('currentSpouse', index, 'name.suffix', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Date of Birth */}
              <div className={sectionStyles.formGroup}>
                <label className={sectionStyles.label}>Date of Birth</label>
                  <input
                  type="date"
                  className={sectionStyles.input}
                  value={spouse.dateOfBirth.value}
                  onChange={(e) => handleFieldChange('currentSpouse', index, 'dateOfBirth', e.target.value)}
                />
              </div>

              {/* Social Security Number */}
              <div className={sectionStyles.formGroup}>
                <label className={sectionStyles.label}>Social Security Number</label>
                <input
                  type="text"
                  className={sectionStyles.input}
                  value={spouse.socialSecurityNumber.value}
                  onChange={(e) => handleFieldChange('currentSpouse', index, 'socialSecurityNumber', e.target.value)}
                  placeholder="e.g., 123-45-6789"
                />
              </div>

              {/* Additional fields would be added here */}
            </div>
          ))
        )}
        
        <button
          type="button"
          className={`${sectionStyles.button.primary} mt-4`}
          onClick={addCurrentSpouse}
        >
          Add Current Spouse/Partner
        </button>
      </div>
    );
  };

  // Former Spouses Tab Content
  const renderFormerSpousesTab = () => {
    const formerSpouses = section17Data.section17.formerSpouses;
    
    return (
                  <div>
        <div className={sectionStyles.subHeader}>Former Spouses/Partners</div>
        
        {formerSpouses.length === 0 ? (
          <p className="mb-4">No former spouses/partners added. Click below to add one.</p>
        ) : (
          formerSpouses.map((spouse, index) => (
            <div key={spouse._id} className={sectionStyles.entryContainer}>
              <div className={sectionStyles.entryHeader}>
                <h3 className="font-semibold">
                  {spouse.name.first.value || spouse.name.last.value 
                    ? `${spouse.name.first.value} ${spouse.name.last.value}` 
                    : `Former Spouse #${index + 1}`}
                </h3>
                <button
                  type="button"
                  className={sectionStyles.button.danger}
                  onClick={() => removeFormerSpouse(index)}
                >
                  Remove
                </button>
              </div>
              
              {/* Name Fields */}
              <div className={sectionStyles.formGroup}>
                <div className={sectionStyles.row}>
                  <div className={`${sectionStyles.col} ${sectionStyles.grid4}`}>
                    <label className={sectionStyles.label}>First Name</label>
                    <input
                      type="text"
                      className={sectionStyles.input}
                      value={spouse.name.first.value}
                      onChange={(e) => handleFieldChange('formerSpouses', index, 'name.first', e.target.value)}
                    />
                  </div>
                  <div className={`${sectionStyles.col} ${sectionStyles.grid4}`}>
                    <label className={sectionStyles.label}>Middle Name</label>
                    <input
                      type="text"
                      className={sectionStyles.input}
                      value={spouse.name.middle.value}
                      onChange={(e) => handleFieldChange('formerSpouses', index, 'name.middle', e.target.value)}
                    />
                  </div>
                  <div className={`${sectionStyles.col} ${sectionStyles.grid4}`}>
                    <label className={sectionStyles.label}>Last Name</label>
                    <input
                      type="text"
                      className={sectionStyles.input}
                      value={spouse.name.last.value}
                      onChange={(e) => handleFieldChange('formerSpouses', index, 'name.last', e.target.value)}
                    />
                  </div>
                  <div className={`${sectionStyles.col} ${sectionStyles.grid4}`}>
                    <label className={sectionStyles.label}>Suffix</label>
                    <input
                      type="text"
                      className={sectionStyles.input}
                      value={spouse.name.suffix.value}
                      onChange={(e) => handleFieldChange('formerSpouses', index, 'name.suffix', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Marriage Dates */}
              <div className={sectionStyles.row}>
                <div className={`${sectionStyles.col} ${sectionStyles.grid2}`}>
                  <div className={sectionStyles.formGroup}>
                    <label className={sectionStyles.label}>Date Married</label>
                    <input
                      type="date"
                      className={sectionStyles.input}
                      value={spouse.dateMarried.value}
                      onChange={(e) => handleFieldChange('formerSpouses', index, 'dateMarried', e.target.value)}
                    />
                  </div>
                </div>
                <div className={`${sectionStyles.col} ${sectionStyles.grid2}`}>
                  <div className={sectionStyles.formGroup}>
                    <label className={sectionStyles.label}>Date Separated</label>
                      <input
                      type="date"
                      className={sectionStyles.input}
                      value={spouse.dateSeparated.value}
                      onChange={(e) => handleFieldChange('formerSpouses', index, 'dateSeparated', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Additional fields would be added here */}
            </div>
          ))
        )}
        
        <button
          type="button"
          className={`${sectionStyles.button.primary} mt-4`}
          onClick={addFormerSpouse}
        >
          Add Former Spouse/Partner
        </button>
      </div>
    );
  };

  // Cohabitants Tab Content
  const renderCohabitantsTab = () => {
    const cohabitants = section17Data.section17.cohabitants;
    
    return (
      <div>
        <div className={sectionStyles.subHeader}>Cohabitants</div>
        
        {cohabitants.length === 0 ? (
          <p className="mb-4">No cohabitants added. Click below to add one.</p>
        ) : (
          cohabitants.map((cohabitant, index) => (
            <div key={cohabitant._id} className={sectionStyles.entryContainer}>
              <div className={sectionStyles.entryHeader}>
                <h3 className="font-semibold">
                  {cohabitant.name.first.value || cohabitant.name.last.value 
                    ? `${cohabitant.name.first.value} ${cohabitant.name.last.value}` 
                    : `Cohabitant #${index + 1}`}
                </h3>
                <button
                  type="button"
                  className={sectionStyles.button.danger}
                  onClick={() => removeCohabitant(index)}
                >
                  Remove
        </button>
      </div>

              {/* Name Fields */}
              <div className={sectionStyles.formGroup}>
                <div className={sectionStyles.row}>
                  <div className={`${sectionStyles.col} ${sectionStyles.grid4}`}>
                    <label className={sectionStyles.label}>First Name</label>
              <input
                      type="text"
                      className={sectionStyles.input}
                      value={cohabitant.name.first.value}
                      onChange={(e) => handleFieldChange('cohabitants', index, 'name.first', e.target.value)}
                    />
        </div>
                  <div className={`${sectionStyles.col} ${sectionStyles.grid4}`}>
                    <label className={sectionStyles.label}>Middle Name</label>
                    <input
                      type="text"
                      className={sectionStyles.input}
                      value={cohabitant.name.middle.value}
                      onChange={(e) => handleFieldChange('cohabitants', index, 'name.middle', e.target.value)}
                    />
      </div>
                  <div className={`${sectionStyles.col} ${sectionStyles.grid4}`}>
                    <label className={sectionStyles.label}>Last Name</label>
              <input
                type="text"
                      className={sectionStyles.input}
                      value={cohabitant.name.last.value}
                      onChange={(e) => handleFieldChange('cohabitants', index, 'name.last', e.target.value)}
              />
            </div>
                  <div className={`${sectionStyles.col} ${sectionStyles.grid4}`}>
                    <label className={sectionStyles.label}>Suffix</label>
              <input
                type="text"
                      className={sectionStyles.input}
                      value={cohabitant.name.suffix.value}
                      onChange={(e) => handleFieldChange('cohabitants', index, 'name.suffix', e.target.value)}
                    />
                  </div>
            </div>
          </div>

              {/* Cohabitation Dates */}
              <div className={sectionStyles.row}>
                <div className={`${sectionStyles.col} ${sectionStyles.grid2}`}>
                  <div className={sectionStyles.formGroup}>
                    <label className={sectionStyles.label}>Start Date</label>
                    <input
                      type="date"
                      className={sectionStyles.input}
                      value={cohabitant.cohabitationStartDate.value}
                      onChange={(e) => handleFieldChange('cohabitants', index, 'cohabitationStartDate', e.target.value)}
                    />
                  </div>
          </div>
                <div className={`${sectionStyles.col} ${sectionStyles.grid2}`}>
                  <div className={sectionStyles.formGroup}>
                    <label className={sectionStyles.label}>End Date</label>
                    <input
                      type="date"
                      className={sectionStyles.input}
                      value={cohabitant.cohabitationEndDate.value}
                      onChange={(e) => handleFieldChange('cohabitants', index, 'cohabitationEndDate', e.target.value)}
                    />
    </div>
      </div>
      </div>

              {/* Additional fields would be added here */}
            </div>
          ))
        )}

            <button
              type="button"
          className={`${sectionStyles.button.primary} mt-4`}
          onClick={addCohabitant}
            >
          Add Cohabitant
            </button>
          </div>
    );
  };

  return (
    <div className={`${sectionStyles.container} ${className}`}>
      <h2 className={sectionStyles.header}>Section 17: Marital Status and Relationships</h2>
      
      {/* Tab Navigation */}
      <div className={sectionStyles.tabContainer}>
                <button
                  type="button"
          className={activeTab === 'current' ? sectionStyles.tabActive : sectionStyles.tab}
          onClick={() => setActiveTab('current')}
                >
          Current Spouse
                </button>
                      <button
                        type="button"
          className={activeTab === 'former' ? sectionStyles.tabActive : sectionStyles.tab}
          onClick={() => setActiveTab('former')}
                      >
          Former Spouses
                      </button>
                <button
                  type="button"
          className={activeTab === 'cohabitant' ? sectionStyles.tabActive : sectionStyles.tab}
          onClick={() => setActiveTab('cohabitant')}
                >
          Cohabitants
                </button>
          </div>
      
      {/* Tab Content */}
      <form onSubmit={handleSubmit}>
        {activeTab === 'current' && renderCurrentSpouseTab()}
        {activeTab === 'former' && renderFormerSpousesTab()}
        {activeTab === 'cohabitant' && renderCohabitantsTab()}

        {/* Form Actions */}
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            className={sectionStyles.button.secondary}
            onClick={resetSection}
          >
            Reset Section
          </button>
            <button
              type="submit"
            className={sectionStyles.button.primary}
            disabled={!isDirty}
          >
            {isDirty ? 'Save and Continue' : 'No Changes to Save'}
            </button>
        </div>
        
        {/* Validation Errors */}
        {showValidationErrors && !isValid && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
            <p className="text-red-700 font-semibold">Please fix the following errors:</p>
            <ul className="list-disc ml-5">
              <li className="text-red-600">Section 17 is missing required information.</li>
            </ul>
          </div>
        )}
      </form>
    </div>
  );
};

export default Section17Component;