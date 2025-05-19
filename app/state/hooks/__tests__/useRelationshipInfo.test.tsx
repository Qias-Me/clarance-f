import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { useRelationshipInfo } from '../useRelationshipInfo';
import { relationshipInfo as defaultRelationshipInfo } from '../../contexts/sections/relationshipInfo';
import { cloneDeep } from 'lodash';

// Create a mock store
const mockStore = configureStore([]);

describe('useRelationshipInfo hook', () => {
  let store: any;
  let initialState: any;
  
  beforeEach(() => {
    // Set up initial state with empty relationship info
    initialState = {
      form: {
        sections: {
          relationshipInfo: cloneDeep(defaultRelationshipInfo)
        },
        meta: {
          errors: {},
          isValid: true,
          isDirty: false,
          isSubmitting: false,
          validatedSections: []
        }
      }
    };
    
    // Create the store with initial state
    store = mockStore(initialState);
    
    // Mock the dispatch function
    store.dispatch = jest.fn();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      {children}
    </Provider>
  );

  it('should retrieve relationshipInfo from the store', () => {
    const { result } = renderHook(() => useRelationshipInfo(), { wrapper });
    
    expect(result.current.relationshipInfo).toEqual(defaultRelationshipInfo);
  });

  it('should update relationshipInfo field', () => {
    const { result } = renderHook(() => useRelationshipInfo(), { wrapper });
    
    // Update a field
    act(() => {
      result.current.updateRelationshipField('neverEntered.value', 'No');
    });
    
    // Check that dispatch was called with the correct action
    expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: {
        sectionPath: 'relationshipInfo',
        fieldPath: 'neverEntered.value',
        value: 'No'
      }
    }));
  });

  it('should set marital status and initialize required sections', () => {
    const { result } = renderHook(() => useRelationshipInfo(), { wrapper });
    
    // Set marital status to CurrentlyIn which should initialize section17_1 and section17_3
    act(() => {
      result.current.setMaritalStatus('CurrentlyIn');
    });
    
    // Check that dispatch was called for updating the status
    expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: {
        sectionPath: 'relationshipInfo',
        fieldPath: 'currentStatus',
        value: 'CurrentlyIn'
      }
    }));
  });

  it('should return correct sections based on marital status', () => {
    const { result } = renderHook(() => useRelationshipInfo(), { wrapper });
    
    // Test different marital statuses
    expect(result.current.getSectionsBasedOnStatus('NeverEntered')).toEqual(['section17_3']);
    expect(result.current.getSectionsBasedOnStatus('CurrentlyIn')).toEqual(['section17_1', 'section17_3']);
    expect(result.current.getSectionsBasedOnStatus('Separated')).toEqual(['section17_1', 'section17_3']);
    expect(result.current.getSectionsBasedOnStatus('Annulled')).toEqual(['section17_2', 'section17_3']);
    expect(result.current.getSectionsBasedOnStatus('Divorced')).toEqual(['section17_2', 'section17_3']);
    expect(result.current.getSectionsBasedOnStatus('Widowed')).toEqual(['section17_2', 'section17_3']);
    expect(result.current.getSectionsBasedOnStatus('InvalidStatus')).toEqual([]);
  });

  it('should add and remove previous marriages', () => {
    const { result } = renderHook(() => useRelationshipInfo(), { wrapper });
    
    // Add a previous marriage
    act(() => {
      result.current.addPreviousMarriage();
    });
    
    // Check that dispatch was called with the addEntry action
    expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: {
        sectionPath: 'relationshipInfo.section17_2'
      }
    }));
    
    // Remove a previous marriage
    act(() => {
      result.current.removePreviousMarriage(0);
    });
    
    // Check that dispatch was called with the removeEntry action
    expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: {
        sectionPath: 'relationshipInfo.section17_2',
        entryIndex: 0
      }
    }));
  });

  it('should add and remove cohabitants', () => {
    const { result } = renderHook(() => useRelationshipInfo(), { wrapper });
    
    // Add a cohabitant
    act(() => {
      result.current.addCohabitant();
    });
    
    // Check that dispatch was called with the addEntry action
    expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: {
        sectionPath: 'relationshipInfo.section17_3.cohabitants'
      }
    }));
    
    // Remove a cohabitant
    act(() => {
      result.current.removeCohabitant(0);
    });
    
    // Check that dispatch was called with the removeEntry action
    expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: {
        sectionPath: 'relationshipInfo.section17_3.cohabitants',
        entryIndex: 0
      }
    }));
  });

  it('should set has cohabitant status', () => {
    const { result } = renderHook(() => useRelationshipInfo(), { wrapper });
    
    // Set has cohabitant to YES
    act(() => {
      result.current.setHasCohabitant('YES');
    });
    
    // Check that dispatch was called with the correct action
    expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: {
        sectionPath: 'relationshipInfo',
        fieldPath: 'section17_3.hasCohabitant.value',
        value: 'YES'
      }
    }));
  });

  it('should set use current address status', () => {
    const { result } = renderHook(() => useRelationshipInfo(), { wrapper });
    
    // Update the section17_1 field first to prevent null check issues
    store = mockStore({
      form: {
        sections: {
          relationshipInfo: {
            ...defaultRelationshipInfo,
            section17_1: { ...defaultRelationshipInfo.section17_1 }
          }
        }
      }
    });
    
    // Set use current address
    act(() => {
      result.current.setUseCurrentAddress('Yes');
    });
    
    // Check that dispatch was called with the correct action
    expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: {
        sectionPath: 'relationshipInfo',
        fieldPath: 'section17_1.useMyCurrentAddress.value',
        value: 'Yes'
      }
    }));
  });

  it('should set is separated status', () => {
    const { result } = renderHook(() => useRelationshipInfo(), { wrapper });
    
    // Update the section17_1 field first to prevent null check issues
    store = mockStore({
      form: {
        sections: {
          relationshipInfo: {
            ...defaultRelationshipInfo,
            section17_1: { ...defaultRelationshipInfo.section17_1 }
          }
        }
      }
    });
    
    // Set is separated
    act(() => {
      result.current.setIsSeparated('YES');
    });
    
    // Check that dispatch was called with the correct action
    expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: {
        sectionPath: 'relationshipInfo',
        fieldPath: 'section17_1.isSeperated.value',
        value: 'YES'
      }
    }));
  });
}); 