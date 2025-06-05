/**
 * Section Context Integration Framework
 *
 * This framework allows individual section contexts to integrate with the central
 * SF86FormContext while maintaining their independence and section-specific functionality.
 * It provides hooks and utilities for seamless bidirectional data synchronization.
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { cloneDeep, isEqual } from 'lodash';
import type {
  BaseSectionContext,
  SectionId,
  ValidationResult,
  ChangeSet
} from './base-interfaces';
import { useSF86Form } from '../SF86FormContext';
import { useSectionIntegration } from './section-integration';

// ============================================================================
// INTEGRATION HOOK FOR SECTION CONTEXTS
// ============================================================================

/**
 * Enhanced Section Context Integration Hook
 *
 * This hook provides seamless integration between individual section contexts
 * and the main SF86FormContext, with enhanced IndexedDB persistence support.
 */
export function useSection86FormIntegration<T>(
  sectionId: SectionId,
  sectionName: string,
  sectionData: T,
  setSectionData: React.Dispatch<React.SetStateAction<T>>,
  validateSection: () => any,
  getChanges: () => any,
  updateFieldValue?: (path: string, value: any) => void
) {
  const integration = useSectionIntegration();
  const lastRegistrationRef = useRef<Date>(new Date());
  const isInitializedRef = useRef(false);

  const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');

  // REMOVED: createSectionContext function - now creating context inline to prevent dependency loops

  // REMOVED: registerSection function - now doing registration directly in useEffect to prevent dependency issues

  /**
   * Handle data synchronization events from global context
   */
  const handleDataSyncEvent = useCallback((event: any) => {
    if (event.sectionId === 'global' || event.sectionId === sectionId) {
      const { payload } = event;

      if (isDebugMode) {
        console.log(`📡 ${sectionId}: Received data sync event:`, payload.action);
      }

      switch (payload.action) {
        case 'loaded':
          // FIXED: Only sync on initial load from storage, and never override if section has local changes
          if (payload.formData && payload.formData[sectionId] && !isInitializedRef.current) {
            const newSectionData = payload.formData[sectionId];
            if (isDebugMode) {
              console.log(`🔄 ${sectionId}: Synchronizing with loaded data (initial load only)`);
              console.log(`   📊 Data type: ${typeof newSectionData}`);
              console.log(`   📊 Data keys: ${newSectionData ? Object.keys(newSectionData) : 'N/A'}`);
            }
            setSectionData(cloneDeep(newSectionData));
            isInitializedRef.current = true; // Mark as initialized to prevent future overwrites
          } else if (payload.formData && payload.formData[sectionId] && isInitializedRef.current) {
            // FIXED: Don't override if section is already initialized - this prevents race conditions
            if (isDebugMode) {
              console.log(`🛡️ ${sectionId}: Skipping data sync - section already initialized (prevents override of user changes)`);
            }
          }
          break;

        case 'data_synchronized':
          // FIXED: Never overwrite local section data with global data
          // The section context is always the source of truth for its own data
          if (isDebugMode) {
            console.log(`🔄 ${sectionId}: Ignoring data_synchronized to prevent overwriting local changes`);
          }
          break;

        case 'data_loaded':
          // FIXED: Only accept individual section data updates if they're explicitly from storage
          // and not from other section contexts to prevent circular updates
          if (event.sectionId === sectionId && payload.data && payload.fromStorage === true) {
            if (isDebugMode) {
              console.log(`🔄 ${sectionId}: Updating with individual section data from storage`);
            }
            setSectionData(cloneDeep(payload.data));
          } else if (isDebugMode) {
            console.log(`🔄 ${sectionId}: Ignoring data_loaded event (not from storage or wrong section)`);
          }
          break;

        case 'saved':
          if (isDebugMode) {
            console.log(`✅ ${sectionId}: Data successfully saved to IndexedDB`);
          }
          break;

        case 'save_failed':
        case 'load_failed':
          if (isDebugMode) {
            console.error(`❌ ${sectionId}: Data persistence error:`, payload.error);
          }
          break;
      }
    }
  }, [sectionId, setSectionData, isDebugMode]);

  /**
   * Handle section update events
   */
  const handleSectionUpdateEvent = useCallback((event: any) => {
    if (event.sectionId === sectionId) {
      const { payload } = event;

      if (isDebugMode) {
        console.log(`📡 ${sectionId}: Received section update event:`, payload.action);
      }

      switch (payload.action) {
        case 'data_loaded':
          // FIXED: Only load data if section is not initialized to prevent overriding user changes
          if (payload.data && !isInitializedRef.current) {
            if (isDebugMode) {
              console.log(`🔄 ${sectionId}: Loading data from section update (initial load only)`);
            }
            setSectionData(cloneDeep(payload.data));
            isInitializedRef.current = true;
          } else if (isDebugMode) {
            console.log(`🛡️ ${sectionId}: Skipping data_loaded - section already initialized (prevents override of user changes)`);
          }
          break;

        case 'reset':
          if (isDebugMode) {
            console.log(`🔄 ${sectionId}: Resetting section data`);
          }
          // Section should reset to default state
          break;
      }
    }
  }, [sectionId, setSectionData, isDebugMode]);

  /**
   * Subscribe to global events
   */
  useEffect(() => {
    if (isDebugMode) {
      console.log(`🔗 ${sectionId}: Setting up event subscriptions`);
    }

    // Subscribe to data sync events
    const unsubscribeDataSync = integration.subscribeToEvents('DATA_SYNC', handleDataSyncEvent);

    // Subscribe to section update events
    const unsubscribeSectionUpdate = integration.subscribeToEvents('SECTION_UPDATE', handleSectionUpdateEvent);

    return () => {
      if (isDebugMode) {
        console.log(`🔌 ${sectionId}: Cleaning up event subscriptions`);
      }
      unsubscribeDataSync();
      unsubscribeSectionUpdate();
    };
  }, [integration, handleDataSyncEvent, handleSectionUpdateEvent, isDebugMode, sectionId]);

  /**
   * Register section ONLY on mount - FIXED: Register once and update context data separately
   * No re-registration on data changes to prevent infinite loops
   */
  useEffect(() => {
    if (!isInitializedRef.current) {
      const now = new Date();
      lastRegistrationRef.current = now;

      if (isDebugMode) {
        console.log(`📝 ${sectionId}: Registering section context (one-time only)`);
        console.log(`   🕒 Registration time: ${now.toISOString()}`);
      }

      // Register with initial context - data will be updated separately
      integration.registerSection({
        sectionId,
        sectionName,
        lastUpdated: now,
        isActive: true,
        context: {
          sectionId,
          sectionName,
          sectionData,
          isLoading: false,
          errors: [],
          isDirty: false,
          validateSection: () => validateSection(),
          resetSection: () => {},
          getChanges: () => getChanges(),
          updateFieldValue: updateFieldValue || (() => {}),
          loadSection: (data: T) => {
            if (isDebugMode) {
              console.log(`🔄 ${sectionId}: Loading section data from global context`);
            }
            setSectionData(cloneDeep(data));
          }
        }
      });

      isInitializedRef.current = true;
    }
  }, [sectionId, sectionName, integration, isDebugMode]); // FIXED: Only stable dependencies

  /**
   * Sync section data to integration cache when data changes
   * This ensures SF86FormContext can get current data via syncSectionData
   * FIXED: Added debounce and deep equality check to prevent infinite loops
   */
  const lastSyncedDataRef = useRef<any>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isInitializedRef.current) {
      // Clear any pending sync
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      // Debounce the sync to prevent rapid-fire updates
      syncTimeoutRef.current = setTimeout(() => {
        // Only sync if data has actually changed (deep comparison)
        if (JSON.stringify(sectionData) !== JSON.stringify(lastSyncedDataRef.current)) {
          integration.syncSectionData(sectionId, sectionData);
          lastSyncedDataRef.current = cloneDeep(sectionData);

          if (isDebugMode) {
            console.log(`🔄 ${sectionId}: Synced current data to integration cache (debounced)`);
          }
        } else if (isDebugMode) {
          console.log(`🔄 ${sectionId}: Skipping sync - data unchanged`);
        }
      }, 100); // 100ms debounce
    }

    // Cleanup timeout on unmount
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [sectionData, integration, sectionId, isDebugMode]);

  // REMOVED: Problematic second useEffect that caused infinite re-registrations
  // Section contexts should only register once on mount, not re-register on every data change

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (isDebugMode) {
        console.log(`🧹 ${sectionId}: Unregistering section context`);
      }
      integration.unregisterSection(sectionId);
    };
  }, [integration, sectionId, isDebugMode]);

  // Return integration utilities
  return {
    emitSectionUpdate: (action: string, payload: any) => {
      integration.emitEvent({
        type: 'SECTION_UPDATE',
        sectionId,
        payload: { action, ...payload }
      });
    },
    emitDataSync: (action: string, data: T) => {
      integration.emitEvent({
        type: 'DATA_SYNC',
        sectionId,
        payload: { action, data }
      });
    }
  };
}

// ============================================================================
// ENHANCED SECTION PROVIDER WRAPPER
// ============================================================================

/**
 * Higher-order component that wraps section providers with SF86Form integration
 */
export function withSF86FormIntegration<P extends object>(
  WrappedProvider: React.ComponentType<P>,
  sectionId: SectionId,
  sectionName: string
) {
  const IntegratedProvider: React.FC<P> = (props) => {
    return (
      <WrappedProvider {...props} />
    );
  };

  IntegratedProvider.displayName = `withSF86FormIntegration(${WrappedProvider.displayName || WrappedProvider.name})`;

  return IntegratedProvider;
}

// ============================================================================
// SECTION CONTEXT FACTORY
// ============================================================================

/**
 * Factory function to create section contexts with built-in SF86Form integration
 */
export function createIntegratedSectionContext<T>(
  sectionId: SectionId,
  sectionName: string,
  defaultData: T
) {
  const SectionContext = React.createContext<{
    sectionData: T;
    setSectionData: React.Dispatch<React.SetStateAction<T>>;
    integration: {
      emitSectionUpdate: (action: string, payload: any) => void;
      emitDataSync: (action: string, data: T) => void;
    };
  } | null>(null);

  const SectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sectionData, setSectionData] = React.useState<T>(defaultData);

    const integration = useSection86FormIntegration(
      sectionId,
      sectionName,
      sectionData,
      setSectionData,
      () => ({ isValid: true, errors: [], warnings: [] }), // Default validation
      () => ({}) // Default change tracking
    );

    const contextValue = {
      sectionData,
      setSectionData,
      integration
    };

    return (
      <SectionContext.Provider value={contextValue}>
        {children}
      </SectionContext.Provider>
    );
  };

  const useSection = () => {
    const context = React.useContext(SectionContext);
    if (!context) {
      throw new Error(`useSection must be used within a ${sectionName}Provider`);
    }
    return context;
  };

  return {
    SectionContext,
    SectionProvider,
    useSection
  };
}

// ============================================================================
// VALIDATION INTEGRATION UTILITIES
// ============================================================================

/**
 * Hook for integrating section validation with global form validation
 */
export function useSectionValidationIntegration(
  sectionId: SectionId,
  validateSection: () => ValidationResult
) {
  const sf86Form = useSF86Form();

  /**
   * Validate section and update global form state
   */
  const validateAndSync = useCallback(() => {
    const result = validateSection();

    // Update global form validation state if needed
    if (!result.isValid) {
      // The central form will pick up validation errors through the section context
    }

    return result;
  }, [validateSection]);

  /**
   * Listen for global validation requests
   */
  useEffect(() => {
    // The section context will be called automatically by the central form
    // No explicit subscription needed as the central form will call validateSection directly
    return () => {};
  }, [sectionId, sf86Form]);

  return {
    validateAndSync
  };
}

// ============================================================================
// CHANGE TRACKING INTEGRATION
// ============================================================================

/**
 * Hook for integrating section change tracking with global form change tracking
 */
export function useSectionChangeTracking<T>(
  sectionId: SectionId,
  sectionData: T,
  initialData: T
) {
  const sf86Form = useSF86Form();

  /**
   * Check if section has changes
   */
  const isDirty = React.useMemo(() => {
    return !isEqual(sectionData, initialData);
  }, [sectionData, initialData]);

  /**
   * Get section changes
   */
  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    // Simple change detection (can be enhanced)
    if (!isEqual(sectionData, initialData)) {
      changes[sectionId] = {
        oldValue: initialData,
        newValue: sectionData,
        timestamp: new Date()
      };
    }

    return changes;
  }, [sectionData, initialData, sectionId]);

  /**
   * Reset section to initial state
   */
  const resetToInitial = useCallback(() => {
    sf86Form.updateSectionData(sectionId, cloneDeep(initialData));
  }, [sf86Form, sectionId, initialData]);

  return {
    isDirty,
    getChanges,
    resetToInitial
  };
}

