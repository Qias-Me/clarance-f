/**
 * Performance Monitoring System
 * Real-time performance tracking for SF-86 sections with recommendations
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  mountTime: number;
  updateTime: number;
  memoryUsage: number;
  validationTime: number;
  formSize: number;
  interactionLatency: number;
  timestamp: number;
}

export interface PerformanceThresholds {
  renderTime: number;      // ms
  mountTime: number;       // ms  
  updateTime: number;      // ms
  validationTime: number;  // ms
  interactionLatency: number; // ms
  memoryUsage: number;     // MB
}

export interface PerformanceRecommendation {
  type: 'error' | 'warning' | 'info';
  metric: keyof PerformanceMetrics;
  threshold: number;
  actual: number;
  message: string;
  suggestion: string;
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  renderTime: 16,          // 60fps target
  mountTime: 100,          // Initial render
  updateTime: 8,           // Re-render
  validationTime: 50,      // Field validation
  interactionLatency: 100, // User input response
  memoryUsage: 50          // MB per section
};

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS;
  private observers: Set<(metrics: PerformanceMetrics) => void> = new Set();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Record performance metrics
   */
  recordMetrics(componentName: string, metrics: Partial<PerformanceMetrics>): void {
    const fullMetrics: PerformanceMetrics = {
      componentName,
      renderTime: 0,
      mountTime: 0,
      updateTime: 0,
      memoryUsage: 0,
      validationTime: 0,
      formSize: 0,
      interactionLatency: 0,
      timestamp: performance.now(),
      ...metrics
    };

    if (!this.metrics.has(componentName)) {
      this.metrics.set(componentName, []);
    }

    const componentMetrics = this.metrics.get(componentName)!;
    componentMetrics.push(fullMetrics);

    // Keep only last 50 measurements per component
    if (componentMetrics.length > 50) {
      componentMetrics.shift();
    }

    // Notify observers
    this.observers.forEach(observer => observer(fullMetrics));
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(componentName: string): PerformanceRecommendation[] {
    const componentMetrics = this.metrics.get(componentName);
    if (!componentMetrics || componentMetrics.length === 0) {
      return [];
    }

    const latestMetrics = componentMetrics[componentMetrics.length - 1];
    const recommendations: PerformanceRecommendation[] = [];

    // Check each threshold
    Object.entries(this.thresholds).forEach(([metric, threshold]) => {
      const actualValue = latestMetrics[metric as keyof PerformanceMetrics] as number;
      
      if (actualValue > threshold) {
        const severity = actualValue > threshold * 2 ? 'error' : 'warning';
        
        recommendations.push({
          type: severity,
          metric: metric as keyof PerformanceMetrics,
          threshold,
          actual: actualValue,
          message: `${metric} (${actualValue.toFixed(1)}ms) exceeds threshold (${threshold}ms)`,
          suggestion: this.getSuggestion(metric as keyof PerformanceMetrics, actualValue, threshold)
        });
      }
    });

    return recommendations;
  }

  /**
   * Get performance trends
   */
  getTrends(componentName: string): {
    averageRenderTime: number;
    trendDirection: 'improving' | 'stable' | 'degrading';
    confidence: number;
  } {
    const componentMetrics = this.metrics.get(componentName);
    if (!componentMetrics || componentMetrics.length < 5) {
      return { averageRenderTime: 0, trendDirection: 'stable', confidence: 0 };
    }

    const recentMetrics = componentMetrics.slice(-10);
    const averageRenderTime = recentMetrics.reduce((sum, m) => sum + m.renderTime, 0) / recentMetrics.length;

    // Simple trend analysis
    const firstHalf = recentMetrics.slice(0, Math.floor(recentMetrics.length / 2));
    const secondHalf = recentMetrics.slice(Math.floor(recentMetrics.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, m) => sum + m.renderTime, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + m.renderTime, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    const percentChange = Math.abs(difference / firstAvg);
    
    let trendDirection: 'improving' | 'stable' | 'degrading';
    if (percentChange < 0.1) {
      trendDirection = 'stable';
    } else if (difference < 0) {
      trendDirection = 'improving';
    } else {
      trendDirection = 'degrading';
    }

    return {
      averageRenderTime,
      trendDirection,
      confidence: Math.min(percentChange * 100, 100)
    };
  }

  /**
   * Subscribe to performance updates
   */
  subscribe(observer: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  /**
   * Get suggestion based on metric
   */
  private getSuggestion(metric: keyof PerformanceMetrics, actual: number, threshold: number): string {
    switch (metric) {
      case 'renderTime':
        if (actual > threshold * 3) {
          return 'Consider memoizing components with React.memo and useMemo';
        }
        return 'Optimize expensive calculations or break down complex components';

      case 'mountTime':
        return 'Reduce initial rendering complexity or implement code splitting';

      case 'updateTime':
        return 'Check for unnecessary re-renders and optimize state updates';

      case 'validationTime':
        return 'Implement validation caching or debounce validation calls';

      case 'interactionLatency':
        return 'Use debouncing for user input or optimize event handlers';

      case 'memoryUsage':
        return 'Check for memory leaks and clean up subscriptions/timers';

      default:
        return 'Monitor this metric and consider optimization strategies';
    }
  }
}

/**
 * React hook for component performance monitoring
 */
export function usePerformanceMonitor(componentName: string) {
  const monitor = PerformanceMonitor.getInstance();
  const renderStartRef = useRef<number>(0);
  const [recommendations, setRecommendations] = useState<PerformanceRecommendation[]>([]);
  const [trends, setTrends] = useState<ReturnType<typeof monitor.getTrends>>();

  // Track render time
  useEffect(() => {
    renderStartRef.current = performance.now();
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStartRef.current;
    
    monitor.recordMetrics(componentName, {
      renderTime,
      memoryUsage: (performance as any).memory?.usedJSHeapSize / (1024 * 1024) || 0
    });

    setRecommendations(monitor.getRecommendations(componentName));
    setTrends(monitor.getTrends(componentName));
  });

  // Track validation performance
  const trackValidation = useCallback((validationFn: () => Promise<any>) => {
    return async (...args: any[]) => {
      const start = performance.now();
      const result = await validationFn.apply(null, args);
      const validationTime = performance.now() - start;
      
      monitor.recordMetrics(componentName, { validationTime });
      return result;
    };
  }, [componentName, monitor]);

  // Track interaction latency
  const trackInteraction = useCallback((interactionFn: (...args: any[]) => any) => {
    return (...args: any[]) => {
      const start = performance.now();
      const result = interactionFn.apply(null, args);
      const interactionLatency = performance.now() - start;
      
      monitor.recordMetrics(componentName, { interactionLatency });
      return result;
    };
  }, [componentName, monitor]);

  return {
    recommendations,
    trends,
    trackValidation,
    trackInteraction
  };
}

/**
 * Performance monitoring HOC
 */
export function withPerformanceMonitoring<P extends {}>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  return function PerformanceMonitoredComponent(props: P) {
    const name = componentName || Component.displayName || Component.name || 'Anonymous';
    const mountTimeRef = useRef(performance.now());
    const { recommendations, trends } = usePerformanceMonitor(name);

    useEffect(() => {
      const mountTime = performance.now() - mountTimeRef.current;
      PerformanceMonitor.getInstance().recordMetrics(name, { mountTime });
    }, []);

    // Development-only performance warnings
    useEffect(() => {
      if (process.env.NODE_ENV === 'development' && recommendations.length > 0) {
        const errors = recommendations.filter(r => r.type === 'error');
        const warnings = recommendations.filter(r => r.type === 'warning');

        if (errors.length > 0) {
          console.error(`Performance errors in ${name}:`, errors);
        }
        if (warnings.length > 0) {
          console.warn(`Performance warnings in ${name}:`, warnings);
        }
      }
    }, [recommendations, name]);

    return <Component {...props} />;
  };
}

/**
 * Performance report generator
 */
export class PerformanceReporter {
  /**
   * Generate comprehensive performance report
   */
  static generateReport(): {
    summary: {
      totalComponents: number;
      averageRenderTime: number;
      slowestComponent: string;
      memoryUsage: number;
    };
    components: Array<{
      name: string;
      metrics: PerformanceMetrics;
      recommendations: PerformanceRecommendation[];
      trends: ReturnType<PerformanceMonitor['getTrends']>;
    }>;
  } {
    const monitor = PerformanceMonitor.getInstance();
    const components: any[] = [];
    let totalRenderTime = 0;
    let slowestComponent = '';
    let slowestTime = 0;
    let totalMemory = 0;

    // Process each component
    monitor.metrics.forEach((metrics, componentName) => {
      if (metrics.length === 0) return;

      const latestMetrics = metrics[metrics.length - 1];
      const recommendations = monitor.getRecommendations(componentName);
      const trends = monitor.getTrends(componentName);

      components.push({
        name: componentName,
        metrics: latestMetrics,
        recommendations,
        trends
      });

      totalRenderTime += latestMetrics.renderTime;
      totalMemory += latestMetrics.memoryUsage;

      if (latestMetrics.renderTime > slowestTime) {
        slowestTime = latestMetrics.renderTime;
        slowestComponent = componentName;
      }
    });

    return {
      summary: {
        totalComponents: components.length,
        averageRenderTime: totalRenderTime / components.length || 0,
        slowestComponent,
        memoryUsage: totalMemory
      },
      components
    };
  }

  /**
   * Export report to JSON
   */
  static exportReport(): string {
    const report = this.generateReport();
    return JSON.stringify(report, null, 2);
  }

  /**
   * Generate performance dashboard HTML
   */
  static generateDashboardHTML(): string {
    const report = this.generateReport();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>SF-86 Performance Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .component { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 6px; }
        .error { background: #fee; border-color: #f88; }
        .warning { background: #ffc; border-color: #fb8; }
        .metric { display: inline-block; margin-right: 20px; }
        .recommendation { margin: 5px 0; padding: 8px; border-radius: 4px; }
        .rec-error { background: #fee; }
        .rec-warning { background: #ffc; }
        .rec-info { background: #eff; }
    </style>
</head>
<body>
    <h1>SF-86 Performance Dashboard</h1>
    
    <div class="summary">
        <h2>Summary</h2>
        <div class="metric">Total Components: ${report.summary.totalComponents}</div>
        <div class="metric">Average Render Time: ${report.summary.averageRenderTime.toFixed(2)}ms</div>
        <div class="metric">Slowest Component: ${report.summary.slowestComponent}</div>
        <div class="metric">Total Memory Usage: ${report.summary.memoryUsage.toFixed(2)}MB</div>
    </div>

    ${report.components.map(comp => `
    <div class="component ${comp.recommendations.some(r => r.type === 'error') ? 'error' : comp.recommendations.some(r => r.type === 'warning') ? 'warning' : ''}">
        <h3>${comp.name}</h3>
        
        <h4>Metrics</h4>
        <div class="metric">Render Time: ${comp.metrics.renderTime.toFixed(2)}ms</div>
        <div class="metric">Memory Usage: ${comp.metrics.memoryUsage.toFixed(2)}MB</div>
        <div class="metric">Validation Time: ${comp.metrics.validationTime.toFixed(2)}ms</div>
        
        <h4>Trends</h4>
        <div class="metric">Direction: ${comp.trends.trendDirection}</div>
        <div class="metric">Confidence: ${comp.trends.confidence.toFixed(1)}%</div>
        
        ${comp.recommendations.length > 0 ? `
        <h4>Recommendations</h4>
        ${comp.recommendations.map(rec => `
            <div class="recommendation rec-${rec.type}">
                <strong>${rec.type.toUpperCase()}:</strong> ${rec.message}
                <br><em>Suggestion: ${rec.suggestion}</em>
            </div>
        `).join('')}
        ` : ''}
    </div>
    `).join('')}

</body>
</html>`;
  }
}

/**
 * Development utilities
 */
export const DevPerformanceUtils = {
  /**
   * Log performance summary to console
   */
  logSummary(): void {
    const report = PerformanceReporter.generateReport();
    console.group('🚀 SF-86 Performance Summary');
    console.log('Components monitored:', report.summary.totalComponents);
    console.log('Average render time:', `${report.summary.averageRenderTime.toFixed(2)}ms`);
    console.log('Slowest component:', report.summary.slowestComponent);
    console.log('Total memory usage:', `${report.summary.memoryUsage.toFixed(2)}MB`);
    console.groupEnd();
  },

  /**
   * Monitor specific component in console
   */
  monitorComponent(componentName: string): () => void {
    const monitor = PerformanceMonitor.getInstance();
    
    return monitor.subscribe((metrics) => {
      if (metrics.componentName === componentName) {
        console.log(`📊 ${componentName}:`, {
          renderTime: `${metrics.renderTime.toFixed(2)}ms`,
          memoryUsage: `${metrics.memoryUsage.toFixed(2)}MB`,
          validationTime: `${metrics.validationTime.toFixed(2)}ms`
        });
      }
    });
  },

  /**
   * Save performance report to file
   */
  saveReport(): void {
    if (typeof window !== 'undefined') {
      const report = PerformanceReporter.exportReport();
      const blob = new Blob([report], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sf86-performance-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
};