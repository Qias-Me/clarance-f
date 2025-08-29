/**
 * Debug Panel Component
 * Reusable debug information display for development
 */

import React from 'react';

interface DebugPanelProps {
  data: Record<string, any>;
  errors?: Record<string, string>;
  additionalInfo?: Array<{
    title: string;
    content: any;
  }>;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  data,
  errors,
  additionalInfo
}) => {
  // Only show in development with debug flag
  if (typeof window === 'undefined' || !window.location.search.includes('debug=true')) {
    return null;
  }

  return (
    <details className="mt-6 p-4 bg-gray-50 rounded-lg">
      <summary className="cursor-pointer text-sm font-medium text-gray-700">
        Debug Information
      </summary>
      <div className="mt-2">
        <h4 className="text-xs font-medium text-gray-600 mb-2">Section Data:</h4>
        <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
          {JSON.stringify(data, null, 2)}
        </pre>
        
        {errors && (
          <>
            <h4 className="text-xs font-medium text-gray-600 mt-4 mb-2">Validation Errors:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(errors, null, 2)}
            </pre>
          </>
        )}
        
        {additionalInfo?.map((info, index) => (
          <div key={index}>
            <h4 className="text-xs font-medium text-gray-600 mt-4 mb-2">{info.title}:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {typeof info.content === 'string' 
                ? info.content 
                : JSON.stringify(info.content, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </details>
  );
};