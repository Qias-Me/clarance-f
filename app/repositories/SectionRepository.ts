import { ValidationSpecification } from '../domain/specifications/ValidationSpecification';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface StorageAdapter {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface CacheAdapter {
  get(key: string): any | null;
  set(key: string, value: any, ttl?: number): void;
  has(key: string): boolean;
  invalidate(key: string): void;
  clear(): void;
}

export interface SectionRepository<T> {
  get(id: string): Promise<T | null>;
  save(id: string, data: T): Promise<void>;
  validate(data: T): Promise<ValidationResult>;
  getHistory(id: string): Promise<T[]>;
  exists(id: string): Promise<boolean>;
  remove(id: string): Promise<void>;
}

export class SF86SectionRepository<T> implements SectionRepository<T> {
  private historyLimit = 10;

  constructor(
    private sectionName: string,
    private storage: StorageAdapter,
    private validator: ValidationSpecification<T>,
    private cache: CacheAdapter
  ) {}

  async get(id: string): Promise<T | null> {
    const cacheKey = this.getCacheKey(id);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Fetch from storage
    const storageKey = this.getStorageKey(id);
    const data = await this.storage.get(storageKey);
    
    if (data) {
      // Cache for future use
      this.cache.set(cacheKey, data, 300000); // 5 minutes TTL
      return data;
    }

    return null;
  }

  async save(id: string, data: T): Promise<void> {
    const storageKey = this.getStorageKey(id);
    const cacheKey = this.getCacheKey(id);

    // Save to history first
    await this.saveToHistory(id, data);

    // Save to storage
    await this.storage.set(storageKey, data);

    // Update cache
    this.cache.set(cacheKey, data, 300000);
  }

  async validate(data: T): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      const isValid = this.validator.isSatisfiedBy(data);
      
      if (!isValid) {
        errors.push({
          field: 'general',
          message: this.validator.getErrorMessage()
        });
      }

      // Additional business rule validations can be added here
      const businessRuleErrors = await this.validateBusinessRules(data);
      errors.push(...businessRuleErrors);

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push({
        field: 'system',
        message: 'Validation failed due to system error',
        code: 'VALIDATION_ERROR'
      });

      return {
        isValid: false,
        errors,
        warnings
      };
    }
  }

  async getHistory(id: string): Promise<T[]> {
    const historyKey = this.getHistoryKey(id);
    const history = await this.storage.get(historyKey);
    return history || [];
  }

  async exists(id: string): Promise<boolean> {
    const storageKey = this.getStorageKey(id);
    const data = await this.storage.get(storageKey);
    return data !== null && data !== undefined;
  }

  async remove(id: string): Promise<void> {
    const storageKey = this.getStorageKey(id);
    const cacheKey = this.getCacheKey(id);
    const historyKey = this.getHistoryKey(id);

    // Remove from storage
    await this.storage.remove(storageKey);
    await this.storage.remove(historyKey);

    // Invalidate cache
    this.cache.invalidate(cacheKey);
  }

  private async saveToHistory(id: string, data: T): Promise<void> {
    const historyKey = this.getHistoryKey(id);
    const history = await this.getHistory(id);
    
    // Add new entry to history
    history.unshift(data);
    
    // Limit history size
    if (history.length > this.historyLimit) {
      history.splice(this.historyLimit);
    }

    await this.storage.set(historyKey, history);
  }

  private async validateBusinessRules(data: T): Promise<ValidationError[]> {
    // Override in section-specific repositories
    return [];
  }

  private getStorageKey(id: string): string {
    return `sf86:${this.sectionName}:${id}`;
  }

  private getCacheKey(id: string): string {
    return `cache:${this.sectionName}:${id}`;
  }

  private getHistoryKey(id: string): string {
    return `sf86:${this.sectionName}:${id}:history`;
  }
}

// Implementation of storage adapters

export class LocalStorageAdapter implements StorageAdapter {
  async get(key: string): Promise<any> {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  async set(key: string, value: any): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }
}

export class MemoryCacheAdapter implements CacheAdapter {
  private cache = new Map<string, { value: any; expiry?: number }>();

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  set(key: string, value: any, ttl?: number): void {
    const expiry = ttl ? Date.now() + ttl : undefined;
    this.cache.set(key, { value, expiry });
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) return false;
    
    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}