/**
 * Section 12: Where You Went to School - Component
 *
 * This component renders the education history section of the SF-86 form,
 * allowing users to input their educational background including high school,
 * college, vocational schools, and correspondence/online education.
 */

import React, { useState, useCallback, useEffect, useRef, memo } from "react";
import { useSection12 } from "~/state/contexts/sections2.0/section12";
import { useSF86Form } from "~/state/contexts/sections2.0/SF86FormContext";
import { getUSStateOptions, getCountryOptions } from "../../../api/interfaces/sections2.0/base";
import type { SchoolEntry, Section12 } from "../../../api/interfaces/sections2.0/section12";
import {
  mapLogicalFieldToPdfField,
  getFieldMetadata,
  validateFieldExists,
  getNumericFieldId
} from "~/state/contexts/sections2.0/section12-field-mapping";

interface Section12ComponentProps {
  onValidationChange?: (isValid: boolean) => void;
}

// Use centralized US States from base.ts
const US_STATES = getUSStateOptions();

// Use centralized countries from base.ts
const COUNTRIES = getCountryOptions();

// ============================================================================
// CONDITIONAL RENDERING HELPERS (Applied from RenderResidencyInfo.tsx patterns)
// ============================================================================

/**
 * Determines if a field should be visible based on conditional logic
 */
const shouldShowField = (
  fieldType: string,
  entry: SchoolEntry,
  entryIndex: number,
  globalFlags?: { hasAttendedSchool?: string; hasAttendedSchoolOutsideUS?: string }
): boolean => {
  switch (fieldType) {
    case 'degreeFields':
      return entry.receivedDegree?.value === 'YES';

    case 'otherDegreeField':
      return entry.degrees.some(degree => degree.degreeType?.value === 'Other');

    case 'contactPersonFields':
      // Show contact person fields for schools attended in last 3 years
      const fromDate = entry.fromDate?.value;
      if (fromDate) {
        const [month, year] = fromDate.split('/').map(Number);
        const entryYear = year || 0;
        const currentYear = new Date().getFullYear();
        return (currentYear - entryYear) <= 3;
      }
      return false;

    case 'schoolEntries':
      return globalFlags?.hasAttendedSchoolOutsideUS === 'YES';

    case 'presentDateLogic':
      return !entry.isPresent?.value;

    default:
      return true;
  }
};

/**
 * Gets field validation state with conditional requirements
 */
const getFieldValidationState = (
  fieldPath: string,
  entry: SchoolEntry,
  entryIndex: number,
  errors: any[]
): { isRequired: boolean; hasError: boolean; errorMessage?: string } => {
  const hasError = errors.some(e => {
    const errorMessage = typeof e === 'string' ? e : e.message || String(e);
    return errorMessage.includes(fieldPath);
  });

  const errorMessage = hasError ?
    errors.find(e => {
      const msg = typeof e === 'string' ? e : e.message || String(e);
      return msg.includes(fieldPath);
    }) : undefined;

  // Conditional requirements based on field type and context
  let isRequired = false;

  if (fieldPath.includes('schoolName') || fieldPath.includes('fromDate')) {
    isRequired = true; // Always required
  } else if (fieldPath.includes('toDate')) {
    isRequired = !entry.isPresent?.value; // Required unless present is checked
  } else if (fieldPath.includes('otherDegree')) {
    isRequired = entry.degrees.some(degree => degree.degreeType?.value === 'Other');
  } else if (fieldPath.includes('degreeType') || fieldPath.includes('dateAwarded')) {
    isRequired = entry.receivedDegree?.value === 'YES';
  }

  return { isRequired, hasError, errorMessage };
};

const Section12Component: React.FC<Section12ComponentProps> = ({
  onValidationChange,
}) => {
  const {
    section12Data: contextData,
    updateField,
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
    updateSchoolTypeCheckbox,
    submitSectionData,
    hasPendingChanges,
  } = useSection12();

  // ============================================================================
  // FIXED: Use context data directly for proper data flow
  // ============================================================================

  // Use context data directly instead of local state to ensure proper data flow
  const sectionData = contextData;


  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Validate current context data
  const validateCurrentState = () => {
    const errors: string[] = [];
    const currentData = contextData;

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

  // Handle submission with data persistence - FIXED: Use context's submit mechanism
  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 Section12Component: handleSubmit called!');
    e.preventDefault();

    // Validate current context data
    const result = validateCurrentState();
    onValidationChange?.(result.isValid);

    console.log('🔍 Section 12 validation result:', result);
    console.log('📊 Section 12 context data before submission:', {
      hasAttendedSchool: contextData?.section12?.hasAttendedSchool?.value,
      hasAttendedSchoolOutsideUS: contextData?.section12?.hasAttendedSchoolOutsideUS?.value,
      entriesCount: contextData?.section12?.entries?.length || 0,
      entries: contextData?.section12?.entries?.map((entry, idx) => ({
        index: idx,
        schoolName: entry.schoolName?.value,
        fromDate: entry.fromDate?.value,
        toDate: entry.toDate?.value,
        degreesCount: entry.degrees?.length || 0
      }))
    });

    if (result.isValid) {
      console.log('🔄 Section 12: Starting data submission...');
      // Temporarily simplified for debugging
      alert('Section 12 data would be saved here');
    } else {
      // Show validation errors to user
      setGlobalErrors(result.errors);
      console.log('❌ Section 12 validation failed:', result.errors);
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

  // Enhanced logic to automatically manage school entries based on Yes/No answers
  // FIXED: Use refs to prevent infinite recursion and implement automatic entry management
  useEffect(() => {
    const hasEducationFlag = sectionData?.section12?.hasAttendedSchool?.value === "YES"; // Question 12.a
    const hasOtherEducationFlag = sectionData?.section12?.hasAttendedSchoolOutsideUS?.value === "YES"; // Question 12.b
    const entriesCount = getSchoolEntryCount();

    // Check if flags have actually changed to prevent infinite loops
    const educationFlagChanged = lastEducationFlagRef.current !== sectionData?.section12?.hasAttendedSchool?.value;
    const otherEducationFlagChanged = lastHighSchoolFlagRef.current !== sectionData?.section12?.hasAttendedSchoolOutsideUS?.value;

    // Only proceed if either flag has actually changed
    if (!educationFlagChanged && !otherEducationFlagChanged) {
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

      if (isDebugMode) {
        console.log('🎯 Section12: Processing flag changes', {
          hasEducationFlag,
          hasOtherEducationFlag,
          entriesCount,
          educationFlagChanged,
          otherEducationFlagChanged
        });
      }

      // Logic for automatic entry management:
      // 1. If 12.a = YES and 12.b = NO: Clear all entries (no additional education)
      // 2. If 12.a = YES and 12.b = YES: Add one entry automatically if none exist
      // 3. If 12.a = NO and 12.b = NO: Clear all entries (no education at all)
      // 4. If 12.a = NO and 12.b = YES: Add one entry automatically if none exist

      if (hasEducationFlag && !hasOtherEducationFlag) {
        // Case 1: YES to high school, NO to other education - clear all entries
        if (entriesCount > 0) {
          if (isDebugMode) {
            console.log('🧹 Section12: Clearing entries (YES high school, NO other education)');
          }
          while (getSchoolEntryCount() > 0) {
            removeSchoolEntry(0);
          }
          setExpandedEntries(new Set());
        }
      } else if (!hasEducationFlag && !hasOtherEducationFlag) {
        // Case 2: NO to both questions - clear all entries
        if (entriesCount > 0) {
          if (isDebugMode) {
            console.log('🧹 Section12: Clearing entries (NO to both questions)');
          }
          while (getSchoolEntryCount() > 0) {
            removeSchoolEntry(0);
          }
          setExpandedEntries(new Set());
        }
      } else if (hasOtherEducationFlag) {
        // Case 3 & 4: YES to other education (regardless of high school answer) - ensure at least one entry
        if (entriesCount === 0) {
          if (isDebugMode) {
            console.log('➕ Section12: Adding automatic entry (YES to other education)');
          }
          addSchoolEntry();
          // Expand the first entry when automatically added
          setExpandedEntries(new Set([0]));
        }
      }
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

  // Enhanced field update with validation - FIXED: Use context updateField method
  const handleFieldUpdate = useCallback((index: number, fieldPath: string, value: any) => {
    if (isDebugMode) {
      console.log('🔧 Section12: Updating field via context:', { index, fieldPath, value });
    }

    // Use context's updateField method for proper data flow
    const fullFieldPath = `section12.entries[${index}].${fieldPath}`;
    updateField(fullFieldPath, value);

    // Handle special cases for degree management
    if (fieldPath === "receivedDegree.value") {
      if (value === "YES") {
        // Auto-add first degree entry if none exist
        const currentEntry = contextData.section12.entries[index];
        if (currentEntry && currentEntry.degrees.length === 0) {
          addDegreeEntry(index);
          console.log(`✅ Auto-added first degree when receivedDegree set to YES for school ${index}`);
        }
      } else if (value === "NO") {
        // Clear all degrees when user selects "NO"
        const currentEntry = contextData.section12.entries[index];
        if (currentEntry && currentEntry.degrees.length > 0) {
          // Remove all degrees for this entry
          for (let i = currentEntry.degrees.length - 1; i >= 0; i--) {
            removeDegreeEntry(index, i);
          }
          console.log(`🧹 Cleared degrees when receivedDegree set to NO for school ${index}`);
        }
      }
    }

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
      return;
    }

    isAddingEntryRef.current = true;
    console.log('🎯 Section12Component: handleAddEntry called');

    try {
      // Use context's addSchoolEntry method for proper data flow
      addSchoolEntry();

      // Expand the new entry
      const newIndex = contextData.section12.entries.length;
      setExpandedEntries(prev => new Set([...prev, newIndex]));
      console.log(`✅ Section12Component: Added and expanded entry #${newIndex}`);
    } finally {
      // Reset the flag after a short delay to allow for state updates
      setTimeout(() => {
        isAddingEntryRef.current = false;
      }, 100);
    }
  }, [addSchoolEntry, contextData.section12.entries.length]);

  const handleRemoveEntry = useCallback((index: number) => {
    const hasOtherEducationFlag = sectionData?.section12?.hasAttendedSchoolOutsideUS?.value === "YES"; // Question 12.b
    const entriesCount = getSchoolEntryCount();

    if (isDebugMode) {
      console.log('🗑️ Section12: Remove entry requested', {
        index,
        hasOtherEducationFlag,
        entriesCount
      });
    }

    // Enhanced removal logic:
    // - If question 12.b is YES and this is the last entry, warn user but allow removal
    // - If question 12.b is NO, allow removal freely
    // - Always confirm before removal

    const isLastEntry = entriesCount === 1;
    const willNeedNewEntry = hasOtherEducationFlag && isLastEntry;

    let confirmMessage = "Are you sure you want to remove this education entry?";
    if (willNeedNewEntry) {
      confirmMessage += "\n\nNote: Since you answered YES to question 12.b, a new empty entry will be automatically added.";
    }

    if (window.confirm(confirmMessage)) {
      if (isDebugMode) {
        console.log('✅ Section12: User confirmed removal');
      }

      // Remove the entry
      removeSchoolEntry(index);

      // Update expanded entries
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

      // If this was the last entry and question 12.b is YES, add a new entry automatically
      if (willNeedNewEntry) {
        setTimeout(() => {
          if (isDebugMode) {
            console.log('➕ Section12: Adding replacement entry after removal');
          }
          addSchoolEntry();
          setExpandedEntries(new Set([0])); // Expand the new entry
        }, 100);
      }
    }
  }, [removeSchoolEntry, addSchoolEntry, getSchoolEntryCount, setExpandedEntries, isDebugMode, sectionData?.section12?.hasAttendedSchoolOutsideUS?.value]);

  // Degree management handlers - FIXED: Use context methods
  const handleAddDegree = useCallback((schoolIndex: number) => {
    // Prevent React Strict Mode double execution
    if (isAddingDegreeRef.current) {
      return;
    }

    isAddingDegreeRef.current = true;
    console.log(`🎯 Section12Component: handleAddDegree called for school ${schoolIndex}`);

    try {
      // Use context's addDegreeEntry method for proper data flow
      addDegreeEntry(schoolIndex);
      console.log(`✅ Section12Component: Added degree to school ${schoolIndex}`);
    } finally {
      // Reset the flag after a short delay to allow for state updates
      setTimeout(() => {
        isAddingDegreeRef.current = false;
      }, 100);
    }
  }, [addDegreeEntry]);

  const handleRemoveDegree = useCallback((schoolIndex: number, degreeIndex: number) => {
    // Prevent React Strict Mode double execution
    if (isRemovingDegreeRef.current) {
      return;
    }

    isRemovingDegreeRef.current = true;
    console.log(`🎯 Section12Component: handleRemoveDegree called for school ${schoolIndex}, degree ${degreeIndex}`);

    try {
      if (window.confirm("Are you sure you want to remove this degree?")) {
        // Use context's removeDegreeEntry method for proper data flow
        removeDegreeEntry(schoolIndex, degreeIndex);
        console.log(`✅ Section12Component: Removed degree ${degreeIndex} from school ${schoolIndex}`);
      }
    } finally {
      // Reset the flag after a short delay to allow for state updates
      setTimeout(() => {
        isRemovingDegreeRef.current = false;
      }, 100);
    }
  }, [removeDegreeEntry]);

  // Enhanced education flag change handler - FIXED: Use context method
  const handleEducationFlagChange = useCallback((value: "YES" | "NO") => {
    if (isDebugMode) {
      console.log('🎯 handleEducationFlagChange called:', { value, currentValue: sectionData?.section12?.hasAttendedSchool?.value });
    }

    // Use context's updateAttendedSchoolFlag method for proper data flow
    updateAttendedSchoolFlag(value);

    if (isDebugMode) {
      console.log('✅ Education flag updated via context');
    }
  }, [isDebugMode, updateAttendedSchoolFlag, sectionData?.section12?.hasAttendedSchool?.value]);

  const handleHighSchoolFlagChange = useCallback((value: "YES" | "NO") => {
    if (isDebugMode) {
      console.log('🎯 handleHighSchoolFlagChange called:', { value, currentValue: sectionData?.section12?.hasAttendedSchoolOutsideUS?.value });
    }

    // Use context's updateAttendedSchoolOutsideUSFlag method for proper data flow
    updateAttendedSchoolOutsideUSFlag(value);

    // Handle expanded entries
    if (value === "NO") {
      setExpandedEntries(new Set());
    } else if (value === "YES") {
      // Expand the first entry when YES is selected
      setExpandedEntries(new Set([0]));
    }

    if (isDebugMode) {
      console.log('✅ High school flag updated via context');
    }
  }, [isDebugMode, updateAttendedSchoolOutsideUSFlag, sectionData?.section12?.hasAttendedSchoolOutsideUS?.value]);

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

  // ============================================================================
  // ENHANCED FIELD RENDERING WITH CONDITIONAL LOGIC (Applied from RenderResidencyInfo.tsx)
  // ============================================================================

  /**
   * Renders a form field with conditional validation and field mapping
   */
  const renderFormField = useCallback((
    fieldConfig: {
      type: 'text' | 'select' | 'checkbox' | 'radio';
      label: string;
      fieldPath: string;
      value: any;
      options?: string[];
      placeholder?: string;
      disabled?: boolean;
      maxLength?: number;
    },
    entry: SchoolEntry,
    entryIndex: number,
    entryErrors: any[]
  ) => {
    const { isRequired, hasError, errorMessage } = getFieldValidationState(
      fieldConfig.fieldPath,
      entry,
      entryIndex,
      entryErrors
    );

    // Get PDF field mapping for debugging/validation
    const logicalPath = `section12.entries[${entryIndex}].${fieldConfig.fieldPath}`;
    const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
    const fieldMetadata = getFieldMetadata(pdfFieldName);
    const numericId = getNumericFieldId(pdfFieldName);

    const baseClassName = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'
    } ${fieldConfig.disabled ? 'disabled:bg-gray-100 disabled:cursor-not-allowed' : ''}`;

    const labelElement = (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {fieldConfig.label}
        {isRequired && <span className="text-red-500">*</span>}
        {isDebugMode && numericId && (
          <span className="ml-2 text-xs text-gray-400">
            (ID: {numericId})
          </span>
        )}
      </label>
    );

    switch (fieldConfig.type) {
      case 'text':
        return (
          <div key={fieldConfig.fieldPath}>
            {/* {labelElement} */}
            <input
              type="text"
              value={fieldConfig.value || ""}
              onChange={(e) => handleFieldUpdate(entryIndex, `${fieldConfig.fieldPath}.value`, e.target.value)}
              className={baseClassName}
              placeholder={fieldConfig.placeholder}
              maxLength={fieldConfig.maxLength}
              disabled={fieldConfig.disabled}
            />
            {hasError && errorMessage && (
              <p className="mt-1 text-sm text-red-600">{String(errorMessage)}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={fieldConfig.fieldPath}>
            {/* {labelElement} */}
            <select
              value={fieldConfig.value || ""}
              onChange={(e) => handleFieldUpdate(entryIndex, `${fieldConfig.fieldPath}.value`, e.target.value)}
              className={baseClassName}
              disabled={fieldConfig.disabled}
            >
              <option value="">Select {fieldConfig.label.toLowerCase()}...</option>
              {fieldConfig.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {hasError && errorMessage && (
              <p className="mt-1 text-sm text-red-600">{String(errorMessage)}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={fieldConfig.fieldPath}>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={fieldConfig.value || false}
                onChange={(e) => handleFieldUpdate(entryIndex, `${fieldConfig.fieldPath}.value`, e.target.checked)}
                className="mr-2"
                disabled={fieldConfig.disabled}
              />
              <span className="text-sm text-gray-600">{fieldConfig.label}</span>
              {/* {isDebugMode && numericId && (
                <span className="ml-2 text-xs text-gray-400">
                  (ID: {numericId})
                </span>
              )} */}
            </label>
            {hasError && errorMessage && (
              <p className="mt-1 text-sm text-red-600">{String(errorMessage)}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  }, [handleFieldUpdate, isDebugMode]);

  const renderSchoolEntry = (entry: SchoolEntry, index: number) => {
    const isExpanded = expandedEntries.has(index);
    const entryErrors = validationErrors[index] || [];
    const globalFlags = {
      hasAttendedSchool: sectionData?.section12?.hasAttendedSchool?.value,
      hasAttendedSchoolOutsideUS: sectionData?.section12?.hasAttendedSchoolOutsideUS?.value
    };

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
            <button
              type="button"
              onClick={() => handleRemoveEntry(index)}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              title="Remove this education entry"
            >
              Remove
            </button>
          </div>
        </div>

        {/* Show validation errors for this entry */}
        {renderValidationErrors(entryErrors)}

        {isExpanded && (
          <div className="space-y-6">
            {/* Attendance Dates - Enhanced with Conditional Logic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {renderFormField({
                  type: 'text',
                  label: 'From Date (Month/Year)',
                  fieldPath: 'fromDate',
                  value: entry.fromDate.value,
                  placeholder: 'MM/YYYY'
                }, entry, index, entryErrors)}

                {renderFormField({
                  type: 'checkbox',
                  label: 'Estimated',
                  fieldPath: 'fromDateEstimate',
                  value: entry.fromDateEstimate.value
                }, entry, index, entryErrors)}
              </div>

              <div>
                {renderFormField({
                  type: 'text',
                  label: 'To Date (Month/Year)',
                  fieldPath: 'toDate',
                  value: entry.toDate.value,
                  placeholder: 'MM/YYYY',
                  disabled: entry.isPresent?.value
                }, entry, index, entryErrors)}

                <div className="mt-2 space-y-1">
                  {renderFormField({
                    type: 'checkbox',
                    label: 'Present',
                    fieldPath: 'isPresent',
                    value: entry.isPresent.value
                  }, entry, index, entryErrors)}

                  {renderFormField({
                    type: 'checkbox',
                    label: 'Estimated',
                    fieldPath: 'toDateEstimate',
                    value: entry.toDateEstimate.value,
                    disabled: entry.isPresent?.value
                  }, entry, index, entryErrors)}
                </div>
              </div>
            </div>

            {/* School Type Checkboxes - Match Official SF-86 Form */}
            <div className="space-y-4">
              <h5 className="text-md font-medium text-gray-800">
                Select the most appropriate code to describe your school
                <span className="text-red-500 ml-1">*</span>
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={entry.schoolTypes?.highSchool?.value || false}
                    onChange={(e) => updateSchoolTypeCheckbox(index, 'highSchool', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">High School</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={entry.schoolTypes?.vocationalTechnicalTrade?.value || false}
                    onChange={(e) => updateSchoolTypeCheckbox(index, 'vocationalTechnicalTrade', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Vocational/Technical/Trade School</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={entry.schoolTypes?.collegeUniversityMilitary?.value || false}
                    onChange={(e) => updateSchoolTypeCheckbox(index, 'collegeUniversityMilitary', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">College/University/Military College</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={entry.schoolTypes?.correspondenceDistanceOnline?.value || false}
                    onChange={(e) => updateSchoolTypeCheckbox(index, 'correspondenceDistanceOnline', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Correspondence/Distance/Extension/Online School</span>
                </label>
              </div>
              {/* Show validation error if no school type is selected */}
              {entryErrors.some(error => error.includes('school type')) && (
                <p className="text-sm text-red-600 mt-1">
                  At least one school type must be selected
                </p>
              )}
            </div>

            {renderFormField({
              type: 'text',
              label: 'School Name',
              fieldPath: 'schoolName',
              value: entry.schoolName.value,
              placeholder: 'Enter the complete name of the school',
              maxLength: 100
            }, entry, index, entryErrors)}

            {/* School Address - Enhanced with Field Mapping */}
            <div className="space-y-4">
              <h5 className="text-md font-medium text-gray-800">School Address</h5>

              {renderFormField({
                type: 'text',
                label: 'Street Address',
                fieldPath: 'schoolAddress',
                value: entry.schoolAddress.value,
                placeholder: 'Enter street address',
                maxLength: 200
              }, entry, index, entryErrors)}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderFormField({
                  type: 'text',
                  label: 'City',
                  fieldPath: 'schoolCity',
                  value: entry.schoolCity.value,
                  placeholder: 'Enter city'
                }, entry, index, entryErrors)}

                {renderFormField({
                  type: 'select',
                  label: 'State',
                  fieldPath: 'schoolState',
                  value: entry.schoolState.value,
                  options: US_STATES.map(state => state.value)
                }, entry, index, entryErrors)}

                {renderFormField({
                  type: 'text',
                  label: 'ZIP Code',
                  fieldPath: 'schoolZipCode',
                  value: entry.schoolZipCode.value,
                  placeholder: 'Enter ZIP code'
                }, entry, index, entryErrors)}
              </div>

              {renderFormField({
                type: 'select',
                label: 'Country',
                fieldPath: 'schoolCountry',
                value: entry.schoolCountry.value,
                options: COUNTRIES.map(country => country.value)
              }, entry, index, entryErrors)}
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

              {/* Conditional Degree Information - Enhanced with Field Mapping */}
              {shouldShowField('degreeFields', entry, index, globalFlags) && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-md font-semibold text-gray-800">
                      Degree Information (up to 2 degrees per school)
                      {isDebugMode && (
                        <span className="ml-2 text-xs text-gray-400">
                          (Conditional: receivedDegree === YES)
                        </span>
                      )}
                    </h4>
                    {entry.degrees.length < 2 && (
                      <button
                        type="button"
                        onClick={() => handleAddDegree(index)}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        title="Add another degree (max 2 per school)"
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

                            {/* Conditional "Other degree" field - Enhanced with Field Mapping */}
                            {shouldShowField('otherDegreeField', entry, index, globalFlags) &&
                             degree?.degreeType?.value === "Other" && (
                              <div className="mt-3">
                                {renderFormField({
                                  type: 'text',
                                  label: 'Other Degree Type',
                                  fieldPath: `degrees[${degreeIndex}].otherDegree`,
                                  value: degree?.otherDegree?.value,
                                  placeholder: 'Specify other degree type'
                                }, entry, index, entryErrors)}
                              </div>
                            )}
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

            {/* Conditional Contact Person Information - Enhanced with Field Mapping */}
            {shouldShowField('contactPersonFields', entry, index, globalFlags) && (
              <div className="space-y-4 border-t pt-4">
                <h5 className="text-md font-medium text-gray-800">
                  Contact Person Information
                  {isDebugMode && (
                    <span className="ml-2 text-xs text-gray-400">
                      (Conditional: School attended within last 3 years)
                    </span>
                  )}
                </h5>
                <p className="text-sm text-gray-600">
                  For schools you attended in the last 3 years, list a person who knew you at the school (instructor, student, etc.).
                  Do not list people for education periods completed more than 3 years ago.
                </p>

              {/* I don't know checkbox */}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={entry.contactPerson?.unknownPerson?.value || false}
                    onChange={(e) =>
                      handleFieldUpdate(index, "contactPerson.unknownPerson.value", e.target.checked)
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">I don't know</span>
                </label>
              </div>

              {/* Contact person fields - only show if not unknown */}
              {!entry.contactPerson?.unknownPerson?.value && (
                <div className="space-y-4">
                  {/* Name fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={entry.contactPerson?.lastName?.value || ""}
                        onChange={(e) =>
                          handleFieldUpdate(index, "contactPerson.lastName.value", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          entryErrors.some(e => e.includes('contact') && e.includes('last name')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={entry.contactPerson?.firstName?.value || ""}
                        onChange={(e) =>
                          handleFieldUpdate(index, "contactPerson.firstName.value", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          entryErrors.some(e => e.includes('contact') && e.includes('first name')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter first name"
                      />
                    </div>
                  </div>

                  {/* Address fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={entry.contactPerson?.address?.value || ""}
                      onChange={(e) =>
                        handleFieldUpdate(index, "contactPerson.address.value", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        entryErrors.some(e => e.includes('contact') && e.includes('address')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter street address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={entry.contactPerson?.city?.value || ""}
                        onChange={(e) =>
                          handleFieldUpdate(index, "contactPerson.city.value", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          entryErrors.some(e => e.includes('contact') && e.includes('city')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={entry.contactPerson?.state?.value || ""}
                        onChange={(e) =>
                          handleFieldUpdate(index, "contactPerson.state.value", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          entryErrors.some(e => e.includes('contact') && e.includes('state')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select state...</option>
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
                        value={entry.contactPerson?.zipCode?.value || ""}
                        onChange={(e) =>
                          handleFieldUpdate(index, "contactPerson.zipCode.value", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter ZIP code"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={entry.contactPerson?.country?.value || ""}
                      onChange={(e) =>
                        handleFieldUpdate(index, "contactPerson.country.value", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        entryErrors.some(e => e.includes('contact') && e.includes('country')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      {COUNTRIES.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Contact methods */}
                  <div className="space-y-4">
                    <h6 className="text-sm font-medium text-gray-800">Contact Information</h6>

                    {/* Phone number, Extension, Day/Night, and Email - Inline Layout per SF-86 */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* Phone Number */}
                      <div className="lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={entry.contactPerson?.phoneNumber?.value || ""}
                          onChange={(e) =>
                            handleFieldUpdate(index, "contactPerson.phoneNumber.value", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter phone number"
                        />
                      </div>

                      {/* Extension */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Extension
                        </label>
                        <input
                          type="text"
                          value={entry.contactPerson?.phoneExtension?.value || ""}
                          onChange={(e) =>
                            handleFieldUpdate(index, "contactPerson.phoneExtension.value", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ext"
                        />
                      </div>

                      {/* Phone Options & Day/Night Attendance - Inline per SF-86 */}
                      <div className="lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Options & Attendance
                        </label>
                        <div className="space-y-1">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={entry.contactPerson?.isInternationalPhone?.value || false}
                              onChange={(e) =>
                                handleFieldUpdate(index, "contactPerson.isInternationalPhone.value", e.target.checked)
                              }
                              className="mr-2"
                            />
                            <span className="text-xs text-gray-700">International or DSN phone number</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={entry.dayAttendance?.value || false}
                              onChange={(e) =>
                                handleFieldUpdate(index, "dayAttendance.value", e.target.checked)
                              }
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Day</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={entry.nightAttendance?.value || false}
                              onChange={(e) =>
                                handleFieldUpdate(index, "nightAttendance.value", e.target.checked)
                              }
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Night</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={entry.contactPerson?.unknownPhone?.value || false}
                              onChange={(e) =>
                                handleFieldUpdate(index, "contactPerson.unknownPhone.value", e.target.checked)
                              }
                              className="mr-2"
                            />
                            <span className="text-xs text-gray-700">I don't know</span>
                          </label>
                        </div>
                      </div>

                      {/* Email Address */}
                      <div className="lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={entry.contactPerson?.email?.value || ""}
                          onChange={(e) =>
                            handleFieldUpdate(index, "contactPerson.email.value", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter email address"
                        />
                      </div>

                      {/* Email Options */}
                      <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Options
                        </label>
                        <div className="space-y-1">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={entry.contactPerson?.unknownEmail?.value || false}
                              onChange={(e) =>
                                handleFieldUpdate(index, "contactPerson.unknownEmail.value", e.target.checked)
                              }
                              className="mr-2"
                            />
                            <span className="text-xs text-gray-700">I don't know</span>
                          </label>
                        </div>
                      </div>
                    </div>


                  </div>
                </div>
              )}
              </div>
            )}

            {/* Day/Night Attendance for entries without contact person - Compact inline format */}
            {!shouldShowField('contactPersonFields', entry, index, globalFlags) && (
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attendance Schedule
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={entry.dayAttendance?.value || false}
                          onChange={(e) =>
                            handleFieldUpdate(index, "dayAttendance.value", e.target.checked)
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Day</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={entry.nightAttendance?.value || false}
                          onChange={(e) =>
                            handleFieldUpdate(index, "nightAttendance.value", e.target.checked)
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Night</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                checked={sectionData?.section12?.hasAttendedSchool?.value === "YES"}
                onChange={() => handleEducationFlagChange("YES")}
                className="mr-2"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasEducation"
                checked={sectionData?.section12?.hasAttendedSchool?.value === "NO"}
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
                checked={sectionData?.section12?.hasAttendedSchoolOutsideUS?.value === "YES"}
                onChange={() => handleHighSchoolFlagChange("YES")}
                className="mr-2"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasHighSchool"
                checked={sectionData?.section12?.hasAttendedSchoolOutsideUS?.value === "NO"}
                onChange={() => handleHighSchoolFlagChange("NO")}
                className="mr-2"
              />
              <span className="text-sm">No (If NO to 12(a) and 12(b), proceed to Section 13A)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Education Entries - Only show when question 12.b (hasAttendedSchoolOutsideUS) is YES */}
      {sectionData?.section12?.hasAttendedSchoolOutsideUS?.value === "YES" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Educational History
              </h3>
              <button
                type="button"
                onClick={handleAddEntry}
                disabled={sectionData.section12.entries.length >= 4}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                title={sectionData.section12.entries.length >= 4 ? "Maximum of 4 school entries allowed" : "Add new school entry"}
              >
                Add School Entry
                {sectionData.section12.entries.length >= 4 && (
                  <span className="ml-1 text-xs">(Max: 4)</span>
                )}
              </button>
            </div>

            {/* Show entries or helpful message */}
            {sectionData?.section12?.entries && sectionData.section12.entries.length > 0 ? (
              sectionData.section12.entries.map((entry, index) =>
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

      {/* Pending Changes Indicator */}
      {hasPendingChanges() && (
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
          hasPendingChanges()
            ? 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500'
            : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500'
        }`}
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : hasPendingChanges() ? 'Save Changes & Continue' : 'Save & Continue'}
      </button>

      {/* Show instruction when no education flags are selected */}
      {sectionData?.section12?.hasAttendedSchool?.value === "NO" &&
        sectionData?.section12?.hasAttendedSchoolOutsideUS?.value === "NO" && (
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

// Use memo to optimize rendering performance (Applied from RenderResidencyInfo.tsx pattern)
const MemoizedSection12Component = memo(Section12Component);

export default MemoizedSection12Component;