/**
 * Section Integration Framework for SF-86 Form Architecture
 *
 * This module provides the communication layer between individual section contexts
 * and the central SF86FormContext. It handles section registration, data synchronization,
 * and event-driven updates.
 */

import React, { createContext, useContext, useCallback, useRef, useEffect } from 'react';
import type {
  BaseSectionContext,
  SectionRegistration,
  ContextEvent,
  ContextEventListener,
  SectionId
} from './base-interfaces';

// ============================================================================
// CONTEXT EVENT BUS
// ============================================================================

/**
 * Event bus for inter-context communication
 * Provides a centralized way for contexts to communicate with each other
 */
class ContextEventBus {
  private listeners: Map<string, ContextEventListener[]> = new Map();

  /**
   * Emit an event to all registered listeners
   */
  emit(event: ContextEvent): void {
    const eventListeners = this.listeners.get(event.type) || [];
    const allListeners = this.listeners.get('*') || [];

    [...eventListeners, ...allListeners].forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in context event listener:', error);
      }
    });
  }

  /**
   * Subscribe to events of a specific type
   */
  subscribe(eventType: string, callback: ContextEventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    this.listeners.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(eventType: string, callback: ContextEventListener): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.listeners.clear();
  }
}

// Global event bus instance
const globalEventBus = new ContextEventBus();

// ============================================================================
// SECTION REGISTRY
// ============================================================================

/**
 * Section registry for tracking all registered sections
 */
class SectionRegistry {
  private sections: Map<string, SectionRegistration> = new Map();

  /**
   * Register a section context
   */
  register(registration: SectionRegistration): void {
    const existing = this.sections.get(registration.sectionId);

    // // CRITICAL LOGGING: Track all registration updates for Section 29
    // if (registration.sectionId === 'section29') {
    //   console.log(`🔄 SectionRegistry: Registering section29`);
    //   console.log(`   📋 New registration lastUpdated:`, registration.lastUpdated);
    //   console.log(`   📋 New registration terrorismAssociations.entries.length:`, registration.context.sectionData?.terrorismAssociations?.entries?.length || 0);

    //   if (existing) {
    //     console.log(`   📋 Existing registration lastUpdated:`, existing.lastUpdated);
    //     console.log(`   📋 Existing registration terrorismAssociations.entries.length:`, existing.context.sectionData?.terrorismAssociations?.entries?.length || 0);

    //     // Check if this is overwriting newer data
    //     const existingTime = existing.lastUpdated?.getTime() || 0;
    //     const newTime = registration.lastUpdated?.getTime() || 0;
    //     const existingEntries = existing.context.sectionData?.terrorismAssociations?.entries?.length || 0;
    //     const newEntries = registration.context.sectionData?.terrorismAssociations?.entries?.length || 0;

    //     // CRITICAL: Prevent overwriting newer data with stale data
    //     if (existingEntries > newEntries && existingTime > newTime - 10000) {
    //       console.log(`   🚫 BLOCKING: Preventing stale data from overwriting newer data!`);
    //       console.log(`   📊 Existing time: ${existingTime}, New time: ${newTime}`);
    //       console.log(`   📊 Existing entries: ${existingEntries}, New entries: ${newEntries}`);
    //       console.log(`   🔄 Keeping existing registration instead of overwriting`);
    //       return; // BLOCK the registration update
    //     }

    //     if (existingTime > newTime || (existingEntries > newEntries && existingTime > newTime - 5000)) {
    //       console.log(`   ⚠️ WARNING: Potentially overwriting newer data!`);
    //       console.log(`   📊 Existing time: ${existingTime}, New time: ${newTime}`);
    //       console.log(`   📊 Existing entries: ${existingEntries}, New entries: ${newEntries}`);
    //     }
    //   }
    // }


        // CRITICAL LOGGING: Track all registration updates for Section 29
        if (registration.sectionId === 'section17') {
          console.log(`🔄 SectionRegistry: Registering section17`);
          console.log(`   📋 New registration lastUpdated:`, registration.lastUpdated);
          console.log(`   📋 New registration terrorismAssociations.entries.length:`, registration.context.sectionData?.terrorismAssociations?.entries?.length || 0);
    
          if (existing) {
            console.log(`   📋 Existing registration lastUpdated:`, existing.lastUpdated);
            console.log(`   📋 Existing registration terrorismAssociations.entries.length:`, existing.context.sectionData?.terrorismAssociations?.entries?.length || 0);
    
            // Check if this is overwriting newer data
            const existingTime = existing.lastUpdated?.getTime() || 0;
            const newTime = registration.lastUpdated?.getTime() || 0;
            const existingEntries = existing.context.sectionData?.length || 0;
            const newEntries = registration.context.sectionData?.length || 0;
    
            // CRITICAL: Prevent overwriting newer data with stale data
            if (existingEntries > newEntries && existingTime > newTime - 10000) {
              console.log(`   🚫 BLOCKING: Preventing stale data from overwriting newer data!`);
              console.log(`   📊 Existing time: ${existingTime}, New time: ${newTime}`);
              console.log(`   📊 Existing entries: ${existingEntries}, New entries: ${newEntries}`);
              console.log(`   🔄 Keeping existing registration instead of overwriting`);
              return; // BLOCK the registration update
            }
    
            if (existingTime > newTime || (existingEntries > newEntries && existingTime > newTime - 5000)) {
              console.log(`   ⚠️ WARNING: Potentially overwriting newer data!`);
              console.log(`   📊 Existing time: ${existingTime}, New time: ${newTime}`);
              console.log(`   📊 Existing entries: ${existingEntries}, New entries: ${newEntries}`);
            }
          }
        }

    this.sections.set(registration.sectionId, registration);

    // Emit registration event
    globalEventBus.emit({
      type: 'SECTION_UPDATE',
      sectionId: registration.sectionId,
      payload: { action: 'registered', registration },
      timestamp: new Date(),
      source: 'SectionRegistry'
    });
  }

  /**
   * Unregister a section context
   */
  unregister(sectionId: string): void {
    const registration = this.sections.get(sectionId);
    if (registration) {
      this.sections.delete(sectionId);

      // Emit unregistration event
      globalEventBus.emit({
        type: 'SECTION_UPDATE',
        sectionId,
        payload: { action: 'unregistered', registration },
        timestamp: new Date(),
        source: 'SectionRegistry'
      });
    }
  }

  /**
   * Get a registered section
   */
  get(sectionId: string): SectionRegistration | undefined {
    const registration = this.sections.get(sectionId);

    // CRITICAL LOGGING: Track when Section 29 registration is retrieved
    if (sectionId === 'section29' && registration) {
      console.log(`🔍 SectionRegistry: Getting section29 registration`);
      console.log(`   📋 Retrieved registration lastUpdated:`, registration.lastUpdated);
      console.log(`   📋 Retrieved registration terrorismAssociations.entries.length:`, registration.context.sectionData?.terrorismAssociations?.entries?.length || 0);
      console.log(`   📋 Retrieved registration hasAssociation.value:`, registration.context.sectionData?.terrorismAssociations?.hasAssociation?.value);
    }

    return registration;
  }

  /**
   * Get all registered sections
   */
  getAll(): SectionRegistration[] {
    return Array.from(this.sections.values());
  }

  /**
   * Check if a section is registered
   */
  isRegistered(sectionId: string): boolean {
    return this.sections.has(sectionId);
  }

  /**
   * Update section registration
   */
  update(sectionId: string, updates: Partial<SectionRegistration>): void {
    const existing = this.sections.get(sectionId);
    if (existing) {
      const updated = { ...existing, ...updates, lastUpdated: new Date() };
      this.sections.set(sectionId, updated);

      // Emit update event
      globalEventBus.emit({
        type: 'SECTION_UPDATE',
        sectionId,
        payload: { action: 'updated', registration: updated },
        timestamp: new Date(),
        source: 'SectionRegistry'
      });
    }
  }
}

// Global section registry instance
const globalSectionRegistry = new SectionRegistry();

// ============================================================================
// SECTION INTEGRATION CONTEXT
// ============================================================================

/**
 * Section integration context interface
 */
interface SectionIntegrationContextType {
  // Event bus operations
  emitEvent: (event: Omit<ContextEvent, 'timestamp' | 'source'>) => void;
  subscribeToEvents: (eventType: string, callback: ContextEventListener) => () => void;

  // Section registry operations
  registerSection: (registration: SectionRegistration) => void;
  unregisterSection: (sectionId: string) => void;
  getSection: (sectionId: string) => SectionRegistration | undefined;
  getAllSections: () => SectionRegistration[];
  updateSection: (sectionId: string, updates: Partial<SectionRegistration>) => void;

  // Data synchronization
  syncSectionData: (sectionId: string, data: any) => void;
  requestSectionData: (sectionId: string) => any;

  // Cross-section communication
  notifySectionChange: (sectionId: string, changeType: string, payload: any) => void;
  requestValidation: (sectionId: string) => void;
}

/**
 * Section integration context
 */
const SectionIntegrationContext = createContext<SectionIntegrationContextType | null>(null);

/**
 * Section integration provider component
 */
export const SectionIntegrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Data synchronization cache
  const dataCacheRef = useRef<Map<string, any>>(new Map());

  /**
   * Emit an event through the global event bus
   */
  const emitEvent = useCallback((event: Omit<ContextEvent, 'timestamp' | 'source'>) => {
    globalEventBus.emit({
      ...event,
      timestamp: new Date(),
      source: 'SectionIntegrationProvider'
    });
  }, []);

  /**
   * Subscribe to events
   */
  const subscribeToEvents = useCallback((eventType: string, callback: ContextEventListener) => {
    return globalEventBus.subscribe(eventType, callback);
  }, []);

  /**
   * Register a section
   */
  const registerSection = useCallback((registration: SectionRegistration) => {
    globalSectionRegistry.register(registration);
  }, []);

  /**
   * Unregister a section
   */
  const unregisterSection = useCallback((sectionId: string) => {
    globalSectionRegistry.unregister(sectionId);
    dataCacheRef.current.delete(sectionId);
  }, []);

  /**
   * Get a section registration
   */
  const getSection = useCallback((sectionId: string) => {
    return globalSectionRegistry.get(sectionId);
  }, []);

  /**
   * Get all section registrations
   */
  const getAllSections = useCallback(() => {
    return globalSectionRegistry.getAll();
  }, []);

  /**
   * Update a section registration
   */
  const updateSection = useCallback((sectionId: string, updates: Partial<SectionRegistration>) => {
    globalSectionRegistry.update(sectionId, updates);
  }, []);

  /**
   * Sync section data to cache
   */
  const syncSectionData = useCallback((sectionId: string, data: any) => {
    dataCacheRef.current.set(sectionId, data);

    // Emit data sync event
    emitEvent({
      type: 'DATA_SYNC',
      sectionId,
      payload: { data }
    });
  }, [emitEvent]);

  /**
   * Request section data from cache
   */
  const requestSectionData = useCallback((sectionId: string) => {
    return dataCacheRef.current.get(sectionId);
  }, []);

  /**
   * Notify other sections of a change
   */
  const notifySectionChange = useCallback((sectionId: string, changeType: string, payload: any) => {
    emitEvent({
      type: 'SECTION_UPDATE',
      sectionId,
      payload: { changeType, ...payload }
    });
  }, [emitEvent]);

  /**
   * Request validation for a section
   */
  const requestValidation = useCallback((sectionId: string) => {
    emitEvent({
      type: 'VALIDATION_REQUEST',
      sectionId,
      payload: {}
    });
  }, [emitEvent]);

  const contextValue: SectionIntegrationContextType = {
    emitEvent,
    subscribeToEvents,
    registerSection,
    unregisterSection,
    getSection,
    getAllSections,
    updateSection,
    syncSectionData,
    requestSectionData,
    notifySectionChange,
    requestValidation
  };

  return (
    <SectionIntegrationContext.Provider value={contextValue}>
      {children}
    </SectionIntegrationContext.Provider>
  );
};

/**
 * Hook to use section integration context
 */
export const useSectionIntegration = (): SectionIntegrationContextType => {
  const context = useContext(SectionIntegrationContext);
  if (!context) {
    throw new Error('useSectionIntegration must be used within a SectionIntegrationProvider');
  }
  return context;
};

// ============================================================================
// SECTION INTEGRATION HOOK
// ============================================================================

/**
 * Hook that provides section integration capabilities for individual section contexts
 * This should be used by each section context to integrate with the central system
 *
 * DEPRECATED: This hook causes infinite re-renders. Use Section 29 pattern instead:
 * - Register once on mount with only [integration] dependency
 * - Use stable memoized baseSectionContext
 * - Remove automatic updates on context changes
 */
export function useSectionContextIntegration(
  sectionId: SectionId,
  sectionName: string,
  sectionContext: BaseSectionContext
) {
  const integration = useSectionIntegration();

  // Register section on mount - ONLY ONCE
  useEffect(() => {
    const registration: SectionRegistration = {
      sectionId,
      sectionName,
      context: sectionContext,
      isActive: true,
      lastUpdated: new Date()
    };

    integration.registerSection(registration);

    // Unregister on unmount
    return () => {
      integration.unregisterSection(sectionId);
    };
  }, [sectionId, sectionName, integration]); // REMOVED sectionContext dependency to prevent infinite loops

  // REMOVED: Automatic sync and update effects that cause infinite loops
  // Sections should handle their own data sync through their own patterns

  return {
    emitEvent: integration.emitEvent,
    subscribeToEvents: integration.subscribeToEvents,
    notifyChange: (changeType: string, payload: any) =>
      integration.notifySectionChange(sectionId, changeType, payload),
    requestValidation: () => integration.requestValidation(sectionId)
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  ContextEventBus,
  SectionRegistry,
  globalEventBus,
  globalSectionRegistry
};
