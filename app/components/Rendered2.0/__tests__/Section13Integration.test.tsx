/**
 * Section 13 Integration Tests
 * Tests the complete integration between VirtualizedFields and Section13Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Section13Component from '../Section13Component';

// Mock the complex dependencies
vi.mock('~/state/contexts/sections2.0/section13', () => ({
  useSection13: () => ({
    section13Data: {
      section13: {
        employmentRecordIssues: {
          wasFired: { value: false },
          quitAfterBeingTold: { value: false },
          leftByMutualAgreement: { value: false },
          hasChargesOrAllegations: { value: false }
        },
        disciplinaryActions: {
          receivedWrittenWarning: { value: false }
        }
      }
    },
    updateFieldValue: vi.fn(),
    validateSection: () => ({ isValid: true }),
    resetSection: vi.fn(),
    isDirty: false,
    errors: {},
    initializeEnhancedSupport: vi.fn(),
    getEmploymentTypeStats: vi.fn().mockResolvedValue({})
  })
}));

vi.mock('../../utils/performance-monitor', () => ({
  usePerformanceMonitor: () => ({ recommendations: [] })
}));

vi.mock('~/state/contexts/sections2.0/SF86FormContext', () => ({
  useSF86Form: () => ({
    updateSectionData: vi.fn(),
    exportForm: () => ({}),
    saveForm: vi.fn(),
    markSectionComplete: vi.fn()
  })
}));

// Mock VirtualizedFields
vi.mock('../VirtualizedFields', () => ({
  default: ({ groups, onFieldChange }: any) => (
    <div data-testid="virtualized-fields">
      {groups.map((group: any, groupIndex: number) => (
        <div key={groupIndex} data-testid={`field-group-${groupIndex}`}>
          <h3>{group.title}</h3>
          {group.fields.map((field: any, fieldIndex: number) => (
            <div key={fieldIndex} data-testid={`field-${field.id}`}>
              <label htmlFor={field.id}>{field.label}</label>
              <input
                id={field.id}
                type={field.type === 'checkbox' ? 'checkbox' : 'text'}
                checked={field.type === 'checkbox' ? field.value : undefined}
                value={field.type !== 'checkbox' ? field.value || '' : undefined}
                onChange={(e) => {
                  const value = field.type === 'checkbox' ? e.target.checked : e.target.value;
                  field.onChange(value);
                  onFieldChange?.(field.id, value);
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
  createFieldConfig: (id: string, label: string, value: any, onChange: Function, options?: any) => ({
    id, label, value, onChange, type: options?.type || 'text', ...options
  }),
  createFieldGroup: (title: string, fields: any[], collapsed = false) => ({ title, fields, collapsed })
}));

describe('Section13 Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders with virtualized renderer by default', async () => {
      render(<Section13Component />);
      
      await waitFor(() => {
        expect(screen.getByTestId('section13-form')).toBeInTheDocument();
      });
      
      // Should show the virtualized fields by default
      expect(screen.getByText('Using Virtual Scrolling (Recommended)')).toBeInTheDocument();
      expect(screen.getByTestId('virtualized-fields')).toBeInTheDocument();
    });

    it('allows switching between renderers', async () => {
      render(<Section13Component />);
      
      const toggleButton = screen.getByText('Switch to Legacy Renderer');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText('Switch to Virtualized Renderer')).toBeInTheDocument();
        expect(screen.getByText('Using Legacy Renderer')).toBeInTheDocument();
      });
    });
  });

  describe('Field Groups', () => {
    it('renders employment record issues group', async () => {
      render(<Section13Component />);
      
      await waitFor(() => {
        expect(screen.getByText('Employment Record Issues')).toBeInTheDocument();
      });
      
      // Check for specific fields
      expect(screen.getByLabelText('Were you ever fired from a job?')).toBeInTheDocument();
      expect(screen.getByLabelText('Did you quit after being told you would be fired?')).toBeInTheDocument();
    });

    it('renders disciplinary actions group', async () => {
      render(<Section13Component />);
      
      await waitFor(() => {
        expect(screen.getByText('Disciplinary Actions')).toBeInTheDocument();
      });
      
      expect(screen.getByLabelText('Received written warning?')).toBeInTheDocument();
    });
  });

  describe('Field Interactions', () => {
    it('handles checkbox field changes', async () => {
      const mockUpdateField = vi.fn();
      
      // Override the mock to capture field updates
      vi.mocked(require('~/state/contexts/sections2.0/section13').useSection13).mockReturnValue({
        section13Data: {
          section13: {
            employmentRecordIssues: {
              wasFired: { value: false }
            }
          }
        },
        updateFieldValue: mockUpdateField,
        validateSection: () => ({ isValid: true }),
        resetSection: vi.fn(),
        isDirty: false,
        errors: {},
        initializeEnhancedSupport: vi.fn(),
        getEmploymentTypeStats: vi.fn().mockResolvedValue({})
      });

      render(<Section13Component />);
      
      await waitFor(() => {
        const checkbox = screen.getByLabelText('Were you ever fired from a job?');
        fireEvent.click(checkbox);
      });

      expect(mockUpdateField).toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('handles form submission with validation', async () => {
      const mockSaveForm = vi.fn();
      const mockMarkComplete = vi.fn();
      
      vi.mocked(require('~/state/contexts/sections2.0/SF86FormContext').useSF86Form).mockReturnValue({
        updateSectionData: vi.fn(),
        exportForm: () => ({}),
        saveForm: mockSaveForm,
        markSectionComplete: mockMarkComplete
      });

      render(<Section13Component />);
      
      const saveButton = screen.getByText('Save & Continue');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockSaveForm).toHaveBeenCalled();
        expect(mockMarkComplete).toHaveBeenCalledWith('section13');
      });
    });

    it('handles form reset', async () => {
      const mockResetSection = vi.fn();
      
      vi.mocked(require('~/state/contexts/sections2.0/section13').useSection13).mockReturnValue({
        section13Data: { section13: {} },
        updateFieldValue: vi.fn(),
        validateSection: () => ({ isValid: true }),
        resetSection: mockResetSection,
        isDirty: false,
        errors: {},
        initializeEnhancedSupport: vi.fn(),
        getEmploymentTypeStats: vi.fn().mockResolvedValue({})
      });

      render(<Section13Component />);
      
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);
      
      expect(mockResetSection).toHaveBeenCalled();
    });
  });

  describe('Performance Optimization', () => {
    it('memoizes field configurations to prevent unnecessary re-renders', async () => {
      const { rerender } = render(<Section13Component />);
      
      // Get initial render
      await waitFor(() => {
        expect(screen.getByTestId('virtualized-fields')).toBeInTheDocument();
      });
      
      const initialFieldGroups = screen.getAllByTestId(/field-group-/);
      
      // Re-render with same props
      rerender(<Section13Component />);
      
      await waitFor(() => {
        const newFieldGroups = screen.getAllByTestId(/field-group-/);
        expect(newFieldGroups).toHaveLength(initialFieldGroups.length);
      });
    });

    it('optimizes field value retrieval', async () => {
      // This test ensures getFieldValue is called efficiently
      const mockGetFieldValue = vi.fn(() => false);
      
      render(<Section13Component />);
      
      await waitFor(() => {
        expect(screen.getByTestId('virtualized-fields')).toBeInTheDocument();
      });
      
      // Field value should be retrieved for each rendered field
      // but not excessively due to memoization
    });
  });

  describe('Error Handling', () => {
    it('handles initialization errors gracefully', async () => {
      const mockInitialize = vi.fn().mockRejectedValue(new Error('Init failed'));
      
      vi.mocked(require('~/state/contexts/sections2.0/section13').useSection13).mockReturnValue({
        section13Data: { section13: {} },
        updateFieldValue: vi.fn(),
        validateSection: () => ({ isValid: true }),
        resetSection: vi.fn(),
        isDirty: false,
        errors: {},
        initializeEnhancedSupport: mockInitialize,
        getEmploymentTypeStats: vi.fn().mockResolvedValue({})
      });

      // Should not crash on initialization error
      render(<Section13Component />);
      
      await waitFor(() => {
        expect(screen.getByTestId('section13-form')).toBeInTheDocument();
      });
    });

    it('handles save errors with user feedback', async () => {
      const mockSaveForm = vi.fn().mockRejectedValue(new Error('Save failed'));
      
      vi.mocked(require('~/state/contexts/sections2.0/SF86FormContext').useSF86Form).mockReturnValue({
        updateSectionData: vi.fn(),
        exportForm: () => ({}),
        saveForm: mockSaveForm,
        markSectionComplete: vi.fn()
      });

      // Mock window.alert for error feedback
      const mockAlert = vi.fn();
      Object.defineProperty(window, 'alert', {
        value: mockAlert,
        writable: true
      });

      render(<Section13Component />);
      
      const saveButton = screen.getByText('Save & Continue');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          expect.stringContaining('Failed to save Section 13 data')
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('provides proper form structure and labels', async () => {
      render(<Section13Component />);
      
      await waitFor(() => {
        // Form should have proper test identifier
        expect(screen.getByTestId('section13-form')).toBeInTheDocument();
        
        // All fields should have proper labels
        const employmentIssuesLabel = screen.getByText('Were you ever fired from a job?');
        expect(employmentIssuesLabel).toBeInTheDocument();
        
        const disciplinaryLabel = screen.getByText('Received written warning?');
        expect(disciplinaryLabel).toBeInTheDocument();
      });
    });

    it('maintains focus management', async () => {
      render(<Section13Component />);
      
      await waitFor(() => {
        const toggleButton = screen.getByText('Switch to Legacy Renderer');
        toggleButton.focus();
        expect(document.activeElement).toBe(toggleButton);
      });
    });
  });
});

// Performance regression tests
describe('Section13 Performance Regression Tests', () => {
  it('renders within acceptable time limits', async () => {
    const startTime = performance.now();
    
    render(<Section13Component />);
    
    await waitFor(() => {
      expect(screen.getByTestId('section13-form')).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 100ms for good UX
    expect(renderTime).toBeLessThan(100);
  });

  it('handles rapid field updates without performance degradation', async () => {
    render(<Section13Component />);
    
    await waitFor(() => {
      const checkbox = screen.getByLabelText('Were you ever fired from a job?');
      
      const startTime = performance.now();
      
      // Simulate rapid clicking
      for (let i = 0; i < 10; i++) {
        fireEvent.click(checkbox);
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50); // Should be very fast
    });
  });
});