import React from 'react';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
}

/**
 * A loading spinner component
 */
const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'medium',
  color = 'primary'
}) => {
  // Determine size in pixels
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32
  };
  
  // Determine color classes
  const colorMap = {
    primary: 'border-blue-500 border-t-transparent',
    secondary: 'border-gray-500 border-t-transparent',
    white: 'border-white border-t-transparent'
  };
  
  const pixelSize = sizeMap[size];
  const colorClass = colorMap[color];
  
  return (
    <div
      className={`inline-block animate-spin rounded-full border-4 ${colorClass}`}
      style={{ 
        width: `${pixelSize}px`, 
        height: `${pixelSize}px`,
      }}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner; 