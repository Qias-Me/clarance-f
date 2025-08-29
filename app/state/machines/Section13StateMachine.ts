/**
 * Section 13 Employment State Machine
 * 
 * Manages complex employment entry workflows with state transitions
 */

import { logger } from '../../services/Logger';
import type { Field } from '../../../api/interfaces/formDefinition2.0';
import { createEmploymentEntry } from '../../utils/section13-helpers';

// State machine states
export enum EmploymentState {
  IDLE = 'idle',
  ADDING_ENTRY = 'adding_entry',
  EDITING_ENTRY = 'editing_entry',
  VALIDATING = 'validating',
  SAVING = 'saving',
  DELETING = 'deleting',
  ERROR = 'error',
  COMPLETE = 'complete'
}

// State machine events
export enum EmploymentEvent {
  ADD = 'ADD',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  SAVE = 'SAVE',
  CANCEL = 'CANCEL',
  VALIDATE = 'VALIDATE',
  RETRY = 'RETRY',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

// Employment entry type
export interface EmploymentEntry {
  _id: string;
  employerName: Field<string>;
  positionTitle: Field<string>;
  employmentDates: {
    fromDate: Field<string>;
    toDate: Field<string>;
    present: Field<boolean>;
  };
  address: {
    street: Field<string>;
    city: Field<string>;
    state: Field<string>;
    zipCode: Field<string>;
    country: Field<string>;
  };
  supervisor: {
    name: Field<string>;
    title: Field<string>;
    email: Field<string>;
    phone: {
      number: Field<string>;
      extension: Field<string>;
    };
  };
  reasonForLeaving: Field<string>;
  additionalComments: Field<string>;
}

// State machine context
export interface EmploymentContext {
  entries: EmploymentEntry[];
  currentEntry: EmploymentEntry | null;
  currentIndex: number;
  errors: Record<string, string>;
  isDirty: boolean;
  maxEntries: number;
}

// State machine configuration
export interface StateMachineConfig {
  maxEntries?: number;
  autoSave?: boolean;
  validationDelay?: number;
  onStateChange?: (state: EmploymentState, context: EmploymentContext) => void;
  onError?: (error: Error, context: EmploymentContext) => void;
}

export class Section13StateMachine {
  private state: EmploymentState = EmploymentState.IDLE;
  private context: EmploymentContext;
  private config: StateMachineConfig;
  private listeners = new Map<string, Set<Function>>();
  private validationTimeout?: NodeJS.Timeout;
  private saveTimeout?: NodeJS.Timeout;
  
  constructor(initialEntries: EmploymentEntry[] = [], config: StateMachineConfig = {}) {
    this.config = {
      maxEntries: 10,
      autoSave: true,
      validationDelay: 500,
      ...config
    };
    
    this.context = {
      entries: initialEntries,
      currentEntry: null,
      currentIndex: -1,
      errors: {},
      isDirty: false,
      maxEntries: this.config.maxEntries!
    };
  }
  
  // Get current state
  getState(): EmploymentState {
    return this.state;
  }
  
  // Get context
  getContext(): Readonly<EmploymentContext> {
    return { ...this.context };
  }
  
  // State transitions
  private transitions: Record<EmploymentState, Partial<Record<EmploymentEvent, EmploymentState>>> = {
    [EmploymentState.IDLE]: {
      [EmploymentEvent.ADD]: EmploymentState.ADDING_ENTRY,
      [EmploymentEvent.EDIT]: EmploymentState.EDITING_ENTRY,
      [EmploymentEvent.DELETE]: EmploymentState.DELETING,
      [EmploymentEvent.VALIDATE]: EmploymentState.VALIDATING
    },
    [EmploymentState.ADDING_ENTRY]: {
      [EmploymentEvent.SAVE]: EmploymentState.SAVING,
      [EmploymentEvent.CANCEL]: EmploymentState.IDLE,
      [EmploymentEvent.VALIDATE]: EmploymentState.VALIDATING,
      [EmploymentEvent.ERROR]: EmploymentState.ERROR
    },
    [EmploymentState.EDITING_ENTRY]: {
      [EmploymentEvent.SAVE]: EmploymentState.SAVING,
      [EmploymentEvent.CANCEL]: EmploymentState.IDLE,
      [EmploymentEvent.DELETE]: EmploymentState.DELETING,
      [EmploymentEvent.VALIDATE]: EmploymentState.VALIDATING,
      [EmploymentEvent.ERROR]: EmploymentState.ERROR
    },
    [EmploymentState.VALIDATING]: {
      [EmploymentEvent.COMPLETE]: EmploymentState.IDLE,
      [EmploymentEvent.ERROR]: EmploymentState.ERROR
    },
    [EmploymentState.SAVING]: {
      [EmploymentEvent.COMPLETE]: EmploymentState.IDLE,
      [EmploymentEvent.ERROR]: EmploymentState.ERROR
    },
    [EmploymentState.DELETING]: {
      [EmploymentEvent.COMPLETE]: EmploymentState.IDLE,
      [EmploymentEvent.ERROR]: EmploymentState.ERROR
    },
    [EmploymentState.ERROR]: {
      [EmploymentEvent.RETRY]: EmploymentState.IDLE,
      [EmploymentEvent.CANCEL]: EmploymentState.IDLE
    },
    [EmploymentState.COMPLETE]: {
      [EmploymentEvent.ADD]: EmploymentState.ADDING_ENTRY,
      [EmploymentEvent.EDIT]: EmploymentState.EDITING_ENTRY
    }
  };
  
  // Send event to state machine
  send(event: EmploymentEvent, payload?: any): void {
    const nextState = this.transitions[this.state]?.[event];
    
    if (!nextState) {
      logger.warn(`Invalid transition: ${this.state} -> ${event}`, 'Section13StateMachine');
      return;
    }
    
    // Handle state transition
    this.transition(nextState, event, payload);
  }
  
  // Perform state transition
  private transition(nextState: EmploymentState, event: EmploymentEvent, payload?: any): void {
    const prevState = this.state;
    this.state = nextState;
    
    // Execute side effects based on transition
    this.executeSideEffects(prevState, nextState, event, payload);
    
    // Notify listeners
    this.emit('stateChange', { prevState, nextState, event, context: this.context });
    
    // Call config callback
    if (this.config.onStateChange) {
      this.config.onStateChange(nextState, this.context);
    }
    
    logger.info(`State transition: ${prevState} -> ${nextState} (${event})`, 'Section13StateMachine');
  }
  
  // Execute side effects for transitions
  private executeSideEffects(
    prevState: EmploymentState,
    nextState: EmploymentState,
    event: EmploymentEvent,
    payload?: any
  ): void {
    switch (nextState) {
      case EmploymentState.ADDING_ENTRY:
        this.handleAddEntry();
        break;
        
      case EmploymentState.EDITING_ENTRY:
        this.handleEditEntry(payload?.index);
        break;
        
      case EmploymentState.DELETING:
        this.handleDeleteEntry(payload?.index);
        break;
        
      case EmploymentState.VALIDATING:
        this.handleValidation();
        break;
        
      case EmploymentState.SAVING:
        this.handleSave();
        break;
        
      case EmploymentState.ERROR:
        this.handleError(payload?.error);
        break;
    }
  }
  
  // Handle adding new entry
  private handleAddEntry(): void {
    if (this.context.entries.length >= this.context.maxEntries) {
      this.send(EmploymentEvent.ERROR, {
        error: new Error(`Maximum of ${this.context.maxEntries} entries allowed`)
      });
      return;
    }
    
    const newEntry = createEmploymentEntry('employment') as EmploymentEntry;
    this.context.currentEntry = newEntry;
    this.context.currentIndex = this.context.entries.length;
    this.context.isDirty = true;
    
    this.emit('entryAdded', { entry: newEntry, index: this.context.currentIndex });
  }
  
  // Handle editing entry
  private handleEditEntry(index?: number): void {
    if (index === undefined || index < 0 || index >= this.context.entries.length) {
      this.send(EmploymentEvent.ERROR, { error: new Error('Invalid entry index') });
      return;
    }
    
    this.context.currentEntry = this.context.entries[index];
    this.context.currentIndex = index;
    
    this.emit('entryEditing', { entry: this.context.currentEntry, index });
  }
  
  // Handle deleting entry
  private handleDeleteEntry(index?: number): void {
    if (index === undefined || index < 0 || index >= this.context.entries.length) {
      this.send(EmploymentEvent.ERROR, { error: new Error('Invalid entry index') });
      return;
    }
    
    const deletedEntry = this.context.entries[index];
    this.context.entries.splice(index, 1);
    this.context.isDirty = true;
    
    this.emit('entryDeleted', { entry: deletedEntry, index });
    
    // Auto-transition to complete
    this.send(EmploymentEvent.COMPLETE);
  }
  
  // Handle validation
  private handleValidation(): void {
    this.context.errors = {};
    
    // Clear existing timeout
    if (this.validationTimeout) {
      clearTimeout(this.validationTimeout);
    }
    
    // Debounced validation
    this.validationTimeout = setTimeout(() => {
      let hasErrors = false;
      
      if (this.context.currentEntry) {
        // Validate current entry
        const errors = this.validateEntry(this.context.currentEntry);
        if (Object.keys(errors).length > 0) {
          this.context.errors = errors;
          hasErrors = true;
        }
      } else {
        // Validate all entries
        this.context.entries.forEach((entry, index) => {
          const errors = this.validateEntry(entry);
          Object.entries(errors).forEach(([field, error]) => {
            this.context.errors[`entries.${index}.${field}`] = error;
          });
          if (Object.keys(errors).length > 0) {
            hasErrors = true;
          }
        });
      }
      
      this.emit('validationComplete', { errors: this.context.errors, hasErrors });
      
      if (hasErrors) {
        this.send(EmploymentEvent.ERROR, { error: new Error('Validation failed') });
      } else {
        this.send(EmploymentEvent.COMPLETE);
      }
    }, this.config.validationDelay);
  }
  
  // Validate single entry
  private validateEntry(entry: EmploymentEntry): Record<string, string> {
    const errors: Record<string, string> = {};
    
    if (!entry.employerName?.value) {
      errors.employerName = 'Employer name is required';
    }
    
    if (!entry.positionTitle?.value) {
      errors.positionTitle = 'Position title is required';
    }
    
    if (!entry.employmentDates?.fromDate?.value) {
      errors.fromDate = 'Start date is required';
    }
    
    if (!entry.employmentDates?.toDate?.value && !entry.employmentDates?.present?.value) {
      errors.toDate = 'End date or "Present" must be specified';
    }
    
    if (entry.employmentDates?.fromDate?.value && entry.employmentDates?.toDate?.value) {
      const start = new Date(entry.employmentDates.fromDate.value);
      const end = new Date(entry.employmentDates.toDate.value);
      if (start > end) {
        errors.dateRange = 'End date must be after start date';
      }
    }
    
    return errors;
  }
  
  // Handle save
  private handleSave(): void {
    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    if (this.config.autoSave) {
      this.saveTimeout = setTimeout(() => {
        if (this.context.currentEntry && this.context.currentIndex >= 0) {
          // Save current entry
          if (this.context.currentIndex === this.context.entries.length) {
            // New entry
            this.context.entries.push(this.context.currentEntry);
          } else {
            // Update existing
            this.context.entries[this.context.currentIndex] = this.context.currentEntry;
          }
        }
        
        this.context.isDirty = false;
        this.emit('saved', { entries: this.context.entries });
        this.send(EmploymentEvent.COMPLETE);
      }, 500);
    } else {
      this.send(EmploymentEvent.COMPLETE);
    }
  }
  
  // Handle error
  private handleError(error?: Error): void {
    logger.error('State machine error', error || new Error('Unknown error'), 'Section13StateMachine');
    
    if (this.config.onError) {
      this.config.onError(error || new Error('Unknown error'), this.context);
    }
    
    this.emit('error', { error, context: this.context });
  }
  
  // Event emitter methods
  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }
  
  off(event: string, listener: Function): void {
    this.listeners.get(event)?.delete(listener);
  }
  
  private emit(event: string, data?: any): void {
    this.listeners.get(event)?.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        logger.error(`Event listener error for ${event}`, error as Error, 'Section13StateMachine');
      }
    });
  }
  
  // Public methods for managing entries
  addEntry(): void {
    this.send(EmploymentEvent.ADD);
  }
  
  editEntry(index: number): void {
    this.send(EmploymentEvent.EDIT, { index });
  }
  
  deleteEntry(index: number): void {
    this.send(EmploymentEvent.DELETE, { index });
  }
  
  saveChanges(): void {
    this.send(EmploymentEvent.SAVE);
  }
  
  cancelChanges(): void {
    this.send(EmploymentEvent.CANCEL);
  }
  
  validate(): void {
    this.send(EmploymentEvent.VALIDATE);
  }
  
  updateCurrentEntry(updates: Partial<EmploymentEntry>): void {
    if (this.context.currentEntry) {
      this.context.currentEntry = {
        ...this.context.currentEntry,
        ...updates
      };
      this.context.isDirty = true;
      
      // Trigger validation
      if (this.config.autoSave) {
        this.validate();
      }
    }
  }
  
  // Cleanup
  destroy(): void {
    if (this.validationTimeout) {
      clearTimeout(this.validationTimeout);
    }
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.listeners.clear();
  }
}