import { logger } from './Logger';

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage?: number;
  environments?: ('development' | 'staging' | 'production')[];
  sections?: number[];
  userCriteria?: {
    roles?: string[];
    userIds?: string[];
  };
  dependencies?: string[];
  deprecationDate?: Date;
  metadata?: Record<string, any>;
}

export interface FeatureFlagContext {
  environment?: 'development' | 'staging' | 'production';
  userId?: string;
  userRole?: string;
  sectionNumber?: number;
  timestamp?: Date;
}

export class FeatureFlagManager {
  private flags = new Map<string, FeatureFlag>();
  private cache = new Map<string, boolean>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private lastCacheReset = Date.now();

  constructor(private config: FeatureFlag[]) {
    this.loadFlags(config);
  }

  private loadFlags(flags: FeatureFlag[]): void {
    flags.forEach(flag => {
      this.flags.set(flag.key, flag);
      logger.debug(`Loaded feature flag: ${flag.key}`, 'FeatureFlagManager');
    });
  }

  isEnabled(key: string, context: FeatureFlagContext = {}): boolean {
    // Check cache first
    const cacheKey = this.getCacheKey(key, context);
    if (this.cache.has(cacheKey) && !this.isCacheExpired()) {
      return this.cache.get(cacheKey)!;
    }

    const flag = this.flags.get(key);
    if (!flag) {
      logger.warn(`Feature flag not found: ${key}`, 'FeatureFlagManager');
      return false;
    }

    // Check if deprecated
    if (flag.deprecationDate && new Date() > flag.deprecationDate) {
      logger.warn(`Feature flag deprecated: ${key}`, 'FeatureFlagManager');
      return false;
    }

    // Check basic enabled state
    if (!flag.enabled) {
      this.cache.set(cacheKey, false);
      return false;
    }

    // Environment check
    if (flag.environments && context.environment) {
      if (!flag.environments.includes(context.environment)) {
        this.cache.set(cacheKey, false);
        return false;
      }
    }

    // Section-specific check
    if (flag.sections && context.sectionNumber) {
      if (!flag.sections.includes(context.sectionNumber)) {
        this.cache.set(cacheKey, false);
        return false;
      }
    }

    // User criteria check
    if (flag.userCriteria) {
      if (flag.userCriteria.userIds && context.userId) {
        if (!flag.userCriteria.userIds.includes(context.userId)) {
          this.cache.set(cacheKey, false);
          return false;
        }
      }
      
      if (flag.userCriteria.roles && context.userRole) {
        if (!flag.userCriteria.roles.includes(context.userRole)) {
          this.cache.set(cacheKey, false);
          return false;
        }
      }
    }

    // Rollout percentage check
    if (flag.rolloutPercentage !== undefined && context.userId) {
      const hash = this.hashUserId(context.userId);
      if (hash > flag.rolloutPercentage) {
        this.cache.set(cacheKey, false);
        return false;
      }
    }

    // Check dependencies
    if (flag.dependencies) {
      for (const dep of flag.dependencies) {
        if (!this.isEnabled(dep, context)) {
          this.cache.set(cacheKey, false);
          return false;
        }
      }
    }

    this.cache.set(cacheKey, true);
    return true;
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash + userId.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash) % 100;
  }

  private getCacheKey(flag: string, context: FeatureFlagContext): string {
    return `${flag}:${context.userId || ''}:${context.sectionNumber || ''}:${context.environment || ''}`;
  }

  private isCacheExpired(): boolean {
    return Date.now() - this.lastCacheReset > this.cacheTimeout;
  }

  private resetCacheIfNeeded(): void {
    if (this.isCacheExpired()) {
      this.cache.clear();
      this.lastCacheReset = Date.now();
    }
  }

  // Management methods
  updateFlag(flag: FeatureFlag): void {
    this.flags.set(flag.key, flag);
    this.cache.clear(); // Clear cache when flags are updated
    logger.info(`Updated feature flag: ${flag.key}`, 'FeatureFlagManager');
  }

  removeFlag(key: string): boolean {
    const result = this.flags.delete(key);
    if (result) {
      this.cache.clear();
      logger.info(`Removed feature flag: ${key}`, 'FeatureFlagManager');
    }
    return result;
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  getFlag(key: string): FeatureFlag | undefined {
    return this.flags.get(key);
  }

  // Bulk operations
  isAnyEnabled(keys: string[], context: FeatureFlagContext = {}): boolean {
    return keys.some(key => this.isEnabled(key, context));
  }

  areAllEnabled(keys: string[], context: FeatureFlagContext = {}): boolean {
    return keys.every(key => this.isEnabled(key, context));
  }

  getEnabledFlags(context: FeatureFlagContext = {}): string[] {
    const enabled: string[] = [];
    this.flags.forEach((flag, key) => {
      if (this.isEnabled(key, context)) {
        enabled.push(key);
      }
    });
    return enabled;
  }

  // Analytics
  getUsageStats(): Record<string, any> {
    const stats: Record<string, any> = {
      totalFlags: this.flags.size,
      enabledFlags: 0,
      deprecatedFlags: 0,
      rolloutFlags: 0
    };

    this.flags.forEach(flag => {
      if (flag.enabled) stats.enabledFlags++;
      if (flag.deprecationDate && new Date() > flag.deprecationDate) stats.deprecatedFlags++;
      if (flag.rolloutPercentage !== undefined) stats.rolloutFlags++;
    });

    return stats;
  }
}

// Default feature flags for SF86 application
export const defaultFeatureFlags: FeatureFlag[] = [
  {
    key: 'new-section-architecture',
    enabled: true,
    rolloutPercentage: 25,
    sections: [1, 2, 3],
    environments: ['development', 'staging'],
    metadata: {
      description: 'New component architecture with factory pattern'
    }
  },
  {
    key: 'optimized-validation',
    enabled: true,
    rolloutPercentage: 50,
    dependencies: ['new-section-architecture'],
    metadata: {
      description: 'Smart validation with caching and debouncing'
    }
  },
  {
    key: 'virtual-scrolling',
    enabled: false,
    sections: [9, 12, 13],
    userCriteria: {
      roles: ['admin', 'beta-tester']
    },
    metadata: {
      description: 'Virtual scrolling for large forms'
    }
  },
  {
    key: 'progressive-loading',
    enabled: true,
    rolloutPercentage: 75,
    sections: [12, 13, 15],
    metadata: {
      description: 'Load sections on demand'
    }
  },
  {
    key: 'auto-save',
    enabled: true,
    rolloutPercentage: 100,
    environments: ['development', 'staging', 'production'],
    metadata: {
      description: 'Automatic form saving'
    }
  },
  {
    key: 'enhanced-error-handling',
    enabled: true,
    rolloutPercentage: 100,
    metadata: {
      description: 'Advanced error handling with recovery'
    }
  },
  {
    key: 'plugin-architecture',
    enabled: false,
    environments: ['development'],
    metadata: {
      description: 'Plugin-based section loading'
    }
  },
  {
    key: 'performance-monitoring',
    enabled: true,
    rolloutPercentage: 10,
    userCriteria: {
      roles: ['admin']
    },
    metadata: {
      description: 'Real-time performance monitoring'
    }
  }
];

// Singleton instance
let instance: FeatureFlagManager | null = null;

export function getFeatureFlagManager(flags?: FeatureFlag[]): FeatureFlagManager {
  if (!instance) {
    instance = new FeatureFlagManager(flags || defaultFeatureFlags);
  }
  return instance;
}

// React hook helper (to be used in React components)
export function createFeatureFlagHook(manager: FeatureFlagManager) {
  return (key: string, context?: FeatureFlagContext) => {
    return manager.isEnabled(key, context);
  };
}