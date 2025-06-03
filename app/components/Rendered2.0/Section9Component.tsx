/**
 * Section 9: Citizenship - Component
 *
 * React component for SF-86 Section 9 using the new Form Architecture 2.0.
 * This component handles collection of citizenship status information including
 * birth citizenship, naturalization, derived citizenship, and non-US citizenship.
 */

import React, { useEffect, useState } from 'react';
import { useSection9 } from '~/state/contexts/sections2.0/section9';

interface Section9ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

const Section9Component: React.FC<Section9ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  const {
    section9Data,
    updateCitizenshipStatus,
    updateBornToUSParentsInfo,
    updateNaturalizationInfo,
    updateDerivedCitizenshipInfo,
    updateNonUSCitizenInfo,
    validateSection,
    resetSection,
    isDirty,
    errors
  } = useSection9();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section9Data]); // Removed validateSection and onValidationChange to prevent infinite loops

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    if (result.isValid && onNext) {
      onNext();
    }
  };

  // Determine which form to display based on citizenship status
  const renderFormBasedOnStatus = () => {
    const status = section9Data.section9.status.value;

    if (status?.includes('born to U.S. parent(s)')) {
      return renderBornToUSParentsForm();
    } else if (status?.includes('naturalized U.S. citizen')) {
      return renderNaturalizedForm();
    } else if (status?.includes('derived U.S. citizen')) {
      return renderDerivedCitizenshipForm();
    } else if (status?.includes('not a U.S. citizen')) {
      return renderNonUSCitizenForm();
    }

    return null;
  };

  // Form for "Born to U.S. parents" status
  const renderBornToUSParentsForm = () => {
    const bornToUSParents = section9Data.section9.bornToUSParents || {};

    return (
      <div className="border rounded-lg p-5 bg-gray-50 space-y-4">
        <h3 className="text-lg font-semibold mb-4">U.S. Citizenship by Birth Abroad</h3>

        {/* Document Type */}
        <div>
          <label
            htmlFor="document-type"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Document Type <span className="text-red-500">*</span>
          </label>
          <select
            id="document-type"
            data-testid="document-type-select"
            value={bornToUSParents.documentType?.value || ''}
            onChange={(e) => updateBornToUSParentsInfo('documentType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select document type</option>
            <option value="FS-240">FS-240 (Consular Report of Birth Abroad)</option>
            <option value="DS-1350">DS-1350 (Certification of Birth Abroad)</option>
            <option value="FS-545">FS-545 (Certification of Birth Abroad)</option>
            <option value="OTHER">Other (specify)</option>
          </select>
          {errors['citizenshipStatus.bornToUSParents.documentType'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.bornToUSParents.documentType']}</p>
          )}
        </div>

        {/* Document Number */}
        <div>
          <label
            htmlFor="document-number"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Document Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="document-number"
            data-testid="document-number-input"
            value={bornToUSParents.documentNumber?.value || ''}
            onChange={(e) => updateBornToUSParentsInfo('documentNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter document number"
            required
          />
          {errors['citizenshipStatus.bornToUSParents.documentNumber'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.bornToUSParents.documentNumber']}</p>
          )}
        </div>

        {/* Issue Date */}
        <div>
          <label
            htmlFor="document-issue-date"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Issue Date <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="document-issue-date"
            data-testid="document-issue-date-input"
            value={bornToUSParents.issueDate?.value || ''}
            onChange={(e) => updateBornToUSParentsInfo('issueDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="MM/DD/YYYY"
            required
          />
          {errors['citizenshipStatus.bornToUSParents.issueDate'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.bornToUSParents.issueDate']}</p>
          )}
        </div>

        {/* Other Document Type (if applicable) */}
        {bornToUSParents.documentType?.value === 'OTHER' && (
          <div>
            <label
              htmlFor="other-document-type"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Specify Other Document Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="other-document-type"
              data-testid="other-document-type-input"
              value={bornToUSParents.otherDocumentType?.value || ''}
              onChange={(e) => updateBornToUSParentsInfo('otherDocumentType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Specify document type"
              required
            />
            {errors['citizenshipStatus.bornToUSParents.otherDocumentType'] && (
              <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.bornToUSParents.otherDocumentType']}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Form for "Naturalized" status
  const renderNaturalizedForm = () => {
    const naturalized = section9Data.section9.naturalized || {};

    return (
      <div className="border rounded-lg p-5 bg-gray-50 space-y-4">
        <h3 className="text-lg font-semibold mb-4">Naturalization Information</h3>

        {/* Certificate Number */}
        <div>
          <label
            htmlFor="certificate-number"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Certificate Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="certificate-number"
            data-testid="certificate-number-input"
            value={naturalized.certificateNumber?.value || ''}
            onChange={(e) => updateNaturalizationInfo('certificateNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter certificate number"
            required
          />
          {errors['citizenshipStatus.naturalized.certificateNumber'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.naturalized.certificateNumber']}</p>
          )}
        </div>

        {/* Naturalization Date */}
        <div>
          <label
            htmlFor="naturalization-date"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Date of Naturalization <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="naturalization-date"
            data-testid="naturalization-date-input"
            value={naturalized.naturalizationDate?.value || ''}
            onChange={(e) => updateNaturalizationInfo('naturalizationDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="MM/DD/YYYY"
            required
          />
          {errors['citizenshipStatus.naturalized.naturalizationDate'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.naturalized.naturalizationDate']}</p>
          )}
        </div>

        {/* Court Information */}
        <div>
          <label
            htmlFor="court-name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Court Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="court-name"
            data-testid="court-name-input"
            value={naturalized.courtName?.value || ''}
            onChange={(e) => updateNaturalizationInfo('courtName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter court name"
            required
          />
          {errors['citizenshipStatus.naturalized.courtName'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.naturalized.courtName']}</p>
          )}
        </div>

        {/* Court Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="court-city"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Court City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="court-city"
              data-testid="court-city-input"
              value={naturalized.courtCity?.value || ''}
              onChange={(e) => updateNaturalizationInfo('courtCity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter city"
              required
            />
            {errors['citizenshipStatus.naturalized.courtCity'] && (
              <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.naturalized.courtCity']}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="court-state"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Court State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="court-state"
              data-testid="court-state-input"
              value={naturalized.courtState?.value || ''}
              onChange={(e) => updateNaturalizationInfo('courtState', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter state"
              required
            />
            {errors['citizenshipStatus.naturalized.courtState'] && (
              <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.naturalized.courtState']}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Form for "Derived" status
  const renderDerivedCitizenshipForm = () => {
    const derived = section9Data.section9.derived || {};

    return (
      <div className="border rounded-lg p-5 bg-gray-50 space-y-4">
        <h3 className="text-lg font-semibold mb-4">Derived Citizenship Information</h3>

        {/* Certificate Number */}
        <div>
          <label
            htmlFor="derived-certificate-number"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Certificate Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="derived-certificate-number"
            data-testid="derived-certificate-number-input"
            value={derived.certificateNumber?.value || ''}
            onChange={(e) => updateDerivedCitizenshipInfo('certificateNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter certificate number"
            required
          />
          {errors['citizenshipStatus.derived.certificateNumber'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.derived.certificateNumber']}</p>
          )}
        </div>

        {/* Issue Date */}
        <div>
          <label
            htmlFor="derived-issue-date"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Issue Date <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="derived-issue-date"
            data-testid="derived-issue-date-input"
            value={derived.issueDate?.value || ''}
            onChange={(e) => updateDerivedCitizenshipInfo('issueDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="MM/DD/YYYY"
            required
          />
          {errors['citizenshipStatus.derived.issueDate'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.derived.issueDate']}</p>
          )}
        </div>

        {/* Place of Issuance */}
        <div>
          <label
            htmlFor="derived-place"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Place of Issuance <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="derived-place"
            data-testid="derived-place-input"
            value={derived.issuanceLocation?.value || ''}
            onChange={(e) => updateDerivedCitizenshipInfo('issuanceLocation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter place of issuance"
            required
          />
          {errors['citizenshipStatus.derived.issuanceLocation'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.derived.issuanceLocation']}</p>
          )}
        </div>

        {/* Basis of Derived Citizenship */}
        <div>
          <label
            htmlFor="derived-basis"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Basis of Derived Citizenship <span className="text-red-500">*</span>
          </label>
          <select
            id="derived-basis"
            data-testid="derived-basis-select"
            value={derived.basis?.value || ''}
            onChange={(e) => updateDerivedCitizenshipInfo('basis', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select basis</option>
            <option value="PARENT">Through parents</option>
            <option value="MARRIAGE">Through marriage</option>
            <option value="OTHER">Other (specify)</option>
          </select>
          {errors['citizenshipStatus.derived.basis'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.derived.basis']}</p>
          )}
        </div>

        {/* Other Basis (if applicable) */}
        {derived.basis?.value === 'OTHER' && (
          <div>
            <label
              htmlFor="derived-other-basis"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Specify Other Basis <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="derived-other-basis"
              data-testid="derived-other-basis-input"
              value={derived.otherBasis?.value || ''}
              onChange={(e) => updateDerivedCitizenshipInfo('otherBasis', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Specify basis"
              required
            />
            {errors['citizenshipStatus.derived.otherBasis'] && (
              <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.derived.otherBasis']}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Form for "Non-US Citizen" status
  const renderNonUSCitizenForm = () => {
    const nonUSCitizen = section9Data.section9.nonUSCitizen || {};

    return (
      <div className="border rounded-lg p-5 bg-gray-50 space-y-4">
        <h3 className="text-lg font-semibold mb-4">Non-U.S. Citizen Information</h3>

        {/* Country of Citizenship */}
        <div>
          <label
            htmlFor="country-of-citizenship"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Country of Citizenship <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="country-of-citizenship"
            data-testid="country-of-citizenship-input"
            value={nonUSCitizen.countryOfCitizenship?.value || ''}
            onChange={(e) => updateNonUSCitizenInfo('countryOfCitizenship', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter country name"
            required
          />
          {errors['citizenshipStatus.nonUSCitizen.countryOfCitizenship'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.nonUSCitizen.countryOfCitizenship']}</p>
          )}
        </div>

        {/* Document Type */}
        <div>
          <label
            htmlFor="non-us-document-type"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Document Type <span className="text-red-500">*</span>
          </label>
          <select
            id="non-us-document-type"
            data-testid="non-us-document-type-select"
            value={nonUSCitizen.documentType?.value || ''}
            onChange={(e) => updateNonUSCitizenInfo('documentType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select document type</option>
            <option value="I-551">I-551 (Permanent Resident Card)</option>
            <option value="I-766">I-766 (Employment Authorization Card)</option>
            <option value="I-94">I-94 (Arrival-Departure Record)</option>
            <option value="VISA">Visa</option>
            <option value="OTHER">Other (specify)</option>
          </select>
          {errors['citizenshipStatus.nonUSCitizen.documentType'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.nonUSCitizen.documentType']}</p>
          )}
        </div>

        {/* Document Number */}
        <div>
          <label
            htmlFor="non-us-document-number"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Document Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="non-us-document-number"
            data-testid="non-us-document-number-input"
            value={nonUSCitizen.documentNumber?.value || ''}
            onChange={(e) => updateNonUSCitizenInfo('documentNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter document number"
            required
          />
          {errors['citizenshipStatus.nonUSCitizen.documentNumber'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.nonUSCitizen.documentNumber']}</p>
          )}
        </div>

        {/* Expiration Date */}
        <div>
          <label
            htmlFor="non-us-expiration-date"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Expiration Date <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="non-us-expiration-date"
            data-testid="non-us-expiration-date-input"
            value={nonUSCitizen.expirationDate?.value || ''}
            onChange={(e) => updateNonUSCitizenInfo('expirationDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="MM/DD/YYYY"
            required
          />
          {errors['citizenshipStatus.nonUSCitizen.expirationDate'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.nonUSCitizen.expirationDate']}</p>
          )}
        </div>

        {/* Other Document Type (if applicable) */}
        {nonUSCitizen.documentType?.value === 'OTHER' && (
          <div>
            <label
              htmlFor="non-us-other-document-type"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Specify Other Document Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="non-us-other-document-type"
              data-testid="non-us-other-document-type-input"
              value={nonUSCitizen.otherDocumentType?.value || ''}
              onChange={(e) => updateNonUSCitizenInfo('otherDocumentType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Specify document type"
              required
            />
            {errors['citizenshipStatus.nonUSCitizen.otherDocumentType'] && (
              <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.nonUSCitizen.otherDocumentType']}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section9-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 9: Citizenship
        </h2>
        <p className="text-gray-600">
          Provide information about your citizenship status.
        </p>
      </div>

      {/* Citizenship Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Citizenship Status Selection */}
        <div>
          <label
            htmlFor="citizenship-status"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select your citizenship status <span className="text-red-500">*</span>
          </label>
          <select
            id="citizenship-status"
            data-testid="citizenship-status-select"
            value={section9Data.section9.status.value || ''}
            onChange={(e) => updateCitizenshipStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select citizenship status</option>
            <option value="I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth. (Proceed to Section 10)   ">
              I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth
            </option>
            <option value="I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country. (Complete 9.1) ">
              I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country
            </option>
            <option value="I am a naturalized U.S. citizen. (Complete 9.2) ">
              I am a naturalized U.S. citizen
            </option>
            <option value="I am a derived U.S. citizen. (Complete 9.3) ">
              I am a derived U.S. citizen
            </option>
            <option value="I am not a U.S. citizen. (Complete 9.4) ">
              I am not a U.S. citizen
            </option>
          </select>
          {errors['section9.status'] && (
            <p className="mt-1 text-sm text-red-600">{errors['section9.status']}</p>
          )}
        </div>

        {/* Conditional Form Based on Status */}
        {renderFormBasedOnStatus()}

        {/* Form Actions */}
        <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            <span className="text-red-500">*</span> Required fields
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              data-testid="submit-section-button"
            >
              Submit & Continue
            </button>

            <button
              type="button"
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              data-testid="clear-section-button"
              onClick={resetSection}
            >
              Clear Section
            </button>
          </div>
        </div>

        {/* Validation Status */}
        <div className="mt-4" data-testid="validation-status">
          <div className="text-sm text-gray-600">
            Section Status: <span className={`font-medium ${isDirty ? 'text-orange-500' : 'text-green-500'}`}>
              {isDirty ? 'Modified, needs validation' : 'Ready for input'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Validation: <span className={`font-medium ${isValid ? 'text-green-500' : 'text-red-500'}`}>
              {isValid ? 'Valid' : 'Has errors'}
            </span>
          </div>
        </div>
      </form>

      {/* Debug Information (Development Only) */}
      {typeof window !== 'undefined' && window.location.search.includes('debug=true') && (
        <details className="mt-6 p-4 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Debug Information
          </summary>
          <div className="mt-2">
            <h4 className="text-xs font-medium text-gray-600 mb-2">Section 9 Data:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(section9Data, null, 2)}
            </pre>
            <h4 className="text-xs font-medium text-gray-600 mt-4 mb-2">Validation Errors:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(errors, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
};

export default Section9Component;