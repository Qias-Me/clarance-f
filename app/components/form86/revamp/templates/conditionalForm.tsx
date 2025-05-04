import React from 'react';

interface ConditionalComponentProps {
  condition: boolean | (() => boolean);
  children: React.ReactNode;
}

const ConditionalComponent: React.FC<ConditionalComponentProps> = ({ condition, children }) => {
  // Determine if the condition is a function and call it, or use the boolean value directly
  const shouldRender = typeof condition === 'function' ? condition() : condition;

  return shouldRender ? <>{children}</> : null;
};

export default ConditionalComponent;
