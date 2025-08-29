import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppDispatch } from '../state/hooks';

interface LoadingState {
  loaded: Set<string>;
  loading: Set<string>;
  failed: Set<string>;
  preloadQueue: string[];
}

interface SectionConfig {
  fields: any[];
  validation: any;
  dependencies: string[];
}

// Section dependency map
const SECTION_DEPENDENCIES: Record<string, string[]> = {
  '1': ['2', '3'],
  '2': ['3'],
  '3': ['4', '5'],
  '10': ['11'],
  '11': ['12'],
  '12': ['13'],
  '13': ['14', '15'],
  '14': ['15'],
  '27': ['28'],
  '28': ['29'],
  '29': ['30']
};

export function useProgressiveLoading(currentSectionId: string) {
  const dispatch = useAppDispatch();
  const [loadingState, setLoadingState] = useState<LoadingState>({
    loaded: new Set(['1']), // Section 1 is always loaded
    loading: new Set(),
    failed: new Set(),
    preloadQueue: []
  });

  const loadingPromises = useRef<Map<string, Promise<SectionConfig>>>(new Map());

  // Load a section dynamically
  const loadSection = useCallback(async (sectionId: string): Promise<void> => {
    // Check if already loaded or loading
    if (loadingState.loaded.has(sectionId) || loadingState.loading.has(sectionId)) {
      return;
    }

    // Check if there's already a loading promise for this section
    if (loadingPromises.current.has(sectionId)) {
      await loadingPromises.current.get(sectionId);
      return;
    }

    setLoadingState(prev => ({
      ...prev,
      loading: new Set([...prev.loading, sectionId])
    }));

    try {
      // Create and store the loading promise
      const loadPromise = (async () => {
        // Dynamically import section module
        const sectionModule = await import(
          /* webpackChunkName: "[request]" */
          `../config/section${sectionId}.config`
        );
        
        // Get section configuration
        const config: SectionConfig = sectionModule.default || sectionModule.getSectionConfig();
        
        // Initialize section in the store
        // dispatch(initializeSection({ sectionId, config }));
        
        return config;
      })();

      loadingPromises.current.set(sectionId, loadPromise);
      
      await loadPromise;

      // Update state on successful load
      setLoadingState(prev => ({
        ...prev,
        loaded: new Set([...prev.loaded, sectionId]),
        loading: new Set([...Array.from(prev.loading).filter(id => id !== sectionId)])
      }));

      // Clear the promise
      loadingPromises.current.delete(sectionId);
    } catch (error) {
      console.error(`Failed to load section ${sectionId}:`, error);
      
      // Update state on failure
      setLoadingState(prev => ({
        ...prev,
        failed: new Set([...prev.failed, sectionId]),
        loading: new Set([...Array.from(prev.loading).filter(id => id !== sectionId)])
      }));

      // Clear the promise
      loadingPromises.current.delete(sectionId);
      
      throw error;
    }
  }, [loadingState, dispatch]);

  // Preload next sections based on dependencies
  const preloadNextSections = useCallback((sectionId: string) => {
    const dependencies = SECTION_DEPENDENCIES[sectionId] || [];
    
    setLoadingState(prev => ({
      ...prev,
      preloadQueue: [...new Set([...prev.preloadQueue, ...dependencies])]
    }));

    // Start preloading in the background with staggered delays
    dependencies.forEach((depSectionId, index) => {
      setTimeout(() => {
        loadSection(depSectionId).catch(error => {
          console.warn(`Failed to preload section ${depSectionId}:`, error);
        });
      }, index * 100); // Stagger by 100ms to avoid overwhelming the browser
    });
  }, [loadSection]);

  // Load sections in batches for better performance
  const loadSectionBatch = useCallback(async (sectionIds: string[]): Promise<void> => {
    const loadPromises = sectionIds.map(sectionId => 
      loadSection(sectionId).catch(error => {
        console.warn(`Failed to load section ${sectionId} in batch:`, error);
      })
    );

    await Promise.all(loadPromises);
  }, [loadSection]);

  // Retry failed sections
  const retryFailedSections = useCallback(async (): Promise<void> => {
    const failedSections = Array.from(loadingState.failed);
    
    if (failedSections.length === 0) return;

    setLoadingState(prev => ({
      ...prev,
      failed: new Set()
    }));

    await loadSectionBatch(failedSections);
  }, [loadingState.failed, loadSectionBatch]);

  // Check if a section is loaded
  const isLoaded = useCallback((sectionId: string): boolean => {
    return loadingState.loaded.has(sectionId);
  }, [loadingState.loaded]);

  // Check if a section is loading
  const isLoading = useCallback((sectionId: string): boolean => {
    return loadingState.loading.has(sectionId);
  }, [loadingState.loading]);

  // Check if a section failed to load
  const hasFailed = useCallback((sectionId: string): boolean => {
    return loadingState.failed.has(sectionId);
  }, [loadingState.failed]);

  // Get loading progress
  const getLoadingProgress = useCallback((): number => {
    const total = loadingState.loaded.size + loadingState.loading.size + loadingState.failed.size;
    if (total === 0) return 0;
    return (loadingState.loaded.size / total) * 100;
  }, [loadingState]);

  // Auto-load current section
  useEffect(() => {
    if (currentSectionId && !isLoaded(currentSectionId) && !isLoading(currentSectionId)) {
      loadSection(currentSectionId);
    }
  }, [currentSectionId, isLoaded, isLoading, loadSection]);

  // Process preload queue
  useEffect(() => {
    if (loadingState.preloadQueue.length > 0) {
      const nextBatch = loadingState.preloadQueue.slice(0, 3); // Load up to 3 at a time
      
      setLoadingState(prev => ({
        ...prev,
        preloadQueue: prev.preloadQueue.slice(3)
      }));

      loadSectionBatch(nextBatch);
    }
  }, [loadingState.preloadQueue, loadSectionBatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending loads
      loadingPromises.current.clear();
    };
  }, []);

  return {
    loadSection,
    loadSectionBatch,
    preloadNextSections,
    retryFailedSections,
    isLoaded,
    isLoading,
    hasFailed,
    getLoadingProgress,
    loadedSections: Array.from(loadingState.loaded),
    loadingSections: Array.from(loadingState.loading),
    failedSections: Array.from(loadingState.failed)
  };
}