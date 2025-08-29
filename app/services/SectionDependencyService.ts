export type DependencyCallback = (data: any, metadata?: DependencyMetadata) => void;

export interface DependencyMetadata {
  sourceSection: string;
  targetSection: string;
  timestamp: Date;
  changeType: 'create' | 'update' | 'delete';
}

export interface SectionDependency {
  sourceSection: string;
  targetSections: string[];
  fields?: string[]; // Specific fields that trigger dependency
  condition?: (data: any) => boolean; // Optional condition for triggering
}

export class SectionDependencyService {
  private dependencies = new Map<string, Set<string>>();
  private fieldDependencies = new Map<string, Map<string, Set<string>>>();
  private observers = new Map<string, Set<DependencyCallback>>();
  private conditions = new Map<string, (data: any) => boolean>();
  private changeQueue: Array<{ section: string; data: any; metadata: DependencyMetadata }> = [];
  private isProcessing = false;

  /**
   * Register a dependency between sections
   */
  registerDependency(dependency: SectionDependency): void {
    const { sourceSection, targetSections, fields, condition } = dependency;

    // Register section-level dependency
    if (!this.dependencies.has(sourceSection)) {
      this.dependencies.set(sourceSection, new Set());
    }
    
    const deps = this.dependencies.get(sourceSection)!;
    targetSections.forEach(target => deps.add(target));

    // Register field-level dependencies if specified
    if (fields && fields.length > 0) {
      if (!this.fieldDependencies.has(sourceSection)) {
        this.fieldDependencies.set(sourceSection, new Map());
      }
      
      const fieldDeps = this.fieldDependencies.get(sourceSection)!;
      
      fields.forEach(field => {
        if (!fieldDeps.has(field)) {
          fieldDeps.set(field, new Set());
        }
        const targets = fieldDeps.get(field)!;
        targetSections.forEach(target => targets.add(target));
      });
    }

    // Register condition if provided
    if (condition) {
      const key = `${sourceSection}:${targetSections.join(',')}`;
      this.conditions.set(key, condition);
    }
  }

  /**
   * Register multiple dependencies at once
   */
  registerDependencies(dependencies: SectionDependency[]): void {
    dependencies.forEach(dep => this.registerDependency(dep));
  }

  /**
   * Subscribe to changes in a section
   */
  subscribe(sectionId: string, callback: DependencyCallback): () => void {
    if (!this.observers.has(sectionId)) {
      this.observers.set(sectionId, new Set());
    }
    
    const callbacks = this.observers.get(sectionId)!;
    callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.observers.delete(sectionId);
      }
    };
  }

  /**
   * Notify dependent sections of a change
   */
  async notifyChange(
    sourceSection: string, 
    data: any, 
    changedFields?: string[],
    changeType: 'create' | 'update' | 'delete' = 'update'
  ): Promise<void> {
    const metadata: DependencyMetadata = {
      sourceSection,
      targetSection: '', // Will be filled for each target
      timestamp: new Date(),
      changeType
    };

    // Get all dependent sections
    const dependentSections = this.getDependentSections(sourceSection, data, changedFields);

    // Queue changes for processing
    dependentSections.forEach(targetSection => {
      this.changeQueue.push({
        section: targetSection,
        data,
        metadata: { ...metadata, targetSection }
      });
    });

    // Process queue if not already processing
    if (!this.isProcessing) {
      await this.processChangeQueue();
    }
  }

  /**
   * Get all sections that depend on the given section
   */
  private getDependentSections(
    sourceSection: string, 
    data: any, 
    changedFields?: string[]
  ): Set<string> {
    const dependents = new Set<string>();

    // Check section-level dependencies
    const sectionDeps = this.dependencies.get(sourceSection);
    if (sectionDeps) {
      sectionDeps.forEach(target => {
        // Check if condition is met
        const conditionKey = `${sourceSection}:${target}`;
        const condition = this.conditions.get(conditionKey);
        
        if (!condition || condition(data)) {
          dependents.add(target);
        }
      });
    }

    // Check field-level dependencies if fields were specified
    if (changedFields && changedFields.length > 0) {
      const fieldDeps = this.fieldDependencies.get(sourceSection);
      
      if (fieldDeps) {
        changedFields.forEach(field => {
          const targets = fieldDeps.get(field);
          if (targets) {
            targets.forEach(target => dependents.add(target));
          }
        });
      }
    }

    return dependents;
  }

  /**
   * Process queued changes
   */
  private async processChangeQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.changeQueue.length > 0) {
      const batch = this.changeQueue.splice(0, 10); // Process in batches
      
      await Promise.all(
        batch.map(async ({ section, data, metadata }) => {
          const callbacks = this.observers.get(section);
          
          if (callbacks) {
            // Run callbacks in parallel
            await Promise.all(
              Array.from(callbacks).map(callback => 
                this.safeExecuteCallback(callback, data, metadata)
              )
            );
          }
        })
      );
    }

    this.isProcessing = false;
  }

  /**
   * Safely execute a callback with error handling
   */
  private async safeExecuteCallback(
    callback: DependencyCallback,
    data: any,
    metadata: DependencyMetadata
  ): Promise<void> {
    try {
      await Promise.resolve(callback(data, metadata));
    } catch (error) {
      console.error(`Error in dependency callback for ${metadata.targetSection}:`, error);
    }
  }

  /**
   * Get all dependencies for a section
   */
  getDependencies(sectionId: string): string[] {
    const deps = this.dependencies.get(sectionId);
    return deps ? Array.from(deps) : [];
  }

  /**
   * Get all sections that depend on the given section
   */
  getDependents(sectionId: string): string[] {
    const dependents: string[] = [];
    
    this.dependencies.forEach((targets, source) => {
      if (targets.has(sectionId)) {
        dependents.push(source);
      }
    });
    
    return dependents;
  }

  /**
   * Clear all dependencies and observers
   */
  clear(): void {
    this.dependencies.clear();
    this.fieldDependencies.clear();
    this.observers.clear();
    this.conditions.clear();
    this.changeQueue = [];
  }

  /**
   * Remove a specific dependency
   */
  removeDependency(sourceSection: string, targetSection?: string): void {
    if (targetSection) {
      // Remove specific target
      const deps = this.dependencies.get(sourceSection);
      if (deps) {
        deps.delete(targetSection);
        if (deps.size === 0) {
          this.dependencies.delete(sourceSection);
        }
      }

      // Remove from field dependencies
      const fieldDeps = this.fieldDependencies.get(sourceSection);
      if (fieldDeps) {
        fieldDeps.forEach(targets => {
          targets.delete(targetSection);
        });
      }
    } else {
      // Remove all dependencies for source section
      this.dependencies.delete(sourceSection);
      this.fieldDependencies.delete(sourceSection);
    }
  }
}

// Singleton instance
let instance: SectionDependencyService | null = null;

export function getSectionDependencyService(): SectionDependencyService {
  if (!instance) {
    instance = new SectionDependencyService();
  }
  return instance;
}

// Common dependency configurations for SF86 form
export const SF86_DEPENDENCIES: SectionDependency[] = [
  {
    sourceSection: 'section1',
    targetSections: ['section2', 'section3'],
    fields: ['firstName', 'lastName', 'ssn']
  },
  {
    sourceSection: 'section10',
    targetSections: ['section11'],
    fields: ['hasDualCitizenship'],
    condition: (data) => data.hasDualCitizenship === true
  },
  {
    sourceSection: 'section13',
    targetSections: ['section14', 'section15'],
    fields: ['employmentHistory']
  },
  // Add more dependencies as needed
];