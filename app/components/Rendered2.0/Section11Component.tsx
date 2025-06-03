/**
 * Section 11: Where You Have Lived Component
 *
 * React component for SF-86 Section 11 (Where You Have Lived) following the established
 * UI patterns and integrating with the Section11 context provider.
 */

import React, { useState, useCallback } from 'react';
import { useSection11 } from '../../state/contexts/sections2.0/section11';
import type { ResidenceEntry } from '../../../api/interfaces/sections2.0/section11';

// ============================================================================
// TYPES
// ============================================================================

interface Section11ComponentProps {
  onNext?: () => void;
  onPrevious?: () => void;
  showNavigation?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Section11Component: React.FC<Section11ComponentProps> = ({
  onNext,
  onPrevious,
  showNavigation = true
}) => {
  const {
    section11Data,
    isLoading,
    errors,
    isDirty,
    addResidenceEntry,
    removeResidenceEntry,
    updateFieldValue,
    getEntryCount,
    getEntry,
    validateSection,
    saveSection,
    isResidenceHistoryComplete,
    getTotalResidenceTimespan
  } = useSection11();

  const [activeEntryIndex, setActiveEntryIndex] = useState(0);
  const [showValidation, setShowValidation] = useState(false);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleFieldChange = useCallback((fieldPath: string, value: any, entryIndex?: number) => {
    updateFieldValue(fieldPath, value, entryIndex);
  }, [updateFieldValue]);

  const handleAddResidence = useCallback(() => {
    addResidenceEntry();
    setActiveEntryIndex(getEntryCount());
  }, [addResidenceEntry, getEntryCount]);

  const handleRemoveResidence = useCallback((index: number) => {
    if (getEntryCount() > 1) {
      removeResidenceEntry(index);
      if (activeEntryIndex >= index && activeEntryIndex > 0) {
        setActiveEntryIndex(activeEntryIndex - 1);
      }
    }
  }, [removeResidenceEntry, getEntryCount, activeEntryIndex]);

  const handleValidateAndContinue = useCallback(async () => {
    setShowValidation(true);
    const validation = validateSection();
    
    if (validation.isValid) {
      await saveSection();
      onNext?.();
    }
  }, [validateSection, saveSection, onNext]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderResidenceEntry = (entry: ResidenceEntry, index: number) => {
    const isActive = index === activeEntryIndex;
    
    return (
      <div key={index} className={`residence-entry ${isActive ? 'active' : ''}`}>
        <div className="entry-header">
          <h4>Residence {index + 1}</h4>
          <div className="entry-actions">
            <button
              type="button"
              onClick={() => setActiveEntryIndex(index)}
              className={`btn-secondary ${isActive ? 'active' : ''}`}
            >
              {isActive ? 'Active' : 'Edit'}
            </button>
            {getEntryCount() > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveResidence(index)}
                className="btn-danger"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {isActive && (
          <div className="entry-form">
            {renderAddressSection(entry, index)}
            {renderDateSection(entry, index)}
            {renderResidenceTypeSection(entry, index)}
            {renderContactPersonSection(entry, index)}
          </div>
        )}
      </div>
    );
  };

  const renderAddressSection = (entry: ResidenceEntry, index: number) => (
    <div className="address-section">
      <h5>Address Information</h5>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`street-${index}`}>Street Address *</label>
          <input
            id={`street-${index}`}
            type="text"
            value={entry.address.streetAddress.value}
            onChange={(e) => handleFieldChange('address.streetAddress', e.target.value, index)}
            className={errors[`section11.residences[${index}].address.streetAddress`] ? 'error' : ''}
            placeholder="Enter street address"
          />
          {errors[`section11.residences[${index}].address.streetAddress`] && (
            <span className="error-message">
              {errors[`section11.residences[${index}].address.streetAddress`]}
            </span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`city-${index}`}>City *</label>
          <input
            id={`city-${index}`}
            type="text"
            value={entry.address.city.value}
            onChange={(e) => handleFieldChange('address.city', e.target.value, index)}
            className={errors[`section11.residences[${index}].address.city`] ? 'error' : ''}
            placeholder="Enter city"
          />
          {errors[`section11.residences[${index}].address.city`] && (
            <span className="error-message">
              {errors[`section11.residences[${index}].address.city`]}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor={`state-${index}`}>State</label>
          <select
            id={`state-${index}`}
            value={entry.address.state.value}
            onChange={(e) => handleFieldChange('address.state', e.target.value, index)}
          >
            <option value="">Select State</option>
            {entry.address.state.options?.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor={`zip-${index}`}>ZIP Code</label>
          <input
            id={`zip-${index}`}
            type="text"
            value={entry.address.zipCode.value}
            onChange={(e) => handleFieldChange('address.zipCode', e.target.value, index)}
            placeholder="Enter ZIP code"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`country-${index}`}>Country</label>
          <select
            id={`country-${index}`}
            value={entry.address.country.value}
            onChange={(e) => handleFieldChange('address.country', e.target.value, index)}
          >
            <option value="">Select Country</option>
            {entry.address.country.options?.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderDateSection = (entry: ResidenceEntry, index: number) => (
    <div className="date-section">
      <h5>Residence Period</h5>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`from-date-${index}`}>From Date (MM/YYYY) *</label>
          <input
            id={`from-date-${index}`}
            type="text"
            value={entry.fromDate.value}
            onChange={(e) => handleFieldChange('fromDate', e.target.value, index)}
            className={errors[`section11.residences[${index}].fromDate`] ? 'error' : ''}
            placeholder="MM/YYYY"
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={entry.fromDateEstimate.value}
              onChange={(e) => handleFieldChange('fromDateEstimate', e.target.checked, index)}
            />
            Estimate
          </label>
          {errors[`section11.residences[${index}].fromDate`] && (
            <span className="error-message">
              {errors[`section11.residences[${index}].fromDate`]}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor={`to-date-${index}`}>To Date (MM/YYYY)</label>
          <input
            id={`to-date-${index}`}
            type="text"
            value={entry.toDate.value}
            onChange={(e) => handleFieldChange('toDate', e.target.value, index)}
            className={errors[`section11.residences[${index}].toDate`] ? 'error' : ''}
            placeholder="MM/YYYY"
            disabled={entry.present.value}
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={entry.toDateEstimate.value}
              onChange={(e) => handleFieldChange('toDateEstimate', e.target.checked, index)}
              disabled={entry.present.value}
            />
            Estimate
          </label>
          {errors[`section11.residences[${index}].toDate`] && (
            <span className="error-message">
              {errors[`section11.residences[${index}].toDate`]}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="checkbox-label present-checkbox">
            <input
              type="checkbox"
              checked={entry.present.value}
              onChange={(e) => handleFieldChange('present', e.target.checked, index)}
            />
            Present
          </label>
        </div>
      </div>
    </div>
  );

  const renderResidenceTypeSection = (entry: ResidenceEntry, index: number) => (
    <div className="residence-type-section">
      <h5>Residence Type</h5>
      <div className="radio-group">
        {entry.residenceType.options?.map(type => (
          <label key={type} className="radio-label">
            <input
              type="radio"
              name={`residence-type-${index}`}
              value={type}
              checked={entry.residenceType.value === type}
              onChange={(e) => handleFieldChange('residenceType', e.target.value, index)}
            />
            {type}
          </label>
        ))}
      </div>
      
      {entry.residenceType.value === 'Other' && (
        <div className="form-group">
          <label htmlFor={`residence-other-${index}`}>Specify Other</label>
          <input
            id={`residence-other-${index}`}
            type="text"
            value={entry.residenceTypeOther.value}
            onChange={(e) => handleFieldChange('residenceTypeOther', e.target.value, index)}
            placeholder="Specify other residence type"
          />
        </div>
      )}
    </div>
  );

  const renderContactPersonSection = (entry: ResidenceEntry, index: number) => (
    <div className="contact-person-section">
      <h5>Contact Person Who Knows You at This Address</h5>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`contact-first-${index}`}>First Name *</label>
          <input
            id={`contact-first-${index}`}
            type="text"
            value={entry.contactPerson.firstName.value}
            onChange={(e) => handleFieldChange('contactPerson.firstName', e.target.value, index)}
            className={errors[`section11.residences[${index}].contactPerson.firstName`] ? 'error' : ''}
            placeholder="Enter first name"
          />
          {errors[`section11.residences[${index}].contactPerson.firstName`] && (
            <span className="error-message">
              {errors[`section11.residences[${index}].contactPerson.firstName`]}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor={`contact-middle-${index}`}>Middle Name</label>
          <input
            id={`contact-middle-${index}`}
            type="text"
            value={entry.contactPerson.middleName.value}
            onChange={(e) => handleFieldChange('contactPerson.middleName', e.target.value, index)}
            placeholder="Enter middle name"
          />
        </div>

        <div className="form-group">
          <label htmlFor={`contact-last-${index}`}>Last Name *</label>
          <input
            id={`contact-last-${index}`}
            type="text"
            value={entry.contactPerson.lastName.value}
            onChange={(e) => handleFieldChange('contactPerson.lastName', e.target.value, index)}
            className={errors[`section11.residences[${index}].contactPerson.lastName`] ? 'error' : ''}
            placeholder="Enter last name"
          />
          {errors[`section11.residences[${index}].contactPerson.lastName`] && (
            <span className="error-message">
              {errors[`section11.residences[${index}].contactPerson.lastName`]}
            </span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`contact-relationship-${index}`}>Relationship</label>
          <select
            id={`contact-relationship-${index}`}
            value={entry.contactPerson.relationship.value}
            onChange={(e) => handleFieldChange('contactPerson.relationship', e.target.value, index)}
          >
            {entry.contactPerson.relationship.options?.map(rel => (
              <option key={rel} value={rel}>{rel}</option>
            ))}
          </select>
        </div>

        {entry.contactPerson.relationship.value === 'Other' && (
          <div className="form-group">
            <label htmlFor={`contact-relationship-other-${index}`}>Specify Other</label>
            <input
              id={`contact-relationship-other-${index}`}
              type="text"
              value={entry.contactPerson.relationshipOther.value}
              onChange={(e) => handleFieldChange('contactPerson.relationshipOther', e.target.value, index)}
              placeholder="Specify other relationship"
            />
          </div>
        )}
      </div>

      <div className="contact-phones">
        <h6>Contact Information</h6>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor={`contact-evening-${index}`}>Evening Phone</label>
            <input
              id={`contact-evening-${index}`}
              type="tel"
              value={entry.contactPerson.eveningPhone.value}
              onChange={(e) => handleFieldChange('contactPerson.eveningPhone', e.target.value, index)}
              placeholder="(XXX) XXX-XXXX"
            />
          </div>

          <div className="form-group">
            <label htmlFor={`contact-daytime-${index}`}>Daytime Phone</label>
            <input
              id={`contact-daytime-${index}`}
              type="tel"
              value={entry.contactPerson.daytimePhone.value}
              onChange={(e) => handleFieldChange('contactPerson.daytimePhone', e.target.value, index)}
              placeholder="(XXX) XXX-XXXX"
            />
          </div>

          <div className="form-group">
            <label htmlFor={`contact-mobile-${index}`}>Mobile Phone</label>
            <input
              id={`contact-mobile-${index}`}
              type="tel"
              value={entry.contactPerson.mobilePhone.value}
              onChange={(e) => handleFieldChange('contactPerson.mobilePhone', e.target.value, index)}
              placeholder="(XXX) XXX-XXXX"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor={`contact-email-${index}`}>Email</label>
            <input
              id={`contact-email-${index}`}
              type="email"
              value={entry.contactPerson.email.value}
              onChange={(e) => handleFieldChange('contactPerson.email', e.target.value, index)}
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div className="form-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={entry.contactPerson.dontKnowContact.value}
              onChange={(e) => handleFieldChange('contactPerson.dontKnowContact', e.target.checked, index)}
            />
            I don't know this person or how to contact them
          </label>
        </div>
      </div>
    </div>
  );

  const renderResidenceHistorySummary = () => {
    const timespan = getTotalResidenceTimespan();
    const isComplete = isResidenceHistoryComplete();
    
    return (
      <div className="residence-history-summary">
        <h4>Residence History Summary</h4>
        <div className="summary-stats">
          <div className="stat">
            <label>Total Residences:</label>
            <span>{getEntryCount()}</span>
          </div>
          <div className="stat">
            <label>Total Timespan:</label>
            <span>{timespan.toFixed(1)} years</span>
          </div>
          <div className="stat">
            <label>History Complete:</label>
            <span className={isComplete ? 'complete' : 'incomplete'}>
              {isComplete ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
        
        {!isComplete && (
          <div className="warning">
            <p>⚠️ Your residence history should cover at least 7 years without gaps.</p>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="section-loading">
        <div className="loading-spinner"></div>
        <p>Loading Section 11: Where You Have Lived...</p>
      </div>
    );
  }

  return (
    <div className="section-11-component">
      <div className="section-header">
        <h2>Section 11: Where You Have Lived</h2>
        <p className="section-description">
          List where you have lived, beginning with your current address first. 
          Account for all residences for the last 7 years or since your 18th birthday, 
          whichever is shorter.
        </p>
        {isDirty && (
          <div className="unsaved-changes">
            ⚠️ You have unsaved changes
          </div>
        )}
      </div>

      {renderResidenceHistorySummary()}

      <div className="residences-container">
        {section11Data.section11.residences.map((entry, index) => 
          renderResidenceEntry(entry, index)
        )}
      </div>

      <div className="section-actions">
        <button
          type="button"
          onClick={handleAddResidence}
          className="btn-primary"
        >
          Add Another Residence
        </button>
      </div>

      {showValidation && Object.keys(errors).length > 0 && (
        <div className="validation-errors">
          <h4>Please correct the following errors:</h4>
          <ul>
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      {showNavigation && (
        <div className="section-navigation">
          {onPrevious && (
            <button
              type="button"
              onClick={onPrevious}
              className="btn-secondary"
            >
              Previous Section
            </button>
          )}
          
          <button
            type="button"
            onClick={handleValidateAndContinue}
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Section11Component; 