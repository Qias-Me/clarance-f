/**
 * Section 13: Employment Activities - Component
 *
 * This component renders the employment history section of the SF-86 form,
 * allowing users to input their employment background including employers,
 * positions, dates, supervisors, and employment-related activities.
 */

import React, { useState, useCallback, useEffect } from "react";
import { useSection13 } from "~/state/contexts/sections2.0/section13";

import type { EmploymentEntry } from "../../../api/interfaces/sections2.0/section13";

interface Section13ComponentProps {
  onValidationChange?: (isValid: boolean) => void;
}

// US States and territories for dropdown
const US_STATES = [
  { value: "", label: "Select state..." },
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "PR", label: "Puerto Rico" },
  { value: "VI", label: "Virgin Islands" },
  { value: "GU", label: "Guam" },
  { value: "AS", label: "American Samoa" },
  { value: "MP", label: "Northern Mariana Islands" }
];

export const Section13Component: React.FC<Section13ComponentProps> = ({
  onValidationChange,
}) => {
  const {
    sectionData,
    updateEmploymentFlag,
    updateGapsFlag,
    updateGapExplanation,
    addEmploymentEntry,
    removeEmploymentEntry,
    updateEmploymentEntry,
    saveToMainContext,
    validateSection,
    validateEmploymentEntry,
    getEmploymentEntryCount,
    getTotalEmploymentYears,
    getCurrentEmployer,
    getEmploymentTypeOptions,
    getEmploymentStatusOptions,
    getReasonForLeavingOptions,
    formatEmploymentDate,
    calculateEmploymentDuration,
  } = useSection13();

  // Note: SF86 Form Context updates now handled by Section 13 context's saveToMainContext function

  // Component state
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set([0]));
  const [validationErrors, setValidationErrors] = useState<Record<number, any[]>>({});
  const [globalErrors, setGlobalErrors] = useState<any[]>([]);
  const [isDebugMode, setIsDebugMode] = useState(true); // Default to true for debugging
  const [isLoading, setIsLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Local state for form values (performance optimization)
  const [localFormData, setLocalFormData] = useState<any>({});

  // Initialize local form data from section data
  useEffect(() => {
    if (sectionData?.section13?.entries) {
      const initialData: any = {};
      sectionData.section13.entries.forEach((entry: any, index: number) => {
        initialData[index] = {
          // Employment dates
          'employmentDates.fromDate': entry.employmentDates?.fromDate?.value || '',
          'employmentDates.toDate': entry.employmentDates?.toDate?.value || '',
          'employmentDates.fromEstimated': entry.employmentDates?.fromEstimated?.value || false,
          'employmentDates.toEstimated': entry.employmentDates?.toEstimated?.value || false,
          'employmentDates.present': entry.employmentDates?.present?.value || false,

          // Employer information
          'employerName': entry.employerName?.value || '',
          'employmentType': entry.employmentType?.value || '',
          'positionTitle': entry.positionTitle?.value || '',
          'employmentStatus': entry.employmentStatus?.value || '',
          'positionDescription': entry.positionDescription?.value || '',
          'reasonForLeaving': entry.reasonForLeaving?.value || '',
          'additionalComments': entry.additionalComments?.value || '',

          // Employer address
          'employerAddress.street': entry.employerAddress?.street?.value || '',
          'employerAddress.city': entry.employerAddress?.city?.value || '',
          'employerAddress.state': entry.employerAddress?.state?.value || '',
          'employerAddress.zipCode': entry.employerAddress?.zipCode?.value || '',
          'employerAddress.country': entry.employerAddress?.country?.value || '',

          // Supervisor information
          'supervisor.name': entry.supervisor?.name?.value || '',
          'supervisor.title': entry.supervisor?.title?.value || '',
          'supervisor.email': entry.supervisor?.email?.value || '',
          'supervisor.phone': entry.supervisor?.phone?.value || '',
          'supervisor.canContact': entry.supervisor?.canContact?.value || '',
          'supervisor.contactRestrictions': entry.supervisor?.contactRestrictions?.value || '',
        };
      });
      setLocalFormData(initialData);
    }
  }, [sectionData?.section13?.entries?.length]); // Only re-initialize when entry count changes

  // Function to commit local form data to context (called on save)
  const commitLocalDataToContext = useCallback(() => {
    console.log('💾 Section13Component - Committing local data to context');
    console.log('💾 Local form data to commit:', localFormData);

    if (!localFormData || Object.keys(localFormData).length === 0) {
      console.log('⚠️ No local form data to commit');
      return;
    }

    Object.entries(localFormData).forEach(([indexStr, entryData]: [string, any]) => {
      const index = parseInt(indexStr);
      console.log(`💾 Committing entry ${index} data:`, entryData);

      Object.entries(entryData).forEach(([fieldPath, value]) => {
        console.log(`💾 Updating field ${fieldPath} = ${value} for entry ${index}`);
        updateEmploymentEntry(index, fieldPath, value);
      });
    });

    console.log('✅ Local data commit completed');
  }, [localFormData, updateEmploymentEntry]);

  // Save handler - Performance optimized approach
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowValidation(true);

    console.log('🔄 Section13Component - Save button clicked (Performance Optimized)');

    try {
      // First, commit local form data to Section 13 context
      console.log('💾 Section13Component - Committing local data to Section 13 context');
      commitLocalDataToContext();

      // Wait a moment for the Section 13 context to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Validate the section data
      const result = validateSection();
      console.log(`🔍 Section 13 validation result:`, result);

      // Use the performance-optimized save function from Section 13 context
      // This will update SF86FormContext only when explicitly called
      console.log('💾 Section13Component - Calling saveToMainContext for performance optimization');
      saveToMainContext();

      console.log('✅ Section 13 data saved successfully using performance-optimized approach');
    } catch (error) {
      console.error('❌ Failed to save Section 13 data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [validateSection, saveToMainContext, commitLocalDataToContext, setIsLoading, setShowValidation]);

  // Enhanced debug logging
  useEffect(() => {
    console.log('🔍 Section13Component - Component mounted or updated');
    console.log('🔍 Section13Component - sectionData available:', !!sectionData);
    console.log('🔍 Section13Component - saveToMainContext available:', !!saveToMainContext);

    if (isDebugMode) {
      console.log('🔍 Section13 Debug State:', {
        sectionData,
        hasEmploymentValue: sectionData?.section13?.hasEmployment?.value,
        hasGapsValue: sectionData?.section13?.hasGaps?.value,
        entries: sectionData?.section13?.entries,
        entriesCount: sectionData?.section13?.entries?.length || 0,
        expandedEntries: Array.from(expandedEntries),
        validationErrors
      });
    }
  }, [sectionData, expandedEntries, validationErrors, isDebugMode, saveToMainContext]);

  // Initialize with default entry if none exist and employment flag is YES
  useEffect(() => {
    console.log('🔄 Section13Component - Initialization effect running');
    const hasEmploymentFlag = sectionData?.section13?.hasEmployment?.value === "YES";
    const entriesCount = getEmploymentEntryCount();

    console.log('🔄 Section13Component - Initial state:', { 
      hasEmploymentFlag, 
      entriesCount, 
      hasGapsFlag: sectionData?.section13?.hasGaps?.value,
      gapExplanation: sectionData?.section13?.gapExplanation?.value || '(none)' 
    });

    if (hasEmploymentFlag && entriesCount === 0) {
      console.log('🔄 Section13Component - Adding initial employment entry');
      addEmploymentEntry();
      setExpandedEntries(new Set([0]));
    }
    
    // Force re-validation to ensure validation state is correct
    setTimeout(() => {
      console.log('🔄 Section13Component - Forcing validation after initialization');
      const validation = validateSection();
      console.log('🔄 Section13Component - Validation result:', validation);
    }, 500);
    
  }, [sectionData?.section13?.hasEmployment?.value, getEmploymentEntryCount, addEmploymentEntry]);

  // Enhanced validation with real-time feedback
  useEffect(() => {
    const validation = validateSection();
    const newErrors: Record<number, string[]> = {};

    // Validate each entry individually
    sectionData?.section13?.entries?.forEach((_, index) => {
      const entryValidation = validateEmploymentEntry(index);
      if (!entryValidation.isValid) {
        newErrors[index] = entryValidation.errors;
      }
    });

    setValidationErrors(newErrors);

    const globalErrorMessages = validation.errors?.map((error: any) =>
      typeof error === 'string' ? error : error.message || String(error)
    ) || [];

    setGlobalErrors(globalErrorMessages);
    onValidationChange?.(validation.isValid);
  }, [sectionData, validateSection, validateEmploymentEntry, onValidationChange]);

  // Optimized field update - only updates local state
  const handleFieldUpdate = useCallback((index: number, fieldPath: string, value: any) => {
    console.log('🔍 Section13Component - Local field update:', { index, fieldPath, value });

    setLocalFormData((prev: any) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [fieldPath]: value
      }
    }));
  }, []);

  // Helper function to get local form value
  const getLocalValue = (index: number, fieldPath: string) => {
    return localFormData[index]?.[fieldPath] || '';
  };



  // Employment flag handlers
  const handleEmploymentFlagChange = useCallback((value: "YES" | "NO") => {
    console.log('🏢 Section13Component - Employment flag changing to:', value);
    updateEmploymentFlag(value);
    
    // Debug: Verify the update
    setTimeout(() => {
      console.log('✅ Section13Component - After employment flag update:', {
        hasEmploymentValue: sectionData?.section13?.hasEmployment?.value,
      });
    }, 0);
  }, [updateEmploymentFlag, sectionData]);

  const handleGapsFlagChange = useCallback((value: "YES" | "NO") => {
    console.log('📅 Section13Component - Employment gaps flag changing to:', value);
    updateGapsFlag(value);
    
    // Debug: Verify the update
    setTimeout(() => {
      console.log('✅ Section13Component - After gaps flag update:', {
        hasGapsValue: sectionData?.section13?.hasGaps?.value,
      });
    }, 0);
  }, [updateGapsFlag, sectionData]);

  // Entry management handlers
  const handleAddEntry = useCallback(() => {
    const newIndex = getEmploymentEntryCount();
    addEmploymentEntry();
    setExpandedEntries(prev => new Set([...prev, newIndex]));
  }, [addEmploymentEntry, getEmploymentEntryCount]);

  const handleRemoveEntry = useCallback((index: number) => {
    removeEmploymentEntry(index);
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      // Adjust indices for remaining entries
      const adjustedSet = new Set<number>();
      Array.from(newSet).forEach(i => {
        if (i > index) {
          adjustedSet.add(i - 1);
        } else {
          adjustedSet.add(i);
        }
      });
      return adjustedSet;
    });
  }, [removeEmploymentEntry]);

  const toggleEntryExpansion = useCallback((index: number) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  // Render validation errors
  const renderValidationErrors = (errors: any[]) => {
    if (!errors || errors.length === 0) return null;

    return (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Please correct the following errors:
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render employment entry
  const renderEmploymentEntry = (entry: EmploymentEntry, index: number) => {
    const isExpanded = expandedEntries.has(index);
    const entryErrors = validationErrors[index] || [];
    const hasErrors = entryErrors.length > 0;

    return (
      <div
        key={entry._id}
        className={`border rounded-lg p-6 ${hasErrors ? 'border-red-300 bg-red-50' : 'border-gray-300'} transition-all duration-200`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <button
              type="button"
              onClick={() => toggleEntryExpansion(index)}
              className="flex items-center text-left w-full"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                  hasErrors ? 'bg-red-500' : 'bg-blue-500'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {entry.employerName.value || `Employment Entry ${index + 1}`}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {entry.positionTitle.value && `${entry.positionTitle.value} • `}
                    {formatEmploymentDate(entry.employmentDates.fromDate.value)} - {
                      entry.employmentDates.present.value
                        ? 'Present'
                        : formatEmploymentDate(entry.employmentDates.toDate.value)
                    }
                  </p>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleRemoveEntry(index)}
            className="ml-4 text-red-600 hover:text-red-800 transition-colors"
            title="Remove this employment entry"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Show validation errors for this entry */}
        {hasErrors && renderValidationErrors(entryErrors)}

        {isExpanded && (
          <div className="space-y-6">
            {/* Employment Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Start Date (Month/Year) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="MM/YYYY"
                  value={getLocalValue(index, "employmentDates.fromDate")}
                  onChange={(e) => handleFieldUpdate(index, "employmentDates.fromDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={getLocalValue(index, "employmentDates.fromEstimated") || false}
                    onChange={(e) => handleFieldUpdate(index, "employmentDates.fromEstimated", e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Estimated</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment End Date (Month/Year)
                </label>
                <input
                  type="text"
                  placeholder="MM/YYYY"
                  value={getLocalValue(index, "employmentDates.toDate")}
                  onChange={(e) => handleFieldUpdate(index, "employmentDates.toDate", e.target.value)}
                  disabled={getLocalValue(index, "employmentDates.present")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <label className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={getLocalValue(index, "employmentDates.present") || false}
                    onChange={(e) => handleFieldUpdate(index, "employmentDates.present", e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Present</span>
                </label>
                {!getLocalValue(index, "employmentDates.present") && (
                  <label className="flex items-center mt-1">
                    <input
                      type="checkbox"
                      checked={getLocalValue(index, "employmentDates.toEstimated") || false}
                      onChange={(e) => handleFieldUpdate(index, "employmentDates.toEstimated", e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Estimated</span>
                  </label>
                )}
              </div>
            </div>

            {/* Employer Information */}
            <div className="space-y-4">
              <h5 className="text-md font-medium text-gray-800">Employer Information</h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employer/Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={getLocalValue(index, "employerName")}
                    onChange={(e) => handleFieldUpdate(index, "employerName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={getLocalValue(index, "employmentType")}
                    onChange={(e) => handleFieldUpdate(index, "employmentType", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select employment type...</option>
                    {getEmploymentTypeOptions().map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={getLocalValue(index, "positionTitle")}
                    onChange={(e) => handleFieldUpdate(index, "positionTitle", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Status
                  </label>
                  <select
                    value={getLocalValue(index, "employmentStatus")}
                    onChange={(e) => handleFieldUpdate(index, "employmentStatus", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select status...</option>
                    {getEmploymentStatusOptions().map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position Description
                </label>
                <textarea
                  value={getLocalValue(index, "positionDescription")}
                  onChange={(e) => handleFieldUpdate(index, "positionDescription", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of job duties and responsibilities"
                />
              </div>
            </div>

            {/* Employer Address */}
            <div className="space-y-4">
              <h5 className="text-md font-medium text-gray-800">Employer Address</h5>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={getLocalValue(index, "employerAddress.street")}
                  onChange={(e) => handleFieldUpdate(index, "employerAddress.street", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={getLocalValue(index, "employerAddress.city")}
                    onChange={(e) => handleFieldUpdate(index, "employerAddress.city", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    value={getLocalValue(index, "employerAddress.state")}
                    onChange={(e) => handleFieldUpdate(index, "employerAddress.state", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {US_STATES.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={getLocalValue(index, "employerAddress.zipCode")}
                    onChange={(e) => handleFieldUpdate(index, "employerAddress.zipCode", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Supervisor Information */}
            <div className="space-y-4">
              <h5 className="text-md font-medium text-gray-800">Supervisor Information</h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supervisor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={getLocalValue(index, "supervisor.name")}
                    onChange={(e) => handleFieldUpdate(index, "supervisor.name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supervisor Title
                  </label>
                  <input
                    type="text"
                    value={getLocalValue(index, "supervisor.title")}
                    onChange={(e) => handleFieldUpdate(index, "supervisor.title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supervisor Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={getLocalValue(index, "supervisor.phone")}
                    onChange={(e) => handleFieldUpdate(index, "supervisor.phone", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supervisor Email
                  </label>
                  <input
                    type="email"
                    value={getLocalValue(index, "supervisor.email")}
                    onChange={(e) => handleFieldUpdate(index, "supervisor.email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Can this supervisor be contacted? <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`supervisor-contact-${index}`}
                      checked={getLocalValue(index, "supervisor.canContact") === "YES"}
                      onChange={() => handleFieldUpdate(index, "supervisor.canContact", "YES")}
                      className="mr-2"
                    />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`supervisor-contact-${index}`}
                      checked={getLocalValue(index, "supervisor.canContact") === "NO"}
                      onChange={() => handleFieldUpdate(index, "supervisor.canContact", "NO")}
                      className="mr-2"
                    />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              </div>

              {getLocalValue(index, "supervisor.canContact") === "NO" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Restrictions (Explain why supervisor cannot be contacted)
                  </label>
                  <textarea
                    value={getLocalValue(index, "supervisor.contactRestrictions")}
                    onChange={(e) => handleFieldUpdate(index, "supervisor.contactRestrictions", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Reason for Leaving */}
            {!getLocalValue(index, "employmentDates.present") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Leaving
                </label>
                <select
                  value={getLocalValue(index, "reasonForLeaving")}
                  onChange={(e) => handleFieldUpdate(index, "reasonForLeaving", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select reason...</option>
                  {getReasonForLeavingOptions().map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Additional Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments
              </label>
              <textarea
                value={getLocalValue(index, "additionalComments")}
                onChange={(e) => handleFieldUpdate(index, "additionalComments", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional information about this employment"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 13: Employment Activities
        </h2>
        <p className="text-gray-600">
          Provide information about your employment history for the past 10 years,
          including employers, positions, dates, supervisors, and employment-related activities.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Fields marked with <span className="text-red-500">*</span> are required.
        </div>

        {/* Debug Toggle */}
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isDebugMode}
              onChange={(e) => setIsDebugMode(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Enable debug mode (check console)</span>
          </label>
        </div>
      </div>

      {/* Show global validation errors */}
      {renderValidationErrors(globalErrors)}

      {/* Main Employment Questions */}
      <div className="space-y-6 mb-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            13.a. Have you been employed in the last 10 years?
          </h3>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasEmployment"
                checked={sectionData?.section13?.hasEmployment?.value === "YES"}
                onChange={() => handleEmploymentFlagChange("YES")}
                className="mr-2"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasEmployment"
                checked={sectionData?.section13?.hasEmployment?.value === "NO"}
                onChange={() => handleEmploymentFlagChange("NO")}
                className="mr-2"
              />
              <span className="text-sm">No</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            13.b. Are there any gaps in your employment history?
          </h3>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasGaps"
                checked={sectionData?.section13?.hasGaps?.value === "YES"}
                onChange={() => handleGapsFlagChange("YES")}
                className="mr-2"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasGaps"
                checked={sectionData?.section13?.hasGaps?.value === "NO"}
                onChange={() => handleGapsFlagChange("NO")}
                className="mr-2"
              />
              <span className="text-sm">No</span>
            </label>
          </div>

          {/* Gap explanation */}
          {sectionData?.section13?.hasGaps?.value === "YES" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explain any gaps in employment:
              </label>
              <textarea
                value={sectionData?.section13?.gapExplanation?.value || ""}
                onChange={(e) => updateGapExplanation(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide details about any gaps in your employment history"
              />
            </div>
          )}
        </div>
      </div>

      {/* Employment Entries */}
      {sectionData?.section13?.hasEmployment?.value === "YES" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Employment History
            </h3>
            <button
              type="button"
              onClick={handleAddEntry}
              disabled={getEmploymentEntryCount() >= 15}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              title={getEmploymentEntryCount() >= 15 ? "Maximum of 15 employment entries allowed" : "Add new employment entry"}
            >
              Add Employment Entry
              {getEmploymentEntryCount() >= 15 && (
                <span className="ml-1 text-xs">(Max: 15)</span>
              )}
            </button>
          </div>

          {/* Show entries or helpful message */}
          {sectionData?.section13?.entries && sectionData.section13.entries.length > 0 ? (
            sectionData.section13.entries.map((entry, index) =>
              renderEmploymentEntry(entry, index)
            )
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">
                No employment entries yet. Click "Add Employment Entry" to get started.
              </p>
              <p className="text-sm text-gray-400">
                You can add up to 15 employment entries covering your employment history.
              </p>
            </div>
          )}

          {/* Summary Statistics */}
          {getEmploymentEntryCount() > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-800 mb-2">Employment Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Total Entries:</span> {getEmploymentEntryCount()}
                </div>
                <div>
                  <span className="font-medium">Total Years:</span> {getTotalEmploymentYears()}
                </div>
                <div>
                  <span className="font-medium">Current Employer:</span> {getCurrentEmployer() || "None"}
                </div>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Tips for completing this section:</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>List all employment for the past 10 years, starting with the most recent</li>
                    <li>Include full-time, part-time, contract, and temporary employment</li>
                    <li>Use MM/YYYY format for dates (e.g., 03/2020)</li>
                    <li>Check "Estimated" if you're unsure of exact dates</li>
                    <li>If currently employed, check "Present" for the end date</li>
                    <li>Provide complete supervisor information for each position</li>
                    <li>Explain any gaps in employment history</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show instruction when employment flag is NO */}
      {sectionData?.section13?.hasEmployment?.value === "NO" && (
        <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-800 mb-2">
            <strong>Instructions:</strong> You indicated no employment in the last 10 years.
          </p>
          <p className="text-sm text-yellow-600">
            If this is correct, you may proceed to the next section. If you have had employment, please answer "Yes" to add employment entries.
          </p>
        </div>
      )}

      {/* Save Button - Always visible at bottom */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Section 13'}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500 text-right">
          This will save your Section 13 data to the form and continue to the next section.
        </p>
      </div>
    </div>
  );
};

export default Section13Component;