import React, { memo, useMemo } from 'react';
import { FieldConfig } from '../../types/form.types';
import { fieldRegistry } from './fieldRegistry';

interface FieldWrapperProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
}

const FieldWrapper: React.FC<FieldWrapperProps> = memo(({
  label,
  required,
  error,
  helpText,
  children
}) => {
  return (
    <div className="field-wrapper mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {children}
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

FieldWrapper.displayName = 'FieldWrapper';

interface ConditionalRendererProps {
  config: {
    dependsOn: string;
    condition: (value: any) => boolean;
    render: () => React.ReactNode;
  };
  formData: Record<string, any>;
}

const ConditionalRenderer: React.FC<ConditionalRendererProps> = memo(({
  config,
  formData
}) => {
  const shouldRender = useMemo(() => {
    const dependentValue = formData[config.dependsOn];
    return config.condition(dependentValue);
  }, [config, formData]);

  if (!shouldRender) return null;

  return <>{config.render()}</>;
});

ConditionalRenderer.displayName = 'ConditionalRenderer';

export interface ComposableFieldProps {
  config: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  formData?: Record<string, any>;
}

export const ComposableField: React.FC<ComposableFieldProps> = memo(({
  config,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  formData = {}
}) => {
  // Get the appropriate field component from registry
  const FieldComponent = useMemo(() => {
    if (config.component) {
      return config.component;
    }
    return fieldRegistry[config.type] || fieldRegistry.text;
  }, [config]);

  // Check if field should be rendered based on conditional logic
  const shouldRender = useMemo(() => {
    if (!config.metadata?.conditional) return true;
    
    const { dependsOn, condition } = config.metadata.conditional;
    const dependentValue = formData[dependsOn];
    return condition(dependentValue);
  }, [config, formData]);

  if (!shouldRender) return null;

  return (
    <FieldWrapper
      label={config.label}
      required={config.required}
      error={error}
      helpText={config.metadata?.helpText}
    >
      <FieldComponent
        name={config.name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={config.metadata?.placeholder}
        options={config.metadata?.options}
        {...(config as any).props}
      />
      
      {config.metadata?.conditional && (
        <ConditionalRenderer
          config={{
            ...config.metadata.conditional,
            render: () => (
              <div className="mt-2 p-2 bg-blue-50 rounded">
                <p className="text-sm text-blue-700">
                  This field is shown based on your previous selection
                </p>
              </div>
            )
          }}
          formData={formData}
        />
      )}
    </FieldWrapper>
  );
});

ComposableField.displayName = 'ComposableField';