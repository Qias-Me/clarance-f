/**
 * Virtualized Field Renderer for Large Form Sections
 * Handles 1000+ fields efficiently with React Window
 */

import React, { useMemo, useCallback, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { FieldRenderer } from '../fields/FieldRenderer';
import { logger } from '../../../utils/logger';

interface FieldGroup {
  id: string;
  title: string;
  fields: Array<{
    id: string;
    label: string;
    type: string;
    value: any;
    onChange: (value: any) => void;
    error?: string;
    warning?: string;
  }>;
  isCollapsed: boolean;
}

interface VirtualizedFieldRendererProps {
  fields: any[];
  data: Record<string, any>;
  onFieldChange: (fieldPath: string, value: any) => void;
  errors: Array<{ field: string; message: string }>;
  warnings: Array<{ field: string; message: string }>;
  grouping?: 'type' | 'category' | 'none';
  itemHeight?: number;
  maxHeight?: number;
  searchTerm?: string;
}

export const VirtualizedFieldRenderer: React.FC<VirtualizedFieldRendererProps> = ({
  fields,
  data,
  onFieldChange,
  errors = [],
  warnings = [],
  grouping = 'type',
  itemHeight = 100,
  maxHeight = 600,
  searchTerm = ''
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Filter fields based on search term
  const filteredFields = useMemo(() => {
    if (!searchTerm) return fields;
    
    const term = searchTerm.toLowerCase();
    return fields.filter(field => 
      (field.label || '').toLowerCase().includes(term) ||
      (field.uiPath || '').toLowerCase().includes(term) ||
      (field.id || '').toLowerCase().includes(term)
    );
  }, [fields, searchTerm]);

  // Group fields for virtual rendering
  const fieldGroups = useMemo(() => {
    if (grouping === 'none') {
      return [{
        id: 'all',
        title: 'All Fields',
        fields: filteredFields.map(field => ({
          id: field.id || field.uiPath,
          label: field.label,
          type: field.type || 'text',
          value: data[field.uiPath] || '',
          onChange: (value: any) => onFieldChange(field.uiPath, value),
          error: errors.find(e => e.field === field.uiPath)?.message,
          warning: warnings.find(w => w.field === field.uiPath)?.message
        })),
        isCollapsed: false
      }];
    }

    // Group by type or category
    const groups: Record<string, FieldGroup> = {};
    
    filteredFields.forEach(field => {
      const groupKey = grouping === 'type' 
        ? field.type || 'general'
        : field.category || 'uncategorized';
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          id: groupKey,
          title: groupKey.charAt(0).toUpperCase() + groupKey.slice(1),
          fields: [],
          isCollapsed: collapsedGroups.has(groupKey)
        };
      }

      groups[groupKey].fields.push({
        id: field.id || field.uiPath,
        label: field.label,
        type: field.type || 'text',
        value: data[field.uiPath] || '',
        onChange: (value: any) => onFieldChange(field.uiPath, value),
        error: errors.find(e => e.field === field.uiPath)?.message,
        warning: warnings.find(w => w.field === field.uiPath)?.message
      });
    });

    return Object.values(groups);
  }, [filteredFields, grouping, data, onFieldChange, errors, warnings, collapsedGroups]);

  // Toggle group collapse
  const toggleGroup = useCallback((groupId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  // Flatten all visible items for virtualization
  const virtualItems = useMemo(() => {
    const items: Array<{ type: 'group' | 'field'; data: any }> = [];
    
    fieldGroups.forEach(group => {
      // Add group header
      items.push({ type: 'group', data: group });
      
      // Add fields if group is not collapsed
      if (!group.isCollapsed) {
        group.fields.forEach(field => {
          items.push({ type: 'field', data: field });
        });
      }
    });
    
    return items;
  }, [fieldGroups]);

  // Row renderer for react-window
  const renderItem = useCallback(({ index, style }: { index: number; style: any }) => {
    const item = virtualItems[index];
    
    if (item.type === 'group') {
      return (
        <div style={style} key={`group-${item.data.id}`}>
          <div 
            className="flex items-center justify-between p-3 bg-gray-100 border-b cursor-pointer hover:bg-gray-200"
            onClick={() => toggleGroup(item.data.id)}
          >
            <h3 className="font-semibold text-gray-800">
              {item.data.title} ({item.data.fields.length} fields)
            </h3>
            <span className="text-gray-500">
              {item.data.isCollapsed ? '▶' : '▼'}
            </span>
          </div>
        </div>
      );
    }
    
    // Field item
    const field = item.data;
    return (
      <div style={style} key={`field-${field.id}`} className="px-3 py-2">
        <FieldRenderer
          config={{
            id: field.id,
            type: field.type,
            label: field.label,
            required: !!field.error
          }}
          value={field.value}
          onChange={field.onChange}
          error={field.error}
          warning={field.warning}
        />
      </div>
    );
  }, [virtualItems, toggleGroup]);

  // Performance logging
  React.useEffect(() => {
    logger.info('VirtualizedFieldRenderer performance metrics', {
      component: 'VirtualizedFieldRenderer',
      metadata: {
        totalFields: fields.length,
        filteredFields: filteredFields.length,
        virtualItems: virtualItems.length,
        groups: fieldGroups.length
      }
    });
  }, [fields.length, filteredFields.length, virtualItems.length, fieldGroups.length]);

  if (virtualItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {searchTerm ? 'No fields match your search' : 'No fields available'}
      </div>
    );
  }

  return (
    <div className="virtualized-field-renderer">
      {/* Summary stats */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex justify-between text-sm text-blue-800">
          <span>{filteredFields.length} fields in {fieldGroups.length} groups</span>
          <span>Virtualized for performance</span>
        </div>
      </div>

      {/* Virtual list container */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <List
          height={Math.min(maxHeight, virtualItems.length * itemHeight)}
          itemCount={virtualItems.length}
          itemSize={itemHeight}
          overscanCount={5}
          className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
        >
          {renderItem}
        </List>
      </div>

      {/* Performance indicator */}
      <div className="mt-2 text-xs text-gray-400 text-right">
        ⚡ Rendering {virtualItems.length} items efficiently
      </div>
    </div>
  );
};

export default VirtualizedFieldRenderer;