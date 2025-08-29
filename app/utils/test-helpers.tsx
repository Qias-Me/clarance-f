/**
 * Testing utilities for SF-86 section components
 * Optimized for the new withSectionWrapper + BaseSectionContext architecture
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

// Mock data generators
export class MockDataGenerator {
  static section1Data = {
    lastName: 'Smith',
    firstName: 'John',
    middleName: 'David',
    dateOfBirth: '1990-01-01',
    placeOfBirth: {
      city: 'Washington',
      state: 'DC', 
      country: 'US'
    }
  };

  static section3Data = {
    militaryService: 'yes',
    serviceHistory: [
      {
        branch: 'army',
        serviceFrom: '2008-01-01',
        serviceTo: '2012-01-01',
        rank: 'Sergeant',
        serviceNumber: '123456789'
      }
    ]
  };

  static generateSectionData(sectionNumber: number, overrides: Record<string, any> = {}) {
    const baseData = this[`section${sectionNumber}Data` as keyof MockDataGenerator] || {};
    return { ...baseData, ...overrides };
  }
}

// Test wrapper for section components
interface SectionTestWrapperProps {
  sectionNumber: number;
  initialData?: any;
  onDataChange?: (data: any) => void;
  children: React.ReactNode;
}

export function SectionTestWrapper({ 
  sectionNumber, 
  initialData, 
  onDataChange,
  children 
}: SectionTestWrapperProps) {
  // This would be dynamically imported based on section number
  // For now, simplified version
  return (
    <div data-testid={`section-${sectionNumber}-wrapper`}>
      {children}
    </div>
  );
}

// Custom render function for section components  
export function renderSectionComponent(
  Component: React.ComponentType<any>,
  options: {
    sectionNumber: number;
    initialData?: any;
    onDataChange?: jest.Mock;
    renderOptions?: any;
  } = { sectionNumber: 1 }
) {
  const { sectionNumber, initialData, onDataChange, renderOptions } = options;
  
  const defaultProps = {
    sectionId: `test-section-${sectionNumber}`,
    initialData: initialData || MockDataGenerator.generateSectionData(sectionNumber),
    onDataChange: onDataChange || jest.fn(),
  };

  return render(
    <SectionTestWrapper sectionNumber={sectionNumber} {...defaultProps}>
      <Component {...defaultProps} />
    </SectionTestWrapper>,
    renderOptions
  );
}

// Test utilities for common section interactions
export class SectionTestUtils {
  /**
   * Fill out a form field by label or test-id
   */
  static async fillField(
    fieldIdentifier: string, 
    value: string, 
    type: 'text' | 'select' | 'date' = 'text'
  ) {
    const user = userEvent.setup();
    
    let field: HTMLElement;
    
    try {
      field = screen.getByLabelText(fieldIdentifier);
    } catch {
      field = screen.getByTestId(fieldIdentifier);
    }

    switch (type) {
      case 'text':
        await user.clear(field);
        await user.type(field, value);
        break;
      case 'select':
        await user.click(field);
        const option = await screen.findByText(value);
        await user.click(option);
        break;
      case 'date':
        await user.clear(field);
        await user.type(field, value);
        break;
    }

    return field;
  }

  /**
   * Submit section form
   */
  static async submitSection() {
    const submitButton = screen.getByText(/submit|continue|next/i);
    await userEvent.click(submitButton);
  }

  /**
   * Add repeating section entry
   */
  static async addRepeatingEntry(sectionName: string) {
    const addButton = screen.getByText(new RegExp(`add.*${sectionName}`, 'i'));
    await userEvent.click(addButton);
  }

  /**
   * Validate section shows expected validation errors
   */
  static async expectValidationErrors(expectedErrors: string[]) {
    for (const error of expectedErrors) {
      await waitFor(() => {
        expect(screen.getByText(new RegExp(error, 'i'))).toBeInTheDocument();
      });
    }
  }

  /**
   * Validate section data matches expected structure
   */
  static validateSectionData(data: any, expectedShape: Record<string, any>) {
    for (const [key, expectedValue] of Object.entries(expectedShape)) {
      if (typeof expectedValue === 'object' && expectedValue !== null) {
        expect(data[key]).toMatchObject(expectedValue);
      } else {
        expect(data[key]).toBe(expectedValue);
      }
    }
  }

  /**
   * Test section navigation
   */
  static async testSectionNavigation(sectionNumber: number) {
    // Test Previous button
    const prevButton = screen.queryByText(/previous/i);
    if (prevButton) {
      expect(prevButton).toBeEnabled();
    }

    // Test Next button  
    const nextButton = screen.getByText(/next|continue/i);
    expect(nextButton).toBeInTheDocument();
    
    return { prevButton, nextButton };
  }

  /**
   * Test auto-save functionality
   */
  static async testAutoSave(onDataChange: jest.Mock) {
    // Fill a field and verify auto-save triggers
    await this.fillField('lastName', 'TestValue');
    
    await waitFor(() => {
      expect(onDataChange).toHaveBeenCalled();
    });

    const lastCall = onDataChange.mock.calls[onDataChange.mock.calls.length - 1];
    expect(lastCall[0]).toHaveProperty('lastName', 'TestValue');
  }
}

// Custom matchers for section testing
export const sectionMatchers = {
  /**
   * Validate that a section component renders all required fields
   */
  toHaveRequiredFields: (received: HTMLElement, expectedFields: string[]) => {
    const missingFields = expectedFields.filter(field => {
      try {
        within(received).getByLabelText(new RegExp(field, 'i'));
        return false;
      } catch {
        return true;
      }
    });

    return {
      pass: missingFields.length === 0,
      message: () => 
        missingFields.length === 0
          ? `Expected section to be missing some required fields`
          : `Section is missing required fields: ${missingFields.join(', ')}`
    };
  },

  /**
   * Validate section has proper ARIA accessibility
   */
  toHaveProperAccessibility: (received: HTMLElement) => {
    const issues = [];
    
    // Check for proper heading structure
    const headings = within(received).queryAllByRole('heading');
    if (headings.length === 0) {
      issues.push('No heading found');
    }

    // Check for form labels
    const inputs = within(received).queryAllByRole('textbox');
    const unlabeledInputs = inputs.filter(input => !input.getAttribute('aria-label') && !input.id);
    if (unlabeledInputs.length > 0) {
      issues.push(`${unlabeledInputs.length} unlabeled inputs`);
    }

    return {
      pass: issues.length === 0,
      message: () => 
        issues.length === 0
          ? 'Expected section to have accessibility issues'
          : `Accessibility issues found: ${issues.join(', ')}`
    };
  }
};

// Performance testing utilities
export class PerformanceTestUtils {
  /**
   * Measure component render time
   */
  static async measureRenderTime<T>(
    renderFn: () => T,
    iterations: number = 10
  ): Promise<{ average: number; min: number; max: number }> {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await act(async () => {
        renderFn();
      });
      const end = performance.now();
      times.push(end - start);
    }

    return {
      average: times.reduce((a, b) => a + b) / times.length,
      min: Math.min(...times),
      max: Math.max(...times)
    };
  }

  /**
   * Test memory usage during component lifecycle
   */
  static measureMemoryUsage() {
    if ((performance as any).memory) {
      return {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      };
    }
    return null;
  }
}

// Integration test helpers
export class IntegrationTestUtils {
  /**
   * Test complete section workflow
   */
  static async testCompleteWorkflow(
    Component: React.ComponentType<any>,
    sectionNumber: number,
    testData: any
  ) {
    const onDataChange = jest.fn();
    
    // Render component
    renderSectionComponent(Component, {
      sectionNumber,
      onDataChange,
      initialData: {}
    });

    // Fill required fields
    for (const [fieldName, value] of Object.entries(testData)) {
      if (typeof value === 'string') {
        await SectionTestUtils.fillField(fieldName, value);
      }
    }

    // Test validation
    await SectionTestUtils.submitSection();
    
    // Verify no validation errors
    const errorElements = screen.queryAllByText(/error|required/i);
    expect(errorElements.filter(el => el.textContent?.includes('required'))).toHaveLength(0);
    
    // Verify data was saved
    await waitFor(() => {
      expect(onDataChange).toHaveBeenCalled();
    });

    return onDataChange.mock.calls[onDataChange.mock.calls.length - 1][0];
  }
}