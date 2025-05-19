import React, { useState, useEffect } from 'react';
import { useFieldHierarchy } from '../../state/hooks/useFieldHierarchy';
import { useEmployee } from '../../state/contexts/new-context';
import { ContextMappingValidator } from '../../utils/validation/contextMappingValidator';
import Spinner from '../Spinner';

interface MappingErrorProps {
  title: string;
  errors: string[];
  type: 'warning' | 'error';
}

/**
 * Display a list of validation errors with appropriate styling
 */
const MappingErrorList: React.FC<MappingErrorProps> = ({ title, errors, type }) => {
  if (errors.length === 0) return null;
  
  const bgColor = type === 'error' ? 'bg-red-50' : 'bg-yellow-50';
  const textColor = type === 'error' ? 'text-red-800' : 'text-yellow-800';
  const borderColor = type === 'error' ? 'border-red-300' : 'border-yellow-300';
  
  return (
    <div className={`my-4 p-4 ${bgColor} border ${borderColor} rounded-md`}>
      <h3 className={`text-lg font-semibold ${textColor}`}>{title}</h3>
      <ul className="list-disc ml-6 mt-2">
        {errors.map((error, index) => (
          <li key={index} className={`${textColor} text-sm`}>{error}</li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Summary view of validation results
 */
const ValidationSummary: React.FC<{
  isValid: boolean;
  errorCounts: {
    missingInContext: number;
    missingInHierarchy: number;
    sectionConsistency: number;
    referential: number;
    dependency: number;
  };
}> = ({ isValid, errorCounts }) => {
  const totalErrors = Object.values(errorCounts).reduce((sum, count) => sum + count, 0);
  
  return (
    <div className={`p-4 border rounded-md ${isValid ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
      <h2 className={`text-xl font-bold ${isValid ? 'text-green-800' : 'text-red-800'}`}>
        Context Mapping Validation: {isValid ? '✅ Valid' : '❌ Invalid'}
      </h2>
      <p className="text-gray-700 mt-2">
        Found {totalErrors} total issues across all validation checks.
      </p>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Missing in Context:</span>
          <span className="text-sm text-gray-800 font-bold">{errorCounts.missingInContext}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Missing in Hierarchy:</span>
          <span className="text-sm text-gray-800 font-bold">{errorCounts.missingInHierarchy}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Section Consistency:</span>
          <span className="text-sm text-gray-800 font-bold">{errorCounts.sectionConsistency}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Referential Integrity:</span>
          <span className="text-sm text-gray-800 font-bold">{errorCounts.referential}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Dependency Errors:</span>
          <span className="text-sm text-gray-800 font-bold">{errorCounts.dependency}</span>
        </div>
      </div>
    </div>
  );
};

interface ContextMappingValidationProps {
  includeWarnings?: boolean;
  excludeSections?: number[];
  validateDependencies?: boolean;
  validateReferentialIntegrity?: boolean;
}

/**
 * Component for validating and displaying context mapping
 */
const ContextMappingValidation: React.FC<ContextMappingValidationProps> = ({
  includeWarnings = true,
  excludeSections = [],
  validateDependencies = true,
  validateReferentialIntegrity = true,
}) => {
  const { fieldHierarchy, loading: hierarchyLoading } = useFieldHierarchy();
  const { data: contextData } = useEmployee();
  
  const [validationResult, setValidationResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const validateMapping = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Wait for field hierarchy to be available
        if (!fieldHierarchy || hierarchyLoading) {
          return;
        }
        
        // Create a validator with the provided options
        const validator = new ContextMappingValidator(fieldHierarchy, {
          includeWarnings,
          excludeSections,
          validateDependencies,
          validateReferentialIntegrity,
          environmentMode: process.env.NODE_ENV as 'development' | 'production'
        });
        
        // Run validation
        const result = validator.validate(contextData);
        setValidationResult(result);
      } catch (err) {
        console.error('Error validating context mapping:', err);
        setError(`Failed to validate context mapping: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };
    
    validateMapping();
  }, [
    fieldHierarchy, 
    contextData, 
    hierarchyLoading, 
    includeWarnings, 
    excludeSections, 
    validateDependencies, 
    validateReferentialIntegrity
  ]);
  
  if (loading || hierarchyLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Spinner />
        <p className="mt-4 text-gray-600">Validating context mapping...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 p-4 rounded-md">
        <h2 className="text-red-800 text-lg font-bold">Validation Error</h2>
        <p className="text-red-700 mt-2">{error}</p>
      </div>
    );
  }
  
  if (!validationResult) {
    return (
      <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-md">
        <h2 className="text-yellow-800 text-lg font-bold">Validation Unavailable</h2>
        <p className="text-yellow-700 mt-2">
          Cannot perform validation at this time. Please make sure both field hierarchy and context data are available.
        </p>
      </div>
    );
  }
  
  return (
    <div className="validation-report space-y-6">
      <ValidationSummary 
        isValid={validationResult.isValid}
        errorCounts={{
          missingInContext: validationResult.missingInContext.length,
          missingInHierarchy: validationResult.missingInHierarchy.length,
          sectionConsistency: validationResult.sectionConsistencyErrors.length,
          referential: validationResult.referentialErrors.length,
          dependency: validationResult.dependencyErrors.length
        }}
      />
      
      <MappingErrorList 
        title="Fields in Context but Missing in Hierarchy" 
        errors={validationResult.missingInHierarchy}
        type="error"
      />
      
      <MappingErrorList 
        title="Fields in Hierarchy but Missing in Context" 
        errors={validationResult.missingInContext}
        type="warning"
      />
      
      <MappingErrorList 
        title="Section Consistency Errors" 
        errors={validationResult.sectionConsistencyErrors}
        type="error"
      />
      
      {validateReferentialIntegrity && (
        <MappingErrorList 
          title="Referential Integrity Errors" 
          errors={validationResult.referentialErrors}
          type="error"
        />
      )}
      
      {validateDependencies && (
        <MappingErrorList 
          title="Dependency Errors" 
          errors={validationResult.dependencyErrors}
          type="error"
        />
      )}
    </div>
  );
};

export default ContextMappingValidation; 