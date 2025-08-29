/**
 * Incremental Validation System
 * 
 * Optimized validation with caching and dependency tracking
 */

import type { ValidationResult, ValidationError, FieldValidationRules } from './base-types';
import { batchValidate } from './validation-patterns';
import { get } from 'lodash';

/**
 * Validation cache interface
 */
export interface ValidationCache {
  get(path: string): ValidationResult | undefined;
  set(path: string, result: ValidationResult): void;
  invalidate(path: string): void;
  invalidatePattern(pattern: string | RegExp): void;
  clear(): void;
  getStats(): CacheStats;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

/**
 * Dependency graph for field validation
 */
export interface ValidationDependencyGraph {
  addDependency(field: string, dependsOn: string): void;
  removeDependency(field: string, dependsOn: string): void;
  getDependents(field: string): Set<string>;
  getDependencies(field: string): Set<string>;
  getAffectedFields(changedField: string): Set<string>;
}

/**
 * LRU cache implementation for validation results
 */
export class LRUValidationCache implements ValidationCache {
  private cache = new Map<string, { result: ValidationResult; timestamp: number }>();
  private accessOrder: string[] = [];
  private stats = { hits: 0, misses: 0 };
  
  constructor(
    private maxSize: number = 100,
    private ttlMs: number = 5 * 60 * 1000 // 5 minutes default
  ) {}
  
  get(path: string): ValidationResult | undefined {
    const entry = this.cache.get(path);
    
    if (!entry) {
      this.stats.misses++;
      return undefined;
    }
    
    // Check TTL
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(path);
      this.stats.misses++;
      return undefined;
    }
    
    // Update access order
    this.updateAccessOrder(path);
    this.stats.hits++;
    
    return entry.result;
  }
  
  set(path: string, result: ValidationResult): void {
    // Evict if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(path)) {
      this.evictLRU();
    }
    
    this.cache.set(path, {
      result,
      timestamp: Date.now()
    });
    
    this.updateAccessOrder(path);
  }
  
  invalidate(path: string): void {
    this.cache.delete(path);
    const index = this.accessOrder.indexOf(path);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }
  
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    for (const [path] of this.cache) {
      if (regex.test(path)) {
        this.invalidate(path);
      }
    }
  }
  
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.stats = { hits: 0, misses: 0 };
  }
  
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0
    };
  }
  
  private updateAccessOrder(path: string): void {
    const index = this.accessOrder.indexOf(path);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(path);
  }
  
  private evictLRU(): void {
    if (this.accessOrder.length > 0) {
      const lru = this.accessOrder.shift()!;
      this.cache.delete(lru);
    }
  }
}

/**
 * Dependency graph implementation
 */
export class DependencyGraph implements ValidationDependencyGraph {
  private dependencies = new Map<string, Set<string>>();
  private dependents = new Map<string, Set<string>>();
  
  addDependency(field: string, dependsOn: string): void {
    // Add to dependencies
    if (!this.dependencies.has(field)) {
      this.dependencies.set(field, new Set());
    }
    this.dependencies.get(field)!.add(dependsOn);
    
    // Add to dependents
    if (!this.dependents.has(dependsOn)) {
      this.dependents.set(dependsOn, new Set());
    }
    this.dependents.get(dependsOn)!.add(field);
  }
  
  removeDependency(field: string, dependsOn: string): void {
    this.dependencies.get(field)?.delete(dependsOn);
    this.dependents.get(dependsOn)?.delete(field);
  }
  
  getDependents(field: string): Set<string> {
    return this.dependents.get(field) || new Set();
  }
  
  getDependencies(field: string): Set<string> {
    return this.dependencies.get(field) || new Set();
  }
  
  getAffectedFields(changedField: string): Set<string> {
    const affected = new Set<string>();
    const queue = [changedField];
    
    while (queue.length > 0) {
      const field = queue.shift()!;
      
      if (affected.has(field)) continue;
      affected.add(field);
      
      // Add all dependents to queue
      const dependents = this.getDependents(field);
      for (const dependent of dependents) {
        if (!affected.has(dependent)) {
          queue.push(dependent);
        }
      }
    }
    
    return affected;
  }
}

/**
 * Incremental validator with caching and dependency tracking
 */
export class IncrementalValidator<T> {
  private cache: ValidationCache;
  private dependencies: ValidationDependencyGraph;
  private validationRules: Map<string, FieldValidationRules>;
  private customValidators: Map<string, (data: T, path: string) => ValidationResult>;
  
  constructor(
    validationRules: Record<string, FieldValidationRules> = {},
    options: {
      cacheSize?: number;
      cacheTTL?: number;
    } = {}
  ) {
    this.cache = new LRUValidationCache(options.cacheSize, options.cacheTTL);
    this.dependencies = new DependencyGraph();
    this.validationRules = new Map(Object.entries(validationRules));
    this.customValidators = new Map();
  }
  
  /**
   * Add validation rule
   */
  addRule(path: string, rule: FieldValidationRules): void {
    this.validationRules.set(path, rule);
    this.cache.invalidate(path);
  }
  
  /**
   * Add custom validator
   */
  addCustomValidator(path: string, validator: (data: T, path: string) => ValidationResult): void {
    this.customValidators.set(path, validator);
    this.cache.invalidate(path);
  }
  
  /**
   * Add field dependency
   */
  addDependency(field: string, dependsOn: string): void {
    this.dependencies.addDependency(field, dependsOn);
  }
  
  /**
   * Validate a single field with caching
   */
  validateField(
    data: T,
    path: string,
    options: { skipCache?: boolean; skipDependents?: boolean } = {}
  ): ValidationResult {
    // Check cache first
    if (!options.skipCache) {
      const cached = this.cache.get(path);
      if (cached) {
        return cached;
      }
    }
    
    // Perform validation
    let result: ValidationResult;
    
    // Check for custom validator
    const customValidator = this.customValidators.get(path);
    if (customValidator) {
      result = customValidator(data, path);
    } else {
      // Use standard validation rules
      const rules = this.validationRules.get(path);
      if (rules) {
        const value = get(data, path);
        const errors = batchValidate([{ value, rules, fieldName: path }]);
        result = {
          isValid: errors.length === 0,
          errors
        };
      } else {
        // No validation rules - consider valid
        result = { isValid: true };
      }
    }
    
    // Cache result
    this.cache.set(path, result);
    
    return result;
  }
  
  /**
   * Validate multiple fields incrementally
   */
  validateIncremental(
    data: T,
    changedPaths: string[]
  ): ValidationResult {
    // Get all affected fields
    const fieldsToValidate = new Set<string>();
    
    for (const path of changedPaths) {
      // Add the changed field itself
      fieldsToValidate.add(path);
      
      // Add all dependent fields
      const affected = this.dependencies.getAffectedFields(path);
      for (const field of affected) {
        fieldsToValidate.add(field);
      }
      
      // Invalidate cache for changed fields
      this.cache.invalidate(path);
    }
    
    // Validate all affected fields
    const errors: ValidationError[] = [];
    
    for (const path of fieldsToValidate) {
      const result = this.validateField(data, path, { skipCache: true });
      if (result.errors) {
        errors.push(...result.errors);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate all fields
   */
  validateAll(data: T): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Validate all registered fields
    for (const [path] of this.validationRules) {
      const result = this.validateField(data, path);
      if (result.errors) {
        errors.push(...result.errors);
      }
    }
    
    // Validate custom validators
    for (const [path] of this.customValidators) {
      const result = this.validateField(data, path);
      if (result.errors) {
        errors.push(...result.errors);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Clear validation cache
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    return this.cache.getStats();
  }
  
  /**
   * Export validation configuration
   */
  exportConfig(): {
    rules: Array<[string, FieldValidationRules]>;
    dependencies: Array<[string, string[]]>;
    customValidators: string[];
  } {
    const dependencies: Array<[string, string[]]> = [];
    
    for (const [field, rules] of this.validationRules) {
      const deps = this.dependencies.getDependencies(field);
      if (deps.size > 0) {
        dependencies.push([field, Array.from(deps)]);
      }
    }
    
    return {
      rules: Array.from(this.validationRules.entries()),
      dependencies,
      customValidators: Array.from(this.customValidators.keys())
    };
  }
}

/**
 * Validation strategy for complex sections
 */
export class ValidationStrategy<T> {
  private validator: IncrementalValidator<T>;
  private strategies = new Map<string, (data: T) => ValidationResult>();
  
  constructor(validator: IncrementalValidator<T>) {
    this.validator = validator;
  }
  
  /**
   * Register a validation strategy
   */
  registerStrategy(name: string, strategy: (data: T) => ValidationResult): void {
    this.strategies.set(name, strategy);
  }
  
  /**
   * Execute a validation strategy
   */
  executeStrategy(name: string, data: T): ValidationResult {
    const strategy = this.strategies.get(name);
    if (!strategy) {
      throw new Error(`Strategy ${name} not found`);
    }
    
    return strategy(data);
  }
  
  /**
   * Create a progressive validation strategy
   */
  createProgressiveStrategy(
    stages: Array<{
      name: string;
      fields: string[];
      stopOnError?: boolean;
    }>
  ): (data: T) => ValidationResult {
    return (data: T) => {
      const allErrors: ValidationError[] = [];
      
      for (const stage of stages) {
        const stageErrors: ValidationError[] = [];
        
        for (const field of stage.fields) {
          const result = this.validator.validateField(data, field);
          if (result.errors) {
            stageErrors.push(...result.errors);
          }
        }
        
        allErrors.push(...stageErrors);
        
        // Stop if stage has errors and stopOnError is true
        if (stage.stopOnError && stageErrors.length > 0) {
          break;
        }
      }
      
      return {
        isValid: allErrors.length === 0,
        errors: allErrors
      };
    };
  }
}