import React from 'react';
import type { ReactNode } from 'react';

interface FormErrorMessageProps {
  id: string;
  message?: string | ReactNode;
  visible?: boolean;
}

/**
 * Displays a form validation error message with proper accessibility attributes
 */
const FormErrorMessage: React.FC<FormErrorMessageProps> = ({ 
  id, 
  message, 
  visible = true 
}) => {
  if (!visible || !message) {
    return null;
  }

  return (
    <div
      id={id}
      role="alert"
      className="mt-1 text-sm text-red-600"
      aria-live="polite"
    >
      {message}
    </div>
  );
};

export default FormErrorMessage; 