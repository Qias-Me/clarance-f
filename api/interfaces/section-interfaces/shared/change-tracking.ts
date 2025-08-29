/**
 * Change Tracking System
 * 
 * Optimized change tracking for minimal re-renders and efficient updates
 */

import { cloneDeep, get, set, isEqual } from 'lodash';
import type { FieldPath } from './base-types';

/**
 * Deep readonly utility type
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

/**
 * Change tracking interface
 */
export interface ChangeTracker<T> {
  readonly originalData: DeepReadonly<T>;
  readonly currentData: T;
  readonly changedPaths: Set<string>;
  readonly isDirty: boolean;
  readonly changeCount: number;
}

/**
 * Change event
 */
export interface ChangeEvent<T> {
  path: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
  source?: string;
}

/**
 * Field change tracker implementation
 */
export class FieldChangeTracker<T> implements ChangeTracker<T> {
  private _originalData: T;
  private _currentData: T;
  private _changedPaths = new Set<string>();
  private _changeHistory: ChangeEvent<T>[] = [];
  private _listeners = new Map<string, Set<(event: ChangeEvent<T>) => void>>();
  private _batchMode = false;
  private _batchedChanges: ChangeEvent<T>[] = [];
  
  constructor(initialData: T) {
    this._originalData = cloneDeep(initialData);
    this._currentData = cloneDeep(initialData);
  }
  
  get originalData(): DeepReadonly<T> {
    return this._originalData as DeepReadonly<T>;
  }
  
  get currentData(): T {
    return this._currentData;
  }
  
  get changedPaths(): Set<string> {
    return new Set(this._changedPaths);
  }
  
  get isDirty(): boolean {
    return this._changedPaths.size > 0;
  }
  
  get changeCount(): number {
    return this._changedPaths.size;
  }
  
  /**
   * Track a field change
   */
  trackChange(path: string, newValue: any, source?: string): void {
    const oldValue = get(this._currentData, path);
    
    // Skip if value hasn't changed
    if (isEqual(oldValue, newValue)) {
      return;
    }
    
    // Update current data
    set(this._currentData, path, newValue);
    
    // Check if this reverts to original value
    const originalValue = get(this._originalData, path);
    if (isEqual(newValue, originalValue)) {
      this._changedPaths.delete(path);
    } else {
      this._changedPaths.add(path);
    }
    
    // Create change event
    const event: ChangeEvent<T> = {
      path,
      oldValue,
      newValue,
      timestamp: Date.now(),
      source
    };
    
    // Add to history
    this._changeHistory.push(event);
    
    // Notify listeners
    if (this._batchMode) {
      this._batchedChanges.push(event);
    } else {
      this.notifyListeners(path, event);
    }
  }
  
  /**
   * Batch multiple changes
   */
  batchChanges(changes: () => void): void {
    this._batchMode = true;
    this._batchedChanges = [];
    
    try {
      changes();
    } finally {
      this._batchMode = false;
      
      // Notify all batched changes
      for (const event of this._batchedChanges) {
        this.notifyListeners(event.path, event);
      }
      
      this._batchedChanges = [];
    }
  }
  
  /**
   * Reset tracking to new baseline
   */
  resetTracking(newOriginalData?: T): void {
    if (newOriginalData) {
      this._originalData = cloneDeep(newOriginalData);
      this._currentData = cloneDeep(newOriginalData);
    } else {
      this._originalData = cloneDeep(this._currentData);
    }
    
    this._changedPaths.clear();
    this._changeHistory = [];
  }
  
  /**
   * Get only changed fields
   */
  getChangedFields(): Partial<T> {
    const changes: any = {};
    
    for (const path of this._changedPaths) {
      const value = get(this._currentData, path);
      set(changes, path, value);
    }
    
    return changes;
  }
  
  /**
   * Get change history
   */
  getHistory(limit?: number): ChangeEvent<T>[] {
    if (limit) {
      return this._changeHistory.slice(-limit);
    }
    return [...this._changeHistory];
  }
  
  /**
   * Check if a specific path has changed
   */
  hasChanged(path: string): boolean {
    return this._changedPaths.has(path);
  }
  
  /**
   * Get the original value for a path
   */
  getOriginalValue(path: string): any {
    return get(this._originalData, path);
  }
  
  /**
   * Get the current value for a path
   */
  getCurrentValue(path: string): any {
    return get(this._currentData, path);
  }
  
  /**
   * Revert a specific field
   */
  revertField(path: string): void {
    const originalValue = get(this._originalData, path);
    this.trackChange(path, originalValue, 'revert');
  }
  
  /**
   * Revert all changes
   */
  revertAll(): void {
    this.batchChanges(() => {
      for (const path of this._changedPaths) {
        this.revertField(path);
      }
    });
  }
  
  /**
   * Subscribe to changes
   */
  subscribe(path: string, callback: (event: ChangeEvent<T>) => void): () => void {
    if (!this._listeners.has(path)) {
      this._listeners.set(path, new Set());
    }
    
    this._listeners.get(path)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this._listeners.get(path)?.delete(callback);
    };
  }
  
  /**
   * Notify listeners
   */
  private notifyListeners(path: string, event: ChangeEvent<T>): void {
    // Notify exact path listeners
    this._listeners.get(path)?.forEach(callback => callback(event));
    
    // Notify wildcard listeners
    this._listeners.get('*')?.forEach(callback => callback(event));
    
    // Notify parent path listeners
    const parts = path.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const parentPath = parts.slice(0, i).join('.');
      this._listeners.get(`${parentPath}.*`)?.forEach(callback => callback(event));
    }
  }
  
  /**
   * Export change summary
   */
  exportSummary(): {
    isDirty: boolean;
    changeCount: number;
    changedPaths: string[];
    changes: Array<{ path: string; original: any; current: any }>;
  } {
    const changes = Array.from(this._changedPaths).map(path => ({
      path,
      original: get(this._originalData, path),
      current: get(this._currentData, path)
    }));
    
    return {
      isDirty: this.isDirty,
      changeCount: this.changeCount,
      changedPaths: Array.from(this._changedPaths),
      changes
    };
  }
}

/**
 * Optimized change detector
 */
export class OptimizedChangeDetector<T> {
  private tracker: FieldChangeTracker<T>;
  private pendingChanges = new Map<string, any>();
  private flushTimeout?: NodeJS.Timeout;
  
  constructor(
    initialData: T,
    private options: {
      debounceMs?: number;
      maxBatchSize?: number;
      onFlush?: (changes: Map<string, any>) => void;
    } = {}
  ) {
    this.tracker = new FieldChangeTracker(initialData);
  }
  
  /**
   * Queue a change for optimized processing
   */
  queueChange(path: string, value: any): void {
    this.pendingChanges.set(path, value);
    
    // Auto-flush if batch size exceeded
    if (this.options.maxBatchSize && this.pendingChanges.size >= this.options.maxBatchSize) {
      this.flush();
      return;
    }
    
    // Debounced flush
    if (this.options.debounceMs) {
      if (this.flushTimeout) {
        clearTimeout(this.flushTimeout);
      }
      
      this.flushTimeout = setTimeout(() => {
        this.flush();
      }, this.options.debounceMs);
    } else {
      this.flush();
    }
  }
  
  /**
   * Flush pending changes
   */
  flush(): void {
    if (this.pendingChanges.size === 0) return;
    
    // Clear timeout
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = undefined;
    }
    
    // Apply changes in batch
    this.tracker.batchChanges(() => {
      for (const [path, value] of this.pendingChanges) {
        this.tracker.trackChange(path, value, 'batch');
      }
    });
    
    // Notify flush handler
    if (this.options.onFlush) {
      this.options.onFlush(new Map(this.pendingChanges));
    }
    
    // Clear pending changes
    this.pendingChanges.clear();
  }
  
  /**
   * Get the underlying tracker
   */
  getTracker(): FieldChangeTracker<T> {
    return this.tracker;
  }
  
  /**
   * Force immediate processing
   */
  forceFlush(): void {
    this.flush();
  }
}