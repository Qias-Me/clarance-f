import React, { useState } from 'react';
import ContextMappingValidation from '../../components/validation/ContextMappingValidation';
import { EmployeeProvider } from '../../state/contexts/new-context';

/**
 * Context mapping validation page
 */
export default function ContextMappingValidationPage() {
  const [includeWarnings, setIncludeWarnings] = useState(true);
  const [validateDependencies, setValidateDependencies] = useState(true);
  const [validateReferentialIntegrity, setValidateReferentialIntegrity] = useState(true);
  const [excludedSections, setExcludedSections] = useState<number[]>([]);
  
  // Function to toggle excluded sections
  const toggleSection = (sectionNum: number) => {
    setExcludedSections(prev => 
      prev.includes(sectionNum)
        ? prev.filter(num => num !== sectionNum)
        : [...prev, sectionNum]
    );
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Context Mapping Validation</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Validation Options</h2>
        
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeWarnings"
              checked={includeWarnings}
              onChange={() => setIncludeWarnings(!includeWarnings)}
              className="h-5 w-5 text-blue-600"
            />
            <label htmlFor="includeWarnings" className="ml-2 text-gray-700">
              Include Warnings
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="validateDependencies"
              checked={validateDependencies}
              onChange={() => setValidateDependencies(!validateDependencies)}
              className="h-5 w-5 text-blue-600"
            />
            <label htmlFor="validateDependencies" className="ml-2 text-gray-700">
              Validate Dependencies
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="validateReferential"
              checked={validateReferentialIntegrity}
              onChange={() => setValidateReferentialIntegrity(!validateReferentialIntegrity)}
              className="h-5 w-5 text-blue-600"
            />
            <label htmlFor="validateReferential" className="ml-2 text-gray-700">
              Validate Referential Integrity
            </label>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="font-medium mb-2">Excluded Sections:</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(sectionNum => (
              <button
                key={sectionNum}
                onClick={() => toggleSection(sectionNum)}
                className={`px-3 py-1 rounded-md text-sm ${
                  excludedSections.includes(sectionNum)
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                Section {sectionNum}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Validation Results</h2>
        
        <EmployeeProvider>
          <ContextMappingValidation
            includeWarnings={includeWarnings}
            excludeSections={excludedSections}
            validateDependencies={validateDependencies}
            validateReferentialIntegrity={validateReferentialIntegrity}
          />
        </EmployeeProvider>
      </div>
    </div>
  );
} 