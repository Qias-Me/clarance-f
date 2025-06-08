/**
 * Section 13 Wrapper Component
 * 
 * Provides a unified interface for both legacy and enhanced Section 13 components
 * with mode switching capabilities
 */

import React, { useState } from 'react';
import { Section13Component } from '../Section13Component';
import { EnhancedSection13Component } from './EnhancedSection13Component';

interface Section13WrapperProps {
  onValidationChange?: (isValid: boolean) => void;
  defaultMode?: 'legacy' | 'enhanced';
  allowModeSwitch?: boolean;
}

export const Section13Wrapper: React.FC<Section13WrapperProps> = ({
  onValidationChange,
  defaultMode = 'legacy',
  allowModeSwitch = true,
}) => {
  const [currentMode, setCurrentMode] = useState<'legacy' | 'enhanced'>(defaultMode);

  const handleModeSwitch = (mode: 'legacy' | 'enhanced') => {
    console.log(`🔄 Section13Wrapper: Switching to ${mode} mode`);
    setCurrentMode(mode);
  };

  return (
    <div className="section13-wrapper">
      {/* Mode Selector */}
      {allowModeSwitch && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Section 13 Mode Selection
              </h3>
              <p className="text-sm text-gray-600">
                Choose between legacy form or enhanced subsection-specific forms
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => handleModeSwitch('legacy')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentMode === 'legacy'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Legacy Mode
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('enhanced')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentMode === 'enhanced'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Enhanced Mode
              </button>
            </div>
          </div>

          {/* Mode Descriptions */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className={`p-3 rounded border ${
              currentMode === 'legacy' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
            }`}>
              <h4 className="font-medium text-gray-900 mb-2">Legacy Mode</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Single unified employment form</li>
                <li>• Compatible with existing data</li>
                <li>• Standard employment fields</li>
                <li>• Backward compatible</li>
              </ul>
            </div>
            
            <div className={`p-3 rounded border ${
              currentMode === 'enhanced' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
            }`}>
              <h4 className="font-medium text-gray-900 mb-2">Enhanced Mode</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Subsection-specific forms (13A.1-13A.6)</li>
                <li>• Military/Federal specialized fields</li>
                <li>• Self-employment business forms</li>
                <li>• Unemployment verification</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Render Selected Component */}
      {currentMode === 'enhanced' ? (
        <EnhancedSection13Component 
          onValidationChange={onValidationChange}
        />
      ) : (
        <Section13Component 
          onValidationChange={onValidationChange}
          useEnhancedMode={false}
          enableEmploymentTypeRouting={true}
        />
      )}

      {/* Mode Information Footer */}
      <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>
            Currently using: <strong>{currentMode === 'enhanced' ? 'Enhanced' : 'Legacy'}</strong> mode
          </span>
          {allowModeSwitch && (
            <span className="text-xs">
              Switch modes anytime using the buttons above
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Section13Wrapper;
