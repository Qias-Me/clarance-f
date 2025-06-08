/**
 * Section 18.3 - Contact Information and Foreign Relations Component
 * 
 * Renders contact methods, frequency, employment info, and foreign government relations
 * for non-US citizen relatives with foreign addresses.
 */

import React from 'react';
import type { RelativeEntry } from '../../../../api/interfaces/sections2.0/Section18';

interface Section18_3Props {
  relative: RelativeEntry;
  onFieldUpdate: (fieldPath: string, value: any) => void;
  className?: string;
}

export const Section18_3Component: React.FC<Section18_3Props> = ({
  relative,
  onFieldUpdate,
  className = ''
}) => {
  const section18_3 = relative.section18_3;

  const handleFieldChange = (fieldPath: string, value: any) => {
    onFieldUpdate(fieldPath, value);
  };

  const handleCheckboxChange = (fieldPath: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFieldChange(fieldPath, event.target.checked);
  };

  const handleInputChange = (fieldPath: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    handleFieldChange(fieldPath, event.target.value);
  };

  return (
    <div className={`section18-3-component space-y-8 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          18.3 - Contact Information and Foreign Relations
        </h4>
        
        <p className="text-sm text-gray-600 mb-6">
          Complete the following if the relative listed is a non-US citizen with a foreign address.
          Provide information about contact methods, frequency, employment, and any foreign government relations.
        </p>

        {/* Applicability Checkbox */}
        <div className="mb-8">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={section18_3.isApplicable.value || false}
              onChange={handleCheckboxChange('isApplicable')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              This section applies to this relative (non-US citizen with foreign address)
            </span>
          </label>
        </div>

        {/* Contact Information Section */}
        {section18_3.isApplicable.value && (
          <>
            {/* Contact Methods */}
            <div className="space-y-6">
              <div>
                <h5 className="text-md font-medium text-gray-800 mb-4">
                  Contact Methods
                </h5>
                <p className="text-sm text-gray-600 mb-4">
                  Select all methods by which you have contact with this relative:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={section18_3.contactMethods.inPerson.value || false}
                      onChange={handleCheckboxChange('contactMethods.inPerson')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">In Person</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={section18_3.contactMethods.telephone.value || false}
                      onChange={handleCheckboxChange('contactMethods.telephone')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Telephone</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={section18_3.contactMethods.electronic.value || false}
                      onChange={handleCheckboxChange('contactMethods.electronic')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Electronic (Email, Internet)</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={section18_3.contactMethods.writtenCorrespondence.value || false}
                      onChange={handleCheckboxChange('contactMethods.writtenCorrespondence')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Written Correspondence</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={section18_3.contactMethods.other.value || false}
                      onChange={handleCheckboxChange('contactMethods.other')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Other</span>
                  </label>
                </div>

                {/* Other Contact Method Explanation */}
                {section18_3.contactMethods.other.value && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Explain other contact method:
                    </label>
                    <input
                      type="text"
                      value={section18_3.contactMethods.otherExplanation.value || ''}
                      onChange={handleInputChange('contactMethods.otherExplanation')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the other contact method"
                    />
                  </div>
                )}
              </div>

              {/* Contact Frequency */}
              <div>
                <h5 className="text-md font-medium text-gray-800 mb-4">
                  Contact Frequency
                </h5>
                <p className="text-sm text-gray-600 mb-4">
                  How often do you have contact with this relative?
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={section18_3.contactFrequency.daily.value || false}
                      onChange={handleCheckboxChange('contactFrequency.daily')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Daily</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={section18_3.contactFrequency.weekly.value || false}
                      onChange={handleCheckboxChange('contactFrequency.weekly')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Weekly</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={section18_3.contactFrequency.monthly.value || false}
                      onChange={handleCheckboxChange('contactFrequency.monthly')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Monthly</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={section18_3.contactFrequency.quarterly.value || false}
                      onChange={handleCheckboxChange('contactFrequency.quarterly')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Quarterly</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={section18_3.contactFrequency.annually.value || false}
                      onChange={handleCheckboxChange('contactFrequency.annually')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Annually</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={section18_3.contactFrequency.other.value || false}
                      onChange={handleCheckboxChange('contactFrequency.other')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Other</span>
                  </label>
                </div>

                {/* Other Frequency Explanation */}
                {section18_3.contactFrequency.other.value && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Explain other frequency:
                    </label>
                    <input
                      type="text"
                      value={section18_3.contactFrequency.otherExplanation.value || ''}
                      onChange={handleInputChange('contactFrequency.otherExplanation')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the contact frequency"
                    />
                  </div>
                )}
              </div>

              {/* Employment Information */}
              <div>
                <h5 className="text-md font-medium text-gray-800 mb-4">
                  Employment Information
                </h5>
                <p className="text-sm text-gray-600 mb-4">
                  Provide information about your relative's current employment:
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employer Name
                    </label>
                    <input
                      type="text"
                      value={section18_3.employmentInfo.employerName.value || ''}
                      onChange={handleInputChange('employmentInfo.employerName')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter employer name"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={section18_3.employmentInfo.dontKnowEmployer.value || false}
                        onChange={handleCheckboxChange('employmentInfo.dontKnowEmployer')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">I don't know the employer</span>
                    </label>
                  </div>

                  {/* Employer Address */}
                  {!section18_3.employmentInfo.dontKnowEmployer.value && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <h6 className="text-sm font-medium text-gray-800">
                        Employer Address
                      </h6>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={section18_3.employmentInfo.employerAddress.street.value || ''}
                          onChange={handleInputChange('employmentInfo.employerAddress.street')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter street address"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={section18_3.employmentInfo.employerAddress.city.value || ''}
                            onChange={handleInputChange('employmentInfo.employerAddress.city')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter city"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <select
                            value={section18_3.employmentInfo.employerAddress.country.value || ''}
                            onChange={handleInputChange('employmentInfo.employerAddress.country')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select country</option>
                            {section18_3.employmentInfo.employerAddress.country.options?.map((country) => (
                              <option key={country} value={country}>
                                {country}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={section18_3.employmentInfo.employerAddress.dontKnowAddress.value || false}
                            onChange={handleCheckboxChange('employmentInfo.employerAddress.dontKnowAddress')}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">I don't know the address</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Foreign Government Relations */}
              <div>
                <h5 className="text-md font-medium text-gray-800 mb-4">
                  Foreign Government Relations
                </h5>
                <p className="text-sm text-gray-600 mb-4">
                  Does your relative have any affiliation with a foreign government?
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foreign government affiliation:
                    </label>
                    <div className="space-y-2">
                      <label className="inline-flex items-center mr-6">
                        <input
                          type="radio"
                          name={`foreignGovRelations_${relative.entryNumber}`}
                          value="YES"
                          checked={section18_3.foreignGovernmentRelations.hasRelations.value === 'YES'}
                          onChange={handleInputChange('foreignGovernmentRelations.hasRelations')}
                          className="form-radio text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Yes</span>
                      </label>
                      <label className="inline-flex items-center mr-6">
                        <input
                          type="radio"
                          name={`foreignGovRelations_${relative.entryNumber}`}
                          value="NO"
                          checked={section18_3.foreignGovernmentRelations.hasRelations.value === 'NO'}
                          onChange={handleInputChange('foreignGovernmentRelations.hasRelations')}
                          className="form-radio text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">No</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name={`foreignGovRelations_${relative.entryNumber}`}
                          value="I don't know"
                          checked={section18_3.foreignGovernmentRelations.hasRelations.value === "I don't know"}
                          onChange={handleInputChange('foreignGovernmentRelations.hasRelations')}
                          className="form-radio text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">I don't know</span>
                      </label>
                    </div>
                  </div>

                  {/* Description for foreign government relations */}
                  {section18_3.foreignGovernmentRelations.hasRelations.value === 'YES' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Describe the foreign government affiliation:
                      </label>
                      <textarea
                        value={section18_3.foreignGovernmentRelations.description.value || ''}
                        onChange={handleInputChange('foreignGovernmentRelations.description')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Provide details about the foreign government affiliation"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Dates */}
              <div>
                <h5 className="text-md font-medium text-gray-800 mb-4">
                  Contact Dates
                </h5>
                <p className="text-sm text-gray-600 mb-4">
                  Provide information about when you first and last had contact with this relative:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Contact */}
                  <div className="space-y-3">
                    <h6 className="text-sm font-medium text-gray-800">First Contact</h6>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date (MM/YYYY)
                      </label>
                      <input
                        type="text"
                        value={section18_3.contactDates.firstContact.date.value || ''}
                        onChange={handleInputChange('contactDates.firstContact.date')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="MM/YYYY"
                      />
                    </div>
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={section18_3.contactDates.firstContact.isEstimate.value || false}
                          onChange={handleCheckboxChange('contactDates.firstContact.isEstimate')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Estimated</span>
                      </label>
                    </div>
                  </div>

                  {/* Last Contact */}
                  <div className="space-y-3">
                    <h6 className="text-sm font-medium text-gray-800">Last Contact</h6>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date (MM/YYYY)
                      </label>
                      <input
                        type="text"
                        value={section18_3.contactDates.lastContact.date.value || ''}
                        onChange={handleInputChange('contactDates.lastContact.date')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="MM/YYYY"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={section18_3.contactDates.lastContact.isEstimate.value || false}
                          onChange={handleCheckboxChange('contactDates.lastContact.isEstimate')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Estimated</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={section18_3.contactDates.lastContact.isPresent.value || false}
                          onChange={handleCheckboxChange('contactDates.lastContact.isPresent')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Present (ongoing contact)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Not Applicable Message */}
        {!section18_3.isApplicable.value && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              This section is not applicable for this relative. Check the box above if this relative is a
              non-US citizen with a foreign address and you need to provide contact information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Section18_3Component;
