/**
 * Section Memory Manager
 * 
 * Manages memory usage and prevents leaks in section operations
 */

import { logger } from './Logger';

/**
 * Memory usage info
 */
export interface MemoryInfo {
  sectionNumber: number;
  size: number; // bytes
  lastAccessed: number;
  references: number;
  cached: boolean;
}

/**
 * Memory management configuration
 */
export interface MemoryConfig {
  maxMemoryUsage?: number; // MB
  maxSectionsInMemory?: number;
  ttl?: number; // milliseconds
  cleanupInterval?: number; // milliseconds
  enableAutoCleanup?: boolean;
}

/**
 * Section memory manager
 */
export class SectionMemoryManager {
  private static instance: SectionMemoryManager;
  private memoryMap = new Map<number, MemoryInfo>();
  private weakRefs = new WeakMap<object, number>();
  private cleanupTimer?: NodeJS.Timeout;
  private config: MemoryConfig;
  
  private constructor(config: MemoryConfig = {}) {
    this.config = {
      maxMemoryUsage: 100, // 100MB default
      maxSectionsInMemory: 10,
      ttl: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 60 * 1000, // 1 minute
      enableAutoCleanup: true,
      ...config
    };
    
    if (this.config.enableAutoCleanup) {
      this.startAutoCleanup();
    }
  }
  
  static getInstance(config?: MemoryConfig): SectionMemoryManager {
    if (!SectionMemoryManager.instance) {
      SectionMemoryManager.instance = new SectionMemoryManager(config);
    }
    return SectionMemoryManager.instance;
  }
  
  /**
   * Register section in memory
   */
  registerSection(sectionNumber: number, data: object): void {
    const size = this.estimateSize(data);
    
    this.memoryMap.set(sectionNumber, {
      sectionNumber,
      size,
      lastAccessed: Date.now(),
      references: 1,
      cached: true
    });
    
    // Store weak reference
    this.weakRefs.set(data, sectionNumber);
    
    // Check memory limits
    this.checkMemoryLimits();
    
    logger.info(`Section ${sectionNumber} registered (${this.formatBytes(size)})`, 'MemoryManager');
  }
  
  /**
   * Unregister section from memory
   */
  unregisterSection(sectionNumber: number): void {
    const info = this.memoryMap.get(sectionNumber);
    if (!info) return;
    
    this.memoryMap.delete(sectionNumber);
    
    logger.info(`Section ${sectionNumber} unregistered (freed ${this.formatBytes(info.size)})`, 'MemoryManager');
  }
  
  /**
   * Update access time
   */
  touchSection(sectionNumber: number): void {
    const info = this.memoryMap.get(sectionNumber);
    if (info) {
      info.lastAccessed = Date.now();
      info.references++;
    }
  }
  
  /**
   * Check memory limits and trigger cleanup if needed
   */
  private checkMemoryLimits(): void {
    const totalMemory = this.getTotalMemoryUsage();
    const sectionCount = this.memoryMap.size;
    
    // Check total memory limit
    if (totalMemory > this.config.maxMemoryUsage! * 1024 * 1024) {
      logger.warn(`Memory limit exceeded: ${this.formatBytes(totalMemory)}`, 'MemoryManager');
      this.performCleanup();
    }
    
    // Check section count limit
    if (sectionCount > this.config.maxSectionsInMemory!) {
      logger.warn(`Section count limit exceeded: ${sectionCount}`, 'MemoryManager');
      this.evictLRU();
    }
  }
  
  /**
   * Get total memory usage
   */
  private getTotalMemoryUsage(): number {
    let total = 0;
    for (const info of this.memoryMap.values()) {
      total += info.size;
    }
    return total;
  }
  
  /**
   * Perform memory cleanup
   */
  private performCleanup(): void {
    const now = Date.now();
    const ttl = this.config.ttl!;
    const toRemove: number[] = [];
    
    // Find stale sections
    for (const [sectionNumber, info] of this.memoryMap) {
      if (now - info.lastAccessed > ttl) {
        toRemove.push(sectionNumber);
      }
    }
    
    // Remove stale sections
    for (const sectionNumber of toRemove) {
      this.unregisterSection(sectionNumber);
    }
    
    if (toRemove.length > 0) {
      logger.info(`Cleaned up ${toRemove.length} stale sections`, 'MemoryManager');
    }
    
    // Force garbage collection if available
    this.forceGarbageCollection();
  }
  
  /**
   * Evict least recently used section
   */
  private evictLRU(): void {
    let oldest: MemoryInfo | null = null;
    
    for (const info of this.memoryMap.values()) {
      if (!oldest || info.lastAccessed < oldest.lastAccessed) {
        oldest = info;
      }
    }
    
    if (oldest) {
      this.unregisterSection(oldest.sectionNumber);
      logger.info(`Evicted LRU section ${oldest.sectionNumber}`, 'MemoryManager');
    }
  }
  
  /**
   * Start automatic cleanup
   */
  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.config.cleanupInterval!);
  }
  
  /**
   * Stop automatic cleanup
   */
  stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }
  
  /**
   * Estimate object size in bytes
   */
  private estimateSize(obj: any): number {
    const seen = new WeakSet();
    
    function sizeOf(obj: any): number {
      if (obj === null || obj === undefined) return 0;
      
      const type = typeof obj;
      
      // Primitives
      if (type === 'boolean') return 4;
      if (type === 'number') return 8;
      if (type === 'string') return obj.length * 2; // UTF-16
      
      // Already counted
      if (seen.has(obj)) return 0;
      seen.add(obj);
      
      // Objects and arrays
      let size = 0;
      
      if (Array.isArray(obj)) {
        size += 24; // Array overhead
        for (const item of obj) {
          size += sizeOf(item);
        }
      } else if (type === 'object') {
        size += 32; // Object overhead
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            size += sizeOf(key) + sizeOf(obj[key]);
          }
        }
      }
      
      return size;
    }
    
    return sizeOf(obj);
  }
  
  /**
   * Format bytes for display
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
  
  /**
   * Force garbage collection if available
   */
  private forceGarbageCollection(): void {
    if (typeof global !== 'undefined' && (global as any).gc) {
      (global as any).gc();
      logger.info('Forced garbage collection', 'MemoryManager');
    }
  }
  
  /**
   * Get memory statistics
   */
  getMemoryStats(): {
    totalSections: number;
    totalMemory: number;
    averageSize: number;
    largestSection: number | null;
    oldestAccess: number | null;
    memoryUsagePercent: number;
  } {
    const totalMemory = this.getTotalMemoryUsage();
    const sectionCount = this.memoryMap.size;
    
    let largestSection: number | null = null;
    let largestSize = 0;
    let oldestAccess: number | null = null;
    let oldestTime = Date.now();
    
    for (const [sectionNumber, info] of this.memoryMap) {
      if (info.size > largestSize) {
        largestSize = info.size;
        largestSection = sectionNumber;
      }
      
      if (info.lastAccessed < oldestTime) {
        oldestTime = info.lastAccessed;
        oldestAccess = sectionNumber;
      }
    }
    
    return {
      totalSections: sectionCount,
      totalMemory,
      averageSize: sectionCount > 0 ? totalMemory / sectionCount : 0,
      largestSection,
      oldestAccess,
      memoryUsagePercent: (totalMemory / (this.config.maxMemoryUsage! * 1024 * 1024)) * 100
    };
  }
  
  /**
   * Get section memory info
   */
  getSectionInfo(sectionNumber: number): MemoryInfo | null {
    return this.memoryMap.get(sectionNumber) || null;
  }
  
  /**
   * Clear all memory
   */
  clear(): void {
    this.memoryMap.clear();
    this.forceGarbageCollection();
    logger.info('All section memory cleared', 'MemoryManager');
  }
  
  /**
   * Export memory snapshot
   */
  exportSnapshot(): {
    sections: MemoryInfo[];
    totalMemory: number;
    timestamp: number;
  } {
    return {
      sections: Array.from(this.memoryMap.values()),
      totalMemory: this.getTotalMemoryUsage(),
      timestamp: Date.now()
    };
  }
}

// Export singleton instance
export const memoryManager = SectionMemoryManager.getInstance();