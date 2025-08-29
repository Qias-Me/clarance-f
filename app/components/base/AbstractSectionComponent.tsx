import React, { Component, ReactNode } from 'react';
import { FormSection } from '../common/FormSection';
import { ValidationResult, ValidationError } from '../../repositories/SectionRepository';
import { useFormSubmission } from '../../hooks/useFormSubmission';
import { useFieldValidation, ValidationRule } from '../../hooks/useFieldValidation';

export interface SectionMetadata {
  sectionNumber: string;
  title: string;
  description?: string;
}

export interface SectionProps<T> {
  data: T;
  onChange: (data: T) => void;
  onSubmit?: () => void;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
}

export interface SectionState<T> {
  data: T;
  errors: ValidationError[];
  warnings: string[];
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export abstract class AbstractSectionComponent<T> extends Component<
  SectionProps<T>,
  SectionState<T>
> {
  constructor(props: SectionProps<T>) {
    super(props);
    
    this.state = {
      data: props.data,
      errors: [],
      warnings: [],
      isSubmitting: false,
      isValid: true,
      isDirty: false
    };
  }

  // Abstract methods that must be implemented by concrete sections
  abstract renderFields(): ReactNode;
  abstract getValidationRules(): Record<string, ValidationRule[]>;
  abstract getSectionMetadata(): SectionMetadata;
  abstract getSectionId(): string;

  // Optional methods that can be overridden
  protected getInitialData(): T {
    return this.props.data;
  }

  protected async onBeforeSubmit(): Promise<boolean> {
    return true;
  }

  protected async onAfterSubmit(): Promise<void> {
    // Override if needed
  }

  // Template method pattern
  render() {
    const { className } = this.props;
    const { errors, warnings, isSubmitting, isValid } = this.state;
    const metadata = this.getSectionMetadata();

    return (
      <FormSection
        title={metadata.title}
        sectionNumber={metadata.sectionNumber}
        description={metadata.description}
        className={className}
        errors={errors.map(e => e.message)}
        warnings={warnings}
        isSubmitting={isSubmitting}
        isValid={isValid}
        onSubmit={this.handleSubmit}
      >
        {this.renderFields()}
      </FormSection>
    );
  }

  // Lifecycle methods
  componentDidMount() {
    this.initializeSection();
    this.registerValidation();
  }

  componentDidUpdate(prevProps: SectionProps<T>) {
    if (prevProps.data !== this.props.data) {
      this.setState({ data: this.props.data });
      this.validate();
    }
  }

  // Common methods
  protected initializeSection(): void {
    this.validate();
  }

  protected registerValidation(): void {
    // Set up validation listeners if needed
  }

  protected handleFieldChange = (fieldName: string, value: any): void => {
    this.setState(prevState => {
      const newData = {
        ...prevState.data,
        [fieldName]: value
      };

      this.props.onChange(newData);

      return {
        data: newData,
        isDirty: true
      };
    }, () => {
      this.validate();
    });
  };

  protected handleNestedFieldChange = (path: string[], value: any): void => {
    this.setState(prevState => {
      const newData = { ...prevState.data };
      let current: any = newData;

      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }

      current[path[path.length - 1]] = value;
      this.props.onChange(newData);

      return {
        data: newData,
        isDirty: true
      };
    }, () => {
      this.validate();
    });
  };

  protected validate = async (): Promise<boolean> => {
    const validationRules = this.getValidationRules();
    const errors: ValidationError[] = [];
    const { data } = this.state;

    // Validate each field
    for (const [fieldName, rules] of Object.entries(validationRules)) {
      const fieldValue = (data as any)[fieldName];
      
      for (const rule of rules) {
        if (!rule.test(fieldValue)) {
          errors.push({
            field: fieldName,
            message: rule.message
          });
          break; // Only show first error per field
        }
      }
    }

    const isValid = errors.length === 0;

    this.setState({ errors, isValid });
    this.props.onValidationChange?.(isValid);

    return isValid;
  };

  protected handleSubmit = async (e?: React.FormEvent): Promise<void> => {
    if (e) {
      e.preventDefault();
    }

    this.setState({ isSubmitting: true });

    try {
      // Validate before submission
      const isValid = await this.validate();
      
      if (!isValid) {
        this.setState({ isSubmitting: false });
        return;
      }

      // Call before submit hook
      const shouldContinue = await this.onBeforeSubmit();
      
      if (!shouldContinue) {
        this.setState({ isSubmitting: false });
        return;
      }

      // Call parent's onSubmit
      this.props.onSubmit?.();

      // Call after submit hook
      await this.onAfterSubmit();

      this.setState({ isDirty: false });
    } catch (error) {
      console.error(`Error submitting ${this.getSectionId()}:`, error);
      
      this.setState({
        errors: [{
          field: 'general',
          message: 'An error occurred while submitting. Please try again.'
        }]
      });
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  protected reset = (): void => {
    const initialData = this.getInitialData();
    
    this.setState({
      data: initialData,
      errors: [],
      warnings: [],
      isValid: true,
      isDirty: false
    });

    this.props.onChange(initialData);
  };
}

// Functional component wrapper for hooks integration
export function withSectionHooks<T>(
  SectionComponent: typeof AbstractSectionComponent<T>
): React.FC<SectionProps<T>> {
  return (props: SectionProps<T>) => {
    // This wrapper allows using hooks with class components
    // You can add hook-based functionality here
    return <SectionComponent {...props} />;
  };
}