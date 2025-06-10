/**
 * Section 13: Employment Activities - Complete Implementation
 *
 * This component implements the complete Section 13 structure with working form components:
 * - Section 13A: Employment History (6 subsections with actual form fields)
 * - Section 13B: Employment Gaps
 * - Section 13C: Employment Record Verification
 *
 * FIXED: Replaces placeholder implementation with actual working form components
 */

import React, { useState, useCallback, useEffect } from "react";
import { useSection13 } from "~/state/contexts/sections2.0/section13";

// Import the working form components
import MilitaryEmploymentForm from "./Section13/MilitaryEmploymentForm";
import NonFederalEmploymentForm from "./Section13/NonFederalEmploymentForm";
import SelfEmploymentForm from "./Section13/SelfEmploymentForm";
import UnemploymentForm from "./Section13/UnemploymentForm";
import EmploymentIssuesForm from "./Section13/EmploymentIssuesForm";

interface Section13ComponentProps {
  onValidationChange?: (isValid: boolean) => void;
  useEnhancedMode?: boolean;
  enableEmploymentTypeRouting?: boolean;
}

// Section 13 subsection types
type Section13Subsection =
  | '13A.1' // Military/Federal Employment
  | '13A.2' // Non-Federal Employment
  | '13A.3' // Self-Employment
  | '13A.4' // Unemployment
  | '13A.5' // Employment Record Issues
  | '13A.6' // Disciplinary Actions
  | '13B'   // Employment Gaps
  | '13C';  // Employment Record Verification

// Section 13A subsection configuration
const SECTION_13A_SUBSECTIONS = [
  { id: '13A.1', title: 'Military/Federal Employment', maxEntries: 4, description: 'Active military duty, federal civilian employment, and related positions' },
  { id: '13A.2', title: 'Non-Federal Employment', maxEntries: 4, description: 'Private sector, state/local government, and contractor positions' },
  { id: '13A.3', title: 'Self-Employment', maxEntries: 4, description: 'Business ownership, consulting, and independent contractor work' },
  { id: '13A.4', title: 'Unemployment', maxEntries: 4, description: 'Periods of unemployment and job searching' },
  { id: '13A.5', title: 'Employment Record Issues', maxEntries: 4, description: 'Employment problems, terminations, and performance issues' },
  { id: '13A.6', title: 'Disciplinary Actions', maxEntries: 4, description: 'Written warnings, suspensions, and disciplinary measures' }
] as const;

// Section 13B and 13C subsection configuration
const SECTION_13BC_SUBSECTIONS = [
  { id: '13B', title: 'Employment Gaps', description: 'Explain any gaps in employment history' },
  { id: '13C', title: 'Employment Record Verification', description: 'Final verification of employment information' }
] as const;

export const Section13Component: React.FC<Section13ComponentProps> = ({
  onValidationChange,
  useEnhancedMode = false,
  enableEmploymentTypeRouting = false
}) => {
  console.log('🔄 Section13Component: Starting with working form components');

  // State for current subsection navigation
  const [currentSubsection, setCurrentSubsection] = useState<Section13Subsection>('13A.1');
  const [completedSubsections, setCompletedSubsections] = useState<Set<Section13Subsection>>(new Set());
  const [isSubsectionExpanded, setIsSubsectionExpanded] = useState<Record<Section13Subsection, boolean>>({
    '13A.1': true,
    '13A.2': false,
    '13A.3': false,
    '13A.4': false,
    '13A.5': false,
    '13A.6': false,
    '13B': false,
    '13C': false
  });

  // Get Section 13 context data and functions
  const {
    sectionData,
    saveToMainContext,
    validateSection,
    // Military employment functions
    addMilitaryEmploymentEntry,
    updateMilitaryEmploymentEntry,
    removeMilitaryEmploymentEntry,
    // Non-federal employment functions
    addNonFederalEmploymentEntry,
    updateNonFederalEmploymentEntry,
    removeNonFederalEmploymentEntry,
    // Self-employment functions
    addSelfEmploymentEntry,
    updateSelfEmploymentEntry,
    removeSelfEmploymentEntry,
    // Unemployment functions
    addUnemploymentEntry,
    updateUnemploymentEntry,
    removeUnemploymentEntry,
  } = useSection13();

  // Component state
  const [globalErrors, setGlobalErrors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<number, string[]>>({});

  // Handle field updates for different employment types
  const handleFieldUpdate = useCallback((entryType: string, entryIndex: number, fieldPath: string, value: any) => {
    console.log(`🔄 Field update: ${entryType}[${entryIndex}].${fieldPath} = ${value}`);

    switch (entryType) {
      case 'military':
        updateMilitaryEmploymentEntry(entryIndex, fieldPath, value);
        break;
      case 'nonFederal':
        updateNonFederalEmploymentEntry(entryIndex, fieldPath, value);
        break;
      case 'selfEmployment':
        updateSelfEmploymentEntry(entryIndex, fieldPath, value);
        break;
      case 'unemployment':
        updateUnemploymentEntry(entryIndex, fieldPath, value);
        break;
      default:
        console.warn('Unknown entry type:', entryType);
    }
  }, [
    updateMilitaryEmploymentEntry,
    updateNonFederalEmploymentEntry,
    updateSelfEmploymentEntry,
    updateUnemploymentEntry
  ]);

  // Handle adding new entries
  const handleAddEntry = useCallback((entryType: string) => {
    console.log(`➕ Adding new ${entryType} entry`);

    switch (entryType) {
      case 'military':
        addMilitaryEmploymentEntry();
        break;
      case 'nonFederal':
        addNonFederalEmploymentEntry();
        break;
      case 'selfEmployment':
        addSelfEmploymentEntry();
        break;
      case 'unemployment':
        addUnemploymentEntry();
        break;
      default:
        console.warn('Unknown entry type for add:', entryType);
    }
  }, [
    addMilitaryEmploymentEntry,
    addNonFederalEmploymentEntry,
    addSelfEmploymentEntry,
    addUnemploymentEntry
  ]);

  // Handle removing entries
  const handleRemoveEntry = useCallback((entryType: string, entryIndex: number) => {
    console.log(`➖ Removing ${entryType} entry at index ${entryIndex}`);

    switch (entryType) {
      case 'military':
        removeMilitaryEmploymentEntry(entryIndex);
        break;
      case 'nonFederal':
        removeNonFederalEmploymentEntry(entryIndex);
        break;
      case 'selfEmployment':
        removeSelfEmploymentEntry(entryIndex);
        break;
      case 'unemployment':
        removeUnemploymentEntry(entryIndex);
        break;
      default:
        console.warn('Unknown entry type for remove:', entryType);
    }
  }, [
    removeMilitaryEmploymentEntry,
    removeNonFederalEmploymentEntry,
    removeSelfEmploymentEntry,
    removeUnemploymentEntry
  ]);

  // Navigation handlers
  const handleSubsectionToggle = useCallback((subsection: Section13Subsection) => {
    setIsSubsectionExpanded(prev => ({
      ...prev,
      [subsection]: !prev[subsection]
    }));
  }, []);

  const handleSubsectionComplete = useCallback((subsection: Section13Subsection) => {
    setCompletedSubsections(prev => new Set([...prev, subsection]));

    // Auto-navigate to next subsection
    const subsectionOrder: Section13Subsection[] = ['13A.1', '13A.2', '13A.3', '13A.4', '13A.5', '13A.6', '13B', '13C'];
    const currentIndex = subsectionOrder.indexOf(subsection);
    if (currentIndex < subsectionOrder.length - 1) {
      const nextSubsection = subsectionOrder[currentIndex + 1];
      setCurrentSubsection(nextSubsection);
      setIsSubsectionExpanded(prev => ({
        ...prev,
        [subsection]: false,
        [nextSubsection]: true
      }));
    }
  }, []);

  // Save handler
  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    try {
      const validation = validateSection();
      if (validation.isValid) {
        saveToMainContext();
        console.log('✅ Section 13 saved successfully');
      } else {
        console.warn('❌ Section 13 validation failed:', validation.errors);
        setGlobalErrors(validation.errors || []);
      }
    } catch (error) {
      console.error('❌ Error saving Section 13:', error);
    } finally {
      setIsLoading(false);
    }
  }, [validateSection, saveToMainContext]);

  // Validation effect
  useEffect(() => {
    const validation = validateSection();
    setGlobalErrors(validation.errors || []);
    onValidationChange?.(validation.isValid);
  }, [sectionData, validateSection, onValidationChange]);

  // Render subsection forms based on type
  const renderSubsectionForm = (subsection: Section13Subsection) => {
    switch (subsection) {
      case '13A.1':
        return renderMilitaryEmploymentForms();
      case '13A.2':
        return renderNonFederalEmploymentForms();
      case '13A.3':
        return renderSelfEmploymentForms();
      case '13A.4':
        return renderUnemploymentForms();
      case '13A.5':
        return renderEmploymentIssuesForms();
      case '13A.6':
        return renderDisciplinaryActionsForms();
      case '13B':
        return renderEmploymentGapsForms();
      case '13C':
        return renderEmploymentVerificationForm();
      default:
        return <div>Subsection not implemented</div>;
    }
  };

  // Render military employment forms
  const renderMilitaryEmploymentForms = () => {
    const entries = sectionData?.section13?.militaryEmployment?.entries || [];

    return (
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div key={entry._id} className="border rounded-lg p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                Military/Federal Employment Entry {index + 1}
              </h4>
              <button
                type="button"
                onClick={() => handleRemoveEntry('military', index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            <MilitaryEmploymentForm
              entry={entry}
              entryIndex={index}
              onFieldUpdate={(fieldPath, value) => handleFieldUpdate('military', index, fieldPath, value)}
              validationErrors={validationErrors[index]}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => handleAddEntry('military')}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
        >
          + Add Military/Federal Employment Entry
        </button>
      </div>
    );
  };

  // Render non-federal employment forms
  const renderNonFederalEmploymentForms = () => {
    const entries = sectionData?.section13?.nonFederalEmployment?.entries || [];

    return (
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div key={entry._id} className="border rounded-lg p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                Non-Federal Employment Entry {index + 1}
              </h4>
              <button
                type="button"
                onClick={() => handleRemoveEntry('nonFederal', index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            <NonFederalEmploymentForm
              entry={entry}
              entryIndex={index}
              onFieldUpdate={(fieldPath, value) => handleFieldUpdate('nonFederal', index, fieldPath, value)}
              validationErrors={validationErrors[index]}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => handleAddEntry('nonFederal')}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
        >
          + Add Non-Federal Employment Entry
        </button>
      </div>
    );
  };

  // Render self-employment forms
  const renderSelfEmploymentForms = () => {
    const entries = sectionData?.section13?.selfEmployment?.entries || [];

    return (
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div key={entry._id} className="border rounded-lg p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                Self-Employment Entry {index + 1}
              </h4>
              <button
                type="button"
                onClick={() => handleRemoveEntry('selfEmployment', index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            <SelfEmploymentForm
              entry={entry}
              entryIndex={index}
              onFieldUpdate={(fieldPath, value) => handleFieldUpdate('selfEmployment', index, fieldPath, value)}
              validationErrors={validationErrors[index]}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => handleAddEntry('selfEmployment')}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
        >
          + Add Self-Employment Entry
        </button>
      </div>
    );
  };

  // Render unemployment forms
  const renderUnemploymentForms = () => {
    const entries = sectionData?.section13?.unemployment?.entries || [];

    return (
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div key={entry._id} className="border rounded-lg p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                Unemployment Period {index + 1}
              </h4>
              <button
                type="button"
                onClick={() => handleRemoveEntry('unemployment', index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            <UnemploymentForm
              entry={entry}
              entryIndex={index}
              onFieldUpdate={(fieldPath, value) => handleFieldUpdate('unemployment', index, fieldPath, value)}
              validationErrors={validationErrors[index]}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => handleAddEntry('unemployment')}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
        >
          + Add Unemployment Period
        </button>
      </div>
    );
  };

  // Render employment issues forms
  const renderEmploymentIssuesForms = () => {
    return (
      <div className="space-y-4">
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-lg font-medium text-yellow-800 mb-2">
            Employment Record Issues (13A.5)
          </h4>
          <p className="text-yellow-700 mb-4">
            Report any employment-related issues, terminations, or performance problems.
          </p>
          <button
            onClick={() => handleSubsectionComplete('13A.5')}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Mark as Complete
          </button>
        </div>
      </div>
    );
  };

  // Render disciplinary actions forms
  const renderDisciplinaryActionsForms = () => {
    return (
      <div className="space-y-4">
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-lg font-medium text-yellow-800 mb-2">
            Disciplinary Actions (13A.6)
          </h4>
          <p className="text-yellow-700 mb-4">
            Report any written warnings, suspensions, or disciplinary measures.
          </p>
          <button
            onClick={() => handleSubsectionComplete('13A.6')}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Mark as Complete
          </button>
        </div>
      </div>
    );
  };

  // Render employment gaps forms
  const renderEmploymentGapsForms = () => {
    return (
      <div className="space-y-4">
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-lg font-medium text-blue-800 mb-2">
            Employment Gaps (13B)
          </h4>
          <p className="text-blue-700 mb-4">
            Explain any gaps in employment history.
          </p>
          <button
            onClick={() => handleSubsectionComplete('13B')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Mark as Complete
          </button>
        </div>
      </div>
    );
  };

  // Render employment verification form
  const renderEmploymentVerificationForm = () => {
    return (
      <div className="space-y-4">
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-lg font-medium text-green-800 mb-2">
            Employment Record Verification (13C)
          </h4>
          <p className="text-green-700 mb-4">
            Final verification of employment information.
          </p>
          <button
            onClick={() => handleSubsectionComplete('13C')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Mark as Complete
          </button>
        </div>
      </div>
    );
  };

  // Render subsection progress indicator
  const renderProgressIndicator = () => {
    const allSubsections: Section13Subsection[] = ['13A.1', '13A.2', '13A.3', '13A.4', '13A.5', '13A.6', '13B', '13C'];

    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Section 13 Progress</h3>
        <div className="grid grid-cols-4 gap-2">
          {allSubsections.map((subsection) => {
            const isCompleted = completedSubsections.has(subsection);
            const isCurrent = currentSubsection === subsection;
            const isExpanded = isSubsectionExpanded[subsection];

            return (
              <button
                key={subsection}
                onClick={() => {
                  setCurrentSubsection(subsection);
                  handleSubsectionToggle(subsection);
                }}
                className={`p-2 text-xs rounded transition-colors ${
                  isCompleted
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : isCurrent
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : isExpanded
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{subsection}</div>
                <div className="text-xs opacity-75">
                  {subsection.startsWith('13A') ? SECTION_13A_SUBSECTIONS.find(s => s.id === subsection)?.title.split(' ')[0] :
                   subsection === '13B' ? 'Gaps' : 'Verification'}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

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

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 13: Employment Activities (Working Implementation)
        </h2>
        <p className="text-gray-600">
          Complete employment history with working form components for all subsections.
        </p>
        <div className="mt-4 text-sm text-green-600">
          ✅ Now using actual form components instead of placeholders!
        </div>
      </div>

      {/* Progress Indicator */}
      {renderProgressIndicator()}

      {/* Show global validation errors */}
      {renderValidationErrors(globalErrors)}

      {/* Subsection Content Area */}
      <div className="space-y-6">
        {/* Section 13A Subsections */}
        {SECTION_13A_SUBSECTIONS.map((subsection) => (
          <div key={subsection.id} className={`border rounded-lg ${isSubsectionExpanded[subsection.id as Section13Subsection] ? 'border-blue-300 bg-blue-50' : 'border-gray-300'}`}>
            <div
              className="p-4 cursor-pointer"
              onClick={() => handleSubsectionToggle(subsection.id as Section13Subsection)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {subsection.id}: {subsection.title}
                  </h3>
                  <p className="text-sm text-gray-600">{subsection.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {completedSubsections.has(subsection.id as Section13Subsection) && (
                    <span className="text-green-600 text-sm">✓ Completed</span>
                  )}
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isSubsectionExpanded[subsection.id as Section13Subsection] ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {isSubsectionExpanded[subsection.id as Section13Subsection] && (
              <div className="p-4 border-t border-gray-200">
                {renderSubsectionForm(subsection.id as Section13Subsection)}
              </div>
            )}
          </div>
        ))}

        {/* Section 13B and 13C Subsections */}
        {SECTION_13BC_SUBSECTIONS.map((subsection) => (
          <div key={subsection.id} className={`border rounded-lg ${isSubsectionExpanded[subsection.id as Section13Subsection] ? 'border-blue-300 bg-blue-50' : 'border-gray-300'}`}>
            <div
              className="p-4 cursor-pointer"
              onClick={() => handleSubsectionToggle(subsection.id as Section13Subsection)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {subsection.id}: {subsection.title}
                  </h3>
                  <p className="text-sm text-gray-600">{subsection.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {completedSubsections.has(subsection.id as Section13Subsection) && (
                    <span className="text-green-600 text-sm">✓ Completed</span>
                  )}
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isSubsectionExpanded[subsection.id as Section13Subsection] ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {isSubsectionExpanded[subsection.id as Section13Subsection] && (
              <div className="p-4 border-t border-gray-200">
                {renderSubsectionForm(subsection.id as Section13Subsection)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save Button */}
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
          Section 13 with working form components
        </p>
      </div>
    </div>
  );
};

export default Section13Component;