/**
 * Section 12: Where You Went to School - Component
 *
 * This component renders the education history section of the SF-86 form,
 * allowing users to input their educational background including high school,
 * college, vocational schools, and correspondence/online education.
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useSection12 } from "~/state/contexts/sections2.0/section12";
import { useSF86Form } from "~/state/contexts/sections2.0/SF86FormContext";
import { getUSStateOptions, getCountryOptions } from "../../../api/interfaces/sections2.0/base";
import type { SchoolEntry, Section12 } from "../../../api/interfaces/sections2.0/section12";
import { cloneDeep, set } from "lodash";

interface Section12ComponentProps {
  onValidationChange?: (isValid: boolean) => void;
}

// Use centralized US States from base.ts
const US_STATES = getUSStateOptions();

// Use centralized countries from base.ts
const COUNTRIES = getCountryOptions();

const Section12Component: React.FC<Section12ComponentProps> = ({
  onValidationChange,
}) => {
  const {
    section12Data: contextData,
    updateAttendedSchoolFlag,
    updateAttendedSchoolOutsideUSFlag,
    addSchoolEntry,
    removeSchoolEntry,
    updateSchoolEntry,
    addDegreeEntry,
    removeDegreeEntry,
    validateSection,
    validateSchoolEntry,
    getSchoolEntryCount,
    getTotalEducationYears,
    getHighestDegree,
    getSchoolTypeOptions,
    getDegreeTypeOptions,
    submitSectionData,
    hasPendingChanges,
  } = useSection12();

  // ============================================================================
  // LOCAL STATE FOR PERFORMANCE OPTIMIZATION (Section 1 Gold Standard Pattern)
  // ============================================================================

  // Use local state for field changes to prevent context updates on every onChange
  const [localSectionData, setLocalSectionData] = useState<Section12>(contextData);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  // Sync local state when context data changes (on initial load or external updates)
  useEffect(() => {
    // console.log('🔍 Section12Component: Context data changed, syncing to local state:', {
    //   contextEntries: contextData.section12.entries.length,
    //   contextData: contextData.section12.entries
    // });
    setLocalSectionData(contextData);
    setHasLocalChanges(false);
  }, [contextData]);

  // Use local data for rendering, context data for validation
  const sectionData = localSectionData;


  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Validate current local state (not stale context data)
  const validateCurrentState = () => {
    const errors: string[] = [];
    const currentData = localSectionData;

    // Check if education questions are answered
    const hasEducation = currentData.section12?.hasAttendedSchool?.value;
    const hasOtherEducation = currentData.section12?.hasAttendedSchoolOutsideUS?.value;

    if (!hasEducation) {
      errors.push('Please answer question 12.a about high school diploma');
    }

    if (!hasOtherEducation) {
      errors.push('Please answer question 12.b about other educational institutions');
    }

    // If user answered YES to question 12.b (other educational institutions), require at least one entry
    // Note: Question 12.a (high school) doesn't require entries, only 12.b does
    if (hasOtherEducation === 'YES' && currentData.section12.entries.length === 0) {
      errors.push('At least one school entry is required when you answered YES to question 12.b');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    // console.log('🚀 Section12Component: handleSubmit called!');
    e.preventDefault();

    // Validate current local state instead of stale context data
    const result = validateCurrentState();
    onValidationChange?.(result.isValid);

    // console.log('🔍 Section 12 validation result:', result);
    // console.log('📊 Section 12 local data before submission:', localSectionData);

    if (result.isValid) {
      try {
        // console.log('🔄 Section 12: Starting data synchronization...');

        // Sync local data to context first
        sf86Form.updateSectionData('section12', localSectionData);

        // console.log('✅ Section 12: Data synchronization complete, proceeding to save...');

        // Get the current form data and save it
        const currentFormData = sf86Form.exportForm();
        const updatedFormData = { ...currentFormData, section12: localSectionData };
        await sf86Form.saveForm(updatedFormData);

        // Mark section as complete after successful save
        sf86Form.markSectionComplete('section12');

        // console.log('✅ Section 12 data saved successfully:', localSectionData);

        // Clear local changes flag
        setHasLocalChanges(false);

      } catch (error) {
        // console.error('❌ Failed to save Section 12 data:', error);
        // Show an error message to user
        alert('There was an error saving your information. Please try again.');
      }
    } else {
      // Show validation errors to user
      setGlobalErrors(result.errors);
      // console.log('❌ Section 12 validation failed:', result.errors);
    }
  };


  // Get direct access to SF86Form context for debugging
  const { updateSectionData } = useSF86Form();

  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set([0]));
  const [validationErrors, setValidationErrors] = useState<Record<number, any[]>>({});
  const [globalErrors, setGlobalErrors] = useState<any[]>([]);
  const [isDebugMode, setIsDebugMode] = useState(true); // Default to true for debugging
  const [isLoading, setIsLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Refs to prevent infinite recursion in useEffect hooks
  const lastEducationFlagRef = useRef<string | undefined>(undefined);
  const lastHighSchoolFlagRef = useRef<string | undefined>(undefined);
  const isProcessingFlagChangeRef = useRef(false);

  // Ref to prevent React Strict Mode double execution of addSchoolEntry
  const isAddingEntryRef = useRef(false);

  // Refs to prevent React Strict Mode double execution of degree operations
  const isAddingDegreeRef = useRef(false);
  const isRemovingDegreeRef = useRef(false);

  // Enhanced debug logging to help identify the radio button issue
  useEffect(() => {
    // if (isDebugMode) {
      // console.log('🔍 Section12 Debug State:', {
    //     sectionData,
    //     hasEducationValue: sectionData?.section12?.hasAttendedSchool?.value,
    //     hasEducationField: sectionData?.section12?.hasAttendedSchool,
    //     hasHighSchoolValue: sectionData?.section12?.hasAttendedSchoolOutsideUS?.value,
    //     hasHighSchoolField: sectionData?.section12?.hasAttendedSchoolOutsideUS,
    //     entries: sectionData?.section12?.entries,
    //     entriesCount: sectionData?.section12?.entries?.length || 0,
    //     expandedEntries: Array.from(expandedEntries),
    //     validationErrors
    //   });
    // }
  }, [sectionData, expandedEntries, validationErrors, isDebugMode]);

  // Initialize with default entry if needed and clear entries when question 12.b is NO
  // FIXED: Use refs to prevent infinite recursion and focus on question 12.b
  useEffect(() => {
    const hasEducationFlag = sectionData?.section12?.hasAttendedSchool?.value === "YES"; // Question 12.a
    const hasOtherEducationFlag = sectionData?.section12?.hasAttendedSchoolOutsideUS?.value === "YES"; // Question 12.b
    const entriesCount = getSchoolEntryCount();

    // Check if flags have actually changed to prevent infinite loops
    const educationFlagChanged = lastEducationFlagRef.current !== sectionData?.section12?.hasAttendedSchool?.value;
    const otherEducationFlagChanged = lastHighSchoolFlagRef.current !== sectionData?.section12?.hasAttendedSchoolOutsideUS?.value;

    // Only proceed if question 12.b flag has actually changed (this is what controls entry visibility)
    if (!otherEducationFlagChanged) {
      return; // No relevant flag changes, skip processing
    }

    // Prevent recursive calls
    if (isProcessingFlagChangeRef.current) {
      return;
    }

    isProcessingFlagChangeRef.current = true;

    try {
      // Update refs to track current values
      lastEducationFlagRef.current = sectionData?.section12?.hasAttendedSchool?.value;
      lastHighSchoolFlagRef.current = sectionData?.section12?.hasAttendedSchoolOutsideUS?.value;

      // Clear entries if question 12.b is NO (since entries are only shown when 12.b is YES)
      if (!hasOtherEducationFlag && entriesCount > 0) {
        // Clear all entries when question 12.b is NO
        while (getSchoolEntryCount() > 0) {
          removeSchoolEntry(0);
        }
        setExpandedEntries(new Set());
      }
      // Note: Removed automatic entry addition - users can now add entries manually with the "Add School Entry" button
    } finally {
      // Reset processing flag after a delay to allow state updates to complete
      setTimeout(() => {
        isProcessingFlagChangeRef.current = false;
      }, 100);
    }
  }, [sectionData?.section12?.hasAttendedSchool?.value, sectionData?.section12?.hasAttendedSchoolOutsideUS?.value, getSchoolEntryCount, addSchoolEntry, removeSchoolEntry]);

  // VALIDATION DISABLED: Only validate on submit to avoid stale closure issues
  // Real-time validation was causing problems due to stale data access
  // Validation now happens only when user clicks "Submit & Continue"

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

  // Enhanced field update with validation - PERFORMANCE OPTIMIZED (Section 1 Gold Standard)
  // Updates local state only, context sync happens on submit
  const handleFieldUpdate = useCallback((index: number, fieldPath: string, value: any) => {
    if (isDebugMode) {
      // console.log('🔧 Updating field locally:', { index, fieldPath, value });
    }

    // Update local state instead of context to prevent performance issues
    setLocalSectionData(prev => {
      const updated = cloneDeep(prev);
      const fullFieldPath = `section12.entries[${index}].${fieldPath}`;
      set(updated, fullFieldPath, value);

      // Auto-create first degree entry when user selects "YES" for receivedDegree
      if (fieldPath === "receivedDegree.value" && value === "YES") {
        const schoolEntry = updated.section12.entries[index];
        if (schoolEntry && schoolEntry.degrees.length === 0) {
          // Create a new default degree entry
          const newDegree = {
            degreeType: {
              id: "",
              name: "",
              type: 'PDFDropdown' as const,
              label: 'Degree Type',
              value: "High School Diploma" as const,
              options: ["High School Diploma", "Associate's", "Bachelor's", "Master's", "Doctorate", "Professional Degree (e.g. M D, D V M, J D)", "Other"],
              rect: { x: 0, y: 0, width: 0, height: 0 }
            },
            otherDegree: {
              id: "",
              name: "",
              type: 'PDFTextField' as const,
              label: 'Other Degree',
              value: '',
              rect: { x: 0, y: 0, width: 0, height: 0 }
            },
            dateAwarded: {
              id: "",
              name: "",
              type: 'PDFTextField' as const,
              label: 'Date Awarded',
              value: '',
              rect: { x: 0, y: 0, width: 0, height: 0 }
            },
            dateAwardedEstimate: {
              id: "",
              name: "",
              type: 'PDFCheckBox' as const,
              label: 'Date Awarded Estimate',
              value: false,
              rect: { x: 0, y: 0, width: 0, height: 0 }
            }
          };
          schoolEntry.degrees.push(newDegree);
          // console.log(`✅ Auto-added first degree when receivedDegree set to YES for school ${index}`);
        }
      } else if (fieldPath === "receivedDegree.value" && value === "NO") {
        // Clear degrees when user selects "NO" for receivedDegree
        const schoolEntry = updated.section12.entries[index];
        if (schoolEntry) {
          schoolEntry.degrees = [];
          // console.log(`🧹 Cleared degrees when receivedDegree set to NO for school ${index}`);
        }
      }

      return updated;
    });

    // Mark that we have local changes
    setHasLocalChanges(true);

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
  }, [isDebugMode]);

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
    // Prevent React Strict Mode double execution
    if (isAddingEntryRef.current) {
      // console.log('🚫 Section12Component: handleAddEntry blocked - already in progress (React Strict Mode protection)');
      return;
    }

    isAddingEntryRef.current = true;
    // console.log('🎯 Section12Component: handleAddEntry called (local state mode)');

    try {
      // PERFORMANCE OPTIMIZATION: Add entry to local state instead of context
      // This prevents the context update from overwriting our local flag changes
      setLocalSectionData(prev => {
        const updated = cloneDeep(prev);
        const entryIndex = updated.section12.entries.length;

        // Limit to 4 entries as per PDF structure
        if (entryIndex >= 4) {
          // console.warn('⚠️ Section12: Maximum of 4 school entries allowed');
          return prev;
        }

        // Create a new default entry (matching SchoolEntry interface)
        const newEntry = {
          _id: Date.now(),
          createdAt: new Date(),
          updatedAt: new Date(),
          fromDate: { value: "" },
          toDate: { value: "" },
          fromDateEstimate: { value: false },
          toDateEstimate: { value: false },
          isPresent: { value: false },
          schoolType: { value: "High School" },
          schoolName: { value: "" },
          schoolAddress: { value: "" },
          schoolCity: { value: "" },
          schoolState: { value: "" },
          schoolZipCode: { value: "" },
          schoolCountry: { value: "United States" },
          receivedDegree: { value: "NO" },
          degrees: []
        };

        updated.section12.entries.push(newEntry);
        // console.log(`✅ Section12Component: Added entry #${entryIndex + 1} to local state. Total entries: ${updated.section12.entries.length}`);
        return updated;
      });

      // Mark that we have local changes
      setHasLocalChanges(true);

      // Expand the new entry
      const newIndex = localSectionData.section12.entries.length;
      setExpandedEntries(prev => new Set([...prev, newIndex]));
      // console.log(`✅ Section12Component: Expanded entry #${newIndex}`);
    } finally {
      // Reset the flag after a short delay to allow for state updates
      setTimeout(() => {
        isAddingEntryRef.current = false;
        // console.log('🔄 Section12Component: handleAddEntry flag reset');
      }, 100);
    }
  }, [localSectionData]);

  const handleRemoveEntry = useCallback((index: number) => {
    const hasEducationFlag = sectionData?.section12?.hasAttendedSchool?.value === "YES"; // Question 12.a
    const hasOtherEducationFlag = sectionData?.section12?.hasAttendedSchoolOutsideUS?.value === "YES"; // Question 12.b

    // Allow removal if question 12.b is NO, or if there are multiple entries
    // Since entries are only shown when 12.b is YES, we focus on that flag
    if (!hasOtherEducationFlag || getSchoolEntryCount() > 1) {
      if (window.confirm("Are you sure you want to remove this education entry?")) {
        removeSchoolEntry(index);
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
      // console.log("You must have at least one education entry when question 12.b is set to YES. Please change the flag first or add another entry.");
    }
  }, [removeSchoolEntry, getSchoolEntryCount, sectionData]);

  // Degree management handlers with React Strict Mode protection
  // PERFORMANCE OPTIMIZED (Section 1 Gold Standard) - Updates local state only
  const handleAddDegree = useCallback((schoolIndex: number) => {
    // Prevent React Strict Mode double execution
    if (isAddingDegreeRef.current) {
      // console.log('🚫 Section12Component: handleAddDegree blocked - already in progress (React Strict Mode protection)');
      return;
    }

    isAddingDegreeRef.current = true;
    // console.log(`🎯 Section12Component: handleAddDegree called for school ${schoolIndex} (local state mode)`);

    try {
      // PERFORMANCE OPTIMIZATION: Update local state instead of context to prevent performance issues
      setLocalSectionData(prev => {
        const updated = cloneDeep(prev);
        const schoolEntry = updated.section12.entries[schoolIndex];

        if (!schoolEntry) {
          // console.warn(`⚠️ Section12Component: School entry ${schoolIndex} not found`);
          return prev;
        }

        // Limit to 2 degrees per school as per PDF structure
        if (schoolEntry.degrees.length >= 2) {
          // console.warn('⚠️ Section12Component: Maximum of 2 degrees per school allowed');
          return prev;
        }

        // Create a new default degree entry (matching DegreeEntry interface)
        const newDegree = {
          degreeType: {
            id: "",
            name: "",
            type: 'PDFDropdown' as const,
            label: 'Degree Type',
            value: "High School Diploma" as const,
            options: ["High School Diploma", "Associate's", "Bachelor's", "Master's", "Doctorate", "Professional Degree (e.g. M D, D V M, J D)", "Other"],
            rect: { x: 0, y: 0, width: 0, height: 0 }
          },
          otherDegree: {
            id: "",
            name: "",
            type: 'PDFTextField' as const,
            label: 'Other Degree',
            value: '',
            rect: { x: 0, y: 0, width: 0, height: 0 }
          },
          dateAwarded: {
            id: "",
            name: "",
            type: 'PDFTextField' as const,
            label: 'Date Awarded',
            value: '',
            rect: { x: 0, y: 0, width: 0, height: 0 }
          },
          dateAwardedEstimate: {
            id: "",
            name: "",
            type: 'PDFCheckBox' as const,
            label: 'Date Awarded Estimate',
            value: false,
            rect: { x: 0, y: 0, width: 0, height: 0 }
          }
        };

        schoolEntry.degrees.push(newDegree);
        // console.log(`✅ Section12Component: Added degree to school ${schoolIndex} in local state. Total degrees: ${schoolEntry.degrees.length}`);
        return updated;
      });

      // Mark that we have local changes
      setHasLocalChanges(true);
      // console.log(`✅ Section12Component: Added degree to school ${schoolIndex} (local state updated)`);
    } finally {
      // Reset the flag after a short delay to allow for state updates
      setTimeout(() => {
        isAddingDegreeRef.current = false;
        // console.log('🔄 Section12Component: handleAddDegree flag reset');
      }, 100);
    }
  }, []);

  const handleRemoveDegree = useCallback((schoolIndex: number, degreeIndex: number) => {
    // Prevent React Strict Mode double execution
    if (isRemovingDegreeRef.current) {
      // console.log('🚫 Section12Component: handleRemoveDegree blocked - already in progress (React Strict Mode protection)');
      return;
    }

    isRemovingDegreeRef.current = true;
    // console.log(`🎯 Section12Component: handleRemoveDegree called for school ${schoolIndex}, degree ${degreeIndex} (local state mode)`);

    try {
      if (window.confirm("Are you sure you want to remove this degree?")) {
        // PERFORMANCE OPTIMIZATION: Update local state instead of context to prevent performance issues
        setLocalSectionData(prev => {
          const updated = cloneDeep(prev);
          const schoolEntry = updated.section12.entries[schoolIndex];

          if (!schoolEntry) {
            // console.warn(`⚠️ Section12Component: School entry ${schoolIndex} not found`);
            return prev;
          }

          if (degreeIndex < 0 || degreeIndex >= schoolEntry.degrees.length) {
            // console.warn(`⚠️ Section12Component: Degree index ${degreeIndex} out of bounds`);
            return prev;
          }

          schoolEntry.degrees.splice(degreeIndex, 1);
          // console.log(`✅ Section12Component: Removed degree ${degreeIndex} from school ${schoolIndex} in local state. Remaining degrees: ${schoolEntry.degrees.length}`);
          return updated;
        });

        // Mark that we have local changes
        setHasLocalChanges(true);
        // console.log(`✅ Section12Component: Removed degree ${degreeIndex} from school ${schoolIndex} (local state updated)`);
      }
    } finally {
      // Reset the flag after a short delay to allow for state updates
      setTimeout(() => {
        isRemovingDegreeRef.current = false;
        // console.log('🔄 Section12Component: handleRemoveDegree flag reset');
      }, 100);
    }
  }, []);

  // Enhanced education flag change handler - PERFORMANCE OPTIMIZED (Section 1 Gold Standard)
  // Updates local state only, context sync happens on submit
  const handleEducationFlagChange = useCallback((value: "YES" | "NO") => {
    if (isDebugMode) {
      // console.log('🎯 handleEducationFlagChange called (local update):', { value, currentValue: sectionData?.section12?.hasAttendedSchool?.value });
    }

    // Update local state instead of context to prevent performance issues
    setLocalSectionData(prev => {
      const updated = cloneDeep(prev);
      updated.section12.hasAttendedSchool.value = value;
      return updated;
    });

    // Mark that we have local changes
    setHasLocalChanges(true);

    if (isDebugMode) {
      // console.log('✅ Education flag updated locally');
    }

    // Note: Removed automatic entry addition - users can now add entries manually with the "Add School Entry" button
  }, [isDebugMode]);

  const handleHighSchoolFlagChange = useCallback((value: "YES" | "NO") => {
    if (isDebugMode) {
      // console.log('🎯 handleHighSchoolFlagChange called (local update):', { value, currentValue: sectionData?.section12?.hasAttendedSchoolOutsideUS?.value });
    }

    // Update local state instead of context to prevent performance issues
    setLocalSectionData(prev => {
      const updated = cloneDeep(prev);
      updated.section12.hasAttendedSchoolOutsideUS.value = value;

      if (value === "NO") {
        // Clear entries when flag changes to "NO"
        updated.section12.entries = [];
        // console.log('🧹 Cleared local entries when question 12.b set to NO');
      } else if (value === "YES" && updated.section12.entries.length === 0) {
        // Automatically add first entry when flag changes to "YES"
        const newEntry = {
          _id: Date.now(),
          createdAt: new Date(),
          updatedAt: new Date(),
          fromDate: { value: "" },
          toDate: { value: "" },
          fromDateEstimate: { value: false },
          toDateEstimate: { value: false },
          isPresent: { value: false },
          schoolType: { value: "High School" },
          schoolName: { value: "" },
          schoolAddress: { value: "" },
          schoolCity: { value: "" },
          schoolState: { value: "" },
          schoolZipCode: { value: "" },
          schoolCountry: { value: "United States" },
          receivedDegree: { value: "NO" },
          degrees: []
        };
        updated.section12.entries.push(newEntry);
        // console.log('✅ Auto-added first entry when question 12.b set to YES');
      }

      return updated;
    });

    // Mark that we have local changes
    setHasLocalChanges(true);

    // Handle expanded entries
    if (value === "NO") {
      setExpandedEntries(new Set());
    } else if (value === "YES") {
      // Expand the first entry when YES is selected
      setExpandedEntries(new Set([0]));
    }

    if (isDebugMode) {
      // console.log('✅ High school flag updated locally');
    }
  }, [isDebugMode]);

  // Save function to update SF86 context
  // FIXED: Removed sectionData dependency to prevent infinite loops
  const handleSaveSection = useCallback(() => {
    if (updateSectionData) {
      // Get current data fresh to avoid stale closure
      const currentData = sectionData;
      if (currentData) {
        updateSectionData('section12', currentData);
        // console.log('💾 Section 12 data saved to SF86 context');
      }
    }
  }, [updateSectionData]); // Removed sectionData dependency

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

  const renderSchoolEntry = (entry: SchoolEntry, index: number) => {
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
            {getSchoolEntryCount() > 1 && (
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
                  value={entry.fromDate.value || ""}
                  onChange={(e) =>
                    handleFieldUpdate(index, "fromDate.value", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${entryErrors.some(e => e.includes('fromDate')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                />
                <label className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={entry.fromDateEstimate.value || false}
                    onChange={(e) =>
                      handleFieldUpdate(index, "fromDateEstimate.value", e.target.checked)
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Estimated</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date (Month/Year)
                  {!entry.isPresent.value && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  placeholder="MM/YYYY"
                  value={entry.toDate.value || ""}
                  onChange={(e) =>
                    handleFieldUpdate(index, "toDate.value", e.target.value)
                  }
                  disabled={entry.isPresent.value}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${entryErrors.some(e => e.includes('toDate')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                />
                <div className="mt-2 space-y-1">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={entry.isPresent.value || false}
                      onChange={(e) => {
                        handleFieldUpdate(index, "isPresent.value", e.target.checked);
                        if (e.target.checked) {
                          handleFieldUpdate(index, "toDate.value", "");
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Present</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={entry.toDateEstimate.value || false}
                      onChange={(e) =>
                        handleFieldUpdate(index, "toDateEstimate.value", e.target.checked)
                      }
                      disabled={entry.isPresent.value}
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
                  handleFieldUpdate(index, "schoolType.value", e.target.value)
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
                  handleFieldUpdate(index, "schoolName.value", e.target.value)
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
                  value={entry.schoolAddress.value || ""}
                  onChange={(e) =>
                    handleFieldUpdate(index, "schoolAddress.value", e.target.value)
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
                    value={entry.schoolCity.value || ""}
                    onChange={(e) =>
                      handleFieldUpdate(index, "schoolCity.value", e.target.value)
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
                    value={entry.schoolState.value || ""}
                    onChange={(e) =>
                      handleFieldUpdate(index, "schoolState.value", e.target.value)
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
                    value={entry.schoolZipCode.value || ""}
                    onChange={(e) =>
                      handleFieldUpdate(index, "schoolZipCode.value", e.target.value)
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
                  value={entry.schoolCountry.value || ""}
                  onChange={(e) =>
                    handleFieldUpdate(index, "schoolCountry.value", e.target.value)
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
                      checked={entry.receivedDegree.value === "YES"}
                      onChange={() => handleFieldUpdate(index, "receivedDegree.value", "YES")}
                      className="mr-2"
                    />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`degree-received-${index}`}
                      checked={entry.receivedDegree.value === "NO"}
                      onChange={() => handleFieldUpdate(index, "receivedDegree.value", "NO")}
                      className="mr-2"
                    />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              </div>

              {entry.receivedDegree.value === "YES" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-md font-semibold text-gray-800">
                      Degree Information (up to 2 degrees per school)
                    </h4>
                    {entry.degrees.length < 2 && (
                      <button
                        type="button"
                        onClick={() => handleAddDegree(index)}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        Add Degree
                      </button>
                    )}
                  </div>

                  {/* Render degrees dynamically */}
                  {entry.degrees.length > 0 ? (
                    entry.degrees.map((degree, degreeIndex) => (
                      <div key={degreeIndex} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="text-sm font-semibold text-gray-700">
                            Degree #{degreeIndex + 1}
                          </h5>
                          <button
                            type="button"
                            onClick={() => handleRemoveDegree(index, degreeIndex)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Degree Type <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={degree?.degreeType?.value || ""}
                              onChange={(e) =>
                                handleFieldUpdate(index, `degrees[${degreeIndex}].degreeType.value`, e.target.value)
                              }
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${entryErrors.some(e => e.includes(`degreeType${degreeIndex + 1}`)) ? 'border-red-300 bg-red-50' : 'border-gray-300'
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
                              value={degree?.dateAwarded?.value || ""}
                              onChange={(e) =>
                                handleFieldUpdate(index, `degrees[${degreeIndex}].dateAwarded.value`, e.target.value)
                              }
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${entryErrors.some(e => e.includes(`degreeDate${degreeIndex + 1}`)) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                            />
                            <label className="flex items-center mt-2">
                              <input
                                type="checkbox"
                                checked={degree?.dateAwardedEstimate?.value || false}
                                onChange={(e) =>
                                  handleFieldUpdate(index, `degrees[${degreeIndex}].dateAwardedEstimate.value`, e.target.checked)
                                }
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-600">Estimated</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 mb-2">
                        No degrees added yet.
                      </p>
                      <p className="text-sm text-gray-400 mb-3">
                        Click "Add Degree" to add degree information for this school.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleAddDegree(index)}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                      >
                        Add First Degree
                      </button>
                    </div>
                  )}
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
                checked={localSectionData?.section12?.hasAttendedSchool?.value === "YES"}
                onChange={() => handleEducationFlagChange("YES")}
                className="mr-2"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasEducation"
                checked={localSectionData?.section12?.hasAttendedSchool?.value === "NO"}
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
                checked={localSectionData?.section12?.hasAttendedSchoolOutsideUS?.value === "YES"}
                onChange={() => handleHighSchoolFlagChange("YES")}
                className="mr-2"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasHighSchool"
                checked={localSectionData?.section12?.hasAttendedSchoolOutsideUS?.value === "NO"}
                onChange={() => handleHighSchoolFlagChange("NO")}
                className="mr-2"
              />
              <span className="text-sm">No (If NO to 12(a) and 12(b), proceed to Section 13A)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Education Entries - Only show when question 12.b (hasAttendedSchoolOutsideUS) is YES */}
      {localSectionData?.section12?.hasAttendedSchoolOutsideUS?.value === "YES" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Educational History
              </h3>
              <button
                type="button"
                onClick={handleAddEntry}
                disabled={localSectionData.section12.entries.length >= 3}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                title={localSectionData.section12.entries.length >= 3 ? "Maximum of 3 school entries allowed" : "Add new school entry"}
              >
                Add School Entry
                {localSectionData.section12.entries.length >= 3 && (
                  <span className="ml-1 text-xs">(Max: 3)</span>
                )}
              </button>
            </div>

            {/* Show entries or helpful message */}
            {localSectionData?.section12?.entries && localSectionData.section12.entries.length > 0 ? (
              localSectionData.section12.entries.map((entry, index) =>
                renderSchoolEntry(entry, index)
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
            {getSchoolEntryCount() > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-800 mb-2">Education Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Total Entries:</span> {getSchoolEntryCount()}
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
                      <li>Answer "Yes" to question 12.b to add education entries</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Local Changes Indicator - Performance Optimization Feature */}
      {(hasLocalChanges || hasPendingChanges()) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Unsaved Changes:</strong> You have local changes that haven't been saved yet. Click "Save & Continue" to save your progress.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show validation errors if any */}
      {globalErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {globalErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          (hasLocalChanges || hasPendingChanges())
            ? 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500'
            : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500'
        }`}
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : (hasLocalChanges || hasPendingChanges()) ? 'Save Changes & Continue' : 'Save & Continue'}
      </button>

      {/* Show instruction when no education flags are selected */}
      {localSectionData?.section12?.hasAttendedSchool?.value === "NO" &&
        localSectionData?.section12?.hasAttendedSchoolOutsideUS?.value === "NO" && (
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