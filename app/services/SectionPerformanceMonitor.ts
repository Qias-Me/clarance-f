/**
 * Section Performance Monitor
 * 
 * Real-time performance tracking and optimization for sections
 */

import { logger } from './Logger';

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  sectionNumber: number;
  validationTime: number;
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  fieldUpdateTime: number;
  saveTime: number;
  loadTime: number;
  timestamp: number;
}

/**
 * Performance threshold configuration
 */
export interface PerformanceThresholds {
  validationTime?: number; // ms
  renderTime?: number; // ms
  memoryUsage?: number; // MB
  cacheHitRate?: number; // percentage
  fieldUpdateTime?: number; // ms
}

/**
 * Performance alert
 */
export interface PerformanceAlert {
  sectionNumber: number;
  metric: keyof PerformanceMetrics;
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
  timestamp: number;
}

/**
 * Section performance monitor
 */
export class SectionPerformanceMonitor {
  private static instance: SectionPerformanceMonitor;
  private metrics = new Map<number, PerformanceMetrics[]>();
  private thresholds: PerformanceThresholds;
  private alerts: PerformanceAlert[] = [];
  private observers = new Set<(alert: PerformanceAlert) => void>();
  private performanceObserver?: PerformanceObserver;
  
  private constructor(thresholds: PerformanceThresholds = {}) {
    this.thresholds = {
      validationTime: 100, // 100ms
      renderTime: 50, // 50ms
      memoryUsage: 50, // 50MB
      cacheHitRate: 70, // 70%
      fieldUpdateTime: 30, // 30ms
      ...thresholds
    };
    
    this.initializePerformanceObserver();
  }
  
  static getInstance(thresholds?: PerformanceThresholds): SectionPerformanceMonitor {
    if (!SectionPerformanceMonitor.instance) {
      SectionPerformanceMonitor.instance = new SectionPerformanceMonitor(thresholds);
    }
    return SectionPerformanceMonitor.instance;
  }
  
  /**
   * Initialize performance observer
   */
  private initializePerformanceObserver(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });
      
      this.performanceObserver.observe({ 
        entryTypes: ['measure', 'navigation', 'resource'] 
      });
    }
  }
  
  /**
   * Process performance entry
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    // Extract section number from entry name
    const match = entry.name.match(/section(\d+)/i);
    if (!match) return;
    
    const sectionNumber = parseInt(match[1]);
    const duration = entry.duration;
    
    // Check thresholds
    if (entry.name.includes('validation') && duration > this.thresholds.validationTime!) {
      this.createAlert(sectionNumber, 'validationTime', duration, this.thresholds.validationTime!);
    }
    
    if (entry.name.includes('render') && duration > this.thresholds.renderTime!) {
      this.createAlert(sectionNumber, 'renderTime', duration, this.thresholds.renderTime!);
    }
  }
  
  /**
   * Record metrics for a section
   */
  recordMetrics(metrics: Partial<PerformanceMetrics> & { sectionNumber: number }): void {
    const fullMetrics: PerformanceMetrics = {
      validationTime: 0,
      renderTime: 0,
      memoryUsage: this.getMemoryUsage(),
      cacheHitRate: 0,
      fieldUpdateTime: 0,
      saveTime: 0,
      loadTime: 0,
      timestamp: Date.now(),
      ...metrics
    };
    
    // Store metrics
    if (!this.metrics.has(metrics.sectionNumber)) {
      this.metrics.set(metrics.sectionNumber, []);
    }
    
    const sectionMetrics = this.metrics.get(metrics.sectionNumber)!;
    sectionMetrics.push(fullMetrics);
    
    // Keep only last 100 metrics per section
    if (sectionMetrics.length > 100) {
      sectionMetrics.shift();
    }
    
    // Check thresholds
    this.checkThresholds(fullMetrics);
  }
  
  /**
   * Check performance thresholds
   */
  private checkThresholds(metrics: PerformanceMetrics): void {
    const checks = [
      { key: 'validationTime', threshold: this.thresholds.validationTime },
      { key: 'renderTime', threshold: this.thresholds.renderTime },
      { key: 'memoryUsage', threshold: this.thresholds.memoryUsage },
      { key: 'fieldUpdateTime', threshold: this.thresholds.fieldUpdateTime }
    ] as const;
    
    for (const { key, threshold } of checks) {
      if (threshold && metrics[key] > threshold) {
        this.createAlert(metrics.sectionNumber, key, metrics[key], threshold);
      }
    }
    
    // Check cache hit rate (lower is bad)
    if (this.thresholds.cacheHitRate && metrics.cacheHitRate < this.thresholds.cacheHitRate) {
      this.createAlert(
        metrics.sectionNumber, 
        'cacheHitRate', 
        metrics.cacheHitRate, 
        this.thresholds.cacheHitRate,
        'warning'
      );
    }
  }
  
  /**
   * Create performance alert
   */
  private createAlert(
    sectionNumber: number,
    metric: keyof PerformanceMetrics,
    value: number,
    threshold: number,
    severity?: 'warning' | 'critical'
  ): void {
    const alert: PerformanceAlert = {
      sectionNumber,
      metric,
      value,
      threshold,
      severity: severity || (value > threshold * 2 ? 'critical' : 'warning'),
      timestamp: Date.now()
    };
    
    this.alerts.push(alert);
    
    // Notify observers
    this.observers.forEach(observer => observer(alert));
    
    // Log alert
    const logMethod = alert.severity === 'critical' ? 'error' : 'warn';
    logger[logMethod](
      `Performance ${alert.severity}: Section ${sectionNumber} ${metric} (${value}ms) exceeded threshold (${threshold}ms)`,
      'PerformanceMonitor'
    );
  }
  
  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const perf = performance as any;
      if (perf.memory) {
        return Math.round(perf.memory.usedJSHeapSize / 1024 / 1024); // MB
      }
    }
    return 0;
  }
  
  /**
   * Get average metrics for a section
   */
  getAverageMetrics(sectionNumber: number): PerformanceMetrics | null {
    const sectionMetrics = this.metrics.get(sectionNumber);
    if (!sectionMetrics || sectionMetrics.length === 0) {
      return null;
    }
    
    const sum = sectionMetrics.reduce((acc, metrics) => {
      Object.keys(metrics).forEach(key => {
        if (key !== 'sectionNumber' && key !== 'timestamp') {
          acc[key] = (acc[key] || 0) + (metrics as any)[key];
        }
      });
      return acc;
    }, {} as any);
    
    const count = sectionMetrics.length;
    const average: any = {
      sectionNumber,
      timestamp: Date.now()
    };
    
    Object.keys(sum).forEach(key => {
      average[key] = sum[key] / count;
    });
    
    return average as PerformanceMetrics;
  }
  
  /**
   * Get performance report
   */
  getPerformanceReport(): {
    sections: Array<{
      sectionNumber: number;
      averageMetrics: PerformanceMetrics | null;
      alertCount: number;
      criticalAlerts: number;
    }>;
    overallHealth: 'good' | 'degraded' | 'critical';
    recommendations: string[];
  } {
    const sections: any[] = [];
    
    for (const [sectionNumber] of this.metrics) {
      const sectionAlerts = this.alerts.filter(a => a.sectionNumber === sectionNumber);
      sections.push({
        sectionNumber,
        averageMetrics: this.getAverageMetrics(sectionNumber),
        alertCount: sectionAlerts.length,
        criticalAlerts: sectionAlerts.filter(a => a.severity === 'critical').length
      });
    }
    
    // Determine overall health
    const criticalCount = this.alerts.filter(a => a.severity === 'critical').length;
    const warningCount = this.alerts.filter(a => a.severity === 'warning').length;
    
    let overallHealth: 'good' | 'degraded' | 'critical';
    if (criticalCount > 5) {
      overallHealth = 'critical';
    } else if (criticalCount > 0 || warningCount > 10) {
      overallHealth = 'degraded';
    } else {
      overallHealth = 'good';
    }
    
    // Generate recommendations
    const recommendations = this.generateRecommendations();
    
    return {
      sections,
      overallHealth,
      recommendations
    };
  }
  
  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Analyze alerts
    const validationAlerts = this.alerts.filter(a => a.metric === 'validationTime');
    const renderAlerts = this.alerts.filter(a => a.metric === 'renderTime');
    const memoryAlerts = this.alerts.filter(a => a.metric === 'memoryUsage');
    const cacheAlerts = this.alerts.filter(a => a.metric === 'cacheHitRate');
    
    if (validationAlerts.length > 5) {
      recommendations.push('Consider implementing incremental validation to reduce validation time');
    }
    
    if (renderAlerts.length > 5) {
      recommendations.push('Implement virtual scrolling for sections with many fields');
    }
    
    if (memoryAlerts.length > 0) {
      recommendations.push('Review memory usage and implement cleanup for unused sections');
    }
    
    if (cacheAlerts.length > 3) {
      recommendations.push('Increase cache size or TTL to improve cache hit rate');
    }
    
    return recommendations;
  }
  
  /**
   * Subscribe to performance alerts
   */
  subscribe(observer: (alert: PerformanceAlert) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }
  
  /**
   * Clear metrics and alerts
   */
  clear(): void {
    this.metrics.clear();
    this.alerts = [];
  }
  
  /**
   * Export metrics for analysis
   */
  exportMetrics(): {
    metrics: Array<{ sectionNumber: number; data: PerformanceMetrics[] }>;
    alerts: PerformanceAlert[];
    timestamp: number;
  } {
    const metrics: any[] = [];
    
    for (const [sectionNumber, data] of this.metrics) {
      metrics.push({ sectionNumber, data });
    }
    
    return {
      metrics,
      alerts: this.alerts,
      timestamp: Date.now()
    };
  }
}

// Export singleton instance
export const performanceMonitor = SectionPerformanceMonitor.getInstance();