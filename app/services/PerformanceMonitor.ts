export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface PerformanceThreshold {
  metric: string;
  warning: number;
  critical: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private thresholds: Map<string, PerformanceThreshold> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  private marks: Map<string, number> = new Map();

  constructor() {
    this.initializeDefaultThresholds();
    this.setupObservers();
  }

  private initializeDefaultThresholds(): void {
    this.addThreshold({
      metric: 'FCP',
      warning: 1800,
      critical: 3000
    });

    this.addThreshold({
      metric: 'LCP',
      warning: 2500,
      critical: 4000
    });

    this.addThreshold({
      metric: 'FID',
      warning: 100,
      critical: 300
    });

    this.addThreshold({
      metric: 'CLS',
      warning: 0.1,
      critical: 0.25
    });

    this.addThreshold({
      metric: 'TTFB',
      warning: 800,
      critical: 1800
    });
  }

  private setupObservers(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      return;
    }

    // First Contentful Paint
    this.observePaintTiming();

    // Largest Contentful Paint
    this.observeLCP();

    // First Input Delay
    this.observeFID();

    // Cumulative Layout Shift
    this.observeCLS();
  }

  private observePaintTiming(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric({
              name: 'FCP',
              value: entry.startTime,
              unit: 'ms',
              timestamp: new Date()
            });
          }
        }
      });

      observer.observe({ entryTypes: ['paint'] });
      this.observers.set('paint', observer);
    } catch (error) {
      console.warn('Paint timing observation not supported');
    }
  }

  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.recordMetric({
          name: 'LCP',
          value: lastEntry.startTime,
          unit: 'ms',
          timestamp: new Date()
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', observer);
    } catch (error) {
      console.warn('LCP observation not supported');
    }
  }

  private observeFID(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const firstInputEntry = entry as any;
          const delay = firstInputEntry.processingStart - firstInputEntry.startTime;
          
          this.recordMetric({
            name: 'FID',
            value: delay,
            unit: 'ms',
            timestamp: new Date()
          });
        }
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', observer);
    } catch (error) {
      console.warn('FID observation not supported');
    }
  }

  private observeCLS(): void {
    try {
      let clsValue = 0;
      let clsEntries: any[] = [];

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            const firstSessionEntry = clsEntries[0];
            const lastSessionEntry = clsEntries[clsEntries.length - 1];

            if (firstSessionEntry && 
                entry.startTime - lastSessionEntry.startTime < 1000 &&
                entry.startTime - firstSessionEntry.startTime < 5000) {
              clsValue += (entry as any).value;
              clsEntries.push(entry);
            } else {
              clsValue = (entry as any).value;
              clsEntries = [entry];
            }
          }
        }

        this.recordMetric({
          name: 'CLS',
          value: clsValue,
          unit: 'score',
          timestamp: new Date()
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', observer);
    } catch (error) {
      console.warn('CLS observation not supported');
    }
  }

  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string, endMark?: string): number | null {
    const startTime = this.marks.get(startMark);
    if (!startTime) return null;

    const endTime = endMark ? this.marks.get(endMark) : performance.now();
    if (!endTime) return null;

    const duration = endTime - startTime;

    this.recordMetric({
      name,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      tags: { start: startMark, end: endMark || 'now' }
    });

    return duration;
  }

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    this.checkThreshold(metric);
    this.pruneOldMetrics();
  }

  private checkThreshold(metric: PerformanceMetric): void {
    const threshold = this.thresholds.get(metric.name);
    if (!threshold) return;

    if (metric.value >= threshold.critical) {
      console.error(`Performance Critical: ${metric.name} = ${metric.value}${metric.unit} (threshold: ${threshold.critical})`);
    } else if (metric.value >= threshold.warning) {
      console.warn(`Performance Warning: ${metric.name} = ${metric.value}${metric.unit} (threshold: ${threshold.warning})`);
    }
  }

  private pruneOldMetrics(): void {
    const oneHourAgo = new Date(Date.now() - 3600000);
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
  }

  addThreshold(threshold: PerformanceThreshold): void {
    this.thresholds.set(threshold.metric, threshold);
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  getLatestMetric(name: string): PerformanceMetric | null {
    const metrics = this.getMetrics(name);
    return metrics[metrics.length - 1] || null;
  }

  getAverageMetric(name: string): number | null {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return null;

    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  getPercentile(name: string, percentile: number): number | null {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return null;

    const sorted = metrics.map(m => m.value).sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  generateReport(): Record<string, any> {
    const report: Record<string, any> = {};

    const metricNames = new Set(this.metrics.map(m => m.name));

    for (const name of metricNames) {
      report[name] = {
        latest: this.getLatestMetric(name)?.value,
        average: this.getAverageMetric(name),
        p50: this.getPercentile(name, 50),
        p75: this.getPercentile(name, 75),
        p95: this.getPercentile(name, 95),
        p99: this.getPercentile(name, 99),
        count: this.getMetrics(name).length
      };
    }

    return report;
  }

  destroy(): void {
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();
    this.metrics = [];
    this.marks.clear();
  }
}