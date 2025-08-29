export interface ValidationSpecification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(spec: ValidationSpecification<T>): ValidationSpecification<T>;
  or(spec: ValidationSpecification<T>): ValidationSpecification<T>;
  not(): ValidationSpecification<T>;
  getErrorMessage(): string;
}

export abstract class CompositeSpecification<T> implements ValidationSpecification<T> {
  abstract isSatisfiedBy(candidate: T): boolean;
  abstract getErrorMessage(): string;

  and(spec: ValidationSpecification<T>): ValidationSpecification<T> {
    return new AndSpecification(this, spec);
  }

  or(spec: ValidationSpecification<T>): ValidationSpecification<T> {
    return new OrSpecification(this, spec);
  }

  not(): ValidationSpecification<T> {
    return new NotSpecification(this);
  }
}

class AndSpecification<T> extends CompositeSpecification<T> {
  constructor(
    private left: ValidationSpecification<T>,
    private right: ValidationSpecification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
  }

  getErrorMessage(): string {
    const leftSatisfied = this.left.isSatisfiedBy;
    const rightSatisfied = this.right.isSatisfiedBy;
    
    if (!leftSatisfied) return this.left.getErrorMessage();
    if (!rightSatisfied) return this.right.getErrorMessage();
    return '';
  }
}

class OrSpecification<T> extends CompositeSpecification<T> {
  constructor(
    private left: ValidationSpecification<T>,
    private right: ValidationSpecification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
  }

  getErrorMessage(): string {
    if (!this.isSatisfiedBy) {
      return `${this.left.getErrorMessage()} or ${this.right.getErrorMessage()}`;
    }
    return '';
  }
}

class NotSpecification<T> extends CompositeSpecification<T> {
  constructor(private spec: ValidationSpecification<T>) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate);
  }

  getErrorMessage(): string {
    return `Not: ${this.spec.getErrorMessage()}`;
  }
}

// Common Specifications

export class RequiredFieldSpecification extends CompositeSpecification<any> {
  constructor(private fieldName: string) {
    super();
  }

  isSatisfiedBy(candidate: any): boolean {
    return candidate != null && candidate !== '' && candidate !== undefined;
  }

  getErrorMessage(): string {
    return `${this.fieldName} is required`;
  }
}

export class MinLengthSpecification extends CompositeSpecification<string> {
  constructor(
    private minLength: number,
    private fieldName: string
  ) {
    super();
  }

  isSatisfiedBy(candidate: string): boolean {
    return candidate && candidate.length >= this.minLength;
  }

  getErrorMessage(): string {
    return `${this.fieldName} must be at least ${this.minLength} characters`;
  }
}

export class MaxLengthSpecification extends CompositeSpecification<string> {
  constructor(
    private maxLength: number,
    private fieldName: string
  ) {
    super();
  }

  isSatisfiedBy(candidate: string): boolean {
    return !candidate || candidate.length <= this.maxLength;
  }

  getErrorMessage(): string {
    return `${this.fieldName} must be no more than ${this.maxLength} characters`;
  }
}

export class EmailSpecification extends CompositeSpecification<string> {
  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  isSatisfiedBy(candidate: string): boolean {
    return this.emailRegex.test(candidate);
  }

  getErrorMessage(): string {
    return 'Please enter a valid email address';
  }
}

export class DateRangeSpecification extends CompositeSpecification<Date> {
  constructor(
    private minDate: Date,
    private maxDate: Date,
    private fieldName: string
  ) {
    super();
  }

  isSatisfiedBy(candidate: Date): boolean {
    return candidate >= this.minDate && candidate <= this.maxDate;
  }

  getErrorMessage(): string {
    return `${this.fieldName} must be between ${this.minDate.toLocaleDateString()} and ${this.maxDate.toLocaleDateString()}`;
  }
}

export class PatternSpecification extends CompositeSpecification<string> {
  constructor(
    private pattern: RegExp,
    private errorMessage: string
  ) {
    super();
  }

  isSatisfiedBy(candidate: string): boolean {
    return this.pattern.test(candidate);
  }

  getErrorMessage(): string {
    return this.errorMessage;
  }
}

// Business Rule Specifications

export class SSNSpecification extends CompositeSpecification<string> {
  private ssnRegex = /^\d{3}-\d{2}-\d{4}$/;

  isSatisfiedBy(candidate: string): boolean {
    return this.ssnRegex.test(candidate);
  }

  getErrorMessage(): string {
    return 'SSN must be in format XXX-XX-XXXX';
  }
}

export class PhoneNumberSpecification extends CompositeSpecification<string> {
  private phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;

  isSatisfiedBy(candidate: string): boolean {
    return this.phoneRegex.test(candidate);
  }

  getErrorMessage(): string {
    return 'Phone number must be in format (XXX) XXX-XXXX';
  }
}

export class ZipCodeSpecification extends CompositeSpecification<string> {
  private zipRegex = /^\d{5}(-\d{4})?$/;

  isSatisfiedBy(candidate: string): boolean {
    return this.zipRegex.test(candidate);
  }

  getErrorMessage(): string {
    return 'ZIP code must be in format XXXXX or XXXXX-XXXX';
  }
}