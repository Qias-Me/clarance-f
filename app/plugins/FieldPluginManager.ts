/**
 * Field Plugin Manager
 * 
 * Manages field plugins and provides a unified interface for rendering and validation
 */

import React from 'react';
import type {
  FieldPlugin,
  FieldPluginRegistry,
  FieldPluginManager as IFieldPluginManager,
  FieldPluginContext,
  FieldPluginProps
} from './field-plugin.types';
import type { Field } from '../../api/interfaces/formDefinition2.0';
import { logger } from '../services/Logger';

class PluginRegistry implements FieldPluginRegistry {
  private plugins = new Map<string, FieldPlugin>();
  private typeIndex = new Map<string, FieldPlugin[]>();
  
  register(plugin: FieldPlugin): void {
    if (this.plugins.has(plugin.id)) {
      logger.warn(`Plugin ${plugin.id} already registered, replacing`, 'FieldPluginManager');
    }
    
    this.plugins.set(plugin.id, plugin);
    
    // Update type index
    plugin.supportedTypes.forEach(type => {
      const existing = this.typeIndex.get(type) || [];
      const filtered = existing.filter(p => p.id !== plugin.id);
      filtered.push(plugin);
      filtered.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      this.typeIndex.set(type, filtered);
    });
    
    // Call lifecycle hook
    if (plugin.onRegister) {
      plugin.onRegister();
    }
    
    logger.info(`Plugin ${plugin.id} registered`, 'FieldPluginManager');
  }
  
  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;
    
    // Call lifecycle hook
    if (plugin.onUnregister) {
      plugin.onUnregister();
    }
    
    // Remove from type index
    plugin.supportedTypes.forEach(type => {
      const existing = this.typeIndex.get(type) || [];
      const filtered = existing.filter(p => p.id !== pluginId);
      if (filtered.length > 0) {
        this.typeIndex.set(type, filtered);
      } else {
        this.typeIndex.delete(type);
      }
    });
    
    this.plugins.delete(pluginId);
    logger.info(`Plugin ${pluginId} unregistered`, 'FieldPluginManager');
  }
  
  getPlugin(fieldType: string, field: Field<any>, context: FieldPluginContext): FieldPlugin | null {
    const candidates = this.typeIndex.get(fieldType) || [];
    
    for (const plugin of candidates) {
      if (plugin.canHandle(field, context)) {
        return plugin;
      }
    }
    
    return null;
  }
  
  getAllPlugins(): FieldPlugin[] {
    return Array.from(this.plugins.values());
  }
  
  hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }
}

export class FieldPluginManager implements IFieldPluginManager {
  public readonly registry: FieldPluginRegistry;
  private loadedPlugins = new Set<string>();
  
  constructor() {
    this.registry = new PluginRegistry();
    this.loadBuiltInPlugins();
  }
  
  private loadBuiltInPlugins(): void {
    // Load built-in plugins
    import('./plugins/text-field.plugin').then(module => {
      this.registry.register(module.TextFieldPlugin);
    });
    
    import('./plugins/date-field.plugin').then(module => {
      this.registry.register(module.DateFieldPlugin);
    });
    
    import('./plugins/select-field.plugin').then(module => {
      this.registry.register(module.SelectFieldPlugin);
    });
    
    import('./plugins/ssn-field.plugin').then(module => {
      this.registry.register(module.SSNFieldPlugin);
    });
    
    import('./plugins/phone-field.plugin').then(module => {
      this.registry.register(module.PhoneFieldPlugin);
    });
    
    import('./plugins/address-field.plugin').then(module => {
      this.registry.register(module.AddressFieldPlugin);
    });
  }
  
  async loadPlugin(plugin: FieldPlugin | string): Promise<void> {
    if (typeof plugin === 'string') {
      // Dynamic import
      try {
        const module = await import(plugin);
        const loadedPlugin = module.default || module.plugin;
        if (loadedPlugin) {
          this.registry.register(loadedPlugin);
          this.loadedPlugins.add(loadedPlugin.id);
        }
      } catch (error) {
        logger.error(`Failed to load plugin from ${plugin}`, error as Error, 'FieldPluginManager');
        throw error;
      }
    } else {
      this.registry.register(plugin);
      this.loadedPlugins.add(plugin.id);
    }
  }
  
  unloadPlugin(pluginId: string): void {
    this.registry.unregister(pluginId);
    this.loadedPlugins.delete(pluginId);
  }
  
  renderField(field: Field<any>, props: Partial<FieldPluginProps>): React.ReactNode {
    const context: FieldPluginContext = {
      sectionNumber: field.section || 0,
      fieldPath: field.id,
      parentContext: props.context?.parentContext,
      services: {
        validation: async (value) => {
          const result = await this.validateField(field, value, context);
          return result.isValid;
        },
        storage: {
          get: (key) => localStorage.getItem(key),
          set: (key, value) => localStorage.setItem(key, JSON.stringify(value))
        },
        logger: {
          info: (msg) => logger.info(msg, 'FieldPlugin'),
          warn: (msg) => logger.warn(msg, 'FieldPlugin'),
          error: (msg) => logger.error(msg, new Error(msg), 'FieldPlugin')
        }
      }
    };
    
    const plugin = this.registry.getPlugin(field.type, field, context);
    
    if (!plugin) {
      logger.warn(`No plugin found for field type ${field.type}`, 'FieldPluginManager');
      return React.createElement('div', {}, `Unsupported field type: ${field.type}`);
    }
    
    const fullProps: FieldPluginProps = {
      value: props.value || field.value,
      onChange: props.onChange || (() => {}),
      error: props.error,
      warning: props.warning,
      disabled: props.disabled || false,
      readonly: props.readonly || false,
      field,
      context
    };
    
    // Apply lifecycle hook
    const processedProps = plugin.onBeforeRender 
      ? plugin.onBeforeRender(fullProps)
      : fullProps;
    
    const element = React.createElement(plugin.component, processedProps);
    
    // Apply after render hook
    if (plugin.onAfterRender) {
      plugin.onAfterRender(element);
    }
    
    return element;
  }
  
  async validateField(
    field: Field<any>,
    value: any,
    context: FieldPluginContext
  ): Promise<{ isValid: boolean; error?: string; warning?: string }> {
    const plugin = this.registry.getPlugin(field.type, field, context);
    
    if (!plugin || !plugin.validator) {
      return { isValid: true };
    }
    
    try {
      return await plugin.validator(value, context);
    } catch (error) {
      logger.error(`Validation error for field ${field.id}`, error as Error, 'FieldPluginManager');
      return {
        isValid: false,
        error: 'Validation failed'
      };
    }
  }
}

// Export singleton instance
export const fieldPluginManager = new FieldPluginManager();