/**
 * Section 18.5 - Contact Information Component
 * 
 * Complete the following if the relative listed is your Mother, Father, Stepmother, Stepfather, 
 * Foster parent, Child (including adopted/foster), Stepchild, Brother, Sister, Stepbrother, 
 * Stepsister, Half-brother, Half-sister, Father-in-law, Mother-in-law, Guardian and is not 
 * a U.S. Citizen, has a foreign address and is not deceased.
 */

import React from 'react';
import type { RelativeEntry } from '../../../../api/interfaces/sections2.0/Section18';

interface Section18_5Props {
  relative: RelativeEntry;
  onFieldUpdate: (fieldPath: string, value: any) => void;
  className?: string;
}

export const Section18_5Component: React.FC<Section18_5Props> = ({
  relative,
  onFieldUpdate,
  className = ''
}) => {
  const section18_5 = relative.section18_5;

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
    <div className={`section18-5-component space-y-6 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          18.5 - Contact Information for Non-U.S. Citizens with Foreign Address
        </h4>
        
        <p className="text-sm text-gray-600 mb-6">
          Complete the following if the relative listed is your Mother, Father, Stepmother, Stepfather, Foster parent, 
          Child (including adopted/foster), Stepchild, Brother, Sister, Stepbrother, Stepsister, Half-brother, 
          Half-sister, Father-in-law, Mother-in-law, Guardian and is not a U.S. Citizen, has a foreign address and is not deceased.
        </p>

        {/* Contact Dates Section */}
        <div className="space-y-6">
          <h5 className="text-md font-medium text-gray-800">Contact Dates</h5>
          
          {/* First Contact Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provide approximate date of first contact (Month/Year)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={section18_5.firstContactDate.month.value || ''}
                  onChange={handleInputChange('firstContactDate.month')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="MM"
                  maxLength={2}
                />
                <input
                  type="text"
                  value={section18_5.firstContactDate.year.value || ''}
                  onChange={handleInputChange('firstContactDate.year')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="YYYY"
                  maxLength={4}
                />
              </div>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={section18_5.firstContactDateEstimated.value || false}
                  onChange={handleCheckboxChange('firstContactDateEstimated')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Est.</span>
              </label>
            </div>
          </div>

          {/* Last Contact Date */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provide approximate date of last contact (Month/Year)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={section18_5.lastContactDate.month.value || ''}
                  onChange={handleInputChange('lastContactDate.month')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="MM"
                  maxLength={2}
                />
                <input
                  type="text"
                  value={section18_5.lastContactDate.year.value || ''}
                  onChange={handleInputChange('lastContactDate.year')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="YYYY"
                  maxLength={4}
                />
              </div>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={section18_5.lastContactDatePresent.value || false}
                  onChange={handleCheckboxChange('lastContactDatePresent')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Present</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={section18_5.lastContactDateEstimated.value || false}
                  onChange={handleCheckboxChange('lastContactDateEstimated')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Est.</span>
              </label>
            </div>
          </div>
        </div>

        {/* Contact Methods Section */}
        <div className="space-y-4">
          <h5 className="text-md font-medium text-gray-800">
            Provide methods of contact (Check all that apply)
          </h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={section18_5.contactMethods.inPerson.value || false}
                  onChange={handleCheckboxChange('contactMethods.inPerson')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">In person</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={section18_5.contactMethods.telephone.value || false}
                  onChange={handleCheckboxChange('contactMethods.telephone')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Telephone</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={section18_5.contactMethods.electronic.value || false}
                  onChange={handleCheckboxChange('contactMethods.electronic')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Electronic (Such as e-mail, texting, chat rooms, etc)</span>
              </label>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={section18_5.contactMethods.writtenCorrespondence.value || false}
                  onChange={handleCheckboxChange('contactMethods.writtenCorrespondence')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Written correspondence</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={section18_5.contactMethods.other.value || false}
                  onChange={handleCheckboxChange('contactMethods.other')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Other (Provide explanation)</span>
              </label>
              
              {section18_5.contactMethods.other.value && (
                <div className="ml-6">
                  <input
                    type="text"
                    value={section18_5.contactMethods.otherExplanation.value || ''}
                    onChange={handleInputChange('contactMethods.otherExplanation')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide explanation"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Frequency Section */}
        <div className="space-y-4">
          <h5 className="text-md font-medium text-gray-800">
            Provide approximate frequency of contact
          </h5>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={section18_5.contactFrequency.daily.value || false}
                  onChange={handleCheckboxChange('contactFrequency.daily')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Daily</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={section18_5.contactFrequency.weekly.value || false}
                  onChange={handleCheckboxChange('contactFrequency.weekly')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Weekly</span>
              </label>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={section18_5.contactFrequency.monthly.value || false}
                  onChange={handleCheckboxChange('contactFrequency.monthly')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Monthly</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={section18_5.contactFrequency.quarterly.value || false}
                  onChange={handleCheckboxChange('contactFrequency.quarterly')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Quarterly</span>
              </label>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={section18_5.contactFrequency.annually.value || false}
                  onChange={handleCheckboxChange('contactFrequency.annually')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Annually</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={section18_5.contactFrequency.other.value || false}
                  onChange={handleCheckboxChange('contactFrequency.other')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Other (Provide explanation)</span>
              </label>
              
              {section18_5.contactFrequency.other.value && (
                <div className="ml-6">
                  <input
                    type="text"
                    value={section18_5.contactFrequency.otherExplanation.value || ''}
                    onChange={handleInputChange('contactFrequency.otherExplanation')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide explanation"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Employment Information Section */}
        <div className="space-y-4">
          <h5 className="text-md font-medium text-gray-800">
            Employment Information
          </h5>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provide name of current employer, or provide the name of their most recent employer if not currently employed (if known)
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={section18_5.employerName.value || ''}
                  onChange={handleInputChange('employerName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Employer name"
                />
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={section18_5.employerNameDontKnow.value || false}
                    onChange={handleCheckboxChange('employerNameDontKnow')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">I don't know</span>
                </label>
              </div>
            </div>

            {/* Employer Address */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Provide the address of current employer, or provide the address of their most recent employer if not currently employed.
                (Provide City and Country if outside the United States; otherwise, provide City, State and Zip Code)
              </label>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                  <input
                    type="text"
                    value={section18_5.employerAddress.street.value || ''}
                    onChange={handleInputChange('employerAddress.street')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={section18_5.employerAddress.city.value || ''}
                      onChange={handleInputChange('employerAddress.city')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <select
                      value={section18_5.employerAddress.state.value || ''}
                      onChange={handleInputChange('employerAddress.state')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select state</option>
                      {section18_5.employerAddress.state.options?.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                    <input
                      type="text"
                      value={section18_5.employerAddress.zipCode.value || ''}
                      onChange={handleInputChange('employerAddress.zipCode')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Zip code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select
                      value={section18_5.employerAddress.country.value || ''}
                      onChange={handleInputChange('employerAddress.country')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select country</option>
                      {section18_5.employerAddress.country.options?.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={section18_5.employerAddress.dontKnow.value || false}
                    onChange={handleCheckboxChange('employerAddress.dontKnow')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">I don't know</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Foreign Government Affiliation Section */}
        <div className="space-y-4">
          <h5 className="text-md font-medium text-gray-800">
            Foreign Government Affiliation
          </h5>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Is this relative affiliated with a foreign government, military, security, defense industry, foreign movement, or intelligence service?
              </label>
              <div className="space-x-4">
                {section18_5.foreignGovernmentAffiliation.options?.map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`foreignGovAffiliation_${relative.entryNumber}`}
                      value={option}
                      checked={section18_5.foreignGovernmentAffiliation.value === option}
                      onChange={handleInputChange('foreignGovernmentAffiliation')}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description Field */}
            {section18_5.foreignGovernmentAffiliation.value === 'YES' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Describe the relative's relationship with the foreign government, military, security, defense industry, foreign movement, or intelligence service.
                </label>
                <textarea
                  value={section18_5.foreignGovernmentDescription.value || ''}
                  onChange={handleInputChange('foreignGovernmentDescription')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide detailed description..."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section18_5Component;
