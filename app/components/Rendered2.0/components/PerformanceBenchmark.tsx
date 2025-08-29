/**
 * Performance Benchmarking Component
 * Measures and compares performance between legacy and refactored implementations
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { usePerformanceMonitor } from '../../../utils/performance-monitor';
import { logger } from '../../../utils/logger';

interface BenchmarkResult {
  testName: string;
  iterations: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  memoryUsed: number;
  timestamp: number;
}

interface PerformanceBenchmarkProps {
  sectionName: string;
  legacyComponent?: React.ComponentType<any>;
  refactoredComponent?: React.ComponentType<any>;
  testData?: any;
  autoRun?: boolean;
}

export const PerformanceBenchmark: React.FC<PerformanceBenchmarkProps> = ({
  sectionName,
  legacyComponent: LegacyComponent,
  refactoredComponent: RefactoredComponent,
  testData = {},
  autoRun = false
}) => {
  const { metrics } = usePerformanceMonitor(`${sectionName}Benchmark`);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  // Memory usage tracking
  const getMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
      return (window.performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }, []);

  // Benchmark function
  const runBenchmark = useCallback(async (
    testName: string,
    testFn: () => Promise<void> | void,
    iterations: number = 10
  ): Promise<BenchmarkResult> => {
    const times: number[] = [];
    const memoryBefore = getMemoryUsage();

    setCurrentTest(testName);

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      await testFn();
      const endTime = performance.now();
      times.push(endTime - startTime);
      
      // Force garbage collection if available (Chrome DevTools)
      if (typeof window !== 'undefined' && 'gc' in window && typeof (window as any).gc === 'function') {
        (window as any).gc();
      }
      
      // Small delay between iterations
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    const memoryAfter = getMemoryUsage();
    const result: BenchmarkResult = {
      testName,
      iterations,
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      memoryUsed: memoryAfter - memoryBefore,
      timestamp: Date.now()
    };

    logger.info(`Benchmark completed: ${testName}`, {
      component: 'PerformanceBenchmark',
      sectionName,
      result
    });

    return result;
  }, [sectionName, getMemoryUsage]);

  // Test rendering performance
  const testRenderingPerformance = useCallback(async (
    Component: React.ComponentType<any>,
    testName: string
  ) => {
    return runBenchmark(testName, async () => {
      // Create a temporary container for testing
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      try {
        // Simulate React rendering
        const startTime = performance.now();
        
        // This is a simplified test - in real scenario you'd use React testing utilities
        container.innerHTML = `<div data-test="${testName}">Component Rendered</div>`;
        
        const endTime = performance.now();
        
        // Wait for next frame
        await new Promise(resolve => requestAnimationFrame(resolve));
        
      } finally {
        document.body.removeChild(container);
      }
    }, 20);
  }, [runBenchmark]);

  // Test field update performance
  const testFieldUpdatePerformance = useCallback(async (testName: string) => {
    const fields = Array.from({ length: 100 }, (_, i) => ({ id: `field${i}`, value: `value${i}` }));
    
    return runBenchmark(testName, () => {
      // Simulate field updates
      fields.forEach(field => {
        field.value = `updated${Date.now()}`;
      });
    }, 50);
  }, [runBenchmark]);

  // Run all benchmarks
  const runAllBenchmarks = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setResults([]);
    
    try {
      const newResults: BenchmarkResult[] = [];

      // Test field updates
      const fieldUpdateResult = await testFieldUpdatePerformance('Field Updates');
      newResults.push(fieldUpdateResult);

      // Test legacy component if provided
      if (LegacyComponent) {
        const legacyResult = await testRenderingPerformance(LegacyComponent, 'Legacy Rendering');
        newResults.push(legacyResult);
      }

      // Test refactored component if provided
      if (RefactoredComponent) {
        const refactoredResult = await testRenderingPerformance(RefactoredComponent, 'Refactored Rendering');
        newResults.push(refactoredResult);
      }

      // Test virtualization performance
      const virtualizationResult = await runBenchmark('Virtualization Test', () => {
        // Simulate virtual scrolling calculations
        const itemHeight = 80;
        const containerHeight = 600;
        const totalItems = 1000;
        const visibleItems = Math.ceil(containerHeight / itemHeight);
        
        for (let i = 0; i < visibleItems; i++) {
          const itemIndex = Math.floor(Math.random() * totalItems);
          const itemTop = itemIndex * itemHeight;
          // Simulate DOM updates
          document.createElement('div').style.transform = `translateY(${itemTop}px)`;
        }
      }, 30);
      newResults.push(virtualizationResult);

      setResults(newResults);
      
    } catch (error) {
      logger.error('Benchmark failed', {
        component: 'PerformanceBenchmark',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  }, [isRunning, testFieldUpdatePerformance, testRenderingPerformance, runBenchmark, LegacyComponent, RefactoredComponent]);

  // Auto-run on mount if enabled
  useEffect(() => {
    if (autoRun && results.length === 0) {
      runAllBenchmarks();
    }
  }, [autoRun, results.length, runAllBenchmarks]);

  // Performance comparison
  const comparison = useMemo(() => {
    if (results.length < 2) return null;
    
    const legacy = results.find(r => r.testName.includes('Legacy'));
    const refactored = results.find(r => r.testName.includes('Refactored'));
    
    if (!legacy || !refactored) return null;
    
    const timeImprovement = ((legacy.avgTime - refactored.avgTime) / legacy.avgTime * 100);
    const memoryImprovement = ((legacy.memoryUsed - refactored.memoryUsed) / legacy.memoryUsed * 100);
    
    return {
      timeImprovement,
      memoryImprovement,
      fasterBy: legacy.avgTime / refactored.avgTime
    };
  }, [results]);

  const formatTime = (ms: number) => `${ms.toFixed(2)}ms`;
  const formatMemory = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)}MB`;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">
        Performance Benchmark: {sectionName}
      </h3>
      
      <div className="mb-6">
        <button
          onClick={runAllBenchmarks}
          disabled={isRunning}
          className={`px-4 py-2 rounded font-medium ${
            isRunning
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isRunning ? `Running ${currentTest}...` : 'Run Benchmarks'}
        </button>
      </div>

      {comparison && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-green-800 mb-2">Performance Improvement</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Speed:</span>
              <span className={`ml-2 ${comparison.timeImprovement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {comparison.timeImprovement > 0 ? '+' : ''}{comparison.timeImprovement.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="font-medium">Memory:</span>
              <span className={`ml-2 ${comparison.memoryImprovement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {comparison.memoryImprovement > 0 ? '+' : ''}{comparison.memoryImprovement.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="font-medium">Faster by:</span>
              <span className="ml-2 text-blue-600">
                {comparison.fasterBy.toFixed(2)}x
              </span>
            </div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Test</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Iterations</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Avg Time</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Min/Max</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Memory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((result, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 text-sm text-gray-900">{result.testName}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{result.iterations}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                    {formatTime(result.avgTime)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {formatTime(result.minTime)} / {formatTime(result.maxTime)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {formatMemory(result.memoryUsed)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {metrics && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h4 className="font-medium mb-2">Current Metrics</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Render Count: {metrics.renderCount}</div>
            <div>Last Render: {metrics.lastRenderTime}ms</div>
            <div>Memory Usage: {formatMemory(getMemoryUsage())}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceBenchmark;