/**
 * Section 21: Psychological and Emotional Health Component
 *
 * This component follows the established data flow pattern:
 * User Input → handleFieldChange → updateSection21Field → Section Context → SF86FormContext → IndexedDB
 *
 * Features:
 * - Mental health consultation subsections
 * - Court-ordered treatment tracking
 * - Professional information capture
 * - Dynamic entry management
 * - Validation integration
 * - PDF generation compatibility
 */

import React, { useState, useCallback } from 'react';
import { useSection21 } from '../../state/contexts/sections2.0/section21';
import { useSF86Form } from '../../state/contexts/SF86FormContext';
import type {
  Section21SubsectionKey,
  MentalHealthEntry,
  CourtOrderedTreatmentEntry
} from '../../../api/interfaces/sections2.0/section21';

// ============================================================================
// MENTAL HEALTH SUBSECTION COMPONENT
// ============================================================================

interface MentalHealthSubsectionProps {
  subsectionKey: Section21SubsectionKey;
  title: string;
  description: string;
  isCourtOrdered?: boolean;
}

const MentalHealthSubsection: React.FC<MentalHealthSubsectionProps> = ({
  subsectionKey,
  title,
  description,
  isCourtOrdered = false
}) => {
  const section21 = useSection21();
  const sf86Form = useSF86Form();

  // Get subsection data
  const subsectionData = section21.section21Data?.section21?.[subsectionKey];
  const hasFlag = isCourtOrdered
    ? (subsectionData as any)?.hasCourtOrdered?.value || 'NO'
    : (subsectionData as any)?.hasConsultation?.value || 'NO';
  const entries = subsectionData?.entries || [];

  // Debug logging for radio button state (reduced for cleaner console)
  console.log(`🔍 Section21 ${subsectionKey}: hasFlag=${hasFlag}, entries=${entries.length}`);

  // Handle flag change (YES/NO)
  const handleFlagChange = useCallback((value: 'YES' | 'NO') => {
    console.log('🎯 Section21Component handleFlagChange called:', { subsectionKey, value });
    // console.log('🎯 Section21Component current section data before flag change:', JSON.stringify(section21.section21Data, null, 2));

    // Follow the data flow: User Input → handleFieldChange → updateSection21Field
    section21.updateSubsectionFlag(subsectionKey, value);

    console.log('🎯 Section21Component section data after updateSubsectionFlag:', JSON.stringify(section21.section21Data, null, 2));

    // Update in global form context
    sf86Form.updateSectionData('section21', section21.section21Data);
    console.log('🎯 Section21Component called sf86Form.updateSectionData with:', JSON.stringify(section21.section21Data, null, 2));
  }, [section21, subsectionKey, sf86Form]);

  // Handle field changes in entries
  const handleFieldChange = useCallback((entryIndex: number, fieldPath: string, newValue: any) => {
    console.log('🎯 Section21Component handleFieldChange called:', { subsectionKey, entryIndex, fieldPath, newValue });
    console.log('🎯 Section21Component current section data before field change:', JSON.stringify(section21.section21Data, null, 2));

    // Follow the data flow pattern
    section21.updateEntryField(subsectionKey, entryIndex, fieldPath, newValue);

    console.log('🎯 Section21Component section data after updateEntryField:', JSON.stringify(section21.section21Data, null, 2));

    // Update in global form context
    sf86Form.updateSectionData('section21', section21.section21Data);
    console.log('🎯 Section21Component called sf86Form.updateSectionData with:', JSON.stringify(section21.section21Data, null, 2));
  }, [section21, subsectionKey, sf86Form]);

  // Add new entry
  const handleAddEntry = useCallback(() => {
    section21.addEntry(subsectionKey);

    // Update in global form context
    sf86Form.updateSectionData('section21', section21.section21Data);
  }, [section21, subsectionKey, sf86Form]);

  // Remove entry
  const handleRemoveEntry = useCallback((entryIndex: number) => {
    section21.removeEntry(subsectionKey, entryIndex);

    // Update in global form context
    sf86Form.updateSectionData('section21', section21.section21Data);
  }, [section21, subsectionKey, sf86Form]);

  const flagFieldName = isCourtOrdered ? 'court_ordered_treatment' : 'mental_health_consultation';

  return (
    <div className="mental-health-subsection border rounded-lg p-6 mb-6 bg-white shadow-sm">
      <div className="subsection-header mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      {/* YES/NO Flag Selection */}
      <div className="flag-selection mb-4">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700">
            {description}
          </legend>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name={`${flagFieldName}_flag`}
                value="NO"
                checked={hasFlag === 'NO'}
                onChange={() => handleFlagChange('NO')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">No</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={`${flagFieldName}_flag`}
                value="YES"
                checked={hasFlag === 'YES'}
                onChange={() => handleFlagChange('YES')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Yes</span>
            </label>
          </div>
        </fieldset>
      </div>

      {/* Entry Forms (shown when YES is selected) */}
      {hasFlag === 'YES' && (
        <div className="entries-section">
          <div className="entries-header flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-800">
              {title} Details ({entries.length} {entries.length === 1 ? 'entry' : 'entries'})
            </h4>
            <button
              type="button"
              onClick={handleAddEntry}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add {title}
            </button>
          </div>

          {/* Entry List */}
          {entries.length === 0 ? (
            <div className="no-entries text-center py-8 text-gray-500">
              <p>No {title.toLowerCase()} entries yet.</p>
              <p className="text-sm">Click "Add {title}" to get started.</p>
            </div>
          ) : (
            <div className="entries-list space-y-4">
              {entries.map((entry: any, index: number) => (
                <MentalHealthEntryForm
                  key={entry._id?.value || index}
                  entry={entry}
                  entryIndex={index}
                  isCourtOrdered={isCourtOrdered}
                  onFieldChange={(fieldPath, newValue) =>
                    handleFieldChange(index, fieldPath, newValue)
                  }
                  onRemove={() => handleRemoveEntry(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MENTAL HEALTH ENTRY FORM COMPONENT
// ============================================================================

interface MentalHealthEntryFormProps {
  entry: MentalHealthEntry | CourtOrderedTreatmentEntry;
  entryIndex: number;
  isCourtOrdered: boolean;
  onFieldChange: (fieldPath: string, newValue: any) => void;
  onRemove: () => void;
}

const MentalHealthEntryForm: React.FC<MentalHealthEntryFormProps> = ({
  entry,
  entryIndex,
  isCourtOrdered,
  onFieldChange,
  onRemove
}) => {
  return (
    <div className="entry-form border border-gray-200 rounded p-4 bg-gray-50">
      <div className="entry-header mb-3 flex justify-between items-center">
        <h5 className="text-sm font-medium text-gray-700">
          Entry #{entryIndex + 1}
        </h5>
        <button
          type="button"
          onClick={onRemove}
          className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
        >
          Remove
        </button>
      </div>

      <div className="form-grid grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reason Field */}
        {'reason' in entry && (
          <div className="form-field md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Reason for Consultation/Treatment *
            </label>
            <textarea
              value={entry.reason?.value || ''}
              onChange={(e) => onFieldChange('reason.value', e.target.value)}
              placeholder="Describe the reason for mental health consultation or treatment..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}

        {/* Consultation Type (for regular mental health entries) */}
        {!isCourtOrdered && 'consultationType' in entry && (
          <div className="form-field">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Type of Consultation
            </label>
            <select
              value={entry.consultationType?.value || ''}
              onChange={(e) => onFieldChange('consultationType.value', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type...</option>
              <option value="consultation">Consultation</option>
              <option value="treatment">Treatment</option>
              <option value="counseling">Counseling</option>
              <option value="hospitalization">Hospitalization</option>
              <option value="court_ordered">Court Ordered</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}

        {/* Diagnosis */}
        {'diagnosis' in entry && (
          <div className="form-field">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Diagnosis (if any)
            </label>
            <input
              type="text"
              value={entry.diagnosis?.value || ''}
              onChange={(e) => onFieldChange('diagnosis.value', e.target.value)}
              placeholder="Enter diagnosis if provided..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Date Range */}
        {!isCourtOrdered && 'dateRange' in entry && (
          <>
            <div className="form-field">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={entry.dateRange?.from?.date?.value || ''}
                onChange={(e) => onFieldChange('dateRange.from.date.value', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="form-field">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={entry.dateRange?.to?.date?.value || ''}
                onChange={(e) => onFieldChange('dateRange.to.date.value', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-1">
                <label className="flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={entry.dateRange?.present?.value || false}
                    onChange={(e) => onFieldChange('dateRange.present.value', e.target.checked)}
                    className="mr-1"
                  />
                  Ongoing/Present
                </label>
              </div>
            </div>
          </>
        )}

        {/* Court Information (for court-ordered entries) */}
        {isCourtOrdered && 'courtName' in entry && (
          <>
            <div className="form-field">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Court Name *
              </label>
              <input
                type="text"
                value={entry.courtName?.value || ''}
                onChange={(e) => onFieldChange('courtName.value', e.target.value)}
                placeholder="Enter court name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="form-field">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Order Date *
              </label>
              <input
                type="date"
                value={entry.orderDate?.date?.value || ''}
                onChange={(e) => onFieldChange('orderDate.date.value', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </>
        )}

        {/* Professional Information (for regular entries) */}
        {!isCourtOrdered && 'professionalInfo' in entry && (
          <>
            <div className="form-field md:col-span-2">
              <h6 className="text-xs font-medium text-gray-700 mb-2">Professional Information</h6>
            </div>
            <div className="form-field">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Professional's Last Name *
              </label>
              <input
                type="text"
                value={entry.professionalInfo?.name?.last?.value || ''}
                onChange={(e) => onFieldChange('professionalInfo.name.last.value', e.target.value)}
                placeholder="Last name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="form-field">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Professional's First Name
              </label>
              <input
                type="text"
                value={entry.professionalInfo?.name?.first?.value || ''}
                onChange={(e) => onFieldChange('professionalInfo.name.first.value', e.target.value)}
                placeholder="First name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="form-field">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Title/Position
              </label>
              <input
                type="text"
                value={entry.professionalInfo?.title?.value || ''}
                onChange={(e) => onFieldChange('professionalInfo.title.value', e.target.value)}
                placeholder="e.g., Psychiatrist, Psychologist, Counselor..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="form-field">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Organization/Practice
              </label>
              <input
                type="text"
                value={entry.professionalInfo?.organization?.value || ''}
                onChange={(e) => onFieldChange('professionalInfo.organization.value', e.target.value)}
                placeholder="Organization or practice name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Medication Information */}
        {'medicationPrescribed' in entry && (
          <>
            <div className="form-field md:col-span-2">
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={entry.medicationPrescribed?.value || false}
                  onChange={(e) => onFieldChange('medicationPrescribed.value', e.target.checked)}
                  className="mr-2"
                />
                Medication was prescribed
              </label>
            </div>
            {entry.medicationPrescribed?.value && (
              <div className="form-field md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Medication Details
                </label>
                <textarea
                  value={entry.medicationDetails?.value || ''}
                  onChange={(e) => onFieldChange('medicationDetails.value', e.target.value)}
                  placeholder="Describe the medication(s) prescribed..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN SECTION 21 COMPONENT
// ============================================================================

export const Section21Component: React.FC = () => {
  const section21 = useSection21();
  const sf86Form = useSF86Form();
  const [isLoading, setIsLoading] = useState(false);

  // Validation and submission
  const handleValidateAndContinue = useCallback(async () => {
    setIsLoading(true);

    try {
      // Validate section
      const validationResult = section21.validateSection();

      if (validationResult.isValid) {
        // Update global form data
        sf86Form.updateSectionData('section21', section21.section21Data);

        // Save form
        await sf86Form.saveForm();

        // Mark section as complete
        sf86Form.markSectionComplete('section21');

        console.log('✅ Section 21 validated and saved successfully');
      } else {
        console.warn('⚠️ Section 21 validation failed:', validationResult.errors);
      }
    } catch (error) {
      console.error('❌ Error validating Section 21:', error);
    } finally {
      setIsLoading(false);
    }
  }, [section21, sf86Form]);

  return (
    <div className="section21-component max-w-4xl mx-auto p-6">
      {/* Section Header */}
      <div className="section-header mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Section 21: Psychological and Emotional Health
        </h1>
        <p className="text-gray-600">
          Report any mental health consultations, diagnoses, treatments, hospitalizations,
          court-ordered mental health treatment, and other psychological/emotional health issues.
        </p>

        {/* Summary Stats */}
        <div className="stats-summary mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="font-medium">Total Mental Health Entries:</span>
              <span className="ml-1 text-blue-600">
                {section21.getTotalMentalHealthEntries()}
              </span>
            </div>
            <div>
              <span className="font-medium">Mental Health Issues Reported:</span>
              <span className="ml-1">{section21.hasAnyMentalHealthIssues() ? 'Yes' : 'None'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mental Health Subsections */}
      <div className="subsections">
        <MentalHealthSubsection
          subsectionKey="mentalHealthConsultations"
          title="Mental Health Consultations"
          description="Have you EVER consulted with a health care professional regarding an emotional or mental health condition or were you hospitalized for such a condition?"
        />

        <MentalHealthSubsection
          subsectionKey="courtOrderedTreatment"
          title="Court-Ordered Mental Health Treatment"
          description="Have you EVER been ordered, advised, or asked to seek counseling or treatment as a result of your use of alcohol or drugs?"
          isCourtOrdered={true}
        />

        <MentalHealthSubsection
          subsectionKey="hospitalization"
          title="Mental Health Hospitalization"
          description="Have you EVER been hospitalized for a mental health condition?"
        />

        <MentalHealthSubsection
          subsectionKey="otherMentalHealth"
          title="Other Mental Health Issues"
          description="Have you had any other mental health issues not covered above?"
        />
      </div>

      {/* Form Actions */}
      <div className="form-actions mt-8 flex justify-between">
        <button
          type="button"
          className="px-6 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
        >
          Previous Section
        </button>

        <button
          type="button"
          onClick={handleValidateAndContinue}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Validating...' : 'Validate & Continue'}
        </button>
      </div>
    </div>
  );
};

export default Section21Component;