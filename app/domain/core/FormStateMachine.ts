export type FormState = 
  | 'draft'
  | 'validating' 
  | 'invalid'
  | 'submitting'
  | 'submitted'
  | 'error'
  | 'locked';

export type FormEvent = 
  | { type: 'VALIDATE' }
  | { type: 'VALIDATION_SUCCESS' }
  | { type: 'VALIDATION_FAILED'; errors: Record<string, string[]> }
  | { type: 'SUBMIT' }
  | { type: 'SUBMISSION_SUCCESS' }
  | { type: 'SUBMISSION_FAILED'; error: string }
  | { type: 'RETRY' }
  | { type: 'RESET' }
  | { type: 'LOCK' }
  | { type: 'UNLOCK' };

export interface FormStateMachineContext {
  state: FormState;
  errors: Record<string, string[]>;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  completedSections: Set<string>;
  currentSection?: string;
}

export class FormStateMachine {
  private context: FormStateMachineContext;
  private listeners: Array<(context: FormStateMachineContext) => void> = [];

  constructor(initialContext?: Partial<FormStateMachineContext>) {
    this.context = {
      state: 'draft',
      errors: {},
      retryCount: 0,
      maxRetries: 3,
      completedSections: new Set(),
      ...initialContext
    };
  }

  transition(event: FormEvent): void {
    const { state } = this.context;

    switch (state) {
      case 'draft':
        this.handleDraftState(event);
        break;
      case 'validating':
        this.handleValidatingState(event);
        break;
      case 'invalid':
        this.handleInvalidState(event);
        break;
      case 'submitting':
        this.handleSubmittingState(event);
        break;
      case 'error':
        this.handleErrorState(event);
        break;
      case 'submitted':
        this.handleSubmittedState(event);
        break;
      case 'locked':
        this.handleLockedState(event);
        break;
    }

    this.notifyListeners();
  }

  private handleDraftState(event: FormEvent): void {
    switch (event.type) {
      case 'VALIDATE':
        this.context.state = 'validating';
        break;
      case 'SUBMIT':
        this.context.state = 'validating';
        break;
      case 'LOCK':
        this.context.state = 'locked';
        break;
    }
  }

  private handleValidatingState(event: FormEvent): void {
    switch (event.type) {
      case 'VALIDATION_SUCCESS':
        this.context.state = 'submitting';
        this.context.errors = {};
        break;
      case 'VALIDATION_FAILED':
        this.context.state = 'invalid';
        this.context.errors = event.errors;
        break;
    }
  }

  private handleInvalidState(event: FormEvent): void {
    switch (event.type) {
      case 'VALIDATE':
        this.context.state = 'validating';
        break;
      case 'RESET':
        this.context.state = 'draft';
        this.context.errors = {};
        break;
    }
  }

  private handleSubmittingState(event: FormEvent): void {
    switch (event.type) {
      case 'SUBMISSION_SUCCESS':
        this.context.state = 'submitted';
        this.context.retryCount = 0;
        break;
      case 'SUBMISSION_FAILED':
        this.context.state = 'error';
        this.context.lastError = event.error;
        break;
    }
  }

  private handleErrorState(event: FormEvent): void {
    switch (event.type) {
      case 'RETRY':
        if (this.context.retryCount < this.context.maxRetries) {
          this.context.retryCount++;
          this.context.state = 'submitting';
        }
        break;
      case 'RESET':
        this.context.state = 'draft';
        this.context.errors = {};
        this.context.retryCount = 0;
        this.context.lastError = undefined;
        break;
    }
  }

  private handleSubmittedState(event: FormEvent): void {
    switch (event.type) {
      case 'RESET':
        this.context.state = 'draft';
        this.context.errors = {};
        break;
    }
  }

  private handleLockedState(event: FormEvent): void {
    switch (event.type) {
      case 'UNLOCK':
        this.context.state = 'draft';
        break;
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.context));
  }

  subscribe(listener: (context: FormStateMachineContext) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getContext(): FormStateMachineContext {
    return { ...this.context };
  }

  canTransition(event: FormEvent): boolean {
    const { state } = this.context;
    
    const validTransitions: Record<FormState, FormEvent['type'][]> = {
      draft: ['VALIDATE', 'SUBMIT', 'LOCK'],
      validating: ['VALIDATION_SUCCESS', 'VALIDATION_FAILED'],
      invalid: ['VALIDATE', 'RESET'],
      submitting: ['SUBMISSION_SUCCESS', 'SUBMISSION_FAILED'],
      error: ['RETRY', 'RESET'],
      submitted: ['RESET'],
      locked: ['UNLOCK']
    };

    return validTransitions[state]?.includes(event.type) || false;
  }
}