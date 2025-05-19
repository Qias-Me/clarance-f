import { useFormActions } from './useFormActions';
import { useFormState } from './useFormState';

/**
 * Hook that combines form actions and state in a single interface
 * Provides all methods needed to update and retrieve form data
 *
 * @returns Combined form context with actions and state selectors
 */
export const useFormContext = () => {
  const formActions = useFormActions();
  const formState = useFormState();

  return {
    // Expose all form actions
    ...formActions,
    
    // Expose all form state selectors
    ...formState
  };
}; 