import { useCallback, useState } from 'react';
import { useAppDispatch } from '../state/hooks';
import { markSectionComplete } from '../state/user/formSlice';

interface UseFormSubmissionOptions {
  sectionName: string;
  validationFn?: () => boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useFormSubmission = ({
  sectionName,
  validationFn,
  onSuccess,
  onError
}: UseFormSubmissionOptions) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Run validation if provided
      if (validationFn && !validationFn()) {
        throw new Error('Validation failed. Please check all required fields.');
      }

      // Mark section as complete
      dispatch(markSectionComplete(sectionName));

      // Call success callback
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch, sectionName, validationFn, onSuccess, onError]);

  return {
    handleSubmit,
    isSubmitting,
    error,
    clearError: () => setError(null)
  };
};