/**
 * Section 9: Citizenship - Component
 *
 * React component for SF-86 Section 9 using the new Form Architecture 2.0.
 * This component handles collection of citizenship status information including
 * birth citizenship, naturalization, derived citizenship, and non-US citizenship.
 */

import React, { useEffect, useState } from 'react';
import { useSection9 } from '~/state/contexts/sections2.0/section9';
import { useSF86Form } from '~/state/contexts/sections2.0/SF86FormContext';
import { getSuffixOptions, getUSStateOptions, getCountryOptions } from '../../../api/interfaces/sections2.0/base';

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
    updateNaturalizedInfo,
    updateDerivedInfo,
    updateNonUSCitizenInfo,
    updateFieldValue,
    validateSection,
    resetSection,
    isDirty,
    errors
  } = useSection9();

  // Helper function to safely get field values with enhanced type guards
  const getFieldValue = (obj: any, fieldName: string, defaultValue: any = '') => {
    try {
      if (!obj || typeof obj !== 'object') return defaultValue;
      const field = obj[fieldName];
      if (!field || typeof field !== 'object' || !('value' in field)) return defaultValue;
      return field.value ?? defaultValue;
    } catch (error) {
      // console.warn(`🚨 Section9Component: Error accessing field ${fieldName}:`, error);
      return defaultValue;
    }
  };

  // Helper function to safely get nested field values (e.g., address.city) with enhanced error handling
  const getNestedFieldValue = (obj: any, path: string, defaultValue: any = '') => {
    try {
      if (!obj || typeof obj !== 'object') return defaultValue;
      const pathParts = path.split('.');
      let current = obj;

      for (const part of pathParts) {
        if (!current || typeof current !== 'object') return defaultValue;
        current = current[part];
      }

      if (!current || typeof current !== 'object' || !('value' in current)) return defaultValue;
      return current.value ?? defaultValue;
    } catch (error) {
      // console.warn(`🚨 Section9Component: Error accessing nested field ${path}:`, error);
      return defaultValue;
    }
  };

  // Helper function to safely check if a subsection exists and has data
  const hasSubsectionData = (subsection: any): boolean => {
    if (!subsection || typeof subsection !== 'object') return false;
    return Object.keys(subsection).length > 0;
  };

  // Helper function to safely get subsection with fallback
  const getSubsection = (subsectionName: keyof typeof section9Data.section9, fallback = {}) => {
    try {
      const subsection = section9Data.section9[subsectionName];
      return subsection && typeof subsection === 'object' ? subsection : fallback;
    } catch (error) {
      // console.warn(`🚨 Section9Component: Error accessing subsection ${subsectionName}:`, error);
      return fallback;
    }
  };

  // SF86 Form Context for data persistence6
  const sf86Form = useSF86Form();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    // Debug logging to verify form functionality
    // console.log('🔍 Section9Component: Component updated');
    // console.log('🔍 Section9Component: section9Data:', section9Data);
    // console.log('🔍 Section9Component: status value:', getFieldValue(section9Data.section9, 'status', 'NOT_SET'));
    // console.log('🔍 Section9Component: bornToUSParents subsection:', getSubsection('bornToUSParents'));

    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section9Data]); // Removed validateSection and onValidationChange to prevent infinite loops

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    console.log('🔍 Section 9 validation result:', result);
    console.log('📊 Section 9 data before submission:', section9Data);

    if (result.isValid) {
      try {
        console.log('🔄 Section 9: Starting data synchronization...');

        // Update the central form context with Section 9 data
        sf86Form.updateSectionData('section9', section9Data);

        console.log('✅ Section 9: Data synchronization complete, proceeding to save...');

        // Get the current form data and update it with section9 data for immediate saving
        const currentFormData = sf86Form.exportForm();
        const updatedFormData = { ...currentFormData, section9: section9Data };

        // Save the form data to persistence layer with the updated data
        await sf86Form.saveForm(updatedFormData);

        // Mark section as complete after successful save
        sf86Form.markSectionComplete('section9');

        console.log('✅ Section 9 data saved successfully:', section9Data);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('❌ Failed to save Section 9 data:', error);
        // Show an error message to user
        console.log('There was an error saving your information. Please try again.');
      }
    }
  };


  // Determine which form to display based on citizenship status with enhanced error handling
  const renderFormBasedOnStatus = () => {
    try {
      const status = getFieldValue(section9Data.section9, 'status', '');

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
    } catch (error) {
      console.error('🚨 Section9Component: Error rendering form based on status:', error);
      return (
        <div className="border rounded-lg p-5 bg-red-50 text-red-700">
          <p>Error loading form. Please refresh the page or contact support.</p>
        </div>
      );
    }
  };

  // Form for "Born to U.S. parents" status
  const renderBornToUSParentsForm = () => {
    const bornToUSParents = getSubsection('bornToUSParents');

    // Debug logging
    // console.log('🔍 Section9Component: bornToUSParents data:', bornToUSParents);

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
            value={getFieldValue(bornToUSParents, 'documentType', '')}
            onChange={(e) => {
              // console.log(`🎯 Section9Component: Document type changed to:`, e.target.value);
              updateBornToUSParentsInfo('documentType', e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select document type</option>
            <option value="FS240">FS-240 (Consular Report of Birth Abroad)</option>
            <option value="DS1350">DS-1350 (Certification of Birth Abroad)</option>
            <option value="FS545">FS-545 (Certification of Birth Abroad)</option>
            <option value="Other (Provide explanation)">Other (specify)</option>
          </select>
          {errors['citizenshipStatus.bornToUSParents.documentType'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.bornToUSParents.documentType']}</p>
          )}
        </div>

        {/* Other Document Type (if applicable) */}
        {getFieldValue(bornToUSParents, 'documentType', '') === 'Other (Provide explanation)' && (
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
              value={getFieldValue(bornToUSParents, 'otherExplanation', '')}
              onChange={(e) => updateBornToUSParentsInfo('otherExplanation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Specify document type"
              required
            />
            {errors['citizenshipStatus.bornToUSParents.otherExplanation'] && (
              <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.bornToUSParents.otherExplanation']}</p>
            )}
          </div>
        )}

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
            value={getFieldValue(bornToUSParents, 'documentNumber', '')}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              value={getFieldValue(bornToUSParents, 'documentIssueDate', '')}
              onChange={(e) => updateBornToUSParentsInfo('documentIssueDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="MM/DD/YYYY"
              required
            />
            {errors['citizenshipStatus.bornToUSParents.documentIssueDate'] && (
              <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.bornToUSParents.documentIssueDate']}</p>
            )}
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="issue-date-estimated"
              data-testid="issue-date-estimated-checkbox"
              checked={getFieldValue(bornToUSParents, 'isIssueDateEstimated', false)}
              onChange={(e) => updateBornToUSParentsInfo('isIssueDateEstimated', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="issue-date-estimated" className="ml-2 block text-sm text-gray-700">
              Estimated
            </label>
          </div>
        </div>

        {/* Issue Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="issue-city"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Issue City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="issue-city"
              data-testid="issue-city-input"
              value={getFieldValue(bornToUSParents, 'issueCity', '')}
              onChange={(e) => updateBornToUSParentsInfo('issueCity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter city"
              required
            />
            {errors['citizenshipStatus.bornToUSParents.issueCity'] && (
              <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.bornToUSParents.issueCity']}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="issue-state"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Issue State/Province
            </label>
            <select
              id="issue-state"
              data-testid="issue-state-select"
              value={getFieldValue(bornToUSParents, 'issueState', '')}
              onChange={(e) => updateBornToUSParentsInfo('issueState', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {getUSStateOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors['citizenshipStatus.bornToUSParents.issueState'] && (
              <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.bornToUSParents.issueState']}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="issue-country"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Issue Country
            </label>
            <select
              id="issue-country"
              data-testid="issue-country-select"
              value={getFieldValue(bornToUSParents, 'issueCountry', '')}
              onChange={(e) => updateBornToUSParentsInfo('issueCountry', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {getCountryOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors['citizenshipStatus.bornToUSParents.issueCountry'] && (
              <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.bornToUSParents.issueCountry']}</p>
            )}
          </div>
        </div>

        {/* Name on Document */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Name on Document</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="name-first"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name-first"
                data-testid="name-first-input"
                value={getNestedFieldValue(bornToUSParents, 'nameOnDocument.firstName', '')}
                onChange={(e) => updateFieldValue('bornToUSParents.nameOnDocument.firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter first name"
                required
              />
              {errors['citizenshipStatus.bornToUSParents.nameOnDocument.firstName'] && (
                <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.bornToUSParents.nameOnDocument.firstName']}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="name-middle"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Middle Name
              </label>
              <input
                type="text"
                id="name-middle"
                data-testid="name-middle-input"
                value={getNestedFieldValue(bornToUSParents, 'nameOnDocument.middleName', '')}
                onChange={(e) => updateFieldValue('bornToUSParents.nameOnDocument.middleName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter middle name"
              />
              {errors['citizenshipStatus.bornToUSParents.nameOnDocument.middleName'] && (
                <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.bornToUSParents.nameOnDocument.middleName']}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="name-last"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name-last"
                data-testid="name-last-input"
                value={getNestedFieldValue(bornToUSParents, 'nameOnDocument.lastName', '')}
                onChange={(e) => updateFieldValue('bornToUSParents.nameOnDocument.lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter last name"
                required
              />
              {errors['citizenshipStatus.bornToUSParents.nameOnDocument.lastName'] && (
                <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.bornToUSParents.nameOnDocument.lastName']}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="name-suffix"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Suffix
              </label>
              <select
                id="name-suffix"
                data-testid="name-suffix-select"
                value={getNestedFieldValue(bornToUSParents, 'nameOnDocument.suffix', '')}
                onChange={(e) => updateFieldValue('bornToUSParents.nameOnDocument.suffix', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {getSuffixOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors['citizenshipStatus.bornToUSParents.nameOnDocument.suffix'] && (
                <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.bornToUSParents.nameOnDocument.suffix']}</p>
              )}
            </div>
          </div>
        </div>

        {/* Certificate Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Certificate Information (if applicable)</h4>

          {/* Certificate Number */}
          <div className="mb-4">
            <label
              htmlFor="certificate-number"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Certificate Number
            </label>
            <input
              type="text"
              id="certificate-number"
              data-testid="certificate-number-input"
              value={getFieldValue(bornToUSParents, 'certificateNumber', '')}
              onChange={(e) => updateBornToUSParentsInfo('certificateNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter certificate number"
            />
            {errors['citizenshipStatus.bornToUSParents.certificateNumber'] && (
              <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.bornToUSParents.certificateNumber']}</p>
            )}
          </div>

          {/* Certificate Issue Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="certificate-issue-date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Certificate Issue Date
              </label>
              <input
                type="text"
                id="certificate-issue-date"
                data-testid="certificate-issue-date-input"
                value={getFieldValue(bornToUSParents, 'certificateIssueDate', '')}
                onChange={(e) => updateBornToUSParentsInfo('certificateIssueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="MM/DD/YYYY"
              />
              {errors['citizenshipStatus.bornToUSParents.certificateIssueDate'] && (
                <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.bornToUSParents.certificateIssueDate']}</p>
              )}
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="certificate-date-estimated"
                data-testid="certificate-date-estimated-checkbox"
                checked={getFieldValue(bornToUSParents, 'isCertificateDateEstimated', false)}
                onChange={(e) => updateBornToUSParentsInfo('isCertificateDateEstimated', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="certificate-date-estimated" className="ml-2 block text-sm text-gray-700">
                Certificate Date Estimated
              </label>
            </div>
          </div>

          {/* Name on Certificate */}
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-3">Name on Certificate (if different from document)</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="cert-name-first"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="cert-name-first"
                  data-testid="cert-name-first-input"
                  value={getNestedFieldValue(bornToUSParents, 'nameOnCertificate.firstName', '')}
                  onChange={(e) => updateFieldValue('bornToUSParents.nameOnCertificate.firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label
                  htmlFor="cert-name-middle"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Middle Name
                </label>
                <input
                  type="text"
                  id="cert-name-middle"
                  data-testid="cert-name-middle-input"
                  value={getNestedFieldValue(bornToUSParents, 'nameOnCertificate.middleName', '')}
                  onChange={(e) => updateFieldValue('bornToUSParents.nameOnCertificate.middleName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter middle name"
                />
              </div>
              <div>
                <label
                  htmlFor="cert-name-last"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="cert-name-last"
                  data-testid="cert-name-last-input"
                  value={getNestedFieldValue(bornToUSParents, 'nameOnCertificate.lastName', '')}
                  onChange={(e) => updateFieldValue('bornToUSParents.nameOnCertificate.lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label
                  htmlFor="cert-name-suffix"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Suffix
                </label>
                <select
                  id="cert-name-suffix"
                  data-testid="cert-name-suffix-select"
                  value={getNestedFieldValue(bornToUSParents, 'nameOnCertificate.suffix', '')}
                  onChange={(e) => updateFieldValue('bornToUSParents.nameOnCertificate.suffix', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {getSuffixOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Military Installation Question */}
        <div>
          <label
            htmlFor="military-installation"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Were you born on a military installation? <span className="text-red-500">*</span>
          </label>
          <select
            id="military-installation"
            data-testid="military-installation-select"
            value={getFieldValue(bornToUSParents, 'wasBornOnMilitaryInstallation', '')}
            onChange={(e) => updateBornToUSParentsInfo('wasBornOnMilitaryInstallation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select answer</option>
            <option value="YES">YES</option>
            <option value="NO (If NO, proceed to Section 10)">NO (If NO, proceed to Section 10)</option>
          </select>
          {errors['citizenshipStatus.bornToUSParents.wasBornOnMilitaryInstallation'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.bornToUSParents.wasBornOnMilitaryInstallation']}</p>
          )}
        </div>

        {/* Military Base Name (conditional) */}
        {getFieldValue(bornToUSParents, 'wasBornOnMilitaryInstallation', '') === 'YES' && (
          <div>
            <label
              htmlFor="military-base-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Military Base Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="military-base-name"
              data-testid="military-base-name-input"
              value={getFieldValue(bornToUSParents, 'militaryBaseName', '')}
              onChange={(e) => updateBornToUSParentsInfo('militaryBaseName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter military base name"
              required
            />
            {errors['citizenshipStatus.bornToUSParents.militaryBaseName'] && (
              <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.bornToUSParents.militaryBaseName']}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Form for "Naturalized" status
  const renderNaturalizedForm = () => {
    const naturalized = getSubsection('naturalizedCitizen');

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
            value={getFieldValue(naturalized, 'naturalizedCertificateNumber', '')}
            onChange={(e) => updateNaturalizedInfo('naturalizedCertificateNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter certificate number"
            required
          />
          {errors['citizenshipStatus.naturalizedCitizen.naturalizedCertificateNumber'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.naturalizedCitizen.naturalizedCertificateNumber']}</p>
          )}
        </div>

        {/* Certificate Issue Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="certificate-issue-date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Certificate Issue Date <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="certificate-issue-date"
              data-testid="certificate-issue-date-input"
              value={getFieldValue(naturalized, 'certificateIssueDate', '')}
              onChange={(e) => updateNaturalizedInfo('certificateIssueDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="MM/DD/YYYY"
              required
            />
            {errors['citizenshipStatus.naturalizedCitizen.certificateIssueDate'] && (
              <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.naturalizedCitizen.certificateIssueDate']}</p>
            )}
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="nat-cert-date-estimated"
              data-testid="nat-cert-date-estimated-checkbox"
              checked={getFieldValue(naturalized, 'isCertificateDateEstimated', false)}
              onChange={(e) => updateNaturalizedInfo('isCertificateDateEstimated', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="nat-cert-date-estimated" className="ml-2 block text-sm text-gray-700">
              Certificate Date Estimated
            </label>
          </div>
        </div>

        {/* Name on Certificate */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Name on Certificate</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="nat-cert-first-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nat-cert-first-name"
                data-testid="nat-cert-first-name-input"
                value={getNestedFieldValue(naturalized, 'nameOnCertificate.firstName', '')}
                onChange={(e) => updateFieldValue('naturalizedCitizen.nameOnCertificate.firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <label
                htmlFor="nat-cert-middle-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Middle Name
              </label>
              <input
                type="text"
                id="nat-cert-middle-name"
                data-testid="nat-cert-middle-name-input"
                value={getNestedFieldValue(naturalized, 'nameOnCertificate.middleName', '')}
                onChange={(e) => updateFieldValue('naturalizedCitizen.nameOnCertificate.middleName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter middle name"
              />
            </div>
            <div>
              <label
                htmlFor="nat-cert-last-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nat-cert-last-name"
                data-testid="nat-cert-last-name-input"
                value={getNestedFieldValue(naturalized, 'nameOnCertificate.lastName', '')}
                onChange={(e) => updateFieldValue('naturalizedCitizen.nameOnCertificate.lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter last name"
                required
              />
            </div>
            <div>
              <label
                htmlFor="nat-cert-suffix"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Suffix
              </label>
              <select
                id="nat-cert-suffix"
                data-testid="nat-cert-suffix-select"
                value={getNestedFieldValue(naturalized, 'nameOnCertificate.suffix', '')}
                onChange={(e) => updateFieldValue('naturalizedCitizen.nameOnCertificate.suffix', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {getSuffixOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
            value={getFieldValue(naturalized, 'courtName', '')}
            onChange={(e) => updateNaturalizedInfo('courtName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter court name"
            required
          />
          {errors['citizenshipStatus.naturalized.courtName'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.naturalized.courtName']}</p>
          )}
        </div>

        {/* Court Address */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Court Address</h4>

          {/* Street Address */}
          <div className="mb-4">
            <label
              htmlFor="court-street"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="court-street"
              data-testid="court-street-input"
              value={getNestedFieldValue(naturalized, 'courtAddress.street', '')}
              onChange={(e) => updateFieldValue('naturalizedCitizen.courtAddress.street', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter street address"
              required
            />
            {errors['citizenshipStatus.naturalized.courtStreet'] && (
              <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.naturalized.courtStreet']}</p>
            )}
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                value={getNestedFieldValue(naturalized, 'courtAddress.city', '')}
                onChange={(e) => updateFieldValue('naturalizedCitizen.courtAddress.city', e.target.value)}
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
              <select
                id="court-state"
                data-testid="court-state-select"
                value={getNestedFieldValue(naturalized, 'courtAddress.state', '')}
                onChange={(e) => updateFieldValue('naturalizedCitizen.courtAddress.state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {getUSStateOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors['citizenshipStatus.naturalized.courtState'] && (
                <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.naturalized.courtState']}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="court-zip"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="court-zip"
                data-testid="court-zip-input"
                value={getNestedFieldValue(naturalized, 'courtAddress.zipCode', '')}
                onChange={(e) => updateFieldValue('naturalizedCitizen.courtAddress.zipCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter ZIP code"
                required
              />
              {errors['citizenshipStatus.naturalized.courtZip'] && (
                <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.naturalized.courtZip']}</p>
              )}
            </div>
          </div>
        </div>

        {/* Entry Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">U.S. Entry Information</h4>

          {/* Entry Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="nat-entry-date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date of Entry into the U.S. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nat-entry-date"
                data-testid="nat-entry-date-input"
                value={getFieldValue(naturalized, 'entryDate', '')}
                onChange={(e) => updateNaturalizedInfo('entryDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="MM/DD/YYYY"
                required
              />
              {errors['citizenshipStatus.naturalizedCitizen.entryDate'] && (
                <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.naturalizedCitizen.entryDate']}</p>
              )}
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="nat-entry-date-estimated"
                data-testid="nat-entry-date-estimated-checkbox"
                checked={getFieldValue(naturalized, 'isEntryDateEstimated', false)}
                onChange={(e) => updateNaturalizedInfo('isEntryDateEstimated', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="nat-entry-date-estimated" className="ml-2 block text-sm text-gray-700">
                Entry Date Estimated
              </label>
            </div>
          </div>

          {/* Entry Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="nat-entry-city"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                City of Entry <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nat-entry-city"
                data-testid="nat-entry-city-input"
                value={getFieldValue(naturalized, 'entryCity', '')}
                onChange={(e) => updateNaturalizedInfo('entryCity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter city of entry"
                required
              />
              {errors['citizenshipStatus.naturalizedCitizen.entryCity'] && (
                <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.naturalizedCitizen.entryCity']}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="nat-entry-state"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                State of Entry <span className="text-red-500">*</span>
              </label>
              <select
                id="nat-entry-state"
                data-testid="nat-entry-state-select"
                value={getFieldValue(naturalized, 'entryState', '')}
                onChange={(e) => updateNaturalizedInfo('entryState', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {getUSStateOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors['citizenshipStatus.naturalizedCitizen.entryState'] && (
                <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.naturalizedCitizen.entryState']}</p>
              )}
            </div>
          </div>
        </div>

        {/* Prior Citizenship */}
        <div>
          <label
            htmlFor="nat-prior-citizenship"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Country of Prior Citizenship <span className="text-red-500">*</span>
          </label>
          <select
            id="nat-prior-citizenship"
            data-testid="nat-prior-citizenship-select"
            value={getFieldValue(naturalized, 'priorCitizenship', '')}
            onChange={(e) => updateNaturalizedInfo('priorCitizenship', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {getCountryOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors['citizenshipStatus.naturalizedCitizen.priorCitizenship'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.naturalizedCitizen.priorCitizenship']}</p>
          )}
        </div>

        {/* U.S. Alien Registration Number */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">U.S. Alien Registration Information</h4>

          {/* Alien Registration Question */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Do/did you have a U.S. alien registration number? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="nat-alien-reg-yes"
                  name="nat-alien-registration"
                  data-testid="nat-alien-reg-yes-radio"
                  value="YES"
                  checked={getFieldValue(naturalized, 'hasAlienRegistrationRadio', '') === 'YES'}
                  onChange={(e) => updateNaturalizedInfo('hasAlienRegistrationRadio', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="nat-alien-reg-yes" className="ml-2 block text-sm text-gray-700">
                  Yes
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="nat-alien-reg-no"
                  name="nat-alien-registration"
                  data-testid="nat-alien-reg-no-radio"
                  value="NO"
                  checked={getFieldValue(naturalized, 'hasAlienRegistrationRadio', '') === 'NO'}
                  onChange={(e) => updateNaturalizedInfo('hasAlienRegistrationRadio', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="nat-alien-reg-no" className="ml-2 block text-sm text-gray-700">
                  No
                </label>
              </div>
            </div>
            {errors['citizenshipStatus.naturalizedCitizen.hasAlienRegistrationRadio'] && (
              <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.naturalizedCitizen.hasAlienRegistrationRadio']}</p>
            )}
          </div>

          {/* Alien Registration Number (conditional) */}
          {getFieldValue(naturalized, 'hasAlienRegistrationRadio', '') === 'YES' && (
            <div>
              <label
                htmlFor="nat-alien-reg-number"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                U.S. Alien Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nat-alien-reg-number"
                data-testid="nat-alien-reg-number-input"
                value={getFieldValue(naturalized, 'alienRegistrationNumber', '')}
                onChange={(e) => updateNaturalizedInfo('alienRegistrationNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter alien registration number"
                required
              />
              {errors['citizenshipStatus.naturalizedCitizen.alienRegistrationNumber'] && (
                <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.naturalizedCitizen.alienRegistrationNumber']}</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Form for "Derived" status
  const renderDerivedCitizenshipForm = () => {
    const derived = getSubsection('derivedCitizen');

    return (
      <div className="border rounded-lg p-5 bg-gray-50 space-y-4">
        <h3 className="text-lg font-semibold mb-4">Derived Citizenship Information</h3>

        {/* Document Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="alien-registration-number"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Alien Registration Number
            </label>
            <input
              type="text"
              id="alien-registration-number"
              data-testid="alien-registration-number-input"
              value={getFieldValue(derived, 'alienRegistrationNumber', '')}
              onChange={(e) => updateDerivedInfo('alienRegistrationNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter alien registration number"
            />
          </div>
          <div>
            <label
              htmlFor="permanent-resident-card-number"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Permanent Resident Card Number
            </label>
            <input
              type="text"
              id="permanent-resident-card-number"
              data-testid="permanent-resident-card-number-input"
              value={getFieldValue(derived, 'permanentResidentCardNumber', '')}
              onChange={(e) => updateDerivedInfo('permanentResidentCardNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter permanent resident card number"
            />
          </div>
          <div>
            <label
              htmlFor="derived-certificate-number"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Certificate of Citizenship Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="derived-certificate-number"
              data-testid="derived-certificate-number-input"
              value={getFieldValue(derived, 'certificateOfCitizenshipNumber', '')}
              onChange={(e) => updateDerivedInfo('certificateOfCitizenshipNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter certificate number"
              required
            />
            {errors['citizenshipStatus.derived.certificateNumber'] && (
              <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.derived.certificateNumber']}</p>
            )}
          </div>
        </div>

        {/* Name on Document */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Name on Document</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="derived-first-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="derived-first-name"
                data-testid="derived-first-name-input"
                value={getNestedFieldValue(derived, 'nameOnDocument.firstName', '')}
                onChange={(e) => updateFieldValue('derivedCitizen.nameOnDocument.firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <label
                htmlFor="derived-middle-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Middle Name
              </label>
              <input
                type="text"
                id="derived-middle-name"
                data-testid="derived-middle-name-input"
                value={getNestedFieldValue(derived, 'nameOnDocument.middleName', '')}
                onChange={(e) => updateFieldValue('derivedCitizen.nameOnDocument.middleName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter middle name"
              />
            </div>
            <div>
              <label
                htmlFor="derived-last-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="derived-last-name"
                data-testid="derived-last-name-input"
                value={getNestedFieldValue(derived, 'nameOnDocument.lastName', '')}
                onChange={(e) => updateFieldValue('derivedCitizen.nameOnDocument.lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter last name"
                required
              />
            </div>
            <div>
              <label
                htmlFor="derived-suffix"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Suffix
              </label>
              <select
                id="derived-suffix"
                data-testid="derived-suffix-select"
                value={getNestedFieldValue(derived, 'nameOnDocument.suffix', '')}
                onChange={(e) => updateFieldValue('derivedCitizen.nameOnDocument.suffix', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {getSuffixOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
            value={getFieldValue(derived, 'basis', '')}
            onChange={(e) => updateDerivedInfo('basis', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select basis</option>
            <option value="By operation of law through my U.S. citizen parent">
              By operation of law through my U.S. citizen parent
            </option>
            <option value="Other">Other (Provide explanation)</option>
          </select>
          {errors['citizenshipStatus.derived.basis'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.derived.basis']}</p>
          )}
        </div>

        {/* Other Basis (if applicable) */}
        {getFieldValue(derived, 'basis', '') === 'Other' && (
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
              value={getFieldValue(derived, 'otherExplanation', '')}
              onChange={(e) => updateDerivedInfo('otherExplanation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Specify basis"
              required
            />
            {errors['citizenshipStatus.derived.otherExplanation'] && (
              <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.derived.otherExplanation']}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Form for "Non-US Citizen" status
  const renderNonUSCitizenForm = () => {
    const nonUSCitizen = getSubsection('nonUSCitizen');

    return (
      <div className="border rounded-lg p-5 bg-gray-50 space-y-4">
        <h3 className="text-lg font-semibold mb-4">Non-U.S. Citizen Information</h3>

        {/* Residence Status */}
        <div>
          <label
            htmlFor="residence-status"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Residence Status
          </label>
          <input
            type="text"
            id="residence-status"
            data-testid="residence-status-input"
            value={getFieldValue(nonUSCitizen, 'residenceStatus', '')}
            onChange={(e) => updateNonUSCitizenInfo('residenceStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter residence status"
          />
          {errors['citizenshipStatus.nonUSCitizen.residenceStatus'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.nonUSCitizen.residenceStatus']}</p>
          )}
        </div>

        {/* Entry Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Entry Information</h4>

          {/* Entry Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="entry-date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Entry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="entry-date"
                data-testid="entry-date-input"
                value={getFieldValue(nonUSCitizen, 'entryDate', '')}
                onChange={(e) => updateNonUSCitizenInfo('entryDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="MM/DD/YYYY"
                required
              />
              {errors['citizenshipStatus.nonUSCitizen.entryDate'] && (
                <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.nonUSCitizen.entryDate']}</p>
              )}
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="entry-date-estimated"
                data-testid="entry-date-estimated-checkbox"
                checked={getFieldValue(nonUSCitizen, 'isEntryDateEstimated', false)}
                onChange={(e) => updateNonUSCitizenInfo('isEntryDateEstimated', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="entry-date-estimated" className="ml-2 block text-sm text-gray-700">
                Entry Date Estimated
              </label>
            </div>
          </div>

          {/* Entry Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="entry-city"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Entry City
              </label>
              <input
                type="text"
                id="entry-city"
                data-testid="entry-city-input"
                value={getFieldValue(nonUSCitizen, 'entryCity', '')}
                onChange={(e) => updateNonUSCitizenInfo('entryCity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter entry city"
              />
            </div>
            <div>
              <label
                htmlFor="entry-state"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Entry State
              </label>
              <select
                id="entry-state"
                data-testid="entry-state-select"
                value={getFieldValue(nonUSCitizen, 'entryState', '')}
                onChange={(e) => updateNonUSCitizenInfo('entryState', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {getUSStateOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Alien Registration Number */}
        <div>
          <label
            htmlFor="alien-registration-number"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Alien Registration Number
          </label>
          <input
            type="text"
            id="alien-registration-number"
            data-testid="alien-registration-number-input"
            value={getFieldValue(nonUSCitizen, 'alienRegistrationNumber', '')}
            onChange={(e) => updateNonUSCitizenInfo('alienRegistrationNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter alien registration number"
          />
          {errors['citizenshipStatus.nonUSCitizen.alienRegistrationNumber'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.nonUSCitizen.alienRegistrationNumber']}</p>
          )}
        </div>

        {/* Document Number */}
        <div>
          <label
            htmlFor="non-us-document-number"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Document Number
          </label>
          <input
            type="text"
            id="non-us-document-number"
            data-testid="non-us-document-number-input"
            value={getFieldValue(nonUSCitizen, 'documentNumber', '')}
            onChange={(e) => updateNonUSCitizenInfo('documentNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter document number"
          />
          {errors['citizenshipStatus.nonUSCitizen.documentNumber'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.nonUSCitizen.documentNumber']}</p>
          )}
        </div>

        {/* Document Expiration Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="non-us-expiration-date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Document Expiration Date
            </label>
            <input
              type="text"
              id="non-us-expiration-date"
              data-testid="non-us-expiration-date-input"
              value={getFieldValue(nonUSCitizen, 'documentExpirationDate', '')}
              onChange={(e) => updateNonUSCitizenInfo('documentExpirationDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="MM/DD/YYYY"
            />
            {errors['citizenshipStatus.nonUSCitizen.documentExpirationDate'] && (
              <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.nonUSCitizen.documentExpirationDate']}</p>
            )}
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="doc-expiration-estimated"
              data-testid="doc-expiration-estimated-checkbox"
              checked={getFieldValue(nonUSCitizen, 'isDocumentExpirationEstimated', false)}
              onChange={(e) => updateNonUSCitizenInfo('isDocumentExpirationEstimated', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="doc-expiration-estimated" className="ml-2 block text-sm text-gray-700">
              Expiration Date Estimated
            </label>
          </div>
        </div>

        {/* Name on Document */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Name on Document</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="non-us-first-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                First Name
              </label>
              <input
                type="text"
                id="non-us-first-name"
                data-testid="non-us-first-name-input"
                value={getNestedFieldValue(nonUSCitizen, 'nameOnDocument.firstName', '')}
                onChange={(e) => updateFieldValue('nonUSCitizen.nameOnDocument.firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label
                htmlFor="non-us-middle-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Middle Name
              </label>
              <input
                type="text"
                id="non-us-middle-name"
                data-testid="non-us-middle-name-input"
                value={getNestedFieldValue(nonUSCitizen, 'nameOnDocument.middleName', '')}
                onChange={(e) => updateFieldValue('nonUSCitizen.nameOnDocument.middleName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter middle name"
              />
            </div>
            <div>
              <label
                htmlFor="non-us-last-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Last Name
              </label>
              <input
                type="text"
                id="non-us-last-name"
                data-testid="non-us-last-name-input"
                value={getNestedFieldValue(nonUSCitizen, 'nameOnDocument.lastName', '')}
                onChange={(e) => updateFieldValue('nonUSCitizen.nameOnDocument.lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter last name"
              />
            </div>
            <div>
              <label
                htmlFor="non-us-suffix"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Suffix
              </label>
              <select
                id="non-us-suffix"
                data-testid="non-us-suffix-select"
                value={getNestedFieldValue(nonUSCitizen, 'nameOnDocument.suffix', '')}
                onChange={(e) => updateFieldValue('nonUSCitizen.nameOnDocument.suffix', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {getSuffixOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Alien Registration */}
        <div>
          <label
            htmlFor="has-alien-registration"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Do you have an Alien Registration? <span className="text-red-500">*</span>
          </label>
          <select
            id="has-alien-registration"
            data-testid="has-alien-registration-select"
            value={getFieldValue(nonUSCitizen, 'hasAlienRegistration', '')}
            onChange={(e) => updateNonUSCitizenInfo('hasAlienRegistration', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select answer</option>
            <option value="1">Yes</option>
            <option value="2">No</option>
            <option value="3">Unknown</option>
            <option value="4">Not Applicable</option>
            <option value="5">Other</option>
          </select>
          {errors['citizenshipStatus.nonUSCitizen.hasAlienRegistration'] && (
            <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.nonUSCitizen.hasAlienRegistration']}</p>
          )}
        </div>

        {/* Explanation (if needed) */}
        {(getFieldValue(nonUSCitizen, 'hasAlienRegistration', '') === '5' ||
          getFieldValue(nonUSCitizen, 'hasAlienRegistration', '') === '3') && (
          <div>
            <label
              htmlFor="alien-registration-explanation"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Explanation <span className="text-red-500">*</span>
            </label>
            <textarea
              id="alien-registration-explanation"
              data-testid="alien-registration-explanation-input"
              value={getFieldValue(nonUSCitizen, 'explanation', '')}
              onChange={(e) => updateNonUSCitizenInfo('explanation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Provide explanation"
              rows={3}
              required
            />
            {errors['citizenshipStatus.nonUSCitizen.explanation'] && (
              <p className="mt-1 text-sm text-red-600">{errors['citizenshipStatus.nonUSCitizen.explanation']}</p>
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
            onChange={(e) => {
              // console.log(`🎯 Section9Component: Citizenship status changed to:`, e.target.value);
              updateCitizenshipStatus(e.target.value as any);
            }}
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
              onClick={() => {
                // console.log('🧹 Section9Component: Clear section button clicked!');
                resetSection();
                // console.log('✅ Section9Component: Reset section completed!');
              }}
            >
              Clear Section
            </button>
          </div>
        </div>

        {/* Validation Status */}
     
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