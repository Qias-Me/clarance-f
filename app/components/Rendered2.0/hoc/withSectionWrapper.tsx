/**
 * Enhanced Section Wrapper HOC
 * 
 * Higher-Order Component that wraps section components with common functionality
 * Eliminates boilerplate across 30+ section components
 */

import React, { ComponentType, ReactNode, memo, useEffect, useState, useCallback, Suspense } from 'react';
import { ErrorBoundary } from '../../common/ErrorBoundary';
import type { ValidationResult } from '../../../api/interfaces/section-interfaces/shared/base-types';
import { usePerformanceMonitor } from '../../../hooks/usePerformanceMonitor';
import { logger } from '../../../services/Logger';

export interface SectionWrapperProps {
  sectionNumber: number;
  title: string;
  description: string;
  className?: string;
  children: ReactNode;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  readOnly?: boolean;
  showNavigation?: boolean;
}

export interface WithSectionConfig {
  sectionNumber: number;
  title: string;
  description: string;
  enableVirtualScroll?: boolean;
  virtualScrollThreshold?: number;
  enableProgressBar?: boolean;
  enableAutoSave?: boolean;
  enableKeyboardShortcuts?: boolean;
  customStyles?: React.CSSProperties;
  onBeforeSubmit?: (data: any) => Promise<boolean>;
  onAfterSubmit?: (data: any) => Promise<void>;
}

/**
 * Loading component
 */
const SectionLoader: React.FC<{ sectionNumber: number }> = ({ sectionNumber }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
    <p className="text-gray-600">Loading Section {sectionNumber}...</p>
  </div>
);

/**
 * Progress bar component
 */
const SectionProgress: React.FC<{ 
  current: number; 
  total: number;
  label?: string;
}> = memo(({ current, total, label }) => {
  const percentage = (current / total) * 100;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>{label || `Section ${current} of ${total}`}</span>
        <span>{Math.round(percentage)}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
});

SectionProgress.displayName = 'SectionProgress';

/**
 * Navigation controls
 */
const SectionNavigation: React.FC<{
  onPrevious?: () => void;
  onNext?: () => void;
  onSave?: () => void;
  isValid: boolean;
  isLoading: boolean;
  isDirty: boolean;
  showSave?: boolean;
}> = memo(({ onPrevious, onNext, onSave, isValid, isLoading, isDirty, showSave }) => (
  <div className="flex justify-between items-center pt-6 border-t">
    <button
      type="button"
      onClick={onPrevious}
      disabled={isLoading}
      className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
    >
      ← Previous
    </button>
    
    <div className="flex gap-4">
      {showSave && isDirty && (
        <button
          type="button"
          onClick={onSave}
          disabled={isLoading || !isValid}
          className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
        >
          Save Draft
        </button>
      )}
      
      <button
        type="button"
        onClick={onNext}
        disabled={isLoading || !isValid}
        className={`px-6 py-2 rounded font-medium ${
          isValid && !isLoading
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isLoading ? 'Processing...' : 'Continue →'}
      </button>
    </div>
  </div>
));

SectionNavigation.displayName = 'SectionNavigation';

/**
 * Enhanced HOC that wraps section components with common structure and functionality
 */
export function withSectionWrapper<P extends object>(
  Component: ComponentType<P>,
  config: WithSectionConfig
) {
  const WrappedSection = (props: P & SectionWrapperProps) => {
    const { className = '', onValidationChange, onNext, onPrevious, readOnly, showNavigation, ...componentProps } = props;
    const performanceMonitor = usePerformanceMonitor(`Section${config.sectionNumber}Wrapper`);
    
    // State
    const [isValid, setIsValid] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    
    // Keyboard shortcuts
    useEffect(() => {
      if (!config.enableKeyboardShortcuts) return;
      
      const handleKeyPress = (e: KeyboardEvent) => {
        // Ctrl/Cmd + S: Save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          handleSave();
        }
        
        // Ctrl/Cmd + Enter: Submit
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          if (isValid) {
            handleSubmit();
          }
        }
      };
      
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isValid]);
    
    // Handle validation change
    const handleValidationChange = useCallback((valid: boolean) => {
      setIsValid(valid);
      onValidationChange?.(valid);
    }, [onValidationChange]);
    
    // Handle save
    const handleSave = useCallback(async () => {
      performanceMonitor.startMeasure('save');
      try {
        // Save logic here - would connect to context
        logger.info(`Section ${config.sectionNumber} saved`, 'SectionWrapper');
      } catch (error) {
        logger.error(`Failed to save section ${config.sectionNumber}`, error as Error, 'SectionWrapper');
        setError(error as Error);
      } finally {
        performanceMonitor.endMeasure('save');
      }
    }, [performanceMonitor]);
    
    // Handle submit
    const handleSubmit = useCallback(async () => {
      console.log(`handleSubmit called - isValid: ${isValid}, isSubmitting: ${isSubmitting}`);
      if (!isValid || isSubmitting) {
        console.log('Returning early from handleSubmit');
        return;
      }
      
      setIsSubmitting(true);
      performanceMonitor.startMeasure('submit');
      
      try {
        // Before submit hook
        if (config.onBeforeSubmit) {
          const shouldContinue = await config.onBeforeSubmit({});
          if (!shouldContinue) {
            setIsSubmitting(false);
            return;
          }
        }
        
        // Navigate to next
        console.log('Calling onNext function');
        onNext?.();
        
        // After submit hook
        if (config.onAfterSubmit) {
          await config.onAfterSubmit({});
        }
        
        logger.info(`Section ${config.sectionNumber} submitted`, 'SectionWrapper');
      } catch (error) {
        logger.error(`Failed to submit section ${config.sectionNumber}`, error as Error, 'SectionWrapper');
        setError(error as Error);
      } finally {
        setIsSubmitting(false);
        performanceMonitor.endMeasure('submit');
      }
    }, [isValid, isSubmitting, performanceMonitor, onNext]);
    
    // Error recovery
    if (error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-red-800 font-semibold">
            Error in Section {config.sectionNumber}
          </h3>
          <p className="text-red-600 mt-2">{error.message}</p>
          <button
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <ErrorBoundary>
        <div 
          className={`bg-white rounded-lg shadow-lg p-6 ${className}`} 
          data-testid={`section${config.sectionNumber}-form`}
          style={config.customStyles}
        >
          {config.enableProgressBar && (
            <SectionProgress 
              current={config.sectionNumber} 
              total={30}
              label={config.title}
            />
          )}
          
          {/* Section Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Section {config.sectionNumber}: {config.title}
              </h2>
              {isDirty && (
                <span className="inline-flex items-center text-sm text-amber-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Unsaved changes
                </span>
              )}
            </div>
            <p className="text-gray-600">
              {config.description}
            </p>
          </div>

          {/* Section Content */}
          <Suspense fallback={<SectionLoader sectionNumber={config.sectionNumber} />}>
            <Component 
              {...(componentProps as P)} 
              onValidationChange={handleValidationChange}
            />
          </Suspense>
          
          {showNavigation !== false && (
            <SectionNavigation
              onPrevious={onPrevious}
              onNext={handleSubmit}
              onSave={handleSave}
              isValid={isValid}
              isLoading={isSubmitting}
              isDirty={isDirty}
              showSave={config.enableAutoSave}
            />
          )}
        </div>
      </ErrorBoundary>
    );
  };
  
  WrappedSection.displayName = `withSectionWrapper(Section${config.sectionNumber})`;
  
  return memo(WrappedSection);
}

/**
 * Section header component for custom implementations
 */
export const SectionHeader: React.FC<{
  sectionNumber: number;
  title: string;
  description: string;
}> = ({ sectionNumber, title, description }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-bold text-gray-900 mb-2">
      Section {sectionNumber}: {title}
    </h2>
    <p className="text-gray-600">
      {description}
    </p>
  </div>
);