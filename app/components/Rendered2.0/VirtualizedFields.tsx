/**
 * VirtualizedFields Component
 * Efficiently renders large numbers of form fields using virtual scrolling
 * Specifically designed for Section 13's 1,086+ fields
 */

import React, { memo, useCallback, useMemo, CSSProperties } from 'react';
import { FixedSizeList as List, VariableSizeList } from 'react-window';
import { ErrorBoundary } from 'react-error-boundary';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface FieldConfig {
  id: string;
  type: 'text' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea';
  label: string;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
  maxLength?: number;
  rows?: number;
}

export interface FieldGroup {
  title: string;
  fields: FieldConfig[];
  collapsed?: boolean;
}

interface VirtualizedFieldsProps {
  fields?: FieldConfig[];
  groups?: FieldGroup[];
  itemHeight?: number;
  maxVisibleHeight?: number;
  overscanCount?: number;
  onFieldChange?: (fieldId: string, value: any) => void;
  renderField?: (field: FieldConfig, style: CSSProperties) => React.ReactElement;
}

// ============================================================================
// FIELD RENDERER COMPONENT
// ============================================================================

const DefaultFieldRenderer = memo<{ field: FieldConfig; style: CSSProperties }>(({ 
  field, 
  style 
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = field.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;
    field.onChange(value);
  }, [field]);

  const fieldId = `field-${field.id}`;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;

  return (
    <div style={style} className="px-4 py-2 border-b border-gray-100">
      <div className="flex flex-col space-y-1">
        <label 
          htmlFor={fieldId}
          className={`text-sm font-medium ${field.error ? 'text-red-600' : 'text-gray-700'}`}
        >
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {field.type === 'select' ? (
          <select
            id={fieldId}
            value={field.value || ''}
            onChange={handleChange}
            disabled={field.disabled}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              field.error ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!field.error}
            aria-describedby={field.error ? errorId : field.helpText ? helpId : undefined}
          >
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : field.type === 'textarea' ? (
          <textarea
            id={fieldId}
            value={field.value || ''}
            onChange={handleChange}
            disabled={field.disabled}
            rows={field.rows || 3}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              field.error ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!field.error}
            aria-describedby={field.error ? errorId : field.helpText ? helpId : undefined}
          />
        ) : field.type === 'checkbox' ? (
          <input
            id={fieldId}
            type="checkbox"
            checked={field.value || false}
            onChange={handleChange}
            disabled={field.disabled}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            aria-invalid={!!field.error}
            aria-describedby={field.error ? errorId : field.helpText ? helpId : undefined}
          />
        ) : (
          <input
            id={fieldId}
            type={field.type}
            value={field.value || ''}
            onChange={handleChange}
            disabled={field.disabled}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              field.error ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!field.error}
            aria-describedby={field.error ? errorId : field.helpText ? helpId : undefined}
          />
        )}

        {field.error && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {field.error}
          </p>
        )}

        {field.helpText && !field.error && (
          <p id={helpId} className="text-sm text-gray-500">
            {field.helpText}
          </p>
        )}
      </div>
    </div>
  );
});

DefaultFieldRenderer.displayName = 'DefaultFieldRenderer';

// ============================================================================
// GROUP RENDERER FOR COLLAPSIBLE SECTIONS
// ============================================================================

const GroupRenderer = memo<{ 
  group: FieldGroup; 
  index: number;
  style: CSSProperties;
  toggleGroup: (index: number) => void;
}>(({ group, index, style, toggleGroup }) => {
  const handleToggle = useCallback(() => {
    toggleGroup(index);
  }, [index, toggleGroup]);

  return (
    <div style={style} className="bg-gray-50 border-b border-gray-200">
      <button
        onClick={handleToggle}
        className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-100 transition-colors"
        aria-expanded={!group.collapsed}
      >
        <span className="font-semibold text-gray-900">{group.title}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform ${
            group.collapsed ? '' : 'rotate-180'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
});

GroupRenderer.displayName = 'GroupRenderer';

// ============================================================================
// MAIN VIRTUALIZED FIELDS COMPONENT
// ============================================================================

const VirtualizedFields: React.FC<VirtualizedFieldsProps> = ({
  fields,
  groups,
  itemHeight = 80,
  maxVisibleHeight = 600,
  overscanCount = 5,
  onFieldChange,
  renderField
}) => {
  // Flatten groups into a single list for rendering
  const flattenedItems = useMemo(() => {
    if (groups) {
      const items: Array<{ type: 'group' | 'field'; data: FieldGroup | FieldConfig; groupIndex?: number }> = [];
      
      groups.forEach((group, groupIndex) => {
        items.push({ type: 'group', data: group, groupIndex });
        if (!group.collapsed) {
          group.fields.forEach(field => {
            items.push({ type: 'field', data: field });
          });
        }
      });
      
      return items;
    }
    
    return fields?.map(field => ({ type: 'field' as const, data: field })) || [];
  }, [fields, groups]);

  // Calculate item heights for variable size list
  const getItemSize = useCallback((index: number) => {
    const item = flattenedItems[index];
    if (item.type === 'group') {
      return 50; // Group header height
    }
    // Field height varies based on type
    const field = item.data as FieldConfig;
    if (field.type === 'textarea') return 120;
    if (field.error || field.helpText) return 100;
    return itemHeight;
  }, [flattenedItems, itemHeight]);

  // Toggle group collapse state
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<number>>(new Set());
  
  const toggleGroup = useCallback((groupIndex: number) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupIndex)) {
        next.delete(groupIndex);
      } else {
        next.add(groupIndex);
      }
      return next;
    });
  }, []);

  // Update groups with collapsed state
  const itemsWithCollapse = useMemo(() => {
    if (!groups) return flattenedItems;
    
    return flattenedItems.map(item => {
      if (item.type === 'group' && item.groupIndex !== undefined) {
        return {
          ...item,
          data: {
            ...item.data,
            collapsed: collapsedGroups.has(item.groupIndex)
          }
        };
      }
      return item;
    });
  }, [flattenedItems, groups, collapsedGroups]);

  // Render individual items
  const renderItem = useCallback(({ index, style }: { index: number; style: CSSProperties }) => {
    const item = itemsWithCollapse[index];
    
    if (item.type === 'group') {
      return (
        <GroupRenderer
          group={item.data as FieldGroup}
          index={item.groupIndex!}
          style={style}
          toggleGroup={toggleGroup}
        />
      );
    }
    
    const field = item.data as FieldConfig;
    
    if (renderField) {
      return renderField(field, style);
    }
    
    return <DefaultFieldRenderer field={field} style={style} />;
  }, [itemsWithCollapse, renderField, toggleGroup]);

  // Calculate total height
  const totalHeight = Math.min(
    flattenedItems.length * itemHeight,
    maxVisibleHeight
  );

  // Error boundary fallback
  const ErrorFallback = ({ error }: { error: Error }) => (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <p className="text-red-800">Error rendering fields: {error.message}</p>
    </div>
  );

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        {groups ? (
          <VariableSizeList
            height={totalHeight}
            itemCount={itemsWithCollapse.length}
            itemSize={getItemSize}
            overscanCount={overscanCount}
            width="100%"
          >
            {renderItem}
          </VariableSizeList>
        ) : (
          <List
            height={totalHeight}
            itemCount={flattenedItems.length}
            itemSize={itemHeight}
            overscanCount={overscanCount}
            width="100%"
          >
            {renderItem}
          </List>
        )}
      </div>
    </ErrorBoundary>
  );
};

// ============================================================================
// PERFORMANCE OPTIMIZED EXPORT
// ============================================================================

export default memo(VirtualizedFields);

// Export utility to create field configs from section data
export const createFieldConfig = (
  id: string,
  label: string,
  value: any,
  onChange: (value: any) => void,
  options?: Partial<FieldConfig>
): FieldConfig => ({
  id,
  label,
  value,
  onChange,
  type: 'text',
  ...options
});

// Export utility to group fields
export const createFieldGroup = (
  title: string,
  fields: FieldConfig[],
  collapsed = false
): FieldGroup => ({
  title,
  fields,
  collapsed
});