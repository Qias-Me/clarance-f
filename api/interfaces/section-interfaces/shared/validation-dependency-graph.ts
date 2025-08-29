/**
 * Validation Dependency Graph
 * 
 * Manages validation dependencies with circular dependency detection
 */

import { logger } from '../../../../app/services/Logger';

export interface ValidationDependency {
  field: string;
  dependsOn: string[];
  validator: (value: any, dependencies: Record<string, any>) => ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface ValidationNode {
  field: string;
  dependencies: Set<string>;
  dependents: Set<string>;
  validator: (value: any, dependencies: Record<string, any>) => ValidationResult;
  visited?: boolean;
  inStack?: boolean;
}

/**
 * Validation dependency graph with cycle detection
 */
export class ValidationDependencyGraph {
  private nodes = new Map<string, ValidationNode>();
  private topologicalOrder: string[] = [];
  private hasCycles = false;
  private cycleDetected: string[] = [];
  
  /**
   * Add validation dependency
   */
  addDependency(dependency: ValidationDependency): void {
    const { field, dependsOn, validator } = dependency;
    
    if (!this.nodes.has(field)) {
      this.nodes.set(field, {
        field,
        dependencies: new Set(),
        dependents: new Set(),
        validator
      });
    }
    
    const node = this.nodes.get(field)!;
    node.validator = validator;
    
    // Add dependencies
    for (const dep of dependsOn) {
      node.dependencies.add(dep);
      
      // Ensure dependent node exists
      if (!this.nodes.has(dep)) {
        this.nodes.set(dep, {
          field: dep,
          dependencies: new Set(),
          dependents: new Set(),
          validator: () => ({ isValid: true })
        });
      }
      
      this.nodes.get(dep)!.dependents.add(field);
    }
    
    // Rebuild topological order
    this.buildTopologicalOrder();
  }
  
  /**
   * Remove validation dependency
   */
  removeDependency(field: string): void {
    const node = this.nodes.get(field);
    if (!node) return;
    
    // Remove from dependents
    for (const dep of node.dependencies) {
      const depNode = this.nodes.get(dep);
      if (depNode) {
        depNode.dependents.delete(field);
      }
    }
    
    // Remove from dependencies
    for (const dependent of node.dependents) {
      const dependentNode = this.nodes.get(dependent);
      if (dependentNode) {
        dependentNode.dependencies.delete(field);
      }
    }
    
    this.nodes.delete(field);
    this.buildTopologicalOrder();
  }
  
  /**
   * Build topological order with cycle detection
   */
  private buildTopologicalOrder(): void {
    this.topologicalOrder = [];
    this.hasCycles = false;
    this.cycleDetected = [];
    
    // Reset visit state
    for (const node of this.nodes.values()) {
      node.visited = false;
      node.inStack = false;
    }
    
    // DFS from each unvisited node
    for (const [field, node] of this.nodes) {
      if (!node.visited) {
        const cycle = this.dfsVisit(field, []);
        if (cycle.length > 0) {
          this.hasCycles = true;
          this.cycleDetected = cycle;
          logger.error(`Circular dependency detected in validation: ${cycle.join(' → ')}`, 'ValidationGraph');
          break;
        }
      }
    }
    
    // Reverse for topological order
    this.topologicalOrder.reverse();
  }
  
  /**
   * DFS visit with cycle detection
   */
  private dfsVisit(field: string, stack: string[]): string[] {
    const node = this.nodes.get(field);
    if (!node) return [];
    
    if (node.inStack) {
      // Cycle detected
      const cycleStart = stack.indexOf(field);
      return stack.slice(cycleStart).concat(field);
    }
    
    if (node.visited) {
      return [];
    }
    
    node.visited = true;
    node.inStack = true;
    stack.push(field);
    
    // Visit dependencies
    for (const dep of node.dependencies) {
      const cycle = this.dfsVisit(dep, stack);
      if (cycle.length > 0) {
        return cycle;
      }
    }
    
    node.inStack = false;
    stack.pop();
    this.topologicalOrder.push(field);
    
    return [];
  }
  
  /**
   * Get validation order (topologically sorted)
   */
  getValidationOrder(): string[] {
    if (this.hasCycles) {
      throw new Error(`Cannot validate with circular dependencies: ${this.cycleDetected.join(' → ')}`);
    }
    
    return [...this.topologicalOrder];
  }
  
  /**
   * Get fields that depend on a specific field
   */
  getDependents(field: string): string[] {
    const node = this.nodes.get(field);
    return node ? Array.from(node.dependents) : [];
  }
  
  /**
   * Get dependencies for a specific field
   */
  getDependencies(field: string): string[] {
    const node = this.nodes.get(field);
    return node ? Array.from(node.dependencies) : [];
  }
  
  /**
   * Check if graph has cycles
   */
  hasCycleDetected(): boolean {
    return this.hasCycles;
  }
  
  /**
   * Get detected cycle
   */
  getCycle(): string[] {
    return [...this.cycleDetected];
  }
  
  /**
   * Validate a field with its dependencies
   */
  validateField(field: string, values: Record<string, any>): ValidationResult {
    const node = this.nodes.get(field);
    if (!node) {
      return { isValid: true };
    }
    
    // Get dependency values
    const dependencyValues: Record<string, any> = {};
    for (const dep of node.dependencies) {
      dependencyValues[dep] = values[dep];
    }
    
    try {
      return node.validator(values[field], dependencyValues);
    } catch (error) {
      logger.error(`Validation error for field ${field}`, error as Error, 'ValidationGraph');
      return {
        isValid: false,
        message: 'Validation function error',
        severity: 'error'
      };
    }
  }
  
  /**
   * Validate all fields in dependency order
   */
  validateAll(values: Record<string, any>): Record<string, ValidationResult> {
    if (this.hasCycles) {
      throw new Error(`Cannot validate with circular dependencies: ${this.cycleDetected.join(' → ')}`);
    }
    
    const results: Record<string, ValidationResult> = {};
    
    for (const field of this.getValidationOrder()) {
      results[field] = this.validateField(field, values);
    }
    
    return results;
  }
  
  /**
   * Get graph statistics
   */
  getStats(): {
    nodeCount: number;
    edgeCount: number;
    hasCycles: boolean;
    maxDepth: number;
    cyclePath?: string[];
  } {
    let edgeCount = 0;
    let maxDepth = 0;
    
    for (const node of this.nodes.values()) {
      edgeCount += node.dependencies.size;
      
      // Calculate depth (simplified)
      const depth = this.calculateDepth(node.field, new Set());
      maxDepth = Math.max(maxDepth, depth);
    }
    
    return {
      nodeCount: this.nodes.size,
      edgeCount,
      hasCycles: this.hasCycles,
      maxDepth,
      cyclePath: this.hasCycles ? this.cycleDetected : undefined
    };
  }
  
  /**
   * Calculate depth of a node
   */
  private calculateDepth(field: string, visited: Set<string>): number {
    if (visited.has(field)) {
      return 0; // Avoid infinite recursion
    }
    
    visited.add(field);
    const node = this.nodes.get(field);
    if (!node || node.dependencies.size === 0) {
      return 0;
    }
    
    let maxDepth = 0;
    for (const dep of node.dependencies) {
      const depth = this.calculateDepth(dep, visited);
      maxDepth = Math.max(maxDepth, depth + 1);
    }
    
    return maxDepth;
  }
  
  /**
   * Export graph for visualization
   */
  exportGraph(): {
    nodes: Array<{ id: string; label: string }>;
    edges: Array<{ from: string; to: string }>;
  } {
    const nodes: Array<{ id: string; label: string }> = [];
    const edges: Array<{ from: string; to: string }> = [];
    
    for (const [field, node] of this.nodes) {
      nodes.push({ id: field, label: field });
      
      for (const dep of node.dependencies) {
        edges.push({ from: dep, to: field });
      }
    }
    
    return { nodes, edges };
  }
}

/**
 * Factory for common validation patterns with dependencies
 */
export class ValidationDependencyFactory {
  static createConditionalRequired(field: string, condition: string, conditionValue: any): ValidationDependency {
    return {
      field,
      dependsOn: [condition],
      validator: (value, deps) => {
        const isRequired = deps[condition] === conditionValue;
        
        if (isRequired && (!value || (typeof value === 'string' && value.trim() === ''))) {
          return {
            isValid: false,
            message: `${field} is required when ${condition} is ${conditionValue}`,
            severity: 'error'
          };
        }
        
        return { isValid: true };
      }
    };
  }
  
  static createDateRange(startField: string, endField: string): ValidationDependency[] {
    return [
      {
        field: endField,
        dependsOn: [startField],
        validator: (endValue, deps) => {
          const startValue = deps[startField];
          
          if (!startValue || !endValue) {
            return { isValid: true }; // Let required validation handle empty values
          }
          
          const startDate = new Date(startValue);
          const endDate = new Date(endValue);
          
          if (endDate < startDate) {
            return {
              isValid: false,
              message: 'End date must be after start date',
              severity: 'error'
            };
          }
          
          return { isValid: true };
        }
      }
    ];
  }
  
  static createNumericRange(field: string, minField: string, maxField: string): ValidationDependency {
    return {
      field,
      dependsOn: [minField, maxField],
      validator: (value, deps) => {
        const numValue = Number(value);
        const minValue = Number(deps[minField]);
        const maxValue = Number(deps[maxField]);
        
        if (isNaN(numValue)) {
          return { isValid: true }; // Let type validation handle non-numeric
        }
        
        if (!isNaN(minValue) && numValue < minValue) {
          return {
            isValid: false,
            message: `Value must be at least ${minValue}`,
            severity: 'error'
          };
        }
        
        if (!isNaN(maxValue) && numValue > maxValue) {
          return {
            isValid: false,
            message: `Value must be at most ${maxValue}`,
            severity: 'error'
          };
        }
        
        return { isValid: true };
      }
    };
  }
}