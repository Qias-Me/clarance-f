import { FieldHierarchyData } from '../../state/hooks/useFieldHierarchy';

/**
 * Fetch the field hierarchy data from the API or local storage
 * 
 * @returns Promise resolving to the field hierarchy data
 */
export async function fetchFieldHierarchy(): Promise<FieldHierarchyData> {
  try {
    // Try to load from API first
    const response = await fetch('/api/field-hierarchy');
    
    if (response.ok) {
      const data = await response.json();
      
      // Cache in local storage for future use
      localStorage.setItem('field-hierarchy-cache', JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      
      return data;
    }
    
    // If API request fails, try to load from cache
    const cachedData = localStorage.getItem('field-hierarchy-cache');
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      
      // Check if cache is still valid (24 hours)
      const cacheAge = Date.now() - timestamp;
      const cacheValid = cacheAge < 24 * 60 * 60 * 1000;
      
      if (cacheValid) {
        console.log('Using cached field hierarchy data');
        return data;
      }
    }
    
    // If we get here, API failed and no valid cache exists, so fall back to local file
    const fallbackResponse = await fetch('/externalTools/field-hierarchy.json');
    
    if (!fallbackResponse.ok) {
      throw new Error('Failed to load field hierarchy from fallback source');
    }
    
    const fallbackData = await fallbackResponse.json();
    
    // Cache the fallback data
    localStorage.setItem('field-hierarchy-cache', JSON.stringify({
      data: fallbackData,
      timestamp: Date.now()
    }));
    
    return fallbackData;
  } catch (error) {
    console.error('Error fetching field hierarchy:', error);
    throw new Error('Failed to load field hierarchy data');
  }
}

/**
 * Extract only the fields for a specific section
 * 
 * @param fieldHierarchy The complete field hierarchy
 * @param sectionNumber The section number to extract
 * @returns Fields for the specified section
 */
export function getFieldsForSection(
  fieldHierarchy: FieldHierarchyData,
  sectionNumber: number
): Array<{
  id: string;
  name: string;
  label: string;
  value: string;
  section: number;
  sectionName: string;
  type: string;
  confidence: number;
}> {
  // Flatten all fields from all forms
  const allFields = Object.values(fieldHierarchy)
    .flatMap(form => form.fields || []);
  
  // Filter for the requested section
  return allFields.filter(field => field.section === sectionNumber);
}

/**
 * Extract field values for a specific section
 * 
 * @param fieldHierarchy The complete field hierarchy
 * @param sectionNumber The section number to extract
 * @returns Map of field IDs to their values
 */
export function getFieldValuesForSection(
  fieldHierarchy: FieldHierarchyData,
  sectionNumber: number
): Record<string, string> {
  const sectionFields = getFieldsForSection(fieldHierarchy, sectionNumber);
  
  return sectionFields.reduce((values, field) => {
    if (field.id && field.value !== undefined) {
      values[field.id] = field.value;
    }
    return values;
  }, {} as Record<string, string>);
} 