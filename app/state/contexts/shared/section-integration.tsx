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
  ContextEventType,
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
    return this.sections.get(sectionId);
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
 */
export function useSectionContextIntegration(
  sectionId: SectionId,
  sectionName: string,
  sectionContext: BaseSectionContext
) {
  const integration = useSectionIntegration();
  
  // Register section on mount
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
  }, [sectionId, sectionName, sectionContext, integration]);
  
  // Sync section data when it changes
  useEffect(() => {
    integration.syncSectionData(sectionId, sectionContext.sectionData);
  }, [sectionId, sectionContext.sectionData, integration]);
  
  // Update registration when context changes
  useEffect(() => {
    integration.updateSection(sectionId, {
      context: sectionContext,
      lastUpdated: new Date()
    });
  }, [sectionId, sectionContext, integration]);
  
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
