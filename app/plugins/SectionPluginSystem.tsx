import React, { createContext, useContext, useMemo } from 'react';
import { SectionComponentProps, ValidationResult } from '../types/form.types';
import { logger } from '../services/Logger';

export enum SectionFeature {
  REPEATABLE_ENTRIES = 'repeatable_entries',
  CONDITIONAL_FIELDS = 'conditional_fields',
  EXTERNAL_VALIDATION = 'external_validation',
  PDF_MAPPING = 'pdf_mapping',
  AUTO_SAVE = 'auto_save',
  VIRTUAL_SCROLLING = 'virtual_scrolling',
  PROGRESSIVE_LOADING = 'progressive_loading'
}

export interface SectionPlugin<T = any> {
  sectionNumber: number;
  name: string;
  version: string;
  description?: string;
  
  // Core functionality
  component: React.ComponentType<SectionComponentProps<T>>;
  context?: React.Context<any>;
  initialData: () => T;
  
  // Plugin capabilities
  features: SectionFeature[];
  dependencies?: number[];
  
  // Lifecycle hooks
  onMount?(): void | Promise<void>;
  onUnmount?(): void;
  onActivate?(): void;
  onDeactivate?(): void;
  
  // Data operations
  validate?(data: T): ValidationResult | Promise<ValidationResult>;
  transform?(data: T): any;
  serialize?(data: T): string;
  deserialize?(data: string): T;
  
  // Configuration
  config?: Record<string, any>;
  requiredFields?: string[];
  optionalFields?: string[];
}

export class SectionPluginRegistry {
  private plugins = new Map<number, SectionPlugin>();
  private featureMap = new Map<SectionFeature, Set<number>>();
  private loadOrder: number[] = [];
  private activePlugins = new Set<number>();

  register<T>(plugin: SectionPlugin<T>): void {
    if (this.plugins.has(plugin.sectionNumber)) {
      logger.warn(`Plugin for section ${plugin.sectionNumber} already registered. Overwriting.`);
    }

    this.plugins.set(plugin.sectionNumber, plugin);
    
    // Update feature map
    plugin.features.forEach(feature => {
      if (!this.featureMap.has(feature)) {
        this.featureMap.set(feature, new Set());
      }
      this.featureMap.get(feature)!.add(plugin.sectionNumber);
    });

    // Update load order based on dependencies
    this.updateLoadOrder(plugin);
    
    logger.info(`Registered plugin: ${plugin.name} v${plugin.version}`, 'PluginRegistry');
  }

  unregister(sectionNumber: number): boolean {
    const plugin = this.plugins.get(sectionNumber);
    if (!plugin) return false;

    // Deactivate if active
    if (this.activePlugins.has(sectionNumber)) {
      this.deactivate(sectionNumber);
    }

    // Remove from feature map
    plugin.features.forEach(feature => {
      this.featureMap.get(feature)?.delete(sectionNumber);
    });

    // Remove from registry
    this.plugins.delete(sectionNumber);
    this.loadOrder = this.loadOrder.filter(num => num !== sectionNumber);
    
    logger.info(`Unregistered plugin for section ${sectionNumber}`, 'PluginRegistry');
    return true;
  }

  get(sectionNumber: number): SectionPlugin | undefined {
    return this.plugins.get(sectionNumber);
  }

  getByFeature(feature: SectionFeature): SectionPlugin[] {
    const sectionNumbers = this.featureMap.get(feature);
    if (!sectionNumbers) return [];
    
    return Array.from(sectionNumbers)
      .map(num => this.plugins.get(num))
      .filter(Boolean) as SectionPlugin[];
  }

  async activate(sectionNumber: number): Promise<void> {
    const plugin = this.plugins.get(sectionNumber);
    if (!plugin) {
      throw new Error(`Plugin for section ${sectionNumber} not found`);
    }

    if (this.activePlugins.has(sectionNumber)) {
      logger.debug(`Plugin for section ${sectionNumber} already active`, 'PluginRegistry');
      return;
    }

    // Activate dependencies first
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        await this.activate(dep);
      }
    }

    // Run activation hooks
    if (plugin.onActivate) {
      plugin.onActivate();
    }
    
    if (plugin.onMount) {
      await plugin.onMount();
    }

    this.activePlugins.add(sectionNumber);
    logger.info(`Activated plugin: ${plugin.name}`, 'PluginRegistry');
  }

  deactivate(sectionNumber: number): void {
    const plugin = this.plugins.get(sectionNumber);
    if (!plugin || !this.activePlugins.has(sectionNumber)) {
      return;
    }

    // Run deactivation hooks
    if (plugin.onDeactivate) {
      plugin.onDeactivate();
    }
    
    if (plugin.onUnmount) {
      plugin.onUnmount();
    }

    this.activePlugins.delete(sectionNumber);
    logger.info(`Deactivated plugin: ${plugin.name}`, 'PluginRegistry');
  }

  isActive(sectionNumber: number): boolean {
    return this.activePlugins.has(sectionNumber);
  }

  getAllPlugins(): SectionPlugin[] {
    return Array.from(this.plugins.values());
  }

  getActivePlugins(): SectionPlugin[] {
    return Array.from(this.activePlugins)
      .map(num => this.plugins.get(num))
      .filter(Boolean) as SectionPlugin[];
  }

  getLoadOrder(): number[] {
    return [...this.loadOrder];
  }

  private updateLoadOrder(plugin: SectionPlugin): void {
    // Simple topological sort for dependency ordering
    const visited = new Set<number>();
    const result: number[] = [];

    const visit = (sectionNumber: number) => {
      if (visited.has(sectionNumber)) return;
      visited.add(sectionNumber);

      const p = this.plugins.get(sectionNumber);
      if (p?.dependencies) {
        p.dependencies.forEach(dep => visit(dep));
      }

      result.push(sectionNumber);
    };

    // Visit all plugins
    this.plugins.forEach((_, sectionNumber) => visit(sectionNumber));
    
    this.loadOrder = result;
  }

  // Batch operations
  async activateAll(): Promise<void> {
    for (const sectionNumber of this.loadOrder) {
      await this.activate(sectionNumber);
    }
  }

  deactivateAll(): void {
    // Deactivate in reverse order
    const reverseOrder = [...this.loadOrder].reverse();
    reverseOrder.forEach(sectionNumber => this.deactivate(sectionNumber));
  }

  // Plugin discovery
  async discoverPlugins(directory?: string): Promise<void> {
    // In a real implementation, this would dynamically import plugins
    // For now, this is a placeholder
    logger.info('Plugin discovery not yet implemented', 'PluginRegistry');
  }
}

// Context for plugin registry
const PluginRegistryContext = createContext<SectionPluginRegistry | null>(null);

export const PluginRegistryProvider: React.FC<{
  children: React.ReactNode;
  registry?: SectionPluginRegistry;
}> = ({ children, registry }) => {
  const pluginRegistry = useMemo(() => 
    registry || new SectionPluginRegistry(),
    [registry]
  );

  return (
    <PluginRegistryContext.Provider value={pluginRegistry}>
      {children}
    </PluginRegistryContext.Provider>
  );
};

export function usePluginRegistry(): SectionPluginRegistry {
  const registry = useContext(PluginRegistryContext);
  if (!registry) {
    throw new Error('usePluginRegistry must be used within PluginRegistryProvider');
  }
  return registry;
}

// Helper hook to use a specific plugin
export function usePlugin<T = any>(sectionNumber: number): SectionPlugin<T> | undefined {
  const registry = usePluginRegistry();
  return useMemo(() => 
    registry.get(sectionNumber) as SectionPlugin<T> | undefined,
    [registry, sectionNumber]
  );
}

// Helper hook to check if a feature is available
export function useHasFeature(
  sectionNumber: number, 
  feature: SectionFeature
): boolean {
  const plugin = usePlugin(sectionNumber);
  return useMemo(() => 
    plugin?.features.includes(feature) || false,
    [plugin, feature]
  );
}