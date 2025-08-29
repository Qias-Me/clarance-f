/**
 * Field Plugin System Types
 * 
 * Extensible plugin architecture for custom field types
 */

import type { ReactNode, ComponentType } from 'react';
import type { Field } from '../../api/interfaces/formDefinition2.0';

export interface FieldPluginContext {
  sectionNumber: number;
  fieldPath: string;
  parentContext?: Record<string, any>;
  services: {
    validation: (value: any) => Promise<boolean>;
    storage: {
      get: (key: string) => any;
      set: (key: string, value: any) => void;
    };
    logger: {
      info: (message: string) => void;
      warn: (message: string) => void;
      error: (message: string) => void;
    };
  };
}

export interface FieldPluginProps<T = any> {
  value: T;
  onChange: (value: T) => void;
  error?: string;
  warning?: string;
  disabled?: boolean;
  readonly?: boolean;
  field: Field<T>;
  context: FieldPluginContext;
}

export interface FieldPlugin<T = any> {
  // Plugin metadata
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  
  // Field type support
  supportedTypes: string[];
  priority?: number;
  
  // Lifecycle hooks
  onRegister?: () => void;
  onUnregister?: () => void;
  onBeforeRender?: (props: FieldPluginProps<T>) => FieldPluginProps<T>;
  onAfterRender?: (element: ReactNode) => void;
  
  // Core functionality
  component: ComponentType<FieldPluginProps<T>>;
  validator?: (value: T, context: FieldPluginContext) => Promise<{
    isValid: boolean;
    error?: string;
    warning?: string;
  }>;
  transformer?: {
    toForm: (value: any) => T;
    fromForm: (value: T) => any;
    toPDF: (value: T) => string;
  };
  
  // Advanced features
  canHandle: (field: Field<any>, context: FieldPluginContext) => boolean;
  dependencies?: string[];
  config?: Record<string, any>;
}

export interface FieldPluginRegistry {
  register(plugin: FieldPlugin): void;
  unregister(pluginId: string): void;
  getPlugin(fieldType: string, field: Field<any>, context: FieldPluginContext): FieldPlugin | null;
  getAllPlugins(): FieldPlugin[];
  hasPlugin(pluginId: string): boolean;
}

export interface FieldPluginManager {
  registry: FieldPluginRegistry;
  loadPlugin(plugin: FieldPlugin | string): Promise<void>;
  unloadPlugin(pluginId: string): void;
  renderField(field: Field<any>, props: Partial<FieldPluginProps>): ReactNode;
  validateField(field: Field<any>, value: any, context: FieldPluginContext): Promise<{
    isValid: boolean;
    error?: string;
    warning?: string;
  }>;
}