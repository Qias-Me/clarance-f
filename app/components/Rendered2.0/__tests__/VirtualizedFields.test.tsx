/**
 * VirtualizedFields Component Tests
 * Tests performance, accessibility, and functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import VirtualizedFields, { createFieldConfig, createFieldGroup } from '../VirtualizedFields';
import type { FieldConfig, FieldGroup } from '../VirtualizedFields';

// Mock react-window components
vi.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount, itemSize }: any) => (
    <div data-testid="virtualized-list">
      {Array.from({ length: Math.min(itemCount, 10) }).map((_, index) => 
        children({ index, style: { height: itemSize } })
      )}
    </div>
  ),
  VariableSizeList: ({ children, itemCount, itemSize }: any) => (
    <div data-testid="virtualized-variable-list">
      {Array.from({ length: Math.min(itemCount, 10) }).map((_, index) => 
        children({ index, style: { height: typeof itemSize === 'function' ? itemSize(index) : itemSize } })
      )}
    </div>
  ),
}));

vi.mock('react-virtualized-auto-sizer', () => ({
  default: ({ children }: any) => children({ height: 600, width: 800 })
}));

describe('VirtualizedFields', () => {
  let mockFieldChange: ReturnType<typeof vi.fn>;
  let testFields: FieldConfig[];
  let testGroups: FieldGroup[];

  beforeEach(() => {
    mockFieldChange = vi.fn();
    
    // Create test field configurations
    testFields = [
      createFieldConfig(
        'test.field1',
        'Test Field 1',
        'initial value',
        mockFieldChange,
        { type: 'text', required: true }
      ),
      createFieldConfig(
        'test.field2',
        'Test Field 2',
        false,
        mockFieldChange,
        { type: 'checkbox' }
      ),
      createFieldConfig(
        'test.field3',
        'Test Field 3',
        'option1',
        mockFieldChange,
        { type: 'select', options: ['option1', 'option2', 'option3'] }
      ),
    ];

    testGroups = [
      createFieldGroup('Group 1', [testFields[0], testFields[1]]),
      createFieldGroup('Group 2', [testFields[2]], true) // collapsed
    ];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders fields without groups', () => {
      render(<VirtualizedFields fields={testFields} />);
      
      expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
    });

    it('renders field groups with proper structure', () => {
      render(<VirtualizedFields groups={testGroups} />);
      
      expect(screen.getByTestId('virtualized-variable-list')).toBeInTheDocument();
      expect(screen.getByText('Group 1')).toBeInTheDocument();
      expect(screen.getByText('Group 2')).toBeInTheDocument();
    });

    it('renders different field types correctly', () => {
      render(<VirtualizedFields fields={testFields} />);
      
      // Text field
      expect(screen.getByLabelText('Test Field 1')).toHaveAttribute('type', 'text');
      
      // Checkbox field
      expect(screen.getByLabelText('Test Field 2')).toHaveAttribute('type', 'checkbox');
      
      // Select field
      expect(screen.getByLabelText('Test Field 3')).toBeInstanceOf(HTMLSelectElement);
    });

    it('shows required field indicators', () => {
      render(<VirtualizedFields fields={testFields} />);
      
      expect(screen.getByText('*')).toBeInTheDocument(); // Required indicator
    });
  });

  describe('Field Interactions', () => {
    it('handles text field changes', async () => {
      render(<VirtualizedFields fields={testFields} />);
      
      const textInput = screen.getByLabelText('Test Field 1');
      fireEvent.change(textInput, { target: { value: 'new value' } });
      
      await waitFor(() => {
        expect(mockFieldChange).toHaveBeenCalledWith('new value');
      });
    });

    it('handles checkbox changes', async () => {
      render(<VirtualizedFields fields={testFields} />);
      
      const checkbox = screen.getByLabelText('Test Field 2');
      fireEvent.click(checkbox);
      
      await waitFor(() => {
        expect(mockFieldChange).toHaveBeenCalledWith(true);
      });
    });

    it('handles select field changes', async () => {
      render(<VirtualizedFields fields={testFields} />);
      
      const select = screen.getByLabelText('Test Field 3');
      fireEvent.change(select, { target: { value: 'option2' } });
      
      await waitFor(() => {
        expect(mockFieldChange).toHaveBeenCalledWith('option2');
      });
    });
  });

  describe('Group Functionality', () => {
    it('toggles group collapse state', async () => {
      render(<VirtualizedFields groups={testGroups} />);
      
      const group1Button = screen.getByRole('button', { name: /Group 1/ });
      fireEvent.click(group1Button);
      
      await waitFor(() => {
        expect(group1Button).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('hides fields in collapsed groups', () => {
      render(<VirtualizedFields groups={testGroups} />);
      
      // Group 2 is collapsed by default
      const group2Fields = screen.queryByLabelText('Test Field 3');
      expect(group2Fields).not.toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles large numbers of fields efficiently', () => {
      const manyFields = Array.from({ length: 1000 }, (_, i) =>
        createFieldConfig(
          `field.${i}`,
          `Field ${i}`,
          `value ${i}`,
          vi.fn(),
          { type: 'text' }
        )
      );

      const renderStart = performance.now();
      render(<VirtualizedFields fields={manyFields} maxVisibleHeight={400} />);
      const renderEnd = performance.now();

      // Should render quickly even with many fields
      expect(renderEnd - renderStart).toBeLessThan(100);
      
      // Should only render visible fields
      const renderedInputs = screen.getAllByRole('textbox');
      expect(renderedInputs.length).toBeLessThan(manyFields.length);
    });

    it('uses appropriate overscan count', () => {
      render(
        <VirtualizedFields 
          fields={testFields} 
          overscanCount={2}
          itemHeight={60}
          maxVisibleHeight={200}
        />
      );
      
      // With a height of 200px and item height of 60px, 
      // we should see ~3-4 visible items plus overscan
      expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<VirtualizedFields fields={testFields} />);
      
      const textInput = screen.getByLabelText('Test Field 1');
      expect(textInput).toHaveAttribute('id');
      expect(textInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('shows error states correctly', () => {
      const errorField = createFieldConfig(
        'error.field',
        'Error Field',
        '',
        vi.fn(),
        { type: 'text', error: 'This field is required' }
      );

      render(<VirtualizedFields fields={[errorField]} />);
      
      const input = screen.getByLabelText('Error Field');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<VirtualizedFields fields={testFields} />);
      
      const firstInput = screen.getByLabelText('Test Field 1');
      const checkbox = screen.getByLabelText('Test Field 2');
      
      firstInput.focus();
      expect(document.activeElement).toBe(firstInput);
      
      fireEvent.keyDown(firstInput, { key: 'Tab' });
      // Note: Full keyboard navigation testing would require more complex setup
    });
  });

  describe('Error Handling', () => {
    it('renders error boundary on component errors', () => {
      const errorField = createFieldConfig(
        'error.field',
        'Error Field',
        null, // Invalid value that might cause error
        () => { throw new Error('Test error'); },
        { type: 'text' }
      );

      render(<VirtualizedFields fields={[errorField]} />);
      
      // Should still render and not crash
      expect(screen.getByText(/Error rendering fields/)).toBeInTheDocument();
    });
  });

  describe('Custom Rendering', () => {
    it('uses custom field renderer when provided', () => {
      const customRenderer = vi.fn(({ field, style }) => (
        <div style={style} data-testid="custom-field">
          Custom: {field.label}
        </div>
      ));

      render(
        <VirtualizedFields 
          fields={[testFields[0]]} 
          renderField={customRenderer}
        />
      );
      
      expect(screen.getByTestId('custom-field')).toBeInTheDocument();
      expect(customRenderer).toHaveBeenCalled();
    });
  });
});

// Utility function tests
describe('Field Configuration Utilities', () => {
  describe('createFieldConfig', () => {
    it('creates field config with default values', () => {
      const onChange = vi.fn();
      const config = createFieldConfig('test.id', 'Test Label', 'test value', onChange);
      
      expect(config).toEqual({
        id: 'test.id',
        label: 'Test Label',
        value: 'test value',
        onChange,
        type: 'text'
      });
    });

    it('merges custom options', () => {
      const onChange = vi.fn();
      const config = createFieldConfig(
        'test.id', 
        'Test Label', 
        'test value', 
        onChange,
        { type: 'email', required: true, maxLength: 100 }
      );
      
      expect(config.type).toBe('email');
      expect(config.required).toBe(true);
      expect(config.maxLength).toBe(100);
    });
  });

  describe('createFieldGroup', () => {
    it('creates field group with correct structure', () => {
      const fields = [testFields[0], testFields[1]];
      const group = createFieldGroup('Test Group', fields, true);
      
      expect(group).toEqual({
        title: 'Test Group',
        fields,
        collapsed: true
      });
    });

    it('defaults to not collapsed', () => {
      const group = createFieldGroup('Test Group', []);
      expect(group.collapsed).toBe(false);
    });
  });
});