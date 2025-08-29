/**
 * EmploymentSection Component
 * 
 * Reusable component for different employment types in Section 13
 * Handles military, federal, non-federal, self-employment, and unemployment entries
 * Works with Field<T> structure from Section13 interfaces
 */

import React from 'react';

// Field interface from the Section13 types
interface Field<T> {
  id: string;
  value: T;
  label: string;
  name: string;
  required: boolean;
  section: number;
}

interface EmploymentEntry {
  _id?: string;
  employerName?: Field<string>;
  positionTitle?: Field<string>;
  employmentDates?: {
    fromDate?: Field<string>;
    toDate?: Field<string>;
    present?: Field<boolean>;
  };
  address?: {
    street?: Field<string>;
    city?: Field<string>;
    state?: Field<string>;
    zipCode?: Field<string>;
    country?: Field<string>;
  };
  supervisor?: {
    name?: Field<string>;
    title?: Field<string>;
    phone?: {
      number?: Field<string>;
      extension?: Field<string>;
    };
    email?: Field<string>;
  };
  reasonForLeaving?: Field<string>;
  additionalComments?: Field<string>;
  employmentType?: Field<string>;
  employmentStatus?: Field<string>;
  isGovernmentPosition?: Field<boolean>;
  securityClearance?: Field<string>;
  militaryRank?: Field<string>;
  dutyStation?: Field<string>;
  specializedTraining?: Field<string>;
  otherExplanation?: Field<string>;
}

interface EmploymentSectionProps {
  title: string;
  description: string;
  entries: EmploymentEntry[];
  entryType: string;
  onAddEntry: () => void;
  onUpdateEntry: (index: number, field: string, value: string) => void;
  onRemoveEntry: (index: number) => void;
}

// Helper function to safely get field values
const getFieldValue = <T,>(field: Field<T> | undefined, defaultValue: T): T => {
  return field?.value ?? defaultValue;
};

export const EmploymentSection: React.FC<EmploymentSectionProps> = ({
  title,
  description,
  entries,
  entryType,
  onAddEntry,
  onUpdateEntry,
  onRemoveEntry
}) => {
  const renderEmploymentFields = (entry: EmploymentEntry, index: number) => {
    const updateField = (field: string, value: string | boolean) => {
      onUpdateEntry(index, field, value.toString());
    };

    return (
      <div key={index} className="border border-gray-300 rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h5 className="text-md font-semibold text-gray-800">
            Entry {index + 1}
          </h5>
          {entries.length > 1 && (
            <button
              type="button"
              onClick={() => onRemoveEntry(index)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Remove Entry
            </button>
          )}
        </div>

        {/* Basic Employment Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employer/Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={getFieldValue(entry.employerName, '')}
              onChange={(e) => updateField('employerName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter employer name"
              data-field-path={`section13.${entryType}.entries[${index}].employerName`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={getFieldValue(entry.positionTitle, '')}
              onChange={(e) => updateField('positionTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter position title"
              data-field-path={`section13.${entryType}.entries[${index}].positionTitle`}
              required
            />
          </div>
        </div>

        {/* Employment Dates */}
        <div className="border-t border-gray-200 pt-4">
          <h6 className="text-sm font-semibold text-gray-700 mb-3">Employment Dates</h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={getFieldValue(entry.employmentDates?.fromDate, '')}
                onChange={(e) => updateField('employmentDates.fromDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-field-path={`section13.${entryType}.entries[${index}].employmentDates.fromDate`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={getFieldValue(entry.employmentDates?.toDate, '')}
                onChange={(e) => updateField('employmentDates.toDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-field-path={`section13.${entryType}.entries[${index}].employmentDates.toDate`}
                disabled={getFieldValue(entry.employmentDates?.present, false)}
              />
              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={getFieldValue(entry.employmentDates?.present, false)}
                  onChange={(e) => updateField('employmentDates.present', e.target.checked)}
                  className="mr-2"
                  data-field-path={`section13.${entryType}.entries[${index}].employmentDates.present`}
                />
                <span className="text-sm text-gray-600">Current position</span>
              </label>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="border-t border-gray-200 pt-4">
          <h6 className="text-sm font-semibold text-gray-700 mb-3">Employer Address</h6>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={getFieldValue(entry.address?.street, '')}
                onChange={(e) => updateField('address.street', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter street address"
                data-field-path={`section13.${entryType}.entries[${index}].address.street`}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={getFieldValue(entry.address?.city, '')}
                  onChange={(e) => updateField('address.city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter city"
                  data-field-path={`section13.${entryType}.entries[${index}].address.city`}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={getFieldValue(entry.address?.state, '')}
                  onChange={(e) => updateField('address.state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="State"
                  data-field-path={`section13.${entryType}.entries[${index}].address.state`}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={getFieldValue(entry.address?.zipCode, '')}
                  onChange={(e) => updateField('address.zipCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ZIP"
                  data-field-path={`section13.${entryType}.entries[${index}].address.zipCode`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                value={getFieldValue(entry.address?.country, 'United States')}
                onChange={(e) => updateField('address.country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-field-path={`section13.${entryType}.entries[${index}].address.country`}
              >
                <option value="United States">United States</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Supervisor Information */}
        <div className="border-t border-gray-200 pt-4">
          <h6 className="text-sm font-semibold text-gray-700 mb-3">Supervisor Information</h6>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supervisor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={getFieldValue(entry.supervisor?.name, '')}
                  onChange={(e) => updateField('supervisor.name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter supervisor name"
                  data-field-path={`section13.${entryType}.entries[${index}].supervisor.name`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supervisor Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={getFieldValue(entry.supervisor?.title, '')}
                  onChange={(e) => updateField('supervisor.title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter supervisor title"
                  data-field-path={`section13.${entryType}.entries[${index}].supervisor.title`}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={getFieldValue(entry.supervisor?.phone?.number, '')}
                  onChange={(e) => updateField('supervisor.phone.number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Phone number"
                  data-field-path={`section13.${entryType}.entries[${index}].supervisor.phone.number`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Extension
                </label>
                <input
                  type="text"
                  value={getFieldValue(entry.supervisor?.phone?.extension, '')}
                  onChange={(e) => updateField('supervisor.phone.extension', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ext."
                  data-field-path={`section13.${entryType}.entries[${index}].supervisor.phone.extension`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={getFieldValue(entry.supervisor?.email, '')}
                  onChange={(e) => updateField('supervisor.email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Email address"
                  data-field-path={`section13.${entryType}.entries[${index}].supervisor.email`}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Type-specific fields */}
        {entryType === 'militaryEmployment' && (
          <div className="border-t border-gray-200 pt-4">
            <h6 className="text-sm font-semibold text-gray-700 mb-3">Military Information</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Military Rank
                </label>
                <input
                  type="text"
                  value={getFieldValue(entry.militaryRank, '')}
                  onChange={(e) => updateField('militaryRank', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter military rank"
                  data-field-path={`section13.${entryType}.entries[${index}].militaryRank`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duty Station
                </label>
                <input
                  type="text"
                  value={getFieldValue(entry.dutyStation, '')}
                  onChange={(e) => updateField('dutyStation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter duty station"
                  data-field-path={`section13.${entryType}.entries[${index}].dutyStation`}
                />
              </div>
            </div>
          </div>
        )}

        {entryType === 'federalEmployment' && (
          <div className="border-t border-gray-200 pt-4">
            <h6 className="text-sm font-semibold text-gray-700 mb-3">Federal Employment Information</h6>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={getFieldValue(entry.isGovernmentPosition, false)}
                  onChange={(e) => updateField('isGovernmentPosition', e.target.checked)}
                  className="mr-2"
                  data-field-path={`section13.${entryType}.entries[${index}].isGovernmentPosition`}
                />
                <span className="text-sm text-gray-600">Government position requiring security clearance</span>
              </label>

              {getFieldValue(entry.isGovernmentPosition, false) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Security Clearance Level
                  </label>
                  <select
                    value={getFieldValue(entry.securityClearance, '')}
                    onChange={(e) => updateField('securityClearance', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    data-field-path={`section13.${entryType}.entries[${index}].securityClearance`}
                  >
                    <option value="">Select clearance level</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Secret">Secret</option>
                    <option value="Top Secret">Top Secret</option>
                    <option value="Top Secret/SCI">Top Secret/SCI</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="border-t border-gray-200 pt-4">
          <h6 className="text-sm font-semibold text-gray-700 mb-3">Additional Information</h6>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Leaving
              </label>
              <textarea
                value={getFieldValue(entry.reasonForLeaving, '')}
                onChange={(e) => updateField('reasonForLeaving', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe reason for leaving this position"
                rows={2}
                data-field-path={`section13.${entryType}.entries[${index}].reasonForLeaving`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Comments
              </label>
              <textarea
                value={getFieldValue(entry.additionalComments, '')}
                onChange={(e) => updateField('additionalComments', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional comments or explanations"
                rows={2}
                data-field-path={`section13.${entryType}.entries[${index}].additionalComments`}
              />
            </div>

            {entry.otherExplanation && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Explanation
                </label>
                <textarea
                  value={getFieldValue(entry.otherExplanation, '')}
                  onChange={(e) => updateField('otherExplanation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Provide explanation for 'Other' selection"
                  rows={2}
                  data-field-path={`section13.${entryType}.entries[${index}].otherExplanation`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border-2 border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-md font-semibold text-gray-800">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <button
          type="button"
          onClick={onAddEntry}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          Add Entry
        </button>
      </div>

      <div className="space-y-6">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No {title.toLowerCase()} entries yet.</p>
            <p className="text-sm">Click "Add Entry" to get started.</p>
          </div>
        ) : (
          entries.map((entry, index) => renderEmploymentFields(entry, index))
        )}
      </div>
    </div>
  );
};

export default EmploymentSection;