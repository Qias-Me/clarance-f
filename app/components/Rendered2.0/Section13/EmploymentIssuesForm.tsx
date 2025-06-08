/**
 * Employment Issues Form Component (Section 13A.5)
 * 
 * Handles employment record issues including:
 * - Being fired from a job
 * - Quitting after being told you would be fired
 * - Leaving by mutual agreement
 * - Charges or allegations
 * - Unsatisfactory performance
 */

import React, { useState, useCallback } from 'react';
import { useSection13 } from '~/state/contexts/sections2.0/section13';
import type { EmploymentRecordIssues } from '../../../../api/interfaces/sections2.0/section13';

export interface EmploymentIssuesFormProps {
  onValidationChange?: (isValid: boolean) => void;
  disabled?: boolean;
}

const EmploymentIssuesForm: React.FC<EmploymentIssuesFormProps> = ({
  onValidationChange,
  disabled = false
}) => {
  const { sectionData, updateFieldValue } = useSection13();
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const employmentIssues = sectionData.section13.employmentIssues;

  const handleFieldUpdate = useCallback((fieldPath: string, value: any) => {
    console.log(`🔄 EmploymentIssuesForm: Updating ${fieldPath} = ${value}`);
    updateFieldValue(`section13.employmentIssues.${fieldPath}`, value);
    
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
    switch (fieldPath) {
      case 'dateFired':
      case 'dateQuit':
      case 'dateMutualAgreement':
      case 'generalLeavingDate':
        if (value && !/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
          return 'Date must be in MM/DD/YYYY format';
        }
        break;
      case 'reasonForFiring':
      case 'reasonForQuitting':
      case 'reasonForLeaving':
      case 'chargesOrAllegations':
      case 'unsatisfactoryPerformanceReason':
        if (value && value.length > 500) {
          return 'Description must be 500 characters or less';
        }
        break;
    }
    return null;
  }, []);

  const handleBlur = useCallback((fieldPath: string, value: any) => {
    const error = validateField(fieldPath, value);
    if (error) {
      setLocalErrors(prev => ({ ...prev, [fieldPath]: error }));
    }
  }, [validateField]);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Section 13A.5: Employment Record Issues
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Report any employment-related issues from your employment history.
        </p>
      </div>

      {/* Fired from Job */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="wasFired"
            checked={employmentIssues.wasFired?.value || false}
            onChange={(e) => handleFieldUpdate('wasFired', e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="wasFired" className="text-sm font-medium text-gray-700">
            Have you ever been fired from a job?
          </label>
        </div>

        {employmentIssues.wasFired?.value && (
          <div className="ml-7 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dateFired" className="block text-sm font-medium text-gray-700 mb-1">
                  Date Fired
                </label>
                <input
                  type="text"
                  id="dateFired"
                  placeholder="MM/DD/YYYY"
                  value={employmentIssues.dateFired?.value || ''}
                  onChange={(e) => handleFieldUpdate('dateFired', e.target.value)}
                  onBlur={(e) => handleBlur('dateFired', e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {localErrors.dateFired && (
                  <p className="text-red-600 text-xs mt-1">{localErrors.dateFired}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="reasonForFiring" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Being Fired
              </label>
              <textarea
                id="reasonForFiring"
                rows={3}
                placeholder="Provide details about why you were fired..."
                value={employmentIssues.reasonForFiring?.value || ''}
                onChange={(e) => handleFieldUpdate('reasonForFiring', e.target.value)}
                onBlur={(e) => handleBlur('reasonForFiring', e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {localErrors.reasonForFiring && (
                <p className="text-red-600 text-xs mt-1">{localErrors.reasonForFiring}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quit After Being Told */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="quitAfterBeingTold"
            checked={employmentIssues.quitAfterBeingTold?.value || false}
            onChange={(e) => handleFieldUpdate('quitAfterBeingTold', e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="quitAfterBeingTold" className="text-sm font-medium text-gray-700">
            Have you ever quit a job after being told you would be fired?
          </label>
        </div>

        {employmentIssues.quitAfterBeingTold?.value && (
          <div className="ml-7 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dateQuit" className="block text-sm font-medium text-gray-700 mb-1">
                  Date Quit
                </label>
                <input
                  type="text"
                  id="dateQuit"
                  placeholder="MM/DD/YYYY"
                  value={employmentIssues.dateQuit?.value || ''}
                  onChange={(e) => handleFieldUpdate('dateQuit', e.target.value)}
                  onBlur={(e) => handleBlur('dateQuit', e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {localErrors.dateQuit && (
                  <p className="text-red-600 text-xs mt-1">{localErrors.dateQuit}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="reasonForQuitting" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Quitting
              </label>
              <textarea
                id="reasonForQuitting"
                rows={3}
                placeholder="Provide details about why you quit..."
                value={employmentIssues.reasonForQuitting?.value || ''}
                onChange={(e) => handleFieldUpdate('reasonForQuitting', e.target.value)}
                onBlur={(e) => handleBlur('reasonForQuitting', e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {localErrors.reasonForQuitting && (
                <p className="text-red-600 text-xs mt-1">{localErrors.reasonForQuitting}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Left by Mutual Agreement */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="leftByMutualAgreement"
            checked={employmentIssues.leftByMutualAgreement?.value || false}
            onChange={(e) => handleFieldUpdate('leftByMutualAgreement', e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="leftByMutualAgreement" className="text-sm font-medium text-gray-700">
            Have you ever left a job by mutual agreement following charges or allegations of misconduct?
          </label>
        </div>

        {employmentIssues.leftByMutualAgreement?.value && (
          <div className="ml-7 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dateLeftMutual" className="block text-sm font-medium text-gray-700 mb-1">
                  Date Left
                </label>
                <input
                  type="text"
                  id="dateLeftMutual"
                  placeholder="MM/DD/YYYY"
                  value={employmentIssues.dateLeftMutual?.value || ''}
                  onChange={(e) => handleFieldUpdate('dateLeftMutual', e.target.value)}
                  onBlur={(e) => handleBlur('dateLeftMutual', e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {localErrors.dateLeftMutual && (
                  <p className="text-red-600 text-xs mt-1">{localErrors.dateLeftMutual}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="reasonForLeaving" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Leaving
              </label>
              <textarea
                id="reasonForLeaving"
                rows={3}
                placeholder="Provide details about the mutual agreement..."
                value={employmentIssues.reasonForLeaving?.value || ''}
                onChange={(e) => handleFieldUpdate('reasonForLeaving', e.target.value)}
                onBlur={(e) => handleBlur('reasonForLeaving', e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {localErrors.reasonForLeaving && (
                <p className="text-red-600 text-xs mt-1">{localErrors.reasonForLeaving}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Charges or Allegations */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="hasChargesOrAllegations"
            checked={employmentIssues.hasChargesOrAllegations?.value || false}
            onChange={(e) => handleFieldUpdate('hasChargesOrAllegations', e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="hasChargesOrAllegations" className="text-sm font-medium text-gray-700">
            Have you ever been subject to court proceedings or charges related to employment?
          </label>
        </div>

        {employmentIssues.hasChargesOrAllegations?.value && (
          <div className="ml-7 p-4 bg-gray-50 rounded-lg">
            <label htmlFor="chargesOrAllegations" className="block text-sm font-medium text-gray-700 mb-1">
              Details of Charges or Allegations
            </label>
            <textarea
              id="chargesOrAllegations"
              rows={4}
              placeholder="Provide details about the charges or allegations..."
              value={employmentIssues.chargesOrAllegations?.value || ''}
              onChange={(e) => handleFieldUpdate('chargesOrAllegations', e.target.value)}
              onBlur={(e) => handleBlur('chargesOrAllegations', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {localErrors.chargesOrAllegations && (
              <p className="text-red-600 text-xs mt-1">{localErrors.chargesOrAllegations}</p>
            )}
          </div>
        )}
      </div>

      {/* Unsatisfactory Performance */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="hasUnsatisfactoryPerformance"
            checked={employmentIssues.hasUnsatisfactoryPerformance?.value || false}
            onChange={(e) => handleFieldUpdate('hasUnsatisfactoryPerformance', e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="hasUnsatisfactoryPerformance" className="text-sm font-medium text-gray-700">
            Have you ever received a written reprimand for unsatisfactory performance?
          </label>
        </div>

        {employmentIssues.hasUnsatisfactoryPerformance?.value && (
          <div className="ml-7 p-4 bg-gray-50 rounded-lg">
            <label htmlFor="unsatisfactoryPerformanceReason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Unsatisfactory Performance
            </label>
            <textarea
              id="unsatisfactoryPerformanceReason"
              rows={3}
              placeholder="Provide details about the unsatisfactory performance..."
              value={employmentIssues.unsatisfactoryPerformanceReason?.value || ''}
              onChange={(e) => handleFieldUpdate('unsatisfactoryPerformanceReason', e.target.value)}
              onBlur={(e) => handleBlur('unsatisfactoryPerformanceReason', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {localErrors.unsatisfactoryPerformanceReason && (
              <p className="text-red-600 text-xs mt-1">{localErrors.unsatisfactoryPerformanceReason}</p>
            )}
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">Important Note</p>
            <p className="text-blue-700">
              You must report all employment-related issues, even if they were resolved in your favor.
              Failure to report known issues may be grounds for denial of your security clearance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmploymentIssuesForm;
