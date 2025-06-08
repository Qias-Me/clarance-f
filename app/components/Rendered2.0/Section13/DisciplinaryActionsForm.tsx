/**
 * Disciplinary Actions Form Component (Section 13A.6)
 * 
 * Handles disciplinary actions including:
 * - Written warnings
 * - Warning dates and reasons
 * - Multiple disciplinary incidents
 */

import React, { useState, useCallback } from 'react';
import { useSection13 } from '~/state/contexts/sections2.0/section13';
import type { DisciplinaryActions } from '../../../../api/interfaces/sections2.0/section13';

export interface DisciplinaryActionsFormProps {
  onValidationChange?: (isValid: boolean) => void;
  disabled?: boolean;
}

const DisciplinaryActionsForm: React.FC<DisciplinaryActionsFormProps> = ({
  onValidationChange,
  disabled = false
}) => {
  const { sectionData, updateFieldValue } = useSection13();
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const disciplinaryActions = sectionData.section13.disciplinaryActions;

  const handleFieldUpdate = useCallback((fieldPath: string, value: any) => {
    console.log(`🔄 DisciplinaryActionsForm: Updating ${fieldPath} = ${value}`);
    updateFieldValue(`section13.disciplinaryActions.${fieldPath}`, value);
    
    // Clear related error
    if (localErrors[fieldPath]) {
      setLocalErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldPath];
        return newErrors;
      });
    }
  }, [updateFieldValue, localErrors]);

  const validateField = useCallback((fieldPath: string, value: any): string | null => {
    if (fieldPath.includes('Date') && value) {
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        return 'Date must be in MM/DD/YYYY format';
      }
    }
    
    if (fieldPath.includes('Reason') && value && value.length > 500) {
      return 'Reason must be 500 characters or less';
    }
    
    return null;
  }, []);

  const handleBlur = useCallback((fieldPath: string, value: any) => {
    const error = validateField(fieldPath, value);
    if (error) {
      setLocalErrors(prev => ({ ...prev, [fieldPath]: error }));
    }
  }, [validateField]);

  const warningFields = [
    { id: 1, dateField: 'warningDate1', reasonField: 'warningReason1' },
    { id: 2, dateField: 'warningDate2', reasonField: 'warningReason2' },
    { id: 3, dateField: 'warningDate3', reasonField: 'warningReason3' },
    { id: 4, dateField: 'warningDate4', reasonField: 'warningReason4' }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Section 13A.6: Disciplinary Actions
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Report any disciplinary actions taken against you during your employment history.
        </p>
      </div>

      {/* Main Question */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="receivedWrittenWarning"
            checked={disciplinaryActions.receivedWrittenWarning?.value || false}
            onChange={(e) => handleFieldUpdate('receivedWrittenWarning', e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="receivedWrittenWarning" className="text-sm font-medium text-gray-700">
            Have you ever received a written warning, been officially reprimanded, suspended, or disciplined for misconduct in the workplace?
          </label>
        </div>

        {disciplinaryActions.receivedWrittenWarning?.value && (
          <div className="ml-7 space-y-6 p-6 bg-gray-50 rounded-lg">
            <div className="mb-4">
              <h4 className="text-md font-semibold text-gray-900 mb-2">
                Disciplinary Action Details
              </h4>
              <p className="text-sm text-gray-600">
                Provide details for each disciplinary action. You can report up to 4 separate incidents.
              </p>
            </div>

            {warningFields.map((warning) => {
              const hasDate = disciplinaryActions[warning.dateField as keyof DisciplinaryActions]?.value;
              const hasReason = disciplinaryActions[warning.reasonField as keyof DisciplinaryActions]?.value;
              const isActive = hasDate || hasReason;

              return (
                <div key={warning.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-gray-800">
                      Disciplinary Action #{warning.id}
                    </h5>
                    {isActive && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date Field */}
                    <div>
                      <label 
                        htmlFor={warning.dateField} 
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Date of Disciplinary Action
                      </label>
                      <input
                        type="text"
                        id={warning.dateField}
                        placeholder="MM/DD/YYYY"
                        value={disciplinaryActions[warning.dateField as keyof DisciplinaryActions]?.value || ''}
                        onChange={(e) => handleFieldUpdate(warning.dateField, e.target.value)}
                        onBlur={(e) => handleBlur(warning.dateField, e.target.value)}
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {localErrors[warning.dateField] && (
                        <p className="text-red-600 text-xs mt-1">{localErrors[warning.dateField]}</p>
                      )}
                    </div>

                    {/* Clear button for this entry */}
                    <div className="flex items-end">
                      {isActive && (
                        <button
                          type="button"
                          onClick={() => {
                            handleFieldUpdate(warning.dateField, '');
                            handleFieldUpdate(warning.reasonField, '');
                          }}
                          disabled={disabled}
                          className="px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        >
                          Clear Entry
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reason Field */}
                  <div>
                    <label 
                      htmlFor={warning.reasonField} 
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Reason for Disciplinary Action
                    </label>
                    <textarea
                      id={warning.reasonField}
                      rows={3}
                      placeholder="Describe the reason for the disciplinary action, the nature of the misconduct, and any relevant circumstances..."
                      value={disciplinaryActions[warning.reasonField as keyof DisciplinaryActions]?.value || ''}
                      onChange={(e) => handleFieldUpdate(warning.reasonField, e.target.value)}
                      onBlur={(e) => handleBlur(warning.reasonField, e.target.value)}
                      disabled={disabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {localErrors[warning.reasonField] && (
                      <p className="text-red-600 text-xs mt-1">{localErrors[warning.reasonField]}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {(disciplinaryActions[warning.reasonField as keyof DisciplinaryActions]?.value || '').length}/500 characters
                    </p>
                  </div>

                  {warning.id < warningFields.length && (
                    <hr className="border-gray-200" />
                  )}
                </div>
              );
            })}

            {/* Summary */}
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
              <h5 className="text-sm font-medium text-gray-800 mb-2">Summary</h5>
              <div className="text-sm text-gray-600">
                {(() => {
                  const activeEntries = warningFields.filter(warning => 
                    disciplinaryActions[warning.dateField as keyof DisciplinaryActions]?.value ||
                    disciplinaryActions[warning.reasonField as keyof DisciplinaryActions]?.value
                  );
                  
                  if (activeEntries.length === 0) {
                    return <p>No disciplinary actions entered yet.</p>;
                  }
                  
                  return (
                    <p>
                      {activeEntries.length} disciplinary action{activeEntries.length !== 1 ? 's' : ''} reported.
                    </p>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legacy array fields for backward compatibility */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-gray-900">
          Additional Warning Information
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="legacyWarningDates" className="block text-sm font-medium text-gray-700 mb-1">
              Warning Dates (Legacy Format)
            </label>
            <input
              type="text"
              id="legacyWarningDates"
              placeholder="Enter dates separated by commas"
              value={disciplinaryActions.warningDates?.value?.join(', ') || ''}
              onChange={(e) => {
                const dates = e.target.value.split(',').map(d => d.trim()).filter(d => d);
                handleFieldUpdate('warningDates', dates);
              }}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="legacyWarningReasons" className="block text-sm font-medium text-gray-700 mb-1">
              Warning Reasons (Legacy Format)
            </label>
            <input
              type="text"
              id="legacyWarningReasons"
              placeholder="Enter reasons separated by commas"
              value={disciplinaryActions.warningReasons?.value?.join(', ') || ''}
              onChange={(e) => {
                const reasons = e.target.value.split(',').map(r => r.trim()).filter(r => r);
                handleFieldUpdate('warningReasons', reasons);
              }}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Help text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">Reporting Requirements</p>
            <p className="text-blue-700">
              Report all disciplinary actions, including verbal warnings that were documented, 
              written reprimands, suspensions, demotions, or terminations. Include actions 
              taken by supervisors, HR departments, or management at any level.
            </p>
          </div>
        </div>
      </div>

      {/* Additional guidance */}
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-yellow-800 mb-1">Important</p>
            <p className="text-yellow-700">
              Even if disciplinary actions were later overturned, expunged, or you disagreed with them,
              you must still report them. Failure to disclose known disciplinary actions may result
              in denial of your security clearance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisciplinaryActionsForm;
