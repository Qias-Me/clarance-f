import { useState, useEffect } from 'react';
import { fetchFieldHierarchy } from '../../api/service/fieldHierarchyService';

export interface FieldHierarchyData {
  [formKey: string]: {
    regex: string;
    confidence: number;
    fields: Array<{
      id: string;
      name: string;
      label: string;
      value: string;
      section: number;
      sectionName: string;
      type: string;
      confidence: number;
    }>;
  };
}

interface UseFieldHierarchyResult {
  fieldHierarchy: FieldHierarchyData | null;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

/**
 * Hook to fetch and provide the field hierarchy data
 * 
 * @returns The field hierarchy data, loading state, error state, and reload function
 */
export function useFieldHierarchy(): UseFieldHierarchyResult {
  const [fieldHierarchy, setFieldHierarchy] = useState<FieldHierarchyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Function to load the field hierarchy
  const loadFieldHierarchy = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the field hierarchy from the API
      const hierarchyData = await fetchFieldHierarchy();
      setFieldHierarchy(hierarchyData);
    } catch (err) {
      console.error('Error loading field hierarchy:', err);
      setError(err instanceof Error ? err : new Error('Failed to load field hierarchy'));
    } finally {
      setLoading(false);
    }
  };
  
  // Load the field hierarchy on mount
  useEffect(() => {
    loadFieldHierarchy();
  }, []);
  
  // Function to reload the field hierarchy
  const reload = async () => {
    await loadFieldHierarchy();
  };
  
  return {
    fieldHierarchy,
    loading,
    error,
    reload
  };
} 