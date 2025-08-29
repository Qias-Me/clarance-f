import React, { memo, useCallback, useMemo } from 'react';
import { FormSection } from '../components/common/FormSection';
import { ComposableField } from '../components/fields/ComposableField';
import { useOptimizedSection } from '../contexts/OptimizedSectionContext';
import { FieldConfig, SectionComponentProps, ValidationConfig } from '../types/form.types';
import { useSmartValidation } from '../hooks/useSmartValidation';
import { useProgressiveLoading } from '../hooks/useProgressiveLoading';

export interface SectionConfig<T> {
  sectionNumber: number;
  title: string;
  description?: string;
  fields: FieldConfig[];
  validation: ValidationConfig<T>;
  dependencies?: string[];
  layout?: 'standard' | 'tabbed' | 'wizard' | 'virtual';
  virtualScrollConfig?: {
    itemHeight: number;
    containerHeight: number;
  };
}

interface SectionLayoutProps {
  layout: SectionConfig<any>['layout'];
  title: string;
  children: React.ReactNode;
}

const SectionLayout: React.FC<SectionLayoutProps> = ({ layout, title, children }) => {
  switch (layout) {
    case 'tabbed':
      return (
        <div className="tabbed-layout">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <div className="tabs-container">{children}</div>
        </div>
      );
    
    case 'wizard':
      return (
        <div className="wizard-layout">
          <div className="wizard-header">
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
          <div className="wizard-content">{children}</div>
        </div>
      );
    
    case 'virtual':
      return (
        <div className="virtual-layout">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <div className="virtual-container">{children}</div>
        </div>
      );
    
    default:
      return (
        <div className="standard-layout">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <div className="form-content">{children}</div>
        </div>
      );
  }
};

interface FieldRendererProps<T> {
  fields: FieldConfig[];
  data: T;
  onChange: (data: Partial<T>) => void;
  validation: ValidationConfig<T>;
  layout?: SectionConfig<T>['layout'];
  virtualScrollConfig?: SectionConfig<T>['virtualScrollConfig'];
}

const FieldRenderer = memo(<T extends Record<string, any>>({
  fields,
  data,
  onChange,
  validation,
  layout,
  virtualScrollConfig
}: FieldRendererProps<T>) => {
  const { validateField, validationState } = useSmartValidation();

  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    onChange({ [fieldName]: value } as Partial<T>);
    
    // Trigger validation for the field
    if (validation.fields?.[fieldName]) {
      validateField(value, validation.fields[fieldName]);
    }
  }, [onChange, validation, validateField]);

  const renderField = useCallback((field: FieldConfig) => {
    const value = data[field.name];
    const error = validationState[field.name]?.error;

    return (
      <ComposableField
        key={field.name}
        config={field}
        value={value}
        onChange={(newValue) => handleFieldChange(field.name, newValue)}
        error={error}
      />
    );
  }, [data, validationState, handleFieldChange]);

  // Virtual scrolling for large forms
  if (layout === 'virtual' && virtualScrollConfig) {
    return (
      <VirtualFieldList
        fields={fields}
        renderField={renderField}
        {...virtualScrollConfig}
      />
    );
  }

  // Standard rendering
  return (
    <div className="fields-container space-y-4">
      {fields.map(renderField)}
    </div>
  );
});

FieldRenderer.displayName = 'FieldRenderer';

// Virtual scrolling component for large sections
const VirtualFieldList: React.FC<{
  fields: FieldConfig[];
  renderField: (field: FieldConfig) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
}> = memo(({ fields, renderField, itemHeight, containerHeight }) => {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleFields = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount + 1, fields.length);
    return fields.slice(startIndex, endIndex);
  }, [fields, scrollTop, itemHeight, visibleCount]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = fields.length * itemHeight;
  const offsetY = Math.floor(scrollTop / itemHeight) * itemHeight;

  return (
    <div
      className="virtual-scroll-container"
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleFields.map(renderField)}
        </div>
      </div>
    </div>
  );
});

VirtualFieldList.displayName = 'VirtualFieldList';

/**
 * Factory function to create optimized section components
 */
export function createSectionComponent<T extends Record<string, any>>(
  config: SectionConfig<T>
): React.FC<SectionComponentProps<T>> {
  const SectionComponent: React.FC<SectionComponentProps<T>> = memo((props) => {
    const { data, onChange, onValidate, onComplete, readonly, className } = props;
    
    // Use progressive loading for dependencies
    const { preloadNextSections } = useProgressiveLoading(String(config.sectionNumber));
    
    // Preload dependent sections
    React.useEffect(() => {
      if (config.dependencies && config.dependencies.length > 0) {
        preloadNextSections(String(config.sectionNumber));
      }
    }, [preloadNextSections]);

    // Memoize validation function
    const handleValidation = useCallback(async () => {
      const isValid = await config.validation.validate(data);
      onValidate?.(isValid);
      return isValid;
    }, [data, onValidate]);

    // Handle section completion
    const handleComplete = useCallback(async () => {
      const isValid = await handleValidation();
      if (isValid) {
        onComplete?.();
      }
    }, [handleValidation, onComplete]);

    return (
      <FormSection
        title={config.title}
        sectionNumber={String(config.sectionNumber)}
        description={config.description}
        className={className}
        onSubmit={handleComplete}
        isValid={true} // This should be computed from validation state
      >
        <SectionLayout layout={config.layout || 'standard'} title={config.title}>
          <FieldRenderer
            fields={config.fields}
            data={data}
            onChange={onChange}
            validation={config.validation}
            layout={config.layout}
            virtualScrollConfig={config.virtualScrollConfig}
          />
        </SectionLayout>
      </FormSection>
    );
  });

  SectionComponent.displayName = `Section${config.sectionNumber}Component`;

  return SectionComponent;
}

// Helper function to create validation configuration
export function createValidationConfig<T>(
  rules: Record<keyof T, Array<(value: any) => boolean | string>>
): ValidationConfig<T> {
  return {
    fields: rules as any,
    validate: async (data: T) => {
      for (const [field, fieldRules] of Object.entries(rules)) {
        const value = data[field as keyof T];
        for (const rule of fieldRules as Array<(value: any) => boolean | string>) {
          const result = rule(value);
          if (result !== true) {
            return false;
          }
        }
      }
      return true;
    }
  };
}