/**
 * Performance Monitoring Hook
 * 
 * Tracks component and operation performance metrics
 */

import { useRef, useEffect, useCallback } from 'react';
import { logger } from '../services/Logger';

interface PerformanceMetrics {
  renderCount: number;
  averageRenderTime: number;
  measurements: Record<string, number[]>;
  lastUpdate: number;
}

export function usePerformanceMonitor(componentName: string) {
  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    averageRenderTime: 0,
    measurements: {},
    lastUpdate: Date.now()
  });
  
  const renderStartRef = useRef<number>(0);
  const activeMarksRef = useRef<Map<string, number>>(new Map());
  
  // Track render performance
  useEffect(() => {
    renderStartRef.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - renderStartRef.current;
      const metrics = metricsRef.current;
      
      metrics.renderCount++;
      metrics.averageRenderTime = 
        (metrics.averageRenderTime * (metrics.renderCount - 1) + renderTime) / metrics.renderCount;
      metrics.lastUpdate = Date.now();
      
      // Log performance issues
      if (renderTime > 100) {
        logger.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`, 'Performance');
      }
      
      // Report metrics periodically
      if (metrics.renderCount % 10 === 0) {
        logger.info(`Performance metrics for ${componentName}`, 'Performance', {
          renderCount: metrics.renderCount,
          averageRenderTime: metrics.averageRenderTime.toFixed(2),
          measurements: Object.entries(metrics.measurements).reduce((acc, [key, values]) => {
            acc[key] = {
              count: values.length,
              average: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
              min: Math.min(...values).toFixed(2),
              max: Math.max(...values).toFixed(2)
            };
            return acc;
          }, {} as Record<string, any>)
        });
      }
    };
  });
  
  const startMeasure = useCallback((name: string) => {
    activeMarksRef.current.set(name, performance.now());
  }, []);
  
  const endMeasure = useCallback((name: string) => {
    const startTime = activeMarksRef.current.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      const metrics = metricsRef.current;
      
      if (!metrics.measurements[name]) {
        metrics.measurements[name] = [];
      }
      
      metrics.measurements[name].push(duration);
      
      // Keep only last 100 measurements per type
      if (metrics.measurements[name].length > 100) {
        metrics.measurements[name].shift();
      }
      
      activeMarksRef.current.delete(name);
      
      // Log slow operations
      if (duration > 50) {
        logger.warn(`Slow operation ${name} in ${componentName}: ${duration.toFixed(2)}ms`, 'Performance');
      }
    }
  }, [componentName]);
  
  const cleanup = useCallback(() => {
    activeMarksRef.current.clear();
    
    // Final metrics report
    const metrics = metricsRef.current;
    if (metrics.renderCount > 0) {
      logger.info(`Final performance metrics for ${componentName}`, 'Performance', {
        totalRenders: metrics.renderCount,
        averageRenderTime: metrics.averageRenderTime.toFixed(2),
        sessionDuration: ((Date.now() - metrics.lastUpdate) / 1000).toFixed(2) + 's'
      });
    }
  }, [componentName]);
  
  return {
    startMeasure,
    endMeasure,
    cleanup,
    getMetrics: () => ({ ...metricsRef.current })
  };
}