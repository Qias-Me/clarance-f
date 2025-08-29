/**
 * Minimal test component to isolate field rendering issues
 */

import React, { useState } from 'react';
import { generateMilitaryEmploymentFields } from '~/state/contexts/sections2.0/section13-field-mapping';

export const MinimalFieldTest: React.FC = () => {
  const [showFields, setShowFields] = useState(false);
  const [testData, setTestData] = useState<Record<string, any>>({});

  const handleShowFields = () => {
    console.log('🔍 MinimalFieldTest: Button clicked');
    setShowFields(true);
  };

  const handleFieldChange = (path: string, value: any) => {
    console.log('🔍 MinimalFieldTest: Field changed:', path, '=', value);
    setTestData(prev => ({
      ...prev,
      [path]: value
    }));
  };

  // Generate test fields
  const testFields = showFields ? generateMilitaryEmploymentFields(0) : [];
  console.log('🔍 MinimalFieldTest: Generated fields count:', testFields.length);

  return (
    <div className="p-6 border rounded-lg bg-white">
      <h2 className="text-lg font-bold mb-4">Minimal Field Rendering Test</h2>
      
      <button 
        onClick={handleShowFields}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-4"
      >
        Show Test Fields ({testFields.length} fields)
      </button>

      {showFields && (
        <div className="space-y-4">
          <h3 className="font-semibold">Test Fields:</h3>
          {testFields.slice(0, 5).map((field, index) => {
            const fieldId = `test_${index}`;
            const value = testData[field.uiPath] || '';
            
            return (
              <div key={fieldId} className="border p-2 rounded">
                <label htmlFor={fieldId} className="block text-sm font-medium mb-1">
                  {field.uiPath.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="text"
                  id={fieldId}
                  value={value}
                  onChange={(e) => handleFieldChange(field.uiPath, e.target.value)}
                  className="w-full px-2 py-1 border rounded"
                  placeholder={`Enter ${field.uiPath.split('.').pop()}`}
                />
                <div className="text-xs text-gray-500 mt-1">
                  UI Path: {field.uiPath}<br/>
                  PDF Field: {field.pdfField}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium">Debug Data</summary>
        <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto max-h-40">
          {JSON.stringify(testData, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default MinimalFieldTest;