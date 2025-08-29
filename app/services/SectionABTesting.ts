/**
 * Section A/B Testing Framework
 * 
 * Gradual rollout system for new section architecture with metrics tracking
 */

import { logger } from './Logger';
import { performanceMonitor } from './SectionPerformanceMonitor';

export interface ABTestConfig {
  testId: string;
  testName: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  rolloutPercentage: number; // 0-100
  targetSections?: number[];
  targetUsers?: string[];
  excludeUsers?: string[];
  enableMetrics: boolean;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  implementation: 'legacy' | 'new' | 'hybrid';
  config: any;
  weight: number; // 0-100, must sum to 100 across variants
}

export interface ABTestResult {
  testId: string;
  variant: string;
  userId?: string;
  sectionNumber: number;
  metrics: {
    loadTime: number;
    renderTime: number;
    validationTime: number;
    errorRate: number;
    userSatisfaction?: number;
    completionRate: number;
  };
  timestamp: number;
}

export interface ABTestAnalytics {
  testId: string;
  variants: Array<{
    variant: string;
    sampleSize: number;
    averageLoadTime: number;
    averageRenderTime: number;
    errorRate: number;
    completionRate: number;
    confidenceInterval: [number, number];
    isSignificant: boolean;
  }>;
  winner?: string;
  recommendation: string;
}

/**
 * A/B Testing Framework for section architecture migration
 */
export class SectionABTesting {
  private static instance: SectionABTesting;
  private activeTests = new Map<string, ABTestConfig>();
  private testVariants = new Map<string, ABTestVariant[]>();
  private userAssignments = new Map<string, Map<string, string>>(); // userId -> testId -> variant
  private testResults: ABTestResult[] = [];
  private analytics = new Map<string, ABTestAnalytics>();
  
  private constructor() {}
  
  static getInstance(): SectionABTesting {
    if (!SectionABTesting.instance) {
      SectionABTesting.instance = new SectionABTesting();
    }
    return SectionABTesting.instance;
  }
  
  /**
   * Create new A/B test
   */
  createTest(config: ABTestConfig, variants: ABTestVariant[]): void {
    // Validate variants
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error('Variant weights must sum to 100');
    }
    
    // Validate config
    if (config.rolloutPercentage < 0 || config.rolloutPercentage > 100) {
      throw new Error('Rollout percentage must be between 0 and 100');
    }
    
    this.activeTests.set(config.testId, config);
    this.testVariants.set(config.testId, variants);
    
    logger.info(`Created A/B test: ${config.testName} (${config.rolloutPercentage}% rollout)`, 'ABTesting');
  }
  
  /**
   * Get variant assignment for user/section
   */
  getVariant(testId: string, sectionNumber: number, userId?: string): string | null {
    const test = this.activeTests.get(testId);
    if (!test) return null;
    
    // Check if test is active
    const now = new Date();
    if (now < test.startDate || (test.endDate && now > test.endDate)) {
      return null;
    }
    
    // Check section targeting
    if (test.targetSections && !test.targetSections.includes(sectionNumber)) {
      return null;
    }
    
    // Check user targeting
    if (userId) {
      if (test.targetUsers && !test.targetUsers.includes(userId)) {
        return null;
      }
      if (test.excludeUsers && test.excludeUsers.includes(userId)) {
        return null;
      }
    }
    
    // Check rollout percentage
    const rolloutHash = this.hashForRollout(testId, sectionNumber, userId);
    if (rolloutHash > test.rolloutPercentage) {
      return null;
    }
    
    // Get or assign variant
    if (userId) {
      const userTests = this.userAssignments.get(userId) || new Map();
      const existingVariant = userTests.get(testId);
      
      if (existingVariant) {
        return existingVariant;
      }
      
      const variant = this.assignVariant(testId, sectionNumber, userId);
      userTests.set(testId, variant);
      this.userAssignments.set(userId, userTests);
      
      logger.debug(`Assigned user ${userId} to variant ${variant} for test ${testId}`, 'ABTesting');
      return variant;
    }
    
    // Anonymous assignment (consistent per section/test)
    return this.assignVariant(testId, sectionNumber, userId);
  }
  
  /**
   * Assign variant based on consistent hashing
   */
  private assignVariant(testId: string, sectionNumber: number, userId?: string): string {
    const variants = this.testVariants.get(testId) || [];
    if (variants.length === 0) {
      return 'control';
    }
    
    const assignmentHash = this.hashForAssignment(testId, sectionNumber, userId);
    
    // Weighted assignment
    let cumulative = 0;
    for (const variant of variants) {
      cumulative += variant.weight;
      if (assignmentHash <= cumulative) {
        return variant.id;
      }
    }
    
    // Fallback to first variant
    return variants[0].id;
  }
  
  /**
   * Hash for rollout determination (0-100)
   */
  private hashForRollout(testId: string, sectionNumber: number, userId?: string): number {
    const input = `${testId}-rollout-${sectionNumber}-${userId || 'anonymous'}`;
    return this.simpleHash(input) % 101; // 0-100
  }
  
  /**
   * Hash for variant assignment (0-100)
   */
  private hashForAssignment(testId: string, sectionNumber: number, userId?: string): number {
    const input = `${testId}-assignment-${sectionNumber}-${userId || 'anonymous'}`;
    return this.simpleHash(input) % 101; // 0-100
  }
  
  /**
   * Simple hash function for consistent assignment
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  /**
   * Record test result
   */
  recordResult(result: ABTestResult): void {
    const test = this.activeTests.get(result.testId);
    if (!test || !test.enableMetrics) {
      return;
    }
    
    this.testResults.push({
      ...result,
      timestamp: result.timestamp || Date.now()
    });
    
    // Update analytics
    this.updateAnalytics(result.testId);
    
    logger.debug(`Recorded result for test ${result.testId}, variant ${result.variant}`, 'ABTesting');
  }
  
  /**
   * Update analytics for test
   */
  private updateAnalytics(testId: string): void {
    const testResults = this.testResults.filter(r => r.testId === testId);
    const variants = this.testVariants.get(testId) || [];
    
    const variantAnalytics = variants.map(variant => {
      const variantResults = testResults.filter(r => r.variant === variant.id);
      const sampleSize = variantResults.length;
      
      if (sampleSize === 0) {
        return {
          variant: variant.id,
          sampleSize: 0,
          averageLoadTime: 0,
          averageRenderTime: 0,
          errorRate: 0,
          completionRate: 0,
          confidenceInterval: [0, 0] as [number, number],
          isSignificant: false
        };
      }
      
      const averageLoadTime = variantResults.reduce((sum, r) => sum + r.metrics.loadTime, 0) / sampleSize;
      const averageRenderTime = variantResults.reduce((sum, r) => sum + r.metrics.renderTime, 0) / sampleSize;
      const errorRate = variantResults.reduce((sum, r) => sum + r.metrics.errorRate, 0) / sampleSize;
      const completionRate = variantResults.reduce((sum, r) => sum + r.metrics.completionRate, 0) / sampleSize;
      
      // Simple confidence interval calculation (95% CI)
      const stdDev = Math.sqrt(
        variantResults.reduce((sum, r) => sum + Math.pow(r.metrics.loadTime - averageLoadTime, 2), 0) / sampleSize
      );
      const marginOfError = 1.96 * (stdDev / Math.sqrt(sampleSize));
      const confidenceInterval: [number, number] = [
        averageLoadTime - marginOfError,
        averageLoadTime + marginOfError
      ];
      
      return {
        variant: variant.id,
        sampleSize,
        averageLoadTime,
        averageRenderTime,
        errorRate,
        completionRate,
        confidenceInterval,
        isSignificant: sampleSize >= 30 && marginOfError < averageLoadTime * 0.1 // 10% relative margin
      };
    });
    
    // Determine winner
    const significantVariants = variantAnalytics.filter(v => v.isSignificant && v.sampleSize >= 30);
    let winner: string | undefined;
    
    if (significantVariants.length >= 2) {
      // Find variant with best performance (lowest load time, lowest error rate)
      winner = significantVariants.reduce((best, current) => {
        const bestScore = best.averageLoadTime + (best.errorRate * 1000);
        const currentScore = current.averageLoadTime + (current.errorRate * 1000);
        return currentScore < bestScore ? current : best;
      }).variant;
    }
    
    // Generate recommendation
    let recommendation = 'Continue test - insufficient data for conclusion';
    if (winner) {
      const winnerVariant = variantAnalytics.find(v => v.variant === winner)!;
      const controlVariant = variantAnalytics.find(v => v.variant === 'control');
      
      if (controlVariant) {
        const improvement = ((controlVariant.averageLoadTime - winnerVariant.averageLoadTime) / controlVariant.averageLoadTime) * 100;
        recommendation = `Implement ${winner} variant - ${improvement.toFixed(1)}% performance improvement`;
      } else {
        recommendation = `Implement ${winner} variant - best performance`;
      }
    } else if (significantVariants.length === 1) {
      recommendation = 'Extend test duration for more data';
    }
    
    this.analytics.set(testId, {
      testId,
      variants: variantAnalytics,
      winner,
      recommendation
    });
  }
  
  /**
   * Get test analytics
   */
  getAnalytics(testId: string): ABTestAnalytics | null {
    return this.analytics.get(testId) || null;
  }
  
  /**
   * Get all active tests
   */
  getActiveTests(): ABTestConfig[] {
    const now = new Date();
    return Array.from(this.activeTests.values()).filter(test => 
      now >= test.startDate && (!test.endDate || now <= test.endDate)
    );
  }
  
  /**
   * Stop test
   */
  stopTest(testId: string): void {
    const test = this.activeTests.get(testId);
    if (test) {
      test.endDate = new Date();
      logger.info(`Stopped A/B test: ${test.testName}`, 'ABTesting');
    }
  }
  
  /**
   * Remove test and all data
   */
  removeTest(testId: string): void {
    this.activeTests.delete(testId);
    this.testVariants.delete(testId);
    this.analytics.delete(testId);
    
    // Remove user assignments for this test
    for (const [userId, userTests] of this.userAssignments) {
      userTests.delete(testId);
      if (userTests.size === 0) {
        this.userAssignments.delete(userId);
      }
    }
    
    // Remove test results
    this.testResults = this.testResults.filter(r => r.testId !== testId);
    
    logger.info(`Removed A/B test: ${testId}`, 'ABTesting');
  }
  
  /**
   * Export test data
   */
  exportTestData(testId: string): {
    config: ABTestConfig | null;
    variants: ABTestVariant[];
    results: ABTestResult[];
    analytics: ABTestAnalytics | null;
  } {
    return {
      config: this.activeTests.get(testId) || null,
      variants: this.testVariants.get(testId) || [],
      results: this.testResults.filter(r => r.testId === testId),
      analytics: this.analytics.get(testId) || null
    };
  }
  
  /**
   * Get test statistics
   */
  getTestStats(): {
    activeTests: number;
    totalResults: number;
    significantResults: number;
    avgSampleSize: number;
  } {
    const activeTests = this.getActiveTests().length;
    const totalResults = this.testResults.length;
    
    let significantResults = 0;
    let totalSampleSize = 0;
    
    for (const analytics of this.analytics.values()) {
      const hasSignificant = analytics.variants.some(v => v.isSignificant);
      if (hasSignificant) significantResults++;
      
      const testSampleSize = analytics.variants.reduce((sum, v) => sum + v.sampleSize, 0);
      totalSampleSize += testSampleSize;
    }
    
    return {
      activeTests,
      totalResults,
      significantResults,
      avgSampleSize: this.analytics.size > 0 ? totalSampleSize / this.analytics.size : 0
    };
  }
}

/**
 * Section Architecture Migration A/B Test Factory
 */
export class SectionMigrationABTest {
  private abTesting = SectionABTesting.getInstance();
  
  /**
   * Create legacy vs new architecture test
   */
  createArchitectureMigrationTest(
    sectionNumbers: number[],
    rolloutPercentage: number = 10
  ): string {
    const testId = `section-migration-${Date.now()}`;
    
    const config: ABTestConfig = {
      testId,
      testName: 'Section Architecture Migration',
      description: `Testing new section architecture on sections ${sectionNumbers.join(', ')}`,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      rolloutPercentage,
      targetSections: sectionNumbers,
      enableMetrics: true
    };
    
    const variants: ABTestVariant[] = [
      {
        id: 'control',
        name: 'Legacy Architecture',
        description: 'Current section implementation',
        implementation: 'legacy',
        config: { useLegacyContext: true, useLegacyValidation: true },
        weight: 50
      },
      {
        id: 'new_architecture',
        name: 'New Architecture',
        description: 'BaseSectionContext with shared types',
        implementation: 'new',
        config: { useBaseSectionContext: true, useSharedTypes: true },
        weight: 50
      }
    ];
    
    this.abTesting.createTest(config, variants);
    
    logger.info(`Created architecture migration A/B test for sections ${sectionNumbers.join(', ')} with ${rolloutPercentage}% rollout`, 'ABTesting');
    
    return testId;
  }
  
  /**
   * Create performance optimization test
   */
  createPerformanceTest(
    sectionNumbers: number[],
    rolloutPercentage: number = 20
  ): string {
    const testId = `section-performance-${Date.now()}`;
    
    const config: ABTestConfig = {
      testId,
      testName: 'Section Performance Optimization',
      description: `Testing performance optimizations on sections ${sectionNumbers.join(', ')}`,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      rolloutPercentage,
      targetSections: sectionNumbers,
      enableMetrics: true
    };
    
    const variants: ABTestVariant[] = [
      {
        id: 'control',
        name: 'Standard',
        description: 'Standard section rendering',
        implementation: 'legacy',
        config: { enableVirtualScrolling: false, enableIncrementalValidation: false },
        weight: 33
      },
      {
        id: 'virtual_scroll',
        name: 'Virtual Scrolling',
        description: 'Virtual scrolling for large sections',
        implementation: 'new',
        config: { enableVirtualScrolling: true, enableIncrementalValidation: false },
        weight: 33
      },
      {
        id: 'full_optimization',
        name: 'Full Optimization',
        description: 'Virtual scrolling + incremental validation',
        implementation: 'new',
        config: { enableVirtualScrolling: true, enableIncrementalValidation: true },
        weight: 34
      }
    ];
    
    this.abTesting.createTest(config, variants);
    
    return testId;
  }
  
  /**
   * Record section metrics for A/B test
   */
  recordSectionMetrics(
    testId: string,
    sectionNumber: number,
    variant: string,
    metrics: {
      loadTime: number;
      renderTime: number;
      validationTime: number;
      errorCount: number;
      totalFields: number;
      completedFields: number;
    },
    userId?: string
  ): void {
    const result: ABTestResult = {
      testId,
      variant,
      userId,
      sectionNumber,
      metrics: {
        loadTime: metrics.loadTime,
        renderTime: metrics.renderTime,
        validationTime: metrics.validationTime,
        errorRate: metrics.errorCount / Math.max(metrics.totalFields, 1),
        completionRate: metrics.completedFields / Math.max(metrics.totalFields, 1)
      },
      timestamp: Date.now()
    };
    
    this.abTesting.recordResult(result);
  }
}

// Export singleton instance
export const sectionABTesting = SectionABTesting.getInstance();
export const sectionMigrationTesting = new SectionMigrationABTest();