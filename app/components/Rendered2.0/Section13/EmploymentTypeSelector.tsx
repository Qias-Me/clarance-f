/**
 * Employment Type Selector Component
 * 
 * Allows users to select between different employment types for Section 13:
 * - Military/Federal Employment (13A.1)
 * - Non-Federal Employment (13A.2) 
 * - Self-Employment (13A.3)
 * - Unemployment (13A.4)
 */

import React, { useState, useCallback } from 'react';
import { useSection13 } from '~/state/contexts/sections2.0/section13';

export interface EmploymentTypeSelectorProps {
  onEmploymentTypeChange?: (employmentType: string) => void;
  selectedType?: string;
  disabled?: boolean;
  showDescription?: boolean;
}

const EMPLOYMENT_TYPES = [
  {
    id: 'military',
    label: 'Military/Federal Employment',
    section: '13A.1',
    description: 'Active duty military service, federal civilian employment, or federal contractor positions',
    icon: '🪖',
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
  },
  {
    id: 'non-federal',
    label: 'Non-Federal Employment',
    section: '13A.2',
    description: 'Private sector employment, state/local government, or non-federal organizations',
    icon: '🏢',
    color: 'bg-green-50 border-green-200 hover:bg-green-100'
  },
  {
    id: 'self-employment',
    label: 'Self-Employment',
    section: '13A.3',
    description: 'Business ownership, consulting, freelancing, or independent contractor work',
    icon: '💼',
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
  },
  {
    id: 'unemployment',
    label: 'Unemployment',
    section: '13A.4',
    description: 'Periods of unemployment, job searching, or between employment',
    icon: '🔍',
    color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
  }
] as const;

const EmploymentTypeSelector: React.FC<EmploymentTypeSelectorProps> = ({
  onEmploymentTypeChange,
  selectedType,
  disabled = false,
  showDescription = true
}) => {
  const { updateEmploymentType, getActiveEmploymentType } = useSection13();
  const [localSelectedType, setLocalSelectedType] = useState<string>(
    selectedType || getActiveEmploymentType() || ''
  );

  const handleTypeSelection = useCallback((typeId: string) => {
    if (disabled) return;

    console.log(`🔄 EmploymentTypeSelector: Selected type ${typeId}`);
    
    setLocalSelectedType(typeId);
    
    // Update the Section 13 context
    updateEmploymentType(typeId);
    
    // Notify parent component
    onEmploymentTypeChange?.(typeId);
  }, [disabled, updateEmploymentType, onEmploymentTypeChange]);

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Select Employment Type
        </h3>
        <p className="text-sm text-gray-600">
          Choose the type of employment you want to add to your employment history.
          You can add multiple entries of different types.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EMPLOYMENT_TYPES.map((type) => {
          const isSelected = localSelectedType === type.id;
          
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => handleTypeSelection(type.id)}
              disabled={disabled}
              className={`
                relative p-4 rounded-lg border-2 text-left transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                  : type.color
                }
                ${disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500'
                }
              `}
              aria-pressed={isSelected}
              aria-describedby={`${type.id}-description`}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex items-start space-x-3">
                <div className="text-2xl" role="img" aria-label={type.label}>
                  {type.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {type.label}
                    </h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {type.section}
                    </span>
                  </div>
                  
                  {showDescription && (
                    <p 
                      id={`${type.id}-description`}
                      className="text-xs text-gray-600 leading-relaxed"
                    >
                      {type.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Additional guidance */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">Employment History Requirements</p>
            <p className="text-blue-700">
              You must provide employment information for the past 10 years. Include all employment,
              self-employment, military service, and periods of unemployment lasting 30 days or more.
            </p>
          </div>
        </div>
      </div>

      {/* Current selection summary */}
      {localSelectedType && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Selected:</span>
            <span className="text-sm text-gray-900">
              {EMPLOYMENT_TYPES.find(t => t.id === localSelectedType)?.label}
            </span>
            <span className="text-xs text-gray-500">
              (Section {EMPLOYMENT_TYPES.find(t => t.id === localSelectedType)?.section})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmploymentTypeSelector;
