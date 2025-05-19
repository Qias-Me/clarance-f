import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import formReducer from '../../state/form/formSlice';
import { useFormEntryManager } from '../forms/FormEntryManager';
import '@testing-library/jest-dom';

// Mock Redux store with only the form reducer
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: { form: formReducer },
    preloadedState
  });
};

// Define interfaces for props
interface TestFormEntryManagerProps {
  sectionPath: string;
  initialData?: any;
  maxEntries?: number | Record<string, number>;
}

// Test component that uses the useFormEntryManager hook
const TestFormEntryManager: React.FC<TestFormEntryManagerProps> = ({ 
  sectionPath, 
  initialData, 
  maxEntries 
}) => {
  const {
    addEntry,
    removeEntry,
    toggleSection,
    initializeSection,
    getVisibleCount
  } = useFormEntryManager({ maxEntries });

  React.useEffect(() => {
    if (initialData) {
      initializeSection(sectionPath, initialData);
    }
  }, [sectionPath, initialData, initializeSection]);

  return (
    <div>
      <div data-testid="visible-count">{getVisibleCount(sectionPath)}</div>
      <button
        data-testid="add-entry-btn"
        onClick={() => addEntry(sectionPath)}
      >
        Add Entry
      </button>
      <button
        data-testid="remove-entry-btn"
        onClick={() => removeEntry(sectionPath, 0)}
      >
        Remove Entry
      </button>
      <button
        data-testid="toggle-section-btn-yes"
        onClick={() => toggleSection(sectionPath, true, {})}
      >
        Enable Section
      </button>
      <button
        data-testid="toggle-section-btn-no"
        onClick={() => toggleSection(sectionPath, false, {})}
      >
        Disable Section
      </button>
    </div>
  );
};

describe('FormEntryManager Redux Integration', () => {
  const sectionPath = 'namesInfo.names';
  const initialState = {
    form: {
      sections: {
        namesInfo: {
          hasNames: { value: 'NO' },
          names: []
        }
      },
      meta: {
        isValid: false,
        validatedSections: [],
        isDirty: false,
        isSubmitting: false,
        errors: {}
      }
    }
  };

  test('should add entry using Redux dispatch', () => {
    const store = createTestStore(initialState);
    render(
      <Provider store={store}>
        <TestFormEntryManager
          sectionPath={sectionPath}
          initialData={initialState.form.sections.namesInfo}
        />
      </Provider>
    );

    // Initial count should be 0
    expect(screen.getByTestId('visible-count')).toHaveTextContent('0');

    // Add an entry
    fireEvent.click(screen.getByTestId('add-entry-btn'));

    // Check Redux store was updated
    const state = store.getState();
    expect(state.form.sections.namesInfo.names.length).toBe(1);
    
    // Check the hasNames flag was set correctly
    expect(state.form.sections.namesInfo.hasNames.value).toBe('YES');
  });

  test('should remove entry using Redux dispatch', () => {
    // Start with one entry
    const stateWithEntry = {
      form: {
        sections: {
          namesInfo: {
            hasNames: { value: 'YES' },
            names: [
              {
                _id: 1,
                firstName: { value: 'John' },
                lastName: { value: 'Doe' }
              }
            ]
          }
        },
        meta: {
          isValid: false,
          validatedSections: [],
          isDirty: false,
          isSubmitting: false,
          errors: {}
        }
      }
    };

    const store = createTestStore(stateWithEntry);
    render(
      <Provider store={store}>
        <TestFormEntryManager
          sectionPath={sectionPath}
          initialData={stateWithEntry.form.sections.namesInfo}
        />
      </Provider>
    );

    // Initial count should be 1
    expect(screen.getByTestId('visible-count')).toHaveTextContent('1');

    // Remove the entry
    fireEvent.click(screen.getByTestId('remove-entry-btn'));

    // Check Redux store was updated
    const state = store.getState();
    expect(state.form.sections.namesInfo.names.length).toBe(0);
    
    // Check the hasNames flag was set to NO
    expect(state.form.sections.namesInfo.hasNames.value).toBe('NO');
  });

  test('should toggle section active state using Redux', () => {
    const store = createTestStore(initialState);
    render(
      <Provider store={store}>
        <TestFormEntryManager
          sectionPath={sectionPath}
          initialData={initialState.form.sections.namesInfo}
        />
      </Provider>
    );

    // Initially the section is inactive
    expect(store.getState().form.sections.namesInfo.hasNames.value).toBe('NO');
    expect(store.getState().form.sections.namesInfo.names.length).toBe(0);

    // Activate the section
    fireEvent.click(screen.getByTestId('toggle-section-btn-yes'));

    // Check the Redux store was updated
    const stateAfterEnable = store.getState();
    expect(stateAfterEnable.form.sections.namesInfo.hasNames.value).toBe('YES');
    expect(stateAfterEnable.form.sections.namesInfo.names.length).toBe(1);

    // Deactivate the section
    fireEvent.click(screen.getByTestId('toggle-section-btn-no'));

    // Check the Redux store was updated
    const stateAfterDisable = store.getState();
    expect(stateAfterDisable.form.sections.namesInfo.hasNames.value).toBe('NO');
  });

  test('should respect maxEntries constraint when adding entries', () => {
    // Set max entries to 2
    const maxEntries = { 'namesInfo.names': 2 };
    const store = createTestStore(initialState);
    
    render(
      <Provider store={store}>
        <TestFormEntryManager
          sectionPath={sectionPath}
          initialData={initialState.form.sections.namesInfo}
          maxEntries={maxEntries}
        />
      </Provider>
    );

    // Add first entry
    fireEvent.click(screen.getByTestId('add-entry-btn'));
    expect(store.getState().form.sections.namesInfo.names.length).toBe(1);

    // Add second entry
    fireEvent.click(screen.getByTestId('add-entry-btn'));
    expect(store.getState().form.sections.namesInfo.names.length).toBe(2);

    // Try to add third entry - should be blocked
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    fireEvent.click(screen.getByTestId('add-entry-btn'));
    
    // Should still be 2 entries and have a warning
    expect(store.getState().form.sections.namesInfo.names.length).toBe(2);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Maximum entries'));
    consoleSpy.mockRestore();
  });

  test('should initialize section with existing data', () => {
    const existingData = {
      hasNames: { value: 'YES' },
      names: [
        {
          _id: 1,
          firstName: { value: 'Jane' },
          lastName: { value: 'Smith' }
        },
        {
          _id: 2,
          firstName: { value: 'John' },
          lastName: { value: 'Doe' }
        }
      ]
    };

    const store = createTestStore();
    render(
      <Provider store={store}>
        <TestFormEntryManager
          sectionPath="namesInfo"
          initialData={existingData}
        />
      </Provider>
    );

    // Check Redux store has the initial data
    const state = store.getState();
    expect(state.form.sections.namesInfo.names.length).toBe(2);
    expect(state.form.sections.namesInfo.names[0].firstName.value).toBe('Jane');
    expect(state.form.sections.namesInfo.names[1].firstName.value).toBe('John');
    
    // Visibility should show both entries
    expect(screen.getByTestId('visible-count')).toHaveTextContent('2');
  });

  test('should handle synchronization between Redux state and visibility', async () => {
    // Start with empty state
    const store = createTestStore();
    
    // Render the component
    const { rerender } = render(
      <Provider store={store}>
        <TestFormEntryManager
          sectionPath={sectionPath}
          initialData={null}
        />
      </Provider>
    );
    
    // Initial count should be 0
    expect(screen.getByTestId('visible-count')).toHaveTextContent('0');
    
    // Update Redux state directly
    await act(async () => {
      store.dispatch({
        type: 'form/initializeSection',
        payload: {
          sectionPath: 'namesInfo',
          data: {
            hasNames: { value: 'YES' },
            names: [
              {
                _id: 1,
                firstName: { value: 'Direct' },
                lastName: { value: 'Update' }
              }
            ]
          }
        }
      });
    });
    
    // Rerender to process the effect
    rerender(
      <Provider store={store}>
        <TestFormEntryManager
          sectionPath={sectionPath}
          initialData={null}
        />
      </Provider>
    );
    
    // Visibility should be updated based on Redux state
    expect(screen.getByTestId('visible-count')).toHaveTextContent('1');
  });
}); 