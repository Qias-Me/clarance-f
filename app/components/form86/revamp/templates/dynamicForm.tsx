import React from 'react';

interface DynamicSectionProps {
  condition: boolean | string;
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  expectedValue?: string | boolean; // Used for dropdown conditions
}

export const DynamicSection: React.FC<DynamicSectionProps> = ({
  condition,
  children,
  placeholder,
  expectedValue = true, // Default to true for straightforward boolean checks
}) => {
  // Determine if the condition matches the expected value (for dropdowns or complex checks)
  const shouldRender = typeof expectedValue === 'string'
    ? condition === expectedValue
    : condition === expectedValue;

  return shouldRender ? <>{children}</> : <div>{placeholder}</div>;
};
