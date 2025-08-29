import { ValidationError } from './BaseSectionContext';

/**
 * Service interfaces for dependency injection
 */
export interface ValidationService<T> {
  validate(data: T): ValidationError[];
  validateField(fieldPath: string, value: unknown, data: T): ValidationError | null;
  getRequiredFields(): string[];
  getDependentFields(fieldPath: string): string[];
}

export interface TransformationService<T> {
  transform(data: T): T;
  normalizeField(fieldPath: string, value: unknown): unknown;
  denormalizeField(fieldPath: string, value: unknown): unknown;
}

export interface FormatterService<T> {
  formatForDisplay(data: T): Record<string, string>;
  formatField(fieldPath: string, value: unknown): string;
  parseField(fieldPath: string, displayValue: string): unknown;
}

export interface PersistenceService<T> {
  save(sectionId: string, data: T): Promise<void>;
  load(sectionId: string): Promise<T | null>;
  delete(sectionId: string): Promise<void>;
  getMetadata(sectionId: string): Promise<{ lastModified: Date; version: string } | null>;
}

export interface AnalyticsService<T> {
  trackFieldChange(fieldPath: string, oldValue: unknown, newValue: unknown): void;
  trackValidation(errors: ValidationError[]): void;
  trackSave(sectionId: string, data: T): void;
  trackError(error: Error, context: Record<string, unknown>): void;
}

export interface FieldMappingService {
  mapToPDF(fieldPath: string, value: unknown): Record<string, string>;
  mapFromPDF(pdfFields: Record<string, string>): Record<string, unknown>;
  getFieldMetadata(fieldPath: string): {
    pdfFieldName?: string;
    maxLength?: number;
    format?: string;
    required?: boolean;
  };
}

/**
 * Service registry for all section services
 */
export interface SectionServices<T> {
  validation?: ValidationService<T>;
  transformation?: TransformationService<T>;
  formatter?: FormatterService<T>;
  persistence?: PersistenceService<T>;
  analytics?: AnalyticsService<T>;
  fieldMapping?: FieldMappingService;
}

/**
 * Dependency injection container
 */
export class ServiceContainer<T> {
  private services = new Map<keyof SectionServices<T>, any>();
  private singletons = new Map<string, any>();
  private factories = new Map<string, () => any>();

  /**
   * Register a service
   */
  register<K extends keyof SectionServices<T>>(
    key: K,
    implementation: SectionServices<T>[K]
  ): this {
    this.services.set(key, implementation);
    return this;
  }

  /**
   * Register a singleton service (lazy-loaded)
   */
  registerSingleton<S>(key: string, factory: () => S): this {
    this.factories.set(key, factory);
    return this;
  }

  /**
   * Get a registered service
   */
  get<K extends keyof SectionServices<T>>(key: K): SectionServices<T>[K] {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service '${String(key)}' not registered`);
    }
    return service;
  }

  /**
   * Get a singleton service (creates on first access)
   */
  getSingleton<S>(key: string): S {
    if (!this.singletons.has(key)) {
      const factory = this.factories.get(key);
      if (!factory) {
        throw new Error(`Singleton '${key}' not registered`);
      }
      this.singletons.set(key, factory());
    }
    return this.singletons.get(key);
  }

  /**
   * Check if a service is registered
   */
  has<K extends keyof SectionServices<T>>(key: K): boolean {
    return this.services.has(key);
  }

  /**
   * Clear all services
   */
  clear(): void {
    this.services.clear();
    this.singletons.clear();
    this.factories.clear();
  }

  /**
   * Create a child container that inherits from this one
   */
  createChild(): ServiceContainer<T> {
    const child = new ServiceContainer<T>();
    
    // Copy services to child
    this.services.forEach((service, key) => {
      child.services.set(key, service);
    });
    
    // Copy factory functions (not instances)
    this.factories.forEach((factory, key) => {
      child.factories.set(key, factory);
    });
    
    return child;
  }
}

/**
 * Default implementations
 */

export class DefaultValidationService<T> implements ValidationService<T> {
  constructor(
    private validators: Map<string, (value: unknown, data: T) => ValidationError | null>,
    private requiredFields: Set<string> = new Set()
  ) {}

  validate(data: T): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Check required fields
    this.requiredFields.forEach(field => {
      const value = this.getFieldValue(data, field);
      if (value == null || value === '') {
        errors.push({
          field,
          message: `${field} is required`,
          severity: 'error',
        });
      }
    });
    
    // Run field validators
    this.validators.forEach((validator, field) => {
      const value = this.getFieldValue(data, field);
      const error = validator(value, data);
      if (error) {
        errors.push(error);
      }
    });
    
    return errors;
  }

  validateField(fieldPath: string, value: unknown, data: T): ValidationError | null {
    const validator = this.validators.get(fieldPath);
    if (validator) {
      return validator(value, data);
    }
    
    if (this.requiredFields.has(fieldPath)) {
      if (value == null || value === '') {
        return {
          field: fieldPath,
          message: `${fieldPath} is required`,
          severity: 'error',
        };
      }
    }
    
    return null;
  }

  getRequiredFields(): string[] {
    return Array.from(this.requiredFields);
  }

  getDependentFields(fieldPath: string): string[] {
    // Override in subclass for specific dependencies
    return [];
  }

  private getFieldValue(data: any, path: string): unknown {
    const keys = path.split('.');
    let current = data;
    
    for (const key of keys) {
      if (current == null) return undefined;
      current = current[key];
    }
    
    return current;
  }
}

export class DefaultTransformationService<T> implements TransformationService<T> {
  constructor(
    private transformers: Map<string, (value: unknown) => unknown> = new Map()
  ) {}

  transform(data: T): T {
    const transformed = { ...data };
    
    this.transformers.forEach((transformer, field) => {
      const value = this.getFieldValue(transformed, field);
      if (value !== undefined) {
        this.setFieldValue(transformed, field, transformer(value));
      }
    });
    
    return transformed;
  }

  normalizeField(fieldPath: string, value: unknown): unknown {
    const transformer = this.transformers.get(fieldPath);
    return transformer ? transformer(value) : value;
  }

  denormalizeField(fieldPath: string, value: unknown): unknown {
    // Override in subclass for specific denormalization
    return value;
  }

  private getFieldValue(data: any, path: string): unknown {
    const keys = path.split('.');
    let current = data;
    
    for (const key of keys) {
      if (current == null) return undefined;
      current = current[key];
    }
    
    return current;
  }

  private setFieldValue(data: any, path: string, value: unknown): void {
    const keys = path.split('.');
    let current = data;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  }
}

export class LocalStoragePersistenceService<T> implements PersistenceService<T> {
  constructor(private prefix: string = 'sf86_') {}

  async save(sectionId: string, data: T): Promise<void> {
    const key = `${this.prefix}${sectionId}`;
    const serialized = JSON.stringify({
      data,
      metadata: {
        lastModified: new Date().toISOString(),
        version: '2.0',
      },
    });
    
    localStorage.setItem(key, serialized);
  }

  async load(sectionId: string): Promise<T | null> {
    const key = `${this.prefix}${sectionId}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) return null;
    
    try {
      const parsed = JSON.parse(stored);
      return parsed.data;
    } catch (error) {
      console.error(`Failed to parse stored data for ${sectionId}:`, error);
      return null;
    }
  }

  async delete(sectionId: string): Promise<void> {
    const key = `${this.prefix}${sectionId}`;
    localStorage.removeItem(key);
  }

  async getMetadata(sectionId: string): Promise<{ lastModified: Date; version: string } | null> {
    const key = `${this.prefix}${sectionId}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) return null;
    
    try {
      const parsed = JSON.parse(stored);
      return {
        lastModified: new Date(parsed.metadata.lastModified),
        version: parsed.metadata.version,
      };
    } catch (error) {
      return null;
    }
  }
}

/**
 * Factory function to create a configured service container
 */
export function createServiceContainer<T>(
  config: {
    validation?: ValidationService<T>;
    transformation?: TransformationService<T>;
    formatter?: FormatterService<T>;
    persistence?: PersistenceService<T>;
    analytics?: AnalyticsService<T>;
    fieldMapping?: FieldMappingService;
  } = {}
): ServiceContainer<T> {
  const container = new ServiceContainer<T>();
  
  // Register provided services
  if (config.validation) {
    container.register('validation', config.validation);
  }
  
  if (config.transformation) {
    container.register('transformation', config.transformation);
  }
  
  if (config.formatter) {
    container.register('formatter', config.formatter);
  }
  
  if (config.persistence) {
    container.register('persistence', config.persistence);
  } else {
    // Default to localStorage
    container.register('persistence', new LocalStoragePersistenceService<T>());
  }
  
  if (config.analytics) {
    container.register('analytics', config.analytics);
  }
  
  if (config.fieldMapping) {
    container.register('fieldMapping', config.fieldMapping);
  }
  
  return container;
}

/**
 * React hook for using service container
 */
import { useContext, createContext } from 'react';

const ServiceContainerContext = createContext<ServiceContainer<any> | null>(null);

export const ServiceContainerProvider = ServiceContainerContext.Provider;

export function useServiceContainer<T>(): ServiceContainer<T> {
  const container = useContext(ServiceContainerContext);
  if (!container) {
    throw new Error('useServiceContainer must be used within ServiceContainerProvider');
  }
  return container;
}

export function useService<T, K extends keyof SectionServices<T>>(
  key: K
): SectionServices<T>[K] {
  const container = useServiceContainer<T>();
  return container.get(key);
}