/**
 * Section 12: Where You Went to School - Component
 *
 * This component renders the education history section of the SF-86 form,
 * allowing users to input their educational background including high school,
 * college, vocational schools, and correspondence/online education.
 */

import React, { useState, useCallback, useEffect } from "react";
import { useSection12 } from "~/state/contexts/sections2.0/section12";
import { useSF86Form } from "~/state/contexts/SF86FormContext";
import type { EducationEntry } from "../../../api/interfaces/sections2.0/section12";

interface Section12ComponentProps {
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

// Common countries for dropdown
const COUNTRIES = [
  { value: "", label: "Select country..." },
  { value: "United States", label: "United States" },
  { value: "Canada", label: "Canada" },
  { value: "Mexico", label: "Mexico" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Germany", label: "Germany" },
  { value: "France", label: "France" },
  { value: "Australia", label: "Australia" },
  { value: "Japan", label: "Japan" },
  { value: "China", label: "China" },
  { value: "India", label: "India" },
  { value: "Brazil", label: "Brazil" },
  { value: "Other", label: "Other" }
];

const Section12Component: React.FC<Section12ComponentProps> = ({
  onValidationChange,
}) => {
  const {
    sectionData,
    updateEducationFlag,
    updateHighSchoolFlag,
    addEducationEntry,
    removeEducationEntry,
    updateEducationEntry,
    validateSection,
    validateEducationEntry,
    getEducationEntryCount,
    getTotalEducationYears,
    getHighestDegree,
    getSchoolTypeOptions,
    getDegreeTypeOptions,
  } = useSection12();


  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowValidation(true);

    const result = validateSection();
    console.log(`🔍 Section 12 validation result:`, result);

    try {
      // Update the central form context with Section 12 data
      sf86Form.updateSectionData('section12', sectionData);

      // Save the form data to persistence layer
      await sf86Form.saveForm();

      console.log('✅ Section 12 data saved successfully');
    } catch (error) {
      console.error('❌ Failed to save Section 12 data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [validateSection, sf86Form, sectionData]);


  // Get direct access to SF86Form context for debugging
  const { updateSectionData } = useSF86Form();

  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set([0]));
  const [validationErrors, setValidationErrors] = useState<Record<number, any[]>>({});
  const [globalErrors, setGlobalErrors] = useState<any[]>([]);
  const [isDebugMode, setIsDebugMode] = useState(true); // Default to true for debugging
  const [isLoading, setIsLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Enhanced debug logging to help identify the radio button issue
  useEffect(() => {
    if (isDebugMode) {
      console.log('🔍 Section12 Debug State:', {
        sectionData,
        hasEducationValue: sectionData?.section12?.hasEducation?.value,
        hasEducationField: sectionData?.section12?.hasEducation,
        hasHighSchoolValue: sectionData?.section12?.hasHighSchool?.value,
        hasHighSchoolField: sectionData?.section12?.hasHighSchool,
        entries: sectionData?.section12?.entries,
        entriesCount: sectionData?.section12?.entries?.length || 0,
        expandedEntries: Array.from(expandedEntries),
        validationErrors
      });
    }
  }, [sectionData, expandedEntries, validationErrors, isDebugMode]);

  // Initialize with default entry if needed and clear entries when both flags are NO
  useEffect(() => {
    const hasEducationFlag = sectionData?.section12?.hasEducation?.value === "YES";
    const hasHighSchoolFlag = sectionData?.section12?.hasHighSchool?.value === "YES";
    const entriesCount = getEducationEntryCount();

    // If both flags are NO, clear all entries
    if (!hasEducationFlag && !hasHighSchoolFlag && entriesCount > 0) {
      // Clear all entries when both flags are NO
      while (getEducationEntryCount() > 0) {
        removeEducationEntry(0);
      }
      setExpandedEntries(new Set());
    }
    // If either education flag is YES but no entries exist, add a default entry
    else if ((hasEducationFlag || hasHighSchoolFlag) && entriesCount === 0) {
      addEducationEntry();
      setExpandedEntries(new Set([0])); // Expand the first entry
    }
  }, [sectionData?.section12?.hasEducation?.value, sectionData?.section12?.hasHighSchool?.value]);

  // Enhanced validation with real-time feedback
  // FIXED: Removed function dependencies to prevent excessive re-renders
  useEffect(() => {
    const validation = validateSection();
    const newErrors: Record<number, string[]> = {};

    // Validate each entry individually
    sectionData?.section12?.entries?.forEach((entry, index) => {
      const entryValidation = validateEducationEntry(index);
      if (!entryValidation.isValid) {
        newErrors[index] = entryValidation.errors;
      }
    });

    setValidationErrors(newErrors);

    // Extract error messages from validation result objects
    const globalErrorMessages = validation.errors?.map((error: any) =>
      typeof error === 'string' ? error : error.message || String(error)
    ) || [];

    setGlobalErrors(globalErrorMessages);
    onValidationChange?.(validation.isValid);
  }, [sectionData]); // Only depend on sectionData changes

  // Date validation helper
  const validateDate = (dateString: string, fieldName: string): string | null => {
    if (!dateString) return null;

    const datePattern = /^(0[1-9]|1[0-2])\/(\d{4})$/;
    if (!datePattern.test(dateString)) {
      return `${fieldName} must be in MM/YYYY format`;
    }

    const [month, year] = dateString.split('/').map(Number);
    const currentYear = new Date().getFullYear();

    if (year < 1900 || year > currentYear + 10) {
      return `${fieldName} year must be between 1900 and ${currentYear + 10}`;
    }

    return null;
  };

  // Enhanced field update with validation
  const handleFieldUpdate = useCallback((index: number, fieldPath: string, value: any) => {
    if (isDebugMode) {
      console.log('🔧 Updating field:', { index, fieldPath, value });
    }

    updateEducationEntry(index, fieldPath, value);

    // Real-time validation for date fields
    if (fieldPath.includes('Date') && typeof value === 'string') {
      const error = validateDate(value, fieldPath);
      if (error) {
        setValidationErrors(prev => ({
          ...prev,
          [index]: [...(prev[index] || []).filter(e => {
            const errorMessage = typeof e === 'string' ? e : e.message || String(e);
            return !errorMessage.includes(fieldPath);
          }), error]
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          [index]: (prev[index] || []).filter(e => {
            const errorMessage = typeof e === 'string' ? e : e.message || String(e);
            return !errorMessage.includes(fieldPath);
          })
        }));
      }
    }
  }, [updateEducationEntry, isDebugMode]);

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

  const handleAddEntry = useCallback(() => {
    addEducationEntry();
    const newIndex = getEducationEntryCount();
    setExpandedEntries(prev => new Set([...prev, newIndex]));
  }, [addEducationEntry, getEducationEntryCount]);

  const handleRemoveEntry = useCallback((index: number) => {
    const hasEducationFlag = sectionData?.section12?.hasEducation?.value === "YES";
    const hasHighSchoolFlag = sectionData?.section12?.hasHighSchool?.value === "YES";

    // Allow removal if both flags are NO, or if there are multiple entries
    if ((!hasEducationFlag && !hasHighSchoolFlag) || getEducationEntryCount() > 1) {
      if (window.confirm("Are you sure you want to remove this education entry?")) {
        removeEducationEntry(index);
        setExpandedEntries(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          // Shift indices down for remaining entries
          const shiftedSet = new Set<number>();
          for (const expandedIndex of newSet) {
            if (expandedIndex > index) {
              shiftedSet.add(expandedIndex - 1);
            } else {
              shiftedSet.add(expandedIndex);
            }
          }
          return shiftedSet;
        });
      }
    } else {
      alert("You must have at least one education entry when either education flag is YES.");
    }
  }, [removeEducationEntry, getEducationEntryCount, sectionData]);

  // Enhanced education flag change handler with debugging and fallback
  const handleEducationFlagChange = useCallback((value: "YES" | "NO") => {
    if (isDebugMode) {
      console.log('🎯 handleEducationFlagChange called:', { value, currentValue: sectionData?.section12?.hasEducation?.value });
    }

    try {
      // Primary method: use the context hook
      updateEducationFlag(value);

      if (isDebugMode) {
        console.log('✅ updateEducationFlag called successfully');
      }
    } catch (error) {
      console.error('❌ updateEducationFlag failed, trying fallback:', error);

      // Fallback method: direct update through SF86Form context
      if (sectionData && updateSectionData) {
        const updatedSection = {
          ...sectionData,
          section12: {
            ...sectionData.section12,
            hasEducation: {
              ...sectionData.section12.hasEducation,
              value: value
            }
          }
        };

        updateSectionData('section12', updatedSection);
        console.log('🔄 Used fallback updateSectionData method');
      }
    }

    // If setting to YES and no entries exist, add a default entry
    if (value === "YES" && getEducationEntryCount() === 0) {
      setTimeout(() => {
        addEducationEntry();
        setExpandedEntries(new Set([0]));
      }, 100); // Small delay to allow flag update to process
    }
  }, [updateEducationFlag, getEducationEntryCount, addEducationEntry, sectionData, updateSectionData, isDebugMode]);

  const handleHighSchoolFlagChange = useCallback((value: "YES" | "NO") => {
    if (isDebugMode) {
      console.log('🎯 handleHighSchoolFlagChange called:', { value, currentValue: sectionData?.section12?.hasHighSchool?.value });
    }

    try {
      // Primary method: use the context hook
      updateHighSchoolFlag(value);

      if (isDebugMode) {
        console.log('✅ updateHighSchoolFlag called successfully');
      }
    } catch (error) {
      console.error('❌ updateHighSchoolFlag failed, trying fallback:', error);

      // Fallback method: direct update through SF86Form context
      if (sectionData && updateSectionData) {
        const updatedSection = {
          ...sectionData,
          section12: {
            ...sectionData.section12,
            hasHighSchool: {
              ...sectionData.section12.hasHighSchool,
              value: value
            }
          }
        };

        updateSectionData('section12', updatedSection);
        console.log('🔄 Used fallback updateSectionData method');
      }
    }

    // If setting to YES and no entries exist, add a default entry
    if (value === "YES" && getEducationEntryCount() === 0) {
      setTimeout(() => {
        addEducationEntry();
        setExpandedEntries(new Set([0]));
      }, 100); // Small delay to allow flag update to process
    }
  }, [updateHighSchoolFlag, getEducationEntryCount, addEducationEntry, sectionData, updateSectionData, isDebugMode]);

  // Save function to update SF86 context
  const handleSaveSection = useCallback(() => {
    if (sectionData && updateSectionData) {
      updateSectionData('section12', sectionData);
      console.log('💾 Section 12 data saved to SF86 context');
    }
  }, [sectionData, updateSectionData]);

  const renderValidationErrors = (errors: any[]) => {
    if (errors.length === 0) return null;

    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Validation Errors</h3>
            <div className="mt-2 text-sm text-red-700">
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>
                    {typeof error === 'string' ? error : error.message || String(error)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEducationEntry = (entry: EducationEntry, index: number) => {
    const isExpanded = expandedEntries.has(index);
    const entryErrors = validationErrors[index] || [];

    return (
      <div key={entry._id} className="border border-gray-200 rounded-lg p-6 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">
            Education Entry #{index + 1}
            {entry.schoolName?.value && (
              <span className="ml-2 text-sm text-gray-600 font-normal">
                - {entry.schoolName.value}
              </span>
            )}
            {entryErrors.length > 0 && (
              <span className="ml-2 text-sm text-red-600 font-normal">
                ({entryErrors.length} error{entryErrors.length !== 1 ? 's' : ''})
              </span>
            )}
          </h4>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => toggleEntryExpansion(index)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </button>
            {getEducationEntryCount() > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveEntry(index)}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Show validation errors for this entry */}
        {renderValidationErrors(entryErrors)}

        {isExpanded && (
          <div className="space-y-6">
            {/* Attendance Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date (Month/Year) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="MM/YYYY"
                  value={entry.attendanceDates.fromDate.value || ""}
                  onChange={(e) =>
                    handleFieldUpdate(index, "attendanceDates.fromDate", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${entryErrors.some(e => e.includes('fromDate')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                />
                <label className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={entry.attendanceDates.fromEstimated.value || false}
                    onChange={(e) =>
                      handleFieldUpdate(index, "attendanceDates.fromEstimated", e.target.checked)
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Estimated</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date (Month/Year)
                  {!entry.attendanceDates.present.value && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  placeholder="MM/YYYY"
                  value={entry.attendanceDates.toDate.value || ""}
                  onChange={(e) =>
                    handleFieldUpdate(index, "attendanceDates.toDate", e.target.value)
                  }
                  disabled={entry.attendanceDates.present.value}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${entryErrors.some(e => e.includes('toDate')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                />
                <div className="mt-2 space-y-1">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={entry.attendanceDates.present.value || false}
                      onChange={(e) => {
                        handleFieldUpdate(index, "attendanceDates.present", e.target.checked);
                        if (e.target.checked) {
                          handleFieldUpdate(index, "attendanceDates.toDate", "");
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Present</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={entry.attendanceDates.toEstimated.value || false}
                      onChange={(e) =>
                        handleFieldUpdate(index, "attendanceDates.toEstimated", e.target.checked)
                      }
                      disabled={entry.attendanceDates.present.value}
                      className="mr-2 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm text-gray-600">Estimated</span>
                  </label>
                </div>
              </div>
            </div>

            {/* School Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School Type <span className="text-red-500">*</span>
              </label>
              <select
                value={entry.schoolType.value || ""}
                onChange={(e) =>
                  handleFieldUpdate(index, "schoolType", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${entryErrors.some(e => e.includes('schoolType')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
              >
                <option value="">Select school type...</option>
                {getSchoolTypeOptions().map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* School Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={entry.schoolName.value || ""}
                onChange={(e) =>
                  handleFieldUpdate(index, "schoolName", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${entryErrors.some(e => e.includes('schoolName')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="Enter the complete name of the school"
                maxLength={100}
              />
            </div>

            {/* School Address */}
            <div className="space-y-4">
              <h5 className="text-md font-medium text-gray-800">School Address</h5>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={entry.schoolAddress.street.value || ""}
                  onChange={(e) =>
                    handleFieldUpdate(index, "schoolAddress.street", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${entryErrors.some(e => e.includes('street')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="Enter street address"
                  maxLength={200}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={entry.schoolAddress.city.value || ""}
                    onChange={(e) =>
                      handleFieldUpdate(index, "schoolAddress.city", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${entryErrors.some(e => e.includes('city')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={entry.schoolAddress.state.value || ""}
                    onChange={(e) =>
                      handleFieldUpdate(index, "schoolAddress.state", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${entryErrors.some(e => e.includes('state')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
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
                    value={entry.schoolAddress.zipCode.value || ""}
                    onChange={(e) =>
                      handleFieldUpdate(index, "schoolAddress.zipCode", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${entryErrors.some(e => e.includes('zipCode')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={entry.schoolAddress.country.value || ""}
                  onChange={(e) =>
                    handleFieldUpdate(index, "schoolAddress.country", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${entryErrors.some(e => e.includes('country')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Degree Information */}
            <div className="space-y-4">
              <h5 className="text-md font-medium text-gray-800">Degree Information</h5>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Did you receive a degree from this school?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`degree-received-${index}`}
                      checked={entry.degreeReceived.value === true}
                      onChange={() => handleFieldUpdate(index, "degreeReceived", true)}
                      className="mr-2"
                    />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`degree-received-${index}`}
                      checked={entry.degreeReceived.value === false}
                      onChange={() => handleFieldUpdate(index, "degreeReceived", false)}
                      className="mr-2"
                    />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              </div>

              {entry.degreeReceived.value && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Degree Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={entry.degreeType.value || ""}
                      onChange={(e) =>
                        handleFieldUpdate(index, "degreeType", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${entryErrors.some(e => e.includes('degreeType')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                    >
                      <option value="">Select degree type...</option>
                      {getDegreeTypeOptions().map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Degree Date (Month/Year) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YYYY"
                      value={entry.degreeDate.value || ""}
                      onChange={(e) =>
                        handleFieldUpdate(index, "degreeDate", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${entryErrors.some(e => e.includes('degreeDate')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                    />
                    <label className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        checked={entry.degreeEstimated.value || false}
                        onChange={(e) =>
                          handleFieldUpdate(index, "degreeEstimated", e.target.checked)
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">Estimated</span>
                    </label>
                  </div>
                </div>
              )}
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
          Section 12: Where You Went to School
        </h2>
        <p className="text-gray-600">
          Provide information about your educational history, including high school,
          college, vocational schools, and correspondence/online education.
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

      {/* Main Education Questions */}
      <div className="space-y-6 mb-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            12.a. Do you have a high school diploma, GED, or equivalent?
          </h3>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasEducation"
                checked={sectionData?.section12?.hasEducation?.value === "YES"}
                onChange={() => handleEducationFlagChange("YES")}
                className="mr-2"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasEducation"
                checked={sectionData?.section12?.hasEducation?.value === "NO"}
                onChange={() => handleEducationFlagChange("NO")}
                className="mr-2"
              />
              <span className="text-sm">No</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            12.b. Have you attended any other educational institutions?
          </h3>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasHighSchool"
                checked={sectionData?.section12?.hasHighSchool?.value === "YES"}
                onChange={() => handleHighSchoolFlagChange("YES")}
                className="mr-2"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasHighSchool"
                checked={sectionData?.section12?.hasHighSchool?.value === "NO"}
                onChange={() => handleHighSchoolFlagChange("NO")}
                className="mr-2"
              />
              <span className="text-sm">No (If NO to 12(a) and 12(b), proceed to Section 13A)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Education Entries - Only show when at least one flag is YES */}
      {(sectionData?.section12?.hasEducation?.value === "YES" ||
        sectionData?.section12?.hasHighSchool?.value === "YES") && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Educational History
              </h3>
              <button
                type="button"
                onClick={handleAddEntry}
                disabled={getEducationEntryCount() >= 10}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                title={getEducationEntryCount() >= 10 ? "Maximum of 10 education entries allowed" : "Add new education entry"}
              >
                Add Education Entry
                {getEducationEntryCount() >= 10 && (
                  <span className="ml-1 text-xs">(Max: 10)</span>
                )}
              </button>
            </div>

            {/* Show entries or helpful message */}
            {sectionData?.section12?.entries && sectionData.section12.entries.length > 0 ? (
              sectionData.section12.entries.map((entry, index) =>
                renderEducationEntry(entry, index)
              )
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">
                  No education entries yet. Click "Add Education Entry" to get started.
                </p>
                <p className="text-sm text-gray-400">
                  You can add up to 10 education entries covering your educational history.
                </p>
              </div>
            )}

            {/* Summary Statistics */}
            {getEducationEntryCount() > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-800 mb-2">Education Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Total Entries:</span> {getEducationEntryCount()}
                  </div>
                  <div>
                    <span className="font-medium">Total Years:</span> {getTotalEducationYears()}
                  </div>
                  <div>
                    <span className="font-medium">Highest Degree:</span> {getHighestDegree() || "None"}
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
                      <li>List all educational institutions attended, starting with the most recent</li>
                      <li>Include high school, college, university, vocational, technical, and trade schools</li>
                      <li>Use MM/YYYY format for dates (e.g., 09/2018)</li>
                      <li>Check "Estimated" if you're unsure of exact dates</li>
                      <li>If currently attending, check "Present" for the end date</li>
                      <li>Answer "Yes" to 12.a or 12.b to add education entries</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      <button
        type="button"
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : 'Save & Continue'}
      </button>

      {/* Show instruction when no education flags are selected */}
      {sectionData?.section12?.hasEducation?.value === "NO" &&
        sectionData?.section12?.hasHighSchool?.value === "NO" && (
          <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200 mt-6">
            <div className="flex justify-center mb-3">
              <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-green-800 mb-2 text-lg font-medium">
              Section 12 Complete
            </p>
            <p className="text-sm text-green-600">
              Since you answered "No" to both questions 12.a and 12.b, no education entries are required.
              You may proceed to Section 13A.
            </p>
          </div>
        )}
    </div>
  );
};

export default Section12Component; 