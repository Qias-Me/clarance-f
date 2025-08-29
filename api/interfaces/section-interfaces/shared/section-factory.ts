/**
 * Section Factory Pattern
 * 
 * Generic factory for creating type-safe sections with compile-time validation
 */

import type { BaseSection, SectionConfig, ValidationResult } from './base-types';
import { logger } from '../../../services/Logger';

/**
 * Generic section factory interface
 */
export interface SectionFactory<TData, TConfig extends SectionConfig<TData> = SectionConfig<TData>> {
  readonly sectionNumber: number;
  readonly sectionName: string;
  readonly sectionTitle: string;
  readonly config: TConfig;
  
  createDefault(): TData;
  validate(data: TData): ValidationResult;
  migrate?(from: any, version: string): TData;
  serialize?(data: TData): string;
  deserialize?(serialized: string): TData;
  transform?(data: TData, format: 'pdf' | 'json' | 'xml'): any;
}

/**
 * Abstract base factory implementation
 */
export abstract class BaseSectionFactory<TData> implements SectionFactory<TData> {
  abstract readonly sectionNumber: number;
  abstract readonly sectionName: string;
  abstract readonly sectionTitle: string;
  abstract readonly config: SectionConfig<TData>;
  
  abstract createDefault(): TData;
  abstract validate(data: TData): ValidationResult;
  
  serialize(data: TData): string {
    return JSON.stringify(data);
  }
  
  deserialize(serialized: string): TData {
    return JSON.parse(serialized);
  }
  
  transform(data: TData, format: 'pdf' | 'json' | 'xml'): any {
    switch (format) {
      case 'json':
        return this.serialize(data);
      case 'pdf':
        return this.transformToPdf(data);
      case 'xml':
        return this.transformToXml(data);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
  
  protected transformToPdf(data: TData): any {
    // Override in subclasses for PDF-specific transformation
    return data;
  }
  
  protected transformToXml(data: TData): string {
    // Override in subclasses for XML-specific transformation
    return '<xml></xml>';
  }
}

/**
 * Section Registry - Singleton pattern for managing all sections
 */
export class SectionRegistry {
  private static instance: SectionRegistry;
  private factories = new Map<number, SectionFactory<any>>();
  private metadata = new Map<number, SectionMetadata>();
  
  private constructor() {}
  
  static getInstance(): SectionRegistry {
    if (!SectionRegistry.instance) {
      SectionRegistry.instance = new SectionRegistry();
    }
    return SectionRegistry.instance;
  }
  
  /**
   * Register a section factory
   */
  register<T>(factory: SectionFactory<T>): void {
    if (this.factories.has(factory.sectionNumber)) {
      throw new Error(`Section ${factory.sectionNumber} already registered`);
    }
    
    this.factories.set(factory.sectionNumber, factory);
    
    // Store metadata
    this.metadata.set(factory.sectionNumber, {
      sectionNumber: factory.sectionNumber,
      sectionName: factory.sectionName,
      sectionTitle: factory.sectionTitle,
      registeredAt: new Date(),
      dependencies: factory.config.dependencies || []
    });
    
    logger.info(`Registered section ${factory.sectionNumber}: ${factory.sectionName}`, 'SectionRegistry');
  }
  
  /**
   * Unregister a section
   */
  unregister(sectionNumber: number): void {
    this.factories.delete(sectionNumber);
    this.metadata.delete(sectionNumber);
    logger.info(`Unregistered section ${sectionNumber}`, 'SectionRegistry');
  }
  
  /**
   * Get a section factory
   */
  getFactory<T>(sectionNumber: number): SectionFactory<T> | undefined {
    return this.factories.get(sectionNumber);
  }
  
  /**
   * Create default data for a section
   */
  create<T>(sectionNumber: number): T {
    const factory = this.factories.get(sectionNumber);
    if (!factory) {
      throw new Error(`Section ${sectionNumber} not registered`);
    }
    return factory.createDefault();
  }
  
  /**
   * Validate section data
   */
  validate<T>(sectionNumber: number, data: T): ValidationResult {
    const factory = this.factories.get(sectionNumber);
    if (!factory) {
      throw new Error(`Section ${sectionNumber} not registered`);
    }
    return factory.validate(data);
  }
  
  /**
   * Get all registered sections
   */
  getAllSections(): SectionMetadata[] {
    return Array.from(this.metadata.values());
  }
  
  /**
   * Check if a section is registered
   */
  hasSection(sectionNumber: number): boolean {
    return this.factories.has(sectionNumber);
  }
  
  /**
   * Get section dependencies
   */
  getDependencies(sectionNumber: number): number[] {
    return this.metadata.get(sectionNumber)?.dependencies || [];
  }
  
  /**
   * Validate all sections in dependency order
   */
  validateAll(data: Map<number, any>): Map<number, ValidationResult> {
    const results = new Map<number, ValidationResult>();
    
    // Sort sections by dependencies
    const sorted = this.topologicalSort();
    
    for (const sectionNumber of sorted) {
      const sectionData = data.get(sectionNumber);
      if (sectionData) {
        const result = this.validate(sectionNumber, sectionData);
        results.set(sectionNumber, result);
      }
    }
    
    return results;
  }
  
  /**
   * Topological sort sections by dependencies
   */
  private topologicalSort(): number[] {
    const visited = new Set<number>();
    const result: number[] = [];
    
    const visit = (sectionNumber: number) => {
      if (visited.has(sectionNumber)) return;
      visited.add(sectionNumber);
      
      const deps = this.getDependencies(sectionNumber);
      for (const dep of deps) {
        visit(dep);
      }
      
      result.push(sectionNumber);
    };
    
    for (const sectionNumber of this.factories.keys()) {
      visit(sectionNumber);
    }
    
    return result;
  }
  
  /**
   * Export registry statistics
   */
  getStats(): {
    totalSections: number;
    sectionsWithDependencies: number;
    averageDependencies: number;
    registrationOrder: number[];
  } {
    const sections = Array.from(this.metadata.values());
    const withDeps = sections.filter(s => s.dependencies.length > 0);
    const totalDeps = sections.reduce((sum, s) => sum + s.dependencies.length, 0);
    
    return {
      totalSections: sections.length,
      sectionsWithDependencies: withDeps.length,
      averageDependencies: sections.length > 0 ? totalDeps / sections.length : 0,
      registrationOrder: sections
        .sort((a, b) => a.registeredAt.getTime() - b.registeredAt.getTime())
        .map(s => s.sectionNumber)
    };
  }
}

/**
 * Section metadata
 */
export interface SectionMetadata {
  sectionNumber: number;
  sectionName: string;
  sectionTitle: string;
  registeredAt: Date;
  dependencies: number[];
}

/**
 * Factory builder for fluent API
 */
export class SectionFactoryBuilder<TData> {
  private sectionNumber?: number;
  private sectionName?: string;
  private sectionTitle?: string;
  private config?: SectionConfig<TData>;
  private defaultFactory?: () => TData;
  private validator?: (data: TData) => ValidationResult;
  
  withNumber(number: number): this {
    this.sectionNumber = number;
    return this;
  }
  
  withName(name: string): this {
    this.sectionName = name;
    return this;
  }
  
  withTitle(title: string): this {
    this.sectionTitle = title;
    return this;
  }
  
  withConfig(config: SectionConfig<TData>): this {
    this.config = config;
    return this;
  }
  
  withDefaultFactory(factory: () => TData): this {
    this.defaultFactory = factory;
    return this;
  }
  
  withValidator(validator: (data: TData) => ValidationResult): this {
    this.validator = validator;
    return this;
  }
  
  build(): SectionFactory<TData> {
    if (!this.sectionNumber || !this.sectionName || !this.sectionTitle) {
      throw new Error('Section number, name, and title are required');
    }
    
    if (!this.config || !this.defaultFactory || !this.validator) {
      throw new Error('Config, default factory, and validator are required');
    }
    
    const factory: SectionFactory<TData> = {
      sectionNumber: this.sectionNumber,
      sectionName: this.sectionName,
      sectionTitle: this.sectionTitle,
      config: this.config,
      createDefault: this.defaultFactory,
      validate: this.validator
    };
    
    return factory;
  }
}

// Export singleton instance
export const sectionRegistry = SectionRegistry.getInstance();