/**
 * Common Form Helper Utilities
 * Reusable functions for form components
 */

import { useCallback, useMemo } from 'react';

/**
 * Hook for memoized field value getter
 */
export const useFieldValueGetter = <T extends Record<string, any>>(
  data: T,
  sectionKey: string
) => {
  return useCallback((fieldPath: string): string => {
    const sectionData = data[sectionKey];
    if (!sectionData) return '';
    
    const field = sectionData[fieldPath];
    return field?.value || '';
  }, [data, sectionKey]);
};

/**
 * Hook for form submission handler
 */
export interface FormSubmissionConfig {
  validateSection: () => { isValid: boolean };
  sectionData: any;
  sectionKey: string;
  sf86Form: {
    updateSectionData: (key: string, data: any) => void;
    exportForm: () => any;
    saveForm: (data: any) => Promise<void>;
    markSectionComplete: (key: string) => void;
  };
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
  onError?: (error: unknown) => void;
}

export const useFormSubmission = (config: FormSubmissionConfig) => {
  return useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const {
      validateSection,
      sectionData,
      sectionKey,
      sf86Form,
      onValidationChange,
      onNext,
      onError
    } = config;
    
    const result = validateSection();
    onValidationChange?.(result.isValid);

    if (result.isValid) {
      try {
        // Update central form context
        sf86Form.updateSectionData(sectionKey, sectionData);
        
        // Get current form data and update
        const currentFormData = sf86Form.exportForm();
        const updatedFormData = { 
          ...currentFormData, 
          [sectionKey]: sectionData 
        };
        
        // Save to persistence layer
        await sf86Form.saveForm(updatedFormData);
        
        // Mark section complete
        sf86Form.markSectionComplete(sectionKey);
        
        // Proceed to next section
        onNext?.();
      } catch (error) {
        onError?.(error);
      }
    }
  }, [config]);
};

/**
 * Common form action buttons component
 */
interface FormActionsProps {
  onSubmit?: () => void;
  onReset: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  resetLabel?: string;
  showRequiredNote?: boolean;
  additionalInfo?: React.ReactNode;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onReset,
  isLoading = false,
  submitLabel = 'Submit & Continue',
  resetLabel = 'Clear Section',
  showRequiredNote = true,
  additionalInfo
}) => {
  return (
    <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
      <div className="text-sm text-gray-500">
        {showRequiredNote && (
          <>
            <span className="text-red-500">*</span> Required fields
          </>
        )}
        {additionalInfo}
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="submit-section-button"
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">⚙️</span>
              Processing...
            </>
          ) : (
            submitLabel
          )}
        </button>

        <button
          type="button"
          disabled={isLoading}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          data-testid="clear-section-button"
          onClick={onReset}
        >
          {resetLabel}
        </button>
      </div>
    </div>
  );
};