/**
 * Section 18.2 - Current Address Component
 * 
 * Renders the current address subsection for living relatives.
 * Includes standard address fields and APO/FPO address handling.
 */

import React from 'react';
import type { RelativeEntry } from '../../../../api/interfaces/sections2.0/Section18';

interface Section18_2Props {
  relative: RelativeEntry;
  onFieldUpdate: (fieldPath: string, value: any) => void;
  className?: string;
}

export const Section18_2Component: React.FC<Section18_2Props> = ({
  relative,
  onFieldUpdate,
  className = ''
}) => {
  const section18_2 = relative.section18_2;

  const handleFieldChange = (fieldPath: string, value: any) => {
    onFieldUpdate(fieldPath, value);
  };

  const handleCheckboxChange = (fieldPath: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFieldChange(fieldPath, event.target.checked);
  };

  const handleInputChange = (fieldPath: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    handleFieldChange(fieldPath, event.target.value);
  };

  return (
    <div className={`section18-2-component space-y-6 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          18.2 - Current Address
        </h4>
        
        <p className="text-sm text-gray-600 mb-6">
          Complete the following if the relative listed is your Mother, Father, Stepmother, Stepfather, Foster parent, 
          Child (including adopted/foster), Stepchild, Brother, Sister, Stepbrother, Stepsister, Half-brother, 
          Half-sister, Father-in-law, Mother-in-law, Guardian and is not deceased.
        </p>

        {/* Applicability Checkbox */}
        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={section18_2.isApplicable.value || false}
              onChange={handleCheckboxChange('isApplicable')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              This section applies to this relative (not deceased)
            </span>
          </label>
        </div>

        {/* Current Address Section */}
        {section18_2.isApplicable.value && (
          <>
            <div className="space-y-4">
              <h5 className="text-md font-medium text-gray-800">
                Provide your relative's current address
              </h5>
              <p className="text-sm text-gray-600">
                Provide City and Country if outside the United States; otherwise, provide City, State, and Zip Code.
              </p>

              {/* Street Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={section18_2.currentAddress.street.value || ''}
                  onChange={handleInputChange('currentAddress.street')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter street address"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={section18_2.currentAddress.city.value || ''}
                  onChange={handleInputChange('currentAddress.city')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter city"
                />
              </div>

              {/* State and Country Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <select
                    value={section18_2.currentAddress.state.value || ''}
                    onChange={handleInputChange('currentAddress.state')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select state</option>
                    {section18_2.currentAddress.state.options?.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={section18_2.currentAddress.country.value || ''}
                    onChange={handleInputChange('currentAddress.country')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select country</option>
                    {section18_2.currentAddress.country.options?.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Zip Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code
                </label>
                <input
                  type="text"
                  value={section18_2.currentAddress.zipCode.value || ''}
                  onChange={handleInputChange('currentAddress.zipCode')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter zip code"
                />
              </div>
            </div>

            {/* APO/FPO Address Section */}
            <div className="mt-8 space-y-4">
              <h5 className="text-md font-medium text-gray-800">
                APO/FPO Address
              </h5>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Does your relative have an APO/FPO address?
                </label>
                <div className="space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`hasAPOFPO_${relative.entryNumber}`}
                      value="YES"
                      checked={section18_2.hasAPOFPOAddress.value === 'YES'}
                      onChange={handleInputChange('hasAPOFPOAddress')}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`hasAPOFPO_${relative.entryNumber}`}
                      value="NO"
                      checked={section18_2.hasAPOFPOAddress.value === 'NO'}
                      onChange={handleInputChange('hasAPOFPOAddress')}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>

              {/* APO/FPO Address Fields */}
              {section18_2.hasAPOFPOAddress.value === 'YES' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h6 className="text-sm font-medium text-gray-800">
                    Provide your relative's APO/FPO address
                  </h6>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={section18_2.apoFpoAddress.address.value || ''}
                      onChange={handleInputChange('apoFpoAddress.address')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter APO/FPO address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        APO or FPO
                      </label>
                      <input
                        type="text"
                        value={section18_2.apoFpoAddress.apoFpo.value || ''}
                        onChange={handleInputChange('apoFpoAddress.apoFpo')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="APO or FPO"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State Code
                      </label>
                      <select
                        value={section18_2.apoFpoAddress.stateCode.value || ''}
                        onChange={handleInputChange('apoFpoAddress.stateCode')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select state code</option>
                        {section18_2.apoFpoAddress.stateCode.options?.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        value={section18_2.apoFpoAddress.zipCode.value || ''}
                        onChange={handleInputChange('apoFpoAddress.zipCode')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter zip code"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Not Applicable Message */}
        {!section18_2.isApplicable.value && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              This section is not applicable for this relative. Check the box above if this relative is not deceased 
              and you need to provide their current address.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Section18_2Component;
