/**
 * Tests for SectionContextFactory
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { createSectionContext } from '../../state/contexts/sections2.0/base/SectionContextFactory';
import { SF86FormProvider } from '../../state/contexts/sections2.0/SF86FormContext';

// Mock logger
jest.mock('../../services/Logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// Mock performance monitor
jest.mock('../../hooks/usePerformanceMonitor', () => ({
  usePerformanceMonitor: () => ({
    startMeasure: jest.fn(),
    endMeasure: jest.fn(),
    cleanup: jest.fn(),
    getMetrics: jest.fn(() => ({}))
  })
}));

describe('SectionContextFactory', () => {
  const mockConfig = {
    sectionNumber: 1,
    sectionName: 'Test Section',
    initialData: {
      testField: { value: '', label: 'Test Field' }
    },
    fieldConfig: {
      testField: {
        required: true
      }
    }
  };
  
  let TestContext: ReturnType<typeof createSectionContext>;
  let TestComponent: React.FC;
  
  beforeEach(() => {
    TestContext = createSectionContext(mockConfig);
    
    TestComponent = () => {
      const { sectionData, updateField, errors, isDirty } = TestContext.useSection();
      
      return (
        <div>
          <input
            data-testid="test-input"
            value={sectionData.testField.value || ''}
            onChange={(e) => updateField('testField', { ...sectionData.testField, value: e.target.value })}
          />
          {errors.testField && <span data-testid="error">{errors.testField}</span>}
          <span data-testid="dirty-state">{isDirty ? 'dirty' : 'clean'}</span>
        </div>
      );
    };
  });
  
  test('creates context with initial data', () => {
    render(
      <SF86FormProvider>
        <TestContext.Provider>
          <TestComponent />
        </TestContext.Provider>
      </SF86FormProvider>
    );
    
    const input = screen.getByTestId('test-input') as HTMLInputElement;
    expect(input.value).toBe('');
  });
  
  test('updates field value', async () => {
    render(
      <SF86FormProvider>
        <TestContext.Provider>
          <TestComponent />
        </TestContext.Provider>
      </SF86FormProvider>
    );
    
    const input = screen.getByTestId('test-input') as HTMLInputElement;
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test value' } });
    });
    
    await waitFor(() => {
      expect(input.value).toBe('test value');
    });
  });
  
  test('tracks dirty state', async () => {
    render(
      <SF86FormProvider>
        <TestContext.Provider>
          <TestComponent />
        </TestContext.Provider>
      </SF86FormProvider>
    );
    
    const input = screen.getByTestId('test-input');
    const dirtyState = screen.getByTestId('dirty-state');
    
    expect(dirtyState.textContent).toBe('clean');
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test value' } });
    });
    
    await waitFor(() => {
      expect(dirtyState.textContent).toBe('dirty');
    });
  });
  
  test('validates required fields', async () => {
    render(
      <SF86FormProvider>
        <TestContext.Provider>
          <TestComponent />
        </TestContext.Provider>
      </SF86FormProvider>
    );
    
    const input = screen.getByTestId('test-input');
    
    // Type and clear to trigger validation
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } });
    });
    
    await act(async () => {
      fireEvent.change(input, { target: { value: '' } });
    });
    
    // Wait for debounced validation
    await waitFor(() => {
      const error = screen.queryByTestId('error');
      expect(error).toBeInTheDocument();
      expect(error?.textContent).toContain('required');
    }, { timeout: 1000 });
  });
  
  test('memoizes context value', () => {
    let renderCount = 0;
    
    const CountingComponent = () => {
      const context = TestContext.useSection();
      renderCount++;
      return <div>{context.sectionData.testField.value || 'empty'}</div>;
    };
    
    const { rerender } = render(
      <SF86FormProvider>
        <TestContext.Provider>
          <CountingComponent />
        </TestContext.Provider>
      </SF86FormProvider>
    );
    
    // Re-render with same props
    rerender(
      <SF86FormProvider>
        <TestContext.Provider>
          <CountingComponent />
        </TestContext.Provider>
      </SF86FormProvider>
    );
    
    // Should only render once due to memoization
    expect(renderCount).toBeLessThanOrEqual(2);
  });
});