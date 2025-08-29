/**
 * Field-Level Dirty Tracking System
 * 
 * Optimized change detection preventing expensive deep equality checks
 * Provides field-level granularity with O(1) dirty state queries
 */

import { logger } from '../../../../app/services/Logger';

export interface FieldChangeEvent<T = any> {
  field: string;
  oldValue: T;
  newValue: T;
  timestamp: number;
  source: 'user' | 'system' | 'validation' | 'external';
}

export interface DirtyTrackingOptions {
  maxHistorySize?: number;
  enableDeepTracking?: boolean;
  trackingGranularity?: 'field' | 'property' | 'deep';
  excludeFields?: string[];
  includeMetadata?: boolean;
}

export interface DirtyState {
  isDirty: boolean;
  dirtyFields: Set<string>;
  changedAt: number;
  changeCount: number;
}

/**
 * Field-level dirty tracking with optimized change detection
 */
export class FieldDirtyTracker<T extends Record<string, any>> {
  private dirtyFields = new Set<string>();
  private originalValues = new Map<string, any>();
  private currentValues = new Map<string, any>();
  private changeHistory: FieldChangeEvent[] = [];
  private options: Required<DirtyTrackingOptions>;
  private lastChangeTimestamp = 0;
  private changeCount = 0;
  private observers = new Set<(event: FieldChangeEvent) => void>();
  
  constructor(initialData: T, options: DirtyTrackingOptions = {}) {
    this.options = {
      maxHistorySize: 100,
      enableDeepTracking: false,
      trackingGranularity: 'field',
      excludeFields: [],
      includeMetadata: true,
      ...options
    };
    
    this.initialize(initialData);
  }
  
  /**
   * Initialize tracker with data
   */
  private initialize(data: T): void {
    for (const [key, value] of Object.entries(data)) {
      if (this.options.excludeFields.includes(key)) {
        continue;
      }
      
      const trackedValue = this.createTrackedValue(value);
      this.originalValues.set(key, trackedValue);
      this.currentValues.set(key, trackedValue);
    }
  }
  
  /**
   * Create a trackable copy of value
   */
  private createTrackedValue(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }
    
    switch (this.options.trackingGranularity) {
      case 'field':
        return this.cloneShallow(value);
      case 'property':
        return this.cloneProperties(value);
      case 'deep':
        return this.cloneDeep(value);
      default:
        return value;
    }
  }
  
  /**
   * Shallow clone for primitive and simple objects
   */
  private cloneShallow(value: any): any {
    if (typeof value !== 'object' || value === null) {
      return value;
    }
    
    if (Array.isArray(value)) {
      return [...value];
    }
    
    return { ...value };
  }
  
  /**
   * Clone properties for object tracking
   */
  private cloneProperties(value: any): any {
    if (typeof value !== 'object' || value === null) {
      return value;
    }
    
    const clone: any = Array.isArray(value) ? [] : {};
    for (const [key, val] of Object.entries(value)) {
      clone[key] = typeof val === 'object' && val !== null ? this.cloneShallow(val) : val;
    }
    
    return clone;
  }
  
  /**
   * Deep clone for comprehensive tracking
   */
  private cloneDeep(value: any): any {
    if (value === null || typeof value !== 'object') {
      return value;
    }
    
    if (value instanceof Date) {
      return new Date(value.getTime());
    }
    
    if (Array.isArray(value)) {
      return value.map(item => this.cloneDeep(item));
    }
    
    const clone: any = {};
    for (const [key, val] of Object.entries(value)) {
      clone[key] = this.cloneDeep(val);
    }
    
    return clone;
  }
  
  /**
   * Update field value and track changes
   */
  updateField(field: string, newValue: any, source: FieldChangeEvent['source'] = 'user'): boolean {
    if (this.options.excludeFields.includes(field)) {
      return false;
    }
    
    const currentValue = this.currentValues.get(field);
    const trackedNewValue = this.createTrackedValue(newValue);
    
    // Check if value actually changed
    if (this.valuesEqual(currentValue, trackedNewValue)) {
      return false;
    }
    
    const originalValue = this.originalValues.get(field);
    const wasClean = !this.dirtyFields.has(field);
    
    // Update current value
    this.currentValues.set(field, trackedNewValue);
    
    // Check if field is now dirty or clean
    const isDirtyNow = !this.valuesEqual(originalValue, trackedNewValue);
    
    if (isDirtyNow) {
      this.dirtyFields.add(field);
    } else {
      this.dirtyFields.delete(field);
    }
    
    // Create change event
    const changeEvent: FieldChangeEvent = {
      field,
      oldValue: currentValue,
      newValue: trackedNewValue,
      timestamp: Date.now(),
      source
    };
    
    // Add to history
    this.addToHistory(changeEvent);
    
    // Update metadata
    this.lastChangeTimestamp = changeEvent.timestamp;
    this.changeCount++;
    
    // Notify observers
    this.notifyObservers(changeEvent);
    
    logger.debug(`Field ${field} ${isDirtyNow ? 'marked dirty' : 'cleaned'}`, 'DirtyTracker');
    
    return true;
  }
  
  /**
   * Check if two values are equal
   */
  private valuesEqual(a: any, b: any): boolean {
    // Handle null/undefined
    if (a === b) return true;
    if (a === null || b === null || a === undefined || b === undefined) return false;
    
    // Handle primitives
    if (typeof a !== 'object' || typeof b !== 'object') {
      return a === b;
    }
    
    // Handle arrays
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => this.valuesEqual(item, b[index]));
    }
    
    // Handle objects based on granularity
    switch (this.options.trackingGranularity) {
      case 'field':
        return JSON.stringify(a) === JSON.stringify(b); // Fast but less accurate
      case 'property':
        return this.shallowEqual(a, b);
      case 'deep':
        return this.deepEqual(a, b);
      default:
        return a === b;
    }
  }
  
  /**
   * Shallow equality check
   */
  private shallowEqual(a: any, b: any): boolean {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (a[key] !== b[key]) return false;
    }
    
    return true;
  }
  
  /**
   * Deep equality check
   */
  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (typeof a !== typeof b) return false;
    
    if (typeof a !== 'object') return a === b;
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!this.deepEqual(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  /**
   * Add change to history
   */
  private addToHistory(changeEvent: FieldChangeEvent): void {
    this.changeHistory.push(changeEvent);
    
    // Limit history size
    if (this.changeHistory.length > this.options.maxHistorySize) {
      this.changeHistory.shift();
    }
  }
  
  /**
   * Notify observers
   */
  private notifyObservers(changeEvent: FieldChangeEvent): void {
    for (const observer of this.observers) {
      try {
        observer(changeEvent);
      } catch (error) {
        logger.error('Error in dirty tracking observer', error as Error, 'DirtyTracker');
      }
    }
  }
  
  /**
   * Check if specific field is dirty
   */
  isFieldDirty(field: string): boolean {
    return this.dirtyFields.has(field);
  }
  
  /**
   * Check if any field is dirty
   */
  isDirty(): boolean {
    return this.dirtyFields.size > 0;
  }
  
  /**
   * Get all dirty fields
   */
  getDirtyFields(): string[] {
    return Array.from(this.dirtyFields);
  }
  
  /**
   * Get dirty state summary
   */
  getDirtyState(): DirtyState {
    return {
      isDirty: this.isDirty(),
      dirtyFields: new Set(this.dirtyFields),
      changedAt: this.lastChangeTimestamp,
      changeCount: this.changeCount
    };
  }
  
  /**
   * Get current value of field
   */
  getCurrentValue(field: string): any {
    return this.currentValues.get(field);
  }
  
  /**
   * Get original value of field
   */
  getOriginalValue(field: string): any {
    return this.originalValues.get(field);
  }
  
  /**
   * Get all current values
   */
  getCurrentValues(): Record<string, any> {
    const values: Record<string, any> = {};
    for (const [key, value] of this.currentValues) {
      values[key] = value;
    }
    return values;
  }
  
  /**
   * Get change history for field
   */
  getFieldHistory(field: string): FieldChangeEvent[] {
    return this.changeHistory.filter(event => event.field === field);
  }
  
  /**
   * Get all change history
   */
  getHistory(): FieldChangeEvent[] {
    return [...this.changeHistory];
  }
  
  /**
   * Reset dirty state for specific field
   */
  markFieldClean(field: string): void {
    if (this.dirtyFields.has(field)) {
      const currentValue = this.currentValues.get(field);
      this.originalValues.set(field, this.createTrackedValue(currentValue));
      this.dirtyFields.delete(field);
      
      logger.debug(`Field ${field} marked clean`, 'DirtyTracker');
    }
  }
  
  /**
   * Reset dirty state for all fields
   */
  markAllClean(): void {
    for (const field of this.dirtyFields) {
      this.markFieldClean(field);
    }
  }
  
  /**
   * Revert field to original value
   */
  revertField(field: string): boolean {
    if (!this.dirtyFields.has(field)) {
      return false;
    }
    
    const originalValue = this.originalValues.get(field);
    this.currentValues.set(field, this.createTrackedValue(originalValue));
    this.dirtyFields.delete(field);
    
    const changeEvent: FieldChangeEvent = {
      field,
      oldValue: this.currentValues.get(field),
      newValue: originalValue,
      timestamp: Date.now(),
      source: 'system'
    };
    
    this.addToHistory(changeEvent);
    this.notifyObservers(changeEvent);
    
    logger.debug(`Field ${field} reverted`, 'DirtyTracker');
    return true;
  }
  
  /**
   * Revert all fields to original values
   */
  revertAll(): void {
    const dirtyFields = Array.from(this.dirtyFields);
    for (const field of dirtyFields) {
      this.revertField(field);
    }
  }
  
  /**
   * Subscribe to change events
   */
  subscribe(observer: (event: FieldChangeEvent) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }
  
  /**
   * Clear all history
   */
  clearHistory(): void {
    this.changeHistory = [];
  }
  
  /**
   * Get performance statistics
   */
  getStats(): {
    totalFields: number;
    dirtyFields: number;
    changeCount: number;
    historySize: number;
    memoryUsage: number;
    lastChange: number;
  } {
    const memoryUsage = this.estimateMemoryUsage();
    
    return {
      totalFields: this.currentValues.size,
      dirtyFields: this.dirtyFields.size,
      changeCount: this.changeCount,
      historySize: this.changeHistory.length,
      memoryUsage,
      lastChange: this.lastChangeTimestamp
    };
  }
  
  /**
   * Estimate memory usage in bytes
   */
  private estimateMemoryUsage(): number {
    let size = 0;
    
    // Estimate map sizes
    size += this.currentValues.size * 50; // rough estimate per entry
    size += this.originalValues.size * 50;
    size += this.dirtyFields.size * 20;
    size += this.changeHistory.length * 200; // rough estimate per change event
    
    return size;
  }
  
  /**
   * Export tracking state
   */
  exportState(): {
    dirtyFields: string[];
    originalValues: Record<string, any>;
    currentValues: Record<string, any>;
    changeHistory: FieldChangeEvent[];
    stats: ReturnType<FieldDirtyTracker<T>['getStats']>;
  } {
    return {
      dirtyFields: Array.from(this.dirtyFields),
      originalValues: Object.fromEntries(this.originalValues),
      currentValues: Object.fromEntries(this.currentValues),
      changeHistory: [...this.changeHistory],
      stats: this.getStats()
    };
  }
  
  /**
   * Create a batch update context
   */
  createBatch(): FieldUpdateBatch<T> {
    return new FieldUpdateBatch(this);
  }
}

/**
 * Batch update context for multiple field changes
 */
export class FieldUpdateBatch<T extends Record<string, any>> {
  private updates: Array<{ field: string; value: any; source: FieldChangeEvent['source'] }> = [];
  private committed = false;
  
  constructor(private tracker: FieldDirtyTracker<T>) {}
  
  /**
   * Queue field update
   */
  updateField(field: string, value: any, source: FieldChangeEvent['source'] = 'user'): this {
    if (this.committed) {
      throw new Error('Batch already committed');
    }
    
    this.updates.push({ field, value, source });
    return this;
  }
  
  /**
   * Commit all updates
   */
  commit(): boolean[] {
    if (this.committed) {
      throw new Error('Batch already committed');
    }
    
    const results = this.updates.map(({ field, value, source }) => 
      this.tracker.updateField(field, value, source)
    );
    
    this.committed = true;
    return results;
  }
  
  /**
   * Discard batch without committing
   */
  discard(): void {
    this.updates = [];
    this.committed = true;
  }
  
  /**
   * Get queued updates
   */
  getUpdates(): Array<{ field: string; value: any; source: FieldChangeEvent['source'] }> {
    return [...this.updates];
  }
}

/**
 * Factory for creating optimized dirty trackers
 */
export class DirtyTrackerFactory {
  static createForFormData<T extends Record<string, any>>(
    data: T, 
    options: Partial<DirtyTrackingOptions> = {}
  ): FieldDirtyTracker<T> {
    return new FieldDirtyTracker(data, {
      trackingGranularity: 'field',
      enableDeepTracking: false,
      maxHistorySize: 50,
      ...options
    });
  }
  
  static createForComplexData<T extends Record<string, any>>(
    data: T, 
    options: Partial<DirtyTrackingOptions> = {}
  ): FieldDirtyTracker<T> {
    return new FieldDirtyTracker(data, {
      trackingGranularity: 'property',
      enableDeepTracking: true,
      maxHistorySize: 100,
      ...options
    });
  }
  
  static createMinimal<T extends Record<string, any>>(
    data: T, 
    options: Partial<DirtyTrackingOptions> = {}
  ): FieldDirtyTracker<T> {
    return new FieldDirtyTracker(data, {
      trackingGranularity: 'field',
      enableDeepTracking: false,
      maxHistorySize: 10,
      includeMetadata: false,
      ...options
    });
  }
}